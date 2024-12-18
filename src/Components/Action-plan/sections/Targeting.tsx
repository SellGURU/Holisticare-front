import { useState } from "react";
import { useNavigate } from "react-router-dom";
// import AnalyseButton from "@/components/AnalyseButton";
import { CategorySection } from "./CategorySection";
import { ButtonPrimary } from "../../Button/ButtonPrimary";
type Item = {
  name: string;
  value: number;
  unit: string;
};

type Category = {
  id: number;
  name: string;
  items: Item[];
  isSelected: boolean;
};

const initialData: Category[] = [
  {
    id: 1,
    name: "Category 1",
    items: [
      { name: "Fiber", value: 500, unit: "Unit" },
      { name: "Calories", value: 500, unit: "Unit" },
      { name: "Protein", value: 500, unit: "Unit" },
    ],
    isSelected: true,
  },
  {
    id: 2,
    name: "Category 2",
    items: [
      { name: "Fiber", value: 500, unit: "Unit" },
      { name: "Calories", value: 500, unit: "Unit" },
    ],
    isSelected: false,
  },
  {
    id: 3,
    name: "Category 3",
    items: [{ name: "Fiber", value: 500, unit: "Unit" }],
    isSelected: true,
  },
];

export const Targeting = () => {
  const [categories, setCategories] = useState<Category[]>(initialData);
  const navigate = useNavigate();

  const handleCheckboxChange = (id: number) => {
    setCategories((prevCategories) =>
      prevCategories.map((category) =>
        category.id === id
          ? { ...category, isSelected: !category.isSelected }
          : category
      )
    );
  };
  const handleValueChange = (
    categoryId: number,
    itemName: string,
    newValue: number
  ) => {
    setCategories((prevCategories) =>
      prevCategories.map((category) => {
        if (category.id === categoryId) {
          return {
            ...category,
            items: category.items.map((item) =>
              item.name === itemName ? { ...item, value: newValue } : item
            ),
          };
        }
        return category;
      })
    );
  };
  return (
    <div className="w-full h-full px-4 lg:px-8">
      <div className="mb-2">
        <div className="w-[60px]">
          <div
            onClick={() => {
              navigate(-1);
            }}
            className={`Aurora-tab-icon-container cursor-pointer h-[40px]`}
          >
            <img src="./Themes/Aurora/icons/arrow-left.svg" alt="Back" />
          </div>
        </div>
      </div>
      <div className="w-full h-full  max-h-[485px] lg:max-h-[585px] overflow-y-scroll xl:overflow-hidden pb-2   inset-0 pt-6 rounded-2xl px-6 bg-light-min-color dark:bg-black-primary border border-light-border-color dark:border-main-border">
        <div className="flex items-center justify-between text-sm font-medium w-full text-light-primary-text dark:text-primary-text">
          Targeting
          {/* <AnalyseButton text="Generate by AI" /> */}
        </div>
        <div className="flex flex-col gap-4 overflow-y-scroll max-h-[340px] lg:max-h-[440px] mt-4">
          {categories.map((category) => (
            <CategorySection
              key={category.id}
              category={category}
              onCheckboxChange={() => handleCheckboxChange(category.id)}
              onValueChange={handleValueChange}
            />
          ))}
        </div>
        <div className="mt-6 w-full flex justify-center">
          <ButtonPrimary
            onClick={() => navigate(-1)}
           
            style={{ width: "192px" }}
        
          >
            Save Changes
          </ButtonPrimary>
        </div>
      </div>
    </div>
  );
};
