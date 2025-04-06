import { useState } from 'react';

interface SortProps {
  options: {
    label: string;
    value: string;
    color: string;
  }[];
  handleChangeSort: (value: string) => void;
  sortBy: string;
}

const Sort = ({ options, handleChangeSort, sortBy }: SortProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="w-full flex items-center justify-between mt-2">
      <div className="flex items-center gap-1">
        <img src="/icons/sort.svg" alt="" className="w-4 h-4" />
        <div className="text-Primary-DeepTeal text-xs">Sort by:</div>
      </div>
      <div className="relative inline-block w-[227px] font-normal">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-between w-full h-[28px] bg-backgroundColor-Card border px-4 pr-8 ${isOpen ? 'rounded-t-2xl' : 'rounded-2xl'} leading-tight focus:outline-none text-xs text-Text-Primary`}
        >
          <span className="flex items-center gap-2">
            <span
              className={`w-[10px] h-[10px] rounded-full ${
                options.find((opt) => opt.value === sortBy)?.color || ''
              }`}
            />
            {options.find((opt) => opt.value === sortBy)?.label}
          </span>
        </button>
        <img
          className={`w-3 h-3 object-contain opacity-80 absolute top-2 right-3 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          src="/icons/arow-down-drop.svg"
          alt=""
        />
        {isOpen && (
          <ul className="absolute left-0 w-full bg-white border border-t-0 rounded-b-2xl shadow-100 z-10">
            {options.map((option) => (
              <li
                key={option.value}
                onClick={() => {
                  handleChangeSort(option.value);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-100 text-xs text-Text-Primary ${option.value === options[options.length - 1].value ? 'rounded-b-2xl' : ''}`}
              >
                <span
                  className={`w-[10px] h-[10px] rounded-full ${option.color}`}
                />
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Sort;
