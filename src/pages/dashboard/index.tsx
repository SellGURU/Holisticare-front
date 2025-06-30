// import { useState } from 'react';
import { useEffect, useState } from 'react';
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
import DashboardApi from '../../api/Dashboard';

const DashBoard = () => {
  const [reports, setReports] = useState<{ title: string; number: number }[]>(
    [],
  );
  // const [filters] = useState({
  //   priority: { high: false, medium: false, low: false },
  //   progress: { inProgress: false, toDo: false },
  //   date: { from: null, to: null },
  // });

  // Add Task Modal Section

  // End Add Task Section
  useEffect(() => {
    DashboardApi.getClientsStats({}).then((res) => {
      setReports(res.data);
    });
  }, []);
  return (
    <>
      {/* Add Task Modal */}

      {/* Check-In Comment Modal */}

      {/* Check in Modal */}
      <div
        style={{ height: window.innerWidth < 720 ? window.innerHeight - 87 + 'px' : ''}}
        className=" px-3 md:px-4 2xl:px-6 pt-4 overflow-auto"
      >
        <div className="text-base font-medium text-Text-Primary mb-4">
          Dashboard
        </div>
        <NumberBoxes reports={reports}></NumberBoxes>
        <div className="w-full mt-4 grid gap-y-4 md:gap-y-0 md:gap-2 2xl:gap-4 grid-cols-1 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
          {/* <MessageList /> */}
          <Actions></Actions>
          <div
            className="col-span-2 gap-y-10 md:gap-y-4 grid gap-4"
            style={{ height: window.innerHeight - 250 + 'px' }}
          >
            <RecentCheckIns></RecentCheckIns>
            {/* <Reminder></Reminder> */}

            <TaskManager />
          </div>
          <div className="grid w-full col-span-full xl:col-span-1 2xl:col-span-1 gap-4 md:mt-4 xl:mt-0">
            <div className="w-full max-w-full">
              <Clients></Clients>
            </div>
            <div className="w-full max-w-full">
              <Employes></Employes>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashBoard;
