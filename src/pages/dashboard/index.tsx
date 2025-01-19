import { useEffect } from 'react';
import {
  NumberBoxes,
  MessageList,
  Clients,
  Reminder,
  Employes,
  TaskManager,
} from '../../Components/DashBoardComponents';
import Application from '../../api/app';

const DashBoard = () => {
  // const [reports, setreports] = useState()

  useEffect(() => {
    Application.clientsStats()
      .then((Response) => {
        console.log(Response);
      })
      .catch((error) => {
        console.error('Error fetching tasks:', error);
      });
  }, []);

  return (
    <>
      <div className="px-6 py-10">
        <NumberBoxes reports={[]}></NumberBoxes>
        <div className="w-full mt-4 grid gap-4 grid-cols-4">
          <MessageList />
          <div className="col-span-2 grid gap-4">
            <TaskManager />
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
