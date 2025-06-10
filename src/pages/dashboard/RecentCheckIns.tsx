/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react';
import { useState } from 'react';
import { MainModal } from '../../Components';
import './RecentCheckIns.css';

import useModalAutoClose from '../../hooks/UseModalAutoClose';
import { Dropdown } from '../../Components/DropDown';
import Checkin from '../CheckIn';
import DashboardApi from '../../api/Dashboard';
import { Tooltip } from 'react-tooltip';

type CheckIn = {
  name: string;
  picture: string;
  Type: string;
  filled_checkin_id: string;
  Time: string;
  Status: 'Review Now' | 'Reviewed';
};
// const formData = {
//   title: 'Daily Check in',
//   questions: [
//     {
//       type: 'paragraph',
//       question: 'Did you stick to the Meal Plan?',
//       required: false,
//       response: '',
//       placeHolder: 'Write the snacks you took ...',
//     },
//     {
//       type: 'Scale',
//       question: 'How many hours did you sleep yesterday?',
//       required: false,
//       response: '',
//     },
//     {
//       type: 'Emojis',
//       question: 'How are you feeling today?',
//       required: false,
//       response: '',
//     },
//     {
//       type: 'Star Rating',
//       question: 'Rate your workout.',
//       required: false,
//       response: '',
//     },
//     {
//       type: 'File Uploader',
//       question: 'Upload your progress pictures.',
//       required: false,
//       response: '',
//     },
//     {
//       type: 'paragraph',
//       question: 'What snacks did you take today?',
//       required: false,
//       response: '',
//       placeHolder: 'Write the snacks you took ...',
//     },
//     {
//       type: 'paragraph',
//       question: 'How many hours did you work today?(Dropdown sample)',
//       required: false,
//       response: '',
//       placeHolder: 'Write the snacks you took ...',
//     },
//   ],
// };

