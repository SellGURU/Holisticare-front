import { useEffect, useRef, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
// import AddFilter from './addFilter';
import DashboardApi from '../../../api/Dashboard';
import useModalAutoClose from '../../../hooks/UseModalAutoClose';
import { ButtonPrimary } from '../../Button/ButtonPrimary';
import MainModal from '../../MainModal';
import SimpleDatePicker from '../../SimpleDatePicker';
import TextField from '../../TextField';
import SpinnerLoader from '../../SpinnerLoader';
// Define the new Task type
type Task = {
  task_id?: string;
  title: string;
  deadline: string;
  progress: number;
  priority: string;
  checked: boolean;
  ai_defined?: boolean;
};

// type Filters = {
//   priority: { high: boolean; medium: boolean; low: boolean };
//   progress: { inProgress: boolean; toDo: boolean };
//   date: { from: Date | null; to: Date | null };
// };

const validationSchema = Yup.object({
  title: Yup.string().required('This field is required.'),
  deadline: Yup.date()
    .required('This field is required.')
    .min(new Date(), 'Please set a deadline that is after today.'),
  priority: Yup.string().required('This field is required.'),
});

const TaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [itemSelected, setItemSelected] = useState<string | undefined>('');
  useEffect(() => {
    DashboardApi.getTasksList({})
      .then((response) => {
        setTasks(response.data);
      })
      .catch((error) => {
        console.error('Error fetching tasks:', error);
      });
  }, []);

  const handleCheckBoxChange = (task_id: string | undefined) => {
    // Find the task to check its current status
    const taskToUpdate = tasks.find((task) => task.task_id === task_id);

    // Proceed only if the task is found and it's not already checked
    if (taskToUpdate && !taskToUpdate.checked) {
      setLoading(true);
      DashboardApi.checkTask({
        task_id: task_id,
      })
        .then(() => {
          setTasks(
            tasks.map((task) =>
              task.task_id === task_id ? { ...task, checked: true } : task,
            ),
          );
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error checking task:', error);
          alert('Failed to check the task. Please try again.');
        });
    }
  };
  const [showAddTaskModal, setshowAddTaskModal] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const formik = useFormik({
    initialValues: {
      title: '',
      deadline: null as Date | null,
      priority: '',
    },
    validationSchema,
    onSubmit: (values) => {
      if (!values.deadline) return;

      const newTask: Task = {
        title: values.title,
        deadline: values.deadline.toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
        }),
        progress: 0,
        priority: values.priority,
        checked: false,
      };

      DashboardApi.AddTask(newTask).then(() => {
        DashboardApi.getTasksList({}).then((response) => {
          setTasks(response.data);
          setshowAddTaskModal(false);
          formik.resetForm();
        });
      });
    },
  });

  const handleAddTask = () => {
    setShowValidation(true);
    formik.validateForm().then((errors) => {
      if (Object.keys(errors).length > 0) {
        return;
      }
      formik.handleSubmit();
    });
  };

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

  return (
    <>
      <MainModal
        isOpen={showAddTaskModal}
        onClose={() => {
          setshowAddTaskModal(false);
          formik.resetForm();
          setShowValidation(false);
        }}
      >
        <div className="bg-white rounded-2xl w-[500px] h-[286px] p-6 pb-8 shadow-800 text-Text-Primary relative">
          <div className="w-full border-b border-Gray-50 text-sm pb-2 font-medium mb-4">
            Add New Task
          </div>

          <TextField
            className="text-Text-Primary"
            newStyle
            value={formik.values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            name="title"
            label="Task Title"
            type="text"
            placeholder="Write your task title ..."
            inValid={showValidation && formik.errors.title !== undefined}
            errorMessage={showValidation ? formik.errors.title : undefined}
          />
          <div className="w-full flex items-center mt-4 gap-3">
            <div className="flex flex-col min-w-[222px] min-h-[65px] text-xs font-medium">
              <label className="mb-1">Deadline</label>
              <SimpleDatePicker
                textStyle
                ClassName=""
                placeholder='Select a deadline'
                isLarge
                date={formik.values.deadline}
                setDate={(date) => formik.setFieldValue('deadline', date)}
              />
              {showValidation && formik.errors.deadline && (
                <div className="text-Red text-[10px] mt-1">
                  {formik.errors.deadline}
                </div>
              )}
            </div>
            <div className="flex flex-col relative min-w-[222px] min-h-[65px] text-xs font-medium">
              <label className="mb-1">Priority</label>
              <div
                ref={selectButRef}
                onClick={() => {
                  setShowSelect(!showSelect);
                }}
                className={`w-full md:w-[222px] cursor-pointer h-[26px] flex justify-between items-center px-3 bg-[#FDFDFD] ${
                  showSelect && 'rounded-b-none'
                } rounded-[16px] border ${
                  showValidation && formik.errors.priority ? 'border-Red' : 'border-[#E9EDF5]'
                }`}
              >
                {
                  formik.values.priority ? (
                    <div className="text-[12px] text-[#383838]">{formik.values.priority}</div>
                  ) : (
                    <div className="text-[12px] font-light text-[#B0B0B0]">Select priority</div>
                  )
                }
                
                <div>
                  <img
                    className={`${showSelect && 'rotate-180'}`}
                    src="/icons/arow-down-drop.svg"
                    alt=""
                  />
                </div>
              </div>
              {showValidation && formik.errors.priority && (
                <div className="text-Red text-[10px] mt-1">
                  {formik.errors.priority}
                </div>
              )}
              {showSelect && (
                <div
                  ref={selectRef}
                  className="w-full z-20 shadow-200 p-2 rounded-[16px] rounded-t-none absolute bg-white border border-[#E9EDF5] top-[47px]"
                >
                  <div
                    onClick={() => {
                      formik.setFieldValue('priority', 'High');
                      setShowSelect(false);
                    }}
                    className="text-[12px] cursor-pointer text-Text-Primary py-1"
                  >
                    High
                  </div>
                  <div
                    onClick={() => {
                      formik.setFieldValue('priority', 'Medium');
                      setShowSelect(false);
                    }}
                    className="text-[12px] cursor-pointer text-Text-Primary py-1"
                  >
                    Medium
                  </div>
                  <div
                    onClick={() => {
                      formik.setFieldValue('priority', 'Low');
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
          <div className="w-full flex justify-end absolute right-[24px] bottom-[32px] gap-3">
            <div
              onClick={() => {
                setshowAddTaskModal(false);
                formik.resetForm();
                setShowValidation(false);
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
      <div
        className="w-full -mt-4  bg-white rounded-2xl shadow-200 p-4 text-Text-Primary overflow-hidden"
        style={{ height: (window.innerHeight - 240) / 2 + 'px' }}
      >
        <div className="flex justify-between items-center mb-4 relative">
          <div className="flex items-center gap-1">
            <h2 className="text-sm font-medium"> Tasks & Reminders</h2>
            {tasks.length > 1 && (
              <span className="text-xs font-medium text-Text-Triarty">
                ({tasks.length})
              </span>
            )}
          </div>

          <ButtonPrimary onClick={() => setshowAddTaskModal(true)} size="small">
            <img src="/icons/add.svg" alt="" />
            New Task
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
          <ul className="grid grid-cols-2 pr-1 gap-3  overflow-auto h-[80%]">
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
                      onChange={() => {
                        setItemSelected(task.task_id);
                        handleCheckBoxChange(task.task_id);
                      }}
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
                    {loading && task.task_id === itemSelected && (
                      <SpinnerLoader color="#005F73" />
                    )}

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
                    {task.deadline}
                  </div>
                  <div className="flex flex-col justify-between gap-3 absolute top-2 right-2">
                    {task.ai_defined && (
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
