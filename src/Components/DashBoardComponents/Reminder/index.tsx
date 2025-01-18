import React, { useState } from "react";
import { ButtonSecondary } from "../../Button/ButtosSecondary";
import SvgIcon from "../../../utils/svgIcon";

interface TaskItem {
  name: string;
  isDone: boolean;
}

interface Task {
  date: string;
  dayLabel: string;
  tasks: TaskItem[];
}

const initialTasksData: Task[] = [
  {
    date: "2025-01-18",
    dayLabel: "Today",
    tasks: [
      { name: "Checking new files", isDone: false },
      { name: "Organize new clients profile", isDone: false },
    ],
  },
  {
    date: "2025-01-19",
    dayLabel: "Tomorrow",
    tasks: [
      { name: "Checking new files", isDone: false },
      { name: "Prepare meeting notes", isDone: false },
    ],
  },
];

const Reminder: React.FC = () => {
  const [tasksData, setTasksData] = useState<Task[]>(initialTasksData);

  const handleCheckboxChange = (groupIndex: number, taskIndex: number) => {
    const newTasksData = [...tasksData];
    newTasksData[groupIndex].tasks[taskIndex].isDone = !newTasksData[groupIndex].tasks[taskIndex].isDone;
    setTasksData(newTasksData);
  };

  return (
    <div className="w-full h-[328px] overflow-hidden bg-white rounded-2xl shadow-200 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm text-Text-Primary font-medium">Reminder</h2>
        <ButtonSecondary size="small">
          <img src="/icons/add.svg" alt="" />
          Add Reminder
        </ButtonSecondary>
      </div>
      <div className="max-h-[283px] overflow-y-auto">
        {tasksData.map((taskGroup, groupIndex) => (
          <div key={`${taskGroup.date}-${groupIndex}`} className="mb-4">
            <div
              className={`flex justify-between items-center mb-2 pb-2 border-b ${
                taskGroup.dayLabel === "Today"
                  ? "border-Primary-EmeraldGreen"
                  : "border-Text-Secondary"
              }`}
            >
              <div className="flex items-center gap-1">
                {taskGroup.dayLabel === "Today" && (
                  <SvgIcon
                    src="/icons/calendar-2.svg"
                    width="16px"
                    height="16px"
                    color="#6CC24A"
                  />
                )}
                <span
                  className={`text-sm font-medium ${
                    taskGroup.dayLabel === "Today"
                      ? "text-Primary-EmeraldGreen"
                      : "text-Text-Primary"
                  }`}
                >
                  {taskGroup.dayLabel}
                </span>
              </div>
              <span className="text-xs text-gray-500">{taskGroup.date}</span>
            </div>
            <ul className="space-y-2">
              {taskGroup.tasks.map((task, taskIndex) => (
                <li
                  key={`${taskGroup.date}-${task.name}-${taskIndex}`}
                  className="flex items-center my-3 bg-backgroundColor-Card shadow-drop rounded-[16px] p-2"
                >
                  <label
                    htmlFor={`${taskGroup.date}-${task.name}-${taskIndex}`}
                    className="flex items-center gap-2"
                  >
                    <input
                      id={`${taskGroup.date}-${task.name}-${taskIndex}`}
                      type="checkbox"
                      checked={task.isDone}
                      onChange={() => handleCheckboxChange(groupIndex, taskIndex)}
                      className=" hidden"
                    />
                    <div
                      className={`w-4 h-4 flex items-center justify-center rounded border border-Primary-DeepTeal ${
                        task.isDone ? "bg-Primary-DeepTeal" : "bg-white"
                      }`}
                    >
                      {task.isDone && (
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
                    <span className="text-sm">{task.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reminder;