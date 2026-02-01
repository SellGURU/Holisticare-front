import { FC, useEffect, useRef, useState } from 'react';
import { resolveCategoryName } from '../../../help';
// import EllipsedTooltip from '../../LibraryThreePages/components/TableNoPaginate/ElipsedTooltip';

interface SelectBoxFieldProps {
  label?: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  isValid?: boolean;
  validationText?: string;
  disabledIndexs?: Array<number>;
  margin?: string;
  disabled?: boolean;
  showDisabled?: boolean;
  placeholder: string;
  top?: string;
  position?: 'top' | 'bottom';
  bottom?: string;
  prefix?: string;
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
  disabledIndexs,
  position = 'top',
  bottom,
  prefix,
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
      {label && (
        <label
          className={`text-xs font-medium text-Text-Primary ${showDisabled ? 'opacity-50' : 'opacity-100'}`}
          htmlFor="select-box-field"
          onClick={() => setShowSelect(false)}
        >
          {label}
        </label>
      )}
      <div
        onClick={() => !disabled && setShowSelect(!showSelect)}
        id="select-box-field"
        className={`w-full h-[28px] overflow-hidden flex justify-between items-center px-3 bg-backgroundColor-Card rounded-[16px] border mt-1 ${
          !isValid ? 'border-Red' : 'border-Gray-50'
        } ${showDisabled ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'}`}
      >
        {value ? (
          <div className="text-[12px] relative  text-Text-Primary ">
            {/* {prefix && prefix+ (index+1)+' :'} */}
            {resolveCategoryName(value)}
            {/* <EllipsedTooltip  text={resolveCategoryName(value)}></EllipsedTooltip> */}
          </div>
        ) : (
          <div className="text-[10px] md:text-[12px] text-Text-Fivefold">
            {placeholder}
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
      {validationText && (
        <div className="text-Red text-[10px] mt-1">{validationText}</div>
      )}
      {showSelect && (
        <div
          className={`w-full z-20 shadow-200 py-1 px-3 rounded-br-2xl rounded-bl-2xl absolute bg-backgroundColor-Card border border-gray-50 ${label ? 'max-h-[250px]' : 'max-h-[200px]'} ${position === 'top' ? (top ? top : 'top-[56px]') : bottom ? bottom : 'bottom-[56px]'} overflow-y-auto`}
        >
          {options.map((option, index) => {
            return (
              <div
                key={index}
                onClick={() => {
                  if (!disabledIndexs?.includes(index)) {
                    onChange(option);
                    setShowSelect(false);
                  }
                }}
                className={`${disabledIndexs?.includes(index) ? 'opacity-50' : 'opacity-100 hover:bg-Gray-100 '} text-[12px] text-Text-Primary  my-1 cursor-pointer rounded-lg py-1 px-2 text-ellipsis overflow-hidden text-nowrap`}
              >
                {prefix && prefix + (index + 1) + ' :'}
                {resolveCategoryName(option)}
                {/* <EllipsedTooltip text={resolveCategoryName(option)}></EllipsedTooltip> */}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SelectBoxField;
