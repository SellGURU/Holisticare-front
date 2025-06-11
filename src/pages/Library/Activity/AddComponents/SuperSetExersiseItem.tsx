import { useRef, useState } from 'react';
import useModalAutoClose from '../../../../hooks/UseModalAutoClose';
import SvgIcon from '../../../../utils/svgIcon';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface SuperSetExersiseItemProps {
  exercise: any;
  index: number;
  onChange: (
    index: number,
    field: string,
    value: string,
    exersiseIndex: number,
  ) => void;
  toSuperSet: () => void;
  removeFromSuperSet: (exersiseIndex: number) => void;
  onDelete: (exersiseIndex: number) => void;
  errors: { [key: string]: string };
}

const SuperSetExersiseItem: React.FC<SuperSetExersiseItemProps> = ({
  exercise,
  index,
  onChange,
  toSuperSet,
  removeFromSuperSet,
  onDelete,
  errors,
}) => {
  console.log('toSuperSet', toSuperSet);
  const [showMenu, setShowMenu] = useState(false);
  const [indexShow, setIndexShow] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  useModalAutoClose({
    close: () => {
      setShowMenu(false);
      setIndexShow(null);
    },
    refrence: menuRef,
  });
  const getError = (field: string, exerciseTitle: string) => {
    return errors[`${field}-${exercise.Section}-${exerciseTitle}`];
  };

  const handleSetChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    exIndex: number,
  ) => {
    const value = e.target.value;
    // Only allow positive integers
    if (/^\d*$/.test(value)) {
      onChange(index, 'Sets', value, exIndex);
    }
  };

  const handleRepsChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    exIndex: number,
  ) => {
    const value = e.target.value;
    // Only allow positive integers
    if (/^\d*$/.test(value)) {
      onChange(index, 'Reps', value, exIndex);
    }
  };

  const handleWeightChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    exIndex: number,
  ) => {
    const value = e.target.value;
    // Only allow positive integers
    if (/^\d*$/.test(value)) {
      onChange(index, 'Weight', value, exIndex);
    }
  };

  const handleRestChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    exIndex: number,
  ) => {
    const value = e.target.value;
    // Only allow positive integers
    if (/^\d*$/.test(value)) {
      onChange(index, 'Rest', value, exIndex);
    }
  };

  return (
    <div className="w-full bg-white rounded-xl p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-xs text-Text-Primary">Super Set</div>
        </div>
        {/* <div className="flex items-center gap-2">
          <div onClick={toSuperSet} className="cursor-pointer">
            <img src="/icons/super-set.svg" alt="" className="w-4 h-4" />
          </div>
        </div> */}
      </div>
      {exercise.Exercises.map((ex: any, exIndex: number) => (
        <div key={exIndex} className="mt-3 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <img
                  src="/images/activity/activity-demo.png"
                  alt=""
                  className="w-8 h-8 bg-cover rounded-lg"
                />
                <img
                  src="/icons/video-octagon.svg"
                  alt=""
                  className="w-[17.79px] h-[17.79px] absolute top-[7px] left-[7px]"
                />
              </div>
              <div className="text-xs text-Text-Primary">
                {ex.Exercise.Title}
              </div>
            </div>
            <img
              onClick={() => {
                setIndexShow(exIndex);
                setShowMenu(!showMenu);
              }}
              src="/icons/more.svg"
              alt=""
              className="w-4 h-4 cursor-pointer"
            />
            {showMenu && indexShow === exIndex && (
              <div
                ref={menuRef}
                className="absolute w-[188px] px-4 py-2 bg-white shadow-200 rounded-[16px] right-0 top-6 z-20"
              >
                {removeFromSuperSet && (
                  <div
                    onClick={() => {
                      removeFromSuperSet(exIndex);
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
                      Make it Normalset
                    </div>
                  </div>
                )}
                <div
                  onClick={() => {
                    onDelete(exIndex);
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
            {/* <div className="flex items-center gap-2">
              <div
                onClick={() => removeFromSuperSet(exIndex)}
                className="cursor-pointer"
              >
                <img
                  src="/icons/remove-super-set.svg"
                  alt=""
                  className="w-4 h-4"
                />
              </div>
              <div onClick={() => onDelete(exIndex)} className="cursor-pointer">
                <img src="/icons/delete.svg" alt="" className="w-4 h-4" />
              </div>
            </div> */}
          </div>
          <div className="grid grid-cols-4 gap-2 mt-3">
            <div className="flex flex-col gap-1">
              <div className="text-[10px] text-Text-Quadruple">Set</div>
              <input
                type="text"
                value={exercise.Sets}
                onChange={(e) => handleSetChange(e, exIndex)}
                className={`w-full h-[28px] rounded-[16px] py-1 px-3 border ${getError('sets', ex.Exercise.Title) ? 'border-red-500' : 'border-Gray-50'} bg-backgroundColor-Card text-xs font-light placeholder:text-Text-Fivefold`}
              />
              {getError('sets', ex.Exercise.Title) && (
                <span className="text-[10px] text-red-500">
                  {getError('sets', ex.Exercise.Title)}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-[10px] text-Text-Quadruple">Reps</div>
              <input
                type="text"
                value={ex.Reps}
                onChange={(e) => handleRepsChange(e, exIndex)}
                className={`w-full h-[28px] rounded-[16px] py-1 px-3 border ${getError('reps', ex.Exercise.Title) ? 'border-red-500' : 'border-Gray-50'} bg-backgroundColor-Card text-xs font-light placeholder:text-Text-Fivefold`}
              />
              {getError('reps', ex.Exercise.Title) && (
                <span className="text-[10px] text-red-500">
                  {getError('reps', ex.Exercise.Title)}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-[10px] text-Text-Quadruple">Rest</div>
              <input
                type="text"
                value={ex.Rest}
                onChange={(e) => handleRestChange(e, exIndex)}
                className={`w-full h-[28px] rounded-[16px] py-1 px-3 border ${getError('rest', ex.Exercise.Title) ? 'border-red-500' : 'border-Gray-50'} bg-backgroundColor-Card text-xs font-light placeholder:text-Text-Fivefold`}
              />
              {getError('rest', ex.Exercise.Title) && (
                <span className="text-[10px] text-red-500">
                  {getError('rest', ex.Exercise.Title)}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-[10px] text-Text-Quadruple">Weight</div>
              <input
                type="text"
                value={ex.Weight}
                onChange={(e) => handleWeightChange(e, exIndex)}
                className="w-full h-[28px] rounded-[16px] py-1 px-3 border border-Gray-50 bg-backgroundColor-Card text-xs font-light placeholder:text-Text-Fivefold"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SuperSetExersiseItem;
