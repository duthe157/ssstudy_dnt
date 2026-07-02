// src/components/paginate-grid/paginate-grid.tsx

import { Pagination } from 'antd';
import React from 'react';

interface PaginateGridProps<T> {
  data: T[];
  total: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  renderItem: (item: T, idx: number) => React.ReactNode;
}

export function PaginateGrid<T>(props: PaginateGridProps<T>) {
  const { data, total, currentPage, pageSize, renderItem, onPageChange } =
    props;
  return (
    <>
      {data.length ? (
        <div className="flex flex-col items-center">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            {data.length ? data.map(renderItem) : ''}
          </div>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={total}
            onChange={onPageChange}
            showSizeChanger={false}
          />
        </div>
      ) : (
        <div></div>
      )}
    </>
  );
}
