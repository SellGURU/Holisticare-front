import { ReactNode, useRef } from 'react';
import { createPortal } from 'react-dom';
import useModalAutoClose from '../../hooks/UseModalAutoClose';

interface MainModalProps {
  isOpen?: boolean;
  onClose: () => void;
  children: ReactNode;
}

const MainModal: React.FC<MainModalProps> = ({ isOpen, onClose, children }) => {
  const modalRef = useRef(null);

  useModalAutoClose({
    refrence: modalRef,
    close() {
      onClose();
    },
  });

  if (!isOpen) return null;

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black opacity-30 z-[9998]" />

      {/* Modal wrapper */}
      <div className="fixed inset-0 flex items-center justify-center z-[9999]">
        <div
          ref={modalRef}
          className="bg-[#FFFFFF66] min-w-[309px] min-h-[200px] rounded-[20px] p-2 shadow-800"
        >
          {children}
        </div>
      </div>
    </>,
    modalRoot,
  );
};

export default MainModal;
