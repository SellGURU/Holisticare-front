import { useState } from 'react';
import { MainModal } from '../../../../Components';

interface SectionOrderModal {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (values: Array<CategoryState>) => void;
}

interface CategoryState {
  name: string;
  visible: boolean;
}

const initialCategoryState: CategoryState[] = [
  { name: 'Warm-Up', visible: true },
  { name: 'Main work out', visible: true },
  { name: 'Cool Down', visible: true },
  { name: 'Recovery', visible: true },
  { name: 'Finisher', visible: true },
];

const SectionOrderModal: React.FC<SectionOrderModal> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [categories] = useState<CategoryState[]>(initialCategoryState);
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
  return (
    <>
      <MainModal isOpen={isOpen} onClose={onClose}>
        <div className=" w-full relative h-[380px] p-4 rounded-2xl bg-white">
          <div className="flex items-center w-full gap-2 border-b border-Gray-50 py-2 text-base font-medium text-Text-Primary">
            Section Order
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
                  className={` ${!category.visible && 'opacity-50'} flex items-center gap-2 text-Primary-DeepTeal text-sm cursor-pointer`}
                >
                  {/* <img
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
                  /> */}
                  {category.name}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
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
                  </div>

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
              onClick={() => onClose()}
            >
              Cancel
            </button>
            <button
              className="text-sm font-medium text-Primary-DeepTeal"
              onClick={() => onConfirm(localCategories)}
            >
              Confirm
            </button>
          </div>
        </div>
      </MainModal>
    </>
  );
};

export default SectionOrderModal;
