/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from 'react';
import { MainModal } from '../../../Components';
// import Application from '../../../api/app';
import { useParams } from 'react-router-dom';
import Circleloader from '../../../Components/CircleLoader';
import { publish, subscribe } from '../../../utils/event';
import { ActivityCard } from './ActivityCard';

type CategoryState = {
  name: string;
  visible: boolean;
};

interface SetOrdersProps {
  data: any;
  treatMentPlanData: any;
  setData: (values: any) => void;
  storeChecked: (data: any) => void;
  checkeds: Array<any>;
  reset: () => void;
  defaultSuggestions: Array<any>;
  visibleCategoriy: CategoryState[];
  setVisibleCategorieys: (value: CategoryState[]) => void;
  // resolvedSuggestions:(data:any) => void
  activeCategory: string;
  setActiveCategory: (value: string) => void;
}

export const SetOrders: FC<SetOrdersProps> = ({
  data,
  // treatMentPlanData,
  setData,
  storeChecked,
  checkeds,
  // reset,
  // defaultSuggestions,
  visibleCategoriy,
  activeCategory,
  setActiveCategory,
  setVisibleCategorieys,
}) => {
  // const [activeCategory, setActiveCategory] = useState<string>(
  //   visibleCategoriy[visibleCategoriy.length - 1].name || 'Activity',
  // );
  const [orderedCategories, setOrderedCategories] = useState<Array<string>>([]);
  // const [data, setData] = useState<MockData>(mockData);
  const [activeModalValue] = useState<Array<any>>([]);
  const [showModal, setShowModal] = useState(false);
  // const [FilteredData, setFilteredData] = useState(data);
  // const [isStarted, setisStarted] = useState(false);
  const { id } = useParams<{ id: string }>();
  console.log(id);

  const [categories, setCategories] =
    useState<CategoryState[]>(visibleCategoriy);

  // useEffect(() => {
  //   setData(defaultSuggestions);
  // }, [defaultSuggestions]);
  // const _AllCategoryChecekd = (category: string) => {
  //   const newData = data
  //     .filter((el: any) => el.Category == category)
  //     .map((el: any) => {
  //       return {
  //         ...el,
  //         checked: true,
  //       };
  //     });
  //   setData([...data.filter((el: any) => el.Category != category), ...newData]);
  // };

  const handleCheckboxChange = (category: string, itemId: number) => {
    // console.log(data.filter((el:any) => el.Category == category)[itemId])
    const newData = data
      .filter((el: any) => el.Category == category)
      .map((el: any, index: number) => {
        if (index == itemId) {
          return {
            ...el,
            checked: !el.checked,
          };
        } else {
          return el;
        }
      });
    setData([...data.filter((el: any) => el.Category != category), ...newData]);
  };
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (!data.map((el: any) => el.Category).includes(activeCategory)) {
      const visibleCategories = categories
        .filter((cat) => cat.visible)
        .map((cat) => cat.name);
      const currentIndex = visibleCategories.indexOf(activeCategory);
      let nextIndex = currentIndex;
      if (currentIndex < visibleCategories.length - 1) {
        nextIndex = nextIndex + 1;
      }
      setActiveCategory(visibleCategories[nextIndex]);
      // AllCategoryChecekd(visibleCategories[nextIndex])
    }
  }, []);
  const handleContinue = () => {
    setIsLoading(true);
    // setisStarted(true);
    const visibleCategories = categories
      .filter((cat) => cat.visible)
      .map((cat) => cat.name);
    const currentIndex = visibleCategories.indexOf(activeCategory);
    // const nextTabName = visibleCategories[currentIndex + 1];

    storeChecked(
      data.filter(
        (el: any) => el.checked === true && el.Category === activeCategory,
      ),
    );

    // Directly update state as needed
    const selectedInterventions = [
      ...checkeds.filter((el) => orderedCategories.includes(el.Category)),
      ...data.filter(
        (el: any) => el.checked === true && el.Category === activeCategory,
      ),
    ];
    console.log(selectedInterventions);

    // Example of state update without API
    setOrderedCategories((prev) => {
      const old = [...prev];
      old.push(activeCategory);
      return old;
    });

    // Update data without API call
    // If there's logic to determine the next data set, implement it here
    // Example: setData([...modifiedData]);

    setIsLoading(false);

    const nextIndex =
      currentIndex < visibleCategories.length - 1
        ? currentIndex + 1
        : currentIndex;

    setActiveCategory(visibleCategories[nextIndex]);
  };
  const handleBack = () => {
    setIsLoading(true);
    // setisStarted(true);
    const visibleCategories = categories
      .filter((cat) => cat.visible)
      .map((cat) => cat.name);
    console.log('visibleCategories => ', visibleCategories);
    const currentIndex = visibleCategories.indexOf(activeCategory);
    // const nextTabName = visibleCategories[currentIndex + 1];
    setIsLoading(false);
    const backIndex = currentIndex > 0 ? currentIndex - 1 : currentIndex;

    setActiveCategory(visibleCategories[backIndex]);
  };
  subscribe('rescore', () => {
    handleContinue();
  });
  subscribe('rescoreBack', () => {
    handleBack();
  });
  useEffect(() => {
    if (
      activeCategory !=
        categories.filter((el) => el.visible)[
          categories.filter((el) => el.visible).length - 1
        ].name &&
      visibleCategoriy.filter((el) => el.visible).length > 1
    ) {
      publish('isNotRescored', {});
    } else {
      publish('isRescored', {});
    }
  }, [activeCategory, visibleCategoriy]);
  // const handleContinue = () => {
  //   setIsLoading(true);
  //   setisStarted(true);
  //   const visibleCategories = categories
  //     .filter((cat) => cat.visible)
  //     .map((cat) => cat.name);
  //   const currentIndex = visibleCategories.indexOf(activeCategory);
  //   const nextTabName = visibleCategories[currentIndex + 1];

  //   storeChecked(
  //     data.filter(
  //       (el: any) => el.checked == true && el.Category == activeCategory,
  //     ),
  //   );
  //   Application.holisticPlanReScore({
  //     tab_name: nextTabName,
  //     member_id: id,
  //     selected_interventions: [
  //       ...checkeds.filter((el) => orderedCategories.includes(el.Category)),
  //       ...data.filter(
  //         (el: any) => el.checked == true && el.Category == activeCategory,
  //       ),
  //     ],
  //     biomarker_insight: treatMentPlanData?.completion_suggestion,
  //     client_insight: treatMentPlanData?.client_insight,
  //     looking_forwards: treatMentPlanData?.looking_forwards,
  //   })
  //     .then((res) => {
  //       setIsLoading(false);
  //       setOrderedCategories((pre) => {
  //         const old = [...pre];
  //         old.push(activeCategory);
  //         return old;
  //       });
  //       // const visibleCategories = categories
  //       //   .filter(
  //       //     (cat) =>
  //       //       cat.visible &&
  //       //       res.data.map((el: any) => el.Category).includes(cat.name),
  //       //   )
  //       //   .map((cat) => cat.name);
  //       const visibleCategories = categories
  //         .filter((cat) => cat.visible)
  //         .map((cat) => cat.name);
  //       const currentIndex = visibleCategories.indexOf(activeCategory);
  //       let nextIndex = currentIndex;
  //       if (currentIndex < visibleCategories.length - 1) {
  //         nextIndex = nextIndex + 1;
  //       }
  //       // setFilteredData(res.data);
  //       setData([...res.data]);
  //       setActiveCategory(visibleCategories[nextIndex]);
  //     })
  //     .finally(() => {
  //       setIsLoading(false);
  //     });
  // };
  // const handleReset = () => {
  //   setActiveCategory(categories.filter((el) => el.visible)[0].name);
  //   reset();
  // };
  // useEffect(() => {
  //   // setData([
  //   //   ...data.map((el: any) => {
  //   //     return { ...el, checked: false };
  //   //   }),
  //   // ]);
  //   // setFilteredData([
  //   //   ...data.map((el: any) => {
  //   //     return { ...el, checked: false };
  //   //   }),
  //   // ]);
  //   AllCategoryChecekd(activeCategory);
  // }, [activeCategory]);
  const [showchangeOrders, setshowchangeOrders] = useState(false);
  const [localCategories, setLocalCategories] = useState<CategoryState[]>([
    ...categories,
  ]);

  const handleOrderChange = (index: number, direction: 'up' | 'down') => {
    const newCategories = [...localCategories];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newCategories.length) return;

    [newCategories[index], newCategories[targetIndex]] = [
      newCategories[targetIndex],
      newCategories[index],
    ];
    setLocalCategories(newCategories);
  };

  const toggleVisibility = (index: number) => {
    const newCategories = localCategories.map((cat, i) =>
      i === index ? { ...cat, visible: !cat.visible } : cat,
    );
    setLocalCategories(newCategories);
  };

  const handleConfirm = () => {
    setCategories(localCategories);
    setVisibleCategorieys(localCategories);
    setActiveCategory(localCategories[0].name);
    setshowchangeOrders(false);
  };

  return (
    <>
      <MainModal
        isOpen={showchangeOrders}
        onClose={() => setshowchangeOrders(false)}
      >
        <div className=" w-[90vw] md:w-full relative h-[380px] p-4 rounded-2xl bg-white">
          <div className="flex items-center w-full gap-2 border-b border-Gray-50 py-2 text-base font-medium text-Text-Primary">
            <img src="/icons/danger.svg" alt="" />
            Change Order
          </div>
          <p className="text-xs text-Text-Secondary my-4">
            Please complete all required fields before confirming your order.
          </p>
          <ul className="border border-Gray-50 rounded-xl">
            {localCategories.map((category, index) => (
              <li
                key={category.name}
                className="flex items-center justify-between border-b border-Gray-50 p-3"
              >
                <div
                  className={` ${!category.visible && 'opacity-50'} flex items-center gap-2 text-Primary-DeepTeal text-sm font-medium cursor-pointer`}
                >
                  <img
                    className="size-4"
                    src={
                      category.name === 'Activity'
                        ? '/icons/weight.svg'
                        : category.name === 'Diet'
                          ? '/icons/diet.svg'
                          : category.name === 'Lifestyle'
                            ? '/icons/LifeStyle2.svg'
                            : '/icons/Supplement.svg'
                    }
                    alt=""
                  />
                  {category.name}
                </div>
                <div className="flex items-center gap-3">
                  <img
                    className={`cursor-pointer ${!category.visible || index === 0 ? 'opacity-50 pointer-events-none' : ''}`}
                    src="/icons/arrow-circle-up.svg"
                    onClick={() => handleOrderChange(index, 'up')}
                  />
                  <img
                    className={`cursor-pointer ${!category.visible || index === localCategories.length - 1 ? 'opacity-50 pointer-events-none' : ''}`}
                    src="/icons/arrow-circle-down.svg"
                    onClick={() => handleOrderChange(index, 'down')}
                  />

                  <img
                    className={`   cursor-pointer`}
                    src={
                      category.visible
                        ? '/icons/eye-slash-blue.svg '
                        : '  /icons/eye-blue.svg'
                    }
                    onClick={() => toggleVisibility(index)}
                  />
                  {/* {category.visible ? 'Hide' : 'Show'} */}
                </div>
              </li>
            ))}
          </ul>
          <div className=" absolute bottom-4 right-4 w-full flex justify-end gap-3">
            <button
              className="text-sm font-medium text-Disable"
              onClick={() => setshowchangeOrders(false)}
            >
              Cancel
            </button>
            <button
              className={`${localCategories.filter((el) => el.visible).length === 0 ? 'opacity-50 pointer-events-none' : ''} text-sm font-medium text-Primary-DeepTeal`}
              onClick={handleConfirm}
            >
              Confirm
            </button>
          </div>
        </div>
      </MainModal>
      {isLoading && (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-85 z-20">
          {' '}
          <Circleloader></Circleloader>
        </div>
      )}
      <div className="bg-white rounded-2xl shadow-100 p-4 md:p-6 border border-Gray-50">
        <div className="flex w-full flex-wrap ss:flex-nowrap gap-4 justify-between border-b border-Gray-50 pb-2 md:px-6">
          <div className="flex w-[80%]   md:w-[50%] gap-8 md:gap-[80px]">
            {categories.map(
              ({ name, visible }) =>
                visible && (
                  <div
                    className={`flex items-center gap-2 text-Primary-DeepTeal text-[10px] md:text-xs font-medium cursor-pointer ${name !== activeCategory ? 'opacity-50' : ''}`}
                    key={name}
                    onClick={() => {
                      setActiveCategory(name);
                      console.log('name => ', name);
                    }}
                  >
                    <img
                      className="size-4"
                      src={
                        name === 'Activity'
                          ? '/icons/weight.svg'
                          : name === 'Diet'
                            ? '/icons/diet.svg'
                            : name === 'Lifestyle'
                              ? '/icons/LifeStyle2.svg'
                              : '/icons/Supplement.svg'
                      }
                      alt=""
                    />
                    {name}
                  </div>
                ),
            )}
          </div>
          <div className="gap-2 text-[12px] w-full flex justify-end text-Primary-DeepTeal font-medium cursor-pointer select-none ">
            {/* {activeCategory != categories.filter((el) => el.visible)[0].name &&
              visibleCategoriy.filter((el) => el.visible).length > 1 && (
                <div className="  text-[12px]   flex justify-end text-Text-Secondary font-medium cursor-pointer select-none">
                  <div onClick={handleReset}>Reset</div>
                </div>
              )}
            {activeCategory !=
              categories.filter((el) => el.visible)[
                categories.filter((el) => el.visible).length - 1
              ].name &&
              visibleCategoriy.filter((el) => el.visible).length > 1 && (
                <div className="  text-[12px]  flex justify-end text-Primary-DeepTeal font-medium cursor-pointer select-none">
                  <div onClick={handleContinue}>Continue</div>
                </div>
              )} */}
            <div
              className={`justify-end ml-4 flex items-center gap-1`}
              onClick={() => setshowchangeOrders(true)}
            >
              <img
                className="cursor-pointer md:w-5 md:h-5 w-4 h-4"
                src="/icons/setting-4.svg"
                alt=""
              />
              <div className="text-Primary-DeepTeal text-[10px] md:text-xs font-medium">
                Change Order
              </div>
            </div>
          </div>
        </div>

        <div className="relative bg-backgroundColor-Card max-h-[400px] pr-1 overflow-auto border border-Gray-50 rounded-b-2xl py-4 md:pb-8 px-3 md:px-6 min-h-[400px] overflow-y-auto">
          {data
            ?.filter((el: any) => el.Category == activeCategory)
            .map((item: any, index: number) => {
              return (
                <ActivityCard
                  key={index}
                  item={item}
                  index={index}
                  activeCategory={activeCategory}
                  handleCheckboxChange={handleCheckboxChange}
                />
              );
            })}
          {data?.filter((el: any) => el.Category == activeCategory).length ===
            0 && (
            <div className="w-full h-[350px] flex flex-col justify-center items-center">
              <img src="/icons/document-text-rectangle.svg" alt="" />
              <div className="text-base text-Text-Primary font-medium -mt-2">
                No recommendations found.
              </div>
            </div>
          )}
        </div>
      </div>
      {showModal && (
        <MainModal isOpen={showModal} onClose={() => setShowModal(false)}>
          <div className="bg-white h-fit max-h-[400px] overflow-auto w-[500px]  p-6 pb-8 rounded-2xl shadow-800">
            <div className="border-b border-Gray-50 pb-2 w-full flex gap-2 items-center text-sm font-medium text-Text-Primary">
              <img src="/icons/notification-status.svg" alt="" /> Practitioner
              Comment
            </div>
            <div className="flex flex-col gap-2 mt-5">
              {activeModalValue?.map((comment: string, index: number) => (
                <div
                  className="bg-backgroundColor-Card w-full rounded-2xl py-1 px-3 border border-Gray-50 text-xs text-Text-Primary text-justify "
                  key={index}
                >
                  {comment}
                </div>
              ))}
            </div>
          </div>
        </MainModal>
      )}
    </>
  );
};
