import { useState, useEffect } from 'react';

interface SliderData {
  name: string;
  value: number;
}

interface SlidersProps {
  data: Record<string, number>[] | null;
  setData: (newData: Record<string, number>[]) => void;
}

export default function Sliders({ data, setData }: SlidersProps) {
  const [sliders, setSliders] = useState<SliderData[] | null>(null);

  useEffect(() => {
    if (data) {
      const formattedData: SliderData[] = data.map((item) => {
        const key = Object.keys(item)[0];
        return { name: key, value: item[key] };
      });
      setSliders(formattedData);
    }
  }, [data]);

  const handleChange = (index: number, newValue: number) => {
    setSliders((prev) => {
      if (!prev) return null;

      const updatedSliders = prev.map((item, i) =>
        i === index ? { ...item, value: newValue } : item,
      );

      const updatedData = updatedSliders.map((item) => ({
        [item.name]: item.value,
      }));
      setData(updatedData);

      return updatedSliders;
    });
  };

  if (!sliders) {
    return null;
  }

  return (
    <div className="w-[60%] mt-8">
      {sliders.map((slider, index) => (
        <div key={index} className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-Text-Quadruple text-xs font-medium">
              {slider.name}
            </span>
            <span className="text-Primary-DeepTeal text-xs font-medium">
              {slider.value}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={slider.value}
            onChange={(e) => handleChange(index, parseInt(e.target.value))}
            className="w-full cursor-pointer appearance-none h-2 rounded-full"
            style={{
              background: `linear-gradient(88.52deg, #005F73 3%, #6CC24A 140.48%) 0% / ${slider.value}% 100% no-repeat, #d1d5db`,
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              appearance: 'none',
            }}
          />
          <style>
            {`
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      background: linear-gradient(88.52deg, #005F73 3%, #6CC24A 140.48%);
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.2);
      position: relative;
    }

    input[type="range"]::-moz-range-thumb {
      width: 16px;
      height: 16px;
      background: linear-gradient(88.52deg, #005F73 3%, #6CC24A 140.48%);
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.2);
    }
  `}
          </style>
        </div>
      ))}
    </div>
  );
}
