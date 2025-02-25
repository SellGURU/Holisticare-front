/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import Checkbox from '../../../Components/checkbox';
import { MainModal } from '../../../Components';
import Application from '../../../api/app';
import { useParams } from 'react-router-dom';
import Circleloader from '../../../Components/CircleLoader';
import SvgIcon from '../../../utils/svgIcon';

type CategoryState = {
  name: string;
  visible: boolean;
};

const initialCategoryState: CategoryState[] = [
  { name: 'Activity', visible: true },
  { name: 'Diet', visible: true },
  { name: 'Supplement', visible: true },
  { name: 'Lifestyle', visible: true },
];

interface SetOrdersProps {
  data: any;
  treatMentPlanData: any;
  setData: (values: any) => void;
  storeChecked: (data: any) => void;
  checkeds: Array<any>;
  reset: () => void;
  // resolvedSuggestions:(data:any) => void
}

export const SetOrders: React.FC<SetOrdersProps> = ({
  data,
  treatMentPlanData,
  setData,
  storeChecked,
  checkeds,
  reset,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('Activity');
  const [orderedCategories, setOrderedCategories] = useState<Array<string>>([]);
  // const [data, setData] = useState<MockData>(mockData);
  const [activeModalValue, setActivemOdalValue] = useState<Array<any>>([]);
  const [showModal, setShowModal] = useState(false);
  // const [FilteredData, setFilteredData] = useState(data);
  const [isStarted, setisStarted] = useState(false);
  const { id } = useParams<{ id: string }>();
  const [categories, setCategories] =
    useState<CategoryState[]>(initialCategoryState);

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
  }, [activeCategory]);
  const handleContinue = () => {
    setIsLoading(true);
    setisStarted(true);
    storeChecked(
      data.filter(
        (el: any) => el.checked == true && el.Category == activeCategory,
      ),
    );
    Application.holisticPlanReScore({
      member_id: id,
      selected_interventions: [
        ...checkeds.filter((el) => orderedCategories.includes(el.Category)),
        ...data.filter(
          (el: any) => el.checked == true && el.Category == activeCategory,
        ),
      ],
      biomarker_insight: treatMentPlanData?.completion_suggestion,
      client_insight: treatMentPlanData?.client_insight,
      looking_forwards: treatMentPlanData?.looking_forwards,
    })
      .then((res) => {
        setIsLoading(false);
        setOrderedCategories((pre) => {
          const old = [...pre];
          old.push(activeCategory);
          return old;
        });
        // const visibleCategories = categories
        //   .filter(
        //     (cat) =>
        //       cat.visible &&
        //       res.data.map((el: any) => el.Category).includes(cat.name),
        //   )
        //   .map((cat) => cat.name);
        const visibleCategories = categories
          .filter((cat) => cat.visible)
          .map((cat) => cat.name);
        const currentIndex = visibleCategories.indexOf(activeCategory);
        let nextIndex = currentIndex;
        if (currentIndex < visibleCategories.length - 1) {
          nextIndex = nextIndex + 1;
        }
        // setFilteredData(res.data);
        setData([...res.data]);
        setActiveCategory(visibleCategories[nextIndex]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  const handleReset = () => {
    setActiveCategory(categories.filter((el) => el.visible)[0].name);
    reset();
  };
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
    setActiveCategory(localCategories[0].name);
    setshowchangeOrders(false);
  };
  return (
    <>
      <MainModal
        isOpen={showchangeOrders}
        onClose={() => setshowchangeOrders(false)}
      >
        <div className=" w-full relative h-[380px] p-4 rounded-2xl bg-white">
          <div className="flex items-center w-full gap-2 border-b border-Gray-50 py-2 text-base font-medium text-Text-Primary">
            <img src="/icons/danger.svg" alt="" />
            Change Orders
          </div>
          <p className="text-xs text-Text-Secondary   my-4">
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
              className="text-sm font-medium text-Primary-DeepTeal"
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
      <div className="bg-white rounded-2xl shadow-100 p-6 border border-Gray-50">
        <div className="flex w-full justify-between border-b border-Gray-50 pb-2 px-6">
          <div className="flex w-[50%] gap-[100px]">
            {categories.map(
              ({ name, visible }) =>
                visible && (
                  <div
                    className={`flex items-center gap-2 text-Primary-DeepTeal text-sm font-medium cursor-pointer ${name !== activeCategory ? 'opacity-50' : ''}`}
                    key={name}
                    // onClick={() => setActiveCategory(name)}
                  >
                    <img
                      className="size-5"
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
          <div
            className={`w-[50%] justify-end ${!isStarted ? 'flex' : 'hidden'}`}
          >
            <img
              className="cursor-pointer"
              src="/icons/setting-4.svg"
              alt=""
              onClick={() => setshowchangeOrders(true)}
            />
          </div>
        </div>

        <div className="relative bg-backgroundColor-Card border border-Gray-50 rounded-b-2xl py-4 pb-8 px-6 min-h-[400px] overflow-y-auto">
          {data
            .filter((el: any) => el.Category == activeCategory)
            .map((item: any, index: number) => (
              <div className="flex items-center gap-2 mb-3">
                <Checkbox
                  checked={item.checked}
                  onChange={() => handleCheckboxChange(activeCategory, index)}
                />
                <ul className="pl-8 w-full bg-white rounded-2xl border border-Gray-50 py-3 px-4 text-xs text-Text-Primary">
                  <li className="list-disc">
                    {item.Recommendation}{' '}
                    <span className="text-Text-Secondary">/ Instructions:</span>{' '}
                    {item.Instruction}
                    {item['Based on'] && (
                      <div
                        onClick={() => {
                          setShowModal(true);
                          setActivemOdalValue(item['Practitioner Comments']);
                        }}
                        className="text-Text-Secondary text-xs contents md:inline-flex lg:inline-flex mt-2"
                      >
                        Based on your:{' '}
                        <span className="text-Primary-DeepTeal flex items-center ml-1 gap-2 cursor-pointer">
                          {item['Based on']}{' '}
                          <SvgIcon src="/icons/export.svg" color="#005F73" />
                        </span>
                      </div>
                    )}
                  </li>
                </ul>
              </div>
            ))}
          <div className=" absolute bottom-3 gap-2 text-[12px] right-6 w-full flex justify-end text-Primary-DeepTeal font-medium cursor-pointer select-none ">
            {activeCategory !=
              categories.filter((el) => el.visible)[0].name && (
              <div className="  text-[12px]   flex justify-end text-Text-Secondary font-medium cursor-pointer select-none">
                <div onClick={handleReset}>Reset</div>
              </div>
            )}
            {activeCategory !=
              categories.filter((el) => el.visible)[
                categories.filter((el) => el.visible).length - 1
              ].name && (
              <div className="  text-[12px]  flex justify-end text-Primary-DeepTeal font-medium cursor-pointer select-none">
                <div onClick={handleContinue}>Continue</div>
              </div>
            )}
          </div>
        </div>
      </div>
      {showModal && (
        <MainModal isOpen={showModal} onClose={() => setShowModal(false)}>
          <div className="bg-white min-h-[400px] overflow-auto w-[500px]  p-6 pb-8 rounded-2xl shadow-800">
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
