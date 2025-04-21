import { Tooltip } from 'react-tooltip';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface TreatmentCardProps {
  data: any;
  isOther?: boolean;
  index: number;
}
const TreatmentCard: React.FC<TreatmentCardProps> = ({
  data,
  isOther,
  index,
}) => {
  const splitInstructions = (instruction: string) => {
    const positiveMatch = instruction?.match(
      /Positive:\s*(.+?)(?=\s*Negative:|$)/,
    );
    const negativeMatch = instruction?.match(/Negative:\s*(.+)/);
    return {
      positive: positiveMatch ? positiveMatch[1].trim() : '',
      negative: negativeMatch ? negativeMatch[1].trim() : '',
    };
  };
  console.log(data);

  const { positive, negative } = splitInstructions(data.Notes);
  return (
    <div className="w-[354px] no-split print:w-full h-full text-justify  print:h-auto flex flex-col gap-4 px-4 py-2 bg-backgroundColor-Card border border-Gray-50 rounded-2xl relative text-Text-Primary ">
      <div className="w-full flex justify-between items-center flex-wrap gap-3">
        <div className="text-sm text-Text-Primary ">{data?.title}</div>
        {!isOther && (
          <div className="flex gap-2 text-[8px]">
            <div
              data-tooltip-id="system-score"
              className="bg-[#E2F1F8] rounded-full px-2 flex items-center gap-1"
            >
              <div className="size-[5px] bg-[#005F73] rounded-full"></div>
              {data['System Score']}
              <Tooltip
                id={'system-score'}
                place="top"
                className="!bg-white !w-[162px] !leading-5 !text-wrap 
                 !text-[#888888] !shadow-100 !text-[8px] !rounded-[6px] !border !border-Gray-50 !p-2"
                style={{
                  zIndex: 9999,
                  pointerEvents: 'none',
                }}
              >
                <div className="text-Text-Primary font-medium">
                  System Score
                </div>
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
              {data.Score}
              <Tooltip
                id={'base-score'}
                place="top"
                className="!bg-white !w-[162px] !shadow-100 !leading-5 !text-wrap 
                 !text-[#888888] !text-[8px] !rounded-[6px] !border !border-Gray-50 !p-2"
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
            <div
              data-tooltip-id={index + 'calc-score'}
              className="text-Primary-DeepTeal select-none"
            >
              Score Calculation
              <Tooltip
                id={index + 'calc-score'}
                place="top"
                className="!bg-white !w-[162px] !leading-5 !bg-opacity-100 !shadow-100 !text-wrap !text-[#888888] !text-[8px] !rounded-[6px] !border !border-Gray-50 !p-2"
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
        )}
      </div>

      <div className="bg-transparent text-[12px] w-full outline-none  resize-none">
        <div className="text-Text-Primary">
          {' '}
          <span className="text-Text-Secondary text-justify ">Positive: </span>
          {positive}
        </div>
        <div className="text-Text-Primary text-justify mt-3">
          <span className="text-Text-Secondary">Negative: </span>
          {negative}
        </div>{' '}
      </div>
      {/* <div className="text-xs font-medium text-Primary-DeepTeal select-none">
        {' '}
        {data?.Based}
      </div> */}
    </div>
  );
};

export default TreatmentCard;
