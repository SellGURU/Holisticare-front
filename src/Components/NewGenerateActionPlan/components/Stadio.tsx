/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Application from '../../../api/app';
import { AlertModal } from '../../AlertModal';
import { ButtonPrimary } from '../../Button/ButtonPrimary';
import { ButtonSecondary } from '../../Button/ButtosSecondary';
import SearchBox from '../../SearchBox';
import SpinnerLoader from '../../SpinnerLoader';
import ActionCard from './ActionCard';
import ActionEditModal from './ActionEditModal';
import LibBox from './LibBox';
// import Sort from './Sort';
import { SlideOutPanel } from '../../SlideOutPanel';
import Circleloader from '../../CircleLoader';
import { Tooltip } from 'react-tooltip';
import { splitInstructions } from '../../../help';
import Sort from './Sort';
import { Box } from 'lucide-react';

interface StadioProps {
  data: {
    checkIn: Array<any>;
    category: Array<any>;
  };
  actions: {
    checkIn: Array<any>;
    category: Array<any>;
  };
  setActions: (data: any) => void;
  setData: (values: any) => void;
  setCalendarView: (value: boolean) => void;
  plans: any;
  isCheckSave: boolean;
  handleShowConflictsModal: () => void;
}

interface HolisticPlanProps {
  category: string;
  data: {
    Based: string;
    Client_Notes: string;
    Notes: string;
    title: number;
    'Practitioner Comments': string[];
  }[];
}

