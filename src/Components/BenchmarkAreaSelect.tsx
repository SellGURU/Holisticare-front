import { useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  value?: string;
  options?: string[];
  suggestedValue?: string;
  placeholder?: string;
  onChange: (value: string) => void;
};

const normalizeBenchmarkArea = (value: string) => value.trim().toLowerCase();

const BenchmarkAreaSelect: React.FC<Props> = ({
  value = '',
  options = [],
  suggestedValue = '',
  placeholder = 'Select or search benchmark area',
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const uniqueOptions = useMemo(() => {
    const deduped = new Map<string, string>();
    options.forEach((option) => {
      const cleaned = String(option || '').trim();
      if (!cleaned) return;
      const normalized = normalizeBenchmarkArea(cleaned);
      if (!deduped.has(normalized)) {
        deduped.set(normalized, cleaned);
      }
    });
    return Array.from(deduped.values()).sort((a, b) => a.localeCompare(b));
  }, [options]);

  const normalizedOptionSet = useMemo(
    () => new Set(uniqueOptions.map((option) => normalizeBenchmarkArea(option))),
    [uniqueOptions],
  );

  const cleanedValue = value.trim();
  const cleanedSuggestedValue = suggestedValue.trim();
  const filteredOptions = uniqueOptions.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const isCurrentValueNew =
    Boolean(cleanedValue) &&
    !normalizedOptionSet.has(normalizeBenchmarkArea(cleanedValue));
  const isSuggestedValueNew =
    Boolean(cleanedSuggestedValue) &&
    !normalizedOptionSet.has(normalizeBenchmarkArea(cleanedSuggestedValue));
  const canCreateFromSearch =
    Boolean(searchTerm.trim()) &&
    !normalizedOptionSet.has(normalizeBenchmarkArea(searchTerm));

  const handleSelect = (nextValue: string) => {
    onChange(nextValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full border border-Gray-50 rounded-2xl px-3 py-2 text-[12px] outline-none focus:border-Primary-DeepTeal text-left bg-white flex items-center justify-between gap-3"
      >
        <span
          className={cleanedValue ? 'text-Text-Primary' : 'text-Text-Secondary'}
        >
          {cleanedValue || placeholder}
        </span>
        <img
          src="/icons/arrow-down-drop-new.svg"
          alt="Open benchmark areas"
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isCurrentValueNew && (
        <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-Primary-DeepTeal">
          <img src="/icons/add-square.svg" alt="" className="w-3.5 h-3.5" />
          <span>
            {cleanedSuggestedValue &&
            normalizeBenchmarkArea(cleanedSuggestedValue) ===
              normalizeBenchmarkArea(cleanedValue)
              ? 'AI selected a new benchmark area. It will be created when you save.'
              : 'This will be added as a new benchmark area when you save.'}
          </span>
        </div>
      )}

      {isOpen && (
        <div className="absolute z-[100] mt-2 w-full rounded-2xl border border-Gray-50 bg-white shadow-lg overflow-hidden">
          <div className="p-2 border-b border-Gray-50">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search benchmark areas..."
              className="w-full border border-Gray-50 rounded-xl px-3 py-2 text-[12px] outline-none focus:border-Primary-DeepTeal"
              autoFocus
            />
          </div>

          {cleanedSuggestedValue &&
            normalizeBenchmarkArea(cleanedSuggestedValue) !==
              normalizeBenchmarkArea(cleanedValue) && (
              <button
                type="button"
                onClick={() => handleSelect(cleanedSuggestedValue)}
                className="w-full px-3 py-2 border-b border-Gray-50 text-left hover:bg-teal-50"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[10px] font-semibold text-Primary-DeepTeal">
                      AI Suggestion
                    </div>
                    <div className="text-[12px] text-Text-Primary">
                      {cleanedSuggestedValue}
                    </div>
                  </div>
                  {isSuggestedValueNew && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-1 text-[10px] text-Primary-DeepTeal border border-teal-100">
                      <img src="/icons/add-square.svg" alt="" className="w-3 h-3" />
                      New
                    </span>
                  )}
                </div>
              </button>
            )}

          <div className="max-h-56 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`w-full px-3 py-2 text-[12px] text-left hover:bg-gray-50 ${
                    normalizeBenchmarkArea(option) ===
                    normalizeBenchmarkArea(cleanedValue)
                      ? 'bg-teal-50 text-Primary-DeepTeal font-medium'
                      : 'text-Text-Primary'
                  }`}
                >
                  {option}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-[11px] text-Text-Secondary">
                No existing benchmark areas found.
              </div>
            )}
          </div>

          {canCreateFromSearch && (
            <button
              type="button"
              onClick={() => handleSelect(searchTerm.trim())}
              className="w-full px-3 py-2 border-t border-Gray-50 text-left hover:bg-teal-50 flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <img src="/icons/add-square.svg" alt="" className="w-4 h-4 shrink-0" />
                <span className="text-[12px] text-Primary-DeepTeal truncate">
                  Create new benchmark area "{searchTerm.trim()}"
                </span>
              </div>
              <span className="text-[10px] text-Text-Secondary shrink-0">
                New
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default BenchmarkAreaSelect;
