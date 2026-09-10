import type { EnabledFilter } from '../utils/catalogEnabled';

interface EnabledStatusSelectProps {
  value: EnabledFilter;
  onChange: (value: EnabledFilter) => void;
  className?: string;
}

const EnabledStatusSelect = ({
  value,
  onChange,
  className = '',
}: EnabledStatusSelectProps) => {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as EnabledFilter)}
      className={`h-8 min-w-[108px] rounded-xl border border-Gray-50 bg-white px-2.5 text-[11px] text-Text-Primary outline-none focus:border-Primary-DeepTeal ${className}`}
      aria-label="Filter by status"
    >
      <option value="All">All</option>
      <option value="Enabled">Enabled</option>
      <option value="Disabled">Disabled</option>
    </select>
  );
};

export default EnabledStatusSelect;
