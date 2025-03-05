import { useState } from 'react';
interface TextCardProps {
  question: string;
  value: string;
  placeHolder?: string;
  index?: number;
}

const TextCard: React.FC<TextCardProps> = ({
  question,
  value,
  placeHolder,
  index,
}) => {
  const [val, setVal] = useState(value);
  return (
    <>
      <div className="bg-[#FCFCFC] min-h-[100px] p-3 w-full h-[92px] rounded-[12px] border border-gray-50">
        <div className="text-[12px] text-Text-Primary">
          {index}. {question}
        </div>
        <div className="mt-4 ">
          <input
            type="text"
            placeholder={placeHolder}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="w-full h-10 text-Text-Primary placeholder:text-[#B0B0B0] outline-none px-3 py-2 text-[12px] rounded-[20px] border border-gray-50"
          />
        </div>
      </div>
    </>
  );
};

export default TextCard;
