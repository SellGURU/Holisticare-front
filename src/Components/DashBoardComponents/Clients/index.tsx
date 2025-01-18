import { useState } from "react";
import CircularProgressBar from "../../charts/CircularProgressBar"; 
interface Client {
    name: string;
    id: string;
    gender: string;
    enrollDate: string;
    progress: number;
    avatar: string; // URL or path to the avatar image
  }
const Clients = () => {
    const initialClients: Client[] = [
        {
          name: "David Smith",
          id: "021548461651",
          gender: "Male",
          enrollDate: "04/25/2024",
          progress: 87,
          avatar: "/path/to/avatar1.jpg",
        },
        {
          name: "Leslie Alexander",
          id: "021548461651",
          gender: "Female",
          enrollDate: "04/25/2024",
          progress: 87,
          avatar: "/path/to/avatar2.jpg",
        },
        {
          name: "Robert Garcia",
          id: "021548461651",
          gender: "Male",
          enrollDate: "04/25/2024",
          progress: 87,
          avatar: "/path/to/avatar3.jpg",
        },
        {
          name: "Sarah Thompson",
          id: "021548461651",
          gender: "Female",
          enrollDate: "04/25/2024",
          progress: 87,
          avatar: "/path/to/avatar4.jpg",
        },
      ];
      const [currentPage, setCurrentPage] = useState(1);
      const tasksPerPage = 3;
    const [clients,] = useState(initialClients)
      const indexOfLastTask = currentPage * tasksPerPage;
      const indexOfFirstTask = indexOfLastTask - tasksPerPage;
      const currentClients = clients.slice(indexOfFirstTask, indexOfLastTask);
    
      const pageNumbers = [];
      for (let i = 1; i <= Math.ceil(clients.length / tasksPerPage); i++) {
        pageNumbers.push(i);
      }
    
      const handleClick = (pageNumber: number) => setCurrentPage(pageNumber);

    return (
        <>
            <div className="w-full h-[320px] relative overflow-hidden  bg-white rounded-2xl shadow-200 p-4">
                <div className="w-full flex justify-between">
                <h2 className="text-sm text-Text-Primary font-medium">Recently added Clients</h2>
                <div className="text-xs font-medium text-Text-Secondary">Last update:2025/1/18</div>

                </div>
                <table className="w-full table-auto mt-6 ">
        <thead>
          <tr className="text-left text-xs font-medium text-Text-Secondary border-b border-[#005F731A]">
            <th className="pb-2">Name</th>
            <th className="pb-2 pl-10">ID</th>
            <th className="pb-2">Gender</th>
            <th className="pb-2 pl-1">Enroll Date</th>
            <th className="pb-2 text-center">Progress</th>
          </tr>
        </thead>
        <tbody>
          {currentClients.map((client) => (
            <tr key={client.id} className="border-b">
              <td className="py-2 flex items-center">
                <img   src={
           
                  `https://ui-avatars.com/api/?name=${client.name}`
              } alt={`${client.name}'s avatar`} className="w-8 h-8 rounded-full mr-2" />
                <span className="text-xs">{client.name}</span>
              </td>
              <td className="py-2 text-xs">{client.id}</td>
              <td className="py-2 pl-1 text-xs">{client.gender}</td>
              <td className="py-2 text-xs">{client.enrollDate}</td>
              <td className="py-2 text-xs "> <CircularProgressBar percentage={client.progress}></CircularProgressBar></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className=" absolute bottom-5 flex justify-center items-center  w-full">
        <button
          onClick={() => handleClick(currentPage - 1)}
          disabled={currentPage === 1}
          className="rounded-[24px] border-[0.75px] bg-white border-[#005F731A] p-2 border-opacity-10 flex items-center justify-center cursor-pointer"
        >
          <img src="/icons/First.svg" alt="" />
        </button>
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => handleClick(number)}
            className={`px-3 py-2 mx-1 rounded-[24px] border-[0.75px] border-[#005F731A]  text-[9.75px] font-semibold cursor-pointer ${
              currentPage === number ? "bg-[#005F73] text-white" : "bg-white"
            }`}
          >
            {number}
          </button>
        ))}
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
    )
}


export default Clients;
