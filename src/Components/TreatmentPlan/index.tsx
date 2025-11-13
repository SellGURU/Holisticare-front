/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext, useEffect, useRef, useState } from 'react';
import useModalAutoClose from '../../hooks/UseModalAutoClose';
// import treatmentPlanData from "../../api/--moch--/data/new/treatment_plan_report.json";
import { useNavigate, useParams } from 'react-router-dom';
import Application from '../../api/app';
import { AppContext } from '../../store/app';
import { ButtonSecondary } from '../Button/ButtosSecondary';
import { SlideOutPanel } from '../SlideOutPanel';
import TreatmentCard from './TreatmentCard';
import { publish } from '../../utils/event';

type CardData = {
  id: number;
  date: string;
  status: string;
};

const initialCardData: CardData[] = [
  // {
  //   id: 1,
  //   date: "2024/29/09",
  //   status: "Completed",
  // },
  // { id: 2, date: "2024/29/09", status: "Paused" },
  // {
  //   id: 3,
  //   date: "2024/29/09",
  //   status: "Completed",
  // },
  // {
  //   id: 4,
  //   date: "2024/29/09",
  //   status: "On Going",
  // },
  // {
  //   id: 5,
  //   date: "2024/29/11",
  //   status: "Upcoming",
  // },
];

interface TreatmentPlanProps {
  treatmentPlanData: any;
  setPrintActionPlan: (value: any) => void;
  isShare?: boolean;
  setIsHolisticPlanEmpty: (value: boolean) => void;
  setIsShareModalSuccess: (value: boolean) => void;
  setDateShare: (value: string | null) => void;
}

