/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
// import RefrenceModal from './RefrenceData';
import SvgIcon from '../../../utils/svgIcon';
import EditModal from './EditModal';
import { MainModal } from '../../../Components';
import { Tooltip } from 'react-tooltip';

interface BioMarkerRowSuggestionsProps {
  value: any;
  onchange: (value: string) => void;
  onDelete: () => void;
  onEdit: (value: any) => void;
  editAble?: boolean;
  isOverview?: boolean;

  index?: number;
}

const BioMarkerRowSuggestions: React.FC<BioMarkerRowSuggestionsProps> = ({
  value,
  onchange,
  onDelete,
  onEdit,
  editAble,
  isOverview,
  index,
}) => {
  const resolveIcon = () => {
    switch (value.Category) {
      case 'Diet':
        return '/icons/diet.svg';
      case 'Mind':
        return '/icons/mind.svg';
      case 'Activity':
        return '/icons/weight.svg';
      case 'Supplement':
        return '/icons/Supplement.svg';
      case 'Lifestyle':
        return '/icons/LifeStyle2.svg';
      default:
        return '/icons/LifeStyle2.svg';
    }
  };

  const [showModal, setShowModal] = useState(false);
  const [editableValue, setEditAbleValue] = useState(value.Instruction);
  const [notes, setNotes] = useState<string[]>(value['Client Notes'] || []);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEditNote, setShowEditNote] = useState(false);
  console.log(value);

  useEffect(() => {
    onchange({
      ...value,
      note: editableValue,
    });
  }, [editableValue]);
  useEffect(() => {
    setEditAbleValue(value.Instruction);
    setNotes(value['Client Notes']);
  }, [value]);
  const handleAddNotes = (newNotes: string[]) => {
    setNotes(newNotes);
    onchange({
      ...value,
      notes: newNotes,
    });
  };
  const [deleteConfirm, setdeleteConfirm] = useState(false);
  useEffect(() => console.log(value), [value]);
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

  const { positive, negative } = splitInstructions(editableValue);
  const [ShowConflict, setShowConflict] = useState(false);
  const conflictData = [
    {
      title: 'Caloric Restriction (CRI) - Periodic Restriction - 3-Day Fasts',
      priority: 'Low',
      reason:
        'Like the previous entry, performing bodyweight training with high intensity while undergoing a period of extended caloric restriction can result in inadequate recovery and muscle repair. The body requires calories and nutrients to support strenuous activity. Combining these regimens can lead to overtraining syndrome, where symptoms include persistent fatigue, decreased performance, and potential for injury.',
    },
    {
      title: 'Caloric Restriction (CRI) - Periodic Restriction - 3-Day Fasts',
      priority: 'Medium',
      reason:
        'Like the previous entry, performing bodyweight training with high intensity while undergoing a period of extended caloric restriction can result in inadequate recovery and muscle repair. The body requires calories and nutrients to support strenuous activity. Combining these regimens can lead to overtraining syndrome, where symptoms include persistent fatigue, decreased performance, and potential for injury.',
    },
    {
      title: 'Caloric Restriction (CRI) - Periodic Restriction - 3-Day Fasts',
      priority: 'High',
      reason:
        'Like the previous entry, performing bodyweight training with high intensity while undergoing a period of extended caloric restriction can result in inadequate recovery and muscle repair. The body requires calories and nutrients to support strenuous activity. Combining these regimens can lead to overtraining syndrome, where symptoms include persistent fatigue, decreased performance, and potential for injury.',
    },
  ];
  const getBackgroundColor = (priority: string) => {
    switch (priority) {
      case 'Low':
        return 'bg-[#F9F7DC]'; // Light blue for the parent div
      case 'Medium':
        return 'bg-[#F9DEDC]'; // Light yellow for the parent div
      case 'High':
        return 'bg-[#FFD8E4]'; // Light red for the parent div
      default:
        return 'bg-[#F9F7DC]'; // Default color for the parent div
    }
  };

  const getCircleColor = (priority: string) => {
    switch (priority) {
      case 'Low':
        return 'bg-[#FFE500]'; // Blue for low priority
      case 'Medium':
        return 'bg-[#FFAB2C]'; // Yellow for medium priority
      case 'High':
        return 'bg-[#FC5474]'; // Red for high priority
      default:
        return 'bg-[#FFE500]'; // Default color for the circle
    }
  };
  console.log(value['Practitioner Comments'][0]);

  return (
    <>
      <MainModal isOpen={ShowConflict} onClose={() => setShowConflict(false)}>
        <div className="bg-white w-[500px] h-[666px] rounded-2xl p-4 shadow-800 relative">
          <div className="border-b border-Gray-50 pb-2 text-sm font-medium text-Text-Primary">
            Conflict
          </div>
          <div className="h-[580px] overflow-auto mt-3 flex flex-col ">
            {conflictData.map((el) => (
              <div className="mb-10">
                <div className="flex w-full justify-between">
                  <div className="text-xs font-medium text-Text-Primary">
                    {el.title}
                  </div>
                  <div
                    className={`rounded-full py-[2px] px-2.5 flex items-center gap-1 text-[10px] text-Text-Primary ${getBackgroundColor(el.priority)}`}
                  >
                    <div
                      className={`size-3 rounded-full ${getCircleColor(el.priority)}`}
                    ></div>
                    {el.priority}
                  </div>
                </div>
                <div className="flex w-full items-start gap-6 mt-5">
                  <div className="text-xs text-Text-Secondary">Reason:</div>
                  <div className="text-justify text-xs text-Text-Primary">
                    {el.reason}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div
            onClick={() => {
              setShowConflict(false);
            }}
            className="cursor-pointer text-[#909090] font-medium text-sm absolute right-4 bottom-4"
          >
            close
          </div>
        </div>
      </MainModal>
      <div className="w-full flex justify-center items-start gap-4">
        <div className="w-[60px] mt-3">
          <div className="w-full flex justify-center">
            <div className="w-[32px] flex justify-center items-center h-[32px] bg-backgroundColor-Main border border-gray-50 rounded-[8px]">
              <img className="w-[24px]" src={resolveIcon()} alt="" />
            </div>
          </div>
          <div className="text-Text-Primary mt-1 text-[10px] font-[500] text-center">
            {value.Category}
          </div>
        </div>
        <div
          className={`relative  ${isExpanded ? 'min-h-[120px]' : 'min-h-[50px]'} w-full  bg-white px-4 py-2 pr-10 rounded-[16px] items-center border border-Gray-50`}
        >
          <div className="w-[273px] flex justify-between items-center">
            <div className="flex gap-2 text-[8px]">
              <div
                data-tooltip-id="system-score"
                className="bg-[#E2F1F8] rounded-full px-2 flex items-center gap-1"
              >
                <div className="size-[5px] bg-[#005F73] rounded-full"></div>
                {value['System Score']}
                <Tooltip
                  id={'system-score'}
                  place="top"
                  className="!bg-white !w-[162px] !leading-5 !text-wrap  !text-[#888888] !text-[10px] !rounded-[6px] !border !border-Gray-50 !p-2"
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
                {value.Score}
                <Tooltip
                  id={'base-score'}
                  place="top"
                  className="!bg-white !w-[162px] !leading-5 !text-wrap  !text-[#888888] !text-[10px] !rounded-[6px] !border !border-Gray-50 !p-2"
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
              <div
                data-tooltip-id={index + 'score-calc'}
                className="text-Primary-DeepTeal select-none mt-[2px]"
              >
                Score Calculation
                <Tooltip
                  id={index + 'score-calc'}
                  place="top"
                  className="!bg-white !w-[270px] !leading-5 !text-wrap !text-[#888888] !text-[10px] !rounded-[6px] !border !border-Gray-50 !p-2"
                  style={{
                    zIndex: 9999,
                    pointerEvents: 'none',
                  }}
                >
                  <div className="text-Text-Primary text-[8px]">
                    {value['Practitioner Comments'][0]}
                  </div>
                </Tooltip>
              </div>
              <div
                onClick={() => setShowConflict(true)}
                className="ml-3 mb-[2px] flex gap-[2px] items-center text-[10px] text-[#F4A261] underline cursor-pointer "
              >
                <img src="/icons/alarm.svg" alt="" />
                Conflict <span>(2)</span>
              </div>
            </div>
          </div>
          <div className="text-[12px] gap-2 w-full ">
            {/* <textarea
              value={editableValue}
              onChange={(e) => setEditableValue(e.target.value)}
              className="bg-transparent text-[12px] outline-none w-full resize-none"
              rows={2}
            /> */}
            <div className="bg-transparent text-[12px] w-full outline-none  resize-none">
              <div className="text-Text-Primary">
                {' '}
                <span className="text-Text-Secondary bullet-point">
                  Positive:{' '}
                </span>
                {positive}
              </div>
              <div className="text-Text-Primary">
                <span className="text-Text-Secondary bullet-point">
                  Negative:{' '}
                </span>
                {negative}
              </div>{' '}
            </div>
            {/* {value['Based on'] && (
              <div
                onClick={() => setShowModal(true)}
                className="text-Text-Secondary text-xs contents md:inline-flex lg:inline-flex mt-2"
              >
                Based on your:{' '}
                <span className="text-Primary-DeepTeal flex items-center ml-1 gap-2 cursor-pointer">
                  {value['Based on']}{' '}
                  <SvgIcon src="/icons/export.svg" color="#005F73" />
                </span>
              </div>
            )} */}
          </div>
          {isExpanded && (
            <div className="flex flex-col mt-2 pt-1 border-t border-Gray-50">
              {notes?.map((note, index) => (
                <div
                  key={index}
                  className="bg-transparent flex gap-1 items-start text-[12px]"
                >
                  <span className="text-[10px]">Note:</span>{' '}
                  <div className="text-Text-Secondary text-[10px]">{note}</div>
                </div>
              ))}
            </div>
          )}
          <div className=" top-4 right-4  absolute">
            {isExpanded ? (
              <div
                onClick={() => {
                  setIsExpanded(false);
                  setdeleteConfirm(false);
                }}
                className="size-4 transition-transform rotate-180"
              >
                <SvgIcon
                  width="16px"
                  height="16px"
                  color="#005F73"
                  src="/icons/arow-down-drop.svg"
                />
              </div>
            ) : (
              <img
                onClick={() => {
                  setIsExpanded(true);
                  setdeleteConfirm(false);
                }}
                className={` ${isOverview && 'hidden'} cursor-pointer mb-2  size-4 transition-transform`}
                src="/icons/arow-down-drop.svg"
                alt=""
              />
            )}

            <div
              className={`${isExpanded && editAble ? 'flex' : 'hidden'} flex-col mt-1 items-center gap-[10px]`}
            >
              <img
                onClick={() => setShowEditNote(true)}
                className={`cursor-pointer w-4  ${deleteConfirm && 'hidden'}`}
                src="/icons/edit.svg"
                alt=""
              />
              {deleteConfirm ? (
                <div className="flex flex-col items-center gap-2 pb-1 text-Text-Secondary text-xs">
                  Sure?{' '}
                  <img
                    className="cursor-pointer mr-1"
                    onClick={() => {
                      setdeleteConfirm(false);
                      onDelete();
                    }}
                    src="/icons/confirm-tick-circle.svg"
                    alt=""
                  />
                  <img
                    className="cursor-pointer mr-1"
                    onClick={() => setdeleteConfirm(false)}
                    src="/icons/cansel-close-circle.svg"
                    alt=""
                  />
                </div>
              ) : (
                <div onClick={() => setdeleteConfirm(true)}>
                  <SvgIcon
                    src="/icons/delete.svg"
                    color="#FC5474"
                    width="16"
                    height="16px"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {showModal && (
        <MainModal isOpen={showModal} onClose={() => setShowModal(false)}>
          <div className="bg-white h-fit max-h-[600px] overflow-auto w-[500px]  p-6 pb-8 rounded-2xl shadow-800">
            <div className="border-b border-Gray-50 pb-2 w-full flex gap-2 items-center text-sm font-medium text-Text-Primary">
              <img src="/icons/notification-status.svg" alt="" /> Practitioner
              Comment
            </div>
            <div className="flex flex-col gap-2 mt-5">
              {value['Practitioner Comments']?.map(
                (comment: string, index: number) => (
                  <div
                    className="bg-backgroundColor-Card w-full rounded-2xl py-1 px-3 border border-Gray-50 text-xs text-Text-Primary text-justify "
                    key={index}
                  >
                    {comment}
                  </div>
                ),
              )}
            </div>
          </div>
        </MainModal>
        // <RefrenceModal
        //   reference={[]}
        //   isOpen={showModal}
        //   onClose={() => setShowModal(false)}
        // />
      )}
      {showEditNote && (
        <EditModal
          defalts={value}
          onSubmit={(editData) => {
            onEdit(editData);
          }}
          isOpen={showEditNote}
          onClose={() => setShowEditNote(false)}
          onAddNotes={handleAddNotes}
        />
      )}
    </>
  );
};

export default BioMarkerRowSuggestions;
