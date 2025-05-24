/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Tooltip } from 'react-tooltip';
import Checkbox from '../../../Components/checkbox';
import ConflictsModal from '../../../Components/NewGenerateActionPlan/components/ConflictsModal';
import { splitInstructions } from '../../../help';

interface ActivityCardProps {
  item: any;
  index: number;
  activeCategory: string;
  handleCheckboxChange: (category: string, itemId: number) => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  item,
  index,
  activeCategory,
  handleCheckboxChange,
}) => {
  const { positive, negative } = splitInstructions(item.Instruction);
  const [Conflicts] = useState<Array<any>>(item?.flag?.conflicts);
  const [ShowConflict, setShowConflict] = useState(false);

  return (
    <>
      <ConflictsModal
        showModal={ShowConflict}
        setShowModal={setShowConflict}
        conflicts={Conflicts}
      ></ConflictsModal>

      <div className="flex items-center gap-2 mb-3">
        <Checkbox
          checked={item.checked}
          onChange={() => handleCheckboxChange(activeCategory, index)}
        />
        <ul className="pl-8 w-full bg-white rounded-2xl border border-Gray-50 py-3 px-4 text-xs text-Text-Primary">
          <div className="w-full flex gap-6 items-center mb-4">
            <div className="text-Text-Primary text-xs font-medium">
              {item.Recommendation}
            </div>
            <div className="flex gap-2 text-[8px]">
              <div
                data-tooltip-id="system-score"
                className="bg-[#E2F1F8] select-none rounded-full px-2 flex items-center gap-1 cursor-pointer"
              >
                <div className="size-[5px] select-none bg-[#005F73] rounded-full"></div>
                {item['System Score'] ? item['System Score'] : '-'}
                <Tooltip
                  id={'system-score'}
                  place="top"
                  className="!bg-white !w-[162px] !leading-5 !text-wrap !text-[#888888] !text-[8px] !rounded-[6px] !border !border-Gray-50 !p-2"
                  style={{
                    zIndex: 9999,
                    pointerEvents: 'none',
                  }}
                >
                  <div className="text-Text-Primary">System Score</div>
                  <div className="text-Text-Secondary">
                    Score based on all data and AI insights.
                  </div>
                </Tooltip>
              </div>
              <div
                data-tooltip-id="base-score"
                className="bg-[#DAF6C6] select-none rounded-full px-2 flex items-center gap-1 cursor-pointer"
              >
                <div className="size-[5px] select-none bg-[#6CC24A] rounded-full"></div>
                {item.Score ? item.Score : '-'}
                <Tooltip
                  id={'base-score'}
                  place="top"
                  className="!bg-white !w-[162px] !leading-5 !text-wrap !text-[#888888] !text-[8px] !rounded-[6px] !border !border-Gray-50 !p-2"
                  style={{
                    zIndex: 9999,
                    pointerEvents: 'none',
                  }}
                >
                  <div className="text-Text-Primary">Base Score</div>
                  <div className="text-Text-Secondary">
                    Initial score from core health metrics.
                  </div>
                </Tooltip>
              </div>
              <div
                data-tooltip-id={index + 'score-calc'}
                className="text-Primary-DeepTeal select-none mt-[2px] text-[8px]"
              >
                Analysis Info{' '}
                <Tooltip
                  id={index + 'score-calc'}
                  place="top"
                  className="!bg-white !w-[270px] text-justify !leading-5 !text-wrap !text-[#888888] !text-[8px] !rounded-[6px] !border !border-Gray-50 !p-2"
                  style={{
                    zIndex: 9999,
                    pointerEvents: 'none',
                  }}
                >
                  <div className="text-Text-Primary text-[8px]">
                    {item['Practitioner Comments'][0]}
                  </div>
                </Tooltip>
              </div>
              {Conflicts?.length > 0 && (
                <div
                  onClick={() => setShowConflict(true)}
                  className="ml-3 mb-[2px] flex gap-[2px] items-center text-[10px] text-[#F4A261] underline cursor-pointer"
                >
                  <img src="/icons/alarm.svg" alt="" />
                  Conflict <span>({Conflicts?.length})</span>
                </div>
              )}
            </div>
          </div>
          <li className="  mb-2.5">
            <span className="text-Text-Secondary bullet-point">
              Key Benefits:
            </span>{' '}
            {positive}
          </li>
          <li className="">
            <span className="text-Text-Secondary bullet-point">Key Risks:</span>{' '}
            {negative}
          </li>
        </ul>
      </div>
    </>
  );
};
