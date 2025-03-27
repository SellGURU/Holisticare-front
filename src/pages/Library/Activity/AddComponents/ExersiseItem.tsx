import { useRef, useState } from 'react';
import SvgIcon from '../../../../utils/svgIcon';
import useModalAutoClose from '../../../../hooks/UseModalAutoClose';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface ExerciseItemProps {
  isSuperSet?: boolean;
  index: number;
  exercise: any;
  sets: number;
  exesiseIndex: number;
  onDelete: (exersiseIndex: number) => void;
  toSuperSet: () => void;
  onChange: (
    index: number,
    field: string,
    value: string,
    exersiseIndex: number,
  ) => void;
}

const ExerciseItem = ({
  index,
  exesiseIndex,
  exercise,
  onChange,
  onDelete,
  toSuperSet,
  isSuperSet,
  sets,
}: ExerciseItemProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useModalAutoClose({
    close: () => setShowMenu(false),
    refrence: menuRef,
  });
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
              <img
                src="/icons/youtube.svg"
                alt=""
                className="w-[15.48px] h-[16px] absolute top-[8px] left-[9px]"
              />
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
              className="absolute w-[188px] px-4 py-2 bg-white shadow-200 rounded-[16px] right-3 top-10"
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
                    src="./icons/link.svg"
                    color="#6CC24A"
                    width="16px"
                    height="16px"
                  ></SvgIcon>
                  <div className="text-[12px] text-Text-Primary">
                    Superset with above
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
                  src="./icons/delete.svg"
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
          <div className="text-xs max-w-[450px] text-nowrap overflow-hidden text-ellipsis text-Text-Primary mt-2">
            <span className="font-medium text-Text-Secondary">
              Instruction:
            </span>{' '}
            {exercise.Exercise.Instruction}
          </div>
        </div>
        <div className="min-h-[25px] mt-2 flex flex-wrap gap-2">
          {Object.entries(exercise.Exercise.Exercise_Filters).map(
            ([key, value]) => (
              <div
                key={key}
                className="text-[10px] flex justify-center items-center text-[#005F73] bg-[#E9F0F2] rounded-full px-2 "
              >
                {String(value)}
              </div>
            ),
          )}
        </div>
        <div className="w-full h-[1px] bg-Gray-50 my-2"></div>
        <div className="flex justify-between items-center">

          <div className={`mt-2 ${exesiseIndex == 0 ?'visible':'invisible'}`}>
            <div className="text-center text-[8px] text-Text-Primary">set</div>
            <input
              type="number"
              value={sets}
              onChange={(e) =>
                onChange(index, 'Sets', e.target.value, exesiseIndex)
              }
              className="w-[112px] px-3 text-center h-[24px] rounded-[8px] bg-white border border-gray-50 outline-none text-[10px] text-Text-Primary"
            />
          </div>
          <div className="mt-2">
            <div className="text-center text-[8px] text-Text-Primary">Reps</div>
            <input
              type="number"
              value={exercise.Reps}
              onChange={(e) =>
                onChange(index, 'Reps', e.target.value, exesiseIndex)
              }
              className="w-[112px] px-3 text-center h-[24px] rounded-[8px] bg-white border border-gray-50 outline-none text-[10px] text-Text-Primary"
            />
          </div>
          <div className="mt-2 relative">
            <div className="text-center text-[8px] text-Text-Primary">
              setWeight
            </div>
            <input
              type="number"
              value={exercise.Weight}
              onChange={(e) =>
                onChange(index, 'Weight', e.target.value, exesiseIndex)
              }
              className="w-[112px] px-3 pr-6 text-center h-[24px] rounded-[8px] bg-white border border-gray-50 outline-none text-[10px] text-Text-Primary"
            />
            <div className="absolute right-2 top-[18px] text-[10px] text-Text-Secondary">
              kg
            </div>
          </div>
          <div className="mt-2">
            <div className="text-center text-[8px] text-Text-Primary">
              Rest (min)
            </div>
            <input
              type="number"
              value={exercise.Rest}
              onChange={(e) =>
                onChange(index, 'Rest', e.target.value, exesiseIndex)
              }
              className="w-[112px] px-3 text-center h-[24px] rounded-[8px] bg-white border border-gray-50 outline-none text-[10px] text-Text-Primary"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ExerciseItem;
