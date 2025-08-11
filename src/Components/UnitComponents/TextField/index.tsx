interface TextFieldProps {
  label: string;
  placeholder: string;
  value: string;
  isValid: boolean;
  validationText: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TextField: React.FC<TextFieldProps> = ({
  label,
  placeholder,
  onChange,
  value,
  isValid,
  validationText,
}) => {
  return (
    <>
      <div className="flex flex-col mt-5 w-full gap-2">
        <label
          htmlFor={'text-field-' + label.toLowerCase().replace(/\s+/g, '-')}
          className="text-xs font-medium text-Text-Primary"
        >
          {label}
        </label>
        <input
          id={'text-field-' + label.toLowerCase().replace(/\s+/g, '-')}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full h-[28px] rounded-[16px] py-1 px-3 border ${
            isValid ? 'border-Red' : 'border-Gray-50'
          } bg-backgroundColor-Card text-xs font-normal placeholder:text-Text-Fivefold`}
        />
        {!isValid && (
          <div className="text-Red text-[10px]">{validationText}</div>
        )}
      </div>
    </>
  );
};

export default TextField;
