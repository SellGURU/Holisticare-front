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
interface CategorySectionProps {
  category: Category;
  onCheckboxChange: () => void;
  onValueChange: (categoryId: number, itemName: string, newValue: number) => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  onCheckboxChange,
  onValueChange,

}) => {
  return (
    <div className="flex flex-col gap-5 bg-gray-200 dark:bg-black-secondary p-2 lg:p-4 rounded-lg mb-4">
      <div
        className="w-full flex justify-between items-center
        "
      >
        {" "}
        <label htmlFor={`category-${category.id}`} className="flex items-center space-x-2 cursor-pointer">
      <input
       id={`category-${category.id}`}
        type="checkbox"
        checked={category.isSelected}
        onChange={onCheckboxChange}
        className="hidden"
      />
     <div
    className={`w-4 h-4 flex items-center justify-center rounded ${
      category.isSelected ? 'bg-brand-secondary-color' : ' bg-gray-300 dark:bg-black-primary'
    }`}
  >
        {category.isSelected && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3 text-black"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
      <span className="text-xs font-medium text-light-primary-text dark:text-primary-text">{category.name}</span>
    </label>
        {/* <div className="flex items-center">
          <input
            onChange={onCheckboxChange}
            id={`category-${category.id}`}
            type="checkbox"
            checked={category.isSelected}
            className="mr-2 peer shrink-0 appearance-none  rounded-md bg-black-primary border border-main-border checked:bg-brand-secondary-color checked:border-transparent checked:text-black checked:before:content-['✔'] checked:before:text-black checked:before:block checked:before:text-center w-4 h-4"
          />{" "}
          <label
            className="text-xs font-medium text-primary-text"
            htmlFor={`category-${category.id}`}
          >
            {category.name}
          </label>
        </div> */}
        {/* <div className="w-[32px] relative   h-[32px]">
          <MiniAnallyseButton disabled={!category.isSelected} ></MiniAnallyseButton>
        </div> */}
      </div>

      <div className="flex flex-wrap gap-4">
        {category.items.map((item, index) => (
          <div
            key={index}
            className={`flex items-center justify-between bg-light-min-color dark:bg-black-primary px-2 py-1 rounded-md w-[195px] h-[56px] ${!category.isSelected ? 'opacity-50' : ''}`}
          >
            <div className="flex items-center gap-[6px]  text-xs ">
              <div className="border border-brand-primary-color w-6 h-6 flex items-center justify-center rounded-full">
              <img className="w-4 h-4 invert dark:inver-0" src="./images/report/heart.svg" alt={item.name} />
              </div>
             
              <span className="text-light-primary-text dark:text-primary-text">{item.name}</span>
            </div>
            <div className="flex items-center gap-[6px] ">
              <input
              onChange={(e) =>
                onValueChange(category.id, item.name, parseInt(e.target.value) || 0)
              }
                value={item.value}
                className="w-[43px] h-[32px] outline-none bg-light-min-color  dark:bg-black-secondary border rounded-md border-light-border-color dark:border-main-border  px-[10px] text-brand-secondary-color text-xs "
                type="text"
              />
              <span className="text-light-secondary-text dark:text-secondary-text text-[10px]">
                {item.unit}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
