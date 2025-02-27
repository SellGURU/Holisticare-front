/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { ButtonPrimary } from '../../Button/ButtonPrimary';
import Sliders from '../sliders';

interface CategorieyWeightProps {
  data: any;
  onSubmit: (value: any) => void;
}

const CategorieyWeight: React.FC<CategorieyWeightProps> = ({
  data,
  onSubmit,
}) => {
  const [plans, setPlans] = useState<any>(data);
  useEffect(() => {
    setPlans(data);
  }, [data]);
  const saveChanges = () => {
    onSubmit(plans);
  };
  return (
    <>
      <div className="w-full flex items-center justify-center px-8">
        <div className="w-[493px] h-[448px] rounded-[40px] bg-white flex flex-col items-center justify-center mt-12 shadow-200 mb-2">
          <div className="text-Text-Primary text-sm font-medium">
            Set Categories Weights
          </div>
          <div className="text-Text-Primary text-xs mt-3">
            Adjust the emphasis of each category when generating your action
            plan.
          </div>
          <Sliders data={plans} setData={setPlans} />
          <div className="mt-6 w-[192px] flex justify-center">
            <ButtonPrimary onClick={saveChanges}>
              <img src="/icons/tick-square.svg" alt="" />
              Apply Changes
            </ButtonPrimary>
          </div>
        </div>
      </div>
    </>
  );
};

export default CategorieyWeight;
