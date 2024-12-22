import React, { useRef } from 'react';
import useModalAutoClose from '../../hooks/UseModalAutoClose';
type SlideOutPanelProps = {
    headline: string,
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export const SlideOutPanel: React.FC<SlideOutPanelProps> = ({ isOpen, onClose, children,headline }) => {
    const showModalRefrence = useRef(null);
    const showModalButtonRefrence = useRef(null);
    useModalAutoClose({
        refrence: showModalRefrence,
        buttonRefrence: showModalButtonRefrence,
        close: () => {
          onClose()
        },
      });
  return (
    <div ref={showModalRefrence} className={`fixed top-0 right-0 h-full min-w-[320px] bg-white border-[2px] border-r-0 border-Gray-25 rounded-tl-2xl rounded-bl-2xl  shadow-lg transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex justify-between items-center p-4 ">
        <h2 className="text-xs font-medium text-Primary-DeepTeal">{headline}</h2>
        <img ref={showModalButtonRefrence} className='cursor-pointer' onClick={onClose} src='./icons/close.svg' />
      </div>
      <div className="p-4 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};