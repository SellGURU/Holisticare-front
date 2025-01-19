import { Outlet } from 'react-router-dom';
import { SideMenu, MainTopBar } from '../../Components';

const Home = () => {
  return (
    <div className="h-screen">
      <div className="w-full sticky z-50 top-0 ">
        <MainTopBar></MainTopBar>
      </div>
      <div className="fixed left-0 top-0 z-[10]">
        <SideMenu></SideMenu>
      </div>
      <div className="w-full pl-[84px] pt-0 pb-2 h-[100vh] overflow-y-scroll">
        <Outlet></Outlet>
      </div>
    </div>
  );
};

export default Home;
