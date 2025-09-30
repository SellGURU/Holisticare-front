import { FC, useState } from 'react';
import resolveAnalyseIcon from '../../../Components/RepoerAnalyse/resolveAnalyseIcon';
import {
  Send,
  Bot,
  ChevronDown,
  CheckCircle,
  Circle,
  ClipboardList,
  FileText,
  Headphones,
  Search,
  Video,
  Home,
  TrendingUp,
  MessageCircle,
  BookOpen,
  Target,
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
        {selectedPage == 'Home' ? (
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
          <EducationalSection customTheme={customTheme} />
        )}

        <div className="w-full h-[36.68px] absolute bottom-0 left-0 bg-white rounded-t-[2.93px] rounded-b-[12.72px] flex items-center justify-between px-4">
          <div className="flex gap-2">
          <button
          onClick={()=>setselectedPage("Home")}
                  className={
                    `flex flex-col items-center  rounded-2xl transition-all duration-300",
                    ${selectedPage == "Home"
                      ? "bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm shadow-lg transform scale-105"
                      : "hover:bg-gray-100/50  hover:shadow-md"}`
                  }
                >
                  <div
                    className={`
                      rounded-full p-1 transition-all duration-300
                      ${selectedPage == "Home"
                        ? `shadow-lg`
                        : "bg-gray-200/50 "} `
                    }
                    style={{
                      background: selectedPage == "Home"
                        ? `linear-gradient(to right, ${
                            customTheme?.primaryColor
                          }, ${
                           customTheme?.secondaryColor
                            
                          })`
                        : "",
                    }}
                  >
                    <Home
                      className={`
                        ${selectedPage == "Home"
                          ? "text-white"
                          : "text-gray-600 "}
                       size-3` }
                    />
                  </div>
                  <span
                                   style={{color: selectedPage== "Home" ? customTheme.primaryColor : "#4b5563"}}

                    className={`
                      font-medium transition-colors text-[8px] 
                    `}
                  >
                    Home
                  </span>
                </button>
            {/* <div
             style={{
              background: selectedPage == "Home"
                ? `linear-gradient(to right, ${
                  customTheme ? customTheme?.primaryColor : `#3b82f6`
                  }, ${
                    customTheme
                      ? customTheme?.secondaryColor
                      : `#a855f7`
                  })`
                : "",
            }}
              onClick={() => setselectedPage('Overview')}
              className="flex flex-col items-center text-gray-500"
            >
               <Home className='size-3'/>
              <div
                className={`text-[5.87px] ${selectedPage == 'Overview' ? `text-[${customTheme.secondaryColor}]` : 'text-Text-Quadruple'} `}
              >
                Home
              </div>
            </div> */}
            <button
          onClick={()=>setselectedPage("Monitor")}
                  className={
                    `flex flex-col items-center  rounded-2xl transition-all duration-300",
                    ${selectedPage == "Monitor"
                      ? "bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm shadow-lg transform scale-105"
                      : "hover:bg-gray-100/50  hover:shadow-md"}`
                  }
                >
                  <div
                    className={`
                      rounded-full p-1 transition-all duration-300
                      ${selectedPage == "Monitor"
                        ? `shadow-lg`
                        : "bg-gray-200/50 "} `
                    }
                    style={{
                      background: selectedPage == "Monitor"
                        ? `linear-gradient(to right, ${
                            customTheme?.primaryColor
                          }, ${
                           customTheme?.secondaryColor
                            
                          })`
                        : "",
                    }}
                  >
                    <TrendingUp
                      className={`
                        ${selectedPage == "Monitor"
                          ? "text-white"
                          : "text-gray-600 "}
                       size-3` }
                    />
                  </div>
                  <span
                  style={{color: selectedPage== "Monitor" ? customTheme.primaryColor : "#4b5563"}}
                    className={`
                      
                      font-medium transition-colors text-[8px] 
                    `}
                  >
                    Monitor
                  </span>
                </button>
                <button
          onClick={()=>setselectedPage("Chat")}
                  className={
                    `flex flex-col items-center  ml-1  rounded-2xl transition-all duration-300",
                    ${selectedPage == "Chat"
                      ? "bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm shadow-lg transform scale-105"
                      : "hover:bg-gray-100/50  hover:shadow-md"}`
                  }
                >
                  <div
                    className={`
                      rounded-full p-1 transition-all duration-300
                      ${selectedPage == "Chat"
                        ? `shadow-lg`
                        : "bg-gray-200/50 "} `
                    }
                    style={{
                      background: selectedPage == "Chat"
                        ? `linear-gradient(to right, ${
                            customTheme?.primaryColor
                          }, ${
                           customTheme?.secondaryColor
                            
                          })`
                        : "",
                    }}
                  >
                    <MessageCircle
                      className={`
                        ${selectedPage == "Chat"
                          ? "text-white"
                          : "text-gray-600 "}
                       size-3` }
                    />
                  </div>
                  <span
                  style={{color: selectedPage== "Chat" ? customTheme.primaryColor : "#4b5563"}}
                    className={`
                      
                      font-medium transition-colors text-[8px] 
                    `}
                  >
                    Chat
                  </span>
                </button>
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
          <div className="flex gap-2 ml-4">
          <button
          onClick={()=>setselectedPage("Plan")}
                  className={
                    `flex flex-col items-center  rounded-2xl transition-all duration-300",
                    ${selectedPage == "Plan"
                      ? "bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm shadow-lg transform scale-105"
                      : "hover:bg-gray-100/50  hover:shadow-md"}`
                  }
                >
                  <div
                    className={`
                      rounded-full p-1 transition-all duration-300
                      ${selectedPage == "Plan"
                        ? `shadow-lg`
                        : "bg-gray-200/50 "} `
                    }
                    style={{
                      background: selectedPage == "Plan"
                        ? `linear-gradient(to right, ${
                            customTheme?.primaryColor
                          }, ${
                           customTheme?.secondaryColor
                            
                          })`
                        : "",
                    }}
                  >
                    <Target
                      className={`
                        ${selectedPage == "Plan"
                          ? "text-white"
                          : "text-gray-600 "}
                       size-3` }
                    />
                  </div>
                  <span
                  style={{color: selectedPage== "Plan" ? customTheme.primaryColor : "#4b5563"}}
                    className={`
                      
                      font-medium transition-colors text-[8px] 
                    `}
                  >
                    Plan
                  </span>
                </button>
          <button
          onClick={()=>setselectedPage("Educational")}
                  className={
                    `flex flex-col items-center  rounded-2xl transition-all duration-300",
                    ${selectedPage == "Educational"
                      ? "bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm shadow-lg transform scale-105"
                      : "hover:bg-gray-100/50  hover:shadow-md"}`
                  }
                >
                  <div
                    className={`
                      rounded-full p-1 transition-all duration-300
                      ${selectedPage == "Educational"
                        ? `shadow-lg`
                        : "bg-gray-200/50 "} `
                    }
                    style={{
                      background: selectedPage == "Educational"
                        ? `linear-gradient(to right, ${
                            customTheme?.primaryColor
                          }, ${
                           customTheme?.secondaryColor
                            
                          })`
                        : "",
                    }}
                  >
                    <BookOpen
                      className={`
                        ${selectedPage == "Educational"
                          ? "text-white"
                          : "text-gray-600 "}
                       size-3` }
                    />
                  </div>
                  <span
                  style={{color: selectedPage== "Educational" ? customTheme.primaryColor : "#4b5563"}}
                    className={`
                      
                      font-medium transition-colors text-[8px] 
                    `}
                  >
                    Educational
                  </span>
                </button>
          
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

interface EducationalProps {
  title: string;
  content: string;
  referenceLink: string;
  type?: 'video' | 'podcast' | 'guide' | 'article';
}

const EducationalSection: FC<TheAppOverviewProps> = ({ customTheme }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Fake data (static UI only)
  const educationalContent: EducationalProps[] = [
    {
      title: 'Benefits of Mindfulness',
      content:
        'Learn how mindfulness can improve focus, reduce stress, and enhance well-being...',
      referenceLink: '#',
      type: 'guide',
    },
    {
      title: 'Nutrition Basics',
      content:
        'Understanding macronutrients and micronutrients is the foundation of a healthy diet...',
      referenceLink: '#',
      type: 'article',
    },
    {
      title: 'Morning Yoga Routine',
      content:
        'Follow this 10-minute yoga sequence to energize your mornings and improve flexibility...',
      referenceLink: '#',
      type: 'video',
    },
  ];

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'video':
        return Video;
      case 'podcast':
        return Headphones;
      case 'guide':
        return BookOpen;
      default:
        return FileText;
    }
  };

  const hexToRgba = (hex: string, opacity: string) => {
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // const gradientWithOpacity = `linear-gradient(135deg, ${hexToRgba(
  //   customTheme.primaryColor,
  //   "0.15"
  // )}, ${hexToRgba(customTheme.secondaryColor, "0.15")})`;

  // Search filter
  const filteredContent = educationalContent.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="w-full max-w-md mx-auto rounded-2xl p-1 mt-2  text-[8px] shadow-sm">
      {/* Title */}
      <div className="text-center mb-4">
        <h2
          className=" font-thin text-[12px] bg-clip-text text-transparent"
          style={{
            color: `${customTheme.primaryColor}`,
          }}
        >
          Educational Content
        </h2>
        <p className="text-gray-600 ">Browse health & wellness content</p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search content..."
          className="pl-9  bg-white  border-gray-200 outline-none h-4 "
        />
      </div>

      {/* Content List */}
      <div className="space-y-4 overflow-hidden h-[200px]">
        {filteredContent.map((content, idx) => {
          const TypeIcon = getTypeIcon(content.type);
          return (
            <div
              key={idx}
              className="rounded-2xl border shadow-sm backdrop-blur-sm cursor-pointer hover:shadow-md transition-all duration-300"
              style={{
                background: `linear-gradient(to bottom right, ${hexToRgba(
                  customTheme.primaryColor,
                  '0.1',
                )}, ${hexToRgba(customTheme.secondaryColor, '0.1')})`,
                // borderColor: hexToRgba(customTheme.primaryColor, "0.15"),
              }}
            >
              <div className="p-2">
                <div className="flex items-start gap-3">
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                    style={{
                      background: customTheme.primaryColor,
                    }}
                  >
                    <TypeIcon className="w-3 h-3 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className=" font-medium text-[10px] text-gray-800  mb-1">
                      {content.title}
                    </h3>
                    <p className=" text-gray-600 line-clamp-2 mb-3">
                      {content.content}
                    </p>

                    <button
                      // size="sm"
                      className=" inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary hover:bg-primary/90 h-6 px-2 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium transition-all duration-300"
                      style={{
                        background: customTheme.primaryColor,
                        color: '#fff',
                      }}
                    >
                      <BookOpen className="w-3 h-3 mr-1" />
                      Read More
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredContent.length === 0 && (
          <div className="text-center py-8">
            <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 ">No content found</p>
          </div>
        )}
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

  // const iconGradient = `linear-gradient(135deg, ${hexToRgba(
  //   customTheme.primaryColor,
  //   '0.6',
  // )}, ${hexToRgba(customTheme.secondaryColor, '0.6')})`;

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
              style={{ background: customTheme.primaryColor }}
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
                style={{ background: customTheme.primaryColor }}
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
                    background: `linear-gradient(90deg, ${hexToRgba(
                      customTheme.primaryColor,
                      '0.4',
                    )}, ${hexToRgba(customTheme.secondaryColor, '0.8')})`,
                  }}
                >
                  <p className=" text-white ">
                    Try including more vegetables and reducing sugar intake.
                  </p>
                  <p className=" text-white/70 text-right mt-1">10:31 AM</p>
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
