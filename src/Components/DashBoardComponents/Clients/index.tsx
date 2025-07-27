import React, { useEffect, useState } from 'react';
import CircularProgressBar from '../../charts/CircularProgressBar';
import DashboardApi from '../../../api/Dashboard';
import './Clients.css';
import TooltipTextAuto from '../../TooltipText/TooltipTextAuto';

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
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };
  return (
    <div className="w-full bg-white rounded-2xl shadow-200 p-4 pr-2 clients-container ">
      <div className="pb-3 pr-[8px] clients-content">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm text-Text-Primary font-medium flex items-center">
            Recent Clients
            <span className="ml-1 text-[#B0B0B0] text-xs font-medium">
              ({Clients.length})
            </span>
          </h2>
        </div>
        <div className="overflow-y-scroll pb-1 pr-[4px] clients-table">
          {Clients.length < 1 ? (
            <div className=" w-full h-full flex flex-col items-center justify-center">
              <img src="/icons/NoClient.svg" alt="" />
              <div className="text-xs text-Text-Primary -mt-4 text-center">
                No Client Found
              </div>
            </div>
          ) : (
            <table className="w-full  ">
              <thead className="sticky top-0 z-10 bg-[#E9F0F2]">
                <tr className="text-left text-[10px] text-Text-Primary border-Gray-50">
                  <th className="py-2 pl-2 rounded-tl-2xl ">Client Name</th>
                  <th className="py-2  text-nowrap w-[95px] text-center">
                    Enroll Date
                  </th>
                  <th className="py-2 px-3 rounded-tr-2xl  w-[30px] xl:w-[50px] 2xl:w-[95px] text-center">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody className="border border-t-0 border-[#E9F0F2] ">
                {Clients?.map((client, index) => (
                  <tr
                    key={index}
                    className={` ${index % 2 == 0 ? 'bg-white' : 'bg-[#F4F4F4]'} text-[10px] text-Text-Primary border-b`}
                  >
                    <td
                      data-tooltip-id={client.name}
                      className="py-2 pl-2 w-[95px] flex items-center text-[10px] text-Text-Primary"
                    >
                      <img
                        src={`https://ui-avatars.com/api/?name=${client.name}`}
                        alt={client.name}
                        className="w-6 h-6 rounded-full mr-[4px] border border-Primary-DeepTeal"
                      />
                      <div className=" ">
                        <TooltipTextAuto
                          tooltipClassName="!bg-white !w-fit !bg-opacity-100 !opacity-100 !h-fit !break-words !leading-5 !text-justify !text-wrap !shadow-100 !text-[#888888] !text-[10px] !rounded-[6px] !border !border-Gray-50 flex flex-col !z-[99999]"
                          maxWidth="70px"
                        >
                          {client.name}
                        </TooltipTextAuto>
                      </div>
                    </td>

                    <td className="py-2  text-Text-Secondary text-[10px] w-[95px] text-center">
                      {formatDate(client['Enroll Date'])}
                    </td>
                    <td className="py-2 text-Text-Secondary text-[10px] text-center w-[30px] xl:w-[50px] 2xl:w-[95px] flex justify-end 2xl:justify-center">
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
    </div>
  );
};

export default RecentCheckIns;
