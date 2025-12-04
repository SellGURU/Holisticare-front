import { FC, useEffect, useRef, useState } from 'react';

interface SelectBoxFieldProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  isValid?: boolean;
  validationText?: string;
  margin?: string;
  disabled?: boolean;
  showDisabled?: boolean;
  placeholder: string;
  top?: string;
}

const SelectBoxField: FC<SelectBoxFieldProps> = ({
  label,
  options,
  value,
  onChange,
  isValid = true,
  validationText,
  margin,
  disabled,
  placeholder,
  showDisabled,
  top,
}) => {
  const [showSelect, setShowSelect] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSelect(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  return (
    <div
      ref={wrapperRef}
      className={`w-full relative overflow-visible ${margin ? margin : 'mt-1 mb-4'}`}
    >
      <label
        className={`text-xs font-medium text-Text-Primary ${showDisabled ? 'opacity-50' : 'opacity-100'}`}
        htmlFor="select-box-field"
        onClick={() => setShowSelect(false)}
      >
        {label}
      </label>
      <div
        onClick={() => !disabled && setShowSelect(!showSelect)}
        id="select-box-field"
        className={`w-full h-[28px] flex justify-between items-center px-3 bg-backgroundColor-Card rounded-[16px] border mt-1 ${
          !isValid ? 'border-Red' : 'border-Gray-50'
        } ${showDisabled ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'}`}
      >
        {value ? (
          <div className="text-[12px] text-Text-Primary">{value}</div>
        ) : (
          <div className="text-[12px] text-Text-Fivefold">{placeholder}</div>
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
        <div
          className={`w-full z-20 shadow-200 py-1 px-3 rounded-br-2xl rounded-bl-2xl absolute bg-backgroundColor-Card border border-gray-50 ${top ? top : 'top-[56px]'} max-h-[250px] overflow-y-auto`}
        >
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
