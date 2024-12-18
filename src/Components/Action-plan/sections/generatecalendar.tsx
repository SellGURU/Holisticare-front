import React, { useState, useEffect } from "react";
// import AnalyseButton from "@/components/AnalyseButton";
// import { Button } from "symphony-ui";
import { ButtonPrimary } from "../../Button/ButtonPrimary";
// import MiniAnallyseButton from "../../TreatmentPlan-V2/MiniAnalyseButon";
// import RefrenceModal from "../../TreatmentPlan-V2/RefrenceData";
// type Activity = {
//   description: string;
//   days: string[];
// };

// type Category = {
//   name: string;
//   activities: Activity[];
// };

// const initialData: Category[] = [
//   {
//     name: "Diet",
//     activities: [
//       {
//         description: "Osteoporosis: 5x/week 45 mg Instructions: Supper",
//         days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
//       },
//       {
//         description:
//           "Vitamin C: 5x/week Instructions: Take one daily with food",
//         days: ["Sat", "Sun"],
//       },
//     ],
//   },
//   {
//     name: "Diet",
//     activities: [
//       {
//         description: "Osteoporosis: 5x/week 45 mg Instructions: Supper",
//         days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
//       },
//       {
//         description:
//           "Vitamin C: 5x/week Instructions: Take one daily with food",
//         days: ["Sat", "Sun"],
//       },
//     ],
//   },
//   // Additional categories...
// ];

// const ActivityItem: React.FC<{ activity: Activity }> = ({ activity }) => (
//   <div className="flex items-center justify-between px-4 py-3 bg-black-primary border border-main-border  rounded-md mb-2">
//     <ul className="px-4">
//       <li className="list-disc text-sm text-primary-text">
//         {activity.description}
//       </li>
//     </ul>

//     <div className="flex space-x-1">
//       {activity.days.map((day, index) => (
//         <span className=" list-disc text-xs text-secondary-text" key={index}>
//           {day}
//         </span>
//       ))}
//     </div>
//   </div>
// );

// const CategorySection: React.FC<{ category: Category }> = ({ category }) => (
//   <div className="bg-black-secondary p-4 rounded-md border border-main-border flex justify-between gap-6 items-start">
//     <div className="flex flex-col items-center gap-1 text-[10px] font-medium text-primary-text">
//       <div className="bg-black-fourth w-8 h-8 flex items-center justify-center rounded-lg">
//         <img src="./Themes/Aurora/icons/apple.svg" alt="" />
//       </div>
//       {category.name}
//     </div>
//     <div className="flex flex-col gap-2">
//       {category.activities.map((activity, index) => (
//         <ActivityItem key={index} activity={activity} />
//       ))}
//     </div>
//     <div className="w-[32px] relative  h-[32px]">
//           <MiniAnallyseButton></MiniAnallyseButton>
//         </div>
//   </div>
// );

