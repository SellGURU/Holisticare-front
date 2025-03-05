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
  const [showCheckInCommentModal, setshowCheckICommentnModal] = useState(false);
  const [checkInComment, setCheckInComment] = useState('');
  console.log(checkInComment);

  const [showcheckInModal, setCheckInModal] = useState(false);
  const [isStickMealPlan, setisStickMealPlan] = useState(true);
  const [hoursSlept, setHoursSlept] = useState<number>(0);

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHoursSlept(Number(event.target.value));
  };
  const sliderBackground = {
    background: `linear-gradient(to right, #6CC24A ${hoursSlept * 10}%, #e5e7eb ${hoursSlept * 10}%)`,
  };
  const feelings = [
    { emoji: '/images/emoji/angry-emoji.svg', text: 'Angry' },
    { emoji: '/images/emoji/sad-emoji.svg', text: 'Sad' },
    { emoji: '/images/emoji/poker-emoji.svg', text: 'Neutral' },
    { emoji: '/images/emoji/smile-emoji.svg', text: 'Happy' },
    { emoji: '/images/emoji/loved-emoji.svg', text: 'Loved' },
  ];
  const [selectedFeeling, setSelectedFeeling] = useState<number | null>(2); // Default to Neutral

  const handleFeelingClick = (index: number) => {
    setSelectedFeeling(index);
  };
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
      <MainModal
        isOpen={showCheckInCommentModal}
        onClose={() => setshowCheckICommentnModal(false)}
      >
        <div className="w-[500px] h-[324px] rounded-2xl p-6 pb-8 bg-white shadow-800 text-Text-Primary relative">
          <div className="flex items-center pb-2 w-full text-sm font-medium border-b border-Gray-50  ">
            Check-In Review
          </div>
          <div className="mt-4 w-full">
            <label className="text-xs font-medium flex items-center gap-1 mb-2">
              Leave a Comment{' '}
              <span className="text-Text-Secondary text-[10px] font-normal">
                (Client can view this)
              </span>
            </label>
            <textarea
              value={checkInComment}
              onChange={(e) => setCheckInComment(e.target.value)}
              placeholder="Write a Comment for Client ..."
              className="w-full h-[140px] bg-[#FDFDFD] border border-Gray-50 rounded-2xl outline-none text-xs placeholder:text-[#B0B0B0] placeholder:font-light py-1 px-3 resize-none"
            />
          </div>
          <div className="flex justify-end w-full gap-2 absolute bottom-[32px] right-[24px]">
            <div
              onClick={() => {
                setCheckInComment('');
                setshowCheckICommentnModal(false);
              }}
              className="text-sm font-medium text-[#909090] cursor-pointer"
            >
              Ignore
            </div>
            <div
              onClick={() => {
                setCheckInComment('');
                setshowCheckICommentnModal(false);
              }}
              className="text-sm font-medium text-Primary-DeepTeal cursor-pointer"
            >
              Save
            </div>
          </div>
        </div>
      </MainModal>

      {/* Check in Modal */}
      <MainModal
        isOpen={showcheckInModal}
        onClose={() => {
          setshowCheckICommentnModal(true);
          setCheckInModal(false);
        }}
      >
        <div className="bg-white min-w-[500px] w-full h-[552px] rounded-2xl p-6 pb-8 shadow-800 text-Text-Primary">
          <div className="w-full flex items-center gap-2 border-b borderz-Gray-50 pb-2 text-sm font-medium">
            <div className="size-6 rounded-full border border-Primary-DeepTeal p-[2px]"></div>
            David Smith
          </div>
          <div className="mt-4 w-full flex justify-between items-center text-xs font-medium">
            Daily Check-In
            <div className="flex items-center gap-1 text-xs font-medium text-Primary-DeepTeal cursor-pointer">
              <img src="/icons/3square.svg" alt="" />
              Compare
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2 h-[370px] overflow-auto">
            <div className="bg-[#FCFCFC] rounded-xl p-3 border border-Gray-50">
              <div className="text-[10px]">
                1.Did you stick to the Meal Plan?
              </div>
              <div className="mt-3 w-[96px] h-8 border border-Gray-50 flex text-[10px] ">
                <div
                  onClick={() => setisStickMealPlan(true)}
                  className={` ${isStickMealPlan ? 'text-white bg-gradient-to-r from-[#99C7AF]  to-[#AEDAA7]' : ''}  cursor-pointer flex justify-center items-center w-[50%]`}
                >
                  Yes
                </div>
                <div
                  onClick={() => setisStickMealPlan(false)}
                  className={` ${!isStickMealPlan ? 'text-white bg-gradient-to-r from-[#99C7AF]  to-[#AEDAA7]' : ''} cursor-pointer flex justify-center items-center w-[50%]`}
                >
                  No
                </div>
              </div>
            </div>
            <div className="bg-[#FCFCFC] rounded-xl p-3 border border-Gray-50">
              <div className="text-[10px] mb-4">
                2.How many hours did you sleep yesterday?
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={hoursSlept}
                onChange={handleSliderChange}
                style={sliderBackground}
                className="w-full appearance-none bg-[#E9EDF5] rounded-full h-[2px] slider-thumb-green"
              />
              <div className="flex justify-between mt-2 text-[10px] text-[#888888]">
                {Array.from({ length: 11 }, (_, i) => (
                  <span key={i}>{i === 10 ? '>10' : i}</span>
                ))}
              </div>
            </div>
            <div className="bg-[#FCFCFC] rounded-xl p-3 border border-Gray-50">
              <div className="text-[10px]">3.How are you feeling today?</div>
              <div className="bg-white rounded-[20px] p-4 pb-2 drop-shadow mt-3 overflow-x-hidden relative">
              <img className='absolute  inset-0 -left-2 w-full opacity-30 -z-10 h-[70px]' src="/images/Union.svg" alt="" />
              <div className="flex items-center justify-between overflow-auto  relative">
              
                {feelings.map((feeling, index) => (
                  <div
                    key={index}
                    className={`flex flex-col items-center cursor-pointer ${selectedFeeling === index ? '' : ''}`}
                    onClick={() => handleFeelingClick(index)}
                  >
                    <img src={feeling.emoji} alt="" />
                    
                      <span className={`mt-2 text-sm font-medium text-Primary-DeepTeal ${selectedFeeling === index  ? 'block' : 'invisible'}`}>
                        {feeling.text}
                      </span>
                  
                  </div>
                ))}
              </div>
            </div>
            </div>
            
          </div>
        </div>
      </MainModal>
      <div className="px-6 py-10">
        <NumberBoxes reports={[]}></NumberBoxes>
        <div className="w-full  mt-4 grid gap-4 grid-cols-4">
          {/* <MessageList /> */}
          <Actions></Actions>
          <div className="col-span-2 grid gap-4">
            <RecentCheckIns
              onCheckIn={() => {
                setCheckInModal(true);
              }}
            ></RecentCheckIns>
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
