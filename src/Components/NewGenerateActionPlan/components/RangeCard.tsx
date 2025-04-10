import { useEffect, useState } from 'react';

interface RangeCardProps {
  value: number;
  changeValue: (value: number) => void;
}
const RangeCard: React.FC<RangeCardProps> = ({ value, changeValue }) => {
  const [val, setVal] = useState(value);
  useEffect(() => {
    if (value) {
      setVal(value);
    }
  }, [value]);
  const [scores] = useState<number[]>([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  return (
    <>
      <div className="w-full">
        <input
          type="range"
          value={val}
          onChange={(e) => {
            setVal(Number(e.target.value));
            changeValue(Number(e.target.value));
          }}
          min={0}
          max={10}
          className="w-full h-[2px] sliderCheckin border-none "
          style={{
            background: `linear-gradient(88.52deg, #6CC24A 3%, #6CC24A 140.48%) 0% / ${val * 10}% 100% no-repeat, #d1d5db`,
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            appearance: 'none',
          }}
        ></input>
        <div className="w-full flex justify-between items-center">
          {scores.map((score, index) => {
            return (
              <div
                key={index}
                className="text-[10px] ml-1 text-Text-Secondary cursor-pointer"
                onClick={() => {
                  setVal(score);
                  changeValue(score);
                }}
              >
                {score}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default RangeCard;
