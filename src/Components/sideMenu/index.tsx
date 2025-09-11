/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { version } from '../../../package.json';

import { menus } from './menu';
import { subscribe } from '../../utils/event';
interface sideMenuProps {
  onClose: () => void;
}
const SideMenu: React.FC<sideMenuProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeMenu, setActiveMenu] = useState(() => {
    return (
      menus
        .flatMap((menu) => menu.items)
        .find((item) => item.url === location.pathname) || menus[0].items[0]
    );
  });
  const [showPlayground, setShowPlayground] = useState(false);
  const [permissions, setPermissions] = useState<any>({});
  subscribe('knowledge_playground-Show', () => {
    // alert("show playground");
    setShowPlayground(true);
  });
  subscribe('permissions-show', (data) => {
    console.log(data);
    setPermissions(data.detail);
    // setShowPlayground(true);
  });
  useEffect(() => {
    const currentActiveItem =
      menus
        .flatMap((menu) => menu.items)
        .find((item) => item.url === location.pathname) || menus[0].items[0];

    if (currentActiveItem.name !== activeMenu.name) {
      setActiveMenu(currentActiveItem);
    }
  }, [location.pathname, activeMenu, showPlayground]);
  const changeMenu = (menu: any) => {
    setActiveMenu(menu);
    navigate(menu.url);
    onClose();
  };
  const [height, setHeight] = useState(window.innerHeight - 145);

  useEffect(() => {
    const handleResize = () => {
      setHeight(window.innerHeight - 145);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  const dontPermisionsToRender = (name: string) => {
    // console.log(permissions);
    if (name === 'Playground' && !showPlayground) {
      return true;
    }
    if (name == 'Knowledge Graph' && permissions.ai_knowledge == false) {
      return true;
    }
    if (name == 'Package' && permissions.packages == false) {
      return true;
    }
    if (name == 'Staff' && permissions.staff == false) {
      return true;
    }
    if (name == 'Setting' && permissions.setting == false) {
      return true;
    }
    if (name == 'Drift Analysis' && permissions.drift_analysis == false) {
      return true;
    }
    return false;
  };
  return (
    <div className="w-[180px] xs:w-[250px] md:w-[170px] flex justify-start md:justify-center bg-white h-screen border-Boarder border border-t-0 pt-4 drop-shadow">
      <div className="w-full  relative">
        <div className="px-4">
          <div className="flex items-center justify-center">
            <img
              className="size-10 h-sm:size-[46px]"
              src="/images/new-clinic-log.svg"
              alt="Clinic Logo"
            />
          </div>
        </div>
        <div className="w-full">
          <div
            className="h-fit md:h-full overflow-y-auto hidden-scrollbar"
            style={{ height: `${height}px` }}
          >
            {menus.map((menuCategory) => (
              <div className="mt-2" key={menuCategory.category}>
                <div className=" px-3 text-[#B0B0B0] text-[10px] font-medium">
                  <>
                    {(menuCategory.category !== 'MANAGE' ||(
                      !dontPermisionsToRender('Staff') &&
                      !dontPermisionsToRender('Setting') &&
                      !dontPermisionsToRender('Package'))) && (
                      <>{menuCategory.category}</>
                    )}
                  </>
                </div>
                {menuCategory.items.map((menu) => (
                  <>
                    {menu.name === 'Knowledge Graph' &&
                    !dontPermisionsToRender(menu.name) ? (
                      <div className=" my-2  w-full flex pl-5  items-center">
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
                          className={` cursor-pointer flex border rounded-[20px]  border-Primary-DeepTeal flex-row  items-center gap-x-2 w-[133px] justify-center text-center text-[8px] h-sm:text-[9px] text-white font-semibold py-[2px] px-3 ${
                            activeMenu.name === menu.name
                              ? 'bg-gradient-to-r from-[#005F73] to-[#6CC24A]'
                              : ''
                          }`}
                        >
                          {activeMenu.name === menu.name ? (
                            <img
                              className="w-4 h-4 h-sm:w-4 h-sm:h-4"
                              src="/icons/side-menu/command-square-active.svg"
                              alt=""
                            />
                          ) : (
                            <img
                              className="w-4 h-4 h-sm:w-4 h-sm:h-4"
                              src="/icons/side-menu/command-square.svg"
                              alt=""
                            />
                          )}
                          <div
                            className={` text-[8px] xs:text-[10px]  font-medium block text-nowrap  ${
                              activeMenu.name === menu.name
                                ? 'text-white'
                                : ' bg-gradient-to-r from-[#005F73] to-[#6CC24A] bg-clip-text text-transparent block '
                            }`}
                          >
                            {menu.name}
                          </div>
                          {/* <div className={`${graph.icon} ${activeMenu.name === graph.name ? 'text-white' : 'text-red-500'}`} /> */}
                          {/* { activeMenu.name === graph.name && graph.name} */}
                        </div>
                      </div>
                    ) : (
                      <>
                        {dontPermisionsToRender(menu.name) ? (
                          <></>
                        ) : (
                          <div className="" key={menu.name}>
                            <div
                              onClick={() => {
                                if (menu.active) {
                                  changeMenu(menu);
                                }
                              }}
                              className={`h-[32px]  2xl:h-[32px] pl-5 py-4 pr-3  2xl:max-h-[32px]  w-full flex   items-center gap-x-1 text-[10px] ${menu.name == ''} ${
                                activeMenu.name === menu.name
                                  ? ' bg-[#E6EEF5] border-r-2 border-Primary-DeepTeal'
                                  : 'bg-white'
                              } ${!menu.active ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} text-[8px] h-sm:text-[10px] `}
                            >
                              <div
                                className={`w-4 h-4 h-sm:w-4 h-sm:h-4 ${menu.icon} ${
                                  activeMenu.name === menu.name
                                    ? 'text-Primary-DeepTeal'
                                    : 'text-Text-Primary'
                                }`}
                              />
                              <div
                                className={`${
                                  activeMenu.name === menu.name
                                    ? 'text-Primary-DeepTeal'
                                    : 'text-Text-Primary block '
                                }`}
                              >
                                {menu.name}
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </>
                ))}
              </div>
            ))}
            <div className="md:hidden text-[8px] text-Text-Primary font-medium flex flex-col w-full items-center gap-2">
              Powered by
              <img src="/images/sidebar-final.svg" alt="Powered by" />
            </div>
          </div>
        </div>
        <div className="hidden absolute bottom-0 md:bottom-5 text-[8px] text-[#888888] font-medium  pl-5 md:grid  w-full items-end gap-1">
          <div className="flex w-full justify-center items-end ml-[-16px]">
            Powered by
            <img
              className=""
              src="/images/sidebar-final.svg"
              alt="Powered by"
            />
          </div>
          <div className="text-center text-[8px] text-[#888888] font-medium">
            V{version}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideMenu;
