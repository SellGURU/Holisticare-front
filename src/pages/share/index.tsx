/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import { useParams } from 'react-router-dom';
import Application from '../../api/app';
import { ReportSideMenu } from '../../Components';
import ReportAnalyseView from '../../Components/RepoerAnalyse/ReportAnalyseView';
import { TopBar } from '../../Components/topBar';
import { subscribe, unsubscribe } from '../../utils/event';

const Share = () => {
  const { id } = useParams<{ id: string }>();
  const [memberId, setMemberId] = useState<string>('123');
  useEffect(() => {
    Application.getMemberId(id as string).then((res) => {
      setMemberId(res.data.member_id);
    });
  }, []);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 1280);
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 1280;
      setIsMobileView(isMobile);

      // If switching to desktop view, close mobile menu
      if (!isMobile) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [isReportAvailable, setIsReportAvailable] = useState(true);
  const sideMenuRef = useRef(null);
  const handleStart = () => {
    setIsDragging(false);
  };
  const handleDrag = () => {
    setIsDragging(true);
  };

  const handleStop = () => {
    if (!isDragging) {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    }
  };
  useEffect(() => {
    const handleReportStatus = (message: any) => {
      const eventData = message as CustomEvent<{ isHaveReport: boolean }>;
      setIsReportAvailable(eventData.detail.isHaveReport);
    };

    subscribe('reportStatus', handleReportStatus);

    return () => {
      unsubscribe('reportStatus', handleReportStatus);
    };
  }, []);
  const [showCombo, setshowCombo] = useState(false);
  return (
    <>
      <div className="bg-bg-color min-h-screen w-full h-full">
        <div className="  w-full sticky z-50 top-0 ">
          <TopBar
            showCombo={showCombo}
            setShowCombo={() => setshowCombo(!showCombo)}
            canDownload
            isShare
          ></TopBar>
        </div>
        <Draggable
          onStart={handleStart}
          onDrag={handleDrag}
          onStop={handleStop}
        >
          <div
            // onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`fixed z-[40] top-[50%] left-6 bg-white rounded-md size-9 flex items-center justify-center py-0.5 px-2 cursor-pointer ${!isReportAvailable && 'opacity-40'}`}
          >
            <div className="report-sidemenu-layer-icon text-Primary-EmeraldGreen" />
          </div>
        </Draggable>
        <div
          ref={sideMenuRef}
          className={`
        
          ${isMobileView && !isMobileMenuOpen ? '-left-[178px]' : 'left-0'}
          
          transition-all z-[80] fixed top-20 xl:top-16  duration-300 ease-in-out
          xl:left-4
        `}
        >
          <ReportSideMenu
            onClose={() => isMobileView && setIsMobileMenuOpen(false)}
            isShare
          ></ReportSideMenu>
        </div>
        {memberId != '123' && (
          <div className="w-full xl:pl-[200px] fixed">
            <ReportAnalyseView
              memberID={Number(memberId)}
              uniqKey={id}
              isShare
            ></ReportAnalyseView>
          </div>
        )}
      </div>
    </>
  );
};

export default Share;
