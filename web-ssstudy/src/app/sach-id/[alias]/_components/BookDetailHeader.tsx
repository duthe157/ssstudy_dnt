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
      {((book.relatedCourse) || (book.relatedCourses && book.relatedCourses.length > 0)) && (
        <div className="book-courses-section">
          <span className="courses-label">Khóa học</span>
          <div className="courses-list">
            {/* Nếu có 1 khóa học chính, hiển thị nó bằng card mới */}
            {book.relatedCourse && (!book.relatedCourses || book.relatedCourses.length === 0) && (
              <Link
                href={book.relatedCourse.url}
                className="book-header-course-card"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="book-header-course-thumb">
                  <img
                    src={book.relatedCourse.thumbnail}
                    alt={book.relatedCourse.name}
                  />
                </div>
                <span className="book-header-course-name">{book.relatedCourse.name}</span>
                <svg
                  className="book-header-course-arrow"
                  width="20"
                  height="20"
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
            )}

            {/* Nếu có danh sách nhiều khóa học */}
            {book.relatedCourses && book.relatedCourses.length > 0 && 
              book.relatedCourses.map((course) => (
                <Link
                  key={course.id}
                  href={course.url}
                  className="book-header-course-card"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="book-header-course-thumb">
                    <img
                      src={course.thumbnail}
                      alt={course.name}
                    />
                  </div>
                  <span className="book-header-course-name">{course.name}</span>
                  <svg
                    className="book-header-course-arrow"
                    width="20"
                    height="20"
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
              ))
            }
          </div>
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
