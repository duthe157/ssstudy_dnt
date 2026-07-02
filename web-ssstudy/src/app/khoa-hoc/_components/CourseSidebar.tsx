"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { RootContext } from "@/contexts/RootContext";
import { useRouter } from "next/navigation";
import { SmartImage } from "@/components/ui/smart-image";
import CoursePurchaseCard from "./CoursePurchaseCard";
import { ResponsiveImageFrame } from "@/components/ui/responsive-image-frame";
import { CDN_LINK } from "@/utils/constants";

interface AttachedCourse {
  _id: string;
  name?: string;
  title?: string;
  course_name?: string;
  alias: string;
  code: string;
  subject: {
    id: string;
    name: string;
  };
  group: {
    id: string;
    name: string;
  };
  price: number;
  origin_price: number;
  teacher: string;
  teacher_id: string;
  teacher_alias: string;
  num_student: number;
  is_featured: boolean;
  status: boolean;
  created_at: string;
  updated_at: string;
  time_course?: {
    opening_date: string;
    closing_date: string;
  };
  banner?: string;
}

// interface CourseData { ... }
interface CourseData {
  id: string;
  title: string;
  description: string;
  image: string;
  teacher?: string;
  teacherAvatar?: string;
  price?: number;
  originPrice?: number;
  subject?: string;
  group?: string;
  code?: string;
  alias?: string;
  timeCourse?: {
    opening_date: string;
    closing_date: string;
  };
  content?: string;
  updatedAt?: string;
  numStudent?: number;
  classroomAttached?: AttachedCourse[];
  // NEW
  promotion?: {
    from_date?: string | null;
    to_date?: string | null;
    type?: string;
    hour?: number;
    note?: string;
  };
  includes?: Array<{ id: number | string; text: string; icon: number }>;
  highlightInformations?: Array<{ id: number | string; text: string }>;
  studentOwned?: number;
  isJoined?: boolean; // Field từ API classroom-view để check user đã tham gia khóa học
}

interface CourseSidebarProps {
  courseData?: CourseData;
}

interface StoredUser {
  user_group?: string;
}

function getIsAdminUser() {
  if (typeof window === "undefined") return false;

  try {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return false;

    const user = JSON.parse(storedUser) as StoredUser;
    return user.user_group === "ADMIN";
  } catch {
    return false;
  }
}

/**
 * Component sidebar thông tin khóa học (cột bên phải)
 */
