import { useEffect, useRef, useState } from 'react';
import SvgIcon from '../../utils/svgIcon';

interface AccordionProps {
  title: string;
  children?: React.ReactNode;

  time?: string;
  defaultOpen?: boolean;
  processing?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({
  title,
  children,
  time,
  defaultOpen = false,
  processing = false,
}) => {
  const [isActive, setIsActive] = useState(defaultOpen);
  const handleClick = () => {
    if (isActive) {
      setHeight(contentRef.current?.scrollHeight || 0);
      // setHeight(contentRef.current?.scrollHeight || 0);
      setTimeout(() => {
        setIsActive(false);
      }, 10);
    } else {
      setIsActive(true);
      setHeight(contentRef.current?.scrollHeight || 0);
      // setHeight(contentRef.current?.scrollHeight || 0);
    }
  };
  useEffect(() => {
    if (contentRef.current) {
      if (isActive) {
        setHeight(contentRef.current.scrollHeight);
      } else {
        setTimeout(() => {
          setHeight(0);
        }, 10);
      }
    }
  }, [isActive, title]);
  const [height, setHeight] = useState<number | undefined>(0);
  const handleTransitionEnd = () => {
    if (isActive) {
      setHeight(undefined);
    }
  };
  const contentRef = useRef<HTMLDivElement | null>(null);
  return (
    <>
      <div
        data-isActive={isActive}
        onClick={handleClick}
        className={`flex justify-between bg-black-primary w-full min-h-[48px]   items-center border  border-Gray-50  px-4 py-2 cursor-pointer select-none bg-white ${
          isActive ? 'rounded-t-xl ' : 'rounded-xl'
        } `}
      >
        <div className="flex items-center gap-1 min-w-0">
          <h2 className={`text-Text-Primary font-medium text-[10px]`}>
            {title}{' '}
            {time && (
              <span className=" ml-1 font-normal text-[10px] text-[#888888]">
                {time}
              </span>
            )}{' '}
          </h2>
          {processing && (
            <div className="flex items-center gap-1 shrink-0 ml-1">
              <div
                style={{
                  background:
                    'linear-gradient(to right, rgba(0,95,115,0.4), rgba(108,194,74,0.4))',
                }}
                className="flex size-4 rounded-full items-center justify-center gap-[2px]"
              >
                <div className="size-[2px] rounded-full bg-Primary-DeepTeal animate-dot1"></div>
                <div className="size-[2px] rounded-full bg-Primary-DeepTeal animate-dot2"></div>
                <div className="size-[2px] rounded-full bg-Primary-DeepTeal animate-dot3"></div>
              </div>
              <span className="font-medium text-[10px] text-Primary-DeepTeal">
                Reading file…
              </span>
            </div>
          )}
          {/* <span className={`${theme}-graphicinfo-btn-number ${!number && "hidden"}`}>
                    ({number})
                </span> */}
        </div>
        <div className={`${isActive && 'rotate-180'} transition-transform`}>
          <SvgIcon src="/icons/arrow-down.svg" color="#383838" />
        </div>
        {/* <img
          className={`${isActive && 'rotate-180'} transition-transform`}
          src="/icons/arrow-down.svg"
          alt=""
        /> */}
      </div>
      <div
        ref={contentRef}
        style={{ height }}
        className={`transition-height duration-500 ease-in-out  rounded-xl  ${isActive ? 'border border-Gray-50 rounded-t-none' : ''}`}
        onTransitionEnd={handleTransitionEnd}
      >
        {isActive && (
          <div
            className={` bg-black-background h-full o flex   flex-col gap-4 p-4 `}
          >
            {children}
          </div>
        )}
      </div>
    </>
  );
};

export default Accordion;
