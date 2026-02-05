/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';
import Application from '../../../api/app';
import Select from '../../Select';
import SimpleDatePicker from '../../SimpleDatePicker';
// import TooltipTextAuto from '../../TooltipText/TooltipTextAuto';
// import { Scaling } from 'lucide-react';
import { publish, subscribe, unsubscribe } from '../../../utils/event';
// import SearchSelect from '../../searchableSelect';
import Toggle from '../Boxs/Toggle';
import BiomarkerRow from './BiomarkerRow';
import ProgressLoading from './ProgressLoading';
import Joyride, { CallBackProps, Step } from 'react-joyride';
import { TutorialReminderToast } from './showTutorialReminderToast';

const biomarkersSteps: Step[] = [
  {
    target: '[data-tour="biomarker-table"]',
    content:
      'This table shows all biomarkers automatically extracted from the uploaded lab report.',
    placement: 'left-start',
  },
  {
    target: '[data-tour="extracted-biomarker"]',
    content:
      'This column displays the biomarker name detected from the uploaded document.',
  },
  {
    target: '[data-tour="system-biomarker"]',
    content:
      'Select the correct system biomarker to properly map and validate the extracted data.',
  },
  {
    target: '[data-tour="extracted-value"]',
    content:
      'This is the value extracted from the lab report. Please verify its accuracy.',
  },
  {
    target: '[data-tour="extracted-unit"]',
    content:
      'Ensure the unit matches the original lab report before proceeding.',
  },
  {
    target: '[data-tour="system-value"]',
    content:
      'This is the normalized value used internally by the system for analysis.',
  },
  {
    target: '[data-tour="system-unit"]',
    content:
      'This is the normalized unit used internally by the system for analysis.',
  },
  {
    target: '[data-tour="delete-biomarker"]',
    content: 'Use this action to remove an incorrect or unnecessary biomarker.',
  },
];

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
  progressBiomarkerUpload: number;
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
  progressBiomarkerUpload,
}) => {
  // const [changedRows, setChangedRows] = useState<string[]>([]);
  // const [mappedRows, setMappedRows] = useState<string[]>([]);
  // const [mappingStatus, setMappingStatus] = useState<
  //   Record<string, 'added' | 'removed' | null>
  // >({});
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

  // const handleTrashClick = (indexToUpdate: number) => {
  //   const updated = biomarkers.map((b, i) =>
  //     i === indexToUpdate ? { ...b, status: 'confirm' } : b,
  //   );
  //   onChange(updated);
  // };
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

  // const handleCancel = (indexToUpdate: number) => {
  //   const updated = biomarkers.map((b, i) =>
  //     i === indexToUpdate ? { ...b, status: 'default' } : b,
  //   );
  //   onChange(updated);
  // };
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
          type="text"
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
  }): Promise<
    { success: true; data: any } | { success: false; error: string }
  > => {
    try {
      const res = await Application.standardizeBiomarkers(payload);
      return { success: true, data: res.data };
    } catch (err: any) {
      // Axios interceptor rejects with error.response.data directly, so err is {detail: "..."}
      // Handle multiple possible error structures
      let errorMessage = 'Standardization failed';
      if (typeof err === 'string') {
        errorMessage = err;
      } else if (err?.detail) {
        errorMessage = err.detail;
      } else if (err?.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      console.error('standardizeBiomarkers error:', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateAndStandardize = async (
    id: string,
    updatedField: Partial<any>,
  ) => {
    // update local state immediately
    let updated = biomarkers.map((b) =>
      b.biomarker_id === id ? { ...b, ...updatedField } : b,
    );

    // Find the index for this biomarker (needed for rowErrors)
    const index = updated.findIndex((b) => b.biomarker_id === id);

    const current = updated.find((b) => b.biomarker_id === id);
    const payload = {
      biomarker: current.biomarker,
      value: current.original_value?.toString() || '',
      unit: current.original_unit || '',
      bio_type: 'more_info',
    };

    const result = await standardizeBiomarkers(payload);

    if (result.success) {
      updated = updated.map((b) =>
        b.biomarker_id === id ? { ...b, ...result.data } : b,
      );
      // Clear error for this specific row only
      if (index !== -1) {
        setrowErrors((prev: any) => {
          if (!prev || !prev[index]) return prev;
          const newErrors = { ...prev };
          delete newErrors[index];
          return newErrors;
        });
      }
    } else {
      // Set error for this specific row only
      if (index !== -1) {
        setrowErrors((prev: any) => ({
          ...prev,
          [index]: result.error,
        }));
      }
    }

    onChange(updated);
  };
  // const [unitOptions, setUnitOptions] = React.useState<
  //   Record<number, string[]>
  // >({});

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
  // const handleMappingToggle = async (id: string) => {
  //   const row = biomarkers.filter((b) => b.biomarker_id === id)[0];
  //   const extracted = row.original_biomarker_name;
  //   const system = row.biomarker;

  //   if (!extracted || !system) {
  //     console.warn('Missing biomarker names for mapping');
  //     return;
  //   }

  //   try {
  //     if (mappedRows.includes(id)) {
  //       // 🔴 Remove mapping
  //       await Application.remove_mapping({
  //         extracted_biomarker: extracted,
  //         system_biomarker: system,
  //       });
  //       setMappedRows((prev) => prev.filter((i) => i !== id));

  //       // Show red div for 5 seconds
  //       setMappingStatus((prev) => ({ ...prev, [id]: 'removed' }));
  //       setTimeout(() => {
  //         setMappingStatus((prev) => ({ ...prev, [id]: null }));
  //       }, 5000);
  //     } else {
  //       // 🟢 Add mapping
  //       await Application.add_mapping({
  //         extracted_biomarker: extracted,
  //         system_biomarker: system,
  //       });
  //       setMappedRows((prev) => [...prev, id]);

  //       // Show green div for 5 seconds
  //       setMappingStatus((prev) => ({ ...prev, [id]: 'added' }));
  //       setTimeout(() => {
  //         setMappingStatus((prev) => ({ ...prev, [id]: null }));
  //       }, 5000);
  //     }
  //   } catch (err) {
  //     console.error('Mapping toggle failed:', err);
  //   }
  // };
  useEffect(() => {
    const listener = () => {
      // setMappedRows([]);
      // setChangedRows([]);
      // setMappingStatus({});
    };

    subscribe('RESET_MAPPING_ROWS', listener);

    return () => unsubscribe('RESET_MAPPING_ROWS', listener);
  }, []);
  const [run, setRun] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  useEffect(() => {
    if (biomarkers.length > 0) {
      const seen = localStorage.getItem('biomarkersTourSeen');
      if (!seen) {
        setTimeout(() => {
          setRun(true);
        }, 3000);
        localStorage.setItem('biomarkersTourSeen', 'true');
      }
    }
  }, [biomarkers.length]);
  useEffect(() => {
    if (biomarkers.length > 0) {
      const tutorialSeen = localStorage.getItem('tutorialSeen');
      if (tutorialSeen === 'true') {
        return;
      }
      const hasSeenTour = localStorage.getItem('biomarkersTourSeen');

      if (hasSeenTour === 'true') {
        setShowReminder(true);
      }
    }
  }, [biomarkers.length]);
  const handleRestartTutorial = () => {
    localStorage.removeItem('biomarkersTourSeen');
    setShowReminder(false);
    setRun(true);
  };
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;

    if (status === 'finished' || status === 'skipped') {
      localStorage.setItem('biomarkersTourSeen', 'true');
      setRun(false);
    }
  };
  return (
    <>
      {run && (
        <Joyride
          steps={biomarkersSteps}
          run={run}
          continuous
          scrollToFirstStep
          showSkipButton
          disableOverlayClose
          styles={{
            options: {
              arrowColor: '#fff',
              backgroundColor: '#fff',
              primaryColor: '#0f766e',
              textColor: '#1f2937',
              zIndex: 10000,
            },
            tooltip: {
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
            },
          }}
          callback={handleJoyrideCallback}
        />
      )}
      <TutorialReminderToast
        visible={showReminder}
        onRestart={handleRestartTutorial}
        onClose={() => {
          setShowReminder(false);
          localStorage.setItem('tutorialSeen', 'true');
        }}
      />
      <div
        // style={{ height: window.innerHeight - 400 + 'px' }}
        className={`w-full  ${isScaling ? 'biomarkerTableShowAnimation' : 'biomarkerTableHideAnimation'}  rounded-2xl border  border-Gray-50 p-2 md:p-4 shadow-300 text-xs  text-Text-Primary overflow-hidden`}
        data-tour="biomarkers-section"
      >
        {loading ? (
          <div
            style={{ height: window.innerHeight - 480 + 'px' }}
            className="flex items-center min-h-[200px] w-full justify-center flex-col text-xs font-medium text-Text-Primary gap-4"
          >
            {/* <Circleloader /> */}
            {/* Progress Bar */}
            <ProgressLoading
              maxProgress={progressBiomarkerUpload}
            ></ProgressLoading>
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

                <div className="flex items-center absolute right-0 top-[-2px] gap-6">
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
                      key={'biomarkerUpload'}
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
                <Toggle
                  checked={showOnlyErrors}
                  setChecked={setShowOnlyErrors}
                />
                <div className=" text-[8px] text-nowrap sm:text-[10px] md:text-xs font-normal text-Text-Primary">
                  Show Only Errors
                </div>
              </div>
            </div>

            <div
              className="  relative w-full text-xs h-full"
              data-tour="biomarker-table"
            >
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
                    <div className="text-left" data-tour="extracted-biomarker">
                      Extracted Biomarker
                    </div>
                    <div className="text-center" data-tour="system-biomarker">
                      System Biomarker
                    </div>
                    <div className="text-center" data-tour="extracted-value">
                      Extracted Value
                    </div>
                    <div className="text-center" data-tour="extracted-unit">
                      Extracted Unit
                    </div>
                    <div className="text-center" data-tour="system-value">
                      System Value
                    </div>
                    <div className="text-center" data-tour="system-unit">
                      System Unit
                    </div>
                    <div className="text-center" data-tour="delete-biomarker">
                      Action
                    </div>
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
                      // const errorForRow = rowErrors[index];

                      return (
                        <BiomarkerRow
                          refRenceEl={(el: any) =>
                            (rowRefs.current[index] = el)
                          }
                          isHaveError={rowErrors[index]}
                          errorText={rowErrors[index]}
                          biomarker={b}
                          index={index}
                          showOnlyErrors={showOnlyErrors}
                          allAvilableBiomarkers={avalibaleBiomarkers}
                          handleConfirmDelete={() => {
                            handleConfirm(index);
                          }}
                          renderValueField={renderValueField}
                          updateAndStandardize={updateAndStandardize}
                        ></BiomarkerRow>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BiomarkersSection;
