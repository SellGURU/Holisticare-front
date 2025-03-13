import { useState } from 'react';
import { MainModal } from '../../../Components';
import { ButtonSecondary } from '../../../Components/Button/ButtosSecondary';
import AddActivity from './AddActivity';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface ActivityHandlerProps {
  data: Array<any>;
}

const ActivityHandler: React.FC<ActivityHandlerProps> = ({ data }) => {
  const [showAdd,setShowAdd] = useState(false)
  
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
                  <ButtonSecondary onClick={() => {
                    setShowAdd(true)
                  }} ClassName="rounded-full min-w-[180px]">
                    <img src="./icons/add-square.svg" alt="" />
                    Add Activity
                  </ButtonSecondary>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      <MainModal isOpen={showAdd} onClose={() => {
        setShowAdd(false)
      }}>
        <AddActivity onClose={() => {
          setShowAdd(false)  
        }}></AddActivity>
      </MainModal>
    </>
  );
};

export default ActivityHandler;
