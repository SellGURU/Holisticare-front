/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react';
import BioMarkerRowSuggestions from '../../generateTreatmentPlan/components/BiomarkerRow';
type CategoryState = {
  name: string;
  visible: boolean;
};

interface OverviewProps {
  treatmentPlanData: any;
  suggestionsChecked: Array<any>;
  visibleCategoriy: CategoryState[];
  Conflicts: Array<any>;
}
export const Overview: React.FC<OverviewProps> = ({
  visibleCategoriy,
  treatmentPlanData,
  suggestionsChecked,
  Conflicts,
}) => {
  console.log(Conflicts);

  const getAllCheckedCategories = () => {
    const checkedCategories: string[] = [];
    suggestionsChecked.forEach((el: any) => {
      if (el.checked) {
        checkedCategories.push(el.Category);
      }
    });
    return checkedCategories;
  };
  console.log(getAllCheckedCategories());
  const [showConflict, setShowConflict] = useState(true);
  const [currentConflictIndex, setCurrentConflictIndex] = useState(0);

  const handleNextConflict = () => {
    setCurrentConflictIndex((prevIndex) => (prevIndex + 1) % Conflicts.length);
  };

  const handlePreviousConflict = () => {
    setCurrentConflictIndex(
      (prevIndex) => (prevIndex - 1 + Conflicts.length) % Conflicts.length,
    );
  };
  return (
    <>
      <div className=" w-full relative  p-4 rounded-2xl bg-white">
        {Conflicts.length > 0 && showConflict && (
          <div className="w-full rounded-2xl px-4 py-3 bg-[#F9DEDC]">
            <div className="flex w-full justify-between items-center">
              <div className="flex gap-5 items-center text-xs font-medium text-Text-Primary">
                <img src="/icons/check-circle.svg" alt="Check Circle" />{' '}
                Conflict
              </div>
              <div className="flex items-center gap-4 text-xs text-Text-Secondary font-medium">
                {currentConflictIndex + 1}/{Conflicts.length}
                <img
                  onClick={() => setShowConflict(false)}
                  className="cursor-pointer"
                  src="/icons/x.svg"
                  alt="Close"
                />
              </div>
            </div>
            <div className="flex w-full px-6 justify-center items-center gap-6 mt-3">
              <div className=''>
              <img
                className={`cursor-pointer ${
                  currentConflictIndex === 0
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
                src="/icons/arrow-up.svg"
                alt="Previous"
                onClick={() => {
                  if (currentConflictIndex !== 0) {
                    handlePreviousConflict();
                  }
                }}
              />
              </div>
              <div className="text-[10px] text-Text-Primary min-w-[1091px] text-center truncate">
                {Conflicts[currentConflictIndex]}
              </div>
              <img
                className={`cursor-pointer rotate-180 ${
                  currentConflictIndex === Conflicts.length - 1
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
                src="/icons/arrow-up.svg"
                alt="Next"
                onClick={() => {
                  if (currentConflictIndex !== Conflicts.length - 1) {
                    handleNextConflict();
                  }
                }}
              />
            </div>
          </div>
        )}
        {/* {suggestionsChecked.map((el: any, suggestionIndex: number) => {
          return (
            <>
              <div
                className="w-full lg:px-6 lg:py-4 lg:bg-backgroundColor-Card lg:rounded-[16px] lg:border lg:border-Gray-50 mt-4"
                key={`${el.title}-${suggestionIndex}`}
              >
                <BioMarkerRowSuggestions
                  isOverview
                  value={el}
                  onEdit={() => {}}
                  onchange={() => {}}
                  onDelete={() => {}}
                ></BioMarkerRowSuggestions>
              </div>
            </>
          );
        })} */}
        {treatmentPlanData['suggestion_tab']
          .filter(
            (el: any) =>
              el.checked == true &&
              visibleCategoriy
                .filter((el) => el.visible)
                .map((el) => el.name)
                .includes(el.Category),
          )
          .map((el: any, suggestionIndex: number) => {
            return (
              <>
                <div
                  className="w-full lg:px-6 lg:py-4 lg:bg-backgroundColor-Card lg:rounded-[16px] lg:border lg:border-Gray-50 mt-4"
                  key={`${el.title}-${suggestionIndex}`}
                >
                  <BioMarkerRowSuggestions
                    isOverview
                    value={el}
                    onEdit={() => {}}
                    onchange={() => {}}
                    onDelete={() => {}}
                  ></BioMarkerRowSuggestions>
                </div>
              </>
            );
          })}
      </div>
    </>
  );
};
