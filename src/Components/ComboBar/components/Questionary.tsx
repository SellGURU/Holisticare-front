/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import Application from '../../../api/app';
import { useParams } from 'react-router-dom';
import { ButtonPrimary } from '../../Button/ButtonPrimary';
import { ButtonSecondary } from '../../Button/ButtosSecondary';
import questionsData from './questions/data.json';
import Checkbox from './CheckBox';

export const Questionary = () => {
  const [data, setData] = useState<any>(null);
  const { id } = useParams<{ id: string }>();
  const [tryComplete, setTryComplete] = useState(false);
  const [questionsFormData, setQuestionsFormData] =
    useState<any>(questionsData);
  useEffect(() => {
    // setIsLoading(true);
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
        // setIsLoading(false);
      });
  }, [id]);
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

  const resolveForm = (type: string) => {
    if (type == 'short_answer') {
      return (
        <>
          <textarea
            value={questionsFormData.questions[activeCard - 1].response}
            onChange={(e) => {
              formValueChange(
                questionsFormData.questions[activeCard - 1].id,
                e.target.value,
              );
            }}
            placeholder="Enter value"
            className="w-full text-[10px] h-full text-Text-Primary outline-none border-none bg-backgroundColor-Card"
          />
        </>
      );
    }
    if (type == 'multiple_choice') {
      return (
        <>
          <div>
            <div>
              {questionsFormData.questions[activeCard - 1]?.options?.map(
                (el: any) => {
                  return (
                    <div
                      onClick={() => {
                        formValueChange(
                          questionsFormData.questions[activeCard - 1].id,
                          el,
                        );
                      }}
                      className="flex items-center gap-2 mb-2"
                    >
                      <div
                        className={`w-[12px] h-[12px] flex justify-center items-center cursor-pointer min-w-[12px] min-h-[12px] max-h-[12px] max-w-[12px] ${questionsFormData.questions[activeCard - 1].response == el ? 'border-Primary-DeepTeal' : 'border-Text-Secondary '} bg-white border-[1.4px] rounded-full`}
                      >
                        {questionsFormData.questions[activeCard - 1].response ==
                          el && (
                          <div className="w-[7px] h-[7px] bg-Primary-DeepTeal rounded-full"></div>
                        )}
                      </div>
                      <div
                        className={`text-[10px] cursor-pointer ${questionsFormData.questions[activeCard - 1].response == el ? 'text-Text-Primary' : 'text-Text-Secondary'} `}
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
            {questionsFormData.questions[activeCard - 1]?.options?.map(
              (el: any) => {
                return (
                  <div
                    onClick={() => {
                      console.log(
                        questionsFormData.questions[
                          activeCard - 1
                        ].response.includes(el),
                      );
                      const newResponses = !questionsFormData.questions[
                        activeCard - 1
                      ].response.includes(el)
                        ? [
                            ...questionsFormData.questions[activeCard - 1]
                              .response,
                            el,
                          ] // Add to array
                        : questionsFormData.questions[
                            activeCard - 1
                          ].response.filter((item: any) => item !== el); // Remove from array
                      formValueChange(
                        questionsFormData.questions[activeCard - 1].id,
                        newResponses,
                      );
                    }}
                    className="flex items-center gap-2 mb-2"
                  >
                    <Checkbox
                      checked={questionsFormData.questions[
                        activeCard - 1
                      ].response.includes(el)}
                    ></Checkbox>

                    <div
                      className={`text-[10px] cursor-pointer ${questionsFormData.questions[activeCard - 1].response.includes(el) ? 'text-Text-Primary' : 'text-Text-Secondary'} `}
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
  };
  const [activeCard, setActiveCard] = useState(1);
  return (
    <div className=" w-full">
      <div className="px-2">
        <div className="w-full text-[12px] px-5 py-3 h-[48px] border border-Gray-50 bg-backgroundColor-Main text-Primary-DeepTeal font-medium  flex justify-between items-center rounded-[12px]">
          <div>Questionary Name</div>
          <div>State</div>
          <div>Action</div>
        </div>
        {tryComplete ? (
          <>
            <div className="bg-white relative border mt-4 py-3 px-3  min-h-[272px] rounded-[12px] border-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-xs text-Text-Primary">Profile Data</div>
                <ButtonSecondary ClassName="rounded-full" size="small">
                  <img
                    className="w-[16px]"
                    src="/icons/tick-square.svg"
                    alt=""
                  />
                  Submit
                </ButtonSecondary>
              </div>
              <div className="mt-2">
                <div className="bg-[#E9F0F2] w-full py-2 px-8 text-center rounded-t-[6px]">
                  <div className="text-[12px] font-medium">
                    {questionsFormData.questions[activeCard - 1].question}
                  </div>
                </div>
                <div className="bg-backgroundColor-Card border border-gray-50 pt-2 px-4 rounded-b-[6px] min-h-[50px]">
                  {resolveForm(questionsData.questions[activeCard - 1].type)}
                </div>
              </div>

              <div className="w-full flex justify-center pb-2 absolute bottom-0">
                <div className="flex justify-center items-center gap-3">
                  <div
                    onClick={() => {
                      setActiveCard(activeCard - 1);
                    }}
                    className="w-5 h-5 bg-[#E9F0F2] flex justify-center items-center rounded-full cursor-pointer "
                  >
                    <img
                      className="rotate-90 w-3"
                      src="/icons/arrow-down-green.svg"
                      alt=""
                    />
                  </div>
                  <div className="text-[10px] text-Text-Secondary">
                    {activeCard} /{questionsFormData.questions.length}
                  </div>
                  <div
                    onClick={() => {
                      setActiveCard(activeCard + 1);
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
                <div className="flex justify-center w-full items-start overflow-auto h-[240px]">
                  <div className="w-full mt-2">
                    {data?.map((el: any) => {
                      return (
                        <div className=" bg-white border border-Gray-50 mb-1 px-5 py-3 h-[48px] w-full rounded-[12px] flex justify-between items-center">
                          <div className="text-[10px]  text-Text-Primary">
                            {el.Data}
                          </div>

                          <div className="text-[8px] ">
                            <div
                              className={`rounded-full  px-2.5 py-1 text-Text-Primary flex items-center gap-1 ${
                                el['State'] == 'Complete'
                                  ? 'bg-[#DEF7EC]'
                                  : 'bg-[#F9DEDC]'
                              }`}
                              //   style={{
                              //     backgroundColor: 'red'
                              //       resolveStatusColor(
                              //         el["State"]
                              //       ),
                              //   }}
                            >
                              <div
                                className={`w-3 h-3 rounded-full  ${
                                  el['State'] == 'Complete'
                                    ? 'bg-[#06C78D]'
                                    : 'bg-[#FFBD59]'
                                }`}
                              ></div>
                              {el['State']}
                            </div>
                          </div>
                          <div
                            onClick={() => {
                              Application.Questionary_tracking_action({
                                form_name: el['Data'],
                                member_id: id,
                              }).then((res) => {
                                if (res.data && res.data.link) {
                                  window.open(res.data.link, '_blank');
                                }
                              });
                            }}
                          >
                            {el['State'] === 'Complete' ? (
                              <img src="/icons/eye-green.svg" alt="" />
                            ) : (
                              // Render this if action is not "Complete"
                              <img
                                className="cursor-pointer"
                                onClick={() => {
                                  Application.questionaryLink({})
                                    .then((res) => {
                                      const url =
                                        res.data['Personal Information'];
                                      if (url) {
                                        window.open(url, '_blank');
                                      }
                                    })
                                    .catch((err) => {
                                      console.error(
                                        'Error fetching the link:',
                                        err,
                                      );
                                    });
                                }}
                                src="/icons/Fiilout-Form.svg"
                                alt=""
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
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
                  For more accurate results, please complete the questionnaire
                </p>
                <ButtonPrimary
                  onClick={() => {
                    setTryComplete(true);
                    // Application.questionaryLink({})
                    //   .then((res) => {
                    //     const url = res.data['Personal Information'];
                    //     if (url) {
                    //       window.open(url, '_blank');
                    //     }
                    //   })
                    //   .catch((err) => {
                    //     console.error('Error fetching the link:', err);
                    //   });
                  }}
                >
                  Complete Questionary
                </ButtonPrimary>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
