import { FC } from 'react';
import { Tooltip } from 'react-tooltip';

interface TextAreaFieldProps {
  label: string;
  placeholder: string;
  value: string;
  isValid?: boolean;
  validationText?: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  margin?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  InfoText?: string;
  height?: string;
}

const TextAreaField: FC<TextAreaFieldProps> = ({
  label,
  placeholder,
  value,
  onChange,
  isValid = true,
  validationText,
  margin,
  onKeyDown,
  InfoText,
  height,
}) => {
  return (
    <div className={`flex flex-col w-full gap-2 ${margin ? margin : 'mt-4'}`}>
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
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full ${height ? height : 'h-[98px]'} text-justify rounded-[16px] py-1 px-3 border ${
          !isValid ? 'border-Red' : 'border-Gray-50'
        } bg-backgroundColor-Card text-xs font-normal placeholder:text-Text-Fivefold resize-none`}
        onKeyDown={onKeyDown}
      />
      {validationText && (
        <div className="text-Red text-[10px]">{validationText}</div>
      )}
      {InfoText && (
        <Tooltip
          id={`info-text-${label.toLowerCase().replace(/\s+/g, '-')}`}
          place="top-start"
          className="!bg-white !max-w-[300px] !leading-5 !text-wrap !shadow-100 !text-Text-Primary !text-[10px] !rounded-[6px] !border !border-Gray-50 flex flex-col !z-[99999]"
        >
          {InfoText}
        </Tooltip>
      )}
    </div>
  );
};

export default TextAreaField;
