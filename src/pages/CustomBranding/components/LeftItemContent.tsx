/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useRef, useState } from 'react';
import { Tooltip } from 'react-tooltip';
import SpinnerLoader from '../../../Components/SpinnerLoader';
import { copyText } from '../../../utils/clipboard';

interface LeftItemContentProps {
  customTheme: {
    primaryColor: string;
    secondaryColor: string;
    selectedImage: string | null;
    name: string;
    headLine: string;
    lastUpdate: string;
    slug?: string;
    coachPhoto: string | null;
    coachName: string;
    coachTitle: string;
    coachPhone: string;
    coachEmail: string;
    coachWebsite: string;
    coachSocial: string;
  };
  handleImageUpload: (event: any) => void;
  handleResetTheme: () => void;
  updateCustomTheme: (
    key:
      | 'primaryColor'
      | 'secondaryColor'
      | 'name'
      | 'headLine'
      | 'selectedImage'
      | 'coachPhoto'
      | 'coachName'
      | 'coachTitle'
      | 'coachPhone'
      | 'coachEmail'
      | 'coachWebsite'
      | 'coachSocial',
    value: any,
  ) => void;
  handleDeleteImage: () => void;
  handleCoachImageUpload: (event: any) => void;
  handleDeleteCoachImage: () => void;
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
  handleCoachImageUpload,
  handleDeleteCoachImage,
  onSave,
  loading,
  pageLoading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coachFileInputRef = useRef<HTMLInputElement>(null);
  const colorSecondaryInputRef = useRef<HTMLInputElement | null>(null);
  const colorPrimaryInputRef = useRef<HTMLInputElement | null>(null);
  const [errorHeadLine, setErrorHeadLine] = useState('');
  const [errorName, setErrorName] = useState('');
  const [errorLogo, setErrorLogo] = useState('');
  const [showSaved, setShowSaved] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const patientAppLink = customTheme.slug
    ? `https://app.holisticare.io/?clinic=${encodeURIComponent(customTheme.slug)}`
    : '';

