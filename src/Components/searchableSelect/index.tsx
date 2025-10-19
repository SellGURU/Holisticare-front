import { useState, useRef, useEffect } from 'react';
import TooltipTextAuto from '../TooltipText/TooltipTextAuto';

type SelectProps = {
  onChange: (value: string) => void;
  options?: Array<string>;
  key?: string;
  isCapital?: boolean;
  isLarge?: boolean;
  value?: string;
  isSetting?: boolean;
  isStaff?: boolean;
  placeholder?: string;
  validation?: boolean;
  isSmall?: boolean;
  onMenuOpen?: () => void;
};

const SearchSelect: React.FC<SelectProps> = ({
  onChange,
  options = [],
  key,
  isCapital,
  isStaff,
  isLarge,
  value,
  isSetting,
  placeholder = 'Select an option',
  validation,
  isSmall,
  onMenuOpen,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || '');
  const [searchTerm, setSearchTerm] = useState('');
  const selectWrapperRef = useRef<HTMLDivElement>(null);
  const [filteredOptions, setFilteredOptions] = useState(options);
  
  // Filtered options based on search
  useEffect(() => {
    if (searchTerm !== '') {
      const filtered = options
        .filter((opt) => opt.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter((opt, index, arr) => arr.indexOf(opt) === index); // Remove duplicates
      setFilteredOptions(filtered);
    } else {
      // Remove duplicates from original options as well
      const uniqueOptions = options.filter((opt, index, arr) => arr.indexOf(opt) === index);
      setFilteredOptions(uniqueOptions);
    }
  }, [searchTerm, options]);

  useEffect(() => {
    if (isOpen && onMenuOpen) onMenuOpen();
  }, [isOpen, onMenuOpen]);

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
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectClick = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setSearchTerm('');
  };

  const handleOptionClick = (option: string) => {
    setSelectedValue(option);
    onChange(option);
    setIsOpen(false);
    setSearchTerm('');
  };

  const displayedValueColorClass = selectedValue
    ? 'text-Text-Primary'
    : 'text-Text-Secondary';

  return (
    <div
      ref={selectWrapperRef}
      className={`relative inline-block ${
        isSmall && 'w-[101px]'
      } ${isLarge ? 'w-full' : 'w-[142px]'} text-nowrap cursor-pointer font-normal`}
      key={key}
    >
      {/* Select display */}
      <div
        className={`flex items-center justify-between ${
          isStaff && 'h-[28px]'
        } ${
          validation && 'border rounded-2xl border-red-500'
        } ${isCapital && 'capitalize'} ${
          isSetting
            ? 'bg-[#FDFDFD] rounded-2xl border border-Gray-50 py-1 px-3'
            : 'bg-backgroundColor-Secondary border-none py-[10px] px-3 shadow-100 rounded-[8px]'
        } cursor-pointer w-full ${isOpen && 'rounded-b-none'} pr-8 leading-tight focus:outline-none text-[8px] md:text-[10px] ${displayedValueColorClass}`}
        onClick={handleSelectClick}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        tabIndex={0}
      >
        <span className={`text-Text-Primary`}>
          <TooltipTextAuto maxWidth={isSmall ? '100px' : '110px'}>
            {selectedValue || placeholder}
          </TooltipTextAuto>
        </span>

        <img
          className={`${
            isSetting ? 'w-4 h-4' : 'w-3 h-3'
          } object-contain opacity-80 absolute ${
            isStaff ? 'top-[6px]' : 'top-[10px]'
          } right-2 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          src={
            isSetting
              ? '/icons/arrow-down-drop-new.svg'
              : '/icons/arow-down-drop.svg'
          }
          alt="dropdown arrow"
        />
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className={`absolute z-10 w-full ${
            isSetting
              ? 'bg-[#FDFDFD] rounded-lg border border-Gray-50'
              : 'bg-backgroundColor-Secondary shadow-lg rounded-[8px]'
          } overflow-y-auto overflow-x-hidden max-h-60`}
        >
          {/* Search input */}
          <div className="sticky top-0 bg-inherit p-2 z-10">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-Gray-50 rounded-md px-2 py-1 text-[10px] text-Text-Primary focus:outline-none bg-white"
            />
          </div>

          {/* Filtered options */}
          <ul role="listbox">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <li
                  key={option}
                  className={`py-1 px-4 cursor-pointer text-[10px] text-Text-Primary hover:bg-gray-200 text-start`}
                  onClick={() => handleOptionClick(option)}
                  role="option"
                  aria-selected={selectedValue === option}
                >
                  {isCapital
                    ? option.charAt(0).toUpperCase() + option.slice(1)
                    : option}
                </li>
              ))
            ) : (
              <li className="py-2 px-4 text-[10px] text-Text-Secondary">
                No results found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchSelect;
