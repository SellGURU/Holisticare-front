import { FC, ReactElement, useEffect, useRef, useState } from 'react';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

interface TooltipTextAutoProps {
  children: ReactElement | string;
  maxWidth?: string;
  tooltipPlace?: 'top' | 'bottom' | 'left' | 'right';
  tooltipClassName?: string;
}

const TooltipTextAuto: FC<TooltipTextAutoProps> = ({
  children,
  maxWidth = '200px',
  tooltipPlace = 'top',
  tooltipClassName = '!bg-white !w-[200px] !bg-opacity-100 !opacity-100 !h-fit !break-words !leading-5 !text-justify !text-wrap !shadow-100 !text-[#888888] !text-[10px] !rounded-[6px] !border !border-Gray-50 flex flex-col !z-[99999]',
}) => {
  const textRef = useRef<HTMLDivElement>(null);
  const [isEllipsized, setIsEllipsized] = useState(false);
  const [tooltipId] = useState(
    () => `tooltip-${Math.random().toString(36).substr(2, 9)}`,
  );

  useEffect(() => {
    if (textRef.current) {
      const { offsetWidth, scrollWidth } = textRef.current;
      setIsEllipsized(scrollWidth > offsetWidth);
    }
  }, [children]);

  // Generate a unique class for this instance
  const uniqueClass = `tooltip-text-auto-${tooltipId}`;

  return (
    <>
      {maxWidth && (
        <style>{`
          @media (min-width: 768px) {
            .${uniqueClass} {
              max-width: ${maxWidth};
            }
          }
        `}</style>
      )}
      <div
        className={`select-none max-w-[150px] sm:max-w-[180px] ${uniqueClass}`}
        ref={textRef}
        data-tooltip-id={isEllipsized ? tooltipId : ''}
        data-tooltip-content={typeof children === 'string' ? children : ''}
        style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {children}
      </div>
      {isEllipsized && (
        <Tooltip
          id={tooltipId}
          place={tooltipPlace}
          className={tooltipClassName}
        />
      )}
    </>
  );
};

export default TooltipTextAuto;
