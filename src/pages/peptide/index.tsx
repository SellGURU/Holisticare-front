/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from 'react';
import Application from '../../api/app';
import { ButtonSecondary } from '../../Components/Button/ButtosSecondary';
import Circleloader from '../../Components/CircleLoader';
import SearchBox from '../../Components/SearchBox';
import Toggle from '../../Components/Toggle';
import useModalAutoClose from '../../hooks/UseModalAutoClose';
import SvgIcon from '../../utils/svgIcon';
import LibraryThreePages from '../../Components/LibraryThreePages';
import DoseSchedule from './DoseSchedule';

const Peptide = () => {
  const [active, setActive] = useState<'Peptide' | 'Dose Schedule'>('Peptide');
  const [loading, setLoading] = useState(false);
  const [doseSchedulesList, setDoseSchedulesList] = useState<Array<any>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortId, setSortId] = useState<string>('title_asc');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [isMobilePage, setIsMobilePage] = useState(window.innerWidth < 982);

  const getDoseSchedulesList = () => {
    setLoading(true);
    // Get all dose schedules directly - schedules are independent entities
    Application.getAllDoseSchedules()
      .then((res) => {
        const schedules = res.data || [];
        // Add Pds_Id alias for compatibility
        const schedulesWithId = schedules.map((schedule: any) => ({
          ...schedule,
          Pds_Id: schedule.Schedule_Id,
        }));
        setDoseSchedulesList(schedulesWithId);
      })
      .catch((err) => {
        console.error('Error getting dose schedules list:', err);
        setDoseSchedulesList([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (active === 'Dose Schedule') {
      getDoseSchedulesList();
    }
  }, [active]);

  const sortOptions = [
    { id: 'title_asc', label: 'Title (A → Z)' },
    { id: 'title_desc', label: 'Title (Z → A)' },
    { id: 'priority_asc', label: 'Priority Weight (Low → High)' },
    { id: 'priority_desc', label: 'Priority Weight (High → Low)' },
    { id: 'added_desc', label: 'Added on (Newest first)' },
    { id: 'added_asc', label: 'Added on (Oldest first)' },
  ];

  const getNum = (v: unknown): number => {
    if (typeof v === 'number') return v;
    if (typeof v === 'string') {
      const n = Number(v.replace(/[^0-9.-]/g, ''));
      return Number.isFinite(n) ? n : 0;
    }
    return 0;
  };

  const getDate = (v: unknown): number => {
    const d = new Date(v as string);
    return d.getTime() || 0;
  };

  // Filter + sort data for dose schedules
  const filteredAndSortedData = useMemo(() => {
    const base = doseSchedulesList;

    // filter first
    const result = base.filter((item) =>
      item.Title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.Dose?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getAddedDate = (item: any) =>
      getDate(
        item['Added on'] ??
          item['Added On'] ??
          item.AddedOn ??
          item.CreatedAt ??
          item.Created,
      );

    // then sort
    switch (sortId) {
      case 'title_asc':
        result.sort((a, b) => (a.Title || '').localeCompare(b.Title || ''));
        break;
      case 'title_desc':
        result.sort((a, b) => (b.Title || '').localeCompare(a.Title || ''));
        break;
      case 'priority_asc':
        result.sort(
          (a, b) =>
            getNum(a.Base_Score ?? a.PriorityWeight ?? a.Priority ?? a.Weight) -
            getNum(b.Base_Score ?? b.PriorityWeight ?? b.Priority ?? b.Weight),
        );
        break;
      case 'priority_desc':
        result.sort(
          (a, b) =>
            getNum(b.Base_Score ?? b.PriorityWeight ?? b.Priority ?? b.Weight) -
            getNum(a.Base_Score ?? a.PriorityWeight ?? a.Priority ?? a.Weight),
        );
        break;
      case 'added_desc':
        result.sort((a, b) => getAddedDate(b) - getAddedDate(a));
        break;
      case 'added_asc':
        result.sort((a, b) => getAddedDate(a) - getAddedDate(b));
        break;
    }

    return result;
  }, [doseSchedulesList, searchQuery, sortId]);

  const allData = useMemo(() => {
    return doseSchedulesList;
  }, [doseSchedulesList]);

  const sortLabelMap: Record<string, string> = {
    title_asc: 'Title (A → Z)',
    title_desc: 'Title (Z → A)',
    priority_asc: 'Priority Weight (Low → High)',
    priority_desc: 'Priority Weight (High → Low)',
    added_desc: 'Added on (Newest first)',
    added_asc: 'Added on (Oldest first)',
  };
  const currentSortLabel = sortLabelMap[sortId] ?? sortLabelMap['title_asc'];
  const btnRef = useRef(null);
  const modalRef = useRef(null);
  useModalAutoClose({
    buttonRefrence: btnRef,
    refrence: modalRef,
    close: () => {
      setIsSortOpen(false);
    },
  });
  
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
                setActive(data as 'Peptide' | 'Dose Schedule');
              }}
              value={['Peptide', 'Dose Schedule']}
            />
          </div>

          {active === 'Dose Schedule' && (
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
                    placeHolder="Search in dose schedules..."
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

                {/* Add button */}
                <ButtonSecondary
                  onClick={() => setShowAdd(true)}
                  ClassName={`rounded-full w-full text-nowrap ${
                    isMobilePage ? 'w-full' : 'w-[180px]'
                  }`}
                >
                  <img src="./icons/add-square.svg" alt="" />
                  Add Dose Schedule
                </ButtonSecondary>
              </div>
            </div>
          )}
        </div>

        {/* Data rendering */}
        <div className={`${active === 'Peptide' ? 'px-3 md:px-6 pt-8' : 'px-6'} ${isMobilePage ? 'mb-20' : 'mb-14'}`}>
          {active === 'Peptide' ? (
            <LibraryThreePages pageType="Peptide" />
          ) : (
            <DoseSchedule
              data={filteredAndSortedData}
              onAdd={() => getDoseSchedulesList()}
              showAdd={showAdd}
              setShowAdd={setShowAdd}
              doseSchedulesListLength={doseSchedulesList.length}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Peptide;
