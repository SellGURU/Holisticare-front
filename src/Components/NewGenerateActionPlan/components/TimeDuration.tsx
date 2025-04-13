/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect, FC } from 'react';

interface TimeDurationProps {
  setDuration: (value: any) => void;
}

const TimeDuration: FC<TimeDurationProps> = ({ setDuration }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const options = [
    { label: '1 Month', value: 1 },
    { label: '2 Month', value: 2 },
    { label: '3 Month', value: 3 },
  ];

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full h-[48px] flex justify-between items-center px-4 bg-[#FDFDFD] rounded-[12px] border border-gray-50">
      <div className="flex items-center text-Primary-DeepTeal text-xs text-nowrap">
        <img src="/icons/timer.svg" alt="" className="mr-1" />
        Time Duration:
      </div>

      <div
        className="relative inline-block w-[177px] font-normal"
        ref={wrapperRef}
      >
        <div
          className="cursor-pointer bg-backgroundColor-Card border py-2 px-4 pr-3 rounded-2xl leading-tight text-[10px] text-Text-Primary flex justify-between items-center"
          onClick={() => setIsOpen(!isOpen)}
        >
          {options.find((opt) => opt.value === selected)?.label}
          <img
            className={`w-3 h-3 object-contain opacity-80 ml-2 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            src="/icons/arow-down-drop.svg"
            alt=""
          />
        </div>

        {isOpen && (
          <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-100 rounded-2xl shadow-sm text-[10px] text-Text-Primary">
            {options.map((opt) => (
              <li
                key={opt.value}
                className={`cursor-pointer px-4 py-2 hover:bg-gray-100 rounded-2xl ${
                  selected === opt.value ? 'bg-gray-50 font-semibold' : ''
                }`}
                onClick={() => {
                  setSelected(opt.value);
                  setIsOpen(false);
                  setDuration(opt.value);
                }}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TimeDuration;
