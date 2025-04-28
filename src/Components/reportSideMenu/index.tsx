/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { subscribe, unsubscribe } from '../../utils/event'; // Adjust the import path as needed
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import SvgIcon from '../../utils/svgIcon';
import { decodeAccessUser } from '../../help';
interface ReportSideMenuProps {
  onClose: () => void;
  isShare?: boolean;
}
const ReportSideMenu: React.FC<ReportSideMenuProps> = ({
  onClose,
  isShare,
}) => {
  const menuItems = [
    'Client Summary',
    'Needs Focus Biomarker',
    'Detailed Analysis',
    // "Concerning Result",
    'Holistic Plan',
    'Action Plan',
  ];

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
      name: 'Needs Focus Biomarker',
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
      return menuItems;
    } else {
      console.log(
        accessManager.filter((val) => val.name == 'Action Plan')[0].checked,
      );
      return menuItems.filter(
        (el) =>
          accessManager.filter((val) => val.name == el)[0]?.checked == true,
      );
      // return menuItems.filter((el) => accessManager.filter((val) =>val.name == el)[0].checked ==true)
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
    subscribe('scrolledSection', (data) => {
      // console.log(data)
      // setSearchParams({["section"]: data.detail.section})
      setactiveMenu(data.detail.section);
    });
  }, []);
  const [, setSearchParams] = useSearchParams();
  const onchangeMenu = (item: string) => {
    setSearchParams({ ['section']: item });
    setactiveMenu(item);
    document.getElementById(item)?.scrollIntoView({
      behavior: 'instant',
    });
  };
  useEffect(() => {
    if (isShare) {
      setAccessManager(decodeAccessUser(name as string));
    }
  }, [name]);
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
  console.log(isReportAvailable);
  console.log(disableClicks);
  

  return (
    <div
      className={`h-fit min-h-[272px] md:max-h-[646px] md:min-h-[586px] w-[178px] bg-white ${!isReportAvailable && 'opacity-40 '} border border-gray-50 rounded-[12px] p-4 shadow-100 relative`}
    >
      <div className="flex rounded-[7px] p-px gap-[2px] w-[76px] h-[26px] bg-backgroundColor-Main">
        <div
          onClick={() => !disableClicks && setActiveLayer('layer')}
          className={`flex ${ActiveLayer === 'layer' && 'bg-white '} items-center justify-center px-2 py-[2px] rounded-md cursor-pointer `}
        >
          <img
            className={`report-sidemenu-layer-icon ${ActiveLayer === 'layer' ? 'text-[#6CC24A]' : 'text-[#E5E5E5]'}`}
          />
        </div>
        <div
          onClick={() => !disableClicks && setActiveLayer('menu')}
          className={`flex ${ActiveLayer === 'menu' && 'bg-white '} items-center justify-center px-2 py-[2px] rounded-md cursor-pointer `}
        >
          <img
            className={`report-sidemenu-menu-icon ${ActiveLayer === 'menu' ? 'text-[#6CC24A]' : 'text-[#E5E5E5]'}`}
          />
        </div>
      </div>
      <div
        onClick={() => onClose()}
        className="size-8 rounded-md bg-white shadow-100 py-2 px-4 flex items-center justify-center md:hidden absolute right-3 top-3 cursor-pointer"
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
                  if (!disableClicks && isReportAvailable) {
                    onchangeMenu(item);
                  }
                }}
                key={index}
                className={`text-[10px] ${disableClicks && index != 0 ? 'opacity-50' : ''} h-[24px] flex justify-start items-center pl-2 text-nowrap bg-backgroundColor-Main text-Text-Primary rounded-md border cursor-pointer ${
                  item === activeMenu
                    ? 'border-Primary-EmeraldGreen'
                    : 'border-gray-50'
                } flex justify-start`}
              >
                {index + 1}. {item}
              </div>
            ))}
          {ActiveLayer === 'layer' && (
            <div className="flex flex-col gap-2">
              {resolveSteps().map((item, index) => (
                <div
                  onClick={() => {
                    if (!disableClicks && isReportAvailable) {
                      setactiveImg(index + 1);
                      document.getElementById(item)?.scrollIntoView({
                        behavior: 'smooth',
                      });
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
                    src={`/images/report-sidemenu/${index + 1}.png`}
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
      </div>
    </div>
  );
};

export default ReportSideMenu;
