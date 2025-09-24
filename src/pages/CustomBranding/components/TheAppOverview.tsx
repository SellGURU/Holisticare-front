import { FC, useState } from 'react';
import SvgIcon from '../../../utils/svgIcon';
import resolveAnalyseIcon from '../../../Components/RepoerAnalyse/resolveAnalyseIcon';
import {
  Send,
  Bot,
  ChevronDown,
  CheckCircle,
  Circle,
  ClipboardList,
} from 'lucide-react';

interface TheAppOverviewProps {
  customTheme: {
    primaryColor: string;
    secondaryColor: string;
    selectedImage: string | null;
    name: string;
    headLine: string;
  };
}

const TheAppOverview: FC<TheAppOverviewProps> = ({ customTheme }) => {
  console.log(customTheme);
  const hexToRgba = (hex: string, opacity: string) => {
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };
  const gradientWithOpacity = `linear-gradient(89.73deg, ${hexToRgba(customTheme.secondaryColor, '0.6')} -121.63%, ${hexToRgba(customTheme.primaryColor, '0.6')} 133.18%)`;

  const [selectedPage, setselectedPage] = useState('Overview');
  return (
    <div className="w-full flex flex-col md:flex-row items-center justify-center gap-8">
      <div
        style={{ background: gradientWithOpacity }}
        className="  w-[203px] h-[360px] rounded-[12.72px] shadow-400 pt-4 relative flex flex-col items-center justify-center gap-2 select-none"
      >
        {customTheme.selectedImage && (
          <img
            className="w-[80px] h-[80px] rounded-[12.72px] object-cover"
            src={customTheme.selectedImage}
            alt=""
          />
        )}
        <div className="text-xs font-medium text-white">{customTheme.name}</div>
        {customTheme.headLine && (
          <>
            <div className="text-[10px]  text-white max-w-[144.78px] truncate">
              {customTheme.headLine}
            </div>
          </>
        )}
        <div className="absolute bottom-0 left-0 right-0   w-[203.5px]  h-[98px]">
          <img src="/images/branding-vector.svg" alt="" />
        </div>
      </div>
      <div className="w-[203px] h-[360px] rounded-[14.61px] shadow-400 pt-4 px-2 border relative">
        <div className="flex items-center justify-between ">
          <div className="text-[7.83px] font-medium text-Text-Primary">
            9:41
          </div>
          <img src="/icons/wi-fi-battery-celular-mobile.svg" alt="" />
        </div>
        {/* <div className="flex items-center justify-between mt-2">
          <div className="text-[7.83px] font-medium text-Text-Primary">
            {selectedPage}
          </div>
          <div className="flex items-center gap-1">
            <SvgIcon
              src="/icons/sms-notification.svg"
              color={customTheme.secondaryColor}
            />
            <SvgIcon
              src="/icons/notification-mobile.svg"
              color={customTheme.secondaryColor}
            />
          </div>
        </div> */}
        {selectedPage == 'Overview' ? (
          <div className="w-full text-[8px] mt-2">
            {/* Top Stat Cards */}
            <div className="w-full flex gap-4 justify-between">
              <div
                className="flex flex-col justify-between items-center p-2 w-[50%] h-[60px] rounded-lg group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `linear-gradient(to bottom right, ${hexToRgba(
                    customTheme.primaryColor,
                    '0.1',
                  )}, ${hexToRgba(customTheme.secondaryColor, '0.1')})`,
                }}
              >
                <div>37</div> Phenotypic Age
              </div>
              <div
                className="flex flex-col justify-between items-center p-2 w-[50%] h-[60px] rounded-lg group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `linear-gradient(to bottom right, ${hexToRgba(
                    customTheme.secondaryColor,
                    '0.1',
                  )}, ${hexToRgba(customTheme.primaryColor, '0.1')})`,
                }}
              >
                <div>37</div> Phenotypic Age
              </div>
            </div>

            {/* Progress Card */}
            <div
              className="w-full flex justify-between items-center rounded-lg h-[40px] px-2 mt-2"
              style={{
                background: `linear-gradient(to right, ${hexToRgba(
                  customTheme.primaryColor,
                  '0.05',
                )}, ${hexToRgba(customTheme.secondaryColor, '0.05')})`,
              }}
            >
              <div className="font-thin text-gray-900">
                Your Plan
                <div className="text-gray-500 font-light text-[6px]">
                  Goals, challenges & action plans
                </div>
              </div>

              <div className="w74 h-7 relative">
                <svg
                  className="w-7 h-7 transform -rotate-90"
                  viewBox="0 0 64 64"
                >
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-gray-200/30 dark:text-gray-700/30"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth="3"
                    strokeDasharray={`${
                      2 * Math.PI * 28 * (33 / 100)
                    } ${2 * Math.PI * 28}`}
                    strokeLinecap="round"
                    className="drop-shadow-sm"
                  />
                  <defs>
                    <linearGradient
                      id="progressGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor={customTheme.primaryColor} />
                      <stop
                        offset="100%"
                        stopColor={customTheme.secondaryColor}
                      />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="flex items-center justify-center absolute top-2 left-[5px]">
                  <span
                    className="text-[8px] font-thin bg-clip-text text-transparent"
                    style={{
                      backgroundImage: `linear-gradient(to right, ${customTheme.primaryColor}, ${customTheme.secondaryColor})`,
                    }}
                  >
                    33%
                  </span>
                </div>
              </div>
            </div>

            {/* Assigned Questionnaires */}
            <div className="rounded-lg w-full h-fit p-2 mt-2 bg-gradient-to-br from-gray-50 via-white to-gray-50 border-0 shadow-xl backdrop-blur-lg">
              Assigned Questionnaires
              {/* Example Questionnaire */}
              <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white border border-gray-200/50 shadow-sm">
                <div className="flex flex-col text-[7px] font-thin text-gray-900">
                  Emotional Health
                  <span className="text-gray-500 font-light text-[6px]">
                    No time estimate
                  </span>
                </div>
                <div
                  className="inline-flex text-[7px] items-center rounded-full border px-1.5 py-0.5 font-semibold whitespace-nowrap"
                  style={{
                    backgroundColor: hexToRgba(customTheme.primaryColor, '0.1'),
                    color: customTheme.primaryColor,
                  }}
                >
                  Completed
                </div>
              </div>
              {/* Another Questionnaire */}
              <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white border border-gray-200/50 shadow-sm mt-1">
                <div className="flex flex-col text-[7px] font-thin text-gray-900">
                  Emotional Health
                  <span className="text-gray-500 font-light text-[6px]">
                    No time estimate
                  </span>
                </div>
                <div
                  className="inline-flex text-[7px] items-center rounded-full border px-1.5 py-0.5 font-semibold whitespace-nowrap"
                  style={{
                    backgroundColor: hexToRgba(
                      customTheme.secondaryColor,
                      '0.1',
                    ),
                    color: customTheme.secondaryColor,
                  }}
                >
                  Completed
                </div>
              </div>
            </div>

            {/* Health Summary */}
            <div className="rounded-lg text-card-foreground bg-white to-gray-50 border-0 shadow-xl backdrop-blur-lg mt-2">
              Health Summary
              <div className="flex flex-col gap-1 mt-1">
                <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-gray-200 shadow-sm">
                  <div
                    className="w-4 h-4 bg-white rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      boxShadow: `0 0 10px 0 ${hexToRgba(customTheme.primaryColor, '0.3')}`,
                    }}
                  >
                    <img
                      src={resolveAnalyseIcon('Blood')}
                      className="w-5 h-5"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="font-medium text-gray-900 truncate"
                      title="Blood"
                    >
                      Blood
                    </div>
                    <div className="text-gray-500">
                      7 Biomarkers • 1 Needs Focus
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : selectedPage == 'Monitor' ? (
          <MonitorSection customTheme={customTheme}></MonitorSection>
        ) : selectedPage == 'Plan' ? (
          <PlanSection customTheme={customTheme} />
        ) : selectedPage == 'Chat' ? (
          <ChatSection customTheme={customTheme}></ChatSection>
        ) : (
          <ProgressSection customTheme={customTheme} />
        )}

        <div className="w-full h-[36.68px] absolute bottom-0 left-0 bg-white rounded-t-[2.93px] rounded-b-[12.72px] flex items-center justify-between px-4">
          <div className="flex gap-4">
            <div
              onClick={() => setselectedPage('Overview')}
              className="flex flex-col items-center text-gray-500"
            >
              <SvgIcon
                src="/icons/status-up-mobile.svg"
                color={
                  selectedPage == 'Overview'
                    ? customTheme.secondaryColor
                    : '#888888'
                }
                width="11.74px"
                height="11.74px"
              />
              <div
                className={`text-[5.87px] ${selectedPage == 'Overview' ? `text-[${customTheme.secondaryColor}]` : 'text-Text-Quadruple'} `}
              >
                Home
              </div>
            </div>
            <div
              onClick={() => {
                setselectedPage('Monitor');
              }}
              className="flex flex-col items-center text-gray-500"
            >
              <SvgIcon
                src="/icons/glass-mobile.svg"
                color={
                  selectedPage == 'Monitor'
                    ? customTheme.secondaryColor
                    : '#888888'
                }
                width="11.74px"
                height="11.74px"
              />

              <div
                className={`text-[5.87px] ${selectedPage == 'Monitor' ? `text-[${customTheme.secondaryColor}]` : 'text-Text-Quadruple'} `}
              >
                Monitor
              </div>
            </div>
            <div
              onClick={() => {
                setselectedPage('Chat');
              }}
              className="flex flex-col items-center text-gray-500"
            >
              <SvgIcon
                src="/icons/glass-mobile.svg"
                color={
                  selectedPage == 'Chat'
                    ? customTheme.secondaryColor
                    : '#888888'
                }
                width="11.74px"
                height="11.74px"
              />

              <div
                className={`text-[5.87px] ${selectedPage == 'Chat' ? `text-[${customTheme.secondaryColor}]` : 'text-Text-Quadruple'} `}
              >
                Chat
              </div>
            </div>
          </div>
          {/* <div className="relative">
            <div
              className="absolute -top-7 -left-3 w-[26.9px] h-[26.9px] rounded-full flex items-center justify-center shadow-md shadow-[#613EEA80]"
              style={{ backgroundColor: customTheme.primaryColor }}
            >
              <img
                src="/icons/stars.svg"
                alt=""
                className="w-[11.14px] h-[11.15px]"
              />
            </div>
          </div> */}
          <div className="flex gap-4">
            <div
              onClick={() => {
                setselectedPage('Plan');
              }}
              className="flex flex-col items-center text-gray-500"
            >
              <SvgIcon
                src="/icons/document-text-mobile.svg"
                color={
                  selectedPage == 'Plan'
                    ? customTheme.secondaryColor
                    : '#888888'
                }
                width="11.74px"
                height="11.74px"
              />

              <div
                className={`text-[5.87px] ${selectedPage == 'Plan' ? `text-[${customTheme.secondaryColor}]` : 'text-Text-Quadruple'} `}
              >
                Plan
              </div>
            </div>
            <div
              onClick={() => {
                setselectedPage('Setting');
              }}
              className="flex flex-col items-center text-gray-500"
            >
              <SvgIcon
                src="/icons/setting-2-mobile.svg"
                color={
                  selectedPage == 'Setting'
                    ? customTheme.secondaryColor
                    : '#888888'
                }
                width="11.74px"
                height="11.74px"
              />

              <div
                className={`text-[5.87px] ${selectedPage === 'Setting' ? `text-[${customTheme.secondaryColor}]` : 'text-Text-Quadruple'} `}
              >
                Educational
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TheAppOverview;

const MonitorSection: FC<TheAppOverviewProps> = ({ customTheme }) => {
  console.log(customTheme);

  return (
    <div className="w-[202.5px] text-[8px] relative bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40  ">
      <div className="w-full max-w-sm mx-auto  py-4 overflow-hidden">
        {/* Your Results Header */}
        <div className="">
          <h2 className=" font-thin bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent mb-2">
            Your Results
          </h2>
          <p className=" text-[6px] text-gray-600 dark:text-gray-400 font-light">
            Click on any biomarker to view detailed information
          </p>
        </div>
      </div>
      <div className="h-[250px] flex flex-col gap-2 overflow-hidden">
        <div className="bg-white w-[92%] border border-gray-200  shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer rounded-lg">
          <div className="p-2 flex flex-col items-start w-full">
            {/* Card Header */}
            <div className="mb-3 w-full">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`w-6 h-6 bg-gradient-to-br rounded-lg flex items-center justify-center shadow-lg flex-shrink-0`}
                >
                  {/* <Droplets color="red"></Droplets> */}
                  <img
                    src={resolveAnalyseIcon('Acetobacter pasteurianus')}
                    className="w-4 h-4"
                  />
                  {/* <Icon className="w-5 h-5 text-white" /> */}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900  truncate">
                    Acetobacter pasteurianus
                  </h3>
                </div>
              </div>
              <div className="flex items-center justify-between w-full">
                <p className=" text-gray-500 ">Last test: 9/7/2025</p>
                <div
                  style={{
                    backgroundColor: 'rgb(178, 48, 46)',
                  }}
                  className={` flex-shrink-0 text-white px-2 py-1 inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80 `}
                >
                  CriticalRange
                </div>
              </div>
            </div>

            {/* Current Value */}
            <div className="mb-3">
              <div className="flex items-baseline gap-2">
                <span className=" font-bold text-gray-900 ">Bad for gut</span>
                {/* <span className="text-xs text-gray-600 dark:text-gray-400">
                        {biomarker.unit}
                      </span> */}
              </div>
            </div>

            {/* Reference Range */}
            <div className="mb-3 bg-white/50 rounded-lg p-2">
              <div className=" text-gray-500 mb-1">Optimal Range</div>
              <div className=" font-medium text-gray-700 ">Good for GUT</div>
            </div>
          </div>
        </div>
        <div className="bg-white w-[92%] border border-gray-200  shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer rounded-lg">
          <div className="p-2 flex flex-col items-start w-full">
            {/* Card Header */}
            <div className="mb-3 w-full">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`w-6 h-6 bg-gradient-to-br rounded-lg flex items-center justify-center shadow-lg flex-shrink-0`}
                >
                  {/* <Droplets color="red"></Droplets> */}
                  <img
                    src={resolveAnalyseIcon('Albumin')}
                    className="w-4 h-4"
                  />
                  {/* <Icon className="w-5 h-5 text-white" /> */}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900  truncate">
                    Albumin
                  </h3>
                </div>
              </div>
              <div className="flex items-center justify-between w-full">
                <p className=" text-gray-500 ">Last test: 9/7/2025</p>
                <div
                  style={{
                    backgroundColor: 'rgb(55, 180, 94)',
                  }}
                  className={` flex-shrink-0 text-white px-2 py-1 inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80 `}
                >
                  OptimalRange
                </div>
              </div>
            </div>

            {/* Current Value */}
            <div className="mb-3">
              <div className="flex items-baseline gap-2">
                <span className=" font-bold text-gray-900 ">706.77</span>
                <span className=" text-[6px] text-gray-600 dark:text-gray-400">
                  µmol/L
                </span>
              </div>
            </div>

            {/* Reference Range */}
            <div className="mb-3 bg-white/50 rounded-lg p-2">
              <div className=" text-gray-500 mb-1">Optimal Range</div>
              <div className=" font-medium text-gray-700 ">525-750</div>
            </div>
          </div>
        </div>
      </div>
      {/* <div className="w-full mt-2 flex justify-between items-center gap-1  ">
        {Categories.map((category: any, index: number) => (
          <div
            onClick={() => setselectedCateogry(category.title)}
            key={index}
            style={
              selectedCategory == category.title
                ? {
                    background: gradientWithOpacity,
                  }
                : {}
            }
            className={`flex flex-col  items-center gap-1 px-3 py-[8px]   rounded-xl text-[6.83px] font-medium ${selectedCategory == category.title ? 'text-white' : 'text-Text-Quadruple'}`}
          >
            <SvgIcon
              width="10px"
              height="10px"
              src={category.src}
              color={selectedCategory == category.title ? 'white' : '#888888'}
            />
            {category.title}
          </div>
        ))}
      </div> */}
      {/* <div className="flex flex-col gap-2 mt-3 text-[6.83px] w-[188px]">
        <div className="rounded-2xl px-3 py-4 bg-white border-l-2 w-full border-[#FFAB2C]">
          <div className="flex w-full justify-between">
            <div>
              <div className="text-Text-Primary text-[7.83px] font-medium">
                LDL Cholesterol
              </div>
              <div className="text-Text-Secondary text-[6.83px]">
                Cholesterol Transporter
              </div>
            </div>
            <div className="flex flex-col justify-center items-center gap-2">
              <div className="px-3 rounded-full bg-[#FFAB2C] text-white">
                Borderline
              </div>
              <div className="text-[#FFAB2C] text-[6px]">Need to work</div>
            </div>
          </div>
          <div className="flex w-full justify-between">
            <div className="flex gap-1">
              <div className="flex bg-[#E2F1F8] gap-1  items-center text-[6.83px] rounded-full text-[#267E95] px-[6px] py-[2px]">
                <SvgIcon color="#267E95" src="/icons/result-heart.svg" />
                Heart Health
              </div>
            </div>
            <div className="flex items-center gap-1">
              <div className="text-Text-Primary font-medium text-[7.83px]">
                112
              </div>
              <span className="text-Text-Secondary text-[6px]">mg/dL</span>
            </div>
          </div>
        </div>
        <div className="rounded-2xl px-3 py-4 bg-white border-l-2 w-full border-[#FC5474]">
          <div className="flex w-full justify-between">
            <div>
              <div className="text-Text-Primary text-[7.83px] font-medium">
                LDL White Blood Cells
              </div>
              <div className="text-Text-Secondary text-[6.83px]">
                Inflammation Indicator
              </div>
            </div>
            <div className="flex flex-col justify-center items-center gap-2">
              <div className="px-3 rounded-full bg-[#FC5474] text-white">
                Critical
              </div>
              <div className="text-[#FFAB2C] text-[6px]">Need to work</div>
            </div>
          </div>
          <div className="flex w-full justify-between">
            <div className="flex gap-1">
              <div className="flex bg-[#E2F1F8] gap-1  items-center text-[6.83px] rounded-full text-[#267E95] px-[6px] py-[2px]">
                <SvgIcon color="#267E95" src="/icons/result-story.svg" />
                Inflammation
              </div>
              <div className="flex bg-[#E2F1F8] gap-1  items-center text-[6.83px] rounded-full text-[#267E95] px-[6px] py-[2px]">
                <SvgIcon color="#267E95" src="/icons/result-moon.svg" />
                Sleep
              </div>
            </div>
            <div className="flex items-center gap-1">
              <div className="text-Text-Primary font-medium text-[7.83px]">
                3.5
              </div>
              <span className="text-Text-Secondary text-[6px]">
                thousands/uL
              </span>
            </div>
          </div>
        </div>
        <div className="rounded-2xl px-3 py-4 bg-white border-l-2 w-full border-[#06C78D]">
          <div className="flex w-full justify-between">
            <div>
              <div className="text-Text-Primary text-[7.83px] font-medium">
                HbA1c
              </div>
              <div className="text-Text-Secondary text-[6.83px]">
                Average Blood Sugar
              </div>
            </div>
            <div className="flex flex-col justify-center items-center gap-2">
              <div className="px-3 rounded-full bg-[#06C78D] text-white">
                Normal
              </div>
              <div className="text-[#06C78D] text-[6px]">Optimized</div>
            </div>
          </div>
          <div className="flex w-full justify-between">
            <div className="flex gap-1">
              <div className="flex bg-[#E2F1F8] gap-1  items-center text-[6.83px] rounded-full text-[#267E95] px-[6px] py-[2px]">
                <SvgIcon color="#267E95" src="/icons/result-story.svg" />
                Inflammation
              </div>
            </div>
            <div className="flex items-center gap-1">
              <div className="text-Text-Primary font-medium text-[7.83px]">
                5.1
              </div>
              <span className="text-Text-Secondary text-[6px]">%</span>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};
const PlanSection: FC<TheAppOverviewProps> = ({ customTheme }) => {
  const todaysTasks = [
    {
      id: 1,
      title: 'Training/Exercise Feedback Check-In',
      type: 'Checkin',
      details: 'Questions: 7   Time: 14 Seconds',
      completed: false,
    },

    {
      id: 2,
      title: 'Multivitamin (Methylated)',
      type: 'Supplement',
      details: 'Take your daily dose of Multivitamins.',
      completed: true,
    },
  ];
  const hexToRgba = (hex: string, opacity: string) => {
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };
  return (
    <div className="w-[182.5px] mt-3  text-[8px]">
      {/* Title */}
      <div className="text-center mb-2">
        <h2
          className="text-[10px] font-thin bg-clip-text text-transparent"
          style={{
            color: customTheme.primaryColor,
          }}
        >
          Action Plans
        </h2>
        <p className="text-gray-600 ">
          Complete daily tasks and track your calendar
        </p>
      </div>

      {/* Tabs */}
      <div defaultValue="today" className="w-full">
        {/* <TabsList className="grid grid-cols-2 w-full mb-4">
        <TabsTrigger value="today">Today's Tasks</TabsTrigger>
        <TabsTrigger value="calendar">Calendar View</TabsTrigger>
      </TabsList> */}

        {/* Today’s Tasks */}
        <div className="space-y-1 overflow-hidden ">
          {todaysTasks.map((task) => (
            <div
              key={task.id}
              className="rounded-2xl border shadow-sm backdrop-blur-sm"
              // style={{
              //   background: `linear-gradient(to bottom right, ${hexToRgba(
              //     customTheme.primaryColor,
              //     "0.05"
              //   )}, ${hexToRgba(customTheme.secondaryColor, "0.08")})`,
              //   borderColor: hexToRgba(customTheme.primaryColor, "0.15"),
              // }}
            >
              <div className="p-3">
                <div className="flex items-start gap-3">
                  {/* Left icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: customTheme.primaryColor,
                      //  hexToRgba(customTheme.secondaryColor, "0.6"),
                    }}
                  >
                    <ClipboardList className="size-5" />
                  </div>

                  {/* Task info */}
                  <div className="flex-1 min-w-0">
                    <h4
                      className={`font-medium ${
                        task.completed
                          ? 'text-gray-500 line-through'
                          : 'text-gray-800 '
                      }`}
                    >
                      {task.title}
                    </h4>
                    <div
                      // variant="outline"
                      className="text-[8px] mt-1"
                      style={{
                        borderColor: hexToRgba(customTheme.primaryColor, '0.3'),
                        color: customTheme.primaryColor,
                      }}
                    >
                      {task.type}
                    </div>

                    <p className="text-gray-600   mt-2">{task.details}</p>
                    {/* {task.target && (
                    <p className="text-gray-500  mt-1">
                      Target: {task.target}
                    </p>
                  )} */}

                    {/* Action button */}
                    <button
                      // variant={task.completed ? "default" : "outline"}
                      className="mt-3 flex rounded-lg w-fit px-2 py-1  "
                      style={
                        task.completed
                          ? {
                              backgroundColor: customTheme.primaryColor,
                              color: '#fff',
                            }
                          : {}
                      }
                    >
                      {task.completed ? (
                        <CheckCircle className="w-3 h-3 mr-2" />
                      ) : (
                        <Circle className="w-3 h-3 mr-2" />
                      )}
                      {task.completed
                        ? 'Completed'
                        : task.type === 'Lifestyle'
                          ? 'Save Value'
                          : 'Mark Complete'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ProgressSection: FC<TheAppOverviewProps> = ({ customTheme }) => {
  const Days = [
    {
      num: 19,
      day: 'Fri',
    },
    {
      num: 20,
      day: 'Sat',
    },
    {
      num: 21,
      day: 'Sun',
    },
    {
      num: 22,
      day: 'Mon',
    },
  ];
  const [selectedDay, setselectedDay] = useState('Fri');
  const hexToRgba = (hex: string, opacity: string) => {
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };
  const gradientWithOpacity = `linear-gradient(89.73deg, ${hexToRgba(customTheme.secondaryColor, '0.6')} -121.63%, ${hexToRgba(customTheme.primaryColor, '0.6')} 133.18%)`;
  const progress = 25; // Example progress value

  return (
    <div className="w-[202.5px] ">
      <div className="mt-4 flex w-[188px] justify-between">
        {Days.map((day, index) => (
          <div
            key={index}
            onClick={() => setselectedDay(day.day)}
            className={`bg-white rounded-2xl border gap-1 ${selectedDay === day.day ? `border-[${customTheme.secondaryColor}]` : ''} text-[${customTheme.secondaryColor}] flex flex-col items-center justify-center w-[40px] h-[55px]`}
          >
            <div className="text-[10px] font-medium">{day.num}</div>
            <div className="text-[7px]">{day.day}</div>
          </div>
        ))}
      </div>
      <div
        style={{ background: gradientWithOpacity }}
        className="mt-3 rounded-2xl w-[188px] px-4 py-3 flex gap-2 items-center"
      >
        {/* Placeholder for the 25% circle, you'd likely use an SVG or a more complex component here */}
        <div className="relative w-[28px] h-[28px]">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            {/* Background circle (white track) */}
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="#FFFFFF" // White track
              strokeWidth="4"
            ></circle>
            {/* Progress circle (primaryColor fill) */}
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke={customTheme.secondaryColor}
              strokeWidth="4"
              strokeDasharray="100" // Total circumference (approx 2 * PI * 16 = 100.53)
              strokeDashoffset={100 - (100 * progress) / 100} // For 25% progress, offset is 75
              strokeLinecap="round" // Rounded ends for the progress arc
              transform="rotate(-90 18 18)" // Start from the top
            ></circle>
          </svg>
          <div
            className="absolute top-0 left-0 w-full h-full flex items-center justify-center"
            style={{ color: '#383838', fontSize: '7px' }} // Dark gray for text
          >
            %{progress}
          </div>
        </div>

        <div className="flex flex-col gap-1 text-[6.87px] text-Text-Primary">
          Your daily goals almost done! 🔥
          <span className="text-[5.87px] text-Text-Secondary">
            1 of 4 completed
          </span>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="mt-5 w-[188px]">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-[8px] font-medium text-Text-Primary">Tasks</h3>
          <span className="text-[7px] ">2/6 Completed</span>
        </div>

        {/* Check-In Section */}
        <div className="mb-4">
          <div className="flex items-center gap-1 mb-2">
            <SvgIcon
              width="11.74px"
              height="11.74px"
              color={customTheme.secondaryColor}
              src="/icons/check-in.svg"
            />
            <span
              className="text-[8px] font-medium"
              style={{ color: customTheme.secondaryColor }}
            >
              Check-In
            </span>
          </div>
          <div className="flex items-center justify-between bg-white rounded-lg p-2 shadow-sm mb-2">
            <div className="flex items-center gap-1">
              <div
                style={{ borderColor: customTheme.primaryColor }}
                className={`rounded-full border-2 border-[${customTheme.primaryColor}] flex items-center justify-center size-6 `}
              >
                <SvgIcon
                  width="11.74px"
                  height="11.74px"
                  color={customTheme.primaryColor}
                  src="/icons/check-in.svg"
                />
              </div>
              <span className="text-[8px] font-medium text-Text-Primary">
                Daily Check-in
              </span>
            </div>
            <div
              style={{ borderColor: customTheme.primaryColor }}
              className="border rounded-md size-4 flex items-center justify-center"
            >
              <SvgIcon
                width="11px"
                height="11px"
                src="/icons/Tick Square.svg"
                color={customTheme.primaryColor}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
const ChatSection: FC<TheAppOverviewProps> = ({ customTheme }) => {
  console.log(customTheme);

  // const gradientWithOpacity = `linear-gradient(89.73deg, ${hexToRgba(customTheme.secondaryColor, '0.6')} -121.63%, ${hexToRgba(customTheme.primaryColor, '0.6')} 133.18%)`;
  const hexToRgba = (hex: string, opacity: string) => {
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // Softer background gradient (very low opacity)
  const mainGradient = `linear-gradient(135deg, ${hexToRgba(
    customTheme.primaryColor,
    '0.08',
  )}, ${hexToRgba(customTheme.secondaryColor, '0.12')})`;

  // Buttons/messages — still visible but lighter than before
  const buttonGradient = `linear-gradient(90deg, ${hexToRgba(
    customTheme.primaryColor,
    '0.55',
  )}, ${hexToRgba(customTheme.secondaryColor, '0.85')})`;

  const iconGradient = `linear-gradient(135deg, ${hexToRgba(
    customTheme.primaryColor,
    '0.6',
  )}, ${hexToRgba(customTheme.secondaryColor, '0.6')})`;

  return (
    <div className="w-[187.5px] mt-2 text-[8px] rounded-xl">
      {/* Mode Toggle */}
      <div style={{ background: mainGradient }} className="mb-3">
        <div
          className="h-14 w-full flex items-center justify-between px-2 rounded-lg border"
          style={{
            background: `linear-gradient(90deg, ${hexToRgba(
              customTheme.primaryColor,
              '0.05',
            )}, ${hexToRgba(customTheme.secondaryColor, '0.08')})`,
            borderColor: hexToRgba(customTheme.primaryColor, '0.15'),
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md"
              style={{ background: iconGradient }}
            >
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <div className="font-medium">AI Copilot</div>
              <div className=" text-gray-500">Instant responses</div>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 opacity-60" />
        </div>
      </div>

      {/* Chat Card */}
      <div className="p-1 shadow-2xl backdrop-blur-xl rounded-xl bg-white/70 border border-gray-200/30">
        {/* header */}
        <div className="border-b border-gray-200/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center shadow-md"
                style={{ background: iconGradient }}
              >
                <Bot className="w-3 h-3 text-white" />
              </div>
              <div className="font-medium text-gray-900">AI Health Copilot</div>
            </div>
            <div
              className="px-3 py-1 rounded-lg text-[7px] font-medium"
              style={{
                background: hexToRgba(customTheme.primaryColor, '0.1'),
                color: customTheme.primaryColor,
              }}
            >
              AI Assistant
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-0">
          <div className=" h-[143px] overflow-hidden hidden-scrollbar p-1 space-y-4">
            {/* User message */}
            <div className="flex justify-end">
              <div className="max-w-[80%] order-2">
                <div
                  className="p-2 rounded-2xl shadow-md text-white ml-auto"
                  style={{
                    background: `linear-gradient(90deg, ${hexToRgba(
                      customTheme.primaryColor,
                      '0.4',
                    )}, ${hexToRgba(customTheme.secondaryColor, '0.8')})`,
                  }}
                >
                  <p>Hello, how can I improve my diet?</p>
                  <p className=" text-white/70 text-right mt-1">10:30 AM</p>
                </div>
              </div>
            </div>

            {/* AI message */}
            <div className="flex justify-start">
              <div className="max-w-[80%] order-1">
                <div
                  className="p-3 rounded-2xl shadow-md border"
                  style={{
                    background: hexToRgba(customTheme.secondaryColor, '0.08'),
                    borderColor: hexToRgba(customTheme.primaryColor, '0.1'),
                  }}
                >
                  <p className=" text-gray-800 ">
                    Try including more vegetables and reducing sugar intake.
                  </p>
                  <p className=" text-gray-500 text-right mt-1">10:31 AM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-gray-200/30 mt-2">
            <div className="flex gap-1 items-center">
              <textarea
                placeholder="Ask your AI copilot anything..."
                className="flex-1 rounded-md border h-[30px] px-1 text-[8px] resize-none focus:outline-none shadow-inner bg-white/80"
                style={{
                  borderColor: hexToRgba(customTheme.primaryColor, '0.15'),
                }}
              />
              <button
                className="inline-flex items-center justify-center gap-1 h-7 py-2 px-2 rounded-md text-white text-[8px] font-medium shadow-md transition-all hover:shadow-lg hover:scale-105"
                style={{ background: buttonGradient }}
              >
                <Send className="w-3 h-3" />
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
