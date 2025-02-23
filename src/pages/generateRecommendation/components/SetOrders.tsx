import React, { useState } from 'react';
import Checkbox from '../../../Components/checkbox';
import { MainModal } from '../../../Components';
type Item = {
  id: number;
  name: string;
  ingredient?: string;
  instructions: string;
  checked: boolean;
};

type MockData = {
  [category: string]: Item[];
};

const mockData: MockData = {
  Activity: [
    {
      id: 1,
      name: 'Omeprazole (Oral Pill) 40 MG',
      ingredient: 'omeprazole',
      instructions: '1qam',
      checked: true,
    },
    {
      id: 2,
      name: 'TA-65 500 IU',
      instructions: 'Take two a day first thing in the morning',
      checked: true,
    },
  ],
  Diet: [
    {
      id: 3,
      name: 'Vitamin C 500 mg',
      instructions: 'Take one a day with food',
      checked: false,
    },
  ],
  Supplement: [
    {
      id: 4,
      name: 'Vitamin C 500 mg',
      instructions: 'Take one a day with food',
      checked: false,
    },
  ],
  Lifestyle: [
    {
      id: 5,
      name: 'Vitamin C 500 mg',
      instructions: 'Take one a day with food',
      checked: false,
    },
  ],
};

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

export const SetOrders: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('Activity');
  const [data, setData] = useState<MockData>(mockData);
  const [categories, setCategories] =
    useState<CategoryState[]>(initialCategoryState);

  const handleCheckboxChange = (category: string, itemId: number) => {
    setData({
      ...data,
      [category]: data[category].map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item,
      ),
    });
  };

  const handleContinue = () => {
    const visibleCategories = categories
      .filter((cat) => cat.visible)
      .map((cat) => cat.name);
    const currentIndex = visibleCategories.indexOf(activeCategory);
    const nextIndex = (currentIndex + 1) % visibleCategories.length;
    setActiveCategory(visibleCategories[nextIndex]);
  };

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
                            ? '/icons/lifestyle.svg'
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
      <div className="bg-white rounded-2xl shadow-100 p-6 border border-Gray-50">
        <div className="flex w-full justify-between border-b border-Gray-50 pb-2 px-6">
          <div className="flex w-[50%] gap-[100px]">
            {categories.map(
              ({ name, visible }) =>
                visible && (
                  <div
                    className={`flex items-center gap-2 text-Primary-DeepTeal text-sm font-medium cursor-pointer ${name !== activeCategory ? 'opacity-50' : ''}`}
                    key={name}
                    onClick={() => setActiveCategory(name)}
                  >
                    <img
                      className="size-5"
                      src={
                        name === 'Activity'
                          ? '/icons/weight.svg'
                          : name === 'Diet'
                            ? '/icons/diet.svg'
                            : name === 'Lifestyle'
                              ? '/icons/lifestyle.svg'
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
            className={`w-[50%] justify-end ${activeCategory === 'Activity' ? 'flex' : 'hidden'}`}
          >
            <img
              className="cursor-pointer"
              src="/icons/setting-4.svg"
              alt=""
              onClick={() => setshowchangeOrders(true)}
            />
          </div>
        </div>

        <div className="relative bg-backgroundColor-Card border border-Gray-50 rounded-b-2xl py-4 px-6 min-h-[400px] overflow-y-auto">
          {data[activeCategory].map((item) => (
            <div key={item.id} className="flex items-center gap-2 mb-3">
              <Checkbox
                checked={item.checked}
                onChange={() => handleCheckboxChange(activeCategory, item.id)}
              />
              <ul className="pl-8 w-full bg-white rounded-2xl border border-Gray-50 py-3 px-4 text-xs text-Text-Primary">
                <li className="list-disc">
                  {item.name} / Ingredient: {item.ingredient || 'N/A'} /
                  Instructions: {item.instructions}
                </li>
              </ul>
            </div>
          ))}
          <div
            className="absolute bottom-3 right-6 w-full flex justify-end text-Primary-DeepTeal font-medium cursor-pointer select-none"
            onClick={handleContinue}
          >
            Continue
          </div>
        </div>
      </div>
    </>
  );
};
