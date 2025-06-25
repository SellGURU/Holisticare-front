/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { ButtonSecondary } from '../../Components/Button/ButtosSecondary';
import Application from '../../api/app';
import { blobToBase64 } from '../../help';
import SpinnerLoader from '../../Components/SpinnerLoader';
import { useNavigate } from 'react-router-dom';

const SignUpNameLogo = () => {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [errorName, setErrorName] = useState(false);
  const [errorLogo, setErrorLogo] = useState('');
  const [clinicName, setClinicName] = useState<string>('');
  const [imageSelect, setImageSelect] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const handleFileUpload = (event: any) => {
    const file = event.target.files[0];
    const maxSizeInBytes = 4 * 1024 * 1024;
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/svg+xml',
    ];
    if (!allowedTypes.includes(file.type)) {
      setErrorLogo('File exceeds 4 MB or has an unsupported format.');
      return;
    }

    if (file.size > maxSizeInBytes) {
      setErrorLogo('File exceeds 4 MB or has an unsupported format.');
      return;
    }

    setErrorLogo('');
    setSelectedFiles((prev) => [...prev, file]);
    handleImageUpload(event);
  };
  const validateForm = () => {
    if (clinicName.length === 0) {
      setErrorName(true);
      return false;
    }
    return true;
  };
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      blobToBase64(file).then((resolve: any) => {
        setImageSelect(resolve);
      });
    }
  };
  const onSave = () => {
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    const data: any = {
      logo: imageSelect,
      name: clinicName,
    };
    Application.saveBrandInfo(data)
      .then(() => {
        navigate('/');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  return (
    <div className="w-full h-screen flex justify-center items-center bg-bg-color px-12 py-8">
      <div className="w-full h-full flex flex-col gap-2 justify-center items-center border border-Gray-100 rounded-xl bg-white bg-opacity-40">
        <img src="./icons/tick-circle-large.svg" alt="" />
        <div className="text-Text-Primary font-medium text-base">
          You're all set!
        </div>
        <div className="w-[80%] md:w-[36%] text-wrap text-Text-Primary text-sm text-center leading-6">
          Your account has been successfully created. Now let’s personalize your
          experience by setting up your clinic profile. Add your clinic's name
          and logo — you can always change them later.
        </div>
        <div className="flex flex-col mt-4">
          <div className="text-Text-Primary font-medium text-xs mb-2">
            Clinic Name
          </div>
          <div className="flex flex-col">
            <input
              type="text"
              className={`w-[300px] h-[28px] border ${errorName ? 'border-Red' : 'border-Gray-50'} bg-backgroundColor-Card rounded-2xl text-xs font-light px-4 placeholder:text-Text-Fivefold focus:outline-none`}
              placeholder="Enter your clinic name"
              value={clinicName}
              onChange={(e) => {
                setClinicName(e.target.value);
                setErrorName(e.target.value.length === 0);
              }}
            />
            {errorName && (
              <div className="text-Red text-[8px] mt-1 ml-3">
                This field is required.
              </div>
            )}
          </div>
        </div>
        <div
          className={`w-[300px] mt-2 ${selectedFiles.length > 0 ? 'flex flex-col items-center justify-center' : ''}`}
        >
          {selectedFiles.length > 0 ? (
            <div
              className="w-[170px] h-[170px] rounded-3xl relative"
              style={{
                background:
                  'linear-gradient(88.52deg, #005F73 3%, #6CC24A 140.48%)',
                padding: '1px',
              }}
            >
              <div className="w-full h-full rounded-3xl bg-white">
                <img
                  src={URL.createObjectURL(selectedFiles[0])}
                  alt=""
                  className="w-full h-full object-contain"
                />
              </div>
              <div
                className="absolute bottom-0 -left-4 w-[40px] h-[40px] rounded-full bg-white flex items-center justify-center cursor-pointer"
                onClick={() => {
                  setSelectedFiles([]);
                }}
              >
                <img src="./icons/trash-red.svg" alt="" />
              </div>
            </div>
          ) : (
            <>
              <div className="text-Text-Primary font-medium text-xs mb-2">
                Clinic Logo
              </div>
              <label className="w-full h-[154px] rounded-2xl border border-Gray-50 bg-white shadow-100 flex flex-col items-center justify-center gap-2 p-6 cursor-pointer">
                <input
                  multiple
                  type="file"
                  accept=".svg,.jpg,.png,.jpeg"
                  style={{ display: 'none' }}
                  id="file-upload"
                  onChange={handleFileUpload}
                />
                <img src="/icons/upload-test.svg" alt="" />
                <div className="text-xs text-Text-Primary text-center mt-1">
                  Drag and drop or click to upload.
                </div>
                <div className="text-Text-Quadruple text-xs">
                  Accepted formats:{' '}
                  <span className="font-medium">.svg, .jpg, .png.</span>
                </div>
              </label>
            </>
          )}
          {errorLogo && (
            <div className="text-[10px] font-medium mt-1 text-Red">
              {errorLogo}
            </div>
          )}
        </div>
        <ButtonSecondary
          ClassName="w-[300px] rounded-[20px] border border-white mt-4"
          onClick={() => {
            if (validateForm()) {
              onSave();
            }
          }}
        >
          {isLoading ? <SpinnerLoader /> : 'Continue'}
        </ButtonSecondary>
      </div>
    </div>
  );
};

export default SignUpNameLogo;
