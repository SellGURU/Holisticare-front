/* eslint-disable @typescript-eslint/no-explicit-any */
import { MainModal } from '../../Components';
import ReportAnalyseView from '../../Components/RepoerAnalyse/ReportAnalyseView';
import { TopBar } from '../../Components/topBar';
import ReportSideMenu from '../../Components/reportSideMenu/newSideMenu';
import { ComboBar } from '../../Components';
import { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { subscribe, unsubscribe, publish } from '../../utils/event';
import Draggable from 'react-draggable';
import FullScreenModal from '../../Components/ComboBar/FullScreenModal';
import { ShareModal } from '../../Components/RepoerAnalyse/ShareModal';
import UnderProgressController from './underProgressController';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Application from '../../api/app';
import { getCached } from '../../utils/pageCache';
import {
  HEALTH_PLAN_CACHE_KEYS,
  HEALTH_PLAN_TTL_MS,
} from '../../utils/cacheKeys';

const ProgressDashboardView = lazy(
  () => import('../../Components/ProgressDashboard/ProgressDashboardView'),
);

const Report = () => {
  const [isVisibleCombo, setIsVisibleCombo] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showRefreshModal, setshowRefreshModal] = useState(false);
  const [compileModalError, setCompileModalError] = useState<string | null>(
    null,
  );
  const [, setActiveCheckProgress] = useState(false);
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [, setUserInfoData] = useState<any>(null);

  useEffect(() => {
    const state = location.state as { openRefreshModal?: boolean } | null;
    if (!state?.openRefreshModal) return;
    setCompileModalError(null);
    setshowRefreshModal(true);
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (!id) return;
    Application.getLatestLabJob(Number(id))
      .then((res) => {
        const data = res?.data;
        if (
          data?.job_id &&
          data?.overall_status &&
          ['queued', 'running'].includes(data.overall_status)
        ) {
          publish('labJobStarted', {
            job_id: data.job_id,
            member_id: id,
            file_id: data.file_id,
          });
          return;
        }
      })
      .catch(() => {
        // fall through to patient-info partial check
      });

    // RP-F01: share getCached key with ReportAnalyseView + ComboBar
    getCached(
      HEALTH_PLAN_CACHE_KEYS.patientInfo(id),
      () =>
        Application.getPatientsInfo({ member_id: Number(id) }).then(
          (res) => res.data,
        ),
      HEALTH_PLAN_TTL_MS,
    )
      .then((data) => {
        if (data?.has_partial_report && !data?.show_report) {
          publish('checkProgress', { resume: true, member_id: id });
        }
      })
      .catch(() => {});
  }, [id]);

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
      setCompileModalError(null);
      setshowRefreshModal(true);
    });
    subscribe('uploadTestShow', () => {
      setActiveReportSection('Health');
    });
    subscribe('openSideOut', () => {
      setIsVisibleCombo(false);
    });
    subscribe('closeSideOut', () => {
      setIsVisibleCombo(true);
    });
  }, []);
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
  const [, setFirst_time_view] = useState<boolean | null>(null);
  const [, setIsHaveScore] = useState(false);
  const [activeReportSection, setActiveReportSection] = useState<
    'Health' | 'Progress'
  >('Health');
  // RP-F12: do not mount Progress (or fetch wellness) until first Progress visit
  const [progressMounted, setProgressMounted] = useState(false);

  useEffect(() => {
    if (activeReportSection === 'Progress') {
      setProgressMounted(true);
    }
  }, [activeReportSection]);

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
          activeReportSection={activeReportSection}
          setActiveReportSection={setActiveReportSection}
          onClose={() => isMobileView && setIsMobileMenuOpen(false)}
        ></ReportSideMenu>
      </div>

      <div
        className={`${activeReportSection === 'Health' ? 'visible' : 'invisible'} w-full xl:pl-[200px] fixed`}
      >
        <ReportAnalyseView
          setFirst_time_view={setFirst_time_view}
          setActiveCheckProgress={setActiveCheckProgress}
          isActive={activeReportSection === 'Health'}
        ></ReportAnalyseView>
      </div>

      <div
        className={`${activeReportSection === 'Progress' ? 'visible' : 'invisible'} w-full xl:pl-[200px] fixed`}
      >
        {progressMounted ? (
          <Suspense fallback={null}>
            <ProgressDashboardView
              isActive={activeReportSection === 'Progress'}
              onHaveScore={(isHave: boolean) => {
                setIsHaveScore(isHave);
              }}
            />
          </Suspense>
        ) : null}
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
      <UnderProgressController member_id={id as string} />
      {/* <ProgressUiModal
        activeUi={activeCheckProgress}
        userInfoData={userInfoData}
      /> */}
      <MainModal
        isOpen={showRefreshModal}
        onClose={() => {
          setCompileModalError(null);
          setshowRefreshModal(false);
        }}
      >
        <div className="w-[500px] min-h-[208px] rounded-2xl relative py-6 px-8 bg-white shadow-800 text-Text-Primary">
          <div className="w-full flex items-center gap-2 border-b border-Gray-50 pb-2 font-medium text-sm">
            <img src="/icons/danger.svg" alt="" />
            Data needs to be compiled before generating a new plan
          </div>

          <div
            style={{
              textAlignLast: 'center',
            }}
            className="font-medium mt-4 text-xs flex w-full justify-center leading-6 "
          >
            Some of the client’s data has changed since the last update.
            <br /> Please compile the latest data to ensure the plan is
            generated accurately.
          </div>
          {compileModalError && (
            <div className="mt-3 text-center text-[11px] text-red-600 leading-5">
              {compileModalError}
            </div>
          )}
          <div className="mt-8 flex justify-end gap-4">
            <div
              className="text-[#909090] font-medium text-sm cursor-pointer"
              onClick={() => {
                setCompileModalError(null);
                setshowRefreshModal(false);
              }}
            >
              Cancel
            </div>
            <div
              onClick={() => {
                if (!id) return;
                setCompileModalError(null);
                setshowRefreshModal(false);
                publish('disableGenerate', {});
                publish('checkProgress', {});
                publish('SyncRefresh', {});
                Application.refreshData(id)
                  .then(() => {
                    publish('SyncRefresh', {});
                    publish('disableGenerate', {});
                  })
                  .catch((err) => {
                    console.error('Error refreshing data:', err);
                  });
              }}
              className="font-medium text-sm text-Primary-DeepTeal cursor-pointer"
            >
              Compile
            </div>
          </div>
        </div>
      </MainModal>
    </div>
  );
};

export default Report;
