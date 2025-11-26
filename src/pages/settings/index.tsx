import React, { useEffect, useState } from 'react';
import Sidebar from './components/SideBar';
import SearchBox from '../../Components/SearchBox';
// import Content from './Content';
// import Overview from './components/overView';
import { Zappier } from './components/Zappier';
import PackagePage from './components/Package';
import { ClinicPreferences } from './components/ClinicPreferences';
import { ChangePassword } from '../../Components/changePassword';
import Application from '../../api/app';
const Setting: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState('Clinic Preferences');
  const [loginWithGoogle, setLoginWithGoogle] = useState(false);
  const getShowBrandInfo = () => {
    Application.getShowBrandInfo().then((res) => {
      setLoginWithGoogle(res.data.brand_elements.login_with_Google);
    });
  };
  useEffect(() => {
    getShowBrandInfo();
  }, []);
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
        return <ChangePassword></ChangePassword>;

      case 'Packages':
        return <PackagePage></PackagePage>;
      // return <ChangePasswordContent />;
      // Add other cases as needed...
      default:
        return <div></div>;
    }
  };
  return (
    <div>
      <div className="flex md:fixed z-[48] top-13 w-full md:pr-6 pr-3 pl-3  md:pl-[194px] py-4 left-0  justify-between ">
        <div className=" text-base font-medium text-Text-Primary">Setting</div>
        <div className="hidden">
          <SearchBox
            ClassName="rounded-lg"
            placeHolder="Search in Setting ..."
            onSearch={() => {}}
          ></SearchBox>
        </div>
      </div>
      <div className="w-full px-3 md:px-6 md:pt-9  ">
        <div className=" w-full flex  ">
          <div className=" hidden md:block   ">
            <Sidebar
              activeMenu={activeMenu}
              setActiveMenu={setActiveMenu}
              loginWithGoogle={loginWithGoogle}
            />
          </div>

          <div className="md:mt-10 w-full  h-full  bg-bg-color">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setting;
