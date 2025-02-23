import React, { useState } from 'react';
import { TopBar } from '../../Components/topBar';
import { useNavigate } from 'react-router-dom';
import { ButtonPrimary } from '../../Components/Button/ButtonPrimary';
import { GeneralCondition } from './components/GeneralCondition';
import { Overview } from './components/Overview';
import { SetOrders } from './components/SetOrders';

export const GenerateRecommendation = () => {
  const navigate = useNavigate();
  const steps = ['General Condition', 'Set orders', 'Overview'];
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleSkip = () => {};

  return (
    <div className="h-[100vh] overflow-auto">
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
          <div className="flex items-center gap-4">
            <div
              className="flex items-center gap-2 cursor-pointer text-Primary-DeepTeal"
              onClick={handleSkip}
            >
              Skip <img src="/icons/Skip.svg" alt="" />
            </div>
            <ButtonPrimary ClassName="border border-white" onClick={handleNext}>
              Next <img src="/icons/arrow-right-white.svg" alt="" />
            </ButtonPrimary>
          </div>
        </div>
        <div className="mt-6 flex justify-between py-4 px-[156px] border border-Gray-50 rounded-2xl bg-white shadow-sm">
          {steps.map((label, index) => (
            <React.Fragment key={index}>
              <div
                onClick={() => setCurrentStepIndex(index)}
                className={`px-4 py-2 cursor-pointer rounded-full flex items-center justify-center gap-2 mx-1 ${
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
        <div className="mt-2 w-full">
          {currentStepIndex == 0 ? (
            <GeneralCondition></GeneralCondition>
          ) : currentStepIndex == 1 ? (
            <SetOrders></SetOrders>
          ) : (
            <Overview></Overview>
          )}
        </div>
      </div>
    </div>
  );
};
