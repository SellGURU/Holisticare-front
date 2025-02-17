interface ToggleProps {
  value: Array<string>;
  active: string;
  setActive: (value: string) => void;
}
const Toggle: React.FC<ToggleProps> = ({ value, active, setActive }) => {
  return (
    <>
      <div
        className={`bg-backgroundColor-Main h-10 ${value[2] ? 'w-[340px]' : 'w-[240px]'} px-2 flex justify-between items-center rounded-[24px]`}
      >
        <div
          onClick={() => {
            setActive(value[0]);
          }}
          className={` cursor-pointer ${active == value[0] ? 'bg-Primary-DeepTeal text-white' : '  bg-Secondary-SelverGray border text-Text-Primary'}  w-[100px] h-[24px] rounded-[16px] flex justify-center items-center text-[12px]`}
        >
          {value[0]}
        </div>
        <div className="w-[1px] h-[17px] bg-[#E5E5E5]"></div>
        <div
          onClick={() => {
            setActive(value[1]);
          }}
          className={` cursor-pointer ${active == value[1] ? ' bg-Primary-DeepTeal text-white' : '  bg-Secondary-SelverGray border text-Text-Primary'}  w-[100px] h-[24px] rounded-[16px] flex justify-center items-center text-[12px]`}
        >
          {value[1]}
        </div>
        {value[2] ? (
          <>
            <div className="w-[1px] h-[17px] bg-[#383838] dark:bg-gray-400"></div>
            <div
              onClick={() => {
                setActive(value[2]);
              }}
              className={` cursor-pointer ${active == value[2] ? ' bg-Primary-DeepTeal text-white' : '  bg-Secondary-SelverGray border text-Text-Primary'}  w-[100px] h-[24px] rounded-[16px] flex justify-center items-center text-[12px]`}
            >
              {value[2]}
            </div>
          </>
        ) : (
          ''
        )}
      </div>
    </>
  );
};
export default Toggle;
