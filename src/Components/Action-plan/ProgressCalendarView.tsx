/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC } from 'react';
import SemiCircularProgressBar from '../NewGenerateActionPlan/components/SemiCircularProgressBar';
import CircularProgressBar from '../NewGenerateActionPlan/components/CircularProgressBar';

interface ProgressCalenderViewProps {
  activeAction: any;
}

const ProgressCalenderView: FC<ProgressCalenderViewProps> = ({
  activeAction,
}) => {
  return (
    <div className="w-full h-[112px] rounded-2xl bg-backgroundColor-Card border border-Gray-50 p-4 flex justify-between">
      <div className="flex flex-col h-full justify-between">
        <div className="font-medium text-sm text-Text-Primary">Progress</div>
        <div className="text-[10px] text-Text-Primary text-justify max-w-[400px] 2xl:max-w-[500px]">
          Stay connected to your clients' journey with real-time progress
          tracking. Visualize their achievements, identify trends, and celebrate
          milestones—all to foster accountability and inspire lasting wellness
          transformations.
        </div>
      </div>
      <div className="flex h-full gap-8">
        <div className="h-full w-[1px] bg-Gray-50"></div>
        <div className="flex flex-col items-center">
          <div className="font-medium text-sm text-Text-Primary -mb-3">
            Total
          </div>
          <SemiCircularProgressBar percentage={activeAction.progress} />
        </div>
        <div className="h-full w-[1px] bg-Gray-50"></div>
      </div>
      <div className="flex h-full gap-8">
        <div className="flex flex-col items-center">
          <div className="font-medium text-xs text-Text-Primary -mb-2">
            <img className="size-5" src="/icons/diet.svg" alt="" />
          </div>
          <CircularProgressBar percentage={activeAction.score.diet} />
        </div>
        <div className="flex flex-col items-center">
          <div className="font-medium text-xs text-Text-Primary -mb-2">
            <img className="size-5" src="/icons/weight.svg" alt="" />
          </div>
          <CircularProgressBar percentage={activeAction.score.activity} />
        </div>
        <div className="flex flex-col items-center">
          <div className="font-medium text-xs text-Text-Primary -mb-2">
            <img className="size-5" src="/icons/Supplement.svg" alt="" />
          </div>
          <CircularProgressBar percentage={activeAction.score.supplement} />
        </div>
        <div className="flex flex-col items-center">
          <div className="font-medium text-xs text-Text-Primary -mb-2">
            <img className="size-5" src="/icons/LifeStyle2.svg" alt="" />
          </div>
          <CircularProgressBar percentage={activeAction.score.lifestyle} />
        </div>
      </div>
    </div>
  );
};

export default ProgressCalenderView;
