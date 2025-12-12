/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import MainModal from '../MainModal';
import Checkbox from '../checkbox';

interface CoverageCardProps {
  progress: number;
  details: Record<string, boolean>[];
  setDetails: (details: any) => void;
  setLookingForwards: (values: any) => void;
  lookingForwardsData: any;
  handleRemoveIssueFromList: (name: string) => void;
}

export const CoverageCard: React.FC<CoverageCardProps> = ({
  progress,
  details,
  setDetails,
  setLookingForwards,
  lookingForwardsData,
  handleRemoveIssueFromList,
}) => {
  const safeProgress = Math.min(100, Math.max(0, progress));
  const [addIssue, setAddIssue] = useState(false);
  const [newIssue, setNewIssue] = useState('');
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const getBarColor = () => {
    if (safeProgress <= 50) return 'bg-[#FC5474]';
    if (safeProgress > 80) return 'bg-[#06C78D]';
    if (safeProgress > 50 && safeProgress <= 80) return 'bg-[#FFAB2C]';
    return 'bg-green-500';
  };

  const getMessage = () => {
    if (safeProgress == 0) return 'Unlock Coverage with adding interventions.';
    if (safeProgress == 100)
      return 'Great job! You’ve selected interventions that fully cover all key areas.';
    return 'To fully cover the plan, make sure you select interventions that address all key areas.';
  };

  const [showDetail, setShowDetail] = useState(false);

  const handleAddIssue = (issue: string) => {
    if (issue.trim() === '') return;
    const name = 'Issue ' + (details.length + 1) + ': ' + issue;
    const newIssueList = [...details, { [name]: false }];
    setDetails(newIssueList);
    setLookingForwards([
      ...lookingForwardsData,
      'Issue ' + (lookingForwardsData.length + 1) + ': ' + issue,
    ]);
    setNewIssue('');
    setAddIssue(false);
  };

  return (
    <>
      <MainModal
        isOpen={showDetail}
        onClose={() => {
          setShowDetail(false);
          setAddIssue(false);
          setNewIssue('');
        }}
      >
        <div className="bg-white max-h-[408px] w-[90vw] md:w-[565px] p-4  md:p-6 pb-8 rounded-2xl shadow-800">
          <div className="border-b border-Gray-50 pb-2 w-full flex gap-2 items-center text-sm font-medium text-Text-Primary">
            Plan Coverage Details
          </div>

          <div className="mt-4 flex flex-col max-h-[220px] overflow-y-auto overflow-x-hidden">
            {details?.map((detail, index) => {
              const [text, isChecked] = Object.entries(detail)[0];
              const issueLabel = text.split(':')[0].trim();
              return (
                <div
                  key={index}
                  className={`flex select-none text-justify items-start text-Text-Primary break-all text-xs group relative py-1.5 pr-1 w-full md:w-[95%] ${
                    isChecked && ' line-through'
                  }`}
                >
                  <Checkbox
                    isDisabled
                    checked={isChecked}
                    onChange={() => {}}
                  />

                  <span className="text-Text-Secondary text-nowrap mr-1">
                    {issueLabel}:{' '}
                  </span>

                  {text?.split(':')[1]?.trim()}

                  {isDeleting === index + 1 ? (
                    <div className="flex flex-col items-center justify-center gap-[2px] absolute -right-4 -top-1">
                      <img
                        src="/icons/tick-circle-green.svg"
                        alt=""
                        className="w-[20px] h-[20px] cursor-pointer"
                        onClick={() => {
                          handleRemoveIssueFromList(text);
                          setDetails((prev: any) => {
                            const exists = prev.some((item: any) =>
                              Object.prototype.hasOwnProperty.call(item, text),
                            );
                            if (exists) {
                              return prev.filter(
                                (item: any) =>
                                  !Object.prototype.hasOwnProperty.call(
                                    item,
                                    text,
                                  ),
                              );
                            }
                          });
                          setIsDeleting(null);
                        }}
                      />

                      <img
                        src="/icons/close-circle-red.svg"
                        alt=""
                        className="w-[20px] h-[20px] cursor-pointer"
                        onClick={() => setIsDeleting(null)}
                      />
                    </div>
                  ) : (
                    <img
                      src="/icons/delete.svg"
                      alt=""
                      className="absolute -right-4 opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 cursor-pointer"
                      onClick={() => setIsDeleting(index + 1)}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center text-Primary-DeepTeal text-xs font-medium gap-1 border-t border-b border-Gray-50 rounded-md py-3 mt-3">
            {addIssue ? (
              <>
                <input
                  type="text"
                  placeholder="Type new issue and press Enter..."
                  value={newIssue}
                  onChange={(e) => setNewIssue(e.target.value)}
                  className="w-full h-[28px] px-2 outline-none bg-backgroundColor-Card border-Gray-50 border rounded-2xl text-Text-Primary placeholder:text-Text-Fivefold text-[10px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setAddIssue(false);
                      handleAddIssue(newIssue);
                    }
                  }}
                />
              </>
            ) : (
              <div
                className="flex items-center gap-1 cursor-pointer"
                onClick={() => setAddIssue(true)}
              >
                <img src="/icons/add-small.svg" alt="" className="w-5 h-5" />
                Create new issue
              </div>
            )}
          </div>

          <div
            onClick={() => {
              setShowDetail(false);
              setAddIssue(false);
              setNewIssue('');
            }}
            className="w-full mt-4 flex justify-end text-sm font-medium text-Disable cursor-pointer"
          >
            close
          </div>
        </div>
      </MainModal>

      {/* ============================= */}
      {/* RESPONSIVE CARD STARTS HERE */}
      {/* ============================= */}

      <div className="relative flex flex-col md:flex-row fw-full select-none h-auto md:h-[53px] items-start md:items-center justify-between gap-2 bg-backgroundColor-Main px-2 py-1 rounded-lg">
        {/* Message — top on mobile, centered on desktop */}
        <div className="flex pb-3 2xl:pb-0  md:absolute md:left-1/2 md:-translate-x-1/2 items-center justify-center gap-1 text-[10px] md:text-xs text-Text-Primary order-1 md:order-none">
          {safeProgress == 100 ? (
            <img src="/icons/copy-success.svg" />
          ) : (
            <img src="/icons/danger-fill.svg" />
          )}
          <p>{getMessage()}</p>
        </div>

        {/* Bottom row (Progress + View details) */}
        <div className="flex w-full justify-between items-center order-2 md:order-none">
          {/* Progress */}
          <div className="flex flex-col w-full md:w-[352px] gap-1">
            <div className="flex items-start gap-1">
              <div className="text-[10px] md:text-xs font-medium text-Text-Primary">
                {safeProgress}%
              </div>
              <div className="text-[8px] md:text-[10px] text-Text-Quadruple">
                Coverage
              </div>
            </div>

            <div className="h-2 w-full rounded-[64px] bg-[#E0E0E0] overflow-hidden">
              <div
                className={`h-full ${getBarColor()} transition-all duration-500`}
                style={{ width: `${safeProgress}%` }}
              />
            </div>
          </div>

          {/* View details */}
          <div
            onClick={() => {
              if (details.length > 0) setShowDetail(true);
            }}
            className={`text-[8px] md:text-xs pr-3 xs:pr-2 md:pr-0 mb-4 xl:mb-0 text-nowrap text-Primary-DeepTeal flex items-center gap-1 ${
              details.length > 0
                ? 'cursor-pointer opacity-100'
                : 'cursor-not-allowed opacity-50'
            }`}
          >
            View details
            <img className="size-4" src="/icons/external-link.svg" alt="" />
          </div>
        </div>
      </div>
    </>
  );
};
