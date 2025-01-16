/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { menus } from "./menu";
const SideMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeMenu, setActiveMenu] = useState(() => {
    return menus.find((menu) => menu.url === location.pathname) || menus[0];
  });
  //   useEffect(() => {
  //     const currentActiveMenu =
  //       menus.find((menu) => menu.url === location.pathname) || menus[0];
  //     if (currentActiveMenu.name !== activeMenu.name) {
  //       setActiveMenu(currentActiveMenu);
  //     }
  //   }, [location.pathname, activeMenu]);
  const changeMenu = (menu: any) => {
    setActiveMenu(menu);
    navigate(menu.url);
  };

  return (
    <>
      <div className="w-[84px] flex justify-center bg-white h-screen border-Boarder border border-t-0 ">
        <div className=" w-full mt-4 relative ">
          <div className="px-4">
            {/* <div
              className="text-Text-Secondary text-[14px] text-center"
              style={{ fontFamily: "Rozha One" }}
            >
              Clinic Logo
            </div> */}
            <div className="flex items-center justify-center">
              <img className="size-10 h-sm:size-12" src="/images/Logo-Light.svg" alt="" />
            </div>
          </div>
          <div className="w-full">
            <div className="mt-3">
              {menus.map((menu) => (
                <>
                  <div
                    onClick={() => {
                      if(menu.active){
                        changeMenu(menu)
                      }
                    }}
                    className={`h-[48px] max-h-[48px] 2xl:h-[50px] 2xl:max-h-[50px] py-1 w-full flex flex-col justify-center items-center   text-Primary-EmeraldGreen  ${
                      activeMenu.name === menu.name
                        ? "border-Primary-EmeraldGreen border-r-2 bg-white shadow-drop"
                        : ""
                    }  ${menu.name == 'Knowledge Graph' && 'hidden'} ${!menu.active ? 'opacity-50 cursor-not-allowed':'cursor-pointer'} text-[8px] h-sm:text-[10px] font-semibold`}
                  >
                    <div
                      className={` w-5 h-5  h-sm:w-6 h-sm:h-6 ${menu.icon} ${
                        activeMenu.name === menu.name
                          ? "text-Primary-EmeraldGreen"
                          : "text-[#888888]"
                      }`}
                    />
                    <div
                      className={`${
                        activeMenu.name === menu.name ? "" : "hidden"
                      }`}
                    >
                      {menu.name}
                    </div>
                    {/* {activeMenu.name === menu.name && menu.name} */}
                  </div>
                  {menu.name === "Shared with you" ? (
                    <div className="w-[80%] bg-Gray-50 h-px mb-1 mx-auto"></div>
                    
                  ):menu.name === "Knowledge Graph" && (
                    <div className="border-y border-Gray-50 w-[80%] py-1 flex items-center justify-center mx-auto">
                    {" "}
                    <div
                      onClick={() => {
                        changeMenu(menu);
                      }}
                      style={{
                        //   borderImage:
                        //     "linear-gradient(to right, #005F73 , #6CC24A ) 1",
                        
                        borderRadius: "16px",
                      }}
                      className={`  border  border-Primary-EmeraldGreen w-full flex flex-col items-center text-center text-[8px]  h-sm:text-[9px] rounded-[16px]  text-white font-semibold py-2 px-4 ${
                        activeMenu.name === menu.name
                          ? "bg-gradient-to-r from-[#005F73] to-[#6CC24A]"
                          : ""
                      }`}
                    >
                      {activeMenu.name === menu.name ? (
                        <img className= "w-5 h-5 h-sm:w-6 h-sm:h-6"
                          src="/icons/side-menu/command-square-active.svg"
                          alt=""
                        />
                      ) : (
                        <img className= "w-5 h-5 h-sm:w-6 h-sm:h-6" src="/icons/side-menu/command-square.svg" alt="" />
                      )}
                      {/* <div className={`${graph.icon} ${activeMenu.name === graph.name ? 'text-white' : 'text-red-500'}`} /> */}
                      {/* { activeMenu.name === graph.name && graph.name} */}
                    </div>
                  </div>
                  )
                }
                </>
              ))}
              {/* <div className="py-3 flex justify-center">
                                <img src="./icons/side-menu/dashboard.svg" alt="" />
                            </div>
                            <div className="py-3 w-full flex flex-col items-center gap-2 border-Primary-DeepTeal border-r-2 text-[10px] font-medium" style={{boxShadow:'0px -1px 24px 0px #005F731A'}}>
                                <img className="sidemenu-menu-icon-drift-analysis " src="" alt="" />
                                Drift Analysis
                            </div>
                            <div className="py-3 flex justify-center">
                                <img src="./icons/side-menu/shared-witth-you.svg" alt="" />
                            </div>
                            <div className="py-3 w-full flex justify-center border-Primary-DeepTeal border-r-2" style={{boxShadow:'0px -1px 24px 0px #005F731A'}}>
                                <img className="sidemenu-menu-icon-clientList text-Primary-DeepTeal" src="./icons/side-menu/client-list.svg" alt="" />
                            </div>   
                            <div className="py-3 flex justify-center">
                                <img src="./icons/side-menu/messages.svg" alt="" />
                            </div>   
                            <div className="py-3 flex justify-center">
                                <img src="./icons/side-menu/setting-2.svg" alt="" />
                            </div>                                                                                                                 */}
            </div>
  
          </div>
          <div className=" absolute bottom-3  text-[8px] text-Text-Primary font-medium flex flex-col w-full items-center gap-2">
            Powered by
            <img src="/icons/poweredBy.svg" alt="" />
          </div>
        </div>
      </div>
    </>
  );
};

export default SideMenu;
