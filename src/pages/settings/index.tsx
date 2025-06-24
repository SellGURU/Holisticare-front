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
        return <ClinicPreferences/>
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
    <>
      <div className="flex fixed z-[48] top-13 w-full pr-6 pl-[194px] py-4 left-0  justify-between">
        <div className="text-2xl text-Text-Primary">Setting</div>
        <SearchBox
          ClassName="rounded-lg"
          placeHolder="Search in Setting ..."
          onSearch={() => {}}
        ></SearchBox>
      </div>
      <div className="w-full px-6 pt-9  ">
        <div className="flex  w-full gap-8 ">
          <div className="fixed  ">
            <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
          </div>

          <div className="mt-10 w-full pl-[200px] bg-bg-color">
            {renderContent()}
          </div>
        </div>
      </div>
    </>
  );
};

export default Setting;
