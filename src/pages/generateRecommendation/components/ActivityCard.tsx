/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from 'react';
import { Tooltip } from 'react-tooltip';
import Checkbox from '../../../Components/checkbox';
import ConflictsModal from '../../../Components/NewGenerateActionPlan/components/ConflictsModal';
import TooltipTextAuto from '../../../Components/TooltipText/TooltipTextAuto';
import { splitInstructions } from '../../../help';

interface ActivityCardProps {
  item: any;
  index: number;
  activeCategory: string;
  handleCheckboxChange: (category: string, itemId: number) => void;
}

export const ActivityCard: FC<ActivityCardProps> = ({
  item,
  index,
  activeCategory,
  handleCheckboxChange,
}) => {
  const { positive, negative } = splitInstructions(item.Instruction);
  const [Conflicts] = useState<Array<any>>(item?.flag?.conflicts);
  const [ShowConflict, setShowConflict] = useState(false);
  const [color, setColor] = useState<string>('');
  const [bgColor, setBgColor] = useState<string>('');

  useEffect(() => {
    switch (item?.label) {
      case 'Highly Recommended':
        setColor('#06C78D');
        setBgColor('#DEF7EC');
        break;
      case 'Use Caution':
        setColor('#FFAB2C');
        setBgColor('#F9DEDC');
        break;
      case 'Beneficial':
        setColor('#4C88FF');
        setBgColor('#CADCFF');
        break;
      case 'Avoid':
        setColor('#FC5474');
        setBgColor('#FFD8E4');
        break;
      default:
        setColor('#06C78D');
        setBgColor('#DEF7EC');
        break;
    }
  }, [item?.label]);
  console.log(item.label);

  return (
    <>
      <ConflictsModal
        showModal={ShowConflict}
        setShowModal={setShowConflict}
        conflicts={Conflicts}
      ></ConflictsModal>

      <div className="flex items-center gap-2 mb-3">
        <div className="hidden md:block">
          <Checkbox
            checked={item.checked}
            onChange={() => handleCheckboxChange(activeCategory, index)}
          />
        </div>

        <ul className="md:pl-8 w-full bg-white rounded-2xl border border-Gray-50 py-3 px-4 text-xs text-Text-Primary">
          <div className="w-full flex flex-wrap gap-3 md:gap-4 items-center mb-2">
            <div className="text-Text-Primary text-xs font-medium flex items-center">
              <div className="block md:hidden">
                <Checkbox
                  checked={item.checked}
                  onChange={() => handleCheckboxChange(activeCategory, index)}
                />
              </div>
              <label
                className="block md:hidden"
                onClick={() => handleCheckboxChange(activeCategory, index)}
              >
                {' '}
                <TooltipTextAuto tooltipPlace="top" maxWidth="800px">
                  {item.Recommendation}
                </TooltipTextAuto>
              </label>
              <div className="hidden md:block">
                <TooltipTextAuto tooltipPlace="top" maxWidth="800px">
                  {item.Recommendation}
                </TooltipTextAuto>
              </div>
            </div>
            <div className="flex gap-2 text-[8px]">
              <div
                className={`bg-[${bgColor}] ${item?.label === 'Beneficial' && '!bg-[#CADCFF]'} select-none rounded-full px-2 py-[2px] flex items-center gap-1 text-[8px] text-Text-Primary`}
              >
                <div
                  className={`size-[8px] select-none ${item?.label === 'Beneficial' && '!bg-[#4C88FF]'}   bg-[${color}] rounded-full`}
                ></div>
                {item?.label || '-'}
              </div>
              {/* <div
                data-tooltip-id="system-score"
                className="bg-[#E2F1F8] select-none rounded-full px-2 flex items-center gap-1 cursor-pointer"
              >
                <div className="size-[5px] select-none bg-[#005F73] rounded-full"></div>
                {item['System Score'] ? item['System Score'] : '-'}
                <Tooltip
                  id={'system-score'}
                  place="top"
                  className="!bg-white !w-[162px] !text-justify  !leading-5 !text-wrap !text-[#888888] !text-[8px] !rounded-[6px] !border !border-Gray-50 !p-2"
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
              </div> */}
              {/* <div
                data-tooltip-id="base-score"
                className="bg-[#DAF6C6] select-none rounded-full px-2 flex items-center gap-1 cursor-pointer"
              >
                <div className="size-[5px] select-none bg-[#6CC24A] rounded-full"></div>
                {item.Score ? item.Score : '-'}
                <Tooltip
                  id={'base-score'}
                  place="top"
                  className="!bg-white !w-[162px] !leading-5 !text-justify  !text-wrap !text-[#888888] !text-[8px] !rounded-[6px] !border !border-Gray-50 !p-2"
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
              </div> */}
              <div
                data-tooltip-id={index + 'score-calc'}
                className="text-Primary-DeepTeal select-none mt-[2px] text-[8px]"
              >
                Analysis Info{' '}
                <Tooltip
                  id={index + 'score-calc'}
                  place="top"
                  className="!bg-white !bg-opacity-100 !opacity-100 !w-[270px] text-justify !leading-5 !text-wrap !text-[#888888] !text-[8px] !rounded-[6px] !border !border-Gray-50 !p-2"
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
          <li className="mb-1.5 text-justify">
            <span className="text-Text-Secondary bullet-point">
              Key Benefits:
            </span>{' '}
            {positive}
          </li>
          <li className=" text-justify">
            <span className="text-Text-Secondary bullet-point">Key Risks:</span>{' '}
            {negative}
          </li>
        </ul>
      </div>
    </>
  );
};
