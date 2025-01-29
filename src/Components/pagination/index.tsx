import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const getPages = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  return (
    <div className="  mt-2 flex  space- bg-white px-2   rounded-md">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="text-[#005F73] disabled:opacity-50 px-3  "
      >
        &lt;
      </button>
      {getPages().map((page, index) =>
        typeof page === 'number' ? (
          <button
            key={index}
            onClick={() => onPageChange(page)}
            className={`   px-3 h-[24px] w-[31px] text-Text-Primary  rounded-sm  border-x border-Gray-50 flex items-center justify-center text-[12px]  py-1  ${page === currentPage ? 'bg-backgroundColor-Main ' : 'bg-white'}`}
          >
            {page} 
          </button>
        ) : (
          <span
            key={index}
            className="px-3 w-[26px] h-[26px] py-1  "
          >
            {page} 
          </span>
        ),
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="text-[#005F73] disabled:opacity-50 px-3 "
      >
        &gt;
      </button>
    </div>
  );
};

export default Pagination;
