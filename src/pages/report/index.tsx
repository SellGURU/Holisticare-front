import { ReportSideMenu } from '../../Components';
import ReportAnalyseView from '../../Components/RepoerAnalyse/ReportAnalyseView';
import { TopBar } from '../../Components/topBar';
import { ComboBar } from '../../Components';
import { useState, useEffect, useRef } from 'react';
import { subscribe } from '../../utils/event';

const Report = () => {
  const [isVisibleCombo, setIsVisibleCombo] = useState(true);
  subscribe('openSideOut', () => {
    setIsVisibleCombo(false);
  });
  subscribe('closeSideOut', () => {
    setIsVisibleCombo(true);
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setIsMobileView(isMobile);

      // If switching to desktop view, close mobile menu
      if (!isMobile) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const sideMenuRef = useRef(null);

  return (
    <div className="w-full h-full">
      <div className=" hidden md:block w-full sticky z-50 top-0 ">
        <TopBar canDownload></TopBar>
      </div>
      <div
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed z-[60]  top-[50%] left-3 bg-white rounded-md size-9 flex items-center justify-center py-0.5 px-2"
      >
        <div className="report-sidemenu-layer-icon text-Primary-EmeraldGreen" />
      </div>
      <div
        ref={sideMenuRef}
        className={`
        
          ${isMobileView && !isMobileMenuOpen ? '-left-[178px]' : 'left-0'}
          
          transition-all z-[80] fixed top-20 md:top-16  duration-300 ease-in-out
          md:left-4
        `}
      >
        <ReportSideMenu
          onClose={() => isMobileView && setIsMobileMenuOpen(false)}
        ></ReportSideMenu>
      </div>

      <div className="w-full pl-[200px] fixed">
        <ReportAnalyseView></ReportAnalyseView>
      </div>

      <div
        className={`fixed top-20 right-6 h-[80vh] hidden md:flex items-center justify-between flex-col ${isVisibleCombo ? 'visible' : 'invisible'} `}
      >
        <ComboBar></ComboBar>
      </div>
    </div>
  );
};

export default Report;
