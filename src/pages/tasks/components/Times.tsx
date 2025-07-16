import { FC } from 'react';

const Times: FC<{ times: string[] }> = ({ times }) => {
  return (
    <div className="w-full p-3 rounded-xl border border-Gray-15 bg-backgroundColor-Secondary flex flex-col gap-2">
      <div className="text-xs font-medium text-Text-Primary">Time</div>
      <div className="text-Text-Quadruple text-xs leading-5">
        {times?.join(' & ')}
      </div>
    </div>
  );
};

export default Times;
