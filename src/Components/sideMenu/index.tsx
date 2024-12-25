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
  const graph =     {
    name:'Knowledge Graph ',
    icon:'sidemenu-menu-icon-trend-up',
    url:''
}     
  return (
    <>
      <div className="w-[84px] flex justify-center bg-white h-screen border-Boarder border">
        <div className=" w-full mt-6 relative ">
          <div className="px-4">
            <div
              className="text-Text-Secondary text-[14px] text-center"
              style={{ fontFamily: "Rozha One" }}
            >
              Clinic Logo
            </div>
          </div>
          <div className="w-full">
            <div className="mt-12">
              {menus.map((menu) => (
                <div
                  onClick={() => changeMenu(menu)}
                  className={`py-3 w-full flex flex-col items-center gap-2  text-Primary-DeepTeal  ${
                    activeMenu.name === menu.name
                      ? "border-Primary-DeepTeal border-r-2 bg-white"
                      : ""
                  } text-[10px] font-semibold`}
                >
                  <div
                    className={`${menu.icon} ${
                      activeMenu.name === menu.name
                        ? "text-Primary-DeepTeal"
                        : "text-Text-Secondary"
                    }`}
                  />
                  {activeMenu.name === menu.name && menu.name}
                </div>
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
            <div
            onClick={()=>{
                changeMenu(graph)
            }}
              className={`my-2 border-y my-gradient-border py-4 w-full flex flex-col items-center text-center  text-[9px]  text-white font-semibold min-h-[56px] ${activeMenu.name === graph.name ? 'bg-gradient-to-r from-[#005F73] to-[#6CC24A]' : ''}`}
            >
                {
                    activeMenu.name === graph.name ? (
                        <img src="/icons/side-menu/trend-up-white.svg" alt="" />
                    ):(
                        <img src="/icons/side-menu/trend-up.svg" alt="" />

                    )
                }
              {/* <div className={`${graph.icon} ${activeMenu.name === graph.name ? 'text-white' : 'text-red-500'}`} /> */}
                { activeMenu.name === graph.name && graph.name}
            </div>
          </div>
          <div className=" absolute bottom-4  text-[8px] text-Text-Primary font-medium flex flex-col w-full items-center gap-2">
          Powered by
          <img src="/public/icons/side-menu/logo.svg" alt="" />
          </div>
        
        </div>
      </div>
    </>
  );
};

export default SideMenu;
