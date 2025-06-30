import React, { useState } from 'react';
import Sidebar from './components/SideBar';
import SearchBox from '../../Components/SearchBox';
// import Content from './Content';
// import Overview from './components/overView';
import { Zappier } from './components/Zappier';
import PackagePage from './components/Package';
import { ClinicPreferences } from './components/ClinicPreferences';
const Setting: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState('Clinic Preferences');
  const renderContent = () => {
    switch (activeMenu) {
      case 'Clinic Preferences':
        return <ClinicPreferences />;
      case 'Zapier':
        return <Zappier></Zappier>;
      case 'Update Your Profile':
        return <></>;
      // return <UpdateProfileContent />;
      case 'Change Password':
        return <></>;

      case 'Packages':
        return <PackagePage></PackagePage>;
      // return <ChangePasswordContent />;
      // Add other cases as needed...
      default:
        return <div></div>;
    }
  };
  return (
    <div
      style={{ height: window.innerHeight - 87 + 'px' }}
      className="overflow-auto"
    >
      <div className="flex md:fixed z-[48] top-13 w-full md:pr-6 pr-3 pl-3  md:pl-[194px] py-4 left-0  justify-between ">
        <div className="text-2xl text-Text-Primary">Setting</div>
        <SearchBox
          ClassName="rounded-lg"
          placeHolder="Search in Setting ..."
          onSearch={() => {}}
        ></SearchBox>
      </div>
      <div className="w-full px-3 md:px-6 md:pt-9  ">
        <div className="flex flex-col md:flex-row w-full gap-8 ">
          <div className="md:fixed  ">
            <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
          </div>

          <div className="md:mt-10 w-full h-full md:pl-[200px] bg-bg-color">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setting;
