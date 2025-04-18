/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useRef, useState } from 'react';
import { Tooltip } from 'react-tooltip';
import { ButtonSecondary } from '../../../Components/Button/ButtosSecondary';
import SpinnerLoader from '../../../Components/SpinnerLoader';

interface LeftItemContentProps {
  customTheme: {
    primaryColor: string;
    secondaryColor: string;
    selectedImage: string | null;
    name: string;
    headLine: string;
    lastUpdate: string;
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
  onSave: () => void;
  loading: boolean;
}

const LeftItemContent: FC<LeftItemContentProps> = ({
  customTheme,
  handleImageUpload,
  defaultPrimaryColor,
  defaultSecondaryColor,
  handleResetTheme,
  updateCustomTheme,
  onSave,
  loading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorSecondaryInputRef = useRef<HTMLInputElement | null>(null);
  const colorPrimaryInputRef = useRef<HTMLInputElement | null>(null);
  const [errorHeadLine, setErrorHeadLine] = useState('');
  const [errorName, setErrorName] = useState('');
  const handleChangeHeadLine = (e: any) => {
    const value = e.target.value;
    if (value.length < 3 || value.length > 25) {
      setErrorHeadLine('Must be between 3 and 25 characters.');
    } else {
      setErrorHeadLine('');
    }
    if (value.length <= 25) {
      updateCustomTheme('headLine', value);
    }
  };
  const handleChangeName = (e: any) => {
    const value = e.target.value;
    if (value.length < 3 || value.length > 15) {
      setErrorName('Must be between 3 and 15 characters.');
    } else {
      setErrorName('');
    }
    if (value.length <= 15) {
      updateCustomTheme('name', value);
    }
  };

  return (
    <div className="w-[360px] h-full mr-4 bg-backgroundColor-Card border border-Gray-50 rounded-2xl p-4 shadow-100 flex flex-col justify-between">
      <div>
        <div className="flex flex-col w-full">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-Text-Primary">
              Brand Elements
            </div>
            <div className="text-Text-Quadruple text-[10px]">
              Last Update: {customTheme.lastUpdate.substring(0, 10)}
            </div>
          </div>
          <div className="text-[10px] text-Text-Quadruple mt-1">
            Personalize
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
            <div className="flex flex-col">
              <input
                type="text"
                className={`w-[200px] h-[28px] border ${errorName ? 'border-Red' : 'border-Gray-50'} bg-backgroundColor-Card rounded-2xl text-xs font-light px-4 placeholder:text-Text-Fivefold focus:outline-none`}
                placeholder="Enter chosen name..."
                value={customTheme.name}
                onChange={handleChangeName}
              />
              {errorName && (
                <div className="text-Red text-[8px] mt-1 ml-3">{errorName}</div>
              )}
            </div>
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
            <div className="flex flex-col">
              <input
                type="text"
                className={`w-[200px] h-[28px] border ${errorHeadLine ? 'border-Red' : 'border-Gray-50'} bg-backgroundColor-Card rounded-2xl text-xs font-light px-4 placeholder:text-Text-Fivefold focus:outline-none`}
                placeholder="Enter your headline..."
                value={customTheme.headLine}
                onChange={handleChangeHeadLine}
              />
              {errorHeadLine && (
                <div className="text-Red text-[8px] mt-1 ml-3">
                  {errorHeadLine}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between mt-6">
            <div className="text-xs font-medium text-Text-Primary">
              Primary Color
            </div>
            <div className="w-[114px] h-[28px] rounded-2xl px-3 flex items-center border border-Gray-50 gap-2">
              <div
                className="rounded-[4px] w-5 h-5 cursor-pointer"
                style={{ backgroundColor: customTheme.primaryColor }}
                onClick={() => colorPrimaryInputRef.current?.click()}
              >
                <input
                  type="color"
                  ref={colorPrimaryInputRef}
                  className="invisible"
                  value={customTheme.primaryColor}
                  onChange={(e) =>
                    updateCustomTheme('primaryColor', e.target.value)
                  }
                />
              </div>
              <div className="text-xs font-light text-Text-Quadruple">
                {customTheme.primaryColor}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-6">
            <div className="text-xs font-medium text-Text-Primary">
              Secondary Color
            </div>
            <div className="w-[114px] h-[28px] rounded-2xl px-3 flex items-center border border-Gray-50 gap-2">
              <div
                className="rounded-[4px] w-5 h-5 cursor-pointer"
                style={{ backgroundColor: customTheme.secondaryColor }}
                onClick={() => colorSecondaryInputRef.current?.click()}
              >
                <input
                  type="color"
                  ref={colorSecondaryInputRef}
                  className="invisible"
                  value={customTheme.secondaryColor}
                  onChange={(e) =>
                    updateCustomTheme('secondaryColor', e.target.value)
                  }
                />
              </div>
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
          ClassName={`rounded-[20px] !w-[160px] ml-10 text-nowrap shadow-Btn ${customTheme.name ? '' : '!bg-Disable'}`}
          onClick={onSave}
        >
          {loading ? (
            <SpinnerLoader />
          ) : (
            <>
              <img src="/icons/tick-square.svg" alt="" />
              Apply Changes
            </>
          )}
        </ButtonSecondary>
      </div>
    </div>
  );
};

export default LeftItemContent;
