/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef } from 'react';
import useModalAutoClose from '../../hooks/UseModalAutoClose';
import Checkbox from '../checkbox';
interface CustomSelectProps {
  label?: string;
  options: Array<string>;
  selectedOption: string | Array<string>;
  onOptionSelect: (options: any) => void;
  placeHolder?: string;
  isMulti?: boolean;
  wfull?: boolean;
}
const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  options,
  selectedOption,
  onOptionSelect,
  placeHolder,
  wfull,
  isMulti,
}) => {
  const [showSelect, setShowSelect] = useState(false);
  const selectButRef = useRef(null);
  const selectRef = useRef(null);
  useModalAutoClose({
    refrence: selectRef,
    buttonRefrence: selectButRef,
    close: () => setShowSelect(false),
  });
  const handleSelect = (newValue: string) => {
    if (typeof selectedOption === 'string') {
      onOptionSelect(newValue);
    } else {
      if (selectedOption.includes(newValue)) {
        onOptionSelect(
          selectedOption.filter((option: string) => option !== newValue),
        );
      } else {
        onOptionSelect([...selectedOption, newValue]);
      }
    }
  };
  return (
    <div className="flex flex-col relative min-w-[181px]  text-xs font-medium">
      {label && <label className="mb-1">{label}</label>}

      <div
        ref={selectButRef}
        onClick={() => {
          setShowSelect(!showSelect);
        }}
        className={`w-full ${wfull ? 'md:w-full' : 'md:w-[181px]'}  cursor-pointer h-[28px] flex justify-between items-center px-3 bg-[#FDFDFD] ${showSelect && options.length > 0 && 'rounded-b-none'} rounded-[16px] border border-[#E9EDF5]`}
      >
        {selectedOption && selectedOption != '' ? (
          <div className="text-[12px] text-[#383838] max-w-[140px] truncate">
            {Array.isArray(selectedOption)
              ? selectedOption.join(', ')
              : selectedOption}
          </div>
        ) : (
          <div className="text-[12px] text-[#B0B0B0] font-light">
            {placeHolder}
          </div>
        )}
        <div>
          <img
            className={`${showSelect && options.length > 1 && 'rotate-180'}`}
            src="/icons/arow-down-drop.svg"
            alt=""
          />
        </div>
      </div>
      {showSelect && options.length > 0 && (
        <div
          ref={selectRef}
          className={` w-[181px] ${wfull ? 'md:w-full' : 'md:w-[181px]'} max-h-[380px] overflow-auto z-20 shadow-200  rounded-[16px] rounded-t-none absolute bg-white border border-[#E9EDF5] top-[28px]`}
        >
          {isMulti ? (
            <>
              {options.map((option) => (
                <div
                  key={option}
                  onClick={() => {
                    if (option != 'None') {
                      handleSelect(option);
                    } else {
                      onOptionSelect(isMulti ? [] : '');
                    }
                    // setShowSelect(false);
                  }}
                  className={`text-[12px] flex items-center p-2 ${selectedOption.includes(option) ? 'bg-bg-color' : ''} cursor-pointer text-Text-Primary py-1`}
                >
                  <Checkbox
                    checked={selectedOption.includes(option)}
                    onChange={() => {}}
                  ></Checkbox>
                  {option}
                </div>
              ))}
            </>
          ) : (
            <>
              {options.map((option) => (
                <div
                  key={option}
                  onClick={() => {
                    if (option != 'None') {
                      onOptionSelect(option);
                    } else {
                      onOptionSelect('');
                    }
                    setShowSelect(false);
                  }}
                  className="text-[12px] cursor-pointer text-Text-Primary px-2 py-1"
                >
                  {option}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
