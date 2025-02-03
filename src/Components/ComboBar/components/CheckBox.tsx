interface CheckboxProps extends React.InputHTMLAttributes<HTMLDivElement> {
  checked: boolean;
}
const Checkbox: React.FC<CheckboxProps> = ({ checked, ...props }) => {
  return (
    <>
      <input type="checkbox" checked={checked} className="hidden" />
      <div
        className={`w-3 h-3 flex items-center justify-center rounded  border border-Primary-DeepTeal  ${
          checked ? 'bg-Primary-DeepTeal' : 'bg-white'
        }`}
        {...props}
      >
        {checked && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3 text-white"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
    </>
  );
};

export default Checkbox;
