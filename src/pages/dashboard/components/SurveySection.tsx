import React from 'react';
import UploadCard from '../../CheckIn/components/UploadCard';
import { ArrangeCard, TextCard } from '../../CheckIn/components';
interface SurveySectionProps {
  isStickMealPlan: boolean;
  setisStickMealPlan: (value: boolean) => void;
  hoursSlept: number;
  handleSliderChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  sliderBackground: React.CSSProperties;
  feelings: { emoji: string; text: string }[];
  selectedFeeling: number | null;
  handleFeelingClick: (index: number) => void;
  val: number;
  setVal: (value: number) => void;
  snackValue: string;
  workHours: string;
}
const SurveySection: React.FC<SurveySectionProps> = ({
  isStickMealPlan,
  setisStickMealPlan,
  hoursSlept,
  handleSliderChange,
  sliderBackground,
  feelings,
  selectedFeeling,
  handleFeelingClick,
  val,
  setVal,
  snackValue,
  workHours,
}) => {
  return (
    <div className="mt-4  flex flex-col gap-2 h-[370px] overflow-auto">
      <div className="bg-[#FCFCFC] rounded-xl p-3 border border-Gray-50">
        <div className="text-[10px]">1. Did you stick to the Meal Plan?</div>
        <div className="mt-3 w-[96px] h-8 border border-Gray-50 flex text-[10px]">
          <div
            onClick={() => setisStickMealPlan(true)}
            className={`${
              isStickMealPlan
                ? 'text-white bg-gradient-to-r from-[#99C7AF]  to-[#AEDAA7]'
                : ''
            } cursor-pointer flex justify-center items-center w-[50%]`}
          >
            Yes
          </div>
          <div
            onClick={() => setisStickMealPlan(false)}
            className={`${
              !isStickMealPlan
                ? 'text-white bg-gradient-to-r from-[#99C7AF]  to-[#AEDAA7]'
                : ''
            } cursor-pointer flex justify-center items-center w-[50%]`}
          >
            No
          </div>
        </div>
      </div>
      <div className="bg-[#FCFCFC] rounded-xl p-3 border border-Gray-50">
        <div className="text-[10px] mb-4">
          2. How many hours did you sleep yesterday?
        </div>
        <input
          type="range"
          min="0"
          max="10"
          value={hoursSlept}
          onChange={handleSliderChange}
          style={sliderBackground}
          className="w-full appearance-none bg-[#E9EDF5] rounded-full h-[2px] slider-thumb-green"
        />
        <div className="flex justify-between mt-2 text-[10px] text-[#888888]">
          {Array.from({ length: 11 }, (_, i) => (
            <span key={i}>{i === 10 ? '>10' : i}</span>
          ))}
        </div>
      </div>
      <div className="bg-[#FCFCFC] rounded-xl p-3 border border-Gray-50">
        <div className="text-[10px]">3. How are you feeling today?</div>
        <div className="bg-white rounded-[20px] p-4 pb-2 drop-shadow mt-3 overflow-x-hidden relative">
          {/* <img
            className="absolute inset-0 -left-2 w-full opacity-30 -z-10 h-[70px]"
            src="/images/Union.svg"
            alt=""
          /> */}
          <div className="flex items-center justify-between overflow-auto relative">
            {feelings.map((feeling, index) => (
              <div
                key={index}
                className={`flex flex-col items-center cursor-pointer ${
                  selectedFeeling === index ? '' : ''
                }`}
                onClick={() => handleFeelingClick(index)}
              >
                <img src={feeling.emoji} alt="" />
                <span
                  className={`mt-2 text-sm font-medium text-Primary-DeepTeal ${
                    selectedFeeling === index ? 'block' : 'invisible'
                  }`}
                >
                  {feeling.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-[#FCFCFC] min-h-[100px] p-3 w-full h-[92px] rounded-[12px] border border-gray-50">
        <div className="text-[12px] text-Text-Primary">
          4. Rate your workout.
        </div>
        <div className="flex justify-center gap-2 items-center mt-4">
          {Array.from({ length: 5 }).map((_, ind) => {
            return (
              <img
                key={ind}
                onClick={() => {
                  setVal(ind + 1);
                }}
                className="cursor-pointer"
                src={
                  ind + 1 <= Number(val)
                    ? './icons/starFull.svg'
                    : './icons/starEmpty.svg'
                }
                alt=""
              />
            );
          })}
        </div>
      </div>
      <UploadCard
        index={5}
        question="Upload your progress pictures"
      ></UploadCard>
      <TextCard
        index={6}
        question="What snacks did you take today?"
        placeHolder="Chips, Juice, ..."
        value={snackValue}
      ></TextCard>
      <ArrangeCard index={7} question="Weight" value={60}></ArrangeCard>
      <TextCard
        index={8}
        question="How many hours did you work today?(Dropdown sample)"
        placeHolder="8 hours"
        value={workHours}
      ></TextCard>
    </div>
  );
};

export default SurveySection;
