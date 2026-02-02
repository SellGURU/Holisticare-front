/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from 'react';
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
  Type: string; // 'Normalset' | 'Superset' (your code uses strings)
  Section: string; // group name
  Sets: string;
  Exercises: ExerciseSet[];
}

interface ExersiceStepProps {
  mode: 'groups' | 'exercises';
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
  mode,
  onChange,
  sectionList,
  showValidation,
  setShowValidation,
  onValidationChange,
  handleChangeSetOrder,
}) => {
  /* -------------------------- CONTROLLED STATE -------------------------- */
  const exercises = sectionList ?? [];

  // helper that lets you keep your "setExercises(prev => ...)" style,
  // but actually updates parent
  const setExercises = (
    updater: (prev: ExerciseGroup[]) => ExerciseGroup[],
  ) => {
    onChange(updater(exercises));
  };

  const selectedGroups = useMemo(
    () => exercises.map((s) => s.Section as ExerciseGroupType),
    [exercises],
  );

  /* ------------------------------- STATE -------------------------------- */
  const [exerciseList, setExerciseList] = useState<Exercise[]>([]);
  const [filteredExerciseList, setFilteredExerciseList] = useState<Exercise[]>(
    [],
  );
  const [loadingExercises, setLoadingExercises] = useState(true);

  const [activeTab, setActiveTab] = useState<string>('');
  const [searchValue, setSearchValue] = useState('');
  const [, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isMobilePage, setIsMobilePage] = useState(window.innerWidth < 768);
  const [validatedKeys, setValidatedKeys] = useState<Set<string>>(new Set());
  const prevShowValidationRef = React.useRef<boolean>(false);

  // helper: same key used by your validateExercise()
  const makeKey = (section: string, index: number) => `${section}-${index}`;

  /* ------------------------------ EFFECTS ------------------------------ */
  useEffect(() => {
    const prev = prevShowValidationRef.current;
    const now = !!showValidation;

    // when parent toggles false -> true (Save attempted)
    if (!prev && now) {
      setValidatedKeys((prevSet) => {
        const next = new Set(prevSet);

        // validate only cards that currently exist (and have exercises)
        exercises.forEach((ex, originalIndex) => {
          if (Array.isArray(ex.Exercises) && ex.Exercises.length > 0) {
            next.add(makeKey(ex.Section, originalIndex));
          }
        });

        return next;
      });
    }

    prevShowValidationRef.current = now;
  }, [showValidation, exercises]);

  useEffect(() => {
    const handleResize = () => setIsMobilePage(window.innerWidth < 768);
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
    const q = (searchValue ?? '').toLowerCase();
    setFilteredExerciseList(
      (exerciseList ?? []).filter((exercise) =>
        (exercise?.Title ?? '').toLowerCase().includes(q),
      ),
    );
  }, [exerciseList, searchValue]);

  // keep activeTab valid
  useEffect(() => {
    if (!exercises.length) {
      setActiveTab('');
      return;
    }
    if (!activeTab || !exercises.some((e) => e.Section === activeTab)) {
      setActiveTab(exercises[0]?.Section ?? '');
    }
  }, [exercises, activeTab]);

  /* ----------------------------- VALIDATION ---------------------------- */

  const validateExercise = (exercise: ExerciseGroup, index: number) => {
    if (!exercise?.Exercises?.length) return {};

    // NOTE: your current validation checks only the first exercise in a set,
    // keeping same behavior for compatibility.
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
    if (mode !== 'exercises') return;

    // require every selected group to have at least one exercise
    const groups = new Set(exercises.map((e) => e.Section));
    const filledGroups = new Set(
      exercises.filter((e) => e?.Exercises?.length).map((e) => e.Section),
    );

    if (filledGroups.size !== groups.size) {
      onValidationChange?.(false);
      return;
    }

    const allErrors = exercises.reduce(
      (acc, e, i) => ({ ...acc, ...validateExercise(e, i) }),
      {},
    );

    setErrors(allErrors);
    onValidationChange?.(Object.keys(allErrors).length === 0);
  }, [exercises, mode, onValidationChange]);

  /* --------------------------- GROUPS LOGIC ---------------------------- */

  const toggleGroup = (group: ExerciseGroupType) => {
    setShowValidation?.(false);

    setExercises((prev) => {
      const exists = prev.some((s) => s.Section === group);

      if (exists) {
        const next = prev.filter((s) => s.Section !== group);

        if (activeTab === group) {
          setActiveTab(next[0]?.Section ?? '');
        }

        return next;
      }

      const next = [
        ...prev,
        { Type: 'Normalset', Section: group, Sets: '', Exercises: [] },
      ];

      if (!activeTab) setActiveTab(group);

      return next;
    });
  };

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
  const handleDelete = (originalIndex: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== originalIndex));
  };

  const handleExerciseChange = (
    originalIndex: number,
    field: string,
    value: string,
    exersiseIndex: number,
  ) => {
    setExercises((prev) => {
      const updated = [...prev];
      const target = updated[originalIndex];
      if (!target) return prev;

      if (field === 'Sets') {
        updated[originalIndex] = { ...target, Sets: value };
      } else if (field === 'Reps' || field === 'Weight' || field === 'Rest') {
        updated[originalIndex] = {
          ...target,
          Exercises: target.Exercises.map((ex, i) => {
            if (i !== exersiseIndex) return ex;
            return {
              ...ex,
              [field]: value,
              Exercise: { ...ex.Exercise, [field]: value },
            };
          }),
        };
      } else {
        updated[originalIndex] = {
          ...target,
          Exercises: target.Exercises.map((ex, i) =>
            i === exersiseIndex ? { ...ex, [field]: value } : ex,
          ),
        };
      }

      // validate this exact row
      const newErrors = validateExercise(updated[originalIndex], originalIndex);
      setErrors((prevErr) => ({ ...prevErr, ...newErrors }));

      return updated;
    });
  };

  const handleSuperSet = (currentOriginalIndex: number) => {
    setExercises((prev) => {
      const updated = [...prev];

      // find previous visible in same section
      const prevVisibleIndex = [...updated]
        .map((e, i) => ({ e, i }))
        .filter(({ e }) => e.Section === activeTab && e.Exercises?.length > 0)
        .map(({ i }) => i)
        .filter((i) => i < currentOriginalIndex)
        .pop();

      if (prevVisibleIndex == null) return prev;

      const previousExercise = updated[prevVisibleIndex];
      const currentExercise = updated[currentOriginalIndex];

      const superSet = {
        ...previousExercise,
        Type: 'Superset',
        Exercises: [
          ...previousExercise.Exercises,
          ...currentExercise.Exercises,
        ],
      };

      const resolved = updated.filter(
        (_, i) => i !== currentOriginalIndex && i !== prevVisibleIndex,
      );
      resolved.splice(prevVisibleIndex, 0, superSet);

      return resolved;
    });
  };

  const handleRemoveFromSuperSet = (
    originalIndex: number,
    exersiseIndex: number,
  ) => {
    setExercises((prev) => {
      const updated = [...prev];
      const group = updated[originalIndex];
      if (!group) return prev;

      const removed = group.Exercises?.[exersiseIndex];
      if (!removed) return prev;

      const remaining = group.Exercises.filter((_, i) => i !== exersiseIndex);

      // update the original group
      if (remaining.length === 1) {
        updated[originalIndex] = {
          ...group,
          Type: 'Normalset',
          Exercises: remaining,
        };
      } else {
        updated[originalIndex] = {
          ...group,
          Exercises: remaining,
        };
      }

      // insert removed as a new normal set right after
      updated.splice(originalIndex + 1, 0, {
        Type: 'Normalset',
        Section: group.Section,
        Sets: group.Sets,
        Exercises: [removed],
      });

      return updated;
    });
  };

  const handleSuperSetDelete = (
    originalIndex: number,
    exersiseIndex: number,
  ) => {
    setExercises((prev) => {
      const updated = [...prev];
      const group = updated[originalIndex];
      if (!group) return prev;

      const remaining = group.Exercises.filter((_, i) => i !== exersiseIndex);

      if (remaining.length === 0) {
        // remove whole card if nothing left
        updated.splice(originalIndex, 1);
        return updated;
      }

      if (remaining.length === 1) {
        updated[originalIndex] = {
          ...group,
          Type: 'Normalset',
          Exercises: remaining,
        };
      } else {
        updated[originalIndex] = {
          ...group,
          Exercises: remaining,
        };
      }

      return updated;
    });
  };

  /* ------------------------------ DND ---------------------------------- */

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

  const handleDragEnd = () => setIsDragging(false);

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

  /* -------------------------- GROUP STEP UI ---------------------------- */

  if (mode === 'groups') {
    return (
      <div className="w-full mt-6 flex flex-col gap-6">
        <div className="text-lg font-medium">Select workout sections</div>

        <div className="grid grid-cols-2 gap-3">
          {EXERCISE_GROUPS.map((group) => {
            const active = selectedGroups.includes(group);
            return (
              <button
                key={group}
                onClick={() => toggleGroup(group)}
                className={`h-12 rounded-xl border text-sm font-medium transition ${
                  active
                    ? 'bg-Primary-DeepTeal text-white border-blue-500'
                    : 'bg-white border-Gray-50'
                }`}
              >
                {group}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  /* ------------------------- EXERCISES STEP UI ------------------------- */

  const activeTabExercises = exercises.filter(
    (e) => e.Section === activeTab && e.Exercises && e.Exercises.length > 0,
  );
  const visibleExercises = exercises
    .map((e, originalIndex) => ({ e, originalIndex }))
    .filter(
      ({ e }) =>
        e.Section === activeTab &&
        Array.isArray(e.Exercises) &&
        e.Exercises.length > 0,
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
        activeTab={activeTab || selectedGroups[0]}
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
            className={`w-[80vw] md:w-[530px] h-[432px] border ${
              showValidation && exercises.length === 0 ? 'border-Red' : ''
            } border-Gray-50 rounded-xl flex flex-col items-center ${
              !exercises.length ? 'justify-center' : ''
            } p-3 overflow-y-auto`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {activeTabExercises.length === 0 && (
              <div className="flex flex-col h-[300px] items-center justify-center">
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
              {visibleExercises.map(({ e: exercise, originalIndex }) => {
                const key = makeKey(exercise.Section, originalIndex);
                const cardShowValidation =
                  !!showValidation && validatedKeys.has(key);

                return (
                  <React.Fragment key={`${exercise.Section}-${originalIndex}`}>
                    {exercise.Type === 'Superset' ? (
                      <SuperSetExersiseItem2
                        index={originalIndex} // IMPORTANT: use originalIndex, not uiIndex
                        exercise={exercise}
                        onChange={(
                          idx: number,
                          field: string,
                          value: string,
                          exIdx: number,
                        ) =>
                          handleExerciseChange(
                            originalIndex,
                            field,
                            value,
                            exIdx,
                          )
                        }
                        onDelete={(exersiseIndex: number) =>
                          handleSuperSetDelete(originalIndex, exersiseIndex)
                        }
                        removeFromSuperSet={(exersiseIndex: number) =>
                          handleRemoveFromSuperSet(originalIndex, exersiseIndex)
                        }
                        toSuperSet={() => {}}
                        errors={errors}
                        showValidation={cardShowValidation} // ✅ per card
                      />
                    ) : (
                      <ExerciseItem2
                        index={originalIndex} // IMPORTANT: originalIndex
                        showValidation={cardShowValidation} // ✅ per card
                        exesiseIndex={0}
                        sets={exercise.Sets}
                        exercise={exercise.Exercises[0]}
                        onChange={(
                          idx: number,
                          field: string,
                          value: string,
                          exIdx: number,
                        ) =>
                          handleExerciseChange(
                            originalIndex,
                            field,
                            value,
                            exIdx,
                          )
                        }
                        toSuperSet={() => handleSuperSet(originalIndex)}
                        errors={errors}
                        onDelete={() => handleDelete(originalIndex)}
                      />
                    )}
                  </React.Fragment>
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
