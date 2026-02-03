/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeEvent, FC, useEffect, useState } from 'react';
import CheckBoxSelection from './CheckBoxSelection';
import MultiChoceSelection from './MultichoiceSelection';
import Toggle from '../../../Components/RepoerAnalyse/Boxs/Toggle';
import { SelectBoxField, TextField } from '../../../Components/UnitComponents';

interface AddQuestionsModalProps {
  onCancel: () => void;
  onSubmit: (value: QuestionaryType) => void;
  editQUestion?: QuestionaryType;
  isQuestionary?: boolean;
  setQuestionStep: (value: number) => void;
  questions?: Array<QuestionaryType>;
}

const checkInTypes = [
  {
    icon: '/icons/textalign-justifyleft.svg',
    title: 'Paragraph',
    desc: 'Small or log text like title or ...',
  },
  {
    icon: '/icons/number-category.svg',
    title: 'Number',
    desc: 'Numeric value like age or amount',
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
  // 'between',
  // 'not between',
  'contains',
  'not contains',
  'starts with',
  'ends with',
  'matches regex',
  'not matches regex',
  // 'is empty',
  // 'not empty',
  // 'is null',
  // 'not null',
  // 'in array',
  // 'not in array',
  // 'all in array',
  // 'any in array',
  'length equals',
  'length greater',
  'length less',
  // 'length between',
  'date after',
  'date before',
  // 'date between',
  'date equals',
  // 'file uploaded',
  // 'file not uploaded',
  // 'file size greater',
  // 'file size less',
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
  const [conditionalDisplay, setConditionalDisplay] = useState(
    editQUestion?.conditions?.length && editQUestion.conditions.length > 0
      ? true
      : false,
  );
  const [ifQuestion, setIfQuestion] = useState({
    question_order:
      editQUestion?.conditions?.[0]?.rules?.[0]?.question_order || 0,
    question: editQUestion?.conditions?.[0]?.rules?.[0]?.question_order
      ? questions.find(
          (q) =>
            q.order ===
            editQUestion?.conditions?.[0]?.rules?.[0]?.question_order,
        )?.question
      : '',
  });
  const [condition, setCondition] = useState(
    editQUestion?.conditions?.[0]?.rules?.[0]?.operator || '',
  );
  const [value, setValue] = useState(
    editQUestion?.conditions?.[0]?.rules?.[0]?.value || '',
  );
  const [action, setAction] = useState(
    editQUestion?.conditions?.[0]?.actions?.[0]?.type || '',
  );
  const [advancedSettings, setAdvancedSettings] = useState(false);
  const [biomarker] = useState(editQUestion?.is_biomarker || false);
  const [clientInsights, setClientInsights] = useState(
    editQUestion?.use_in_insights || false,
  );
  const [clientGoals, setClientGoals] = useState(
    editQUestion?.is_goal || false,
  );
  const [medication, setMedication] = useState(
    editQUestion?.is_medication || false,
  );
  const [medicalCondition, setMedicalCondition] = useState(
    editQUestion?.is_condition || false,
  );
  const [allergy, setAllergy] = useState(editQUestion?.is_allergy || false);
  useEffect(() => {
    if (conditionalDisplay === false) {
      setIfQuestion({
        question_order: 0,
        question: '',
      });
      setCondition('');
      setValue('');
      setAction('');
    }
  }, [conditionalDisplay]);
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
  const toSnakeCase = (text: string) => text.toLowerCase().replace(/\s+/g, '_');

  const submit = () => {
    setShowValidation(true);
    if (!isDisabled() && !hasValidationErrors()) {
      const resolvedQuestion: QuestionaryType = {
        order: editQUestion?.order || 0,
        map_to_biomarker: editQUestion?.map_to_biomarker || '',
        hide: editQUestion?.hide || false,
        use_function_calculation:
          editQUestion?.use_function_calculation || false,
        unit: editQUestion?.unit || '',
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
        is_biomarker: biomarker,
        use_in_insights: clientInsights,
        is_goal: clientGoals,
        is_medication: medication,
        is_condition: medicalCondition,
        is_allergy: allergy,
        conditions: [],
      };
      if (conditionalDisplay) {
        resolvedQuestion.conditions = [
          {
            priority: 1,
            logic: 'AND',
            rules: [
              {
                question_order: ifQuestion.question_order,
                operator: toSnakeCase(condition),
                value: value,
              },
            ],
            actions: [
              {
                type: action.split(' ')[0],
              },
            ],
          },
        ];
      }
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
              <div className="mt-2 grid grid-cols-4 items-center gap-y-0 gap-x-2 flex-wrap">
                <div className="w-full col-span-2 flex items-center gap-2">
                  <div className="text-xs font-medium text-Text-Primary">
                    If
                  </div>
                  <SelectBoxField
                    prefix="Q"
                    options={questions.map((q) => q.question)}
                    value={
                      ifQuestion?.question && ifQuestion?.question?.length > 38
                        ? ifQuestion.question?.substring(0, 35) + '...'
                        : ifQuestion.question + ''
                    }
                    onChange={(value) => {
                      setIfQuestion({
                        question: value,
                        question_order:
                          questions.find((q) => q.question === value)?.order ||
                          0,
                      });
                    }}
                    disabledIndexs={[
                      questions.findIndex(
                        (q) => q.order == editQUestion?.order,
                      ),
                    ]}
                    placeholder="Select a question"
                    margin="mb-1 mt-0"
                    position="bottom"
                    bottom="bottom-[29px]"
                  />
                </div>
                <div className="w-full  col-span-2  flex items-center gap-2">
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
                    position="bottom"
                    bottom="bottom-[29px]"
                  />
                </div>
                <div className="w-full col-span-2  flex items-center gap-2">
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
                <div className="w-full col-span-2 flex items-center gap-2">
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
                    position="bottom"
                    bottom="bottom-[29px]"
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
                {/* <AdvancedItems
                  checked={biomarker}
                  onChange={(e) => setBiomarker(e.target.checked)}
                  label="biomarker"
                  description="This question measures a biomarker."
                /> */}
                <AdvancedItems
                  checked={clientInsights}
                  onChange={(e) => setClientInsights(e.target.checked)}
                  label="client-insights"
                  description="Response used for Client Insights."
                />
                <AdvancedItems
                  checked={clientGoals}
                  onChange={(e) => setClientGoals(e.target.checked)}
                  label="client-goals"
                  description="Response used for Client Goals."
                />
                <AdvancedItems
                  checked={medication}
                  onChange={(e) => setMedication(e.target.checked)}
                  label="medication"
                  description="Response used for Medication."
                />
                <AdvancedItems
                  checked={medicalCondition}
                  onChange={(e) => setMedicalCondition(e.target.checked)}
                  label="medical-condition"
                  description="Response used for Medical Condition."
                />
                <AdvancedItems
                  checked={allergy}
                  onChange={(e) => setAllergy(e.target.checked)}
                  label="allergy"
                  description="Response used for Allergy."
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default AddQuestionsModal;

interface AdvancedItemsProps {
  checked: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  label: string;
  description: string;
}

const AdvancedItems: FC<AdvancedItemsProps> = ({
  checked,
  onChange,
  label,
  description,
}) => {
  return (
    <label
      htmlFor={label}
      className="flex items-center space-x-1 cursor-pointer mt-1.5"
    >
      <input
        id={label}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e)}
        className="hidden"
      />
      <div
        className={`w-4 h-4 flex items-center justify-center rounded border-[0.5px] border-Text-Fivefold ${
          checked ? 'bg-Primary-DeepTeal' : ' bg-white '
        }`}
      >
        {checked && (
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
        className={`text-xs leading-6 ${checked ? 'text-Primary-DeepTeal' : 'text-Text-Primary'} select-none`}
      >
        {description}
      </div>
    </label>
  );
};
