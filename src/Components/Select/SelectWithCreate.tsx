import { useState, useRef, useEffect } from 'react';
import TooltipTextAuto from '../TooltipText/TooltipTextAuto';

type Props = {
  onChange: (value: string) => void;
  options?: Array<string>;
  value?: string;
  isLarge?: boolean;
  isSetting?: boolean;
  isStaff?: boolean;
  isSmall?: boolean;
  placeholder?: string;
  validation?: boolean;
  onMenuOpen?: () => void;
  onCreateNew?: () => void;
  createLabel?: string;
};

const SelectWithCreate: React.FC<Props> = ({
  onChange,
  options = [],
  value,
  isLarge,
  isSetting,
  isStaff,
  isSmall,
  placeholder = 'Select an option',
  validation,
  onMenuOpen,
  onCreateNew,
  createLabel = 'Create New Unit',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || '');
  const selectWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedValue(value || '');
  }, [value]);

  useEffect(() => {
    if (isOpen && onMenuOpen) onMenuOpen();
  }, [isOpen, onMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        selectWrapperRef.current &&
        !selectWrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectClick = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option: string) => {
    setSelectedValue(option);
    onChange(option);
    setIsOpen(false);
  };

  const displayedValueColorClass = selectedValue
    ? 'text-Text-Primary'
    : 'text-Text-Secondary';

  return (
    <div
      ref={selectWrapperRef}
      className={`relative inline-block ${isSmall ? 'w-[101px]' : ''} ${
        isLarge ? 'w-full' : 'w-[142px]'
      } text-nowrap cursor-pointer font-normal`}
    >
      {/* Trigger */}
      <div
        className={`flex items-center justify-between ${isStaff ? 'h-[28px]' : ''} ${
          validation ? 'border rounded-2xl border-red-500' : ''
        } ${
          isSetting
            ? 'bg-[#FDFDFD] rounded-2xl border border-Gray-50 py-1 px-3'
            : 'bg-backgroundColor-Secondary border-none py-[10px] px-3 shadow-100 rounded-[8px]'
        } cursor-pointer w-full ${isOpen ? 'rounded-b-none' : ''} pr-8 leading-tight focus:outline-none text-[8px] md:text-[10px] ${displayedValueColorClass}`}
        onClick={handleSelectClick}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        tabIndex={0}
      >
        <span className="text-Text-Primary md:text-xs">
          <TooltipTextAuto maxWidth={isSmall ? '100px' : '110px'}>
            {selectedValue || placeholder}
          </TooltipTextAuto>
        </span>
        {isSetting ? (
          <img
            className={`w-4 h-4 object-contain absolute ${
              isStaff ? 'top-[6px]' : 'top-1'
            } right-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            src="/icons/arrow-down-drop-new.svg"
            alt="dropdown arrow"
          />
        ) : (
          <img
            className={`w-3 h-3 object-contain opacity-80 absolute top-[10px] right-2 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            src="/icons/arow-down-drop.svg"
            alt="dropdown arrow"
          />
        )}
      </div>

      {/* Options */}
      {isOpen && (
        <ul
          className={`absolute ${isOpen ? 'rounded-t-none' : ''} z-10 w-full ${
            isSetting
              ? 'bg-[#FDFDFD] rounded-lg border border-Gray-50'
              : 'bg-backgroundColor-Secondary shadow-lg rounded-[8px]'
          } overflow-auto max-h-60`}
          role="listbox"
        >
          {options?.map((option) => (
            <li
              key={option}
              className={`${
                options.length > 1 ? 'border-y border-Gray-50' : ''
              } py-1 px-4 cursor-pointer text-wrap text-[10px] text-Text-Primary hover:bg-gray-200 text-start`}
              onClick={() => handleOptionClick(option)}
              role="option"
              aria-selected={selectedValue === option}
            >
              {option}
            </li>
          ))}

          {/* Create New Unit action */}
          {onCreateNew && (
            <li
              className="border-t border-Gray-50 py-1.5 px-4 cursor-pointer text-[10px] text-Primary-DeepTeal font-medium hover:bg-teal-50 flex items-center gap-1.5"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onCreateNew();
              }}
              role="option"
            >
              <span className="text-sm leading-none">+</span>
              {createLabel}
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default SelectWithCreate;
