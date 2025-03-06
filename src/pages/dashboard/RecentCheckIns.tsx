import React, { useRef } from 'react';
import { useState } from 'react';
import { MainModal } from '../../Components';

import SurveySection from './components/SurveySection';
import useModalAutoClose from '../../hooks/UseModalAutoClose';

type CheckIn = {
  name: string;
  type: string;
  time: string;
  status: 'Review Now' | 'Reviewed';
};

const mockCheckIns: CheckIn[] = [
  {
    name: 'David Smith',
    type: 'Daily Check-In',
    time: '24 Mins ago',
    status: 'Review Now',
  },
  {
    name: 'Jane Cooper',
    type: 'Weekly Check-In',
    time: '31 Mins ago',
    status: 'Reviewed',
  },
  {
    name: 'Jacob Jones',
    type: 'Daily Check-In',
    time: '39 Mins ago',
    status: 'Review Now',
  },
  {
    name: 'Jenny Wilson',
    type: 'Daily Check-In',
    time: '46 Mins ago',
    status: 'Reviewed',
  },
  {
    name: 'Robert Garcia',
    type: 'Weekly Check-In',
    time: '53 Mins ago',
    status: 'Reviewed',
  },
  {
    name: 'Sarah Thompson',
    type: 'Daily Check-In',
    time: '2 Hours ago',
    status: 'Reviewed',
  },
  {
    name: 'Leslie Alexander',
    type: 'Daily Check-In',
    time: '1 Day ago',
    status: 'Reviewed',
  },
];
interface RecentCheckInsProps {}
const RecentCheckIns: React.FC<RecentCheckInsProps> = () => {
  const [showcheckInModal, setCheckInModal] = useState(false);
  const [isStickMealPlan, setisStickMealPlan] = useState(true);
  const [hoursSlept, setHoursSlept] = useState<number>(0);
  const [showCheckInCommentModal, setshowCheckICommentnModal] = useState(false);
  const [checkInComment, setCheckInComment] = useState('');
  const [showComparisonSelect, setShowComparisonSelect] = useState<boolean>(false);
  const [showComparisonSurvey, setShowComparisonSurvey] = useState<boolean>(false);
  const [comparisonData, setComparisonData] = useState<string | null>(null);
  const [CompareCheckIn, setCompareCheckIn] = useState('');
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
  const [val, setVal] = useState<number>(55);
  const [snackValue] = useState('');
  const [workHours] = useState('');

  const handleFeelingClick = (index: number) => {
    setSelectedFeeling(index);
  };

  const handleCompareClick = () => {
    setShowComparisonSelect(true);
  };

  const handleComparisonSelect = (data: string) => {
    setComparisonData(data);
    setShowComparisonSurvey(true);
    setShowSelect(false);
  };
  return (
    <>
          <MainModal
        isOpen={showcheckInModal}
        onClose={() => {
          setCheckInModal(false);
        }}
      >
        <div className="bg-white relative min-w-[500px] w-full h-[552px] rounded-2xl p-6 pb-8 shadow-800 text-Text-Primary">
          <div className="w-full flex items-center gap-2 border-b border-Gray-50 pb-2 text-sm font-medium">
            <div className="size-6 rounded-full border border-Primary-DeepTeal p-[2px]"></div>
            David Smith
          </div>
          <div className={` ${showComparisonSelect ? 'hidden' : ''} mt-4 w-full flex justify-between items-center text-xs font-medium`}>
            Daily Check-In
            <div
              onClick={handleCompareClick}
              className="flex items-center gap-1 text-xs font-medium text-Primary-DeepTeal cursor-pointer"
            >
              <img src="/icons/3square.svg" alt="" />
              Compare
            </div>
          </div>
          <div className="flex w-full gap-5 mt-5 h-[392px]">
            <SurveySection
              isStickMealPlan={isStickMealPlan}
              setisStickMealPlan={setisStickMealPlan}
              hoursSlept={hoursSlept}
              handleSliderChange={handleSliderChange}
              sliderBackground={sliderBackground}
              feelings={feelings}
              selectedFeeling={selectedFeeling}
              handleFeelingClick={handleFeelingClick}
              val={val}
              setVal={setVal}
              snackValue={snackValue}
              workHours={workHours}
            />
            <div className='flex  flex-col w-[436px]'>

     
            {showComparisonSelect &&  (
              <div className="flex flex-col relative min-w-[222px] text-xs font-medium">
                <label className="mb-1">Select Check-In</label>
                <div
                  ref={selectButRef}
                  onClick={() => setShowSelect(!showSelect)}
                  className={`w-full  cursor-pointer h-[28px] flex justify-between items-center px-3 bg-[#FDFDFD] ${
                    showSelect && 'rounded-b-none'
                  } rounded-[16px] border border-[#E9EDF5]`}
                >
                  <div className="text-[12px] text-[#383838]">
                    {CompareCheckIn || 'Choose one'}
                  </div>
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
                    {['Check in 1', 'Check in 2', 'Check in 3'].map((checkIn) => (
                      <div
                        key={checkIn}
                        onClick={() => {
                          setCompareCheckIn(checkIn);
                          handleComparisonSelect(checkIn);
                          setShowSelect(false);
                        }}
                        className="text-[12px] cursor-pointer text-Text-Primary py-1"
                      >
                        {checkIn}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {showComparisonSurvey && comparisonData && (
              <SurveySection
                isStickMealPlan={isStickMealPlan}
                setisStickMealPlan={setisStickMealPlan}
                hoursSlept={hoursSlept}
                handleSliderChange={handleSliderChange}
                sliderBackground={sliderBackground}
                feelings={feelings}
                selectedFeeling={selectedFeeling}
                handleFeelingClick={handleFeelingClick}
                val={val}
                setVal={setVal}
                snackValue={snackValue}
                workHours={workHours}
              />
            )}
                   </div>
          </div>
          <div className='w-full flex justify-end items-center gap-4 absolute right-[24px] bottom-[32px]  text-sm font-medium'>
            <div onClick={()=>setCheckInModal(false)} className='text-[#909090] cursor-pointer'>Cancel</div>
            <div onClick={()=>{
              setshowCheckICommentnModal(true)
              setCheckInModal(false)}} className='text-Primary-DeepTeal cursor-pointer'>Marked as Reviewed</div>
          </div>
        </div>
      </MainModal>
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
      <div className="w-full h-[328px] bg-white rounded-2xl shadow-200 p-4">
        <div className=" overflow-y-scroll pb-3 h-[300px] pr-2 ">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm text-Text-Primary font-medium">
              Recent Check-Ins{' '}
              <span className="text-xs text-Text-Triarty -mt-1">(2)</span>
            </h2>
            <div className="rounded-xl py-1 px-2 bg-backgroundColor-Main border border-Gray-50 text-Primary-DeepTeal text-[10px] flex items-center gap-2">
              Week <img src="/icons/arrow-down-green.svg" alt="" />
            </div>
          </div>
          <table className="w-full  ">
            <thead>
              <tr className="text-left text-xs bg-[#E9F0F2] text-Text-Primary border-Gray-50  ">
                <th className="py-2 pl-3 rounded-tl-2xl">Client Name</th>
                <th className="py-2 pl-2">Type</th>
                <th className="py-2 pl-2">Time</th>
                <th className="py-2 pl-3 rounded-tr-2xl">Status</th>
              </tr>
            </thead>
            <tbody className="border border-t-0 border-[#E9F0F2] ">
              {mockCheckIns.map((checkIn, index) => (
                <tr
                  key={index}
                  className={` ${index % 2 == 0 ? 'bg-white' : 'bg-[#F4F4F4]'} text-sm text-Text-Primary border-b`}
                >
                  <td className="py-2 pl-3 flex items-center text-[10px] text-Text-Primary">
                    <img
                      src={`https://ui-avatars.com/api/?name=${checkIn.name}`}
                      alt={checkIn.name}
                      className="w-8 h-8 rounded-full mr-[6px] border border-Primary-DeepTeal"
                    />
                    {checkIn.name}
                  </td>
                  <td className="py-2 text-Text-Secondary text-[10px]">
                    {checkIn.type}
                  </td>
                  <td className="py-2 text-Text-Secondary text-[10px]">
                    {checkIn.time}
                  </td>
                  <td
                    onClick={() => {
                      if (checkIn.status !== 'Reviewed') {
                        setCheckInModal(true);
                      }
                    }}
                    className="py-2"
                  >
                    <span
                      className={`text-[8px]  w-[65px] h-[14px] font-medium pb-[2px] py-1 px-2 rounded-full flex items-center justify-center gap-1 ${
                        checkIn.status === 'Review Now'
                          ? 'text-[#FFBD59] underline cursor-pointer'
                          : 'bg-[#DEF7EC] '
                      }`}
                    >
                      <img
                        className={`${checkIn.status !== 'Reviewed' && 'hidden'}`}
                        src="/icons/tick-green.svg"
                        alt=""
                      />
                      {checkIn.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default RecentCheckIns;
