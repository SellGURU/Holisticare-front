/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useState } from 'react';
import { MainModal } from '../../../Components';
import { ButtonSecondary } from '../../../Components/Button/ButtosSecondary';
import AddActivity from './AddActivity';

interface ActivityHandlerProps {
  data: Array<any>;
}

const ActivityHandler: FC<ActivityHandlerProps> = ({ data }) => {
  const [showAdd, setShowAdd] = useState(false);
  const handleCloseShowAdd = () => {
    setShowAdd(false);
  };
  const handleOpenShowAdd = () => {
    setShowAdd(true);
  };

  return (
    <>
      {data.length == 0 && (
        <>
          <div className="w-full h-full min-h-[450px] flex justify-center items-center">
            <div>
              <img src="./icons/amico.svg" alt="" />
              <div className="mt-8">
                <div className="text-Text-Primary text-center font-medium">
                  No activity existed yet.
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
        </>
      )}
      <MainModal isOpen={showAdd} onClose={handleCloseShowAdd}>
        <AddActivity onClose={handleCloseShowAdd} />
      </MainModal>
    </>
  );
};

export default ActivityHandler;
