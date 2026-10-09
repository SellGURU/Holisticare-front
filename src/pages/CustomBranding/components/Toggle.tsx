interface ToggleProps {
  value: Array<string>;
  active: string;
  setActive: (value: string) => void;
  isClientList?: boolean;
}
const ToggleCustomBranding: React.FC<ToggleProps> = ({
  value,
  active,
  setActive,
}) => {
  return (
    <div
      className="grid w-full max-w-[560px] grid-cols-3 gap-1 rounded-xl border border-Gray-50 bg-backgroundColor-Main p-1"
      role="tablist"
      aria-label="Branding preview"
    >
      {value.map((item) => (
        <button
          key={item}
          type="button"
          role="tab"
          aria-selected={active === item}
          onClick={() => setActive(item)}
          className={`min-w-0 rounded-lg px-2 py-2 text-[9px] font-medium transition-colors sm:text-[11px] ${
            active === item
              ? 'bg-Primary-DeepTeal text-white shadow-sm'
              : 'text-Text-Quadruple hover:bg-white hover:text-Text-Primary'
          }`}
        >
          <span className="block truncate">{item}</span>
        </button>
      ))}
    </div>
  );
};
export default ToggleCustomBranding;
