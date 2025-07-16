const BoxValue = ({
  title,
  value,
  setVal,
}: {
  title: string;
  value: number;
  setVal: (value: number) => void;
}) => {
  const onChangeReduce = () => {
    if (value > 0) {
      setVal(value - 1);
    }
  };
  const onChangeIncrease = () => {
    if (value < 8) {
      setVal(value + 1);
    }
  };
  return (
    <div className="w-full p-3 rounded-xl border border-Gray-15 bg-backgroundColor-Secondary flex flex-col gap-1">
      <div className="text-xs font-medium text-Text-Primary">{title}</div>
      <div className="w-full flex justify-center items-center">
        <div className="flex items-center gap-2">
          <img
            src="/icons/reduce-green.svg"
            alt=""
            onClick={onChangeReduce}
            className="cursor-pointer"
          />
          <div className="w-[147px] h-[40px] border border-Gray-50 rounded-xl flex items-center justify-center">
            <span className="text-Text-Primary text-xs">{value}</span>
            <span className="text-Text-Quadruple text-xs">/8 Hour</span>
          </div>
          <img
            src="/icons/increase-green.svg"
            alt=""
            onClick={onChangeIncrease}
            className="cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default BoxValue;
