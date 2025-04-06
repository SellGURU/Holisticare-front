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
    </>
  );
};

export default RangeCard;
