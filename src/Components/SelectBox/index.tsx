import React, { useState } from 'react';

type SelectBoxProps = {
  onChange: (value: string) => void;
};

const SelectBox: React.FC<SelectBoxProps> = ({ onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block w-[120px]">
      <select
        onClick={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        className="block appearance-none w-full bg-backgroundColor-Secondary border-none py-2 px-4 pr-8 shadow-100 rounded-md leading-tight focus:outline-none text-[10px] text-Text-Secondary"
      >
        <option value="all">All</option>
        <option value="latest ">Latest enroll date</option>
        <option value="lowerScores">Lower Scores</option>
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

export default SelectBox;
