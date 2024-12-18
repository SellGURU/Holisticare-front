import { useNavigate } from "react-router-dom";
import { ButtonPrimary } from "../Button/ButtonPrimary";
export const TopBar = () => {
  const navigate = useNavigate();
  return (
    <div className="w-full flex items-center justify-between bg-white border-b border-gray-50 pl-4 pr-6 py-2 shadow-100">
      <div className="flex gap-2 items-center ">
        <img src="/icons/home.svg" alt="" />
        <div
          onClick={() => navigate("/")}
          className="TextStyle-Button text-[#445A74] cursor-pointer ml-1"
        >
          Home
        </div>

        <img className="w-5 h-5" src="/icons/arrow-right.svg" alt="" />
        <span className="TextStyle-Button text-[#6783A0]">Report</span>
      </div>
      <div className="flex gap-10 ">
        <div className="flex gap-3">
        <ButtonPrimary>
          <img src="/icons/download.svg" alt="" />
          Download
        </ButtonPrimary>
        <div className="flex items-center gap-1 TextStyle-Button text-[#005F73] cursor-pointer ">
            <img src="/icons/share.svg" alt="" />
            Share
          </div>
        </div>
        
          <div className="flex items-center gap-1 TextStyle-Body-2 cursor-pointer text-[#383838]">
          <img src="/icons/topbar-logo2.png" alt="" />
          Clinic Longevity 1
        </div>
      </div>
    </div>
  );
};
