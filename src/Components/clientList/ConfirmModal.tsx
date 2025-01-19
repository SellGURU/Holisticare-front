import { useEffect, useRef } from 'react';

import { ButtonPrimary } from '../Button/ButtonPrimary';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  clientName: string;
  actionType: 'Delete' | 'Email' | 'SMS';
  email: string;
}
const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  clientName,
  actionType,
  email,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  console.log(email);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  const resolveText = () => {
    if (actionType === 'Delete') {
      return `Are you sure you want to remove '${clientName}'?`;
    } else if (actionType === 'Email') {
      return `Are you sure you want to send an email invitation to '${email}'?`;
    } else if (actionType === 'SMS') {
      return `Are you sure you want to send an SMS invitation to '${clientName}'?`;
    }
    return '';
  };
  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-400 bg-opacity-45">
        <div
          ref={modalRef}
          className={` bg-white relative text-primary-text p-6 rounded-[16px] shadow-200 w-[428px]`}
        >
          {/* <div className=" mb-6 w-full flex justify-between items-center">
                        {" "}
                        <h2 className="text-[14px] text-light-secandary-text dark:text-white font-medium "></h2>
                        <button onClick={onClose} className="text-lg">
                        <img className='Aurora-icons-close' ></img>
                        </button>
                    </div>    */}
          <div className="flex justify-center mb-2">
            <img src="/images/danger.svg" alt="" />
          </div>
          <div className="text-[14px] text-Text-Primary font-medium text-center">
            {actionType == 'Delete' ? 'Remove Client' : 'Send Invitation'}
          </div>
          <div className="text-[12px] text-Text-Primary text-center mb-5 mt-2">
            {resolveText()}
          </div>
          <div className="w-full flex mt-2 justify-center gap-3">
            <ButtonPrimary
              style={{
                color: '#005F73',
                backgroundColor: '#FDFDFD',
              }}
              ClassName="shadow-Btn"
              onClick={() => {
                onClose();
              }}
            > <div className="w-[60px]">Close</div>
              
            </ButtonPrimary>

            <ButtonPrimary
              onClick={() => {
                onConfirm();
              }}
            >
              <div className="w-[60px]">Confirm</div>
            </ButtonPrimary>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmModal;
