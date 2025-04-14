import { useEffect, useState } from 'react';

interface RangeCardProps {
  question: string;
  value: number;
  index?: number;
  onSubmit?: (value: number) => void;
  hideQuestions?: boolean;
}
const RangeCard: React.FC<RangeCardProps> = ({
  question,
  value,
  index,
  onSubmit,
  hideQuestions,
}) => {
  const [val, setVal] = useState(value || 0);
  useEffect(() => {
    if (onSubmit) {
      onSubmit(val);
    }
  }, [val]);
  useEffect(() => {
    setVal(value);
  }, [value]);
  return (
    <>
      <div className="bg-[#FCFCFC] p-3 w-full  rounded-[12px] border border-gray-50">
        {!hideQuestions && (
          <div className="text-[12px] text-Text-Primary">
            {index ? index + '.' : ''} {question}
          </div>
        )}

        <div className="w-full mt-4 ">
          <input
            type="range"
            value={val}
            onChange={(e) => {
              setVal(Number(e.target.value));
            }}
            min={0}
            max={10}
            className="w-full h-[2px] sliderCheckin border-none "
            style={{
              // background:'#6CC24A',
              background: `linear-gradient(88.52deg, #6CC24A 3%, #6CC24A 140.48%) 0% / ${val * 10}% 100% no-repeat, #d1d5db`,
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              appearance: 'none',
            }}
          ></input>
          <div className="w-full flex justify-between mt-2 items-center">
            <div className="text-[10px] ml-1 text-Text-Secondary">0</div>
            <div className="text-[10px] ml-1 text-Text-Secondary">1</div>
            <div className="text-[10px] ml-1 text-Text-Secondary">2</div>
            <div className="text-[10px] ml-1 text-Text-Secondary">3</div>
            <div className="text-[10px] ml-1 text-Text-Secondary">4</div>
            <div className="text-[10px] ml-1 text-Text-Secondary">5</div>
            <div className="text-[10px] ml-1 text-Text-Secondary">6</div>
            <div className="text-[10px] ml-1 text-Text-Secondary">7</div>
            <div className="text-[10px] ml-1 text-Text-Secondary">8</div>
            <div className="text-[10px] ml-1 text-Text-Secondary">9</div>
            <div className="text-[10px] ml-1 text-Text-Secondary"> {'>10'}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RangeCard;
