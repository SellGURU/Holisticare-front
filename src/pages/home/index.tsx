import { Outlet } from 'react-router-dom';
import { SideMenu, MainTopBar } from '../../Components';
import { useRef, useState , useEffect} from 'react';
import useModalAutoClose from '../../hooks/UseModalAutoClose';
const Home = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768); // Using 768px as md breakpoint

const sideMenuRef = useRef(null)
useModalAutoClose({
  refrence : sideMenuRef,
  close: () => isMobileView && setIsMobileMenuOpen(false)
})
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
  return (
    <div className="h-screen p-5 md:p-0">
      <div className='w-full flex md:hidden justify-between items-center border-b border-white  py-2'>
      <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2"
        >
          <img src="/icons/humber-menu.svg" alt="Menu" />
        </button>
        <div
          // ref={buttentRef}
          // onClick={() => {
          //   setVisibleClinic(!visibleClinic);
          // }}
          className="flex select-none items-center gap-1 TextStyle-Body-2 cursor-pointer text-[#383838]"
        >
          <img src="/icons/topbar-logo2.svg" alt="" />
          Clinic Longevity 1
        </div>
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
        <SideMenu />
      </div>
     
      <div className="w-full md:pl-[84px] pt-0 pb-2 h-[100vh] overflow-y-scroll">
        <Outlet></Outlet>
      </div>
    </div>
  );
};

export default Home;
