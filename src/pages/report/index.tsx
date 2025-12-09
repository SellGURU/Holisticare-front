/* eslint-disable @typescript-eslint/no-explicit-any */
import { MainModal, ReportSideMenu } from '../../Components';
import ReportAnalyseView from '../../Components/RepoerAnalyse/ReportAnalyseView';
import { TopBar } from '../../Components/topBar';
import { ComboBar } from '../../Components';
import { useState, useEffect, useRef } from 'react';
import { subscribe, unsubscribe } from '../../utils/event';
import Draggable from 'react-draggable';
import FullScreenModal from '../../Components/ComboBar/FullScreenModal';
import { ShareModal } from '../../Components/RepoerAnalyse/ShareModal';
import UnderProgressController from './underProgressController';
import { useParams } from 'react-router-dom';
import ProgressUiModal from './underProgressController/ProgressUiModal';
import Application from '../../api/app';
import { publish } from '../../utils/event';

const Report = () => {
  const [isVisibleCombo, setIsVisibleCombo] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showRefreshModal, setshowRefreshModal] = useState(false);
  const [activeCheckProgress, setActiveCheckProgress] = useState(false);
  const { id } = useParams<{ id: string }>();
  const [userInfoData, setUserInfoData] = useState<any>(null);
  useEffect(() => {
    subscribe('userInfoData', (data: any) => {
      setUserInfoData(data.detail);
    });
  }, []);
  const [treatmentId, setTreatmentId] = useState<string>('');
  useEffect(() => {
    subscribe('openShareModalHolisticPlan', (data: any) => {
      setIsShareModalOpen(true);
      console.log(data.detail);
      setTreatmentId(data.detail.treatmentId);
    });
  }, []);
  useEffect(() => {
    subscribe('openRefreshModal', () => {
      setshowRefreshModal(true);
    });
  }, []);
  subscribe('openSideOut', () => {
    setIsVisibleCombo(false);
  });
  subscribe('closeSideOut', () => {
    setIsVisibleCombo(true);
  });
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
  const sideMenuRef = useRef(null);
  const [showCombo, setshowCombo] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

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
  const [isReportAvailable, setIsReportAvailable] = useState(true);

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
  return (
    <div className="w-full h-full">
      <FullScreenModal />
      <div className="  w-full sticky z-50 top-0 ">
        <TopBar
          showCombo={showCombo}
          setShowCombo={() => setshowCombo(!showCombo)}
          canDownload
        ></TopBar>
      </div>

      <Draggable onStart={handleStart} onDrag={handleDrag} onStop={handleStop}>
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
        ></ReportSideMenu>
      </div>

      <div className="w-full xl:pl-[200px] fixed">
        <ReportAnalyseView
          setActiveCheckProgress={setActiveCheckProgress}
        ></ReportAnalyseView>
      </div>

      <div
        className={`fixed top-10 duration-300 ease-in-out transition-all xl:top-20 xl:right-6 h-[80vh] flex items-center justify-between flex-col ${isVisibleCombo ? 'visible' : 'invisible'}           ${isMobileView && !showCombo ? '-right-[120px]' : 'right-0'}
        `}
      >
        <ComboBar></ComboBar>
      </div>

      <ShareModal
        treatmentId={treatmentId}
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          // setIsShareModalLoading(false);
        }}
      />
      <UnderProgressController
        activeUi={activeCheckProgress}
        member_id={id as string}
      />
      <ProgressUiModal userInfoData={userInfoData} />
      <MainModal
        isOpen={showRefreshModal}
        onClose={() => {
          setshowRefreshModal(false);
        }}
      >
        <div className="w-[500px] h-[208px] rounded-2xl relative py-6 px-8 bg-white shadow-800 text-Text-Primary">
          <div className="w-full flex items-center gap-2 border-b border-Gray-50 pb-2 font-medium text-sm">
            <img src="/icons/danger.svg" alt="" />
            Data needs to be synced before generating a new plan
          </div>

          <div
            style={{
              textAlignLast: 'center',
            }}
            className="font-medium mt-4 text-xs flex w-full justify-center leading-6 "
          >
            Some of the client’s data has changed since the last update. <br />{' '}
            Please sync the latest data to ensure the plan is generated
            accurately.
          </div>
          <div className="absolute bottom-6 right-8 flex gap-4">
            <div
              className="text-[#909090] font-medium text-sm cursor-pointer"
              onClick={() => {
                setshowRefreshModal(false);
              }}
            >
              Cancel
            </div>
            <div
              onClick={() => {
                if (id) {
                  Application.refreshData(id, false).then(() => {
                    setshowRefreshModal(false);
                    publish('SyncRefresh', {});
                    publish('disableGenerate', {});
                    publish('checkProgress', {});
                  });
                }
              }}
              className="text-Primary-DeepTeal  cursor-pointer font-medium text-sm"
            >
              Sync Data
            </div>
          </div>
        </div>
      </MainModal>
    </div>
  );
};

export default Report;
