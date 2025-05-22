/* eslint-disable @typescript-eslint/no-explicit-any */
import { ButtonSecondary } from '../../../Components/Button/ButtosSecondary';
import { ExerciseRow } from './AddComponents/ExerciseRow';
import ExerciseModal from './AddComponents/ExcersieModal';
import Application from '../../../api/app';
interface ExerciseHandlerProps {
  data: Array<any>;
  onAdd: () => void;
  showAdd: boolean;
  setShowAdd: React.Dispatch<React.SetStateAction<boolean>>;
  ExcercisesListLength: number;
}
const Exercise: React.FC<ExerciseHandlerProps> = ({
  data,
  onAdd,
  showAdd,
  setShowAdd,
  ExcercisesListLength,
}) => {
  const handleAddExercise = (newExercise: any) => {
    Application.addExercise(newExercise)
      .then(() => {
        onAdd();
        setShowAdd(false);
      })
      .catch((error) => {
        console.error('Error adding exercise:', error);
      });
  };

  const handleDeleteExercise = (exerciseIdToDelete: string) => {
    Application.DeleteExercise({ Exercise_Id: exerciseIdToDelete }).then(() => {
      // setData((prevData) =>
      //   prevData.filter(
      //     (exercise) => exercise.Exercise_Id !== exerciseIdToDelete,
      //   ),
      // );
      onAdd();
    });
  };

  const handleUpdateExercise = (updatedExercise: any) => {
    Application.updateExercise(updatedExercise).then(() => {
      onAdd();
    });
    // setData((prevData) =>
    //   prevData.map((exercise, i) => (i === index ? updatedExercise : exercise)),
    // );
  };

  return (
    <>
      {ExcercisesListLength === 0 ? (
        <div className="w-full h-full min-h-[450px] flex justify-center items-center">
          <div>
            <img src="/icons/no-exercise.svg" alt="" />
            <div className="mt-8">
              <div className="text-Text-Primary text-center font-medium">
                No exercise found.
              </div>
              <div className="flex justify-center mt-4">
                <ButtonSecondary
                  onClick={() => {
                    setShowAdd(true);
                  }}
                  ClassName="rounded-full min-w-[180px]"
                >
                  <img src="./icons/add-square.svg" alt="" />
                  Add Exercise
                </ButtonSecondary>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {data.length > 0 ? (
            <div className="mt-6 h-[540px] overflow-auto">
              <table className="w-full  ">
                <thead className="w-full">
                  <tr className="text-left text-xs bg-[#F4F4F4] text-Text-Primary border-Gray-50 w-full ">
                    <th className="py-3 pl-4 w-[160px] rounded-tl-2xl">
                      Title
                    </th>
                    <th className="py-3 w-[300px] text-center">Instruction</th>
                    <th className="py-3 w-[100px] text-center pl-2">File</th>
                    <th className="py-3 w-[66px] text-center pl-3">
                      Base Score
                    </th>
                    <th className="py-3 w-[100px] text-center pl-3">
                      Added on
                    </th>
                    <th className="py-3 w-[80px] text-center pl-3 rounded-tr-2xl">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="border border-t-0 border-[#E9F0F2]">
                  {data.map((exercise, index) => (
                    <ExerciseRow
                      exercise={exercise}
                      index={index}
                      onDelete={() =>
                        handleDeleteExercise(exercise.Exercise_Id)
                      }
                      onUpdate={handleUpdateExercise}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="w-full h-full h-sm:h-[500px] flex flex-col justify-center items-center text-base font-medium text-Text-Primary ">
              <img src="/icons/search-status.svg" alt="" />
              <span className="-mt-6"> No results found.</span>
            </div>
          )}
        </>
      )}

      <ExerciseModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onSubmit={handleAddExercise}
      />
    </>
  );
};

export default Exercise;
