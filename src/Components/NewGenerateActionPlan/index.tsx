/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Circleloader from '../CircleLoader';
import { TopBar } from '../topBar';
import Application from '../../api/app';
import Sliders from './sliders';
import { ButtonPrimary } from '../Button/ButtonPrimary';

const NewGenerateActionPlan = () => {
  const navigate = useNavigate();
  const [plans, setPlan] = useState<any>(null);
  const [isLoading, setisLoading] = useState(false);
  const [isEditMode, setisEditMode] = useState(false);
  // const { id } = useParams<{ id: string }>();
  useEffect(() => {
    Application.getActionPlanMethodsNew().then((res) => {
      setPlan(res.data);
    });
  }, []);
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
      <div className="w-full flex items-center justify-center px-8">
        <div className="w-[493px] h-[448px] rounded-[40px] bg-white flex flex-col items-center justify-center mt-12 shadow-200 mb-2">
          <div className="text-Text-Primary text-sm font-medium">
            Set Categories Weights
          </div>
          <div className="text-Text-Primary text-xs mt-3">
            Adjust the emphasis of each category when generating your action
            plan.
          </div>
          <Sliders data={plans} />
          <div className="mt-6 w-[192px] flex justify-center">
            <ButtonPrimary
              onClick={() => {
                // onSave(data);
              }}
            >
              <img src="/icons/tick-square.svg" alt="" />
              Apply Changes
            </ButtonPrimary>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewGenerateActionPlan;
