/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from 'react';
import { BeatLoader } from 'react-spinners';
import FormsApi from '../../../api/Forms';
import { ButtonSecondary } from '../../../Components/Button/ButtosSecondary';
import Checkbox from '../../../Components/checkbox';
import Circleloader from '../../../Components/CircleLoader';
import Toggle from '../../../Components/RepoerAnalyse/Boxs/Toggle';
import TextField from '../../../Components/TextField';
import { TextAreaField } from '../../../Components/UnitComponents';
import AddQuestionsModal from './AddQuestionModal';
import QuestionItem from './QuestionItem';
import TimerPicker from './TimerPicker';
interface QuestionaryControllerModalProps {
  editId?: string;
  mode?: 'Edit' | 'Reposition' | 'Add';
  onClose: () => void;
  onSave: (values: any) => void;
  templateData?: any;
  error: string;
  isQuestionary?: boolean;
  textErrorMessage: string;
}

const QuestionaryControllerModal: FC<QuestionaryControllerModalProps> = ({
  mode,
  onClose,
  onSave,
  editId,
  templateData,
  error,
  isQuestionary,
  textErrorMessage,
}) => {
  const [isError, setIsError] = useState(false);
  const [step, setStep] = useState(0);
  const [checked, setChecked] = useState(false);
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(15);
  const [questions, setQuestions] = useState<Array<checkinType>>(
    templateData ? templateData.questions : [],
  );
  const [AddquestionStep, setAddquestionStep] = useState(0);
  const [showTitleRequired, setShowTitleRequired] = useState(false);
  const [autoAssign, setAutoAssign] = useState(false);
  const [genderRestriction, setGenderRestriction] = useState(false);
  const [gender, setGender] = useState('female');
  useEffect(() => {
    if (error && error == 'A form with the same title already exists.') {
      setTitleForm(templateData?.title || '');
      setIsError(true);
      setStep(0);
      setIsSaveLoading(false);
    }
  }, [error]);
  const stepTitleInfo = (step: number) => {
    switch (step) {
      case 0:
        return ': General Info';
      case 1:
        return ': Questions';
      case 2:
        return ': Time & Assignment';
    }
  };
  const resolveFormTitle = () => {
    if (templateData == null && mode == 'Add') {
      return (
        'Create Personal Form' + ' - Step ' + (step + 1) + stepTitleInfo(step)
      );
    } else if (templateData != null) {
      return 'Create Form - Step ' + (step + 1) + stepTitleInfo(step);
    }
    switch (mode) {
      case 'Add':
        return 'Feedback';
      // case 'Reposition':
      //   return 'Reposition Check-in';
      case 'Edit':
        return 'Edit';
    }
  };
  const onAddQuestion = () => {
    if (templateData != null) {
      return true;
    }
    if (titleForm.length > 0) {
      setShowValidation(false);
      return true;
    } else {
      setShowTitleRequired(true);
      return false;
    }
  };
  const resolveBoxRender = () => {
    switch (mode) {
      case 'Add':
        return (
          <AddQuestionary
            onAddQuestion={onAddQuestion}
            questionStep={AddquestionStep}
            setQuestionStep={(value) => {
              setAddquestionStep(value);
            }}
            upQuestions={questions}
            onChange={(values) => {
              setQuestions(values);
            }}
            onChangeChecked={(value: boolean) => {
              setChecked(value);
            }}
            onChangeMinutes={(value: number) => {
              setMinutes(value);
            }}
            onChangeSeconds={(value: number) => {
              setSeconds(value);
            }}
            upChecked={checked}
            upMinutes={minutes}
            upSeconds={seconds}
            step={step}
            mode={mode}
            isQuestionary={isQuestionary}
            autoAssign={autoAssign}
            setAutoAssign={setAutoAssign}
            genderRestriction={genderRestriction}
            setGenderRestriction={setGenderRestriction}
            gender={gender}
            setGender={setGender}
            textErrorMessage={textErrorMessage}
          />
        );
      // case 'Reposition':
      //   return (
      //     <>
      //       <RepositionCheckIn
      //         onChange={(values) => {
      //           setQuestions(values);
      //         }}
      //         upQuestions={questions}
      //       ></RepositionCheckIn>
      //     </>
      //   );
      case 'Edit':
        return (
          <AddQuestionary
            onAddQuestion={onAddQuestion}
            questionStep={AddquestionStep}
            setQuestionStep={(value) => {
              setAddquestionStep(value);
            }}
            upQuestions={questions}
            onChange={(values) => {
              setQuestions(values);
            }}
            onChangeChecked={(value: boolean) => {
              setChecked(value);
            }}
            onChangeMinutes={(value: number) => {
              setMinutes(value);
            }}
            onChangeSeconds={(value: number) => {
              setSeconds(value);
            }}
            upChecked={checked}
            upMinutes={minutes}
            upSeconds={seconds}
            step={step}
            mode={mode}
            isQuestionary={isQuestionary}
            autoAssign={autoAssign}
            setAutoAssign={setAutoAssign}
            genderRestriction={genderRestriction}
            setGenderRestriction={setGenderRestriction}
            gender={gender}
            setGender={setGender}
            textErrorMessage={textErrorMessage}
          />
        );
    }
  };
  const [titleForm, setTitleForm] = useState(templateData?.title || '');
  const [descriptionForm, setDescriptionForm] = useState(
    templateData?.description || '',
  );
  const [consentText, setConsentText] = useState(
    templateData?.consent_text || '',
  );
  const [requireClientConsent, setRequireClientConsent] = useState(
    templateData?.show_consent || false,
  );
  const isDisable = () => {
    // if (templateData == null) {
    if (titleForm.length == 0) {
      return true;
    } else if (requireClientConsent && consentText.length == 0) {
      return true;
    } else if (questions.length == 0 && step !== 0) {
      return true;
    }
    // }
    return false;
  };
  const [isSaveLoding, setIsSaveLoading] = useState(false);
  useEffect(() => {
    if (textErrorMessage) {
      setIsSaveLoading(false);
    }
  }, [textErrorMessage]);
  const addCheckinForm = () => {
    setIsSaveLoading(true);
    const getTimeInMilliseconds = () => {
      return minutes * 60000 + seconds * 1000;
    };
    onSave({
      title: titleForm.length > 0 ? titleForm : templateData.title,
      questions: questions,
      share_with_client: checked,
      time: getTimeInMilliseconds(),
      consent_text: consentText,
      show_consent: requireClientConsent,
      description: descriptionForm,
      default_questionnaire: autoAssign,
      gender_target: genderRestriction ? gender : 'both',
    });
    // FormsApi.addCheckin({
    //   title: titleForm,
    //   questions: questions,
    // });
  };
  const [loading, setLoading] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  useEffect(() => {
    if (editId != '' && editId) {
      setLoading(true);
      FormsApi.showQuestinary(editId).then((res) => {
        setQuestions(res.data.questions);
        setTitleForm(res.data.title);
        setDescriptionForm(res.data.description || '');
        setConsentText(res.data.consent_text || '');
        setRequireClientConsent(res.data.consent_text?.length > 0);
        setAutoAssign(res.data.default_questionnaire);
        setGenderRestriction(res.data.gender_target != 'both');
        setGender(res.data.gender_target);
        const totalMs = res.data.time;
        const mins = Math.floor(totalMs / 60000);
        const secs = Math.floor((totalMs % 60000) / 1000);
        setMinutes(mins);
        setSeconds(secs);
        setChecked(res.data.share_with_client);
        setLoading(false);
      });
    }
  }, [editId]);
  return (
    <>
      {loading && (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-85 z-[50]">
          <Circleloader></Circleloader>
        </div>
      )}
      <div
        className="flex flex-col justify-between bg-white w-[90vw] md:w-[664px] rounded-[20px] p-4 max-h-[650px] overflow-y-auto"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#E5E5E5 transparent',
        }}
      >
        <div className="w-full h-full">
          <div className="flex justify-start items-center">
            <div className="text-Text-Primary font-medium">
              {resolveFormTitle()}
            </div>
          </div>
          <div className="w-full h-[1px] bg-Boarder my-3"></div>
          {step == 0 && (
            <>
              {AddquestionStep == 0 || AddquestionStep == 2 ? (
                <>
                  <div className="w-full mt-6">
                    <TextField
                      newStyle
                      type="text"
                      name="formtitle"
                      label="Form Title"
                      placeholder="Enter form title (e.g., Feedback Form)"
                      value={titleForm}
                      onChange={(e) => {
                        setTitleForm(e.target.value);
                        setIsError(false);
                        setShowTitleRequired(false);
                      }}
                      inValid={
                        isError ||
                        (showValidation && !titleForm) ||
                        (showTitleRequired && !titleForm)
                      }
                      errorMessage={
                        isError
                          ? 'Form title already exists. Please choose another.'
                          : 'This field is required.'
                      }
                    />
                  </div>
                  <div className="w-full mt-4 mb-2">
                    <TextAreaField
                      label="Description"
                      placeholder="Explain the purpose of this questionnaire or give brief instructions for your client"
                      value={descriptionForm}
                      onChange={(e) => setDescriptionForm(e.target.value)}
                      height="h-[140px]"
                    />
                  </div>
                  {requireClientConsent && (
                    <div className="w-full mt-4 mb-2">
                      <TextAreaField
                        label="Consent Text"
                        placeholder="Write the consent statement that your client must agree to before proceeding."
                        value={consentText}
                        onChange={(e) => setConsentText(e.target.value)}
                        isValid={showValidation && !consentText ? false : true}
                        validationText={
                          showValidation && !consentText
                            ? 'This field is required.'
                            : ''
                        }
                        height="h-[140px]"
                      />
                    </div>
                  )}
                  <div className="w-full mt-5 mb-2 flex items-center gap-2">
                    <Toggle
                      checked={requireClientConsent}
                      setChecked={setRequireClientConsent}
                    />
                    <div className="text-xs text-Text-Primary font-normal">
                      Require client consent before starting this questionnaire.
                    </div>
                  </div>
                </>
              ) : (
                ''
              )}
            </>
          )}
          {AddquestionStep == 0 && step === 1 && (
            <div className="w-full text-xs text-Text-Primary font-medium mt-6">
              {templateData == null ? 'Questions' : 'Initial Questionnaire'}
            </div>
          )}
          {step !== 0 && (
            <div className="flex flex-col w-full mt-3 items-center justify-center">
              {resolveBoxRender()}
            </div>
          )}
        </div>
        {showValidation && questions.length == 0 && step === 1 && (
          <div className="text-[10px] text-Red">Add question to continue.</div>
        )}
        <div
          className={`w-full flex ${step === 0 ? 'justify-end' : 'justify-between'} items-center p-2 ${
            AddquestionStep == 1 && 'hidden'
          } `}
        >
          {step !== 0 && (
            <div
              className={`text-sm text-Primary-DeepTeal font-medium cursor-pointer`}
              onClick={() => {
                setStep(step - 1);
              }}
            >
              Back
            </div>
          )}
          <div className="flex items-center">
            <div
              className="text-Disable text-sm font-medium mr-4 cursor-pointer"
              onClick={() => {
                onClose();
              }}
            >
              Cancel
            </div>
            <div
              onClick={() => {
                setShowValidation(true);
                if (!isDisable()) {
                  if ((step === 0 || step === 1) && mode != 'Reposition') {
                    setStep(step + 1);
                    setShowValidation(false);
                  } else {
                    addCheckinForm();
                    setShowValidation(false);
                  }
                }
              }}
              className={`text-sm text-Primary-DeepTeal  font-medium cursor-pointer`}
            >
              {isSaveLoding ? (
                <BeatLoader size={6}></BeatLoader>
              ) : (
                <>
                  {mode == 'Reposition'
                    ? 'Update'
                    : step === 0 || step === 1
                      ? 'Next'
                      : mode == 'Edit'
                        ? 'Update'
                        : 'Save'}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

interface AddQuestionaryProps {
  onChange: (questions: Array<checkinType>) => void;
  upQuestions: Array<checkinType>;
  step: number;
  onChangeChecked: (value: boolean) => void;
  onChangeMinutes: (value: number) => void;
  onChangeSeconds: (value: number) => void;
  upChecked: boolean;
  upMinutes: number;
  upSeconds: number;
  mode: string;
  questionStep: number;
  setQuestionStep: (value: number) => void;
  onAddQuestion: () => boolean;
  isQuestionary?: boolean;
  autoAssign: boolean;
  setAutoAssign: (value: boolean) => void;
  genderRestriction: boolean;
  setGenderRestriction: (value: boolean) => void;
  gender: string;
  setGender: (value: string) => void;
  textErrorMessage: string;
}

const AddQuestionary: FC<AddQuestionaryProps> = ({
  onChange,
  upQuestions,
  step,
  onChangeChecked,
  onChangeMinutes,
  onChangeSeconds,
  upChecked,
  upMinutes,
  upSeconds,
  mode,
  questionStep,
  setQuestionStep,
  onAddQuestion,
  isQuestionary,
  autoAssign,
  setAutoAssign,
  genderRestriction,
  setGenderRestriction,
  gender,
  setGender,
  textErrorMessage,
}) => {
  const [questions, setQuestions] = useState<Array<checkinType>>(upQuestions);
  const [addMore, setAddMore] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(-1);
  const [checked, setChecked] = useState(false);
  const [mintues, setMintues] = useState(5);
  const [seconds, setSeconds] = useState(15);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  useEffect(() => {
    onChangeMinutes(mintues);
    onChangeSeconds(seconds);
  }, [mintues, seconds]);
  useEffect(() => {
    onChange(questions);
  }, [questions]);
  useEffect(() => {
    setQuestions(upQuestions);
    setChecked(upChecked);
    setMintues(upMinutes);
    setSeconds(upSeconds);
  }, [upQuestions, upChecked, upMinutes, upSeconds]);
  useEffect(() => {
    setQuestions(upQuestions);
  }, [upQuestions]);
  const moveItem = (index: number, direction: 'up' | 'down') => {
    setQuestions((prevList: any) => {
      const newList = [...prevList];
      if (direction === 'up' && index > 0) {
        [newList[index], newList[index - 1]] = [
          newList[index - 1],
          newList[index],
        ];
      } else if (direction === 'down' && index < newList.length - 1) {
        [newList[index], newList[index + 1]] = [
          newList[index + 1],
          newList[index],
        ];
      }
      return newList;
    });
  };
  useEffect(() => {
    onChange(questions);
  }, [questions]);
  return (
    <>
      {step === 1 || mode == 'Reposition' ? (
        <>
          {questions.length > 0 && !addMore && (
            <>
              <div
                className={`${addMore ? 'max-h-[45px]' : 'max-h-[200px] min-h-[60px]'} overflow-y-auto w-full`}
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#E5E5E5 transparent',
                }}
              >
                <div className="flex flex-col items-center justify-center gap-1 w-full">
                  {questions?.map((item: any, index: number) => {
                    return (
                      <>
                        <QuestionItem
                          length={questions.length}
                          onEdit={() => {
                            setEditingQuestionIndex(index);
                            setAddMore(true);
                            setQuestionStep(1);
                          }}
                          moveItem={(item: any) => {
                            moveItem(index, item);
                          }}
                          onCopy={() => {
                            setQuestions((pre) => {
                              const newItems = [...pre];
                              newItems.splice(index + 1, 0, item);
                              return newItems;
                            });
                            const newIndex = index + 1;
                            setCopiedIndex(newIndex);

                            setTimeout(() => {
                              setCopiedIndex(null);
                            }, 1200);
                          }}
                          onRemove={() => {
                            setQuestions((pre) => {
                              const newQuestions = pre.filter(
                                (_el, ind) => ind != index,
                              );
                              return newQuestions;
                            });
                          }}
                          index={index}
                          question={item}
                          copiedIndex={copiedIndex === index}
                        />
                      </>
                    );
                  })}
                </div>
              </div>
            </>
          )}
          {questions.length > 0 && !addMore && (
            <div
              className="flex items-center justify-center text-xs cursor-pointer text-Primary-DeepTeal font-medium border-2 border-dashed rounded-xl w-full h-[36px] bg-backgroundColor-Card border-Primary-DeepTeal mb-4 mt-2"
              onClick={() => {
                if (onAddQuestion()) {
                  setAddMore(true);
                  setQuestionStep(1);
                }
              }}
            >
              <img
                src="/icons/add-blue.svg"
                alt=""
                width="16px"
                height="16px"
              />
              Add Question
            </div>
          )}
          {questions.length == 0 && !addMore && (
            <>
              <img
                src="./icons/document-text-rectangle.svg"
                alt="document-text-rectangle"
              />
              <div className="text-Text-Primary text-xs">
                No Questions Found.
              </div>
              <ButtonSecondary
                ClassName="rounded-[20px] w-[147px] !py-[3px] mt-3 text-nowrap mb-8"
                onClick={() => {
                  if (onAddQuestion()) {
                    setQuestionStep(1);
                    setAddMore(true);
                  }
                }}
              >
                <img src="/icons/add.svg" alt="" width="20px" height="20px" />
                Add Question
              </ButtonSecondary>
            </>
          )}
          {addMore && questionStep == 1 && (
            <>
              <AddQuestionsModal
                setQuestionStep={setQuestionStep}
                editQUestion={questions[editingQuestionIndex]}
                onSubmit={(value) => {
                  const updatedQuestions =
                    editingQuestionIndex === -1
                      ? [...questions, value]
                      : questions.map((el, ind) =>
                          ind === editingQuestionIndex ? value : el,
                        );

                  const questionsWithOrder = updatedQuestions.map(
                    (q, index) => ({
                      ...q,
                      order: index + 1,
                    }),
                  );
                  setEditingQuestionIndex(-1);
                  setQuestions(questionsWithOrder);
                  setAddMore(false);
                  setQuestionStep(0);
                }}
                onCancel={() => {
                  setEditingQuestionIndex(-1);
                  setAddMore(false);
                  setQuestionStep(0);
                }}
                questions={questions}
                isQuestionary={isQuestionary}
              />
            </>
          )}
        </>
      ) : (
        <div className="w-full">
          {textErrorMessage && (
            <div className="text-xs text-Red">{textErrorMessage}</div>
          )}
          <div className="text-Text-Quadruple text-xs mt-4">
            The estimated time to complete this form is shown below. If you
            wish, you can edit this and provide your own estimate.
          </div>
          <div className="flex items-center mt-4">
            <Checkbox
              checked={checked}
              onChange={() => {
                setChecked((pre) => !pre);
                onChangeChecked(!checked);
              }}
              borderColor="border-Text-Quadruple"
              width="w-3.5"
              height="h-3.5"
              label="Share time estimate with client"
            />
          </div>
          <div className="w-full flex items-center justify-center mt-4 mb-5">
            <TimerPicker
              minutes={mintues}
              setMinutes={setMintues}
              seconds={seconds}
              setSeconds={setSeconds}
            />
          </div>
          <div className="text-xs text-Text-Primary font-medium">
            Automatic Assignment
          </div>
          <div className="w-full mt-3 mb-2 flex items-center gap-2">
            <Toggle checked={autoAssign} setChecked={setAutoAssign} />
            <div className="text-xs text-Text-Primary font-normal">
              Automatically assign this questionnaire to new clients.
            </div>
          </div>
          {autoAssign && (
            <div className="text-xs text-Text-Quadruple font-normal mt-3 ml-12">
              Clients will receive this questionnaire immediately after being
              added.
            </div>
          )}
          <div className="text-xs text-Text-Primary font-medium mt-8">
            Gender Restriction
          </div>
          <div
            className={`w-full mt-3 ${genderRestriction ? 'mb-2' : 'mb-5'} flex items-center gap-2`}
          >
            <Toggle
              checked={genderRestriction}
              setChecked={setGenderRestriction}
            />
            <div className="text-xs text-Text-Primary font-normal">
              Only assign this questionnaire to clients of the selected gender.
            </div>
          </div>
          {genderRestriction && (
            <div className="flex items-center gap-6 mt-4 ml-12 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <span
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
            ${gender === 'female' ? 'border-Primary-DeepTeal' : 'border-gray-400'}`}
                >
                  {gender === 'female' && (
                    <span className="w-2 h-2 rounded-full bg-Primary-DeepTeal" />
                  )}
                </span>
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={gender === 'female'}
                  onChange={() => setGender('female')}
                  className="hidden"
                />
                <span className="text-xs text-Text-Primary">Female</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <span
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
            ${gender === 'male' ? 'border-Primary-DeepTeal' : 'border-gray-400'}`}
                >
                  {gender === 'male' && (
                    <span className="w-2 h-2 rounded-full bg-Primary-DeepTeal" />
                  )}
                </span>
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={gender === 'male'}
                  onChange={() => setGender('male')}
                  className="hidden"
                />
                <span className="text-xs text-Text-Primary">Male</span>
              </label>
            </div>
          )}
        </div>
      )}
    </>
  );
};

