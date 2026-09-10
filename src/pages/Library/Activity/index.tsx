/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react';
import Application from '../../../api/app';
import { ButtonSecondary } from '../../../Components/Button/ButtosSecondary';
import Circleloader from '../../../Components/CircleLoader';
import SearchBox from '../../../Components/SearchBox';
import Toggle from '../../../Components/Toggle';
import EnabledStatusSelect from '../../../Components/EnabledStatusSelect';
import LibrarySortSelect from '../../../Components/LibrarySortSelect';
import ActivityHandler from './ActivityHandler';
import Exercise from './Exercise';
import useIsDemo from '../../../hooks/useIsDemo';
import { sortLibraryRows } from '../../../utils/libraryTableSort';
import {
  EnabledFilter,
  matchesEnabledFilter,
} from '../../../utils/catalogEnabled';

const Activity = () => {
  const isDemo = useIsDemo();
  const [active, setActive] = useState<'Activity' | 'Exercise'>('Activity');
  const [loading, setLoading] = useState(true);
  const [dataList, setDataList] = useState<Array<any>>([]);
  const [ExcercisesList, setExcercisesList] = useState<Array<any>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [sortId, setSortId] = useState<string>('title_asc');
  const [enabledFilter, setEnabledFilter] = useState<EnabledFilter>('All');

  const getExercisesList = () => {
    setLoading(true);
    Application.getExercisesList({})
      .then((res) => {
        setExcercisesList(res.data);
      })
      .catch((err) => {
        console.error('Error getting exercises list:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getActivityList = () => {
    setLoading(true);
    Application.activityList()
      .then((res) => {
        setDataList(res.data);
      })
      .catch((err) => {
        console.error('Error getting activity list:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (active === 'Exercise') {
      getExercisesList();
    } else {
      getActivityList();
    }
  }, [active]);

  const filteredAndSortedData = useMemo(() => {
    const base = active === 'Exercise' ? ExcercisesList : dataList;
    const filtered = base.filter(
      (item) =>
        item.Title?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        matchesEnabledFilter(item, enabledFilter),
    );
    return sortLibraryRows(filtered, sortId);
  }, [active, ExcercisesList, dataList, searchQuery, sortId, enabledFilter]);
  const allData = useMemo(() => {
    return active === 'Exercise' ? ExcercisesList : dataList;
  }, [active, ExcercisesList, dataList]);
  const [isMobilePage, setIsMobilePage] = useState(window.innerWidth < 982);
  useEffect(() => {
    const handleResize = () => {
      setIsMobilePage(window.innerWidth < 982);
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return (
    <>
      {loading && (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-85 z-[50]">
          <Circleloader />
        </div>
      )}

      <div>
        <div className="w-full bg-bg-color px-6 pt-8">
          <div className="w-full flex justify-center">
            <Toggle
              active={active}
              setActive={(data) => {
                setSortId('title_asc');
                setEnabledFilter('All');
                setSearchQuery('');
                setActive(data as 'Exercise' | 'Activity');
              }}
              value={['Activity', 'Exercise']}
            />
          </div>

          <div className="w-full flex flex-wrap items-center justify-between gap-2 mt-4">
            <div className="text-Text-Primary font-medium">{active}</div>
            <div className="flex flex-wrap items-center gap-2">
              {allData.length > 0 && (
                <>
                  <SearchBox
                    ClassName="rounded-xl !h-8 !min-w-[200px] md:!min-w-[240px] !py-[0px] !px-3 !shadow-[unset]"
                    placeHolder={`Search ${active.toLowerCase()}...`}
                    value={searchQuery}
                    onSearch={(query) => setSearchQuery(query)}
                  />
                  <EnabledStatusSelect
                    value={enabledFilter}
                    onChange={setEnabledFilter}
                  />
                  <LibrarySortSelect
                    pageType={active}
                    value={sortId}
                    onChange={(id) => setSortId(id || 'title_asc')}
                  />
                </>
              )}
              {active === 'Exercise' ? (
                <ButtonSecondary
                  disabled={isDemo}
                  title={
                    isDemo
                      ? 'Demo version cannot add or edit data. Upgrade for full access.'
                      : undefined
                  }
                  onClick={() => {
                    if (isDemo) return;
                    setShowAdd(true);
                  }}
                  size="small"
                  ClassName="h-8 w-auto min-w-0 rounded-full text-nowrap"
                >
                  <img src="./icons/add-square.svg" alt="" />
                  Add Exercise
                </ButtonSecondary>
              ) : (
                <ButtonSecondary
                  disabled={isDemo}
                  title={
                    isDemo
                      ? 'Demo version cannot add or edit data. Upgrade for full access.'
                      : undefined
                  }
                  onClick={() => {
                    if (isDemo) return;
                    setShowAddActivity(true);
                  }}
                  size="small"
                  ClassName="h-8 w-auto min-w-0 rounded-full text-nowrap"
                >
                  <img src="./icons/add-square.svg" alt="" />
                  Add Activity
                </ButtonSecondary>
              )}
            </div>
          </div>
        </div>

        <div className={`px-6 ${isMobilePage ? 'mb-20' : 'mb-14'}`}>
          {active === 'Activity' ? (
            <ActivityHandler
              setShowAddActivity={setShowAddActivity}
              isShowAddActivity={showAddActivity}
              onDelete={() => getActivityList()}
              data={filteredAndSortedData}
              dataListLength={dataList.length}
              sortId={sortId}
              onChangeSort={(id: string) => setSortId(id ?? 'title_asc')}
              onToggleEnabled={(row, next) => {
                if (isDemo) return;
                const id = String(row.Act_Id);
                setDataList((current) =>
                  current.map((item) =>
                    String(item.Act_Id) === id
                      ? { ...item, is_enabled: next }
                      : item,
                  ),
                );
                Application.setActivityEnabled(id, next).catch(() => {
                  getActivityList();
                });
              }}
            />
          ) : (
            <Exercise
              data={filteredAndSortedData}
              onAdd={getExercisesList}
              showAdd={showAdd}
              setShowAdd={setShowAdd}
              ExcercisesListLength={ExcercisesList.length}
              sortId={sortId}
              onChangeSort={(id: string) => setSortId(id ?? 'title_asc')}
              onToggleEnabled={(row, next) => {
                if (isDemo) return;
                const id = String(row.Exercise_Id);
                setExcercisesList((current) =>
                  current.map((item) =>
                    String(item.Exercise_Id) === id
                      ? { ...item, is_enabled: next }
                      : item,
                  ),
                );
                Application.setExerciseEnabled(id, next).catch(() => {
                  getExercisesList();
                });
              }}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Activity;
