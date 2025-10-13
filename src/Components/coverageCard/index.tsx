import React, { useState } from 'react';
import MainModal from '../MainModal';

interface CoverageCardProps {
  progress: number; // from 0 to 100
  details: Record<string, boolean>[];
}

export const CoverageCard: React.FC<CoverageCardProps> = ({
  progress,
  details,
}) => {
  // Clamp value to 0–100
  const safeProgress = Math.min(100, Math.max(0, progress));

  // Determine color based on progress
  const getBarColor = () => {
    if (safeProgress <= 50) return 'bg-[#FC5474]';
    if (safeProgress > 80) return 'bg-[#06C78D]';
    if (safeProgress > 50 && safeProgress <= 80) return 'bg-[#FFAB2C]';
    return 'bg-green-500';
  };

  // Dynamic message
  const getMessage = () => {
    if (safeProgress == 0) return 'Unlock Coverage with adding interventions.';
    if (safeProgress == 100)
      return 'Great job! You’ve selected interventions that fully cover all key areas.';

    return 'To fully cover the plan, make sure you select interventions that address all key areas.';
  };
  const [showDetail, setShowDetail] = useState(false);

  return (
    <>
      <MainModal isOpen={showDetail} onClose={() => setShowDetail(false)}>
        <div className="bg-white h-fit max-h-[368px] overflow-auto w-[425px] p-6 pb-8 rounded-2xl shadow-800">
          <div className="border-b border-Gray-50 pb-2 w-full flex gap-2 items-center text-sm font-medium text-Text-Primary">
            Plan Coverage Details
          </div>

          <div className="mt-4 flex flex-col max-h-[208px] overflow-auto gap-3">
            {details?.map((detail, index) => {
              const [text, isChecked] = Object.entries(detail)[0];
              return (
                <div
                  key={index}
                  className={`flex select-none items-start gap-2 text-Text-Primary text-xs  ${
                    isChecked && ' line-through'
                  }`}
                >
                  <img
                    src={
                      isChecked
                        ? '/icons/tick-square-green-new.svg'
                        : '/icons/close-square-new.svg'
                    }
                    alt=""
                  />
                  {text}
                </div>
              );
            })}
          </div>
          <div
            onClick={() => setShowDetail(false)}
            className="w-full mt-4 flex justify-end text-sm font-medium text-Disable cursor-pointer"
          >
            close
          </div>
        </div>
      </MainModal>
      <div className=" relative flex w-full select-none h-[43px] items-center justify-between gap-2  bg-backgroundColor-Main px-2 py-1 rounded-lg">
        {/* Progress row */}
        <div className="flex flex-col w-[352px] gap-1">
          <div className="flex items-start gap-1">
            <div className="text-xs font-medium text-Text-Primary">
              {safeProgress}%
            </div>
            <div className="text-[10px] text-Text-Quadruple ">Coverage</div>
          </div>

          <div className="h-2 w-full rounded-[64px] bg-[#E0E0E0] overflow-hidden">
            <div
              className={`h-full ${getBarColor()} transition-all duration-500`}
              style={{ width: `${safeProgress}%` }}
            />
          </div>
        </div>

        {/* Progress bar */}

        {/* Message row */}
        <div className=" absolute left-1/2 -translate-x-1/2 flex items-center justify-center gap-1  text-xs text-Text-Primary ">
          {safeProgress == 100 ? (
            <img src="/icons/copy-success.svg" />
          ) : (
            <img src="/icons/danger-fill.svg" />
          )}

          <p>{getMessage()}</p>
        </div>
        <div
          onClick={() => {
            if (details.length > 0) {
              setShowDetail(true);
            }
          }}
          className={`text-xs text-Primary-DeepTeal cursor-pointer flex items-center gap-1 ${details.length > 0 ? 'cursor-pointer opacity-100' : 'cursor-not-allowed opacity-50'}`}
        >
          View details{' '}
          <img className="size-4" src="/icons/external-link.svg" alt="" />
        </div>
      </div>
    </>
  );
};
