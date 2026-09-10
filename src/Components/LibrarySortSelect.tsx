import { getLibrarySortOptions } from '../utils/libraryTableSort';

interface LibrarySortSelectProps {
  pageType: string;
  value: string;
  onChange: (sortId: string) => void;
  className?: string;
}

const LibrarySortSelect = ({
  pageType,
  value,
  onChange,
  className = '',
}: LibrarySortSelectProps) => {
  const options = getLibrarySortOptions(pageType);

  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={`h-8 min-w-[168px] max-w-[220px] rounded-xl border border-Gray-50 bg-white px-2.5 text-[11px] text-Text-Primary outline-none focus:border-Primary-DeepTeal ${className}`}
      aria-label="Sort by"
    >
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default LibrarySortSelect;
