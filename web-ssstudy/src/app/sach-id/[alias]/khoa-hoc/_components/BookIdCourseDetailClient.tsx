"use client";

import React, { useMemo, useRef, useState, useContext } from "react";
import Breadcrumb from "@/components/ui/breadcrumb";
import CourseHeader from "./BookIdCourseHeader";
import CourseHighlightsGrid from "./BookIdCourseHighlightsGrid";
import CourseTabs from "./BookIdCourseTabs";
import CourseSidebar, { CourseOwnedCard } from "./BookIdCourseSidebar";
import CoursePurchaseCard from "./BookIdCoursePurchaseCard";
import CourseDataProvider from "./BookIdCourseDataProvider";
import RelatedCourses from "./BookIdRelatedCourses";
import { CDN_LINK } from "@/utils/constants";
import { RootContext } from "@/contexts/RootContext";
import { useRouter } from "next/navigation";
import { useRenewCourse } from "@/hooks/useRenewCourse";
import MobilePurchaseButtons from "@/components/common/MobilePurchaseButtons";
import { ResponsiveImageFrame } from "@/components/ui/responsive-image-frame";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/Dialog";
import axios from "axios";
import { bookidService } from "@/services/bookidService";

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
  activationDate?: string | null;
  expiredDate?: string | null;
  totalExtendedMonths?: number;
  extendTimes?: number;
  bookId?: string;
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

interface BookIdCourseDetailClientProps {
  courseId: string;
  bookAlias: string;
  courseData?: CourseData;
}

/**
 * Component con để render course detail content cho sách ID
 */
