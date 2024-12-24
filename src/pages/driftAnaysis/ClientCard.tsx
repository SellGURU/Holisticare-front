import React, { Dispatch, SetStateAction } from "react";
// import { useSelector } from "react-redux";
// import { getStatusBgColorClass } from "@/utils/status";
// import { Link } from "react-router-dom";
interface ClientCardProps {
  index: number;
  picture?: string;
  name: string;
  email: string;
  status: string;
  cardActive: null | number;
  // onClick: () => void;
  memberID: number;
  setCardActive: Dispatch<SetStateAction<null | number>>;
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
export const ClientCard: React.FC<ClientCardProps> = ({
  name,
  email,
  picture,
  status,
  cardActive,
  memberID,
  setCardActive,
}) => {
  // const theme = useSelector((state: any) => state.theme.value.name);
  // console.log(memberID);

  return (
    <div
      onClick={() => {
        setCardActive(memberID);
        // onClick(); // Call onClick when the card is clicked
      }} // onClick={() => setCardActive(index)}
      className={`${
        cardActive === memberID
          ? "border-Primary-EmeraldGreen"
          : "border-Gray-50"
      } cursor-pointer ${
        memberID == 1 ? "hidden" : "block"
      }  px-3 py-2 border rounded-[16px] bg-white relative mt-[6px] w-full text-Text-Primary  `}
    >
      <div className="w-full flex justify-between items-start text-[10px]">
        <div className="flex gap-3 items-center">
          <img
            className="rounded-full w-[32px] h-[32px]"
            src={
              picture != ""
                ? picture
                : `https://ui-avatars.com/api/?name=${name}`
            }
            alt=""
          /> text-xs
          <div className=" font-medium flex flex-col ">
            {name}
          </div>
        </div>
        <div
          className={`text-Text-Primary text-[8px] px-2 py-[2px] rounded-2xl ${getStatusBgColorClass(
            status,
            status
          )} `}
        >
          {status}{" "}
        </div>
      </div>
      <div className="mt-3 flex justify-between items-center">
        <div className="flex flex-col  text-primary-text">
          {" "}
          <span className="text-Text-Secondary text-[8px]">
            Email-address{" "}
          </span>
          <span className="text-[10px]  font-normal">
            {email}
          </span>
        </div>
      </div>
      {/* <Link to={`/information/${memberID}/Analysis`}> */}
        <div className=" absolute right-[5%] bottom-1 flex flex-col gap-4">
          <div className="cursor-pointer bg-white border border-Gray-50 shadow-100  rounded-full p-2">
            {" "}
            <img src="/icons/export.svg" alt="" />
          </div>
          {/* <div className="cursor-pointer bg-black-third rounded-full p-2">
          {" "}
          <img
src="/Themes/Aurora/icons/more-square.svg"        
            alt=""
          />
        </div> */}
        </div>
      {/* </Link> */}
    </div>
  );
};
