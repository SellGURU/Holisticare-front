/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import Toggle from '../../../Components/Toggle';
import SearchBox from '../../../Components/SearchBox';
import ActivityHandler from './ActivityHandler';
import { Exercise } from './Exercise';
import { ButtonSecondary } from '../../../Components/Button/ButtosSecondary';
import Application from '../../../api/app';

const Activity = () => {
  const [active, setActive] = useState<'Activity' | 'Exercise'>('Activity');
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
  useEffect(() => {
    if (active == 'Exercise') {
      getExercisesList();
    } else {
      getActivityList();
    }
  }, [active]);
  const getExercisesList = () => {
    Application.getExercisesList({}).then((res) => {
      setExcercisesList(res.data);
    });
  };
  const getActivityList = () => {
    Application.activityList().then((res) => {
      setDataList(res.data);
    });
  };
  return (
    <>
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
              {((ExcercisesList.length > 0 && active == 'Exercise') || (dataList.length > 0 && active == 'Activity')) && (
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
            <ActivityHandler setShowAddActivity={setShowAddActivity}  isShowAddActivity={showAddActivity} onDelete={() => {
              getActivityList();
            }} data={dataList}></ActivityHandler>
          ) : (
            <Exercise
              data={getFilteredExercises()}
              onAdd={getExercisesList}
              showAdd={showAdd}
              setShowAdd={setShowAdd}
            ></Exercise>
          )}
        </div>
      </div>
    </>
  );
};

export default Activity;
