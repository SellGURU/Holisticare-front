import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationCircular: React.FC<PaginationProps> = ({
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
    <div className="mt-2 flex bg-white px-2 rounded-md gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="text-[12px] h-[24px] w-[24px] text-[#383838] disabled:opacity-50 rounded-full border border-[#005F731A] cursor-pointer"
      >
        &lt;
      </button>
      {getPages().map((page, index) =>
        typeof page === 'number' ? (
          <button
            key={index}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 h-[24px] w-[24px] ${page === currentPage ? 'text-white' : 'text-Text-Primary'} rounded-full border-x border-Gray-50 flex items-center justify-center text-[9.75px] py-1 ${page === currentPage ? 'bg-Primary-DeepTeal' : 'bg-white'}`}
          >
            {page}
          </button>
        ) : (
          <span key={index} className="px-3 w-[26px] h-[26px] py-1">
            {page}
          </span>
        ),
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="text-[12px] h-[24px] w-[24px] text-[#383838] disabled:opacity-50 rounded-full border border-[#005F731A] cursor-pointer"
      >
        &gt;
      </button>
    </div>
  );
};

export default PaginationCircular;
