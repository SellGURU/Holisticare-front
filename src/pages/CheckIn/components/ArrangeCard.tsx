/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useRef, useState, useEffect } from 'react';

// import { useState } from "react";
interface ArrangeCardProps {
  question: string;
  value: number;
  index?: number;
}

const ArrangeCard: React.FC<ArrangeCardProps> = ({
  question,
  index,
  value,
}) => {
  useEffect(() => {
    setVal(value);
  }, [value]);
  const [val, setVal] = useState<number>(value);
  const touchStartX = useRef(0);
  const resolveTextOpacity = (ind: number) => {
    if (ind == 0 || ind == 8) {
      return '30%';
    }
    if (ind == 1 || ind == 7) {
      return '50%';
    }
    if (ind == 2 || ind == 6) {
      return '70%';
    }
    return '100%';
  };
  const resolveValueBox = (ind: number, startvalue: number) => {
    if (startvalue + ind >= 0 && startvalue + ind <= 200) {
      return startvalue + ind;
    }
    return '';
  };
  const handleTouchStart = (e: any) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: any) => {
    const touchMoveX = e.touches[0].clientX;
    const diff = touchStartX.current - touchMoveX;

    if (diff > 50) {
      // Swipe Left
      if (val + 1 <= 200) {
        setVal(val + 1);
      }
      touchStartX.current = touchMoveX; // Reset start point to prevent multiple changes per swipe
    } else if (diff < -50) {
      // Swipe Right
      // if(active.order-1 >=0){
      //     setActive(emojeys.filter((el) =>el.order == active.order-1)[0]);

      // }
      if (val - 1 >= 0) {
        setVal(val - 1);
      }
      touchStartX.current = touchMoveX; // Reset start point
    }
  };
  return (
    <>
      <div className="bg-[#FCFCFC] min-h-[100px] p-3 w-full  rounded-[12px] border border-gray-50">
        <div className="text-[12px] text-Text-Primary">
          {index}. {question}
        </div>
        <div className="w-full flex justify-center items-center">
          <div
            onTouchMove={handleTouchMove}
            onTouchStart={handleTouchStart}
            className="flex px-2 w-full  mt-4 border border-Gray-50 h-10 rounded-[12px] justify-between items-center"
          >
            {Array.from({
              length: 9,
            }).map((_, ind) => {
              const startValue = val - 4;
              return (
                <>
                  <div
                    // onClick={() => {
                    //   if (startValue + ind >= 0 && startValue + ind <= 200) {
                    //     setVal(startValue + ind);
                    //   }
                    // }}
                    className={`w-6  h-6 text-[12px] select-none cursor-pointer text-Text-Primary flex justify-center items-center ${startValue + ind == val && 'bg-Primary-EmeraldGreen border text-white border-gray-50 rounded-full'}`}
                    style={{ opacity: resolveTextOpacity(ind) }}
                  >
                    {resolveValueBox(ind, startValue)}
                  </div>
                </>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default ArrangeCard;
