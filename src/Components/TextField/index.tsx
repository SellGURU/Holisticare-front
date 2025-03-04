import { useState } from 'react';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
  type: 'text' | 'password' | 'email' | 'phone' | 'searchBox';
  inValid?: boolean;
  errorMessage?: string;
  newStyle?: boolean;
}

const TextField: React.FC<TextFieldProps> = ({
  label,
  className,
  inValid,
  errorMessage,
  onChange,
  type,
  newStyle,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const getInputType = () => {
    if (type === 'password' && showPassword) {
      return 'text';
    }
    return type;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value;

    if (type === 'email') {
      // Remove only leading spaces for email type
      const trimmedValue = value.replace(/^\s+/, '');
      // Alternatively, you can use: const trimmedValue = value.trimStart();

      // Only proceed if trimming changed the value
      if (trimmedValue !== value) {
        const newEvent = {
          ...event,
          target: {
            ...event.target,
            value: trimmedValue,
          },
        } as React.ChangeEvent<HTMLInputElement>;

        if (onChange) {
          onChange(newEvent);
        }
        return; // Exit early since we've handled the trimmed value
      }
    } else {
      // For non-email types, prevent leading spaces
      if (value.startsWith(' ')) {
        // Optionally, you can show a warning or simply ignore the input
        return; // Do not call onChange, effectively preventing the change
      }
    }

    // If no modifications are needed, call the original onChange handler
    if (onChange) {
      onChange(event);
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label className="text-Text-Primary text-[12px] font-medium">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={getInputType()}
          className={`w-full ${newStyle ? 'h-[28px]' : 'h-[32px]'}  ${newStyle && 'bg-[#FDFDFD]'} rounded-[16px] mt-1 border placeholder:text-xs placeholder:font-light placeholder:text-[#B0B0B0] text-[12px] px-3 outline-none ${
            inValid
              ? 'border-red-500'
              : newStyle
                ? 'border-[#E9EDF5]'
                : 'border-gray-50'
          } 
            ${type === 'password' ? 'pr-8' : ''}
           ${!newStyle && 'shadow-300'}`}
          {...props}
          onChange={handleChange}
        />
        {type === 'password' && (
          <div
            onClick={togglePassword}
            className="absolute top-3 right-0 pr-3 flex items-center text-sm cursor-pointer"
          >
            {showPassword ? (
              <img src="/icons/eye-slash.svg" alt="" />
            ) : (
              <img src="/icons/eye.svg" alt="" />
            )}
          </div>
        )}
      </div>
      {inValid && (
        <span className="text-red-500 text-[10px] mt-1">{errorMessage}</span>
      )}
    </div>
  );
};

export default TextField;