/* eslint-disable @typescript-eslint/no-explicit-any */
interface BioMarkerRowSuggestionsProps {
  value: any;
}
const BioMarkerRowSuggestions: React.FC<BioMarkerRowSuggestionsProps> = ({
  value,
}) => {
  const resolveIcon = () => {
    if (value.pillar_name == "Diet") {
      return "./images/report/treatment/apple.svg";
    }
    if (value.pillar_name == "Mind") {
      return "./images/report/treatment/mental-disorder.svg";
    }
    if (value.pillar_name == "Exercise") {
      return "./images/report/treatment/weight.svg";
    }
    if (value.pillar_name == "Supplement") {
      return "./images/report/treatment/pil.svg";
    }
  };
  // const [showModal, setshowModal] = useState(false);
  const [editableValue, setEditableValue] = useState(value.note);
  const [selectedDays, setSelectedDays] = useState<string[]>(value.days || []);

  const toggleDaySelection = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };
  useEffect(() => {
    value.days = selectedDays;
    console.log(value.days);
  }, [selectedDays, value]);
  return (
    <>
      <div className="w-full bg-light-min-color dark:bg-black-secondary border border-light-border-color dark:border-main-border h-full rounded-md px-6 p-3 lg:p-6">
        <div className="w-full flex justify-center items-start gap-2 lg:gap-4">
          <div className="w-[60px]">
            <div className="w-full flex justify-center">
              <div className="w-[32px] flex justify-center items-center h-[32px] bg-gray-300 dark:bg-[#333333] rounded-[8px]">
                <img className="w-[24px]" src={resolveIcon()} alt="" />
              </div>
            </div>
            <div className="text-light-primary-text dark:text-[#FFFFFFDE] mt-1 text-[10px] font-[500] text-center">
              {value.pillar_name}
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-[#1E1E1E] px-1 lg:px-4 py-2 flex justify-start text-light-primary-text dark:text-[#FFFFFFDE] items-center border border-light-border-color dark:border-[#383838] rounded-[6px]">
            <div className="text-[12px] gap-2 w-full">
              <textarea
                value={editableValue}
                onChange={(e) => setEditableValue(e.target.value)}
                className="bg-transparent text-[12px] outline-none w-full resize-none decorated-dot "
                rows={2}
              />
              {value.reference && (
                <div className="text-light-secandary-text dark:text-secondary-text text-xs inline-flex gap-1 ">
                  Based on your:
                  <span
                    // onClick={() => setshowModal(true)}
                    className="dark:text-brand-primary-color text-light-blue-active flex items-center gap-2 cursor-pointer"
                  >
                    {value["Based on your:"]}
                    <img src="./Themes/Aurora/icons/export.svg" alt="" />
                  </span>
                </div>
              )}
              <div className=" w-[200px] lg:w-[244px] h-[32px] border border-light-border-color dark:border-main-border rounded-[4px] text-xs text-light-secandary-text dark:text-white/35 inline-flex lg:ml-4">
                {["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"].map(
                  (day) => (
                    <div
                      key={day}
                      onClick={() => toggleDaySelection(day)}
                      className={`w-full cursor-pointer border-r border-light-border-color dark:border-main-border flex items-center justify-center ${
                        selectedDays.includes(day)
                          ? "dark:bg-black-secondary bg-gray-300 text-brand-secondary-color"
                          : "dark:bg-black-primary bg-gray-200"
                      }`}
                    >
                      {day}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
          <div className=" hidden lg:flex flex-col gap-2">
            {/* <div className="w-[32px] relative h-[32px]">
            <MiniAnallyseButton />
          </div> */}
            <div className="w-8 h-[112px] flex flex-col justify-between items-center rounded-md border  border-brand-primary-color py-3">
              <img
                className="w-4 h-4 invert dark:invert-0"
                src="./Themes/Aurora/icons/Ai generated.svg"
                alt=""
              />
              <img
                className="w-4 h-4"
                src="./Themes/Aurora/icons/message-text.svg"
                alt=""
              />
              <div className="h-px w-6 bg-brand-primary-color mx-auto"></div>
              <img
                className="w-4 h-4"
                src="./Themes/Aurora/icons/tick-circle.svg"
                alt=""
              />
            </div>
          </div>
        </div>
      </div>
      {/* {showModal && <RefrenceModal
          reference={value.reference}
          isOpen={showModal}
          onClose={() => setshowModal(false)}
        />} */}
    </>
  );
};

import Data from "../calandar.json";
import { useNavigate } from "react-router-dom";
interface GenerateCalendarProps {
  onSave?: () => void;
  onBack?: () => void;
  isDriftAnalysis?: boolean;
}
const GenerateCalendar: React.FC<GenerateCalendarProps> = ({
  onSave,
  onBack,
  isDriftAnalysis,
}) => {
  //   const [categories] = useState<Category[]>(initialData);
  const [data] = useState(Data.suggestions);
  const navigate = useNavigate();
  return (
    <div className="w-full h-full px-3 lg:px-6">
      <div className="mb-2">
        <div className="w-[60px]">
          <div
            onClick={() => {
              if (onBack) {
                onBack();
              } else {
                navigate(-1);
              }
            }}
            className={`Aurora-tab-icon-container cursor-pointer h-[40px]`}
          >
            <img src="./Themes/Aurora/icons/arrow-left.svg" alt="Back" />
          </div>
        </div>
      </div>
      <div className=" bg-light-min-color dark:bg-black-primary w-full rounded-2xl border border-light-border-color dark:border-main-border p-3  lg:p-6">
        <div className=" bg-gray-200 dark:bg-black-secondary border border-light-border-color dark:border-main-border rounded-md w-full  mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm font-medium text-light-primary-text dark:text-primary-text">
              {isDriftAnalysis ? "Action Edit" : " Action Plan Calendar"}
            </div>
            {/* <AnalyseButton text="Generate by AI" /> */}
          </div>
          <div className="flex flex-col gap-3 max-h-[360px] overflow-y-scroll pr-3">
            {data.map((category: any, index: number) => (
              // <CategorySection key={index} category={category} />
              <BioMarkerRowSuggestions key={index} value={category} />
            ))}
          </div>
        </div>
        <div className="w-[120px] mx-auto mt-4">
          <ButtonPrimary
            onClick={() => {
              if (typeof onSave === "function") {
                onSave();
              } else {
                console.error("onSave is not a function");
              }
            }}
            style={{ textWrap: "nowrap" }}
          >
            Save Calendar
          </ButtonPrimary>
        </div>
      </div>
    </div>
  );
};

export default GenerateCalendar;
