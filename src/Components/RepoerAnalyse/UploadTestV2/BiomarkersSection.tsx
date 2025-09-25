/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef } from 'react';
import Select from '../../Select';
import SimpleDatePicker from '../../SimpleDatePicker';
import Circleloader from '../../CircleLoader';
import TooltipTextAuto from '../../TooltipText/TooltipTextAuto';
import Application from '../../../api/app';
interface BiomarkersSectionProps {
  biomarkers: any[];
  onChange: (updated: any[]) => void; // callback to update parent state
  uploadedFile: any;
  dateOfTest: Date | null;
  setDateOfTest: (date: Date | null) => void;
  fileType: string;
  loading: boolean;
}

const BiomarkersSection: React.FC<BiomarkersSectionProps> = ({
  biomarkers,
  fileType,
  onChange,
  uploadedFile,
  dateOfTest,
  setDateOfTest,
  loading,
}) => {
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

const handleValueChange = (index: number, newValue: string) => {
  // update local state immediately so UI feels responsive
  const updated = biomarkers.map((b, i) =>
    i === index ? { ...b, original_value: newValue } : b
  );
  onChange(updated);

  // clear previous timer if user is still typing
  if (typingTimeoutRef.current) {
    clearTimeout(typingTimeoutRef.current);
  }

  // set new timer (3s)
  typingTimeoutRef.current = setTimeout(() => {
    updateAndStandardize(index, { original_value: newValue });
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

  const handleConfirm = (indexToDelete: number) => {
    const updated = biomarkers.filter((_, i) => i !== indexToDelete);
    onChange(updated);
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

  const gutOptions = ['Good for GUT', 'Bad for GUT'];
  const renderValueField = (b: any, index: number) => {
    if (fileType.toLowerCase() === 'dna') {
      return (
        <Select
          isSmall
          isSetting
          value={b.original_value}
          options={dnaOptions}
          onChange={(val: string) => updateAndStandardize(index, { original_value: val})}
        />
      );
    } else if (fileType.toLowerCase() === 'gut') {
      return (
        <Select
          isSmall
          isSetting
          value={b.original_value}
          options={gutOptions}
          onChange={(val: string) =>  updateAndStandardize(index, { original_value: val})}
        />
      );
    } else {
      return (
        <input
          type="number"
          value={b.original_value}
          className="text-center border border-Gray-50 w-[70px] md:w-[95px] outline-none rounded-md text-[8px] md:text-[12px] text-Text-Primary px-2 md:py-1"
          onChange={(e) => handleValueChange(index, e.target.value)}
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
  }, [biomarkers, onChange])
  const standardizeBiomarkers = async (payload: {
    biomarker: string;
    value: string;
    unit: string;
    bio_type: string;
  }) => {
    try {
      const res = await Application.standardizeBiomarkers(payload);
      // if res is already JSON, just return it
      if (!res) throw new Error('Failed to standardize');
      return res;
    } catch (err) {
      console.error('standardizeBiomarkers error:', err);
      return null;
    }
  };
  
  const updateAndStandardize = async (
    index: number,
    updatedField: Partial<any>
  ) => {
    // update local state immediately
    let updated = biomarkers.map((b, i) =>
      i === index ? { ...b, ...updatedField } : b,
    );
  
    const current = updated[index];
    const payload = {
      biomarker: current.biomarker,
      value: current.original_value?.toString() || '',
      unit: current.original_unit || '',
      bio_type: 'more_info',
    };
  
    const standardized = await standardizeBiomarkers(payload);
    if (standardized) {
      updated = updated.map((b, i) =>
        i === index ? { ...b, ...standardized } : b,
      );
    }
  
    onChange(updated);
  };
  // const [unitOptions, setUnitOptions] = React.useState<Record<number, string[]>>({});

  // const fetchUnits = async (index: number, biomarkerName: string) => {
  //   try {
  //     const res = await Application.getAllBiomarkerUnits({ biomarker_name: biomarkerName });
  //     if (res && Array.isArray(res.data.units)) {
  //       setUnitOptions((prev) => ({ ...prev, [index]: res.data.units }));
  //     }
  //   } catch (err) {
  //     console.error("Failed to fetch units for", biomarkerName, err);
  //   }
  // };
  

  // useEffect(() => {
  //   biomarkers.forEach((b, index) => {
  //     if (b.biomarker && !unitOptions[index]) {
  //       fetchUnits(index, b.biomarker);
  //     }
  //   });
  // }, [biomarkers]);
  return (
    <div
      style={{ height: window.innerHeight - 440 + 'px' }}
      className="w-full   rounded-2xl border  border-Gray-50 p-4 shadow-300 text-sm font-medium text-Text-Primary"
    >
      {loading ? (
       <div
        style={{ height: window.innerHeight - 520 + 'px' }}
        className="flex items-center min-h-[200px]  w-full justify-center flex-col text-xs font-medium text-Text-Primary"
      >
        <Circleloader></Circleloader>
        <div>Processing… We’ll show the detected biomarkers shortly.</div>
      </div>
      ) :
      uploadedFile?.status !== 'completed' || biomarkers.length == 0 ? (
          <div
          style={{ height: window.innerHeight - 520 + 'px' }}
          className="flex items-center  justify-center flex-col text-xs font-medium text-Text-Primary"
        >
          <img src="/icons/EmptyState-biomarkers.svg" alt="" />
          <div className="-mt-5">No data provided yet.</div>
        </div>
      ) : (
    
        <div className="">
          <div className="flex justify-between items-center mb-4">
            <div className=" text-[10px] md:text-sm font-medium">
              List of Biomarkers{' '}
              <span className="text-[#B0B0B0] text-xs font-medium">
                ({biomarkers.length})
              </span>
            </div>
            <div className="flex items-center text-[8px] md:text-xs text-Text-Quadruple">
              Date of Test
              <SimpleDatePicker
                isUploadFile
                date={dateOfTest}
                setDate={setDateOfTest}
                placeholder="Select Date"
                ClassName="ml-2 border border-Gray-50 1rounded-2xl px-2 py-1 text-Text-Primary"
              />
            </div>
          </div>
          <div className=" w-full overflow-auto  h-full">
            <div className="w-full  min-w-[700px]   h-full text-xs">
              {/* Table Header */}
              <div className="grid grid-cols-7 w-full sticky top-0 z-10 gap-4 py-1 px-4 font-medium text-Text-Primary text-[8px] md:text-xs bg-[#E9F0F2] border-b rounded-t-[12px] border-Gray-50">
                <div className="col-span-1 md:w-[169px] ">
                  Extracted Biomarker
                </div>
                <div className="col-span-1 ml-6 md:ml-0 md:w-[150px] md:pl-20 text-nowrap text-center">
                  System Biomarker
                </div>
                <div className="col-span-1 w-[170px] md:w-[320px] text-center">
                  Extracted Value
                </div>
                <div className="col-span-1 w-[120px] md:w-[215px] text-end">
                  Extracted Unit
                </div>
                <div className="col-span-1 w-[220px] md:w-[295px] text-center">
                  System Value
                </div>
                <div className="col-span- w-[200px] md:w-[259px] text-center">
                  System Unit
                </div>
                <div className="col-span-1   text-end">Action</div>
              </div>

              {/* Table Rows */}
              <div
                style={{ height: window.innerHeight - 550 + 'px' }}
                className="w-full pr-1"
              >
                {biomarkers.map((b, index) => (
                  <div
                    key={index}
                    className={`grid grid-cols-7 gap-4 py-1 px-4 border-b border-Gray-50 items-center text-[8px] md:text-xs text-Text-Primary ${
                      index % 2 === 0 ? 'bg-white' : 'bg-backgroundColor-Main'
                    }`}
                  >
                    {' '}
                    <div className="col-span-1 md:w-[169px]   text-left text-Text-Primary">
                      <TooltipTextAuto maxWidth="159px">
                        {b.original_biomarker_name}
                      </TooltipTextAuto>
                    </div>
                    {/* biomarker (editable via select) */}
                    <div className="col-span-1 w-[140px] md:w-[210px] md:pl-[40px]">
                      <Select
                        isLarge
                        isSetting
                        value={b.biomarker}
                        options={b.possible_values?.names || []}
                        onChange={(val: string) =>   updateAndStandardize(index, { biomarker: val })}
                      />
                    </div>
                    {/* value (editable via input) */}
                    <div className="col-span-1 w-[170px] md:w-[320px] text-center">
                      {renderValueField(b, index)}
                    </div>
                    {/* unit (editable via select) */}
                    <div className="col-span-1 w-[120px] ml-10 md:ml-28  text-end">
                      <Select
                        isLarge
                        isSetting
                        value={b.original_unit || b.possible_values?.units[0]}
                        options={b.possible_values?.units || []}
                        onChange={(val:string) =>  
                          updateAndStandardize(index, { original_unit: val })


                        }
                      />
                    </div>
                    {/* read-only original fields */}
                    <div className="col-span-1 w-[220px] md:w-[295px] text-center text-[#888888]">
                      {b.value}
                    </div>
                    <div className="col-span-1 w-[200px] md:w-[259px] text-center text-[#888888]">
                      {b.unit}
                    </div>
                    {/* delete logic */}
                    <div className="col-span-1 flex items-center justify-end gap-2">
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
                        <div className="w-[47px] pl-8 md:pl-5">
                          <img
                            src="/icons/trash-blue.svg"
                            alt="Delete"
                            className="cursor-pointer w-4 h-4"
                            onClick={() => handleTrashClick(index)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BiomarkersSection;
