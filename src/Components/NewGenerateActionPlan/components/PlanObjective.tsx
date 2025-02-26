import React from 'react';

interface PlanObjectiveProps {
  value: string;
  setValue: (val: string) => void;
}

const PlanObjective: React.FC<PlanObjectiveProps> = ({ value, setValue }) => {
  return (
    <>
      <div className="w-full h-[48px] flex justify-between items-center px-4 bg-[#FDFDFD] rounded-[12px] border border-gray-50">
        <div className="flex items-center text-Primary-DeepTeal text-xs text-nowrap">
          <img src="/icons/note-text.svg" alt="" className="mr-1" />
          Plan Objective:
        </div>
        <div className="flex-grow ml-2">
          <input
            type="text"
            className={`w-full h-[28px] rounded-2xl border placeholder:text-gray-400 text-xs px-3 outline-none`}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
      </div>
    </>
  );
};

export default PlanObjective;
