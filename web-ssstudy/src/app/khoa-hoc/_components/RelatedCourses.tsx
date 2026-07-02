"use client";

import Link from "next/link";
import { ResponsiveImageFrame } from "@/components/ui/responsive-image-frame";

interface RelatedCourse {
  id: string;
  title: string;
  teacher: string;
  image: string;
  originalPrice: number;
  salePrice: number;
  alias?: string;
}

interface RelatedCoursesProps {
  courses: RelatedCourse[];
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

export default function RelatedCourses({ courses }: RelatedCoursesProps) {
  if (!Array.isArray(courses) || courses.length === 0) return null;
  const displayedCourses = courses.slice(0, 4);

  return (
    <div className="related-courses-section relative w-full">
      <h2 className="section-title">Khóa học liên quan</h2>

      <div className="related-courses-grid overflow-x-auto scrollbar-hide">
        {displayedCourses.map((course) => (
          <Link
            key={course.id}
            href={`/khoa-hoc/${course.id}`}
            className="related-course-card"
          >
            <ResponsiveImageFrame
              src={course.image}
              alt={course.title}
              className="related-course-image"
              imageClassName="related-course-image__media"
            />
            <div className="related-course-info text-center">
              <h3 className="font-semibold text-base mb-1">{course.title}</h3>
              {course.teacher && (
                <p className="teacher-name text-sm text-gray-500 mb-2">
                  {course.teacher}
                </p>
              )}
              <div className="related-course-price flex justify-center gap-2 text-sm">
                <span className="price-sale text-red-500 font-medium">
                  {formatPrice(course.salePrice)}
                </span>
                <span className="price-original line-through text-gray-400">
                  {formatPrice(course.originalPrice)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
