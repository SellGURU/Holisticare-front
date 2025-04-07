import React, { useRef, useState } from 'react';
import useModalAutoClose from '../../hooks/UseModalAutoClose';
import { ButtonPrimary } from '../Button/ButtonPrimary';
import MainModal from '../MainModal';
interface ArchiveModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  name: string;
}
export const DeleteModal: React.FC<ArchiveModalProps> = ({
  isOpen,
  onClose,
  name,
  onConfirm,
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
    
      <MainModal isOpen={isOpen} onClose={()=>onClose}>
          <div className={`rounded-2xl p-6 pb-8 bg-white shadow-800 ${isComplete? 'w-[303px]' : 'w-[500px]'}  h-[196px]`}>
            {isComplete ? (
              <div className="flex flex-col items-center">
                <img className='-mt-5' src="/icons/tick-circle-background-new.svg" alt="" />
                <div className="text-center text-xs font-medium text-Text-Primary -mt-3 mb-6">
                  {name} has been successfully deleted.
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
                  Delete
                </div>
                <div className="mt-5 text-center text-xs font-medium">
                Are you sure you want to delete client {name}?
                </div>
                <div className="mt-4 text-xs text-Text-Secondary text-center">
                After deleting, you will not be able to return this client.                </div>
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

                      setisComplete(true);
                    }}
                    className="text-sm font-medium text-Primary-DeepTeal cursor-pointer"
                  >
                    Confirm
                  </div>
                </div>
              </>
            )}
          </div>
          </MainModal>
    
      {/* <div className="w-full h-full min-h-screen fixed top-0 left-0 bg-black opacity-30 z-[100]"></div> */}
    </>
  );
};
