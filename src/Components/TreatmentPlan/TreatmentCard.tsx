import { Tooltip } from 'react-tooltip';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface TreatmentCardProps {
  data: any;
  isOther?: boolean;
}
const TreatmentCard: React.FC<TreatmentCardProps> = ({ data, isOther }) => {
  return (
    <div className="w-[354px] no-split print:w-full h-full  print:h-auto flex flex-col gap-4 px-4 py-2 bg-backgroundColor-Card border border-Gray-50 rounded-2xl relative text-Text-Primary ">
      <div className="w-full flex justify-between items-center flex-wrap gap-3">
        <div className="text-sm text-Text-Primary ">{data?.title}</div>
        {!isOther && (
          <div className="flex gap-2 text-[8px]">
            <div
              data-tooltip-id="system-score"
              className="bg-[#E2F1F8] rounded-full px-2 flex items-center gap-1"
            >
              <div className="size-[5px] bg-[#005F73] rounded-full"></div>
              8.5
              <Tooltip
                id={'system-score'}
                place="top"
                className="!bg-white !w-[162px] !leading-5 !text-wrap !shadow-100 !text-[#888888] !text-[10px] !rounded-[6px] !border !border-Gray-50 !p-2"
                style={{
                  zIndex: 9999,
                  pointerEvents: 'none',
                }}
              >
                <div>System Score</div>
                <div className="text-Text-Secondary">
                  Score based on all data and AI insights.
                </div>
              </Tooltip>
            </div>
            <div
              data-tooltip-id="base-score"
              className="bg-[#DAF6C6] rounded-full px-2 flex items-center gap-1"
            >
              <div className="size-[5px] bg-[#6CC24A] rounded-full"></div>
              8.5
              <Tooltip
                id={'base-score'}
                place="top"
                className="!bg-white !w-[162px] !leading-5 !text-wrap !shadow-100 !text-[#888888] !text-[10px] !rounded-[6px] !border !border-Gray-50 !p-2"
                style={{
                  zIndex: 9999,
                  pointerEvents: 'none',
                }}
              >
                <div>Base Score</div>
                <div className="text-Text-Secondary">
                  Initial score from core health metrics.
                </div>
              </Tooltip>
            </div>
            <div className="text-Primary-DeepTeal select-none">
              Score Calculation
              <Tooltip
                id={'base-score'}
                place="top"
                className="!bg-white !w-[162px] !leading-5 !text-wrap !shadow-100 !text-[#888888] !text-[10px] !rounded-[6px] !border !border-Gray-50 !p-2"
                style={{
                  zIndex: 9999,
                  pointerEvents: 'none',
                }}
              >
                <div>Base Score</div>
                <div className="text-Text-Secondary">
                  Initial score from core health metrics.
                </div>
              </Tooltip>
            </div>
          </div>
        )}
      </div>

      <div className=" text-Text-Secondary text-xs ">
        <span className="text-Text-Primary text-xs">Notes:</span> {data?.Notes}
      </div>
      {/* <div className="text-xs font-medium text-Primary-DeepTeal select-none">
        {' '}
        {data?.Based}
      </div> */}
    </div>
  );
};

export default TreatmentCard;
