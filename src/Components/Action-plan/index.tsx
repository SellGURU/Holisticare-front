import { useState } from "react";
import { ButtonPrimary } from "../Button/ButtonPrimary";
import { ActionPlanCard } from "./ActionPlanCard";
import { useNavigate, useParams } from "react-router-dom";
import CalenderComponent from "../CalendarComponent/CalendarComponent";
import CalendarData from "../../api/--moch--/data/new/Calender.json";

type CardData = {
  cardID: number;
  status: "Completed" | "On Going" | "Paused" | "Upcoming";
  title: string;
  subtitle: string;
  progress: number;
  time: string;
};
export const ActionPlan = () => {
  const { id } = useParams<{ id: string }>();
  const [calendarData] = useState(CalendarData);

  // const [isGenerated, setisGenerated] = useState(false);
  const [CardData, setCardData] = useState<Array<CardData>>([
    {
      cardID: 1,
      status: "Completed",
      title: "Muscle Strengthening",
      subtitle: "Something short and simple here",
      progress: 100,
      time: "Done",
    },
    {
      cardID: 2,
      status: "On Going",
      title: "Stress Reduction",
      subtitle: "Something short and simple here",
      progress: 85,
      time: "1 Week left",
    },
    {
      cardID: 3,
      status: "Paused",
      title: "Stress Reduction",
      subtitle: "Something short and simple here",
      progress: 25,
      time: "Waiting",
    },
    {
      cardID: 4,
      status: "Upcoming",
      title: "Stress Reduction",
      subtitle: "Something short and simple here",
      progress: 0,
      time: "Waiting",
    },
  ]);
  // const [showTargeting, setshowTargeting] = useState(false)
  const navigate = useNavigate();
  const [isCalenDarGenerated,] = useState(true);
  return (
    <>
      <div className="flex flex-col gap-3 w-full">
        <div className="flex flex-col  justify-center   text-xs w-full  p-3  rounded-lg space-y-3  relative ">
          {CardData.length > 0 ? (
            <>
              <img
                onClick={() => navigate(`/action-plan/edit/${id}`)}
                className="absolute top-4 right-4 cursor-pointer"
                src="./Themes/Aurora/icons/setting-2.svg"
                alt=""
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 ">
                {CardData.map((el, i) => (
                  <ActionPlanCard
                    onDelete={(cardID: number) => {
                      setCardData(
                        CardData.filter((card) => card.cardID !== cardID)
                      );
                    }}
                    key={i}
                    el={el}
                    index={i + 1}
                  />
                ))}
                <div
                  onClick={() => {
                    navigate(`/generateActionPlan/${id}`);
                  }}
                  className="  w-[218px] h-[258px] bg-white  flex justify-center items-center rounded-[40px] border-2 border-dashed border-Primary-DeepTeal shadow-200 text-Primary-DeepTeal cursor-pointer"
                >
                  <div className="flex flex-col  TextStyle-Subtitle-2 ">
                    <img className="" src="/icons/add-blue.svg" alt="" />
                    Add New
                  </div>
                </div>
              </div>
              <div className="mt-5">
                {isCalenDarGenerated ? (
                 <CalenderComponent data={calendarData}></CalenderComponent>
                ) : (
                  <div className="w-full flex flex-col items-center">
                    <img src="/icons/NoCalendar.svg" alt="" />
                    <div className="TextStyle-Headline-4 text-Text-Primary -mt-12">
                      No Calendar Generated Yet
                    </div>
                    <div className="TextStyle-Body-2 text-Text-Primary mt-2 mb-3">Start creating your action plan</div>
                    <ButtonPrimary>
                      <img src="/icons/tick.svg" alt="" />
                      Generate Day to Day Activity
                    </ButtonPrimary>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className=" h-[255px] w-[242px]">
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
                      navigate("/generateActionPlan/123");
                    }}
                  >
                    <img src="/icons/tick.svg" alt="" />
                    Generate New
                  </ButtonPrimary>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};
