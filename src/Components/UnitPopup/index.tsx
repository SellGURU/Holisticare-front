import { useRef, useState } from 'react';
import useModalAutoClose from '../../hooks/UseModalAutoClose';

/* eslint-disable @typescript-eslint/no-explicit-any */
const UnitPopUp = ({ unit }: { unit: any }) => {
  const [activeUnit, setActiveUnit] = useState(unit);
  const units = ['mg/dL', 'mmol/L'];
  const [isUnitOpen, setIsUnitOpen] = useState(false);
  const handleToggle = () => {
    setIsUnitOpen(!isUnitOpen);
  };
  const handleSelect = (unit: string) => {
    setActiveUnit(unit);
    setIsUnitOpen(false);
  };
  const refrence = useRef(null);
  useModalAutoClose({
    refrence: refrence,
    close: () => {
      setIsUnitOpen(false);
    },
  });
  return (
    <>
      <div
      ref={refrence}
        onClick={handleToggle}
        className="w-[70px] cursor-pointer select-none flex justify-between items-center p-2 h-[32px] rounded-[6px]  bg-backgroundColor-Main border-gray-50"
      >
        <div className="text-Primary-DeepTeal text-[10px]">{activeUnit}</div>
        <div className="w-[16px]">
          <img
            className={`${isUnitOpen ? 'rotate-180' : ''}`}
            src="/icons/arrow-down-green.svg"
            alt=""
          />
        </div>
      </div>
      {isUnitOpen && (
        <div
          
          className="absolute select-none mt-1 w-[70px] bg-white border z-30 border-gray-200 rounded shadow-md"
        >
          {units.map((unit) => (
            <div
              key={unit}
              onClick={() => handleSelect(unit)}
              className={`p-2 text-[10px] ${
                unit === activeUnit ? 'text-Primary-DeepTeal' : 'text-gray-500'
              } cursor-pointer hover:bg-gray-100`}
            >
              {unit}
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default UnitPopUp;
