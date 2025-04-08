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
import Sort from './Sort';

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
  handleShowConflictsModal: () => void;
}

const Stadio: FC<StadioProps> = ({
  data,
  setData,
  setActions,
  actions,
  setCalendarView,
  plans,
  handleShowConflictsModal,
}) => {
  const [selectCategory, setSelectedCategory] = useState('Diet');
  const [haveConflic, setHaveConflic] = useState(false);
  const [haveConflicText, setHaveConflicText] = useState('');
  const AllCategories = [
    'Diet',
    'Activity',
    'Supplement',
    'Lifestyle',
    'Checkin',
  ];
  const [searchValue, setSearchValue] = useState('');
  const [isAutoGenerate, setIsAutoGenerate] = useState(false);
  const [isAutoGenerateComplete, setIsAutoGenerateComplete] = useState(false);
  // const addToActions = (item: any) => {
  //   setActions((prev: any) => [item, ...prev]);
  //   setData((prev: Array<any>) => {
  //     const oldCategory = [...prev];
  //     const itemindex = prev.findIndex(
  //       (el: any) => JSON.stringify(el) === JSON.stringify(item),
  //     );
  //     return oldCategory.filter((_el, inde) => inde != itemindex);
  //   });
  // };
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

  // const removeFromActions = (item: any) => {
  //   setActions((prev: any) => {
  //     const updatedActions = prev.filter(
  //       (el: any) => JSON.stringify(el) !== JSON.stringify(item),
  //     );
  //     return updatedActions;
  //   });

  //   setData((prev: Array<any>) => [item, ...prev]);
  // };
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
        }, 5000);
      });
  };
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
        if (res.data.conflicts != 'No conflicts detected.') {
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
  const [sortBy, setSortBy] = useState('System Score');
  const handleChangeSort = (value: string) => {
    setSortBy(value);
  };
  // const filteredDataCategory = data.category.filter(
  //   (el: any) =>
  //     el.Category == selectCategory &&
  //     el.Title.toLowerCase().includes(searchValue.toLowerCase()),
  // );
  const filteredDataCategory = useMemo(() => {
    return data.category
      .filter(
        (el: any) =>
          el.Category === selectCategory &&
          el.Title.toLowerCase().includes(searchValue.toLowerCase()),
      )
      .sort((a: any, b: any) => (b[sortBy] || 0) - (a[sortBy] || 0));
  }, [data.category, selectCategory, searchValue, sortBy]);
  const filteredDataCheckIn = data.checkIn.filter(
    (el: any) =>
      el.Task_Type == selectCategory &&
      el.Title.toLowerCase().includes(searchValue.toLowerCase()),
  );
  const [showAddModal, setshowAddModal] = useState(false);
  const options = [
    {
      label: 'System Score',
      value: 'System Score',
      color: 'bg-Primary-DeepTeal',
    },
    {
      label: 'Base Score',
      value: 'Base_Score',
      color: 'bg-Primary-EmeraldGreen',
    },
  ];
  return (
    <>
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
            'Practitioner Comments': addData['Practitioner Comments'] || [],
            Instruction: addData.Instruction || '',
            Times: addData.Times || [],
            Value: addData.Value || null,
            Dose: addData.Dose || null,
            'Total Macros': addData['Total Macros'] || null,
            'Client Notes': addData['Client Notes'] || [],
            Score: addData.Score ?? 0,
            Days: addData.Days ?? [],
            Description: addData.Description ?? '',
            Base_Score: addData.Base_Score ?? 0,
            'System Score': 0,
            Task_Type: 'Action',
            Layers: {
              first_layer: '',
              second_layer: '',
              third_layer: '',
            },
            Sections: addData.Sections ?? [],
            Frequency_Type: addData.frequencyType ?? '',
            Frequency_Dates: addData.frequencyDates ?? [],
          };

          setData((prevData: any) => ({
            ...prevData,
            category: [newData, ...prevData.category],
          }));
          setshowAddModal(false);
        }}
      />
      <div className="flex px-6 gap-4">
        <div className="flex-grow">
          {/* alert */}
          {haveConflic && (
            <div className="w-full  my-2 ">
              <AlertModal
                heading="Alert heading"
                text={haveConflicText}
                onClose={() => {
                  setHaveConflic(false);
                }}
              />
            </div>
          )}
          <div className="w-full flex justify-end mb-2 gap-3">
            {actions.checkIn.length !== 0 || actions.category.length !== 0 ? (
              <div
                className="flex items-center gap-1 text-xs font-medium text-Primary-DeepTeal cursor-pointer mr-2"
                onClick={() => setCalendarView(true)}
              >
                <img src="/icons/calendar-date.svg" alt="" className="w-5" />
                Calendar View
              </div>
            ) : (
              ''
            )}
            {selectCategory != 'Checkin' && (
              <>
                {actions.checkIn.length !== 0 ||
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
                            className="mr-2"
                          />
                          Generate by AI
                        </>
                      )}
                    </ButtonSecondary>
                  ) : (
                    <div className="flex items-center gap-2 text-Primary-EmeraldGreen font-medium text-xs">
                      <img src="/icons/tick-circle-bg.svg" alt="" />
                      Generated
                    </div>
                  )
                ) : (
                  ''
                )}
                <ButtonPrimary
                  onClick={() => setshowAddModal(true)}
                  ClassName="w-[108px]"
                >
                  <img src="/icons/add-square.svg" alt="" /> Add
                </ButtonPrimary>
              </>
            )}
          </div>
          <div
            className={`w-full min-h-[450px] bg-white rounded-[24px] border border-gray-50 shadow-100   ${actions.checkIn.length == 0 && actions.category.length == 0 && ''} `}
          >
            {actions.checkIn.length == 0 && actions.category.length == 0 ? (
              <div className="flex flex-col items-center justify-center w-full h-[450px]">
                <img
                  src="/icons/document-text.svg"
                  alt=""
                  className="w-[87px] h-[87px]"
                />
                <div className="text-Text-Primary font-medium text-base mt-2">
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
                <div className="flex flex-col gap-3 py-3 min-h-[420px]">
                  {actions.checkIn.map((act: any, index: number) => {
                    return (
                      <>
                        <ActionCard
                          data={act}
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
                          onRemove={() => removeFromActions(act)}
                          setActions={setActions}
                          key={index}
                          index={index}
                        />
                      </>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
        <div className=" w-[342px] ">
          <div className="w-[342px] sticky top-[190px] p-4 h-[490px] bg-white rounded-[24px] border border-gray-50 shadow-100">
            <SearchBox
              ClassName="rounded-2xl border shadow-none h-[40px] bg-white md:min-w-full"
              placeHolder="Search for actions ..."
              onSearch={(value) => {
                setSearchValue(value);
              }}
            ></SearchBox>
            <Sort
              options={options}
              handleChangeSort={handleChangeSort}
              sortBy={sortBy}
            />
            <div>
              <div className="flex w-full gap-2 text-center items-center justify-between mt-2 flex-wrap">
                {AllCategories.map((cat) => {
                  return (
                    <>
                      <div
                        className={`${selectCategory === cat ? 'bg-[linear-gradient(89.73deg,_rgba(0,95,115,0.5)_-121.63%,_rgba(108,194,74,0.5)_133.18%)] text-Primary-DeepTeal' : 'bg-backgroundColor-Main text-Text-Primary'} px-2 py-2 rounded-2xl text-[10px] flex-grow cursor-pointer`}
                        onClick={() => setSelectedCategory(cat)}
                      >
                        {cat}
                      </div>
                    </>
                  );
                })}
              </div>
              <div className="w-full h-[360px] overflow-y-auto">
                <div className="mt-2 grid gap-2">
                  {filteredDataCategory.map((value: any) => {
                    return (
                      <>
                        <LibBox
                          onAdd={() => addToActions(value)}
                          data={value}
                          handleShowConflictsModal={handleShowConflictsModal}
                        />
                      </>
                    );
                  })}
                  {filteredDataCheckIn.map((value: any) => {
                    return (
                      <>
                        <LibBox
                          onAdd={() => addToActions(value)}
                          data={value}
                          checkIn={true}
                        />
                      </>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Stadio;
