import { FC } from 'react';
import { Tooltip } from 'react-tooltip';

interface TextFieldProps {
  label: string;
  placeholder: string;
  value: string;
  isValid: boolean;
  validationText: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  InfoText?: string;
  margin?: string;
  disabled?: boolean;
}

const TextField: FC<TextFieldProps> = ({
  label,
  placeholder,
  onChange,
  value,
  isValid = true,
  validationText,
  InfoText,
  margin,
  disabled,
}) => {
  return (
    <>
      <div className={`flex flex-col w-full gap-2 ${margin ? margin : 'mt-5'}`}>
        <div className="text-xs font-medium text-Text-Primary flex gap-1 items-start">
          {label}
          {InfoText && (
            <img
              data-tooltip-id={`info-text-${label.toLowerCase().replace(/\s+/g, '-')}`}
              src="/icons/info-circle.svg"
              alt=""
            />
          )}
        </div>
        <input
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full h-[28px] rounded-[16px] py-1 px-3 border ${
            !isValid ? 'border-Red' : 'border-Gray-50'
          } bg-backgroundColor-Card text-xs font-normal placeholder:text-Text-Fivefold focus-visible:outline-none md:focus-visible:border-black`}
          disabled={disabled}
        />
        {validationText && (
          <div className="text-Red text-[10px]">{validationText}</div>
        )}
      </div>
      {!disabled && (
        <Tooltip
          id={`info-text-${label.toLowerCase().replace(/\s+/g, '-')}`}
          place="top-start"
          className="!bg-white !w-fit !text-wrap max-w-[300px]
                     !text-[#888888] !opacity-100 !bg-opacity-100 !shadow-100 text-justify !text-[10px] !rounded-[6px] !border !border-Gray-50 !p-2"
          style={{
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          {InfoText}
        </Tooltip>
      )}
    </>
  );
};

export default TextField;
