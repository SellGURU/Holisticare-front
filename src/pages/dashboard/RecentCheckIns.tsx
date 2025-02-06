import React from 'react';

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

const RecentCheckIns: React.FC = () => {
  return (
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
              <th className="py-2 pl-2 rounded-tr-2xl">Status</th>
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
                <td className="py-2">
                  <span
                    className={`text-[8px]  w-[65px] h-[14px] font-medium pb-[2px] py-1 px-2 rounded-full flex items-center justify-center gap-[2px] ${
                      checkIn.status === 'Review Now'
                        ? 'text-[#FFBD59] underline'
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
  );
};

export default RecentCheckIns;
