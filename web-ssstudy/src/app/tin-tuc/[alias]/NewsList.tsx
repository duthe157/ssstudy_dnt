'use client';
import { useEffect, useState } from 'react';
import ReactPaginate from "react-paginate";
import Link from "next/link";
import BaseHelper from "../../../components/helpers/baseHelper";

interface Category {
  id: string;
  name: string;
}

interface NewsRecord {
  _id: string;
  name: string;
  alias: string;
  description: string;
  external_link: string;
  image: string;
  status: string | boolean | null;
  created_at: string;
  category: Category;
  is_featured: boolean;
}

interface ApiResponse {
  code: number;
  message: string;
  data: {
    perPage: number;
    records: NewsRecord[];
  };
}

export default function NewsList({ category_name, category_alias, posts }: { category_name: string, category_alias: string, posts: any }) {
  const [records, setRecords] = useState<NewsRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5; // 🔹 số bài viết mỗi trang

  // 🔹 Tính toán phân trang
  const offset = currentPage * itemsPerPage;
  const currentItems = posts.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(posts.length / itemsPerPage);

  const handlePageClick = (event: { selected: number }) => {
    setCurrentPage(event.selected);
  };

  return (
    <div className="space-y-4">
      {currentItems.map((item: any) => (
  <div
    key={item._id}
    className="bg-white rounded-lg shadow-sm flex flex-col sm:flex-row overflow-hidden"
  >
    <div className="relative w-full sm:w-[287px] h-[188px] flex-shrink-0">
      <Link href={`${category_alias}/${item.alias}`} target="_blank" rel="noopener noreferrer">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="object-cover w-full h-full cursor-pointer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs cursor-pointer">
            <img
              src="https://w.ladicdn.com/5e5bae5298a7e87bbed7582a/the-gioi-moi-20240328122107-onzj7.png"
              className="object-cover w-full h-full"
              alt={item.name}
            />
          </div>
        )}
      </Link>
    </div>

    <div className="p-4 flex flex-col justify-between">
      <Link href={`${category_alias}/${item.alias}`} target="_blank" rel="noopener noreferrer">
        <h3 className="font-semibold text-gray-800 hover:text-blue-600 cursor-pointer">
          {item.name}
        </h3>
      </Link>

      <p
        className="text-gray-500 text-sm mt-2 line-clamp-3"
        dangerouslySetInnerHTML={{ __html: item.description || '' }}
      />
      <div className="text-xs text-gray-400 mt-2 flex flex-row items-center gap-1">
        <img
          src={'/imgs/tin-tuc/date-time.png'}
          alt=""
          className="object-contain w-3 h-3"
        />
        <span>{new Date(item.created_at).toLocaleDateString('vi-VN')}</span>
      </div>
    </div>
  </div>
))}

      {posts.length === 0 && (
        <div className="text-gray-500 italic">
          Không có bài viết nào thuộc danh mục "{category_name}"
        </div>
      )}

      {/* 🔹 Phân trang */}
      {posts.length > 5 && (
        <ReactPaginate
          previousLabel={"← "}
          nextLabel={" →"}
          breakLabel={"..."}
          pageCount={pageCount}
          onPageChange={handlePageClick}
          forcePage={currentPage}
          containerClassName={"flex justify-center gap-2 mt-6"}
          pageClassName={"px-3 py-1 border rounded"}
          activeClassName={"bg-blue-500 text-white"}
          previousClassName={"px-3 py-1 border rounded"}
          nextClassName={"px-3 py-1 border rounded"}
          disabledClassName={"opacity-50 cursor-not-allowed"}
        />
      )}
    </div>
  );
}
