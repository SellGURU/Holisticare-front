/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC } from 'react';
import TableAssignList from './TableAssignList';

interface AssignListModalProps {
  setShowModalAssignList: (value: boolean) => void;
  assignedClients: Array<any>;
}

const AssignListModal: FC<AssignListModalProps> = ({
  setShowModalAssignList,
  assignedClients,
}) => {
  return (
    <div className="flex flex-col justify-between bg-white w-[92vw] md:w-[706px] rounded-[16px] p-6">
      <div className="w-full h-full">
        <div className="flex justify-start items-center">
          <div className="text-Text-Primary font-medium">Assign List</div>
        </div>
        <div className="w-full h-[1px] bg-Boarder my-3"></div>
        <TableAssignList classData={assignedClients} />
        <div className="w-full flex justify-end items-center p-2 mt-5">
          <div
            className="text-Disable text-sm font-medium cursor-pointer"
            onClick={() => {
              setShowModalAssignList(false);
            }}
          >
            Close
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignListModal;
