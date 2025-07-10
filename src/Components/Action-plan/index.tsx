/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CalenderComponent from '../CalendarComponent/CalendarComponent';
import { ActionPlanCard } from './ActionPlanCard';
// import CalendarData from "../../api/--moch--/data/new/Calender.json";
import Application from '../../api/app';
import { ButtonSecondary } from '../Button/ButtosSecondary';
import MobileCalendarComponent from '../CalendarComponent/MobileCalendarComponent';
import ProgressCalenderView from './ProgressCalendarView';

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
}

export const ActionPlan: React.FC<ActionPlanProps> = ({
  setActionPrintData,
  isShare,
  calenderDataUper,
  isHolisticPlanEmpty,
  setCalendarPrintData,
}) => {
  const { id } = useParams<{ id: string }>();
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
  useEffect(() => {
    if (!isShare) {
      Application.ActionPlanBlockList({ member_id: id }).then((res) => {
        console.log(res.data);
        setCardData(res.data);
        setActionPrintData(res.data);
        setActiveAction(
          res.data.length > 0 ? res.data[res.data.length - 1] : null,
        );
        
        setCalendarPrintData(res.data[0].overview);
        setActiveAction(
          res.data.length > 0 ? res.data[res.data.length - 1] : null,
        );
        setTimeout(() => {
          const container: any = document.getElementById('actionList');
          if (container) {
            container.scrollLeft = container.scrollWidth; // Set scroll to the very end
          }
        }, 500);
      });
    }
  }, []);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <div className="flex flex-col gap-3 w-full">
        <div className="flex flex-col  justify-center items-center   text-xs w-full  p-3  rounded-lg space-y-3  relative ">
          {isShare ? (
            <>
              {calenderDataUper && (
                <>
                  {' '}
                  {calenderDataUper?.calendar?.length > 0 && (
                    <CalenderComponent
                      data={calenderDataUper?.calendar}
                      isTwoView={false}
                      isActionPlan={true}
                    />
                  )}
                </>
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
                          onDelete={(id: number) => {
                            Application.deleteActionCard({ id: el.id });
                            setCardData(
                              CardData.filter((card) => card.id !== id),
                            );
                            setActiveAction(CardData[0]);
                          }}
                          key={i}
                          el={el}
                          index={i + 1}
                        />
                      ))}
                      <div
                        onClick={() => {
                          navigate('/report/Generate-Action-Plan/' + id);
                        }}
                        className=" min-w-[218px] w-[218px]  min-h-[238px] h-[238px] bg-white  flex justify-center items-center rounded-[40px] border-2 border-dashed border-Primary-DeepTeal shadow-200 text-Primary-DeepTeal cursor-pointer"
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
                    <img src="/icons/EmptyState.svg" alt="" />
                    <h5 className=" TextStyle-Headline-4 text-Text-Primary text-center -mt-10">
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
                  <div className=" h-[440px] flex justify-center items-center w-[242px]">
                    <div>
                      <img src="/icons/EmptyState.svg" alt="" />
                      <h5 className=" TextStyle-Headline-4 text-Text-Primary text-center -mt-10">
                        No Action Plan Generated Yet
                      </h5>
                      <div className="TextStyle-Body-2 text-Text-Primary text-center mt-2">
                        Start creating your action plan
                      </div>
                      <div className=" mt-6 flex w-full justify-center">
                        <ButtonSecondary
                          ClassName="py-[6px] px-6"
                          onClick={() => {
                            navigate('/report/Generate-Action-Plan/' + id);
                          }}
                        >
                          <img src="/icons/tick.svg" alt="" />
                          Generate New
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
