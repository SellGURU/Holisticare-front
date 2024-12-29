// import { getStatusBgColorClass } from "@/utils/status"
type Status = "Needs Focus" | "Ok" | "Good" | "Excellent" | "All";

interface StatusMenuProps {
  status?: string[];
  activeStatus: Status;
  onChange: (status: string) => void;
}
const getStatusBgColorClass = (
  status: string,
  currentStatus: string
): string => {
  if (status.toLowerCase() === currentStatus.toLowerCase()) {
    switch (status.toLowerCase()) {
      case "high":
        return "bg-red-status text-black";
      case "low":
        return "bg-brand-primary-color text-black";
      case "medium":
        return "bg-orange-status  text-black";
      case "excellent":
        return "bg-[#7F39FB] text-black";
      case "good":
        return "bg-[#03DAC5] text-black";
      case "ok":
        return "bg-[#FBAD37] text-black";
      case "needs focus":
        return "bg-[#FC5474] text-black";
      case "incompleted":
        return "bg-[#FC5474] text-white";
      case "incomplete data":
        return "bg-[#FC5474] text-white";
      case "all":
        return "text-white bg-Primary-DeepTeal";
      case "need to check":
        return "bg-[#FFBD59] text-black";
      case "checked":
        return "bg-[#06C78D] text-white";
      default:
        return "border border-light-blue-active  text-[8px]";
    }
  }
  return "border bg-backgroundColor-Main border-Gray-50 text-[8px] text-Text-Primary  ";
};
const StatusMenu: React.FC<StatusMenuProps> = ({
  status,
  activeStatus,
  onChange,
}) => {
  return (
    <>
      <div className="rounded-[16px]  w-full text-backgroundColor-Main shadow-200   bg-white border border-Gray-50  flex items-center justify-start gap-1 px-1.5  text-[8px] text-primary-text">
        {status &&
          status.map((state, index) => {
            return (
              <div key={index} className="w-full ">
                <div className=" py-1 flex items-center justify-between gap-1  ">
                  <div
                    onClick={() => {
                      onChange(state);
                    }}
                    className={` ${getStatusBgColorClass(activeStatus, state)} 
                                rounded-2xl text-nowrap  px-3 w-full h-[24px] flex items-center justify-center cursor-pointer `}
                  >
                    {state}
                  </div>
                  {index !== status.length - 1 && (
          <div className="w-px h-[24px] bg-Gray-50 "></div>
        )}               
                </div>
              </div>
            );
          })}
      </div>
    </>
  );
};

export default StatusMenu;
