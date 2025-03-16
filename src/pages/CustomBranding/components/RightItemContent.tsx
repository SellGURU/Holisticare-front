import { FC, useState } from 'react';
import EmailOverview from './EmailOverview';
import TheAppOverview from './TheAppOverview';
import ToggleCustomBranding from './Toggle';
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

const RightItemContent: FC<RightItemContentProps> = ({ customTheme }) => {
  const [activeToggle, setActiveToggle] = useState('Health Plan Overview');
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
            <TheAppOverview customTheme={customTheme} />
          ) : activeToggle === 'E-mail Overview' ? (
            <EmailOverview customTheme={customTheme} />
          ) : (
            <div className="w-[595px] h-full bg-bg-color">
              <div className="mx-4 my-4 bg-white border border-Gray-50 rounded-t-md flex flex-col p-3">
                <div className="flex items-center gap-2">
                  <img src="/icons/bone-health.svg" alt="" />
                  <div className="flex flex-col gap-[2px]">
                    <div
                      className="text-xs"
                      style={{ color: customTheme.secondaryColor }}
                    >
                      Bone Health
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-1">
                        <div className="text-Text-Quadruple text-[10px]">1</div>
                        <div className="text-Text-Fivefold text-[10px]">
                          Biomarker
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="text-Text-Quadruple text-[10px]">0</div>
                        <div className="text-Text-Fivefold text-[10px]">
                          Needs Focus
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 mt-3">
                  <div className="text-xs text-Text-Primary">Description</div>
                  <div className="text-[10px] text-Text-Quadruple leading-5">
                    Lorem ipsum odor amet, consectetuer adipiscing elit. Porta
                    interdum at parturient tincidunt diam accumsan platea. Vel
                    est faucibus fames; quisque mollis curae. Dapibus pretium
                    risus massa curae, vestibulum inceptos imperdiet. Purus
                    volutpat leo auctor lorem varius at malesuada aliquet quis.
                    accumsan platea.
                  </div>
                </div>
              </div>
              <div
                className="w-full h-[1px] mt-5"
                style={{
                  background: `linear-gradient(88.52deg, ${customTheme.secondaryColor} 3%, ${customTheme.primaryColor} 140.48%)`,
                }}
              ></div>
              <div className="mt-2 mx-4 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <div className="text-xs text-Text-Primary">Mark Spencer</div>
                  <div className="text-xs text-Text-Quadruple">
                    Jan 19, 2025
                  </div>
                </div>
                <div
                  className="text-xs"
                  style={{ color: customTheme.secondaryColor }}
                >
                  Comprehensive Health Plan
                </div>
              </div>
              <div
                className="w-full h-[1px] mt-1.5"
                style={{
                  background: `linear-gradient(88.52deg, ${customTheme.secondaryColor} 3%, ${customTheme.primaryColor} 140.48%)`,
                }}
              ></div>
              <div className="mx-4 mt-4 bg-white border border-b-0 border-Gray-50 rounded-t-md flex flex-col px-3 pt-3">
                <div className="w-full bg-white border border-b-0 border-Gray-50 rounded-t-md pt-2 pb-4 px-4 flex flex-col">
                  <div className="font-medium text-xs text-Text-Primary">
                    Ionized Calcium
                  </div>
                  <div className="mt-4 flex flex-col">
                    <div className="flex items-center justify-around">
                      <div className="flex flex-col items-center justify-center">
                        <div className="text-Text-Fivefold text-[10px]">
                          Needs focus
                        </div>
                        <div className="text-Text-Fivefold text-[10px]">
                          ( 0 - 10)
                        </div>
                      </div>
                      <div className="flex flex-col items-center justify-center">
                        <div className="text-Text-Fivefold text-[10px]">
                          Excellent
                        </div>
                        <div className="text-Text-Fivefold text-[10px]">
                          ( 10 - 40)
                        </div>
                      </div>
                      <div className="flex flex-col items-center justify-center">
                        <div className="text-Text-Fivefold text-[10px]">
                          Good
                        </div>
                        <div className="text-Text-Fivefold text-[10px]">
                          (40 - 60)
                        </div>
                      </div>
                      <div className="flex flex-col items-center justify-center">
                        <div className="text-Text-Fivefold text-[10px]">Ok</div>
                        <div className="text-Text-Fivefold text-[10px]">
                          ( 60 - 90)
                        </div>
                      </div>
                      <div className="flex flex-col items-center justify-center">
                        <div className="text-Text-Fivefold text-[10px]">
                          Needs focus
                        </div>
                        <div className="text-Text-Fivefold text-[10px]">
                          ( 90 - 100)
                        </div>
                      </div>
                    </div>
                    <div className="flex w-full items-center mt-1.5">
                      <div className="w-[20%] h-1 bg-Red rounded-tl-[5px] rounded-bl-[5px]"></div>
                      <div className="w-[20%] h-1 bg-[#7F39FB]"></div>
                      <div className="w-[20%] h-1 bg-Green"></div>
                      <div className="w-[20%] h-1 bg-[#FBAD37]"></div>
                      <div className="w-[20%] h-1 bg-Red rounded-tr-[5px] rounded-br-[5px]"></div>
                    </div>
                    <div className="w-full items-center justify-center flex flex-col mt-[1px]">
                      <div className="ml-2">
                        <SvgIcon
                          src="/icons/bone-health-line.svg"
                          color={customTheme.secondaryColor}
                        />
                      </div>
                      <div className="flex items-center gap-1 mt-[2px]">
                        <div className="text-Text-Fivefold text-[10px]">
                          You:
                        </div>
                        <div
                          className="text-[10px]"
                          style={{ color: customTheme.secondaryColor }}
                        >
                          50
                        </div>
                        <div
                          className="text-[8px] opacity-80"
                          style={{ color: customTheme.secondaryColor }}
                        >
                          mg/dL
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RightItemContent;
