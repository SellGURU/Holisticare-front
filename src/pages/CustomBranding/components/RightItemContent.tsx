import { FC, useState } from 'react';
import ToggleCustomBranding from './Toggle';
import { ButtonPrimary } from '../../../Components/Button/ButtonPrimary';
import SvgIcon from '../../../utils/svgIcon';

interface RightItemContentProps {
  customTheme: {
    primaryColor: string;
    secondaryColor: string;
    selectedImage: string | null;
    name: string;
    headLine: string;
  };
}

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

const RightItemContent: FC<RightItemContentProps> = ({ customTheme }) => {
  const [activeToggle, setActiveToggle] = useState('The App Overview');
  return (
    <div className="flex-grow-[1] h-full bg-backgroundColor-Card border border-Gray-50 rounded-2xl p-4 shadow-100">
      <div className="w-full h-full">
        <div className="text-sm font-medium text-Text-Primary">Preview</div>
        <div className="text-[10px] text-Text-Quadruple mt-3">
          This section shows users with a quick, interactive display and
          allowing you to see a sample before making a full commitment or
          decision.
        </div>
        <div className="w-full mt-6 flex flex-col items-center gap-7">
          <ToggleCustomBranding
            active={activeToggle}
            setActive={setActiveToggle}
            value={[
              'The App Overview',
              'E-mail Overview',
              'Health Plan Overview',
            ]}
          />
          {activeToggle === 'The App Overview' ? (
            <div className="w-[202.5px] h-[360px] rounded-[14.61px] shadow-400 p-4 border">
              <div className="flex items-center justify-between">
                <div className="text-[7.83px] font-medium text-Text-Primary">
                  9:41
                </div>
                <img src="/icons/wi-fi-battery-celular-mobile.svg" alt="" />
              </div>
              <div className="flex items-center justify-between mt-2">
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
              <div className="flex items-center justify-between mt-2">
                {Categories.map((category, index) => {
                  return (
                    <div
                      className="w-[35.22px] h-[41.35px] rounded-[7.83px] shadow-100 flex flex-col items-center justify-center gap-1 text-[5.87px] font-medium text-Text-Primary"
                      key={index}
                    >
                      <SvgIcon
                        src={category.icon}
                        color={customTheme.primaryColor}
                      />
                      {category.title}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="text-Text-Primary text-[6.85px] font-medium">
                  Dietary Preferences
                </div>
                <img src="/icons/add-button-mobile.svg" alt="" />
              </div>
            </div>
          ) : activeToggle === 'E-mail Overview' ? (
            <div className="w-[400px] h-[250px] rounded-[20px] bg-white border border-Gray-50 shadow-100 flex flex-col justify-between">
              <div className="flex flex-col">
                <div className="flex w-full pt-2 pl-2 gap-2 items-center">
                  <img src="/icons/Logo2.png" alt="" />
                  <div className="w-full h-[16px] bg-Primary-DeepTeal rounded-tl-[20px] rounded-bl-[20px]"></div>
                </div>
                <div className="text-[10px] text-Text-Quadruple text-center mt-4 px-12 leading-5">
                  Hey John, You couch Tim has created an account for you on
                  Holisticare.Navigate to the magic link an enter the code to
                  access your dashboard.
                </div>
                <div className="flex items-center justify-center mt-4 text-Text-Primary text-[10px] gap-10">
                  <div>User name: Sample name</div>
                  <div>Code: 123456</div>
                </div>
                <div className="flex items-center justify-center mt-4">
                  <ButtonPrimary ClassName="rounded-[20px] !h-[24px] !shadow-Btn">
                    Access Your Dashboard
                  </ButtonPrimary>
                </div>
              </div>
              <div className="w-full h-[39px] rounded-b-[20px] bg-Primary-DeepTeal"></div>
            </div>
          ) : (
            ''
          )}
        </div>
      </div>
    </div>
  );
};

export default RightItemContent;
