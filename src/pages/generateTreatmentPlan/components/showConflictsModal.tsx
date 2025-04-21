import React from 'react';
import { MainModal } from '../../../Components';
interface showConflictsModalProps {
  showModal: boolean;
  onClose: () => void;
  conflictData: Array<any>;
}
export const ShowConflictsModal: React.FC<showConflictsModalProps> = ({
  showModal,
  onClose,
  conflictData,
}) => {
  const getCircleColor = (priority: string) => {
    switch (priority) {
      case 'Low':
        return 'bg-[#FFE500]'; // Blue for low priority
      case 'Medium':
        return 'bg-[#FFAB2C]'; // Yellow for medium priority
      case 'High':
        return 'bg-[#FC5474]'; // Red for high priority
      default:
        return 'bg-[#FFE500]'; // Default color for the circle
    }
  };
  const getBackgroundColor = (priority: string) => {
    switch (priority) {
      case 'Low':
        return 'bg-[#F9F7DC]'; // Light blue for the parent div
      case 'Medium':
        return 'bg-[#F9DEDC]'; // Light yellow for the parent div
      case 'High':
        return 'bg-[#FFD8E4]'; // Light red for the parent div
      default:
        return 'bg-[#F9F7DC]'; // Default color for the parent div
    }
  };

  return (
    <MainModal isOpen={showModal} onClose={onClose}>
      <div className="bg-white w-[500px] h-[666px] rounded-2xl p-4 shadow-800 relative">
        <div className="border-b border-Gray-50 pb-2 text-sm font-medium text-Text-Primary">
          Conflict
        </div>
        <div className="h-[580px] overflow-auto mt-3 flex flex-col ">
          {conflictData.map((el) => (
            <div className="mb-10">
              <div className="flex w-full justify-between">
                <div className="text-xs font-medium text-Text-Primary">
                  {el.title}
                </div>
                <div
                  className={`rounded-full py-[2px] px-2.5 flex items-center gap-1 text-[10px] text-Text-Primary ${getBackgroundColor(el.priority)}`}
                >
                  <div
                    className={`size-3 rounded-full ${getCircleColor(el.priority)}`}
                  ></div>
                  {el.priority}
                </div>
              </div>
              <div className="flex w-full items-start gap-6 mt-5">
                <div className="text-xs text-Text-Secondary">Reason:</div>
                <div className="text-justify text-xs text-Text-Primary">
                  {el.reason}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div
          onClick={() => {
            onClose();
          }}
          className="cursor-pointer text-[#909090] font-medium text-sm absolute right-4 bottom-4"
        >
          close
        </div>
      </div>
    </MainModal>
  );
};
