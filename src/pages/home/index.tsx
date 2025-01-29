import { Outlet } from 'react-router-dom';
import { SideMenu, MainTopBar } from '../../Components';

const Home = () => {
  return (
    <div className="h-screen p-5 md:p-0">
      <div className='w-full flex md:hidden justify-between items-center border-b border-white  py-2'>
        <div><img src="/public/icons/humber-menu.svg" alt="" /></div>
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
      <div className=" hidden md:block fixed left-0 top-0 z-[60]">
        <SideMenu></SideMenu>
      </div>
      <div className="w-full md:pl-[84px] pt-0 pb-2 h-[100vh] overflow-y-scroll">
        <Outlet></Outlet>
      </div>
    </div>
  );
};

export default Home;
