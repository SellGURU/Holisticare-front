import { useState, useRef, useEffect } from 'react';
import TooltipTextAuto from '../TooltipText/TooltipTextAuto';
import { computePosition, flip, shift, autoUpdate, size } from '@floating-ui/dom';

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

  const buttonRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const [openDirection, setOpenDirection] = useState<'top' | 'bottom'>('bottom');
  useEffect(() => {
    if (!isOpen || !buttonRef.current || !dropdownRef.current) return;

    cleanupRef.current = autoUpdate(
      buttonRef.current,
      dropdownRef.current,
      () => {
        computePosition(buttonRef.current!, dropdownRef.current!, {
          placement: 'bottom-start',
          middleware: [
            flip(),
            shift({ padding: 8 }),
            size({
              apply({ rects, elements }) {
                Object.assign(elements.floating.style, {
                  width: `${rects.reference.width}px`,
                });
              },
            }),
          ],
        }).then(({ x, y, placement }) => {
          Object.assign(dropdownRef.current!.style, {
            left: `${x}px`,
            top: `${y}px`,
          });

          // 👇 تشخیص جهت باز شدن
          setOpenDirection(placement.startsWith('top') ? 'top' : 'bottom');
        });
      }
    );

    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, [isOpen]);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);
  // Filtered options based on search
  useEffect(() => {
    if (searchTerm !== '') {
      const filtered = options
        .filter((opt) => opt.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter((opt, index, arr) => arr.indexOf(opt) === index); // Remove duplicates
      setFilteredOptions(filtered);
    } else {
      // Remove duplicates from original options as well
      const uniqueOptions = options.filter(
        (opt, index, arr) => arr.indexOf(opt) === index,
      );
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
      className={`relative inline-block   ${
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
        ref={buttonRef}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        tabIndex={0}
      >
        <span
          className={`text-Text-Primary md:text-[12px] text-wrap w-[90px] xl:w-auto`}
        >
          <TooltipTextAuto maxWidth={isSmall ? '100px' : '190px'}>
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
          ref={dropdownRef}
          style={{
            position:'fixed',
            width: buttonRef.current?.offsetWidth,
          }}
          className={`absolute flex flex-col z-[9999]  ${
            isSetting
              ? 'bg-[#FDFDFD] rounded-lg border border-Gray-50'
              : 'bg-backgroundColor-Secondary shadow-lg rounded-[8px]'
          } overflow-auto n max-h-[190px] md:max-h-60`}
        >
          {/* Search input */}

            <div className={`${openDirection == 'bottom'?'top-0 order-first':'bottom-0 order-last'} sticky  bg-inherit p-2 `}>
              <input
                type="text"
                ref={inputRef}
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-Gray-50 rounded-md px-2 py-1 text-[10px] text-Text-Primary focus:outline-none bg-white"
              />
            </div>

          {/* Filtered options */}
          <ul role="listbox" className='order-1'>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <li
                  key={option}
                  className={`py-1 px-3 text-wrap w-full cursor-pointer text-[10px] text-Text-Primary hover:bg-gray-200 text-start`}
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
