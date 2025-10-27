import { FC, useRef } from 'react';
import useModalAutoClose from '../../hooks/UseModalAutoClose';
import SpinnerLoader from '../SpinnerLoader';
interface ShareModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}
export const ShareModal: FC<ShareModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}) => {
  const modalRefrence = useRef(null);
  useModalAutoClose({
    refrence: modalRefrence,
    close: onClose,
  });
  if (!isOpen) return null;

  return (
    <>
      <div className="w-full h-screen flex justify-center fixed z-[120] top-0 left-0 items-center">
        <div
          ref={modalRefrence}
          className="bg-[#FFFFFF66] min-w-[90vw] md:min-w-[450px] min-h-[200px] rounded-[20px]  p-2 shadow-800"
        >
          <div className="rounded-2xl p-6 pb-8 bg-white shadow-800 w-[90vw] md:w-[500px] md:h-[196px]">
            <div className="flex items-center gap-2 border-b border-Gray-50 pb-2 text-sm font-medium text-Text-Primary">
              <img src="/icons/danger.svg" alt="" />
              Share Holistic Plan with Client
            </div>
            <div className="mt-5 text-center text-xs font-medium">
              Are you sure you want to share this Holistic Plan with your
              client?
            </div>
            <div className="mt-4 text-xs text-Text-Secondary text-center">
              Once shared, it will be visible in the client's mobile app.
            </div>
            <div className=" mt-5 w-full flex justify-end gap-3 items-center">
              <div
                onClick={onClose}
                className="text-sm font-medium text-[#909090] cursor-pointer"
              >
                Cancel
              </div>
              <div
                onClick={onConfirm}
                className="text-sm font-medium text-Primary-DeepTeal cursor-pointer"
              >
                {isLoading ? <SpinnerLoader color="#005F73" /> : 'Share Now'}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <div className="w-full h-full min-h-screen fixed top-0 left-0 bg-black opacity-30 z-[100]"></div> */}
    </>
  );
};
