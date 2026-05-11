import { Outlet } from 'react-router-dom';
import DemoBanner from '../Components/DemoBanner';

const Layout = () => {
  return (
    <>
      <div className="w-full bg-bg-color min-h-screen h-full">
        <DemoBanner />
        <Outlet></Outlet>
      </div>
    </>
  );
};

export default Layout;
