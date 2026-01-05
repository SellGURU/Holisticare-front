/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { InputHTMLAttributes, useEffect, useState } from 'react';
import SvgIcon from '../../utils/svgIcon';

interface SearchBoxProps extends InputHTMLAttributes<HTMLInputElement> {
  onSearch: (searchTerm: any) => void;
  placeHolder: string;
  ClassName?: string;
  isHaveBorder?: boolean;
  isGrayIcon?: boolean;
  isMessages?: boolean;

  // NEW
  showClose?: boolean;
}

const SearchBox: React.FC<SearchBoxProps> = ({
  onSearch,
  placeHolder,
  ClassName,
  isHaveBorder,
  isGrayIcon,
  value,
  isMessages,
  showClose = false,
  ...props
}) => {
  const [inputValue, setInputValue] = useState(value || '');

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value.replace(/^\s+/, '');
    setInputValue(next);
    onSearch(next);
  };

  const handleClear = () => {
    setInputValue('');
    onSearch('');
  };

  return (
    <div
      className={`relative flex justify-start items-center ${
        !isMessages && 'md:min-w-[300px]'
      } h-8 rounded-2xl bg-backgroundColor-Secondary py-[10px] px-4 ${
        isHaveBorder ? 'border border-Gray-50' : 'shadow-200'
      } ${ClassName}`}
    >
      {isGrayIcon ? (
        <SvgIcon
          src="/icons/search-normal.svg"
          width="18px"
          height="18px"
          color="#888888"
        />
      ) : (
        <img src="/icons/search-normal.svg" alt="Search" className="w-4 h-4" />
      )}

      <input
        type="text"
        placeholder={placeHolder}
        onChange={handleChange}
        value={inputValue}
        className="w-full flex justify-center pl-3 bg-inherit rounded-lg focus:outline-none text-Text-Primary font-normal placeholder:font-ight placeholder:text-Text-Secondary text-[10px]"
        {...props}
      />

      {showClose && (
        <button
          type="button"
          onClick={handleClear}
          className=" flex items-center justify-center cursor-pointer"
          aria-label="Clear search"
        >
          <img src="/icons/close.svg" alt="" />
        </button>
      )}
    </div>
  );
};

export default SearchBox;
