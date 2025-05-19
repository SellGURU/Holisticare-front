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
      <div className="px-6 pt-4">
        <div className="text-base font-medium text-Text-Primary mb-4">
          Dashboard
        </div>
        <NumberBoxes reports={reports}></NumberBoxes>
        <div className="w-full  mt-4 grid gap-4 grid-cols-4">
          {/* <MessageList /> */}
          <Actions></Actions>
          <div className="col-span-2 grid gap-4">
            <RecentCheckIns></RecentCheckIns>
            {/* <Reminder></Reminder> */}

            <TaskManager />
          </div>
          <div className="  grid gap-4">
            <Clients></Clients>

            <Employes></Employes>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashBoard;
