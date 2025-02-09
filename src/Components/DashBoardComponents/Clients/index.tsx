import React from 'react';
import CircularProgressBar from '../../charts/CircularProgressBar';

type client = {
  name: string;
  Enroll_date: string;
  Progress: number;
};

const Clients: client[] = [
  {
    name: 'David Smith',
    Enroll_date: '2025/1/12',
    Progress: 43,
  },
  {
    name: 'Jane Cooper',
    Enroll_date: '2025/1/12',
    Progress: 43,
  },
  {
    name: 'Jacob Jones',

    Enroll_date: '2025/9/2',
    Progress: 88,
  },
  {
    name: 'Jenny Wilson',

    Enroll_date: '2025/9/2',
    Progress: 88,
  },
  {
    name: 'Robert Garcia',

    Enroll_date: '2025/9/2',
    Progress: 88,
  },
  {
    name: 'Sarah Thompson',

    Enroll_date: '2025/9/2',
    Progress: 88,
  },
  {
    name: 'Leslie Alexander',
    Enroll_date: '2025/9/2',
    Progress: 88,
  },
];

const RecentCheckIns: React.FC = () => {
  return (
    <div className="w-full h-[328px] bg-white rounded-2xl shadow-200 p-4 pr-2 ">
      <div className=" overflow-y-scroll pb-3 h-[300px] pr-[2px] ">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm text-Text-Primary font-medium">
            Recent Clients
          </h2>
        </div>
        <table className="w-full  ">
          <thead>
            <tr className="text-left text-[10px] bg-[#E9F0F2] text-Text-Primary border-Gray-50  ">
              <th className="py-2 pl-2 rounded-tl-2xl ">Client Name</th>
              <th className="py-2 pl-2 text-nowrap">Enroll Date</th>
              <th className="py-2 px-3 rounded-tr-2xl">Progress</th>
            </tr>
          </thead>
          <tbody className="border border-t-0 border-[#E9F0F2] ">
            {Clients.map((client, index) => (
              <tr
                key={index}
                className={` ${index % 2 == 0 ? 'bg-white' : 'bg-[#F4F4F4]'} text-[10px] text-Text-Primary border-b`}
              >
                <td className="py-2 pl-2 flex items-center text-[10px] text-Text-Primary">
                  <img
                    src={`https://ui-avatars.com/api/?name=${client.name}`}
                    alt={client.name}
                    className="w-6 h-6 rounded-full mr-[4px] border border-Primary-DeepTeal"
                  />
                  {client.name}
                </td>
                <td className="py-2 pl-[10px] text-Text-Secondary text-[10px]">
                  {client.Enroll_date}
                </td>
                <td className="py-2 text-Text-Secondary text-[10px]">
                  <CircularProgressBar
                    percentage={client.Progress}
                    startColor="#E742EB"
                    endColor="#3D70F1"
                    size={26}
                  ></CircularProgressBar>
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
