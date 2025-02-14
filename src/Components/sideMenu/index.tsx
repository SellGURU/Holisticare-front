/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { menus } from './menu';
interface sideMenuProps {
  onClose: () => void;
}
const SideMenu: React.FC<sideMenuProps> = ({ onClose }) => {
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
    onClose();
  };

  return (
    <>
      <div className=" w-[180px] xs:w-[250px] md:w-[84px] flex justify-start md:justify-center bg-white h-screen border-Boarder border border-t-0 ">
        <div className=" w-full mt-4 relative ">
          <div className="px-4">
            {/* <div
              className="text-Text-Secondary text-[14px] text-center"
              style={{ fontFamily: "Rozha One" }}
            >
              Clinic Logo
            </div> */}
            <div className="flex items-center justify-center">
              <img
                className="size-10 h-sm:size-12"
                src="/images/Logo-Light.svg"
                alt=""
              />
            </div>
          </div>
          <div className="w-full">
            <div
              className="mt-3 h-fit md:h-full overflow-y-auto"
              style={{ height: window.innerHeight - 100 + 'px' }}
            >
              {menus.map((menu) => (
                <>
                  <div
                    onClick={() => {
                      if (menu.active) {
                        changeMenu(menu);
                      }
                    }}
                    className={`h-[48px] max-h-[48px] 2xl:h-[50px] pl-6 md:pl-0 2xl:max-h-[50px] py-1 w-full flex flex-row md:flex-col md:justify-center items-center gap-x-2 text-xs  text-Primary-EmeraldGreen  ${
                      activeMenu.name === menu.name
                        ? 'border-Primary-EmeraldGreen border-r-2 bg-white shadow-drop'
                        : ''
                    }  ${menu.name == 'Knowledge Graph' && 'hidden'} ${!menu.active ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} text-[8px] h-sm:text-[10px] font-semibold`}
                  >
                    <div
                      className={` w-5 h-5  h-sm:w-6 h-sm:h-6 ${menu.icon} ${
                        activeMenu.name === menu.name
                          ? 'text-Primary-EmeraldGreen'
                          : 'text-[#888888]'
                      }`}
                    />
                    <div
                      className={`  ${
                        activeMenu.name === menu.name
                          ? 'text-Primary-EmeraldGreen'
                          : ' text-Text-Secondary block md:hidden'
                      }`}
                    >
                      {menu.name}
                    </div>
                    {/* {activeMenu.name === menu.name && menu.name} */}
                  </div>
                  {menu.name === 'Shared with you' ? (
                    <div></div>
                  ) : (
                    // <div className="w-[80%] bg-Gray-50 h-px mb-1 mx-auto"></div>
                    menu.name === 'Knowledge Graph' && (
                      <div className="border-y border-Gray-50 w-[80%] py-1 flex items-center justify-center mx-auto">
                        {' '}
                        <div
                          onClick={() => {
                            changeMenu(menu);
                          }}
                          // style={{
                          //   background: `
                          //   linear-gradient(transparent, transparent) padding-box,
                          //   linear-gradient(to right, #005F73, #6CC24A) border-box
                          //   `,
                          //   border: "1px solid transparent",
                          //   borderRadius: "16px",
                          // }}
                          className={`w-full flex border rounded-[20px] my-2 border-Primary-DeepTeal flex-row md:flex-col items-center gap-x-2 justify-center text-center text-[8px] h-sm:text-[9px] text-white font-semibold py-2 px-4 ${
                            activeMenu.name === menu.name
                              ? 'bg-gradient-to-r from-[#005F73] to-[#6CC24A]'
                              : ''
                          }`}
                        >
                          {activeMenu.name === menu.name ? (
                            <img
                              className="w-5 h-5 h-sm:w-6 h-sm:h-6"
                              src="/icons/side-menu/command-square-active.svg"
                              alt=""
                            />
                          ) : (
                            <img
                              className="w-5 h-5 h-sm:w-6 h-sm:h-6"
                              src="/icons/side-menu/command-square.svg"
                              alt=""
                            />
                          )}
                          <div
                            className={` text-[8px] xs:text-[10px] md:text-xs font-medium block md:hidden ${
                              activeMenu.name === menu.name
                                ? 'text-white'
                                : ' bg-gradient-to-r from-[#005F73] to-[#6CC24A] bg-clip-text text-transparent block md:hidden'
                            }`}
                          >
                            {menu.name}
                          </div>
                          {/* <div className={`${graph.icon} ${activeMenu.name === graph.name ? 'text-white' : 'text-red-500'}`} /> */}
                          {/* { activeMenu.name === graph.name && graph.name} */}
                        </div>
                      </div>
                    )
                  )}
                </>
              ))}
              <div className=" md:hidden  text-[8px] text-Text-Primary font-medium flex flex-col w-full items-center gap-2">
                Powered by
                <img src="/icons/poweredBy.svg" alt="" />
              </div>
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
          <div className=" hidden  absolute bottom-0 md:bottom-3  text-[8px] text-Text-Primary font-medium md:flex flex-col w-full items-center gap-2">
            Powered by
            <img src="/icons/poweredBy.svg" alt="" />
          </div>
        </div>
      </div>
    </>
  );
};

export default SideMenu;
