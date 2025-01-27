import { useState, useEffect } from 'react';
import CircularProgressBar from '../../charts/CircularProgressBar';
import Application from '../../../api/app';
interface Client {
  picture: string;
  name: string;
  ID: number;
  ['Enroll Date']: string;
  progress: number;
  Gender: string;
}

const Clients = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 3;
  const [clients, setClients] = useState<Client[]>([]);
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentClients = clients.slice(indexOfFirstTask, indexOfLastTask);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(clients.length / tasksPerPage); i++) {
    pageNumbers.push(i);
  }

  const handleClick = (pageNumber: number) => setCurrentPage(pageNumber);
  useEffect(() => {
    Application.dashboardClients()
      .then((Response) => {
        setClients(Response.data.client_list);
      })
      .catch((error) => {
        console.error('Error fetching tasks:', error);
      });
  }, []);
  console.log(currentClients);

  return (
    <>
      <div className="w-full h-[320px] relative overflow-hidden  bg-white rounded-2xl shadow-200 p-4">
        <div className="w-full flex justify-between">
          <h2 className="text-sm text-Text-Primary font-medium">
            Recently added Clients
          </h2>
          <div className="text-xs font-medium text-Text-Secondary">
            Last update: 2025/1/18
          </div>
        </div>
        <table className="w-full table-auto mt-6 ">
          <thead>
            <tr className="text-left text-xs font-medium text-Text-Primary border-b border-[#005F731A]">
              <th className="pb-2">Name</th>
              <th className="pb-2 pl-10">ID</th>
              <th className="pb-2">Gender</th>
              <th className="pb-2 pl-1">Enroll Date</th>
              <th className="pb-2 text-center">Progress</th>
            </tr>
          </thead>
          <tbody>
            {currentClients.map((client) => (
              <tr key={client.ID} className="border-b text-Text-Secondary">
                <td className="py-2 flex items-center ">
                  <div className="rounded-full border border-Primary-EmeraldGreen p-[2px] mr-2 w-8 h-8 flex items-center justify-center">
                    <img
                      src={
                        client.picture ||
                        `https://ui-avatars.com/api/?name=${client.name}`
                      }
                      alt={`${client.name}'s avatar`}
                      className="rounded-full"
                    />
                  </div>

                  <span className="text-xs">{client.name}</span>
                </td>
                <td className="py-2 text-xs">{client.ID}</td>
                <td className="py-2 pl-1 text-xs">{client.Gender}</td>
                <td className="py-2 text-xs">{client['Enroll Date']}</td>
                <td className="py-2 text-xs">
                  <CircularProgressBar
                    startColor="#E742EB"
                    endColor="#3D70F1"
                    percentage={client.progress || 0}
                  ></CircularProgressBar>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="absolute bottom-5 flex justify-center items-center w-full">
          <button
            onClick={() => handleClick(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded-[24px] border-[0.75px] bg-white border-[#005F731A] p-2 border-opacity-10 flex items-center justify-center cursor-pointer"
          >
            <img src="/icons/First.svg" alt="" />
          </button>

          {pageNumbers.map((number) => {
            if (pageNumbers.length <= 3) {
              return (
                <button
                  key={number}
                  onClick={() => handleClick(number)}
                  className={`px-3 py-2 mx-1 rounded-[24px] border-[0.75px] border-[#005F731A] text-[9.75px] font-semibold cursor-pointer ${
                    currentPage === number
                      ? 'bg-[#005F73] text-white'
                      : 'bg-white'
                  }`}
                >
                  {number}
                </button>
              );
            } else if (
              number === currentPage ||
              number === currentPage - 1 ||
              number === currentPage + 1
            ) {
              return (
                <button
                  key={number}
                  onClick={() => handleClick(number)}
                  className={`px-3 py-2 mx-1 rounded-[24px] border-[0.75px] border-[#005F731A] text-[9.75px] font-semibold cursor-pointer ${
                    currentPage === number
                      ? 'bg-[#005F73] text-white'
                      : 'bg-white'
                  }`}
                >
                  {number}
                </button>
              );
            }
            return null;
          })}

          <button
            onClick={() => handleClick(currentPage + 1)}
            disabled={currentPage === pageNumbers.length}
            className="rounded-[24px] border-[0.75px] bg-white border-[#005F731A] border-opacity-10 p-2 flex items-center justify-center cursor-pointer"
          >
            <img className="rotate-180" src="/icons/First.svg" alt="" />
          </button>
        </div>
      </div>
    </>
  );
};

export default Clients;
