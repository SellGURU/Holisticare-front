import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BeatLoader } from 'react-spinners';
import Application from '../../../api/app';
import { publish } from '../../../utils/event';
import { ButtonSecondary } from '../../Button/ButtosSecondary';
import TooltipTextAuto from '../../TooltipText/TooltipTextAuto';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface FileBoxProps {
  el: any;
  onDelete: () => void;
  onDeleteHistory: (file_id: string) => void;
  isLoading: boolean;
  isDeleted: boolean;
}

const FileBox: React.FC<FileBoxProps> = ({
  el,
  onDelete,
  onDeleteHistory,
  isLoading,
  isDeleted,
}) => {
  const { id } = useParams<{ id: string }>();
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
  const [isUploded, setIsUploded] = useState(
    el.status == 'completed' ? true : false,
  );
  useEffect(() => {
    setIsUploded(el.status == 'completed' ? true : false);
  }, [el.status]);
  const [isSureRemoveId, setIsSureRemoveId] = useState<number | null>(null);
  return (
    <>
      <div
        className=" bg-white border border-Gray-50 mb-1 p-1 md:p-3 min-h-[48px] w-full rounded-[12px]  text-Text-Primary text-[10px]"
        style={{ borderColor: el.status == 'error' ? '#ff0005' : '#e9edf5 ' }}
      >
        <div
          className={`flex justify-between items-center w-full ${
            isDeleted ? 'opacity-50' : ''
          }`}
        >
          <div
            className="text-[10px]  text-Text-Primary select-none "
          
          >
            <TooltipTextAuto maxWidth='77px'>{el.file_name || el.file.name}</TooltipTextAuto>
      
          </div>
      
          <div className="w-[70px] text-center">
            {formatDate(
              el.date_uploaded ? el.date_uploaded : new Date().toDateString(),
            )}
          </div>
          {el.status == 'error' ? (
            <>
              <div className="flex w-[55px] justify-center gap-1">
                <img
                  onClick={onDelete}
                  src="/icons/close-red.svg"
                  alt="Error"
                  className="w-4 h-4 cursor-pointer"
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-center gap-2 items-center">
                {isSureRemoveId == el.file_id && !isDeleted ? (
                  <>
                    {!isLoading ? (
                      <div className="flex items-center justify-start gap-2">
                        <div className="text-Text-Quadruple text-xs">Sure?</div>
                        <img
                          src="/icons/tick-circle-green.svg"
                          alt=""
                          className="w-[20px] h-[20px] cursor-pointer"
                          onClick={() => onDeleteHistory(el.file_id)}
                        />
                        <img
                          src="/icons/close-circle-red.svg"
                          alt=""
                          className="w-[20px] h-[20px] cursor-pointer"
                          onClick={() => setIsSureRemoveId(null)}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-start mt-1">
                        <BeatLoader color="#6CC24A" size={10} />
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <img
                      onClick={() => {
                        if (!isDeleted) {
                          setIsSureRemoveId(el.file_id);
                        }
                      }}
                      src="/icons/delete-green.svg"
                      alt=""
                      className="cursor-pointer w-5 h-5"
                    />
                    <img
                      onClick={() => {
                        if (!isDeleted) {
                          if (el.file_id) {
                            Application.downloadFille({
                              file_id: el.file_id,
                              member_id: id,
                            })
                              .then((res) => {
                                try {
                                  const blobUrl = res.data;

                                  // Create a direct download link for the blob URL
                                  const link = document.createElement('a');
                                  link.href = blobUrl;
                                  link.download = el.file_name;
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                } catch (error: any) {
                                  console.error(
                                    'Error downloading file:',
                                    error,
                                  );
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
                            const blobUrl = URL.createObjectURL(el.file);

                            // Create a direct download link for the blob URL
                            const link = document.createElement('a');
                            link.href = blobUrl;
                            link.download = el.file_name || el.file.name;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);

                            // Clean up the blob URL
                            URL.revokeObjectURL(blobUrl);
                          }
                        }
                      }}
                      className="cursor-pointer"
                      src="/icons/import.svg"
                      alt=""
                    />
                  </>
                )}
              </div>
            </>
          )}
        </div>
        {el.progress && (
          <>
            {el.status == 'uploading' && (
              <>
                <div className="w-full flex justify-between">
                  <div>
                    <div className="text-Text-Secondary text-[10px] md:text-[10px] mt-1">
                      {el.formattedSize}
                    </div>
                  </div>
                  <div>
                    <div className="text-Text-Secondary text-[10px] md:text-[10px] mt-1">
                      {el.progress < 50 ? ' ' : ''} {Math.round(el.progress)}%
                    </div>
                  </div>
                </div>
                <div className="w-full h-[8px] rounded-[12px] bg-gray-200 mt-1 flex justify-start items-center">
                  <div
                    className="bg-Primary-DeepTeal h-[5px] rounded-[12px]"
                    style={{ width: el.progress + '%' }}
                  ></div>
                </div>
              </>
            )}
          </>
        )}
        {el.status === 'error' && (
          <div className="flex items-center gap-2 mt-2">
            {/* <img src="/icons/error.svg" alt="Error" className="w-4 h-4" /> */}
            <div className="text-red-500 text-[10px]">
              {el.errorMessage || 'Failed to upload file. Please try again.'}
            </div>
          </div>
        )}
        {isDeleted ? (
          <div className="flex flex-col mt-3">
            <div className="flex items-center">
              <img
                src="/icons/tick-circle-upload.svg"
                alt=""
                className="w-5 h-5"
              />
              <div className="text-[10px] text-transparent bg-clip-text bg-gradient-to-r from-[#005F73] via-[#3C9C5B] to-[#6CC24A] ml-1">
                Deleting Completed.
              </div>
            </div>
            <div className="text-[10px] text-Text-Quadruple mt-2 leading-5">
              If you would like to remove its related data from the report,
              please click the “Sync Data” button.
            </div>
            <div className="w-full flex justify-end">
              <ButtonSecondary
                ClassName="rounded-[20px] mt-1"
                size="small"
                onClick={() => {
                  setIsSureRemoveId(null);
                  publish('syncReport', {});
                }}
              >
                Sync Data
              </ButtonSecondary>
            </div>
          </div>
        ) : (
          ''
        )}
        {isUploded && (
          <div>
            <div className="flex items-center justify-start gap-1 mt-4">
              <img
                className="w-5 h-5"
                src="/icons/tick-circle-upload.svg"
                alt=""
              />
              <div
                className=" bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(30deg, #005F73, #6CC24A)',
                }}
              >
                Uploading Completed.
              </div>
            </div>
            <div className="text-Text-Secondary text-[10px] mt-2 text-justify">
              If you would like the data from this file to be applied to the
              report, please click the "Sync Data" button.
            </div>
            <div className="flex justify-end mt-2 items-center">
              <ButtonSecondary
                onClick={() => {
                  setIsUploded(false);
                  publish('syncReport', {});
                }}
                ClassName="rounded-[20px]"
                size="small"
              >
                Sync Data
              </ButtonSecondary>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FileBox;
