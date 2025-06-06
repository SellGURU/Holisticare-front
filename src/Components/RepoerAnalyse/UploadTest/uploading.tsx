import { useEffect, useState } from 'react';
import Application from '../../../api/app';
import AzureBlobService from '../../../services/azureBlobService';
import {
  AZURE_STORAGE_CONNECTION_STRING,
  AZURE_STORAGE_CONTAINER_NAME,
} from '../../../config/azure';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface UploadingProps {
  file: any;
  memberId: string;
  onSuccess: (file: any) => void;
  onCancel: () => void;
}

const Uploading: React.FC<UploadingProps> = ({
  file,
  memberId,
  onSuccess,
  onCancel,
}) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadStartTime] = useState(Date.now());
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [currentPhase, setCurrentPhase] = useState<'azure' | 'backend'>(
    'azure',
  );
  const [lastProgressUpdate] = useState(Date.now());
  const [lastProgress] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    const uploadToAzure = async () => {
      try {
        // Initialize Azure Blob Service
        console.log('Initializing Azure Blob Service...');
        AzureBlobService.initialize(
          AZURE_STORAGE_CONNECTION_STRING,
          AZURE_STORAGE_CONTAINER_NAME,
        );
        console.log('Azure Blob Service initialized successfully');

        // Upload to Azure Blob Storage
        console.log('Starting file upload to Azure...');
        setCurrentPhase('azure');
        const blobUrl = await AzureBlobService.uploadFile(file, (progress) => {
          if (isCancelled) return;
          // Scale Azure progress to 0-50%
          setProgress(Math.floor(progress * 0.5));
        });

        if (isCancelled) return;

        console.log(
          'File uploaded to Azure successfully, sending to backend...',
        );
        // Send the blob URL to backend
        setCurrentPhase('backend');
        const response = await Application.addLabReport(
          {
            member_id: memberId,
            report: {
              'file name': file.name,
              blob_url: blobUrl,
            },
          },
          (progressEvent: any) => {
            if (isCancelled) return;
            // Scale backend progress to 50-100%
            const percentCompleted = Math.floor(
              (progressEvent.loaded / progressEvent.total) * 50 + 50,
            );
            setProgress(percentCompleted);
          },
        );

        if (isCancelled) return;

        const fileWithId = {
          ...file,
          id: response.data,
          name: file.name,
          type: file.type,
          size: file.size,
          blobUrl: blobUrl,
        };

        onSuccess(fileWithId);
        setIsCompleted(true);
      } catch (error) {
        console.error('Upload error:', error);
        if (isCancelled) return;
        setError(error instanceof Error ? error.message : 'Upload failed');
        setIsFailed(true);
        setIsCompleted(true);
      }
    };

    uploadToAzure();

    return () => {
      isCancelled = true;
    };
  }, [file, memberId]);

  useEffect(() => {
    // Calculate remaining time based on progress
    if (progress > 0 && progress < 100) {
      const progressDiff = progress - lastProgress;
      const timeDiff = (Date.now() - lastProgressUpdate) / 1000;

      // Only calculate if we have meaningful progress
      if (progressDiff > 0 && timeDiff > 0) {
        const progressPerSecond = progressDiff / timeDiff;
        const remainingProgress = 100 - progress;
        const estimatedRemainingSeconds = Math.ceil(
          remainingProgress / progressPerSecond,
        );

        // Ensure minimum remaining time of 2 seconds
        setRemainingSeconds(Math.max(2, estimatedRemainingSeconds));
      }
    }
  }, [progress, uploadStartTime, lastProgress, lastProgressUpdate]);

  const handleDeleteFile = async (fileToDelete: any) => {
    try {
      if (fileToDelete.id) {
        // Delete from backend
        await Application.deleteLapReport({ file_id: fileToDelete.id });

        // Delete from Azure Blob Storage if blobUrl exists
        if (fileToDelete.blobUrl) {
          const blobName = fileToDelete.blobUrl.split('/').pop();
          await AzureBlobService.deleteFile(blobName);
        }

        onCancel();
      } else {
        onCancel();
      }
    } catch (err) {
      console.error('Error deleting the file:', err);
    }
  };

  return (
    <>
      {isCompleted ? (
        <>
          <div
            className={`w-full px-4 py-2 h-[52px] bg-white shadow-200 rounded-[16px] ${isFailed && 'border border-red-500'} flex justify-between items-center`}
          >
            <div className="flex justify-start gap-2">
              <img className="object-contain" src="/images/Pdf.png" alt="" />
              <div>
                <div className=" text-[10px] md:text-[12px] text-Text-Primary font-[600]">
                  {file.name}
                </div>
                <div className=" text-[10px] md:text-[12px] text-Text-Secondary">
                  {(file.size / 1024).toFixed(2)} KB
                </div>
              </div>
            </div>
            <img
              onClick={() => handleDeleteFile(file)}
              className="cursor-pointer w-6 h-6"
              src="/icons/delete.svg"
              alt=""
            />
          </div>
          {error && (
            <div className="text-[10px] text-red-500 mt-1 ml-4">{error}</div>
          )}
        </>
      ) : (
        <div
          className="w-full relative px-4 py-2 h-[68px] bg-white shadow-200 rounded-[16px]"
          style={{}}
        >
          <div className="w-full flex justify-between">
            <div>
              <div className=" text-[10px] md:text-[12px] text-Text-Primary font-[600]">
                {currentPhase === 'azure'
                  ? 'Uploading to cloud...'
                  : 'Processing...'}
              </div>
              <div className="text-Text-Secondary  text-[10px] md:text-[12px] mt-1">
                {progress}% •{' '}
                {remainingSeconds > 0
                  ? `${remainingSeconds} seconds remaining`
                  : 'Calculating...'}
              </div>
            </div>

            <img
              onClick={onCancel}
              className="cursor-pointer"
              src="/icons/close.svg"
              alt=""
            />
          </div>
          <div className="w-full h-[8px] rounded-[12px] bg-gray-200 mt-1 flex justify-start items-center">
            <div
              className="bg-Primary-DeepTeal h-[5px] rounded-[12px]"
              style={{ width: progress + '%' }}
            ></div>
          </div>
        </div>
      )}
    </>
  );
};

export default Uploading;
