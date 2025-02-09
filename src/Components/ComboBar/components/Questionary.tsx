/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import Application from '../../../api/app';
import { useParams } from 'react-router-dom';
import { ButtonPrimary } from '../../Button/ButtonPrimary';
import { ButtonSecondary } from '../../Button/ButtosSecondary';
// import DatePicker from 'react-datepicker';
import Checkbox from './CheckBox';
import SpinnerLoader from '../../SpinnerLoader';
import Circleloader from '../../CircleLoader';
import QuestionRow from './questionRow';
// import DatePicker from '../../DatePicker';

export const Questionary = () => {
  const [data, setData] = useState<any>(null);
  const { id } = useParams<{ id: string }>();
  const [tryComplete, setTryComplete] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isLaoding, setIsLoading] = useState(false);
  const [questionsFormData, setQuestionsFormData] = useState<any>([]);
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
  }, [id, tryComplete]);
  const formValueChange = (id: string, value: any) => {
    setQuestionsFormData((prev: any) => ({
      ...prev,
      questions: prev.questions.map((q: any) =>
        q.id === id
          ? { ...q, response: q.type === 'checkbox' ? [...value] : value }
          : q,
      ),
    }));
  };
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
  const resolveForm = (type: string,questionsData:any,activeCardNumber:number,disabled?:boolean) => {
    if (type == 'short_answer' || type == 'paragraph') {
      return (
        <>
          <textarea
            value={questionsData.questions[activeCardNumber - 1].response}
            disabled={disabled}
            onChange={(e) => {
              formValueChange(
                questionsData.questions[activeCardNumber - 1].id,
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
                (el: any) => {
                  return (
                    <div
                      onClick={() => {
                        if(!disabled){
                          formValueChange(
                            questionsData.questions[activeCardNumber - 1].id,
                            el,
                          );
                        }
                      }}
                      className="flex items-center gap-2 mb-2"
                    >
                      <div
                        className={`w-[12px] h-[12px] flex justify-center items-center cursor-pointer min-w-[12px] min-h-[12px] max-h-[12px] max-w-[12px] ${questionsData.questions[activeCard - 1].response == el ? 'border-Primary-DeepTeal' : 'border-Text-Secondary '} bg-white border-[1.4px] rounded-full`}
                      >
                        {questionsData.questions[activeCardNumber - 1].response ==
                          el && (
                          <div className="w-[7px] h-[7px] bg-Primary-DeepTeal rounded-full"></div>
                        )}
                      </div>
                      <div
                        className={`text-[10px] cursor-pointer ${questionsData.questions[activeCardNumber - 1].response == el ? 'text-Text-Primary' : 'text-Text-Secondary'} `}
                      >
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
                      if(!disabled) {
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
                          questionsData.questions[activeCardNumber - 1].id,
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
                if(!disabled) {
                  if (validateDate(e.target.value)) {
                    formValueChange(
                      questionsData.questions[activeCardNumber - 1].id,
                      new Date(e.target.value).toISOString().split('T')[0],
                    );
                  }
                }
              }}
              value={
                questionsData.questions[activeCardNumber - 1].response != ''
                  ? new Date(
                      questionsData.questions[activeCardNumber - 1].response,
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
    const datas = questionsFormData.questions.filter((el:any) =>el.required == true && el.response.length == 0)
    return datas.length == 0
  }
  const [activeCard, setActiveCard] = useState(1);
  return (
    <div className=" w-full">
      <div className="px-2">
        <div className="w-full text-[10px] md:text-[12px] px-2 xs:px-3 md:px-5 py-3 h-[48px] border border-Gray-50 bg-backgroundColor-Main text-Primary-DeepTeal font-medium  flex justify-between items-center rounded-[12px]">
          <div>Questionary Name</div>
          <div>State</div>
          <div>Action</div>
        </div>
        {tryComplete ? (
          <>
            <div className="bg-white select-none relative border mt-4 py-3 px-3  min-h-[272px] rounded-[12px] border-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-xs text-Text-Primary">Profile Data</div>
                <ButtonSecondary
                  disabled={!checkFormComplete()}
                  onClick={() => {
                    setSubmitLoading(true);
                    Application.setGoogleFormEmty({
                      data: questionsFormData,
                      member_id: Number(id),
                    })
                      .then(() => {
                        setTimeout(() => {
                          setTryComplete(false);
                        }, 300);
                      })
                      .finally(() => {
                        setSubmitLoading(false);
                      });
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
                <div className="bg-[#E9F0F2] w-full py-2 px-8 text-center rounded-t-[6px]">
                  <div className="text-[12px] font-medium">
                    {questionsFormData.questions[activeCard - 1].question}
                  </div>
                </div>
                <div
                  className={`bg-backgroundColor-Card border border-gray-50 pt-2 px-4 rounded-b-[6px] h-[100px] min-h-[100px]   max-h-[100px]  ${questionsFormData.questions[activeCard - 1].type == 'date' ? 'overflow-visible' : 'overflow-y-auto'}`}
                >
                  {resolveForm(
                    questionsFormData.questions[activeCard - 1].type,questionsFormData,
                    activeCard
                  )}
                </div>
                {questionsFormData.questions[activeCard - 1].required &&
                  <div className='text-[10px] text-red-500 mt-1'>* This question is required.</div>
                }
              </div>

              <div className="w-full flex justify-center pb-2 absolute bottom-0">
                <div className="flex justify-center items-center gap-3">
                  <div
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
                  </div>
                  <div className="text-[10px] w-[40px] text-center text-Text-Secondary">
                    {activeCard} /{questionsFormData.questions.length}
                  </div>
                  <div
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
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {data?.length > 0 ? (
              <>
                <div className="flex justify-center w-full items-start overflow-auto ">
                  <div className="w-full mt-2">
                    {data?.map((el: any) => {
                      return (
                        <QuestionRow el={el} id={id as string} resolveForm={resolveForm} ></QuestionRow>
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
                    <ButtonPrimary
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
                    </ButtonPrimary>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
