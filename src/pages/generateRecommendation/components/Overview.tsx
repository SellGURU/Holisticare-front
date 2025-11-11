/* eslint-disable @typescript-eslint/no-explicit-any */

import { FC, useState } from 'react';
import BioMarkerRowOldSuggestions from '../../generateTreatmentPlan/components/BiomarkerRowOld';
import { CoverageCard } from '../../../Components/coverageCard';
type CategoryState = {
  name: string;
  visible: boolean;
};

interface OverviewProps {
  treatmentPlanData: any;
  suggestionsChecked: Array<any>;
  visibleCategoriy: CategoryState[];
  Conflicts: Array<any>;
  progress: number; // from 0 to 100
  details: Record<string, boolean>[];
  setDetails: (value: Record<string, boolean>[]) => void;
  setData: (values: any) => void;
  data: any;
  setLookingForwards: (values: any) => void;
  lookingForwardsData: any;
}
export const Overview: FC<OverviewProps> = ({
  visibleCategoriy,
  treatmentPlanData,
  suggestionsChecked,
  Conflicts,
  progress,
  details,
  setDetails,
  setData,
  data,
  setLookingForwards,
  lookingForwardsData,
}) => {
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
  const handleUpdateIssueListByKeys = (
    category: string,
    recommendation: string,
    newIssueList: string[],
    text?: string,
  ) => {
    setData(
      data.map((item: any) => {
        if (
          item.Category === category &&
          item.Recommendation === recommendation
        ) {
          return { ...item, issue_list: newIssueList };
        }
        return item;
      }),
    );
    if (text) {
      handleAddLookingForwards(text);
    }
  };

  const handleAddLookingForwards = (text: string) => {
    setLookingForwards([
      ...lookingForwardsData,
      'Issue ' + (lookingForwardsData.length + 1) + ': ' + text,
    ]);
  };

  const handleRemoveLookingForwards = (text: string) => {
    setLookingForwards(lookingForwardsData.filter((el: any) => el !== text));
  };
  const [refreshKey, setRefreshKey] = useState(0);
  const handleRemoveIssueFromList = (name: string) => {
    setData(
      data.map((item: any) => ({
        ...item,
        issue_list: item.issue_list.filter((issue: string) => issue !== name),
      })),
    );
    handleRemoveLookingForwards(name);
    setRefreshKey((k) => k + 1);
  };

  return (
    <>
      <div className=" w-full relative  p-4 rounded-2xl bg-white">
        {Conflicts.length > 0 && showConflict && (
          <div className="w-full rounded-2xl px-4 py-3 bg-[#F9DEDC]">
            <div className="flex w-full justify-between items-center">
              <div className="flex gap-2 items-center text-xs font-medium text-Text-Primary">
                <img src="/icons/check-circle.svg" alt="Check Circle" />{' '}
                Conflict
              </div>
              <div className="flex items-center gap-4 text-xs text-Text-Quadruple font-medium">
                {currentConflictIndex + 1}/{Conflicts.length}
                <img
                  onClick={() => setShowConflict(false)}
                  className="cursor-pointer"
                  src="/icons/x.svg"
                  alt="Close"
                />
              </div>
            </div>
            <div className="flex w-full px-6 justify-between items-center gap-6 mt-3">
              <div className="">
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
        <div className="w-full my-4">
          <CoverageCard
            progress={progress}
            details={details}
            setDetails={setDetails}
            setLookingForwards={setLookingForwards}
            lookingForwardsData={lookingForwardsData}
            handleRemoveIssueFromList={handleRemoveIssueFromList}
          />
        </div>

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
                  key={`${el.title}-${suggestionIndex}-${refreshKey}`}
                >
                  <BioMarkerRowOldSuggestions
                    index={suggestionIndex}
                    // isOverview
                    value={el}
                    onEdit={() => {}}
                    onchange={() => {}}
                    onDelete={() => {}}
                    issuesData={details}
                    setIssuesData={setDetails}
                    handleUpdateIssueListByKey={handleUpdateIssueListByKeys}
                    handleRemoveLookingForwards={handleRemoveLookingForwards}
                    handleRemoveIssueFromList={handleRemoveIssueFromList}
                  ></BioMarkerRowOldSuggestions>
                </div>
              </>
            );
          })}
      </div>
    </>
  );
};
