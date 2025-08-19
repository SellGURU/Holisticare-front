import React, { useState } from 'react';
import Select from '../../Select';
import TextField from '../../TextField';
import SimpleDatePicker from '../../SimpleDatePicker';
import TooltipTextAuto from '../../TooltipText/TooltipTextAuto';

export const AddBiomarker = () => {
  const [biomarkers, setBiomarkers] = useState<
    { name: string; value: string; unit: string }[]
  >([]);

  // Local form states
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('');

  const handleAddBiomarker = () => {
    if (!name || !value || !unit) return; // prevent empty adds
    const newBiomarker = { name, value, unit };
    setBiomarkers([...biomarkers, newBiomarker]);
    setName('');
    setValue('');
    setUnit('');
  };

  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const handleTrashClick = (index: number) => {
    setDeleteIndex(index);
  };

  const handleConfirm = (index: number) => {
    setBiomarkers(biomarkers.filter((_, i) => i !== index));
    setDeleteIndex(null); // reset after delete
  };

  const handleCancel = () => {
    setDeleteIndex(null);
  };

  return (
    <div
      style={{ height: window.innerHeight - 235 + 'px' }}
      className="w-full rounded-2xl border p-4 border-Gray-50 shadow-200 mt-4 "
    >
      <div className="text-sm font-medium text-Text-Primary">
        List of Biomarkers
      </div>
      <div className="w-full flex justify-between gap-4 mt-6">
        {/* Left side: Add biomarker form */}
        <div className="rounded-2xl w-[50%] border border-Gray-50 px-6 py-4 bg-white shadow-100 flex flex-col gap-[12px]">
          <div className="text-xs text-Text-Primary">
            Add a biomarker by filling in its details (Name, Value, Unit) and
            clicking <b>Add Biomarker</b>. You’ll see it added right away in the
            list on the right.
          </div>

          {/* Biomarker Name */}
          <div className="flex flex-col text-xs font-medium text-Text-Primary gap-2 w-full">
            Biomarker Name
            <TextField
              newStyle
              type="text"
              value={name}
              onChange={(e: any) => setName(e.target.value)}
            />
          </div>

          {/* Value */}
          <div className="flex flex-col text-xs font-medium text-Text-Primary gap-2 w-full">
            Value
            <TextField
              newStyle
              type="text"
              value={value}
              onChange={(e: any) => setValue(e.target.value)}
            />
          </div>

          {/* Unit */}
          <div className="flex flex-col text-xs font-medium text-Text-Primary gap-2 w-full">
            Unit
            <TextField
              newStyle
              type="text"
              value={unit}
              onChange={(e: any) => setUnit(e.target.value)}
            />
          </div>

          {/* Add button */}
          <div
            onClick={handleAddBiomarker}
            className="rounded-[20px] w-full py-2 px-[32px] flex justify-center items-center bg-backgroundColor-Card text-Primary-DeepTeal shadow-Btn text-xs h-[32px] gap-1 font-medium cursor-pointer mt-2 border border-Primary-DeepTeal"
          >
            <img src="/icons/add-square-new.svg" alt="" /> Add to List
          </div>
        </div>

        {/* Right side: Table */}
        <div
          className={`overflow-x-auto w-full  border-Gray-50   ${biomarkers.length === 0 && 'overflow-hidden '} pr-1`}
        >
          <div className="w-full border border-Gray-50  rounded-[20px] h-full text-xs">
            {/* Table Header */}
            <div
              className="grid sticky top-0 z-10 py-2 px-4 font-medium text-Text-Primary text-xs bg-[#E9F0F2] border-b rounded-t-[12px] border-Gray-50"
              style={{ gridTemplateColumns: '1fr 100px 100px 60px' }}
            >
              <div className="text-left">Biomarker Name</div>
              <div className="text-center">Value</div>
              <div className="text-center">Unit</div>
              <div className="text-right">Action</div>
            </div>

            {/* Table Rows */}
            <div
              style={{ height: window.innerHeight - 550 + 'px' }}
              className="w-full "
            >
              {biomarkers.map((biomarker, index) => (
                <div
                  key={index}
                  className={`grid py-2 px-4 border-b border-Gray-50 items-center text-xs text-Text-Primary ${
                    index % 2 === 0 ? 'bg-white' : 'bg-backgroundColor-Main'
                  }`}
                  style={{ gridTemplateColumns: '1fr 100px 100px 60px' }}
                >
                  {/* Biomarker Name */}
                  <div>
                    <TooltipTextAuto maxWidth="250px">
                      {biomarker.name}
                    </TooltipTextAuto>
                  </div>

                  {/* Value */}
                  <div className="text-center text-[#888888]">
                    {biomarker.value}
                  </div>

                  {/* Unit */}
                  <div className="text-center text-[#888888]">
                    {biomarker.unit}
                  </div>

                  {/* Action */}
                  <div className="flex justify-end">
                    {deleteIndex === index ? (
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
                          onClick={() => handleCancel()}
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

              {biomarkers.length === 0 && (
                <div className="flex flex-col h-full pt-10 min-h-[100px] items-center justify-center gap-4">
                  <img src="/icons/table-empty.svg" alt="" />
                  <div className="text-xs -mt-10 font-medium text-Text-Primary">
                    No biomarker added yet.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
