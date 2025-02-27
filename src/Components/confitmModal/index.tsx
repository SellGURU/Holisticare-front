import React, { useRef } from 'react';
import useModalAutoClose from '../../hooks/UseModalAutoClose';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;
  const modalRef = useRef(null);
  useModalAutoClose({
    refrence: modalRef,
    close: onClose,
  });

  return (
    <div className="fixed inset-0 bg-[#0000004D] bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-[99]">
      <div
        ref={modalRef}
        className="bg-white p-6 pb-8 rounded-2xl shadow-800 w-[500px]"
      >
        <div className=" w-full border-b border-Gray-50 pb-2 flex items-center mb-4">
          <img src="/icons/danger.svg" alt="Warning" className="mr-2" />
          <h2 className="text-sm font-medium text-Text-Primary">
            Generate by AI
          </h2>
        </div>
        <p className="text-xs font-medium text-Text-Primary text-center mb-4">
          Are you sure you want to continue?
        </p>
        <p className="text-xs text-Text-Secondary text-center mb-6">
          AI-generated changes will replace the existing plan, and all previous
          data will be lost.
        </p>
        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="text-sm  text-[#909090]">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="text-sm font-medium text-Primary-DeepTeal"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
