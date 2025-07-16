import { FC } from 'react';

const BoxTexts: FC<{ texts: string[] }> = ({ texts }) => {
  return (
    <div className="w-full p-3 rounded-xl border border-Gray-15 bg-backgroundColor-Secondary flex gap-1">
      {texts.map((text, index) => (
        <div
          key={index}
          className="flex items-center justify-center rounded-2xl px-2 bg-bg-color text-Primary-DeepTeal text-[10px]"
        >
          {text}
        </div>
      ))}
    </div>
  );
};

export default BoxTexts;
