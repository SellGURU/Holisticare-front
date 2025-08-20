/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import Select from '../../Select';
import SimpleDatePicker from '../../SimpleDatePicker';
import Circleloader from '../../CircleLoader';
import TooltipTextAuto from '../../TooltipText/TooltipTextAuto';

interface BiomarkersSectionProps {
  biomarkers: any[];
  onChange: (updated: any[]) => void; // callback to update parent state
  uploadedFile: any;
  dateOfTest: Date | null;
  setDateOfTest: (date: Date | null) => void;
}

const BiomarkersSection: React.FC<BiomarkersSectionProps> = ({
  biomarkers,
  onChange,
  uploadedFile,
  dateOfTest,
  setDateOfTest
}) => {


  const handleValueChange = (index: number, newValue: string) => {
    const updated = biomarkers.map((b, i) =>
      i === index ? { ...b, original_value: newValue } : b,
    );
    onChange(updated);
  };

  const handleNameChange = (index: number, newName: string) => {
    const updated = biomarkers.map((b, i) =>
      i === index ? { ...b, biomarker: newName } : b,
    );
    onChange(updated);
  };

  const handleUnitChange = (index: number, newUnit: string) => {
    const updated = biomarkers.map((b, i) =>
      i === index ? { ...b, original_unit: newUnit } : b,
    );
    onChange(updated);
  };

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

  return (
    <div className="w-full rounded-2xl border border-Gray-50 p-4 shadow-300 text-sm font-medium text-Text-Primary">
      {uploadedFile?.status !== "completed" ? (
        <div className="flex items-center pt-8 justify-center flex-col text-xs font-medium text-Text-Primary">
        <img src="/icons/EmptyState-biomarkers.svg" alt="" />
        <div className="-mt-5">No data provided yet.</div>
      </div>
      ) : biomarkers.length === 0 && uploadedFile?.status == "completed" ? (
        <div className="flex items-center min-h-[200px]  w-full justify-center flex-col text-xs font-medium text-Text-Primary">
          <Circleloader></Circleloader>
          <div>Processing… We’ll show the detected biomarkers shortly.</div>
        </div>
      ) : (
        <div className="w-full">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm font-medium">
              List of Biomarkers{' '}
              <span className="text-[#B0B0B0] text-xs font-medium">
                ({biomarkers.length})
              </span>
            </div>
            <div className="flex items-center text-xs text-Text-Quadruple">
              Date of Test
              <SimpleDatePicker
                date={dateOfTest}
                setDate={setDateOfTest}
                placeholder="Select Date"
                ClassName="ml-2 border border-Gray-50 1rounded-2xl px-2 py-1 text-Text-Primary"
              />
            </div>
          </div>
          <div className="overflow-x-auto h-full">
            <div className="w-full min-w-[700px] h-full text-xs">
              {/* Table Header */}
              <div className="grid grid-cols-7 sticky top-0 z-10 gap-4 py-1 px-4 font-medium text-Text-Primary text-xs bg-[#E9F0F2] border-b rounded-t-[12px] border-Gray-50">
                <div className="col-span-1 w-[169px] ">Extracted Biomarker</div>
                <div className="col-span-1 w-[150px] pl-20 text-nowrap text-center">
                  System Biomarker
                </div>
                <div className="col-span-1 w-[270px] text-center">
                  Extracted Value
                </div>
                <div className="col-span-1 w-[181px] text-end">
                  Extracted Unit
                </div>
                <div className="col-span-1 w-[245px] text-center">
                  System Value
                </div>
                <div className="col-span-1 w-[259px] text-center">
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
                    className={`grid grid-cols-7 gap-4 py-1 px-4 border-b border-Gray-50 items-center text-xs text-Text-Primary ${
                      index % 2 === 0 ? 'bg-white' : 'bg-backgroundColor-Main'
                    }`}
                  > <div className="col-span-1 w-[169px]   text-left text-[#888888]">
                  <TooltipTextAuto maxWidth='169px'>{b.original_biomarker_name}</TooltipTextAuto>
              
                </div>
                    {/* biomarker (editable via select) */}
                    <div className="col-span-1 w-[210px] pl-[40px]">
                      <Select
                      isLarge
                        isSetting
                        value={b.biomarker}
                        options={b.possible_values?.names || []}
                        onChange={(val: string) => handleNameChange(index, val)}
                      />
                    </div>
                   

                    {/* value (editable via input) */}
                    <div className="col-span-1 w-[270px] text-center">
                      <input
                        type="text"
                        value={b.original_value}
                        className="text-center border border-Gray-50 w-[95px] outline-none rounded-md text-[12px] text-Text-Primary px-2 py-1"
                        onChange={(e) =>
                          handleValueChange(index, e.target.value)
                        }
                      />
                    </div>

                    {/* unit (editable via select) */}
                    <div className="col-span-1 w-[211px] text-end">
                      <Select
                        isSmall
                        isSetting
                        value={b.original_unit}
                        options={b.possible_values?.units || []}
                        onChange={(val: string) => handleUnitChange(index, val)}
                      />
                    </div>

                    {/* read-only original fields */}

                    <div className="col-span-1 w-[245px] text-center text-[#888888]">
                      {b.value}
                    </div>
                    <div className="col-span-1 w-[259px] text-center text-[#888888]">
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
                        <div className="w-[47px] pl-5">
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
