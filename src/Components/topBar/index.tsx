/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from 'react-router-dom';
import { ButtonPrimary } from '../Button/ButtonPrimary';
import LogOutModal from '../LogOutModal';
import { SlideOutPanel } from '../SlideOutPanel';
import DownloadModal from './downloadModal';
import { useState } from 'react';
import SpinnerLoader from '../SpinnerLoader';
// import { useEffect } from "react";

interface TopBarProps {
  canDownload?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ canDownload }) => {
  const navigate = useNavigate();
  const printreport = () => {
    const mywindow: any = window.open('', 'PRINT', 'height=300,width=800');
    mywindow.document.write(`
      <html>
          <head>
          <title>${document.title}</title>
          <!-- Link to Tailwind CSS -->
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
          <style>
              @media print {
              body {
                  background-color: white !important;
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
      mywindow.close();
    };
    // mywindow.print()
  };
  const resolveNav = () => {
    const locationAddress = window.location.pathname;
    const routeData = locationAddress.split('/');
    if (locationAddress.includes('Generate-Holistic-Plan')) {
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
  return (
    <div className="w-full flex items-center justify-between bg-white border-b  border-gray-50 pl-4 pr-6 py-2 shadow-100">
      <div className="flex gap-2 items-center ">
        <img src="/icons/home.svg" alt="" />
        {resolveNav().map((el, index: number) => {
          return (
            <>
              <div
                onClick={() => {
                  if (index != resolveNav().length - 1) {
                    navigate(el.url);
                  }
                }}
                className={`TextStyle-Button text-[#445A74] ${index == resolveNav().length - 1 ? 'opacity-50' : ''} cursor-pointer ml-1`}
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
      <div className="flex gap-10 ">
        {canDownload && (
          <div className="flex gap-3">
            <ButtonPrimary
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
                setOpenShare(true);
              }}
              className="flex items-center gap-1 TextStyle-Button text-[#005F73] cursor-pointer "
            >
              <img src="/icons/share.svg" alt="" />
              Share
            </div>
          </div>
        )}

        <LogOutModal></LogOutModal>
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
            onconfirm={() => {
              if (openDownload) {
                setDownloadingState('downloading');
                setOpenDownload(false);
                setTimeout(() => {
                  printreport();
                  setDownloadingState('Downloaded');
                  setTimeout(() => {
                    setDownloadingState('download');
                  }, 2000);
                }, 3000);
              }
              setOpenShare(false);
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
