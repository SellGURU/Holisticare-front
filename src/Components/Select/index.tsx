import { useState, useRef, useEffect } from 'react';

type SelectProps = {
  onChange: (value: string) => void;
  options?: Array<string>;
  key?: string; // Consider if `key` is really needed here or if it's for list rendering outside
  isCapital?: boolean;
  isLarge?: boolean;
  value?: string;
  isSetting?: boolean;
  placeholder?: string;
};

const Select: React.FC<SelectProps> = ({
  onChange,
  options,
  key,
  isCapital,
  isLarge,
  value, // This will now be primarily for controlled component behavior from parent
  isSetting,
  placeholder = 'Select an option',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || ''); // Internal state for selected value
  const selectWrapperRef = useRef<HTMLDivElement>(null); // Ref for the entire custom select wrapper

  // Update internal state when external value prop changes
  useEffect(() => {
    setSelectedValue(value || '');
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectWrapperRef.current &&
        !selectWrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectClick = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option: string) => {
    setSelectedValue(option);
    onChange(option); // Notify parent component
    setIsOpen(false);
  };

  // Determine the text color for the displayed value
  const displayedValueColorClass = selectedValue
    ? 'text-Text-Primary' // Color when a value is selected
    : 'text-Text-Secondary'; // Color for the placeholder

  return (
    <div
      ref={selectWrapperRef}
      className={`relative inline-block ${isLarge ? 'w-full' : 'w-[120px]'} text-nowrap cursor-pointer font-normal`}
      key={key} // If `key` is meant for this outer div
    >
      {/* Displayed Select Box */}
      <div
        className={`flex items-center justify-between ${isCapital && 'capitalize'} ${
          isSetting
            ? 'bg-[#FDFDFD] rounded-2xl border border-Gray-50 py-1 px-3'
            : 'bg-backgroundColor-Secondary border-none py-[9px] px-4 shadow-100 rounded-[8px]'
        } cursor-pointer w-full ${isOpen && 'rounded-b-none'} pr-8 leading-tight focus:outline-none text-[10px] ${displayedValueColorClass}`}
        onClick={handleSelectClick}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        tabIndex={0} // Make it focusable
      >
        <span
          className={`${selectedValue ? 'text-Text-Primary' : 'text-[#B0B0B0] font-light'} text-xs`}
        >
          {selectedValue || placeholder}
        </span>
        {isSetting ? (
          <img
            className={`w-4 h-4 object-contain absolute top-1 right-2 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            src="/icons/arrow-down-drop-new.svg"
            alt="dropdown arrow"
          />
        ) : (
          <img
            className={`w-3 h-3 object-contain opacity-80 absolute top-2 right-2 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            src="/icons/arow-down-drop.svg"
            alt="dropdown arrow"
          />
        )}
      </div>

      {/* Options Dropdown */}
      {isOpen && (
        <ul
          className={`absolute ${isOpen && 'rounded-t-none'} z-10 w-full ${isSetting ? 'bg-[#FDFDFD] rounded-lg border border-Gray-50' : 'bg-backgroundColor-Secondary shadow-lg rounded-[8px]'}  overflow-auto max-h-60`}
          role="listbox"
        >
          {options?.map((option) => (
            <li
              key={option}
              className={`py-2 px-4 cursor-pointer text-[12px] text-[#888888] hover:bg-gray-200 ${
                selectedValue === option ? '' : ''
              }`}
              onClick={() => handleOptionClick(option)}
              role="option"
              aria-selected={selectedValue === option}
            >
              {isCapital
                ? option.charAt(0).toUpperCase() + option.slice(1)
                : option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Select;
