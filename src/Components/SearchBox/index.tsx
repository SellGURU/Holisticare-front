import React from "react";

type SearchBoxProps = {
  onSearch: (searchTerm: any) => void;
  placeHolder:string
};

const SearchBox: React.FC<SearchBoxProps> = ({ onSearch , placeHolder}) => {
  return (
    <div className="relative flex justify-start items-center  min-w-[300px] h-8 rounded-lg bg-backgroundColor-Secondary shadow-100 py-[10px] px-4">
         <img
        src="/icons/search.svg"
        alt="Search"
        className="w-4 h-4"
      />
      <input
        type="text"
        placeholder={placeHolder}
        onChange={(e) => onSearch(e.target.value)}
        className="w-full flex justify-center pl-3 bg-inherit  rounded-lg focus:outline-none text-Text-Secondary text-[10px] font-light"
      />
     
    </div>
  );
};

export default SearchBox;