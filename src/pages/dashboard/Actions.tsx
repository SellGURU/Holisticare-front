import React, { useEffect, useRef, useState } from 'react';
import Circleloader from '../../Components/CircleLoader';
import { Dropdown } from '../../Components/DropDown';
import DashboardApi from '../../api/Dashboard';
import { Tooltip } from 'react-tooltip';
import './Actions.css';
import { useNavigate } from 'react-router-dom';
// import { useNavigate } from 'react-router-dom';

type Action = {
  patient_name: string;
  state: 'Resolved' | 'Pending';
  alert: string;
  member_id: string;
  destination: string
};

// const mockActions: Action[] = [
//   {
//     name: 'Esther Howard',
//     status: 'Resolved',
//     action: 'Adjust his exercise program and provide an alternative plan...',
//   },
//   {
//     name: 'Darrell Steward',
//     status: 'Pending',
//     action: 'Create a contingency plan for...',
//   },
// ];

const Actions: React.FC = () => {
  const [Actions, setActions] = useState<Action[]>([]);
  const [selectedOption, setSelectedOption] = useState('Week');

  useEffect(() => {
    DashboardApi.getActionsList({
      time_filter: selectedOption,
    }).then((res) => {
      setActions(res.data);
    });
  }, [selectedOption]);
  const [filter, setFilter] = useState<'All' | 'Resolved' | 'Pending'>('All');
  const [isLoading] = useState<boolean>(false);

  const filteredActions = Actions.filter((action) =>
    filter === 'All' ? true : action.state === filter,
  );
  const options = ['Day', 'Week', 'Month'];
  const [expandedCards, setExpandedCards] = useState<number[]>([]);
  const toggleExpand = (index: number) => {
    setExpandedCards((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };
  // const [, setOverflowingIndices] = useState<number[]>([]);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);

  // useEffect(() => {
  //   const checkOverflow = () => {
  //     const newOverflowing: number[] = [];
  //     textRefs.current.forEach((el, index) => {
  //       if (el && el.scrollWidth > el.clientWidth) {
  //         newOverflowing.push(index);
  //       }
  //     });
  //     setOverflowingIndices(newOverflowing);
  //   };

  //   checkOverflow();
  //   window.addEventListener('resize', checkOverflow);
  //   return () => window.removeEventListener('resize', checkOverflow);
  // }, [filteredActions, expandedCards]);
const navigate = useNavigate()
  return (
    <>
      {isLoading ? (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-85 z-20">
          <Circleloader />
        </div>
      ) : (
        <div
          className="w-full overflow-hidden bg-white rounded-2xl shadow-200 p-3 xl:p-4 action-container"
          style={{ height: window.innerHeight - 250 + 'px' }}
        >
          <div className="flex w-full justify-between">
            <h2 className="text-sm text-Text-Primary font-medium">
              Actions Needed
            </h2>
            <Dropdown
              options={options}
              selectedOption={selectedOption}
              onOptionSelect={setSelectedOption}
            />
          </div>

          <div className="w-full  flex mt-3 ">
            {['All', 'Resolved', 'Pending'].map((type) => (
              <div
                key={type}
                onClick={() =>
                  setFilter(type as 'All' | 'Resolved' | 'Pending')
                }
                className={`${
                  type === 'All'
                    ? 'rounded-tl-xl rounded-bl-xl'
                    : type === 'Pending'
                      ? 'rounded-tr-xl rounded-br-xl'
                      : ''
                } w-full text-center px-3 xl:px-4 py-2 border text-xs cursor-pointer ${
                  filter === type
                    ? 'bg-backgroundColor-Main  border-Primary-DeepTeal'
                    : 'border-[#E2F1F8] bg-white'
                }`}
              >
                {type}
              </div>
            ))}
          </div>
          {filteredActions.length < 1 ? (
            <>
              <div className="w-full pr-1 xl:pr-2 flex flex-col items-center justify-center actions-empty-state">
                <img src="/icons/EmptyState2.svg" alt="" />
                <div className="text-xs text-Text-Primary -mt-4 text-center">
                  No Data Found
                </div>
              </div>
            </>
          ) : (
            <ul className="mt-5 w-full overflow-y-scroll pr-1 xl:pr-2 actions-list">
              {filteredActions.map((action, index) => (
                <li
                  key={index}
                  className="mb-5 rounded-xl pb-2 bg-white border border-Gray-50 shadow-100 w-full "
                >
                  <div className="w-full flex justify-between items-center py-1 pb-2 px-[10px] xl:px-4 bg-backgroundColor-Card border-b border-Gray-50 text-[10px]  font-medium text-Text-Primary rounded-t-xl">
                    <div
                      data-tooltip-id={action.patient_name}
                      className="truncate max-w-[160px]"
                    >
                      {action.patient_name}
                    </div>
                    {action.patient_name.length > 40 && (
                      <Tooltip
                        id={action.patient_name}
                        className="!bg-white !w-fit  !text-wrap 
                        !text-[#888888] !z-[99]  !text-[8px] !rounded-[6px] !border !border-Gray-50 !p-2"
                      >
                        {action.patient_name}
                      </Tooltip>
                    )}

                    {/* <div className="px-2 rounded-full flex h-[14px] bg-orange-200 items-center text-[8px] text-Text-Primary gap-[2px]">
                        <div className="rounded-full size-2 bg-red-500"></div>
                        {action.status}
                      </div> */}
                    <div className="flex items-center gap-3">
                      <div
                        className={`text-center rounded-full py-[2px] px-1.5 md:px-2.5 text-[8px] md:text-[10px] w-fit text-black text-nowrap flex items-center gap-1 ${action.state === 'Resolved' ? 'bg-[#DEF7EC]' : 'bg-[#F9DEDC]'}`}
                      >
                        <div
                          className={` w-3 h-3 rounded-full  ${action.state === 'Resolved' ? 'bg-[#06C78D]' : 'bg-[#FFBD59]'}`}
                        ></div>
                        {action.state}
                      </div>
                      <img
                        className={`size-3 cursor-pointer transform transition-transform  ${expandedCards.includes(index) ? 'rotate-180' : ''}`}
                        src="/icons/arrow-down-blue.svg"
                        alt=""
                        onClick={() => toggleExpand(index)}
                      />
                    </div>
                  </div>
                  <div
                    className={`text-[10px] text-Text-Secondary flex items-start justify-between gap-4 mt-2 transition-all xl:px-4 px-[10px] pr-5 ${
                      expandedCards.includes(index)
                        ? 'h-auto'
                        : 'h-[20px] overflow-hidden'
                    }`}
                  >
                    <div
                      ref={(el) => (textRefs.current[index] = el)}
                      className={` text-justify ${
                        expandedCards.includes(index)
                          ? 'whitespace-normal max-w-[180px]'
                          : 'truncate max-w-[150px]'
                      }`}
                    >
                      {action.alert}
                    </div>

                    <div className="flex items-center gap-2">
                      {action.state === 'Pending' && (
                        <div onClick={()=>{
                          if(action.destination === "action_plan"){
                            navigate(`/report/${action.member_id}/${action.patient_name}?section=Action+Plan`)
                          }
                          if(action.destination === "holistic_plan"){
                            navigate(`/report/${action.member_id}/${action.patient_name}?section=Holistic+Plan`)
                          }
                        }} className="text-Primary-DeepTeal cursor-pointer text-xs font-medium flex items-center gap-1">
                          Proceed{' '}
                          <img
                            className="rotate-180 size-4"
                            src="/icons/arrow-back.svg"
                            alt=""
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  );
};

export default Actions;
