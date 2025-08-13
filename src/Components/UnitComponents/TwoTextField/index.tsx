import { FC } from 'react';
import { Tooltip } from 'react-tooltip';

interface TwoTextFieldProps {
  label: string;
  onePlaceholder: string;
  twoPlaceholder: string;
  oneValue: string;
  twoValue: string;
  isValid: boolean;
  validationText: string;
  oneOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  twoOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  InfoText?: string;
  margin?: string;
}

const TwoTextField: FC<TwoTextFieldProps> = ({
  label,
  onePlaceholder,
  twoPlaceholder,
  oneOnChange,
  twoOnChange,
  oneValue,
  twoValue,
  isValid = true,
  validationText,
  onPaste,
  InfoText,
  margin,
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
        <div className="flex w-full gap-3">
          <input
            placeholder={onePlaceholder}
            value={oneValue}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            onChange={oneOnChange}
            onPaste={onPaste}
            className={`w-full h-[28px] rounded-[16px] py-1 px-3 border ${
              !isValid ? 'border-Red' : 'border-Gray-50'
            } bg-backgroundColor-Card text-xs font-normal placeholder:text-Text-Fivefold`}
          />

          <input
            placeholder={twoPlaceholder}
            value={twoValue}
            type="text"
            onChange={twoOnChange}
            className={`w-full h-[28px] rounded-[16px] py-1 px-3 border  border-Gray-50
                   bg-backgroundColor-Card text-xs font-normal placeholder:text-Text-Fivefold`}
          />
        </div>
        {validationText && (
          <div className="text-Red text-[10px]">{validationText}</div>
        )}
      </div>
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
    </>
  );
};

export default TwoTextField;
