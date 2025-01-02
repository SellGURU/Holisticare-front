import { useState } from "react";

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
  type: "text" | "password" | "email" | "phone" | "searchBox";
  inValid?: boolean;
  errorMessage?: string;
}

const TextField: React.FC<TextFieldProps> = ({
  label,
  className,
  inValid,
  errorMessage,
  type,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const getInputType = () => {
    if (type === "password" && showPassword) {
      return "text";
    }
    return type;
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
          className={`w-full h-[32px] rounded-[16px] mt-1 border placeholder:text-gray-400 text-[12px] px-3 outline-none ${
            inValid ? "border-red-500" : "border-gray-50"
          } shadow-300`}
          {...props}
        />
        {type === "password" && (
          <div
            onClick={togglePassword}
            className="absolute top-2 right-0 pr-3 flex items-center text-sm cursor-pointer"
          >
            {showPassword ? (
                <img src="/icons/eyeOff.svg" alt="" />
            ) : (
                <img src="/icons/eyeOn.svg" alt="" />

            )}
          </div>
        )}
      </div>
      {inValid &&  (
        <span className="text-red-500 text-[10px] mt-1">{errorMessage}</span>
      )}
    </div>
  );
};

export default TextField;