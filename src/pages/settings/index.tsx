import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from './components/SideBar';
import SearchBox from '../../Components/SearchBox';
import { Zappier } from './components/Zappier';
import PackagePage from './components/Package';
import { ClinicPreferences } from './components/ClinicPreferences';
import { ClinicProfile } from './components/ClinicProfile';
import { ChangePassword } from '../../Components/changePassword';
import { ShowTutorial } from './components/ShowTutorial';
import { fetchBrandInfo } from '../../utils/brandInfoCache';
import { useApp } from '../../hooks';

const Setting: React.FC = () => {
  const { accountRole } = useApp();
  const isAdmin =
    String(accountRole || '')
      .trim()
      .toLowerCase() === 'admin';
  const [activeMenu, setActiveMenu] = useState('Clinic Preferences');
  const [loginWithGoogle, setLoginWithGoogle] = useState(false);
  const [, setSearchParams] = useSearchParams();

  const mobileMenuItems = useMemo(() => {
    const items = [
      { title: 'Clinic Profile', isActive: isAdmin },
      { title: 'Clinic Preferences', isActive: true },
      { title: 'Change Password', isActive: loginWithGoogle === false },
      { title: 'Show Tutorial', isActive: true },
    ];
    return items.filter((item) => item.isActive);
  }, [isAdmin, loginWithGoogle]);

  const getShowBrandInfo = () => {
    fetchBrandInfo()
      .then((res) => {
        setLoginWithGoogle(Boolean(res.brand_elements.login_with_Google));
      })
      .catch((err) => {
        console.error('Error getting show brand info:', err);
      });
  };

  useEffect(() => {
    getShowBrandInfo();
  }, []);

  useEffect(() => {
    if (activeMenu === 'Clinic Profile' && !isAdmin) {
      setActiveMenu('Clinic Preferences');
      setSearchParams({ section: 'clinic-preferences' });
    }
  }, [activeMenu, isAdmin, setSearchParams]);

  useEffect(() => {
    if (activeMenu === 'Change Password' && loginWithGoogle) {
      setActiveMenu('Clinic Preferences');
      setSearchParams({ section: 'clinic-preferences' });
    }
  }, [activeMenu, loginWithGoogle, setSearchParams]);

  const handleMobileMenuClick = (item: string) => {
    setActiveMenu(item);
    setSearchParams({ section: item.replace(/\s+/g, '-').toLowerCase() });
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'Clinic Profile':
        return isAdmin ? <ClinicProfile /> : <ClinicPreferences />;
      case 'Clinic Preferences':
        return <ClinicPreferences />;
      case 'Zapier':
        return <Zappier />;
      case 'Update Your Profile':
        return <></>;
      case 'Change Password':
        return <ChangePassword />;
      case 'Show Tutorial':
        return <ShowTutorial />;
      case 'Packages':
        return <PackagePage />;
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
        <div className=" w-full flex flex-col md:flex-row ">
          <div className="md:hidden w-full pt-2 pb-3 overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max">
              {mobileMenuItems.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => handleMobileMenuClick(item.title)}
                  className={`px-3 py-1.5 rounded-2xl text-xs font-medium border ${
                    activeMenu === item.title
                      ? 'border-Primary-DeepTeal text-Primary-DeepTeal bg-white'
                      : 'border-Gray-50 text-[#888888] bg-backgroundColor-Card'
                  }`}
                >
                  {item.title}
                </button>
              ))}
            </div>
          </div>

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
