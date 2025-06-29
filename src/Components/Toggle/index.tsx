interface ToggleProps {
  value: Array<string>;
  active: string;
  setActive: (value: string) => void;
  isClientList?: boolean;
  isMessages?: boolean;
  isNotif?: boolean;
}
const Toggle: React.FC<ToggleProps> = ({
  value,
  active,
  setActive,
  isClientList,
  isMessages,
  isNotif
}) => {
  return (
    <>
      <div
        className={` bg-backgroundColor-Main h-7 w-[315px] ${isClientList && 'h-8 w-[324px]'} ${isMessages && 'h-8 w-[282px]'} ${isNotif && 'h-8 w-[368px]'}  px-2 flex justify-between items-center rounded-[24px] gap-1`}
      >
        <div
          onClick={() => {
            setActive(value[0]);
          }}
          className={` cursor-pointer ${active == value[0] ? 'bg-Primary-DeepTeal text-white' : '  bg-Secondary-SelverGray border text-Text-Primary'} ${isNotif && 'w-[176px] h-[24px]'} h-[20px] w-[150px] ${isClientList && 'h-[24px] w-[100px]'} ${isMessages && 'w-[86.33px] h-[23px]'} rounded-[16px] flex justify-center items-center text-[12px]`}
        >
          {value[0]}
        </div>
        <div className="w-[1px] h-[17px] bg-[#E5E5E5]"></div>
        <div
          onClick={() => {
            setActive(value[1]);
          }}
          className={` cursor-pointer ${active == value[1] ? ' bg-Primary-DeepTeal text-white' : '  bg-Secondary-SelverGray border text-Text-Primary'} ${isNotif && 'w-[176px] h-[24px]'} h-[20px] w-[150px]  ${isClientList && 'h-[24px] w-[100px]'} ${isMessages && 'w-[86.33px] h-[23px]'} rounded-[16px] flex justify-center items-center text-[12px]`}
        >
          {value[1]}
        </div>
        {value[2] ? (
          <>
            <div className="w-[1px] h-[17px] bg-[#E5E5E5]"></div>
            <div
              onClick={() => {
                setActive(value[2]);
              }}
              className={` cursor-pointer ${active == value[2] ? ' bg-Primary-DeepTeal text-white' : '  bg-Secondary-SelverGray border text-Text-Primary'} ${isNotif && 'w-[176px] h-[24px]'} h-[20px] w-[135px] ${isClientList && 'h-[24px] w-[100px]'} ${isMessages && 'w-[86.33px] h-[23px]'} rounded-[16px] flex justify-center items-center text-[12px]`}
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
