/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC } from 'react';

interface ChoosingDaysWeekProps {
  selectedDays: any;
  toggleDaySelection: (day: string) => void;
  ClassName?: string;
}

const ChoosingDaysWeek: FC<ChoosingDaysWeekProps> = ({
  selectedDays,
  // toggleDaySelection,
  ClassName,
}) => {
  console.log(selectedDays);

  return (
    <div
      className={`border rounded-[4px] text-xs bg-white border-Gray-50 inline-flex lg:ml-4 ${ClassName}`}
      style={{
        width: '200px',
        height: '32px',
        borderRadius: '4px',
        paddingBottom: '4px',
      }}
    >
      {selectedDays.map((day: string, index: number) => (
        <div
          key={day}
          // onClick={() => toggleDaySelection(day)}

          className={`w-full bg-383838 cursor-pointer flex items-center justify-center capitalize  ${index !== selectedDays.length - 1 ? 'border-r border-Gray-50' : ''} `}
        >
          {day}
        </div>
      ))}
      {/* {['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'].map(
        (day, index, array) => (
          <div
            key={day}
            // onClick={() => toggleDaySelection(day)}
            style={{
              color: selectedDays.includes(day) ? '#6CC24A' : '#383838',
            }}
            className={`w-full cursor-pointer flex items-center justify-center capitalize  ${index !== array.length - 1 ? 'border-r border-Gray-50' : ''}`}
          >
            {day}
          </div>
        ),
      )} */}
    </div>
  );
};

export default ChoosingDaysWeek;
