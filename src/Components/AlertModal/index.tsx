import React from 'react';
interface AlertModalProps {
  onClose: () => void;
  heading: string;
  text: string;
}
export const AlertModal: React.FC<AlertModalProps> = ({
  onClose,
  heading,
  text,
}) => {
  return (
    <div className="bg-[#F9DEDC] w-full rounded-2xl pt-2 pb-3 px-4">
      <div className="w-full flex justify-between items-center">
        <div className='flex items-center gap-2 text-xs font-medium text-Text-Primary'
        >
            <img src="/icons/check-circle.svg" alt="" />
            {heading}
        </div>
        <img className='cursor-pointer size-5' onClick={onClose} src="/icons/x.svg" alt="" />
      
      </div>
      <div className='text-[10px] text-Text-Primary mt-1'>{text}</div>
    </div>
  );
};
