import React, { useState, useEffect, useRef } from 'react';
import Application from '../../../api/app';
// import AddFilter from './addFilter';
import { ButtonPrimary } from '../../Button/ButtonPrimary';
import useModalAutoClose from '../../../hooks/UseModalAutoClose';
import MainModal from '../../MainModal';
import TextField from '../../TextField';
import SimpleDatePicker from '../../SimpleDatePicker';
// Define the new Task type
type Task = {
  task_id: string;
  title: string;
  date: string;
  progress: string;
  priority: string;
  checked: boolean;
  ai?: boolean;
};

// type Filters = {
//   priority: { high: boolean; medium: boolean; low: boolean };
//   progress: { inProgress: boolean; toDo: boolean };
//   date: { from: Date | null; to: Date | null };
// };

interface TaskManagerProps {}
const TaskManager: React.FC<TaskManagerProps> = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      task_id: '1',
      title: 'Update Sam action plan',
      date: 'February 28, 2025',
      progress: 'AI-Defined',
      priority: 'Low Priority',
      checked: false,
    },
    {
      task_id: '2',
      title: 'Attach guide pdf to Sarah’s...',
      date: 'February 28, 2025',
      progress: '',
      priority: 'High Priority',
      checked: false,
    },
    {
      task_id: '3',
      title: 'Sync with James via Leo...',
      date: 'February 27, 2025',
      progress: '',
      priority: 'High Priority',
      checked: true,
      ai: true,
    },
    {
      task_id: '4',
      title: 'Organize new clients prof...',
      date: 'February 27, 2025',
      progress: '',
      priority: 'Low Priority',
      checked: true,
    },
    {
      task_id: '5',
      title: 'Download client app and...',
      date: 'February 26, 2025',
      progress: 'AI-Defined',
      priority: 'Low Priority',
      checked: true,
    },
    {
      task_id: '6',
      title: 'Assign Guy to Floyd in or...',
      date: 'February 25, 2025',
      progress: 'AI-Defined',
      priority: 'Medium Priority',
      checked: true,
    },
    {
      task_id: '7',
      title: 'Check Daniel progress to...',
      date: 'February 25, 2025',
      progress: 'AI-Defined',
      priority: 'Low Priority',
      checked: true,
    },
    {
      task_id: '8',
      title: 'Set priorities to make sur...',
      date: 'February 24, 2025',
      progress: '',
      priority: 'Medium Priority',
      checked: true,
    },
  ]);

  useEffect(() => {
    Application.dashboardTasks()
      .then((response) => {
        console.log(response);

        // setTasks(response.data);
      })
      .catch((error) => {
        console.error('Error fetching tasks:', error);
      });
  }, []);

  // const [currentTasks, setCurrentTasks] = useState(tasks);

  const handleCheckBoxChange = (task_id: string) => {
    setTasks(
      tasks.map((task) =>
        task.task_id === task_id ? { ...task, checked: !task.checked } : task,
      ),
    );
  };
  const [showAddTaskModal, setshowAddTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [deadline, setDeadline] = useState<Date | null>(null);
  const selectRef = useRef(null);
  const selectButRef = useRef(null);
  const [showSelect, setShowSelect] = useState(false);
  useModalAutoClose({
    refrence: selectRef,
    buttonRefrence: selectButRef,
    close: () => {
      setShowSelect(false);
    },
  });
  const [Priority, setPriority] = useState('High');
  const handleAddTask = () => {
    if (!taskTitle || !deadline) {
      alert('Please provide a task title and deadline.');
      return;
    }

    const newTask: Task = {
      task_id: (tasks.length + 1).toString(), // Generate a new unique ID
      title: taskTitle,
      date: deadline.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      progress: '',
      priority: `${Priority} Priority`,
      checked: false,
    };

    setTasks((prevTasks) => [...prevTasks, newTask]);
    setshowAddTaskModal(false);
    setTaskTitle('');
    setDeadline(null);
    setPriority('High');
  };
  return (
    <>
      <MainModal
        isOpen={showAddTaskModal}
        onClose={() => {
          setshowAddTaskModal(false);
          setTaskTitle('');
          setDeadline(null);
          setPriority('High');
        }}
      >
        <div className="bg-white rounded-2xl w-[500px] h-[267px] p-6 pb-8 shadow-800 text-Text-Primary relative">
          <div className="w-full border-b border-Gray-50 text-sm pb-2 font-medium mb-4">
            Add New Task
          </div>

          <TextField
            newStyle
            value={taskTitle}
            onChange={(e) => {
              setTaskTitle(e.target.value);
            }}
            label=" Task Title"
            type="text"
            placeholder="Write your task title ..."
          />
          <div className="w-full flex items-center mt-4 gap-3">
            <div className="flex flex-col min-w-[222px] text-xs font-medium">
              <label className="mb-1">Deadline</label>
              <SimpleDatePicker
                isLarge
                date={deadline}
                setDate={setDeadline}
                placeholder="Deadline"
              />
            </div>
            <div className="flex flex-col  relative min-w-[222px] text-xs font-medium">
              <label className="mb-1">Priority</label>
              <div
                ref={selectButRef}
                onClick={() => {
                  setShowSelect(!showSelect);
                }}
                className={` w-full   md:w-[222px] cursor-pointer h-[28px] flex justify-between items-center px-3 bg-[#FDFDFD] ${showSelect && 'rounded-b-none'} rounded-[16px] border border-[#E9EDF5]`}
              >
                <div className="text-[12px] text-[#383838]">{Priority}</div>

                <div>
                  <img
                    className={`${showSelect && 'rotate-180'}`}
                    src="/icons/arow-down-drop.svg"
                    alt=""
                  />
                </div>
              </div>
              {showSelect && (
                <div
                  ref={selectRef}
                  className="w-full z-20 shadow-200 p-2 rounded-[16px] rounded-t-none absolute bg-white border border-[#E9EDF5] top-[47px]"
                >
                  <div
                    onClick={() => {
                      setPriority('High');
                      setShowSelect(false);
                    }}
                    className="text-[12px] cursor-pointer text-Text-Primary py-1 
                          "
                  >
                    High
                  </div>
                  <div
                    onClick={() => {
                      setPriority('Medium');
                      setShowSelect(false);
                    }}
                    className="text-[12px] cursor-pointer text-Text-Primary py-1"
                  >
                    Medium
                  </div>
                  <div
                    onClick={() => {
                      setPriority('Low');
                      setShowSelect(false);
                    }}
                    className="text-[12px] cursor-pointer text-Text-Primary py-1"
                  >
                    Low
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="w-full flex justify-end absolute right-[24px] bottom-[32px] gap-3 ">
            <div
              onClick={() => {
                setshowAddTaskModal(false);
                setTaskTitle('');
                setDeadline(null);
                setPriority('High');
              }}
              className="text-sm font-medium text-[#909090] cursor-pointer"
            >
              Cancel
            </div>
            <div
              onClick={handleAddTask}
              className="text-sm font-medium text-Primary-DeepTeal cursor-pointer"
            >
              Add Task
            </div>
          </div>
        </div>
      </MainModal>
      <div className="w-full h-[320px] bg-white rounded-2xl shadow-200 p-4 text-Text-Primary">
        <div className="flex justify-between items-center mb-4 relative">
          <div className="flex gap-1">
            <h2 className="text-sm font-medium"> Tasks & Reminders</h2>
            {tasks.length > 1 && (
              <span className="text-xs font-medium text-Text-Triarty">
                ({tasks.length})
              </span>
            )}
          </div>

          <ButtonPrimary onClick={() => setshowAddTaskModal(true)} size="small">
            <img src="/icons/add.svg" alt="" />
            New task
          </ButtonPrimary>
        </div>
        {tasks.length < 1 ? (
          <div className=" w-full h-full flex flex-col items-center justify-center">
            <img src="/icons/NoTask.svg" alt="" />
            <div className="text-xs text-Text-Primary -mt-4 text-center">
              No Data Found
            </div>
          </div>
        ) : (
          <ul className="grid grid-cols-2 pr-1 gap-3 mb-4 overflow-auto h-[253px]">
            {tasks.map((task) => (
              <li
                key={task.task_id}
                className="bg-white border border-Gray-50 shadow-100 p-2 rounded-2xl h-[65px] relative"
              >
                <div className="w-full flex items-center justify-between">
                  <label
                    className="flex items-center mb-2 cursor-pointer gap-2 "
                    htmlFor={task.title}
                  >
                    <input
                      type="checkbox"
                      id={task.title}
                      checked={task.checked}
                      onChange={() => handleCheckBoxChange(task.task_id)}
                      className="hidden"
                    />
                    <div
                      className={`w-4 h-4 flex items-center justify-center  rounded ${
                        task.checked
                          ? 'bg-Primary-EmeraldGreen'
                          : 'bg-white border border-Text-Secondary'
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

                    <div
                      className={`text-[10px] max-w-[120px] overflow-hidden whitespace-nowrap text-ellipsis mr-2 ${
                        task.checked ? 'line-through' : ''
                      }`}
                    >
                      {task.title}
                    </div>
                  </label>

                  {/* <span
                  className={`text-xs rounded-2xl py-[2px] px-[9px] text-[8px] flex items-center gap-1 ${
                    task.progress === 'AI-Defined'
                      ? 'bg-[#06C78D1A] bg-opacity-10 text-[#06C78D]'
                      : task.priority === 'High Priority'
                      ? 'bg-[#FF00001A] text-[#FF0000]'
                      : 'bg-[#4C88FF1A] text-[#4C88FF] bg-opacity-10'
                  }`}
                >
                  {task.progress || task.priority}
                 
                </span> */}
                </div>
                <div className="w-full flex items-center justify-between  px-3">
                  <div className="text-[10px] text-Text-Triarty pl-3">
                    {task.date}
                  </div>
                  <div className="flex flex-col justify-between gap-3 absolute top-2 right-2">
                    {task.ai && (
                      <div className="bg-[#E9F0F2] px-[9px] py-[2px] rounded-2xl flex justify-center items-center gap-1 text-[8px] text-[#267E95]">
                        <img src="/icons/ai-icon.svg" alt="" />
                        AI-Defined
                      </div>
                    )}
                    <span
                      className={`text-[8px] flex items-center gap-1 px-2 rounded-full ${
                        task.priority === 'High Priority'
                          ? 'bg-[#FFD8E4]'
                          : task.priority === 'Medium Priority'
                            ? 'bg-[#F9DEDC]'
                            : 'bg-[#DEF7EC]'
                      }`}
                    >
                      <div
                        className={`rounded-full size-2 ${task.priority === 'High Priority' ? 'bg-[#FC5474]' : task.priority === 'Medium Priority' ? 'bg-[#FFBD59]' : 'bg-[#06C78D]'} `}
                      ></div>
                      {task.priority}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default TaskManager;
