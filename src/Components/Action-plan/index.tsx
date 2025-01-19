/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { ButtonPrimary } from '../Button/ButtonPrimary';
import { ActionPlanCard } from './ActionPlanCard';
import { useNavigate, useParams } from 'react-router-dom';
import CalenderComponent from '../CalendarComponent/CalendarComponent';
// import CalendarData from "../../api/--moch--/data/new/Calender.json";
import Application from '../../api/app';

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
}

export const ActionPlan: React.FC<ActionPlanProps> = () => {
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
  useEffect(() => {
    console.log(activeAction);
  });
  // const [isCalenDarGenerated,setISCalenderGenerated] = useState(false);
  useEffect(() => {
    Application.ActionPlanBlockList({ member_id: id }).then((res) => {
      setCardData(res.data);
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
  }, []);
  return (
    <>
      <div className="flex flex-col gap-3 w-full">
        <div className="flex flex-col  justify-center items-center   text-xs w-full  p-3  rounded-lg space-y-3  relative ">
          {CardData.length > 0 ? (
            <>
              <div
                id="actionList"
                className="flex items-center h-[330px] w-full overflow-x-auto hidden-scrollbar gap-3  justify-start  p-4 mt-4  "
              >
                {CardData.map((el, i) => (
                  <ActionPlanCard
                    isActive={activeAction.id == el.id}
                    onClick={() => {
                      // setCalender(el.calendar)
                      setActiveAction(el);
                    }}
                    onDelete={(id: number) => {
                      Application.deleteActionCard({ id: el.id });
                      setCardData(CardData.filter((card) => card.id !== id));
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
                  className=" min-w-[218px] w-[218px] min-h-[258px] h-[258px] bg-white  flex justify-center items-center rounded-[40px] border-2 border-dashed border-Primary-DeepTeal shadow-200 text-Primary-DeepTeal cursor-pointer"
                >
                  <div className="flex flex-col  TextStyle-Subtitle-2 ">
                    <img className="" src="/icons/add-blue.svg" alt="" />
                    Add New
                  </div>
                </div>
              </div>
              <div className="mt-2">
                {activeAction != null && activeAction?.calendar?.length > 0 ? (
                  <>
                    <CalenderComponent
                      data={activeAction.calendar}
                    ></CalenderComponent>
                  </>
                ) : (
                  <div className="w-full flex flex-col items-center">
                    <img src="/icons/NoCalendar.svg" alt="" />
                    <div className="TextStyle-Headline-4 text-Text-Primary -mt-12">
                      No Calendar Generated Yet
                    </div>
                    <div className="TextStyle-Body-2 text-Text-Primary mt-2 mb-3">
                      Start creating your action plan
                    </div>
                    <ButtonPrimary
                      onClick={() => {
                        navigate(`/action-plan/edit/${id}/${activeAction.id}`);
                      }}
                    >
                      <img src="/icons/tick.svg" alt="" />
                      Generate Day to Day Activity
                    </ButtonPrimary>
                  </div>
                )}
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
                    <ButtonPrimary
                      ClassName="py-[6px] px-6"
                      onClick={() => {
                        navigate('/report/Generate-Action-Plan/' + id);
                      }}
                    >
                      <img src="/icons/tick.svg" alt="" />
                      Generate New
                    </ButtonPrimary>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};
