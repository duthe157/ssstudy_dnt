"use client";

import React, { useMemo, useRef, useState, useContext, useEffect } from "react";
import Breadcrumb from "@/components/ui/breadcrumb";
import CourseHeader from "./CourseHeader";
import CourseHighlightsGrid from "./CourseHighlightsGrid";
import CourseTabs from "./CourseTabs";
import CourseSidebar from "./CourseSidebar";
import CoursePurchaseCard from "./CoursePurchaseCard";
import CourseDataProvider from "./CourseDataProvider";
import RelatedCourses from "./RelatedCourses";
import { CDN_LINK } from "@/utils/constants";
import { RootContext } from "@/contexts/RootContext";
import { useRouter } from "next/navigation";
import MobilePurchaseButtons from "@/components/common/MobilePurchaseButtons";
import { ResponsiveImageFrame } from "@/components/ui/responsive-image-frame";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { authService } from "@/services/authService";

interface AttachedCourse {
  _id: string;
  name?: string;
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
  bookAttached?: any[];
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
  isJoined?: boolean;
}

interface RelatedCourse {
  id: string;
  title: string;
  teacher: string;
  image: string;
  originalPrice: number;
  salePrice: number;
  alias?: string;
}

interface CourseDetailClientProps {
  courseId: string;
  courseData?: CourseData; // Optional since we're fetching fresh data
}

/**
 * Component con để render course detail content
 * Tách ra để có thể sử dụng hooks đúng cách
 */
function CourseDetailContent({
  courseId,
  courseData,
}: {
  courseId: string;
  courseData: CourseData & { relatedCourses?: RelatedCourse[] };
}) {
  const router = useRouter();
  const rootContext = useContext(RootContext);
  const purchaseCardRef = useRef<HTMLDivElement>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  const price = Number(courseData.price) || 0;
  const imageUrl = useMemo(() => {
    const img = courseData.image;
    if (!img) return "/imgs/logo.png";
    const s = String(img).replace(/[`"]/g, "").trim();
    return s.startsWith("http") ? s : `${CDN_LINK}${s}`;
  }, [courseData.image]);

  const handleAddToCart = async () => {
    if (!rootContext?.handleAddCart || isAddingToCart) return;

    setIsAddingToCart(true);
    try {
      await rootContext.handleAddCart({
        item_id: String(courseData.id || ""),
        name: courseData.title || "",
        price,
        qty: 1,
        type: "CLASSROOM",
        image: imageUrl,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!rootContext?.handleAddCart || isBuyingNow || !courseData) return;
    setIsBuyingNow(true);
    try {
      await rootContext.handleAddCart({
        item_id: String(courseData.id),
        name: courseData.title,
        price,
        qty: 1,
        type: "CLASSROOM",
        image: imageUrl,
      });
      router.push("/gio-hang");
    } catch (error) {
      console.error("Error buying now:", error);
    } finally {
      setIsBuyingNow(false);
    }
  };

  // Get teacher object from courseData
  const teacher = (courseData as any).teacherObject || null;

  const highlightsList = useMemo(() => {
    return Array.isArray(courseData.highlightInformations)
      ? courseData.highlightInformations
          .map((item, index) => {
            const text = (item?.text || (item as any)?.title || "").trim();
            if (!text) return null;
            const id = item?.id ?? `${index}`;
            return { id: String(id), text };
          })
          .filter((item): item is { id: string; text: string } => Boolean(item))
      : [];
  }, [courseData.highlightInformations]);
  const isOwned = courseData?.isJoined === true || 
    (courseData?.studentOwned != null && courseData.studentOwned > 0);

  return (
    <div className="course-detail-container">
      <div className="course-detail-layout">
        <div className="course-detail-content">
          <Breadcrumb
            items={[
              { label: "Trang chủ", href: "/" },
              { label: "Khóa học", href: "/khoa-hoc" },
              { label: courseData.title },
            ]}
          />
          {/* Mobile-only product image: shown below breadcrumb, above header */}
          <div className="xl:hidden mobile-product-image-wrapper">
            <ResponsiveImageFrame
              src={imageUrl}
              alt={courseData.title}
              className="purchase-card-image"
              imageClassName="purchase-card-image"
            />
          </div>
          <CourseHeader course={courseData} />
          {/* Mobile-only purchase card: shown below header and above highlights */}
          <div className="purchase-card-mobile" ref={purchaseCardRef}>
            <CoursePurchaseCard
              courseData={courseData}
              purchaseCardRef={purchaseCardRef}
            />
          </div>
          {highlightsList.length > 0 && (
            <CourseHighlightsGrid highlights={highlightsList} />
          )}
          <CourseTabs
            courseId={courseId}
            courseData={courseData}
            teacher={teacher}
          />
        </div>
        <aside className="course-detail-sidebar">
          <CourseSidebar courseData={courseData} />
        </aside>
      </div>
      {/* Khóa học liên quan dưới cùng */}
      {Array.isArray(courseData.relatedCourses) &&
        courseData.relatedCourses.length > 0 && (
          <RelatedCourses courses={courseData.relatedCourses} />
        )}

      {/* Mobile Bottom Nav - Fixed at bottom */}
      <div className="detail-mobile-bottom-nav">
        <MobileBottomNav />
      </div>

      {/* Mobile Purchase Buttons - Above bottom nav */}
      <MobilePurchaseButtons
        itemId={courseData.id}
        itemName={courseData.title}
        price={price}
        image={imageUrl}
        type="CLASSROOM"
        isAddingToCart={isAddingToCart}
        isBuyingNow={isBuyingNow}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        isOwned={isOwned}
        courseId={courseId}
      />
    </div>
  );
}

/**
 * Component client chính cho trang chi tiết khóa học
 * Layout 2 cột: 2/3 nội dung chính, 1/3 sidebar
 */
export default function CourseDetailClient({
  courseId,
}: CourseDetailClientProps) {

  return (
    <CourseDataProvider courseId={courseId}>
      {(freshCourseData) => (
        <CourseDetailContent courseId={courseId} courseData={freshCourseData} />
      )}
    </CourseDataProvider>
  );
}
