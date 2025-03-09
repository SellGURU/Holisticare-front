/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from 'react';
import { ButtonSecondary } from '../../../Button/ButtosSecondary';
import AddQuestionQuestionary from './AddQuestionQuestionary';
import ItemInListModal from './ItemInListModal';

const FakeData = [
  {
    title: 'test 11',
    type: 'Yes/No',
    required: true,
  },
  {
    title: 'test 10',
    type: 'Scale',
    required: false,
  },
  {
    title: 'test 9',
    type: 'Text',
    required: false,
  },
  {
    title: 'test 8',
    type: 'Multiple choice',
    required: false,
    options: ['test 20', 'test 21', 'test 22', 'test 23'],
  },
  {
    title: 'test 7',
    type: 'Checkboxes',
    required: false,
    options: ['test 10', 'test 11'],
  },
  {
    title: 'test 6',
    type: 'File Uploader',
    required: false,
  },
  {
    title: 'test 5',
    type: 'Star Rating',
    required: true,
  },
  {
    title: 'test 4',
    type: 'Emojis',
    required: true,
  },
  {
    title: 'test 3',
    type: 'Yes/No',
    required: false,
  },
  {
    title: 'test 2',
    type: 'Scale',
    required: false,
  },
  {
    title: 'test 1',
    type: 'Text',
    required: true,
  },
];

const FakeData2 = [
  {
    title: 'test 8',
    type: 'Multiple choice',
    required: false,
    options: ['test 20', 'test 21', 'test 22', 'test 23'],
  },
  {
    title: 'test 7',
    type: 'Checkboxes',
    required: false,
    options: ['test 10', 'test 11'],
  },
  {
    title: 'test 6',
    type: 'File Uploader',
    required: false,
  },
  {
    title: 'test 5',
    type: 'Star Rating',
    required: true,
  },
  {
    title: 'test 4',
    type: 'Emojis',
    required: true,
  },
  {
    title: 'test 3',
    type: 'Yes/No',
    required: false,
  },
  {
    title: 'test 2',
    type: 'Scale',
    required: false,
  },
  {
    title: 'test 1',
    type: 'Text',
    required: true,
  },
];

interface CheckInModalContentProps {
  setShowModalQuestionary: (value: boolean) => void;
  questionaryListModal: Array<any>;
  setQuestionaryListModal: (value: any) => void;
  setQuestionaryLists: (value: any) => void;
  editModeModalQuestionary: boolean;
  setEditModeModalQuestionary: (value: boolean) => void;
  questionaryListEditValue: any;
  mainTitleQuestionary: string;
  setMainTitleQuestionary: (value: string) => void;
  repositionModeModalQuestionary: boolean;
  setRepositionModeModalQuestionary: (value: boolean) => void;
  step: number;
  setStep: (value: number) => void;
}

