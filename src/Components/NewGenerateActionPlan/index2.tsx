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

const GenerateActionPlan = () => {
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
  const checkSelectedTaskConflict = useCallback(
    (newPlans: any) => {
      setIsLoadingPlans(true);
      Application.checkSelectedTaskConflict({
        member_id: id,
        tasks: newPlans,
      })
        .then((res) => {
          setCategories((prevCategories: any) => ({
            ...prevCategories,
            category: res.data,
          }));
        })
        .finally(() => {
          setIsLoadingPlans(false);
        })
        .catch(() => {});
    },
    [id],
  );
  const [actionPlanError, setActionPlanError] = useState(false);
  const getPaln = useCallback(() => {
    Application.getActionPlanTaskDirectoryNew({
      member_id: id,
      // percents: newPlans,
    })
      .then((res) => {
        if (!isMountedRef.current) return;

        const checkInItems = res.data.filter(
          (item: any) => item.Task_Type === 'Checkin',
        );
        const categoryItems = res.data.filter(
          (item: any) => item.Task_Type !== 'Checkin',
        );

        setCategories({
          checkIn: checkInItems,
          category: categoryItems,
        });

        setIsWeighted(true);
        checkSelectedTaskConflict(res.data);
        setActionPlanError(false);
      })
      .catch(() => {
        if (!isMountedRef.current) return;

        setActionPlanError(true);
        timeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            getPaln();
          }
        }, 5000);
        // navigate(-1);
      });
  }, [id, checkSelectedTaskConflict]);
  const getSavedPaln = (planId: string) => {
    Application.actionPalnShowTasks({
      member_id: id,
      id: planId,
      // percents: newPlans,
    })
      .then((res) => {
        const checkInItems = res.data.tasks.filter(
          (item: any) => item.Task_Type === 'Checkin',
        );
        const categoryItems = res.data.tasks.filter(
          (item: any) => item.Task_Type !== 'Checkin',
        );
        setIsDarft(res.data.is_draft);
        // setCategories({
        //   checkIn: checkInItems,
        //   category: categoryItems,
        // });
        setActions({
          checkIn: checkInItems,
          category: categoryItems,
        });
        setDuration(res.data.duration);
        setPlanObjective(res.data.plan_objective);

        setIsWeighted(true);
        checkSelectedTaskConflict(res.data.tasks);
        setActionPlanError(false);
        setIsLoadingPlans(false);
      })
      .catch(() => {
        // if (!isMountedRef.current) return;
        // setActionPlanError(true);
        // timeoutRef.current = setTimeout(() => {
        //   if (isMountedRef.current) {
        //     getSavedPaln(planId);
        //   }
        // }, 5000);
        // navigate(-1);
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
  const saveChanges = () => {
    setCheckSave(true);
    const prepareDataForBackend = (data: any) => {
      return [...data.checkIn, ...data.category];
    };
    const flattenedData = prepareDataForBackend(actions);

    setISLoadingSaveChanges(true);
    Application.getActionPlanBlockSaveTasksNew({
      member_id: id,
      tasks: flattenedData,
      duration: duration,
      plan_objective: planObjective,
      id: actionPlanId ? actionPlanId : undefined,
      is_update: !isDarft,
    })
      .then(() => {
        // navigate(-1);
        navigate('/report/' + id + '/a?section=Action Plan');
        // alert('Tasks saved successfully!');
      })
      .finally(() => {
        setISLoadingSaveChanges(false);
      })
      .catch(() => {});
  };
  const [calendarView, setCalendarView] = useState(false);
  const [calendarViewData, setCalendarViewData] = useState<any>(null);
  const [checkSave, setCheckSave] = useState(false);
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
    const prepareDataForBackend = (data: any) => {
      return [...data.checkIn, ...data.category];
    };
    const flattenedData = prepareDataForBackend(actions);
    if (flattenedData.length > 0 && (isDarft === null || isDarft === true)) {
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
        .catch(() => {
          // console.log('Action plan save failed');
        });
    }
  };
  useEffect(() => {
    autoSaveActionPlan();
  }, [actions, duration, planObjective]);
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
          className={`w-full fixed  top-0 z-10 md:z-0  bg-[#E9F0F2] flex ${
            showConflictsModal ? 'lg:z-0' : 'lg:z-[9]'
          }`}
        >
          <div className="w-full ">
            <TopBar></TopBar>
            <div className="flex justify-between items-center mt-9 mx-4 md:mx-8">
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
                  <img className="w-4 xs:w-6 h-4 xs:h-6" src="/icons/arrow-back.svg" />
                </div>
                <div className="TextStyle-Headline-5 text-Text-Primary">
                  {calendarView ? 'Calendar View' : 'Generate Action Plan'}
                </div>
              </div>
              {!calendarView && (
                <>
                  {isWeighted && (
                    <div className="md:pr-[70px]">
                      <ButtonPrimary ClassName='h-[33px] w-[120px] xs:w-[155px] text-[10px] xs:text-xs text-nowrap' onClick={saveChanges}>
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
                    <div className="flex flex-col md:flex-row pb-3 justify-between gap-4 mx-4 md:mx-8 mt-4 items-center md:pr-[70px]">
                      <div className="flex-grow w-full md:w-auto">
                        <PlanObjective
                          value={planObjective}
                          setValue={setPlanObjective}
                        />
                      </div>
                      <div className=" w-full md:w-[342px]">
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

        {(isLoadingPlans || actionPlanError) && (
          <LoaderBox text="We're generating your Action Plan. This may take a moment." />
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
                />
                <div className=" hidden md:block absolute right-5 top-[75px] z-50">
                  <ComboBar isHolisticPlan></ComboBar>
                </div>
              </div>
            </>
            {/* )} */}
          </>
        ) : (
          <>
            {calendarViewData && (
              <div className="w-full h-full px-8 mt-[125px]">
                {calendarViewData?.scheduled_tasks.length > 0 && (
                  <div className="w-full h-[112px] rounded-2xl bg-backgroundColor-Card border border-Gray-50 p-4 flex justify-between">
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
                      <div className="h-full w-[1px] bg-Gray-50"></div>
                      <div className="flex flex-col items-center">
                        <div className="font-medium text-sm text-Text-Primary -mb-3">
                          Total
                        </div>
                        <SemiCircularProgressBar
                          percentage={calendarViewData.progress}
                        />
                      </div>
                      <div className="h-full w-[1px] bg-Gray-50"></div>
                    </div>
                    <div className="flex h-full gap-8">
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
