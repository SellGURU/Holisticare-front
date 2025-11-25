import { useState } from 'react';
import { publish, subscribe } from '../../../utils/event';
import { ButtonSecondary } from '../../Button/ButtosSecondary';

export const DeleteQuestionnaireTrackingProgressModal = () => {
  const [showProgressModal, setshowProgressModal] = useState(false);
  const [IsinProgress, setIsinProgress] = useState(true);

  subscribe('openDeleteQuestionnaireTrackingProgressModal', () => {
    setTimeout(() => {
      setshowProgressModal(true);
      setIsinProgress(true);
    }, 2000);
  });

  subscribe('DeleteQuestionnaireTrackingSuccess', () => {
    setshowProgressModal(true);
    setIsinProgress(false);
  });

  return (
    <>
      <div
        style={{ zIndex: 1000 }}
        className={`
          fixed top-[48px] right-6
          w-[320px]
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
          {IsinProgress ? 'Deletion in Progress' : 'Processing Completed!'}
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
              className="flex size-5 rounded-full items-center justify-center gap-[3px]"
            >
              <div className="size-[2px] rounded-full bg-Primary-DeepTeal animate-dot1"></div>
              <div className="size-[2px] rounded-full bg-Primary-DeepTeal animate-dot2"></div>
              <div className="size-[2px] rounded-full bg-Primary-DeepTeal animate-dot3"></div>
            </div>
          ) : (
            <img src="/icons/tick-circle-upload.svg" alt="" />
          )}
          {IsinProgress
            ? 'The questionnaire is being removed.'
            : 'Deletion completed.'}
        </div>

        <div className="mt-4 text-[10px] text-Text-Quadruple transition-opacity duration-500">
          {IsinProgress
            ? "If you'd like, you may continue working while the system removes the questionnaire."
            : 'If you’d like to remove its related data from the system, please click the “Unsync Data” button.'}
        </div>

        {!IsinProgress && (
          <div className="w-full flex justify-end mt-4">
            <ButtonSecondary
              onClick={() => {
                setshowProgressModal(false);
                publish('syncReport', {});
              }}
            >
              Unsync Data
            </ButtonSecondary>
          </div>
        )}
      </div>
    </>
  );
};
export default DeleteQuestionnaireTrackingProgressModal;
