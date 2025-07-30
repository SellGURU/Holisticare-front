/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { publish, subscribe } from '../../utils/event';
import { ButtonSecondary } from '../Button/ButtosSecondary';

const DeletedTooltipContainer = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  subscribe('isDeletingBackGround', (value: any) => {
    setIsDeleting(value.detail.isDeleting);
  });
  return (
    <>
      <div
        className=" absolute flex justify-end top-0 pt-12 pr-4 right-0 "
        style={{ zIndex: 1000 }}
      >
        {isDeleting && (
          <div className="bg-white rounded-[16px] min-h-[100px] border border-gray-50  w-[320px] p-4">
            <div className="flex justify-between items-center">
              <div className="text-[12px] text-Primary-DeepTeal font-medium">
                File History
              </div>
              <img
                onClick={() => {
                  setIsDeleting(false);
                  publish('fileIsDeleting', {
                    isDeleting: false,
                  });
                }}
                className="cursor-pointer"
                src="/icons/close.svg"
                alt=""
              />
            </div>
            <div className="flex items-center justify-start gap-1 mt-4">
              <img
                className="w-5 h-5"
                src="/icons/tick-circle-upload.svg"
                alt=""
              />
              <div
                className=" bg-clip-text text-[12px] text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(30deg, #005F73, #6CC24A)',
                }}
              >
                Deleting Completed.
              </div>
            </div>
            <div className="text-Text-Secondary text-[10px] mt-2 text-justify">
              If you would like to remove its related data from the report,
              please click the “Unsync Data” button.
            </div>
            <div className="flex justify-end mt-2 items-center">
              <ButtonSecondary
                onClick={() => {
                  setIsDeleting(false);
                  publish('syncReport', {});
                }}
                ClassName="rounded-[20px]"
                size="small"
              >
                Unsync Data
              </ButtonSecondary>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DeletedTooltipContainer;
