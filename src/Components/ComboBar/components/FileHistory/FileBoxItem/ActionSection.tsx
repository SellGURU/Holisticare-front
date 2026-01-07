/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useState } from 'react';
import Application from '../../../../../api/app';
import { BeatLoader } from 'react-spinners';
import { publish } from '../../../../../utils/event';
import { downloadManualEntryPdfFromApi } from '../../../../../utils/manualEntry';
interface ActionSectionProps {
  file: any;
  isDeleted: boolean;
  memberId: string;
  onDelete: () => void;
  date?: string;
}
const ActionSection: FC<ActionSectionProps> = ({
  file,
  isDeleted,
  memberId,
  onDelete,
  date
}) => {
  const [isSureRemove, setIsSureRemove] = useState(false);
  const [loadingDelete] = useState<boolean>(false);
  const downloadFile = () => {
    // If file_id exists, we fetch from API (covers both normal + manual)
    if (file.file_id) {
      Application.downloadFille({
        file_id: file.file_id,
        member_id: memberId,
      })
        .then((res) => {
          try {
            // Your API response wrapper seems to be: res.data.data
            const payload = res?.data;
            console.log(payload);

            // ✅ Manual entry → build PDF from payload
            if (payload?.type === 'manual' && Array.isArray(payload?.data)) {
           downloadManualEntryPdfFromApi(
  payload,
  `${file.file_name || 'manual-entry'}.pdf`,
  date,
);
              return;
            }

            // ✅ Normal → open the url
            if (typeof payload === 'string') {
              window.open(payload, '_blank');
              return;
            }

            // Fallback if backend sends { data: "url" }
            const maybeUrl = payload?.data;
            if (typeof maybeUrl === 'string') {
              window.open(maybeUrl, '_blank');
              return;
            }

            console.error('Unexpected download response shape:', payload);
          } catch (error: any) {
            console.error('Error downloading file:', error);
          }
        })
        .catch((error: any) => {
          console.error('Error downloading file:', error);
        });

      return;
    }

    // No file_id: local file blob download
    const blobUrl = URL.createObjectURL(file.file);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = file.file_name || file.file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  };

  const handleDelete = () => {
    // setLoadingDelete(true);
    setIsSureRemove(false);

    Application.deleteFileHistory({
      file_id: file.file_id,
      member_id: memberId,
    })
      .then(() => {
        console.log('delete file success');
        // setLoadingDelete(false);
        // setisDeleted(true);

        // onDelete();
        // onDeleteSuccess();
      })
      .catch((err) => {
        console.error(err);
      });
    setTimeout(() => {
      publish('checkProgress', {});
    }, 400);
    onDelete();
  };
  return (
    <div className="w-[16%]">
      <div
        className={`flex justify-end gap-2 items-center ${
          isDeleted ? 'opacity-50' : ''
        }`}
      >
        {isSureRemove ? (
          <>
            <div className="h-[24px]"></div>
            <div className="flex items-center absolute justify-start gap-2 confirm-animation">
              <div className="text-Text-Quadruple text-xs">Sure?</div>
              <img
                src="/icons/tick-circle-green.svg"
                alt=""
                className="w-[20px] h-[20px] cursor-pointer transition-transform hover:scale-110"
                onClick={() => handleDelete()}
              />
              <img
                src="/icons/close-circle-red.svg"
                alt=""
                className="w-[20px] h-[20px] cursor-pointer transition-transform hover:scale-110"
                onClick={() => setIsSureRemove(false)}
              />
            </div>
          </>
        ) : (
          <>
            {loadingDelete ? (
              <div className="flex items-center justify-start gap-2 confirm-animation">
                <BeatLoader color="#6CC24A" size={10} />
              </div>
            ) : (
              <div className="flex items-center justify-start gap-1 confirm-animation">
                {/* {file.file_name !== 'Manual Entry' && ( */}
                <img
                  onClick={() => {
                    if (!isDeleted) {
                      downloadFile();
                    }
                  }}
                  className="cursor-pointer"
                  src="/icons/import.svg"
                  alt=""
                />
                {/* )} */}
                <img
                  onClick={() => {
                    if (!isDeleted) {
                      setIsSureRemove(true);
                    }
                  }}
                  src="/icons/delete-green.svg"
                  alt=""
                  className="cursor-pointer w-5 h-5"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default ActionSection;
