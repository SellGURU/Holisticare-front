import { useEffect, useState } from 'react';

interface YesNoCardProps {
  question: string;
  value: string;
  index?: number;
  onSubmit?: (value: string) => void;
  hideQuestions?: boolean;
  onChange?: (value: string) => void;
  isPreview?: boolean;
}

const YesNoCard: React.FC<YesNoCardProps> = ({
  question,
  value,
  index,
  onSubmit,
  hideQuestions,
  onChange,
  isPreview,
}) => {
  const [val, setVal] = useState(value == 'No' ? 'No' : 'Yes');
  useEffect(() => {
    if (onChange) {
      onChange(val);
    }
  }, [val]);
  useEffect(() => {
    if (onSubmit) {
      onSubmit(val);
    }
  }, [val]);

  useEffect(() => {
    setVal(value == 'No' ? 'No' : 'Yes');
  }, [value]);
  return (
    <>
      <div className="bg-[#FCFCFC] p-3 w-full  rounded-[12px] border border-gray-50">
        {!hideQuestions && (
          <div className="text-[12px] text-Text-Primary">
            {index}. {question}
          </div>
        )}

        <div
          className={`flex ${hideQuestions ? 'justify-center' : 'justify-end'}  items-center mt-4`}
        >
          <div className="w-[96px] cursor-pointer flex justify-between items-center h-[32px] border border-gray-50 rounded-[8px]">
            <div
              onClick={() => {
                if (!isPreview) {
                  setVal('Yes');
                }
              }}
              className={`w-[50%] text-[10px] ${val == 'Yes' ? 'bg-Primary-EmeraldGreen rounded-l-[8px] text-white' : ''} h-full  flex justify-center items-center`}
            >
              Yes
            </div>
            <div
              onClick={() => {
                if (!isPreview) {
                  setVal('No');
                }
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
