import { ReactNode, useRef } from 'react';
import useModalAutoClose from '../../hooks/UseModalAutoClose';

interface MainModalProps {
  isOpen?: boolean;
  onClose: () => void;
  children: ReactNode;
}
const MainModal: React.FC<MainModalProps> = ({ isOpen, onClose, children }) => {
  // useEffect(() => {
  //     if (isOpen) {
  //     document.body.style.overflow = "hidden";
  //     } else {
  //     document.body.style.overflow = "auto";
  //     }
  //     return () => {document.body.style.overflow = "auto"};
  // }, [isOpen]);
  const modalRefrence = useRef(null);
  useModalAutoClose({
    refrence: modalRefrence,
    close() {
      onClose();
    },
  });
  if (!isOpen) return null;

  return (
    <>
      <div className="w-full h-screen flex justify-center fixed z-[120] top-0 left-0 items-center">
        <div
          ref={modalRefrence}
          className="bg-[#FFFFFF66] min-w-[309px] min-h-[200px] rounded-[20px]  p-2 shadow-800"
        >
          {children}
        </div>
      </div>
      <div className="w-full h-full min-h-screen fixed top-0 left-0 bg-black opacity-30 z-[100]"></div>
    </>
  );
};

export default MainModal;
