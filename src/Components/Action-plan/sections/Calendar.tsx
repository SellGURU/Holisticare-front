import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GenerateCalendar from "./generatecalendar";
import { ButtonPrimary } from "../../Button/ButtonPrimary";
// import CalenderComponent from "../../calender/ComponentCalender";
// import CalendarData from "@/api/--moch--/data/new/Calender.json";
type CardData = {
  title: string;
  subtitle: string;
  progress: number;
};

export const Calendar = () => {
  const [cards] = useState<CardData[]>([
    {
      title: "Muscle Strengthening",
      subtitle: "Something short and simple here",
      progress: 15,
    },
    {
      title: "Muscle Strengthening",
      subtitle: "Something short and simple here",
      progress: 22,
    },
    {
      title: "Muscle Strengthening",
      subtitle: "Something short and simple here",
      progress: 66,
    },
    {
      title: "Muscle Strengthening",
      subtitle: "Something short and simple here",
      progress: 100,
    },
    {
      title: "Muscle Strengthening",
      subtitle: "Something short and simple here",
      progress: 88,
    },
  ]);
  //     const [calendarData, setCalendarData] = useState({
  //     Monday: ["Activity 1", "Activity 2"],
  //     Tuesday: ["Activity 3"],
  //     Wednesday: ["Activity 4", "Activity 5"],
  //     Thursday: [],
  //     Friday: ["Activity 6"],
  //     Saturday: ["Activity 7", "Activity 8"],
  //     Sunday: ["Activity 9"],
  //   });
  const navigate = useNavigate();
  const [isGenerated, ] = useState(false);
  const [generateMode, setgenerateMode] = useState(false);
  // const [calendarData] = useState(CalendarData);
  const [ActiveCard, setActiveCard] = useState(2);
  return (
    <>
      {generateMode ? (
        <GenerateCalendar
        // onBack={()=>{
        //   setgenerateMode(false)
        // }}
        //   onSave={() => {
        //     setisGenerated(true);
        //     setgenerateMode(false);
        //   }}
        ></GenerateCalendar>
      ) : (
        <div className=" px-4 lg:px-8 w-full h-full">
          <div className="mb-2">
            <div className="w-[60px]">
              <div
                onClick={() => {
                  navigate(-1);
                }}
                className={`Aurora-tab-icon-container cursor-pointer h-[40px]`}
              >
                <img src="./Themes/Aurora/icons/arrow-left.svg" alt="Back" />
              </div>
            </div>
          </div>
          <div className=" bg-light-min-color dark:bg-black-primary border border-light-border-color dark:border-main-border rounded-2xl w-full h-full max-h-[560px] px-5 pt-6 pb-8  ">
            <div className="text-sm font-medium text-light-primary-text dark:text-primary-text">
              Action Plan Calendar
            </div>
            <div
              className={`mt-4 bg-gray-200 dark:bg-black-third border border-light-border-color dark:border-main-border rounded-md w-full h-full max-h-[480px] px-5 pt-4 flex flex-col gap-5 overflow-y-scroll lg:overflow-y-hidden overflow-x-hidden`}
            >
              <div className="w-full flex overflow-x-scroll lg:overflow-x-hidden overflow-y-hidden lg:min-h-[120px]  gap-2">
                {cards.map((card, index) => (
                  <div
                    onClick={() => setActiveCard(index)}
                    key={index}
                    className={`bg-gray-100 dark:bg-black-secondary rounded-xl  lg:pb-6 px-3 pt-2 pb-4 min-w-[150px] w-[242px] h-fit  lg:h-[119px] border border-light-border-color dark:border-main-border cursor-pointer ${
                      ActiveCard == index ? "opacity-100" : "opacity-30"
                    }`}
                  >
                    <h5 className=" text-xs lg:text-sm font-bold text-light-primary-text dark:text-primary-text text-center">
                      {card.title}
                    </h5>
                    <h6 className=" text-[10px] lg:text-xs font-normal text-light-secandary-text dark:text-secondary-text text-center mt-3">
                      {card.subtitle}
                    </h6>
                    <div className="mt-4 flex flex-col gap-1">
                      <div className="flex w-full justify-between text-[8px] lg:text-[10px] text-light-primary-text dark:text-primary-text">
                        Progress
                        <div className=" text-[8px] lg:text-[10px] text-light-primary-text dark:text-primary-text  text-right">
                          {card.progress}%
                        </div>
                      </div>
                      <div className="h-2 bg-gray-300 dark:bg-third-text bg-opacity-[38%] rounded-full w-full">
                        <div
                          className="h-full bg-brand-secondary-color rounded-full"
                          style={{ width: `${card.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {isGenerated ? (
                null
                // <CalenderComponent data={calendarData}></CalenderComponent>

              ) : (
                <div className=" h-[60%] flex flex-col  flex-grow items-center justify-center">
                  <img className="" src="./images/ActionPlan/NoDocuments.svg" alt="" />
                  <div className="text-sm font-medium text-light-primary-text dark:text-primary-text">
                    No Calendar Generated Yet
                  </div>
                  <div className="mt-3 w-[150px]">
                    <ButtonPrimary
                      onClick={() => setgenerateMode(true)}
                     
                    >
                      Generate Calendar
                    </ButtonPrimary>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
