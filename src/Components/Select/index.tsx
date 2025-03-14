import React, { useState } from 'react';
type SelectProps = {
  onChange: (value: string) => void;
  options?: Array<string>;
  key?: string;
};

const Select: React.FC<SelectProps> = ({ onChange, options, key }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block w-[120px] font-normal">
      <select
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setIsOpen(false)}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(false); // Close the dropdown after selection
        }}
        key={key}
        className="block appearance-none w-full bg-backgroundColor-Secondary border-none py-[9px] px-4 pr-8 shadow-100 rounded-[8px] leading-tight focus:outline-none text-[10px] text-Text-Secondary"
      >
        {options?.map((el) => {
          return (
            <>
              <option value={el}>{el}</option>
            </>
          );
        })}
      </select>
      <img
        className={` w-3 h-3 object-contain opacity-80 absolute top-2 right-2 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`}
        src="/icons/arow-down-drop.svg"
        alt=""
      />
    </div>
  );
};

export default Select;
