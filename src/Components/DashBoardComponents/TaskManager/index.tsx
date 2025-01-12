import React, { useState } from "react";
import { ButtonSecondary } from "../../Button/ButtosSecondary";

type Task = {
  id: number;
  title: string;
  date: string;
  status: "To Do" | "In Progress";
  priority: "Low" | "Medium" | "High";
  checked: boolean;
};

const initialTasks: Task[] = [
  {
    id: 1,
    title: "Update sam meal plan",
    date: "04/25/2024",
    status: "In Progress",
    priority: "High",
    checked: false,
  },
  {
    id: 2,
    title: "Checking new files",
    date: "04/25/2024",
    status: "To Do",
    priority: "High",
    checked: false,
  },
  {
    id: 3,
    title: "Organize new clients profile",
    date: "04/25/2024",
    status: "In Progress",
    priority: "Medium",
    checked: false,
  },
  {
    id: 4,
    title: "Update john nutrition plan",
    date: "04/25/2024",
    status: "To Do",
    priority: "Low",
    checked: false,
  },
  {
    id: 5,
    title: "Set exercise plan for Mike",
    date: "04/25/2024",
    status: "To Do",
    priority: "Medium",
    checked: false,
  },
  // Add more tasks as needed
];
const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState(initialTasks);
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 3;

  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = tasks.slice(indexOfFirstTask, indexOfLastTask);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(tasks.length / tasksPerPage); i++) {
    pageNumbers.push(i);
  }

  const handleClick = (pageNumber: number) => setCurrentPage(pageNumber);
  const handleCheckBoxChange = (id: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, checked: !task.checked } : task
      )
    );
  };
  return (
    <div className="max-w-[646px] w-full bg-white rounded-2xl shadow-200 p-4 text-Text-Primary">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-medium">Tasks</h2>
        <div className="flex items-center gap-3">
          <div className="rounded-md px-4 py-2 bg-backgroundColor-Secondary shadow-Btn">
            <img className="w-4 h-4" src="/icons/filter.svg" alt="" />
          </div>
        <ButtonSecondary>
          {" "}
          <img src="/icons/add.svg" alt="" />
          Add A New Task
        </ButtonSecondary>
        </div>
       
      </div>
      <ul className="grid grid-cols-2 gap-x-4 mb-4 min-h-[208px]">
        {currentTasks.map((task) => (
          <li
            key={task.id}
            className="bg-backgroundColor-Card shadow-100  p-2 rounded-2xl h-fit"
          >
            <div className="w-full flex items-center justify-between">
              <label
                className="flex items-center mb-2 cursor-pointer gap-2"
                htmlFor={task.title}
              >
                {" "}
                <input
                  type="checkbox"
                  id={task.title}
                  checked={task.checked}
                  onChange={() => handleCheckBoxChange(task.id)}
                  className="hidden"
                />
                <div
                  className={`w-4 h-4 flex items-center justify-center rounded  border border-Primary-DeepTeal  ${
                    task.checked ? "bg-Primary-DeepTeal" : "bg-white"
                  }`}
                >
                  {task.checked && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <div className="text-xs">{task.title}</div>
              </label>

              <span
                className={`text-xs rounded-2xl py-[2px] px-[9px] text-[8px] flex items-center gap-1 ${
                  task.status === "In Progress"
                    ? "bg-[#06C78D1A] bg-opacity-10 text-[#06C78D]"
                    : "bg-[#4C88FF1A] text-[#4C88FF] bg-opacity-10"
                }`}
              >
                {task.status}
                <img
                  className="w-2 h-2 object-contain"
                  src="/icons/arow-down-drop.svg"
                  alt=""
                />
              </span>
            </div>
            <div className="w-full flex items-center justify-between mt-2 px-3">
              <div className="text-xs text-Text-Secondary pl-3">
                {task.date}
              </div>

              <span
                className={`text-xs flex items-center gap-1 ${
                  task.priority === "High"
                    ? "text-[#FC5474]"
                    : task.priority === "Medium"
                    ? "text-[#FFBD59]"
                    : "text-Text-Secondary"
                }`}
              >
                <img
                  className="w-3 h-3 object-contain"
                  src="/icons/timer.svg"
                  alt=""
                />
                {task.priority}
              </span>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex justify-center items-center  w-full">
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
  );
};

export default TaskManager;
