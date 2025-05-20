/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, ChangeEvent } from 'react';

interface TimerPickerProps {
  minutes: number;
  setMinutes: (value: any) => void;
  seconds: number;
  setSeconds: (value: any) => void;
}

const TimerPicker: FC<TimerPickerProps> = ({
  minutes,
  seconds,
  setMinutes,
  setSeconds,
}) => {
  const padTime = (num: number) => String(num).padStart(2, '0');

  const increment = (type: 'minutes' | 'seconds') => {
    if (type === 'minutes') setMinutes((prev: any) => (prev + 1) % 60);
    else setSeconds((prev: any) => (prev + 1) % 60);
  };

  const decrement = (type: 'minutes' | 'seconds') => {
    if (type === 'minutes') setMinutes((prev: any) => (prev - 1 + 60) % 60);
    else setSeconds((prev: any) => (prev - 1 + 60) % 60);
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    type: 'minutes' | 'seconds',
  ) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value)) value = 0;
    value = Math.min(59, Math.max(0, value));
    if (type === 'minutes') setMinutes(value);
    else setSeconds(value);
  };

  return (
    <div className="flex items-center gap-4 text-center">
      {/* Minutes */}
      <div className="flex flex-col items-center">
        <div className="text-[10px] text-Text-Quadruple mb-3">Minutes</div>
        <img
          src="/icons/arrow-up-new.svg"
          alt=""
          onClick={() => increment('minutes')}
          className="w-[24px] h-[16px] mb-1 cursor-pointer"
        />
        <input
          type="number"
          value={padTime(minutes)}
          onChange={(e) => handleInputChange(e, 'minutes')}
          className="border border-Gray-50 rounded-xl w-[70px] h-[40px] text-base font-medium text-center text-Text-Primary appearance-none no-spinners"
          min={0}
          max={59}
        />
        <img
          src="/icons/arrow-down-new.svg"
          alt=""
          onClick={() => decrement('minutes')}
          className="w-[24px] h-[16px] mt-1 cursor-pointer"
        />
      </div>

      {/* Separator */}
      <div className="text-sm text-Text-Primary -mb-6">:</div>

      {/* Seconds */}
      <div className="flex flex-col items-center">
        <div className="text-[10px] text-Text-Quadruple mb-3">Seconds</div>
        <img
          src="/icons/arrow-up-new.svg"
          alt=""
          onClick={() => increment('seconds')}
          className="w-[24px] h-[16px] mb-1 cursor-pointer"
        />
        <input
          type="number"
          value={padTime(seconds)}
          onChange={(e) => handleInputChange(e, 'seconds')}
          className="border border-Gray-50 rounded-xl w-[70px] h-[40px] text-base font-medium text-center text-Text-Primary appearance-none no-spinners"
          min={0}
          max={59}
        />
        <img
          src="/icons/arrow-down-new.svg"
          alt=""
          onClick={() => decrement('seconds')}
          className="w-[24px] h-[16px] mt-1 cursor-pointer"
        />
      </div>
    </div>
  );
};

export default TimerPicker;
