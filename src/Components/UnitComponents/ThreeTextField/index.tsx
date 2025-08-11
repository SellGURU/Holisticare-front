import { FC } from 'react';
import { Tooltip } from 'react-tooltip';

interface ThreeTextFieldProps {
  label: string;
  onePlaceholder: string;
  twoPlaceholder: string;
  threePlaceholder: string;
  oneValue: string;
  twoValue: string;
  threeValue: string;
  oneIsValid: boolean;
  twoIsValid: boolean;
  threeIsValid: boolean;
  validationText: string;
  oneOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  twoOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  threeOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  oneLabel: string;
  twoLabel: string;
  threeLabel: string;
  oneUnit: string;
  twoUnit: string;
  threeUnit: string;
  InfoText?: string;
  margin?: string;
}

const ThreeTextField: FC<ThreeTextFieldProps> = ({
  label,
  onePlaceholder,
  twoPlaceholder,
  threePlaceholder,
  oneValue,
  twoValue,
  threeValue,
  oneOnChange,
  twoOnChange,
  threeOnChange,
  oneIsValid,
  twoIsValid,
  threeIsValid,
  validationText,
  onPaste,
  oneLabel,
  twoLabel,
  threeLabel,
  oneUnit,
  twoUnit,
  threeUnit,
  InfoText,
  margin,
}) => {
  return (
    <>
      <div className={`flex flex-col w-full ${margin ? margin : 'mt-3.5'}`}>
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
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between mt-3 gap-4">
            {/* Carbs Input */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <div className="text-[10px] font-medium text-Text-Primary">
                  {oneLabel}
                </div>
                <div className="text-[10px] text-Text-Quadruple">{oneUnit}</div>
              </div>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder={onePlaceholder}
                value={oneValue}
                onChange={oneOnChange}
                onPaste={onPaste}
                className={`w-full h-[28px] rounded-[16px] py-1 px-3 border ${
                  oneIsValid ? 'border-Red' : 'border-Gray-50'
                } bg-backgroundColor-Card text-xs font-normal placeholder:text-Text-Fivefold`}
              />
            </div>

            {/* Proteins Input */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <div className="text-[10px] font-medium text-Text-Primary">
                  {twoLabel}
                </div>
                <div className="text-[10px] text-Text-Quadruple">{twoUnit}</div>
              </div>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder={twoPlaceholder}
                value={twoValue}
                onChange={twoOnChange}
                onPaste={onPaste}
                className={`w-full h-[28px] rounded-[16px] py-1 px-3 border ${
                  twoIsValid ? 'border-Red' : 'border-Gray-50'
                } bg-backgroundColor-Card text-xs font-normal placeholder:text-Text-Fivefold`}
              />
            </div>

            {/* Fats Input */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <div className="text-[10px] font-medium text-Text-Primary">
                  {threeLabel}
                </div>
                <div className="text-[10px] text-Text-Quadruple">
                  {threeUnit}
                </div>
              </div>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder={threePlaceholder}
                value={threeValue}
                onChange={threeOnChange}
                onPaste={onPaste}
                className={`w-full h-[28px] rounded-[16px] py-1 px-3 border ${
                  threeIsValid ? 'border-Red' : 'border-Gray-50'
                } bg-backgroundColor-Card text-xs font-normal placeholder:text-Text-Fivefold`}
              />
            </div>
          </div>
          {validationText && (
            <div className="text-Red text-[10px]">{validationText}</div>
          )}
        </div>
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

export default ThreeTextField;
