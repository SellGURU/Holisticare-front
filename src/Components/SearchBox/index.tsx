/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { InputHTMLAttributes, useState } from 'react';
import SvgIcon from '../../utils/svgIcon';

interface SearchBoxProps extends InputHTMLAttributes<HTMLInputElement> {
  onSearch: (searchTerm: any) => void;
  placeHolder: string;
  ClassName?: string;
  isHaveBorder?: boolean;
  isGrayIcon?: boolean;
}

const SearchBox: React.FC<SearchBoxProps> = ({
  onSearch,
  placeHolder,
  ClassName,
  isHaveBorder,
  isGrayIcon,
  ...props
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove leading spaces but keep spaces between words
    const trimmedValue = value.replace(/^\s+/, '');
    setInputValue(trimmedValue);
    onSearch(trimmedValue);
  };
  return (
    <div
      className={`relative flex justify-start items-center   md:min-w-[300px] h-8 rounded-2xl bg-backgroundColor-Secondary  py-[10px] px-4 ${isHaveBorder ? 'border border-Gray-50' : 'shadow-200'}   ${ClassName}`}
    >
      {
        isGrayIcon ? (
          <SvgIcon
            src="/icons/search-normal.svg"
            width="16px"
            height="16px"
            color="#888888"
          />
        ) : (
          <img src="/icons/search-normal.svg" alt="Search" className="w-4 h-4" />
        )
      }
      
      {/* <img src="/icons/search-normal.svg" alt="Search" className="w-4 h-4" /> */}
      <input
        type="text"
        placeholder={placeHolder}
        onChange={handleChange}
        value={inputValue}
        className="w-full flex justify-center pl-3 bg-inherit  rounded-lg focus:outline-none text-Text-Secondary text-[10px] font-light"
        {...props}
      />
    </div>
  );
};

export default SearchBox;