// interface RepositionCheckInProps {
//   onChange: (questions: Array<checkinType>) => void;
//   upQuestions: Array<checkinType>;
// }

// const RepositionCheckIn: FC<RepositionCheckInProps> = ({
//   upQuestions,
//   onChange,
// }) => {
//   const [questions, setQuestions] = useState<Array<checkinType>>(upQuestions);
//   useEffect(() => {
//     setQuestions(upQuestions);
//   }, [upQuestions]);
//   const moveItem = (index: number, direction: 'up' | 'down') => {
//     setQuestions((prevList: any) => {
//       const newList = [...prevList];
//       if (direction === 'up' && index > 0) {
//         [newList[index], newList[index - 1]] = [
//           newList[index - 1],
//           newList[index],
//         ];
//       } else if (direction === 'down' && index < newList.length - 1) {
//         [newList[index], newList[index + 1]] = [
//           newList[index + 1],
//           newList[index],
//         ];
//       }
//       return newList;
//     });
//   };
//   useEffect(() => {
//     onChange(questions);
//   }, [questions]);
//   return (
//     <>
//       {questions.length > 0 && (
//         <>
//           <div
//             className={`max-h-[200px] min-h-[60px] overflow-y-auto w-full mb-3`}
//           >
//             <div className="flex flex-col items-center justify-center gap-1 w-full">
//               {questions.map((item: any, index: number) => {
//                 return (
//                   <>
//                     <QuestionItem
//                       length={questions.length}
//                       onEdit={() => {
//                         // setEditingQuestionIndex(index);
//                         // setAddMore(true);
//                       }}
//                       moveItem={(item: any) => {
//                         moveItem(index, item);
//                       }}
//                       // isReposition
//                       onRemove={() => {
//                         setQuestions((pre) => {
//                           const newQuestions = pre.filter(
//                             (_el, ind) => ind != index,
//                           );
//                           return newQuestions;
//                         });
//                       }}
//                       index={index}
//                       question={item}
//                     ></QuestionItem>
//                   </>
//                 );
//               })}
//             </div>
//           </div>
//         </>
//       )}
//     </>
//   );
// };
export default QuestionaryControllerModal;
