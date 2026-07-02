"use client";

import { Book, TeacherItem } from "@/types/book";
import Link from "next/link";
import { SmartImage } from "@/components/ui/smart-image";

interface BookCardProps {
  book: Book;
  teachers: TeacherItem[];
  noShadow?: boolean;
}

export default function BookCard({
  book,
  teachers,
  noShadow = false,
}: BookCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatOriginalPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const hasDiscount = book.origin_price > book.price;

  // Lấy tên giáo viên từ teacher_id
  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find((t) => t._id === teacherId);
    return teacher ? teacher.fullname : "Giáo viên";
  };

  return (
    <Link href={`/sach-id/${book._id}`} className="group">
      <div
        className={`bg-white rounded-lg border overflow-hidden transition-all duration-200 ${
          noShadow ? "" : "shadow-sm hover:shadow-lg hover:-translate-y-1"
        }`}
      >
        {/* Book Image */}
        <div className="relative w-full aspect-[279/210] bg-gray-100 overflow-hidden flex items-center justify-center">
          {book.image ? (
            <SmartImage
              src={book.image}
              alt={book.name}
              width={279}
              height={210}
              className="group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg
                className="w-16 h-16"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}

          {/* Featured Badge */}
          {/* {book.is_featured && (
            <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
              Nổi bật
            </div>
          )} */}

          {/* Stock Status */}
          {/* {book.stock_status === 'OUT_OF_STOCK' && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-semibold">Hết hàng</span>
            </div>
          )} */}
        </div>

        {/* Book Content */}
        <div className="p-4">
          {/* Book Title */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {book.name}
          </h3>

          {/* Subject and Category */}
          {/* <div className="flex items-center gap-2 mb-2">
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {book.subject.name}
            </span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {book.category.name}
            </span>
          </div> */}

          {/* Teacher Name */}
          <div className="mb-2">
            <span className="text-sm text-gray-600">
              <span className="font-medium">Giáo viên:</span>{" "}
              {getTeacherName(book.teacher_id)}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-red-600">
              {formatPrice(book.price)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                {formatOriginalPrice(book.origin_price)}
              </span>
            )}
          </div>

          {/* Stock Info */}
          {/* <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Còn lại: {book.quantity} quyển</span>
            {book.level && (
              <span>Lớp {book.level}</span>
            )}
          </div> */}

          {/* Action Button */}
          {/* <button
            className={`w-full mt-3 py-2 px-4 rounded-lg font-medium transition-colors ${
              book.stock_status === 'IN_STOCK'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={book.stock_status === 'OUT_OF_STOCK'}
          >
            {book.stock_status === 'IN_STOCK' ? 'Xem chi tiết' : 'Hết hàng'}
          </button> */}
        </div>
      </div>
    </Link>
  );
}
