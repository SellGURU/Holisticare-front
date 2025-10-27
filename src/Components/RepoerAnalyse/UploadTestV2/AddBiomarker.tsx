/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import TextField from '../../TextField';
import SimpleDatePicker from '../../SimpleDatePicker';
import TooltipTextAuto from '../../TooltipText/TooltipTextAuto';
import Select from '../../Select';
import Application from '../../../api/app';
import Circleloader from '../../CircleLoader';
import { Tooltip } from 'react-tooltip';
import SearchSelect from '../../searchableSelect';

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
  rowErrors?: any;
}

export const AddBiomarker: React.FC<AddBiomarkerProps> = ({
  biomarkers,
  rowErrors,
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
  const [avalibaleBiomarkers, setAvalibaleBiomarkers] = useState<any[]>([]);
  const handleAdd = () => {
    if (!biomarkerName || !value) return; // only biomarker + value are required
    if (unitsList.length > 0 && !unit) return; // if units exist, user must select one
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
        const sorted = [...res.data.biomarkers_list].sort((a: any, b: any) =>
          a.localeCompare(b),
        );
        setAvalibaleBiomarkers(sorted);
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
          const cleanedUnits = (res.data.units || []).filter(
            (u: string) => u.trim() !== '',
          );
          setUnitsList(cleanedUnits);
          setloading(false);
        })
        .catch(() => {});
    }
  }, [biomarkerName]);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tableRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
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
  const TEXT_ONLY_BIOMARKERS = [
    'Color',
    'Appearance',
    'Ketones',
    'Blood (Hemoglobin)',
    'Bilirubin, Urea',
    'Nitrite',
    'Crystals',
    'Bacteria',
    'Casts /h.p.f',
    'Mucus',
    'Yeast',
  ];
  const isTextOnly = TEXT_ONLY_BIOMARKERS.includes(biomarkerName);

  return (
    <div
      style={{ height: window.innerHeight - 235 + 'px' }}
      className="w-full rounded-2xl border p-2 md:p-4 border-Gray-50 shadow-200 mt-4 "
    >
      {loading && (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-85 z-20">
          <Circleloader></Circleloader>
        </div>
      )}
      <div className="w-full flex items-center justify-between">
        <div className="md:text-sm text-[12px] font-medium flex gap-1 items-center text-Text-Primary">
          List of Biomarkers
        <span className="text-[#B0B0B0] text-[8px] md:text-xs font-medium">({biomarkers.length})</span>
        </div>

        <div className="flex items-center text-[10px] md:text-xs text-Text-Quadruple">
          Date of Test:
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
        className="w-full  flex flex-col md:flex-row md:justify-between gap-4 mt-6"
      >
        {/* Left side: Add biomarker form */}
        <div className="rounded-2xl  w-full md:w-[50%] border border-Gray-50 px-6 py-4 bg-white shadow-100 flex flex-col gap-[12px] overflow-auto p">
          <div className="text-xs text-Text-Primary text-justify">
            Add a biomarker by filling in its details (Name, Value, Unit) and
            clicking Add Biomarker. You’ll see it added right away in the
            client’s list on the right. You can also select the test date from
            the top of the grid.
          </div>

          {/* Biomarker Name */}
          <div className="flex flex-col text-xs font-medium text-Text-Primary gap-2 w-full">
            Biomarker Name
            <SearchSelect
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
            />
            {/* <Select
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
            ></Select> */}
            {/* <TextField
              newStyle
              type="text"
              value={biomarkerName}
              onChange={(e: any) => setBiomarkerName(e.target.value)}
            /> */}
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
          {/* Value */}
          <div className="flex flex-col text-xs font-medium text-Text-Primary gap-2 w-full">
            Value
            <TextField
              placeholder="-"
              newStyle
              type={isTextOnly ? 'text' : 'number'}
              value={value}
              onChange={(e: any) => {
                const val = e.target.value;

                if (isTextOnly) {
                  // Only allow letters, spaces, and basic punctuation (no digits)
                  const textOnly = val.replace(/[0-9]/g, '');
                  setValue(textOnly);
                } else {
                  // Only allow numbers (and optionally a decimal point)
                  const numOnly = val.replace(/[^0-9.]/g, '');
                  setValue(numOnly);
                }
              }}
            />
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
          ref={tableRef}
          className={`w-full border-Gray-50 overflow-x-auto  hidden-scrollbar   ${biomarkers.length === 0 && 'overflow-hidden '} pr-1`}
        >
          <div className="w-full border border-Gray-50 min-w-[700px]    rounded-[20px] h-full text-xs">
            {/* Table Header */}
            <div
              className="grid sticky top-0 w-full z-10 py-2 px-4 font-medium text-Text-Primary text-[8px] md:text-xs bg-[#E9F0F2] border-b rounded-t-[12px] border-Gray-50"
              style={{ gridTemplateColumns: '1fr 200px 200px 100px' }}
            >
              <div className="text-left">Biomarker Name</div>
              <div className="text-center">Value</div>
              <div className="text-center">Unit</div>
              <div className="text-right">Action</div>
            </div>

            {/* Table Rows */}
            <div
              // style={{ height: window.innerHeight - 550 + 'px' }}
              className="w-full md:h-[calc(100vh-550px)]  "
            >
              {biomarkers.map((biomarker, index) => {
                const errorForRow = rowErrors[index];

                return (
                  <div
                    ref={(el) => (rowRefs.current[index] = el)}
                    key={index}
                    className={`grid py-2 px-4 border-b border-Gray-50 items-center text-[8px] md:text-xs text-Text-Primary ${
                      index % 2 === 0 ? 'bg-white' : 'bg-backgroundColor-Main'
                    }`}
                    style={{ gridTemplateColumns: '1fr 200px 200px 100px' }}
                  >
                    {/* Biomarker Name */}
                    <div className="flex items-center  gap-1">
                      <TooltipTextAuto maxWidth="250px">
                        {biomarker.biomarker}
                      </TooltipTextAuto>
                      {errorForRow && (
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
                      )}
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
                );
              })}

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
