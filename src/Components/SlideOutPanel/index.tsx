import { FC, ReactNode, useEffect, useRef } from 'react';
import useModalAutoClose from '../../hooks/UseModalAutoClose';
import { publish } from '../../utils/event';
import { MoveHorizontal } from "lucide-react";

type SlideOutPanelProps = {
  headline: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  isCombo?: boolean;
  ClassName?: string;
  isResizable?: boolean;       // NEW PROP
};

export const SlideOutPanel: FC<SlideOutPanelProps> = ({
  isOpen,
  isCombo,
  onClose,
  children,
  headline,
  ClassName,
  isResizable = false, // default = false
}) => {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const showModalRefrence = useRef(null);
  const showModalButtonRefrence = useRef(null);

  useModalAutoClose({
    refrence: showModalRefrence,
    buttonRefrence: showModalButtonRefrence,
    close: onClose,
  });

  useEffect(() => {
    if (isOpen && !isCombo) publish('openSideOut', {});
    else publish('closeSideOut', {});
  }, [isOpen, isCombo]);

  // ----------- RESIZE LOGIC ONLY IF isResizable = true ---------------
  const startResize = (e: React.MouseEvent) => {
    if (!isResizable) return;

    e.preventDefault();
    const panel = panelRef.current;
    if (!panel) return;

    const startX = e.clientX;
    const startWidth = panel.offsetWidth;

    const handleMove = (moveEvent: MouseEvent) => {
      const newWidth = startWidth + (startX - moveEvent.clientX);

      panel.style.width = Math.max(200, Math.min(900, newWidth)) + "px"; // boundaries
    };

    const stopResize = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', stopResize);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', stopResize);
  };
  // -------------------------------------------------------------------

  return (
    <div
      ref={(el) => {
        panelRef.current = el;
        // also assign to old ref so auto-close still works
        // @ts-expect-error resize
        showModalRefrence.current = el;
      }}
      className={`fixed top-[43px] z-20 right-0 h-[calc(100vh-43px)] 
        w-[260px] xs:w-[320px] md:w-[340px] lg:w-[340px] 
         min-w-[260px] xs:min-w-[320px] md:min-w-[340px] lg:min-w-[340px]
        bg-white border-[2px] border-r-0 border-Gray-25 
        rounded-tl-2xl rounded-bl-2xl shadow-lg 
        transform transition-transform duration-300 
        ${ClassName} ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >

      {/* RESIZE HANDLE – ONLY SHOW WHEN isResizable = true */}
      {isResizable && (
        <div
          onMouseDown={startResize}
          className="
            absolute -left-[9px] top-1/2 -translate-y-1/2 
            w-5 h-4 flex items-center justify-center 
            cursor-ew-resize z-50 bg-transparent
          "
        >
          <MoveHorizontal size={18} className="text-gray-400" />
        </div>
      )}

      {/* Header */}
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

      {/* Content */}
      <div className="p-3 pt-1 overflow-y-auto max-h-[calc(100vh-90px)]">
        {children}
      </div>
    </div>
  );
};
