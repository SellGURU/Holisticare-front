/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from 'react';
// import RefrenceModal from './RefrenceData';
import { Tooltip } from 'react-tooltip';
import { MainModal } from '../../../Components';
import ConflictsModal from '../../../Components/NewGenerateActionPlan/components/ConflictsModal';
import TooltipTextAuto from '../../../Components/TooltipText/TooltipTextAuto';
import { splitInstructions } from '../../../help';
import SvgIcon from '../../../utils/svgIcon';
import EditModal from './EditModal';

interface BioMarkerRowOldSuggestionsProps {
  value: any;
  onchange: (value: string) => void;
  onDelete: () => void;
  onEdit: (value: any) => void;
  editAble?: boolean;
  // isOverview?: boolean;

  index?: number;
}

const BioMarkerRowOldSuggestions: FC<BioMarkerRowOldSuggestionsProps> = ({
  value,
  onchange,
  onDelete,
  onEdit,
  editAble,
  // isOverview,
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
        return '/icons/others.svg';
    }
  };

  const [showModal, setShowModal] = useState(false);
  const [editableValue, setEditAbleValue] = useState(value.Instruction);
  const [notes, setNotes] = useState<string[]>(value['Client Notes'] || []);
  // const [isExpanded, setIsExpanded] = useState(false);
  const [showEditNote, setShowEditNote] = useState(false);
  const [showMore, setShowMore] = useState(false);
  useEffect(() => {
    onchange({
      ...value,
      note: editableValue,
    });
  }, [editableValue]);
  useEffect(() => {
    setEditAbleValue(value.Instruction);
    const { positive, negative } = splitInstructions(value.Instruction);
    setclient_version(
      Array.isArray(value.client_version)
        ? value.client_version
        : [positive, negative],
    );
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
  const [color, setColor] = useState<string>('');
  const [bgColor, setBgColor] = useState<string>('');
  const { positive, negative } = splitInstructions(editableValue);

  // console.log(value);
  const [Conflicts] = useState<Array<any>>(value?.flag?.conflicts);
  const [ShowConflict, setShowConflict] = useState(false);
  const [client_version, setclient_version] = useState(
    Array.isArray(value.client_version)
      ? value.client_version
      : [positive, negative],
  );
  useEffect(() => {
    switch (value?.label) {
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
  }, [value?.label]);
  console.log(value.label);

  return (
    <>
      <ConflictsModal
        showModal={ShowConflict}
        setShowModal={setShowConflict}
        conflicts={Conflicts}
      ></ConflictsModal>
      <div className="w-full flex flex-col md:flex-row justify-center items-start gap-2 md:gap-4">
        <div className="w-[60px] mt-3">
          <div className="w-full flex justify-center">
            <div className="w-[32px] flex justify-center items-center h-[32px] bg-backgroundColor-Main border border-gray-50 rounded-[8px]">
              <img className="w-[24px]" src={resolveIcon()} alt="" />
            </div>
          </div>
          <div className="text-Text-Primary mt-1 text-[10px] font-[500] text-center">
            <TooltipTextAuto maxWidth="800px" tooltipPlace="top">
              {value.Category}
            </TooltipTextAuto>
          </div>
        </div>
        <div
          className={`relative min-h-[120px] w-full bg-white px-4 py-3 pr-10 rounded-[16px] items-center border border-Gray-50`}
        >
          <div className=" flex flex-wrap gap-6 items-center">
            <div className="text-xs font-medium text-Text-Primary">
              <TooltipTextAuto tooltipPlace="top" maxWidth="800px">
                {value.Recommendation}
              </TooltipTextAuto>
            </div>
            <div className="flex gap-2 text-[8px]">
              {(value.Category == 'Diet' ||
                value.Category == 'Activity' ||
                value.Category == 'Lifestyle' ||
                value.Category == 'Supplement') && (
                <>
                  <div
                    className={`select-none rounded-full px-2 py-[2px] flex items-center gap-1 text-[8px] text-Text-Primary`}
                    style={{ backgroundColor: bgColor }}
                  >
                    <div
                      className={`size-[8px] select-none rounded-full`}
                      style={{ backgroundColor: color }}
                    ></div>
                    {value?.label || '-'}
                  </div>
                  {/* {!editAble && (
                    <>
                      <div
                        data-tooltip-id="system-score"
                        className="bg-[#E2F1F8] select-none rounded-full px-2 flex items-center gap-1 cursor-pointer"
                      >
                        <div className="size-[5px]  select-none bg-[#005F73] rounded-full"></div>
                        {value['System Score'] ? value['System Score'] : '-'}
                        <Tooltip
                          id={`system-score-${index}`}
                          place="top"
                          className="!bg-white !leading-5 !text-justify !text-wrap  !text-[#888888] !text-[11px] !rounded-[6px] !border !border-Gray-50 !p-2"
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
                        className="bg-[#DAF6C6] select-none rounded-full px-2 flex items-center gap-1 cursor-pointer"
                      >
                        <div className="size-[5px] select-none  bg-[#6CC24A] rounded-full"></div>
                        {value.Score ? value.Score : '-'}
                        <Tooltip
                          id={`base-score-${index}`}
                          place="top"
                          className="!bg-white !leading-5 !text-justify !text-wrap  !text-[#888888] !text-[11px] !rounded-[6px] !border !border-Gray-50 !p-2"
                          style={{
                            zIndex: 9999,
                            pointerEvents: 'none',
                          }}
                        >
                          <div className="text-Text-Primary font-medium">
                            Base Score
                          </div>
                          <div className="text-Text-Secondary">
                            Initial score from core health metrics.
                          </div>
                        </Tooltip>
                      </div>
                    </>
                  )} */}
                  {/* {value['Practitioner Comments'][0]?.length > 0 && (
                    <div
                      data-tooltip-id={`${value.title}-${index}`}
                      className="text-Primary-DeepTeal select-none mt-[2px] cursor-pointer text-[10px]"
                    >
                      Analysis Info
                      <Tooltip
                        id={`${value.title}-${index}`}
                        place="top"
                        className="!bg-white !w-[270px] !text-justify !leading-5 !text-wrap !text-[#888888] !text-[10px] !rounded-[6px] !border !border-Gray-50 !p-2 !opacity-100"
                        style={{
                          zIndex: 9999,
                          pointerEvents: 'none',
                        }}
                      >
                        <div className="text-Text-Primary text-[10px]">
                          {value['Practitioner Comments'][0]}
                        </div>
                      </Tooltip>
                    </div>
                  )} */}
                </>
              )}
              {Conflicts?.length > 0 && (
                <div
                  onClick={() => setShowConflict(true)}
                  className="ml-3 mb-[2px] flex gap-[2px] items-center text-[10px] text-[#F4A261] underline cursor-pointer "
                >
                  <img src="/icons/alarm.svg" alt="" />
                  Conflict <span>({Conflicts?.length})</span>
                </div>
              )}
            </div>
          </div>
          <div className="text-[12px] gap-2 w-full">
            {/* <textarea
              value={editableValue}
              onChange={(e) => setEditableValue(e.target.value)}
              className="bg-transparent text-[12px] outline-none w-full resize-none"
              rows={2}
            /> */}
            {editAble ? (
              <>
                {client_version.map((el: any) => {
                  return (
                    <div className="bg-transparent mt-2 text-[12px] w-full outline-none  resize-none">
                      <div className="text-Text-Primary bullet-point">
                        {' '}
                        {el}
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <>
                {positive ? (
                  <>
                    <div className="w-full bg-bg-color h-[1px] mt-3"></div>
                    {value['Practitioner Comments'][0]?.length > 0 && (
                      <div className="flex flex-col gap-1 pl-3 mt-2 mb-2">
                        <div className="flex items-center gap-1 text-xs text-Primary-DeepTeal">
                          <img src="/icons/info-circle-blue.svg" alt="" />
                          Analysis Info
                        </div>
                        <div className="text-[#666666] leading-5 text-xs text-justify">
                          {value['Practitioner Comments'][0]?.substring(
                            0,
                            showMore
                              ? value['Practitioner Comments'][0]?.length
                              : 560,
                          )}{' '}
                          <span
                            className="text-Primary-DeepTeal cursor-pointer underline font-medium"
                            onClick={() => setShowMore(!showMore)}
                          >
                            {showMore ? 'See less' : 'See more'}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="w-full bg-bg-color h-[1px] mt-1 mb-2"></div>
                    <div className="bg-transparent text-[12px] w-full outline-none  resize-none">
                      <div className="text-Text-Primary text-justify">
                        {' '}
                        <span className="text-Text-Secondary bullet-point">
                          Key Benefits:{' '}
                        </span>
                        {positive}
                      </div>
                      <div className="text-Text-Primary mt-1.5 text-justify">
                        <span className="text-Text-Secondary bullet-point">
                          Key Risks:{' '}
                        </span>
                        {negative}
                      </div>{' '}
                    </div>
                  </>
                ) : (
                  <div className="bg-transparent text-[12px] w-full outline-none  resize-none">
                    <div className="text-Text-Primary"> {editableValue}</div>
                  </div>
                )}
              </>
            )}
            {/* {editableValue.map((el:any) => {
              return (
                <>
                <div className="bg-transparent text-[12px] w-full outline-none  resize-none">
                    <div className="text-Text-Primary"> {el}</div>
                </div>
                </>
              )
            })} */}
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
          {notes?.length ? (
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
          ) : (
            ''
          )}
          <div className=" top-4 right-4  absolute">
            {/* {isExpanded ? (
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
            )} */}

            <div
              className={`${editAble ? 'flex' : 'hidden'} flex-col items-center gap-[10px]`}
            >
              <img
                onClick={() => setShowEditNote(true)}
                className={`cursor-pointer w-[24px] h-[24px]  ${deleteConfirm && 'hidden'}`}
                src="/icons/edit.svg"
                alt=""
              />
              {deleteConfirm ? (
                <div className="flex flex-col items-center gap-2 pb-1 text-Text-Secondary text-xs -ml-2 -mr-2">
                  Sure?{' '}
                  <img
                    className="cursor-pointer mr-1 w-[20px] h-[20px]"
                    onClick={() => {
                      setdeleteConfirm(false);
                      onDelete();
                    }}
                    src="/icons/confirm-tick-circle.svg"
                    alt=""
                  />
                  <img
                    className="cursor-pointer mr-1 w-[20px] h-[20px]"
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
                    width="24px"
                    height="24px"
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
          defalts={{
            ...value,
            client_version: Array.isArray(value.client_version)
              ? value.client_version
              : [positive, negative],
          }}
          onSubmit={(editData) => {
            onEdit(editData);
          }}
          isOpen={showEditNote}
          onClose={() => setShowEditNote(false)}
          onAddNotes={handleAddNotes}
        />
      )}
      {value['Practitioner Comments'][0]?.length > 0 && (
        <Tooltip
          id={`${value.title}-${index}`}
          place="top"
          className="!bg-white !w-[270px] !text-justify !leading-5 !text-wrap !text-[#888888] !text-[10px] !rounded-[6px] !border !border-Gray-50 !p-2 !opacity-100"
          style={{ zIndex: 9999 }}
        >
          <div className="text-Text-Primary text-[10px]">
            {value['Practitioner Comments'][0]}
          </div>
        </Tooltip>
      )}
    </>
  );
};

export default BioMarkerRowOldSuggestions;
