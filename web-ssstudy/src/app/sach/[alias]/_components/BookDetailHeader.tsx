// BookDetailHeader.tsx - Header chính của trang chi tiết

import Link from "next/link";
import { BookDetailData } from "./types";
import { formatUpdateDate, formatNumber } from "./utils";

interface BookDetailHeaderProps {
  book: BookDetailData;
}

export default function BookDetailHeader({ book }: BookDetailHeaderProps) {
  const studentCount = book.stats.studentCount;
  const hasStudentCount =
    typeof studentCount === "number" && !Number.isNaN(studentCount);

  return (
    <header className="book-detail-header">
      {/* Tiêu đề */}
      <h1 className="book-title">{book.name}</h1>

      {/* Tác giả */}
      <div className="book-author">
        <Link href={book.teacher.url} className="author-link">
          {book.teacher.name}
        </Link>
      </div>

      {/* Mô tả ngắn */}
      {book.shortDescription && (
        <p className="book-short-description" dangerouslySetInnerHTML={{ __html: book.shortDescription }} />
      )}

      {/* Khóa học section */}
      {book.relatedCourse && (
        <div className="book-course-section">
          <span className="course-label">Khóa học</span>
          <Link href={book.relatedCourse.url} className="course-link">
            <img
              src={book.relatedCourse.thumbnail}
              alt={book.relatedCourse.name}
              className="course-thumbnail"
            />
            <span className="course-name">{book.relatedCourse.name}</span>
            <svg
              className="course-arrow"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 12L10 8L6 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      )}

      {/* Update & Student Count */}
      {(book.stats.lastUpdate || hasStudentCount) && (
        <div className="book-meta-info">
          {book.stats.lastUpdate && (
            <div className="meta-item">
              <img
                src="/icon/ic_lich.svg"
                alt="Calendar"
                className="meta-icon"
              />
              <span className="text-blue-600">
                {formatUpdateDate(book.stats.lastUpdate)}
              </span>
            </div>
          )}
          {hasStudentCount && (
            <div className="meta-item">
              <img
                src="/icon/ic_hoc sinh.svg"
                alt="Students"
                className="meta-icon"
              />
              <span>{formatNumber(studentCount)} Sách đã bán</span>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
