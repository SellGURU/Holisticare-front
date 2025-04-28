/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef } from 'react';
import { ButtonPrimary } from '../Button/ButtonPrimary';
// import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import SimpleDatePicker from '../SimpleDatePicker';
// import useModalAutoClose from '../../hooks/UseModalAutoClose';
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

  const handleApply = () => {
    onApplyFilters({ gender, status, enrollDate });
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
      className="absolute right-0 xs:right-7 sm:top-[200px] md:top-10 md:right-0 w-[250px] xs:w-[330px] md:w-[490px] bg-white rounded-[16px] shadow-800  md:p-4 p-2  z-50 text-Text-Primary"
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
        <div className="w-full flex flex-col md:flex-row items-start gap-[15px] md:gap-[41px]  ">
          <h3 className=" text-[10px] md:text-xs font-medium ">Gender</h3>
          <div className="flex gap-5 md:gap-[48px]">
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
                className={`w-4 h-4 flex items-center justify-center rounded  border border-Primary-DeepTeal  ${
                  gender.male ? 'bg-Primary-DeepTeal' : 'bg-white'
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
                className={`w-4 h-4 flex items-center justify-center rounded  border border-Primary-DeepTeal  ${
                  gender.female ? 'bg-Primary-DeepTeal' : 'bg-white'
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
        <div className="w-full flex flex-col md:flex-row items-start gap-[15px] md:gap-12">
          <h3 className="text-xs font-medium">Status</h3>
          <div className="flex w-full  gap-4 md:gap-0 justify-between text-nowrap">
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
                className={`w-4 h-4 flex items-center justify-center rounded  border border-Primary-DeepTeal  ${
                  status.checked ? 'bg-Primary-DeepTeal' : 'bg-white'
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
              <div className="px-2.5 py-[2px] rounded-full bg-[#DEF7EC] text-[10px]">
                Checked
              </div>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
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
                className={`w-4 h-4 flex items-center justify-center rounded  border border-Primary-DeepTeal  ${
                  status['needs check'] ? 'bg-Primary-DeepTeal' : 'bg-white'
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
              <div className="px-2.5 py-[2px] rounded-full bg-[#F9DEDC] text-[10px]">
                Needs Check
              </div>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
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
                className={`w-4 h-4 flex items-center justify-center rounded  border border-Primary-DeepTeal  ${
                  status['incomplete data'] ? 'bg-Primary-DeepTeal' : 'bg-white'
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
              <div className="px-2.5 py-[2px] rounded-full bg-[#FFD8E4] text-[10px]">
                Incomplete Data
              </div>
            </label>
          </div>
        </div>

        {/* Enroll Date Section */}
        <div className=" w-full flex flex-col md:flex-row items-start md:items-center gap-[15px] md:gap-7">
          <h3 className="text-xs font-medium  text-nowrap">Enroll Date</h3>
          <div className="w-full flex justify-between  gap-3">
            {/* <div className="relative"> */}
            {/* <DatePicker
                selected={enrollDate.from}
                onChange={(date) =>
                  setEnrollDate({ ...enrollDate, from: date })
                }
                customInput={
                  <button className=" w-[110px] xs:w-[145px] sm:w-[133px] rounded-md px-2 py-1 bg-backgroundColor-Card border border-Gray-50 flex items-center justify-between text-[10px] text-Text-Secondary">
                    From {formatDate(enrollDate.from)}{' '}
                    <img src="/icons/calendar-3.svg" alt="" />
                  </button>
                }
              /> */}
            <SimpleDatePicker
              date={enrollDate.from}
              setDate={(date) => setEnrollDate({ ...enrollDate, from: date })}
              placeholder="From"
            />
            {/* </div> */}

            {/* <div className="relative"> */}
            {/* <DatePicker
                selected={enrollDate.to}
                onChange={(date) => setEnrollDate({ ...enrollDate, to: date })}
                customInput={
                  <button className=" w-[110px] xs:w-[145px] sm:w-[133px] rounded-md px-2 py-1 bg-backgroundColor-Card border border-Gray-50 flex items-center justify-between text-[10px] text-Text-Secondary">
                    To {formatDate(enrollDate.to)}{' '}
                    <img src="/icons/calendar-3.svg" alt="" />
                  </button>
                }
              /> */}
            <SimpleDatePicker
              date={enrollDate.to}
              setDate={(date) => setEnrollDate({ ...enrollDate, to: date })}
              placeholder="To"
            />
            {/* </div> */}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className=" w-full flex justify-center  gap-3 items-center ">
          <ButtonPrimary
            style={{
              color: '#005F73',
              backgroundColor: '#FDFDFD',
              width: '100%',
            }}
            ClassName="shadow-Btn"
            onClick={handleClear}
          >
            Clear all
          </ButtonPrimary>
          {/* <button
            onClick={handleClear}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-Primary-DeepTeal"
          >
            Clear
          </button> */}
          <ButtonPrimary
            style={{ width: '100%' }}
            ClassName="text-nowrap"
            onClick={handleApply}
          >
            <img src="/icons/tick-square.svg" alt="" />
            Apply Filters
          </ButtonPrimary>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
