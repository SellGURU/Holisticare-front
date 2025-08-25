import { useState } from 'react';
import { ButtonSecondary } from '../Button/ButtosSecondary';
import { subscribe } from '../../utils/event';
import { publish } from '../../utils/event';

export const UploadFileProgressModal = () => {
  const [showProgressModal, setshowProgressModal] = useState(false);
  const [IsinProgress, setIsinProgress] = useState(true);
  subscribe('openProgressModal', () => {
    setTimeout(() => {
      setshowProgressModal(true)
    }, 5000)
    // setIsUploading(value.detail.isUploading);
  });

  subscribe('StepTwoSuccess', () => {
    setIsinProgress(false);
  });

  return (
    <>
      <div
        style={{ zIndex: 1000 }}
        className={`
          fixed top-[48px] right-6
          w-[320px] h-[212px] 
          rounded-2xl border-2 border-r-0 border-Gray-50 
          shadow-200 p-4 bg-white z-[99]
          transition-all duration-500 ease-in-out
          ${showProgressModal ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[120%] pointer-events-none'}
        `}
      >
        <div className="flex items-center justify-between text-xs font-medium text-Primary-DeepTeal">
          {IsinProgress ? 'Processing in Progress' : 'Processing Completed'}
          <img
            onClick={() => setshowProgressModal(false)}
            src="/icons/close.svg"
            alt="close"
            className="cursor-pointer"
          />
        </div>

        <div className="mt-4 w-full flex items-center gap-1 p-3 rounded-[12px] border border-Gray-50 text-[10px] text-Primary-DeepTeal">
          {IsinProgress ? (
            <img src="/icons/more-circle.svg" alt="" />
          ) : (
            <img src="/icons/tick-circle-upload.svg" alt="" />
          )}
          {IsinProgress
            ? 'Your file currently being processed...'
            : 'Your file has been successfully processed.'}
        </div>

        <div className="mt-4 text-[10px] text-Text-Quadruple">
          {IsinProgress
            ? "If you'd like, you may continue working while the system analyzes the data."
            : 'Please click “Sync Data” to apply the extracted data to your health plan.'}
        </div>

        {!IsinProgress && (
          <div className="w-full flex justify-end mt-4">
            <ButtonSecondary
              onClick={() => {
                publish('syncReport', {});
              }}
            >
              Sync Data
            </ButtonSecondary>
          </div>
        )}
      </div>
    </>
  );
};
export default UploadFileProgressModal;
