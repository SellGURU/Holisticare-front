import { useState, useRef } from "react";
import useModalAutoClose from "../../hooks/UseModalAutoClose";
import treatmentPlanData from "../../api/--moch--/data/new/treatment_plan_report.json";
import TreatmentCard from "./TreatmentCard";
import { ButtonPrimary } from "../Button/ButtonPrimary";
import { SlideOutPanel } from "../SlideOutPanel";
import { useNavigate , useParams} from "react-router-dom";
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
  const [showModalIndex, setShowModalIndex] = useState<number | null>(null);
  const showModalRefrence = useRef(null);
  const showModalButtonRefrence = useRef(null);
  useModalAutoClose({
    refrence: showModalRefrence,
    buttonRefrence: showModalButtonRefrence,
    close: () => {
      setShowModalIndex(null);
    },
  });
  const [cardData, setCardData] = useState<CardData[]>(initialCardData);

  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(
    null
  );
  const [aciveTreatmentPlan, setActiveTreatmentplan] = useState("Diet");
  const [TreatMentPlanData] = useState<any>(treatmentPlanData);
  const [isAnalysisOpen, setisAnalysisOpen] = useState(false);
  const [isClientGoalOpen, setisClientGoalOpen] = useState(false);
  const handleDeleteCard = (index: number) => {
    setCardData((prevCardData) => prevCardData.filter((_, i) => i !== index));
    setShowModalIndex(null);
    setDeleteConfirmIndex(null);
  };
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>();

  return (
    <>
      {cardData.length < 1 ? (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <img src="/icons/EmptyState.svg" alt="" />
          <div className="text-base font-medium text-Text-Primary -mt-9">
            No Treatment Plan Generated Yet
          </div>
          <div className="text-xs text-Text-Primary mt-2 mb-5">
            Start creating your treatment plan
          </div>
          <ButtonPrimary             onClick={()=>navigate(`/generateNewTreatmentPlan/${id}`)}
>
            <img src="/icons/tick-square.svg" alt="" /> Generate New
          </ButtonPrimary>
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
          <div className="flex items-center justify-center  p-4 -mt-12 ">
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
                          onClick={() => setShowModalIndex(index)}
                          className="-mr-5 ml-3 cursor-pointer"
                          src="/icons/dots.svg"
                          alt=""
                        />
                      )}
                    </div>

                    <div className="rounded-full bg-Secondary-SelverGray px-2.5 py-[2px] flex items-center gap-1 text-[10px] text-Primary-DeepTeal">
                      <img src="/icons/calendar-2.svg" alt="" />
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
                  {showModalIndex === index && (
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
                        <img src="/icons/edit-green.svg" alt="" />
                        Edit
                      </div>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          if (card.status == "On Going") {
                            setDeleteConfirmIndex(index);
                          }
                        }}
                        className="flex items-center gap-1 TextStyle-Body-2 text-Text-Primary pb-1  cursor-pointer"
                      >
                        {deleteConfirmIndex === index ? (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCard(index);
                            }}
                            className="TextStyle-Body-2 text-Primary-EmeraldGreen w-full flex items-center justify-center"
                          >
                            Sure?{" "}
                          </div>
                        ) : (
                          <>
                            <img src="/icons/delete-green.svg" alt="" />
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
            onClick={()=>navigate(`/generateNewTreatmentPlan/${id}`)}
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
                aciveTreatmentPlan == "Diet"
                  ? " border-Primary-EmeraldGreen"
                  : ""
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
                aciveTreatmentPlan == "Mind"
                  ? " border-Primary-EmeraldGreen"
                  : ""
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
            <div className="w-full flex flex-wrap gap-6 bg-white p-4 p- rounded-[16px] border border-Gray-50 shadow-100 mt-4">
              {TreatMentPlanData?.filter(
                (value: any) => value.category == aciveTreatmentPlan
              )[0].data.map((el: any) => {
                return <TreatmentCard data={el}></TreatmentCard>;
              })}
            </div>
          )}
        </div>
      )}

      <SlideOutPanel
        isOpen={isAnalysisOpen}
        onClose={() => setisAnalysisOpen(false)}
        headline="Analysis"
      >
        <>
          <div className="rounded-xl border border-Gray-50">
            <div className="bg-[#005F731A] w-full pl-4 py-2 text-xs text-Text-Secondary font-medium">
              Client Condition Insight
            </div>
            <div className="bg-backgroundColor-Card text-xs text-Text-Primary text-justify px-4 py-2">
              This patient has high blood pressure and experiences frequent
              headaches, fatigue, and difficulty sleeping. Her condition is
              further complicated by chronic stress from her demanding job and
              poor dietary habits, which include consuming excessive amounts of
              salty and processed foods. Despite being aware of the risks,
              Leslie often feels too exhausted to exercise regularly, leading to
              weight gain over the past year. She also reports feelings of
              anxiety, especially in the evenings, which she believes
              contributes to her restless nights. Her doctor has advised her to
              make significant lifestyle changes, including stress management
              techniques, a healthier diet, and incorporating daily physical
              activity, but she finds it challenging to stay consistent. As a
              result, her blood pressure remains uncontrolled, putting her at
              risk for further cardiovascular complications.
            </div>
          </div>
          <div className="rounded-xl border border-Gray-50">
            <div className="bg-[#005F731A] w-full pl-4 py-2 text-xs text-Text-Secondary font-medium">
              Needs Focus Benchmarks
            </div>
            <ul className="bg-backgroundColor-Card text-xs text-Text-Primary text-justify px-9 py-2 flex flex-col gap-2">
              <li className="list-disc">Time Priorities</li>
              <li className="list-disc">Recovery</li>
              <li className="list-disc">Metabolic Function</li>
              <li className="list-disc">Nutrition</li>
            </ul>
          </div>
        </>
      </SlideOutPanel>
      <SlideOutPanel
        isOpen={isClientGoalOpen}
        onClose={() => setisClientGoalOpen(false)}
        headline="Client Goal"
      >
        <div className="border border-Gray-50 rounded-xl">
          <div className=" ">
            <div className="bg-[#005F731A] w-full pl-4 py-2 text-xs text-Text-Secondary font-medium">
              What you want to be able to do?
            </div>
            <div className="bg-backgroundColor-Card text-xs text-Text-Primary text-justify px-4 py-2">
              I liked to run but too unfit to do that now. I want a realistic
              entry into getting fitter where I build up the intensity to match
              my capability. I don’t enjoy squats as they make my legs hurt but
              recognise I may need to do them.
            </div>
          </div>
          <div className=" border border-Gray-50">
            <div className="bg-[#005F731A] w-full pl-4 py-2 text-xs text-Text-Secondary font-medium">
              How you want to look?
            </div>
            <div className="bg-backgroundColor-Card text-xs text-Text-Primary text-justify px-4 py-2">
              Lose the 18kg of weight I have put on since 2019 and get to a
              target weight of 82kg
            </div>
          </div>
          <div className=" border border-Gray-50">
            <div className="bg-[#005F731A] w-full pl-4 py-2 text-xs text-Text-Secondary font-medium">
              How you want to feel?
            </div>
            <div className="bg-backgroundColor-Card text-xs text-Text-Primary text-justify px-4 py-2">
              Have more energy and know my health is improving
            </div>
          </div>
        </div>
      </SlideOutPanel>
    </>
  );
};
