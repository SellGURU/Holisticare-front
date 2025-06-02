// /* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState } from 'react';
// import Uploading from './uploading';
import { ButtonSecondary } from '../../Button/ButtosSecondary';
import Application from '../../../api/app';
import { publish } from '../../../utils/event';
import { uploadToAzure } from '../../../help';
// import FileBox from '../../ComboBar/components/FileBox';
import FileBoxUploading from './FileBoxUploading';

interface FileUpload {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  azureUrl?: string;
  uploadedSize?: number;
  errorMessage?: string;
}
interface UploadTestProps {
  memberId: any;
  onGenderate: () => void;
  isShare?: boolean;
}

const UploadTest: React.FC<UploadTestProps> = ({
  memberId,
  onGenderate,
  isShare,
}) => {
  const fileInputRef = useRef<any>(null);
  // const [files, setFiles] = useState<Array<any>>([]);
  // const [upLoadingFiles, setUploadingFiles] = useState<Array<any>>([]);
  const [errorMessage] = useState<string>('');

  const formatFileSize = (bytes: number): string => {
    const kb = bytes / 1024;
    return `${kb.toFixed(1)} KB`;
  };
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([]);
  const handleDeleteFile = (fileToDelete: any) => {
    console.log(fileToDelete);

    Application.deleteLapReport({ file_id: fileToDelete.id })
      .then(() => {
        // setFiles(files.filter((file) => file !== fileToDelete));
      })
      .catch((err) => {
        console.error('Error deleting the file:', err);
      });
  };
  // const handleCancelUpload = (fileToCancel: any) => {
  //   setUploadingFiles(upLoadingFiles.filter((file) => file !== fileToCancel));
  // };

  // const handleSuccessUpload = useCallback((fileWithId: any, el: any) => {
  //   setFiles((prevFiles) => [...prevFiles, fileWithId]);
  //   // Commented code left as-is
  //   setUploadingFiles((prevUploadingFiles) =>
  //     prevUploadingFiles.filter((file) => file !== el),
  //   );
  // }, []);

  // const validateFile = (file: File) => {
  //   // Check file format based on extension
  //   const validFormats = ['.pdf', '.docx'];
  //   const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  //   if (!validFormats.includes(fileExtension)) {
  //     return `${file.name} has an invalid format. Supported formats: PDF and DOCX files`;
  //   }

  //   // Check for duplicate filename
  //   const isDuplicate = [...files, ...upLoadingFiles].some(
  //     (existingFile) => existingFile.name === file.name,
  //   );
  //   if (isDuplicate) {
  //     return `${file.name} already exists. Please rename the file or choose another one`;
  //   }

  //   return null; // No error
  // };
  const sendToBackend = async (file: File, azureUrl: string) => {
    try {
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
                : f,
            ),
          );
        },
      );

      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.file === file ? { ...f, status: 'completed', azureUrl } : f,
        ),
      );
    } catch (error: any) {
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.file === file
            ? {
                ...f,
                status: 'error',
                errorMessage:
                  error?.response?.data?.message ||
                  error?.detail ||
                  'Failed to upload file to backend. Please try again.',
              }
            : f,
        ),
      );
    }
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
              (progress / 100) * fileUpload.file.size,
            );
            setUploadedFiles((prev) =>
              prev.map((f) =>
                f.file === fileUpload.file
                  ? {
                      ...f,
                      progress: progress / 2,
                      uploadedSize: uploadedBytes,
                    }
                  : f,
              ),
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
                : f,
            ),
          );
        }
      }
    }
    fileInputRef.current.value = '';
  };
  return (
    <>
      <div className=" w-full  rounded-[16px] h-full md:h-[89vh] top-4 flex justify-center  absolute left-0">
        <div className="w-full h-full opacity-85 rounded-[12px] bg-Gray-50 backdrop-blur-md absolute"></div>
        <div
          style={{ height: window.innerHeight - 60 + 'px' }}
          className=" w-[260px] h-fit overflow-auto  xs:w-[344px] md:w-[530px] relative z-10 px-2"
        >
          <div className="w-full flex justify-center text-Text-Primary font-medium mt-5 md:mt-14">
            No Data Available Yet!
          </div>
          <div className={isShare ? 'opacity-20' : ''}>
            <div className=" text-[10px] xs:text-[12px] text-Text-Primary  text-center mt-1 ">
              It looks like you haven't uploaded any test results or completed
              any questionary yet. To view detailed insights, please upload your
              test results or complete the questionnaires now.
            </div>

            <div
              onClick={() => {
                if (!isShare) {
                  document.getElementById('uploadFile')?.click();
                }
              }}
              className="w-full shadow-100  mt-4 h-[182px] bg-white rounded-[12px] border border-Gray-50"
            >
              <div className="w-full flex justify-center mt-6">
                <img src="/icons/upload-test.svg" alt="" />
              </div>
              <div className="text-[12px] text-Text-Primary text-center mt-3">
                Drag and drop your test file here or click to upload.
              </div>
              <div className="text-Text-Secondary text-[12px] text-center mt-2 w-[220px] xs:w-[300px] md:w-[500px]">
                {`Supported formats: PDF and DOCX files.`}
              </div>
              {errorMessage && (
                <div className="text-red-500 text-[12px] text-center mt-1 w-[220px] xs:w-[300px] md:w-[500px]">
                  {errorMessage}
                </div>
              )}
              <div className="w-full mt-3 flex justify-center">
                <div className="text-Primary-DeepTeal cursor-pointer text-[12px] underline">
                  Upload Test Results
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf, .docx"
                multiple
                onChange={handleFileChange}
                id="uploadFile"
                className="w-full absolute invisible h-full left-0 top-0"
              />
            </div>

            <div className='className="mt-1 grid grid-cols-1 max-h-[200px] gap-2 py-2 px-2 overflow-y-auto'>
              {uploadedFiles.map((fileUpload, index) => (
                <div key={index}>
                  <FileBoxUploading
                    onDelete={() => {
                      setUploadedFiles((prev) =>
                        prev.filter((f) => f.file !== fileUpload.file),
                      );
                      handleDeleteFile(
                        uploadedFiles.filter((f) => f.file == fileUpload.file),
                      );
                    }}
                    el={{
                      ...fileUpload,
                      uploadedSize: fileUpload.uploadedSize || 0,
                      totalSize: fileUpload?.file?.size,
                      progress: fileUpload.progress || 0.5,
                      formattedSize: `${formatFileSize(fileUpload.uploadedSize || 0)} / ${formatFileSize(fileUpload?.file?.size || 1)}`,
                    }}
                  />
                </div>
              ))}
            </div>
            {/* <div className="mt-1 grid grid-cols-1 max-h-[200px] gap-2 py-2 px-2 overflow-y-auto">
              {files.map((el: any) => {
                return (
                  <>
                    <div className="w-full flex justify-between items-center px-4 py-2 h-[52px] bg-white shadow-200 rounded-[16px] ">
                      <div className="flex justify-start gap-2">
                        <img
                          className="object-contain"
                          src="/images/Pdf.png"
                          alt=""
                        />
                        <div>
                          <div className=" text-[10px] md:text-[12px] text-Text-Primary font-[600]">
                            {el.name}
                          </div>
                          <div className=" text-[10px] md:text-[12px] text-Text-Secondary">
                            {(el.size / 1024).toFixed(2)} KB
                          </div>
                        </div>
                      </div>
                      <img
                        onClick={() => handleDeleteFile(el)}
                        className="w-6 h-6 cursor-pointer"
                        src="/icons/delete.svg"
                        alt=""
                      />
                    </div>
                  </>
                );
              })}
              {upLoadingFiles.map((el: any) => {
                return (
                  <div key={el.name + el.size + el.lastModified}>
                    <Uploading
                      memberId={memberId}
                      file={el}
                      onSuccess={(fileWithId) =>
                        handleSuccessUpload(fileWithId, el)
                      }
                      onCancel={() => handleCancelUpload(el)}
                    ></Uploading>
                  </div>
                );
              })}
            </div> */}

            <div className="flex justify-center items-center w-full">
              <div className="h-[1px] bg-Text-Triarty w-[180px] relative"></div>
              <div className=" text-Text-Primary text-[10px] ">
                <div className=" px-3">Additionally</div>
              </div>
              <div className="h-[1px] bg-Text-Triarty w-[180px] relative"></div>
            </div>
            <div className="w-full mt-6 flex justify-center">
              <div
                onClick={() => {
                  publish('QuestionaryTrackingCall', {});
                }}
                className="text-Primary-DeepTeal cursor-pointer text-[12px] underline"
              >
                Complete Questionnaire
              </div>
            </div>

            <div className="flex justify-center mt-5">
              <ButtonSecondary
                disabled={
                  uploadedFiles.filter((el) => el.status == 'completed')
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
    </>
  );
};

export default UploadTest;
