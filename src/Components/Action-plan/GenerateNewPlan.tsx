/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from "react-router-dom";
import PlanCard from "./sections/PlanCard";
import { useState } from "react";

// import Data from "./data.json";
import PlanManagerModal from "./sections/PLanManager";
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

const GenerateNewActionPlan = () => {
  const navigate = useNavigate();
  const plans = [
    {
      planId: 1,
      name: "Method 1",
      description: "Create Your AI Twin",
      features: ["Feature 1", "Feature 2", "Feature 3"],
      Duration: "3 month",
    },
    {
      planId: 2,
      name: "Method 2",
      description: "Create Your AI Twin",
      features: ["Feature 1", "Feature 2", "Feature 3"],
      Duration: "3 month",
    },
    {
      planId: 3,
      name: "Method 3",
      description: "Create Your AI Twin",
      features: ["Feature 1", "Feature 2", "Feature 3"],
      Duration: "3 month",
    },
  ];
  const [isEditMode, setisEditMode] = useState(false);
  // const [Priorities] = useState<PrioritiesType>(Data);

  return (
    <>
      <div className="px-8 mb-2">
        <div className="w-[60px]">
          <div
            onClick={() => {
              if (isEditMode) {
                setisEditMode(false);
              } else {
                navigate(-1);
              }
            }}
            className={`Aurora-tab-icon-container cursor-pointer h-[40px]`}
          >
            <img className={`Aurora-icons-arrow-left`} />
          </div>
        </div>
      </div>

      <div className="w-full inset-0 z-10  flex items-center justify-center px-8  bg-opacity-50">
        {isEditMode ? (
          <PlanManagerModal  />
        ) : (
          <div className="dark:bg-[#1E1E1E] h-full pb-[180px] lg:pb-0 max-h-[650px] min-h-[476px] overflow-auto lg:overflow-hidden flex   justify-center items-center relative text-light-secandary-text dark:text-primary-text border border-light-border-color dark:border-none  rounded-lg w-full dark:shadow-lg gap-6 flex-wrap py-5 lg:py-0 ">
            {plans.map((el: any) => {
              return (
                <PlanCard  data={el}></PlanCard>
              );
            })}
          </div>
        )}
      </div>
   
    </>
  );
};

export default GenerateNewActionPlan;
