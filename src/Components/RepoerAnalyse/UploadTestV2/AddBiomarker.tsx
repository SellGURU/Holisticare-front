/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import TextField from '../../TextField';
import SimpleDatePicker from '../../SimpleDatePicker';
import TooltipTextAuto from '../../TooltipText/TooltipTextAuto';
import Select from '../../Select';
import Application from '../../../api/app';
import Circleloader from '../../CircleLoader';

// Define the props for the AddBiomarker component, now using 'biomarker' instead of 'name'
interface AddBiomarkerProps {
  biomarkers: { biomarker: string; value: string; unit: string }[];
  onAddBiomarker: (biomarker: {
    biomarker: string;
    value: string;
    unit: string;
  }) => void;
  onTrashClick: (index: number) => void;
  onConfirm: (index: number) => void;
  onCancel: () => void;
  deleteIndex: number | null;
  dateOfTest: Date | null;
  setDateOfTest: (date: Date | null) => void;
}

export const AddBiomarker: React.FC<AddBiomarkerProps> = ({
  biomarkers,
  onAddBiomarker,
  onTrashClick,
  onConfirm,
  onCancel,
  deleteIndex,
  dateOfTest,
  setDateOfTest,
}) => {
  // Local form states, now using 'biomarkerName' to avoid conflict
  const [biomarkerName, setBiomarkerName] = useState('');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('');
  const [unitsList, setUnitsList] = useState([]);
  const [avalibaleBiomarkers, setAvalibaleBiomarkers] = useState([]);
  const handleAdd = () => {
    if (!biomarkerName || !value || !unit) return; // prevent empty adds
    onAddBiomarker({ biomarker: biomarkerName, value, unit });
    setBiomarkerName('');
    setValue('');
    setUnit('');
  };
  const [loading, setloading] = useState(false);
  useEffect(() => {
    setloading(true);
    Application.getBiomarkerName({})
      .then((res) => {
        setAvalibaleBiomarkers(res.data.biomarkers_list);
        setloading(false);
      })
      .catch(() => {});
  }, []);
  useEffect(() => {
    if (biomarkerName) {
      setloading(true);
      Application.getBiomarkerUnit({
        biomarker_name: biomarkerName,
      })
        .then((res) => {
          setUnitsList(res.data.units);
          setloading(false);
        })
        .catch(() => {});
    }
  }, [biomarkerName]);
  return (
    <div
      style={{ height: window.innerHeight - 235 + 'px' }}
      className="w-full rounded-2xl border p-4 border-Gray-50 shadow-200 mt-4 "
    >
      {loading && (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-85 z-20">
          <Circleloader></Circleloader>
        </div>
      )}
      <div className="w-full flex items-center justify-between">
        <div className="text-sm font-medium text-Text-Primary">
          List of Biomarkers
        </div>

        <div className="flex items-center text-xs text-Text-Quadruple">
          Date of Test
          <SimpleDatePicker
            isUploadFile
            date={dateOfTest}
            setDate={setDateOfTest}
            placeholder="Select Date"
            ClassName="ml-2 border border-Gray-50 !rounded-2xl px-2 py-1 text-Text-Primary"
          />
        </div>
      </div>

      <div
        style={{ height: window.innerHeight - 330 + 'px' }}
        className="w-full flex justify-between gap-4 mt-6"
      >
        {/* Left side: Add biomarker form */}
        <div className="rounded-2xl  w-[50%] border border-Gray-50 px-6 py-4 bg-white shadow-100 flex flex-col gap-[12px]">
          <div className="text-xs text-Text-Primary text-justify">
            Add a biomarker by filling in its details (Name, Value, Unit) and
            clicking Add Biomarker. You’ll see it added right away in the
            client’s list on the right. You can also select the test date from
            the top of the grid.
          </div>

          {/* Biomarker Name */}
          <div className="flex flex-col text-xs font-medium text-Text-Primary gap-2 w-full">
            Biomarker Name
            <Select
              isSetting
              isLarge
              isStaff
              placeholder="-"
              options={avalibaleBiomarkers}
              value={biomarkerName}
              onChange={(value: string) => {
                setUnit('');
                setBiomarkerName(value);
              }}
            ></Select>
            {/* <TextField
              newStyle
              type="text"
              value={biomarkerName}
              onChange={(e: any) => setBiomarkerName(e.target.value)}
            /> */}
          </div>

          {/* Value */}
          <div className="flex flex-col text-xs font-medium text-Text-Primary gap-2 w-full">
            Value
            <TextField
              placeholder="-"
              newStyle
              type="number"
              value={value}
              onChange={(e: any) => setValue(e.target.value)}
            />
          </div>

          {/* Unit */}
          <div className="flex flex-col text-xs font-medium text-Text-Primary gap-2 w-full">
            Unit
            <Select
              isSetting
              isLarge
              options={unitsList}
              value={unit}
              isStaff
              placeholder="-"
              onChange={(value: string) => setUnit(value)}
            ></Select>
            {/* <TextField
              newStyle
              type="text"
              value={unit}
              onChange={(e: any) => setUnit(e.target.value)}
            /> */}
          </div>

          {/* Add button */}
          <div
            onClick={handleAdd}
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
              style={{ gridTemplateColumns: '1fr 200px 200px 100px' }}
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
                  style={{ gridTemplateColumns: '1fr 200px 200px 100px' }}
                >
                  {/* Biomarker Name */}
                  <div>
                    <TooltipTextAuto maxWidth="250px">
                      {biomarker.biomarker}
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
                          onClick={() => onConfirm(index)}
                        />
                        <img
                          src="/icons/close-circle-red.svg"
                          alt="Cancel"
                          className="w-[16px] h-[16px] cursor-pointer"
                          onClick={() => onCancel()}
                        />
                      </div>
                    ) : (
                      <div className="w-[47px] pl-5">
                        <img
                          src="/icons/trash-blue.svg"
                          alt="Delete"
                          className="cursor-pointer w-4 h-4"
                          onClick={() => onTrashClick(index)}
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
