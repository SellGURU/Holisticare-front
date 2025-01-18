import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <>
      <div className="w-full bg-bg-color min-h-screen h-full">
        <Outlet></Outlet>
      </div>
    </>
  );
};

export default Layout;
