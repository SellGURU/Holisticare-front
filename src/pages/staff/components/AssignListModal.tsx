import { FC } from 'react';
import TableAssignList from './TableAssignList';

interface AssignListModalProps {
  setShowModalAssignList: (value: boolean) => void;
}

const AssignListModal: FC<AssignListModalProps> = ({
  setShowModalAssignList,
}) => {
  return (
    <div className="flex flex-col justify-between bg-white w-[706px] rounded-[16px] p-6">
      <div className="w-full h-full">
        <div className="flex justify-start items-center">
          <div className="text-Text-Primary font-medium">Assign List</div>
        </div>
        <div className="w-full h-[1px] bg-Boarder my-3"></div>
        <TableAssignList
          classData={[
            {
              name: 'David Smith',
              id: '021548461651',
              age: 35,
              gender: 'Male',
              enroll_date: '04/25/2024',
              assign_date: '06/25/2024',
              status: 'Waiting',
            },
            {
              name: 'David Smith',
              id: '021548461651',
              age: 35,
              gender: 'Male',
              enroll_date: '04/25/2024',
              assign_date: '06/25/2024',
              status: 'In progress',
            },
            {
              name: 'David Smith',
              id: '021548461651',
              age: 35,
              gender: 'Male',
              enroll_date: '04/25/2024',
              assign_date: '06/25/2024',
              status: 'Done',
            },
            {
              name: 'David Smith',
              id: '021548461651',
              age: 35,
              gender: 'Male',
              enroll_date: '04/25/2024',
              assign_date: '06/25/2024',
              status: 'Waiting',
            },
          ]}
        />
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
