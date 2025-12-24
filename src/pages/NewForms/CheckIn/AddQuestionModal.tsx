import { useState } from 'react';
import CheckBoxSelection from './CheckBoxSelection';
import MultiChoceSelection from './MultichoiceSelection';
import Toggle from '../../../Components/RepoerAnalyse/Boxs/Toggle';
import { SelectBoxField, TextField } from '../../../Components/UnitComponents';

interface AddQuestionsModalProps {
  onCancel: () => void;
  onSubmit: (value: checkinType) => void;
  editQUestion?: checkinType;
  isQuestionary?: boolean;
  setQuestionStep: (value: number) => void;
  questions?: Array<checkinType>;
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
const conditions = [
  'equals',
  'not equals',
  'greater than',
  'less than',
  'greater than or equal',
  'less than or equal',
];

const actions = ['show this question', 'hide this question'];

const AddQuestionsModal: React.FC<AddQuestionsModalProps> = ({
  onCancel,
  onSubmit,
  editQUestion,
  isQuestionary,
  setQuestionStep,
  questions = [],
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
  const [conditionalDisplay, setConditionalDisplay] = useState(false);
  const [ifQuestion, setIfQuestion] = useState('');
  const [condition, setCondition] = useState('');
  const [value, setValue] = useState('');
  const [action, setAction] = useState('');
  const [advancedSettings, setAdvancedSettings] = useState(false);
  const [biomarker, setBiomarker] = useState(false);
  const [clientInsights, setClientInsights] = useState(false);
  const [clientGoals, setClientGoals] = useState(false);
  const [medication, setMedication] = useState(false);
  const [medicalCondition, setMedicalCondition] = useState(false);
  const [allergy, setAllergy] = useState(false);
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
      onCancel();
    }
  };

