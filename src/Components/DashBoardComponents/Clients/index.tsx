import React, { useEffect, useState } from 'react';
import CircularProgressBar from '../../charts/CircularProgressBar';
import DashboardApi from '../../../api/Dashboard';

type client = {
  picture: string;
  name: string;
  ID: string;
  ['Enroll Date']: string;
  Progress: number;
  Gender: string;
};

const RecentCheckIns: React.FC = () => {
  const [Clients, setClients] = useState<client[]>([]);

  useEffect(() => {
    DashboardApi.getCLientsList({}).then((res) => {
      setClients(res.data.client_list);
    });
  }, []);
  return (
    <div className="w-full h-[328px] bg-white rounded-2xl shadow-200 p-4 pr-2 ">
      <div className=" overflow-y-scroll pb-3 h-[300px] pr-[2px] ">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm text-Text-Primary font-medium">
            Recent Clients
          </h2>
        </div>
        {Clients.length < 1 ? (
          <div className=" w-full h-full flex flex-col items-center justify-center">
            <img src="/icons/NoClient.svg" alt="" />
            <div className="text-xs text-Text-Primary -mt-4 text-center">
              No Client Found
            </div>
          </div>
        ) : (
          <table className="w-full  ">
            <thead>
              <tr className="text-left text-[10px] bg-[#E9F0F2] text-Text-Primary border-Gray-50  ">
                <th className="py-2 pl-2 rounded-tl-2xl ">Client Name</th>
                <th className="py-2 pl-2 text-nowrap">Enroll Date</th>
                <th className="py-2 px-3 rounded-tr-2xl">Progress</th>
              </tr>
            </thead>
            <tbody className="border border-t-0 border-[#E9F0F2] ">
              {Clients?.map((client, index) => (
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
                    <div className="truncate max-w-[160px]"> {client.name}</div>
                  </td>
                  <td className="py-2 pl-[10px] text-Text-Secondary text-[10px]">
                    {client['Enroll Date']}
                  </td>
                  <td className="py-2 text-Text-Secondary text-[10px]">
                    <CircularProgressBar
                      percentage={client.Progress || 0}
                      startColor="#E742EB"
                      endColor="#3D70F1"
                      size={26}
                    ></CircularProgressBar>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RecentCheckIns;
