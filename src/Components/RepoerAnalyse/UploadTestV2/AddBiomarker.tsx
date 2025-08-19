import React, { useState } from 'react';
import Select from '../../Select';
import TextField from '../../TextField';
import SimpleDatePicker from '../../SimpleDatePicker';

export const AddBiomarker = () => {
  const [dateOfTest, setDateOfTest] = useState<Date | null>(
    new Date('2024-04-05'),
  );
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
   
      systemName: 'Total iron-binding capacity',
      extractedValue: '60.0',
      extractedUnit: 'ug/dL',
      systemValue: '33.0',
      
      status: 'default',
    },

  ];
  return (
    <div
      style={{ height: window.innerHeight - 235 + 'px' }}
      className="w-full rounded-2xl border p-4 border-Gray-50 shadow-200 mt-4 "
    >
      <div className="text-sm font-medium text-Text-Primary">
        List of Biomarkers
      </div>
      <div className="w-full flex justify-between gap-4 mt-6">
        <div className="rounded-2xl w-[50%] border border-Gray-50 px-6 py-4 bg-white shadow-100 flex flex-col gap-[12px]">
          <div className="text-xs text-Text-Primary">
            Add a biomarker by filling in its details (Name, Value, Unit, Test
            Date) and clicking Add Biomarker. You’ll see it added right away in
            the client’s list on the right.
          </div>
          <div className="flex flex-col text-xs font-medium text-Text-Primary gap-2 w-full">
            Biomarker Name
            <Select isStaff isLarge isSetting value="-" onChange={() => {}} />
          </div>
          <div className="flex flex-col text-xs font-medium text-Text-Primary gap-2 w-full">
            Value
            <TextField  newStyle type="text"></TextField>
          </div>
          <div className="flex flex-col text-xs font-medium text-Text-Primary gap-2 w-full">
            Unit
            <Select isStaff isLarge isSetting value="-" onChange={() => {}} />
          </div>
          <div className="flex flex-col text-xs font-medium text-Text-Primary gap-2 w-full">
            Date of Test
            <SimpleDatePicker
            full
              date={dateOfTest}
              setDate={setDateOfTest}
              placeholder="Select Date"
              ClassName=" !h-[28px] border border-Gray-50 !rounded-2xl px-2 py-1 text-Text-Primary"
            />
          </div>
          <div className='rounded-[20px] w-full py-2 px-[32px] flex justify-center items-center bg-backgroundColor-Card text-Primary-DeepTeal shadow-Btn text-xs h-[32px] gap-1 font-medium cursor-pointer mt-2 border border-Primary-DeepTeal'>
               <img src="/icons/add-square-new.svg" alt="" /> Add to List
          </div>
        </div>
        <div className="overflow-x-auto w-[%50%] h-full">
            <div className="w-full h-full text-xs">
              {/* Table Header */}
              <div className="grid grid-cols-7 sticky top-0 z-10 gap-4 py-1 px-4 font-medium text-Text-Primary text-xs bg-[#E9F0F2] border-b rounded-t-[12px] border-Gray-50">
                <div className="col-span-2  ">Biomarker Name</div>
                <div className="col-span-1 w-[110px] text-center ">
                Value
                </div>
                <div className="col-span-1  w-[110px] text-center  ">
                Unit
                </div>
                <div className="col-span-1  w-[120px] text-center  ">
                Test Date
                </div>
               
                <div className="col-span-1   w-[190px]    text-end">Action</div>
              </div>

              {/* Table Rows */}
              <div
                style={{ height: window.innerHeight - 550 + 'px' }}
                className="w-full  pr-1"
              >
                {mockBiomarkers.map((biomarker, index) => (
                  <div
                    key={index}
                    className={`grid grid-cols-7 gap-4 py-1 px-4 border-b border-Gray-50 items-center text-xs text-Text-Primary ${index % 2 === 0 ? 'bg-white' : 'bg-backgroundColor-Main'}`}
                  >
                    <div className="col-span-1 w-[169px]">
                      {biomarker.extractedName}
                    </div>
                    <div className="col-span-1 w-[175px] text-center text-[#888888] text-xs">
                      {biomarker.systemValue}
                    </div>
                 
                    <div className="col-span-1 w-[175px] text-center text-[#888888] text-xs">
                      {biomarker.systemValue}
                    </div>
                    <div className="col-span-1 w-[175px] text-center text-[#888888] text-xs">
                      {biomarker.systemValue}
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
                            // onClick={() => handleConfirm(index)}
                          />
                          <img
                            src="/icons/close-circle-red.svg"
                            alt="Cancel"
                            className="w-[16px] h-[16px] cursor-pointer"
                            // onClick={() => handleCancel(index)}
                          />
                        </div>
                      ) : (
                        <div className="w-[47px] pl-5">
                          <img
                            src="/icons/trash-blue.svg"
                            alt="Delete"
                            className="cursor-pointer w-4 h-4"
                            // onClick={() => handleTrashClick(index)}
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
    
    </div>
  );
};
