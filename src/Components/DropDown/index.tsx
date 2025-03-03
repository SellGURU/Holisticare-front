import React, { useRef, useState } from 'react';
import useModalAutoClose from '../../hooks/UseModalAutoClose';

interface DropdownProps {
  options: string[];
  selectedOption: string;
  onOptionSelect: (option: string) => void;
}

export const Dropdown: React.FC<DropdownProps> = ({ options, selectedOption, onOptionSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionSelect = (option: string) => {
    onOptionSelect(option);
    setIsOpen(false);
  };
  const modalRef = useRef(null)
  useModalAutoClose({
    refrence: modalRef,
    close: ()=> setIsOpen(false)
  })

  return (
    <div ref={modalRef} className="relative">
      <div
        className={` ${isOpen && 'rounded-b-none'} rounded-xl py-1 px-2 bg-backgroundColor-Main border border-Gray-50 text-Primary-DeepTeal text-[10px] flex items-center gap-2 cursor-pointer`}
        onClick={handleToggle}
      >
        {selectedOption} <img src="/icons/arrow-down-green.svg" alt="Arrow" />
      </div>
      {isOpen && (
        <div className="absolute  w-full  z-10 border bg-backgroundColor-Main border-Gray-50 rounded-b-xl">
          {options.map((option) => (
            <div
              key={option}
              className="px-2 py-1  text-[10px] text-Text-Secondary cursor-pointer hover:bg-Gray-50"
              onClick={() => handleOptionSelect(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};