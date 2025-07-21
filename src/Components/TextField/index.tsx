import { useState } from 'react';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
  type: 'text' | 'password' | 'email' | 'phone' | 'searchBox' | 'number'; // <--- ADDED 'number'
  inValid?: boolean;
  errorMessage?: string;
  newStyle?: boolean;
  largeHeight?: boolean;
  titleRequired?: boolean;
  inputRef?: React.Ref<HTMLInputElement>; // <--- ADDED ref prop
  // Note: 'step' and other number-specific props will be passed via ...props
}

const TextField: React.FC<TextFieldProps> = ({
  label,
  className,
  inValid,
  errorMessage,
  onChange,
  type, // Use 'type' as defined by Controller, not just getInputType for number
  newStyle,
  largeHeight,
  titleRequired,
  inputRef, // <--- Destructure ref prop
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  // Keep getInputType for password toggle, but don't force 'text' for numbers
  const getInternalInputType = () => {
    if (type === 'password') {
      return showPassword ? 'text' : 'password';
    }
    // For other types, including 'number', use the type directly from props
    return type;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    if (type === 'email') {
      const trimmedValue = value.replace(/^\s+/, '');
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
        return;
      }
    } else if (type !== 'number') { // <--- Added condition to skip for 'number' type
      // For non-email and non-number types, prevent leading spaces
      if (value.startsWith(' ')) {
        return;
      }
    }

    // If no modifications are needed, or for number type, call the original onChange handler
    if (onChange) {
      onChange(event);
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label className="text-Text-Primary text-[12px] font-medium">
          {label} {titleRequired && <span className="text-Red">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef} // <--- Pass the ref here
          type={getInternalInputType()} // Use the internal type resolver
          className={`w-full ${newStyle ? 'h-[28px]' : 'h-[32px]'} ${largeHeight && '!h-[100px] placeholder:text-start text-start flex items-start j align-top pt-0'} ${newStyle && 'bg-[#FDFDFD] '} rounded-[16px] mt-1 border placeholder:text-xs placeholder:font-light placeholder:text-[#B0B0B0] text-[12px] px-3 outline-none ${
            inValid
              ? 'border-Red'
              : newStyle
                ? 'border-[#E9EDF5]'
                : 'border-gray-50'
          } 
            ${type === 'password' ? 'pr-8' : ''}
            ${!newStyle && 'shadow-300'}`}
          {...props} // <--- Pass all other props (like 'step', 'value', 'name', 'onBlur', 'id')
          onChange={handleChange} // Use your custom handleChange
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
        <span className="text-Red text-[10px] mt-1">{errorMessage}</span>
      )}
    </div>
  );
};

export default TextField;