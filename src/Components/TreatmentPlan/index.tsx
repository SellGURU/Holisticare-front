import { useState, useRef } from "react";
import useModalAutoClose from "../../hooks/UseModalAutoClose";
import treatmentPlanData from "../../api/--moch--/data/new/treatment_plan_report.json";
import TreatmentCard from "./TreatmentCard";
import { ButtonPrimary } from "../Button/ButtonPrimary";
import { SlideOutPanel } from "../SlideOutPanel";
type CardData = {
  id: number;
  date: string;
  status: string;
};

const cardData: CardData[] = [
  {
    id: 1,
    date: "2024/29/09",
    status: "Completed",
  },
  { id: 2, date: "2024/29/09", status: "Paused" },
  {
    id: 3,
    date: "2024/29/09",
    status: "Completed",
  },
  {
    id: 4,
    date: "2024/29/09",
    status: "On Going",
  },
  {
    id: 5,
    date: "2024/29/11",
    status: "Upcoming",
  },
];
export const TreatmentPlan = () => {
  const resolveStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "#55DD4A";
      case "On Going":
        return "#3C79D6";
      case "Paused":
        return "#E84040";
      case "Upcoming":
        return "#FFC123";
      default:
        return "#000000"; // Fallback color
    }
  };
  const [showModal, setshowModal] = useState(false);
  const showModalRefrence = useRef(null);
  const showModalButtonRefrence = useRef(null);
  useModalAutoClose({
    refrence: showModalRefrence,
    buttonRefrence: showModalButtonRefrence,
    close: () => {
      setshowModal(false);
    },
  });

  const [DeleteConfirm, setDeleteConfirm] = useState(false);
  const [aciveTreatmentPlan, setActiveTreatmentplan] = useState("Diet");
  const [TreatMentPlanData] = useState<any>(treatmentPlanData);
  const [isAnalysisOpen, setisAnalysisOpen] = useState(false);
  const [isClientGoalOpen, setisClientGoalOpen] = useState(false);

  return (
    <>
      <div className="my-10">
        <div className="w-full mb-3 flex items-center justify-between">
          <div
            id="Treatment Plan"
            className="TextStyle-Headline-4 text-Text-Primary"
          >
            Treatment Plan{" "}
          </div>
          <div className="dark:text-[#FFFFFF99] text-light-secandary-text text-[14px]">
            {/* Total of 30 Treatment in 4 category */}
          </div>
          {/* <div className="text-[#FFFFFF99] text-[12px]">Total of 65 exams in 11 groups</div> */}
        </div>
        <div className="flex items-center justify-center  p-4 ">
          {cardData.map((card, index: number) => (
            <div
              key={card.id}
              className={` ${card.status == "Upcoming" && "opacity-60"} ${
                index % 2 == 0 ? "mt-10 " : "mt-0"
              } relative flex flex-col  items-center -ml-10  `}
            >
              {index % 2 == 0 ? (
                <img
                  className="relative -bottom-[63px]"
                  src="/images/Group (1).svg"
                  alt=""
                />
              ) : (
                <img className="relative " src="/images/Group.svg" alt="" />
              )}

              <div
                className={`absolute  mt-2 flex items-center justify-center w-[113px] h-[113px] bg-white rounded-full shadow-md border-[2px] ${
                  card.status == "On Going"
                    ? "border-Primary-EmeraldGreen"
                    : "border-Gray-25"
                }`}
              >
                <div className=" flex w-full justify-center items-center flex-col gap-2">
                  <div className="flex w-full  justify-center ">
                    <div className="bg-[#DEF7EC] rounded-full w-[22px] h-[22px] flex items-center justify-center text-xs text-Text-Primary  ">
                      0{index + 1}
                    </div>
                    {card.status == "On Going" && (
                      <img
                        onClick={() => setshowModal(true)}
                        className="-mr-5 ml-3 cursor-pointer"
                        src="./icons/dots.svg"
                        alt=""
                      />
                    )}
                  </div>

                  <div className="rounded-full bg-Secondary-SelverGray px-2.5 py-[2px] flex items-center gap-1 text-[10px] text-Primary-DeepTeal">
                    <img src="./icons/calendar-2.svg" alt="" />
                    {card.date}
                  </div>
                  <div
                    // style={{ backgroundColor: resolveStatusColor() }}
                    className={`text-[10px] flex gap-1 items-center`}
                  >
                    <div
                      style={{
                        backgroundColor: resolveStatusColor(card.status),
                      }}
                      className={`w-2 h-2 rounded-full `}
                    ></div>
                    {card.status}
                  </div>
                </div>
                {showModal && (
                  <div
                    ref={showModalRefrence}
                    className="absolute top-12 -right-16 z-20 w-[96px] rounded-[16px] px-2 py-4 bg-white border border-Gray-50 shadow-200 flex flex-col gap-3"
                  >
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        //   if (!isDisabled) {
                        //     navigate(`/action-plan/edit/${id}`);
                        //   }
                      }}
                      className="flex items-center gap-1 TextStyle-Body-2 text-Text-Primary pb-1 border-b border-Secondary-SelverGray  cursor-pointer"
                    >
                      <img src="icons/edit-green.svg" alt="" />
                      Edit
                    </div>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        if (card.status == "On Going") {
                          setDeleteConfirm(true);
                        }
                      }}
                      className="flex items-center gap-1 TextStyle-Body-2 text-Text-Primary pb-1  cursor-pointer"
                    >
                      {DeleteConfirm ? (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          className="TextStyle-Body-2 text-Primary-EmeraldGreen w-full flex items-center justify-center"
                        >
                          Sure?{" "}
                        </div>
                      ) : (
                        <>
                          <img src="icons/delete-green.svg" alt="" />
                          Remove
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div
            className={`  relative mt-[95px] ml-2  flex flex-col items-center justify-center w-[113px] h-[113px] bg-white rounded-full shadow-md border-[2px] border-Primary-DeepTeal border-dashed cursor-pointer `}
          >
            <img className="w-6 h-6" src="/icons/add-blue.svg" alt="" />
            <div className="text-sm font-medium text-Primary-DeepTeal">
              Generate New
            </div>
          </div>
        </div>
        <div className="w-full flex justify-end gap-2 my-3">
          <ButtonPrimary onClick={() => setisAnalysisOpen(true)}>
            {" "}
            <img src="/icons/status-up.svg" alt="" /> Analysis
          </ButtonPrimary>
          <ButtonPrimary onClick={() => setisClientGoalOpen(true)}>
            {" "}
            <img src="/icons/chart.svg" alt="" /> Client Goals
          </ButtonPrimary>
        </div>
        <div className="w-full gap-2 flex justify-between items-center">
          <div
            onClick={() => {
              setActiveTreatmentplan("Diet");
            }}
            className={` flex justify-center bg-white cursor-pointer h-[48px] gap-2 shadow-100 border rounded-[16px] text-Primary-DeepTeal ${
              aciveTreatmentPlan == "Diet" ? " border-Primary-EmeraldGreen" : ""
            } w-full flex items-center px-4`}
          >
            <div className="w-6 h-6 bg-[#E5E5E5]  flex justify-center items-center rounded-[8px]">
              <img src="/icons/diet.svg" alt="" />
            </div>
            Diet
          </div>
          <div
            onClick={() => {
              setActiveTreatmentplan("Mind");
            }}
            className={` flex justify-center bg-white cursor-pointer h-[48px] gap-2 shadow-100 border rounded-[16px] text-Primary-DeepTeal ${
              aciveTreatmentPlan == "Mind" ? " border-Primary-EmeraldGreen" : ""
            } w-full flex items-center px-4`}
          >
            <div className="w-6 h-6 bg-[#E5E5E5]  flex justify-center items-center rounded-[8px]">
              <img src="/icons/mind.svg" alt="" />
            </div>
            Mind
          </div>
          <div
            onClick={() => {
              setActiveTreatmentplan("Activity");
            }}
            className={` flex justify-center bg-white cursor-pointer h-[48px] gap-2 shadow-100 border rounded-[16px] text-Primary-DeepTeal ${
              aciveTreatmentPlan == "Activity"
                ? " border-Primary-EmeraldGreen"
                : ""
            } w-full flex items-center px-4`}
          >
            <div className="w-6 h-6 bg-[#E5E5E5]  flex justify-center items-center rounded-[8px]">
              <img src="/icons/weight.svg" alt="" />
            </div>
            Activity
          </div>
          <div
            onClick={() => {
              setActiveTreatmentplan("Supplement");
            }}
            className={` flex justify-center bg-white  cursor-pointer h-[48px] gap-2 shadow-100 border rounded-[16px] text-Primary-DeepTeal ${
              aciveTreatmentPlan == "Supplement"
                ? " border-Primary-EmeraldGreen"
                : ""
            } w-full flex items-center px-4`}
          >
            <div className="w-6 h-6 bg-[#E5E5E5]  flex justify-center items-center rounded-[8px]">
              <img src="/icons/Supplement.svg" alt="" />
            </div>
            Supplement
          </div>
        </div>
        {TreatMentPlanData.length > 0 && (
          <div className="w-full flex flex-wrap gap-6 bg-white p-4 rounded-[16px] border border-Gray-50 shadow-100 mt-4">
            {TreatMentPlanData?.filter(
              (value: any) => value.category == aciveTreatmentPlan
            )[0].data.map((el: any) => {
              return <TreatmentCard data={el}></TreatmentCard>;
            })}
          </div>
        )}
      </div>
      <SlideOutPanel
        isOpen={isAnalysisOpen}
        onClose={() => setisAnalysisOpen(false)}
        headline="Analysis"
      >
        Analysis
      </SlideOutPanel>
      <SlideOutPanel
        isOpen={isClientGoalOpen}
        onClose={() => setisClientGoalOpen(false)}
        headline="Client Goal"
      >Client Goal</SlideOutPanel>
    </>
  );
};
