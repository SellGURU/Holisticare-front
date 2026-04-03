import { useState, useRef, useEffect } from 'react';
import TooltipTextAuto from '../TooltipText/TooltipTextAuto';
import {
  computePosition,
  flip,
  shift,
  autoUpdate,
  size,
} from '@floating-ui/dom';

export interface BiomarkerSuggestion {
  system_biomarker: string;
  confidence: number;
  reason: string;
}

type Props = {
  onChange: (value: string) => void;
  options?: Array<string>;
  value?: string;
  isLarge?: boolean;
  isSetting?: boolean;
  isStaff?: boolean;
  placeholder?: string;
  isError?: boolean;
  suggestions?: BiomarkerSuggestion[];
  isSuggestionsLoading?: boolean;
  onCreateNew?: () => void;
  onMenuOpen?: () => void;
};

const confidenceBadge = (confidence: number) => {
  if (confidence >= 85)
    return 'bg-green-100 text-green-700 border border-green-200';
  if (confidence >= 60)
    return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
  return 'bg-orange-50 text-orange-600 border border-orange-200';
};

const SearchSelectWithSuggestions: React.FC<Props> = ({
  onChange,
  options = [],
  value,
  isLarge,
  isSetting,
  isStaff,
  placeholder = 'Select an option',
  isError = false,
  suggestions = [],
  isSuggestionsLoading = false,
  onCreateNew,
  onMenuOpen,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [openDirection, setOpenDirection] = useState<'top' | 'bottom'>('bottom');

  const selectWrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
          setOpenDirection(placement.startsWith('top') ? 'top' : 'bottom');
        });
      },
    );
    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const unique = [...new Set(options)];
    setFilteredOptions(
      term
        ? unique.filter((o) => o.toLowerCase().includes(term))
        : unique,
    );
  }, [searchTerm, options]);

  useEffect(() => {
    setSelectedValue(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        selectWrapperRef.current &&
        !selectWrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && onMenuOpen) onMenuOpen();
  }, [isOpen, onMenuOpen]);

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

  const displayedValue = selectedValue || '';
  const showPlaceholder = !displayedValue;

  // Suggestions filtered by search term
  const visibleSuggestions = suggestions.filter(
    (s) =>
      !searchTerm ||
      s.system_biomarker.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div
      ref={selectWrapperRef}
      className={`relative inline-block ${isLarge ? 'w-full' : 'w-[142px]'} text-nowrap cursor-pointer font-normal`}
    >
      {/* Trigger button */}
      <div
        ref={buttonRef}
        className={`flex items-center justify-between ${isStaff ? 'h-[28px]' : ''} ${
          isError
            ? 'border rounded-2xl border-red-400'
            : ''
        } ${
          isSetting
            ? 'bg-[#FDFDFD] rounded-2xl border border-Gray-50 py-1 px-3'
            : 'bg-backgroundColor-Secondary border-none py-[10px] px-3 shadow-100 rounded-[8px]'
        } cursor-pointer w-full pr-8 leading-tight focus:outline-none text-[8px] md:text-[10px]`}
        onClick={handleSelectClick}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        tabIndex={0}
      >
        <span className="text-Text-Primary md:text-[12px] text-wrap w-[90px] xl:w-auto">
          <TooltipTextAuto maxWidth="190px">
            {showPlaceholder ? placeholder : displayedValue}
          </TooltipTextAuto>
        </span>
        <img
          className={`${
            isSetting ? 'w-4 h-4' : 'w-3 h-3'
          } object-contain opacity-80 absolute ${
            isStaff ? 'top-[6px]' : 'top-[10px]'
          } right-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          src={
            isSetting
              ? '/icons/arrow-down-drop-new.svg'
              : '/icons/arow-down-drop.svg'
          }
          alt="dropdown arrow"
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          style={{ position: 'fixed', width: buttonRef.current?.offsetWidth }}
          className={`absolute flex flex-col z-[9999] ${
            isSetting
              ? 'bg-[#FDFDFD] rounded-lg border border-Gray-50'
              : 'bg-backgroundColor-Secondary shadow-lg rounded-[8px]'
          } overflow-auto max-h-[280px] md:max-h-[320px]`}
        >
          {/* Search */}
          <div
            className={`${openDirection === 'bottom' ? 'top-0 order-first' : 'bottom-0 order-last'} sticky bg-inherit p-2`}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-Gray-50 rounded-md px-2 py-1 text-[10px] text-Text-Primary focus:outline-none bg-white"
            />
          </div>

          {/* Suggestions section — always visible when suggestions exist */}
          {visibleSuggestions.length > 0 && (
            <div className="order-2">
              <div className={`px-3 py-1 text-[9px] font-semibold uppercase tracking-wide border-b ${
                isError
                  ? 'text-orange-600 bg-orange-50 border-orange-100'
                  : 'text-Text-Secondary bg-blue-50 border-blue-100'
              }`}>
                {isError ? 'Suggestions' : 'Suggested Match'}
              </div>
              {isError && (
                <div className="px-3 py-1 text-[9px] text-orange-600 bg-orange-50 border-b border-orange-100 italic">
                  No exact match found — closest options shown below
                </div>
              )}
              <ul role="listbox">
                {visibleSuggestions.map((s) => (
                  <li
                    key={`suggestion-${s.system_biomarker}`}
                    className={`py-1.5 px-3 cursor-pointer text-[10px] text-Text-Primary text-start flex items-start justify-between gap-2 border-b border-Gray-50 ${
                      selectedValue === s.system_biomarker
                        ? 'bg-blue-50 font-medium'
                        : 'hover:bg-blue-50'
                    }`}
                    onClick={() => handleOptionClick(s.system_biomarker)}
                    role="option"
                    aria-selected={selectedValue === s.system_biomarker}
                    title={s.reason}
                  >
                    <span className="flex-1 text-wrap">{s.system_biomarker}</span>
                    <span
                      className={`shrink-0 text-[8px] font-semibold px-1.5 py-0.5 rounded-full ${confidenceBadge(s.confidence)}`}
                    >
                      {s.confidence}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {isSuggestionsLoading && (
            <div className="order-2 px-3 py-2 text-[9px] text-blue-700 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              Finding similar biomarkers...
            </div>
          )}

          {/* No suggestions notice */}
          {isError &&
            !isSuggestionsLoading &&
            visibleSuggestions.length === 0 &&
            !searchTerm && (
            <div className="order-2 px-3 py-2 text-[9px] text-orange-600 bg-orange-50 border-b border-orange-100 italic">
              No exact match found — search or create a new biomarker
            </div>
            )}

          {/* Create New Biomarker action */}
          {onCreateNew && (
            <div className="order-3 border-t border-Gray-50">
              <button
                type="button"
                className="w-full text-left py-1.5 px-3 text-[10px] text-Primary-DeepTeal font-medium hover:bg-teal-50 flex items-center gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  onCreateNew();
                }}
              >
                <span className="text-base leading-none">+</span>
                Create New Biomarker
              </button>
            </div>
          )}

          {/* Divider before full list */}
          {(visibleSuggestions.length > 0 || onCreateNew) && (
            <div className="order-4 border-t border-Gray-50 pt-1 pb-0.5 px-3 text-[9px] font-semibold text-Text-Secondary uppercase tracking-wide">
              All Biomarkers
            </div>
          )}

          {/* Full option list */}
          <ul role="listbox" className="order-5">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <li
                  key={option}
                  className="py-1 px-3 text-wrap w-full cursor-pointer text-[10px] text-Text-Primary hover:bg-gray-200 text-start"
                  onClick={() => handleOptionClick(option)}
                  role="option"
                  aria-selected={selectedValue === option}
                >
                  {option}
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

export default SearchSelectWithSuggestions;
