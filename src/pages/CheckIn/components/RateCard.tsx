/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useEffect, useState } from 'react';

// import { useState } from "react";
interface RateCardProps {
  question: string;
  value: number;
  index?: number;
  onSubmit?:(value:any) => void
}

const RateCard: React.FC<RateCardProps> = ({ question, index, value,onSubmit }) => {
  const [val, setVal] = useState<number>(value);
  useEffect(() => {
    if(onSubmit) {
      onSubmit(val)
    }
  },[val])
  return (
    <>
      <div className="bg-[#FCFCFC] select-none  p-3 w-full  rounded-[12px] border border-gray-50">
        <div className="text-[12px] text-Text-Primary">
          {index}. {question}
        </div>
        <div className="flex justify-center mt-2 gap-2 items-center">
          {Array.from({ length: 5 }).map((_, ind) => {
            return (
              <img
                onClick={() => {
                  setVal(ind + 1);
                }}
                className="cursor-pointer"
                src={
                  ind + 1 <= Number(val)
                    ? './icons/starFull.svg'
                    : './icons/starEmpty.svg'
                }
                alt=""
              />
            );
          })}
          {/* <img src="./icons/starEmpty.svg" alt="" />
            <img src="./icons/starEmpty.svg" alt="" />
            <img src="./icons/starEmpty.svg" alt="" />
            <img src="./icons/starEmpty.svg" alt="" /> */}
        </div>
      </div>
    </>
  );
};

export default RateCard;
