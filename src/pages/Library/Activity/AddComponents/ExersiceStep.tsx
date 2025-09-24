/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import Application from '../../../../api/app';
import SearchBox from '../../../../Components/SearchBox';
import ExerciseItem from './ExersiseItem';
import SuperSetExersiseItem from './SuperSetExersiseItem';
import TabNavigation from './TabNavigation';

interface Exercise {
  Title: string;
  Description: string;
  Instruction: string;
  Base_Score: number;
  Files: Array<{
    Title: string;
    Type: string;
    Content: {
      url?: string;
      file_id?: string;
    };
  }>;
}

interface ExerciseSet {
  Exercise: Exercise;
  Weight: string;
  Reps: string;
  Rest: string;
}

interface ExerciseGroup {
  Type: string;
  Section: string;
  Sets: string;
  Exercises: ExerciseSet[];
}

interface ExersiceStepProps {
  onChange: (data: Array<ExerciseGroup>) => void;
  sectionList: Array<ExerciseGroup>;
  showValidation?: boolean;
  setShowValidation?: (val: any) => void;
  onValidationChange?: (isValid: boolean) => void;
  handleChangeSetOrder?: (value: any) => void;
  orderList?: { name: string; enabled: boolean; order: number }[];
}
const ExersiceStep: React.FC<ExersiceStepProps> = ({
  onChange,
  sectionList,
  onValidationChange,
  showValidation,
  setShowValidation,
  handleChangeSetOrder,
  orderList,
}) => {
  const [exercises, setExercises] = useState<ExerciseGroup[]>(sectionList);
  const [exerciseList, setExerciseList] = useState<Exercise[]>([]);
  const [filteredExerciseList, setFilteredExerciseList] = useState<Exercise[]>(
    [],
  );
  const [activeTab, setActiveTab] = useState('Warm-Up');
  const [searchValue, setSearchValue] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateExercise = (exercise: ExerciseGroup) => {
    const newErrors: { [key: string]: string } = {};

    // Validate Sets
    if (!exercise.Sets) {
      newErrors[
        `sets-${exercise.Section}-${exercise.Exercises[0].Exercise.Title}`
      ] = 'This field is required.';
    } else if (!/^\d+$/.test(exercise.Sets)) {
      newErrors[
        `sets-${exercise.Section}-${exercise.Exercises[0].Exercise.Title}`
      ] = 'Set must follow the described format.';
    }

    // Validate Reps
    if (!exercise.Exercises[0].Reps || exercise.Exercises[0].Reps === '') {
      newErrors[
        `reps-${exercise.Section}-${exercise.Exercises[0].Exercise.Title}`
      ] = 'This field is required.';
    } else if (!/^\d+$/.test(exercise.Exercises[0].Reps)) {
      newErrors[
        `reps-${exercise.Section}-${exercise.Exercises[0].Exercise.Title}`
      ] = 'Numbers only.';
    }

    // Validate Rest
    if (
      exercise.Exercises[0].Rest &&
      !/^\d+$/.test(exercise.Exercises[0].Rest)
    ) {
      newErrors[
        `rest-${exercise.Section}-${exercise.Exercises[0].Exercise.Title}`
      ] = 'Numbers only.';
    }

    return newErrors;
  };

  useEffect(() => {
    const emptySetSections = exercises.filter(
      (section: any) => section.Sets === '',
    );
    const emptyRepsSections = exercises.filter(
      (section: any) =>
        !section.Exercises[0].Reps || section.Exercises[0].Reps === '',
    );
    const isValid =
      exercises.length > 0 &&
      emptySetSections.length === 0 &&
      emptyRepsSections.length === 0;

    // Validate all exercises
    const allErrors = exercises.reduce((acc, exercise) => {
      return { ...acc, ...validateExercise(exercise) };
    }, {});

    setErrors(allErrors);

    // Check if there are any validation errors
    const hasErrors = Object.keys(allErrors).length > 0;

    if (onValidationChange) {
      onValidationChange(isValid && !hasErrors);
    }
  }, [exercises, onValidationChange]);

  useEffect(() => {
    Application.getExercisesList({}).then((res) => {
      setExerciseList(res.data);
    });
  }, []);

  const addExercise = (exercise: Exercise) => {
    const resolveExercise: ExerciseGroup = {
      Type: 'Normalset',
      Section: activeTab,
      Sets: '',
      Exercises: [
        {
          Exercise: exercise,
          Weight: '',
          Reps: '',
          Rest: '',
        },
      ],
    };
    if (setShowValidation) {
      setShowValidation(false);
    }

    setExercises((prevExercises) => [...prevExercises, resolveExercise]);
  };

  const handleExerciseChange = (
    index: number,
    field: string,
    value: string,
    exersiseIndex: number,
  ) => {
    setExercises((prevExercises) => {
      const updatedExercises = [...prevExercises];
      const activeTabExercises = updatedExercises.filter(
        (el: any) => el.Section === activeTab,
      );
      const exerciseToUpdate = activeTabExercises[index];

      if (!exerciseToUpdate) return prevExercises;

      const originalIndex = updatedExercises.findIndex(
        (el: any) => el === exerciseToUpdate,
      );

      if (field === 'Sets') {
        updatedExercises[originalIndex] = {
          ...updatedExercises[originalIndex],
          Sets: value,
        };
      } else if (field === 'Reps' || field === 'Weight' || field === 'Rest') {
        updatedExercises[originalIndex] = {
          ...updatedExercises[originalIndex],
          Exercises: updatedExercises[originalIndex].Exercises.map(
            (exercise, ind) => {
              if (ind === exersiseIndex) {
                return {
                  ...exercise,
                  [field]: value,
                  Exercise: {
                    ...exercise.Exercise,
                    [field]: value,
                  },
                };
              }
              return exercise;
            },
          ),
        };
      } else {
        updatedExercises[originalIndex] = {
          ...updatedExercises[originalIndex],
          Exercises: updatedExercises[originalIndex].Exercises.map(
            (exercise, ind) => {
              if (exersiseIndex == ind) {
                return {
                  ...exercise,
                  [field]: value,
                };
              }
              return exercise;
            },
          ),
        };
      }

      // Validate the updated exercise
      const newErrors = validateExercise(updatedExercises[originalIndex]);
      setErrors((prev) => ({
        ...prev,
        ...newErrors,
      }));

      return updatedExercises;
    });
  };

  const handleSuperSet = (index: number, exercise: ExerciseGroup) => {
    setExercises((prevExercises) => {
      const updatedExercises = [...prevExercises];

      // Find the exercises in the current active tab
      const activeTabExercises = updatedExercises.filter(
        (el: any) => el.Section === activeTab,
      );

      // Get the previous exercise from the active tab
      const previousExercise = activeTabExercises[index - 1];
      if (!previousExercise) return prevExercises;

      // Find the original indices in the full array
      const previousIndex = updatedExercises.findIndex(
        (el) => el === previousExercise,
      );
      const currentIndex = updatedExercises.findIndex((el) => el === exercise);

      const resolveSuperSet = {
        ...previousExercise,
        Type: 'Superset',
        Exercises: [...previousExercise.Exercises, ...exercise.Exercises],
      };

      // Remove both exercises and insert the superset at the correct position
      const resolved = updatedExercises.filter(
        (_, i) => i !== currentIndex && i !== previousIndex,
      );
      resolved.splice(previousIndex, 0, resolveSuperSet);

      return resolved;
    });
  };

  const handleRemoveFromSuperSet = (index: number, exersiseIndex: number) => {
    setExercises((prevExercises) => {
      const updatedExercises = [...prevExercises];
      // Find the exercise in the current active tab
      const activeTabExercises = updatedExercises.filter(
        (el: any) => el.Section === activeTab,
      );
      const exerciseToUpdate = activeTabExercises[index];

      // Find the original index in the full array
      const originalIndex = updatedExercises.findIndex(
        (el: any) => el === exerciseToUpdate,
      );

      // Get the exercise to be removed from superset
      const exerciseToRemove =
        updatedExercises[originalIndex].Exercises[exersiseIndex];

      // Create a new normal set with the removed exercise
      const newNormalSet = {
        Type: 'Normalset',
        Section: exerciseToUpdate.Section,
        Sets: exerciseToUpdate.Sets,
        Exercises: [exerciseToRemove],
      };

      // Remove the exercise from the superset
      const remainingExercises = updatedExercises[
        originalIndex
      ].Exercises.filter((_, i) => i !== exersiseIndex);

      // If only one exercise remains in the superset, convert it to a normal set
      if (remainingExercises.length === 1) {
        updatedExercises[originalIndex] = {
          ...updatedExercises[originalIndex],
          Type: 'Normalset',
          Exercises: remainingExercises,
        };
      } else {
        // Keep as superset with remaining exercises
        updatedExercises[originalIndex] = {
          ...updatedExercises[originalIndex],
          Exercises: remainingExercises,
        };
      }

      // Insert the new normal set after the superset
      updatedExercises.splice(originalIndex + 1, 0, newNormalSet);

      return updatedExercises;
    });
  };

  const handleSuperSetDelete = (index: number, exersiseIndex: number) => {
    setExercises((prevExercises) => {
      const updatedExercises = [...prevExercises];
      // Find the exercise in the current active tab
      const activeTabExercises = updatedExercises.filter(
        (el: any) => el.Section === activeTab,
      );
      const exerciseToUpdate = activeTabExercises[index];

      // Find the original index in the full array
      const originalIndex = updatedExercises.findIndex(
        (el: any) => el === exerciseToUpdate,
      );

      if (exerciseToUpdate.Exercises.length > 1) {
        // If there are multiple exercises, remove the specific one
        const remainingExercises = updatedExercises[
          originalIndex
        ].Exercises.filter((_, i) => i !== exersiseIndex);

        // If only one exercise remains, convert to normal set
        if (remainingExercises.length === 1) {
          updatedExercises[originalIndex] = {
            ...updatedExercises[originalIndex],
            Type: 'Normalset',
            Exercises: remainingExercises,
          };
        } else {
          // Keep as superset with remaining exercises
          updatedExercises[originalIndex] = {
            ...updatedExercises[originalIndex],
            Exercises: remainingExercises,
          };
        }
      } else {
        // If this is the last exercise, convert to normal set instead of removing
        updatedExercises[originalIndex] = {
          ...updatedExercises[originalIndex],
          Type: 'Normalset',
        };
      }
      return updatedExercises;
    });
  };

  useEffect(() => {
    onChange(exercises);
  }, [exercises, onChange]);

  useEffect(() => {
    setFilteredExerciseList(
      exerciseList.filter((exercise) =>
        (exercise?.Title ?? '')
          .toLowerCase()
          .includes((searchValue ?? '').toLowerCase()),
      ),
    );
  }, [exerciseList, searchValue]);

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    exercise: Exercise,
  ) => {
    e.dataTransfer.setData(
      'application/holisticare-exercise',
      JSON.stringify(exercise),
    );
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes('application/holisticare-exercise')) {
      e.currentTarget.classList.add('bg-Gray-50');
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('bg-Gray-50');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-Gray-50');

    if (!e.dataTransfer.types.includes('application/holisticare-exercise')) {
      return;
    }

    try {
      const exerciseData = JSON.parse(
        e.dataTransfer.getData('application/holisticare-exercise'),
      );
      if (exerciseData && exerciseData.Title && exerciseData.Files) {
        addExercise(exerciseData);
      }
    } catch (error) {
      console.error('Error parsing dragged exercise data:', error);
    }
  };

  return (
    <>
      <div className="w-full mt-6">
        <TabNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          orderList={orderList}
          handleChangeSetOrder={handleChangeSetOrder}
        />
        <div className="flex w-full items-center justify-between">
          <div>
            <div
              className={`w-[530px] h-[432px] border  border-Gray-50 rounded-xl flex flex-col items-center ${!exercises.length && 'justify-center'} p-3 overflow-y-auto`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {exercises.length === 0 && (
                <>
                  <img src="/icons/amico.svg" alt="" />
                  <div className="font-medium text-xs text-Text-Primary mt-8">
                    No exercise found.
                  </div>
                </>
              )}
              <div className="grid gap-2 w-full">
                {exercises
                  .filter((el: any) => el.Section === activeTab)
                  .map((exercise: any, index: any) => {
                    return (
                      <>
                        {exercise.Type === 'Superset' ? (
                          <SuperSetExersiseItem
                            onDelete={(exersiseIndex: number) =>
                              handleSuperSetDelete(index, exersiseIndex)
                            }
                            key={index}
                            index={index}
                            exercise={exercise}
                            onChange={handleExerciseChange}
                            toSuperSet={() => {}}
                            removeFromSuperSet={(exersiseIndex: number) =>
                              handleRemoveFromSuperSet(index, exersiseIndex)
                            }
                            errors={errors}
                            showValidation={showValidation}
                          />
                        ) : (
                          <ExerciseItem
                            showValidation={showValidation}
                            exesiseIndex={0}
                            sets={exercise.Sets}
                            onDelete={() => {
                              setExercises((prevExercises) => {
                                const updatedExercises = [...prevExercises];
                                const activeTabExercises =
                                  updatedExercises.filter(
                                    (el: any) => el.Section === activeTab,
                                  );
                                const exerciseToDelete =
                                  activeTabExercises[index];
                                const originalIndex =
                                  updatedExercises.findIndex(
                                    (el: any) => el === exerciseToDelete,
                                  );
                                updatedExercises.splice(originalIndex, 1);
                                return updatedExercises;
                              });
                            }}
                            key={index}
                            index={index}
                            exercise={exercise.Exercises[0]}
                            onChange={handleExerciseChange}
                            toSuperSet={() => handleSuperSet(index, exercise)}
                            errors={errors}
                          />
                        )}
                      </>
                    );
                  })}
              </div>
            </div>
            {/* {showValidation && exercises.length === 0 && (
              <div className="text-Red text-xs mt-2">
                Add exercise to continue.
              </div>
            )} */}
          </div>
          <div className="w-[314px] h-[432px] rounded-xl bg-backgroundColor-Main flex flex-col p-3">
            <div className="flex w-full items-center justify-between mt-1">
              <div className="font-medium text-sm text-Text-Primary">
                Exercise
              </div>
            </div>
            <SearchBox
              ClassName="rounded-2xl !h-8 !min-w-full border border-Gray-50 !px-3 !py-[10px] !shadow-[unset] !bg-white mt-3"
              placeHolder="Search exercises..."
              value={searchValue}
              onSearch={(value: any) => setSearchValue(value)}
            />
            <div className="flex flex-col overflow-y-auto w-full min-h-[300px] gap-1 mt-2">
              {filteredExerciseList.length === 0 && (
                <div className="flex flex-col items-center justify-center w-full h-full bg-white rounded-2xl pb-4">
                  <img src="/icons/empty-messages-coach.svg" alt="" />
                  <div className="font-medium text-xs text-Text-Primary -mt-6">
                    No results found.
                  </div>
                </div>
              )}
              {filteredExerciseList.map((el: any, index: number) => {
                return (
                  <div
                    key={index}
                    draggable
                    onDragStart={(e) => handleDragStart(e, el)}
                    onDragEnd={handleDragEnd}
                    className={`w-full h-[40px] bg-white px-2 py-1 rounded-xl flex items-center justify-between cursor-move ${isDragging ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center justify-center gap-[5px]">
                      <div className="relative">
                        <img
                          src="/images/activity/activity-demo.png"
                          alt=""
                          className="w-8 h-8 bg-cover rounded-lg mr-1"
                        />
                        {Array.isArray(el?.Files) && el.Files.length > 0 && (
                          <img
                            src="/icons/video-octagon.svg"
                            alt=""
                            className="w-[17.79px] h-[17.79px] absolute top-[7px] left-[7px]"
                          />
                        )}
                      </div>
                      <div className="text-xs text-Text-Primary">
                        {el.Title}
                      </div>
                      <div className="text-[8px] text-Text-Quadruple">
                        ({el.Files.length} Videos)
                      </div>
                    </div>
                    <img
                      onClick={() => addExercise(el)}
                      src="/icons/add-blue.svg"
                      alt=""
                      className="w-4 h-4 cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExersiceStep;
