/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import Select from '../../Select';
import SimpleDatePicker from '../../SimpleDatePicker';

const BiomarkersSection: React.FC = () => {
  // Mock data for the table
  const mockBiomarkers = [
    {
      extractedName: 'HemoglobinA1c',
      systemName: 'HbA1c',
      extractedValue: '33.0',
      extractedUnit: '%',
      systemValue: '33.0',
      systemUnit: '%',
      status: 'default',
    },
    {
      extractedName: 'Cholesterol',
      systemName: 'Cholesterol',
      extractedValue: '5.5',
      extractedUnit: 'ng/ml',
      systemValue: '33.0',
      systemUnit: 'ng/ml',
      status: 'default',
    },
    {
      extractedName: 'Ferritin',
      systemName: 'Ferritin',
      extractedValue: '232.0',
      extractedUnit: 'ng/ml',
      systemValue: '33.0',
      systemUnit: 'ng/ml',
      status: 'default', // Changed this to 'default' to match the desired behavior
    },
    {
      extractedName: 'LDL Cholesterol',
      systemName: 'LDL Cholesterol',
      extractedValue: '5.5',
      extractedUnit: 'ng/ml',
      systemValue: '33.0',
      systemUnit: 'ng/ml',
      status: 'default',
    },
    {
      extractedName: 'Total iron-binding capacity',
      systemName: 'Total iron-binding capacity',
      extractedValue: '60.0',
      extractedUnit: 'ug/dL',
      systemValue: '33.0',
      systemUnit: 'ug/dL',
      status: 'default',
    },
    {
      extractedName: 'Total iron-binding capacity',
      systemName: 'Total iron-binding capacity',
      extractedValue: '60.0',
      extractedUnit: 'ug/dL',
      systemValue: '33.0',
      systemUnit: 'ug/dL',
      status: 'default',
    },
    {
      extractedName: 'Total iron-binding capacity',
      systemName: 'Total iron-binding capacity',
      extractedValue: '60.0',
      extractedUnit: 'ug/dL',
      systemValue: '33.0',
      systemUnit: 'ug/dL',
      status: 'default',
    },
    {
      extractedName: 'Total iron-binding capacity',
      systemName: 'Total iron-binding capacity',
      extractedValue: '60.0',
      extractedUnit: 'ug/dL',
      systemValue: '33.0',
      systemUnit: 'ug/dL',
      status: 'default',
    },
    {
      extractedName: 'Total iron-binding capacity',
      systemName: 'Total iron-binding capacity',
      extractedValue: '60.0',
      extractedUnit: 'ug/dL',
      systemValue: '33.0',
      systemUnit: 'ug/dL',
      status: 'default',
    },
    {
      extractedName: 'Total iron-binding capacity',
      systemName: 'Total iron-binding capacity',
      extractedValue: '60.0',
      extractedUnit: 'ug/dL',
      systemValue: '33.0',
      systemUnit: 'ug/dL',
      status: 'default',
    },
    {
      extractedName: 'Total iron-binding capacity',
      systemName: 'Total iron-binding capacity',
      extractedValue: '60.0',
      extractedUnit: 'ug/dL',
      systemValue: '33.0',
      systemUnit: 'ug/dL',
      status: 'default',
    },
  ];

  const [biomarkers, setBiomarkers] = useState(mockBiomarkers);
  const [dateOfTest, setDateOfTest] = useState<Date | null>(
    new Date('2024-04-05'),
  );

  const handleTrashClick = (indexToUpdate: number) => {
    setBiomarkers(
      biomarkers.map((biomarker, index) => {
        if (index === indexToUpdate) {
          return { ...biomarker, status: 'confirm' };
        }
        return biomarker;
      }),
    );
  };

  const handleConfirm = (indexToDelete: number) => {
    setBiomarkers(biomarkers.filter((_, index) => index !== indexToDelete));
  };

  const handleCancel = (indexToUpdate: number) => {
    setBiomarkers(
      biomarkers.map((biomarker, index) => {
        if (index === indexToUpdate) {
          return { ...biomarker, status: 'default' };
        }
        return biomarker;
      }),
    );
  };

  return (
    <div  className="w-full rounded-2xl  border border-Gray-50 p-4 shadow-300 text-sm font-medium text-Text-Primary">
      {biomarkers.length === 0 ? (
        <div className="flex items-center pt-8 justify-center flex-col text-xs font-medium text-Text-Primary">
          <img src="/icons/EmptyState-biomarkers.svg" alt="" />
          <div className="-mt-5">No data provided yet.</div>
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
                ClassName="ml-2 border border-Gray-50 rounded-md px-2 py-1 text-Text-Primary"
              />
            </div>
          </div>
          <div className="overflow-x-auto h-full">
            <div className="w-full min-w-[700px] h-full text-xs">
              {/* Table Header */}
              <div className="grid grid-cols-7 sticky top-0 z-10 gap-4 py-1 px-4 font-medium text-Text-Primary text-xs bg-[#E9F0F2] border-b rounded-t-[12px] border-Gray-50">
                <div className="col-span-1 w-[169px] ">Extracted Biomarker</div>
                <div className="col-span-1 w-[180px] text-center">
                  System Biomarker
                </div>
                <div className="col-span-1 w-[180px] text-center">
                  Extracted Value
                </div>
                <div className="col-span-1 w-[141px] text-end">
                  Extracted Unit
                </div>
                <div className="col-span-1 w-[175px] text-center">
                  System Value
                </div>
                <div className="col-span-1 w-[189px] text-center">
                  System Unit
                </div>
                <div className="col-span-1   text-end">Action</div>
              </div>

              {/* Table Rows */}
              <div style={{height:window.innerHeight - 550 + 'px'}} className="w-full  pr-1">
                {biomarkers.map((biomarker, index) => (
                  <div
                    key={index}
                    className={`grid grid-cols-7 gap-4 py-1 px-4 border-b border-Gray-50 items-center text-xs text-Text-Primary ${index % 2 === 0 ? 'bg-white' : 'bg-backgroundColor-Main'}`}
                  >
                    <div className="col-span-1 w-[169px]">
                      {biomarker.extractedName}
                    </div>
                    <div className="col-span-1 w-[180px] text-center">
                      <Select
                        isSetting
                        value={biomarker.systemName}
                        onChange={() => {}}
                      ></Select>
                    </div>
                    <div className="col-span-1 w-[180px] text-center">
                      <input
                        type="number"
                        value={biomarker.extractedValue}
                        className=" text-center border border-Gray-50 w-[95px] outline-none rounded-md text-[12px] text-Text-Primary px-2 py-1"
                        onChange={() => {}} // Add handler for input change
                      />
                    </div>
                    <div className="col-span-1 w-[171px] flex justify-end">
                      <Select
                        isSmall
                        isSetting
                        value={biomarker.extractedUnit}
                        onChange={() => {}}
                      ></Select>
                    </div>
                    <div className="col-span-1 w-[175px] text-center text-[#888888] text-xs">
                      {biomarker.systemValue}
                    </div>
                    <div className="col-span-1 text-[#888888] text-xs w-[189px] text-center">
                      {biomarker.systemUnit}
                    </div>

                    <div className="col-span-1  flex items-center justify-end gap-2">
                      {biomarker.status === 'confirm' ? (
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
