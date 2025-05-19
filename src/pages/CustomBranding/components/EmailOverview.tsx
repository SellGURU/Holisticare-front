import { FC } from 'react';
import { ButtonPrimary } from '../../../Components/Button/ButtonPrimary';

interface EmailOverviewProps {
  customTheme: {
    primaryColor: string;
    secondaryColor: string;
    selectedImage: string | null;
    name: string;
    headLine: string;
  };
}

const EmailOverview: FC<EmailOverviewProps> = ({ customTheme }) => {
  return (
    <div className="w-[450px] h-[275px] rounded-[20px] bg-white border border-Gray-50 shadow-100 flex flex-col justify-between">
      <div className="flex flex-col">
        <div className="flex w-full pt-3 pl-2 gap-2 items-center">
          <img
            src={
              customTheme.selectedImage
                ? customTheme.selectedImage
                : '/icons/Logo2.png'
            }
            alt=""
            className="max-w-[43px] max-h-[32px]"
          />
          <div
            className="w-full h-[16px] rounded-tl-[20px] rounded-bl-[20px]"
            style={{ backgroundColor: customTheme.secondaryColor }}
          ></div>
        </div>
        <div className="text-[10px] text-Text-Quadruple text-center mt-4 px-12 leading-5">
          Hey John, You couch Tim has created an account for you on
          Holisticare.Navigate to the magic link an enter the code to access
          your dashboard.
        </div>
        <div className="flex items-center justify-center mt-4 text-Text-Primary text-[10px] gap-10">
          <div>User name: Sample name</div>
          <div>Code: 123456</div>
        </div>
        <div className="flex items-center justify-center mt-4">
          <ButtonPrimary
            ClassName="rounded-[20px] !h-[24px] !shadow-Btn"
            style={{ backgroundColor: customTheme.secondaryColor }}
          >
            Access Your Dashboard
          </ButtonPrimary>
        </div>
      </div>
      <div
        className="w-full h-[39px] rounded-b-[20px]"
        style={{ backgroundColor: customTheme.secondaryColor }}
      ></div>
    </div>
  );
};

export default EmailOverview;
