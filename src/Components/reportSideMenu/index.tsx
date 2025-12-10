/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { subscribe, unsubscribe, publish } from '../../utils/event'; // Adjust the import path as needed
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import SvgIcon from '../../utils/svgIcon';
import { decodeAccessUser } from '../../help';
interface ReportSideMenuProps {
  onClose: () => void;
  isShare?: boolean;
  activeReportSection: 'Health' | 'Progress';
  setActiveReportSection: (section: 'Health' | 'Progress') => void;
}

const formatStringWithQuotes = (str: string): string => {
  if (str.includes('Need Focus')) {
    return str.replace(/Need Focus/g, '"Need Focus"');
  }
  return str;
};

const ReportSideMenu: React.FC<ReportSideMenuProps> = ({
  onClose,
  isShare,
  activeReportSection,
  setActiveReportSection,
}) => {
  const healthMenuItems = [
    'Client Summary',
    'Need Focus Biomarker',
    'Concerning Result',
    'Detailed Analysis',
    'Holistic Plan',
    'Action Plan',
  ];

  const progressMenuItems = ['Wellness Data', 'Progress Data'];

  const [activeMenu, setactiveMenu] = useState('Client Summary');
  const [ActiveLayer, setActiveLayer] = useState('menu');
  const [activeImg, setactiveImg] = useState(1);
  const [disableClicks, setDisableClicks] = useState(false);
  const location = useLocation();
  const [accessManager, setAccessManager] = useState<Array<any>>([
    {
      name: 'Client Summary',
      checked: true,
    },
    {
      name: 'Need Focus Biomarker',
      checked: true,
    },
    {
      name: 'Concerning Result',
      checked: true,
    },
    {
      name: 'Detailed Analysis',
      checked: true,
    },
    {
      name: 'Holistic Plan',
      checked: true,
    },
    {
      name: 'Action Plan',
      checked: true,
    },
  ]);
  const resolveSteps = () => {
    const items =
      activeReportSection === 'Progress' ? progressMenuItems : healthMenuItems;
    if (!isShare) {
      return items;
    } else {
      return items.filter(
        (el) =>
          accessManager.filter((val) => val.name == el)[0]?.checked == true,
      );
    }
  };
  const { name } = useParams<{ name: string }>();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const handleNoReportAvailable = () => {
      setDisableClicks(true);
      if (params.get('section')) {
        setactiveMenu(params.get('section') as string);
      } else {
        setactiveMenu('Client Summary');
      }
    };
    const handleReportAvailable = () => {
      setDisableClicks(false);
      if (params.get('section')) {
        setactiveMenu(params.get('section') as string);
      } else {
        setactiveMenu('Client Summary');
      }
    };
    subscribe('noReportAvailable', handleNoReportAvailable);
    subscribe('ReportAvailable', handleReportAvailable);
    const handleScrolledSection = (data: any) => {
      // Only update if the section is in the current tab's menu items
      const currentItems =
        activeReportSection === 'Progress'
          ? progressMenuItems
          : healthMenuItems;
      if (currentItems.includes(data.detail.section)) {
        setactiveMenu(data.detail.section);
      }
    };
    subscribe('scrolledSection', handleScrolledSection);

    // Subscribe to tab changes from ReportAnalyseView
    const handleTabChange = (data: any) => {
      const newTab = data.detail.tab;
      if (newTab !== activeReportSection) {
        setActiveReportSection(newTab);
        // Set default menu item for the new tab
        if (newTab === 'Progress') {
          setactiveMenu('Wellness Data');
        } else {
          setactiveMenu('Client Summary');
        }
        setactiveImg(1);
      }
    };
    subscribe('activeTabChange', handleTabChange);

    // Publish initial tab state
    publish('activeTabChange', { tab: activeReportSection });

    return () => {
      unsubscribe('scrolledSection', handleScrolledSection);
      unsubscribe('activeTabChange', handleTabChange);
    };
  }, [activeReportSection]);
  const [, setSearchParams] = useSearchParams();
  const onchangeMenu = (item: string) => {
    setSearchParams({ ['section']: item });
    setactiveMenu(item);
    if (activeReportSection === 'Progress') {
      // For Progress tab, scroll to the specific section in the dashboard
      const elementId =
        item === 'Wellness Data' ? 'wellness-summary' : 'score-progression';
      document.getElementById(elementId)?.scrollIntoView({
        behavior: 'smooth',
      });
    } else {
      // For Health tab, use the original behavior
      document.getElementById(item)?.scrollIntoView({
        behavior: 'instant',
      });
    }
  };
  useEffect(() => {
    if (isShare) {
      setAccessManager(decodeAccessUser(name as string));
    }
  }, [name]);
  const [isReportAvailable, setIsReportAvailable] = useState(true);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    const handleReportStatus = (message: any) => {
      const eventData = message as CustomEvent<{ isHaveReport: boolean }>;
      setIsReportAvailable(eventData.detail.isHaveReport);
    };
    const handleShowReport = (message: any) => {
      const eventData = message as CustomEvent<{ showReport: boolean }>;
      setShowReport(eventData.detail.showReport);
    };
    subscribe('reportStatus', handleReportStatus);
    subscribe('showReport', handleShowReport);
    return () => {
      unsubscribe('reportStatus', handleReportStatus);
      unsubscribe('showReport', handleShowReport);
    };
  }, []);

  return (
    <div
      style={{ height: window.innerHeight - 100 + 'px' }}
      className={` min-h-[272px]  w-[178px] bg-white '} border border-gray-50 rounded-[12px] p-4 shadow-100 relative`}
    >
      <div className="flex gap-1 mb-4">
        <div
          onClick={() => {
            setActiveReportSection('Health');
            setactiveMenu('Client Summary');
            setactiveImg(1);
            publish('activeTabChange', { tab: 'Health' });
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
            activeReportSection === 'Health'
              ? 'bg-Primary-EmeraldGreen text-white'
              : 'bg-backgroundColor-Main text-Text-Primary'
          }`}
        >
          <img
            src="/icons/health.svg"
            alt="Health"
            className="w-4 h-4"
            style={
              activeReportSection === 'Health'
                ? { filter: 'brightness(0) invert(1)' }
                : { filter: 'opacity(0.5) brightness(0) saturate(0)' }
            }
          />
          <span className="text-[10px] font-medium">Health</span>
        </div>
        <div
          onClick={() => {
            setActiveReportSection('Progress');
            setactiveMenu('Wellness Data');
            setactiveImg(1);
            publish('activeTabChange', { tab: 'Progress' });
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
            activeReportSection === 'Progress'
              ? 'bg-Primary-EmeraldGreen text-white'
              : 'bg-backgroundColor-Main text-Text-Primary'
          }`}
        >
          <img
            src="/icons/chart.svg"
            alt="Progress"
            className="w-4 h-4"
            style={
              activeReportSection === 'Progress'
                ? { filter: 'brightness(0) invert(1)' }
                : { filter: 'opacity(0.5) brightness(0) saturate(0)' }
            }
          />
          <span className="text-[10px] font-medium">Progress</span>
        </div>
      </div>
      <div className="flex rounded-[7px] p-px gap-[2px] w-[76px] h-[26px] bg-backgroundColor-Main">
        <div
          onClick={() =>
            !disableClicks &&
            (isReportAvailable || showReport) &&
            setActiveLayer('menu')
          }
          className={`flex ${ActiveLayer === 'menu' && 'bg-white '} items-center justify-center px-2 py-[2px] rounded-md cursor-pointer `}
        >
          <img
            className={`report-sidemenu-menu-icon ${ActiveLayer === 'menu' ? 'text-[#6CC24A]' : 'text-[#E5E5E5]'}`}
          />
        </div>
        <div
          onClick={() =>
            !disableClicks &&
            (isReportAvailable || showReport) &&
            setActiveLayer('layer')
          }
          className={`flex ${ActiveLayer === 'layer' && 'bg-white '} items-center justify-center px-2 py-[2px] rounded-md cursor-pointer `}
        >
          <img
            className={`report-sidemenu-layer-icon ${ActiveLayer === 'layer' ? 'text-[#6CC24A]' : 'text-[#E5E5E5]'}`}
          />
        </div>
      </div>
      <div
        onClick={() => onClose()}
        className="size-8 rounded-md bg-white shadow-100 py-2 px-4 flex items-center justify-center xl:hidden absolute right-3 top-3 cursor-pointer"
      >
        <SvgIcon src="/icons/close.svg" color="#005F73" />
      </div>
      <div className="h-px w-full bg-gray-100 mt-4"></div>
      <div className="mt-6  overflow-y-auto">
        <div className="TextStyle-Headline-6 text-left hidden md:block">
          Sections
        </div>
        <div className="mt-2 flex flex-col gap-1">
          {ActiveLayer === 'menu' &&
            resolveSteps().map((item, index) => (
              <div
                onClick={() => {
                  if (!disableClicks && (isReportAvailable || showReport)) {
                    onchangeMenu(item);
                  }
                }}
                key={index}
                className={`text-[10px] ${disableClicks && index != 0 ? 'opacity-50' : ''} h-[24px] flex justify-start items-center pl-2 text-nowrap bg-backgroundColor-Main text-Text-Primary rounded-md border cursor-pointer ${
                  item === activeMenu
                    ? 'border-Primary-EmeraldGreen'
                    : 'border-gray-50'
                } flex justify-start gap-1 `}
              >
                {index + 1}.{' '}
                {item == 'Holistic Plan' ? (
                  <img src="/icons/crown.svg" />
                ) : item == 'Action Plan' ? (
                  <img src="/icons/verify.svg" />
                ) : undefined}
                <span>{formatStringWithQuotes(item)}</span>
              </div>
            ))}
          {ActiveLayer === 'layer' && (
            <div className="flex flex-col gap-2">
              {resolveSteps().map((item, index) => {
                // Determine image path based on active tab
                let imagePath: string;
                if (activeReportSection === 'Progress') {
                  // For Progress tab, use progress-specific images
                  // Assuming images are named: progress-1.png, progress-2.png
                  // Or use a different folder: /images/report-sidemenu-progress/
                  imagePath = `/images/report-sidemenu-progress/${index + 1}.png`;
                } else {
                  // For Health tab, use the existing health images
                  imagePath = `/images/report-sidemenu-c/${index + 1}.png`;
                }

                return (
                  <div
                    onClick={() => {
                      if (!disableClicks && (isReportAvailable || showReport)) {
                        setactiveImg(index + 1);
                        if (activeReportSection === 'Progress') {
                          // For Progress tab, scroll to the specific section
                          const elementId =
                            item === 'Wellness Data'
                              ? 'wellness-summary'
                              : 'score-progression';
                          document.getElementById(elementId)?.scrollIntoView({
                            behavior: 'smooth',
                          });
                        } else {
                          // For Health tab, use the original behavior
                          document.getElementById(item)?.scrollIntoView({
                            behavior: 'smooth',
                          });
                        }
                      }
                    }}
                    key={index}
                    className={`${
                      index + 1 == activeImg
                        ? 'border-Primary-EmeraldGreen'
                        : 'border-gray-50'
                    } border rounded-md relative cursor-pointer `}
                  >
                    <img
                      className=" "
                      src={imagePath}
                      alt=""
                      onError={(e) => {
                        // Fallback to a placeholder or default image if the specific image doesn't exist
                        const target = e.target as HTMLImageElement;
                        if (activeReportSection === 'Progress') {
                          // If progress images don't exist, you might want to create them or use a placeholder
                          // For now, we'll use a generic placeholder or the health images as fallback
                          target.src = `/images/report-sidemenu-c/${index + 1}.png`;
                        }
                      }}
                    />
                    <div className="absolute bg-white w-4 h-4 border-[0.5px] border-Gray-50 rounded-[3px] shadow-200 text-xs text-center text-Primary-DeepTeal bottom-[6px] left-1">
                      {index + 1}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportSideMenu;
