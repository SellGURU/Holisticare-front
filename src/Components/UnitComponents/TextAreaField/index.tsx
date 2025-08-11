import { FC } from 'react';

interface TextAreaFieldProps {
  label: string;
  placeholder: string;
  value: string;
  isValid?: boolean;
  validationText?: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  margin?: string;
}

const TextAreaField: FC<TextAreaFieldProps> = ({
  label,
  placeholder,
  value,
  onChange,
  isValid,
  validationText,
  margin,
}) => {
  return (
    <div className={`flex flex-col w-full gap-2 ${margin ? margin : 'mt-4'}`}>
      <div className="text-xs font-medium text-Text-Primary">{label}</div>
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full h-[98px] text-justify rounded-[16px] py-1 px-3 border ${
          isValid ? 'border-Red' : 'border-Gray-50'
        } bg-backgroundColor-Card text-xs font-normal placeholder:text-Text-Fivefold resize-none`}
      />
      {validationText && (
        <div className="text-Red text-[10px]">{validationText}</div>
      )}
    </div>
  );
};

export default TextAreaField;
