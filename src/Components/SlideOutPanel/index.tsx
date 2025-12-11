import { FC, ReactNode, useEffect, useRef } from 'react';
import useModalAutoClose from '../../hooks/UseModalAutoClose';
import { publish } from '../../utils/event';
import { MoveHorizontal } from 'lucide-react';

type SlideOutPanelProps = {
  headline: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  isCombo?: boolean;
  ClassName?: string;
  isResizable?: boolean;
};

export const SlideOutPanel: FC<SlideOutPanelProps> = ({
  isOpen,
  isCombo,
  onClose,
  children,
  headline,
  ClassName,
  isResizable = false,
}) => {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const showModalRefrence = useRef(null);
  const showModalButtonRefrence = useRef(null);

  // STORE MIN WIDTH OF ORIGINAL PANEL
  const minWidthRef = useRef<number>(260);

  useEffect(() => {
    const el = panelRef.current;
    if (el) {
      const computed = el.getBoundingClientRect().width;
      minWidthRef.current = computed; // use actual rendered width
    }
  }, []);

  useModalAutoClose({
    refrence: showModalRefrence,
    buttonRefrence: showModalButtonRefrence,
    close: onClose,
  });

  useEffect(() => {
    if (isOpen && !isCombo) publish('openSideOut', {});
    else publish('closeSideOut', {});
  }, [isOpen, isCombo]);

  // ---------------- RESIZE HANDLER ----------------
  const startResize = (e: React.MouseEvent) => {
    if (!isResizable) return;

    e.preventDefault();

    const panel = panelRef.current;
    if (!panel) return;

    const startX = e.clientX;
    const startWidth = panel.offsetWidth;

    const handleMove = (moveEvent: MouseEvent) => {
      const delta = startX - moveEvent.clientX;
      const newWidth = startWidth + delta;

      const clamped = Math.max(minWidthRef.current, Math.min(900, newWidth));
      panel.style.width = clamped + "px";
    };

    const stopResize = () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", stopResize);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", stopResize);
  };

  return (
    <div
      ref={(el) => {
        panelRef.current = el;
        // required for auto-close hook
        // @ts-expect-error resize
        showModalRefrence.current = el;
      }}
      className={`fixed top-[43px] z-20 right-0 h-[calc(100vh-43px)] 
        w-[260px] xs:w-[320px] md:w-[340px] lg:w-[340px]
        bg-white border-[2px] border-r-0 border-Gray-25 
        rounded-tl-2xl rounded-bl-2xl shadow-lg 
        transform transition-transform duration-300 
        ${ClassName} ${isOpen ? "translate-x-0" : "translate-x-full"}`}
    >

      {/* LEFT RESIZE ZONE (FULL VERTICAL STRIP) */}
      {isResizable && (
        <div
          onMouseDown={startResize}
          className="
            absolute left-0 top-0 h-full 
            w-2 hover:w-3 
            cursor-ew-resize 
            z-50 
            bg-transparent
          "
        >
          {/* Optional icon → visible only on hover */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 hover:opacity-50 transition-opacity pointer-events-none">
            <MoveHorizontal size={16} className="text-gray-400" />
          </div>
        </div>
      )}

      {/* HEADER */}
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

      {/* CONTENT */}
      <div className="p-3 pt-1 overflow-y-auto max-h-[calc(100vh-90px)]">
        {children}
      </div>
    </div>
  );
};
