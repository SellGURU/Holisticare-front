/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useRef, useState } from 'react';
import { Tooltip } from 'react-tooltip';
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
  handleDeleteImage: () => void;
  onSave: () => void;
  loading: boolean;
  pageLoading: boolean;
}

const LeftItemContent: FC<LeftItemContentProps> = ({
  customTheme,
  handleImageUpload,
  handleResetTheme,
  updateCustomTheme,
  handleDeleteImage,
  onSave,
  loading,
  pageLoading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorSecondaryInputRef = useRef<HTMLInputElement | null>(null);
  const colorPrimaryInputRef = useRef<HTMLInputElement | null>(null);
  const [errorHeadLine, setErrorHeadLine] = useState('');
  const [errorName, setErrorName] = useState('');
  const [errorLogo, setErrorLogo] = useState('');
  const [showSaved, setShowSaved] = useState(false);

  const validateForm = () => {
    // Validate Name
    if (customTheme.name === '') {
      setErrorName('This field is required.');
    } else if (customTheme.name.length < 3 || customTheme.name.length > 15) {
      setErrorName('Must be between 3 and 15 characters.');
    }

    // Validate Logo
    if (customTheme.selectedImage === null) {
      setErrorLogo('This field is required.');
    }

    // Validate Headline
    if (
      customTheme.headLine !== '' &&
      (customTheme.headLine.length < 3 || customTheme.headLine.length > 35)
    ) {
      setErrorHeadLine('Must be between 3 and 35 characters.');
    }

    return !errorName && !errorLogo && !errorHeadLine;
  };

  const handleChangeHeadLine = (e: any) => {
    const value = e.target.value;
    updateCustomTheme('headLine', value);
    if (value === '') {
      setErrorHeadLine('');
      return;
    }
    if (value.length < 3 || value.length > 35) {
      setErrorHeadLine('Must be between 3 and 35 characters.');
    } else {
      setErrorHeadLine('');
    }
  };

  const handleChangeName = (e: any) => {
    const value = e.target.value;
    if (value === '') {
      setErrorName('This field is required.');
    } else if (value.length < 3 || value.length > 15) {
      setErrorName('Must be between 3 and 15 characters.');
    } else {
      setErrorName('');
    }
    if (value.length <= 15) {
      updateCustomTheme('name', value);
    }
  };

  const handleImageUploadWithValidation = (event: any) => {
    const file = event.target.files[0];
    if (!file) {
      setErrorLogo('This field is required.');
      return;
    }

    const validFormats = ['.png', '.svg', '.jpg', '.jpeg'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!validFormats.includes(fileExtension)) {
      setErrorLogo('File has an unsupported format.');
      return;
    }

    setErrorLogo('');
    handleImageUpload(event);
  };
  console.log(showSaved);

  return (
    <div className=" w-full md:w-[360px] h-fit md:h-full mr-0 md:mr-4 bg-backgroundColor-Card border border-Gray-50 rounded-2xl p-4 shadow-100 flex flex-col justify-between">
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
            Personalize your brand!
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
                place="right-end"
                className="!bg-white !shadow-100 !opacity-100 !bg-opacity-100  !text-Text-Quadruple !text-[10px] !rounded-[6px] !border !border-gray-50 flex flex-col !z-[99999]"
              >
                <div className="flex items-center gap-1">
                  Supported files:{' '}
                  <div className="!text-Text-Primary">PNG, SVG, JPG, JPEG</div>
                </div>
                {/* <div className="flex items-center gap-1">
                  Maximum file size:{' '}
                  <div className="!text-Text-Primary">5MB</div>
                </div> */}
              </Tooltip>
            </div>
            <div className="flex items-end gap-2">
              {customTheme.selectedImage == null && !pageLoading && (
                <div className="text-Red text-[8px] mb-1">
                  {errorLogo || 'Please upload a logo to proceed.'}
                </div>
              )}
              <div
                className={`p-[1px] rounded-lg ${customTheme.selectedImage == null && !pageLoading ? 'bg-Red' : 'bg-gradient-to-r from-[#005F73] via-[#4CAF50] to-[#6CC24A]'}  relative`}
              >
                <div
                  className={`w-[52px] h-[52px] rounded-lg flex items-center justify-center cursor-pointer relative overflow-hidden bg-white`}
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
                    accept=".png,.svg,.jpg,.jpeg"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageUploadWithValidation}
                  />
                </div>
                {customTheme?.selectedImage && (
                  <div
                    className="bg-white rounded-3xl cursor-pointer p-[2px] absolute bottom-0 -left-[10px]"
                    onClick={handleDeleteImage}
                  >
                    <img
                      src="/icons/trash-red.svg"
                      alt=""
                      className="w-4 h-4"
                    />
                  </div>
                )}
              </div>
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
                place="right-end"
                className="!bg-white !shadow-100 !opacity-100 !bg-opacity-100  !text-Text-Quadruple !text-[10px] !rounded-[6px] !border !border-gray-50 !z-[99999]"
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
                className={`w-[180px] h-[28px] border ${errorName ? 'border-Red' : 'border-Gray-50'} bg-backgroundColor-Card rounded-2xl text-xs font-light px-4 placeholder:text-Text-Fivefold focus:outline-none`}
                placeholder="Enter your brand name"
                value={customTheme.name}
                onChange={handleChangeName}
              />
              {errorName && (
                <div className="text-Red text-[8px] mt-1 ml-3">{errorName}</div>
              )}
            </div>
          </div>
          <div className="flex w-full items-center justify-between mt-6">
            <div className="flex items-center">
              <div className="text-xs font-medium text-Text-Primary">
                Headline
              </div>
              <div data-tooltip-id="headline-tooltip">
                <img
                  src="/icons/info-circle.svg"
                  alt=""
                  className="w-2.5 h-2.5 cursor-pointer ml-1  mb-2"
                />
              </div>
              <Tooltip
                id="headline-tooltip"
                place="right-end"
                className="!bg-white !opacity-100 !bg-opacity-100 !shadow-100 !text-Text-Quadruple !text-[10px] !rounded-[6px] !border !border-gray-50 !z-[99999]"
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
                className={`w-[180px] h-[28px] border ${errorHeadLine ? 'border-Red' : 'border-Gray-50'} bg-backgroundColor-Card rounded-2xl text-xs font-light px-4 placeholder:text-Text-Fivefold focus:outline-none`}
                placeholder="Enter brand's headline"
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
              <input
                type="text"
                className="text-xs font-light text-Text-Quadruple select-none bg-backgroundColor-Card border-none outline-none w-[70px]"
                value={customTheme.primaryColor}
                onChange={(e) =>
                  updateCustomTheme('primaryColor', e.target.value)
                }
                placeholder="#000000"
                maxLength={9}
                style={{ padding: 0 }}
              />
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
              <input
                type="text"
                className="text-xs font-light text-Text-Quadruple bg-backgroundColor-Card border-none outline-none w-[70px]"
                value={customTheme.secondaryColor}
                onChange={(e) =>
                  updateCustomTheme('secondaryColor', e.target.value)
                }
                placeholder="#000000"
                maxLength={9}
                style={{ padding: 0 }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end mt-3 md:mt-0 md:mb-1 mr-1">
        <div
          className={`text-Disable text-sm font-medium ${loading ? 'cursor-not-allowed' : 'cursor-pointer'} `}
          onClick={() => {
            if(!loading){
              handleResetTheme();
              setErrorName('');
              setErrorHeadLine('');
              setErrorLogo('');
            }
           
          }}
        >
          Back to Default
        </div>
        <div
          className="text-Primary-DeepTeal text-nowrap font-medium text-sm ml-6 cursor-pointer w-[103px] flex items-center justify-center"
          onClick={async () => {
            if (validateForm()) {
              await onSave();

              setShowSaved(true);
              setTimeout(() => setShowSaved(false), 6000);
            }
          }}
        >
          {loading ? (
            <SpinnerLoader color="#005F73" />
          ) : showSaved ? (
            'Changes Saved'
          ) : (
            'Apply Changes'
          )}
        </div>
      </div>
    </div>
  );
};

export default LeftItemContent;
