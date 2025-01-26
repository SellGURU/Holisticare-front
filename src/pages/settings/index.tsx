import React, { useState } from 'react';
import Sidebar from './components/SideBar';
import SearchBox from '../../Components/SearchBox';
// import Content from './Content';
import Overview from './components/overView';
import { Zappier } from './components/Zappier';
const Setting: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState('Overview');
  const renderContent = () => {
    switch (activeMenu) {
      case 'Overview':
        return <Overview></Overview>;
      case 'Zapier':
        return <Zappier></Zappier>;
      case 'Update Your Profile':
      // return <UpdateProfileContent />;
      case 'Change Password':
      // return <ChangePasswordContent />;
      // Add other cases as needed...
      default:
        return <div></div>;
    }
  };
  return (
    <div className="w-full h-screen px-6 pt-8 relative overflow-hidden">
      <div className="flex justify-between">
        <div className="text-2xl text-Text-Primary">Setting</div>
        <SearchBox
          ClassName="rounded-lg"
          placeHolder="Search in Setting ..."
          onSearch={() => {}}
        ></SearchBox>
      </div>
      <div className="flex h-screen w-full gap-8 ">
        <div className="fixed  ">
          <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
        </div>

        <div className="mt-10 w-full pl-[200px]">{renderContent()}</div>
      </div>
    </div>
  );
};

export default Setting;
