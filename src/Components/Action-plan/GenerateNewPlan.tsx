import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TopBar } from '../topBar';
import PlanCard from './sections/PlanCard';

// import Data from "./data.json";
import Application from '../../api/app';
import Circleloader from '../CircleLoader';
import PlanManagerModal from './sections/PLanManager';
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
  const [plans, setPlan] = useState<any>(null);
  const [activePlan, setActivePlan] = useState<any>(null);
  const [activePlanName, setActivePlanName] = useState<any>(null);
  const { id } = useParams<{ id: string }>();
  useEffect(() => {
    Application.getActionPlanMethods({
      member_id: id,
    }).then((res) => {
      setPlan(res.data);
    });
  }, []);
  const [isEditMode, setisEditMode] = useState(false);
  // const [Priorities] = useState<PrioritiesType>(Data);
  const [isLoading, setisLoading] = useState(false);
  const generateActionPlan = (method: any, name: string) => {
    setisLoading(true);
    Application.ActionPlanRoadMap({
      member_id: id,
      method: method,
      method_name: name,
    }).finally(() => {
      setisLoading(false);
      navigate('/report/' + id + '/a?section=Action Plan');
    });
    // setTimeout(()=>{
    // },3000)
  };

  return (
    <div className="h-[100vh] lg:h-[unset] overflow-auto lg:overflow-hidden">
      {isLoading && (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-85 z-20">
          <Circleloader></Circleloader>
          <div className="text-Text-Primary TextStyle-Body-1 mt-3 mx-6 text-center lg:mx-0">
            We’re generating your action plan based on the selected method. This
            may take a moment.
          </div>
        </div>
      )}
      {plans == null && (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-85 z-20">
          {' '}
          <Circleloader></Circleloader>
          <div className="text-Text-Primary TextStyle-Body-1 mt-3 mx-6 text-center lg:mx-0">
            We are generating tailored methods aligned with your Holistic Plan .
            This may take a moment.
          </div>
        </div>
      )}
      <div className="w-full fixed top-0 hidden lg:flex lg:z-[9]">
        <TopBar></TopBar>
      </div>
      <div className="px-8 mb-2 py-3 lg:py-0 lg:pt-[80px] shadow-300 bg-bg-color lg:bg-[none] lg:shadow-[unset] fixed lg:relative top-0 z-[9] lg:z-[0] w-full lg:w-[unset]">
        <div className="flex items-center gap-3">
          <div
            onClick={() => {
              if (isEditMode) {
                setisEditMode(false);
              } else {
                navigate(-1);
              }
            }}
            className={` px-[6px] py-[3px] flex items-center justify-center cursor-pointer lg:bg-white lg:border lg:border-Gray-50 lg:rounded-md lg:shadow-100`}
          >
            <img className="w-6 h-6" src="/icons/arrow-back.svg" />
          </div>
          <div className="TextStyle-Headline-5 text-Text-Primary">
            {isEditMode ? 'Set Orders' : 'Generate Action Plan'}
          </div>
        </div>
      </div>

      <div className="w-full inset-0 z-10  flex items-center justify-center px-8  bg-opacity-50">
        {isEditMode ? (
          <PlanManagerModal
            onSave={(value: any) => {
              setActivePlan(value);
              setPlan((pre: any) => {
                const newData = { ...pre };
                newData[activePlanName] = value;
                return newData;
              });
              setisEditMode(false);
            }}
            dataVal={activePlan}
          />
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
              {plans == null ? (
                <div className="spinner">
                  {/* {[...Array(8)].map((_, i) => (
                    <div key={i} className="dot"></div>
                  ))} */}
                </div>
              ) : (
                <>
                  {Object.keys(plans ? plans : {}).map((el: any) => {
                    return (
                      <PlanCard
                        onEdit={() => {
                          setActivePlan(plans[el]);
                          setActivePlanName(el);
                          setisEditMode(true);
                        }}
                        name={el}
                        onClick={() => {
                          generateActionPlan(plans[el], el);
                        }}
                        data={plans[el]}
                      ></PlanCard>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateNewActionPlan;
