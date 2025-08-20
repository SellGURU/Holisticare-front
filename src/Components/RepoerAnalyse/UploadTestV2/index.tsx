/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useState, useEffect } from 'react';
import { ButtonSecondary } from '../../Button/ButtosSecondary';
import { ButtonPrimary } from '../../Button/ButtonPrimary';
import Toggle from '../../Toggle';
import Application from '../../../api/app';
import { uploadToAzure } from '../../../help';
import { publish, subscribe } from '../../../utils/event';
import FileUploaderSection from './FileUploaderSection';
import BiomarkersSection from './BiomarkersSection';
import { AddBiomarker } from './AddBiomarker';
import Circleloader from '../../CircleLoader';

interface FileUpload {
  file: File;
  file_id:string
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  azureUrl?: string;
  uploadedSize?: number;
  errorMessage?: string;
  warning?: boolean;
}

interface UploadTestProps {
  memberId: any;
  onGenderate: () => void;
  isShare?: boolean;
  showReport: boolean;
}

export const UploadTestV2: React.FC<UploadTestProps> = ({
  memberId,
  onGenderate,
  isShare,
  showReport,
}) => {
  const fileInputRef = useRef<any>(null);
  const [step, setstep] = useState(0);
  const [activeMenu, setactiveMenu] = useState('Upload File');
  const [uploadedFile, setUploadedFile] = useState<FileUpload | null>(null); // ✅ single file
  const [errorMessage] = useState<string>('');
  const [questionaryLength, setQuestionaryLength] = useState(false);

const [extractedBiomarkers, setExtractedBiomarkers] = useState<any[]>([])
const [fileType, setfileType] = useState('')
const [polling, setPolling] = useState(true); // ✅ control polling
const [deleteLoading, setdeleteLoading] = useState(false)
console.log(extractedBiomarkers);

useEffect(() => {
  if (!uploadedFile?.file_id) return;

  let intervalId: NodeJS.Timeout;

  const fetchData = async () => {
    try {
      const res = await Application.checkLabStepOne({
        file_id: uploadedFile.file_id,
      });

      setfileType(res.data.lab_type);
      setExtractedBiomarkers(res.data.extracted_biomarkers);

      // ✅ stop polling if biomarkers found
      if (res.data.extracted_biomarkers && res.data.extracted_biomarkers.length > 0) {
        setPolling(false);
      }
    } catch (err) {
      console.error('Error checking lab step one:', err);
    }
  };

  if (polling) {
    fetchData(); // run immediately first
    intervalId = setInterval(fetchData, 15000); // then every 15s
  }

  return () => {
    if (intervalId) clearInterval(intervalId); // cleanup
  };
}, [uploadedFile?.file_id, polling]); 
  useEffect(() => {
    subscribe('questionaryLength', (value: any) => {
      setQuestionaryLength(value.detail.questionaryLength);
    });
  }, []);

  const formatFileSize = (bytes: number): string => {
    const kb = bytes / 1024;
    return `${kb.toFixed(1)} KB`;
  };

  const handleDeleteFile = () => {
    setdeleteLoading(true)
    Application.deleteLapReport({ file_id: uploadedFile?.file_id , member_id: memberId}) // adjust if backend expects id
      .then(() => {
        setUploadedFile(null);
        setdeleteLoading(false)
      })
      .catch((err) => {
        console.error('Error deleting the file:', err);
      });
  };

  const sendToBackend = async (file: File, azureUrl: string) => {
    await Application.addLabReport(
      {
        member_id: memberId,
        report: {
          'file name': file.name,
          blob_url: azureUrl,
        },
      },
      (progressEvent: any) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        );
        const backendProgress = 50 + percentCompleted / 2;

        setUploadedFile((prev) =>
          prev
            ? { ...prev, progress: backendProgress, uploadedSize: progressEvent.loaded }
            : prev,
        );
      },
    )
      .then((res) => {
        setUploadedFile((prev) =>
          prev
            ? { ...prev, status: 'completed', file_id: res.data.file_id, azureUrl, warning: res.status == 206 }
            : prev,
        );
      })
      .catch((err) => {
        if (err == 'Network Error') {
          setUploadedFile((prev) =>
            prev ? { ...prev, status: 'completed' } : prev,
          );
        } else {
          setUploadedFile((prev) =>
            prev
              ? {
                  ...prev,
                  status: 'error',
                  errorMessage:
                    err?.response?.data?.message ||
                    err?.detail ||
                    'Failed to upload file. Please try again.',
                }
              : prev,
          );
        }
      });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const newFile: FileUpload = {
        file_id: '',
        file,
        progress: 0.5,
        status: 'uploading',
        uploadedSize: 0,
      };

      setUploadedFile(newFile);

      try {
        // Step 1: Upload to Azure
        const azureUrl = await uploadToAzure(file, (progress) => {
          const uploadedBytes = Math.floor((progress / 100) * file.size);
          setUploadedFile((prev) =>
            prev ? { ...prev, progress: progress / 2, uploadedSize: uploadedBytes } : prev,
          );
        });

        // Step 2: Send to backend
        await sendToBackend(file, azureUrl);
      } catch (error: any) {
        setUploadedFile((prev) =>
          prev
            ? {
                ...prev,
                status: 'error',
                errorMessage:
                  error?.response?.data?.message ||
                  error?.message ||
                  'Failed to upload file. Please try again.',
              }
            : prev,
        );
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
    {
      deleteLoading && (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-85 z-20">
          <Circleloader></Circleloader>
        </div>
      )
    }
      {step === 0 ? (
        <div className="w-full rounded-[16px] h-full md:h-[89vh] top-4 flex justify-center absolute left-0 text-Text-Primary">
          <div className="w-full h-full opacity-85 rounded-[12px] bg-Gray-50 backdrop-blur-md absolute"></div>
          <div
            style={{ height: window.innerHeight - 60 + 'px' }}
            className="z-10 relative px-2 flex flex-col items-center justify-center"
          >
            <div className="flex flex-col gap-6 w-full">
              <div className="flex items-center flex-col gap-4">
                <div className="text-base font-medium text-Text-Primary">
                  Provide Data to Generate Health Plan
                </div>
                <div className="text-xs text-Text-Primary text-center">
                  Choose one or both methods below to provide a personalized
                  plan.
                </div>
              </div>
              <div className="flex w-full items-center gap-6">
                <div
                  onClick={() => {
                    setstep(1);
                  }}
                  className="w-[477px] cursor-pointer h-[269px] rounded-2xl border p-6 flex flex-col items-center gap-[12px] relative bg-white shadow-100 border-Gray-50"
                >
                  <div className="text-[#000000] text-xs font-medium mt-3">
                    Upload Lab Report or Add Biomarkers
                  </div>
                  <img
                    className="mt-3"
                    src="/icons/document-upload-new.svg"
                    alt=""
                  />
                  <div className="text-xs mt-3">
                    Upload your client's lab test file and edit or add
                    biomarkers manually.
                  </div>
                  <div className="text-xs font-medium underline text-Primary-DeepTeal cursor-pointer absolute bottom-6">
                    Enter or Upload Biomarkers
                  </div>
                </div>
                <div
                  onClick={() => {
                    publish('QuestionaryTrackingCall', {});
                  }}
                  className="w-[477px] cursor-pointer h-[269px] rounded-2xl border p-6 flex flex-col items-center gap-[12px] relative bg-white shadow-100 border-Gray-50"
                >
                  <div className="text-[#000000] text-xs font-medium mt-3">
                    Fill Health Questionnaire
                  </div>
                  <img
                    className="mt-5"
                    src="/icons/task-square-new.svg"
                    alt=""
                  />
                  <div className="text-xs mt-3">
                    Provide data (lifestyle, medical history, ...) for a more
                    accurate plan.
                  </div>
                  <div className="text-xs font-medium underline text-Primary-DeepTeal cursor-pointer absolute bottom-6">
                    Fill Questionnaire
                  </div>
                </div>
              </div>
              <div className="w-full flex justify-center mt-4">
                <ButtonSecondary
                  style={{
                    width: '250px',
                    borderRadius: '20px',
                  }}
                  disabled={
                    showReport || questionaryLength ? false : uploadedFile?.status !== 'completed'
                  }
                  onClick={() => {
                    onGenderate();
                  }}
                >
                  <img src="/icons/tick-square.svg" alt="" />
                  Develop Health Plan
                </ButtonSecondary>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full rounded-[16px] h-full md:h-[89vh] top-4 flex justify-center absolute left-0 text-Text-Primary pr-[95px]">
          <div className="w-full h-full opacity-85 rounded-[12px] bg-Gray-50 backdrop-blur-md absolute"></div>
          <div
            style={{ height: window.innerHeight - 80 + 'px' }}
            className="bg-white p-6 rounded-md w-full h-fit z-10"
          >
            <div className="w-full flex items-center justify-between">
              <div className="flex gap-2 items-center text-xs text-Text-Primary font-medium">
                <div
                  onClick={() => setstep(0)}
                  className="cursor-pointer size-8 rounded-md p-1 bg-white border border-Gray-50 shadow-100 flex items-center justify-center"
                >
                  <img src="/icons/arrow-back.svg" alt="" />
                </div>
                Lab Data & Biomarkers
              </div>
              <ButtonPrimary
                style={{
                  width: '167px',
                }}
              >
                <img src="/icons/tick-square.svg" alt="" />
                Save Changes
              </ButtonPrimary>
            </div>
            <div className="flex w-full justify-center mt-6">
              <Toggle
                active={activeMenu}
                setActive={setactiveMenu}
                value={['Upload File', 'Add Biomarker']}
              ></Toggle>
            </div>
            {activeMenu === 'Upload File' ? (
              <div className="w-full flex flex-col mt-8 gap-2">
                <FileUploaderSection
                  isShare={isShare}
                  errorMessage={errorMessage}
                  handleFileChange={handleFileChange}
                  uploadedFile={uploadedFile}
                  handleDeleteFile={handleDeleteFile}
                  formatFileSize={formatFileSize}
                  fileInputRef={fileInputRef}
                />
                <BiomarkersSection uploadedFile={uploadedFile} biomarkers={extractedBiomarkers} onChange={(updated) => setExtractedBiomarkers(updated)} />
              </div>
            ) : (
              <AddBiomarker></AddBiomarker>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default UploadTestV2;
