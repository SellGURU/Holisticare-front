import { useEffect, useState } from 'react';

interface RangeCardProps {
  question: string;
  value: number;
  index?: number;
  onSubmit?: (value: number) => void;
  hideQuestions?: boolean;
  showValidation?: boolean;
  error?: boolean;
  required?: boolean;
  isPreview?: boolean;
  showTitleRequired?: boolean;
}

const RangeCard: React.FC<RangeCardProps> = ({
  question,
  value,
  index,
  onSubmit,
  hideQuestions,
  showValidation,
  error,
  required,
  showTitleRequired,
  isPreview,
}) => {
  const [val, setVal] = useState(Number(value) || 5);
  useEffect(() => {
    if (onSubmit) {
      onSubmit(val);
    }
  }, [val]);

  useEffect(() => {
    setVal(Number(value) || 5);
  }, [value]);

  return (
    <div className="flex flex-col gap-1">
      <div className={`w-full rounded-[12px] `}>
        {!hideQuestions && (
          <div className="text-[12px] text-Text-Primary">
            {index ? index + '.' : ''} {question}
            {showTitleRequired && <span className="text-Red ml-1">*</span>}
          </div>
        )}

        <div className="w-full">
          <input
            type="range"
            value={val}
            onChange={(e) => {  
              if (!isPreview) {
                setVal(Number(e.target.value));
              }
            }}
            min={0}
            max={10}
            className="w-full h-[2px] sliderCheckin border-none"
            style={{
              background: `linear-gradient(88.52deg, #6CC24A 3%, #6CC24A 140.48%) 0% / ${val * 10}% 100% no-repeat, #d1d5db`,
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              appearance: 'none',
            }}
          />
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
            <div className="text-[10px] ml-1 text-Text-Secondary">10</div>
          </div>
        </div>
      </div>
      {showValidation && error && required && (
        <div className="text-Red text-[10px]">This field is required.</div>
      )}
    </div>
  );
};

export default RangeCard;
