import { useState, useRef } from 'react';

type SelectProps = {
  onChange: (value: string) => void;
  options?: Array<string>;
  key?: string;
  isCapital?: boolean;
  isLarge?: boolean;
  value?: string;
};

const Select: React.FC<SelectProps> = ({
  onChange,
  options,
  key,
  isCapital,
  isLarge,
  value,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLSelectElement>(null);

  // Trigger native select dropdown when clicking the arrow
  const handleArrowClick = () => {
    selectRef.current?.click();
  };

  return (
    <div
      className={`relative inline-block ${isLarge ? 'w-full' : 'w-[120px]'}  cursor-pointer font-normal`}
    >
      <select
        value={value}
        onClick={() => setIsOpen(!isOpen)}
        ref={selectRef}
        onBlur={() => setIsOpen(false)}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(false);
        }}
        key={key}
        className={`block ${isCapital && 'capitalize'}  cursor-pointer appearance-none w-full bg-backgroundColor-Secondary border-none py-[9px] px-4 pr-8 shadow-100 rounded-[8px] leading-tight focus:outline-none text-[10px] text-Text-Secondary`}
      >
        {options?.map((el) => (
          <option key={el} value={el}>
            {el}
          </option>
        ))}
      </select>
      <img
        onClick={handleArrowClick}
        className={`w-3 h-3 object-contain opacity-80 absolute top-2 right-2 transition-transform duration-200 pointer-events-none ${
          isOpen ? 'rotate-180' : ''
        }`}
        src="/icons/arow-down-drop.svg"
        alt="dropdown arrow"
      />
    </div>
  );
};

export default Select;
