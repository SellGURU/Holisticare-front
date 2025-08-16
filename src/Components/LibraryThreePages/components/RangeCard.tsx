interface RangeCardProps {
  value: number;
  // changeValue: (key: 'score' | 'title' | 'instruction', value: number) => void;
  onChange: (value: number) => void;
  // showValidation?: boolean;
  isValid?: boolean;
  validationText?: string;
}

const RangeCardLibraryThreePages: React.FC<RangeCardProps> = ({
  value,
  // changeValue,
  // showValidation = false,
  onChange,
  isValid,
  validationText,
}) => {
  // const [val, setVal] = useState(value);

  // useEffect(() => {
  //   if (value) {
  //     setVal(value);
  //   }
  // }, [value]);

  return (
    <div className="flex flex-col gap-2">
      <div className={`w-full rounded-[12px]`}>
        <input
          type="range"
          value={value}
          onChange={(e) => {
            // setVal(Number(e.target.value));
            onChange(Number(e.target.value));
            // changeValue('score', Number(e.target.value));
          }}
          min={0}
          max={10}
          className="w-full h-[2px] sliderCheckin border-none"
          style={{
            background: `linear-gradient(88.52deg, #6CC24A 3%, #6CC24A 140.48%) 0% / ${value * 10}% 100% no-repeat, #d1d5db`,
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            appearance: 'none',
          }}
        />
        <div className="w-full flex justify-between items-center">
          {Array.from({ length: 11 }, (_, index) => (
            <div
              key={index}
              className="text-[10px] ml-1 text-Text-Secondary cursor-pointer"
              onClick={() => {
                onChange(index);
              }}
            >
              {index}
            </div>
          ))}
        </div>
      </div>
      {!isValid && <div className="text-Red text-[10px]">{validationText}</div>}
    </div>
  );
};

export default RangeCardLibraryThreePages;