  const validateForm = () => {
    let isValid = true;
    // Validate Name
    if (customTheme.name === '') {
      setErrorName('This field is required.');
      isValid = false;
    } else if (customTheme.name.length < 3 || customTheme.name.length > 30) {
      setErrorName('Must be between 3 and 30 characters.');
      isValid = false;
    } else {
      setErrorName('');
    }

    // Validate Logo
    if (customTheme.selectedImage === null) {
      setErrorLogo('This field is required.');
      isValid = false;
    } else {
      setErrorLogo('');
    }

    // Validate Headline
    if (
      customTheme.headLine !== '' &&
      (customTheme.headLine.length < 3 || customTheme.headLine.length > 35)
    ) {
      setErrorHeadLine('Must be between 3 and 35 characters.');
      isValid = false;
    } else {
      setErrorHeadLine('');
    }

    return isValid;
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
    } else if (value.length < 3 || value.length > 30) {
      setErrorName('Must be between 3 and 30 characters.');
    } else {
      setErrorName('');
    }
    if (value.length <= 30) {
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
  return (
    <aside className="flex h-auto min-h-[70dvh] w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-Gray-50 bg-backgroundColor-Card shadow-100 lg:h-full lg:min-h-0">
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        <div className="flex w-full flex-col border-b border-Gray-50 px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="text-base font-semibold text-Text-Primary">
              Brand Elements
            </div>
            {customTheme.lastUpdate && (
              <div className="rounded-full bg-backgroundColor-Main px-2.5 py-1 text-[9px] text-Text-Quadruple">
                Updated {customTheme.lastUpdate.substring(0, 10)}
              </div>
            )}
          </div>
          <div className="mt-1 text-[11px] text-Text-Quadruple">
            Customize how patients experience your clinic.
          </div>
        </div>
        <div className="flex w-full flex-col px-5 py-5">
          <div className="mb-4">
            <div className="text-sm font-semibold text-Text-Primary">
              Clinic identity
            </div>
            <div className="mt-1 text-[10px] text-Text-Quadruple">
              Used across the patient app and welcome email.
            </div>
          </div>
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
                  className="relative flex h-[64px] w-[88px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-white"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {customTheme.selectedImage ? (
                    <img
                      src={customTheme.selectedImage}
                      alt="Uploaded"
                      className="h-full w-full object-contain p-1"
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
          <div className="mt-5 flex items-start justify-between gap-3">
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
                  <div className="!text-Text-Primary">30</div>
                </div>
              </Tooltip>
            </div>
            <div className="flex min-w-0 flex-1 flex-col items-end">
              <input
                type="text"
                className={`h-9 w-full min-w-0 rounded-lg border ${errorName ? 'border-Red' : 'border-Gray-50'} bg-white px-3 text-xs font-light placeholder:text-Text-Fivefold focus:border-Primary-DeepTeal focus:outline-none`}
                placeholder="Enter your brand name"
                value={customTheme.name}
                onChange={handleChangeName}
              />
              {errorName && (
                <div className="text-Red text-[8px] mt-1 ml-3">{errorName}</div>
              )}
            </div>
          </div>
          <div className="mt-4 flex w-full items-start justify-between gap-3">
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
            <div className="flex min-w-0 flex-1 flex-col items-end">
              <input
                type="text"
                className={`h-9 w-full min-w-0 rounded-lg border ${errorHeadLine ? 'border-Red' : 'border-Gray-50'} bg-white px-3 text-xs font-light placeholder:text-Text-Fivefold focus:border-Primary-DeepTeal focus:outline-none`}
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
          {patientAppLink && (
            <div className="mt-5 flex w-full flex-col gap-2 rounded-xl bg-backgroundColor-Main p-3">
              <div className="flex flex-col">
                <div className="text-xs font-medium text-Text-Primary">
                  Patient app link
                </div>
                <div className="text-[10px] text-Text-Quadruple mt-1 max-w-[140px]">
                  Share this URL so patients see your clinic brand before login.
                </div>
              </div>
              <div className="flex min-w-0 items-center justify-between gap-2">
                <div className="min-w-0 break-all text-[10px] text-Text-Primary">
                  {patientAppLink}
                </div>
                <button
                  type="button"
                  className="shrink-0 rounded-md bg-white px-2.5 py-1.5 text-[10px] font-medium text-Primary-DeepTeal shadow-sm"
                  onClick={async () => {
                    const copied = await copyText(patientAppLink);
                    if (copied) {
                      setLinkCopied(true);
                      window.setTimeout(() => setLinkCopied(false), 2000);
                    }
                  }}
                >
                  {linkCopied ? 'Copied' : 'Copy link'}
                </button>
              </div>
            </div>
          )}
          <div className="mt-6 border-t border-Gray-50 pt-5">
            <div className="mb-4">
              <div className="text-sm font-semibold text-Text-Primary">
                Brand colors
              </div>
              <div className="mt-1 text-[10px] text-Text-Quadruple">
                Applied to buttons, accents, and patient-facing screens.
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-Text-Primary">
                Primary Color
              </div>
              <div className="flex h-9 w-[132px] items-center gap-2 rounded-lg border border-Gray-50 bg-white px-3">
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
            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs font-medium text-Text-Primary">
                Secondary Color
              </div>
              <div className="flex h-9 w-[132px] items-center gap-2 rounded-lg border border-Gray-50 bg-white px-3">
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
          <div className="mt-6 border-t border-Gray-50 pt-5">
            <div className="text-sm font-semibold text-Text-Primary">
              Coach Profile
            </div>
            <div className="mt-1 text-[10px] leading-4 text-Text-Quadruple">
              This card appears in welcome emails only when every field is
              completed.
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-backgroundColor-Main p-3">
              <div className="relative shrink-0">
                <button
                  type="button"
                  className="h-[64px] w-[64px] overflow-hidden rounded-full border-2 border-white bg-white shadow-sm"
                  onClick={() => coachFileInputRef.current?.click()}
                >
                  {customTheme.coachPhoto ? (
                    <img
                      src={customTheme.coachPhoto}
                      alt="Coach"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[9px] text-Text-Quadruple">
                      Add photo
                    </span>
                  )}
                </button>
                <input
                  ref={coachFileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  className="hidden"
                  onChange={handleCoachImageUpload}
                />
                {customTheme.coachPhoto && (
                  <button
                    type="button"
                    aria-label="Delete coach photo"
                    className="absolute -bottom-1 -left-2 bg-white rounded-full p-[2px]"
                    onClick={handleDeleteCoachImage}
                  >
                    <img
                      src="/icons/trash-red.svg"
                      alt=""
                      className="w-4 h-4"
                    />
                  </button>
                )}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium text-Text-Primary">
                  Coach headshot
                </div>
                <div className="mt-1 text-[9px] leading-4 text-Text-Quadruple">
                  JPG or PNG. A square image works best.
                </div>
              </div>
            </div>
            {[
              ['coachName', 'Name', 'Dr. Jane Smith', 'text'],
              ['coachTitle', 'Title', 'Medical Specialist', 'text'],
              ['coachPhone', 'Phone', '(316) 212-3456', 'tel'],
              ['coachEmail', 'Email', 'coach@clinic.com', 'email'],
              ['coachWebsite', 'Website', 'clinic.com', 'url'],
              ['coachSocial', 'Social URL', 'instagram.com/coach', 'url'],
            ].map(([key, label, placeholder, type]) => (
              <label key={key} className="mt-3 flex min-w-0 flex-col gap-1.5">
                <span className="text-xs text-Text-Primary">{label}</span>
                <input
                  type={type}
                  value={customTheme[key as keyof typeof customTheme] || ''}
                  placeholder={placeholder}
                  maxLength={120}
                  className="h-9 w-full min-w-0 rounded-lg border border-Gray-50 bg-white px-3 text-xs font-light placeholder:text-Text-Fivefold focus:border-Primary-DeepTeal focus:outline-none"
                  onChange={(event) =>
                    updateCustomTheme(
                      key as
                        | 'coachName'
                        | 'coachTitle'
                        | 'coachPhone'
                        | 'coachEmail'
                        | 'coachWebsite'
                        | 'coachSocial',
                      event.target.value,
                    )
                  }
                />
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className="z-10 flex shrink-0 items-center justify-end gap-3 border-t border-Gray-50 bg-white px-5 py-4 shadow-[0_-6px_16px_rgba(0,0,0,0.04)]">
        <button
          type="button"
          className={`rounded-lg px-4 py-2 text-xs font-medium text-Text-Quadruple hover:bg-backgroundColor-Main ${loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} `}
          onClick={() => {
            if (!loading) {
              handleResetTheme();
              setErrorName('');
              setErrorHeadLine('');
              setErrorLogo('');
            }
          }}
        >
          Back to Default
        </button>
        <button
          type="button"
          disabled={loading}
          className="flex min-w-[118px] cursor-pointer items-center justify-center whitespace-nowrap rounded-lg bg-Primary-DeepTeal px-4 py-2 text-xs font-medium text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
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
        </button>
      </div>
    </aside>
  );
};

export default LeftItemContent;
