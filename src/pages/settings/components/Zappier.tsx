import { ButtonSecondary } from '../../../Components/Button/ButtosSecondary';

export const Zappier = () => {
  return (
    <div className="w-full h-full">
      Zappier
      <p className="mt-3 text-sm text-Text-Secondary leading-6 w-full text-justify">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore.Lorem ipsum dolor sit amet, consectetur
        adipiscing elit, sed do eiusmod tempor incididunt ut labore.Lorem ipsum
        dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
        incididunt ut labore.
      </p>
      <div className="w-full h-full  mt-10">
        <div className="relative  w-[1024px] h-[423px] mx-auto   flex justify-center">
          <div className="size-[248px] border border-white bg-[#E9F0F2] rounded-full shadow-100 flex justify-center items-center p-1 z-50 absolute">
            <img src="/images/main-logo.svg" alt="" />
          </div>
          <div className="flex items-center absolute left-7 top-16 gap-3">
            <div className="flex flex-col gap-3 items-end">
              <div className="text-sm font-medium text-Text-Primary">
                Holisticare + Slack
              </div>
              <p className="text-xs  text-Text-Secondary max-w-[285px] text-right">
                Send Slack channel messages for new tasks completed by
                Holisticare team members.
              </p>
              <ButtonSecondary style={{ width: '129px' }}>
                Use this zap
              </ButtonSecondary>
            </div>

            <div className="bg-white size-[121px] shadow-100 rounded-full flex items-center justify-center left-12 top-20 ">
              <img className="z-50" src="/images/slack.svg" alt="" />
            </div>
          </div>
          <div className="flex items-center  absolute right-7 top-16  gap-3">
          <div className="bg-white size-[121px] shadow-100 rounded-full flex items-center justify-center l ">
              <img className="z-50" src="/images/skype.svg" alt="" />
            </div>
            <div className="flex flex-col gap-3 items-start">
              <div className="text-sm font-medium text-Text-Primary">
              Holisticare + Skype
              </div>
              <p className="text-xs  text-Text-Secondary max-w-[285px] ">
              Send Skype messages for new tasks completed by Holisticare team members.
              </p>
              <ButtonSecondary style={{ width: '129px' }}>
                Use this zap
              </ButtonSecondary>
            </div>

           
          </div>
          <div className="flex flex-col items-center justify-center w-full  absolute  bottom-0  gap-3">
          <div className="bg-white size-[121px] shadow-100 rounded-full flex items-center justify-center l ">
              <img className="z-50" src="/images/gmail.svg" alt="" />
            </div>
            <div className="flex flex-col gap-3 items-center">
              <div className="text-sm font-medium text-Text-Primary">
              Holisticare + Gmail
              </div>
              <p className="text-xs  text-Text-Secondary max-w-[285px] text-center">
              Send Gmail messages for new tasks completed by Holisticare team members.              </p>
              <ButtonSecondary style={{ width: '129px' }}>
                Use this zap
              </ButtonSecondary>
            </div>

           
          </div>
        </div>
      </div>
    </div>
  );
};
