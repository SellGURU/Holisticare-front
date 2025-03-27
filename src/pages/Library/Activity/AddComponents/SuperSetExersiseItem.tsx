import ExerciseItem from './ExersiseItem';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface SuperSetExersiseItemProps {
  index: number;
  exercise: any;
  onDelete: (exersiseIndex: number) => void;
  toSuperSet: () => void;
  onChange: (
    index: number,
    field: string,
    value: string,
    exersiseIndex: number,
  ) => void;
}

const SuperSetExersiseItem: React.FC<SuperSetExersiseItemProps> = ({
  index,
  exercise,
  onDelete,
  toSuperSet,
  onChange,
}) => {
  return (
    <>
      <div className="flex flex-col ml-2 gap-2 relative">
        {exercise.Exercises.map((el: any, ind: number) => (
          <ExerciseItem
            isSuperSet={true}
            sets={exercise.Sets}
            exesiseIndex={ind}
            onDelete={() => onDelete(ind)}
            key={index}
            index={index}
            exercise={el}
            onChange={onChange}
            toSuperSet={() => toSuperSet}
          />
        ))}
        <div className="absolute z-[1] h-[85%] top-[25px] left-[-8px]">
          <div className="w-[20px] relative h-full rounded-[16px]  bg-white border-2 border-gray-300 border-r-white">
            <img
              className="absolute top-[48%] left-[-8px] bg-white py-1"
              src={'./icons/link.svg'}
              alt="super set"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default SuperSetExersiseItem;
