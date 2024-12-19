import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AnalyseButton from "../../AnalyseButton";
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
       <div className="px-8 mb-2 pt-[80px] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div
              onClick={() => {
                navigate(-1);
              }}
              className={` px-[6px] py-[3px] flex items-center justify-center cursor-pointer bg-white border border-Gray-50 rounded-md shadow-100`}
            >
              <img className="w-6 h-6" src="/icons/arrow-back.svg" />
            </div>
            <div className="TextStyle-Headline-5 text-Text-Primary">
              Targeting
            </div>
          </div>
          <AnalyseButton text="Generate by AI" />
        </div>
      <div className="w-full pb-2 pt-6 rounded-2xl px-6  ">
        {/* <div className="flex items-center justify-between text-sm font-medium w-full text-light-primary-text dark:text-primary-text">
          Targeting */}
         
        {/* </div> */}
        <div className="flex flex-col gap-4 overflow-y-scroll max-h-[340px] lg:max-h-[440px]">
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
            <img src="/icons/tick-square.svg" alt="" />
            Save Changes
          </ButtonPrimary>
        </div>
      </div>
    </div>
  );
};
