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
    <div className=" w-full md:w-[450px] h-fit md:h-[405px] rounded-[20px] bg-white border border-Gray-50 shadow-100 flex flex-col justify-between">
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
        <div
          // style={{ textAlignLast: 'center' }}
          className="text-[10px] text-Text-Quadruple  text-justify mt-4 px-12 leading-5"
        >
          <div>Subject: Welcome to [Clinic’s Name] – Your Account is Ready</div>
          <div>
            Hi [First Name], Your coach, [ Coach’s Name], has created an account
            for you on [Clinic’s Name]. We’re excited to help you take the next
            step in managing your health. You can access your dashboard using
            the information below:
          </div>
          <div className="flex flex-col items-start  my-2 text-Text-Primary text-[10px]">
            <div>Username: [Email]</div>
            <div>Password: [Password]</div>
          </div>
          [Access Your Dashboard/ Our Link] We at [Clinic’s Name] are committed
          to supporting your health journey. If you have any questions or need
          assistance logging in, don’t hesitate to reach out to your coach. Best
          regards, The HolistiCare Team
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
        className="w-full mt-4 md:mt-0 h-[39px] rounded-b-[20px]"
        style={{ backgroundColor: customTheme.secondaryColor }}
      ></div>
    </div>
  );
};

export default EmailOverview;