const Stadio: FC<StadioProps> = ({
  data,
  setData,
  setActions,
  actions,
  setCalendarView,
  plans,
  handleShowConflictsModal,
  isCheckSave,
}) => {
  console.log(data);

  const [selectCategory, setSelectedCategory] = useState('Diet');
  const [haveConflic, setHaveConflic] = useState(false);
  const [haveConflicText, setHaveConflicText] = useState([]);
  const AllCategories = [
    'Diet',
    'Activity',
    'Supplement',
    'Lifestyle',
    'Checkin',
  ];
  console.log(actions);

  const [searchValue, setSearchValue] = useState('');
  const [isAutoGenerate, setIsAutoGenerate] = useState(false);
  const [isAutoGenerateComplete, setIsAutoGenerateComplete] = useState(false);
  const [isAutoGenerateShow, setIsAutoGenerateShow] = useState(true);
  // const [ setIsDragging] = useState(false);
  const [sortBy, setSortBy] = useState('AllActions');

  const handleChangeSort = (value: string) => {
    setSortBy(value);
  };
  const sortOptions = [
    { label: 'All Actions', value: 'AllActions' },
    {
      label: 'Holistic Plan Recommended',
      value: 'HolisticPlan',
    },
  ];

  const addToActions = (item: any) => {
    if (item.Task_Type === 'Checkin') {
      setActions((prevActions: any) => ({
        checkIn: [item, ...prevActions.checkIn],
        category: prevActions.category,
      }));

      setData((prevCategories: any) => {
        const updatedCheckIn = prevCategories.checkIn.filter(
          (el: any) => JSON.stringify(el) !== JSON.stringify(item),
        );

        return {
          ...prevCategories,
          checkIn: updatedCheckIn,
        };
      });
    } else {
      setActions((prevActions: any) => ({
        checkIn: prevActions.checkIn,
        category: [item, ...prevActions.category],
      }));

      setData((prevCategories: any) => {
        const updatedCategory = prevCategories.category.filter(
          (el: any) => JSON.stringify(el) !== JSON.stringify(item),
        );

        return {
          ...prevCategories,
          category: updatedCategory,
        };
      });
    }
  };

  const removeFromActions = (item: any) => {
    if (item.Task_Type === 'Checkin') {
      setActions((prevActions: any) => ({
        checkIn: prevActions.checkIn.filter(
          (el: any) => JSON.stringify(el) !== JSON.stringify(item),
        ),
        category: prevActions.category,
      }));

      setData((prevCategories: any) => ({
        ...prevCategories,
        checkIn: [item, ...prevCategories.checkIn],
      }));
    } else {
      setActions((prevActions: any) => ({
        checkIn: prevActions.checkIn,
        category: prevActions.category.filter(
          (el: any) => JSON.stringify(el) !== JSON.stringify(item),
        ),
      }));

      setData((prevCategories: any) => ({
        ...prevCategories,
        category: [item, ...prevCategories.category],
      }));
    }
  };
  const { id } = useParams<{ id: string }>();
  const AutoGenerate = () => {
    setIsAutoGenerate(true);
    Application.getActionPlanGenerateActionPlanTaskNew({
      member_id: id,
    })
      .then((res) => {
        setActions((prevCategories: any) => ({
          ...prevCategories,
          category: res.data,
        }));
      })
      .finally(() => {
        setIsAutoGenerate(false);
        setIsAutoGenerateComplete(true);
        setTimeout(() => {
          setIsAutoGenerateComplete(false);
          setIsAutoGenerateShow(false);
        }, 5000);
      });
  };
  useEffect(() => {
    if (isAutoGenerateShow === false) {
      setIsAutoGenerateShow(true);
    }
  }, [actions]);
  const conflicCheck = () => {
    const prepareDataForBackend = (data: any) => {
      return [...data.checkIn, ...data.category];
    };

    const flattenedActions = prepareDataForBackend(actions);
    if (actions.checkIn.length > 1 || actions.category.length > 1) {
      Application.checkConflicActionPlan({
        member_id: id,
        tasks: flattenedActions,
        percents: plans,
      }).then((res) => {
        if (res.data.conflicts.length > 0) {
          setHaveConflic(true);
          setHaveConflicText(res.data.conflicts);
        } else {
          setHaveConflic(false);
        }
      });
    }
  };
  useEffect(() => {
    conflicCheck();
  }, [actions]);
  // const [sortBy, setSortBy] = useState('System Score');
  // const resolveTaskCheckText = () => {
  //   if (
  //     actions.category.filter((el) => el.Category == 'Activity').length > 1 &&
  //     actions.category.filter((el) => el.Category == 'Diet').length > 1
  //   ) {
  //     return 'More than one Diet task and one Activity task exists!';
  //   }
  //   if (actions.category.filter((el) => el.Category == 'Activity').length > 1) {
  //     return 'More than one Activity task exists!';
  //   }
  //   return 'More than one Diet task exists!';
  // };
  // const checkHaveConflicts = () => {
  //   const conflicts = [];
  //   if (actions.category.filter((el) => el.Category == 'Activity').length > 1) {
  //     conflicts.push('Activity');
  //   }
  //   if (actions.category.filter((el) => el.Category == 'Diet').length > 1) {
  //     conflicts.push('Diet');
  //   }
  //   return conflicts;
  // };
  // const handleChangeSort = (value: string) => {
  //   setSortBy(value);
  // };
  const filteredDataCategory = useMemo(() => {
    let filtered = data.category.filter(
      (el: any) =>
        el.Category === selectCategory &&
        el.Title.toLowerCase().includes(searchValue.toLowerCase()),
    );

    if (sortBy === 'HolisticPlan') {
      filtered = filtered.filter(
        (el: any) => el.holisticare_recommendation === true,
      );
    }

    return filtered;
  }, [data.category, selectCategory, searchValue, sortBy]);

  const filteredDataCheckIn = data.checkIn
    .filter(
      (el) =>
        el.Task_Type === selectCategory &&
        el.Title.toLowerCase().includes(searchValue.toLowerCase()),
    )
    .map((el) => ({
      ...el, // Spread existing properties
      category: 'Check-In', // Add the category key with value 'Check-In'
    }));
  console.log(filteredDataCategory);

  const [showAddModal, setshowAddModal] = useState(false);
  // const options = [
  //   {
  //     label: 'System Score',
  //     value: 'System Score',
  //     color: 'bg-Primary-DeepTeal',
  //   },
  //   {
  //     label: 'Base Score',
  //     value: 'Base_Score',
  //     color: 'bg-Primary-EmeraldGreen',
  //   },
  // ];

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: any) => {
    e.dataTransfer.setData(
      'application/holisticare-action',
      JSON.stringify(item),
    );
  };

  const handleDragEnd = () => {
    // setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes('application/holisticare-action')) {
      e.currentTarget.classList.add('bg-Gray-50');
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('bg-Gray-50');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-Gray-50');

    if (!e.dataTransfer.types.includes('application/holisticare-action')) {
      return;
    }

    try {
      const itemData = JSON.parse(
        e.dataTransfer.getData('application/holisticare-action'),
      );
      if (itemData && (itemData.Task_Type || itemData.Category)) {
        addToActions(itemData);
      }
    } catch (error) {
      console.error('Error parsing dragged item data:', error);
    }
  };
  const category = [
    { value: 'Diet', icon: 'diet-shapes.svg' },
    { value: 'Activity', icon: 'activity-shapes.svg' },
    { value: 'Supplement', icon: 'supplement-shapes.svg' },
    { value: 'Lifestyle', icon: 'lifestyle-shapes.svg' },
    { value: 'Other', icon: 'other-shapes.svg' },
  ];
  const [isSlideOutPanel, setIsSlideOutPanel] = useState<boolean>(false);
  const handleCloseSlideOutPanel = () => {
    setIsSlideOutPanel(false);
  };
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [holisticPlan, setHolisticPlan] = useState<HolisticPlanProps[]>([]);
  const [holisticPlanIndex, setHolisticPlanIndex] = useState<number | null>(
    null,
  );
  useEffect(() => {
    if (isSlideOutPanel) {
      setIsLoading(true);
      Application.getHolisticPlanReview({
        member_id: id,
      })
        .then((res) => {
          setHolisticPlan(res.data.details);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isSlideOutPanel]);
const [showModal, setShowModal] = useState(false)
  return (
    <>
      <SlideOutPanel
        isOpen={isSlideOutPanel}
        isCombo={true}
        onClose={handleCloseSlideOutPanel}
        headline="Review Holistic Plan"
        ClassName="!z-[60] !overflow-y-auto"
      >
        {isLoading ? (
          <div
            style={{ height: 'calc(100vh - 300px)' }}
            className="flex  flex-col justify-center items-center bg-white bg-opacity-85 w-full h-full rounded-[16px]"
          >
            <Circleloader />
          </div>
        ) : (
          <>
            {holisticPlan.length > 0 ? (
              <div className="w-full flex flex-col gap-2">
                {category.map((item, index) => {
                  return (
                    <div className="w-full flex flex-col">
                      <div
                        key={index}
                        className={`bg-bg-color border border-Gray-50 rounded-xl flex items-center justify-between px-4 py-2 h-[40px] cursor-pointer ${holisticPlanIndex === index ? 'rounded-b-none' : ''}`}
                        onClick={() => {
                          if (holisticPlanIndex === index) {
                            setHolisticPlanIndex(null);
                          } else {
                            setHolisticPlanIndex(index);
                          }
                        }}
                      >
                        <div className="flex items-center gap-2 font-medium text-xs text-Text-Quadruple">
                          <img src={`/icons/${item.icon}`} alt="" />
                          {item.value}
                        </div>
                        <img
                          src="/icons/arrow-down-blue.svg"
                          alt=""
                          className={`${holisticPlanIndex === index ? 'rotate-180' : ''} size-4`}
                        />
                      </div>
                      {holisticPlanIndex === index && (
                        <div className="bg-backgroundColor-Card border border-Gray-50 rounded-b-xl flex flex-col gap-2 px-4 py-2">
                          {holisticPlan
                            .filter((el) => el.category === item.value)
                            .map((item) => {
                              return item.data.map((el, index) => {
                                return (
                                  <div
                                    key={index}
                                    className="bg-white border border-Gray-50 rounded-xl p-2 flex flex-col"
                                  >
                                    <div className="font-medium text-[10px] text-Text-Primary">
                                      {el.title}
                                    </div>
                                    <div
                                      data-tooltip-id={`analysis-info-${index}`}
                                      className="text-[10px] text-Primary-DeepTeal mt-1.5 cursor-pointer"
                                    >
                                      Analysis Info
                                    </div>
                                    <Tooltip
                                      id={`analysis-info-${index}`}
                                      place="top"
                                      className="!bg-white !w-[270px] !leading-5 text-justify !text-wrap !text-[#888888] !text-[10px] !rounded-[6px] !border !border-Gray-50 !p-2 !opacity-100"
                                      style={{
                                        zIndex: 9999,
                                        pointerEvents: 'none',
                                      }}
                                    >
                                      <div className="text-Text-Secondary">
                                        {el?.['Practitioner Comments']?.[0]}
                                      </div>
                                    </Tooltip>
                                    <div className="leading-5 mt-1 text-Text-Primary text-[10px]">
                                      <span className="text-Text-Quadruple text-[10px] text-nowrap mr-1">
                                        Key Benefits:
                                      </span>
                                      {splitInstructions(el.Notes).positive}
                                    </div>
                                    <div className="leading-5 mt-1 text-Text-Primary text-[10px]">
                                      <span className="text-Text-Quadruple text-[10px] text-nowrap mr-1">
                                        Key Risks:
                                      </span>
                                      {splitInstructions(el.Notes).negative}
                                    </div>
                                  </div>
                                );
                              });
                            })}
                          {holisticPlan.find((el) => el.category === item.value)
                            ?.data.length === 0 && (
                            <div className="flex flex-col items-center gap-4 my-6">
                              <img
                                src="/icons/empty-state-new.svg"
                                alt=""
                                className="w-[100px]"
                              />
                              <div className="font-medium text-[10px] text-Text-Primary">
                                No recommendations found.
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <>
                <div
                  style={{ height: 'calc(100vh - 300px)' }}
                  className="w-full h-full flex flex-col items-center justify-center "
                >
                  <img src="/icons/Empty/EmptyStateHolistcAction.svg" alt="" />
                  <div className="text-Text-Primary mt-[-20px] text-headline-6 text-[12px] font-medium">
                    This plan is no longer available.
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </SlideOutPanel>
      <ActionEditModal
        isAdd
        isOpen={showAddModal}
        onClose={() => {
          setshowAddModal(false);
        }}
        onAddNotes={() => {}}
        defalts={null}
        onSubmit={(addData) => {
          const newData = {
            Category: addData.Category,
            Title: addData.Title || '',
            'Based on': '',
            // 'Practitioner Comments': addData['Practitioner Comments'] || [],
            Instruction: addData.Instruction || '',
            Times: addData.Times || [],
            Value: Number(addData.Value) || null,
            Dose: addData.Dose || null,
            'Total Macros': addData['Total Macros'] || null,
            'Client Notes': addData['Client Notes'] || [],
            Score: addData.Score ?? 0,
            Days: addData.Days ?? [],
            Description: addData.Description ?? '',
            // Base_Score: addData.Base_Score ?? 0,
            'System Score': 0,
            Task_Type: 'Action',
            Layers: {
              first_layer: '',
              second_layer: '',
              third_layer: '',
            },
            ['Practitioner Comments']: addData['Practitioner Comments'] ?? [],
            Sections: addData.Sections ?? [],
            Activity_Filters: addData.Activity_Filters ?? [],
            Frequency_Type: addData.frequencyType ?? '',
            Activity_Location: addData.Activity_Location ?? '',
            Frequency_Dates: addData.frequencyDates ?? [],
            Unit: addData.Unit ?? '',
          };

          setActions((prevData: any) => ({
            ...prevData,
            category: [newData, ...prevData.category],
          }));
          setshowAddModal(false);
        }}
      />
      <div className="flex flex-col lg:flex-row w-full pb-[80px] lg:pb-0 px-4 lg:px-6 gap-4 select-none">
        <div className="flex-grow lg:mr-[360px]">
          {haveConflic && (
            <div className="w-full  my-2 ">
              <AlertModal
                heading="Conflict"
                texts={haveConflicText}
                onClose={() => {
                  setHaveConflic(false);
                }}
              />
            </div>
          )}
          <div className="flex  justify-between w-full items-center">
            {/* {(actions.category.filter((el) => el.Category == 'Activity')
              .length > 1 ||
              actions.category.filter((el) => el.Category == 'Diet').length >
                1) && (
              <div className="text-[12px]  text-[#FC5474] flex items-center gap-1">
                <img src="/icons/warning-2.svg" alt="" />
                {resolveTaskCheckText()}
              </div>
            )} */}
            <div
              className={`flex-grow flex flex-col lg:flex-row gap-4 justify-between ${selectCategory == 'Checkin' && (actions.checkIn.length === 0 || actions.category.length === 0) ? 'mb-[39px]' : selectCategory == 'Checkin' ? 'mt-2 mb-3' : 'mb-2'}`}
            >
              <div className='flex lg:hidden w-full  justify-end text-Primary-DeepTeal font-medium text-[10px] md:text-xs' >
                <div onClick={()=>{setShowModal(true)}} className='flex cursor-pointer items-center gap-1'>
                  <Box size={20} color='#005f73'/>
                  Open Add Box
                  
                </div>
              </div>
              <div className='flex w-full justify-between'>
                <div
                  className="flex  items-center gap-1 select-none lg:pl-2 cursor-pointer"
                  onClick={() => setIsSlideOutPanel(true)}
                >
                  <img src="/icons/eye-blue.svg" alt="" className="size-5" />
                  <div className="text-Primary-DeepTeal font-medium text-[10px] md:text-xs">
                    Review Holistic Plan
                  </div>
                </div>

                {actions.checkIn.length !== 0 ||
                  (actions.category.length !== 0 && (
                    <div
                      className=" flex lg:hidden items-center select-none text-nowrap gap-1 text-[10px] md:text-xs font-medium text-Primary-DeepTeal cursor-pointer lg:mr-2"
                      onClick={() => setCalendarView(true)}
                    >
                      <img
                        src="/icons/calendar-date.svg"
                        alt=""
                        className="w-5"
                      />
                      Calendar View
                    </div>
                  ))}
              </div>

              <div className="flex items-center  justify-between select-none gap-3">
                {actions.checkIn.length !== 0 ||
                actions.category.length !== 0 ? (
                  <div
                    className=" hidden lg:flex items-center select-none text-nowrap gap-1 text-[10px] md:text-xs font-medium text-Primary-DeepTeal cursor-pointer mr-2"
                    onClick={() => setCalendarView(true)}
                  >
                    <img
                      src="/icons/calendar-date.svg"
                      alt=""
                      className="w-5"
                    />
                    Calendar View
                  </div>
                ) : (
                  ''
                )}
                {selectCategory != 'Checkin' && (
                  <>
                    {isAutoGenerateShow ? (
                      actions.checkIn.length !== 0 ||
                      actions.category.length !== 0 ? (
                        !isAutoGenerateComplete ? (
                          <ButtonSecondary
                            ClassName="rounded-[30px] w-[141px] text-nowrap"
                            onClick={() => {
                              AutoGenerate();
                            }}
                          >
                            {isAutoGenerate ? (
                              <SpinnerLoader />
                            ) : (
                              <>
                                <img
                                  src="/icons/tree-start-white.svg"
                                  alt=""
                                  className="md:mr-2"
                                />
                                Generate by AI
                              </>
                            )}
                          </ButtonSecondary>
                        ) : (
                          <div className="flex items-center min-w-[101px] lg:min-w-max  gap-2 text-Primary-EmeraldGreen font-medium text-xs">
                            <img src="/icons/tick-circle-bg.svg" alt="" />
                            Generated
                          </div>
                        )
                      ) : (
                        ''
                      )
                    ) : (
                      ''
                    )}
                    <ButtonPrimary
                      onClick={() => setshowAddModal(true)}
                      ClassName=" w-full lg:w-[108px]"
                    >
                      <img src="/icons/add-square.svg" alt="" /> Add
                    </ButtonPrimary>
                  </>
                )}
              </div>
            </div>
          </div>
          <div
            className={`w-full md:min-h-[494px] bg-white pt-2 pr-1 rounded-[24px] border border-gray-50 shadow-100 ${
              actions.checkIn.length == 0 && actions.category.length == 0 && ''
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {actions.checkIn.length == 0 && actions.category.length == 0 ? (
              <div className="flex flex-col items-center justify-center w-full min-h-[450px] ">
                <img
                  src="/icons/document-text.svg"
                  alt=""
                  className="w-[87px] h-[87px]"
                />
                <div className="text-Text-Primary font-medium text-sm mt-2">
                  No action to show
                </div>
                <ButtonSecondary
                  ClassName="rounded-[20px] mt-8"
                  onClick={() => {
                    AutoGenerate();
                  }}
                >
                  {isAutoGenerate ? (
                    <SpinnerLoader />
                  ) : (
                    <>
                      <img
                        src="/icons/tree-start-white.svg"
                        alt=""
                        className="mr-2"
                      />
                      Auto Generate
                    </>
                  )}
                </ButtonSecondary>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-3 md:py-3 md:min-h-[420px] ">
                  {actions.checkIn.map((act: any, index: number) => {
                    return (
                      <>
                        <ActionCard
                          data={act}
                          checkValid={isCheckSave}
                          onRemove={() => removeFromActions(act)}
                          setActions={setActions}
                          key={index}
                          index={index}
                          checkIn={true}
                        />
                      </>
                    );
                  })}
                  {actions.category.map((act: any, index: number) => {
                    return (
                      <>
                        <ActionCard
                          data={act}
                          checkValid={isCheckSave}
                          onRemove={() => removeFromActions(act)}
                          setActions={setActions}
                          key={index}
                          index={index}
                          // conflicts={checkHaveConflicts()}
                        />
                      </>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
        <div className="  w-full lg:w-[342px] hidden lg:block lg:fixed lg:top-[190px] lg:right-[100px]  h-full">
          <div
            className={`w-full lg:w-[342px]  p-4   bg-white rounded-[24px] border border-gray-50 shadow-100`}
          >
            <SearchBox
              ClassName="rounded-2xl border shadow-none h-[40px] bg-white md:min-w-full"
              placeHolder="Search for actions ..."
              onSearch={(value) => {
                setSearchValue(value);
              }}
            />
            <Sort
              options={sortOptions}
              handleChangeSort={handleChangeSort}
              sortBy={sortBy}
            />

            <div>
              <div className="flex w-full gap-2 text-center items-center justify-between mt-2 flex-wrap">
                {AllCategories.map((cat) => {
                  return (
                    <>
                      <button
                        className={`${selectCategory === cat ? 'bg-[linear-gradient(89.73deg,_rgba(0,95,115,0.5)_-121.63%,_rgba(108,194,74,0.5)_133.18%)] text-Primary-DeepTeal' : 'bg-backgroundColor-Main text-Text-Primary'} px-2 py-2 rounded-2xl text-[10px] flex-grow cursor-pointer`}
                        onClick={() => setSelectedCategory(cat)}
                      >
                        {cat}
                      </button>
                    </>
                  );
                })}
              </div>
              <div
                className="w-full  overflow-auto "
                style={{ height: window.innerHeight - 340 + 'px' }}
              >
                <div className="mt-2 grid gap-2 relative">
                  {filteredDataCategory.map((value: any, index: number) => {
                    return (
                      <div
                        key={index}
                        draggable
                        onDragStart={(e) => handleDragStart(e, value)}
                        onDragEnd={handleDragEnd}
                        className="cursor-move"
                      >
                        <LibBox
                          onAdd={() => addToActions(value)}
                          data={value}
                          index={index}
                          handleShowConflictsModal={handleShowConflictsModal}
                        />
                      </div>
                    );
                  })}
                  {filteredDataCheckIn.map((value: any, index: number) => {
                    return (
                      <div
                        key={index}
                        draggable
                        onDragStart={(e) => handleDragStart(e, value)}
                        onDragEnd={handleDragEnd}
                        className="cursor-move"
                      >
                        <LibBox
                          onAdd={() => addToActions(value)}
                          data={value}
                          checkIn={true}
                        />
                      </div>
                    );
                  })}
                </div>
                {filteredDataCategory.length === 0 &&
                  selectCategory !== 'Checkin' && (
                    <div className="w-full h-[80%] flex flex-col items-center justify-center">
                      <img src="/icons/empty-messages-coach.svg" alt="" />
                      <div className="text-Text-Primary font-medium text-xs -mt-6">
                        No results found.
                      </div>
                    </div>
                  )}
                {filteredDataCheckIn.length === 0 &&
                  selectCategory === 'Checkin' && (
                    <div className="w-full h-[80%] flex flex-col items-center justify-center">
                      <img src="/icons/empty-messages-coach.svg" alt="" />
                      <div className="text-Text-Primary font-medium text-xs -mt-6">
                        No results found.
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
            <SlideOutPanel
        isOpen={showModal}
        isActionPLan
        isCombo={true}
        onClose={()=>setShowModal(false)}
        headline="Add Action"
        ClassName="!z-[60] !overflow-y-auto"
      >
            <div className="    h-full">
          <div
            className={`w-full lg:w-[342px]     bg-white rounded-[24px] border border-gray-50 shadow-100`}
          >
            <SearchBox
              ClassName="rounded-2xl border shadow-none h-[40px] bg-white md:min-w-full"
              placeHolder="Search for actions ..."
              onSearch={(value) => {
                setSearchValue(value);
              }}
            />
            <Sort
              options={sortOptions}
              handleChangeSort={handleChangeSort}
              sortBy={sortBy}
            />

            <div>
              <div className="flex w-full gap-2 text-center items-center justify-between mt-2 flex-wrap">
                {AllCategories.map((cat) => {
                  return (
                    <>
                      <button
                        className={`${selectCategory === cat ? 'bg-[linear-gradient(89.73deg,_rgba(0,95,115,0.5)_-121.63%,_rgba(108,194,74,0.5)_133.18%)] text-Primary-DeepTeal' : 'bg-backgroundColor-Main text-Text-Primary'} px-2 py-2 rounded-2xl text-[10px] flex-grow cursor-pointer`}
                        onClick={() => setSelectedCategory(cat)}
                      >
                        {cat}
                      </button>
                    </>
                  );
                })}
              </div>
              <div
                className="w-full  overflow-auto "
                style={{ height: window.innerHeight - 240 + 'px' }}
              >
                <div className="mt-2 grid gap-2 relative">
                  {filteredDataCategory.map((value: any, index: number) => {
                    return (
                      <div
                        key={index}
                        draggable
                        onDragStart={(e) => handleDragStart(e, value)}
                        onDragEnd={handleDragEnd}
                        className="cursor-move"
                      >
                        <LibBox
                          onAdd={() => addToActions(value)}
                          data={value}
                          index={index}
                          handleShowConflictsModal={handleShowConflictsModal}
                        />
                      </div>
                    );
                  })}
                  {filteredDataCheckIn.map((value: any, index: number) => {
                    return (
                      <div
                        key={index}
                        draggable
                        onDragStart={(e) => handleDragStart(e, value)}
                        onDragEnd={handleDragEnd}
                        className="cursor-move"
                      >
                        <LibBox
                          onAdd={() => addToActions(value)}
                          data={value}
                          checkIn={true}
                        />
                      </div>
                    );
                  })}
                </div>
                {filteredDataCategory.length === 0 &&
                  selectCategory !== 'Checkin' && (
                    <div className="w-full h-[80%] flex flex-col items-center justify-center">
                      <img src="/icons/empty-messages-coach.svg" alt="" />
                      <div className="text-Text-Primary font-medium text-xs -mt-6">
                        No results found.
                      </div>
                    </div>
                  )}
                {filteredDataCheckIn.length === 0 &&
                  selectCategory === 'Checkin' && (
                    <div className="w-full h-[80%] flex flex-col items-center justify-center">
                      <img src="/icons/empty-messages-coach.svg" alt="" />
                      <div className="text-Text-Primary font-medium text-xs -mt-6">
                        No results found.
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </SlideOutPanel>
    </>
  );
};

export default Stadio;
