interface ToggleProps {
  value: Array<string>;
  active: string;
  setActive: (value: string) => void;
}
const Toggle: React.FC<ToggleProps> = ({ value, active, setActive }) => {
  return (
    <>
      <div className=" bg-backgroundColor-Main h-7 w-[294px] px-2 flex justify-between items-center rounded-[24px]">
        <div
          onClick={() => {
            setActive(value[0]);
          }}
          className={` cursor-pointer ${active == value[0] ? 'bg-Primary-DeepTeal text-white' : '  bg-Secondary-SelverGray border text-Text-Primary'}  w-[135px] h-[20px] rounded-[16px] flex justify-center items-center text-[12px]`}
        >
          {value[0]}
        </div>
        <div className="w-[1px] h-[17px] bg-[#E5E5E5]"></div>
        <div
          onClick={() => {
            setActive(value[1]);
          }}
          className={` cursor-pointer ${active == value[1] ? ' bg-Primary-DeepTeal text-white' : '  bg-Secondary-SelverGray border text-Text-Primary'}  w-[135px] h-[20px] rounded-[16px] flex justify-center items-center text-[12px]`}
        >
          {value[1]}
        </div>
      </div>
    </>
  );
};
export default Toggle;
