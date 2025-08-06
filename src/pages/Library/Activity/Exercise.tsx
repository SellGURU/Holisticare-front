/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
// import { toast } from 'react-toastify';
import Application from '../../../api/app';
import { ButtonSecondary } from '../../../Components/Button/ButtosSecondary';
import ExerciseModal from './AddComponents/ExcersieModal';
import { ExerciseRow } from './AddComponents/ExerciseRow';
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
  const [loadingCall, setLoadingCall] = useState(false);
  const [clearData, setClearData] = useState(false);
  const [showEditModalIndex, setShowEditModalIndex] = useState<number | null>(
    null,
  );
  const [showDeleteError, setshowDeleteError] = useState('');

  const handleClearData = (value: boolean) => {
    setClearData(value);
  };
  const handleAddExercise = (newExercise: any) => {
    setLoadingCall(true);
    Application.addExercise(newExercise)
      .then(() => {
        onAdd();
        setShowAdd(false);
        setClearData(true);
      })
      .catch((error) => {
        console.error('Error adding exercise:', error);
      })
      .finally(() => {
        setLoadingCall(false);
      });
  };

  const handleDeleteExercise = (exerciseIdToDelete: string) => {
    Application.DeleteExercise({ Exercise_Id: exerciseIdToDelete })
      .then(() => {
        // setData((prevData) =>
        //   prevData.filter(
        //     (exercise) => exercise.Exercise_Id !== exerciseIdToDelete,
        //   ),
        // );
        onAdd();
      })
      .catch((error) => {
        console.log(error);
        if (error.detail) {
          setshowDeleteError(error.detail);

        }

        // console.error('Error deleting exercise:', error);
        // toast.error(error);
      });
  };

  const handleUpdateExercise = (updatedExercise: any) => {
    setLoadingCall(true);
    Application.updateExercise(updatedExercise)
      .then(() => {
        onAdd();
        setShowEditModalIndex(null);
        setClearData(true);
      })
      .catch((error) => {
        console.error('Error editing exercise:', error);
      })
      .finally(() => {
        setLoadingCall(false);
      });
  };
  const [dynamicHeight, setDynamicHeight] = useState<number | null>(null);
  useEffect(() => {
    const updateHeight = () => {
      if (typeof window !== 'undefined') {
        const newHeight =
          window.innerWidth > 720
            ? window.innerHeight - 220
            : window.innerHeight - 320;
        setDynamicHeight(newHeight);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);

    return () => window.removeEventListener('resize', updateHeight);
  }, []);
  useEffect(() => {
    if (showDeleteError) {
      const timer = setTimeout(() => {
        setshowDeleteError('');
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [showDeleteError]);

  return (
    <>
      {showDeleteError && (
        <div className="absolute right-6 top-[70px] w-fit bg-backgroundColor-Card border border-Red py-1 px-4 flex rounded-2xl items-center gap-1  text-xs text-Text-Primary select-none">
          {' '}
          <img src="/icons/info-circle-red.svg" alt="" />
          {showDeleteError}
        </div>
      )}

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
            <div
              className="mt-6 overflow-y-auto mb-20 md:mb-14"
              style={{
                height: dynamicHeight ? `${dynamicHeight}px` : 'auto',
              }}
            >
              <table className="w-full  ">
                <thead className="w-full">
                  <tr className="text-left text-xs bg-[#F4F4F4] text-Text-Primary border-Gray-50 w-full ">
                    <th className="py-3 pl-4 w-[160px] rounded-tl-2xl text-nowrap">
                      Title
                    </th>
                    <th className="py-3 w-[300px] text-center text-nowrap">
                      Instruction
                    </th>
                    <th className="py-3 w-[100px] text-center pl-2 text-nowrap">
                      File
                    </th>
                    <th className="py-3 w-[66px] text-center pl-3 text-nowrap">
                      Priority Weight
                    </th>
                    {/* <th className="py-3 w-[250px] text-center text-nowrap">
                      Clinical Guidance
                    </th> */}
                    <th className="py-3 w-[100px] text-center pl-3 text-nowrap">
                      Added on
                    </th>
                    <th className="py-3 w-[80px] text-center pl-3 rounded-tr-2xl text-nowrap">
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
                      loadingCall={loadingCall}
                      clearData={clearData}
                      handleClearData={handleClearData}
                      showEditModalIndex={showEditModalIndex}
                      setShowEditModalIndex={setShowEditModalIndex}
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
        loadingCall={loadingCall}
        clearData={clearData}
        handleClearData={handleClearData}
      />
    </>
  );
};

export default Exercise;
