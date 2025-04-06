/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC } from 'react';

interface ChoosingDaysWeekProps {
  selectedDays: any;
  toggleDaySelection: (day: string) => void;
  ClassName?: string;
}

const ChoosingDaysWeek: FC<ChoosingDaysWeekProps> = ({
  selectedDays,
  toggleDaySelection,
  ClassName,
}) => {
  return (
    <div
      className={`w-[200px] lg:w-[244px] h-[32px] border rounded-[4px] text-xs bg-white border-Gray-50 inline-flex lg:ml-4 ${ClassName}`}
    >
      {['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'].map(
        (day, index, array) => (
          <div
            key={day}
            onClick={() => toggleDaySelection(day)}
            className={`w-full cursor-pointer flex items-center justify-center capitalize ${
              selectedDays.includes(day)
                ? 'text-Primary-EmeraldGreen'
                : 'text-Text-Primary'
            } ${index !== array.length - 1 ? 'border-r border-Gray-50' : ''}`}
          >
            {day}
          </div>
        ),
      )}
    </div>
  );
};

export default ChoosingDaysWeek;
