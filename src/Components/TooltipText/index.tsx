import { Tooltip } from 'react-tooltip';
import { ReactElement, useEffect, useRef, useState } from 'react';

interface TooltipTextProps extends React.ButtonHTMLAttributes<HTMLDivElement> {
  tooltipValue: string;
  children: ReactElement;
}

const TooltipText: React.FC<TooltipTextProps> = ({
  tooltipValue,
  children,
  ...props
}) => {
  const textRef = useRef(null);
  const [isEllipsized, setIsEllipsized] = useState(false);
  useEffect(() => {
    if (textRef.current) {
      const { offsetWidth, scrollWidth } = textRef.current;
      setIsEllipsized(scrollWidth > offsetWidth);
    }
  }, [tooltipValue]);
  return (
    <>
      <span
        ref={textRef}
        data-tooltip-id={isEllipsized ? 'tooltip' : ''}
        data-tooltip-content={tooltipValue}
        {...props}
        style={{
          textWrap: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {children}
      </span>
      {isEllipsized && <Tooltip className='!opacity-100 !bg-opacity-100' id="tooltip"></Tooltip>}
    </>
  );
};

export default TooltipText;
