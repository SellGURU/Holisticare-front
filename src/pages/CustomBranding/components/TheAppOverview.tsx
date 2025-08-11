import { FC, useState } from 'react';
import SvgIcon from '../../../utils/svgIcon';

const Categories = [
  {
    title: 'Nutrition',
    icon: '/icons/apple.svg',
  },
  {
    title: 'Mind',
    icon: '/icons/mental-disorder.svg',
  },
  {
    title: 'Activity',
    icon: '/icons/weight-mobile.svg',
  },
  {
    title: 'Sleep',
    icon: '/icons/moon.svg',
  },
];

const FoodTypes = [
  {
    title: 'Vegan',
    icon: '/icons/avocado.svg',
  },
  {
    title: 'Keto',
    icon: '/icons/protein.svg',
  },
  {
    title: 'Vegetarian',
    icon: '/icons/carrot.svg',
  },
  {
    title: 'Pescatarian',
    icon: '/icons/fish.svg',
  },
];

const Meals = [
  {
    title: 'Breakfast',
    picture: '/images/custom-branding/breakfast-pic.png',
  },
  {
    title: 'Lunch',
    picture: '/images/custom-branding/lunch-pic.png',
  },
  {
    title: 'Dinner',
    picture: '/images/custom-branding/dinner-pic.png',
  },
];

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
  const [selectedCategory, setselectedCategory] = useState('Nutrition');
  const [selectedMeal, setselectedMeal] = useState('Breakfast');
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
        <div className="flex items-center justify-between mt-2">
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
        </div>
        {selectedPage == 'Overview' ? (
          <div className="w-full">
            <div className="flex items-center justify-between mt-1.5">
              {Categories.map((category, index) => {
                return (
                  <div
                    onClick={() => setselectedCategory(category.title)}
                    className={`w-[35.22px] h-[41.35px] rounded-[7.83px] shadow-100 flex flex-col items-center justify-center gap-1 text-[5.87px] font-medium ${selectedCategory == category.title ? 'text-white' : 'text-Text-Primary'}`}
                    style={
                      selectedCategory == category.title
                        ? {
                            background: gradientWithOpacity,
                          }
                        : {}
                    }
                    key={index}
                  >
                    <SvgIcon
                      src={category.icon}
                      color={
                        selectedCategory == category.title
                          ? 'white'
                          : customTheme.primaryColor
                      }
                    />
                    {category.title}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-2 ">
              <div className="text-Text-Primary text-[6.85px] font-medium">
                Dietary Preferences
              </div>
              <img src="/icons/add-button-mobile.svg" alt="" />
            </div>
            <div className="flex items-center justify-between mt-1 ">
              {FoodTypes.map((type, index) => {
                return (
                  <div
                    className="w-[39.13px] h-[39.39px] rounded-[9.78px] shadow-100 flex flex-col items-center justify-center gap-1 text-[5.87px] font-medium text-Text-Primary"
                    key={index}
                  >
                    <img src={type.icon} alt="" />
                    {type.title}
                  </div>
                );
              })}
            </div>
            <div className="flex w-full items-center mt-2.5  text-[6.85px] font-medium text-Text-Primary">
              Meals
            </div>
            <div className="flex w-full jus items-center gap-4 mt-1 ml-2">
              {Meals.map((meal, index) => {
                return (
                  <div
                    onClick={() => setselectedMeal(meal.title)}
                    className="rounded-[9.78px] py-[9px] pr-[7.83px] pl-[19.57px] shadow-100 flex items-center relative"
                    style={
                      selectedMeal == meal.title
                        ? {
                            background: gradientWithOpacity,
                          }
                        : {}
                    }
                    key={index}
                  >
                    <img
                      src={meal.picture}
                      alt=""
                      className="absolute left-[-10px]"
                    />
                    <div
                      className={`text-[5.87px] font-medium cursor-pointer ${selectedMeal == meal.title ? 'text-white' : 'text-Text-Primary'}`}
                    >
                      {meal.title}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center mt-1 ">
              <div className="w-[188.26px] h-[117.09px] rounded-[9.78px] py-[7.83px] px-[5.87px] bg-white shadow-100 flex items-center flex-col">
                <div className="w-full h-[49.83px] rounded-[9.78px] p-[3.91px] flex items-center gap-[5.87px] bg-[#F9F9F9]">
                  <img src="/images/custom-branding/food-test.png" alt="" />
                  <div className="flex flex-col">
                    <div className="font-medium text-[5.87px] text-Text-Primary">
                      A simple oatmeal - 1cup
                    </div>
                    <div className="text-[5.87px] text-Text-Quadruple mt-1">
                      Rolled oats, milk or water, Pinch of salt, fresh fruits,
                      nuts, honey, cinnamon, or seeds
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 gap-[2px] w-full">
                  <div className="rounded-[5.87px] border-[0.49px] border-Secondary-SelverGray px-[1.96px] flex items-center justify-center text-nowrap">
                    <div className="text-[4.89px] text-Text-Primary">
                      600-650
                    </div>
                    <div className="text-[4.89px] text-Text-Quadruple ml-[2px]">
                      Cals
                    </div>
                  </div>
                  <div className="rounded-[5.87px] border-[0.49px] border-Secondary-SelverGray px-[1.96px] flex items-center justify-center text-nowrap">
                    <div className="text-[4.89px] text-Text-Primary">50-70</div>
                    <div className="text-[4.89px] text-Text-Quadruple ml-[2px]">
                      Carbs
                    </div>
                  </div>
                  <div className="rounded-[5.87px] border-[0.49px] border-Secondary-SelverGray px-[1.96px] flex items-center justify-center text-nowrap">
                    <div className="text-[4.89px] text-Text-Primary">15-25</div>
                    <div className="text-[4.89px] text-Text-Quadruple ml-[2px]">
                      Fats
                    </div>
                  </div>
                  <div className="rounded-[5.87px] border-[0.49px] border-Secondary-SelverGray px-[1.96px] flex items-center justify-center text-nowrap">
                    <div className="text-[4.89px] text-Text-Primary">
                      60-100
                    </div>
                    <div className="text-[4.89px] text-Text-Quadruple ml-[2px]">
                      Proteins
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 w-full">
                  <div className="text-[5.87px] font-medium text-Text-Primary">
                    Time:
                  </div>
                  <div className="flex items-center">
                    <SvgIcon
                      src="/icons/edit-green.svg"
                      color={customTheme.primaryColor}
                      width="7.83px"
                      height="7.83px"
                    />
                    <div className="text-[5.87px] font-medium text-Text-Quadruple ml-1.5">
                      08:00 - 10:00 am
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 w-full">
                  <div className="text-[5.87px] font-medium text-Text-Primary">
                    Notification at meal time
                  </div>
                  <img
                    src="/icons/toggles-btn.svg"
                    alt=""
                    className="w-[15.65px] h-[9.78px]"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : selectedPage == 'Result' ? (
          <ResultSection customTheme={customTheme}></ResultSection>
        ) : selectedPage == 'Setting' ? (
          <SettingSection customTheme={customTheme} />
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
                Overview
              </div>
            </div>
            <div
              onClick={() => {
                setselectedPage('Result');
              }}
              className="flex flex-col items-center text-gray-500"
            >
              <SvgIcon
                src="/icons/glass-mobile.svg"
                color={
                  selectedPage == 'Result'
                    ? customTheme.secondaryColor
                    : '#888888'
                }
                width="11.74px"
                height="11.74px"
              />

              <div
                className={`text-[5.87px] ${selectedPage == 'Result' ? `text-[${customTheme.secondaryColor}]` : 'text-Text-Quadruple'} `}
              >
                Result
              </div>
            </div>
          </div>
          <div className="relative">
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
          </div>
          <div className="flex gap-4">
            <div
              onClick={() => {
                setselectedPage('Progress');
              }}
              className="flex flex-col items-center text-gray-500"
            >
              <SvgIcon
                src="/icons/document-text-mobile.svg"
                color={
                  selectedPage == 'Progress'
                    ? customTheme.secondaryColor
                    : '#888888'
                }
                width="11.74px"
                height="11.74px"
              />

              <div
                className={`text-[5.87px] ${selectedPage == 'Progress' ? `text-[${customTheme.secondaryColor}]` : 'text-Text-Quadruple'} `}
              >
                Progress
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
                Setting
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TheAppOverview;

const ResultSection: FC<TheAppOverviewProps> = ({ customTheme }) => {
  const hexToRgba = (hex: string, opacity: string) => {
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };
  const gradientWithOpacity = `linear-gradient(89.73deg, ${hexToRgba(customTheme.secondaryColor, '0.6')} -121.63%, ${hexToRgba(customTheme.primaryColor, '0.6')} 133.18%)`;
  const [selectedCategory, setselectedCateogry] = useState('Blood');
  const Categories = [
    {
      title: 'Blood',
      src: '/icons/reuslt-drops.svg',
    },
    {
      title: 'Activty',
      src: '/icons/result-weight.svg',
    },
    {
      title: 'Dna',
      src: '/icons/reuslt-dna.svg',
    },
    {
      title: 'Aging',
      src: '/icons/reuslt-monitor.svg',
    },
    'Blood',
    'Activty',
    'Dna',
    'Aging',
  ];
  return (
    <div className="w-[202.5px] ">
      <div className="w-full mt-2 flex justify-between items-center gap-1  ">
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
      </div>
      <div className="flex flex-col gap-2 mt-3 text-[6.83px] w-[188px]">
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
      </div>
    </div>
  );
};
const SettingSection: FC<TheAppOverviewProps> = ({ customTheme }) => {
  const Options = [
    {
      title: 'Wearable Devices',
      src: '/icons/watch-status.svg',
    },
    {
      title: 'Change Password',
      src: '/icons/lock.svg',
    },
    {
      title: 'Privacy Policy',
      src: '/icons/security-safe.svg',
    },
    {
      title: 'Terms of Service',
      src: '/icons/shield-tick.svg',
    },
  ];
  return (
    <div className="w-[202.5px] ">
      <div className="flex flex-col w-[188px] gap-2 mt-3">
        {Options.map((option: any, index: number) => (
          <div
            key={index}
            className="flex w-full justify-between items-center bg-white rounded-2xl p-2 shadow-drop"
          >
            <div className="flex gap-1 items-center text-Text-Primary text-[6.87px]">
              <SvgIcon
                width="11.74px"
                height="11.74px"
                color={customTheme.secondaryColor}
                src={option.src}
              />
              {option.title}
            </div>
            <SvgIcon
              width="11.74px"
              height="11.74px"
              color={customTheme.secondaryColor}
              src="/icons/arrow-right-new.svg"
            />
          </div>
        ))}
      </div>
      <div
        style={{ color: customTheme.secondaryColor }}
        className="w-[188px] mt-4 flex justify-center gap-1 items-center text-[6.87px] "
      >
        <SvgIcon
          width="11.74px"
          height="11.74px"
          color={customTheme.secondaryColor}
          src="/icons/logout2.svg"
        />
        Log Out
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
