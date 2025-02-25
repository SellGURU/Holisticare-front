/* eslint-disable @typescript-eslint/no-explicit-any */
import MainModal from '../../MainModal';

interface BasedOnModalProps {
  showModal: boolean;
  setShowModal: (action: boolean) => void;
  value: Array<any>;
}

const BasedOnModal: React.FC<BasedOnModalProps> = ({
  setShowModal,
  showModal,
  value,
}) => {
  return (
    <>
      <MainModal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="bg-white min-h-[400px] overflow-auto w-[500px]  p-6 pb-8 rounded-2xl shadow-800">
          <div className="border-b border-Gray-50 pb-2 w-full flex gap-2 items-center text-sm font-medium text-Text-Primary">
            <img src="/icons/notification-status.svg" alt="" /> Practitioner
            Comment
          </div>
          <div className="flex flex-col gap-2 mt-5">
            {value?.map((comment: string, index: number) => (
              <div
                className="bg-backgroundColor-Card w-full rounded-2xl py-1 px-3 border border-Gray-50 text-xs text-Text-Primary text-justify "
                key={index}
              >
                {comment}
              </div>
            ))}
          </div>
        </div>
      </MainModal>
    </>
  );
};

export default BasedOnModal;
