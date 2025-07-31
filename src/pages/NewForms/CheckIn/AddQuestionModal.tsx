import { useState } from 'react';
import CheckBoxSelection from './CheckBoxSelection';
import MultiChoceSelection from './MultichoiceSelection';

interface AddQuestionsModalProps {
  onCancel: () => void;
  onSubmit: (value: checkinType) => void;
  editQUestion?: checkinType;
  setQuestionStep: (value: number) => void;
}

const checkInTypes = [
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

const AddQuestionsModal: React.FC<AddQuestionsModalProps> = ({
  onCancel,
  onSubmit,
  editQUestion,
  setQuestionStep,
}) => {
  const [qustion, setQuestion] = useState(
    editQUestion ? editQUestion?.question : '',
  );
  const [required, setRequired] = useState(
    editQUestion ? editQUestion?.required : false,
  );
  const [type, setType] = useState(editQUestion ? editQUestion.type : '');
  const [showValidation, setShowValidation] = useState(false);
  const [CheckBoxoptions, setCheckBoxOptions] = useState<Array<string>>(
    editQUestion?.type == 'checkbox' && editQUestion.options
      ? editQUestion.options
      : ['', ''],
  );
  const [multiChoiceOptions, setMutiChoiceOptions] = useState<Array<string>>(
    editQUestion?.type == 'multiple_choice' && editQUestion.options
      ? editQUestion.options
      : ['', ''],
  );
  const clear = () => {
    setQuestion('');
    setRequired(false);
    setType('');
    setCheckBoxOptions(['', '']);
    setMutiChoiceOptions(['', '']);
    setShowValidation(false);
  };
  const isDisabled = () => {
    return qustion.length == 0 || type == '';
  };

  const hasValidationErrors = () => {
    if (type === 'checkbox') {
      const nonEmptyOptions = CheckBoxoptions.filter(
        (opt) => opt.trim() !== '',
      );
      return nonEmptyOptions.length < 2;
    }
    if (type === 'multiple_choice') {
      const nonEmptyOptions = multiChoiceOptions.filter(
        (opt) => opt.trim() !== '',
      );
      return nonEmptyOptions.length < 2;
    }
    return false;
  };

  const submit = () => {
    setShowValidation(true);
    if (!isDisabled() && !hasValidationErrors()) {
      const resolvedQuestion: checkinType = {
        question: qustion,
        required: required,
        response: '',
        type: type,
        options:
          type == 'checkbox'
            ? CheckBoxoptions
            : type == 'multiple_choice'
              ? multiChoiceOptions
              : undefined,
      };
      onSubmit(resolvedQuestion);
      setQuestionStep(2);
      clear();
      onCancel()
    }
  };

  return (
    <>
      <div className="w-full rounded-2xl p-4  mb-3 mt-2">
        <div className="w-full flex items-center justify-between">
          <div className="text-Text-Primary text-xs font-medium flex items-center gap-2">
            <div
              onClick={() => {
                setQuestionStep(0);
                onCancel();
              }}
              className="size-6 bg-white p-[3px] cursor-pointer rounded-[4.5px] border border-Gray-50 flex items-center"
            >
              <img src="/icons/arrow-back.svg" alt="" />
            </div>
            {editQUestion ? 'Edit Question ' : 'Add Question'}{' '}
          </div>
          <div
            onClick={submit}
            className="text-xs font-medium text-Primary-DeepTeal cursor-pointer"
          >
            {' '}
            {editQUestion ? 'Update Question ' : 'Save Question'}{' '}
          </div>
          {/* <div className="flex items-center">
            <img
              src="/icons/close-square.svg"
              alt=""
              className="w-[18px] h-[18px] cursor-pointer"
              onClick={() => {
                clear();
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
          </div> */}
        </div>
        <div className="flex flex-col items-start w-full mt-4">
          <div className="text-xs font-medium text-Text-Primary mb-1">
            Question
          </div>
          <input
            placeholder="Write your question (e.g., How are you feeling today?)"
            className={`w-full h-[28px] border  bg-backgroundColor-Card rounded-2xl text-xs font-light px-4 placeholder:text-Text-Fivefold ${showValidation && qustion == '' ? 'border-Red' : 'border-Gray-50'}`}
            type="text"
            value={qustion}
            onChange={(e) => setQuestion(e.target.value)}
          />
          {showValidation && qustion == '' && (
            <div className="text-[8px] text-Red mt-1">
              This field is required.{' '}
            </div>
          )}

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
        <div
          className={`flex flex-wrap items-start gap-2 mt-2 bg-backgroundColor-Card border rounded-[14px] p-4 ${type == '' && showValidation ? ' border-Red ' : 'border-Gray-50'}`}
        >
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
            isActive={type == 'checkbox'}
            toggle={() => {
              if (type == 'checkbox') {
                setType('');
              } else {
                setType('checkbox');
              }
            }}
            onChange={(values) => {
              setCheckBoxOptions(values);
            }}
            showValidation={showValidation && type === 'checkbox'}
          ></CheckBoxSelection>

          <MultiChoceSelection
            values={multiChoiceOptions}
            isActive={type == 'multiple_choice'}
            toggle={() => {
              if (type == 'multiple_choice') {
                setType('');
              } else {
                setType('multiple_choice');
              }
            }}
            onChange={(values) => {
              setMutiChoiceOptions(values);
            }}
            showValidation={showValidation && type === 'multiple_choice'}
          ></MultiChoceSelection>
        </div>
        {type == '' && showValidation && (
          <div className="text-Red text-[10px] mt-2">
            {' '}
            Please select an answer type.
          </div>
        )}
      </div>
    </>
  );
};

export default AddQuestionsModal;
