import { Outlet } from 'react-router-dom';
import { SideMenu, MainTopBar } from '../../Components';
import { useRef, useState, useEffect } from 'react';
import useModalAutoClose from '../../hooks/UseModalAutoClose';
import Auth from '../../api/auth';
const Home = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768); // Using 768px as md breakpoint

  const sideMenuRef = useRef(null);
  useModalAutoClose({
    refrence: sideMenuRef,
    close: () => isMobileView && setIsMobileMenuOpen(false),
  });
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setIsMobileView(isMobile);

      // If switching to desktop view, close mobile menu
      if (!isMobile) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
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
    <div className="h-screen p-2 xs:px-3 sm:p-5 md:p-0">
      <div className="w-full flex md:hidden justify-between items-center border-b border-white  py-2">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2"
        >
          <img src="/icons/humber-menu.svg" alt="Menu" />
        </button>
        <div
          onClick={() => setVisibleClinic(!visibleClinic)}
          // ref={buttentRef}
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
   <div
     ref={refrence}
     className="absolute right-2  w-[132px] h-fit border top-14 border-gray-50  shadow-200 bg-white rounded-[6px] z-[60]"
   >
     <div className="flex justify-center items-center mt-2">
       <div className="w-10 h-10 flex items-center justify-center overflow-hidden rounded-full  ">
         <img
           className="w-full h-full object-contain"
           src="/icons/topbar-logo2.svg"
           alt=""
         />
       </div>
     </div>
     <div className="text-[10px] mt-1 text-center text-Text-Primary">
       Clinic Longevity 1
     </div>
     <div className="text-[8px] mt-[2px] text-center text-Text-Triarty">
       Clinic.Longevity@gmail.com aaaaaa
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
         className="flex gap-1 cursor-pointer"
       >
         <img src="./icons/logout.svg" alt="" />
         <div className="text-[12px] font-medium text-Primary-DeepTeal">
           Log out
         </div>
       </div>
     </div>
   </div>
 </>
        )}
      </div>
      <div className=" hidden md:block w-full sticky z-50 top-0 ">
        <MainTopBar></MainTopBar>
      </div>
      <div
        ref={sideMenuRef}
        className={`
        
          ${isMobileView && !isMobileMenuOpen ? '-left-[250px]' : 'left-0'}
          
          transition-all z-[60] fixed top-0 duration-300 ease-in-out
          md:left-0
        `}
      >
        <SideMenu onClose={() => isMobileView && setIsMobileMenuOpen(false)} />
      </div>

      <div className="w-full md:pl-[84px] pt-0 pb-2 h-[100vh] overflow-y-scroll">
        <Outlet></Outlet>
      </div>
    </div>
  );
};

export default Home;
