import { FC, ReactNode, useEffect, useRef } from 'react';
import useModalAutoClose from '../../hooks/UseModalAutoClose';
import { publish } from '../../utils/event';
type SlideOutPanelProps = {
  headline: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  isCombo?: boolean;
  ClassName?: string;
  isActionPLan?:boolean
};

export const SlideOutPanel: FC<SlideOutPanelProps> = ({
  isOpen,
  isCombo,
  onClose,
  children,
  headline,
  ClassName,
  isActionPLan
}) => {
  const showModalRefrence = useRef(null);
  const showModalButtonRefrence = useRef(null);
  useModalAutoClose({
    refrence: showModalRefrence,
    buttonRefrence: showModalButtonRefrence,
    close: () => {
      onClose();
    },
  });
  useEffect(() => {
    if (isOpen == true && !isCombo) {
      publish('openSideOut', {});
    } else {
      publish('closeSideOut', {});
    }
  }, [isOpen, isCombo]);
  return (
    <div
      ref={showModalRefrence}
      className={`fixed top-[43px] z-20 right-0 h-[calc(100vh-43px)] ${isActionPLan? 'w-[83vw]' : 'w-[260px] xs:w-[320px] md:w-[340px] lg:w-[340px]'}  bg-white border-[2px] border-r-0 border-Gray-25 rounded-tl-2xl rounded-bl-2xl shadow-lg transform transition-transform duration-300 ${ClassName} ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <div className="flex justify-between items-center p-4">
        <h2 className="text-xs font-medium text-Primary-DeepTeal">
          {headline}
        </h2>
        <img
          ref={showModalButtonRefrence}
          className="cursor-pointer"
          onClick={onClose}
          src="/icons/close.svg"
        />
      </div>

      <div className="p-3 pt-1 overflow-y-auto max-h-[calc(100vh-90px)]">
        {children}
      </div>
    </div>
  );
};
