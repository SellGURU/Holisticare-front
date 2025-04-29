/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useState } from 'react';
import useModalAutoClose from '../../hooks/UseModalAutoClose';
interface CustomSelectProps {
  label?: string;
  options: Array<string>;
  selectedOption: string | Array<string>;
  onOptionSelect: (options: any) => void;
  placeHolder?: string;
  isMulti?: boolean;
  wfull?: boolean;
  showTop?: boolean;
}
const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  options,
  selectedOption,
  onOptionSelect,
  placeHolder,
  wfull,
  isMulti,
  showTop,
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
        className={`w-full ${wfull ? 'md:w-full' : 'md:w-[181px]'}  cursor-pointer h-[28px] flex justify-between items-center px-3 bg-[#FDFDFD] ${showSelect && options.length > 0 ? (showTop ? 'rounded-t-none' : 'rounded-b-none') : ''} rounded-[16px] border border-[#E9EDF5]`}
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
          className={`w-[181px] ${wfull ? 'md:w-full' : 'md:w-[181px]'} max-h-[380px] overflow-auto z-20 absolute bg-white border border-[#E9EDF5] ${
            showTop
              ? 'bottom-[28px] rounded-b-none'
              : 'top-[28px] rounded-t-none shadow-200'
          } rounded-[16px]`}
        >
          {isMulti ? (
            <>
              {options.map((option) => (
                <div
                  key={option}
                  onClick={() => {
                    if (option !== 'None') {
                      handleSelect(option);
                    } else {
                      onOptionSelect(isMulti ? [] : '');
                    }
                  }}
                  className={`text-[12px] flex items-center p-2 ${
                    selectedOption.includes(option) ? 'bg-bg-color' : ''
                  } cursor-pointer text-Text-Primary py-1`}
                >
                  <div
                    className={`h-4 w-4 flex items-center justify-center rounded border border-Primary-DeepTeal mr-1.5 ${
                      selectedOption.includes(option)
                        ? 'bg-Primary-DeepTeal border-none'
                        : 'bg-white'
                    }`}
                    onClick={() => {
                      if (option !== 'None') {
                        handleSelect(option);
                      } else {
                        onOptionSelect(isMulti ? [] : '');
                      }
                    }}
                  >
                    {selectedOption.includes(option) && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
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
                    if (option !== 'None') {
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
