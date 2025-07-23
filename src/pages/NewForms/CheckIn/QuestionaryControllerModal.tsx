/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from 'react';
import { BeatLoader } from 'react-spinners';
import FormsApi from '../../../api/Forms';
import { ButtonSecondary } from '../../../Components/Button/ButtosSecondary';
import Checkbox from '../../../Components/checkbox';
import TextField from '../../../Components/TextField';
import AddQuestionsModal from './AddQuestionModal';
import QuestionItem from './QuestionItem';
import TimerPicker from './TimerPicker';
import Circleloader from '../../../Components/CircleLoader';
interface QuestionaryControllerModalProps {
  editId?: string;
  mode?: 'Edit' | 'Reposition' | 'Add';
  onClose: () => void;
  onSave: (values: any) => void;
  templateData?: any;
  error: string;
}

const QuestionaryControllerModal: FC<QuestionaryControllerModalProps> = ({
  mode,
  onClose,
  onSave,
  editId,
  templateData,
  error,
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

  useEffect(() => {
    if (error && error == 'A form with the same title already exists.') {
      setTitleForm(templateData?.title || '');
      setIsError(true);
      setStep(0);
      setIsSaveLoading(false);
    }
  }, [error]);
  const resolveFormTitle = () => {
    if (templateData == null && mode == 'Add') {
      if (step === 1 && titleForm.length) {
        return titleForm + ' Form';
      }
      return 'Create Personal Form';
    } else if (templateData != null) {
      if (step === 1 && titleForm.length) return titleForm;
      return templateData.title;
    }
    switch (mode) {
      case 'Add':
        return 'Feedback';
      case 'Reposition':
        return 'Reposition Check-in';
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
          <AddCheckIn
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
          />
        );
      case 'Reposition':
        return (
          <>
            <RepositionCheckIn
              onChange={(values) => {
                setQuestions(values);
              }}
              upQuestions={questions}
            ></RepositionCheckIn>
          </>
        );
      case 'Edit':
        return (
          <AddCheckIn
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
          />
        );
    }
  };
  const [titleForm, setTitleForm] = useState('');
  const isDisable = () => {
    if (templateData == null) {
      if (titleForm.length == 0) {
        return true;
      } else if (questions.length == 0) {
        return true;
      }
    }
    return false;
  };
  const [isSaveLoding, setIsSaveLoading] = useState(false);
  const addCheckinForm = () => {
    setIsSaveLoading(true);
    const getTimeInMilliseconds = () => {
      return minutes * 60000 + seconds * 1000;
    };
    onSave({
      title: templateData != null && !error ? templateData.title : titleForm,
      questions: questions,
      share_with_client: checked,
      time: getTimeInMilliseconds(),
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
      <div className="flex flex-col justify-between bg-white w-[90vw] md:w-[664px] rounded-[20px] p-4">
        <div className="w-full h-full">
          <div className="flex justify-start items-center">
            <div className="text-Text-Primary font-medium">
              {resolveFormTitle()}
            </div>
          </div>
          <div className="w-full h-[1px] bg-Boarder my-3"></div>
          {step == 0 && (
            <>
              {(templateData == null || error) &&
              mode == 'Add' &&
              (AddquestionStep == 0 || AddquestionStep == 2) ? (
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
              ) : (
                ''
              )}
              {AddquestionStep == 0 && (
                <div className="w-full text-xs text-Text-Primary font-medium mt-6">
                  {templateData == null ? 'Questions' : 'Initial Questionnaire'}
                </div>
              )}
            </>
          )}
          <div className="flex flex-col w-full mt-3 items-center justify-center">
            {resolveBoxRender()}
          </div>
        </div>
        {showValidation && questions.length == 0 && (
          <div className="text-[10px] text-Red">Add question to continue.</div>
        )}
        <div
          className={`w-full flex justify-end items-center p-2 ${
            AddquestionStep == 1 && 'hidden'
          } `}
        >
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
                if (step == 0 && mode != 'Reposition') {
                  setStep(1);
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
                  : step == 0
                    ? 'Next'
                    : mode == 'Edit'
                      ? 'Update'
                      : 'Save'}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

interface AddCheckInProps {
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
}

const AddCheckIn: FC<AddCheckInProps> = ({
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
}) => {
  const [questions, setQuestions] = useState<Array<checkinType>>(upQuestions);
  const [addMore, setAddMore] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(-1);
  const [checked, setChecked] = useState(false);
  const [mintues, setMintues] = useState(5);
  const [seconds, setSeconds] = useState(15);
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
  return (
    <>
      {step == 0 || mode == 'Reposition' ? (
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
              />
            </>
          )}
        </>
      ) : (
        <div className="w-full">
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
              label="Share with client"
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
        </div>
      )}
    </>
  );
};

interface RepositionCheckInProps {
  onChange: (questions: Array<checkinType>) => void;
  upQuestions: Array<checkinType>;
}

const RepositionCheckIn: FC<RepositionCheckInProps> = ({
  upQuestions,
  onChange,
}) => {
  const [questions, setQuestions] = useState<Array<checkinType>>(upQuestions);
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
      {questions.length > 0 && (
        <>
          <div
            className={`max-h-[200px] min-h-[60px] overflow-y-auto w-full mb-3`}
          >
            <div className="flex flex-col items-center justify-center gap-1 w-full">
              {questions.map((item: any, index: number) => {
                return (
                  <>
                    <QuestionItem
                      length={questions.length}
                      onEdit={() => {
                        // setEditingQuestionIndex(index);
                        // setAddMore(true);
                      }}
                      moveItem={(item: any) => {
                        moveItem(index, item);
                      }}
                      isReposition
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
                    ></QuestionItem>
                  </>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
};
export default QuestionaryControllerModal;
