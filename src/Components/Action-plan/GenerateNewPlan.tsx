/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate, useParams } from "react-router-dom";
import PlanCard from "./sections/PlanCard";
import { useEffect, useState , } from "react";
import { TopBar } from "../topBar";

// import Data from "./data.json";
import PlanManagerModal from "./sections/PLanManager";
import Application from "../../api/app";
/* eslint-disable @typescript-eslint/no-explicit-any */
// interface Benchmark {
//   Benchmark: string;
//   Value: number;
//   checked: boolean;
// }

// interface BenchmarkArea {
//   Name: string;
//   Benchmarks: Benchmark[];
//   checked: boolean;
// }

// interface Category {
//   BenchmarkAreas: BenchmarkArea[];
// }
// type PrioritiesType = Record<string, Category>;
// [
//     {
//       planId: 1,
//       name: "Method 1",
//       description: "Create Your AI Twin",
//       features: ["Feature 1", "Feature 2", "Feature 3"],
//       Duration: "3 month",
//     },
//     {
//       planId: 2,
//       name: "Method 2",
//       description: "Create Your AI Twin",
//       features: ["Feature 1", "Feature 2", "Feature 3"],
//       Duration: "3 month",
//     },
//     {
//       planId: 3,
//       name: "Method 3",
//       description: "Create Your AI Twin",
//       features: ["Feature 1", "Feature 2", "Feature 3"],
//       Duration: "3 month",
//     },
//   ];
const GenerateNewActionPlan = () => {
  const navigate = useNavigate();
  const [plans,setPlan] = useState<any>(null)
  const [activePlan,setActivePlan] = useState<any>(null) 
  const [activePlanName,setActivePlanName] = useState<any>(null) 
  const { id } = useParams<{ id: string }>();
  useEffect(() => {
    Application.getActionPlanMethods({
      member_id:id
    }).then((res)=> {
      setPlan(res.data)
    })
  },[])
  const [isEditMode, setisEditMode] = useState(false);
  // const [Priorities] = useState<PrioritiesType>(Data);
  const [isLoading, setisLoading] = useState(false);
  const generateActionPlan = (method:any,name:string) => {
      setisLoading(true)
      Application.ActionPlanRoadMap({
        member_id:id,
        method:method,
        method_name:name
      }).finally(() => {
          setisLoading(false)
          navigate('/report/'+id+'/a?section=Action Plan')

      })
      // setTimeout(()=>{
      // },3000)
  }

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
          <div className="text-Text-Primary TextStyle-Body-1 mt-3">We’re generating your action plan based on the selected method. This may take a moment.</div>
        </div>
      )}
      {plans == null && (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-85 z-20">
          {" "}
          
          <div className="spinner">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="dot"></div>
            ))}
          </div>
          <div className="text-Text-Primary TextStyle-Body-1 mt-3">We are generating tailored methods aligned with your treatment plan. This may take a moment.</div>
        </div>
      )}
      <div className="w-full fixed top-0 ">
        <TopBar></TopBar>
      </div>
      <div className="px-8 mb-2 pt-[80px]">
        <div className="flex items-center gap-3">
          <div
            onClick={() => {
              if (isEditMode) {
                setisEditMode(false);
              } else {
                navigate(-1);
              }
            }}
            className={` px-[6px] py-[3px] flex items-center justify-center cursor-pointer bg-white border border-Gray-50 rounded-md shadow-100`}
          >
            <img className="w-6 h-6" src="/icons/arrow-back.svg" />
          </div>
          <div className="TextStyle-Headline-5 text-Text-Primary">
            {isEditMode ?
            'Set Orders'
            :
            'Generate Action Plan'
            }
          </div>
        </div>
      </div>

      <div className="w-full inset-0 z-10  flex items-center justify-center px-8  bg-opacity-50">
        {isEditMode ? (
          <PlanManagerModal onSave={(value:any) => {
            setActivePlan(value)
            setPlan((pre:any) => {
              const newData = {...pre}
              newData[activePlanName] = value
              return newData
            })
            setisEditMode(false)
          }} dataVal={activePlan} />
        ) : (
          <div className=" h-full pb-[180px] l flex flex-col   justify-center items-center relative py-[80px]  ">
            <div className="text-Text-Primary text-base font-medium text-center">
              Choose Your Method
            </div>
            <div className="mt-2 text-Text-Primary TextStyle-Body-1 text-center">
              You can personalize your selected method by using the setting
              button on the cards.
            </div>
            <div className=" mt-6 flex items-center justify-center gap-4 flex-wrap">
              {plans == null ?
                <div className="spinner">
                  {/* {[...Array(8)].map((_, i) => (
                    <div key={i} className="dot"></div>
                  ))} */}
                </div>
              :
              <>
                {Object.keys(plans?plans:{}).map((el: any) => {
                  return <PlanCard
                  onEdit={() => {
                    setActivePlan(plans[el])
                    setActivePlanName(el)
                    setisEditMode(true)
                  }}
                   name={el} 
                   onClick={
                    ()=>{
                      generateActionPlan(plans[el],el)         
                    }
                  }
                  data={plans[el]}></PlanCard>;
                })}
              </>
              }
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default GenerateNewActionPlan;
