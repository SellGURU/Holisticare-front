/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState , useContext} from 'react';
import { TopBar } from '../../Components/topBar';
import { useNavigate, useParams } from 'react-router-dom';
import { ButtonPrimary } from '../../Components/Button/ButtonPrimary';
import { GeneralCondition } from './components/GeneralCondition';
import { Overview } from './components/Overview';
import { SetOrders } from './components/SetOrders';
import Application from '../../api/app';
import Circleloader from '../../Components/CircleLoader';
import SvgIcon from '../../utils/svgIcon';
import { AppContext } from '../../store/app';
export const GenerateRecommendation = () => {
  const navigate = useNavigate();
  const steps = ['General Condition', 'Set orders', 'Overview'];
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { setTreatmentId } = useContext(AppContext);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };
  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };
  const handleSkip = () => {
    if(currentStepIndex < steps.length -1 ){
      setCurrentStepIndex(steps.length -1 )
    }
  };
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [treatmentPlanData, setTratmentPlanData] = useState<any>(null);
  const generatePaln = () => {
    setIsLoading(true);
    Application.generateTreatmentPlan({
      member_id: id,
    })
      .then((res) => {
        setTratmentPlanData({ ...res.data, member_id: id}); 
      setTreatmentId(res.data.treatment_id)
         })
      .finally(() => {
        setIsLoading(false);
      });
  };
  useEffect(() => {
    generatePaln();
  }, []);
  return (
    <div className="h-[100vh] overflow-auto">
      {isLoading && (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-85 z-20">
          {' '}
          <Circleloader></Circleloader>
          <div className="text-Text-Primary TextStyle-Body-1 mt-3 mx-6 text-center lg:mx-0">
            We are generating your Holistic Plan. This may take a moment.
          </div>
        </div>
      )}
      <div className="fixed w-full top-0 hidden lg:flex z-[9]">
        <TopBar />
      </div>
      <div className="px-8">
        <div className="w-full flex justify-between  pt-[40px] lg:pt-[80px]">
          <div className="flex items-center gap-3">
            <div
              onClick={() => {
                navigate(-1);
              }}
              className={`px-[6px] py-[3px] flex items-center justify-center cursor-pointer bg-white border border-Gray-50 rounded-md shadow-100`}
            >
              <img className="w-6 h-6" src="/icons/arrow-back.svg" />
            </div>
            <div className="TextStyle-Headline-5 text-Text-Primary">
              Generate Holistic Plan
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={` ${currentStepIndex == steps.length - 1 ? 'hidden' : 'flex' } items-center text-[12px] cursor-pointer text-Primary-DeepTeal`}
              onClick={handleSkip}
            >
              Skip <img src="/icons/Skip.svg" alt="" />
            </div>
            {currentStepIndex > 0 && (
              <ButtonPrimary outLine onClick={handleBack}>
                <div className="rotate-180">
                  <SvgIcon
                    src="/icons/arrow-right-white.svg"
                    color="#005F73"
                  ></SvgIcon>
                </div>
                {/* <img src="/icons/arrow-right-white.svg" alt="" /> */}
                Back
              </ButtonPrimary>
            )}
            <ButtonPrimary ClassName="border border-white" onClick={()=>{
              if( currentStepIndex == steps.length - 1){
             Application.saveHolisticPlan(treatmentPlanData).then((res)=>console.log(res)
             ).finally(()=> navigate(`/report/Generate-Holistic-Plan/${id}`))
              }else(
                handleNext()
              )
            }}>
              {currentStepIndex == 2 ? 'Generate' : 'Next'}
              {currentStepIndex != 2 && (
                <img src="/icons/arrow-right-white.svg" alt="" />
              )}
             
            </ButtonPrimary>
          </div>
        </div>
        <div className="mt-6 flex justify-between py-4 px-[156px] border border-Gray-50 rounded-2xl bg-white shadow-sm">
          {steps.map((label, index) => (
            <React.Fragment key={index}>
              <div
                onClick={() => setCurrentStepIndex(index)}
                className={`px-4 py-2 cursor-pointer text-[12px] rounded-full flex items-center justify-center gap-2 mx-1 ${
                  index === currentStepIndex
                    ? 'text-Primary-DeepTeal '
                    : 'text-Text-Secondary'
                }`}
              >
                <div
                  className={`size-5 rounded-full text-xs font-medium border ${index === currentStepIndex ? 'text-Primary-DeepTeal border-Primary-DeepTeal' : 'border-[#888888] text-[#888888]'} flex items-center justify-center text-center`}
                >
                  {index + 1}
                </div>
                {label}
              </div>
              {index < steps.length - 1 && (
                <img
                  src="/icons/chevron-double-right.svg"
                  alt="step-icon"
                  className="mx-2"
                />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="mt-2 w-full mb-6">
          {currentStepIndex == 0 ? (
            <GeneralCondition
              data={{
                biomarkers: treatmentPlanData?.biomarker_insight,
                clientInsights: treatmentPlanData?.client_insight,
                completionSuggestions: treatmentPlanData?.completion_suggestion,
                // lookingForwards:treatmentPlanData?.looking_forwards
                lookingForwards: treatmentPlanData?.looking_forwards,
              }}
              setData={setTratmentPlanData}
            ></GeneralCondition>
          ) : currentStepIndex == 1 ? (
            <SetOrders
              treatMentPlanData={treatmentPlanData}
              setData={(newOrders) => {
                console.log(newOrders);
                setTratmentPlanData((pre: any) => {
                  return {
                    ...pre,
                    suggestion_tab: newOrders,
                  };
                });
              }}
              data={treatmentPlanData.suggestion_tab}
            ></SetOrders>
          ) : (
            <Overview treatmentPlanData={treatmentPlanData}></Overview>
          )}
        </div>
      </div>
    </div>
  );
};