function CourseSidebarInternal({ courseData }: CourseSidebarProps) {
// export default function CourseSidebar({ courseData }: CourseSidebarProps) {
  const rootContext = useContext(RootContext);
  // Sử dụng dữ liệu thực hoặc mock data
  const displayData = courseData
    ? {
        title: courseData.title,
        originalPrice: courseData.originPrice || 0,
        currentPrice: courseData.price || 0,
        discount:
          courseData.originPrice && courseData.price
            ? Math.round(
                ((courseData.originPrice - courseData.price) /
                  courseData.originPrice) *
                  100
              )
            : 0,
        timeLeft: "06:00:37", // Mock time
        registrationDeadline: courseData.timeCourse?.closing_date
          ? new Date(courseData.timeCourse.closing_date).toLocaleDateString(
              "vi-VN"
            )
          : "15/3/2025",
        image: courseData.image,
        features: [
          "12 Chuyên đề",
          "120 Bài học",
          "Hỗ trợ 24/7",
          "Chứng chỉ hoàn thành",
        ],
        schedule: [
          ...(courseData.timeCourse?.opening_date
            ? [
                {
                  day: "Ngày khai giảng",
                  date: new Date(
                    courseData.timeCourse.opening_date
                  ).toLocaleDateString("vi-VN"),
                },
              ]
            : []),
          ...(courseData.timeCourse?.closing_date
            ? [
                {
                  day: "Ngày kết thúc",
                  date: new Date(
                    courseData.timeCourse.closing_date
                  ).toLocaleDateString("vi-VN"),
                },
              ]
            : []),
        ],
        gifts: ["Tài liệu PDF", "Video bài giảng", "Hỗ trợ học tập"],
      }
    : {};

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  function handleAddCartClick() {
    if (!rootContext?.handleAddCart) return;

    const itemId =
      courseData?.id ??
      (courseData as any)?._id ??
      courseData?.alias ??
      courseData?.code ??
      "";

    if (!String(itemId).trim()) return;

    const rawPrice = Number(
      courseData?.price ?? (displayData as any)?.currentPrice ?? 0
    );
    const price = Number.isNaN(rawPrice) ? 0 : rawPrice;

    const payload = {
      item_id: String(itemId),
      name:
        courseData?.title ?? (displayData as any)?.title ?? "Khóa học không tên",
      price,
      qty: 1,
      type: "CLASSROOM",
      image: courseData?.image ?? (displayData as any)?.image ?? "",
    };

    void rootContext.handleAddCart(payload);
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Course Image */}
      <div className="relative w-full aspect-[279/210] overflow-hidden bg-gray-50">
        <SmartImage
          src={displayData.image || "/imgs/logo.png"}
          alt={displayData.title || "Khóa học"}
          fill
        />
        {/* <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
          🎥 LIVESTREAM TOÀN TỈ
        </div> */}
      </div>

      {/* Course Info */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-3 leading-tight">
          {displayData.title}
        </h3>

        {/* Price */}
        <div className="mb-4">
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-red-600">
              {formatPrice(displayData.currentPrice || 0)}đ
            </span>
            {displayData.originalPrice > 0 && (
              <span className="text-gray-400 line-through text-sm">
                {formatPrice(displayData.originalPrice)}đ
              </span>
            )}
            {displayData.discount > 0 && (
              <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-medium">
                Giảm {displayData.discount}%
              </span>
            )}
          </div>
          <div className="flex items-center mt-2 text-sm text-red-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            Kết thúc sau 8 Ngày: {displayData.timeLeft}
          </div>
          {courseData.promotion?.note && (
            <div className="text-sm text-gray-600 mt-1">
              {courseData.promotion.note}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-4">
          <button
            className="flex-[2] border-2 border-blue-600 text-blue-600 bg-white py-3 rounded-md font-bold hover:bg-blue-50 transition-colors flex items-center justify-center text-sm"
            onClick={handleAddCartClick}
          >
            <Image
              src="/icon/icon-cart.png"
              alt="Giỏ hàng"
              width={20}
              height={20}
              className="mr-2"
            />
            Thêm vào giỏ hàng
          </button>
          <button className="flex-[1] bg-red-600 text-white py-3 rounded-md font-bold hover:bg-red-700 transition-colors text-sm">
            Mua ngay
          </button>
        </div>

        {/* Attached Courses List */}
        {courseData?.classroomAttached &&
        courseData.classroomAttached.length > 0 ? (
          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-3">
              Khóa học trong combo ({courseData.classroomAttached.length} khóa
              học)
            </h4>
            <ul className="space-y-2">
              {courseData.classroomAttached.map((course: AttachedCourse) => (
                <li
                  key={course._id}
                  className="flex items-start text-sm text-gray-600"
                >
                  <Image
                    src="/icon/book.svg"
                    alt="Khóa học"
                    width={16}
                    height={16}
                    className="mr-2 mt-0.5 flex-shrink-0"
                  />
                  <span className="leading-relaxed">
                    {course.name ||
                      course.title ||
                      course.course_name ||
                      "Tên khóa học không có"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Component hiển thị thông tin khóa học đã mua
 */
function CourseOwnedCard({ courseData }: CourseSidebarProps) {
  const router = useRouter();
  
  const imageUrl = courseData?.image
    ? (courseData.image.startsWith("http")
        ? courseData.image
        : `${CDN_LINK}${courseData.image}`)
    : "/imgs/logo.png";

  const handleStartLearning = () => {
    if (courseData?.id) {
      router.push(`/lesson/${courseData.id}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Course Image */}
      <div className="relative w-full aspect-[279/210] overflow-hidden bg-gray-50">
        <ResponsiveImageFrame
          src={imageUrl}
          alt={courseData?.title || "Khóa học"}
          className="purchase-card-image"
          imageClassName="purchase-card-image"
        />
      </div>

      {/* Course Info */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-4 leading-tight">
          {courseData?.title || "Khóa học"}
        </h3>

        {/* Status Badge */}
        <div className="mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Đã tham gia khóa học
          </span>
        </div>

        {/* Action Button */}
        <button
          onClick={handleStartLearning}
          className="w-full bg-blue-600 text-white py-3 rounded-md font-bold hover:bg-blue-700 transition-colors flex items-center justify-center text-sm mb-4"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Bắt đầu bài học
        </button>

        {/* Course Info */}
        {courseData?.timeCourse && (
          <div className="border-t border-gray-200 pt-4 space-y-2">
            {courseData.timeCourse.opening_date && (
              <div className="flex items-center text-sm text-gray-600">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>
                  Khai giảng:{" "}
                  {new Date(courseData.timeCourse.opening_date).toLocaleDateString("vi-VN")}
                </span>
              </div>
            )}
            {courseData.timeCourse.closing_date && (
              <div className="flex items-center text-sm text-gray-600">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>
                  Kết thúc:{" "}
                  {new Date(courseData.timeCourse.closing_date).toLocaleDateString("vi-VN")}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Attached Courses List */}
        {courseData?.classroomAttached &&
        courseData.classroomAttached.length > 0 ? (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <h4 className="font-semibold text-gray-800 mb-3">
              Khóa học trong combo ({courseData.classroomAttached.length} khóa
              học)
            </h4>
            <ul className="space-y-2">
              {courseData.classroomAttached.map((course: AttachedCourse) => (
                <li
                  key={course._id}
                  className="flex items-start text-sm text-gray-600"
                >
                  <svg
                    className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  <span className="leading-relaxed">
                    {course.name ||
                      course.title ||
                      course.course_name ||
                      "Tên khóa học không có"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function CourseSidebar({ courseData }: CourseSidebarProps) {
  const purchaseCardRef = useRef<HTMLDivElement>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(getIsAdminUser());
  }, []);
  
  // Check if user has enrolled/purchased the course
  // Ưu tiên dùng isJoined từ API classroom-view, fallback về studentOwned
  const isOwned = courseData?.isJoined === true || 
    (courseData?.studentOwned != null && courseData.studentOwned > 0);

  // Admins can access the owned-course UI even when they have not purchased it.
  if (isOwned || isAdmin) {
    return <CourseOwnedCard courseData={courseData} />;
  }

  // Default: show purchase card for non-owners
  return (
    <CoursePurchaseCard
      courseData={courseData}
      purchaseCardRef={purchaseCardRef}
    />
  );
}
