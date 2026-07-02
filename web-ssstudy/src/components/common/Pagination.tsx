'use client';
import { useState } from 'react';

interface PaginationProps {
  totalPages: number;
  initialPage?: number;
  onPageChange?: (page: number) => void;
}

export default function Pagination({
  totalPages,
  initialPage = 1,
  onPageChange,
}: PaginationProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    onPageChange?.(page);
  };

  const getPages = (): (number | string)[] => {
    const pages: (number | string)[] = [];

    if (totalPages <= 6) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1); // Always show first
    if (currentPage > 2) {
      pages.push(2); // Show second if we're beyond page 2
    }

    if (currentPage > 3) {
      pages.push('...');
    }

    // Middle section
    const middlePages = [currentPage];
    if (currentPage + 1 < totalPages - 1) {
      middlePages.push(currentPage + 1);
    }
    for (const p of middlePages) {
      if (!pages.includes(p)) pages.push(p);
    }

    if (currentPage + 2 < totalPages - 1) {
      pages.push('...');
    }

    pages.push(totalPages - 1, totalPages); // Always show last two

    return pages.filter((v, i, self) => self.indexOf(v) === i); // remove duplicates
  };

  return (
    <div className="flex justify-center py-4 space-x-2 text-sm text-gray-600">
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-2 py-1 rounded hover:bg-gray-100 disabled:text-gray-300"
      >
        &lt;
      </button>

      {getPages().map((page, index) =>
        page === '...' ? (
          <span key={index} className="px-2 py-1 text-gray-400">...</span>
        ) : (
          <button
            key={index}
            onClick={() => goToPage(Number(page))}
            className={`px-4 py-2 rounded ${
              currentPage === page
                ? 'bg-[#4F7DD9] text-white'
                : 'hover:bg-gray-100 #6C7086'
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-2 py-1 rounded hover:bg-gray-100 disabled:text-gray-300"
      >
        &gt;
      </button>
    </div>
  );
}
