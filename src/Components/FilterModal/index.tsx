/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState } from 'react';
import { ButtonPrimary } from '../Button/ButtonPrimary';
// import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import SimpleDatePicker from '../SimpleDatePicker';
// import useModalAutoClose from '../../hooks/UseModalAutoClose';
import { Range } from 'react-range';
type GenderFilter = {
  male: boolean;
  female: boolean;
};

type StatusFilter = {
  checked: boolean;
  ['needs check']: boolean;
  ['incomplete data']: boolean;
};

type DateFilter = {
  from: Date | null;
  to: Date | null;
};
type Filters = {
  gender: GenderFilter;
  status: StatusFilter;
  enrollDate: DateFilter;
  driftAnalyzed: boolean | null;
  checkInForm: boolean | null;
  questionnaireForm: string | null;
  age: number[];
};

type FilterModalProps = {
  onApplyFilters: (filters: Filters) => void;
  onClearFilters: () => void;
  onClose: () => void;
  filters: any;
};
const FilterModal: React.FC<FilterModalProps> = ({
  onApplyFilters,
  onClearFilters,
  onClose,
  filters,
}) => {
  const [gender, setGender] = useState<GenderFilter>({
    male: filters.gender.male,
    female: filters.gender.female,
  });
  const [status, setStatus] = useState<StatusFilter>({
    checked: filters.status.checked,
    'needs check': filters.status['needs check'],
    'incomplete data': filters.status['incomplete data'],
  });
  const [enrollDate, setEnrollDate] = useState<DateFilter>({
    from: filters.enrollDate.from,
    to: filters.enrollDate.to,
  });
  const [driftAnalyzed, setDriftAnalyzed] = useState<boolean | null>(
    filters.driftAnalyzed,
  );
  const [checkInForm, setCheckInForm] = useState<boolean | null>(
    filters.checkInForm,
  );
  const [questionnaireForm, setQuestionnaireForm] = useState<string | null>(
    filters.questionnaireForm,
  );
  const MIN = 18;
  const MAX = 100;
  const [age, setAge] = useState(filters.age);
  const [enrollDateError, setEnrollDateError] = useState('');
  const handleFromChange = (date: any) => {
    setEnrollDate((prev) => {
      const updated = { ...prev, from: date };
      if (updated.to && new Date(updated.to) < new Date(date)) {
        setEnrollDateError('End date cannot be earlier than start date.');
      } else {
        setEnrollDateError('');
      }
      return updated;
    });
  };

  const handleToChange = (date: any) => {
    setEnrollDate((prev) => {
      const updated = { ...prev, to: date };
      if (updated.from && new Date(date) < new Date(updated.from)) {
        setEnrollDateError('End date cannot be earlier than start date.');
      } else {
        setEnrollDateError('');
      }
      return updated;
    });
  };

  const handleApply = () => {
    if (enrollDateError.length > 0) {
      return;
    }
    onApplyFilters({
      gender,
      status,
      enrollDate,
      driftAnalyzed,
      checkInForm,
      questionnaireForm,
      age,
    });
    onClose();
  };

  const handleClear = () => {
    setGender({ male: false, female: false });
    setStatus({
      checked: false,
      'needs check': false,
      'incomplete data': false,
    });
    setEnrollDate({ from: null, to: null });
    setDriftAnalyzed(null);
    setCheckInForm(null);
    setQuestionnaireForm(null);
    setAge([MIN, MAX]);

    onClearFilters();
    onClose();
  };

  // const formatDate = (date: Date | null) => {
  //   if (!date) return '';
  //   const options: Intl.DateTimeFormatOptions = {
  //     year: 'numeric',
  //     month: 'short',
  //     day: 'numeric',
  //   };
  //   return date.toLocaleDateString(undefined, options);
  // };
  const modalRef = useRef<HTMLDivElement | null>(null);

  // useModalAutoClose({
  //   refrence: modalRef,
  //   close: onClose,
  // });

  return (
    <div
      ref={modalRef}
      className="absolute right-5 top-8 xs:right-3  sm:top-[200px] md:top-10 md:right-0 w-[300px] xs:w-[330px] md:w-[540px] bg-white rounded-[16px] shadow-800  md:p-4 p-2  z-50 text-Text-Primary"
    >
      <div className="space-y-6">
        {/* Header */}
        {/* <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
          <button 
            onClick={handleClear}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear all
          </button>
        </div> */}

        {/* Gender Section */}
        {/* checked={gender.male}
                onChange={(e) => setGender({ ...gender, male: e.target.checked })} */}
        <div className="w-full flex flex-col md:flex-row items-start gap-[15px] md:gap-[81px]">
          <h3 className=" text-[10px] md:text-xs font-medium ">Gender</h3>
          <div className="flex gap-3 md:gap-[25px]">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={gender.male}
                onChange={(e) =>
                  setGender({ ...gender, male: e.target.checked })
                }
                className="hidden"
              />
              <div
                className={`w-4 h-4 flex items-center justify-center rounded ${
                  gender.male
                    ? 'bg-Primary-DeepTeal'
                    : 'bg-white border border-Text-Quadruple'
                }`}
              >
                {gender.male && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <span className="text-[10px] md:text-xs text-Text-Secondary">
                Male
              </span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={gender.female}
                onChange={(e) =>
                  setGender({ ...gender, female: e.target.checked })
                }
                className="hidden"
              />
              <div
                className={`w-4 h-4 flex items-center justify-center rounded  ${
                  gender.female
                    ? 'bg-Primary-DeepTeal'
                    : 'bg-white border border-Text-Quadruple'
                }`}
              >
                {gender.female && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <span className="text-xs text-Text-Secondary">Female</span>
            </label>
          </div>
        </div>

        {/* Status Section */}
        <div className="w-full flex flex-col md:flex-row items-start gap-[15px] md:gap-[87px]">
          <h3 className="text-xs font-medium">Status</h3>
          <div className="flex flex-wrap w-full gap-4 md:gap-0 justify-between text-nowrap">
            <label className="flex  items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="checked"
                checked={status.checked}
                onChange={(e) =>
                  setStatus({ ...status, checked: e.target.checked })
                }
                className="hidden"
              />
              <div
                className={`w-4 h-4 flex items-center justify-center rounded ${
                  status.checked
                    ? 'bg-Primary-DeepTeal'
                    : 'bg-white border border-Text-Quadruple'
                }`}
              >
                {status.checked && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="px-2.5 py-[2px] rounded-full bg-[#DEF7EC] text-[10px] text-Text-Primary flex items-center gap-1">
                <div className="rounded-lg w-2 h-2 bg-[#06C78D]"></div>
                Checked
              </div>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="critical"
                checked={status['incomplete data']}
                onChange={(e) =>
                  setStatus({ ...status, 'incomplete data': e.target.checked })
                }
                className="hidden"
              />
              <div
                className={`w-4 h-4 flex items-center justify-center rounded ${
                  status['incomplete data']
                    ? 'bg-Primary-DeepTeal'
                    : 'bg-white border border-Text-Quadruple'
                }`}
              >
                {status['incomplete data'] && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="px-2.5 py-[2px] rounded-full bg-[#F9DEDC] text-[10px] text-Text-Primary flex items-center gap-1">
                <div className="rounded-lg w-2 h-2 bg-[#FFAB2C]"></div>
                Incomplete Data
              </div>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="atRisk"
                checked={status['needs check']}
                onChange={(e) =>
                  setStatus({ ...status, 'needs check': e.target.checked })
                }
                className="hidden"
              />
              <div
                className={`w-4 h-4 flex items-center justify-center rounded ${
                  status['needs check']
                    ? 'bg-Primary-DeepTeal'
                    : 'bg-white border border-Text-Quadruple'
                }`}
              >
                {status['needs check'] && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="px-2.5 py-[2px] rounded-full bg-[#FFD8E4] text-[10px] text-Text-Primary flex items-center gap-1">
                <div className="rounded-lg w-2 h-2 bg-[#FC5474]"></div>
                Needs Check
              </div>
            </label>
          </div>
        </div>

        <div className="w-full flex flex-col md:flex-row items-start gap-[15px] md:gap-[42px]">
          <h3 className=" text-[10px] md:text-xs font-medium ">
            Drift Analyzed
          </h3>
          <div className="flex gap-3 md:gap-[34px]">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={driftAnalyzed === true}
                onChange={() =>
                  setDriftAnalyzed(driftAnalyzed === true ? null : true)
                }
                className="hidden"
              />
              <div
                className={`w-4 h-4 flex items-center justify-center rounded ${
                  driftAnalyzed === true
                    ? 'bg-Primary-DeepTeal'
                    : 'bg-white border border-Text-Quadruple'
                }`}
              >
                {driftAnalyzed === true && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <span className="text-[10px] md:text-xs text-Text-Secondary">
                Yes
              </span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={driftAnalyzed === false}
                onChange={() =>
                  setDriftAnalyzed(driftAnalyzed === false ? null : false)
                }
                className="hidden"
              />
              <div
                className={`w-4 h-4 flex items-center justify-center rounded  ${
                  driftAnalyzed === false
                    ? 'bg-Primary-DeepTeal'
                    : 'bg-white border border-Text-Quadruple'
                }`}
              >
                {driftAnalyzed === false && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <span className="text-xs text-Text-Secondary">No</span>
            </label>
          </div>
        </div>

        <div className="w-full flex flex-col md:flex-row items-start gap-[15px] md:gap-[39px]">
          <h3 className=" text-[10px] md:text-xs font-medium ">
            Check-in Form
          </h3>
          <div className="flex gap-3 md:gap-[10px]">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={checkInForm === false}
                onChange={() =>
                  setCheckInForm(checkInForm === false ? null : false)
                }
                className="hidden"
              />
              <div
                className={`w-4 h-4 flex items-center justify-center rounded ${
                  checkInForm === false
                    ? 'bg-Primary-DeepTeal'
                    : 'bg-white border border-Text-Quadruple'
                }`}
              >
                {checkInForm === false && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <span className="text-[10px] md:text-xs text-Text-Secondary">
                None Assigned
              </span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={checkInForm === true}
                onChange={() =>
                  setCheckInForm(checkInForm === true ? null : true)
                }
                className="hidden"
              />
              <div
                className={`w-4 h-4 flex items-center justify-center rounded  ${
                  checkInForm === true
                    ? 'bg-Primary-DeepTeal'
                    : 'bg-white border border-Text-Quadruple'
                }`}
              >
                {checkInForm === true && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <span className="text-xs text-Text-Secondary">Assigned</span>
            </label>
          </div>
        </div>

        <div className="w-full flex flex-col md:flex-row items-start gap-[15px] md:gap-[10px]">
          <h3 className=" text-[10px] md:text-xs font-medium ">
            Questionnaire Form
          </h3>
          <div className="flex flex-wrap gap-4 md:gap-[11px]">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={questionnaireForm === 'None Assigned'}
                onChange={() =>
                  setQuestionnaireForm(
                    questionnaireForm === 'None Assigned'
                      ? null
                      : 'None Assigned',
                  )
                }
                className="hidden"
              />
              <div
                className={`w-4 h-4 flex items-center justify-center rounded ${
                  questionnaireForm === 'None Assigned'
                    ? 'bg-Primary-DeepTeal'
                    : 'bg-white border border-Text-Quadruple'
                }`}
              >
                {questionnaireForm === 'None Assigned' && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <span className="text-[10px] md:text-xs text-Text-Secondary">
                None Assigned
              </span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={questionnaireForm === 'Assigned'}
                onChange={() =>
                  setQuestionnaireForm(
                    questionnaireForm === 'Assigned' ? null : 'Assigned',
                  )
                }
                className="hidden"
              />
              <div
                className={`w-4 h-4 flex items-center justify-center rounded  ${
                  questionnaireForm === 'Assigned'
                    ? 'bg-Primary-DeepTeal'
                    : 'bg-white border border-Text-Quadruple'
                }`}
              >
                {questionnaireForm === 'Assigned' && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <span className="text-xs text-Text-Secondary">Assigned</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={questionnaireForm === 'Filled out by coach'}
                onChange={() =>
                  setQuestionnaireForm(
                    questionnaireForm === 'Filled out by coach'
                      ? null
                      : 'Filled out by coach',
                  )
                }
                className="hidden"
              />
              <div
                className={`w-4 h-4 flex items-center justify-center rounded  ${
                  questionnaireForm === 'Filled out by coach'
                    ? 'bg-Primary-DeepTeal'
                    : 'bg-white border border-Text-Quadruple'
                }`}
              >
                {questionnaireForm === 'Filled out by coach' && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <span className="text-xs text-Text-Secondary">
                Filled out by coach
              </span>
            </label>
          </div>
        </div>

        <div className="w-full max-w-lg flex flex-col px-2 md:px-0 md:flex-row items-start gap-[15px] md:gap-[113px]">
          <h3 className=" text-[10px] md:text-xs font-medium ">Age</h3>
          <div className=" w-full  md:w-[70%] flex flex-col items-center gap-1">
            <div className="text-Text-Quadruple text-xs">
              between ({age[0]} - {age[1]})
            </div>
            <Range
              values={age}
              step={1}
              min={MIN}
              max={MAX}
              onChange={(vals) => setAge(vals)}
              renderTrack={({ props, children }) => (
                <div
                  {...props}
                  className="h-1 w-full rounded-full bg-[#E9F0F2] relative"
                >
                  <div
                    className="absolute h-full rounded-full bg-[#005F73]"
                    style={{
                      left: `${((age[0] - MIN) / (MAX - MIN)) * 100}%`,
                      width: `${((age[1] - age[0]) / (MAX - MIN)) * 100}%`,
                    }}
                  />
                  {children}
                </div>
              )}
              renderThumb={({ props }) => (
                <div
                  {...props}
                  className="h-2.5 w-2.5 rounded-full bg-[#005F73] shadow-md"
                />
              )}
            />
          </div>
        </div>

        {/* Enroll Date Section */}
        <div className="w-full flex flex-col">
          <div className=" w-full flex flex-col md:flex-row items-start md:items-center gap-[15px] md:gap-[73px]">
            <h3 className="text-xs font-medium  text-nowrap">Enroll Date</h3>
            <div className="w-full flex gap-3">
              <SimpleDatePicker
                date={enrollDate.from}
                setDate={handleFromChange}
                placeholder="Start date"
                ClassName="  md:!w-[173px]"
              />
              <SimpleDatePicker
                date={enrollDate.to}
                setDate={handleToChange}
                placeholder="End date"
                ClassName="  md:!w-[173px]"
              />
            </div>
          </div>
          {enrollDateError && (
            <div className="text-[10px] font-medium text-Red mt-2">
              {enrollDateError}
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className=" w-full flex justify-center  gap-3 items-center ">
          <ButtonPrimary
            style={{
              color: '#005F73',
              backgroundColor: '#FDFDFD',
              width: '100%',
              border: '1px solid #005F73',
              height: '32px',
            }}
            ClassName="shadow-Btn"
            onClick={handleClear}
          >
            <img className='size-4' src="/icons/close.svg" alt="" />
            Clear All
          </ButtonPrimary>
          {/* <button
            onClick={handleClear}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-Primary-DeepTeal"
          >
            Clear
          </button> */}
          <ButtonPrimary
            style={{ width: '100%', border: '1px solid #FFF' }}
            ClassName="text-nowrap"
            onClick={handleApply}
          >
            <img src="/icons/tick-square.svg" alt="" />
            Apply Filter
          </ButtonPrimary>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
