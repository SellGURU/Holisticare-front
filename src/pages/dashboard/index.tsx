// import { useState } from 'react';
import { useRef, useState } from 'react';
import {
  NumberBoxes,
  // MessageList,
  Clients,
  // Reminder,
  Employes,
  TaskManager,
} from '../../Components/DashBoardComponents';
import Actions from './Actions';
import RecentCheckIns from './RecentCheckIns';
import { MainModal } from '../../Components';
import TextField from '../../Components/TextField';
import SimpleDatePicker from '../../Components/SimpleDatePicker';
import useModalAutoClose from '../../hooks/UseModalAutoClose';

const DashBoard = () => {
  // const [reports, setreports] = useState()

  // const [filters] = useState({
  //   priority: { high: false, medium: false, low: false },
  //   progress: { inProgress: false, toDo: false },
  //   date: { from: null, to: null },
  // });

  // Add Task Modal Section
  const [showAddTaskModal, setshowAddTaskModal] = useState(false);
  const [tasktitle, setTasktitle] = useState('');
  const [deadline, setDeadline] = useState<Date | null>(null);
  const selectRef = useRef(null);
  const selectButRef = useRef(null);
  const [showSelect, setShowSelect] = useState(false);
  useModalAutoClose({
    refrence: selectRef,
    buttonRefrence: selectButRef,
    close: () => {
      setShowSelect(false);
    },
  });
  const [Priority, setPriority] = useState('High');

  // End Add Task Section

  return (
    <>
      {/* Add Task Modal */}
      <MainModal
        isOpen={showAddTaskModal}
        onClose={() => setshowAddTaskModal(false)}
      >
        <div className="bg-white rounded-2xl w-[500px] h-[267px] p-6 pb-8 shadow-800 text-Text-Primary relative">
          <div className="w-full border-b border-Gray-50 text-sm pb-2 font-medium mb-4">
            Add New Task
          </div>

          <TextField
            newStyle
            value={tasktitle}
            onChange={(e) => {
              setTasktitle(e.target.value);
            }}
            label=" Task Title"
            type="text"
            placeholder="Write your task title ..."
          />
          <div className="w-full flex items-center mt-4 gap-3">
            <div className="flex flex-col min-w-[222px] text-xs font-medium">
              <label className="mb-1">Deadline</label>
              <SimpleDatePicker
                isLarge
                date={deadline}
                setDate={setDeadline}
                placeholder="Deadline"
              />
            </div>
            <div className="flex flex-col  relative min-w-[222px] text-xs font-medium">
              <label className="mb-1">Priority</label>
              <div
                ref={selectButRef}
                onClick={() => {
                  setShowSelect(!showSelect);
                }}
                className={` w-full   md:w-[222px] cursor-pointer h-[28px] flex justify-between items-center px-3 bg-[#FDFDFD] ${showSelect && 'rounded-b-none'} rounded-[16px] border border-[#E9EDF5]`}
              >
                <div className="text-[12px] text-[#383838]">{Priority}</div>

                <div>
                  <img
                    className={`${showSelect && 'rotate-180'}`}
                    src="/icons/arow-down-drop.svg"
                    alt=""
                  />
                </div>
              </div>
              {showSelect && (
                <div
                  ref={selectRef}
                  className="w-full z-20 shadow-200 p-2 rounded-[16px] rounded-t-none absolute bg-white border border-[#E9EDF5] top-[47px]"
                >
                  <div
                    onClick={() => {
                      setPriority('High');
                      setShowSelect(false);
                    }}
                    className="text-[12px] cursor-pointer text-Text-Primary py-1 
                          "
                  >
                    High
                  </div>
                  <div
                    onClick={() => {
                      setPriority('Medium');
                      setShowSelect(false);
                    }}
                    className="text-[12px] cursor-pointer text-Text-Primary py-1"
                  >
                    Medium
                  </div>
                  <div
                    onClick={() => {
                      setPriority('Low');
                      setShowSelect(false);
                    }}
                    className="text-[12px] cursor-pointer text-Text-Primary py-1"
                  >
                    Low
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="w-full flex justify-end absolute right-[24px] bottom-[32px] gap-3 ">
            <div
              onClick={() => {
                setshowAddTaskModal(false);
              }}
              className="text-sm font-medium text-[#909090] cursor-pointer"
            >
              Cancel
            </div>
            <div
              onClick={() => {
                setshowAddTaskModal(false);
              }}
              className="text-sm font-medium text-Primary-DeepTeal cursor-pointer"
            >
              Add Task
            </div>
          </div>
        </div>
      </MainModal>
      {/* Check-In Comment Modal */}

      {/* Check in Modal */}
      <div className="px-6 py-10">
        <NumberBoxes reports={[]}></NumberBoxes>
        <div className="w-full  mt-4 grid gap-4 grid-cols-4">
          {/* <MessageList /> */}
          <Actions></Actions>
          <div className="col-span-2 grid gap-4">
            <RecentCheckIns></RecentCheckIns>
            {/* <Reminder></Reminder> */}

            <TaskManager
              onAdd={() => {
                setshowAddTaskModal(true);
              }}
            />
          </div>
          <div className=" grid gap-4">
            <Clients></Clients>

            <Employes></Employes>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashBoard;
