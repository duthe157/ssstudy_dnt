"use client";

import React from "react";
import Link from "next/link";
// Helper function to format update date
const formatUpdateDate = (dateString: string): string => {
  const date = new Date(dateString);
  const month = date.toLocaleDateString("vi-VN", { month: "long" });
  const year = date.getFullYear();
  return `Cập nhật vào ${month} năm ${year}`;
};

interface CourseData {
  id: string;
  title: string;
  description?: string;
  teacher?: string;
  teacherAvatar?: string;
  updatedAt?: string;
  studentOwned?: number;
}

interface CourseHeaderProps {
  course: CourseData;
}

export default function CourseHeader({ course }: CourseHeaderProps) {
  const studentCount = course.studentOwned;
  const hasStudentCount =
    typeof studentCount === "number" &&
    !Number.isNaN(studentCount) &&
    studentCount > 0;

  return (
    <header className="book-detail-header">
      {/* Tiêu đề */}
      <h1 className="book-title">{course.title}</h1>

      {/* Giáo viên */}
      {course.teacher && (
        <div className="book-author">
          <Link href={`/giao-vien/${course.teacher}`} className="author-link">
            {course.teacher}
          </Link>
        </div>
      )}

      {/* Mô tả ngắn */}
      {course.description && (
        <div
          className="book-short-description"
          dangerouslySetInnerHTML={{ __html: course.description }}
        />
      )}

      {/* Update & Student Count */}
      {(course.updatedAt || hasStudentCount) && (
        <div className="book-meta-info">
          {course.updatedAt && (
            <div className="meta-item">
              <img
                src="/icon/ic_lich.svg"
                alt="Calendar"
                className="meta-icon"
              />
              <span className="text-blue-600">
                {formatUpdateDate(course.updatedAt)}
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
              <span>
                {studentCount.toLocaleString("vi-VN")} học viên đã học
              </span>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
