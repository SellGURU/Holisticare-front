import React, { useState } from 'react';
import SvgIcon from '../../utils/svgIcon';
interface AlertModalProps {
  onClose: () => void;
  heading: string;
  texts: string[];
}
export const AlertModal: React.FC<AlertModalProps> = ({
  onClose,
  heading,
  texts,
}) => {
  const [index, setIndex] = useState(0);
  return (
    <div className="bg-[#F9DEDC] w-full rounded-2xl pt-2 pb-1 md:pb-3 px-2 md:px-4">
      <div className="w-full flex justify-between items-center">
        <div className="flex items-center gap-2 text-xs font-medium text-Text-Primary">
          <img src="/icons/check-circle.svg" alt="" />
          {heading} 
        </div>
        <img
          className="cursor-pointer size-5"
          onClick={onClose}
          src="/icons/x.svg"
          alt=""
        />
      </div>
      <div className="w-full flex justify-between mt-2">
        <SvgIcon
          src="/icons/arrow-left-new.svg"
          color={`${index == 0 ? '#C7C5C7' : '#005F73'}`}
          onClick={() => {
            if (index == 0) return;
            setIndex(index - 1);
          }}
        />
        <div className="grow px-2 md:px-5">
          <div className="text-[10px] text-Text-Primary mt-1 text-wrap">
            {texts[index]}
          </div>
          <div className="text-[10px] text-Text-Quadruple mt-1 text-end">
            {index + 1}/{texts.length}
          </div>
        </div>
        <SvgIcon
          src="/icons/arrow-right-new.svg"
          color={`${index == texts.length - 1 ? '#C7C5C7' : '#005F73'}`}
          onClick={() => {
            if (index == texts.length - 1) return;
            setIndex(index + 1);
          }}
        />
      </div>
    </div>
  );
};
