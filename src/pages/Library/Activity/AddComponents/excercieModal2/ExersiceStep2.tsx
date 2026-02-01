/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import Application from '../../../../../api/app';
import SearchBox from '../../../../../Components/SearchBox';
import ExerciseItem2 from './ExersiseItem2';
import TabNavigation2 from './TabNavigation2';
import SuperSetExersiseItem2 from './SuperSetExersiseItem2';

/* -------------------------------- TYPES -------------------------------- */

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

/* ------------------------------ CONSTANTS ------------------------------ */

const EXERCISE_GROUPS = [
  'Warm-Up',
  'Main Workout',
  'Finisher',
  'Cool Down',
  'Recovery',
] as const;

type ExerciseGroupType = (typeof EXERCISE_GROUPS)[number];

/* ------------------------------ COMPONENT ------------------------------ */

const ExersiceStep2: React.FC<ExersiceStepProps> = ({
  onChange,
  showValidation,
  setShowValidation,
  onValidationChange,
  handleChangeSetOrder,
}) => {
  /* ------------------------------- STEPS ------------------------------- */

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedGroups, setSelectedGroups] = useState<ExerciseGroupType[]>([]);

  /* ------------------------------- STATE ------------------------------- */

  const [exercises, setExercises] = useState<ExerciseGroup[]>([]);
  const [exerciseList, setExerciseList] = useState<Exercise[]>([]);
  const [filteredExerciseList, setFilteredExerciseList] = useState<Exercise[]>(
    [],
  );
  const [loadingExercises, setLoadingExercises] = useState(true);

  const [activeTab, setActiveTab] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isMobilePage, setIsMobilePage] = useState(window.innerWidth < 768);

  /* ------------------------------ EFFECTS ------------------------------ */

  useEffect(() => {
    const handleResize = () => {
      setIsMobilePage(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setLoadingExercises(true);

    Application.getExercisesList({})
      .then((res) => setExerciseList(res.data))
      .catch(console.error)
      .finally(() => setLoadingExercises(false));
  }, []);

  useEffect(() => {
    setFilteredExerciseList(
      exerciseList.filter((exercise) =>
        exercise.Title.toLowerCase().includes(searchValue.toLowerCase()),
      ),
    );
  }, [exerciseList, searchValue]);
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
  useEffect(() => {
    if (!exercises.find((e) => e.Section === activeTab)) {
      setActiveTab(exercises[0]?.Section ?? '');
    }
  }, [exercises]);

  useEffect(() => {
    if (step === 2) {
      onChange(exercises);
    }
  }, [exercises, step, onChange]);

  /* ----------------------------- VALIDATION ---------------------------- */

const validateExercise = (exercise: ExerciseGroup, index: number) => {
    if (!exercise.Exercises.length) return {};

    const e = exercise.Exercises[0];
const key = `${exercise.Section}-${index}`;
    const errs: any = {};

    if (!exercise.Sets || !/^\d+$/.test(exercise.Sets)) {
      errs[`sets-${key}`] = 'Required';
    }
    if (!e.Reps || !/^\d+$/.test(e.Reps)) {
      errs[`reps-${key}`] = 'Required';
    }
    if (e.Rest && !/^\d+$/.test(e.Rest)) {
      errs[`rest-${key}`] = 'Numbers only';
    }

    return errs;
  };

  useEffect(() => {
    if (step !== 2) return;

    const filledSections = new Set(
      exercises.filter((e) => e.Exercises.length).map((e) => e.Section),
    );

    if (filledSections.size !== selectedGroups.length) {
      onValidationChange?.(false);
      return;
    }

  const allErrors = exercises.reduce(
  (acc, e, i) => ({ ...acc, ...validateExercise(e, i) }),
  {},
);

    setErrors(allErrors);
    onValidationChange?.(Object.keys(allErrors).length === 0);
  }, [exercises, selectedGroups, step]);

  /* --------------------------- EXERCISE LOGIC -------------------------- */

  const addExercise = (exercise: Exercise) => {
    if (!activeTab) return;

    setShowValidation?.(false);

    setExercises((prev) => [
      ...prev,
      {
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
      },
    ]);
  };

  /* -------------------------- GROUP STEP UI ---------------------------- */

  if (step === 1) {
    return (
      <div className="w-full mt-6 flex flex-col gap-6">
        <div className="text-lg font-medium">Select workout sections</div>

        <div className="grid grid-cols-2 gap-3">
          {EXERCISE_GROUPS.map((group) => {
            const active = selectedGroups.includes(group);
            return (
              <button
                key={group}
                onClick={() =>
                  setSelectedGroups((prev) =>
                    prev.includes(group)
                      ? prev.filter((g) => g !== group)
                      : [...prev, group],
                  )
                }
                className={`h-12 rounded-xl border text-sm font-medium transition ${
                  active
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white border-Gray-50'
                }`}
              >
                {group}
              </button>
            );
          })}
        </div>

        <div className="flex justify-end">
          <button
            disabled={!selectedGroups.length}
            onClick={() => {
              const initial = selectedGroups.map((g) => ({
                Type: 'Normalset',
                Section: g,
                Sets: '',
                Exercises: [],
              }));
              setExercises(initial);
              setActiveTab(initial[0].Section);
              setStep(2);
            }}
            className="px-6 py-2 rounded-xl bg-black text-white disabled:opacity-40"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

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
const newErrors = validateExercise(
  updatedExercises[originalIndex],
  originalIndex,
);
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
  const activeTabExercises = exercises.filter(
    (e) => e.Section === activeTab && e.Exercises.length > 0,
  );

  return (
    <div
      className="w-full mt-6 overflow-y-auto md:overflow-hidden h-[80vh] md:h-[unset]"
      style={
        isMobilePage
          ? { scrollbarWidth: 'thin', scrollbarColor: '#E9EDF5 #E9EDF5' }
          : {}
      }
    >
      <TabNavigation2
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        orderList={selectedGroups.map((g, i) => ({
          name: g,
          enabled: true,
          order: i,
        }))}
        handleChangeSetOrder={handleChangeSetOrder}
      />
      <div className="flex w-full items-center justify-between flex-col-reverse md:flex-row gap-4 md:gap-0">
        <div>
          <div
            className={`w-[80vw] md:w-[530px] h-[432px] border ${showValidation && exercises.length === 0 && 'border-Red'} border-Gray-50 rounded-xl flex flex-col items-center ${!exercises.length && 'justify-center'} p-3 overflow-y-auto`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {activeTabExercises.length === 0 && (
             <div className='flex flex-col h-[300px] items-center justify-center'>

          
                <img src="/icons/amico.svg" alt="" />
                <div className="font-medium text-xs text-Text-Primary mt-8">
                  No exercise found.
                </div>
                <div className="text-xs text-Text-Secondary mt-2">
                  Drag or click exercises from the right →
                </div>
              </div>
            )}
            <div className="grid gap-2 w-full">
              {exercises
                .filter(
                  (el: any) =>
                    el.Section === activeTab &&
                    el.Exercises &&
                    el.Exercises.length > 0,
                )
                .map((exercise: any, index: number) => {
                  return (
                    <>
                      {exercise.Type === 'Superset' ? (
                        <SuperSetExersiseItem2
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
                        <ExerciseItem2
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
                              const originalIndex = updatedExercises.findIndex(
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
          {showValidation && exercises.length === 0 && (
            <div className="text-Red text-xs mt-2">
              Add exercise to continue.
            </div>
          )}
        </div>
        <div className="w-[80vw] md:w-[314px] h-[432px] rounded-xl bg-backgroundColor-Main flex flex-col p-3">
          <div className="flex w-full items-center justify-between mt-1">
            <div className="font-medium text-sm text-Text-Primary">
              Exercise
            </div>
          </div>
          <div className="sticky top-0 bg-backgroundColor-Main pt-2 z-10">
            <SearchBox
              ClassName="rounded-2xl !h-8 !min-w-full border border-Gray-50 !px-3 !py-[10px] !shadow-[unset] !bg-white mt-3"
              placeHolder="Search exercises..."
              value={searchValue}
              onSearch={(value: any) => setSearchValue(value)}
            />
          </div>
          <div className="flex flex-col overflow-y-auto w-full min-h-[300px] gap-1 mt-2">
            {loadingExercises && (
              <div className="flex items-center justify-center h-full text-xs text-Text-Secondary">
                Loading exercises...
              </div>
            )}
            {!loadingExercises && filteredExerciseList.length === 0 && (
              <div className="flex flex-col items-center justify-center w-full h-full bg-white rounded-2xl pb-4">
                <img src="/icons/empty-messages-coach.svg" alt="" />
                <div className="font-medium text-xs text-Text-Primary mt-2">
                  No exercises found
                </div>
                <div className="text-[10px] text-Text-Secondary">
                  Try another keyword
                </div>
              </div>
            )}
            {filteredExerciseList.map((el: any, index: number) => {
              return (
                <div
                  onClick={() => addExercise(el)}
                  key={index}
                  draggable
                  onDragStart={(e) => handleDragStart(e, el)}
                  onDragEnd={handleDragEnd}
                  className={`
  w-full min-h-[56px]
  bg-white rounded-xl
  px-3 py-2
  flex items-center justify-between
  hover:shadow-sm hover:bg-gray-50
  transition
  cursor-pointer
`}
                >
                  <div className="flex items-center justify-center gap-[5px]">
                    <div className="relative">
                      <img
                        src="/images/activity/activity-demo.png"
                        alt=""
                        className="w-8 h-8 min-w-8 min-h-8 bg-cover rounded-lg mr-1"
                      />
                      {Array.isArray(el?.Files) && el.Files.length > 0 && (
                        <img
                          src="/icons/video-octagon.svg"
                          alt=""
                          className="w-[17.79px] h-[17.79px] absolute top-[7px] left-[7px]"
                        />
                      )}
                    </div>
                    <div className="text-xs text-Text-Primary leading-tight">
                      <span className="align-baseline">{el.Title} </span>
                      <span className="text-[8px] text-Text-Quadruple whitespace-nowrap align-baseline">
                        ({el.Files.length} Videos)
                      </span>
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
  );
};

export default ExersiceStep2;
