/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';
import Application from '../../../api/app';
import Circleloader from '../../CircleLoader';
import Select from '../../Select';
import SimpleDatePicker from '../../SimpleDatePicker';
import TooltipTextAuto from '../../TooltipText/TooltipTextAuto';
// import { Scaling } from 'lucide-react';
import { publish, subscribe, unsubscribe } from '../../../utils/event';
import SearchSelect from '../../searchableSelect';
import Toggle from '../Boxs/Toggle';
interface BiomarkersSectionProps {
  biomarkers: any[];
  onChange: (updated: any[]) => void; // callback to update parent state
  uploadedFile: any;
  dateOfTest: Date | null;
  setDateOfTest: (date: Date | null) => void;
  fileType: string;
  loading: boolean;
  isScaling: boolean;
  setIsScaling: (isScaling: boolean) => void;
  rowErrors?: any;
  setrowErrors: any;
  showOnlyErrors: boolean;
  setShowOnlyErrors: (showOnlyErrors: boolean) => void;
}

const BiomarkersSection: React.FC<BiomarkersSectionProps> = ({
  biomarkers,
  fileType,
  onChange,
  uploadedFile,
  dateOfTest,
  setDateOfTest,
  loading,
  rowErrors,
  setrowErrors,
  isScaling,
  setIsScaling,
  showOnlyErrors,
  setShowOnlyErrors,
}) => {
  const [changedRows, setChangedRows] = useState<string[]>([]);
  const [mappedRows, setMappedRows] = useState<string[]>([]);
  const [mappingStatus, setMappingStatus] = useState<
    Record<string, 'added' | 'removed' | null>
  >({});
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleValueChange = (id: string, newValue: string) => {
    // update local state immediately so UI feels responsive
    const updated = biomarkers.map((b) =>
      b.biomarker_id === id ? { ...b, original_value: newValue } : b,
    );
    onChange(updated);

    // clear previous timer if user is still typing
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // set new timer (3s)
    typingTimeoutRef.current = setTimeout(() => {
      updateAndStandardize(id, { original_value: newValue });
    }, 3000);
  };
  // const handleValueChange = (index: number, newValue: number | string) => {
  //   const updated = biomarkers.map((b, i) =>
  //     i === index ? { ...b, original_value: newValue } : b,
  //   );
  //   onChange(updated);
  // };

  // const handleNameChange = (index: number, newName: string) => {
  //   const updated = biomarkers.map((b, i) =>
  //     i === index ? { ...b, biomarker: newName } : b,
  //   );
  //   onChange(updated);
  // };

  // const handleUnitChange = (index: number, newUnit: string) => {
  //   const updated = biomarkers.map((b, i) =>
  //     i === index ? { ...b, original_unit: newUnit } : b,
  //   );
  //   onChange(updated);
  // };

  const handleTrashClick = (indexToUpdate: number) => {
    const updated = biomarkers.map((b, i) =>
      i === indexToUpdate ? { ...b, status: 'confirm' } : b,
    );
    onChange(updated);
  };
  const deletedIndexRef = useRef<number | null>(null);

  const handleConfirm = (indexToDelete: number) => {
    // Remember which index was deleted
    deletedIndexRef.current = indexToDelete;

    // update biomarkers
    const updated = biomarkers.filter((_, i) => i !== indexToDelete);
    if (updated.length === 0) {
      // alert('delete file trigger1');
      publish('DELETE_FILE_TRIGGER', {});
    }
    onChange(updated);

    // update rowErrors
    setrowErrors((prev: any) => {
      if (!prev) return prev;

      const newErrors: Record<number, string> = {};
      Object.keys(prev).forEach((key) => {
        const idx = Number(key);
        if (idx < indexToDelete) {
          newErrors[idx] = prev[idx]; // keep errors before deleted row
        } else if (idx > indexToDelete) {
          newErrors[idx - 1] = prev[idx]; // shift errors after deleted row
        }
      });
      return newErrors;
    });
  };

  const handleCancel = (indexToUpdate: number) => {
    const updated = biomarkers.map((b, i) =>
      i === indexToUpdate ? { ...b, status: 'default' } : b,
    );
    onChange(updated);
  };
  const dnaOptions = [
    'Moderately Compromised Outcome',
    'Enhanced Outcome',
    'Compromised Outcome',
    'Moderately Enhanced Outcome',
  ];
  const [avalibaleBiomarkers, setAvalibaleBiomarkers] = useState<any[]>([]);

  useEffect(() => {
    Application.getBiomarkerName({})
      .then((res) => {
        const sorted = [...res.data.biomarkers_list].sort((a: any, b: any) =>
          a.localeCompare(b),
        );
        setAvalibaleBiomarkers(sorted);
      })
      .catch(() => {});
  }, []);
  const gutOptions = ['Good for GUT', 'Bad for GUT'];
  const renderValueField = (b: any) => {
    if (fileType.toLowerCase() === 'dna') {
      return (
        <Select
          isSmall
          isSetting
          value={b.original_value}
          options={dnaOptions}
          onChange={(val: string) =>
            updateAndStandardize(b.biomarker_id, { original_value: val })
          }
        />
      );
    } else if (fileType.toLowerCase() === 'gut') {
      return (
        <Select
          isSmall
          isSetting
          value={b.original_value}
          options={gutOptions}
          onChange={(val: string) =>
            updateAndStandardize(b.biomarker_id, { original_value: val })
          }
        />
      );
    } else {
      return (
        <input
          type="number"
          value={b.original_value}
          className="text-center border border-Gray-50 w-[70px] md:w-[95px] outline-none rounded-md text-[8px] md:text-[12px] text-Text-Primary px-2 md:py-1"
          onChange={(e) => handleValueChange(b.biomarker_id, e.target.value)}
        />
      );
    }
  };
  React.useEffect(() => {
    const updated = biomarkers.map((b) => {
      if (
        (!b.original_unit || b.original_unit === '') &&
        b.possible_values?.units?.length > 0
      ) {
        return { ...b, original_unit: b.possible_values.units[0] };
      }
      return b;
    });

    // only update if something actually changed
    if (JSON.stringify(updated) !== JSON.stringify(biomarkers)) {
      onChange(updated);
    }
  }, [biomarkers, onChange]);
  const standardizeBiomarkers = async (payload: {
    biomarker: string;
    value: string;
    unit: string;
    bio_type: string;
  }) => {
    try {
      const res = await Application.standardizeBiomarkers(payload);
      console.log(res);

      return res.data;
    } catch (err) {
      console.error('standardizeBiomarkers error:', err);
      return null;
    }
  };

  const updateAndStandardize = async (
    id: string,
    updatedField: Partial<any>,
  ) => {
    // update local state immediately
    // console.log(updatedField);
    let updated = biomarkers.map((b) =>
      b.biomarker_id === id ? { ...b, ...updatedField } : b,
    );

    const current = updated.filter((b) => b.biomarker_id === id)[0];
    const payload = {
      biomarker: current.biomarker,
      value: current.original_value?.toString() || '',
      unit: current.original_unit || '',
      bio_type: 'more_info',
    };

    const standardized = await standardizeBiomarkers(payload);

    if (standardized) {
      updated = updated.map((b) =>
        b.biomarker_id === id ? { ...b, ...standardized } : b,
      );
    }
    onChange(updated);
  };
  const [unitOptions, setUnitOptions] = React.useState<
    Record<number, string[]>
  >({});

  const fetchUnits = async (index: number, biomarkerName: string) => {
    try {
      const res = await Application.getAllBiomarkerUnits({
        biomarker_name: biomarkerName,
      });
      if (res && Array.isArray(res.data.units)) {
        setUnitOptions((prev) => ({ ...prev, [index]: res.data.units }));
      }
    } catch (err) {
      console.error('Failed to fetch units for', biomarkerName, err);
    }
  };

  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tableRef = useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    if (rowErrors && Object.keys(rowErrors).length > 0) {
      const firstErrorIndex = Math.min(...Object.keys(rowErrors).map(Number));
      const el = rowRefs.current[firstErrorIndex];
      const container = tableRef.current;

      if (el && container) {
        const elTop = el.offsetTop;
        container.scrollTo({
          top: elTop - container.clientHeight / 2, // center it
          behavior: 'smooth',
        });
      }
    }
  }, [rowErrors]);
  useEffect(() => {
    if (deletedIndexRef.current !== null) {
      const index = deletedIndexRef.current;
      deletedIndexRef.current = null; // reset

      // Scroll to the same index or the closest one that still exists
      const targetIndex =
        index < biomarkers.length ? index : biomarkers.length - 1;

      const el = rowRefs.current[targetIndex];
      const container = tableRef.current;

      if (el && container) {
        container.scrollTo({
          top: el.offsetTop - container.clientHeight / 2, // scroll to center that row
          behavior: 'smooth',
        });
      }
    }
  }, [biomarkers]);
  console.log(biomarkers);
  const handleMappingToggle = async (id: string) => {
    const row = biomarkers.filter((b) => b.biomarker_id === id)[0];
    const extracted = row.original_biomarker_name;
    const system = row.biomarker;

    if (!extracted || !system) {
      console.warn('Missing biomarker names for mapping');
      return;
    }

    try {
      if (mappedRows.includes(id)) {
        // 🔴 Remove mapping
        await Application.remove_mapping({
          extracted_biomarker: extracted,
          system_biomarker: system,
        });
        setMappedRows((prev) => prev.filter((i) => i !== id));

        // Show red div for 5 seconds
        setMappingStatus((prev) => ({ ...prev, [id]: 'removed' }));
        setTimeout(() => {
          setMappingStatus((prev) => ({ ...prev, [id]: null }));
        }, 5000);
      } else {
        // 🟢 Add mapping
        await Application.add_mapping({
          extracted_biomarker: extracted,
          system_biomarker: system,
        });
        setMappedRows((prev) => [...prev, id]);

        // Show green div for 5 seconds
        setMappingStatus((prev) => ({ ...prev, [id]: 'added' }));
        setTimeout(() => {
          setMappingStatus((prev) => ({ ...prev, [id]: null }));
        }, 5000);
      }
    } catch (err) {
      console.error('Mapping toggle failed:', err);
    }
  };
  useEffect(() => {
    const listener = () => {
      setMappedRows([]);
      setChangedRows([]);
      setMappingStatus({});
    };

    subscribe('RESET_MAPPING_ROWS', listener);

    return () => unsubscribe('RESET_MAPPING_ROWS', listener);
  }, []);
  return (
    <div
      // style={{ height: window.innerHeight - 400 + 'px' }}
      className={`w-full  ${isScaling ? 'biomarkerTableShowAnimation' : 'biomarkerTableHideAnimation'}  rounded-2xl border  border-Gray-50 p-2 md:p-4 shadow-300 text-xs  text-Text-Primary overflow-hidden`}
    >
      {loading ? (
        <div
          style={{ height: window.innerHeight - 480 + 'px' }}
          className="flex items-center min-h-[200px]  w-full justify-center flex-col text-xs font-medium text-Text-Primary"
        >
          <Circleloader></Circleloader>
          <div style={{ textAlignLast: 'center' }} className="text-center">
            Processing… We’ll show the detected biomarkers shortly.
          </div>
        </div>
      ) : uploadedFile?.status !== 'completed' || biomarkers.length == 0 ? (
        <div
          style={{ height: window.innerHeight - 480 + 'px' }}
          className="flex items-center  justify-center flex-col text-xs font-medium text-Text-Primary"
        >
          <img src="/icons/EmptyState-biomarkers.svg" alt="" />
          <div className="-mt-5">No data provided yet.</div>
        </div>
      ) : (
        <div className=" relative ">
          <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
            <div className="flex text-nowrap overflow-x-auto hidden-scrollbar w-full gap-6 justify-between">
              <div className="flex items-center gap-2">
                <div className=" text-[8px] xs:text-[10px] md:text-sm font-medium">
                  List of Biomarkers{' '}
                  <span className="text-[#B0B0B0] text-[8px] md:text-xs font-medium">
                    ({biomarkers.length})
                  </span>
                </div>
                <img
                  onClick={() => setIsScaling(!isScaling)}
                  className="xs:w-4 xs:h-4 w-3 h-3 cursor-pointer opacity-70"
                  src={
                    isScaling
                      ? '/icons/biomarkers/import.svg'
                      : '/icons/biomarkers/export.svg'
                  }
                  alt=""
                />
                {/* <Scaling
                onClick={() => setIsScaling(!isScaling)}
                className="w-4 h-4 cursor-pointer text-Text-Secondary"
              /> */}
              </div>

              <div className="flex items-center gap-6">
                <div className=" hidden sm:flex items-center gap-3">
                  <Toggle
                    checked={showOnlyErrors}
                    setChecked={setShowOnlyErrors}
                  />
                  <div className=" text-[8px] text-nowrap sm:text-[10px] md:text-xs font-normal text-Text-Primary">
                    Show Only Errors
                  </div>
                </div>
                <div className="flex items-center text-[8px] md:text-xs text-Text-Quadruple">
                  Date of Test:
                  <SimpleDatePicker
                    textStyle
                    isUploadFile
                    date={dateOfTest}
                    setDate={setDateOfTest}
                    placeholder="Select Date"
                    ClassName="ml-2 border border-Gray-50  !rounded-2xl px-2 py-1 text-Text-Primary"
                  />
                </div>
              </div>
            </div>
            <div className=" flex sm:hidden items-center gap-3">
              <Toggle checked={showOnlyErrors} setChecked={setShowOnlyErrors} />
              <div className=" text-[8px] text-nowrap sm:text-[10px] md:text-xs font-normal text-Text-Primary">
                Show Only Errors
              </div>
            </div>
          </div>

          <div className="  relative w-full text-xs h-full">
            <div className="w-full hidden-scrollbar p overflow-x-auto md:overflow-x-visible">
              <div className=" w-full  min-w-[800px] ">
                {/* Table Header */}
                <div
                  className="grid    biomarker-grid-desktop biomarker-grid-mobile w-full sticky top-0 z-20 py-2 px-4 font-medium text-Text-Primary text-[8px] md:text-xs bg-[#E9F0F2] border-b rounded-t-[12px] border-Gray-50"
                  // style={{
                  //   gridTemplateColumns:
                  //     window.innerWidth > 640
                  //       ? 'minmax(170px,1fr) minmax(220px,1fr) minmax(90px,1fr) minmax(120px,1fr) minmax(100px,1fr) minmax(100px,1fr) 60px'
                  //       : 'minmax(140px,1fr) minmax(190px,1fr) minmax(60px,1fr) minmax(90px,1fr) minmax(70px,1fr) minmax(70px,1fr) 60px',
                  // }}
                >
                  <div className="text-left">Extracted Biomarker</div>
                  <div className="text-center">System Biomarker</div>
                  <div className="text-center">Extracted Value</div>
                  <div className="text-center">Extracted Unit</div>
                  <div className="text-center">System Value</div>
                  <div className="text-center">System Unit</div>
                  <div className="text-center">Action</div>
                </div>

                {/* Table Rows */}
                <div
                  ref={tableRef}
                  className=" overflow-y-auto pb-[40px] sm:pb-0 w-[100%]"
                  style={{
                    minHeight: isScaling
                      ? window.innerHeight - 330 + 'px'
                      : window.innerHeight - 500 + 'px',
                    maxHeight: isScaling
                      ? window.innerHeight - 330 + 'px'
                      : window.innerWidth > 640
                        ? window.innerHeight - 500 + 'px'
                        : window.innerHeight - 700 + 'px',
                  }}
                >
                  {biomarkers.map((b, index) => {
                    const errorForRow = rowErrors[index];

                    return (
                      <div
                        ref={(el) => (rowRefs.current[index] = el)}
                        key={index}
                        className={`${showOnlyErrors && !errorForRow ? 'hidden' : ''} ${errorForRow ? 'bg-[#FFD8E480]' : index % 2 === 0 ? 'bg-white' : 'bg-backgroundColor-Main'} grid    biomarker-grid-desktop biomarker-grid-mobile py-1 px-4 border-b border-Gray-50 items-center text-[8px] md:text-xs text-Text-Primary`}
                        // style={{
                        //   gridTemplateColumns:
                        //     window.innerWidth > 640
                        //       ? 'minmax(170px,1fr) minmax(220px,1fr) minmax(90px,1fr) minmax(120px,1fr) minmax(100px,1fr) minmax(100px,1fr) 60px'
                        //       : 'minmax(140px,1fr) minmax(190px,1fr) minmax(60px,1fr) minmax(90px,1fr) minmax(70px,1fr) minmax(70px,1fr) 60px',
                        // }}
                      >
                        <div className="text-left text-Text-Primary flex gap-1">
                          <TooltipTextAuto maxWidth="160px">
                            {b.original_biomarker_name}
                          </TooltipTextAuto>
                          {/* {errorForRow && (
                          <>
                            <img
                              data-tooltip-id={`tooltip-${index}`}
                              src="/icons/info-circle-red.svg"
                              alt="Error"
                              className="w-4 h-4"
                            />
                            <Tooltip
                              id={`tooltip-${index}`}
                              place="top"
                              className="!bg-[#F9DEDC] !bg-opacity-100 !max-w-[250px] !opacity-100 !leading-5 !text-wrap !shadow-100 !text-Text-Primary !text-[10px] !rounded-[6px] !border !border-Gray-50 flex flex-col !z-[99999]"
                            >
                              {errorForRow}
                            </Tooltip>
                          </>
                        )} */}
                        </div>
                        {/* biomarker (editable via select) */}
                        <div className="text-center">
                          <SearchSelect
                            isStaff
                            isLarge
                            isSetting
                            value={b.biomarker}
                            options={avalibaleBiomarkers || []}
                            onChange={(val: string) => {
                              updateAndStandardize(b.biomarker_id, {
                                biomarker: val,
                              });
                              setChangedRows((prev) =>
                                prev.includes(b.biomarker_id)
                                  ? prev
                                  : [...prev, b.biomarker_id],
                              );
                            }}
                          />
                          {/* <Select
                        isLarge
                        isSetting
                        value={b.biomarker}
                        options={avalibaleBiomarkers || []}
                        onChange={(val: string) =>
                          updateAndStandardize(index, { biomarker: val })
                        }
                      /> */}
                        </div>
                        {/* value (editable via input) */}
                        <div className="text-center">{renderValueField(b)}</div>
                        {/* unit (editable via select) */}
                        <div className=" flex justify-center">
                          <div className="w-full max-w-[100px] 2xl:max-w-[140px]">
                            <Select
                              isLarge
                              isSetting
                              value={
                                b.original_unit || b.possible_values?.units[0]
                              }
                              options={unitOptions[index] || []}
                              onMenuOpen={() => {
                                if (!unitOptions[index]) {
                                  fetchUnits(index, b.biomarker);
                                }
                              }}
                              onChange={(val: string) =>
                                updateAndStandardize(b.biomarker_id, {
                                  original_unit: val,
                                })
                              }
                            />
                          </div>
                        </div>
                        {/* read-only original fields */}
                        <div className="text-center text-[#888888]">
                          {b.value}
                        </div>
                        <div className="text-center pl-3 sm:pl-0 text-[#888888]">
                          {b.unit}
                        </div>
                        {/* delete logic */}
                        <div
                          className={`flex items-center ${
                            changedRows.includes(b.biomarker_id) ||
                            mappedRows.includes(b.biomarker_id)
                              ? 'justify-end'
                              : 'justify-center'
                          }  gap-2  h-full`}
                        >
                          {b.status === 'confirm' ? (
                            <div className="flex items-center justify-end w-full gap-1">
                              <div className="text-Text-Quadruple text-[10px]">
                                Sure?
                              </div>
                              <img
                                src="/icons/tick-circle-green.svg"
                                alt="Confirm"
                                className="w-[16px] h-[16px] cursor-pointer"
                                onClick={() => handleConfirm(index)}
                              />
                              <img
                                src="/icons/close-circle-red.svg"
                                alt="Cancel"
                                className="w-[16px] h-[16px] cursor-pointer"
                                onClick={() => handleCancel(index)}
                              />
                            </div>
                          ) : (
                            <div className="relative flex items-center justify-end   gap-1  h-full">
                              {mappingStatus[b.biomarker_id] === 'added' && (
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[175px] h-5 rounded-[16px] bg-[#DEF7EC] text-[8px] text-Text-Primary shadow-100 py-1 px-[10px] flex items-center justify-center text-nowrap gap-1 animate-fadeOut">
                                  <img
                                    src="/icons/tick-circle-green-new.svg"
                                    alt=""
                                  />
                                  Mapping saved for future uploads.
                                </div>
                              )}

                              {mappingStatus[b.biomarker_id] === 'removed' && (
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-[220px] rounded-[16px] bg-[#F9DEDC] text-[8px] text-Text-Primary shadow-100 py-1 px-[10px] flex justify-center text-nowrap items-center gap-1 animate-fadeOut">
                                  <img
                                    src="/icons/info-circle-orange.svg"
                                    alt=""
                                  />
                                  This mapping will only be used for this
                                  upload.
                                </div>
                              )}

                              {(changedRows.includes(b.biomarker_id) ||
                                mappedRows.includes(b.biomarker_id)) && (
                                <img
                                  src={
                                    mappedRows.includes(b.biomarker_id)
                                      ? '/icons/save-2-fill.svg'
                                      : '/icons/save-2.svg'
                                  }
                                  alt="Mapping toggle"
                                  className="cursor-pointer w-4 h-4"
                                  onClick={() =>
                                    handleMappingToggle(b.biomarker_id)
                                  }
                                />
                              )}
                              <div
                                className={` ${
                                  changedRows.includes(b.biomarker_id) ||
                                  mappedRows.includes(b.biomarker_id)
                                    ? 'pl-0'
                                    : ' pl-4 sm:pl-6'
                                } `}
                              >
                                <img
                                  src="/icons/trash-blue.svg"
                                  alt="Delete"
                                  className="cursor-pointer w-4 h-4 "
                                  onClick={() => handleTrashClick(index)}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        {errorForRow && (
                          <div className="text-Red font-normal text-[10px] text-nowrap mt-1">
                            {errorForRow}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BiomarkersSection;