const QuestionaryModalContent: FC<CheckInModalContentProps> = ({
  setShowModalQuestionary,
  questionaryListModal,
  setQuestionaryListModal,
  setQuestionaryLists,
  editModeModalQuestionary,
  setEditModeModalQuestionary,
  questionaryListEditValue,
  mainTitleQuestionary,
  setMainTitleQuestionary,
  repositionModeModalQuestionary,
  setRepositionModeModalQuestionary,
  setStep,
  step,
}) => {
  const [addMode, setAddMode] = useState<boolean>(false);
  const [sureRemoveIndex, setSureRemoveIndex] = useState<number | null>(null);

  const handleRemove = (index: number) => {
    setQuestionaryListModal((prevList: any[]) =>
      prevList.filter((_, i) => i !== index),
    );
    setSureRemoveIndex(null);
  };

  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editItemSelected, setEditItemSelected] = useState('');
  const [editCheckboxChecked, setEditCheckboxChecked] = useState(false);
  const [editCheckboxOptions, setEditCheckboxOptions] = useState(['', '']);
  const [editMultipleChoiceOptions, setEditMultipleChoiceOptions] = useState([
    '',
    '',
  ]);

  const handleEdit = (index: number) => {
    setEditIndex(index);
    setAddMode(true);
    setEditTitle(questionaryListModal[index].title);
    setEditItemSelected(questionaryListModal[index].type);
    setEditCheckboxChecked(questionaryListModal[index].required);
    if (questionaryListModal[index].type === 'Checkboxes') {
      setEditCheckboxOptions(questionaryListModal[index].options);
    }
    if (questionaryListModal[index].type === 'Multiple choice') {
      setEditMultipleChoiceOptions(questionaryListModal[index].options);
    }
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    setQuestionaryListModal((prevList: any) => {
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
    if (editModeModalQuestionary || repositionModeModalQuestionary) {
      setMainTitleQuestionary(questionaryListEditValue.title);
      setQuestionaryListModal(questionaryListEditValue.item);
    }
  }, []);
  return (
    <>
      <div className="flex flex-col justify-between bg-white w-[664px] rounded-[20px] p-4">
        {step === 1 ? (
          <>
            <div className="w-full h-full">
              <div className="flex justify-start items-center">
                <div className="text-Text-Primary font-medium">
                  Ready-made Questionnaire Templates
                </div>
              </div>
              <div className="w-full h-[1px] bg-Boarder my-3"></div>
              <div className="flex items-center justify-between mt-6">
                <div
                  className="flex flex-col items-center w-[193px] cursor-pointer"
                  onClick={() => {
                    setMainTitleQuestionary('Initial Questionnaire');
                    setQuestionaryListModal(FakeData);
                    setStep(2);
                  }}
                >
                  <img src="/images/forms/initial-Questionnaire.png" alt="" />
                  <div className="flex items-center gap-1 mt-2 text-Text-Primary text-xs font-medium w-full">
                    <img
                      src="/icons/book-green.svg"
                      alt=""
                      className="w-4 h-4"
                    />
                    Initial Questionnaire
                  </div>
                  <div className="text-[10px] text-Text-Quadruple mt-2">
                    A form to collect information from the user to personalize
                    programs
                  </div>
                  <div className="w-full">
                    <div className="w-[64px] h-[16px] rounded-xl bg-Primary-DeepTeal bg-opacity-10 text-[8px] text-Primary-DeepTeal flex items-center justify-center mt-2">
                      11 Questions
                    </div>
                  </div>
                </div>
                <div
                  className="flex flex-col items-center w-[193px] cursor-pointer"
                  onClick={() => {
                    setMainTitleQuestionary('PAR-Q');
                    setQuestionaryListModal(FakeData);
                    setStep(2);
                  }}
                >
                  <img src="/images/forms/PAR-Q.png" alt="" />
                  <div className="flex items-center gap-1 mt-2 text-Text-Primary text-xs font-medium w-full">
                    <img
                      src="/icons/activity-green.svg"
                      alt=""
                      className="w-4 h-4"
                    />
                    PAR-Q
                  </div>
                  <div className="text-[10px] text-Text-Quadruple mt-2">
                    A form to access the user`s physical activity readiness
                  </div>
                  <div className="w-full">
                    <div className="w-[64px] h-[16px] rounded-xl bg-Primary-DeepTeal bg-opacity-10 text-[8px] text-Primary-DeepTeal flex items-center justify-center mt-2">
                      11 Questions
                    </div>
                  </div>
                </div>
                <div
                  className="flex flex-col items-center w-[193px] cursor-pointer"
                  onClick={() => {
                    setMainTitleQuestionary('Feedback Form');
                    setQuestionaryListModal(FakeData2);
                    setStep(2);
                  }}
                >
                  <img src="/images/forms/feedback-Form.png" alt="" />
                  <div className="flex items-center gap-1 mt-2 text-Text-Primary text-xs font-medium w-full">
                    <img
                      src="/icons/star-green.svg"
                      alt=""
                      className="w-4 h-4"
                    />
                    Feedback Form
                  </div>
                  <div className="text-[10px] text-Text-Quadruple mt-2">
                    A form to collect user`s feedback and satisfaction
                  </div>
                  <div className="w-full">
                    <div className="w-[64px] h-[16px] rounded-xl bg-Primary-DeepTeal bg-opacity-10 text-[8px] text-Primary-DeepTeal flex items-center justify-center mt-2">
                      08 Questions
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="w-full h-full">
              <div className="flex justify-start items-center">
                <div className="text-Text-Primary font-medium">
                  {editModeModalQuestionary
                    ? 'Edit'
                    : repositionModeModalQuestionary
                      ? 'Reposition'
                      : 'Feedback'}{' '}
                  Form
                </div>
              </div>
              <div className="w-full h-[1px] bg-Boarder my-3"></div>
              <div className="w-full text-xs text-Text-Primary font-medium mt-6">
                {mainTitleQuestionary}
              </div>
              <div
                className={`flex flex-col w-full ${addMode || questionaryListModal?.length ? 'mt-3' : 'mt-10'} items-center justify-center`}
              >
                {questionaryListModal?.length ? (
                  <div
                    className={`${addMode ? 'max-h-[100px]' : 'max-h-[300px]'} min-h-[60px] overflow-y-auto w-full`}
                  >
                    <div className="flex flex-col items-center justify-center gap-1 w-full">
                      {questionaryListModal?.map((item: any, index: number) => {
                        return (
                          <ItemInListModal
                            key={index}
                            index={index}
                            handleEdit={handleEdit}
                            handleRemove={handleRemove}
                            item={item}
                            setSureRemoveIndex={setSureRemoveIndex}
                            sureRemoveIndex={sureRemoveIndex}
                            repositionModeModal={repositionModeModalQuestionary}
                            moveItem={moveItem}
                            questionaryListModal={questionaryListModal}
                          />
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  ''
                )}
                {!addMode &&
                questionaryListModal?.length &&
                repositionModeModalQuestionary === false ? (
                  <div
                    className="flex items-center justify-center text-xs cursor-pointer text-Primary-DeepTeal font-medium border-2 border-dashed rounded-xl w-full h-[36px] bg-backgroundColor-Card border-Primary-DeepTeal mb-4 mt-2"
                    onClick={() => {
                      setAddMode(true);
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
                ) : (
                  ''
                )}
                {addMode && (
                  <>
                    <AddQuestionQuestionary
                      setAddMode={setAddMode}
                      setQuestionaryListModal={setQuestionaryListModal}
                      editIndex={editIndex}
                      setEditIndex={setEditIndex}
                      editTitle={editTitle}
                      setEditTitle={setEditTitle}
                      editItemSelected={editItemSelected}
                      setEditItemSelected={setEditItemSelected}
                      editCheckboxChecked={editCheckboxChecked}
                      setEditCheckboxChecked={setEditCheckboxChecked}
                      editCheckboxOptions={editCheckboxOptions}
                      editMultipleChoiceOptions={editMultipleChoiceOptions}
                    />
                  </>
                )}
                {!addMode && !questionaryListModal?.length ? (
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
                      onClick={() => setAddMode(true)}
                    >
                      <img
                        src="/icons/add.svg"
                        alt=""
                        width="20px"
                        height="20px"
                      />
                      Add Question
                    </ButtonSecondary>
                  </>
                ) : (
                  ''
                )}
              </div>
            </div>
            <div className="w-full flex justify-end items-center p-2">
              <div
                className="text-Disable text-sm font-medium mr-4 cursor-pointer"
                onClick={() => {
                  setShowModalQuestionary(false);
                  setAddMode(false);
                }}
              >
                Cancel
              </div>
              <div
                className={`${mainTitleQuestionary && questionaryListModal.length > 0 ? 'text-Primary-DeepTeal' : 'text-Text-Fivefold'} text-sm font-medium cursor-pointer`}
                onClick={() => {
                  if (mainTitleQuestionary && questionaryListModal.length > 0) {
                    if (
                      editModeModalQuestionary ||
                      repositionModeModalQuestionary
                    ) {
                      setQuestionaryLists((prev: any) =>
                        prev.map((item: any) =>
                          item.no === questionaryListEditValue.no
                            ? {
                                ...item,
                                item: questionaryListModal,
                                title: mainTitleQuestionary,
                                questions: questionaryListModal.length,
                              }
                            : item,
                        ),
                      );
                    } else {
                      setQuestionaryLists((prev: any) => [
                        ...prev,
                        {
                          item: questionaryListModal,
                          title: mainTitleQuestionary,
                          questions: questionaryListModal.length,
                          no: prev.length + 1,
                          created_on: new Date().toISOString().split('T')[0],
                          created_by: 'Dr.Charlotte Walker',
                        },
                      ]);
                    }
                    setShowModalQuestionary(false);
                    setAddMode(false);
                    setQuestionaryListModal([]);
                    setMainTitleQuestionary('');
                    setEditModeModalQuestionary(false);
                    setRepositionModeModalQuestionary(false);
                    setStep(1);
                  }
                }}
              >
                {editModeModalQuestionary || repositionModeModalQuestionary
                  ? 'Update'
                  : 'Save'}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default QuestionaryModalContent;
