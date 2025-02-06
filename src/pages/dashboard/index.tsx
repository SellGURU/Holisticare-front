import { useState } from 'react';
import {
  NumberBoxes,
  MessageList,
  Clients,
  Reminder,
  Employes,
  TaskManager,
} from '../../Components/DashBoardComponents';
import Actions from './Actions';

const DashBoard = () => {
  // const [reports, setreports] = useState()

  const [filters] = useState({
    priority: { high: false, medium: false, low: false },
    progress: { inProgress: false, toDo: false },
    date: { from: null, to: null },
  });

  return (
    <>
      <div className="px-6 py-10">
        <NumberBoxes reports={[]}></NumberBoxes>
        <div className="w-full  mt-4 grid gap-4 grid-cols-4">
          {/* <MessageList /> */}
          <Actions></Actions>
          <div className="col-span-2 grid gap-4">
            <TaskManager Filters={filters} />
            <Clients></Clients>
          </div>
          <div className=" grid gap-4">
            <Reminder></Reminder>
            <Employes></Employes>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashBoard;
