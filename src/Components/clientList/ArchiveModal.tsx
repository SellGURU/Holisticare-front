import React, { useRef, useState } from 'react';
import useModalAutoClose from '../../hooks/UseModalAutoClose';
import { ButtonPrimary } from '../Button/ButtonPrimary';
interface ArchiveModalProps {
  isOpen?: boolean;
  onClose: () => void;
  name: string;
  onConfirm: () => void;
  archived: boolean;
}
export const ArchiveModal: React.FC<ArchiveModalProps> = ({
  isOpen,
  onClose,
  name,
  onConfirm,
  archived,
}) => {
  const modalRefrence = useRef(null);
  const [isComplete, setisComplete] = useState(false);
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
          className="bg-[#FFFFFF66] min-w-[450px] min-h-[200px] rounded-[20px]  p-2 shadow-800"
        >
          <div className="rounded-2xl p-6 pb-8 bg-white shadow-800 w-[500px] h-[196px]">
            {isComplete ? (
              <div className="flex flex-col items-center">
                <img src="/icons/done.svg" alt="" />
                <div className="text-center text-xs font-medium text-Text-Primary mt-3 mb-6">
                  {name} has been successfully removed from archive list.
                </div>
                <ButtonPrimary
                  onClick={() => {
                    onClose();
                    setisComplete(false);
                  }}
                >
                  <div className="w-[150px]">Got it</div>
                </ButtonPrimary>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 border-b border-Gray-50 pb-2 text-sm font-medium text-Text-Primary">
                  <img src="/icons/danger.svg" alt="" />
                  {archived ? 'Remove from Archive List' : 'Send to Archive'}
                </div>
                <div className="mt-5 text-center text-xs font-medium">
                  {archived
                    ? `Are you sure you want to remove client ${name} from archive list?`
                    : `Are you sure you want to send client ${name} to archive list? `}
                </div>
                <div className="mt-4 text-xs text-Text-Secondary text-center">
                  {archived
                    ? "After the transfer, this client's card will appear in the client list."
                    : "After the transfer, this client's card will appear in the archive list."}
                </div>
                <div className=" mt-5 w-full flex justify-end gap-3 items-center">
                  <div
                    onClick={onClose}
                    className="text-sm font-medium text-[#909090] cursor-pointer"
                  >
                    Cancel
                  </div>
                  <div
                    onClick={() => {
                      onConfirm();
                      if (archived) {
                        onClose()
                        // setisComplete(true);
                      } else {
                        onClose();
                      }
                    }}
                    className="text-sm font-medium text-Primary-DeepTeal cursor-pointer"
                  >
                    Confirm
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="w-full h-full min-h-screen fixed top-0 left-0 bg-black opacity-30 z-[100]"></div>
    </>
  );
};
