/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { publish, subscribe, unsubscribe } from '../../utils/event'; // Adjust the import path as needed
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import SvgIcon from '../../utils/svgIcon';
import { decodeAccessUser } from '../../help';
import { navKey } from '../../i18n/wave1Resources';
import {
  AI_CLINICAL_BRIEF_SECTION,
  resolveReportSection,
  RISKS_SCORES_AGE_SECTION,
} from '../RepoerAnalyse/healthRiskAssessments';
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
  const { t } = useTranslation('reports');
  const sectionLabel = (item: string) =>
    t(`sectionLabels.${navKey(item)}`, {
      defaultValue: formatStringWithQuotes(item),
    });
  const menuItems = [
    'Concerning Result',
    'Need Focus Biomarker',
    RISKS_SCORES_AGE_SECTION,
    'Detailed Analysis',
    'Holistic Plan',
    'Action Plan',
  ];
  const progressMenuItems = ['Wellness Summary', 'Score Progression'];
  const [hideRisksSection, setHideRisksSection] = useState(false);

  const resolveActiveItems = () => {
    if (activeReportSection === 'Progress') {
      return progressMenuItems;
    }
    if (hideRisksSection) {
      return menuItems.filter((item) => item !== RISKS_SCORES_AGE_SECTION);
    }
    return menuItems;
  };

  const [activeMenu, setactiveMenu] = useState(AI_CLINICAL_BRIEF_SECTION);
  const [ActiveLayer] = useState('menu');
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
      name: RISKS_SCORES_AGE_SECTION,
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
    if (!isShare) {
      return resolveActiveItems();
    } else {
      return resolveActiveItems().filter(
        (el) =>
          accessManager.filter((val) => val.name == el)[0]?.checked == true,
      );
      // return menuItems.filter((el) => accessManager.filter((val) =>val.name == el)[0].checked ==true)
    }
  };
  const resolveImageFolder = () => {
    if (activeReportSection === 'Progress') {
      return 'report-sidemenu-progress';
    } else {
      return 'report-sidemenu-c';
    }
  };
  const { name } = useParams<{ name: string }>();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const handleNoReportAvailable = () => {
      setDisableClicks(true);
      if (params.get('section')) {
        setactiveMenu(resolveReportSection(params.get('section') as string));
      } else {
        setactiveMenu(AI_CLINICAL_BRIEF_SECTION);
      }
    };
    const handleReportAvailable = () => {
      setDisableClicks(false);
      if (params.get('section')) {
        setactiveMenu(resolveReportSection(params.get('section') as string));
      } else {
        setactiveMenu(AI_CLINICAL_BRIEF_SECTION);
      }
    };
    subscribe('noReportAvailable', handleNoReportAvailable);
    subscribe('ReportAvailable', handleReportAvailable);
    subscribe('scrolledSection', (data) => {
      console.log(data.detail.section);
      setactiveMenu(resolveReportSection(data.detail.section));
    });
  }, []);
  const [, setSearchParams] = useSearchParams();
  const onchangeMenu = (item: string) => {
    const section = resolveReportSection(item);
    setSearchParams({ ['section']: section });
    setactiveMenu(section);
    if (section === AI_CLINICAL_BRIEF_SECTION) {
      const container = document.querySelector('.scroll-container');
      if (container instanceof HTMLElement) {
        container.scrollTo({ top: 0, behavior: 'instant' });
      }
      return;
    }
    document.getElementById(section)?.scrollIntoView({
      behavior: 'instant',
    });
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

  useEffect(() => {
    const handleRisksScoresAgeStatus = (message: any) => {
      const eventData = message as CustomEvent<{ isempty: boolean }>;
      setHideRisksSection(Boolean(eventData.detail.isempty));
    };
    subscribe('RisksScoresAgeStatus', handleRisksScoresAgeStatus);
    return () => {
      unsubscribe('RisksScoresAgeStatus', handleRisksScoresAgeStatus);
    };
  }, []);

  return (
    <div
      style={{ height: window.innerHeight - 100 + 'px' }}
      className={` min-h-[272px]  w-[178px] bg-white '} border border-gray-50 rounded-[12px] p-4 shadow-100 relative`}
    >
      {!isShare && (
        <div className="flex gap-1 mb-4">
          <div
            onClick={() => {
              setSearchParams({
                ['type']: 'Health',
                ['section']: AI_CLINICAL_BRIEF_SECTION,
              });
              setActiveReportSection('Health');
              setactiveMenu(AI_CLINICAL_BRIEF_SECTION);
              setactiveImg(1);
              // publish('activeTabChange', { tab: 'Health' });
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
              activeReportSection === 'Health'
                ? 'bg-Primary-EmeraldGreen text-white'
                : 'bg-backgroundColor-Main text-Text-Primary'
            }`}
          >
            <img
              src="/icons/health.svg"
              alt={t('health')}
              className="w-4 h-4"
              style={
                activeReportSection === 'Health'
                  ? { filter: 'brightness(0) invert(1)' }
                  : { filter: 'opacity(0.5) brightness(0) saturate(0)' }
              }
            />
            <span className="text-[10px] font-medium">{t('health')}</span>
          </div>
          <div
            onClick={() => {
              setSearchParams({
                ['type']: 'Progress',
                ['section']: 'Wellness Summary',
              });
              setActiveReportSection('Progress');
              setactiveMenu('Wellness Summary');
              setactiveImg(1);
              // publish('activeTabChange', { tab: 'Progress' });
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
              activeReportSection === 'Progress'
                ? 'bg-Primary-EmeraldGreen text-white'
                : 'bg-backgroundColor-Main text-Text-Primary'
            }`}
          >
            <img
              src="/icons/chart.svg"
              alt={t('progress')}
              className="w-4 h-4"
              style={
                activeReportSection === 'Progress'
                  ? { filter: 'brightness(0) invert(1)' }
                  : { filter: 'opacity(0.5) brightness(0) saturate(0)' }
              }
            />
            <span className="text-[10px] font-medium">{t('progress')}</span>
          </div>
        </div>
      )}
      {/* <div className="flex rounded-[7px] p-px gap-[2px] w-[76px] h-[26px] bg-backgroundColor-Main">
        <div
          onClick={() => {
            if (activeReportSection == 'Progress') {
              setActiveLayer('menu');
            } else {
              if (!disableClicks && (isReportAvailable || showReport)) {
                setActiveLayer('menu');
              }
            }
          }}
          className={`flex ${ActiveLayer === 'menu' && 'bg-white '} items-center justify-center px-2 py-[2px] rounded-md cursor-pointer `}
        >
          <img
            className={`report-sidemenu-menu-icon ${ActiveLayer === 'menu' ? 'text-[#6CC24A]' : 'text-[#E5E5E5]'}`}
          />
        </div>
        <div
          onClick={() => {
            if (activeReportSection == 'Progress') {
              setActiveLayer('layer');
            } else {
              if (!disableClicks && (isReportAvailable || showReport)) {
                setActiveLayer('layer');
              }
            }
          }}
          className={`flex ${ActiveLayer === 'layer' && 'bg-white '} items-center justify-center px-2 py-[2px] rounded-md cursor-pointer `}
        >
          <img
            className={`report-sidemenu-layer-icon ${ActiveLayer === 'layer' ? 'text-[#6CC24A]' : 'text-[#E5E5E5]'}`}
          />
        </div>
      </div> */}
      <div
        onClick={() => onClose()}
        className="size-8 rounded-md  py-2 px-4 flex items-center justify-center xl:hidden absolute end-[-10px] top-[-10px] cursor-pointer"
      >
        <SvgIcon src="/icons/close.svg" color="#005F73" />
      </div>
      <div className="h-px w-full bg-gray-100 mt-4"></div>
      <div className="mt-6  overflow-y-auto">
        <div className="TextStyle-Headline-6 text-start hidden md:block">
          {t('sections')}
        </div>
        <div className="mt-2 flex flex-col gap-1">
          {ActiveLayer === 'menu' &&
            resolveSteps().map((item, index) => (
              <div
                onClick={() => {
                  if (activeReportSection == 'Progress') {
                    onchangeMenu(item);
                  } else {
                    if (!disableClicks && (isReportAvailable || showReport)) {
                      onchangeMenu(item);
                    }
                  }
                }}
                key={index}
                className={`text-[10px] ${disableClicks && index != 0 ? 'opacity-50' : ''} h-[24px] flex justify-start items-center ps-2 text-nowrap bg-backgroundColor-Main text-Text-Primary rounded-md border cursor-pointer ${
                  resolveReportSection(item) === resolveReportSection(activeMenu)
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
                <span>{sectionLabel(item)}</span>
              </div>
            ))}
          {ActiveLayer === 'layer' && (
            <div className="flex flex-col gap-2">
              {resolveSteps().map((item, index) => (
                <div
                  onClick={() => {
                    if (activeReportSection == 'Progress') {
                      setactiveImg(index + 1);
                      document.getElementById(item)?.scrollIntoView({
                        behavior: 'smooth',
                      });
                    } else {
                      if (!disableClicks && (isReportAvailable || showReport)) {
                        setactiveImg(index + 1);
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
                    src={`/images/${resolveImageFolder()}/${index + 1}.png`}
                    alt=""
                  />
                  <div className="absolute bg-white w-4 h-4 border-[0.5px] border-Gray-50 rounded-[3px] shadow-200 text-xs text-center text-Primary-DeepTeal bottom-[6px] left-1">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className=" flex justify-center  items-center absolute bottom-4 w-full left-0">
          <div
            onClick={() => {
              if (!disableClicks && (isReportAvailable || showReport)) {
                publish('downloadReport', {});
              }
            }}
            className={`flex justify-center ${!disableClicks && (isReportAvailable || showReport) ? 'cursor-pointer opacity-100' : 'cursor-not-allowed opacity-50'}  items-center gap-1`}
          >
            <SvgIcon
              color="#005F73"
              src="/icons/export.svg"
              width="12"
            ></SvgIcon>
            <div className="text-[12px] text-Primary-DeepTeal">
              {t('export')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportSideMenu;
