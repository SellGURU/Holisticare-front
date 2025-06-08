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
          <div
            className="text-[10px] ml-1 text-Text-Secondary cursor-pointer"
            onClick={() => {
              setVal(Number(0));
              changeValue('score', Number(0));
            }}
          >
            0
          </div>
          <div
            className="text-[10px] ml-1 text-Text-Secondary cursor-pointer"
            onClick={() => {
              setVal(Number(1));
              changeValue('score', Number(1));
            }}
          >
            1
          </div>
          <div
            className="text-[10px] ml-1 text-Text-Secondary cursor-pointer"
            onClick={() => {
              setVal(Number(2));
              changeValue('score', Number(2));
            }}
          >
            2
          </div>
          <div
            className="text-[10px] ml-1 text-Text-Secondary cursor-pointer"
            onClick={() => {
              setVal(Number(3));
              changeValue('score', Number(3));
            }}
          >
            3
          </div>
          <div
            className="text-[10px] ml-1 text-Text-Secondary cursor-pointer"
            onClick={() => {
              setVal(Number(4));
              changeValue('score', Number(4));
            }}
          >
            4
          </div>
          <div
            className="text-[10px] ml-1 text-Text-Secondary cursor-pointer"
            onClick={() => {
              setVal(Number(5));
              changeValue('score', Number(5));
            }}
          >
            5
          </div>
          <div
            className="text-[10px] ml-1 text-Text-Secondary cursor-pointer"
            onClick={() => {
              setVal(Number(6));
              changeValue('score', Number(6));
            }}
          >
            6
          </div>
          <div
            className="text-[10px] ml-1 text-Text-Secondary cursor-pointer"
            onClick={() => {
              setVal(Number(7));
              changeValue('score', Number(7));
            }}
          >
            7
          </div>
          <div
            className="text-[10px] ml-1 text-Text-Secondary cursor-pointer"
            onClick={() => {
              setVal(Number(8));
              changeValue('score', Number(8));
            }}
          >
            8
          </div>
          <div
            className="text-[10px] ml-1 text-Text-Secondary cursor-pointer"
            onClick={() => {
              setVal(Number(9));
              changeValue('score', Number(9));
            }}
          >
            9
          </div>
          <div
            className="text-[10px] ml-1 text-Text-Secondary cursor-pointer"
            onClick={() => {
              setVal(Number(10));
              changeValue('score', Number(10));
            }}
          >
            10
          </div>
        </div>
      </div>
      {showValidation && error && required && (
        <div className="text-Red text-[10px]">This field is required.</div>
      )}
    </div>
  );
};

export default RangeCardLibraryActivity;
