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
interface CheckInControllerModalProps {
  editId?: string;
  mode?: 'Edit' | 'Reposition' | 'Add';
  onClose: () => void;
  onSave: (values: any) => void;
  error?: string;
  setError: (error: string) => void;
}

const CheckInControllerModal: FC<CheckInControllerModalProps> = ({
  mode,
  onClose,
  onSave,
  editId,
  error,
  setError,
}) => {
  const [questions, setQuestions] = useState<Array<checkinType>>([]);
  const [step, setStep] = useState(0);
  const [checked, setChecked] = useState(false);
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(15);
  useEffect(() => {
    if (
      error &&
      error == 'A Check-in form with the same title already exists.'
    ) {
      setStep(0);
      setIsSaveLoading(false);
    }
  }, [error]);
  const resolveFormTitle = () => {
    switch (mode) {
      case 'Add':
        return 'Create a Check-in';
      case 'Reposition':
        return 'Reposition Check-in';
      case 'Edit':
        return 'Edit';
    }
  };
  const resolveBoxRender = () => {
    switch (mode) {
      case 'Add':
        return (
          <AddCheckIn
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
            />
          </>
        );
      case 'Edit':
        return (
          <AddCheckIn
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
    return titleForm.length == 0 || questions.length == 0;
  };
  const [isSaveLoding, setIsSaveLoading] = useState(false);
  const addCheckinForm = () => {
    const getTimeInMilliseconds = () => {
      return minutes * 60000 + seconds * 1000;
    };
    setIsSaveLoading(true);
    onSave({
      title: titleForm,
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
      FormsApi.showCheckIn(editId).then((res) => {
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
      <div className="flex flex-col justify-between bg-white w-[664px] rounded-[20px] p-4">
        <div className="w-full h-full">
          <div className="flex justify-start items-center">
            <div className="text-Text-Primary font-medium">
              {titleForm.length && step === 1
                ? titleForm + ' Form'
                : resolveFormTitle() + ' Form'}
            </div>
          </div>
          <div className="w-full h-[1px] bg-Gray-50 my-3"></div>
          {step == 0 && (
            <>
              <div className="w-full mt-6">
                <TextField
                  type="text"
                  name="formtitle"
                  label="Form Title"
                  placeholder="Enter community name..."
                  value={titleForm}
                  onChange={(e) => {
                    setTitleForm(e.target.value);
                    setError('');
                  }}
                  inValid={error != '' || (showValidation && !titleForm)}
                  errorMessage={
                    error
                      ? 'Form title already exists. Please choose another.'
                      : 'This field is required.'
                  }
                />
              </div>
              <div className="w-full text-xs text-Text-Primary font-medium mt-6">
                Questions
              </div>
            </>
          )}
          <div className="flex flex-col w-full mt-3 items-center justify-center">
            {resolveBoxRender()}
          </div>
        </div>
        {showValidation && questions.length == 0 && (
          <div className="text-[10px] text-Red">Add question to continue.</div>
        )}
        <div className="w-full flex justify-end items-center p-2">
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
  return (
    <>
      {step == 0 || mode == 'Reposition' ? (
        <>
          {questions.length > 0 && (
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
                setAddMore(true);
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
                onClick={() => setAddMore(true)}
              >
                <img src="/icons/add.svg" alt="" width="20px" height="20px" />
                Add Question
              </ButtonSecondary>
            </>
          )}
          {addMore && (
            <>
              <AddQuestionsModal
                editQUestion={questions[editingQuestionIndex]}
                onSubmit={(value) => {
                  if (editingQuestionIndex == -1) {
                    setQuestions([...questions, value]);
                  } else {
                    setQuestions((pre) => {
                      const old = [...pre];
                      const resolved = old.map((el, ind) => {
                        if (ind == editingQuestionIndex) {
                          return value;
                        } else {
                          return el;
                        }
                      });
                      return resolved;
                    });
                  }
                  setAddMore(false);
                }}
                onCancel={() => {
                  setEditingQuestionIndex(-1);
                  setAddMore(false);
                }}
              ></AddQuestionsModal>
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
export default CheckInControllerModal;
