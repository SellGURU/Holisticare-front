import { useParams } from 'react-router-dom';
import Application from '../../../api/app';
import { ButtonSecondary } from '../../Button/ButtosSecondary';
import { publish } from '../../../utils/event';
import { useState } from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface FileBoxProps {
  el: any;
}
const FileBox: React.FC<FileBoxProps> = ({ el }) => {
  console.log(el);
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
  const [isUploded, setIsUploded] = useState(el.isUploded ? true : false);
  return (
    <>
      <div
        className=" bg-white border border-Gray-50 mb-1 p-1 md:p-3 min-h-[48px] w-full rounded-[12px]  text-Text-Primary text-[10px]"
        style={{ borderColor: el.status == 'error' ? '#ff0005' : '#e9edf5 ' }}
      >
        <div className="flex justify-between items-center w-full">
          <div
            className="text-[10px] w-[75px] text-Text-Primary select-none  overflow-hidden whitespace-nowrap text-ellipsis"
            title={el.file_name}
          >
            {el.file_name || el.file.name}
          </div>
          {el.date_uploaded && (
            <div className="w-[70px] text-center">
              {formatDate(el.date_uploaded)}
            </div>
          )}
          {el.file_id && (
            <div className="flex w-[55px] justify-center gap-1">
              {/* <img
                    className="cursor-pointer"
                    src="/icons/eye-green.svg"
                    alt=""
                    /> */}
              <img
                onClick={() => {
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
                className="cursor-pointer -mt-[3px]"
                src="/icons/import.svg"
                alt=""
              />
            </div>
          )}
        </div>
        {el.progress && el.status == 'uploading' && (
          <>
            <div className="w-full flex justify-between">
              <div>
                <div className="text-Text-Secondary  text-[10px] md:text-[10px] mt-1">
                  {el.progress}% •
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
