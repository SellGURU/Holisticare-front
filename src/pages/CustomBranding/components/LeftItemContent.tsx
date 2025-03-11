/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useRef } from 'react';
import { Tooltip } from 'react-tooltip';
import { ButtonSecondary } from '../../../Components/Button/ButtosSecondary';

interface LeftItemContentProps {
  customTheme: {
    primaryColor: string;
    secondaryColor: string;
    selectedImage: string | null;
    name: string;
    headLine: string;
  };
  handleImageUpload: (event: any) => void;
  defaultPrimaryColor: string;
  defaultSecondaryColor: string;
  handleResetTheme: () => void;
  updateCustomTheme: (
    key:
      | 'primaryColor'
      | 'secondaryColor'
      | 'name'
      | 'headLine'
      | 'selectedImage',
    value: any,
  ) => void;
}

const LeftItemContent: FC<LeftItemContentProps> = ({
  customTheme,
  handleImageUpload,
  defaultPrimaryColor,
  defaultSecondaryColor,
  handleResetTheme,
  updateCustomTheme,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="w-[360px] h-full mr-4 bg-backgroundColor-Card border border-Gray-50 rounded-2xl p-4 shadow-100 flex flex-col justify-between">
      <div>
        <div className="flex flex-col w-full">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-Text-Primary">
              Brand Elements
            </div>
            <div className="text-Text-Quadruple text-[10px]">
              Last Update: 2024/02/02
            </div>
          </div>
          <div className="text-[10px] text-Text-Quadruple mt-1">
            Personalise your brand!
          </div>
        </div>
        <div className="flex flex-col w-full mt-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-xs font-medium text-Text-Primary">Logo</div>
              <div data-tooltip-id="logo-tooltip">
                <img
                  src="/icons/info-circle.svg"
                  alt=""
                  className="w-2.5 h-2.5 cursor-pointer ml-1 mb-2"
                />
              </div>
              <Tooltip
                id="logo-tooltip"
                place="top"
                className="!bg-white !shadow-100 !text-Text-Quadruple !text-[10px] !rounded-[6px] !border !border-gray-50 flex flex-col !z-[99999]"
              >
                <div className="flex items-center gap-1">
                  Supported files:{' '}
                  <div className="!text-Text-Primary">PNG, SVG, JPG, JPEG</div>
                </div>
                <div className="flex items-center gap-1">
                  Maximum file size:{' '}
                  <div className="!text-Text-Primary">5MB</div>
                </div>
              </Tooltip>
            </div>
            <div
              className="w-[52px] h-[52px] border-[0.52px] border-Primary-DeepTeal rounded-lg flex items-center justify-center cursor-pointer relative overflow-hidden"
              onClick={() => fileInputRef.current?.click()}
            >
              {customTheme.selectedImage ? (
                <img
                  src={customTheme.selectedImage}
                  alt="Uploaded"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-Text-Quadruple text-[11px] text-center">
                  Clinic Logo
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageUpload}
              />
            </div>
          </div>
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center">
              <div className="text-xs font-medium text-Text-Primary">Name</div>
              <div data-tooltip-id="name-tooltip">
                <img
                  src="/icons/info-circle.svg"
                  alt=""
                  className="w-2.5 h-2.5 cursor-pointer ml-1 mb-2"
                />
              </div>
              <Tooltip
                id="name-tooltip"
                place="top"
                className="!bg-white !shadow-100 !text-Text-Quadruple !text-[10px] !rounded-[6px] !border !border-gray-50 !z-[99999]"
              >
                <div className="flex items-center gap-1">
                  Maximum Characters:{' '}
                  <div className="!text-Text-Primary">15</div>
                </div>
              </Tooltip>
            </div>
            <input
              type="text"
              className="w-[200px] h-[28px] border border-Gray-50 bg-backgroundColor-Card rounded-2xl text-xs font-light px-4 placeholder:text-Text-Fivefold"
              placeholder="Enter chosen name..."
              value={customTheme.name}
              onChange={(e) => updateCustomTheme('name', e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center">
              <div className="text-xs font-medium text-Text-Primary">
                Headline
              </div>
              <div data-tooltip-id="headline-tooltip">
                <img
                  src="/icons/info-circle.svg"
                  alt=""
                  className="w-2.5 h-2.5 cursor-pointer ml-1 mb-2"
                />
              </div>
              <Tooltip
                id="headline-tooltip"
                place="top"
                className="!bg-white !shadow-100 !text-Text-Quadruple !text-[10px] !rounded-[6px] !border !border-gray-50 !z-[99999]"
              >
                <div className="flex items-center gap-1">
                  Maximum Characters:{' '}
                  <div className="!text-Text-Primary">25</div>
                </div>
              </Tooltip>
            </div>
            <input
              type="text"
              className="w-[200px] h-[28px] border border-Gray-50 bg-backgroundColor-Card rounded-2xl text-xs font-light px-4 placeholder:text-Text-Fivefold"
              placeholder="Enter your headline..."
              value={customTheme.headLine}
              onChange={(e) => updateCustomTheme('headLine', e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between mt-6">
            <div className="text-xs font-medium text-Text-Primary">
              Primary Color
            </div>
            <div className="w-[114px] h-[28px] rounded-2xl px-3 flex items-center justify-center border border-Gray-50 gap-2">
              <input
                type="color"
                className="w-5 h-5 border-none outline-0 cursor-pointer rounded-[4px] appearance-none shadow-none p-0"
                style={{ backgroundColor: customTheme.primaryColor }}
                value={customTheme.primaryColor}
                onChange={(e) =>
                  updateCustomTheme('primaryColor', e.target.value)
                }
              />
              <div className="text-xs font-light text-Text-Quadruple">
                {customTheme.primaryColor}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-6">
            <div className="text-xs font-medium text-Text-Primary">
              Secondary Color
            </div>
            <div className="w-[114px] h-[28px] rounded-2xl px-3 flex items-center justify-center border border-Gray-50 gap-2">
              <input
                type="color"
                className="w-5 h-5 border-none outline-0 cursor-pointer rounded-[4px] appearance-none shadow-none p-0"
                style={{ backgroundColor: customTheme.secondaryColor }}
                value={customTheme.secondaryColor}
                onChange={(e) =>
                  updateCustomTheme('secondaryColor', e.target.value)
                }
              />
              <div className="text-xs font-light text-Text-Quadruple">
                {customTheme.secondaryColor}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end">
        <div
          className={`font-medium text-xs cursor-pointer ${
            defaultPrimaryColor !== customTheme.primaryColor ||
            defaultSecondaryColor !== customTheme.secondaryColor
              ? 'text-Primary-EmeraldGreen'
              : 'text-Disable'
          }`}
          onClick={handleResetTheme}
        >
          Back to Default
        </div>
        <ButtonSecondary
          ClassName={`rounded-[20px] ml-10 shadow-Btn ${customTheme.name && customTheme.headLine && customTheme.primaryColor && customTheme.secondaryColor ? '' : '!bg-Disable'}`}
        >
          <img src="/icons/tick-square.svg" alt="" />
          Apply Changes
        </ButtonSecondary>
      </div>
    </div>
  );
};

export default LeftItemContent;
