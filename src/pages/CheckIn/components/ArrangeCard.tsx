/* eslint-disable @typescript-eslint/no-unused-vars */

import { useState } from 'react';

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
  const [val, setVal] = useState<number>(value);
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
  return (
    <>
      <div className="bg-[#FCFCFC] min-h-[100px] p-3 w-full h-[92px] rounded-[12px] border border-gray-50">
        <div className="text-[12px] text-Text-Primary">
          {index}. {question}
        </div>
        <div className="w-full flex justify-center items-center">
          <div className="flex min-w-[412px] w-min  px-2  mt-4 border border-Gray-50 h-10 rounded-[12px] justify-between items-center">
            {Array.from({
              length: 9,
            }).map((_, ind) => {
              const startValue = val - 4;
              return (
                <>
                  <div
                    onClick={() => {
                      if (startValue + ind >= 0 && startValue + ind <= 200) {
                        setVal(startValue + ind);
                      }
                    }}
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
