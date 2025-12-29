interface ToggleProps {
  checked: boolean;
  setChecked: (action: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({ checked, setChecked }) => {
  return (
    <button
      type="button"
      onClick={() => setChecked(!checked)}
      className={`relative w-7 xs:w-10 h-4 xs:h-6 rounded-full border border-[#E9EDF5]
        transition-colors duration-300 ease-in-out
        ${checked ? "bg-Primary-EmeraldGreen/20" : "bg-white"}
      `}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-0 left-0 w-4 h-4 xs:w-6 xs:h-6 rounded-full border border-[#E9EDF5] shadow-sm
          transition-transform duration-300 ease-in-out will-change-transform
          ${checked ? "translate-x-3 xs:translate-x-4 bg-Primary-EmeraldGreen" : "translate-x-0 bg-[#F4F4F4]"}
        `}
      />
    </button>
  );
};

export default Toggle;
