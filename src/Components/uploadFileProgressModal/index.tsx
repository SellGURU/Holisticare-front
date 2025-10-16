import { useState } from 'react';
import { ButtonSecondary } from '../Button/ButtosSecondary';
import { subscribe } from '../../utils/event';
import { publish } from '../../utils/event';

export const UploadFileProgressModal = () => {
  const [showProgressModal, setshowProgressModal] = useState(false);
  const [IsinProgress, setIsinProgress] = useState(true);

  subscribe('openProgressModal', () => {
    setTimeout(() => {
      setshowProgressModal(true);
      setIsinProgress(true);
    }, 2000);
  });

  subscribe('StepTwoSuccess', () => {
    setshowProgressModal(true);
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
          shadow-200 p-4 bg-white
          transition-all duration-[1000] ease-[cubic-bezier(0.4,0,0.2,1)]
          ${
            showProgressModal
              ? 'opacity-100 translate-x-0 scale-100 shadow-xl'
              : 'opacity-0 translate-x-[120%] scale-95 pointer-events-none shadow-none'
          }
        `}
      >
        <div className="flex items-center justify-between text-xs font-medium text-Primary-DeepTeal">
          {IsinProgress ? 'Processing in Progress' : 'Processing Completed'}
          <img
            onClick={() => setshowProgressModal(false)}
            src="/icons/close.svg"
            alt="close"
            className="cursor-pointer transition-transform hover:rotate-90 duration-300"
          />
        </div>

        <div className="mt-4 w-full flex items-center gap-1 p-3 rounded-[12px] border border-Gray-50 text-[10px] text-Primary-DeepTeal transition-colors">
          {IsinProgress ? (
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
          ) : (
            // <img src="/icons/more-circle.svg" alt="" />
            <img src="/icons/tick-circle-upload.svg" alt="" />
          )}
          {IsinProgress
            ? 'Your file is currently being processed...'
            : 'Your file has been successfully processed.'}
        </div>

        <div className="mt-4 text-[10px] text-Text-Quadruple transition-opacity duration-500">
          {IsinProgress
            ? "If you'd like, you may continue working while the system analyzes the data."
            : 'Please click “Sync Data” to apply the extracted data to your health plan.'}
        </div>

        {!IsinProgress && (
          <div className="w-full flex justify-end mt-4">
            <ButtonSecondary
              onClick={() => {
                setshowProgressModal(false);
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
