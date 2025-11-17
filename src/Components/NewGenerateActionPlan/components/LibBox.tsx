import { FC, useEffect, useState } from 'react';
import { Tooltip } from 'react-tooltip';
import ConflictsModal from './ConflictsModal';
import EllipsedTooltip from '../../LibraryThreePages/components/TableNoPaginate/ElipsedTooltip';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface LibBoxProps {
  data: any;
  onAdd: () => void;
  checkIn?: boolean;
  handleShowConflictsModal?: () => void;
  index?: number;
}

const LibBox: FC<LibBoxProps> = ({
  data,
  onAdd,
  checkIn,
  handleShowConflictsModal,
  index,
}) => {
  const [valueData, setValueData] = useState('');
  useEffect(() => {
    switch (data.Category) {
      case 'Diet':
        setValueData('Macros');
        break;
      case 'Supplement':
        setValueData('Dose');
        break;
      case 'Lifestyle':
        setValueData('Value');
        break;
      case 'Activity':
        setValueData('File');
        break;
    }
  }, [data.Category]);
  const [showMore, setShowMore] = useState(false);
  const [showConflicts, setShowConflicts] = useState(false);
  const [color, setColor] = useState<string>('');
  const [bgColor, setBgColor] = useState<string>('');
  useEffect(() => {
    switch (data?.label) {
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
  }, [data?.label]);
  console.log(data);

  return (
    <>
      <div className="w-full overflow-hidden bg-white border border-gray-50 rounded-[12px] py-3 px-3">
        <div className="flex justify-between items-center">
          <div className="flex justify-start gap-2 items-center">
            <img
              onClick={onAdd}
              className="w-4 cursor-pointer"
              src="/icons/add-square-green.svg"
              alt=""
            />
            <div
              className="select-none text-[12px] text-Text-Primary w-[200px] overflow-hidden cursor-text"
              style={{
                textWrap: 'nowrap',
              }}
            >
              <EllipsedTooltip text={data.Title} />
            </div>
          </div>
          {!checkIn && (
            <img
              onClick={() => {
                setShowMore(!showMore);
              }}
              className={`cursor-pointer ${showMore ? 'rotate-180' : ''}`}
              src="/icons/arrow-down-blue.svg"
              alt=""
            />
          )}
        </div>
        {!checkIn && (
          <div
            className={`${showMore ? '' : 'ml-'} mt-2 flex  items-center flex-wrap gap-2 justify-between`}
          >
            <div className={`flex  items-center gap-1`}>
              <div
                className={`select-none rounded-full px-2 py-[2px] flex items-center gap-1 text-[8px] text-Text-Primary text-nowrap`}
                style={{ backgroundColor: bgColor }}
              >
                <div
                  className={`size-[8px] select-none rounded-full`}
                  style={{ backgroundColor: color }}
                ></div>
                {data?.label || '-'}
              </div>
              {data.holisticare_recommendation && (
                <div
                  className={`select-none rounded-full px-2 py-[2px] h-[14px] text-nowrap flex items-center gap-1 text-[8px] text-Text-Primary `}
                  style={{ backgroundColor: '#E2F1F8' }}
                >
                  <div
                    className={`size-[8px] select-none rounded-full`}
                    style={{ backgroundColor: '#005F73' }}
                  ></div>
                  Holistic Plan Recommended
                </div>
              )}
              {/* <div
                className="w-[35px] h-[14px] rounded-3xl bg-Boarder gap-[2.5px] text-[8px] text-Text-Primary flex items-center justify-center cursor-pointer"
                data-tooltip-id={`tooltip-system-score-${index}`}
              >
                <span
                  className={`w-[5px] h-[5px] rounded-full bg-Primary-DeepTeal`}
                />
                {data['System Score'] ? data['System Score'] : '-'}
              </div>
              <Tooltip
                id={`tooltip-system-score-${index}`}
                place="top"
                className="!bg-white !leading-5 !shadow-100 !text-[10px] !rounded-[6px] !border !border-gray-50 flex flex-col !z-20"
              >
                <div className="font-medium text-[10px] text-Text-Primary">
                  System Score
                </div>
                <div className="text-[10px] text-Text-Quadruple">
                  Initial score from core health metrics.
                </div>
              </Tooltip> */}
              {/* <div
                className="w-[35px] h-[14px] rounded-3xl bg-[#DAF6C6] gap-[2.5px] text-[8px] text-Text-Primary flex items-center justify-center cursor-pointer"
                data-tooltip-id={`tooltip-base-score-${index}`}
              >
                <span
                  className={`w-[5px] h-[5px] rounded-full bg-Primary-EmeraldGreen`}
                />
                {data.Base_Score ? data.Base_Score : '-'}
              </div>
              <Tooltip
                id={`tooltip-base-score-${index}`}
                place="top"
                className="!bg-white !leading-5 !shadow-100 !text-[10px] !rounded-[6px] !border !border-gray-50 flex flex-col !z-20"
              >
                <div className="font-medium text-[10px] text-Text-Primary">
                  Base Score
                </div>
                <div className="text-[10px] text-Text-Quadruple">
                  Score based on all data and AI insights.
                </div>
              </Tooltip> */}
              <div
                className="text-[8px] text-Primary-DeepTeal cursor-pointer"
                data-tooltip-id={`tooltip-score-calculation-${index}`}
              >
                Analysis Info{' '}
              </div>
              <Tooltip
                id={`tooltip-score-calculation-${index}`}
                place="top"
                className="!bg-white !w-[300px] !leading-5 !shadow-100 !text-wrap !text-Text-Quadruple !text-[10px] !rounded-[6px] !border !border-gray-50 flex flex-col !z-20"
              >
                {data['Practitioner Comments'][0]}
              </Tooltip>
            </div>
            {data.flag && data.flag.conflicts.length > 0 && (
              <button
                className="flex items-center gap-1 cursor-pointer"
                onClick={() => {
                  if (handleShowConflictsModal) {
                    handleShowConflictsModal();
                  }
                  setShowConflicts(true);
                }}
              >
                <img src="/icons/alarm.svg" alt="" className="w-3 h-3" />
                <div className="text-[10px] text-[#FFAB2C] underline">
                  Conflict
                </div>
                <div className="text-[10px] text-[#FFAB2C]">
                  ({data.flag.conflicts.length})
                </div>
              </button>
            )}
          </div>
        )}
        {showMore && (
          <div className="mt-2">
            <div className="flex justify-start mt-1 items-start">
              <div className="text-Text-Secondary text-[10px]  flex justify-start items-center text-nowrap">
                • Instruction:
              </div>
              <div className="text-[10px] text-Text-Primary text-justify ml-1">
                {data.Instruction}
              </div>
            </div>
            <div className="flex justify-start mt-1 items-start">
              <div className="text-Text-Secondary text-[10px]  flex justify-start items-center text-nowrap">
                • {valueData}:
              </div>
              <div className="text-[10px] text-Text-Primary text-justify ml-1">
                {valueData === 'Macros' ? (
                  <div className="flex justify-start items-center gap-4 ml-3.5">
                    <div className="flex justify-start items-center">
                      Carbs: {data['Total Macros']?.Carbs}
                      <div className="text-Text-Quadruple">gr</div>
                    </div>
                    <div className="flex justify-start items-center">
                      Protein: {data['Total Macros']?.Protein}
                      <div className="text-Text-Quadruple">gr</div>
                    </div>
                    <div className="flex justify-start items-center">
                      Fat: {data['Total Macros']?.Fats}
                      <div className="text-Text-Quadruple">gr</div>
                    </div>
                  </div>
                ) : (
                  data[valueData]
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      {data.flag && data.flag.conflicts.length > 0 && (
        <ConflictsModal
          conflicts={data.flag.conflicts}
          setShowModal={setShowConflicts}
          showModal={showConflicts}
          handleShowConflictsModal={handleShowConflictsModal}
        />
      )}
    </>
  );
};
export default LibBox;
