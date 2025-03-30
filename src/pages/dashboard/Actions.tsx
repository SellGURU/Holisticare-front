import React, { useEffect, useState } from 'react';
import Circleloader from '../../Components/CircleLoader';
import { Dropdown } from '../../Components/DropDown';
import DashboardApi from '../../api/Dashboard';
// import { useNavigate } from 'react-router-dom';

type Action = {
  patient_name: string;
  state: 'Resolved' | 'Pending';
  alert: string;
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
  const [Actions, setActions] = useState<Action[]>([])
  const [selectedOption, setSelectedOption] = useState('Week');

  useEffect(()=>{
    DashboardApi.getActionsList({
      time_filter: selectedOption
    }).then((res)=>{
      setActions(res.data)
      
    })
  },[selectedOption])
  const [filter, setFilter] = useState<'All' | 'Resolved' | 'Pending'>('All');
  const [isLoading] = useState<boolean>(false);

  const filteredActions = Actions.filter((action) =>
    filter === 'All' ? true : action.state === filter,
  );
  const options = ['Day', 'Week', 'Month'];
  return (
    <>
      {isLoading ? (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-85 z-20">
          <Circleloader />
        </div>
      ) : (
        <div className="w-full h-full overflow-hidden bg-white rounded-2xl shadow-200 p-4">
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

          <div className="w-full shadow-200 flex mt-3">
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
                } w-full text-center px-4 py-2 border text-xs cursor-pointer ${
                  filter === type
                    ? 'bg-backgroundColor-Main border-Primary-DeepTeal'
                    : 'border-Gray-50 bg-white'
                }`}
              >
                {type}
              </div>
            ))}
          </div>
          {filteredActions.length < 1 ? (
            <div className=" w-full h-full flex flex-col items-center justify-center">
              <img src="/icons/EmptyState2.svg" alt="" />
              <div className="text-xs text-Text-Primary -mt-4 text-center">
                No Data Found
              </div>
            </div>
          ) : (
            <ul className="mt-5 w-full h-full max-h-[540px] overflow-y-scroll pr-2">
              {filteredActions.map((action, index) => (
                <li
                  key={index}
                  className="mb-5 rounded-xl pb-2 bg-white border border-Gray-50 shadow-100 w-full "
                >
                  <div className="w-full flex justify-between items-center py-1 pb-2 px-4 bg-backgroundColor-Card border-b border-Gray-50 text-[10px]  font-medium text-Text-Primary">
                    <div title={action.patient_name} className='truncate max-w-[160px]'>
                    {action.patient_name}
                    </div>
                  

                    {/* <div className="px-2 rounded-full flex h-[14px] bg-orange-200 items-center text-[8px] text-Text-Primary gap-[2px]">
                        <div className="rounded-full size-2 bg-red-500"></div>
                        {action.status}
                      </div> */}
                    <div
                      className={`text-center rounded-full py-[2px] px-1.5 md:px-2.5 text-[8px] md:text-[10px] w-fit text-black text-nowrap flex items-center gap-1 ${action.state === 'Resolved' ? 'bg-[#DEF7EC]' : 'bg-[#F9DEDC]'}`}
                    >
                      <div
                        className={` w-3 h-3 rounded-full  ${action.state === 'Resolved' ? 'bg-[#06C78D]' : 'bg-[#FFBD59]'}`}
                      ></div>
                      {action.state}
                    </div>
                  </div>
                  <div className="text-[10px] text-Text-Secondary px-4 flex justify-between items-center gap-4 mt-2 text-ellipsis w-full text-justify ">
                    <div className='max-w-[237px]'>
                    {action.alert}
                    </div>
                  
                    <div className="flex items-center gap-2">
                      {action.state === 'Pending' && (
                        <div className="text-Primary-DeepTeal text-xs font-medium flex items-center gap-1">
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
