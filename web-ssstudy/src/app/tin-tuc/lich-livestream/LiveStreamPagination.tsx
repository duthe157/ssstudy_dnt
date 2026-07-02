'use client';

import ReactPaginate from "react-paginate";

interface LiveStreamPaginationProps {
  pageCount: number;
  onPageChange: (event: { selected: number }) => void;
}

export default function LiveStreamPagination({ pageCount, onPageChange }: LiveStreamPaginationProps) {
  return (
    <div className="col-span-full flex justify-center mt-8">
      <ReactPaginate
        previousLabel={'←'}
        nextLabel={'→'}
        breakLabel={'...'}
        pageCount={pageCount}
        marginPagesDisplayed={2}
        pageRangeDisplayed={3}
        onPageChange={onPageChange}
        containerClassName={'pagination flex space-x-2'}
        activeClassName={'bg-blue-500 text-white'}
        pageClassName={'px-3 py-1 border rounded'}
        previousClassName={'px-3 py-1 border rounded'}
        nextClassName={'px-3 py-1 border rounded'}
        breakClassName={'px-3 py-1'}
        disabledClassName={'opacity-50 cursor-not-allowed'}
      />
    </div>
  );
}
