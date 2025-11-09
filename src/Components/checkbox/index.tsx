import React from 'react';

type CheckboxProps = {
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  borderColor?: string;
  width?: string;
  height?: string;
  isDisabled?: boolean;
};

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  borderColor = 'border-Primary-DeepTeal',
  width = 'w-4',
  height = 'h-4',
  isDisabled = false,
}) => {
  const resolveCheckBoxColor = () => {
    if (checked) {
      return 'bg-Primary-DeepTeal border-none';
    }
    if (isDisabled) {
      return 'bg-Text-Secondary border-Gray-200';
    }
    return 'bg-white';
  };
  return (
    <label className="flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="hidden"
      />
      <div
        className={`${width} ${height} flex items-center  justify-center rounded border ${borderColor} ${resolveCheckBoxColor()}`}
      >
        {checked && (
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
      <span
        className={`text-xs ${checked ? 'text-Primary-DeepTeal' : 'text-Text-Secondary'} ml-[6px] capitalize`}
      >
        {label}
      </span>
    </label>
  );
};

export default Checkbox;
