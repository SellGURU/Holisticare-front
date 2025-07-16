import { FC } from 'react';

const BoxTitleText: FC<{ title: string; text: string }> = ({ title, text }) => {
  return (
    <div className="w-full p-3 rounded-xl border border-Gray-15 bg-backgroundColor-Secondary flex flex-col gap-1">
      <div className="text-xs font-medium text-Text-Primary">{title}</div>
      <div className="text-Text-Quadruple text-[10px] leading-5">{text}</div>
    </div>
  );
};

export default BoxTitleText;
