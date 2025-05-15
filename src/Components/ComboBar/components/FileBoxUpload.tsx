import { useParams } from 'react-router-dom';
import Application from '../../../api/app';
import { useEffect, useState } from 'react';
import AzureBlobService from '../../../services/azureBlobService';
import {
  AZURE_STORAGE_CONNECTION_STRING,
  AZURE_STORAGE_CONTAINER_NAME,
} from '../../../config/azure';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface FileBoxUploadProps {
  file: any;
  onSuccess: (file: any) => void;
}

const FileBoxUpload: React.FC<FileBoxUploadProps> = ({ file, onSuccess }) => {
  const { id } = useParams<{ id: string }>();
  const [isCompleted, setIsCompleted] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [progress, setProgress] = useState(0);

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
    let isCancelled = false;

    const uploadToAzure = async () => {
      try {
        // Initialize Azure Blob Service
        AzureBlobService.initialize(
          AZURE_STORAGE_CONNECTION_STRING,
          AZURE_STORAGE_CONTAINER_NAME,
        );

        // Upload to Azure Blob Storage
        const blobUrl = await AzureBlobService.uploadFile(file, (progress) => {
          if (isCancelled) return;
          setProgress(progress);
        });

        if (isCancelled) return;

        // Send the blob URL to backend
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
        );

        if (isCancelled) return;

        const fileWithId = {
          file_id: response.data,
          file_name: file.name,
          date_uploaded: new Date().toString(),
          blob_url: blobUrl,
        };

        onSuccess(fileWithId);
        setIsCompleted(true);
      } catch (error) {
        console.error('Upload error:', error);
        if (isCancelled) return;
        setIsFailed(true);
        setIsCompleted(true);
      }
    };

    uploadToAzure();

    return () => {
      isCancelled = true;
    };
  }, [file, id]);

  return (
    <>
      <div
        className={`${isFailed ? 'border-red-500' : 'border-Gray-50'} bg-white border  mb-1 p-1 md:p-3 min-h-[48px] w-full rounded-[12px]  text-Text-Primary text-[10px]`}
      >
        <div className="flex justify-between items-center w-full">
          <div className="text-[10px] w-[75px] text-Text-Primary select-none  overflow-hidden whitespace-nowrap text-ellipsis">
            {file.name}
          </div>
          <div className="w-[70px] text-center">
            {formatDate(new Date().toString())}
          </div>
          <div className="flex w-[55px] justify-center gap-1">
            <img
              onClick={() => {
                Application.downloadFille({
                  file_id: file.id || file.file_id,
                  member_id: id,
                })
                  .then((res) => {
                    try {
                      const blobUrl = res.data;

                      // Create a direct download link for the blob URL
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
                      // You might want to show an error message to the user here
                    }
                  })
                  .catch((error: any) => {
                    console.error('Error downloading file:', error);
                    console.error('Error details:', {
                      errorName: error?.name,
                      errorMessage: error?.message,
                      errorStack: error?.stack,
                    });
                    // You might want to show an error message to the user here
                  });
              }}
              className="cursor-pointer size-5 -mt-[3px]"
              src="/icons/import.svg"
              alt=""
            />
          </div>
        </div>
        {!isCompleted && (
          <>
            <div className="w-full flex justify-between">
              <div>
                <div className="text-Text-Secondary  text-[10px] md:text-[10px] mt-1">
                  {progress}% • 30 seconds remaining
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
    </>
  );
};

export default FileBoxUpload;
