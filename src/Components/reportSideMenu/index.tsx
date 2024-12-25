import { useState } from "react";
const ReportSideMenu = () => {
  const menuItems = [
    "Client Summary",
    "Needs Focus Biomarkers",
    "Detailed Analysis",
    "Concerning Result",
    "Treatment Plan",
    "Action Plan",
  ];
  const [activeMenu, setactiveMenu] = useState("Client Summary");
  const [ActiveLayer, setActiveLayer] = useState("menu");
  const [activeImg, setactiveImg] = useState(1);

  return (
    <div className="h-full max-h-[646px] min-h-[586px] w-[178px] bg-white border border-gray-50 rounded-[12px] p-4 shadow-100 ">
      <div className="flex  rounded-[7px] p-px gap-[2px] w-[76px] h-[26px] bg-backgroundColor-Main">
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
        <div className="TextStyle-Headline-6 text-left">Sections</div>
        <div className="mt-2 flex flex-col gap-1">
          {ActiveLayer == "menu" &&
            menuItems.map((item, index) => (
              <div
                onClick={() => {
                  setactiveMenu(item);
                  document.getElementById(item)?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
                key={index}
                className={`text-[10px] h-[24px] flex justify-start items-center pl-2 text-nowrap  bg-backgroundColor-Main text-Text-Primary rounded-md border  hover:bg-gray-200 cursor-pointer ${
                  item == activeMenu
                    ? "border-Primary-EmeraldGreen"
                    : "border-gray-50"
                } flex justify-start`}
              >
                {index + 1}. {item}
              </div>
            ))}
          {ActiveLayer == "layer" && (
            <div className="flex flex-col gap-2">
              {menuItems.map((item,index)=>(
                <div
                  onClick={() => {setactiveImg(index + 1)
                    document.getElementById(item)?.scrollIntoView({
                      behavior: "smooth",
                      
                    });

                  }}
                  key={index}
                  className={`${
                    index + 1 == activeImg
                      ? "border-Primary-EmeraldGreen"
                      : "border-gray-50"
                  } border rounded-md relative overflow-hidden w-[146px] h-[56px] `}
                >
                  <img
                    className=" "
                    src={`/images/report-sidemenu/${index + 1}.png`}
                    alt=""
                  />
                </div>
              ))}
            
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportSideMenu;
