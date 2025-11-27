/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CalenderComponent from '../CalendarComponent/CalendarComponent';
import { ActionPlanCard } from './ActionPlanCard';
// import CalendarData from "../../api/--moch--/data/new/Calender.json";
import Application from '../../api/app';
import { publish } from '../../utils/event';
import { ButtonSecondary } from '../Button/ButtosSecondary';
import MobileCalendarComponent from '../CalendarComponent/MobileCalendarComponent';
import ProgressCalenderView from './ProgressCalendarView';
import SpinnerLoader from '../SpinnerLoader';

// type CardData = {
//   cardID: number;
//   status: "Completed" | "On Going" | "Paused" | "Upcoming";
//   title: string;
//   subtitle: string;
//   progress: number;
//   time: string;
// };
interface ActionPlanProps {
  calenderDataUper: any;
  setActionPrintData: (data: any) => void;
  isShare?: boolean;
  isHolisticPlanEmpty: boolean;
  setCalendarPrintData: (data: any) => void;
  disableGenerate: boolean;
}

export const ActionPlan: FC<ActionPlanProps> = ({
  setActionPrintData,
  isShare,
  calenderDataUper,
  isHolisticPlanEmpty,
  setCalendarPrintData,
  disableGenerate,
}) => {
  const { id } = useParams<{ id: string }>();
  const [actionPlanData, setActionPlanData] = useState<any>(calenderDataUper);
  useEffect(() => {
    if (calenderDataUper) {
      setActionPlanData(calenderDataUper);
    }
  }, [calenderDataUper]);
  // const [calendarData,setCalender] = useState(calenderDataUper);

  const [CardData, setCardData] = useState<Array<any>>([
    // {
    //   cardID: 1,
    //   status: "Completed",
    //   title: "Muscle Strengthening",
    //   subtitle: "Something short and simple here",
    //   progress: 100,
    //   time: "Done",
    // },
    // {
    //   cardID: 2,
    //   status: "On Going",
    //   title: "Stress Reduction",
    //   subtitle: "Something short and simple here",
    //   progress: 85,
    //   time: "1 Week left",
    // },
    // {
    //   cardID: 3,
    //   status: "Paused",
    //   title: "Stress Reduction",
    //   subtitle: "Something short and simple here",
    //   progress: 25,
    //   time: "Waiting",
    // },
    // {
    //   cardID: 4,
    //   status: "Upcoming",
    //   title: "Stress Reduction",
    //   subtitle: "Something short and simple here",
    //   progress: 0,
    //   time: "Waiting",
    // },
  ]);
  const [activeAction, setActiveAction] = useState(
    CardData.length > 0 ? CardData[0] : null,
  );
  // const [showTargeting, setshowTargeting] = useState(false)
  const navigate = useNavigate();
  // useEffect(() => {
  //   console.log(activeAction);
  // });
  // const [isCalenDarGenerated,setISCalenderGenerated] = useState(false);
  const getActionPlan = () => {
    if (!isShare) {
      Application.ActionPlanBlockList({ member_id: id }).then((res) => {
        // console.log(res.data);
        if (res.data.length == 0) {
          publish('ActionPlanStatus', { isempty: true });
        } else {
          publish('ActionPlanStatus', { isempty: false });
        }
        if (res.data.length > 0) {
          setCardData(res.data);
          setActionPrintData(res.data);
          setActiveAction(
            res.data.length > 0 ? res.data[res.data.length - 1] : null,
          );

          setCalendarPrintData(res.data[res.data.length - 1].overview);
          setActiveAction(
            res.data.length > 0 ? res.data[res.data.length - 1] : null,
          );
          setTimeout(() => {
            const container: any = document.getElementById('actionList');
            if (container) {
              container.scrollLeft = container.scrollWidth; // Set scroll to the very end
            }
          }, 500);
        }
      });
    }
  };
  useEffect(() => {
    getActionPlan();
  }, []);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const canCreateNewActionPlan = () => {
    if (isHolisticPlanEmpty) {
      return false;
    }
    if(disableGenerate) {
      return false;
    }
    if (CardData.length > 0) {
      return CardData[CardData.length - 1].state !== 'Draft';
    }
    return true;
  };
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <div className="flex flex-col gap-3 w-full relative">
        <div className="flex flex-col  justify-center items-center   text-xs w-full  p-3  rounded-lg space-y-3  relative ">
          {isShare ? (
            <>
              {actionPlanData && actionPlanData?.length > 0 ? (
                <>
                  {actionPlanData[0]?.calendar?.length > 0 && (
                    <>
                      {isMobile ? (
                        <MobileCalendarComponent
                          data={actionPlanData[0]?.calendar}
                        ></MobileCalendarComponent>
                      ) : (
                        <>
                          <CalenderComponent
                            data={actionPlanData[0]?.calendar}
                            isTwoView={false}
                          />
                        </>
                      )}
                    </>
                  )}
                </>
              ) : (
                <div className=" h-[440px] flex justify-center items-center w-[242px]">
                  <div>
                    <img
                      src="/icons/EmptyState.svg"
                      alt=""
                      className="w-[219px]"
                    />
                    <h5 className="text-sm font-medium text-Text-Primary text-center -mt-10">
                      No Action Plan Generated Yet
                    </h5>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {CardData.length > 0 ? (
                <>
                  <div
                    id="actionList"
                    className="flex items-center h-[330px] w-full overflow-x-auto hidden-scrollbar gap-3  justify-start  p-4 mt-4  "
                  >
                    <>
                      {CardData.map((el, i) => (
                        <ActionPlanCard
                          isActive={activeAction.id == el.id}
                          onClick={() => {
                            // setCalender(el.calendar)
                            setActiveAction(el);
                          }}
                          onDelete={() => {
                            Application.deleteActionPlan({
                              member_id: id,
                              id: el.id,
                            }).catch(() => {});
                            // setTimeout(() => {
                            //   getActionPlan();
                            //   publish('syncReport', { part: 'treatmentPlan' });
                            // }, 3000);
                            const isDeletingActivePlan =
                              activeAction?.id === el.id;
                            setCardData((prevCardData) => {
                              const newCardData = prevCardData.filter(
                                (card) => card.id !== el.id,
                              );
                              // اگر پلن فعلی حذف شد و پلن قبلی وجود دارد، state آن را On Going کن
                              if (
                                isDeletingActivePlan &&
                                newCardData.length > 0
                              ) {
                                const lastCard =
                                  newCardData[newCardData.length - 1];
                                lastCard.state = 'On Going';
                                setActiveAction(lastCard);
                              } else if (newCardData.length > 0) {
                                setActiveAction(
                                  newCardData[newCardData.length - 1],
                                );
                              }
                              return newCardData;
                            });
                          }}
                          key={i}
                          el={el}
                          index={i + 1}
                        />
                      ))}
                      <div
                        onClick={() => {
                          if (canCreateNewActionPlan() && id) {
                            Application.checkClientRefresh(id).then((res) => {
                              if (res.data.need_of_refresh == true) {
                                publish('openRefreshModal', {});
                              } else {
                                navigate('/report/Generate-Action-Plan/' + id);
                              }
                            });
                          }
                        }}
                        className={` min-w-[218px] w-[218px]  min-h-[238px] h-[238px] bg-white  flex justify-center items-center rounded-[40px] border-2 border-dashed border-Primary-DeepTeal shadow-200 text-Primary-DeepTeal c ${!canCreateNewActionPlan() ? 'opacity-40 cursor-not-allowed' : 'cursor-default'}`}
                      >
                        <div className="flex flex-col  TextStyle-Subtitle-2 items-center justify-center ">
                          <img
                            className="size-[50px]"
                            src="/icons/add-blue.svg"
                            alt=""
                          />
                          Add New
                        </div>
                      </div>
                    </>
                  </div>
                  <div className="mt-2 w-full">
                    {activeAction != null &&
                    activeAction?.calendar?.length > 0 ? (
                      <>
                        {isMobile ? (
                          <MobileCalendarComponent
                            data={activeAction.calendar}
                          ></MobileCalendarComponent>
                        ) : (
                          <>
                            <ProgressCalenderView activeAction={activeAction} />
                            <CalenderComponent
                              data={activeAction.calendar}
                              overview={activeAction.overview}
                              isTwoView={true}
                            />
                          </>
                        )}
                      </>
                    ) : (
                      <div className="w-full hidden  flex-col items-center">
                        <img src="/icons/NoCalendar.svg" alt="" />
                        <div className="TextStyle-Headline-4 text-Text-Primary -mt-12">
                          No Calendar Generated Yet
                        </div>
                        <div className="TextStyle-Body-2 text-Text-Primary mt-2 mb-3">
                          Start creating your action plan
                        </div>
                        <ButtonSecondary
                          onClick={() => {
                            navigate(
                              `/action-plan/edit/${id}/${activeAction.id}`,
                            );
                          }}
                        >
                          <img src="/icons/tick.svg" alt="" />
                          Generate Day to Day Activity
                        </ButtonSecondary>
                      </div>
                    )}
                  </div>
                </>
              ) : isHolisticPlanEmpty ? (
                <>
                  <div className=" h-[440px] flex justify-center items-center w-full flex-col">
                    <img
                      src="/icons/EmptyState.svg"
                      alt=""
                      className="w-[219px]"
                    />
                    <h5 className="text-sm font-medium text-Text-Primary text-center -mt-10">
                      No action plan generated yet
                    </h5>
                    <div className="TextStyle-Body-2 text-Text-Primary text-center mt-2">
                      You need to generate a Holistic Plan before creating an
                      Action Plan.
                    </div>
                    <div className=" mt-6 flex w-full justify-center">
                      <ButtonSecondary ClassName="py-[6px] px-6" disabled>
                        <img src="/icons/tick.svg" alt="" />
                        Generate New
                      </ButtonSecondary>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="h-[440px] flex justify-center items-center w-[242px]">
                    <div>
                      <img
                        src="/icons/EmptyState.svg"
                        alt=""
                        className="w-[219px]"
                      />
                      <h5 className="text-sm font-medium text-Text-Primary text-center -mt-10">
                        No Action Plan Generated Yet
                      </h5>
                      <div className="TextStyle-Body-2 text-Text-Primary text-center mt-2">
                        Start creating your action plan
                      </div>
                      <div className="mt-6 flex w-full justify-center">
                        <ButtonSecondary
                          ClassName="py-[6px] px-6"
                          onClick={() => {
                            if (canCreateNewActionPlan() && id) {
                              Application.checkClientRefresh(id).then((res) => {
                                if (res.data.need_of_refresh == true) {
                                  publish('openRefreshModal', {});
                                } else {
                                  navigate(
                                    '/report/Generate-Action-Plan/' + id,
                                  );
                                }
                              });
                            }
                          }}
                        >
                          {disableGenerate ? (
                            <SpinnerLoader />
                          ) : (
                            <>
                              <img src="/icons/tick.svg" alt="" />
                              Generate New
                            </>
                          )}
                        </ButtonSecondary>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};
