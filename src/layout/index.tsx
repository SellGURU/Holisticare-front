import { Outlet } from 'react-router-dom';
import DemoBanner from '../Components/DemoBanner';
import { useChatPresenceHeartbeat } from '../hooks/useChatPresenceHeartbeat';

const Layout = () => {
  useChatPresenceHeartbeat();
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
