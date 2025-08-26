/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Application from '../../../api/app';
import { uploadToAzure } from '../../../help';
import { publish, subscribe } from '../../../utils/event';
import Circleloader from '../../CircleLoader';
import FileBox from './FileBox';

interface FileUpload {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  azureUrl?: string;
  uploadedSize?: number;
  errorMessage?: string;
  file_id: string;
  warning?: boolean;
}

const formatFileSize = (bytes: number): string => {
  const kb = bytes / 1024;
  return `${kb.toFixed(1)} KB`;
};

const FileHistoryNew: FC<{ handleCloseSlideOutPanel: () => void }> = ({
  handleCloseSlideOutPanel,
}) => {
  const fileInputRef = useRef<any>(null);
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([]);
  const { id } = useParams<{ id: string }>();
  const [containerMaxHeight, setContainerMaxHeight] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const calculateHeight = () => {
      const topSpacing = 80;
      const addFileButtonHeight = 32;
      const gapBetweenItems = 12;
      const tableHeaderHeight = 48;
      const bottomSpacing = 55;

      const offset =
        topSpacing +
        addFileButtonHeight +
        gapBetweenItems +
        tableHeaderHeight +
        bottomSpacing;

      const height = window.innerHeight - offset;
      setContainerMaxHeight(height);
    };

    calculateHeight();

    window.addEventListener('resize', calculateHeight);
    return () => {
      window.removeEventListener('resize', calculateHeight);
    };
  }, []);
  useEffect(() => {
    if (
      uploadedFiles.filter(
        (el: any) => el.status == 'uploading' || el.status == 'error',
      ).length > 0
    ) {
      publish('fileIsUploading', {
        isUploading: true,
        files: uploadedFiles.filter(
          (el: any) => el.status == 'uploading' || el.status == 'error',
        ),
      });
    } else {
      publish('fileIsUploading', { isUploading: false });
    }
  }, [uploadedFiles]);
  // const uploadToAzure = async (file: File): Promise<string> => {
  //   try {
  //     AzureBlobService.initialize(
  //       AZURE_STORAGE_CONNECTION_STRING,
  //       AZURE_STORAGE_CONTAINER_NAME,
  //     );
  //     const blobUrl = await AzureBlobService.uploadFile(
  //       file,
  //       (progress: number) => {
  //         // Calculate uploaded size based on progress (0-50%)
  //         const uploadedBytes = Math.floor((progress / 100) * file.size);
  //         setUploadedFiles((prev) =>
  //           prev.map((f) =>
  //             f.file === file
  //               ? { ...f, progress: progress / 2, uploadedSize: uploadedBytes }
  //               : f,
  //           ),
  //         );
  //       },
  //     );
  //     return blobUrl;
  //   } catch {
  //     throw new Error('Azure upload failed');
  //   }
  // };

  const sendToBackend = async (file: File, azureUrl: string) => {
    await Application.addLabReport(
      {
        member_id: id,
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
              : f,
          ),
        );
      })
      .catch((err) => {
        let errorMessage = 'Failed to upload file. Please try again.';

        if (err?.detail?.includes('already exists')) {
          errorMessage = 'This file has already been uploaded.';
        }

        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.file === file
              ? {
                  ...f,
                  status: 'error',
                  errorMessage,
                }
              : f,
          ),
        );
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
        file_id: '',
      }));

      // Validate file formats before uploading
      const validFiles = newFiles.filter((fileUpload) => {
        const fileExtension = fileUpload.file.name
          .split('.')
          .pop()
          ?.toLowerCase();
        const allowedExtensions = ['pdf', 'xls', 'xlsx'];

        if (!allowedExtensions.includes(fileExtension || '')) {
          setUploadedFiles((prev) => [
            ...prev,
            {
              ...fileUpload,
              status: 'error',
              errorMessage: 'File has an unsupported format.',
              file_id: fileUpload.file.name,
            },
          ]);
          return false;
        }
        return true;
      });

      setUploadedFiles((prev) => [...validFiles, ...prev]);

      // Process each file
      for (const fileUpload of validFiles) {
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

  const getFileList = (id: string) => {
    setIsLoading(true);
    Application.getFilleList({ member_id: id })
      .then((res) => {
        if (res.data) {
          setUploadedFiles(res.data);
        } else {
          throw new Error('Unexpected data format');
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  useEffect(() => {
    if (id) {
      getFileList(id);
    }
  }, [id]);

  subscribe('syncReport', () => {
    Application.getFilleList({ member_id: id }).then((res) => {
      setUploadedFiles(res.data);
    });
  });

  const handleFileDeleteSuccess = () => {
    getFileList(id || '');
  };

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-85 z-20">
          <Circleloader></Circleloader>
        </div>
      )}
      <div className="w-full">
        <div
          onClick={() => {
            // fileInputRef.current?.click();
            publish('uploadTestShow', {
              isShow: true,
            });
            handleCloseSlideOutPanel();
          }}
          className="mb-3 text-[14px] flex cursor-pointer justify-center items-center gap-1 bg-white border-Primary-DeepTeal border rounded-[20px] border-dashed px-8 h-8 w-full text-Primary-DeepTeal"
        >
          <img className="w-5 h-5" src="/icons/add-blue.svg" alt="" />
          Add File or Biomarker
        </div>
        <input
          type="file"
          ref={fileInputRef}
          accept=".pdf, .xls, .xlsx"
          multiple
          onChange={handleFileChange}
          id="uploadFileBoxes"
          className="w-full absolute invisible h-full left-0 top-0"
        />
        <div className="w-full text-[12px] px-2 xs:px-3 md:px-5 py-3 h-[48px] border border-Gray-50 bg-backgroundColor-Main text-Primary-DeepTeal font-medium  flex justify-between items-center rounded-[12px]">
          <div className="w-[70px] text-center text-nowrap">File Name</div>
          <div className="w-[80px]  text-nowrap">Upload Date</div>
          <div>Action</div>
        </div>
        {/* File Upload Progress List */}
        <div
          className="flex justify-center w-full items-start overflow-auto"
          style={{ maxHeight: containerMaxHeight }}
        >
          <div className="mt-[2px] w-full space-y-[2px] ">
            {uploadedFiles.map((fileUpload, index) => (
              <div key={index}>
                <FileBox
                  onDelete={() => {
                    setUploadedFiles((prev) =>
                      prev.filter((f) => f.file !== fileUpload.file),
                    );
                  }}
                  el={{
                    ...fileUpload,
                    uploadedSize: fileUpload.uploadedSize || 0,
                    totalSize: fileUpload?.file?.size,
                    progress: fileUpload.progress || 0.5,
                    formattedSize: `${formatFileSize(fileUpload.uploadedSize || 0)} / ${formatFileSize(fileUpload?.file?.size || 1)}`,
                  }}
                  onDeleteSuccess={() => handleFileDeleteSuccess()}


                />
              </div>
            ))}
            {uploadedFiles.length === 0 && (
              <div className="flex flex-col items-center justify-center mt-10">
                <img src="/icons/document-text-rectangle.svg" alt="" />
                <div className="text-xs text-Text-Primary font-medium -mt-4">
                  No data found.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FileHistoryNew;
