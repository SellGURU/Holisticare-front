import { FC, useState } from 'react';
import { Tooltip } from 'react-tooltip';

/* ===================== TYPES ===================== */

type BaseProps = {
  label?: string;
  InfoText?: string;
  margin?: string;
  isValid?: boolean;
  validationText?: string;
  className?: string;
};

type InputVariantProps = BaseProps &
  React.InputHTMLAttributes<HTMLInputElement> & {
    variant?: 'input';
    type?: 'text' | 'password' | 'email' | 'number' | 'phone' | 'searchBox';
    newStyle?: boolean;
    largeHeight?: boolean;
    titleRequired?: boolean;
    inputRef?: React.Ref<HTMLInputElement>;
  };

type TextAreaVariantProps = BaseProps & {
  variant: 'textarea';
  value: string;
  placeholder?: string;
  height?: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
};

type MultiInputBox = {
  placeholder: string;
  value: string;
  mode: 'numeric' | 'text';
  pattern: string;
  label?: string;
  unit?: string;
  isValid?: boolean;
};

type MultiVariantProps = BaseProps & {
  variant: 'multi';
  inputs: MultiInputBox[];
  onchanges: (val: MultiInputBox[]) => void;
  onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void;
};

type UnifiedFieldProps =
  | InputVariantProps
  | TextAreaVariantProps
  | MultiVariantProps;

/* ===================== COMPONENT ===================== */

