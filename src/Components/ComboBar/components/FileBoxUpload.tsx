import { useParams } from 'react-router-dom';
import Application from '../../../api/app';
import { useEffect, useRef, useState } from 'react';
import AzureBlobService from '../../../services/azureBlobService';
import {
  AZURE_STORAGE_CONNECTION_STRING,
  AZURE_STORAGE_CONTAINER_NAME,
} from '../../../config/azure';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface FileBoxUploadProps {
  file: any;
  onSuccess: (file: any) => void;
  onCancel: (file: any) => void;
  isFileExists?: boolean;
}

const FileBoxUpload: React.FC<FileBoxUploadProps> = ({
  file,
  onSuccess,
  onCancel,
  isFileExists = false,
}) => {
  const { id } = useParams<{ id: string }>();
  const [isCompleted, setIsCompleted] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const controller = useRef<AbortController | null>(null);
  const startTime = useRef<number>(Date.now());
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  };

  useEffect(() => {
    if (progress > 0 && progress < 100) {
      const elapsedTime = (Date.now() - startTime.current) / 1000; // in seconds
      const estimatedTotalTime = elapsedTime / (progress / 100);
      const remainingTime = Math.max(
        0,
        Math.round(estimatedTotalTime - elapsedTime),
      );

      if (remainingTime < 60) {
        setTimeRemaining(`${remainingTime} seconds remaining`);
      } else {
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        setTimeRemaining(`${minutes}m ${seconds}s remaining`);
      }
    } else if (progress === 100) {
      setTimeRemaining('Completed');
    }
  }, [progress]);

  useEffect(() => {
    // If file exists, mark as completed immediately
    if (isFileExists) {
      setIsCompleted(true);
      return;
    }

    controller.current = new AbortController();
    let isCancelled = false;

    const uploadToAzure = async () => {
      try {
        AzureBlobService.initialize(
          AZURE_STORAGE_CONNECTION_STRING,
          AZURE_STORAGE_CONTAINER_NAME,
        );

        const blobUrl = await AzureBlobService.uploadFile(file, (progress) => {
          if (isCancelled) return;
          setProgress(progress);
        });

        if (isCancelled) return;

        const response = await Application.addLabReport(
          {
            member_id: id,
            report: {
              'file name': file.name,
              blob_url: blobUrl,
            },
          },
          (progressEvent: any) => {
            if (isCancelled) return;
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            setProgress(percentCompleted);
          },
          controller.current?.signal,
        );

        if (isCancelled) return;

        const fileWithId = {
          file_id: response.data,
          file_name: file.name,
          date_uploaded: new Date().toString(),
          blob_url: blobUrl,
          isUploded: true,
        };

        onSuccess(fileWithId);
        setIsCompleted(true);
      } catch (error: any) {
        if (error.name === 'CanceledError' || error.name === 'AbortError') {
          // console.warn('آپلود لغو شد.');
        } else {
          console.error('Upload error:', error);
          setIsFailed(true);
          // Show the API error message if available
          if (error?.detail) {
            setErrorMessage(error?.detail);
          } else {
            setErrorMessage('Failed to upload file. Please try again.');
          }
        }
        if (!isCancelled) setIsCompleted(true);
      }
    };

    uploadToAzure();

    return () => {
      isCancelled = true;
      controller.current?.abort();
    };
  }, [file, id, isFileExists]);

  const handleCancelUpload = () => {
    controller.current?.abort();
    onCancel(file);
  };

  return (
    <>
      <div
        className={`${isFailed || isFileExists ? 'border-red-500' : 'border-Gray-50'} bg-white border  mb-1 p-1 md:p-3 min-h-[48px] w-full rounded-[12px]  text-Text-Primary text-[10px]`}
      >
        <div className="flex justify-between items-center w-full">
          <div className="text-[10px] w-[75px] text-Text-Primary select-none  overflow-hidden whitespace-nowrap text-ellipsis">
            {file.name}
          </div>
          {!isFileExists && (
            <div className="w-[70px] text-center">
              {formatDate(new Date().toString())}
            </div>
          )}
          <div className="flex w-[55px] justify-center gap-1">
            {!isCompleted ? (
              <img
                src="/icons/add-green.svg"
                alt=""
                className="w-5 h-5 cursor-pointer"
                onClick={handleCancelUpload}
              />
            ) : isFailed ? (
              <></>
            ) : isFileExists ? (
              <img
                src="/icons/add-green.svg"
                alt=""
                className="w-5 h-5 cursor-pointer"
                onClick={handleCancelUpload}
              />
            ) : (
              <img
                onClick={() => {
                  Application.downloadFille({
                    file_id: file.id || file.file_id,
                    member_id: id,
                  })
                    .then((res) => {
                      try {
                        const blobUrl = res.data;
                        const link = document.createElement('a');
                        link.href = blobUrl;
                        link.download = file.name;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      } catch (error: any) {
                        console.error('Error downloading file:', error);
                        console.error('Error details:', {
                          errorName: error?.name,
                          errorMessage: error?.message,
                          errorStack: error?.stack,
                        });
                      }
                    })
                    .catch((error: any) => {
                      console.error('Error downloading file:', error);
                      console.error('Error details:', {
                        errorName: error?.name,
                        errorMessage: error?.message,
                        errorStack: error?.stack,
                      });
                    });
                }}
                className="cursor-pointer size-5 -mt-[3px]"
                src="/icons/import.svg"
                alt=""
              />
            )}
          </div>
        </div>
        {isFailed && !isFileExists && (
          <div className="text-red-500 text-[10px] mt-1">{errorMessage}</div>
        )}

        {!isCompleted && !isFileExists && (
          <>
            <div className="w-full flex justify-between">
              <div>
                <div className="text-Text-Secondary  text-[10px] md:text-[10px] mt-1">
                  {progress}% • {timeRemaining}
                </div>
              </div>
            </div>
            <div className="w-full h-[8px] rounded-[12px] bg-gray-200 mt-1 flex justify-start items-center">
              <div
                className="bg-Primary-DeepTeal h-[5px] rounded-[12px]"
                style={{ width: progress + '%' }}
              ></div>
            </div>
          </>
        )}
      </div>
      {isFileExists && (
        <div className="text-red-500 mb-2 text-[10px] mt-1">
          This file has already been uploaded.
        </div>
      )}
    </>
  );
};

export default FileBoxUpload;
