/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import Application from '../../../api/app';
import { useParams } from 'react-router-dom';
import { ButtonPrimary } from '../../Button/ButtonPrimary';
// import DatePicker from 'react-datepicker';
import Checkbox from './CheckBox';
// import SpinnerLoader from '../../SpinnerLoader';
import Circleloader from '../../CircleLoader';
import QuestionRow from './questionRow';
import { ButtonSecondary } from '../../Button/ButtosSecondary';
import SpinnerLoader from '../../SpinnerLoader';
import {
  FeelingCard,
  RangeCard,
  RateCard,
  YesNoCard,
} from '../../../pages/CheckIn/components';
import UploadCard from '../../../pages/CheckIn/components/UploadCard';
// import DatePicker from '../../DatePicker';

export const Questionary = () => {
  const [data, setData] = useState<any>(null);
  const { id } = useParams<{ id: string }>();
  const [tryAdd, setTryAdd] = useState(false);
  const [tryComplete, setTryComplete] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isLaoding, setIsLoading] = useState(false);
  const [questionsFormData, setQuestionsFormData] = useState<any>([]);
  const [AddForms, setAddForms] = useState<any>([
    // { id: '1', name: 'Feedback Form', questions: 9 },
    // { id: '2', name: 'Initial Questionnaire', questions: 9 },
    // { id: '3', name: 'PAR-Q', questions: 9 },
  ]);

  // const [selectedQuestionnaires, setSelectedQuestionnaires] = useState<any>([]);
  const [selectedFormIDs, setSelectedFormIDs] = useState<string[]>([]);
  // const toggleSelection = (id: string) => {
  //   setSelectedQuestionnaires((prev: any) =>
  //     prev.includes(id)
  //       ? prev.filter((qId: string) => qId !== id)
  //       : [...prev, id],
  //   );
  // };
  const toggleSelection = (id: string) => {
    setSelectedFormIDs((prev: string[]) =>
      prev.includes(id)
        ? prev.filter((formId) => formId !== id)
        : [...prev, id],
    );
  };

  const handleAddQuestionnaires = () => {
    // const selectedData = AddForms
    //   .filter((form: any) => selectedQuestionnaires.includes(form.id))
    //   .map((form: any) => ({
    //     Data: form.title,
    //     'Completed on': null, // Assuming no completion date initially
    //     State: 'Incomplete',
    //   }));
    Application.AddQuestionary({
      member_id: id,
      q_unique_id: selectedFormIDs,
    });
    const selectedData = AddForms.filter((form: any) =>
      selectedFormIDs.includes(form.unique_id),
    ).map((form: any) => ({
      title: form.title,
      'Completed on': null, // Assuming no completion date initially
      status: 'Incomplete',
      unique_id: form.unique_id,
    }));

    setData((prev: any) => [...prev, ...selectedData]);
    setSelectedFormIDs([]);
    setTryAdd(false);
  };

  const deleteQuestionRow = (index: number) => {
    setData((prevData: any) =>
      prevData.filter((_: any, i: number) => i !== index),
    );
  };
  useEffect(() => {
    console.log(questionsFormData);
  }, [questionsFormData]);
  useEffect(() => {
    setIsLoading(true);
    if (!tryComplete) {
      Application.getQuestionary_tracking({ member_id: id })
        .then((res) => {
          if (res.data) {
            setData(res.data);
          } else {
            throw new Error('Unexpected data format');
          }
        })
        .catch((err) => {
          console.error(err);
          // setError("Failed to fetch client data");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [id]);
  // const formValueChange = (id: string, value: any) => {
  //   setQuestionsFormData((prev: any) => ({
  //     ...prev,
  //     questions: prev.questions.map((q: any) =>
  //       q.order === id
  //         ? { ...q, response: q.type === 'checkbox' ? [...value] : value }
  //         : q,
  //     ),
  //   }));
  // };
  const formValueChange = (id: string, value: any) => {
    setQuestionsFormData((prev: any) => ({
      ...prev,
      questions: prev.questions.map((q: any) =>
        q.order === id
          ? {
              ...q,
              response:
                q.type === 'checkbox'
                  ? Array.isArray(value)
                    ? [...value]
                    : []
                  : value,
            }
          : q,
      ),
    }));
  };
  console.log(questionsFormData);

  const validateDate = (dateString: string) => {
    const date = new Date(dateString);
    return !isNaN(date.getTime()); // Returns true if it's a valid date
  };
  // const formatDate = (date: Date | null) => {
  //   if (!date) return '';
  //   const options: Intl.DateTimeFormatOptions = {
  //     year: 'numeric',
  //     month: 'short',
  //     day: 'numeric',
  //   };
  //   return date.toLocaleDateString(undefined, options);
  // };
  const resolveForm = (
    type: string,
    questionsData: any,
    activeCardNumber: number,
    disabled?: boolean,
  ) => {
    const isNumericString = (str: string) => !isNaN(Number(str));
    if (type == 'short_answer' || type == 'paragraph') {
      return (
        <>
          <textarea
            value={questionsData.questions[activeCardNumber - 1]?.response}
            disabled={disabled}
            onChange={(e) => {
              formValueChange(
                questionsData.questions[activeCardNumber - 1]?.order,
                e.target.value,
              );
            }}
            placeholder="Enter value"
            className="w-full text-[10px] h-[80px] text-Text-Primary outline-none border-none bg-backgroundColor-Card"
          />
        </>
      );
    }
    if (type == 'multiple_choice') {
      return (
        <>
          <div>
            <div>
              {questionsData.questions[activeCardNumber - 1]?.options?.map(
                (el: any, index: number) => {
                  const optionLabel = String.fromCharCode(65 + index);

                  return (
                    <div
                      onClick={() => {
                        if (!disabled) {
                          formValueChange(
                            questionsData.questions[activeCardNumber - 1]
                              ?.order,
                            el,
                          );
                        }
                      }}
                      className="flex items-center gap-[6px] mb-2"
                    >
                      <div
                        className={`w-[12px] h-[12px] flex justify-center items-center cursor-pointer min-w-[12px] min-h-[12px] max-h-[12px] max-w-[12px] ${
                          questionsData.questions[activeCardNumber - 1]
                            ?.response == el
                            ? 'border-Primary-DeepTeal'
                            : 'border-Text-Secondary '
                        } bg-white border-[1.4px] rounded-full`}
                      >
                        {questionsData.questions[activeCardNumber - 1]
                          ?.response == el && (
                          <div className="w-[6px] h-[6px] bg-Primary-DeepTeal rounded-full"></div>
                        )}
                      </div>
                      <div
                        className={`text-[10px] cursor-pointer ${
                          questionsData.questions[activeCardNumber - 1]
                            ?.response == el
                            ? 'text-Text-Primary'
                            : 'text-Text-Secondary'
                        } `}
                      >
                        {!isNumericString(el) && (
                          <span className="mr-1">{optionLabel}.</span>
                        )}
                        {el}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        </>
      );
    }
    if (type == 'checkbox') {
      return (
        <>
          <div>
            {questionsData.questions[activeCardNumber - 1]?.options?.map(
              (el: any) => {
                return (
                  <div
                    onClick={() => {
                      if (!disabled) {
                        const newResponses = !questionsData.questions[
                          activeCardNumber - 1
                        ].response.includes(el)
                          ? [
                              ...questionsData.questions[activeCardNumber - 1]
                                .response,
                              el,
                            ] // Add to array
                          : questionsData.questions[
                              activeCardNumber - 1
                            ].response.filter((item: any) => item !== el); // Remove from array
                        formValueChange(
                          questionsData.questions[activeCardNumber - 1]?.order,
                          newResponses,
                        );
                      }
                    }}
                    className="flex items-center gap-2 mb-2"
                  >
                    <Checkbox
                      checked={questionsData.questions[
                        activeCardNumber - 1
                      ].response.includes(el)}
                    ></Checkbox>

                    <div
                      className={`text-[10px] cursor-pointer ${questionsData.questions[activeCardNumber - 1].response.includes(el) ? 'text-Text-Primary' : 'text-Text-Secondary'} `}
                    >
                      {el}
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </>
      );
    }
    if (type === 'Scale') {
      return (
        <RangeCard
          hideQuestions
          question={questionsData.questions[activeCardNumber - 1]?.question}
          value={questionsData.questions[activeCardNumber - 1]?.response || 0}
          index={activeCardNumber}
          onSubmit={(value) => {
            if (!disabled) {
              formValueChange(
                questionsData.questions[activeCardNumber - 1]?.order,
                value,
              );
            }
          }}
        />
      );
    }
    if (type === 'Emojis') {
      return (
        <FeelingCard
          hideQuestions
          question={questionsData.questions[activeCardNumber - 1]?.question}
          value={
            questionsData.questions[activeCardNumber - 1]?.response || 'Neutral'
          }
          index={activeCardNumber}
          onSubmit={(value) => {
            if (!disabled) {
              formValueChange(
                questionsData.questions[activeCardNumber - 1]?.order,
                value,
              );
            }
          }}
        />
      );
    }
    if (type === 'Yes/No') {
      return (
        <YesNoCard
          hideQuestions
          question={questionsData.questions[activeCardNumber - 1]?.question}
          value={
            questionsData.questions[activeCardNumber - 1]?.response || 'No'
          }
          index={activeCardNumber}
          onSubmit={(value) => {
            if (!disabled) {
              formValueChange(
                questionsData.questions[activeCardNumber - 1]?.order,
                value,
              );
            }
          }}
        />
      );
    }

    if (type === 'Star Rating') {
      return (
        <RateCard
          hideQuestions
          question={questionsData.questions[activeCardNumber - 1]?.question}
          value={questionsData.questions[activeCardNumber - 1]?.response || 0}
          index={activeCardNumber}
          onSubmit={(value) => {
            if (!disabled) {
              formValueChange(
                questionsData.questions[activeCardNumber - 1]?.order,
                value,
              );
            }
          }}
        />
      );
    }

    if (type === 'File Uploader') {
      return (
        <UploadCard
          hideQuestions
          question={questionsData.questions[activeCardNumber - 1]?.question}
          value={questionsData.questions[activeCardNumber - 1]?.response}
          index={activeCardNumber}
          onSubmit={(values) => {
            if (!disabled) {
              formValueChange(
                questionsData.questions[activeCardNumber - 1]?.order,
                values,
              );
            }
          }}
        />
      );
    }
    if (type == 'date') {
      return (
        <>
          <div className="relative w-full flex justify-center items-center h-[80px]">
            {/* <DatePicker value={questionsFormData.questions[activeCard - 1].response!= ''?new Date(questionsFormData.questions[activeCard - 1].response):new Date()} onChange={(newDate) => {
                  formValueChange(
                    questionsFormData.questions[activeCard - 1].id,
                    newDate?.getTime(),
                  );
                }}
                ></DatePicker> */}
            <input
              type="date"
              onChange={(e) => {
                // console.log(new Date(e.target.value).toISOString().split('T')[0])
                if (!disabled) {
                  if (validateDate(e.target.value)) {
                    formValueChange(
                      questionsData.questions[activeCardNumber - 1]?.order,
                      new Date(e.target.value).toISOString().split('T')[0],
                    );
                  }
                }
              }}
              value={
                questionsData.questions[activeCardNumber - 1]?.response != ''
                  ? new Date(
                      questionsData.questions[activeCardNumber - 1]?.response,
                    )
                      .toISOString()
                      .split('T')[0]
                  : new Date().toISOString().split('T')[0]
              }
              className=" rounded-md px-2 py-1 bg-backgroundColor-Card border border-Gray-50 flex items-center justify-between text-[10px] text-Text-Secondary"
            />
            {/* <DatePicker
              selected={
                questionsFormData.questions[activeCard - 1].response != ''
                  ? new Date(
                      questionsFormData.questions[activeCard - 1].response,
                    )
                  : new Date()
              }
              // selected={new Date(questionsFormData.questions[activeCard - 1].response)}
              onChange={(newDate) => {
                formValueChange(
                  questionsFormData.questions[activeCard - 1].id,
                  newDate?.getTime(),
                );
              }}
              customInput={
                <button className=" w-[110px] xs:w-[125px] sm:w-[133px] rounded-md px-2 py-1 bg-backgroundColor-Card border border-Gray-50 flex items-center justify-between text-[10px] text-Text-Secondary">
                  {formatDate(
                    questionsFormData.questions[activeCard - 1].response != ''
                      ? new Date(
                          questionsFormData.questions[activeCard - 1].response,
                        )
                      : new Date(),
                  )}{' '}
                  <img src="/icons/calendar-3.svg" alt="" />
                </button>
              }
            /> */}
          </div>
        </>
      );
    }
  };
  const checkFormComplete = () => {
    const datas = questionsFormData?.questions?.filter(
      (el: any) => el.required == true && el.response.length == 0,
    );
    return datas?.length == 0;
  };
  const [activeCard, setActiveCard] = useState(1);

  return (
    <div className=" w-full">
      <div
        onClick={() => {
          Application.AddQuestionaryList({}).then((res) => {
            setAddForms(res.data);
            setTryAdd(true);
          });
          // Application.getGoogleFormEmty()
          //   .then((res) => {
          //     setQuestionsFormData(res.data);
          //     setTryAdd(true);
          //   })
          //   .catch((err) => {
          //     console.error('Error fetching the link:', err);
          //   });
          if (tryComplete) {
            setTryComplete(false);
          }
        }}
        className={`text-[14px] flex cursor-pointer justify-center items-center gap-1 bg-white border-Primary-DeepTeal border rounded-xl border-dashed px-8 h-8 w-full text-Primary-DeepTeal ${tryAdd && 'hidden'} `}
      >
        <img className="w-6 h-6" src="/icons/add-blue.svg" alt="" />
        Add Questionary
      </div>
      <div className=" mt-3">
        {tryAdd && (
          <>
            <div className="bg-bg-color rounded-xl p-3 border border-Gray-50">
              <div className="flex flex-col gap-2 h-[150px] pr-[6px] custom-scrollbar  overflow-y-auto">
                {AddForms.map((form: any) => (
                  <div
                    onClick={() => toggleSelection(form.unique_id)}
                    key={form.id}
                    className={` ${selectedFormIDs.includes(form.unique_id) ? 'border border-Primary-EmeraldGreen' : ''} rounded-xl py-2 px-3 bg-white cursor-pointer flex justify-between`}
                  >
                    <div className="flex items-center gap-1">
                      <Checkbox
                        checked={selectedFormIDs.includes(form.unique_id)}
                      />
                      <div className="text-[10px] text-[#888888]">
                        {form.title}
                      </div>
                    </div>
                    <div className="text-[10px] text-[#888888]">
                      {form.num_of_questions}
                    </div>
                  </div>
                ))}
              </div>
              <div className="w-full flex items-center gap-2  mt-4">
                <ButtonPrimary
                  onClick={() => {
                    setSelectedFormIDs([]);
                    setTryAdd(false);
                  }}
                  outLine
                  style={{
                    backgroundColor: '#fff',
                    color: '#005F73',
                    width: '100%',
                  }}
                >
                  Cancel
                </ButtonPrimary>
                <ButtonPrimary
                  disabled={selectedFormIDs.length == 0}
                  onClick={() => {
                    handleAddQuestionnaires();
                    // Application.AddQuestionary({
                    //   member_id:id,
                    //   q_unique_id:selectedFormID
                    // })
                  }}
                  style={{ width: '100%' }}
                >
                  Add
                </ButtonPrimary>
              </div>
            </div>
          </>
        )}
        {tryComplete && (
          <div className="bg-white select-none relative border mt-4 py-3 px-3  min-h-[292px] rounded-[12px] border-gray-50">
            <div className="flex justify-between items-center">
              <div className="text-xs text-Text-Primary">
                {questionsFormData.title}
              </div>
              <ButtonSecondary
                disabled={!checkFormComplete()}
                onClick={() => {
                  setSubmitLoading(true);
                  Application.SaveQuestionary({
                    member_id: id,
                    q_unique_id: questionsFormData.unique_id,
                    respond: questionsFormData.questions,
                  })
                    .then(() => {
                      setTimeout(() => {
                        setTryComplete(false);
                      }, 300);
                    })
                    .finally(() => {
                      setData((prevData: any) => {
                        return prevData.map((form: any) => {
                          if (form.unique_id === questionsFormData.unique_id) {
                            return {
                              ...form,
                              status: 'completed',
                            };
                          }
                          return form;
                        });
                      });
                      setSubmitLoading(false);
                    });
                  // Application.setGoogleFormEmty({
                  //   data: questionsFormData,
                  //   member_id: Number(id),
                  // })
                }}
                ClassName="rounded-full"
                size="small"
              >
                {submitLoading ? (
                  <SpinnerLoader></SpinnerLoader>
                ) : (
                  <img
                    className="w-[16px]"
                    src="/icons/tick-square.svg"
                    alt=""
                  />
                )}
                Submit
              </ButtonSecondary>
            </div>
            <div className="mt-2">
              <div className="bg-[#E9F0F2] w-full py-[6px] px-8 min-h-[108px] text-center rounded-t-[6px] flex items-center">
                <div
                  style={{ textAlignLast: 'center', textAlign: 'center' }}
                  className="text-[12px]  text-Primary-DeepTeal font-medium text-justify"
                >
                  {(questionsFormData?.questions &&
                    questionsFormData.questions[activeCard - 1]?.question) ||
                    'Question not available'}
                </div>
              </div>
              <div
                className={`bg-backgroundColor-Card border border-gray-50 pt-2 px-4 rounded-b-[6px] h-[100px] min-h-[100px]   max-h-[260px]  ${questionsFormData?.questions && questionsFormData.questions[activeCard - 1]?.type == 'date' ? 'overflow-visible' : 'overflow-y-auto'}`}
              >
                {questionsFormData?.questions &&
                  questionsFormData.questions[activeCard - 1] &&
                  resolveForm(
                    questionsFormData.questions[activeCard - 1]?.type,
                    questionsFormData,
                    activeCard,
                  )}
              </div>

              <div
                className={` ${
                  questionsFormData?.questions &&
                  questionsFormData.questions[activeCard - 1]?.required
                    ? 'block'
                    : 'invisible'
                } text-[10px] text-red-500 mt-1 mb-5`}
              >
                * This question is required.
              </div>
            </div>

            <div className="w-full flex justify-center  pb-2 absolute bottom-0">
              <div className="flex  w-[95px] justify-center items-center gap-3">
                
                  <img
                    className={`cursor-pointer ${activeCard <= 1 ? 'opacity-40' : ''}`}
                    onClick={() => {
                      if (activeCard > 1) {
                        setActiveCard(activeCard - 1)
                      }
                    }}
                    src="/icons/arrow-circle-left.svg"
                    alt=""
                  />
               
                {/* <div
                  onClick={() => {
                    if (activeCard > 1) {
                      setActiveCard(activeCard - 1);
                    }
                  }}
                  className="w-5 h-5 bg-[#E9F0F2] flex justify-center items-center rounded-full cursor-pointer "
                >
                  <img
                    className="rotate-90 w-3"
                    src="/icons/arrow-down-green.svg"
                    alt=""
                  />
                </div> */}
                <div className="text-[10px] w-[40px] text-center text-Text-Secondary text-nowrap">
                  {activeCard} /{questionsFormData?.questions?.length || 0}
                </div>
                <img
                  className={`cursor-pointer rotate-180 ${activeCard == questionsFormData?.questions?.length && 'opacity-40'}`}
                  onClick={() => {
                    if (
                      activeCard < (questionsFormData?.questions?.length || 0)
                    ) {
                      setActiveCard(activeCard + 1);
                    }
                  }}
                  src="/icons/arrow-circle-left.svg"
                  alt=""
                />
                {/* <div
                  onClick={() => {
                    if (activeCard < questionsFormData.questions.length) {
                      setActiveCard(activeCard + 1);
                    }
                  }}
                  className="w-5 h-5 bg-[#E9F0F2] flex justify-center items-center rounded-full cursor-pointer "
                >
                  <img
                    className="rotate-[270deg] w-3"
                    src="/icons/arrow-down-green.svg"
                    alt=""
                  />
                </div> */}
              </div>
            </div>
          </div>
        )}
        <>
          {data?.length > 0 && !tryComplete ? (
            <>
              <div className="w-full text-[10px] md:text-[12px] mt-4 px-2 xs:px-3 md:px-5 py-3 h-[48px] border border-Gray-50 bg-backgroundColor-Main text-Primary-DeepTeal font-medium  flex justify-between items-center rounded-[12px]">
                <div>Questionary Name</div>
                <div>State</div>
                <div>Action</div>
              </div>
              <div className="flex justify-center w-full items-start  ">
                <div className="w-full mt-2 h-[500px] overflow-auto ">
                  {data?.map((el: any, index: number) => {
                    console.log(el);

                    return (
                      <QuestionRow
                        onTryComplete={() => {
                          Application.QuestionaryAction({
                            member_id: id,
                            q_unique_id: el.unique_id,
                            action: 'fill',
                          }).then((res) => {
                            const modifiedResponseData = {
                              ...res.data,
                              unique_id: el.unique_id,
                            };

                            setQuestionsFormData(modifiedResponseData);
                            setTryComplete(true);
                          });
                        }}
                        el={el}
                        id={id as string}
                        resolveForm={resolveForm}
                        deleteRow={() => deleteQuestionRow(index)}
                      ></QuestionRow>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <>
              {isLaoding ? (
                <>
                  <div className="w-full flex justify-center items-center h-[220px]">
                    <Circleloader></Circleloader>
                  </div>
                </>
              ) : (
                data?.length < 1 &&
                !tryAdd && (
                  <div className="flex flex-col items-center justify-center h-[250px] ">
                    <img
                      className=" object-contain"
                      src="/icons/document-text.svg"
                      alt=""
                    />
                    <div className="text-[12px] text-[#383838] mt-1">
                      No Data Found
                    </div>
                    <p className="text-[10px] text-Text-Secondary mt-4 mb-3 text-center">
                      For more accurate results, please complete the
                      questionnaire
                    </p>
                    {/* <ButtonPrimary
                      onClick={() => {
                        // setTryComplete(true);
                        Application.getGoogleFormEmty()
                          .then((res) => {
                            setQuestionsFormData(res.data);
                            setTryComplete(true);
                          })
                          .catch((err) => {
                            console.error('Error fetching the link:', err);
                          });
                      }}
                    >
                      Complete Questionary
                    </ButtonPrimary> */}
                  </div>
                )
              )}
            </>
          )}
        </>
      </div>
    </div>
  );
};
