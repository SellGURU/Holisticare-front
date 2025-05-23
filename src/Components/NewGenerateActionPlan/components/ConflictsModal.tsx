/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from 'react';
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
  console.log(conflicts);

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
        <div className="bg-white max-h-[400px] overflow-auto w-[500px] p-6 pb-5 rounded-2xl shadow-800 flex flex-col justify-between">
          <div>
            <div className="border-b border-Gray-50 pb-2 w-full text-sm font-medium text-Text-Primary">
              Conflict
            </div>
            <div className="flex flex-col gap-2 mt-5">
              {conflicts?.map((conflict: any, index: number) => (
                <Fragment key={index}>
                  <div className="w-full flex items-center justify-between">
                    <div className="text-xs text-Text-Primary">
                      {conflict.task_name}
                    </div>
                    <div
                      className={`flex items-center rounded-2xl px-[10px] py-[3px] gap-1 text-[10px] text-Text-Primary ${conflict.severity == 'Medium' ? 'bg-[#F9DEDC]' : conflict.severity == 'Low' ? 'bg-[#F9F7DC]' : 'bg-[#FFD8E4]'}`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${conflict.severity == 'Medium' ? 'bg-[#FFAB2C]' : conflict.severity == 'Low' ? 'bg-[#FFE500]' : 'bg-[#FC5474]'}`}
                      ></div>
                      {conflict.severity}
                    </div>
                  </div>
                  <div className="text-xs text-Text-Primary text-justify flex gap-6 mt-1">
                    <div className="text-Text-Quadruple">Reason:</div>
                    {conflict.reason}
                  </div>
                </Fragment>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
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