const UnifiedField: FC<UnifiedFieldProps> = (props) => {
  const [showPassword, setShowPassword] = useState(false);

  /* ===================== INPUT ===================== */
  if (!props.variant || props.variant === 'input') {
    const {
      label,
      InfoText,
      margin,
      isValid = true,
      validationText,
      type = 'text',
      inputRef,
      newStyle,
      largeHeight,
      titleRequired,
      className,
      onChange,
    } = props;

    const tooltipId = label
      ? `info-${label.toLowerCase().replace(/\s+/g, '-')}`
      : undefined;

    const getInternalInputType = () => {
      if (type === 'password') {
        return showPassword ? 'text' : 'password';
      }
      // For other types, including 'number', use the type directly from props
      return type;
    };

    /* ---------- Sanitization ---------- */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;

      if (type === 'email') {
        value = value.replace(/^\s+/, '');
      } else if (type !== 'number' && value.startsWith(' ')) {
        return;
      }

      if (type === 'number') {
        value = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
      }

      onChange?.({
        ...e,
        target: { ...e.target, value },
      });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (type !== 'number') return;

      if (
        /[0-9]/.test(e.key) ||
        ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(
          e.key,
        )
      ) {
        return;
      }

      if (e.key === '.') {
        const value = (e.target as HTMLInputElement).value;
        if (value.includes('.')) e.preventDefault();
        return;
      }

      e.preventDefault();
    };
    const handleNumberInput = (event: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = event.target.value;

      // Keep only digits and one dot
      const sanitized = rawValue
        .replace(/[^0-9.]/g, '') // allow digits + dot
        .replace(/(\..*)\./g, '$1'); // prevent multiple dots

      // Only trigger change if sanitized value is different
      if (sanitized !== rawValue) {
        const newEvent = {
          ...event,
          target: {
            ...event.target,
            value: sanitized,
          },
        } as React.ChangeEvent<HTMLInputElement>;

        onChange?.(newEvent);
      } else {
        onChange?.(event);
      }
    };

    const togglePassword = () => {
      setShowPassword((prevShowPassword) => !prevShowPassword);
    };

    return (
      <div className={`flex flex-col ${className} ${margin ? margin : 'mt-5'}`}>
        {label && (
          <label className="text-Text-Primary text-[10px] md:text-[12px] font-medium">
            {label} {titleRequired && <span className="text-Red">*</span>}
            {InfoText && (
              <img
                data-tooltip-id={tooltipId}
                src="/icons/info-circle.svg"
                alt=""
              />
            )}
          </label>
        )}
        <div className="relative">
          <input
            onKeyDown={handleKeyDown}
            ref={inputRef} // <--- Pass the ref here
            type={getInternalInputType()} // Use the internal type resolver
            className={`w-full ${newStyle ? 'h-[28px]' : 'h-[32px]'} ${largeHeight && '!h-[100px] placeholder:text-start text-start flex items-start j align-top pt-0'} ${!newStyle ? 'bg-backgroundColor-Card ' : 'bg-[#FDFDFD]'} rounded-[16px] mt-1 border placeholder:text-[10px] md:placeholder:text-xs placeholder:font-light placeholder:text-Text-Fivefold text-[10px] md:text-[12px] px-3 text-Text-Primary outline-none ${
              !isValid
                ? 'border-Red'
                : newStyle
                  ? 'border-[#E9EDF5]'
                  : 'border-gray-50'
            } 
            ${type === 'password' ? 'pr-8' : ''}
            ${!newStyle && 'shadow-300'}`}
            {...props} // <--- Pass all other props (like 'step', 'value', 'name', 'onBlur', 'id')
            onChange={type === 'number' ? handleNumberInput : handleChange}
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
        {validationText && (
          <span className="text-Red text-[10px] mt-1">{validationText}</span>
        )}
      </div>
    );
  }

  /* ===================== TEXTAREA ===================== */
  if (props.variant === 'textarea') {
    const {
      label,
      InfoText,
      margin,
      value,
      placeholder,
      onChange,
      onKeyDown,
      height,
      isValid = true,
      validationText,
    } = props;

    const tooltipId = label
      ? `info-${label.toLowerCase().replace(/\s+/g, '-')}`
      : undefined;

    return (
      <div className={`flex flex-col gap-2 ${margin ?? 'mt-4'}`}>
        {label && (
          <div className="flex gap-1 text-xs font-medium">
            {label}
            {InfoText && tooltipId && (
              <img
                src="/icons/info-circle.svg"
                alt=""
                data-tooltip-id={tooltipId}
              />
            )}
          </div>
        )}

        <textarea
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          onKeyDown={onKeyDown}
          className={`rounded-[16px] px-3 py-2 text-xs resize-none border
            ${height ?? 'h-[98px]'}
            ${!isValid ? 'border-Red' : 'border-Gray-50'}`}
        />

        {validationText && (
          <div className="text-Red text-[10px]">{validationText}</div>
        )}

        {InfoText && tooltipId && <Tooltip id={tooltipId}>{InfoText}</Tooltip>}
      </div>
    );
  }

  /* ===================== MULTI ===================== */
  const {
    label,
    inputs,
    onchanges,
    validationText,
    InfoText,
    margin,
    onPaste,
  } = props as MultiVariantProps;

  const tooltipId = label
    ? `info-${label.toLowerCase().replace(/\s+/g, '-')}`
    : undefined;

  return (
    <div className={`flex flex-col gap-2 ${margin ?? 'mt-4'}`}>
      <div className="flex gap-1 text-xs font-medium">
        {label}
        {InfoText && tooltipId && (
          <img
            src="/icons/info-circle.svg"
            alt=""
            data-tooltip-id={tooltipId}
          />
        )}
      </div>

      <div className="flex gap-3">
        {inputs.map((el, idx) => (
          <input
            key={idx}
            value={el.value}
            placeholder={el.placeholder}
            inputMode={el.mode}
            pattern={el.pattern}
            onPaste={onPaste}
            onChange={(e) =>
              onchanges(
                inputs.map((i, iIdx) =>
                  iIdx === idx ? { ...i, value: e.target.value } : i,
                ),
              )
            }
            className={`h-[28px] rounded-[16px] px-3 text-xs border
              ${!el.isValid ? 'border-Red' : 'border-Gray-50'}`}
          />
        ))}
      </div>

      {validationText && (
        <div className="text-Red text-[10px]">{validationText}</div>
      )}

      {InfoText && tooltipId && <Tooltip id={tooltipId}>{InfoText}</Tooltip>}
    </div>
  );
};

export default UnifiedField;
