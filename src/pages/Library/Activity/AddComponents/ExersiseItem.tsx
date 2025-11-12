import { useRef, useState } from 'react';
import { Tooltip } from 'react-tooltip';
import useModalAutoClose from '../../../../hooks/UseModalAutoClose';
import SvgIcon from '../../../../utils/svgIcon';
import TooltipTextAuto from '../../../../Components/TooltipText/TooltipTextAuto';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface ExerciseItemProps {
  isSuperSet?: boolean;
  index: number;
  exercise: any;
  sets: string;
  exesiseIndex: number;
  onDelete: (exersiseIndex: number) => void;
  toSuperSet: () => void;
  removeFromSuperSet?: () => void;
  onChange: (
    index: number,
    field: string,
    value: string,
    exersiseIndex: number,
  ) => void;
  showValidation?: boolean;
  errors: { [key: string]: string };
}

const ExerciseItem = ({
  index,
  exesiseIndex,
  exercise,
  onChange,
  onDelete,
  toSuperSet,
  removeFromSuperSet,
  isSuperSet,
  sets,
  showValidation = false,
  errors,
}: ExerciseItemProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const isSetEmpty = sets === '' || Number(sets) === 0;
  const menuRef = useRef<HTMLDivElement>(null);
  useModalAutoClose({
    close: () => setShowMenu(false),
    refrence: menuRef,
  });

  const preventEInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'e' || e.key === 'E') {
      e.preventDefault();
    }
  };

  const handleSetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow positive integers
    if (/^\d*$/.test(value)) {
      onChange(index, 'Sets', value, exesiseIndex);
    }
  };

  const handleRepsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow positive integers
    if (/^\d*$/.test(value)) {
      onChange(index, 'Reps', value, exesiseIndex);
    }
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow any text (including numbers, characters like "body", etc.)
    onChange(index, 'Weight', value, exesiseIndex);
  };

  const handleRestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow positive integers
    if (/^\d*$/.test(value)) {
      onChange(index, 'Rest', value, exesiseIndex);
    }
  };

  const getError = (field: string) => {
    return errors[`${field}-${exercise.Section}-${exercise.Exercise.Title}`];
  };

  return (
    <>
      <div
        key={index}
        className="w-full min-h-[172px] z-10 relative border border-Gray-50 rounded-2xl bg-backgroundColor-Card p-3"
      >
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center">
            <div className="relative">
              <img
                src="/images/activity/activity-demo.png"
                alt=""
                className="w-8 h-8 bg-cover rounded-lg mr-1"
              />
              {Array.isArray(exercise?.Exercise?.Files) &&
                exercise.Exercise.Files.length > 0 && (
                  <img
                    src="/icons/video-octagon.svg"
                    alt=""
                    className="w-[15.48px] h-[16px] absolute top-[8px] left-[9px]"
                  />
                )}
            </div>
            <div className="text-xs ml-2 font-medium text-Text-Primary">
              {exercise.Exercise.Title}
            </div>
          </div>
          <img
            onClick={() => setShowMenu(!showMenu)}
            src="/icons/more.svg"
            alt=""
            className="w-4 h-4 cursor-pointer"
          />
          {showMenu && (
            <div
              ref={menuRef}
              className="absolute w-[188px] px-4 py-2 z-[5] bg-white shadow-200 rounded-[16px] right-3 top-10"
            >
              {index > 0 && !isSuperSet && (
                <div
                  onClick={() => {
                    toSuperSet();
                    setShowMenu(false);
                  }}
                  className="flex justify-start py-2 borer border-b border-gray-50 items-center cursor-pointer gap-2"
                >
                  <SvgIcon
                    src="/icons/link.svg"
                    color="#6CC24A"
                    width="16px"
                    height="16px"
                  ></SvgIcon>
                  <div className="text-[12px] text-Text-Primary">
                    Superset with above
                  </div>
                </div>
              )}
              {isSuperSet && removeFromSuperSet && (
                <div
                  onClick={() => {
                    removeFromSuperSet();
                    setShowMenu(false);
                  }}
                  className="flex justify-start py-2 borer border-b border-gray-50 items-center cursor-pointer gap-2"
                >
                  <SvgIcon
                    src="/icons/link.svg"
                    color="#6CC24A"
                    width="16px"
                    height="16px"
                  ></SvgIcon>
                  <div className="text-[12px] text-Text-Primary">
                    Remove from superset
                  </div>
                </div>
              )}
              <div
                onClick={() => {
                  onDelete(exesiseIndex);
                  setShowMenu(false);
                }}
                className="flex justify-start py-2 items-center cursor-pointer gap-2"
              >
                <SvgIcon
                  src="/icons/delete.svg"
                  color="#6CC24A"
                  width="16px"
                  height="16px"
                ></SvgIcon>
                <div className="text-[12px] text-Text-Primary">Delete</div>
              </div>
            </div>
          )}
        </div>
        <div>
          <div className="text-xs max-w-[450px] flex text-nowrap gap-1 overflow-hidden text-ellipsis text-Text-Primary mt-2">
            <span className="font-medium text-Text-Secondary">
              Instruction:
            </span>
            <TooltipTextAuto tooltipPlace="top" maxWidth="450px">
              {exercise.Exercise.Instruction}
            </TooltipTextAuto>
            {/* */}
          </div>
        </div>
        {/* <div className="min-h-[25px] mt-2 flex flex-wrap gap-2">
          {exercise?.Exercise?.Exercise_Filters && (
            <>
              {Object?.entries(exercise?.Exercise?.Exercise_Filters).map(
                ([key, value]) => (
                  <div
                    key={key}
                    className="text-[10px] flex justify-center items-center text-[#005F73] bg-[#E9F0F2] rounded-full px-2 "
                  >
                    {String(value)}
                  </div>
                ),
              )}
            </>
          )}
        </div> */}
        <div className="w-full h-[1px] bg-Gray-50 my-2"></div>
        <div className="flex justify-between items-center">
          <div
            className={`mt-2 relative ${exesiseIndex == 0 ? 'visible' : 'invisible'}`}
          >
            <div className="text-center  flex text-[8px] text-Text-Primary justify-center mb-[-6px]">
              Set
              <div data-tooltip-id="set-tooltip">
                <img
                  src="/icons/info-circle.svg"
                  alt=""
                  className="w-2.5 h-2.5 cursor-pointer ml-1 mb-2"
                />
              </div>
              <Tooltip
                id="set-tooltip"
                place="top"
                className="!bg-white !shadow-100 !text-Text-Quadruple !text-[10px] !rounded-[6px] !border !border-gray-50 flex flex-col !z-[99999]"
              >
                <div className="flex items-center gap-1">
                  Set must contain just Natural Numbers.
                </div>
              </Tooltip>
            </div>
            <input
              type="text"
              value={sets}
              onChange={handleSetChange}
              onKeyDown={preventEInput}
              className={`w-[112px] px-3 text-center h-[24px] rounded-[8px] bg-white border ${
                showValidation && isSetEmpty
                  ? 'border-red-500'
                  : 'border-gray-50'
              } outline-none text-[10px] text-Text-Primary`}
            />
            {showValidation && isSetEmpty && (
              <div className="text-[8px] text-red-500 mt-1 text-center absolute bottom-[-12px] left-[15px]">
                This field is required.
              </div>
            )}
            {getError('sets') && (
              <span className="text-[10px] text-red-500">
                {getError('sets')}
              </span>
            )}
          </div>
          <div className="mt-2 relative">
            <div className="text-center text-[8px] text-Text-Primary">Reps</div>
            <input
              type="text"
              value={exercise.Reps}
              onChange={handleRepsChange}
              onKeyDown={preventEInput}
              className={`w-[112px] px-3 text-center h-[24px] rounded-[8px] bg-white border ${
                (showValidation && (!exercise.Reps || exercise.Reps === '')) ||
                getError('reps')
                  ? 'border-red-500'
                  : 'border-gray-50'
              } outline-none text-[10px] text-Text-Primary`}
            />
            {showValidation && (!exercise.Reps || exercise.Reps === '') && (
              <div className="text-[8px] text-red-500 mt-1 text-center absolute bottom-[-12px] left-[15px]">
                This field is required.
              </div>
            )}
            {getError('reps') && (
              <div className="text-[8px] text-red-500 mt-1 text-center">
                {getError('reps')}
              </div>
            )}
          </div>
          <div className="mt-2 relative">
            <div className="text-center text-[8px] text-Text-Primary">
              Weight
            </div>
            <input
              type="text"
              value={exercise.Weight}
              onChange={handleWeightChange}
              onKeyDown={preventEInput}
              className={`w-[112px] px-3 pr-6 text-center h-[24px] rounded-[8px] bg-white border ${
                getError('weight') ? 'border-red-500' : 'border-gray-50'
              } outline-none text-[10px] text-Text-Primary`}
            />
            {/* <div className="absolute right-2 top-[18px] text-[10px] text-Text-Secondary">
              kg
            </div> */}
          </div>
          <div className="mt-2">
            <div className="text-center text-[8px] text-Text-Primary">
              Rest (min)
            </div>
            <input
              type="text"
              value={exercise.Rest}
              onChange={handleRestChange}
              onKeyDown={preventEInput}
              className={`w-[112px] px-3 text-center h-[24px] rounded-[8px] bg-white border ${
                getError('rest') ? 'border-red-500' : 'border-gray-50'
              } outline-none text-[10px] text-Text-Primary`}
            />
            {getError('rest') && (
              <span className="text-[10px] text-red-500">
                {getError('rest')}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ExerciseItem;
