/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from 'react';

interface ScheduleModalContentProps {
  setShowModal: (value: boolean) => void;
  selectDays: Array<any>;
  setSelectDays: (value: any) => void;
  setDuration: (value: string) => void;
  setEarlier: (value: number) => void;
  time: string;
  setTime: (value: string) => void;
  earlier: number;
  duration: string;
  setCheckInLists: (value: any) => void;
  checkInListEditValue: any;
}

const ScheduleModalContent: FC<ScheduleModalContentProps> = ({
  setShowModal,
  selectDays,
  setSelectDays,
  setDuration,
  setEarlier,
  setTime,
  time,
  duration,
  earlier,
  setCheckInLists,
  checkInListEditValue,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenEarlier, setIsOpenEarlier] = useState(false);

  const toggleCheckbox = (day: string) => {
    setSelectDays((prev: string[]) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };
  useEffect(() => {
    if (checkInListEditValue?.reminder) {
      setTime(checkInListEditValue?.reminder.time);
      setSelectDays(checkInListEditValue?.reminder.selectDays);
      setEarlier(checkInListEditValue?.reminder.earlier);
      setDuration(checkInListEditValue?.reminder.duration);
    } else {
      setTime('');
      setSelectDays([]);
      setEarlier(30);
      setDuration('Am');
    }
  }, []);
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
              <div className="flex items-center mt-2 gap-2">
                <input
                  placeholder="Enter a Time ..."
                  className="border border-Gray-50 w-[180px] py-1 px-3 rounded-2xl bg-backgroundColor-Card placeholder:text-Text-Fivefold text-xs font-light"
                  value={time}
                  onChange={(e) => {
                    setTime(e.target.value);
                  }}
                  type="text"
                />
                <div className="relative inline-block w-[80px] font-normal">
                  <select
                    onClick={() => setIsOpen(!isOpen)}
                    onBlur={() => setIsOpen(false)}
                    onChange={(e) => {
                      setIsOpen(false);
                      setDuration(e.target.value);
                    }}
                    className="block appearance-none w-full bg-backgroundColor-Card border py-2 px-4 pr-8 rounded-2xl leading-tight focus:outline-none text-[10px] text-Text-Primary"
                  >
                    <option value="Am">Am</option>
                    <option value="Pm">Pm</option>
                  </select>
                  <img
                    className={`w-3 h-3 object-contain opacity-80 absolute top-2.5 right-2.5 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    src="/icons/arow-down-drop.svg"
                    alt=""
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col mt-6 mb-6">
              <div className="text-xs font-medium text-Text-Primary">
                When to send reminder:
              </div>
              <div className="relative inline-block w-full font-normal mt-2">
                <select
                  onClick={() => setIsOpenEarlier(!isOpenEarlier)}
                  onBlur={() => setIsOpenEarlier(false)}
                  onChange={(e) => {
                    setIsOpenEarlier(false);
                    setEarlier(parseInt(e.target.value));
                  }}
                  className="block appearance-none w-full bg-backgroundColor-Card border py-2 px-4 pr-8 rounded-2xl leading-tight focus:outline-none text-[10px] text-Text-Primary"
                >
                  <option value={30}>30 min earlier</option>
                  <option value={60}>60 min earlier</option>
                </select>
                <img
                  className={`w-3 h-3 object-contain opacity-80 absolute top-2.5 right-2.5 transition-transform duration-200 ${
                    isOpenEarlier ? 'rotate-180' : ''
                  }`}
                  src="/icons/arow-down-drop.svg"
                  alt=""
                />
              </div>
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
            className={`${selectDays.length > 0 && time ? 'text-Primary-DeepTeal' : 'text-Text-Fivefold'} text-sm font-medium cursor-pointer`}
            onClick={() => {
              if (selectDays.length > 0 && time) {
                setCheckInLists((prev: any) =>
                  prev.map((item: any) =>
                    item.no === checkInListEditValue.no
                      ? {
                          ...item,
                          reminder: {
                            time: time,
                            duration: duration,
                            earlier: earlier,
                            selectDays: selectDays,
                          },
                        }
                      : item,
                  ),
                );
              }
              setTime('');
              setDuration('Am');
              setEarlier(30);
              setSelectDays([]);
              setShowModal(false);
            }}
          >
            Set
          </div>
        </div>
      </div>
    </>
  );
};

export default ScheduleModalContent;