function BookIdCourseDetailContent({
  courseId,
  bookAlias,
  courseData,
}: {
  courseId: string;
  bookAlias: string;
  courseData: CourseData & { relatedCourses?: RelatedCourse[] };
}) {
  const router = useRouter();
  const rootContext = useContext(RootContext);
  const { handleRenew: renewCourse } = useRenewCourse();
  const purchaseCardRef = useRef<HTMLDivElement>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);
  const [activationCode, setActivationCode] = useState("");
  const [bookIdInput, setBookIdInput] = useState("");
  const [isActivating, setIsActivating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [bookName, setBookName] = useState<string>("");

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch book name for breadcrumb
  React.useEffect(() => {
    if (!bookAlias) return;
    bookidService
      .getBookDetail(bookAlias)
      .then((resp: any) => {
        const root = resp?.data ?? null;
        const data = root?.data?.book ?? root?.book ?? null;
        if (data?.name) {
          setBookName(data.name);
        }
      })
      .catch(() => {});
  }, [bookAlias]);

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

  const handleBuyNow = () => {
    router.push(`/sach-id/${courseData.bookId || bookAlias}`);
  };

  const handleRenew = async () => {
    await renewCourse({
      item_id: courseData.bookId || courseData.id || "",
      name: courseData.title || "",
      price: Number(courseData.price) || 0,
      image: courseData.image,
    });
  };

  const handleActivate = async () => {
    if (!bookIdInput.trim()) {
      import("react-toastify")
        .then(({ toast }) => {
          toast.error("Vui lòng nhập ID sách");
        })
        .catch(() => {});
      return;
    }

    if (!activationCode.trim()) {
      import("react-toastify")
        .then(({ toast }) => {
          toast.error("Vui lòng nhập mã kích hoạt");
        })
        .catch(() => {});
      return;
    }

    if (rootContext?.isLogin === false) {
      import("react-toastify")
        .then(({ toast }) => {
          toast.error("Vui lòng đăng nhập tài khoản để kích hoạt sách ID");
        })
        .catch(() => {});
      return;
    }

    if (isActivating) return;

    setIsActivating(true);
    try {
      const response: any = await bookidService.accessByCode({
        book_id: bookIdInput.trim(),
        code: activationCode.trim(),
      });

      const { toast } = await import("react-toastify");
      const msg = response?.message || "";

      if (response.code === 200) {
        toast.success("Kích hoạt thành công");
        setIsActivationModalOpen(false);
        setBookIdInput("");
        setActivationCode("");
        router.push("/account/my-course");
      } else {
        // Case 2: User already activated this code
        if (
          msg.toLowerCase().includes("sử dụng trước đó") ||
          msg.toLowerCase().includes("đã được sử dụng")
        ) {
          toast.success("Mã đã được bạn sử dụng trước đó!");
          setIsActivationModalOpen(false);
          setBookIdInput("");
          setActivationCode("");
          router.push("/account/my-course");
        } else {
          toast.error(msg || "Có lỗi xảy ra");
        }
      }
    } catch (error: any) {
      const { toast } = await import("react-toastify");
      let errorMessage = "Kích hoạt không thành công";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || errorMessage;
      }

      // Case 2: User already activated this code (via error/500)
      if (
        errorMessage.toLowerCase().includes("sử dụng trước đó") ||
        errorMessage.toLowerCase().includes("đã được sử dụng")
      ) {
        toast.success("Mã đã được bạn sử dụng trước đó!");
        setIsActivationModalOpen(false);
        setBookIdInput("");
        setActivationCode("");
        router.push("/account/my-course");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsActivating(false);
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
  const isFullyExpired = useMemo(() => {
    // Nếu số lần gia hạn còn lại = 0 thì coi như hết hạn hoàn toàn
    if (courseData?.extendTimes === 0) return true;

    if (!courseData?.expiredDate) return false;
    const now = new Date();
    const expiry = new Date(courseData.expiredDate);
    const graceEndDate = new Date(expiry);

    // Sử dụng số tháng được gia hạn từ API
    const monthsToAdd =
      typeof courseData.totalExtendedMonths === "number"
        ? courseData.totalExtendedMonths
        : 3;
    graceEndDate.setMonth(expiry.getMonth() + monthsToAdd);

    const nowDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).getTime();
    const graceEndDay = new Date(
      graceEndDate.getFullYear(),
      graceEndDate.getMonth(),
      graceEndDate.getDate(),
    ).getTime();

    return nowDay > graceEndDay;
  }, [
    courseData?.expiredDate,
    courseData?.totalExtendedMonths,
    courseData?.extendTimes,
  ]);

  const isInGracePeriod = useMemo(() => {
    // Nếu không còn lượt gia hạn thì không có thời gian ân hạn
    if (courseData?.extendTimes === 0) return false;

    if (!courseData?.expiredDate) return false;
    const now = new Date();
    const expiry = new Date(courseData.expiredDate);

    const nowDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).getTime();
    const expiryDay = new Date(
      expiry.getFullYear(),
      expiry.getMonth(),
      expiry.getDate(),
    ).getTime();

    if (nowDay < expiryDay) return false;

    const graceEndDate = new Date(expiry);
    const monthsToAdd =
      typeof courseData.totalExtendedMonths === "number"
        ? courseData.totalExtendedMonths
        : 3;
    graceEndDate.setMonth(expiry.getMonth() + monthsToAdd);

    const graceEndDay = new Date(
      graceEndDate.getFullYear(),
      graceEndDate.getMonth(),
      graceEndDate.getDate(),
    ).getTime();

    return nowDay <= graceEndDay;
  }, [
    courseData?.expiredDate,
    courseData?.totalExtendedMonths,
    courseData?.extendTimes,
  ]);

  const isOwned =
    !isFullyExpired &&
    (courseData?.isJoined === true ||
      (courseData?.studentOwned != null && courseData.studentOwned > 0));

  return (
    <div className="course-detail-container">
      <div className="course-detail-layout">
        <div className="course-detail-content">
          <Breadcrumb
            items={[
              { label: "Trang chủ", href: "/" },
              { label: "Sách ID", href: "/sach-id" },
              { label: bookName || "Sách ID", href: `/sach-id/${bookAlias}` },
              { label: courseData.title, hideOnMobile: true },
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
            {isOwned ? (
              <CourseOwnedCard
                courseData={courseData}
                onActivate={handleRenew}
              />
            ) : (
              <CoursePurchaseCard
                courseData={courseData}
                purchaseCardRef={purchaseCardRef}
                onActivate={() => setIsActivationModalOpen(true)}
                bookAlias={bookAlias}
              />
            )}
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
          <CourseSidebar
            courseData={courseData}
            onActivate={
              isInGracePeriod
                ? handleRenew
                : () => setIsActivationModalOpen(true)
            }
            bookAlias={bookAlias}
          />
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
        hideAddToCart={true}
        showPrice={false}
        buyNowText="Mua sách ngay"
        onActivate={
          isInGracePeriod ? handleRenew : () => setIsActivationModalOpen(true)
        }
        activateText="Kích hoạt sách ID"
        isInGracePeriod={isInGracePeriod}
        isSearchId={true}
      />

      {/* Modal Kích hoạt sách ID */}
      {isMounted && (
        <Dialog
          open={isActivationModalOpen}
          onOpenChange={setIsActivationModalOpen}
        >
          <DialogContent
            className="bg-white border-gray-200 max-w-md p-0"
            showCloseButton={true}
            onBackClick={() => setIsActivationModalOpen(false)}
          >
            <DialogTitle className="sr-only">Kích hoạt sách ID</DialogTitle>
            <div className="flex flex-col items-center px-8 py-8">
              {/* Header */}
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Kích hoạt
              </h2>

              {/* Instruction */}
              <p className="text-center text-gray-600 mb-4">
                Vui lòng nhập đầy đủ thông tin để truy cập sách ID
              </p>

              {/* Form */}
              <div className="w-full space-y-4">
                <input
                  type="text"
                  value={bookIdInput}
                  onChange={(e) => setBookIdInput(e.target.value)}
                  placeholder="Nhập ID sách"
                  disabled={isActivating}
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <input
                  type="text"
                  value={activationCode}
                  onChange={(e) => setActivationCode(e.target.value)}
                  placeholder="Nhập mã kích hoạt"
                  disabled={isActivating}
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isActivating) {
                      handleActivate();
                    }
                  }}
                />
                <button
                  onClick={handleActivate}
                  disabled={isActivating}
                  className="w-full rounded-lg bg-[#235CD0] px-4 py-3 text-white font-bold uppercase tracking-wide hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isActivating ? "Đang xử lý..." : "XÁC NHẬN"}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

/**
 * Component client chính cho trang chi tiết khóa học trong phần sách ID
 * Layout 2 cột: 2/3 nội dung chính, 1/3 sidebar
 */
export default function BookIdCourseDetailClient({
  courseId,
  bookAlias,
}: BookIdCourseDetailClientProps) {
  return (
    <CourseDataProvider courseId={courseId}>
      {(freshCourseData) => (
        <BookIdCourseDetailContent
          courseId={courseId}
          bookAlias={bookAlias}
          courseData={freshCourseData}
        />
      )}
    </CourseDataProvider>
  );
}
