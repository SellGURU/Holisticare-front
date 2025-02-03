import React, { useState } from 'react';

interface AccordionItemProps {
  data: any;
}
export const AccordionItem: React.FC<AccordionItemProps> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="border bg-white border-Gray-50 border-t-0 px-3 xs:px-6 py-4  rounded-[20px] text-Text-Primary">
      <div
        className="flex justify-between items-center "
        onClick={toggleAccordion}
      >
        <h3 className="text-xs font-medium">{data.subcategory}</h3>
        <img
          src="/icons/arrow-down.svg"
          alt="Toggle"
          className={`${isOpen ? 'rotate-180' : ''}`}
        />
      </div>
      {isOpen && (
        <div className="pt-2 ">
          {data.biomarkers.map((biomarker: any, index: number) => (
            <div
              key={index}
              className="bg-backgroundColor-Card rounded-2xl border border-Gray-50  p-2 xs:p-3 my-2"
            >
              <div className="flex justify-between items-center">
                <div className='flex gap-2 '>
                    <div className='w-[6px] h-[56px] bg-Green rounded'></div>
                  <h4 className=" text-xs xs:text-sm font-medium ">{biomarker.name}</h4>
                </div>
                <div className="text-right flex items-start gap-[2px]">
                  <span className=" text-lg xs:text-xl font-meidum text-[#06C78D]">
                    {biomarker.Result}
                  </span>
                  <span className="text-[8px] text-Text-Secondary">
                    {biomarker.Units}
                  </span>
                </div>
              </div>
              <div className="flex justify-between mt-2 text-[8px] xs:text-[10px] border-t border-[#E9F0F2] pt-[6px]">
                <div>
                  <p className=' text-Text-Secondary'>Lab Ref Range</p>
                  <p>{biomarker['Lab Ref Range']}</p>
                </div>
                <div>
                  <p className=' text-Text-Secondary'>Optimal Range</p>
                  <p>{biomarker['Optimal Range']}</p>
                </div>
                <div>
                  <p className=' text-Text-Secondary'>Baseline</p>
                  <p>{biomarker.Baseline}</p>
                </div>
                <div>
                  <p className=' text-Text-Secondary'>Changes</p>
                  <p>{biomarker.Changes}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