  return (
    <>
      <div className="w-full rounded-2xl p-2 md:p-4  mb-3 mt-2">
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
          className={`flex flex-wrap items-start gap-2 mt-2 bg-backgroundColor-Card overflow-auto  md:overflow-hidden h-[250px] md:h-auto border rounded-[14px] p-4 ${type == '' && showValidation ? ' border-Red ' : 'border-Gray-50'}`}
        >
          {checkInTypes.map((item, index) => {
            return (
              <>
                <div
                  className={`flex items-center justify-start w-full md:w-[49%] h-[40px] rounded-xl px-3 py-1 border ${type === item.title ? 'border-Primary-EmeraldGreen' : 'border-Gray-50'} cursor-pointer`}
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
        {isQuestionary && (
          <>
            <div className="text-xs font-medium text-Text-Primary mt-4">
              Conditional Display
            </div>
            {conditionalDisplay && (
              <div className="mt-2 flex items-center gap-y-0 gap-x-2 flex-wrap">
                <div className="w-full md:w-[40%] flex items-center gap-2">
                  <div className="text-xs font-medium text-Text-Primary">
                    If
                  </div>
                  <SelectBoxField
                    options={questions.map(
                      (question, index) =>
                        `Q${index + 1}: ${question.question}`,
                    )}
                    value={ifQuestion}
                    onChange={(value) => {
                      setIfQuestion(value);
                    }}
                    placeholder="Select a question"
                    margin="mb-1 mt-0"
                  />
                </div>
                <div className="w-full md:w-[29.3%] flex items-center gap-2">
                  <div className="text-xs font-medium text-Text-Primary">
                    is
                  </div>
                  <SelectBoxField
                    options={conditions}
                    value={condition}
                    onChange={(value) => {
                      setCondition(value);
                    }}
                    placeholder="Select condition"
                    margin="mb-1 mt-0"
                  />
                </div>
                <div className="w-full md:w-[28%] flex items-center gap-2">
                  <div className="text-xs font-medium text-Text-Primary">
                    to
                  </div>
                  <TextField
                    value={value}
                    onChange={(e) => {
                      setValue(e.target.value);
                    }}
                    placeholder="Enter a value"
                    margin="mb-1 mt-0"
                    label=""
                    isValid={true}
                    validationText=""
                  />
                </div>
                <div className="w-full md:w-[40%] flex items-center gap-2">
                  <div className="text-xs font-medium text-Text-Primary">
                    ,then
                  </div>
                  <SelectBoxField
                    options={actions}
                    value={action}
                    onChange={(value) => {
                      setAction(value);
                    }}
                    placeholder="Select action"
                    margin="mb-1 mt-0"
                  />
                </div>
              </div>
            )}
            <div className="w-full mt-2.5 mb-2 flex items-center gap-2">
              <Toggle
                checked={conditionalDisplay}
                setChecked={setConditionalDisplay}
              />
              <div className="text-xs text-Text-Primary font-normal">
                Show this question only under specific conditions
              </div>
            </div>
            <div
              className="flex items-center gap-2 mt-6 cursor-pointer"
              onClick={() => setAdvancedSettings(!advancedSettings)}
            >
              <div className="text-xs font-medium text-Text-Primary">
                Advanced Settings
              </div>
              <img
                src="/icons/arrow-down-blue.svg"
                alt=""
                className={`${advancedSettings ? 'rotate-180' : ''}`}
              />
            </div>
            {advancedSettings && (
              <div className="grid grid-cols-1 md:grid-cols-2 mt-2 flex-wrap">
                <label
                  htmlFor="biomarker"
                  className="flex items-center space-x-1 cursor-pointer mt-1.5"
                >
                  <input
                    id="biomarker"
                    type="checkbox"
                    checked={biomarker}
                    onChange={() => setBiomarker(!biomarker)}
                    className="hidden"
                  />
                  <div
                    className={`w-4 h-4 flex items-center justify-center rounded border-[0.5px] border-Text-Fivefold ${
                      biomarker ? 'bg-Primary-DeepTeal' : ' bg-white '
                    }`}
                  >
                    {biomarker && (
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
                    className={`text-xs leading-6 ${biomarker ? 'text-Primary-DeepTeal' : 'text-Text-Primary'} select-none`}
                  >
                    This question measures a biomarker.
                  </div>
                </label>
                <label
                  htmlFor="client-insights"
                  className="flex items-center space-x-1 cursor-pointer mt-1.5"
                >
                  <input
                    id="client-insights"
                    type="checkbox"
                    checked={clientInsights}
                    onChange={() => setClientInsights(!clientInsights)}
                    className="hidden"
                  />
                  <div
                    className={`w-4 h-4 flex items-center justify-center rounded border-[0.5px] border-Text-Fivefold ${
                      clientInsights ? 'bg-Primary-DeepTeal' : ' bg-white '
                    }`}
                  >
                    {clientInsights && (
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
                    className={`text-xs leading-6 ${clientInsights ? 'text-Primary-DeepTeal' : 'text-Text-Primary'} select-none`}
                  >
                    Response used for Client Insights.
                  </div>
                </label>
                <label
                  htmlFor="client-goals"
                  className="flex items-center space-x-1 cursor-pointer mt-1.5"
                >
                  <input
                    id="client-goals"
                    type="checkbox"
                    checked={clientGoals}
                    onChange={() => setClientGoals(!clientGoals)}
                    className="hidden"
                  />
                  <div
                    className={`w-4 h-4 flex items-center justify-center rounded border-[0.5px] border-Text-Fivefold ${
                      clientGoals ? 'bg-Primary-DeepTeal' : ' bg-white '
                    }`}
                  >
                    {clientGoals && (
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
                    className={`text-xs leading-6 ${clientGoals ? 'text-Primary-DeepTeal' : 'text-Text-Primary'} select-none`}
                  >
                    Response used for Client Goals.
                  </div>
                </label>
                <label
                  htmlFor="medication"
                  className="flex items-center space-x-1 cursor-pointer mt-1.5"
                >
                  <input
                    id="medication"
                    type="checkbox"
                    checked={medication}
                    onChange={() => setMedication(!medication)}
                    className="hidden"
                  />
                  <div
                    className={`w-4 h-4 flex items-center justify-center rounded border-[0.5px] border-Text-Fivefold ${
                      medication ? 'bg-Primary-DeepTeal' : ' bg-white '
                    }`}
                  >
                    {medication && (
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
                    className={`text-xs leading-6 ${medication ? 'text-Primary-DeepTeal' : 'text-Text-Primary'} select-none`}
                  >
                    Response used for Medication.
                  </div>
                </label>
                <label
                  htmlFor="medical-condition"
                  className="flex items-center space-x-1 cursor-pointer mt-1.5"
                >
                  <input
                    id="medical-condition"
                    type="checkbox"
                    checked={medicalCondition}
                    onChange={() => setMedicalCondition(!medicalCondition)}
                    className="hidden"
                  />
                  <div
                    className={`w-4 h-4 flex items-center justify-center rounded border-[0.5px] border-Text-Fivefold ${
                      medicalCondition ? 'bg-Primary-DeepTeal' : ' bg-white '
                    }`}
                  >
                    {medicalCondition && (
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
                    className={`text-xs leading-6 ${medicalCondition ? 'text-Primary-DeepTeal' : 'text-Text-Primary'} select-none`}
                  >
                    Response used for Medical Condition.
                  </div>
                </label>
                <label
                  htmlFor="allergy"
                  className="flex items-center space-x-1 cursor-pointer mt-1.5"
                >
                  <input
                    id="allergy"
                    type="checkbox"
                    checked={allergy}
                    onChange={() => setAllergy(!allergy)}
                    className="hidden"
                  />
                  <div
                    className={`w-4 h-4 flex items-center justify-center rounded border-[0.5px] border-Text-Fivefold ${
                      allergy ? 'bg-Primary-DeepTeal' : ' bg-white '
                    }`}
                  >
                    {allergy && (
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
                    className={`text-xs leading-6 ${allergy ? 'text-Primary-DeepTeal' : 'text-Text-Primary'} select-none`}
                  >
                    Response used for Allergy.
                  </div>
                </label>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default AddQuestionsModal;
