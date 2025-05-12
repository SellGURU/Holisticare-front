import { useEffect, useState } from 'react';

interface RangeCardProps {
  value: number;
  changeValue: (key: 'score' | 'title' | 'instruction', value: number) => void;

  error?: boolean;
  required?: boolean;
  showValidation?: boolean;
}

const RangeCardLibraryActivity: React.FC<RangeCardProps> = ({
  value,
  changeValue,
  showValidation,
  error,
  required = false,
}) => {
  const [val, setVal] = useState(value);

  useEffect(() => {
    if (value !== undefined) {
      setVal(value);
    }
  }, [value]);

  return (
    <div className="flex flex-col gap-2">
      <div className="w-full">
        <input
          type="range"
          value={val}
          onChange={(e) => {
            setVal(Number(e.target.value));
            changeValue('score', Number(e.target.value));
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
        <div className="w-full flex justify-between items-center">
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
      {showValidation && error && required && (
        <div className="text-Red text-[10px]">This field is required.</div>
      )}
    </div>
  );
};

export default RangeCardLibraryActivity;
