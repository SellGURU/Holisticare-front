// import { useNavigate } from "react-router-dom";

import { useRef, useState } from 'react';
import LogOutModal from '../LogOutModal';
import useModalAutoClose from '../../hooks/UseModalAutoClose';
// import Auth from '../../api/auth';
import { publish } from '../../utils/event';

const MainTopBar = () => {
  // const navigate = useNavigate();
  const [visibleClinic, setVisibleClinic] = useState(false);
  const refrence = useRef(null);
  const buttentRef = useRef(null);
  useModalAutoClose({
    refrence: refrence,
    buttonRefrence: buttentRef,
    close: () => {
      setVisibleClinic(false);
    },
  });
  return (
    <>
      <div className="w-full flex md:hidden justify-between items-center border-b border-white  py-2">
        <button
          onClick={() => {
            publish('mobileMenuOpen', {});
          }}
          className="p-2"
        >
          <img src="/icons/humber-menu.svg" alt="Menu" />
        </button>
        <div
          onClick={() => setVisibleClinic(!visibleClinic)}
          ref={buttentRef}
          // onClick={() => {
          //   setVisibleClinic(!visibleClinic);
          // }}
          className=" relative flex select-none items-center gap-1 TextStyle-Body-2 cursor-pointer text-[#383838]"
        >
          <img src="/icons/topbar-logo2.svg" alt="" />
          Clinic Longevity 1
        </div>
        {visibleClinic && (
          <>
            <LogOutModal refrence={refrence}></LogOutModal>
          </>
        )}
      </div>
      <div className="hidden md:block w-full sticky z-50 top-0 ">
        <div className="w-full flex items-center justify-end bg-white border-b  border-gray-50 pl-4 pr-6 py-2 shadow-100">
          <div className="relative">
            <div className="flex gap-10 ">
              <div className="size-6 rounded-[31px] bg-white border border-Gray-50 shadow-drop flex items-center justify-center cursor-pointer -mr-4 ">
                <img src="/icons/notification-2.svg" alt="" />
              </div>
              <div
                ref={buttentRef}
                onClick={() => {
                  setVisibleClinic(!visibleClinic);
                }}
                className="flex select-none items-center gap-1 TextStyle-Body-2 cursor-pointer text-[#383838]"
              >
                <img src="/icons/topbar-logo2.svg" alt="" />
                Clinic Longevity 1
              </div>
            </div>
            {visibleClinic && <LogOutModal refrence={refrence}></LogOutModal>}
          </div>
        </div>
      </div>
    </>
  );
};

export default MainTopBar;
