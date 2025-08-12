import { FC, useState } from 'react';

interface SelectBoxFieldProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  isValid?: boolean;
  validationText?: string;
  margin?: string;
  disabled?: boolean;
  placeholder: string;
}

const SelectBoxField: FC<SelectBoxFieldProps> = ({
  label,
  options,
  value,
  onChange,
  isValid,
  validationText,
  margin,
  disabled,
  placeholder,
}) => {
  const [showSelect, setShowSelect] = useState(false);
  return (
    <div
      className={`w-full relative overflow-visible mt-1 ${margin ? margin : 'mb-4'}`}
    >
      <label className="text-xs font-medium text-Text-Primary">{label}</label>
      <div
        onClick={() => !disabled && setShowSelect(!showSelect)}
        className={`w-full cursor-pointer h-[28px] flex justify-between items-center px-3 bg-backgroundColor-Card rounded-[16px] border mt-1 ${
          isValid ? 'border-Red' : 'border-Gray-50'
        }`}
      >
        {value ? (
          <div className="text-[12px] text-Text-Primary">{value}</div>
        ) : (
          <div className="text-[12px] text-gray-400">{placeholder}</div>
        )}
        <div>
          <img
            className={`${showSelect && 'rotate-180'}`}
            src="/icons/arow-down-drop.svg"
            alt=""
          />
        </div>
      </div>
      {validationText && (
        <div className="text-Red text-[10px] mt-1">{validationText}</div>
      )}
      {showSelect && (
        <div className="w-full z-20 shadow-200 py-1 px-3 rounded-br-2xl rounded-bl-2xl absolute bg-backgroundColor-Card border border-gray-50 top-[56px]">
          {options.map((option, index) => {
            return (
              <div
                key={index}
                onClick={() => {
                  onChange(option);
                  setShowSelect(false);
                }}
                className="text-[12px] text-Text-Primary my-1 cursor-pointer"
              >
                {option}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SelectBoxField;
