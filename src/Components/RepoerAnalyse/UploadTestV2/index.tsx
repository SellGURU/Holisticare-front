
import React, { useRef, useState, useEffect } from 'react';
import { ButtonSecondary } from '../../Button/ButtosSecondary';
import { ButtonPrimary } from '../../Button/ButtonPrimary';
import Toggle from '../../Toggle';
import Application from '../../../api/app';
import { uploadToAzure } from '../../../help';
import { publish, subscribe } from '../../../utils/event';
import FileBoxUploadingV2 from '../UploadTest/FileBoxUploadingV2';

interface FileUpload {
  file: File;
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
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([]);
  const [errorMessage] = useState<string>('');
  const [questionaryLength, setQuestionaryLength] = useState(false);

  useEffect(() => {
    subscribe('questionaryLength', (value: any) => {
      setQuestionaryLength(value.detail.questionaryLength);
    });
  }, []);

  const formatFileSize = (bytes: number): string => {
    const kb = bytes / 1024;
    return `${kb.toFixed(1)} KB`;
  };

  const handleDeleteFile = (fileToDelete: any) => {
    Application.deleteLapReport({ file_id: fileToDelete.id })
      .then(() => {
        // You might want to update the state here as well if you have a list of successfully uploaded files
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
          (progressEvent.loaded * 100) / progressEvent.total
        );
        // Calculate progress from 50-100%
        const backendProgress = 50 + percentCompleted / 2;
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.file === file
              ? {
                  ...f,
                  progress: backendProgress,
                  uploadedSize: progressEvent.loaded,
                }
              : f
          )
        );
      }
    )
      .then((res) => {
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.file === file
              ? {
                  ...f,
                  status: 'completed',
                  azureUrl,
                  warning: res.status == 206,
                }
              : f
          )
        );
      })
      .catch((err) => {
        if (err == 'Network Error') {
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.file === file
                ? {
                    ...f,
                    status: 'completed',
                    // errorMessage: 'File already exists.',
                  }
                : f
            )
          );
        } else {
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.file === file
                ? {
                    ...f,
                    status: 'error',
                    errorMessage:
                      err?.response?.data?.message ||
                      err?.detail ||
                      'Failed to upload file. Please try again.',
                  }
                : f
            )
          );
        }
      });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files).map((file) => ({
        file,
        progress: 0.5,
        status: 'uploading' as const,
        uploadedSize: 0,
      }));
      setUploadedFiles((prev) => [...newFiles, ...prev]);

      // Process each file
      for (const fileUpload of newFiles) {
        try {
          // Step 1: Upload to Azure
          const azureUrl = await uploadToAzure(fileUpload.file, (progress) => {
            const uploadedBytes = Math.floor(
              (progress / 100) * fileUpload.file.size
            );
            setUploadedFiles((prev) =>
              prev.map((f) =>
                f.file === fileUpload.file
                  ? {
                      ...f,
                      progress: progress / 2,
                      uploadedSize: uploadedBytes,
                    }
                  : f
              )
            );
          });

          // Step 2: Send to backend
          await sendToBackend(fileUpload.file, azureUrl);
        } catch (error: any) {
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.file === fileUpload.file
                ? {
                    ...f,
                    status: 'error',
                    errorMessage:
                      error?.response?.data?.message ||
                      error?.message ||
                      'Failed to upload file. Please try again.',
                  }
                : f
            )
          );
        }
      }
    }
    fileInputRef.current.value = '';
  };

  return (
    <>
      {step == 0 ? (
        <div className="w-full rounded-[16px] h-full md:h-[89vh] top-4 flex justify-center absolute left-0 text-Text-Primary">
          <div className="w-full h-full opacity-85 rounded-[12px] bg-Gray-50 backdrop-blur-md absolute"></div>
          <div
            style={{ height: window.innerHeight - 60 + 'px' }}
            className="z-10 relative px-2 flex flex-col items-center justify-center"
          >
            <div className="flex flex-col gap-6 w-full">
              <div className="flex items-center flex-col gap-4">
                <div className="text-base font-medium text-Text-Primary ">
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
                    showReport || questionaryLength
                      ? false
                      : uploadedFiles.filter((el) => el.status == 'completed')
                          .length == 0
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
            {activeMenu == 'Upload File' ? (
              <div className="w-full flex flex-col mt-8 gap-2">
                <div className="flex w-full justify-between rounded-2xl border p-4 bg-white shadow-200 border-Gray-50 gap-2">
                  <div className="text-sm w-[50%] font-medium text-Text-Primary">
                    File Uploader
                    <div
                      onClick={() => {
                        if (!isShare) {
                          document.getElementById('uploadFile')?.click();
                        }
                      }}
                      className="mt-1 rounded-2xl h-[130px] w-full
                        py-4 px-6 bg-white border shadow-100 border-Gray-50 flex flex-col items-center justify-center "
                    >
                      <div className="w-full flex justify-center">
                        <img src="/icons/upload-test.svg" alt="" />
                      </div>
                      <div className="text-[12px] text-Text-Primary text-center mt-3">
                        Drag and drop your test file here or click to upload.
                      </div>
                      <div className="text-[#888888] font-medium text-[12px] text-center">
                        {`Accepted formats: .pdf, .docx.`}
                      </div>
                      {errorMessage && (
                        <div className="text-red-500 text-[12px] text-center mt-1 w-[220px] xs:w-[300px] md:w-[500px]">
                          {errorMessage}
                        </div>
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept=".pdf, .docx"
                        // multiple
                        onChange={handleFileChange}
                        id="uploadFile"
                        className="w-full absolute invisible h-full left-0 top-0"
                      />
                    </div>
                  </div>
                  <div className="text-sm w-[50%] font-medium text-Text-Primary">
                    Uploaded Files
                    <div
                      className="mt-1 rounded-2xl h-[130px]
                        bg-white flex flex-col overflow-y-auto"
                    >
                      {uploadedFiles.length === 0 ? (
                        <div className="w-full flex flex-col items-center justify-center h-full">
                          <img src="/icons/EmptyState-upload.svg" alt="" />
                          <div className="text-xs font-medium text-Text-Primary -mt-8">
                            No file uploaded yet.
                          </div>
                        </div>
                      ) : (
                        <div className=" grid grid-cols-1 mt-[2px]  gap-2 overflow-y-auto">
                          {uploadedFiles.map((fileUpload, index) => (
                            <div key={index}>
                              <FileBoxUploadingV2
                             
                                onDelete={() => {
                                  setUploadedFiles((prev) =>
                                    prev.filter((f) => f.file !== fileUpload.file)
                                  );
                                  handleDeleteFile(fileUpload);
                                }}
                                el={{
                                  ...fileUpload,
                                  uploadedSize: fileUpload.uploadedSize || 0,
                                  totalSize: fileUpload?.file?.size,
                                  progress: fileUpload.progress || 0.5,
                                  formattedSize: `${formatFileSize(
                                    fileUpload.uploadedSize || 0
                                  )} / ${formatFileSize(
                                    fileUpload?.file?.size || 1
                                  )}`,
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="w-full min-h-[290px] rounded-2xl border border-Gray-50 p-4 shadow-300 text-sm font-medium text-Text-Primary">
                  List of Biomarkers
                  <div className=" flex items-center pt-8 justify-center flex-col text-xs font-medium text-Text-Primary">
                    <img src="/icons/EmptyState-biomarkers.svg" alt="" />
                    <div className="-mt-5">No data provided yet.</div>
                  </div>
                </div>
              </div>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default UploadTestV2;