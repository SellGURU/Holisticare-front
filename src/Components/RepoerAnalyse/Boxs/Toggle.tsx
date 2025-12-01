interface ToggleProps {
  checked: boolean;
  setChecked: (action: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({ checked, setChecked }) => {
  return (
    <div
      onClick={() => setChecked(!checked)}
      className={`relative cursor-pointer w-5 md:w-10 bg-white border border-[#E9EDF5] h-2 md:h-4 flex items-center rounded-full transition-colors duration-300 
       
      `}
    >
      <div
        className={ `w-3 md:w-6 border border-[#E9EDF5]  h-3 md:h-6  rounded-full shadow-md transform transition-transform duration-300
          ${checked ? ' translate-x-2 md:translate-x-5 bg-Primary-EmeraldGreen' : 'translate-x-0 bg-[#F4F4F4]'}
        `}
      ></div>
    </div>
  );
};

export default Toggle;
