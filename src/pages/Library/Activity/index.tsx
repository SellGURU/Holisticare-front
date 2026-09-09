/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from 'react';
import Application from '../../../api/app';
import { ButtonSecondary } from '../../../Components/Button/ButtosSecondary';
import Circleloader from '../../../Components/CircleLoader';
import SearchBox from '../../../Components/SearchBox';
import Toggle from '../../../Components/Toggle';
import useModalAutoClose from '../../../hooks/UseModalAutoClose';
import SvgIcon from '../../../utils/svgIcon';
import ActivityHandler from './ActivityHandler';
import Exercise from './Exercise';
import useIsDemo from '../../../hooks/useIsDemo';
import {
  LIBRARY_SORT_LABELS,
  getLibrarySortOptions,
  sortLibraryRows,
} from '../../../utils/libraryTableSort';

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
  const [isSortOpen, setIsSortOpen] = useState(false);

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

  const sortOptions = getLibrarySortOptions(active);
  const filteredAndSortedData = useMemo(() => {
    const base = active === 'Exercise' ? ExcercisesList : dataList;
    const filtered = base.filter((item) =>
      item.Title?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    return sortLibraryRows(filtered, sortId);
  }, [active, ExcercisesList, dataList, searchQuery, sortId]);
  const allData = useMemo(() => {
    return active === 'Exercise' ? ExcercisesList : dataList;
  }, [active, ExcercisesList, dataList]);
  const currentSortLabel =
    LIBRARY_SORT_LABELS[sortId] ?? LIBRARY_SORT_LABELS.title_asc;
  const btnRef = useRef(null);
  const modalRef = useRef(null);
  useModalAutoClose({
    buttonRefrence: btnRef,
    refrence: modalRef,
    close: () => {
      setIsSortOpen(false);
    },
  });
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
          <div className="w-full flex justify-center ">
            <Toggle
              active={active}
              setActive={(data) => {
                setSortId('title_asc');
                setActive(data as 'Exercise' | 'Activity');
              }}
              value={['Activity', 'Exercise']}
            />
          </div>

          <div
            className={`w-full flex justify-between mt-3 ${isMobilePage ? 'flex-col gap-3' : 'flex-row gap-0 items-center'}`}
          >
            <div className="text-Text-Primary font-medium opacity-[87%]">
              {active}
            </div>
            <div
              className={`flex ${isMobilePage ? 'flex-col gap-3' : 'flex-row gap-2 items-center'}`}
            >
              {allData.length > 0 && (
                <SearchBox
                  ClassName="rounded-xl h-6 !py-[0px] !px-3 !shadow-[unset]"
                  placeHolder={`Search in ${active.toLowerCase()}...`}
                  onSearch={(query) => setSearchQuery(query)}
                />
              )}

              {/* Sort dropdown */}
              <div
                className={`flex items-center gap-6 w-full ${
                  isMobilePage ? 'w-full' : 'w-fit'
                }`}
              >
                <div className="flex gap-1 items-center text-nowrap text-xs text-Primary-DeepTeal">
                  <img src="/icons/sort.svg" alt="" />
                  Sort by:
                </div>
                <div
                  ref={btnRef}
                  className={`relative w-full ${
                    isMobilePage ? 'w-full pl-2' : 'w-fit pl-0'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setIsSortOpen((v) => !v)}
                    className={`h-8 rounded-[20px] border w-full ${
                      isMobilePage ? 'w-full' : 'min-w-[183px]'
                    } border-[#E2F1F8] px-[12px] py-[10px] bg-white text-xs text-Text-Primary text-nowrap flex items-center justify-between gap-2 shadow-100 ${
                      isSortOpen ? 'rounded-b-none' : ''
                    }`}
                  >
                    {currentSortLabel}
                    <div
                      className={` transition-transform ${isSortOpen ? 'rotate-180' : ''}`}
                    >
                      <SvgIcon
                        color="#005F73"
                        width="16px"
                        height="16px"
                        src="/icons/arrow-down.svg"
                      />
                    </div>
                  </button>

                  {isSortOpen && (
                    <div
                      ref={modalRef}
                      className={`absolute ${isMobilePage ? 'w-[97%]' : 'w-full'} top-8 z-20 right-0 bg-white rounded-[20px] px-2 py-3 shadow-md ${
                        isSortOpen ? 'rounded-t-none' : ''
                      }`}
                    >
                      <div className="flex flex-col gap-4">
                        {sortOptions.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              setSortId(opt.id ?? 'title_asc');
                              setIsSortOpen(false);
                            }}
                            className="w-full text-left text-[#888888] text-[10px] flex items-center gap-2"
                          >
                            <span
                              className={`inline-block w-4 h-4 rounded-full border-Primary-DeepTeal ${
                                currentSortLabel === opt.label
                                  ? 'border-[3.5px]'
                                  : 'border-[.5px]'
                              }`}
                            ></span>
                            <span>{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Add buttons */}
              {active === 'Exercise' && (
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
                  ClassName={`rounded-full w-full text-nowrap ${
                    isMobilePage ? 'w-full' : 'w-[180px]'
                  }`}
                >
                  <img src="./icons/add-square.svg" alt="" />
                  Add Exercise
                </ButtonSecondary>
              )}
              {active === 'Activity' && (
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
                  ClassName={`rounded-full w-full text-nowrap ${
                    isMobilePage ? 'w-full' : 'w-[180px]'
                  }`}
                >
                  <img src="./icons/add-square.svg" alt="" />
                  Add Activity
                </ButtonSecondary>
              )}
            </div>
          </div>
        </div>

        {/* Data rendering */}
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
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Activity;
