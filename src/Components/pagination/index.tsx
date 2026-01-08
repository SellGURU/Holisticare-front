import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isEmpty?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  isEmpty = false,
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

  // If there's no data or only one page, show just the current page
  if (isEmpty || totalPages <= 1) {
    return (
      <div className="mt-2 flex items-center justify-center gap-0.5 bg-white px-2 py-1 rounded-md shadow-sm border border-gray-200">
        <button
          disabled={true}
          className="flex items-center justify-center w-6 h-6 text-[#005F73] opacity-40 cursor-not-allowed rounded transition-all duration-200"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          disabled={true}
          className="flex items-center justify-center min-w-[24px] h-6 px-2 text-xs font-medium text-Text-Primary rounded bg-backgroundColor-Main border border-gray-200 cursor-default"
        >
          1
        </button>
        <button
          disabled={true}
          className="flex items-center justify-center w-6 h-6 text-[#005F73] opacity-40 cursor-not-allowed rounded transition-all duration-200"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="mt-2 flex items-center justify-center gap-0.5 bg-white px-2 py-1 rounded-md shadow-sm border border-gray-200">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`flex items-center justify-center w-6 h-6 text-[#005F73] rounded transition-all duration-200 ${
          currentPage === 1
            ? 'opacity-40 cursor-not-allowed'
            : 'hover:bg-gray-100 hover:text-[#005F73] active:bg-gray-200'
        }`}
        aria-label="صفحه قبلی"
      >
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      {getPages().map((page, index) =>
        typeof page === 'number' ? (
          <button
            key={index}
            onClick={() => onPageChange(page)}
            className={`flex items-center justify-center min-w-[24px] h-6 px-2 text-xs font-medium rounded transition-all duration-200 ${
              page === currentPage
                ? 'bg-[#005F73] text-white shadow-md scale-105 border border-[#005F73]'
                : 'bg-white text-Text-Primary border border-gray-200 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100'
            }`}
            aria-label={`صفحه ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        ) : (
          <span
            key={index}
            className="flex items-center justify-center w-6 h-6 px-1 text-xs text-gray-400"
          >
            {page}
          </span>
        ),
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`flex items-center justify-center w-6 h-6 text-[#005F73] rounded transition-all duration-200 ${
          currentPage === totalPages
            ? 'opacity-40 cursor-not-allowed'
            : 'hover:bg-gray-100 hover:text-[#005F73] active:bg-gray-200'
        }`}
        aria-label="صفحه بعدی"
      >
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
};

export default Pagination;
