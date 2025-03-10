/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import TextField from '../../../Components/TextField';
import { ButtonSecondary } from '../../../Components/Button/ButtosSecondary';
import AddQuestionsModal from './AddQuestionModal';
import QuestionItem from './QuestionItem';
import { BeatLoader } from 'react-spinners';
import FormsApi from '../../../api/Forms';

interface QuestionaryControllerModalProps {
  editId?: string;
  mode?: 'Edit' | 'Reposition' | 'Add';
  onClose: () => void;
  onSave: (values: any) => void;
}

const QuestionaryControllerModal: React.FC<QuestionaryControllerModalProps> = ({
  mode,
  onClose,
  onSave,
  editId,
}) => {
  const [questions, setQuestions] = useState<Array<checkinType>>([]);
  const resolveFormTitle = () => {
    switch (mode) {
      case 'Add':
        return 'Create a Check-In';
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
          ></AddCheckIn>
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
            upQuestions={questions}
            onChange={(values) => {
              setQuestions(values);
            }}
          ></AddCheckIn>
        );
    }
  };
  const [titleForm, setTitleForm] = useState('');
  const isDisable = () => {
    return titleForm.length == 0;
  };
  const [isSaveLoding, setIsSaveLoading] = useState(false);
  const addCheckinForm = () => {
    setIsSaveLoading(true);
    onSave({
      title: titleForm,
      questions: questions,
    });
    // FormsApi.addCheckin({
    //   title: titleForm,
    //   questions: questions,
    // });
  };
  useEffect(() => {
    if (editId != '' && editId) {
      FormsApi.showCheckIn(editId).then((res) => {
        setQuestions(res.data.questions);
        setTitleForm(res.data.title);
      });
    }
  }, [editId]);
  return (
    <>
      <div className="flex flex-col justify-between bg-white w-[664px] rounded-[20px] p-4">
        <div className="w-full h-full">
          <div className="flex justify-start items-center">
            <div className="text-Text-Primary font-medium">
              {resolveFormTitle() + ' Form'}
            </div>
          </div>
          <div className="w-full h-[1px] bg-Boarder my-3"></div>
          <div className="w-full mt-6">
            <TextField
              type="text"
              name="formtitle"
              label="Form Title"
              placeholder="Enter community name..."
              value={titleForm}
              onChange={(e) => setTitleForm(e.target.value)}
            />
          </div>
          <div className="w-full text-xs text-Text-Primary font-medium mt-6">
            Questions
          </div>
          <div className="flex flex-col w-full mt-3 items-center justify-center">
            {resolveBoxRender()}
          </div>
        </div>
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
              if (!isDisable()) {
                addCheckinForm();
              }
            }}
            className={` ${isDisable() && 'opacity-50'} text-sm text-Primary-DeepTeal  font-medium cursor-pointer`}
          >
            {isSaveLoding ? (
              <BeatLoader size={6}></BeatLoader>
            ) : (
              <>{mode == 'Edit' || mode == 'Reposition' ? 'Update' : 'Save'}</>
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
}

const AddCheckIn: React.FC<AddCheckInProps> = ({ onChange, upQuestions }) => {
  const [questions, setQuestions] = useState<Array<checkinType>>(upQuestions);
  const [addMore, setAddMore] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(-1);
  useEffect(() => {
    onChange(questions);
  }, [questions]);
  useEffect(() => {
    setQuestions(upQuestions);
  }, [upQuestions]);
  return (
    <>
      {questions.length > 0 && (
        <>
          <div
            className={`${addMore ? 'max-h-[100px]' : 'max-h-[200px]'} min-h-[60px] overflow-y-auto w-full`}
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
                    ></QuestionItem>
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
          <img src="/icons/add-blue.svg" alt="" width="16px" height="16px" />
          Add Question
        </div>
      )}
      {questions.length == 0 && !addMore && (
        <>
          <img
            src="./icons/document-text-rectangle.svg"
            alt="document-text-rectangle"
          />
          <div className="text-Text-Primary text-xs">No Questions Found.</div>
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
  );
};

const RepositionCheckIn: React.FC<AddCheckInProps> = ({
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
          <div className={`max-h-[200px] min-h-[60px] overflow-y-auto w-full`}>
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
