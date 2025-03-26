import React, { useState, useRef } from 'react';
import useModalAutoClose from '../../hooks/UseModalAutoClose';
interface CustomSelectProps {
  label?: string;
  options: Array<string>;
  selectedOption: string;
  onOptionSelect: (options: string) => void;
  placeHolder?: string;
}
const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  options,
  selectedOption,
  onOptionSelect,
  placeHolder,
}) => {
  const [showSelect, setShowSelect] = useState(false);
  const selectButRef = useRef(null);
  const selectRef = useRef(null);
  useModalAutoClose({
    refrence: selectRef,
    close: () => setShowSelect(false),
  });
  return (
    <div className="flex flex-col relative min-w-[181px] text-xs font-medium">
      {label && <label className="mb-1">{label}</label>}

      <div
        ref={selectButRef}
        onClick={() => {
          setShowSelect(!showSelect);
        }}
        className={`w-full md:w-[181px] cursor-pointer h-[28px] flex justify-between items-center px-3 bg-[#FDFDFD] ${showSelect && options.length > 0 && 'rounded-b-none'} rounded-[16px] border border-[#E9EDF5]`}
      >
        {selectedOption ? (
          <div className="text-[12px] text-[#383838] max-w-[140px] truncate">
            {selectedOption}
          </div>
        ) : (
          <div className="text-[12px] text-[#B0B0B0] font-light">
            {placeHolder}
          </div>
        )}
        <div>
          <img
            className={`${showSelect && 'rotate-180'}`}
            src="/icons/arow-down-drop.svg"
            alt=""
          />
        </div>
      </div>
      {showSelect && options.length > 0 && (
        <div
          ref={selectRef}
          className="w-[181px] max-h-[380px] overflow-auto z-20 shadow-200 p-2 rounded-[16px] rounded-t-none absolute bg-white border border-[#E9EDF5] top-[28px]"
        >
          {options.map((option) => (
            <div
              key={option}
              onClick={() => {
                onOptionSelect(option);
                setShowSelect(false);
              }}
              className="text-[12px] cursor-pointer text-Text-Primary py-1"
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