export const TreatmentPlan: React.FC<TreatmentPlanProps> = ({
  treatmentPlanData,
  setPrintActionPlan,
  isShare,
  setIsHolisticPlanEmpty,
  setIsShareModalSuccess,
  setDateShare,
}) => {
  const resolveStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return '#55DD4A';
      case 'On Going':
        return '#3C79D6';
      case 'Draft':
        return '#F4E25C';
      case 'Paused':
        return '#E84040';
      case 'Upcoming':
        return '#FFC123';
      default:
        return '#000000'; // Fallback color
    }
  };
  const resolveCanGenerateNew = () => {
    if (cardData.length > 0) {
      return cardData[cardData.length - 1].state !== 'Draft';
    }
    return true;
  };
  const [showModalIndex, setShowModalIndex] = useState<number | null>(null);
  const showModalRefrence = useRef(null);
  const showModalButtonRefrence = useRef(null);
  const { setTreatmentId } = useContext(AppContext);
  useModalAutoClose({
    refrence: showModalRefrence,
    buttonRefrence: showModalButtonRefrence,
    close: () => {
      setShowModalIndex(null);
      setDeleteConfirmIndex(null);
    },
  });
  const [cardData, setCardData] = useState<Array<any>>(initialCardData);

  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(
    null,
  );
  const [aciveTreatmentPlan, setActiveTreatmentplan] = useState('Diet');
  const [TreatMentPlanData, setTreatmentPlanData] =
    useState<any>(treatmentPlanData);
  useEffect(() => {
    if (treatmentPlanData) {
      setTreatmentPlanData(treatmentPlanData);
    }
  }, [treatmentPlanData]);
  const [isAnalysisOpen, setisAnalysisOpen] = useState(false);
  const [isClientGoalOpen, setisClientGoalOpen] = useState(false);
  const [NeedFocusData, setNeedFocusData] = useState<Array<any>>([]);
  const [clientSummary, setclientSummary] = useState('second');

  const navigate = useNavigate();
  const [clientGools, setClientGools]: any = useState({});
  const { id } = useParams<{ id: string }>();
  const [activeTreatment, setActiveTreatmnet] = useState('');
  useEffect(() => {
    if (!isShare) {
      Application.showHistory({
        member_id: id,
      }).then((res) => {
        if (res.data.length == 0) {
          setIsHolisticPlanEmpty(true);
        } else {
          setIsHolisticPlanEmpty(false);
        }
        setCardData(res.data);
        setPrintActionPlan(res.data);
        if (res.data.length > 0) {
          setActiveTreatmnet(res.data[res.data.length - 1].t_plan_id);
          setIsShareModalSuccess(
            res.data[res.data.length - 1].shared_report_with_client,
          );
          setDateShare(
            res.data[res.data.length - 1].shared_report_with_client_date,
          );
        }
        setTimeout(() => {
          const container: any = document.getElementById('scrollContainer');
          if (container) {
            container.scrollLeft = container.scrollWidth; // Set scroll to the very end
          }
        }, 500);
      });
    }
  }, []);
  useEffect(() => {
    if (activeTreatment != '' && !isShare) {
      Application.getTreatmentPlanDetail({
        treatment_id: activeTreatment,
        member_id: id,
      }).then((res) => {
        setTreatmentPlanData(res.data.details);
        if (res.data.client_goals != null) {
          setClientGools(res.data.client_goals);
        }
        setNeedFocusData(res.data.need_focus_benchmarks);
        setclientSummary(res.data.medical_summary);
      });
    }
  }, [activeTreatment]);
  const resolveCardBorderColor = (state: string) => {
    switch (state) {
      case 'Draft':
        return 'border-[#F4E25C]';
      default:
        return 'border-Primary-EmeraldGreen';
    }
  };
  const handleDeleteCard = (index: number, tretmentid: string) => {
    Application.deleteHolisticPlan({
      treatment_id: tretmentid,
      member_id: id,
    }).catch(() => {});

    setCardData((prevCardData) => {
      const newCardData = prevCardData.filter((_, i) => i !== index);
      if (index > 0) {
        setActiveTreatmnet(newCardData[index - 1].t_plan_id);
      } else if (newCardData.length > 0) {
        setActiveTreatmnet(newCardData[0].t_plan_id);
      } else {
        setActiveTreatmnet('');
      }
      return newCardData;
    });

    setShowModalIndex(null);
    // setDeleteConfirmIndex(null);

    publish('syncReport', { part: 'treatmentPlan' });
  };
  const isShowDot = (card: any, index: number) => {
    if (card.state == 'Draft' || card.editable == true) {
      return true;
    }
    // پیدا کردن آخرین index که state آن On Going یا Completed است
    let lastOnGoingOrCompletedIndex = -1;
    for (let i = cardData.length - 1; i >= 0; i--) {
      if (
        cardData[i].state === 'On Going' ||
        cardData[i].state === 'Completed' ||
        cardData[i].state === 'Paused'
      ) {
        lastOnGoingOrCompletedIndex = i;
        break;
      }
    }
    // اگر این card همان آخرین آیتم با state On Going یا Completed باشد، true برگردان
    if (index === lastOnGoingOrCompletedIndex) {
      return true;
    }
    return false;
  };
  return (
    <>
      {isShare ? (
        <>
          <div className="w-full gap-1 md:gap-2 mt-4 flex justify-between items-center hidden-scrollbar overflow-x-scroll md:overflow-x-hidden">
            <div
              onClick={() => {
                setActiveTreatmentplan('Diet');
              }}
              className={`text-[10px] xs:text-xs flex flex-col md:flex-row justify-center bg-white cursor-pointer h-[80px] md:h-[48px] min-w-[74px] gap-2 shadow-100 border rounded-2xl md:rounded-[16px] text-Primary-DeepTeal ${
                aciveTreatmentPlan == 'Diet'
                  ? ' border-Primary-EmeraldGreen'
                  : ''
              } w-full flex items-center px-4`}
            >
              <div className="w-6 h-6 bg-[#E5E5E5]  flex justify-center items-center rounded-[8px]">
                <img src="/icons/diet.svg" alt="" />
              </div>
              Diet
            </div>
            <div
              onClick={() => {
                setActiveTreatmentplan('Lifestyle');
              }}
              className={`text-[10px] xs:text-xs flex flex-col md:flex-row justify-center bg-white cursor-pointer h-[80px] md:h-[48px] gap-2 shadow-100 min-w-[73px] border rounded-2xl md:rounded-[16px] text-Primary-DeepTeal ${
                aciveTreatmentPlan == 'Lifestyle'
                  ? ' border-Primary-EmeraldGreen'
                  : ''
              } w-full flex items-center px-4`}
            >
              <div className="w-6 h-6 bg-[#E5E5E5]  flex justify-center items-center rounded-[8px]">
                <img className="size-4" src="/icons/LifeStyle2.svg" alt="" />
              </div>
              Lifestyle
            </div>
            <div
              onClick={() => {
                setActiveTreatmentplan('Activity');
              }}
              className={` text-[10px] xs:text-xs flex flex-col md:flex-row justify-center bg-white cursor-pointer h-[80px] md:h-[48px] gap-2 shadow-100 border min-w-[73px] rounded-2xl md:rounded-[16px] text-Primary-DeepTeal ${
                aciveTreatmentPlan == 'Activity'
                  ? ' border-Primary-EmeraldGreen'
                  : ''
              } w-full flex items-center px-4`}
            >
              <div className="w-6 h-6 bg-[#E5E5E5]  flex justify-center items-center rounded-[8px]">
                <img src="/icons/weight.svg" alt="" />
              </div>
              Activity
            </div>
            <div
              onClick={() => {
                setActiveTreatmentplan('Supplement');
              }}
              className={` text-[10px] xs:text-xs flex flex-col md:flex-row justify-center bg-white cursor-pointer h-[80px] md:h-[48px] gap-2 shadow-100 min-w-[73px] border rounded-2xl md:rounded-[16px] text-Primary-DeepTeal ${
                aciveTreatmentPlan == 'Supplement'
                  ? ' border-Primary-EmeraldGreen'
                  : ''
              } w-full flex items-center px-4`}
            >
              <div className="w-6 h-6 bg-[#E5E5E5]  flex justify-center items-center rounded-[8px]">
                <img src="/icons/Supplement.svg" alt="" />
              </div>
              Supplement
            </div>
            <div
              onClick={() => {
                setActiveTreatmentplan('Other');
              }}
              className={` text-[10px] xs:text-xs flex flex-col md:flex-row justify-center bg-white cursor-pointer h-[80px] md:h-[48px] gap-2 shadow-100 min-w-[73px] border rounded-2xl md:rounded-[16px] text-Primary-DeepTeal ${
                aciveTreatmentPlan == 'Other'
                  ? ' border-Primary-EmeraldGreen'
                  : ''
              } w-full flex items-center px-4`}
            >
              <div className="w-6 h-6 bg-[#E5E5E5]  flex justify-center items-center rounded-[8px]">
                <img src="/icons/others.svg" alt="" />
              </div>
              Other
            </div>
          </div>
          {TreatMentPlanData.length > 0 && (
            <div
              className={`w-full flex flex-wrap gap-6 bg-white min-h-[540px] p-4 rounded-[16px] border border-Gray-50 shadow-100 mt-4 ${
                TreatMentPlanData?.filter(
                  (value: any) => value.category == aciveTreatmentPlan,
                )[0]?.data.length < 1 && 'justify-center'
              }`}
            >
              {TreatMentPlanData?.filter(
                (value: any) => value.category == aciveTreatmentPlan,
              )[0]?.data?.map((el: any, index: number) => {
                return (
                  <>
                    <TreatmentCard
                      index={index}
                      data={el}
                      isOther={aciveTreatmentPlan == 'Other'}
                    ></TreatmentCard>
                  </>
                );
              })}
              {TreatMentPlanData?.filter(
                (value: any) => value.category == aciveTreatmentPlan,
              )[0]?.data.length < 1 && (
                <div className="w-full  flex justify-center items-center flex-col">
                  <img src="/icons/no-recommendations.svg" alt="" />
                  <div className="text-Text-Primary text-sm font-medium mt-5">
                    No recommendations found.
                  </div>
                </div>
              )}
            </div>
          )}
          {/* {TreatMentPlanData.length > 0 && (
            <div className="w-full flex flex-wrap gap-6 bg-white p-4 p- rounded-[16px] border border-Gray-50 shadow-100 mt-4">
              {TreatMentPlanData?.filter(
                (value: any) => value.category == aciveTreatmentPlan,
              )[0].data.map((el: any, index: number) => {
                return <TreatmentCard index={index} data={el}></TreatmentCard>;
              })}
            </div>
          )} */}
        </>
      ) : (
        <>
          {cardData.length < 1 ? (
            <div className="w-full h-[450px] flex justify-center items-center">
              <div className="w-full h-full flex flex-col items-center justify-center">
                <img src="/icons/EmptyState.svg" alt="" className="w-[219px]" />
                <div className="text-sm font-medium text-Text-Primary -mt-9">
                  No Holistic Plan Generated Yet
                </div>
                <div className="text-xs text-Text-Primary mt-2 mb-5">
                  Start creating your Holistic Plan
                </div>
                <ButtonSecondary
                  ClassName="w-full md:w-fit"
                  onClick={() => {
                    setTreatmentId('');
                    // navigate(`/report/Generate-Recommendation/${id}`);
                    navigate(`/report/Generate-Holistic-Plan/${id}/a`);
                  }}
                >
                  <img src="/icons/tick-square.svg" alt="" /> Generate New
                </ButtonSecondary>
              </div>
            </div>
          ) : (
            <div className="">
              <div className="w-full mb-3 flex items-center justify-between">
                {/* <div
              id="Treatment Plan"
              className="TextStyle-Headline-4 text-Text-Primary"
            >
              Treatment Plan{" "}
            </div> */}
                <div className="dark:text-[#FFFFFF99] text-light-secandary-text text-[14px]">
                  {/* Total of 30 Treatment in 4 category */}
                </div>
                {/* <div className="text-[#FFFFFF99] text-[12px]">Total of 65 exams in 11 groups</div> */}
              </div>
              <></>
              <div
                id="scrollContainer"
                className="flex items-center overflow-x-auto hidden-scrollbar  justify-start min-h-[300px] -mt-16 p-4  "
              >
                {cardData.map((card, index: number) => (
                  <div
                    key={card.id}
                    className={` ${card.state == 'Upcoming' && 'opacity-60'} ${
                      index % 2 == 0 ? 'mt-10 ' : 'mt-0'
                    } relative flex flex-col   items-center -ml-10  `}
                  >
                    {index % 2 == 0 ? (
                      <img
                        className="relative min-w-[191px] -bottom-[63px]"
                        src="/images/Group (1).svg"
                        alt=""
                      />
                    ) : (
                      <img
                        className="relative  min-w-[191px] "
                        src="/images/Group.svg"
                        alt=""
                      />
                    )}

                    <div
                      onClick={() => {
                        setActiveTreatmnet(card.t_plan_id);
                        setIsShareModalSuccess(card.shared_report_with_client);
                        setDateShare(card.shared_report_with_client_date);
                        if (index === cardData.length - 1) {
                          publish('holisticPlanSelectEnd', {});
                        } else {
                          publish('holisticPlanSelectNotEnd', {});
                        }
                      }}
                      className={`absolute cursor-pointer  mt-2 flex items-center justify-center min-w-[113px] min-h-[113px] w-[113px] h-[113px] bg-white rounded-full shadow-md border-[2px] ${
                        activeTreatment == card.t_plan_id
                          ? resolveCardBorderColor(card.state)
                          : 'border-Gray-25'
                      }`}
                    >
                      <div className=" flex w-full justify-center items-center flex-col gap-2">
                        <div className="flex w-full  justify-center ">
                          <div className="bg-[#DEF7EC] rounded-full w-[22px] h-[22px] flex items-center justify-center text-xs text-Text-Primary  ">
                            {index + 1 < 10 && 0}
                            {index + 1}
                          </div>
                          {isShowDot(card, index) && (
                            <img
                              onClick={() => setShowModalIndex(index)}
                              className="-mr-5 ml-3 cursor-pointer"
                              src="/icons/dots.svg"
                              alt=""
                            />
                          )}
                        </div>

                        <div className="rounded-full bg-Secondary-SelverGray px-2.5 py-[2px] flex items-center gap-1 text-[10px] text-Primary-DeepTeal">
                          <img src="/icons/calendar-2.svg" alt="" />
                          {card.formatted_date.split(',')[0]}
                        </div>
                        <div
                          // style={{ backgroundColor: resolveStatusColor() }}
                          className={`text-[10px] flex gap-1 items-center`}
                        >
                          <div
                            style={{
                              backgroundColor: resolveStatusColor(card.state),
                            }}
                            className={`w-2 h-2 rounded-full `}
                          ></div>
                          {card.state}
                        </div>
                      </div>
                      {showModalIndex === index && (
                        <div
                          ref={showModalRefrence}
                          className="absolute top-12 -right-16 z-20 w-[96px] rounded-[16px] pl-2 pr-1 py-2 bg-white border border-Gray-50 shadow-200 flex flex-col gap-1"
                        >
                          <div
                            onClick={(e) => {
                              e.stopPropagation();

                              navigate(
                                `/report/Generate-Recommendation/${id}/${card.t_plan_id}`,
                              );
                            }}
                            className="flex items-center gap-1 TextStyle-Body-2 text-Text-Primary pb-1 border-b border-Secondary-SelverGray  cursor-pointer"
                          >
                            <img src="/icons/edit-green.svg" alt="" />
                            Edit
                          </div>
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmIndex(index);
                            }}
                            className="flex w-full items-center gap-1 TextStyle-Body-2 text-Text-Primary pb-1  cursor-pointer"
                          >
                            {deleteConfirmIndex === index ? (
                              <div className="text-[12px] text-Text-Secondary  w-full flex items-center justify-between">
                                Sure?{' '}
                                <div className="flex items-center w-full justify-end gap-[2px]">
                                  <img
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteCard(index, card.t_plan_id);
                                    }}
                                    src="/icons/confirm-tick-circle.svg"
                                    alt=""
                                  />
                                  <img
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeleteConfirmIndex(null);
                                    }}
                                    src="/icons/cansel-close-circle.svg"
                                    alt=""
                                  />
                                </div>
                              </div>
                            ) : (
                              <>
                                <img src="/icons/delete-green.svg" alt="" />
                                Delete
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div
                  onClick={() => {
                    if (resolveCanGenerateNew()) {
                      setTreatmentId('');
                      // navigate(`/report/Generate-Recommendation/${id}`);
                      navigate(`/report/Generate-Holistic-Plan/${id}/a`);
                    }
                  }}
                  className={` 
                    relative ${resolveCanGenerateNew() ? 'opacity-100 cursor-pointer' : 'opacity-50 cursor-not-allowed'} mt-[95px] ml-2  flex flex-col items-center justify-center min-w-[113px] min-h-[113px] w-[113px] h-[113px] bg-white rounded-full shadow-md border-[2px] border-Primary-DeepTeal border-dashed  `}
                >
                  <img className="w-6 h-6" src="/icons/add-blue.svg" alt="" />
                  <div className="text-sm font-medium text-Primary-DeepTeal">
                    Generate New
                  </div>
                </div>
              </div>
              {/* <div className="w-full flex justify-center md:justify-end gap-2 my-3">
                <ButtonPrimary
                  ClassName="w-full md:w-fit"
                  size="small"
                  onClick={() => setisAnalysisOpen(true)}
                >
                  {' '}
                  <img src="/icons/analyse.svg" alt="" /> Analysis
                </ButtonPrimary>
                <ButtonPrimary
                  ClassName="w-full md:w-fit"
                  size="small"
                  onClick={() => setisClientGoalOpen(true)}
                >
                  {' '}
                  <img src="/icons/chart.svg" alt="" /> Client Goals
                </ButtonPrimary>
              </div> */}
              <div className="w-full gap-1 md:gap-2 flex justify-between items-center hidden-scrollbar overflow-x-scroll md:overflow-x-hidden ">
                <div
                  onClick={() => {
                    setActiveTreatmentplan('Diet');
                  }}
                  className={`text-[10px] xs:text-xs flex flex-col md:flex-row justify-center bg-white cursor-pointer h-[80px] md:h-[48px] min-w-[74px] gap-2 shadow-100 border rounded-2xl md:rounded-[16px] text-Primary-DeepTeal ${
                    aciveTreatmentPlan == 'Diet'
                      ? ' border-Primary-EmeraldGreen'
                      : ''
                  } w-full flex items-center px-4`}
                >
                  <div className="w-6 h-6 bg-[#E5E5E5]  flex justify-center items-center rounded-[8px]">
                    <img src="/icons/diet.svg" alt="" />
                  </div>
                  Diet
                </div>
                <div
                  onClick={() => {
                    setActiveTreatmentplan('Lifestyle');
                  }}
                  className={`text-[10px] xs:text-xs flex flex-col md:flex-row justify-center bg-white cursor-pointer h-[80px] md:h-[48px] gap-2 shadow-100 min-w-[73px] border rounded-2xl md:rounded-[16px] text-Primary-DeepTeal ${
                    aciveTreatmentPlan == 'Lifestyle'
                      ? ' border-Primary-EmeraldGreen'
                      : ''
                  } w-full flex items-center px-4`}
                >
                  <div className="w-6 h-6 bg-[#E5E5E5]  flex justify-center items-center rounded-[8px]">
                    <img
                      className="size-4"
                      src="/icons/LifeStyle2.svg"
                      alt=""
                    />
                  </div>
                  Lifestyle
                </div>
                <div
                  onClick={() => {
                    setActiveTreatmentplan('Activity');
                  }}
                  className={` text-[10px] xs:text-xs flex flex-col md:flex-row justify-center bg-white cursor-pointer h-[80px] md:h-[48px] gap-2 shadow-100 border min-w-[73px] rounded-2xl md:rounded-[16px] text-Primary-DeepTeal ${
                    aciveTreatmentPlan == 'Activity'
                      ? ' border-Primary-EmeraldGreen'
                      : ''
                  } w-full flex items-center px-4`}
                >
                  <div className="w-6 h-6 bg-[#E5E5E5]  flex justify-center items-center rounded-[8px]">
                    <img src="/icons/weight.svg" alt="" />
                  </div>
                  Activity
                </div>
                <div
                  onClick={() => {
                    setActiveTreatmentplan('Supplement');
                  }}
                  className={` text-[10px] xs:text-xs flex flex-col md:flex-row justify-center bg-white cursor-pointer h-[80px] md:h-[48px] gap-2 shadow-100 min-w-[73px] border rounded-2xl md:rounded-[16px] text-Primary-DeepTeal ${
                    aciveTreatmentPlan == 'Supplement'
                      ? ' border-Primary-EmeraldGreen'
                      : ''
                  } w-full flex items-center px-4`}
                >
                  <div className="w-6 h-6 bg-[#E5E5E5]  flex justify-center items-center rounded-[8px]">
                    <img src="/icons/Supplement.svg" alt="" />
                  </div>
                  Supplement
                </div>
                <div
                  onClick={() => {
                    setActiveTreatmentplan('Other');
                  }}
                  className={` text-[10px] xs:text-xs flex flex-col md:flex-row justify-center bg-white cursor-pointer h-[80px] md:h-[48px] gap-2 shadow-100 min-w-[73px] border rounded-2xl md:rounded-[16px] text-Primary-DeepTeal ${
                    aciveTreatmentPlan == 'Other'
                      ? ' border-Primary-EmeraldGreen'
                      : ''
                  } w-full flex items-center px-4`}
                >
                  <div className="w-6 h-6 bg-[#E5E5E5]  flex justify-center items-center rounded-[8px]">
                    <img src="/icons/others.svg" alt="" />
                  </div>
                  Other
                </div>
              </div>
              {TreatMentPlanData.length > 0 && (
                <div
                  className={`w-full flex flex-col gap-6 bg-white min-h-[540px] p-4 rounded-[16px] border border-Gray-50 shadow-100 mt-4 ${
                    TreatMentPlanData?.filter(
                      (value: any) => value.category == aciveTreatmentPlan,
                    )[0]?.data.length < 1 && 'justify-center'
                  }`}
                >
                  {TreatMentPlanData?.filter(
                    (value: any) => value.category == aciveTreatmentPlan,
                  )[0]?.data?.map((el: any, index: number) => {
                    return (
                      <>
                        <TreatmentCard
                          index={index}
                          data={el}
                          isOther={aciveTreatmentPlan == 'Other'}
                        ></TreatmentCard>
                      </>
                    );
                  })}
                  {TreatMentPlanData?.filter(
                    (value: any) => value.category == aciveTreatmentPlan,
                  )[0]?.data.length < 1 && (
                    <div className="w-full flex justify-center items-center flex-col">
                      <img src="/icons/no-recommendations.svg" alt="" />
                      <div className="text-Text-Primary text-sm font-medium mt-5">
                        No recommendations found.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <SlideOutPanel
        isOpen={isAnalysisOpen}
        onClose={() => setisAnalysisOpen(false)}
        headline="Analysis"
      >
        <>
          <div className="rounded-xl border border-t-0 border-Gray-50">
            <div className="bg-[#005F731A] rounded-t-xl w-full pl-4 py-2 text-xs text-Text-Secondary font-medium">
              Client Condition Insights
            </div>
            <div className="bg-backgroundColor-Card text-xs text-Text-Primary text-justify px-5 py-2 flex flex-col gap-2 rounded-b-xl">
              {clientSummary}
            </div>
          </div>
          <div className="rounded-xl border border-t-0 border-Gray-50 mt-3">
            <div className="bg-[#005F731A] rounded-t-xl w-full pl-4 py-2 text-xs text-Text-Secondary font-medium">
              Need Focus Biomarkers
            </div>
            <ul className="bg-backgroundColor-Card text-xs text-Text-Primary text-justify px-9 py-2 flex flex-col gap-2 rounded-b-xl">
              {NeedFocusData.map((el) => {
                return (
                  <>
                    <li className="list-disc">{el}</li>
                  </>
                );
              })}
            </ul>
          </div>
        </>
      </SlideOutPanel>
      <SlideOutPanel
        isOpen={isClientGoalOpen}
        onClose={() => setisClientGoalOpen(false)}
        headline="Client Goal"
      >
        <div>
          {Object.keys(clientGools).map((el, index) => {
            return (
              <>
                <div
                  className="w-full bg-[#005F731A] h-[40px] rounded-t-[12px] flex justify-center items-center text-[#888888] font-medium text-[12px]"
                  style={{
                    borderTopLeftRadius: index != 0 ? '0px' : '12px',
                    borderTopRightRadius: index != 0 ? '0px' : '12px',
                  }}
                >
                  {el}
                </div>
                <div className="bg-backgroundColor-Card  border text-[12px]  text-Text-Primary border-gray-50">
                  {clientGools[el]}
                </div>
              </>
            );
          })}
        </div>
      </SlideOutPanel>
    </>
  );
};
