import React, { useEffect, useRef, useState } from 'react';
import useModalAutoClose from '../../hooks/UseModalAutoClose';
import { ButtonPrimary } from '../Button/ButtonPrimary';
import MainModal from '../MainModal';
import { Tooltip } from 'react-tooltip';

interface ArchiveModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onDelete: () => void;
  onConfirm: () => void;
  name: string;
}
export const DeleteModal: React.FC<ArchiveModalProps> = ({
  isOpen,
  onClose,
  name,
  onConfirm,
  onDelete,
}) => {
  const modalRefrence = useRef(null);
  const [isComplete, setisComplete] = useState(false);
  const [currentName, setCurrentName] = useState(name);
  const isNameTooLong = currentName.length > 20;
  useModalAutoClose({
    refrence: modalRefrence,
    close: onClose,
  });
  console.log(name);
  console.log(currentName);
  useEffect(() => {
    setCurrentName(name);
  }, [isOpen]);
  if (!isOpen) return null;

  return (
    <>
      <MainModal isOpen={isOpen} onClose={() => onClose}>
        <div
          className={`rounded-2xl p-6 pb-8 bg-white shadow-800 ${isComplete ? 'w-[303px]' : 'w-[500px]'}  h-[196px]`}
        >
          {isComplete ? (
            <div className="flex flex-col items-center">
              <img
                className="-mt-5"
                src="/icons/tick-circle-background-new.svg"
                alt=""
              />
              <div
                data-tooltip-id="name-tooltip"
                className="text-center text-xs font-medium text-Text-Primary -mt-3 mb-6"
              >
                {isNameTooLong
                  ? `${currentName.substring(0, 17)}...`
                  : currentName}{' '}
                has been successfully deleted. has been successfully deleted.
              </div>
              <ButtonPrimary
                onClick={() => {
                  onConfirm();
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
              <div
                data-tooltip-id="name-tooltip"
                className="mt-5 text-center text-xs font-medium"
              >
                Are you sure you want to delete client{' '}
                {isNameTooLong
                  ? `${currentName.substring(0, 17)}...`
                  : currentName}
                ?
              </div>
              <div className="mt-4 text-xs text-Text-Secondary text-center">
                After deleting, you will not be able to return this client.{' '}
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
                    onDelete();

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
      <div className="z-[999]">
        <Tooltip
          id="name-tooltip"
          place="top"
          content={isNameTooLong ? currentName : undefined}
        />
      </div>
    </>
  );
};
