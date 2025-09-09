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

        <div className=" pb-1  clients-table">
          {Clients.length < 1 ? (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <img src="/icons/NoClient.svg" alt="" />
              <div className="text-xs text-Text-Primary -mt-4 text-center">
                No Client Found
              </div>
            </div>
          ) : (
            <div className="w-full h-full">
              {/* Header */}
              <div className="sticky top-0 z-10 bg-[#E9F0F2] text-left text-[10px] rounded-t-2xl text-Text-Primary border-Gray-50 flex">
                <div className="py-2 pl-2 w-[100px] md:w-[150px] rounded-tl-2xl">
                  Client Name
                </div>
                <div className="py-2 w-[125px]  md:w-[70px] text-nowrap xl:pr-6 2xl:pr-0 xl:w-[90px] 2xl:w-[100px] text-center">
                  Enroll Date
                </div>
                <div className="py-2  w-[50px]  md:w-[120px] text-center rounded-tr-2xl">
                  Progress
                </div>
              </div>

              {/* Rows */}
              <div className="overflow-auto w-full h-[80%] ">
                {Clients.map((client, index) => (
                  <div
                    key={index}
                    className={`flex items-center text-[10px] text-Text-Primary border-b ${
                      index % 2 === 0 ? 'bg-white' : 'bg-[#F4F4F4]'
                    }`}
                  >
                    <div className="py-2 pl-2 w-[100px] 2xl:w-[150px] flex items-center">
                      <img
                        src={`https://ui-avatars.com/api/?name=${client.name}`}
                        alt={client.name}
                        className="w-6 h-6 rounded-full mr-[4px] border border-Primary-DeepTeal"
                      />
                      <TooltipTextAuto
                        tooltipClassName="!bg-white !w-fit !bg-opacity-100 !opacity-100 !h-fit !break-words !leading-5 !text-justify !text-wrap !shadow-100 !text-[#888888] !text-[10px] !rounded-[6px] !border !border-Gray-50 flex flex-col !z-[99999]"
                        maxWidth="70px"
                      >
                        {client.name}
                      </TooltipTextAuto>
                    </div>

                    <div className="py-2 w-[125px] pl-3  md:w-[70px] xl:w-[90px] 2xl:w-[100px]  text-center text-Text-Secondary text-[10px]">
                      {formatDate(client['Enroll Date'])}
                    </div>

                    <div className="py-2 w-[60px]  xl:w-[105px] 2xl:w-[120px] pl-6 2xl:pl-4 flex justify-center ">
                      <CircularProgressBar
                        percentage={client.Progress || 0}
                        startColor="#E742EB"
                        endColor="#3D70F1"
                        size={26}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentCheckIns;
