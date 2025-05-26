/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { publish, subscribe } from '../../utils/event';
import UploadItem from './uploadItem';
import { ButtonSecondary } from '../Button/ButtosSecondary';

const UploaderTooltipContainer = () => {
  const [isUploading, setIsUploading] = useState(false);
  subscribe('isuploadingBackGround', (value: any) => {
    setIsUploading(value.detail.isUploading);
  });
  const [files, setFiles] = useState<any[]>([]);
  subscribe('fileIsUploading', (value: any) => {
    setFiles(value.detail.files ? value.detail.files : []);
  });
  // console.log(files)
  return (
    <>
      <div
        className=" absolute flex justify-end top-0 pt-12 pr-4 right-0 "
        style={{ zIndex: 1000 }}
      >
        {isUploading && (
          <div className="bg-white rounded-[16px] min-h-[100px] border border-gray-50  w-[320px] p-4">
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
            {files?.length == 0 && (
              <>
                <div className="flex items-center justify-start gap-1 mt-4">
                  <img
                    className="w-5 h-5"
                    src="/icons/tick-circle-upload.svg"
                    alt=""
                  />
                  <div
                    className=" bg-clip-text text-[12px] text-transparent"
                    style={{
                      backgroundImage:
                        'linear-gradient(30deg, #005F73, #6CC24A)',
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
                      //   setIsUploded(false);
                      setIsUploading(false);
                      publish('syncReport', {});
                    }}
                    ClassName="rounded-[20px]"
                    size="small"
                  >
                    Sync Data
                  </ButtonSecondary>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default UploaderTooltipContainer;
