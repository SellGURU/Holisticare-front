import { useState } from "react";
export const SideMenu = () => {
  const menuItems = [
    "Client Summary",
    "Needs Focus Biomarker",
    "Detailed Analysis",
    "Concerning Result",
    "Treatment Plan",
    "Action Plan",
  ];
  const [activeMenu, setactiveMenu] = useState("Client Summary");
  const [ActiveLayer, setActiveLayer] = useState("layer");
  const [activeImg, setactiveImg] = useState(1);
  return (
    <div className="h-full w-[178px] bg-white border border-gray-50 rounded-xl p-4 shadow-sm ">
      <div className="flex  rounded-[7px] p-px gap-[2px] w-[76px] h-[26px] bg-[#F4F4F4]">
        <div
          onClick={() => setActiveLayer("layer")}
          className={`flex ${
            ActiveLayer == "layer" && "bg-white "
          }items-center justify-center px-2 py-[2px] rounded-md cursor-pointer `}
        >
          <img
            className={`report-sidemenu-layer-icon ${
              ActiveLayer == "layer" ? "text-[#6CC24A]" : "text-[#E5E5E5]"
            }`}
          />
        </div>
        <div
          onClick={() => setActiveLayer("menu")}
          className={`flex ${
            ActiveLayer == "menu" && "bg-white "
          }items-center justify-center px-2 py-[2px] rounded-md cursor-pointer `}
        >
          <img
            className={`report-sidemenu-menu-icon ${
              ActiveLayer == "menu" ? "text-[#6CC24A]" : "text-[#E5E5E5]"
            }`}
          />{" "}
        </div>
      </div>
      <div className="h-px w-full bg-gray-100 mt-4"></div>
      <div className="mt-6">
        <div className="text-xs font-medium text-[#383838] text-left">
          Sections
        </div>
        <div className="mt-2 flex flex-col gap-2">
          {ActiveLayer == "menu" &&
            menuItems.map((item, index) => (
              <div
                onClick={() => setactiveMenu(item)}
                key={index}
                className={`text-[10px] py-[2px] pl-1 text-nowrap  bg-[#F4F4F4]  text-[#383838] rounded-md border  hover:bg-[#E9E9E9] cursor-pointer ${
                  item == activeMenu ? "border-[#6CC24A]" : "border-gray-50"
                } flex justify-start`}
              >
                {index + 1}. {item}
              </div>
            ))}
          {ActiveLayer == "layer" && (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 6 }, (_, index) => (
                <div onClick={()=>setactiveImg(index+1)} key={index} className={`${index+1 == activeImg ? 'border-[#6CC24A]' : 'border-gray-50'} border rounded-md relative overflow-hidden w-[146px] h-[56px] `}>
                 <img className="absolute inset-0 w-[150px] h-[60px] object-cover" src={`./images/report-sidemenu/${index+1}.png`} alt="" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
