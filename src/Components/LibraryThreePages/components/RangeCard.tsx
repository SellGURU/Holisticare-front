import { useEffect, useState } from 'react';

interface RangeCardProps {
  value: number;
  changeValue: (key: 'score' | 'title' | 'instruction', value: number) => void;
  showValidation?: boolean;
  error?: boolean;
  required?: boolean;
}

const RangeCardLibraryThreePages: React.FC<RangeCardProps> = ({
  value,
  changeValue,
  showValidation = false,
  error,
  required = false,
}) => {
  const [val, setVal] = useState(value);

  useEffect(() => {
    if (value) {
      setVal(value);
    }
  }, [value]);

  return (
    <div className="flex flex-col gap-2">
      <div className={`w-full rounded-[12px]`}>
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
              setVal(0);
              changeValue('score', 0);
            }}
          >
            0
          </div>
          <div
            className="text-[10px] ml-1 text-Text-Secondary cursor-pointer"
            onClick={() => {
              setVal(1);
              changeValue('score', 1);
            }}
          >
            1
          </div>
          <div
            className="text-[10px] ml-1 text-Text-Secondary cursor-pointer"
            onClick={() => {
              setVal(2);
              changeValue('score', 2);
            }}
          >
            2
          </div>
          <div
            className="text-[10px] ml-1 text-Text-Secondary cursor-pointer"
            onClick={() => {
              setVal(3);
              changeValue('score', 3);
            }}
          >
            3
          </div>
          <div
            className="text-[10px] ml-1 text-Text-Secondary cursor-pointer"
            onClick={() => {
              setVal(4);
              changeValue('score', 4);
            }}
          >
            4
          </div>
          <div
            className="text-[10px] ml-1 text-Text-Secondary cursor-pointer"
            onClick={() => {
              setVal(5);
              changeValue('score', 5);
            }}
          >
            5
          </div>
          <div
            className="text-[10px] ml-1 text-Text-Secondary cursor-pointer"
            onClick={() => {
              setVal(6);
              changeValue('score', 6);
            }}
          >
            6
          </div>
          <div
            className="text-[10px] ml-1 text-Text-Secondary cursor-pointer"
            onClick={() => {
              setVal(7);
              changeValue('score', 7);
            }}
          >
            7
          </div>
          <div
            className="text-[10px] ml-1 text-Text-Secondary cursor-pointer"
            onClick={() => {
              setVal(8);
              changeValue('score', 8);
            }}
          >
            8
          </div>
          <div
            className="text-[10px] ml-1 text-Text-Secondary cursor-pointer"
            onClick={() => {
              setVal(9);
              changeValue('score', 9);
            }}
          >
            9
          </div>
          <div
            className="text-[10px] ml-1 text-Text-Secondary cursor-pointer"
            onClick={() => {
              setVal(10);
              changeValue('score', 10);
            }}
          >
            10
          </div>
        </div>
      </div>
      {showValidation && error && required && !val && (
        <div className="text-Red text-[10px]">This field is required.</div>
      )}
    </div>
  );
};

export default RangeCardLibraryThreePages;
