import { useState } from 'react';

interface YesNoCardProps {
  question: string;
  value: string;
}

const YesNoCard: React.FC<YesNoCardProps> = ({ question, value }) => {
  const [val, setVal] = useState(value);
  return (
    <>
      <div className="bg-[#FCFCFC] p-3 w-full h-[92px] rounded-[12px] border border-gray-50">
        <div className="text-[12px] text-Text-Primary">{question}</div>
        <div className="flex justify-end items-center mt-4">
          <div className="w-[96px] cursor-pointer flex justify-between items-center h-[32px] border border-gray-50 rounded-[8px]">
            <div
              onClick={() => {
                setVal('Yes');
              }}
              className={`w-[50%] text-[10px] ${val == 'Yes' ? 'bg-Primary-EmeraldGreen rounded-l-[8px] text-white' : ''} h-full  flex justify-center items-center`}
            >
              Yes
            </div>
            <div
              onClick={() => {
                setVal('No');
              }}
              className={`w-[50%] text-[10px] ${val == 'No' ? 'bg-Primary-EmeraldGreen rounded-r-[8px] text-white' : ''}   h-full  flex justify-center items-center`}
            >
              No
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default YesNoCard;