const RecentCheckIns = () => {
  const [CheckIns, setCheckIns] = useState<CheckIn[]>([]);
  const [showcheckInModal, setCheckInModal] = useState(false);
  // const [isStickMealPlan, setisStickMealPlan] = useState(true);
  // const [hoursSlept, setHoursSlept] = useState<number>(0);
  const [showCheckInCommentModal, setshowCheckICommentnModal] = useState(false);
  const [checkInComment, setCheckInComment] = useState('');
  const [showComparisonSelect, setShowComparisonSelect] =
    useState<boolean>(false);
  const [showComparisonSurvey, setShowComparisonSurvey] =
    useState<boolean>(false);
  const [CompareCheckIn, setCompareCheckIn] = useState('');
  const [CompareCheckinsList, setCompareCheckinsList] = useState<any[]>([]);
  const selectRef = useRef(null);
  const selectButRef = useRef(null);
  const [showSelect, setShowSelect] = useState(false);
  const [currentCheckIn, setCurrentCheckIn] = useState<CheckIn | null>(null);
  const [selectedOption, setSelectedOption] = useState('Week');
  const options = ['Day', 'Week', 'Month'];
  const [Questions, setQuestions] = useState<any[]>([]);
  const [CompareQuestions, setCompareQuestions] = useState<any[]>([]);
  useModalAutoClose({
    refrence: selectRef,
    buttonRefrence: selectButRef,
    close: () => {
      setShowSelect(false);
    },
  });
  useEffect(() => {
    DashboardApi.getCheckinList({
      time_filter: selectedOption,
    }).then((res) => {
      setCheckIns(res.data);
    });
  }, [selectedOption]);
  // const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setHoursSlept(Number(event.target.value));
  // };

  // const sliderBackground = {
  //   background: `linear-gradient(to right, #6CC24A ${hoursSlept * 10}%, #e5e7eb ${hoursSlept * 10}%)`,
  // };

  // const feelings = [
  //   { emoji: '/images/emoji/angry-emoji.svg', text: 'Angry' },
  //   { emoji: '/images/emoji/sad-emoji.svg', text: 'Sad' },
  //   { emoji: '/images/emoji/poker-emoji.svg', text: 'Neutral' },
  //   { emoji: '/images/emoji/smile-emoji.svg', text: 'Happy' },
  //   { emoji: '/images/emoji/loved-emoji.svg', text: 'Loved' },
  // ];

  // const [selectedFeeling, setSelectedFeeling] = useState<
  //   'Angry' | 'Sad' | 'Neutral' | 'Smile' | 'Loved' | string
  // >('Neutral');

  // Default to Neutral
  // const [val, setVal] = useState<number>(55);
  // const [snackValue] = useState('');
  // const [workHours] = useState('');

  // const handleFeelingClick = (index: number) => {
  //   setSelectedFeeling(index);
  // };

  const handleCompareClick = () => {
    setShowComparisonSelect(true);
    DashboardApi.compareCheckin({
      filled_checkin_id: currentCheckIn?.filled_checkin_id,
    }).then((res) => {
      setCompareCheckinsList(res.data);
    });
  };

  const handleCheckInClick = (checkIn: CheckIn) => {
    if (checkIn.Status === 'Review Now') {
      DashboardApi.getFilledCheckin({
        filled_checkin_id: checkIn.filled_checkin_id,
      }).then((res) => {
        setQuestions(res.data);
        setCurrentCheckIn(checkIn);
        setCheckInModal(true);
      });
    }
  };

  const handleMarkAsReviewed = () => {
    if (currentCheckIn) {
      DashboardApi.markAsReviewd({
        filled_checkin_id: currentCheckIn.filled_checkin_id,
      }).then(() => {
        setCheckIns((prevCheckIns) =>
          prevCheckIns.map((ci) =>
            ci.filled_checkin_id === currentCheckIn.filled_checkin_id
              ? { ...ci, Status: 'Reviewed' }
              : ci,
          ),
        );
        setCheckInModal(false);
        setshowCheckICommentnModal(true);
      });

      // resetModalStates();
    }
  };
  // const resetModalStates = () => {
  //   setisStickMealPlan(true);
  //   setHoursSlept(0);
  //   setSelectedFeeling('Neutral');
  //   setVal(55);
  //   setShowComparisonSelect(false);
  //   setShowComparisonSurvey(false);
  //   setComparisonData(null);
  //   setCompareCheckIn('');
  //   setShowSelect(false);
  // };
  console.log(CompareQuestions);

  return (
    <>
      <MainModal
        isOpen={showcheckInModal}
        onClose={() => {
          setCheckInModal(false);
          // resetModalStates();
        }}
      >
        <div className="bg-white relative min-w-[500px] w-full h-[552px] rounded-2xl p-6 pb-8 shadow-800 text-Text-Primary">
          <div className="w-full flex items-center gap-2 border-b border-Gray-50 pb-2 text-sm font-medium">
            <div className="size-6 rounded-full border border-Primary-DeepTeal p-[2px]">
              <img
                src={`https://ui-avatars.com/api/?name=${currentCheckIn?.name}`}
                alt={currentCheckIn?.name}
                className="rounded-full"
              />
            </div>
            {currentCheckIn?.name}
          </div>
          <div
            className={` ${showComparisonSelect ? 'hidden' : ''} mt-4 w-full flex justify-between items-center text-xs font-medium`}
          >
            Daily Check-In
            <div
              onClick={handleCompareClick}
              className="flex items-center gap-1 text-xs font-medium text-Primary-DeepTeal cursor-pointer"
            >
              <img src="/icons/3square.svg" alt="" />
              Compare
            </div>
          </div>
          <div className="flex w-full gap-5 mt-5 h-[392px] overflow-auto">
            <div className={`${showComparisonSelect ? 'w-[50%]' : 'w-full'}`}>
              <Checkin upData={Questions}></Checkin>
              {/* <SurveySection
                isStickMealPlan={isStickMealPlan}
                setisStickMealPlan={setisStickMealPlan}
                hoursSlept={hoursSlept}
                handleSliderChange={handleSliderChange}
                sliderBackground={sliderBackground}
                selectedFeeling={selectedFeeling}
                setFeeling={(value) => setSelectedFeeling(value)}
                val={val}
                setVal={setVal}
                snackValue={snackValue}
                workHours={workHours}
              /> */}
            </div>
            <div
              className={`flex  flex-col w-[436px]  ${!showComparisonSelect && 'hidden'}`}
            >
              {showComparisonSelect && (
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
                      {CompareCheckinsList.map((checkIn) => (
                        <div
                          key={checkIn}
                          onClick={() => {
                            setShowComparisonSurvey(false);
                            DashboardApi.showCompareCheckin({
                              filled_checkin_id: checkIn.filled_checkin_id,
                            }).then((res) => {
                              setCompareCheckIn(checkIn.filled_checkin_name);
                              setCompareQuestions(res.data);
                              setShowComparisonSurvey(true);
                              setShowSelect(false);

                              setShowSelect(false);
                            });
                          }}
                          className="text-[12px] cursor-pointer text-Text-Primary py-1"
                        >
                          {checkIn.filled_checkin_name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {showComparisonSurvey && CompareQuestions && (
                <Checkin upData={CompareQuestions}></Checkin>

                // <SurveySection
                //   setFeeling={(value) => setSelectedFeeling(value)}
                //   isStickMealPlan={isStickMealPlan}
                //   setisStickMealPlan={setisStickMealPlan}
                //   hoursSlept={hoursSlept}
                //   handleSliderChange={handleSliderChange}
                //   sliderBackground={sliderBackground}
                //   selectedFeeling={selectedFeeling}
                //   val={val}
                //   setVal={setVal}
                //   snackValue={snackValue}
                //   workHours={workHours}
                // />
              )}
            </div>
          </div>
          <div className="w-full flex justify-end items-center gap-4 absolute right-[24px] bottom-[24px] text-sm font-medium">
            <div
              onClick={() => setCheckInModal(false)}
              className="text-[#909090] cursor-pointer"
            >
              Cancel
            </div>
            <div
              onClick={handleMarkAsReviewed}
              className="text-Primary-DeepTeal cursor-pointer"
            >
              Marked as Reviewed
            </div>
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
                DashboardApi.saveCoachComment({
                  filled_checkin_id: currentCheckIn?.filled_checkin_id,
                  coach_comment: checkInComment,
                }).then(() => {
                  setCheckInComment('');
                  setshowCheckICommentnModal(false);
                });
              }}
              className="text-sm font-medium text-Primary-DeepTeal cursor-pointer"
            >
              Save
            </div>
          </div>
        </div>
      </MainModal>
      <div className="w-full bg-white rounded-2xl shadow-200 p-4 recent-checkins-container">
        <div
          className={`${CheckIns.length < 1 ? 'overflow-hidden' : 'overflow-auto'} pr-2 recent-checkins-content`}
        >
          <div className="flex  justify-between items-center mb-4">
            <h2 className="text-sm text-Text-Primary font-medium">
              Recent Check-ins
              <span className="text-xs text-Text-Triarty ml-1 -mt-1">
                ({CheckIns.length})
              </span>
            </h2>
            <Dropdown
              options={options}
              selectedOption={selectedOption}
              onOptionSelect={setSelectedOption}
            />
          </div>
          {CheckIns.length < 1 ? (
            <div className=" w-full  flex flex-col items-center justify-center">
              <img src="/icons/EmptyState2.svg" alt="" />
              <div className="text-xs text-Text-Primary -mt-4 text-center">
                No Data Found
              </div>
            </div>
          ) : (
            <table className="w-full  ">
              <thead>
                <tr className="text-left text-xs bg-[#E9F0F2] text-Text-Primary border-Gray-50  ">
                  <th className="py-2 pl-3  text-[10px] rounded-tl-2xl">
                    Client Name
                  </th>
                  <th className="py-2 pl-2 text-[10px]">Title</th>
                  <th className="py-2 pl-2 text-[10px]">Time</th>
                  <th className="py-2 pl-5 rounded-tr-2xl text-[10px]  ">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="border border-t-0 border-[#E9F0F2] ">
                {CheckIns.map((checkIn, index) => (
                  <tr
                    key={index}
                    className={` ${index % 2 == 0 ? 'bg-white' : 'bg-[#F4F4F4]'} text-sm text-Text-Primary border-b`}
                  >
                    <td className="py-2 pl-3 flex items-center text-[10px] text-Text-Primary max-w-[120px]">
                      <img
                        src={`https://ui-avatars.com/api/?name=${checkIn.name}`}
                        alt={checkIn.name}
                        className="w-8 h-8 rounded-full mr-[6px] border border-Primary-DeepTeal"
                      />
                      {checkIn.name}
                      {checkIn.name.length > 40 && (
                        <Tooltip
                          place="top"
                          id={'name'}
                          className="!bg-white !w-fit  !text-wrap 
                        !text-[#888888]  !text-[8px] !rounded-[6px] !border !border-Gray-50 !p-2"
                        >
                          {checkIn.name}
                        </Tooltip>
                      )}
                    </td>
                    <td className="py-2 text-Text-Secondary text-[10px]">
                      {checkIn.Type}
                    </td>
                    <td className="py-2 text-Text-Secondary text-[10px]">
                      {checkIn.Time}
                    </td>
                    <td
                      onClick={() => handleCheckInClick(checkIn)}
                      className="py-2"
                    >
                      <span
                        className={`text-[10px]  w-[75px] h-[14px] font-medium pb-[2px] py-1 px-2 rounded-full flex items-center justify-center gap-1 ${
                          checkIn.Status === 'Review Now'
                            ? 'text-[#FFAB2C] underline cursor-pointer'
                            : 'bg-[#DEF7EC] '
                        }`}
                      >
                        <img
                          className={`${checkIn.Status !== 'Reviewed' && 'hidden'}`}
                          src="/icons/tick-green.svg"
                          alt=""
                        />
                        {checkIn.Status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
};

export default RecentCheckIns;
