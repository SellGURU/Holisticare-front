/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from 'react';

const mode = [
  {
    icon: '/icons/textalign-justifyleft.svg',
    title: 'Paragraph',
    desc: 'Small or log text like title or ...',
  },
  { icon: '/icons/ruler.svg', title: 'Scale', desc: 'A Scale from 1-10' },
  { icon: '/icons/tick-square-blue.svg', title: 'Yes/No', desc: 'Yes or No' },
  {
    icon: '/icons/emoji-normal.svg',
    title: 'Emojis',
    desc: 'Choose from different Emojis',
  },
  {
    icon: '/icons/star-blue.svg',
    title: 'Star Rating',
    desc: 'Star rating from 1-5',
  },
  {
    icon: '/icons/document-upload.svg',
    title: 'File Uploader',
    desc: 'Like Test result or photo',
  },
];

interface AddQuestionCheckInProps {
  setAddMode: (value: boolean) => void;
  setCheckInList: (value: any) => void;
  editIndex: number | null;
  setEditIndex: (value: number | null) => void;
  editTitle: string;
  setEditTitle: (value: string) => void;
  editItemSelected: string;
  setEditItemSelected: (value: string) => void;
  editCheckboxChecked: boolean;
  setEditCheckboxChecked: (value: boolean) => void;
  editCheckboxOptions: string[];
  editMultipleChoiceOptions: string[];
}

