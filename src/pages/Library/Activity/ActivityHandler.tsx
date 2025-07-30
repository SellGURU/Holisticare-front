/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from 'react';
import { MainModal } from '../../../Components';
import { ButtonSecondary } from '../../../Components/Button/ButtosSecondary';
import AddActivity from './AddActivity';
import { ActivityRow } from './AddComponents/ActivityRow';
import Application from '../../../api/app';

interface ActivityHandlerProps {
  data: Array<any>;
  onDelete: () => void;
  isShowAddActivity: boolean;
  setShowAddActivity: (show: boolean) => void;
  dataListLength: number;
}

const ActivityHandler: FC<ActivityHandlerProps> = ({
  data,
  onDelete,
  isShowAddActivity,
  setShowAddActivity,
  dataListLength,
}) => {
  const [showAdd, setShowAdd] = useState(isShowAddActivity);
  const handleCloseShowAdd = () => {
    setShowAdd(false);
    setEditid(null);
  };
  const handleOpenShowAdd = () => {
    setShowAdd(true);
  };

  useEffect(() => {
    setShowAdd(isShowAddActivity);
  }, [isShowAddActivity]);
  useEffect(() => {
    setShowAddActivity(showAdd);
  }, [showAdd]);
  const [editid, setEditid] = useState<string | null>(null);
  const onDeleteActivity = (id: string) => {
    Application.deleteActivity(id)
      .then(() => {
        onDelete();
      })
      .catch((err) => {
        console.error(err);
      });
  };
  return (
    <>
      {dataListLength === 0 ? (
        <div className="w-full h-full min-h-[450px] flex justify-center items-center">
          <div>
            <img src="./icons/amico.svg" alt="" />
            <div className="mt-8">
              <div className="text-Text-Primary text-center font-medium">
                No activity found.
              </div>
              <div className="flex justify-center mt-4">
                <ButtonSecondary
                  onClick={handleOpenShowAdd}
                  ClassName="rounded-full min-w-[180px]"
                >
                  <img src="./icons/add-square.svg" alt="" />
                  Add Activity
                </ButtonSecondary>
              </div>
            </div>
          </div>
        </div>
      ) : data.length > 0 ? (
        <div className="mt-6 h-[540px] overflow-auto">
          <table className="w-full  ">
            <thead className="w-full">
              <tr className="text-left text-xs bg-[#F4F4F4] text-Text-Primary border-Gray-50 w-full ">
                <th className="py-3 pl-4 w-[160px] rounded-tl-2xl text-nowrap">
                  Title
                </th>
                <th className="py-3 w-[250px] text-center text-nowrap">
                  Instruction
                </th>
                <th className="py-3 w-[150px] text-center pl-2 text-nowrap">
                  Section
                </th>
                <th className="py-3 w-[66px] text-center pl-3 text-nowrap">
                  Priority Weight
                </th>
                <th className="py-3 w-[250px] text-center text-nowrap">
                  Clinical Guidance
                </th>
                <th className="py-3 w-[100px] text-center pl-3 text-nowrap">
                  Added on
                </th>
                <th className="py-3 w-[80px] text-center pl-3 rounded-tr-2xl text-nowrap">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="border border-t-0 border-[#E9F0F2]">
              {data.map((exercise, index) => (
                <ActivityRow
                  key={index}
                  exercise={exercise}
                  index={index}
                  onDelete={() => onDeleteActivity(exercise.Act_Id)}
                  onEdit={() => {
                    setShowAdd(true);
                    setEditid(exercise.Act_Id);
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="w-full h-full h-sm:h-[500px] flex flex-col justify-center items-center text-base font-medium text-Text-Primary ">
          <img src="/icons/search-status.svg" alt="" />
          <span className="-mt-6"> No results found.</span>
        </div>
      )}

      <MainModal isOpen={showAdd} onClose={handleCloseShowAdd}>
        <AddActivity
          editid={editid}
          onSave={() => {
            handleCloseShowAdd();
            onDelete();
          }}
          onClose={handleCloseShowAdd}
        />
      </MainModal>
    </>
  );
};

export default ActivityHandler;
