import { Tooltip } from 'react-tooltip';
// import { splitInstructions } from '../../help';
import { FC } from 'react';
import TooltipTextAuto from '../TooltipText/TooltipTextAuto';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface TreatmentCardProps {
  data: any;
  isOther?: boolean;
  index: number;
}
const TreatmentCard: FC<TreatmentCardProps> = ({ data, isOther, index }) => {
  console.log(isOther);
  // const { positive, negative } = splitInstructions(data.Notes);
  return (
    <div className="w-[354px] no-split print:w-full min-h-[234px] text-justify  print:h-auto flex flex-col px-4 py-2 bg-backgroundColor-Card border border-Gray-50 rounded-2xl relative text-Text-Primary ">
      <div className="w-full flex flex-col  flex-wrap gap-3">
        <div className="text-sm  text-Text-Primary ">
          <TooltipTextAuto maxWidth="280px">{data?.title}</TooltipTextAuto>
          <div
            data-tooltip-id={`score-calc-${index}`}
            className="text-Primary-DeepTeal select-none  ml-1 cursor-pointer text-[10px]"
          >
            Analysis Info{' '}
            <Tooltip
              id={`score-calc-${index}`}
              place="top"
              className="!bg-white !w-[270px] !leading-5 text-justify !text-wrap !text-[#888888] !text-[10px] !rounded-[6px] !border !border-Gray-50 !p-2 !opacity-100"
              style={{
                zIndex: 9999,
                pointerEvents: 'none',
              }}
            >
              <div className="text-Text-Secondary">
                {data?.['Practitioner Comments']?.[0]}
              </div>
            </Tooltip>
          </div>
        </div>
        {/* {!isOther && (
          <div className="flex gap-2 text-[8px]">
            <div
              data-tooltip-id="system-score"
              className="bg-[#E2F1F8] select-none rounded-full px-2 flex items-center gap-1"
            >
              <div className="size-[5px] bg-[#005F73] rounded-full"></div>
              {data['System Score'] ? data['System Score'] : '-'}
              <Tooltip
                id={`system-score-${index}`}
                place="top"
                className="!bg-white !leading-5 !text-wrap  !text-[#888888] !text-[11px] !rounded-[6px] !border !border-Gray-50 !p-2"
                style={{
                  zIndex: 9999,
                  pointerEvents: 'none',
                }}
              >
                <div className="text-Text-Primary font-medium">
                  System Score
                </div>
                <div className="text-Text-Secondary ">
                  Score based on all data and AI insights.
                </div>
              </Tooltip>
            </div>
            <div
              data-tooltip-id="base-score"
              className="bg-[#DAF6C6] select-none rounded-full px-2 flex items-center gap-1"
            >
              <div className="size-[5px] bg-[#6CC24A] rounded-full"></div>
              {data.Score ? data.Score : '-'}
              <Tooltip
                id={`base-score-${index}`}
                place="top"
                className="!bg-white !leading-5 !text-wrap  !text-[#888888] !text-[11px] !rounded-[6px] !border !border-Gray-50 !p-2"
                style={{
                  zIndex: 9999,
                  pointerEvents: 'none',
                }}
              >
                <div className="text-Text-Primary font-medium">Base Score</div>
                <div className="text-Text-Secondary">
                  Initial score from core health metrics.
                </div>
              </Tooltip>
            </div>
          </div>
        )} */}
      </div>

      <div className="bg-transparent text-[12px] w-full outline-none  resize-none">
        <>
          {/* {positive && negative ? (
            <>
              {positive && (
                <>
                  <div className="text-Text-Primary">
                    <span className="text-Text-Secondary"></span>
                    <span className="text-justify bullet-point">
                      {positive}
                    </span>
                  </div>
                </>
              )}
              {negative && (
                <>
                  <div className="text-Text-Primary mt-3">
                    <span className="text-Text-Secondary"></span>
                    <span className="text-justify bullet-point">
                      {negative}
                    </span>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <div className="text-Text-Primary break-all flex justify-start bullet-point break-words text-justify mt-3">
                {data?.Notes}
              </div>{' '}
            </>
          )} */}
          {data?.Notes.map((el: any) => {
            return (
              <>
                <div
                  className={`text-Text-Primary break-all flex justify-start bullet-point break-words text-justify mt-3 first:mt-1.5`}
                >
                  {el}
                </div>{' '}
              </>
            );
          })}
        </>
      </div>
      {/* <div className="text-xs font-medium text-Primary-DeepTeal select-none">
        {' '}
        {data?.Based}
      </div> */}
    </div>
  );
};

export default TreatmentCard;
