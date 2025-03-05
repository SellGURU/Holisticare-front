/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC } from 'react';

interface ScheduleModalContentProps {
  setShowModal: (value: boolean) => void;
  selectDays: Array<any>;
  setSelectDays: (value: any) => void;
}

const ScheduleModalContent: FC<ScheduleModalContentProps> = ({
  setShowModal,
  selectDays,
  setSelectDays,
}) => {
  const toggleCheckbox = (day: string) => {
    setSelectDays((prev: string[]) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };
  return (
    <>
      <div className="flex flex-col justify-between bg-white w-[446px] rounded-[20px] p-4">
        <div className="w-full h-full">
          <div className="flex justify-start items-center">
            <div className="text-Text-Primary font-medium">
              Schedule & Reminder
            </div>
          </div>
          <div className="w-full h-[1px] bg-Boarder my-3"></div>
          <div className="w-full mt-7">
            <div className="text-xs font-medium text-Text-Primary">
              Select days of the week:
            </div>
            <div className="flex items-center justify-between mt-2">
              {['mon', 'tue', 'wed', 'thur', 'fri', 'sat', 'sun'].map((day) => (
                <label
                  htmlFor={day}
                  className="flex items-center space-x-1 cursor-pointer mt-1.5"
                  key={day}
                >
                  <input
                    id={day}
                    type="checkbox"
                    checked={selectDays.includes(day)}
                    onChange={() => toggleCheckbox(day)}
                    className="hidden"
                  />
                  <div
                    className={`w-4 h-4 flex items-center justify-center rounded border-[0.5px] border-Text-Fivefold ${
                      selectDays.includes(day)
                        ? 'bg-Primary-DeepTeal'
                        : 'bg-white'
                    }`}
                  >
                    {selectDays.includes(day) && (
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
                  <div
                    className={`text-[10px] leading-6 ${
                      selectDays.includes(day)
                        ? 'text-Primary-DeepTeal'
                        : 'text-Text-Fivefold'
                    } select-none capitalize`}
                  >
                    {day}
                  </div>
                </label>
              ))}
            </div>
            <div className="flex flex-col mt-6">
              <div className="text-xs font-medium text-Text-Primary">
                Enter a time:
              </div>
              <input
                placeholder="Enter a Time ..."
                className="border border-Gray-50 w-[180px] py-1 px-3 rounded-2xl bg-backgroundColor-Card placeholder:text-Text-Fivefold text-xs font-light mt-2"
              />
            </div>
          </div>
        </div>
        <div className="w-full flex justify-end items-center p-2">
          <div
            className="text-Disable text-sm font-medium mr-4 cursor-pointer"
            onClick={() => {
              setShowModal(false);
            }}
          >
            Cancel
          </div>
          <div
            className={`${selectDays.length > 0 ? 'text-Primary-DeepTeal' : 'text-Text-Fivefold'} text-sm font-medium cursor-pointer`}
          >
            Set
          </div>
        </div>
      </div>
    </>
  );
};

export default ScheduleModalContent;
