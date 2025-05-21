/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import Toggle from '../../../Components/Toggle';
import SearchBox from '../../../Components/SearchBox';
import ActivityHandler from './ActivityHandler';
import { ButtonSecondary } from '../../../Components/Button/ButtosSecondary';
import Application from '../../../api/app';
import Circleloader from '../../../Components/CircleLoader';
import Exercise from './Exercise';
const Activity = () => {
  const [active, setActive] = useState<'Activity' | 'Exercise'>('Activity');
  const [loading, setLoading] = useState(true);
  const [dataList, setDataList] = useState<Array<any>>([]);
  const [ExcercisesList, setExcercisesList] = useState<Array<any>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const getFilteredExercises = () => {
    return ExcercisesList.filter((exercise) =>
      exercise.Title.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  };
  const getFilteredActivity = () => {
    return dataList.filter((activity) =>
      activity.Title.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  };
  const getExercisesList = () => {
    setLoading(true);
    Application.getExercisesList({}).then((res) => {
      setExcercisesList(res.data);
      setLoading(false);
    });
  };
  const getActivityList = () => {
    setLoading(true);
    Application.activityList().then((res) => {
      setDataList(res.data);
      setLoading(false);
    });
  };
  useEffect(() => {
    if (active == 'Exercise') {
      getExercisesList();
    } else {
      getActivityList();
    }
  }, [active]);
  return (
    <>
      {loading && (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-85 z-[50]">
          <Circleloader></Circleloader>
        </div>
      )}
      <div>
        <div className="fixed w-full z-30 bg-bg-color px-6 pt-8 pb-2 pr-[200px]">
          <div className="w-full flex justify-center ">
            <Toggle
              active={active}
              setActive={(data) => {
                setActive(data as 'Exercise' | 'Activity');
              }}
              value={['Activity', 'Exercise']}
            />
          </div>
          <div className="w-full flex justify-between mt-3 items-center">
            <div className="text-Text-Primary font-medium opacity-[87%]">
              {active}
            </div>
            <div className="flex items-center gap-2">
              {((ExcercisesList.length > 0 && active == 'Exercise') ||
                (dataList.length > 0 && active == 'Activity')) && (
                <SearchBox
                  ClassName="rounded-xl h-6 !py-[0px] !px-3 !shadow-[unset]"
                  placeHolder={`Search in ${active.toLowerCase()}...`}
                  onSearch={(query) => setSearchQuery(query)}
                />
              )}
              {ExcercisesList.length > 0 && active == 'Exercise' && (
                <ButtonSecondary
                  onClick={() => {
                    setShowAdd(true);
                  }}
                  ClassName="rounded-full min-w-[180px]"
                >
                  <img src="./icons/add-square.svg" alt="" />
                  Add Exercise
                </ButtonSecondary>
              )}
              {dataList.length > 0 && active == 'Activity' && (
                <ButtonSecondary
                  onClick={() => {
                    setShowAddActivity(true);
                  }}
                  ClassName="rounded-full min-w-[180px]"
                >
                  <img src="./icons/add-square.svg" alt="" />
                  Add Activity
                </ButtonSecondary>
              )}
            </div>
          </div>
        </div>
        <div className="pt-[100px] px-6">
          {active == 'Activity' ? (
            <ActivityHandler
              setShowAddActivity={setShowAddActivity}
              isShowAddActivity={showAddActivity}
              onDelete={() => {
                getActivityList();
              }}
              data={getFilteredActivity()}
              dataListLength={dataList.length}
            />
          ) : (
            <Exercise
              data={getFilteredExercises()}
              onAdd={getExercisesList}
              showAdd={showAdd}
              setShowAdd={setShowAdd}
              ExcercisesListLength={ExcercisesList.length}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Activity;
