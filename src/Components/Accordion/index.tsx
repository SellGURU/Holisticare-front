import { useEffect, useRef, useState } from 'react';
import SvgIcon from '../../utils/svgIcon';

interface AccordionProps {
  title: string;
  children?: React.ReactNode;

  time?: string;
}

const Accordion: React.FC<AccordionProps> = ({ title, children, time }) => {
  const [isActive, setIsActive] = useState(false);
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
        <div className="flex items-center gap-1">
          <h2 className={`text-Text-Primary font-medium text-[10px]`}>
            {title}{' '}
            {time && (
              <span className=" ml-1 font-normal text-[10px] text-[#888888]">
                {time}
              </span>
            )}{' '}
          </h2>
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
