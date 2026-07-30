/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef, useCallback } from 'react';
import { TopBar } from '../topBar';
// import CategorieyWeight from './components/CategorieyWeight';
import Application from '../../api/app';
import LoaderBox from './components/LoaderBox';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ButtonPrimary } from '../Button/ButtonPrimary';
import TimeDuration from './components/TimeDuration';
import PlanObjective from './components/PlanObjective';
import Stadio from './components/Stadio';
// import dataJson from './data.json';
import SpinnerLoader from '../SpinnerLoader';
import CalenderComponent from '../CalendarComponent/CalendarComponent';
import { ComboBar } from '../ComboBar';
import SemiCircularProgressBar from './components/SemiCircularProgressBar';
import CircularProgressBar from './components/CircularProgressBar';
// import { AlertModal } from '../AlertModal';
import useIsDemo from '../../hooks/useIsDemo';
import { showError } from '../GlobalToast';
import {
  buildTaskIdentity,
  groupErrorsByTaskKey,
  mapBackendTaskErrors,
  scrollToFirstTaskError,
  TaskValidationError,
  validateActionPlanTasks,
} from './actionPlanValidation';

const GenerateActionPlan = () => {
  const isDemo = useIsDemo();
  // const [plans, setPlans] = useState<any>(null);
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isMountedRef = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [isWeighted, setIsWeighted] = useState(false);
  const [actions, setActions] = useState<any>({
    checkIn: [],
    category: [],
  });
  // useEffect(() => {
  //   Application.getActionPlanMethodsNew().then((res) => {
  //     setPlans(res.data);
  //   });
  // }, []);
  const [categories, setCategories] = useState<any>({
    checkIn: [],
    category: [],
  });
  const splitTasks = useCallback((items: any[] = []) => {
    const checkInItems = items.filter(
      (item: any) => item.Task_Type === 'Checkin',
    );
    const categoryItems = items.filter(
      (item: any) => item.Task_Type !== 'Checkin',
    );

    return {
      checkIn: checkInItems,
      category: categoryItems,
    };
  }, []);

  const removeSelectedTasks = useCallback(
    (availableTasks: any[] = [], selectedTasks: any[] = []) => {
      const selectedKeys = new Set(selectedTasks.map(buildTaskIdentity));
      return availableTasks.filter(
        (task: any) => !selectedKeys.has(buildTaskIdentity(task)),
      );
    },
    [buildTaskIdentity],
  );

  const loadAvailableTasks = useCallback(
    (selectedTasks: any[] = [], options?: { isEditMode?: boolean }) => {
      setIsLoadingPlans(true);
      Application.getActionPlanTaskDirectoryNew({
        member_id: id,
      })
        .then((res) => {
          if (!isMountedRef.current) return;

          const availableTasks = removeSelectedTasks(res.data, selectedTasks);
          setCategories(splitTasks(availableTasks));
          setActionPlanError(false);
        })
        .catch(() => {
          if (!isMountedRef.current) return;
          if (options?.isEditMode) {
            showError(
              'Could not load available tasks',
              'Your draft is still loaded. Try refreshing the page to add more tasks.',
            );
            return;
          }
          setActionPlanError(true);
        })
        .finally(() => {
          if (isMountedRef.current) {
            setIsLoadingPlans(false);
          }
        });
    },
    [id, removeSelectedTasks, splitTasks],
  );
  const [actionPlanError, setActionPlanError] = useState(false);
  const getPaln = useCallback(() => {
    loadAvailableTasks();
    setIsWeighted(true);
  }, [loadAvailableTasks]);
  const getSavedPaln = (planId: string) => {
    Application.actionPalnShowTasks({
      member_id: id,
      id: planId,
      // percents: newPlans,
    })
      .then((res) => {
        const splitSelectedTasks = splitTasks(res.data.tasks);
        setIsDarft(res.data.is_draft);
        setActions({
          checkIn: splitSelectedTasks.checkIn,
          category: splitSelectedTasks.category,
        });
        setDuration(res.data.duration);
        setPlanObjective(res.data.plan_objective);

        setIsWeighted(true);
        loadAvailableTasks(res.data.tasks, { isEditMode: true });
        setActionPlanError(false);
      })
      .catch((err) => {
        const detail = err?.detail ?? err?.response?.data?.detail ?? '';
        const message = typeof detail === 'string' ? detail : detail?.message;
        if (!isMountedRef.current) return;
        setIsLoadingPlans(false);
        if (err?.code === 'PATIENT_NOT_FOUND') {
          setActionPlanError(true);
          return;
        }
        if (
          String(message || '')
            .toLowerCase()
            .includes('block')
        ) {
          showError(
            'Action plan is no longer available',
            'This draft or saved plan may have changed. Returning to the Action Plan list.',
          );
          navigate('/report/' + id + '/a?section=Action Plan');
          return;
        }
        showError(
          'Could not load action plan',
          typeof message === 'string' && message
            ? message
            : 'Something went wrong while loading this plan. Please try again.',
        );
        setActionPlanError(true);
      })
      .finally(() => {
        if (isMountedRef.current) {
          setIsLoadingPlans(false);
        }
      });
  };
  useEffect(() => {
    const planIdFromUrl = searchParams.get('planId');
    if (planIdFromUrl) {
      getSavedPaln(planIdFromUrl);
    } else {
      getPaln();
    }

    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [getPaln]);

  const [isLoadingSaveChanges, setISLoadingSaveChanges] = useState(false);
  const [isLoadingCalendarView, setIsLoadingCalendarView] = useState(false);
  const navigate = useNavigate();
  const [duration, setDuration] = useState(1);
  const [planObjective, setPlanObjective] = useState(
    'Personalized Action Plan',
  );
  const prepareDataForBackend = useCallback((data: any) => {
    return [...data.checkIn, ...data.category];
  }, []);
  const [taskValidationErrors, setTaskValidationErrors] = useState<
    Record<string, TaskValidationError[]>
  >({});
  const [checkSave, setCheckSave] = useState(false);

  const applyActionPlanValidationErrors = useCallback(
    (errors: TaskValidationError[]) => {
      if (errors.length === 0) return;
      setCheckSave(true);
      setTaskValidationErrors(groupErrorsByTaskKey(errors));
      scrollToFirstTaskError(errors);
    },
    [],
  );

  const clearTaskValidation = useCallback((task: any) => {
    const key = buildTaskIdentity(task);
    setTaskValidationErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const handleActionPlanSaveError = useCallback(
    (err: any, flattenedData: any[]) => {
      const detail = err?.detail ?? err?.response?.data?.detail ?? err?.message;
      const backendErrors = mapBackendTaskErrors(detail, flattenedData);
      if (backendErrors.length > 0) {
        applyActionPlanValidationErrors(backendErrors);
        return;
      }
      const message =
        typeof detail === 'string'
          ? detail
          : typeof detail?.message === 'string'
            ? detail.message
            : 'Please review your action plan and try again.';
      setCheckSave(true);
      showError('Could not save action plan', message);
    },
    [applyActionPlanValidationErrors],
  );

  const saveChanges = () => {
    if (isDemo) return;
    const flattenedData = prepareDataForBackend(actions);
    const clientErrors = validateActionPlanTasks(flattenedData);
    if (clientErrors.length > 0) {
      applyActionPlanValidationErrors(clientErrors);
      return;
    }

    setISLoadingSaveChanges(true);
    Application.getActionPlanBlockSaveTasksNew({
      member_id: id,
      tasks: flattenedData,
      duration: duration,
      plan_objective: planObjective,
      id: actionPlanId ? actionPlanId : undefined,
      // Only use update mode for finalized (non-draft) plans.
      is_update: isDarft === false,
    })
      .then(() => {
        setTaskValidationErrors({});
        setCheckSave(false);
        navigate('/report/' + id + '/a?section=Action Plan');
      })
      .catch((err) => {
        handleActionPlanSaveError(err, flattenedData);
      })
      .finally(() => {
        setISLoadingSaveChanges(false);
      });
  };
  const [calendarView, setCalendarView] = useState(false);
  const [calendarViewData, setCalendarViewData] = useState<any>(null);
  const [actionPlanId, setActionPlanId] = useState<string | null>(null);

  // Read planId from URL query parameter
  useEffect(() => {
    const planIdFromUrl = searchParams.get('planId');
    console.log(planIdFromUrl);
    if (planIdFromUrl) {
      setActionPlanId(planIdFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    if (actionPlanId) {
      navigate(`/report/Generate-Action-Plan/${id}?planId=` + actionPlanId);
    }
  }, [actionPlanId]);
  const [isDarft, setIsDarft] = useState<boolean | null>(null);
  const autoSaveActionPlan = () => {
    if (isDemo) return;
    const prepareDataForBackend = (data: any) => {
      return [...data.checkIn, ...data.category];
    };
    const flattenedData = prepareDataForBackend(actions);
    if (
      !isLoadingSaveChanges &&
      flattenedData.length > 0 &&
      (isDarft === null || isDarft === true)
    ) {
      Application.initialSaveActionPlan({
        member_id: id,
        tasks: flattenedData,
        duration: duration,
        plan_objective: planObjective,
        id: actionPlanId ? actionPlanId : undefined,
      })
        .then((res: any) => {
          setActionPlanId(res.data.id);
          setIsDarft(true);
          // console.log('Action plan saved successfully');
        })
        .catch((err) => {
          const detail = err?.detail ?? err?.response?.data?.detail ?? '';
          if (
            String(detail).toLowerCase().includes('there is an active draft')
          ) {
            Application.ActionPlanBlockList({ member_id: id })
              .then((res: any) => {
                const latestDraft = [...(res.data || [])]
                  .reverse()
                  .find((plan: any) => plan.state === 'Draft');
                if (latestDraft?.id) {
                  setActionPlanId(latestDraft.id);
                  getSavedPaln(latestDraft.id);
                }
              })
              .catch(() => {});
          }
        });
    }
  };
  useEffect(() => {
    autoSaveActionPlan();
  }, [actions, duration, planObjective, isLoadingSaveChanges]);
  // const [showAlert, setshowAlert] = useState(true)
  useEffect(() => {
    if (calendarView) {
      setIsLoadingCalendarView(true);
      const prepareDataForBackend = (data: any) => {
        return [...data.checkIn, ...data.category];
      };

      const flattenedData = prepareDataForBackend(actions);
      Application.getActionPlanBlockCalendarView({
        member_id: id,
        tasks: flattenedData,
        duration: duration,
      })
        .then((res) => {
          setCalendarViewData(res.data);
        })
        .catch((err) => {
          console.error('Error getting action plan block calendar view:', err);
        })
        .finally(() => {
          setIsLoadingCalendarView(false);
        });
    }
  }, [calendarView]);
  const [showConflictsModal, setShowConflictsModal] = useState(false);
  const handleShowConflictsModal = () => {
    setShowConflictsModal(!showConflictsModal);
  };

  return (
    <>
      <div className="h-[100vh]  overflow-auto overflow-y-scroll">
        <div
          className={`w-full fixed  top-0 z-10 lg:z-0  bg-[#E9F0F2] flex ${
            showConflictsModal ? 'lg:z-0' : 'lg:z-[9]'
          }`}
        >
          <div className="w-full ">
            <TopBar></TopBar>
            <div className="flex justify-between items-center mt-9 mx-4 lg:mx-8">
              <div className="flex items-center gap-3">
                <div
                  onClick={() => {
                    if (!calendarView) {
                      navigate('/report/' + id + '/a?section=Action Plan');
                    } else {
                      setCalendarView(false);
                    }
                  }}
                  className={` px-[6px] py-[3px] flex items-center justify-center cursor-pointer bg-white border border-Gray-50 lg:rounded-md shadow-100`}
                >
                  <img
                    className="w-4 xs:w-6 h-4 xs:h-6"
                    src="/icons/arrow-back.svg"
                  />
                </div>
                <div className="TextStyle-Headline-5 text-Text-Primary">
                  {calendarView ? 'Calendar View' : 'Generate Action Plan'}
                </div>
              </div>
              {!calendarView && (
                <>
                  {isWeighted && (
                    <div className="lg:pr-[70px]">
                      <ButtonPrimary
                        ClassName="h-[33px] w-[120px] xs:w-[155px] text-[10px] xs:text-xs text-nowrap"
                        disabled={isDemo}
                        onClick={saveChanges}
                        title={
                          isDemo ? 'Demo plan - upgrade to enable' : undefined
                        }
                      >
                        {isLoadingSaveChanges ? (
                          <>
                            <SpinnerLoader />
                          </>
                        ) : (
                          <>
                            <img src="/icons/tick-square.svg" alt="" />
                            Save Changes
                          </>
                        )}
                      </ButtonPrimary>
                    </div>
                  )}
                </>
              )}
            </div>
            {!calendarView && (
              <>
                {isWeighted && (
                  <>
                    <div className="flex flex-col lg:flex-row pb-3 justify-between gap-4 mx-4 lg:mx-8 mt-4 items-center lg:pr-[70px]">
                      <div className="flex-grow w-full lg:w-auto">
                        <PlanObjective
                          value={planObjective}
                          setValue={setPlanObjective}
                        />
                      </div>
                      <div className=" w-full lg:w-[342px]">
                        <TimeDuration
                          setDuration={(value) => {
                            setDuration(value);
                          }}
                          duration={duration}
                        />
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {isLoadingPlans && (
          <LoaderBox text="We're generating your Action Plan. This may take a moment." />
        )}
        {!isLoadingPlans && actionPlanError && (
          <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-85 z-20 px-6">
            <div className="TextStyle-Headline-5 text-Text-Primary mb-2 text-center">
              Could not load action plan
            </div>
            <div className="text-Text-Secondary TextStyle-Body-1 mb-6 text-center max-w-md">
              Something went wrong while loading this plan. You can go back and
              try again.
            </div>
            <ButtonPrimary
              ClassName="h-[33px] w-[160px] text-xs"
              onClick={() =>
                navigate('/report/' + id + '/a?section=Action Plan')
              }
            >
              Back to Action Plan
            </ButtonPrimary>
          </div>
        )}
        {isLoadingCalendarView && <LoaderBox />}

        {!calendarView ? (
          <>
            {/* {!isWeighted ? ( */}
            {/* <> */}
            {/* <div className="w-full h-full flex justify-center items-center">
                  <CategorieyWeight
                    data={plans}
                    onSubmit={(values) => {
                      savePlan(values);
                      setPlans(values);
                    }}
                  />
                </div> */}
            {/* </> */}
            {/* ) : ( */}
            <>
              <div
                // style={{ height: window.innerHeight - 190 + 'px' }}
                className="w-full h-[calc(100vh-190px)]   mt-[250px] lg:mt-[190px] pb-10 lg:pr-[70px] "
              >
                <Stadio
                  isCheckSave={checkSave}
                  actions={actions}
                  setActions={setActions}
                  setData={setCategories}
                  data={categories}
                  setCalendarView={setCalendarView}
                  plans={[]}
                  handleShowConflictsModal={handleShowConflictsModal}
                  taskValidationErrors={taskValidationErrors}
                  onClearTaskValidation={clearTaskValidation}
                />
                <div className=" hidden lg:block absolute right-5 top-[75px] z-50">
                  <ComboBar isHolisticPlan></ComboBar>
                </div>
              </div>
            </>
            {/* )} */}
          </>
        ) : (
          <>
            {calendarViewData && (
              <div className="w-full h-full px-4 lg:px-8 mt-[125px]">
                {calendarViewData?.scheduled_tasks.length > 0 && (
                  <div className="w-full  h-fit lg:h-[112px] rounded-2xl bg-backgroundColor-Card border border-Gray-50 p-4 flex flex-col lg:flex-row justify-between">
                    <div className="flex flex-col h-full justify-between">
                      <div className="font-medium text-sm text-Text-Primary">
                        Progress
                      </div>
                      <div className="text-[10px] text-Text-Primary text-justify max-w-[400px] 2xl:max-w-[500px]">
                        Stay connected to your clients' journey with real-time
                        progress tracking. Visualize their achievements,
                        identify trends, and celebrate milestones—all to foster
                        accountability and inspire lasting wellness
                        transformations.
                      </div>
                    </div>
                    <div className="flex h-full gap-8">
                      <div className=" hidden lg:block h-full w-[1px] bg-Gray-50"></div>
                      <div className="flex -ml-4 lg:ml-0 flex-col mt-4 lg:mt-0 items-center">
                        <div className="font-medium text-sm text-Text-Primary -mb-3">
                          Total
                        </div>
                        <SemiCircularProgressBar
                          percentage={calendarViewData.progress}
                        />
                      </div>
                      <div className=" hidden lg:block h-full w-[1px] bg-Gray-50"></div>
                    </div>
                    <div className="flex -ml-4 lg:ml-0  h-full lg:gap-8">
                      <div className="flex flex-col items-center">
                        <div className="font-medium text-xs text-Text-Primary -mb-2">
                          Diet
                        </div>
                        <CircularProgressBar
                          percentage={calendarViewData.score.diet}
                        />
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="font-medium text-xs text-Text-Primary -mb-2">
                          Activity
                        </div>
                        <CircularProgressBar
                          percentage={calendarViewData.score.activity}
                        />
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="font-medium text-xs text-Text-Primary -mb-2">
                          Supplement
                        </div>
                        <CircularProgressBar
                          percentage={calendarViewData.score.supplement}
                        />
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="font-medium text-xs text-Text-Primary -mb-2">
                          Lifestyle
                        </div>
                        <CircularProgressBar
                          percentage={calendarViewData.score.lifestyle}
                        />
                      </div>
                    </div>
                  </div>
                )}
                {calendarViewData?.scheduled_tasks.length > 0 && (
                  <CalenderComponent
                    isActionPlan
                    data={calendarViewData?.scheduled_tasks}
                  />
                )}
                {/* {calendarViewData?.scheduled_tasks.length} */}
                {calendarViewData?.scheduled_tasks.length === 0 && (
                  <div className="pt-24">
                    <div className="w-full h-[200px] flex justify-center items-center">
                      <img className="" src="/icons/bro.svg" alt="" />
                    </div>
                    <div className="text-Text-Primary font-medium text-center">
                      Not scheduled yet.
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default GenerateActionPlan;
