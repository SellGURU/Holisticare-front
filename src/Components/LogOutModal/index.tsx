/* eslint-disable @typescript-eslint/no-explicit-any */
// import { useRef, useState } from 'react';
// import useModalAutoClose from '../../hooks/UseModalAutoClose';
import Auth from '../../api/auth';

interface LogOutModalProps {
  refrence: any;
  customTheme: any;
}

const LogOutModal: React.FC<LogOutModalProps> = ({ refrence, customTheme }) => {
  // const [visibleClinic, setVisibleClinic] = useState(false);
  // const refrence = useRef(null);
  // const buttentRef = useRef(null);
  // useModalAutoClose({
  //   refrence: refrence,
  //   buttonRefrence: buttentRef,
  //   close: () => {
  //     setVisibleClinic(false);
  //   },
  // });
  return (
    <>
      <div
        ref={refrence}
        className="absolute right-0 z-50 w-[180px] h-[128px] border top-14 md:top-10 border-gray-50  shadow-200 bg-white rounded-[6px]"
      >
        <div className="flex justify-center items-center mt-2">
          <div className="w-10 h-10 flex items-center justify-center overflow-hidden rounded-full  ">
            {customTheme.selectedImage ? (
              <img
                className="h-full w-full "
                src={customTheme.selectedImage}
                alt=""
              />
            ) : (
              <img src="/icons/topbar-logo2.svg" alt="" />
            )}
          </div>
        </div>
        <div className="text-[10px] mt-1 text-center text-Text-Primary">
          {customTheme.name ? customTheme.name : 'Clinic Longevity 1'}{' '}
        </div>
        <div className="text-[8px] mt-[2px] text-center text-Text-Triarty">
          Clinic.Longevity@gmail.com
        </div>
        <div className="px-4">
          <div className="w-full h-[0.5px] my-2  bg-[#E2F1F8]"></div>
        </div>
        <div className="flex justify-center">
          <div
            onClick={() => {
              Auth.logOut();
              localStorage.clear();
              window.location.reload();
            }}
            onTouchEnd={() => {
              Auth.logOut();
              localStorage.clear();
              window.location.reload();
            }}
            className="flex gap-1 cursor-pointer"
          >
            <img src="/icons/logout.svg" alt="" />
            <div className="text-[12px] font-medium text-Primary-DeepTeal">
              Log out
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LogOutModal;
