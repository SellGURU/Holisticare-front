import { useState } from 'react';
import { ButtonSecondary } from '../Button/ButtosSecondary';
import { subscribe } from '../../utils/event';
import { publish } from '../../utils/event';

export const RefreshProgressModal = () => {
  const [showProgressModal, setshowProgressModal] = useState(false);
  const [IsinProgress, setIsinProgress] = useState(true);
  const [name, setName] = useState('');
  subscribe('openRefreshProgressModal', (name: any) => {
    setName(name.detail);
    setTimeout(() => {
      setshowProgressModal(true);
      setIsinProgress(true);
    }, 2000);
  });

  subscribe('RefreshStepTwoSuccess', () => {
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
          {IsinProgress ? `Sync in Progress for ${name}` : ' Data synced successfully!'}
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
            ? 'The client’s data is being updated...'
            : 'Your client’s data has been successfully synced.'}
        </div>

        <div className="mt-4 text-[10px] text-Text-Quadruple transition-opacity duration-500">
          {IsinProgress
            ? "If you'd like, you can continue working with other clients while this sync completes."
            : 'Please click “Update Data” to update your client’s data and create a new plan.'}
        </div>

        {!IsinProgress && (
          <div className="w-full flex justify-end mt-4">
            <ButtonSecondary
              onClick={() => {
                setshowProgressModal(false);
                publish('syncReport', {});
              }}
            >
              Update Data
            </ButtonSecondary>
          </div>
        )}
      </div>
    </>
  );
};
export default RefreshProgressModal;
