"use client";

import React, { useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Book,
  FileText,
  Clock,
  PlusSquare,
  Play,
  Image,
  Link as LinkIcon,
  BarChart,
  Video,
  Star,
  Users,
  Menu,
  CheckSquare,
  ListChecks,
  Layers,
  Info,
  BookOpen,
  FolderPlus,
  Key,
} from "lucide-react";
import { RootContext } from "@/contexts/RootContext";
import { CDN_LINK } from "@/utils/constants";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/Dialog";
import { classroomService } from "@/services/classroomService";
import { ResponsiveImageFrame } from "@/components/ui/responsive-image-frame";

interface AttachedCourse {
  _id: string;
  name?: string;
  title?: string;
  course_name?: string;
  alias: string;
  code: string;
  subject?: { id: string; name: string };
  group?: { id: string; name: string };
  price?: number;
  origin_price?: number;
  teacher?: string;
  time_course?: { opening_date: string; closing_date: string };
  banner?: string;
}

interface AttachedBook {
  _id: string;
  name?: string;
  title?: string;
  alias: string;
  code: string;
  price?: number;
  origin_price?: number;
  [key: string]: any;
}

interface CourseData {
  id: string;
  title: string;
  description?: string;
  image?: string;
  teacher?: string;
  price?: number;
  originPrice?: number;
  subject?: string;
  group?: string;
  code?: string;
  alias?: string;
  timeCourse?: { opening_date: string; closing_date: string };
  content?: string;
  updatedAt?: string;
  numStudent?: number;
  classroomAttached?: AttachedCourse[];
  bookAttached?: AttachedBook[];
  includes?: Array<{
    id?: number | string;
    text?: string;
    title?: string;
    icon?: number | string;
  }>;
  // NEW: promotion data for countdown
  promotion?: {
    from_date?: string | null;
    to_date?: string | null;
    type?: string;
    hour?: number;
    note?: string;
  };
  activationDate?: string | null;
  expiredDate?: string | null;
  totalExtendedMonths?: number;
  extendTimes?: number;
  isFullyExpired?: boolean;
  bookId?: string;
}

interface CoursePurchaseCardProps {
  courseData?: CourseData;
  purchaseCardRef?: React.RefObject<HTMLDivElement>;
  onActivate?: () => void;
  bookAlias?: string;
}

