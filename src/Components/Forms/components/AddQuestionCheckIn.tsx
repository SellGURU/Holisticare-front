/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useState } from 'react';

const mode = [
  {
    icon: '/icons/textalign-justifyleft.svg',
    title: 'Text',
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
}

const AddQuestionCheckIn: FC<AddQuestionCheckInProps> = ({
  setAddMode,
  setCheckInList,
}) => {
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [itemSelected, setItemSelected] = useState('');
  const [title, setTitle] = useState('');
  const addToCheckInList = () => {
    if (!title.trim() || !itemSelected.trim()) return;

    setCheckInList((prevList: any) => [
      {
        title,
        type: itemSelected,
        required: checkboxChecked,
      },
      ...prevList,
    ]);

    setTitle('');
    setItemSelected('');
    setCheckboxChecked(false);
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
            onClick={() => setAddMode(false)}
          />
          <img
            src={`${!title || !itemSelected ? '/icons/tick-square-background.svg' : '/icons/tick-square-background-green.svg'}`}
            alt=""
            className="w-[18px] h-[18px] cursor-pointer ml-2"
            onClick={addToCheckInList}
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
          htmlFor="terms"
          className="flex items-center space-x-1 cursor-pointer mt-1.5"
        >
          <input
            id="terms"
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
                if (!itemSelected) {
                  setItemSelected(item.title);
                } else {
                  setItemSelected('');
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
          className={`flex items-center justify-start w-[99.5%] rounded-xl px-3 py-1.5 border ${itemSelected === 'Checkboxes' ? 'border-Primary-EmeraldGreen' : 'border-Gray-50'}`}
          onClick={() => {
            if (!itemSelected) {
              setItemSelected('Checkboxes');
            } else {
              setItemSelected('');
            }
          }}
        >
          <div className="cursor-pointer flex items-center">
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
        </div>
        <div
          className={`flex items-center justify-start w-[99.5%] rounded-xl px-3 py-1.5 border ${itemSelected === 'Multiple choice' ? 'border-Primary-EmeraldGreen' : 'border-Gray-50'}`}
          onClick={() => {
            if (!itemSelected) {
              setItemSelected('Multiple choice');
            } else {
              setItemSelected('');
            }
          }}
        >
          <div className="cursor-pointer flex items-center">
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
        </div>
      </div>
    </div>
  );
};

export default AddQuestionCheckIn;
