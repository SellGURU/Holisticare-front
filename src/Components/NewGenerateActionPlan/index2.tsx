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
// import { AlertModal } from '../AlertModal';

const GenerateActionPlan = () => {
  const [plans, setPlans] = useState<any>(null);
  const { id } = useParams<{ id: string }>();
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [isWeighted, setIsWeighted] = useState(false);
  const [actions, setActions] = useState<Array<any>>([]);
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
  const [categories, setCategories] = useState([]);
  const savePlan = (newPlans: any) => {
    setIsLoadingPlans(true);
    Application.getActionPlanTaskDirectoryNew({
      member_id: id,
      percents: newPlans,
    })
      .then((res) => {
        setCategories(res.data.action_db);
        setIsWeighted(true);
      })
      .finally(() => {
        setIsLoadingPlans(false);
        // setSelectPlanView(true);
      });
  };
  const [isLoadingSaveChanges, setISLoadingSaveChanges] = useState(false);
  const navigate = useNavigate();
  const [duration, setDuration] = useState(1);
  const [planObjective, setPlanObjective] = useState('');
  const saveChanges = () => {
    setISLoadingSaveChanges(true);
    Application.getActionPlanBlockSaveTasksNew({
      member_id: id,
      tasks: actions,
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
      setIsLoadingPlans(true);
      Application.getActionPlanBlockCalendarView({
        member_id: id,
        tasks: actions,
        duration: duration,
      })
        .then((res) => {
          setCalendarViewData(res.data);
        })
        .finally(() => {
          setIsLoadingPlans(false);
        });
    }
  }, [calendarView]);
  return (
    <>
      <div className="h-[100vh] overflow-auto overflow-y-scroll">
        <div className="w-full fixed top-0  hidden bg-[#E9F0F2] lg:flex lg:z-[9]">
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
                    <div>
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
                    <div className="flex pb-3 justify-between gap-4 mx-8 mt-4 items-center">
                      <div className="flex-grow">
                        <PlanObjective
                          value={planObjective}
                          setValue={setPlanObjective}
                        ></PlanObjective>
                      </div>
                      <div className="w-[342px]">
                        <TimeDuration
                          setDuration={(value) => {
                            setDuration(value);
                          }}
                        ></TimeDuration>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {isLoadingPlans && (
          <LoaderBox
            text="We are generating tailored methods aligned with your Holistic Plan .
                    This may take a moment."
          ></LoaderBox>
        )}

        {!calendarView ? (
          <>
            {!isWeighted ? (
              <>
                <div className="w-full h-full flex justify-center items-center">
                  <CategorieyWeight
                    data={plans}
                    onSubmit={(values) => {
                      savePlan(values);
                    }}
                  ></CategorieyWeight>
                </div>
              </>
            ) : (
              <>
                <div className=" w-full h-full mt-[190px] ">
                  <Stadio
                    actions={actions}
                    setActions={setActions}
                    setData={setCategories}
                    data={categories}
                    setCalendarView={setCalendarView}
                  ></Stadio>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            {calendarViewData && (
              <div className="px-8 py-6">
                {calendarViewData.length > 0 && (
                  <CalenderComponent data={calendarViewData} />
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