export default function CoursePurchaseCard({
  courseData,
  purchaseCardRef,
  onActivate,
  bookAlias,
}: CoursePurchaseCardProps) {
  const router = useRouter();
  const rootContext = useContext(RootContext);

  const price = Number(courseData?.price) || 0;
  const originPrice = Number(courseData?.originPrice) || 0;
  const discountPercent =
    originPrice > price
      ? Math.round(((originPrice - price) / originPrice) * 100)
      : 0;

  // NEW: prefer sanitized image (in case API returns backticks/spaces)
  const imageUrl = useMemo(() => {
    const img = courseData?.image;
    if (!img) return "/imgs/logo.png";
    const s = String(img).replace(/[`"]/g, "").trim();
    return s.startsWith("http") ? s : `${CDN_LINK}${s}`;
  }, [courseData?.image]);

  // Promotion-aware countdown
  const openingDate = courseData?.timeCourse?.opening_date
    ? new Date(courseData.timeCourse.opening_date)
    : null;
  const closingDate = courseData?.timeCourse?.closing_date
    ? new Date(courseData.timeCourse.closing_date)
    : null;

  const promo = courseData?.promotion;
  const [countdown, setCountdown] = useState<string | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    // BY_HOUR: persist per-user start time and show only hh:mm:ss
    if (
      promo?.type === "BY_HOUR" &&
      promo.hour &&
      promo.hour > 0 &&
      courseData?.id
    ) {
      const storageKey = `promoStart-${courseData.id}`;
      let start = Number(localStorage.getItem(storageKey));
      if (!start || Number.isNaN(start)) {
        start = Date.now();
        localStorage.setItem(storageKey, String(start));
      }
      const duration = Number(promo.hour) * 3600 * 1000;

      const formatHHMMSS = (ms: number) => {
        const totalSeconds = Math.max(0, Math.floor(ms / 1000));
        const totalHours = Math.floor(totalSeconds / 3600); // cumulative hours
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const hh = String(totalHours).padStart(2, "0");
        const mm = String(minutes).padStart(2, "0");
        const ss = String(seconds).padStart(2, "0");
        return `${hh}h:${mm}m:${ss}s`;
      };

      const tick = () => {
        const now = Date.now();
        let remaining = start + duration - now;
        if (remaining <= 0) {
          // restart cycle as per current logic
          start = Date.now();
          localStorage.setItem(storageKey, String(start));
          remaining = start + duration - now;
        }
        setCountdown(formatHHMMSS(remaining));
      };
      tick();
      intervalId = setInterval(tick, 1000);
    }
    else {
      // Default: countdown to absolute end time (e.g., BY_DATE_RANGE)
      const endIso =
        promo?.to_date;
      if (endIso) {
        const endTime = new Date(endIso).getTime();
        if (endTime && !Number.isNaN(endTime)) {
          const format = (ms: number) => {
            if (ms <= 0) return null;
            const totalSeconds = Math.floor(ms / 1000);
            const days = Math.floor(totalSeconds / 86400);
            const hours = Math.floor((totalSeconds % 86400) / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            const dd = days > 0 ? `${days}d:` : "";
            const hh = String(hours).padStart(2, "0");
            const mm = String(minutes).padStart(2, "0");
            const ss = String(seconds).padStart(2, "0");
            return `${dd}${hh}h:${mm}m:${ss}s`;
          };

          const tick = () => {
            const now = Date.now();
            const left = endTime - now;
            const formatted = format(left);
            setCountdown(formatted);
          };
          tick();
          intervalId = setInterval(tick, 1000);
        } else {
          setCountdown(null);
        }
      } else {
        setCountdown(null);
      }
    }

    // Always return cleanup function
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [
    promo?.type,
    promo?.hour,
    promo?.to_date,
    courseData?.id,
    // courseData?.timeCourse?.closing_date,
    // closingDate,
  ]);

  const formatPrice = (n: number) =>
    `${new Intl.NumberFormat("vi-VN").format(n)}đ`;

  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Fix hydration mismatch by only rendering modal on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleAddToCart = async () => {
    if (!rootContext?.handleAddCart || isAddingToCart) return;

    setIsAddingToCart(true);
    try {
      await rootContext.handleAddCart({
        item_id: String(courseData?.id || ""),
        name: courseData?.title || "",
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
    const targetAlias = courseData?.bookId || bookAlias;
    if (targetAlias) {
      router.push(`/sach-id/${targetAlias}`);
    }
  };

  const classroomAttached = Array.isArray(courseData?.classroomAttached)
    ? courseData!.classroomAttached
    : [];
  const bookAttached = Array.isArray(courseData?.bookAttached)
    ? courseData!.bookAttached
    : [];

  // Tính tổng giá của tất cả sách và khóa học đi kèm
  const giftAmount = useMemo(() => {
    let total = 0;

    // Tính tổng giá từ khóa học đi kèm (ưu tiên price, nếu không có thì dùng origin_price)
    classroomAttached.forEach((c) => {
      const price = Number(c.price) || 0;
      const originPrice = Number(c.origin_price) || 0;
      total += price > 0 ? price : originPrice;
    });

    // Tính tổng giá từ sách đi kèm (ưu tiên price, nếu không có thì dùng origin_price)
    bookAttached.forEach((b) => {
      const price = Number(b.price) || 0;
      const originPrice = Number(b.origin_price) || 0;
      total += price > 0 ? price : originPrice;
    });

    return total;
  }, [classroomAttached, bookAttached]);

  // Kết hợp cả sách và khóa học để hiển thị
  const allAttachedItems = useMemo(() => {
    const items: Array<{
      id: string;
      name: string;
      linkId: string; // ID hoặc alias để dùng trong link
      type: "course" | "book";
      price: number;
    }> = [];

    // Thêm khóa học - route dùng [id] nên dùng _id
    classroomAttached.forEach((c) => {
      const price = Number(c.price) || 0;
      const originPrice = Number(c.origin_price) || 0;
      items.push({
        id: c._id,
        name: c.name || c.title || c.course_name || "Khóa học",
        linkId: c._id, // Khóa học dùng id trong route
        type: "course",
        price: price > 0 ? price : originPrice,
      });
    });

    // Thêm sách - route dùng [alias] nên ưu tiên alias, nếu không có thì dùng _id
    bookAttached.forEach((b) => {
      const price = Number(b.price) || 0;
      const originPrice = Number(b.origin_price) || 0;
      items.push({
        id: b._id,
        name: b.name || b.title || "Sách",
        linkId: b.alias || b._id, // Sách dùng alias trong route, fallback về _id
        type: "book",
        price: price > 0 ? price : originPrice,
      });
    });

    return items;
  }, [classroomAttached, bookAttached]);

  // Mapping icon index từ admin sang component icon
  const getIconByIndex = (index: number | string | undefined) => {
    const iconIndex = typeof index === "number" ? index : Number(index) || -1;

    const iconMap: Record<number, React.ReactNode> = {
      0: <Book size={16} className="text-gray-600" />,
      1: <BookOpen size={16} className="text-gray-600" />,
      2: <FileText size={16} className="text-gray-600" />,
      3: <Clock size={16} className="text-gray-600" />,
      4: <CheckSquare size={16} className="text-gray-600" />,
      5: <ListChecks size={16} className="text-gray-600" />,
      6: <PlusSquare size={16} className="text-gray-600" />,
      7: <Play size={16} className="text-gray-600" />,
      8: <Menu size={16} className="text-gray-600" />,
      9: <Image size={16} className="text-gray-600" />,
      10: <Video size={16} className="text-gray-600" />,
      11: <LinkIcon size={16} className="text-gray-600" />,
      12: <BarChart size={16} className="text-gray-600" />,
      13: <Info size={16} className="text-gray-600" />,
      14: <Star size={16} className="text-gray-600" />,
      15: <Users size={16} className="text-gray-600" />,
      16: <FolderPlus size={16} className="text-gray-600" />,
      17: <Layers size={16} className="text-gray-600" />,
    };

    return iconMap[iconIndex] || null;
  };

  const includesList = Array.isArray(courseData?.includes)
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



  if (!courseData) return null;
  const graceEndDate = useMemo(() => {
    if (!courseData.expiredDate) return null;
    const d = new Date(courseData.expiredDate);
    const monthsToAdd = typeof courseData.totalExtendedMonths === "number"
      ? courseData.totalExtendedMonths
      : 3;
    d.setMonth(d.getMonth() + monthsToAdd);
    return d;
  }, [courseData.expiredDate, courseData.totalExtendedMonths]);

  const isInGracePeriod = useMemo(() => {
    if (!courseData.expiredDate || !graceEndDate) return false;
    const now = new Date();
    const expiry = new Date(courseData.expiredDate);
    const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const expiryDay = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate()).getTime();

    // Nếu chưa tới ngày hết hạn thì chưa tính là đang trong tình trạng gia hạn
    if (nowDay < expiryDay) return false;
    
    // Nếu hết lượt gia hạn thì không còn tình trạng gia hạn
    if (courseData.extendTimes === 0) return false;

    const graceEndDay = new Date(graceEndDate.getFullYear(), graceEndDate.getMonth(), graceEndDate.getDate()).getTime();
    return nowDay <= graceEndDay;
  }, [courseData.expiredDate, graceEndDate, courseData.extendTimes]);

  return (
    <div className="purchase-card" ref={purchaseCardRef}>
      {/* Banner */}
      <ResponsiveImageFrame
        src={imageUrl}
        alt={courseData.title}
        className="purchase-card-image"
        imageClassName="purchase-card-image"
      />

      {/* Actions - Hidden on mobile */}
      <div className="purchase-actions hidden md:flex">
        {onActivate && (
          <button
            onClick={onActivate}
            className="md:flex xl:hidden bg-[#22C55E] hover:bg-[#1faa50] text-white font-semibold py-3 rounded-lg transition-colors items-center justify-center whitespace-nowrap px-6"
            style={{ flex: 1 }}
          >
            Kích hoạt sách ID
          </button>
        )}
        <button
          onClick={handleBuyNow}
          className="btn-buy-now whitespace-nowrap px-6 py-3 font-semibold flex items-center justify-center"
          style={{ flex: 1 }}
        >
          Mua sách ngay
        </button>
      </div>


      {/* Khóa học này bao gồm */}
      {includesList.length > 0 && (
        <div className="px-6 py-2">
          <h3 className="font-semibold text-gray-800 mb-2">
            Khóa học này bao gồm
          </h3>
          <ul className="space-y-2">
            {includesList.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                {getIconByIndex(item.iconIndex) || (
                  <Clock size={16} className="text-gray-400" />
                )}
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}


      {/* Thời gian */}
      {(openingDate || closingDate) && (
        <div className="px-6 pb-2">
          <h3 className="font-semibold text-gray-800 mb-2">Thời gian</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            {openingDate && (
              <li className="flex items-center">
                <img
                  src="/icon/ic_lich.svg"
                  alt=""
                  width={16}
                  height={16}
                  className="mr-2"
                />
                Ngày khai giảng: {openingDate.toLocaleDateString("vi-VN")}
              </li>
            )}
            {closingDate && (
              <li className="flex items-center">
                <img
                  src="/icon/ic_lich.svg"
                  alt=""
                  width={16}
                  height={16}
                  className="mr-2"
                />
                Ngày kết thúc: {closingDate.toLocaleDateString("vi-VN")}
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Quà tặng trị giá (combo) */}
      {allAttachedItems.length > 0 && (
        <div className="course-gifts px-4 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <img
                src="/icon/ic_quatang.svg"
                alt="Quà tặng"
                width={24}
                height={24}
                className="flex-shrink-0"
              />
              <span className="font-semibold text-gray-800 text-base">
                Quà tặng trị giá
              </span>
            </div>
            <span className="gifts-badge">
              {giftAmount > 0 ? `${Math.round(giftAmount / 1000)}K` : "0K"}
            </span>
          </div>

          <div className="gifts-box">
            <ul className="gifts-list">
              {allAttachedItems.map((item) => (
                <li key={item.id} className="gift-item-box">
                  <span className="gift-dot" />
                  <div className="flex-1 flex items-center justify-between gap-2">
                    <a
                      href={
                        item.type === "book"
                          ? `/sach-id/${item.linkId}`
                          : `/khoa-hoc/${item.linkId}`
                      }
                      className="gift-link"
                      title={item.name}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.name}
                    </a>
                    {/* {item.price > 0 && (
                      <span className="gift-price text-sm font-semibold text-red-600 whitespace-nowrap">
                        {formatPrice(item.price)}
                      </span>
                    )} */}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Kích hoạt sách ID - Hidden on mobile/tablet, only show on desktop */}
      <div className="hidden xl:block px-4 pb-4">
        <button
          className="w-full bg-[#22C55E] hover:bg-[#1faa50] text-white font-semibold py-3 rounded-lg transition-colors"
          onClick={onActivate}
          title="Kích hoạt sách ID"
        >
          Kích hoạt sách ID
        </button>
      </div>

      {/* Subscription Dates if in renewal period */}
      {isInGracePeriod && (courseData.activationDate || courseData.expiredDate) && (
        <div className="px-6 py-4 space-y-1 text-sm text-gray-700 font-medium border-t border-gray-100">
          {courseData.activationDate && (
            <div>
              Ngày đăng ký: {new Date(courseData.activationDate).toLocaleDateString("vi-VN")}
            </div>
          )}
          {courseData.expiredDate && (
            <div>
              Ngày hết hạn: <span className="text-red-500 font-semibold">{new Date(courseData.expiredDate).toLocaleDateString("vi-VN")}</span>
            </div>
          )}
          {graceEndDate && (
            <div>
              Ngày hết hạn gia hạn: <span className="text-red-500 font-semibold">{graceEndDate.toLocaleDateString("vi-VN")}</span>
            </div>
          )}
        </div>
      )}



    </div>
  );
}
