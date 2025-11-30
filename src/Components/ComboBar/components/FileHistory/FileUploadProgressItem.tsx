/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useState } from 'react';
import TooltipTextAuto from '../../../TooltipText/TooltipTextAuto';
import { formatDate } from './help';
import ActionSection from './FileBoxItem/ActionSection';
import { useParams } from 'react-router-dom';

interface FileUploadProgressItemProps {
  file: any;
}
const FileUploadProgressItem: FC<FileUploadProgressItemProps> = ({ file }) => {
  const [isDeleted] = useState(false);
  const { id } = useParams<{ id: string }>();
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
            className={`w-[70px] text-center ${isDeleted ? 'opacity-50' : ''}`}
          >
            {formatDate(
              file.date_uploaded
                ? file.date_uploaded
                : new Date().toDateString(),
            )}
          </div>
          <ActionSection
            memberId={id || ''}
            isDeleted={isDeleted}
            file={file}
          />
        </div>
      </div>
    </>
  );
};

export default FileUploadProgressItem;
