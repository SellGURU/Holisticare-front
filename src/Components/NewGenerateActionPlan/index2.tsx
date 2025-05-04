/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { TopBar } from '../topBar';
import CategorieyWeight from './components/CategorieyWeight';
import Application from '../../api/app';
import LoaderBox from './components/LoaderBox';
import { useNavigate, useParams } from 'react-router-dom';
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
  const [plans, setPlans] = useState<any>(null);
  const { id } = useParams<{ id: string }>();
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [isWeighted, setIsWeighted] = useState(false);
  const [actions, setActions] = useState<any>({
    checkIn: [],
    category: [],
  });
  useEffect(() => {
    setIsLoadingPlans(true);
    Application.getActionPlanMethodsNew()
      .then((res) => {
        setPlans(res.data);
      })
      .finally(() => {
        setIsLoadingPlans(false);
      });
  }, []);
  const [categories, setCategories] = useState<any>({
    checkIn: [],
    category: [],
  });
  const checkSelectedTaskConflict = (newPlans: any) => {
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
      });
  };
  const savePlan = (newPlans: any) => {
    setIsLoadingPlans(true);
    Application.getActionPlanTaskDirectoryNew({
      member_id: id,
      percents: newPlans,
    }).then((res) => {
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
    });
  };
  const [isLoadingSaveChanges, setISLoadingSaveChanges] = useState(false);
  const [isLoadingCalendarView, setIsLoadingCalendarView] = useState(false);
  const navigate = useNavigate();
  const [duration, setDuration] = useState(1);
  const [planObjective, setPlanObjective] = useState('');
  const saveChanges = () => {
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
    })
      .then(() => {
        navigate(-1);
      })
      .finally(() => {
        setISLoadingSaveChanges(false);
      });
  };
  const [calendarView, setCalendarView] = useState(false);
  const [calendarViewData, setCalendarViewData] = useState<any>(null);
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
  console.log(calendarViewData?.scheduled_tasks.length > 0 );
  
  return (
    <>
      <div className="h-[100vh] overflow-auto overflow-y-scroll">
        <div
          className={`w-full fixed top-0 hidden bg-[#E9F0F2] lg:flex ${
            showConflictsModal ? 'lg:z-0' : 'lg:z-[9]'
          }`}
        >
          <div className="w-full ">
            <TopBar></TopBar>
            <div className="flex justify-between items-center mt-9 mx-8">
              <div className="flex items-center gap-3">
                <div
                  onClick={() => {
                    if (!calendarView) {
                      navigate(-1);
                    } else {
                      setCalendarView(false);
                    }
                  }}
                  className={` px-[6px] py-[3px] flex items-center justify-center cursor-pointer lg:bg-white lg:border lg:border-Gray-50 lg:rounded-md lg:shadow-100`}
                >
                  <img className="w-6 h-6" src="/icons/arrow-back.svg" />
                </div>
                <div className="TextStyle-Headline-5 text-Text-Primary">
                  {calendarView ? 'Calendar View' : 'Generate Action Plan'}
                </div>
              </div>
              {!calendarView && (
                <>
                  {isWeighted && (
                    <div className="pr-[70px]">
                      <ButtonPrimary onClick={saveChanges}>
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
                    <div className="flex pb-3 justify-between gap-4 mx-8 mt-4 items-center pr-[70px]">
                      <div className="flex-grow">
                        <PlanObjective
                          value={planObjective}
                          setValue={setPlanObjective}
                        />
                      </div>
                      <div className="w-[342px]">
                        <TimeDuration
                          setDuration={(value) => {
                            setDuration(value);
                          }}
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
          <LoaderBox text="We are generating your Action Plan. This may take a moment." />
        )}
        {isLoadingCalendarView && <LoaderBox />}

        {!calendarView ? (
          <>
            {!isWeighted ? (
              <>
                <div className="w-full h-full flex justify-center items-center">
                  <CategorieyWeight
                    data={plans}
                    onSubmit={(values) => {
                      savePlan(values);
                      setPlans(values);
                    }}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="w-full h-full mt-[190px] pr-[70px] ">
                  <Stadio
                    actions={actions}
                    setActions={setActions}
                    setData={setCategories}
                    data={categories}
                    setCalendarView={setCalendarView}
                    plans={plans}
                    handleShowConflictsModal={handleShowConflictsModal}
                  />
                  <div className="absolute right-5 top-[75px] z-50">
                    <ComboBar isHolisticPlan></ComboBar>
                  </div>
                </div>
              </>
            )}
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
                      <div className="text-[10px] text-Text-Primary">
                        Monitor your clients' wellness progress with clear
                        insights and visual updates. Track key health metrics to
                        keep them motivated and support informed, healthy
                        choices.
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
                  <CalenderComponent isActionPlan  data={calendarViewData?.scheduled_tasks} />
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
