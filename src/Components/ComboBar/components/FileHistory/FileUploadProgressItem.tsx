/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from 'react';
import TooltipTextAuto from '../../../TooltipText/TooltipTextAuto';
import { formatDate } from './help';
import ActionSection from './FileBoxItem/ActionSection';
import { useParams } from 'react-router-dom';
import { ButtonSecondary } from '../../../Button/ButtosSecondary';
import { publish } from '../../../../utils/event';

interface FileUploadProgressItemProps {
  file: any;
}
const FileUploadProgressItem: FC<FileUploadProgressItemProps> = ({ file }) => {
  const [fileStatus, setFileStatus] = useState<
    'upload' | 'deleting' | 'deleted'
  >('upload');
  const { id } = useParams<{ id: string }>();
  useEffect(() => {
    if (file.action_type === 'deleted') {
      if (file.process_done === true) {
        setFileStatus('deleted');
      } else {
        setFileStatus('deleting');
      }
    }
  }, []);
  return (
    <>
      <div
        className=" bg-white border border-Gray-50 mb-1 p-1 md:p-3 min-h-[48px] w-full rounded-[12px]  text-Text-Primary text-[10px]"
        style={{ borderColor: file.status == 'error' ? '#ff0005' : '#e9edf5 ' }}
      >
        <div className={`flex justify-between items-center w-full `}>
          <div className="text-[10px] w-[70px]  text-Text-Primary select-none ">
            <TooltipTextAuto
              tooltipClassName="!bg-white ml-8 !w-[180px] !bg-opacity-100 !opacity-100 !h-fit !break-words !leading-5 !text-justify !text-wrap !shadow-100 !text-[#888888] !text-[10px] !rounded-[6px] !border !border-Gray-50 flex flex-col !z-[99999]"
              maxWidth="70px"
            >
              {file.file_name}
            </TooltipTextAuto>
          </div>
          <div
            className={`w-[70px] text-center ${fileStatus != 'upload' ? 'opacity-50' : ''}`}
          >
            {formatDate(
              file.date_uploaded
                ? file.date_uploaded
                : new Date().toDateString(),
            )}
          </div>
          <ActionSection
            memberId={id || ''}
            isDeleted={fileStatus != 'upload'}
            file={file}
            onDelete={() => {
              setFileStatus('deleting');
            }}
          />
        </div>
        {fileStatus === 'deleted' && (
          <>
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
                please click the “Unsync Data” button.
              </div>
              <div className="w-full flex justify-end">
                <ButtonSecondary
                  ClassName="rounded-[20px] mt-1"
                  size="small"
                  onClick={() => {
                    publish('syncReport', {});
                    publish('fileIsDeleting', {
                      isDeleting: false,
                    });
                  }}
                >
                  Unsync Data
                </ButtonSecondary>
              </div>
            </div>
          </>
        )}
        {fileStatus == 'deleting' && (
          <>
            <div className="flex flex-col mt-3">
              <div className="flex items-center">
                <div
                  style={{
                    background:
                      'linear-gradient(to right, rgba(0,95,115,0.4), rgba(108,194,74,0.4))',
                  }}
                  className="flex size-5   rounded-full items-center justify-center gap-[3px]"
                >
                  <div className="size-[2px] rounded-full bg-Primary-DeepTeal animate-dot1"></div>
                  <div className="size-[2px] rounded-full bg-Primary-DeepTeal animate-dot2"></div>
                  <div className="size-[2px] rounded-full bg-Primary-DeepTeal animate-dot3"></div>
                </div>
                <div className="text-[10px] text-transparent bg-clip-text bg-gradient-to-r from-[#005F73] via-[#3C9C5B] to-[#6CC24A] ml-1">
                  Your file is being removed.
                </div>
              </div>
              <div className="text-[10px] text-Text-Quadruple mt-2 leading-5">
                If you'd like, you may continue working while the system removes
                the file.
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default FileUploadProgressItem;
