import React from 'react';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight, MdKeyboardDoubleArrowLeft, MdKeyboardDoubleArrowRight } from "react-icons/md";

interface PaginationProps {
  currentPage: number;
  totalRecords?:number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange}) => {
  const pageNumbers = [];
  
  // Create page numbers with `...` when necessary
  const startPage = Math.max(2, currentPage - 1);
  const endPage = Math.min(totalPages - 1, currentPage + 2);

  if (startPage > 2) {
    pageNumbers.push('...');
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  if (endPage < totalPages - 1) {
    pageNumbers.push('...');
  }

  const commonClasses = 'p-1 rounded-sm hover:bg-primary-light hover:text-primary cursor-pointer min-w-[25px] font-bold'; 

  return (
    <>
      {totalPages > 1 && 
        <div className="pagination-controls flex flex-row gap-2 text-sm font-bold text-slate-500 p-2 justify-end my-3">
          {/* First Page */}
          {/* <button className={`${commonClasses} ${currentPage === 1 ? 'bg-primary-light text-primary' : ''} text-lg`}
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
          >
            <MdKeyboardDoubleArrowLeft />
          </button> */}

          {/* Previous Page */}
          <button className={`${commonClasses} text-2xl ${currentPage === 1 ? ' text-slate-300 cursor-no-drop hover:bg-transparent hover:text-slate-300' : 'text-primary'}`}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <MdKeyboardArrowLeft />
          </button>

          {/* Always show the first page */}
          <button className={`${commonClasses} ${currentPage === 1 ? 'bg-primary-light text-primary' : ''}`}
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
          >
            1
          </button>

          {/* Render dynamic page buttons */}
          {pageNumbers.map((page, index) =>
            typeof page === 'number' ? (
              <button className={`${commonClasses} ${currentPage === page ? 'bg-primary-light text-primary' : ''}`}
                key={index}
                onClick={() => onPageChange(page)}
                disabled={currentPage === page}
              >
                {page}
              </button>
            ) : (
              <span key={index}>...</span>
            )
          )}

          {/* Always show the last page */}
          <button className={`${commonClasses} ${currentPage === totalPages ? 'bg-primary-light text-primary' : ''}`}
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            {totalPages}
          </button>

          {/* Next Page */}
          <button className={`${commonClasses} text-2xl ${currentPage === totalPages ? ' text-slate-300 cursor-no-drop hover:bg-transparent hover:text-slate-300' : 'text-primary'}`}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <MdKeyboardArrowRight />
          </button>

          {/* Last Page */}
          {/* <button className={`${commonClasses} text-lg`}
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <MdKeyboardDoubleArrowRight />
          </button> */}
        </div>
      }
    </>
  );
};

export default Pagination;
