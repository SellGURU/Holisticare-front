import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const getPages = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  return (
    <div className="  mt-2 flex  space- bg-white border-light-border-color dark:bg-black-primary px-2   rounded-md">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="text-light-primary-text dark:text-primary-text disabled:opacity-50 px-3 dark:border-none rounded-l-lg rounded  border border-lite-main-border"
      >
        &lt;
      </button>
      {getPages().map((page, index) =>
        typeof page === 'number' ? (
          <button
            key={index}
            onClick={() => onPageChange(page)}
            className={`   px-3 h-[26px] w-[26px] dark:border-none dark:border-x rounded-sm  border border-lite-main-border text-[12px] text-light-primary-text dark:text-primary-text  dark:border-x-main-border py-1  ${page === currentPage ? 'bg-light-btn-pagination-active darK:bg-main-border dark:bg-dark-btn-active ' : ' dark:bg-black-primary'}`}
          >
            {page}
          </button>
        ) : (
          <span key={index} className="px-3 w-[26px] h-[26px] py-1 text-secondary-text ">
            {page}
          </span>
        )
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="text-light-primary-text dark:text-primary-text disabled:opacity-50 px-3 dark:border-none  rounded-r-lg rounded  border border-lite-main-border"
      >
        &gt;
      </button>
    </div>
  );
};

export default Pagination;