/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from 'react-router-dom';
import { ButtonPrimary } from '../Button/ButtonPrimary';
import LogOutModal from '../LogOutModal';
import { SlideOutPanel } from '../SlideOutPanel';
import DownloadModal from './downloadModal';
import { useEffect, useRef, useState } from 'react';
import SpinnerLoader from '../SpinnerLoader';
import { publish } from '../../utils/event';
import { resolveAccesssUser } from '../../help';
import Application from '../../api/app';
import useModalAutoClose from '../../hooks/UseModalAutoClose';
import { subscribe, unsubscribe } from '../../utils/event';
import { BeatLoader } from 'react-spinners';
// import { CircleLoader } from 'react-spinners';
// import { useEffect } from "react";

interface TopBarProps {
  canDownload?: boolean;
  showCombo?: boolean;
  setShowCombo?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  canDownload,
  setShowCombo,
  showCombo,
}) => {
  const navigate = useNavigate();
  const printreport = () => {
    const mywindow: any = window.open('', 'PRINT', 'height=300,width=800');
    mywindow.document.write(`
      <html>
          <head>
          <title>${document.title}</title>
          <!-- Link to Tailwind CSS -->
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet">
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
          <style>
              @media print {
                @page {
                    size: A4;
                    margin: 0;
                }      
              body {
                  background-color: #E9F0F2 !important;
                  font-family: 'Inter', sans-serif !important; /* Use Inter font for printing */
              }
              .header,
              .footer {
                display: none;
              }                  
              .bg-gray-100 {
                  background-color: #f3f4f6 !important; /* Tailwind Gray 100 */
              }
              .bg-blue-500 {
                  background-color: #3b82f6 !important; /* Tailwind Blue 500 */
              }
              .no-split {
              page-break-inside: avoid; /* Prevents splitting the element */
              break-inside: avoid;     /* For modern browsers */
              }                    
              * {
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
              }                    
              }
          </style>            
          </head>
          <body>
          ${document.getElementById('printDiv')?.innerHTML}
          </body>
      </html>
      `);
    mywindow.document.close(); // necessary for IE >= 10
    mywindow.onload = () => {
      mywindow.focus(); // necessary for IE >= 10*/

      mywindow.print();
      // mywindow.close();
    };
    // mywindow.print()
  };
  const [visibleClinic, setVisibleClinic] = useState(false);
  const refrence = useRef(null);
  const buttentRef = useRef(null);
  useModalAutoClose({
    refrence: refrence,
    buttonRefrence: buttentRef,
    close: () => {
      setVisibleClinic(false);
    },
  });
  const resolveNav = () => {
    const locationAddress = window.location.pathname;
    const routeData = locationAddress.split('/');
    if (
      locationAddress.includes('Generate-Holistic-Plan') ||
      locationAddress.includes('Generate-Recommendation')
    ) {
      return [
        {
          name: 'Home',
          url: '/',
        },
        {
          name: 'Report',
          url: '/report/' + routeData[3] + '/a',
        },
        {
          name: 'Generate Holistic Plan',
          url: '/report/Generate-Holistic-Plan',
        },
      ];
    }
    if (locationAddress.includes('Generate-Action-Plan')) {
      return [
        {
          name: 'Home',
          url: '/',
        },
        {
          name: 'Report',
          url: '/report/' + routeData[3] + '/a',
        },
        {
          name: 'Generate Action Plan',
          url: '/report/Generate-Action-Plan',
        },
      ];
    }
    if (locationAddress.includes('action-plan/edit')) {
      return [
        {
          name: 'Home',
          url: '/',
        },
        {
          name: 'Report',
          url: '/report/' + routeData[3] + '/a',
        },
        {
          name: 'Generate Day to Day Activity',
          url: '/report/',
        },
      ];
    } else {
      return [
        {
          name: 'Home',
          url: '/',
        },
        {
          name: 'Report',
          url: '/report/' + routeData[2] + '/a',
        },
      ];
    }
  };
  const [openDownload, setOpenDownload] = useState(false);
  const [openShare, setOpenShare] = useState(false);
  const [downloadingState, setDownloadingState] = useState('download');
  const [isReportAvailable, setIsReportAvailable] = useState(true);
  const [customTheme, setCustomTheme] = useState(
    localStorage.getItem('brandInfoData')
      ? JSON.parse(localStorage.getItem('brandInfoData') || '{}')
      : {
          selectedImage: null as string | null,
          name: '',
          headLine: '',
        },
  );
  const [hasReportInRoute, setHasReportInRoute] = useState(false);

  const getShowBrandInfo = () => {
    Application.getShowBrandInfo().then((res) => {
      if (
        res.data.brand_elements.name === null ||
        res.data.brand_elements.name === '' ||
        res.data.brand_elements.logo === null
      ) {
        navigate('/register-profile');
        return;
      }
      setCustomTheme({
        headLine: res.data.brand_elements.headline,
        name: res.data.brand_elements.name,
        selectedImage: res.data.brand_elements.logo,
      });
      localStorage.setItem(
        'brandInfoData',
        JSON.stringify({
          headLine: res.data.brand_elements.headline,
          name: res.data.brand_elements.name,
          selectedImage: res.data.brand_elements.logo,
        }),
      );
    });
  };

  useEffect(() => {
    getShowBrandInfo();
  }, []);

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

  useEffect(() => {
    const locationAddress = window.location.pathname;
    const routeParts = locationAddress.split('/').filter((part) => part !== '');

    // Check if route follows pattern: /report/{something}/{id}
    // where {something} is NOT a generation route
    const hasReport =
      routeParts.length >= 3 &&
      routeParts[0] === 'report' &&
      !routeParts[1].includes('Generate');

    setHasReportInRoute(hasReport);
    console.log(
      'Route changed:',
      locationAddress,
      'Route parts:',
      routeParts,
      'Has report:',
      hasReport,
    );
  }, [window.location.pathname]);

  const shouldEnableActions = !isReportAvailable;

  return (
    <div className="w-full flex items-center justify-between bg-[#E9F0F2] md:bg-white md:border-b  border-gray-50 pl-2 xs:pl-4 pr-3 xs:pr-6 py-2 shadow-100">
      <div className="flex gap-2 items-center ">
        <img onClick={() => navigate('/')} src="/icons/home.svg" alt="" />
        {resolveNav().map((el, index: number) => {
          return (
            <>
              <div
                onClick={() => {
                  if (index != resolveNav().length - 1) {
                    navigate(el.url);
                  }
                }}
                className={`TextStyle-Button ${index == 0 ? 'text-[#445A74]' : 'text-[#6783A0] '} ${index == resolveNav().length - 1 ? 'opacity-50' : ''} cursor-pointer ml-1`}
              >
                {el.name}
              </div>
              {index != resolveNav().length - 1 && (
                <img className="w-5 h-5" src="/icons/arrow-right.svg" alt="" />
              )}
            </>
          );
        })}

        {/* <img className="w-5 h-5" src="/icons/arrow-right.svg" alt="" />
        <span className="TextStyle-Button text-[#6783A0]">Report</span> */}
      </div>
      {hasReportInRoute && (
        <div className="flex xl:hidden items-center gap-2 xs:gap-4">
          <img
            onClick={() => {
              setOpenDownload(true);
            }}
            src="/icons/document-download.svg"
            alt=""
          />
          <img
            onClick={() => {
              setOpenShare(true);
            }}
            src="/icons/link-2.svg"
            alt=""
          />
          <img
            onClick={setShowCombo}
            src={showCombo ? '/icons/close.svg' : '/icons/menu-2.svg'}
            alt=""
          />
        </div>
      )}
      <div className="hidden xl:flex gap-10">
        {canDownload && hasReportInRoute && (
          <div className="flex gap-3">
            <ButtonPrimary
              disabled={shouldEnableActions}
              size="small"
              onClick={() => {
                setOpenDownload(true);
              }}
            >
              {downloadingState == 'download' && (
                <>
                  <img className="w-4 h-4" src="/icons/download.svg" alt="" />
                  Download
                </>
              )}
              {downloadingState == 'downloading' && (
                <>
                  <SpinnerLoader></SpinnerLoader>
                  Downloading
                </>
              )}
              {downloadingState == 'Downloaded' && (
                <>
                  <img src="/icons/tick.svg" className="w-4 h-4" alt="" />
                  Downloaded
                </>
              )}
            </ButtonPrimary>
            <div
              onClick={() => {
                if (shouldEnableActions) return;
                setOpenShare(true);
              }}
              className={`flex items-center gap-1 TextStyle-Button text-[#005F73] ${
                shouldEnableActions
                  ? 'cursor-not-allowed opacity-60'
                  : 'cursor-pointer'
              }`}
            >
              <img src="/icons/share.svg" alt="" />
              Share
            </div>
          </div>
        )}
        <div className="relative">
          <div className="flex gap-10 ">
            {/* <div className="size-6 rounded-[31px] bg-white border border-Gray-50 shadow-drop flex items-center justify-center cursor-pointer -mr-4 ">
              <img src="/icons/notification-2.svg" alt="" />
            </div> */}
            <div
              ref={buttentRef}
              onClick={() => {
                setVisibleClinic(!visibleClinic);
              }}
              className="flex select-none items-center gap-1 TextStyle-Body-2 cursor-pointer text-[#383838]"
            >
              {customTheme.selectedImage ? (
                <img
                  className="size-6 rounded-full "
                  src={customTheme.selectedImage}
                  alt=""
                />
              ) : (
                <div className="w-full h-5 flex justify-center items-center">
                  <BeatLoader size={6}></BeatLoader>
                </div>
                // <img src="/icons/topbar-logo2.svg" alt="" />
              )}
              {customTheme.name ? customTheme.name : ''}{' '}
            </div>
          </div>
          {visibleClinic && (
            <LogOutModal
              customTheme={customTheme}
              refrence={refrence}
            ></LogOutModal>
          )}
        </div>
      </div>
      <SlideOutPanel
        isOpen={openDownload || openShare}
        headline={
          openDownload
            ? 'Select Sections to Download'
            : 'Select Sections to Share'
        }
        onClose={() => {
          setOpenDownload(false);
          setOpenShare(false);
        }}
      >
        <>
          <DownloadModal
            // isOpen={openDownload || openShare}
            onconfirm={(settingsData) => {
              const locationAddress = window.location.pathname;
              const routeData = locationAddress.split('/');
              if (openDownload) {
                setDownloadingState('downloading');
                publish('downloadCalled', settingsData);
                setOpenDownload(false);
                setTimeout(() => {
                  printreport();
                  setDownloadingState('Downloaded');
                  setTimeout(() => {
                    setDownloadingState('download');
                  }, 200);
                }, 300);
                setOpenShare(false);
              } else {
                Application.getPatientsInfo({
                  member_id: routeData[2],
                }).then(async (res) => {
                  if (navigator.share) {
                    try {
                      await navigator
                        .share({
                          title: 'Holisticare',
                          url:
                            `https://holisticare.vercel.app` +
                            '/share/' +
                            res.data.unique_key +
                            '/' +
                            resolveAccesssUser(settingsData),
                        })
                        .finally(() => {
                          setOpenShare(false);
                        });
                    } catch (error) {
                      console.error('Error sharing:', error);
                    }
                  } else {
                    alert('Sharing not supported in this browser.');
                  }
                  // window.open(
                  //   '/share/' +
                  //     res.data.unique_key +
                  //     '/' +
                  //     resolveAccesssUser(settingsData),
                  // );
                });
              }
            }}
            onclose={() => {
              setOpenDownload(false);
              setOpenShare(false);
            }}
          ></DownloadModal>
        </>
      </SlideOutPanel>
    </div>
  );
};
