/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';

interface ConceringRowProps {
  data: any;
}

const ConceringRow: React.FC<ConceringRowProps> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(true);
  // console.log(data);

  return (
    <>
      <div className="w-full flex justify-between px-6 items-center bg-white  border-b border-Gray-50 h-[56px]">
        <div className="TextStyle-Body-2 text-Text-Primary">
          {data.subcategory}
        </div>
        <div
          onClick={() => {
            setIsOpen(!isOpen);
          }}
          className={`${isOpen ? '-rotate-90' : 'rotate-90'}  cursor-pointer transition-transform`}
        >
          <img className="w-6 h-6" src="/icons/arrow-right.svg" alt="" />
        </div>
      </div>
      {isOpen && (
        <>
          {data.biomarkers.map((el: any) => {
            return (
              <div className=" px-6 w-full bg-white">
                <div className="w-full py-4  flex justify-end items-center">
                  <div className=" TextStyle-Body-3 text-Text-Primary pl-5   w-[800px]">
                    {el.name}
                  </div>
                  <div className="TextStyle-Body-3 text-Text-Primary  w-[120px] text-center pr-4">
                    {el.Result}
                  </div>
                  <div className="TextStyle-Body-3 text-Text-Primary  w-[120px] text-center">
                    {el.Units}
                  </div>
                  <div className="TextStyle-Body-3 text-Text-Primary  w-[180px] text-center">
                    {el['Lab Ref Range']}
                  </div>
                  <div className="TextStyle-Body-3 text-Text-Primary  w-[130px] text-center">
                    {el.Baseline}
                  </div>
                  <div className="TextStyle-Body-3 text-Text-Primary pl-4  w-[130px] text-center">
                    {el['Optimal Range']}
                  </div>
                  <div className="TextStyle-Body-3 text-Text-Primary w-[130px] text-right">
                    {el.Changes}
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}
    </>
  );
};
export default ConceringRow;
