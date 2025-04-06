/* eslint-disable @typescript-eslint/no-explicit-any */
import MainModal from '../../MainModal';

interface ConflictsModalProps {
  showModal: boolean;
  setShowModal: (action: boolean) => void;
  conflicts: Array<any>;
  handleShowConflictsModal?: () => void;
}

const ConflictsModal: React.FC<ConflictsModalProps> = ({
  setShowModal,
  showModal,
  conflicts,
  handleShowConflictsModal,
}) => {
  return (
    <>
      <MainModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          if (handleShowConflictsModal) {
            handleShowConflictsModal();
          }
        }}
      >
        <div className="bg-white min-h-[400px] overflow-auto w-[500px] p-6 pb-5 rounded-2xl shadow-800 flex flex-col justify-between">
          <div>
            <div className="border-b border-Gray-50 pb-2 w-full text-sm font-medium text-Text-Primary">
              Conflict
            </div>
            <div className="flex flex-col gap-2 mt-5">
              {conflicts?.map((conflict: any, index: number) => (
                <>
                  <div className="text-xs text-Text-Primary" key={index}>
                    {conflict.task_name}
                  </div>
                  <div className="text-xs text-Text-Primary flex gap-6 mt-1">
                    <div className="text-Text-Quadruple">Reason:</div>
                    {conflict.reason}
                  </div>
                </>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowModal(false);
                if (handleShowConflictsModal) {
                  handleShowConflictsModal();
                }
              }}
              className="text-sm font-medium text-Disable cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </MainModal>
    </>
  );
};

export default ConflictsModal;
