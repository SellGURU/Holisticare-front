/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useState } from 'react';
import Application from '../../../../../api/app';
import { BeatLoader } from 'react-spinners';

interface ActionSectionProps {
  file: any;
  isDeleted: boolean;
  memberId: string;
  onDelete: () => void;
}
const ActionSection: FC<ActionSectionProps> = ({
  file,
  isDeleted,
  memberId,
  onDelete,
}) => {
  const [isSureRemove, setIsSureRemove] = useState(false);
  const [loadingDelete] = useState<boolean>(false);
  const downloadFile = () => {
    if (file.file_id) {
      Application.downloadFille({
        file_id: file.file_id,
        member_id: memberId,
      })
        .then((res) => {
          try {
            const blobUrl = res.data;

            // Create a direct download link for the blob URL
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = file.file_name;
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
    } else {
      // For direct file object, create a blob URL
      const blobUrl = URL.createObjectURL(file.file);

      // Create a direct download link for the blob URL
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = file.file_name || file.file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the blob URL
      URL.revokeObjectURL(blobUrl);
    }
  };
  const handleDelete = () => {
    // setLoadingDelete(true);
    setIsSureRemove(false);
    onDelete();
    Application.deleteFileHistory({
      file_id: file.file_id,
      member_id: memberId,
    })
      .then(() => {
        // setLoadingDelete(false);
        // setisDeleted(true);
        // onDelete();
        // onDeleteSuccess();
      })
      .catch((err) => {
        console.error(err);
      });
  };
  return (
    <>
      <div
        className={`flex justify-center gap-2 items-center ${
          isDeleted ? 'opacity-50' : ''
        }`}
      >
        {isSureRemove ? (
          <>
            <div className="flex items-center justify-start gap-2">
              <div className="text-Text-Quadruple text-xs">Sure?</div>
              <img
                src="/icons/tick-circle-green.svg"
                alt=""
                className="w-[20px] h-[20px] cursor-pointer"
                onClick={() => handleDelete()}
              />
              <img
                src="/icons/close-circle-red.svg"
                alt=""
                className="w-[20px] h-[20px] cursor-pointer"
                onClick={() => setIsSureRemove(false)}
              />
            </div>
          </>
        ) : (
          <>
            {loadingDelete ? (
              <div className="flex items-center justify-start gap-2">
                <BeatLoader color="#6CC24A" size={10} />
              </div>
            ) : (
              <>
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
                {file.file_name !== 'Manual Entry' && (
                  <img
                    onClick={() => {
                      downloadFile();
                    }}
                    className="cursor-pointer"
                    src="/icons/import.svg"
                    alt=""
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};
export default ActionSection;
