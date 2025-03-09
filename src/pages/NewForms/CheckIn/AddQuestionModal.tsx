import { useState } from 'react';
import CheckBoxSelection from './CheckBoxSelection';
import MultiChoceSelection from './MultichoiceSelection';

interface AddQuestionsModalProps {
  onCancel: () => void;
  onSubmit: (value: checkinType) => void;
  editQUestion?:checkinType
}

const checkInTypes = [
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

const AddQuestionsModal: React.FC<AddQuestionsModalProps> = ({
  onCancel,
  onSubmit,
  editQUestion
}) => {
  const [qustion, setQuestion] = useState(editQUestion?editQUestion?.question:'');
  const [required, setRequired] = useState(editQUestion?editQUestion?.required:false);
  const [type, setType] = useState(editQUestion?editQUestion.type:'');
  const [CheckBoxoptions, setCheckBoxOptions] = useState<Array<string>>(editQUestion?.type=='Checkboxes'&&editQUestion.options?editQUestion.options:["",""]);
  const [multiChoiceOptions, setMutiChoiceOptions] = useState<Array<string>>(
    editQUestion?.type=='Multiple choice'&&editQUestion.options?editQUestion.options:["",""],
  );
  const isDisabled = () => {
    return qustion.length == 0 || type == '';
  };
  const submit = () => {
    const resolvedQuestion: checkinType = {
      question: qustion,
      required: required,
      response: '',
      type: type,
      options:
        type == 'Checkboxes'
          ? CheckBoxoptions
          : type == 'Multiple choice'
            ? multiChoiceOptions
            : undefined,
    };
    onSubmit(resolvedQuestion);
    clear();
  };
  const clear = () => {
    setQuestion('');
    setRequired(false);
    setType('');
    setCheckBoxOptions(['', '']);
    setMutiChoiceOptions(['', '']);
  };

  return (
    <>
      <div className="w-full border border-Gray-50 rounded-2xl p-4 bg-backgroundColor-Card mb-3 mt-2">
        <div className="w-full flex items-center justify-between">
          <div className="text-Text-Primary text-xs font-medium">Question</div>
          <div className="flex items-center">
            <img
              src="/icons/close-square.svg"
              alt=""
              className="w-[18px] h-[18px] cursor-pointer"
              onClick={() => {
                clear()
                onCancel();
                // if (editIndex !== null) {
                //     handleCancelEdit();
                // } else {
                //     setItemSelected('');
                //     setTitle('');
                //     setCheckboxChecked(false);
                //     setAddMode(false);
                // }
              }}
            />
            <img
              src={
                isDisabled()
                  ? `/icons/tick-square-background.svg`
                  : `/icons/tick-square-background-green.svg`
              }
              alt=""
              className={`${isDisabled() ? 'cursor-not-allowed' : 'cursor-pointer'} w-[18px] h-[18px]  ml-2`}
              onClick={() => {
                if (!isDisabled()) {
                  submit();
                }
                // if (editIndex !== null) {
                //     handleSaveEdit(editIndex);
                // } else {
                //     addToCheckInList();
                // }
              }}
            />
          </div>
        </div>
        <div className="flex flex-col items-start w-full mt-2">
          <input
            placeholder="Write your question..."
            className="w-full h-[28px] border border-Gray-50 bg-backgroundColor-Card rounded-2xl text-xs font-light px-4 placeholder:text-Text-Fivefold"
            type="text"
            value={qustion}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <label
            htmlFor="required"
            className="flex items-center space-x-1 cursor-pointer mt-1.5"
          >
            <input
              id="required"
              type="checkbox"
              checked={required}
              onChange={() => setRequired(!required)}
              className="hidden"
            />
            <div
              className={`w-4 h-4 flex items-center justify-center rounded border-[0.5px] border-Text-Fivefold ${
                required ? 'bg-Primary-DeepTeal' : ' bg-white '
              }`}
            >
              {required && (
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
              className={`text-[10px] leading-6 ${required ? 'text-Primary-DeepTeal' : 'text-Text-Fivefold'} select-none`}
            >
              Required
            </div>
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {checkInTypes.map((item, index) => {
            return (
              <>
                <div
                  className={`flex items-center justify-start w-[49%] h-[40px] rounded-xl px-3 py-1 border ${type === item.title ? 'border-Primary-EmeraldGreen' : 'border-Gray-50'} cursor-pointer`}
                  key={index}
                  onClick={() => {
                    if (type === item.title) {
                      setType('');
                    } else {
                      setType(item.title);
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
              </>
            );
          })}
          <CheckBoxSelection
            values={CheckBoxoptions}
            isActive={type == 'Checkboxes'}
            toggle={() => {
              if (type == 'Checkboxes') {
                setType('');
              } else {
                setType('Checkboxes');
              }
            }}
            onChange={(values) => {
              setCheckBoxOptions(values);
            }}
          ></CheckBoxSelection>

          <MultiChoceSelection
            values={multiChoiceOptions}
            isActive={type == 'Multiple choice'}
            toggle={() => {
              if (type == 'Multiple choice') {
                setType('');
              } else {
                setType('Multiple choice');
              }
            }}
            onChange={(values) => {
              setMutiChoiceOptions(values);
            }}
          ></MultiChoceSelection>
        </div>
      </div>
    </>
  );
};

export default AddQuestionsModal;
