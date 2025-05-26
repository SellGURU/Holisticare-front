import { FC } from 'react';
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
  return (
    <div className="w-full flex items-center justify-center gap-8">
      <div
        style={{ background: gradientWithOpacity }}
        className="w-[202.5px] h-[360px] rounded-[12.72px] shadow-400 pt-4 pl-4 relative flex flex-col items-center justify-center gap-2 select-none"
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
        <div className="absolute bottom-0 left-0 w-[203px] h-[98px]">
          <img src="/images/branding-vector.svg" alt="" />
        </div>
      </div>
      <div className="w-[202.5px] h-[360px] rounded-[14.61px] shadow-400 pt-4 pl-4 border relative">
        <div className="flex items-center justify-between pr-4">
          <div className="text-[7.83px] font-medium text-Text-Primary">
            9:41
          </div>
          <img src="/icons/wi-fi-battery-celular-mobile.svg" alt="" />
        </div>
        <div className="flex items-center justify-between mt-2 pr-4">
          <div className="text-[7.83px] font-medium text-Text-Primary">
            Setting
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
        <div className="flex items-center justify-between mt-1.5 pr-4">
          {Categories.map((category, index) => {
            return (
              <div
                className={`w-[35.22px] h-[41.35px] rounded-[7.83px] shadow-100 flex flex-col items-center justify-center gap-1 text-[5.87px] font-medium ${category.title === 'Nutrition' ? 'text-white' : 'text-Text-Primary'}`}
                style={
                  category.title === 'Nutrition'
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
                    category.title === 'Nutrition'
                      ? 'white'
                      : customTheme.primaryColor
                  }
                />
                {category.title}
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between mt-2 pr-4">
          <div className="text-Text-Primary text-[6.85px] font-medium">
            Dietary Preferences
          </div>
          <img src="/icons/add-button-mobile.svg" alt="" />
        </div>
        <div className="flex items-center justify-between mt-1 pr-4">
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
        <div className="flex items-center mt-2.5 pr-4 text-[6.85px] font-medium text-Text-Primary">
          Meals
        </div>
        <div className="flex items-center gap-3 mt-1 ml-2">
          {Meals.map((meal, index) => {
            return (
              <div
                className="rounded-[9.78px] py-[9px] pr-[7.83px] pl-[19.57px] shadow-100 flex items-center relative"
                style={
                  meal.title === 'Breakfast'
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
                  className={`text-[5.87px] font-medium ${meal.title === 'Breakfast' ? 'text-white' : 'text-Text-Primary'}`}
                >
                  {meal.title}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center mt-1 pr-4">
          <div className="w-[168.26px] h-[117.09px] rounded-[9.78px] py-[7.83px] px-[5.87px] bg-white shadow-100 flex items-center flex-col">
            <div className="w-[144.78px] h-[49.83px] rounded-[9.78px] p-[3.91px] flex items-center gap-[5.87px] bg-[#F9F9F9]">
              <img src="/images/custom-branding/food-test.png" alt="" />
              <div className="flex flex-col">
                <div className="font-medium text-[5.87px] text-Text-Primary">
                  A simple oatmeal - 1cup
                </div>
                <div className="text-[5.87px] text-Text-Quadruple mt-1">
                  Rolled oats, milk or water, Pinch of salt, fresh fruits, nuts,
                  honey, cinnamon, or seeds
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 gap-[2px] w-full">
              <div className="rounded-[5.87px] border-[0.49px] border-Secondary-SelverGray px-[1.96px] flex items-center justify-center text-nowrap">
                <div className="text-[4.89px] text-Text-Primary">600-650</div>
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
                <div className="text-[4.89px] text-Text-Primary">60-100</div>
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
        <div className="w-full h-[36.68px] absolute bottom-0 left-0 bg-white rounded-t-[2.93px] rounded-b-[12.72px] flex items-center justify-between px-4">
          <div className="flex gap-4">
            <div className="flex flex-col items-center text-gray-500">
              <SvgIcon
                src="/icons/status-up-mobile.svg"
                color={customTheme.secondaryColor}
                width="11.74px"
                height="11.74px"
              />
              <div className="text-[5.87px] text-Text-Quadruple">Overview</div>
            </div>
            <div className="flex flex-col items-center text-gray-500">
              <img
                src="/icons/glass-mobile.svg"
                alt=""
                className="w-[11.74px] h-[11.74px]"
              />
              <div className="text-[5.87px] text-Text-Quadruple">Result</div>
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
            <div className="flex flex-col items-center text-gray-500">
              <img
                src="/icons/document-text-mobile.svg"
                alt=""
                className="w-[11.74px] h-[11.74px]"
              />
              <div className="text-[5.87px] text-Text-Quadruple">Progress</div>
            </div>
            <div className="flex flex-col items-center text-gray-500">
              <img
                src="/icons/setting-2-mobile.svg"
                alt=""
                className="w-[11.74px] h-[11.74px]"
              />
              <div className="text-[5.87px] text-Text-Quadruple">Setting</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TheAppOverview;
