"use client";

import { useContext } from "react";
import Image from "next/image";
import { RootContext } from "@/contexts/RootContext";
import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import { SmartImage } from "@/components/ui/smart-image";
import CoursePurchaseCard from "./BookIdCoursePurchaseCard";
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
  includes?: Array<{ id: number | string; text: string; icon: number; title?: string }>;
  highlightInformations?: Array<{ id: number | string; text: string }>;
  studentOwned?: number;
  isJoined?: boolean;
  activationDate?: string | null;
  expiredDate?: string | null;
  totalExtendedMonths?: number;
  extendTimes?: number;
}

interface CourseSidebarProps {
  courseData?: CourseData;
  onActivate?: () => void;
  bookAlias?: string;
}

/**
 * Component sidebar thông tin khóa học (cột bên phải)
 */
function CourseSidebarInternal({ courseData, onActivate, bookAlias }: CourseSidebarProps) {
// export default function CourseSidebar({ courseData }: CourseSidebarProps) {
  const router = useRouter();
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
    : {
        title: "",
        originalPrice: 0,
        currentPrice: 0,
        discount: 0,
        timeLeft: "",
        registrationDeadline: "",
        image: "",
        features: [] as string[],
        schedule: [] as { day: string; date: string }[],
        gifts: [] as string[],
      };

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
    <div className="bg-white rounded-lg shadow-md overflow-visible">
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
          {courseData?.promotion?.note && (
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
          <button 
            className="flex-[1] bg-red-600 text-white py-3 rounded-md font-bold hover:bg-red-700 transition-colors text-sm"
            onClick={() => router.push(`/sach-id/${bookAlias}`)}
          >
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
export function CourseOwnedCard({
  courseData,
  onActivate,
}: CourseSidebarProps) {
  const router = useRouter();
  
  const imageUrl = courseData?.image
    ? (courseData.image.startsWith("http")
        ? courseData.image
        : `${CDN_LINK}${courseData.image}`)
    : "/imgs/logo.png";

  const handleStartLearning = () => {
    if (courseData?.id) {
      router.push(`/lesson/${courseData.id}?isSearchId=true`);
    }
  };


  const graceEndDate = React.useMemo(() => {
    if (!courseData?.expiredDate) return null;
    const expiry = new Date(courseData.expiredDate);
    const d = new Date(expiry);
    const monthsToAdd = typeof courseData.totalExtendedMonths === 'number' 
      ? courseData.totalExtendedMonths 
      : 3;
    d.setMonth(expiry.getMonth() + monthsToAdd);
    return d;
  }, [courseData?.expiredDate, courseData?.totalExtendedMonths]);

  const isInGracePeriod = React.useMemo(() => {
    if (!courseData?.expiredDate || !graceEndDate) return false;

    const now = new Date();
    const expiry = new Date(courseData.expiredDate);
    
    // Normalize to date only for comparison
    const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const expiryDay = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate()).getTime();

    // 1. Xét ngày hết hạn trước: Nếu chưa hết hạn thì chưa thể gia hạn (vẫn đang học bình thường)
    if (nowDay < expiryDay) return false;

    // 2. Nếu đã hết hạn (nowDay >= expiryDay), xét số lần gia hạn
    // Nếu không còn lượt gia hạn (extendTimes === 0) thì không có thời gian ân hạn để gia hạn
    if (courseData?.extendTimes === 0) return false;

    const graceEndDay = new Date(graceEndDate.getFullYear(), graceEndDate.getMonth(), graceEndDate.getDate()).getTime();
    
    // Đang trong thời gian ân hạn nếu đã qua ngày hết hạn nhưng chưa quá ngày kết thúc ân hạn
    return nowDay <= graceEndDay;
  }, [courseData?.expiredDate, graceEndDate, courseData?.extendTimes]);

  const handleAction = () => {
    if (isInGracePeriod) {
      if (onActivate) onActivate();
    } else {
      handleStartLearning();
    }
  };

  // Mapping icon index từ admin sang component icon
  const getIconByIndex = (index: number | string | undefined) => {
    const iconIndex = typeof index === "number" ? index : Number(index) || -1;

    const iconMap: Record<number, React.ReactNode> = {
      0: <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path d="M9 4.804A7.994 7.994 0 002 12a8 8 0 008 8 8 8 0 008-8 7.994 7.994 0 00-7-7.196V4a1 1 0 00-2 0v.804z"></path></svg>,
      1: <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path></svg>,
      2: <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"></path></svg>,
      3: <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path></svg>,
    };

    return iconMap[iconIndex] || <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path></svg>;
  };

  const includesList = React.useMemo(() => {
    return Array.isArray(courseData?.includes)
      ? courseData!.includes
          .map((item, index) => {
            const text = (item?.text || item?.title || "").trim();
            if (!text) return null;
            const id = item?.id ?? `${index}`;
            const iconIndex = item?.icon ?? -1;
            return { id: String(id), text, iconIndex };
          })
          .filter(
            (item): item is { id: string; text: string; iconIndex: number } =>
              Boolean(item)
          )
      : [];
  }, [courseData?.includes]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-visible">
      {/* Course Image */}
      <div className="relative w-full aspect-[279/210] overflow-hidden bg-gray-50 border-b border-gray-100">
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

        {/* Khóa học này bao gồm */}
        {includesList.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold text-[15px] text-gray-800 mb-3">
              Khóa học này bao gồm
            </h3>
            <ul className="space-y-3">
              {includesList.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 text-[14px] text-gray-700 font-medium"
                >
                  {getIconByIndex(item.iconIndex)}
                  <span className="leading-tight">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleAction}
          className={`w-full ${isInGracePeriod ? "bg-[#F03E3E] hover:bg-[#d63535]" : "bg-[#235CD0] hover:bg-[#1e4eb3]"} text-white py-3 rounded-md font-bold transition-colors flex items-center justify-center text-[14px] mb-4 tracking-wide`}
        >
          {isInGracePeriod ? "Gia hạn" : "Bắt đầu vào học"}
        </button>

        {/* Subscription Info */}
        {(courseData?.activationDate || courseData?.expiredDate) && (
          <div className="mb-0 space-y-1">
            {courseData.activationDate && (
              <div className="text-[14px] text-gray-700 font-medium">
                Ngày đăng ký: <span className="font-semibold">{new Date(courseData.activationDate).toLocaleDateString("vi-VN")}</span>
              </div>
            )}
            {courseData.expiredDate && (
              <div className="text-[14px] text-gray-700 font-medium">
                Ngày hết hạn: <span className="text-[#F14646] font-semibold">{new Date(courseData.expiredDate).toLocaleDateString("vi-VN")}</span>
              </div>
            )}
            {isInGracePeriod && graceEndDate && (
              <div className="text-[14px] text-gray-700 font-medium">
                Ngày hết hạn gia hạn: <span className="text-[#F14646] font-semibold">{graceEndDate.toLocaleDateString("vi-VN")}</span>
              </div>
            )}
          </div>
        )}

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

export default function CourseSidebar({ courseData, onActivate, bookAlias }: CourseSidebarProps) {
  const purchaseCardRef = useRef<HTMLDivElement>(null);
  
  // Check if it's fully expired (past grace period)
  const isFullyExpiredVar = React.useMemo(() => {
    if (!courseData?.expiredDate) return false;

    const now = new Date();
    const expiry = new Date(courseData.expiredDate);
    
    // Normalize to date only for comparison
    const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const expiryDay = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate()).getTime();

    // 1. Xét ngày hết hạn trước: Nếu chưa tới ngày hết hạn thì chưa hết hạn hoàn toàn
    if (nowDay < expiryDay) return false;

    // 2. Nếu đã hết hạn (nowDay >= expiryDay), xét số lần gia hạn
    // Nếu hết lượt gia hạn (extendTimes === 0) thì hết hạn hoàn toàn ngay lập tức
    if (courseData?.extendTimes === 0) return true;

    // 3. Nếu còn lượt gia hạn (extendTimes > 0), xét số tháng được gia hạn (thời gian ân hạn)
    const graceEndDate = new Date(expiry);
    const monthsToAdd = typeof courseData.totalExtendedMonths === 'number' 
      ? courseData.totalExtendedMonths 
      : 3;
    graceEndDate.setMonth(expiry.getMonth() + monthsToAdd);
    
    const graceEndDay = new Date(graceEndDate.getFullYear(), graceEndDate.getMonth(), graceEndDate.getDate()).getTime();

    return nowDay > graceEndDay;
  }, [courseData?.expiredDate, courseData?.totalExtendedMonths, courseData?.extendTimes]);

  // Check if user has enrolled/purchased the course
  // Ưu tiên dùng isJoined từ API classroom-view, fallback về studentOwned
  const isOwned = !isFullyExpiredVar && (courseData?.isJoined === true || 
    (courseData?.studentOwned != null && courseData.studentOwned > 0));

  // Render different UI based on ownership status
  if (isOwned) {
    return <CourseOwnedCard courseData={courseData} onActivate={onActivate} />;
  }

  // Default: show purchase card for non-owners
  return (
    <CoursePurchaseCard
      courseData={{
        ...courseData,
        isFullyExpired: isFullyExpiredVar,
      } as any}
      purchaseCardRef={purchaseCardRef}
      onActivate={onActivate}
      bookAlias={bookAlias}
    />
  );
}