const AddQuestionCheckIn: FC<AddQuestionCheckInProps> = ({
  setAddMode,
  setCheckInList,
  editIndex,
  editCheckboxChecked,
  editItemSelected,
  editTitle,
  setEditCheckboxChecked,
  setEditItemSelected,
  setEditTitle,
  setEditIndex,
  editCheckboxOptions,
  editMultipleChoiceOptions,
}) => {
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [itemSelected, setItemSelected] = useState('');
  const [title, setTitle] = useState('');
  const [checkboxOptions, setCheckboxOptions] = useState(['', '']);
  const addOption = () => {
    setCheckboxOptions([...checkboxOptions, '']);
  };
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...checkboxOptions];
    newOptions[index] = value;
    setCheckboxOptions(newOptions);
  };
  const [multipleChoiceOptions, setMultipleChoiceOptions] = useState(['', '']);
  const addChoiceOption = () => {
    setMultipleChoiceOptions([...multipleChoiceOptions, '']);
  };
  const handleChoiceOptionChange = (index: number, value: string) => {
    const newOptions = [...multipleChoiceOptions];
    newOptions[index] = value;
    setMultipleChoiceOptions(newOptions);
  };
  const addToCheckInList = () => {
    if (!title.trim() || !itemSelected.trim()) return;

    if (itemSelected === 'Checkboxes') {
      setCheckInList((prevList: any) => [
        {
          title,
          type: itemSelected,
          required: checkboxChecked,
          options: checkboxOptions,
        },
        ...prevList,
      ]);
    }
    if (itemSelected === 'Multiple choice') {
      setCheckInList((prevList: any) => [
        {
          title,
          type: itemSelected,
          required: checkboxChecked,
          options: multipleChoiceOptions,
        },
        ...prevList,
      ]);
    }
    if (itemSelected !== 'Checkboxes' && itemSelected !== 'Multiple choice') {
      setCheckInList((prevList: any) => [
        {
          title,
          type: itemSelected,
          required: checkboxChecked,
        },
        ...prevList,
      ]);
    }

    setTitle('');
    setItemSelected('');
    setCheckboxOptions(['', '']);
    setMultipleChoiceOptions(['', '']);
    setCheckboxChecked(false);
  };

  useEffect(() => {
    if (editIndex !== null) {
      setCheckboxChecked(editCheckboxChecked);
      setItemSelected(editItemSelected);
      setTitle(editTitle);
      setCheckboxOptions(editCheckboxOptions);
      setMultipleChoiceOptions(editMultipleChoiceOptions);
    } else {
      setEditCheckboxChecked(checkboxChecked);
      setEditItemSelected(itemSelected);
      setEditTitle(title);
    }
  }, [editIndex, editCheckboxChecked, editItemSelected, editTitle]);

  const handleSaveEdit = (index: number) => {
    if (itemSelected === 'Checkboxes') {
      setCheckInList((prevList: any) =>
        prevList.map((item: any, i: number) =>
          i === index
            ? {
                ...item,
                title: title,
                type: itemSelected,
                required: checkboxChecked,
                options: checkboxOptions,
              }
            : item,
        ),
      );
    }
    if (itemSelected === 'Multiple choice') {
      setCheckInList((prevList: any) =>
        prevList.map((item: any, i: number) =>
          i === index
            ? {
                ...item,
                title: title,
                type: itemSelected,
                required: checkboxChecked,
                options: multipleChoiceOptions,
              }
            : item,
        ),
      );
    }
    if (itemSelected !== 'Checkboxes' && itemSelected !== 'Multiple choice') {
      setCheckInList((prevList: any) =>
        prevList.map((item: any, i: number) =>
          i === index
            ? {
                ...item,
                title: title,
                type: itemSelected,
                required: checkboxChecked,
              }
            : item,
        ),
      );
    }
    setEditIndex(null);
    setAddMode(false);
  };

  const handleCancelEdit = () => {
    setEditIndex(null);
    setAddMode(false);
    setEditTitle('');
    setEditItemSelected('');
    setEditCheckboxChecked(false);
  };

  return (
    <div className="w-full border border-Gray-50 rounded-2xl p-4 bg-backgroundColor-Card mb-3 mt-2">
      <div className="w-full flex items-center justify-between">
        <div className="text-Text-Primary text-xs font-medium">Question</div>
        <div className="flex items-center">
          <img
            src="/icons/close-square.svg"
            alt=""
            className="w-[18px] h-[18px] cursor-pointer"
            onClick={() => {
              if (editIndex !== null) {
                handleCancelEdit();
              } else {
                setItemSelected('');
                setTitle('');
                setCheckboxChecked(false);
                setAddMode(false);
              }
            }}
          />
          <img
            src={`${!title || !itemSelected ? '/icons/tick-square-background.svg' : '/icons/tick-square-background-green.svg'}`}
            alt=""
            className="w-[18px] h-[18px] cursor-pointer ml-2"
            onClick={() => {
              if (editIndex !== null) {
                handleSaveEdit(editIndex);
              } else {
                addToCheckInList();
              }
            }}
          />
        </div>
      </div>
      <div className="flex flex-col items-start w-full mt-2">
        <input
          placeholder="Write your question..."
          className="w-full h-[28px] border border-Gray-50 bg-backgroundColor-Card rounded-2xl text-xs font-light px-4 placeholder:text-Text-Fivefold"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <label
          htmlFor="required"
          className="flex items-center space-x-1 cursor-pointer mt-1.5"
        >
          <input
            id="required"
            type="checkbox"
            checked={checkboxChecked}
            onChange={() => setCheckboxChecked(!checkboxChecked)}
            className="hidden"
          />
          <div
            className={`w-4 h-4 flex items-center justify-center rounded border-[0.5px] border-Text-Fivefold ${
              checkboxChecked ? 'bg-Primary-DeepTeal' : ' bg-white '
            }`}
          >
            {checkboxChecked && (
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
            className={`text-[10px] leading-6 ${checkboxChecked ? 'text-Primary-DeepTeal' : 'text-Text-Fivefold'} select-none`}
          >
            Required
          </div>
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-2">
        {mode.map((item, index) => {
          return (
            <div
              className={`flex items-center justify-start w-[49%] h-[40px] rounded-xl px-3 py-1 border ${itemSelected === item.title ? 'border-Primary-EmeraldGreen' : 'border-Gray-50'} cursor-pointer`}
              key={index}
              onClick={() => {
                if (itemSelected === item.title) {
                  setItemSelected('');
                } else {
                  setItemSelected(item.title);
                }
              }}
            >
              <div className="w-8 h-6 rounded-lg bg-Primary-DeepTeal flex items-center justify-center bg-opacity-10">
                <img src={item.icon} alt="" />
              </div>
              <div className="flex flex-col ml-2">
                <div className="text-Text-Primary text-[10px] font-normal">
                  {item.title}
                </div>
                <div className="text-Text-Fivefold text-[8px] font-normal">
                  {item.desc}
                </div>
              </div>
            </div>
          );
        })}
        <div
          className={`flex w-[99.5%] rounded-xl px-3 py-1.5 border ${itemSelected === 'Checkboxes' ? 'border-Primary-EmeraldGreen' : 'border-Gray-50'}`}
        >
          <div
            className="cursor-pointer flex items-start w-[35%]"
            onClick={() => {
              if (itemSelected === 'Checkboxes') {
                setItemSelected('');
              } else {
                setItemSelected('Checkboxes');
              }
            }}
          >
            <div className="w-8 h-6 rounded-lg bg-Primary-DeepTeal flex items-center justify-center bg-opacity-10">
              <img src="/icons/task-square.svg" alt="" />
            </div>
            <div className="flex flex-col ml-2">
              <div className="text-Text-Primary text-[10px] font-normal">
                Checkboxes
              </div>
              <div className="text-Text-Fivefold text-[8px] font-normal">
                Choose from Checkboxes
              </div>
            </div>
          </div>
          <div className="flex items-start w-[65%]">
            <div className="flex flex-wrap gap-1 w-full">
              {checkboxOptions.map((option, index) => {
                return (
                  <div
                    className="flex items-center justify-center gap-1"
                    key={index}
                  >
                    <div className="w-3 h-3 rounded-[2px] border border-Primary-DeepTeal"></div>
                    <input
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(index, e.target.value)
                      }
                      className="bg-backgroundColor-Card border border-Gray-50 rounded-2xl py-1 px-2 text-[8px] w-[130px]"
                    />
                  </div>
                );
              })}
            </div>
            <div
              className="text-[10px] font-medium text-Primary-DeepTeal flex items-center justify-center text-nowrap cursor-pointer ml-1 mt-1"
              onClick={addOption}
            >
              <img
                src="/icons/add-blue.svg"
                alt=""
                className="w-4 h-4 mr-[1px]"
              />{' '}
              Add New
            </div>
          </div>
        </div>
        <div
          className={`flex w-[99.5%] rounded-xl px-3 py-1.5 border ${itemSelected === 'Multiple choice' ? 'border-Primary-EmeraldGreen' : 'border-Gray-50'}`}
        >
          <div
            className="cursor-pointer flex items-start w-[35%]"
            onClick={() => {
              if (itemSelected === 'Multiple choice') {
                setItemSelected('');
              } else {
                setItemSelected('Multiple choice');
              }
            }}
          >
            <div className="w-8 h-6 rounded-lg bg-Primary-DeepTeal flex items-center justify-center bg-opacity-10">
              <img src="/icons/subtitle.svg" alt="" />
            </div>
            <div className="flex flex-col ml-2">
              <div className="text-Text-Primary text-[10px] font-normal">
                Multiple choice
              </div>
              <div className="text-Text-Fivefold text-[8px] font-normal">
                Choose from Multiple choice
              </div>
            </div>
          </div>
          <div className="flex items-start w-[65%]">
            <div className="flex flex-wrap gap-1 w-full">
              {multipleChoiceOptions.map((option, index) => {
                return (
                  <div
                    className="flex items-center justify-center gap-1"
                    key={index}
                  >
                    <div className="w-3 h-3 rounded-[8px] border border-Primary-DeepTeal"></div>
                    <input
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) =>
                        handleChoiceOptionChange(index, e.target.value)
                      }
                      className="bg-backgroundColor-Card border border-Gray-50 rounded-2xl py-1 px-2 text-[8px] w-[130px]"
                    />
                  </div>
                );
              })}
            </div>
            <div
              className="text-[10px] font-medium text-Primary-DeepTeal flex items-center justify-center text-nowrap cursor-pointer ml-1 mt-1"
              onClick={addChoiceOption}
            >
              <img
                src="/icons/add-blue.svg"
                alt=""
                className="w-4 h-4 mr-[1px]"
              />{' '}
              Add New
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddQuestionCheckIn;
