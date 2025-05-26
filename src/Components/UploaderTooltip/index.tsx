/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { subscribe } from '../../utils/event';
import UploadItem from './uploadItem';

const UploaderTooltipContainer = () => {
  const [isUploading, setIsUploading] = useState(false);
  subscribe('isuploadingBackGround', () => {
    setIsUploading(true);
  });
  const [files, setFiles] = useState<any[]>([]);
  subscribe('fileIsUploading', (value: any) => {
    setFiles(value.detail.files);
  });
  return (
    <>
      <div
        className=" absolute flex justify-end top-0 pt-12 pr-4 right-0 "
        style={{ zIndex: 1000 }}
      >
        {isUploading && (
          <div className="bg-white rounded-[16px] h-[100px] border border-gray-50  w-[320px] p-4">
            <div className="flex justify-between items-center">
              <div className="text-[12px] text-Primary-DeepTeal font-medium">
                File History
              </div>
              <img
                onClick={() => {
                  setIsUploading(false);
                }}
                className="cursor-pointer"
                src="/icons/close.svg"
                alt=""
              />
            </div>
            {files?.map(() => {
              return (
                <>
                  <UploadItem></UploadItem>
                </>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default UploaderTooltipContainer;
