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
  category:string
  changeData:(value:any) => void
}
const BioMarkerRowSuggestions: React.FC<BioMarkerRowSuggestionsProps> = ({
  value,
  category,
  changeData,
}) => {
  const resolveIcon = () => {
    if (category == "Diet") {
      return "/icons/diet.svg";
    }
    if (category == "Mind") {
      return "/icons/mind.svg";
    }
    if (category == "Activity") {
      return "/icons/weight.svg";
    }
    if (category== "Supplement") {
      return "/icons/Supplement.svg";
    }
  };

  // const [showModal, setshowModal] = useState(false);
  const [editableValue, setEditableValue] = useState(value.instructions);
  const [selectedDays, setSelectedDays] = useState<string[]>(value.repeat_days || []);

  const toggleDaySelection = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };
  useEffect(() => {
    value.days = selectedDays;
  }, [selectedDays, value]);
  useEffect(() => {
    changeData({
      ...value,
      instructions:editableValue,
      repeat_days:[...selectedDays]
    })
  },[editableValue,selectedDays])
  return (
    <>
      <div className="w-full bg-white border border-Gray-50 shadow-100  h-full rounded-[24px] px-6 p-3 lg:p-6">
        <div className="w-full flex justify-center items-start gap-2 lg:gap-4">
          <div className="w-[60px]">
            <div className="w-full flex justify-center">
              <div className="w-[32px] flex justify-center items-center h-[32px] bg-backgroundColor-Card  rounded-[8px]">
                <img className="w-[24px]" src={resolveIcon()} alt="" />
              </div>
            </div>
            <div className="text-Primary-DeepTeal mt-1 text-[10px] font-[500] text-center">
              {category}
            </div>
          </div>
          <div className="w-full bg-backgroundColor-Card px-1 lg:px-4 py-2 flex justify-start text-Text-Primary items-center border border-Gray-50 rounded-[16px]">
            <div className="text-[12px] gap-2 w-full">
              <textarea
                value={editableValue}
                onChange={(e) => setEditableValue(e.target.value)}
                className="bg-transparent text-[12px] outline-none w-full resize-none decorated-dot "
                rows={2}
              />
              {value.reference && (
                <div className="text-Text-Secondarytext-xs inline-flex gap-1 ">
                  Based on your:
                  <span
                    className=" text-Primary-EmeraldGreen flex items-center gap-2 cursor-pointer"
                  >
                    {value["Based on your:"]}
                    <img src="/icons/export.svg" alt="" />
                  </span>
                </div>
              )}
              <div className=" w-[200px] lg:w-[244px] h-[32px] border rounded-[4px] text-xs bg-white border-Gray-50  inline-flex lg:ml-4">
                {["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"].map(
                  (day) => (
                    <div
                      key={day}
                      onClick={() => toggleDaySelection(day)}
                      className={`w-full cursor-pointer border-r border-Gray-50 flex items-center justify-center bg-white ${
                        selectedDays.includes(day)
                          ? "text-Primary-EmeraldGreen"
                          : "text-Text-Primary"
                      }`}
                    >
                      {day}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
          <div className="relative">
            <MiniAnallyseButton />

          </div>          
        </div>

      </div>

    </>
  );
};

// import Data from "../calandar.json";
import { useNavigate, useParams } from "react-router-dom";
import MainTopBar from "../../MainTopBar";
import AnalyseButton from "../../AnalyseButton";
import Application from "../../../api/app";
import MiniAnallyseButton from "../../MiniAnalyseButton";

const GenerateCalendar: React.FC = () => {
  //   const [categories] = useState<Category[]>(initialData);
  const [isLoading, setisLoading] = useState(false);
  const { id ,blackId} = useParams();
  useEffect(() => {
    setisLoading(true)
    Application.ActionPlanGenerateTask({
      member_id:id,
      blocks_id:blackId
    }).then((res) => {
      setData(res.data)
      setisLoading(false)
    })
  },[])  
  const [data,setData] = useState<any>({});
  
  const navigate = useNavigate();
  return (
    <>
    {isLoading && (
      <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-85 z-20">
        {" "}
        
        <div className="spinner">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="dot"></div>
          ))}
        </div>
        {/* <div className="text-Text-Primary TextStyle-Body-1 mt-3">We’re generating your action plan based on the selected method. This may take a moment.</div> */}
      </div>
    )}    
    <div className="w-full fixed z-50 top-0 ">
        <MainTopBar></MainTopBar>
      </div>
    <div className="w-full h-full px-3 lg:px-6">
      
      <div className="px-8 mb-2 pt-[80px] flex justify-between w-full">
        <div className="flex items-center gap-3">
          <div
            onClick={() => {
              navigate(-1);
            }}
            className={` px-[6px] py-[3px] flex items-center justify-center cursor-pointer bg-white border border-Gray-50 rounded-md shadow-100`}
          >
            <img className="w-6 h-6" src="/icons/arrow-back.svg" />
          </div>
          <div className="TextStyle-Headline-5 text-Text-Primary">
            Edit Action Plan
          </div>
        </div>
        <AnalyseButton text="Generate by AI"></AnalyseButton>
      </div>
      <div className=" w-full rounded-2xl  p-3  lg:p-6">
        <div className=" mx-auto p-">
          {/* <div className="flex justify-between items-center mb-6">
            <div className="text-sm font-medium text-light-primary-text dark:text-primary-text">
              {isDriftAnalysis ? "Action Edit" : " Action Plan Calendar"}
            </div> */}
          {/* <AnalyseButton text="Generate by AI" /> */}
          {/* </div> */}
          <div className="flex flex-col gap-3 max-h-[460px] overflow-y-scroll pr-3">
            {/* {data.map((category: any, index: number) => (
              <BioMarkerRowSuggestions key={index} value={category} />
            ))} */}
            {
              Object.keys(data).map((key) => {
                return (
                  <>
                    {
                      data[key].map((el:any,index:number) => {
                        return (
                          <>
                            <BioMarkerRowSuggestions changeData={(value) => {
                              const wrapper:any ={}
                              const newData = data[key].map((vl:any,index2:number) => {
                                if(index == index2){
                                  return value
                                }
                                return vl
                              })      

                              wrapper[key] =newData
                              setData({...data,...wrapper})                    
                            }} category={key} key={index} value={el} />
                          </>
                        )
                      })
                    }
                  </>
                )
              })
            }
          </div>
        </div>
        <div className="w-[120px] mx-auto mt-4">
          <ButtonPrimary
          style={{textWrap: 'nowrap'}}
            onClick={() => {
              setisLoading(true)
              Application.ActionPlanSaveTask({
                blocks_id:blackId,
                member_id:id,
                tasks:data
              }).then(() => {
                navigate(-1)
              }).finally(() => {
                setisLoading(false)
              })
              // navigate(-1)
              // if (typeof onSave === "function") {
              //   onSave();
              // } else {
              //   console.error("onSave is not a function");
              // }
            }}
            
          >
            <img src="/icons/tick-square.svg" alt="" />
            Save Changes
          </ButtonPrimary>
        </div>
      </div>
    </div>
    </>
  );
};

export default GenerateCalendar;
