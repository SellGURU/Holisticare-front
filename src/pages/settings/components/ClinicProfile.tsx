/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { Tooltip } from 'react-tooltip';
import Application from '../../../api/app';
import { ButtonPrimary } from '../../../Components/Button/ButtonPrimary';
import Circleloader from '../../../Components/CircleLoader';
import SpinnerLoader from '../../../Components/SpinnerLoader';
import { blobToBase64 } from '../../../help';
import { fetchBrandInfo } from '../../../utils/brandInfoCache';
import { invalidateBrandInfo } from '../../../utils/cacheKeys';
import { publish } from '../../../utils/event';

const MAX_NAME_LENGTH = 30;
const MIN_NAME_LENGTH = 3;
const MAX_LOGO_BYTES = 4 * 1024 * 1024;
const VALID_EXTENSIONS = ['.png', '.svg', '.jpg', '.jpeg'];

export const ClinicProfile = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [changesSaved, setChangesSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [name, setName] = useState('');
  const [logo, setLogo] = useState<string | null>(null);
  const [initialName, setInitialName] = useState('');
  const [initialLogo, setInitialLogo] = useState<string | null>(null);
  const [errorName, setErrorName] = useState('');
  const [errorLogo, setErrorLogo] = useState('');
  const [logoChanged, setLogoChanged] = useState(false);

  const loadBrandInfo = () => {
    setPageLoading(true);
    fetchBrandInfo()
      .then((res) => {
        const nextName = (res.brand_elements.name as string) || '';
        const nextLogo = (res.brand_elements.logo as string) || null;
        setName(nextName);
        setLogo(nextLogo);
        setInitialName(nextName);
        setInitialLogo(nextLogo);
        setLogoChanged(false);
        setErrorName('');
        setErrorLogo('');
        setSaveError('');
      })
      .catch((err) => {
        console.error('Error getting show brand info:', err);
        setSaveError('Failed to load clinic profile.');
      })
      .finally(() => {
        setPageLoading(false);
      });
  };

  useEffect(() => {
    loadBrandInfo();
  }, []);

  const validateName = (value: string) => {
    if (!value.trim()) {
      return 'This field is required.';
    }
    if (value.length < MIN_NAME_LENGTH || value.length > MAX_NAME_LENGTH) {
      return 'Must be between 3 and 30 characters.';
    }
    return '';
  };

  const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length > MAX_NAME_LENGTH) {
      return;
    }
    setName(value);
    setErrorName(validateName(value));
    setChangesSaved(false);
    setSaveError('');
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!VALID_EXTENSIONS.includes(fileExtension)) {
      setErrorLogo('File has an unsupported format.');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_LOGO_BYTES) {
      setErrorLogo('File exceeds 4 MB.');
      event.target.value = '';
      return;
    }

    setErrorLogo('');
    setChangesSaved(false);
    setSaveError('');
    blobToBase64(file).then((resolve: any) => {
      setLogo(resolve as string);
      setLogoChanged(true);
    });
  };

  const handleDeleteImage = () => {
    setLogo(null);
    setLogoChanged(true);
    setErrorLogo('This field is required.');
    setChangesSaved(false);
    setSaveError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    setName(initialName);
    setLogo(initialLogo);
    setLogoChanged(false);
    setErrorName('');
    setErrorLogo('');
    setSaveError('');
    setChangesSaved(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isDirty =
    name.trim() !== initialName.trim() || logoChanged || logo !== initialLogo;

  const canSave =
    !btnLoading &&
    isDirty &&
    !validateName(name) &&
    Boolean(logo) &&
    !errorLogo;

  const onSave = () => {
    const nameError = validateName(name);
    if (nameError) {
      setErrorName(nameError);
      return;
    }
    if (!logo) {
      setErrorLogo('This field is required.');
      return;
    }
    if (!isDirty || btnLoading) {
      return;
    }

    setBtnLoading(true);
    setSaveError('');

    const data: { name: string; logo?: string } = {
      name: name.trim(),
    };
    if (logoChanged && logo) {
      data.logo = logo;
    }

    Application.saveBrandInfo(data)
      .then(() => {
        invalidateBrandInfo();
        publish('refreshBrandInfo', {});
        setName(name.trim());
        setInitialName(name.trim());
        setInitialLogo(logo);
        setLogoChanged(false);
        setChangesSaved(true);
        setTimeout(() => setChangesSaved(false), 2000);
      })
      .catch((err) => {
        console.error('Error saving clinic profile:', err);
        setSaveError('Failed to save clinic profile. Please try again.');
      })
      .finally(() => {
        setBtnLoading(false);
      });
  };

  return (
    <div className="bg-backgroundColor-Card h-fit min-h-[348px] w-full rounded-2xl relative shadow-100 p-4 text-Text-Primary">
      {pageLoading ? (
        <div className="w-full flex flex-col gap-3 justify-center items-center h-[300px]">
          <Circleloader></Circleloader>
        </div>
      ) : (
        <>
          <div className="text-sm font-medium text-Text-Primary">
            Clinic Profile
          </div>
          <div className="text-[10px] text-[#888888] text-justify my-4">
            Update your clinic name and logo. Changes appear in the header right
            away for your team and clients.
          </div>

          <div className="w-full flex flex-col gap-6 max-w-[480px]">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center">
                <div className="text-xs font-medium text-Text-Primary">
                  Logo
                </div>
                <div data-tooltip-id="clinic-profile-logo-tooltip">
                  <img
                    src="/icons/info-circle.svg"
                    alt=""
                    className="w-2.5 h-2.5 cursor-pointer ml-1 mb-2"
                  />
                </div>
                <Tooltip
                  id="clinic-profile-logo-tooltip"
                  place="right-end"
                  className="!bg-white !shadow-100 !opacity-100 !bg-opacity-100 !text-Text-Quadruple !text-[10px] !rounded-[6px] !border !border-gray-50 flex flex-col !z-[99999]"
                >
                  <div className="flex items-center gap-1">
                    Supported files:{' '}
                    <div className="!text-Text-Primary">
                      PNG, SVG, JPG, JPEG
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    Maximum file size:{' '}
                    <div className="!text-Text-Primary">4MB</div>
                  </div>
                </Tooltip>
              </div>

              <div className="flex flex-col items-end gap-1">
                {errorLogo && (
                  <div className="text-Red text-[8px]">{errorLogo}</div>
                )}
                <div
                  className={`p-[1px] rounded-lg ${
                    errorLogo || !logo
                      ? 'bg-Red'
                      : 'bg-gradient-to-r from-[#005F73] via-[#4CAF50] to-[#6CC24A]'
                  } relative`}
                >
                  <div
                    className="w-[52px] h-[52px] rounded-lg flex items-center justify-center cursor-pointer relative overflow-hidden bg-white"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {logo ? (
                      <img
                        src={logo}
                        alt="Clinic logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-Text-Quadruple text-[11px] text-center px-1">
                        Clinic Logo
                      </div>
                    )}
                    <input
                      type="file"
                      accept=".png,.svg,.jpg,.jpeg"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                    />
                  </div>
                  {logo && (
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

            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center pt-1">
                <div className="text-xs font-medium text-Text-Primary">
                  Name
                </div>
                <div data-tooltip-id="clinic-profile-name-tooltip">
                  <img
                    src="/icons/info-circle.svg"
                    alt=""
                    className="w-2.5 h-2.5 cursor-pointer ml-1 mb-2"
                  />
                </div>
                <Tooltip
                  id="clinic-profile-name-tooltip"
                  place="right-end"
                  className="!bg-white !shadow-100 !opacity-100 !bg-opacity-100 !text-Text-Quadruple !text-[10px] !rounded-[6px] !border !border-gray-50 !z-[99999]"
                >
                  <div className="flex items-center gap-1">
                    Maximum Characters:{' '}
                    <div className="!text-Text-Primary">30</div>
                  </div>
                </Tooltip>
              </div>
              <div className="flex flex-col w-full max-w-[240px]">
                <input
                  type="text"
                  className={`w-full h-[28px] border ${
                    errorName ? 'border-Red' : 'border-Gray-50'
                  } bg-backgroundColor-Card rounded-2xl text-xs font-light px-4 placeholder:text-Text-Fivefold focus:outline-none`}
                  placeholder="Enter your clinic name"
                  value={name}
                  onChange={handleChangeName}
                />
                {errorName && (
                  <div className="text-Red text-[8px] mt-1 ml-3">
                    {errorName}
                  </div>
                )}
              </div>
            </div>
          </div>

          {saveError && (
            <div className="text-Red text-[10px] mt-4">{saveError}</div>
          )}

          <div className="flex items-center gap-4 justify-end mt-8 md:mt-10 mr-1">
            <div
              className="text-Disable text-xs md:text-sm font-medium cursor-pointer"
              onClick={handleReset}
            >
              Back to Default
            </div>
            <ButtonPrimary
              ClassName="min-w-[150px]"
              disabled={!canSave}
              onClick={onSave}
            >
              {changesSaved ? (
                'Changes Saved'
              ) : btnLoading ? (
                <SpinnerLoader color="#005F73" />
              ) : (
                'Apply Changes'
              )}
            </ButtonPrimary>
          </div>
        </>
      )}
    </div>
  );
};
