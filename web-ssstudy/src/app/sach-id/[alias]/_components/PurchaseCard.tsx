"use client";

import { useContext, useEffect, useState } from "react";
import { RootContext } from "@/contexts/RootContext";
import { BookPurchaseCard, BookDetailData } from "./types";
import { useRouter } from "next/navigation";
import {
  Book as BookIcon,
  FileText,
  Clock,
  FilePlus,
  PlusSquare,
  Play,
  Image as ImageIcon,
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
  Circle,
} from "lucide-react";
import { formatPrice } from "./utils";
import { ResponsiveImageFrame } from "@/components/ui/responsive-image-frame";

interface PurchaseCardProps {
  data: BookPurchaseCard;
  book: BookDetailData;
  purchaseCardRef?: React.RefObject<HTMLDivElement>;
}

export default function PurchaseCard({
  data,
  book,
  purchaseCardRef,
}: PurchaseCardProps) {
  const router = useRouter();
  const rootContext = useContext(RootContext);
  const [liveCountdown, setLiveCountdown] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(data.registrationDeadline || null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  // Mapping icon từ iconKey (string) hoặc icon (number) sang component icon
  const getIcon = (iconKey?: string, iconIndex?: number | string) => {
    // Ưu tiên iconKey (string) nếu có
    if (iconKey) {
      const iconKeyMap: Record<string, React.ReactNode> = {
        Book: <BookIcon size={16} className="text-gray-600" />,
        BookOpen: <BookOpen size={16} className="text-gray-600" />,
        FileText: <FileText size={16} className="text-gray-600" />,
        FilePlus: <FilePlus size={16} className="text-gray-600" />,
        Clock: <Clock size={16} className="text-gray-600" />,
        CheckSquare: <CheckSquare size={16} className="text-gray-600" />,
        ListChecks: <ListChecks size={16} className="text-gray-600" />,
        PlusSquare: <PlusSquare size={16} className="text-gray-600" />,
        Play: <Play size={16} className="text-gray-600" />,
        Menu: <Menu size={16} className="text-gray-600" />,
        Image: <ImageIcon size={16} className="text-gray-600" />,
        Video: <Video size={16} className="text-gray-600" />,
        Link: <LinkIcon size={16} className="text-gray-600" />,
        BarChart: <BarChart size={16} className="text-gray-600" />,
        Info: <Info size={16} className="text-gray-600" />,
        Star: <Star size={16} className="text-gray-600" />,
        Users: <Users size={16} className="text-gray-600" />,
        FolderPlus: <FolderPlus size={16} className="text-gray-600" />,
        Layers: <Layers size={16} className="text-gray-600" />,
      };

      return (
        iconKeyMap[iconKey] || <Circle size={10} className="text-gray-400" />
      );
    }

    // Fallback về icon index (number) nếu không có iconKey
    if (iconIndex !== undefined && iconIndex !== null) {
      const index =
        typeof iconIndex === "number" ? iconIndex : Number(iconIndex) || -1;
      const iconMap: Record<number, React.ReactNode> = {
        0: <BookIcon size={16} className="text-gray-600" />,
        1: <BookOpen size={16} className="text-gray-600" />,
        2: <FileText size={16} className="text-gray-600" />,
        3: <Clock size={16} className="text-gray-600" />,
        4: <CheckSquare size={16} className="text-gray-600" />,
        5: <ListChecks size={16} className="text-gray-600" />,
        6: <PlusSquare size={16} className="text-gray-600" />,
        7: <Play size={16} className="text-gray-600" />,
        8: <Menu size={16} className="text-gray-600" />,
        9: <ImageIcon size={16} className="text-gray-600" />,
        10: <Video size={16} className="text-gray-600" />,
        11: <LinkIcon size={16} className="text-gray-600" />,
        12: <BarChart size={16} className="text-gray-600" />,
        13: <Info size={16} className="text-gray-600" />,
        14: <Star size={16} className="text-gray-600" />,
        15: <Users size={16} className="text-gray-600" />,
        16: <FolderPlus size={16} className="text-gray-600" />,
        17: <Layers size={16} className="text-gray-600" />,
      };
      return iconMap[index] || <Circle size={10} className="text-gray-400" />;
    }

    return <Circle size={10} className="text-gray-400" />;
  };

  // Xử lý includes - hỗ trợ cả includes.items (sách) và includes trực tiếp (khóa học)
  const includesRaw =
    data?.includes &&
    typeof data.includes === "object" &&
    "items" in data.includes &&
    Array.isArray(data.includes.items)
      ? data.includes.items
      : Array.isArray(data?.includes)
      ? data.includes
      : [];

  interface IncludeItem {
    id: string;
    text: string;
    iconKey?: string;
    iconIndex: number;
  }

  const includesSafe: IncludeItem[] = includesRaw
    .map((it: any, index): IncludeItem | null => {
      if (typeof it === "string") {
        return { id: `${index}`, text: it, iconKey: undefined, iconIndex: -1 };
      }
      const text = (it && (it.text || it.title)) || "";
      if (!String(text).trim().length) return null;
      const id = it?.id ?? `${index}`;
      const iconKey = it?.iconKey || undefined;
      const iconIndex = it?.icon !== undefined ? it.icon : -1;

      return { id: String(id), text, iconKey, iconIndex };
    })
    .filter((item): item is IncludeItem => item !== null && item !== undefined);

  const handleAddToCart = async () => {
    if (!rootContext?.handleAddCart || isAddingToCart) return;

    setIsAddingToCart(true);
    try {
      await rootContext.handleAddCart({
        item_id: book.id,
        name: book.name,
        price: data.salePrice,
        qty: 1,
        type: "BOOKID",
        image: book.thumbnail,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!rootContext?.handleAddCart || isBuyingNow) return;

    setIsBuyingNow(true);
    try {
      // Thêm vào giỏ hàng trước
      await rootContext.handleAddCart({
        item_id: book.id,
        name: book.name,
        price: data.salePrice,
        qty: 1,
        type: "BOOKID",
        image: book.thumbnail,
      });

      // Chuyển đến trang giỏ hàng
      router.push("/gio-hang");
    } catch (error) {
      console.error("Error buying now:", error);
    } finally {
      setIsBuyingNow(false);
    }
  };

  useEffect(() => {
    const promo = book?.promotion;
    if (!promo) {
      setLiveCountdown(null);
      return;
    }

    // BY_HOUR: persist per-user start time and show only hh:mm:ss
    if (promo.type === "BY_HOUR" && promo.hour) {
      const storageKey = `promoStart-${book.id}`;
      let start = Number(localStorage.getItem(storageKey));
      if (!start || Number.isNaN(start)) {
        start = Date.now();
        localStorage.setItem(storageKey, String(start));
      }
      const duration = Number(promo.hour) * 3600 * 1000;

      const endTimestamp = start + duration;
      const dateObj = new Date(endTimestamp);
      const dd_raw = String(dateObj.getDate()).padStart(2, "0");
      const mm_raw = String(dateObj.getMonth() + 1).padStart(2, "0");
      const yyyy_raw = dateObj.getFullYear();
      setEndDate(`${dd_raw}/${mm_raw}/${yyyy_raw}`);

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
        setLiveCountdown(formatHHMMSS(remaining));
      };
      tick();
      const id = setInterval(tick, 1000);
      return () => clearInterval(id);
    }

    // Default: countdown to absolute end time (e.g., BY_DATE_RANGE)
    const endIso = promo.countdownEnd;
    if (!endIso) {
      setLiveCountdown(null);
      return;
    }
    const endTime = new Date(endIso).getTime();
    if (!endTime || Number.isNaN(endTime)) return;

    const dateObj = new Date(endTime);
    const dd_raw = String(dateObj.getDate()).padStart(2, "0");
    const mm_raw = String(dateObj.getMonth() + 1).padStart(2, "0");
    const yyyy_raw = dateObj.getFullYear();
    setEndDate(`${dd_raw}/${mm_raw}/${yyyy_raw}`);

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
      setLiveCountdown(formatted);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [
    book.id,
    book?.promotion?.countdownEnd,
    book?.promotion?.type,
    book?.promotion?.hour,
  ]);
  function handleAddCartClick() {
    if (!rootContext?.handleAddCart || !book?.id) return;

    const salePrice = Number(data?.salePrice ?? book?.price ?? 0);
    const price = Number.isNaN(salePrice) ? 0 : salePrice;

    const payload = {
      item_id: String(book.id),
      name: book.name,
      price,
      qty: 1,
      type: "BOOKID",
      image: book.thumbnail || "",
    };

    void rootContext.handleAddCart(payload);
  }

  return (
    <div className="purchase-card" ref={purchaseCardRef}>
      {/* Book Image */}
      <ResponsiveImageFrame
        src={book.thumbnail}
        alt="Book cover"
        className="purchase-card-image"
        imageClassName="purchase-card-image"
      />

      {/* Price Section */}
      <div className="purchase-card-price">
        <div className="price-main">{formatPrice(data.salePrice)}</div>
        {data.originalPrice > 0 && (
          <div className="price-original">
            {formatPrice(data.originalPrice)}
          </div>
        )}
        {data.discount && data.discount.trim().length > 0 && (
          <div className="price-discount hidden md:block">
            Giảm {data.discount}
          </div>
        )}
      </div>

      {/* Countdown */}
      {(liveCountdown || data.countdown) && (
        <div className="purchase-countdown">
          <img
            src="/icon/ic_demnguocsach.svg"
            alt="Countdown"
            className="countdown-icon"
            style={{ width: "28px", height: "28px" }}
          />
          <span className="text-orange-500">
            Kết thúc sau {liveCountdown || data.countdown}
          </span>
        </div>
      )}

      {/* Promotion Note */}
      {(endDate || book.promotion?.note) && (
        <div className="purchase-deadline">
          <span>{endDate ? `*Ưu đãi, đăng ký trước ${endDate}` : book.promotion.note}</span>
        </div>
      )}

      {/* Action Buttons - Hidden on mobile */}
      <div className="purchase-actions hidden md:flex">
        <button
          onClick={handleAddToCart}
          disabled={isAddingToCart}
          className="btn-add-cart flex items-center justify-center gap-2 whitespace-nowrap px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <img
            src="/icon/ic_gio hang.svg"
            alt="Giỏ hàng"
            className="btn-icon"
          />
          {isAddingToCart ? "Đang thêm..." : "Thêm vào giỏ hàng"}
        </button>
        <button
          onClick={handleBuyNow}
          disabled={isBuyingNow}
          className="btn-buy-now whitespace-nowrap px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isBuyingNow ? "Đang xử lý..." : "Mua ngay"}
        </button>
      </div>

      {/* Includes Section */}
      {includesSafe.length > 0 && (
        <div className="purchase-includes">
          <h3 className="includes-title">Sách bao gồm</h3>
          <ul className="includes-list">
            {includesSafe.map((item) => {
              const icon = getIcon(item.iconKey, item.iconIndex);
              return (
                <li key={item.id} className="flex items-center gap-2">
                  {icon}
                  <span>{item.text}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Preview Button - Moved below includes */}
      {book.previewLink && (
        <div className="purchase-preview">
          <a
            className="btn-preview"
            href={book.previewLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/icon/ic_banxemthu.svg"
              alt="Preview"
              className="btn-icon"
            />
            Bản xem thử
          </a>
        </div>
      )}
      {/* Gifts Section */}
      {/* {Array.isArray((data as any).giftItems) &&
        (data as any).giftItems.length > 0 && (
          <div className="purchase-gifts mt-4">
            <div className="gifts-header">
              <span className="gifts-badge">
                {data.giftAmount
                  ? `${Math.round((data.giftAmount || 0) / 1000)}K`
                  : "0K"}
              </span>
            </div> */}

      {/* <div className="gifts-content bg-white border border-orange-200 rounded-xl p-3">
              <div className="gifts-title-row flex items-center gap-2 mb-3">
                <img
                  src="/icon/ic_quatang.svg"
                  alt="Gift"
                  className="gift-icon"
                  style={{ width: "28px", height: "28px" }}
                />
                <span className="gifts-title font-semibold text-gray-700">
                  Quà tặng trị giá
                </span>
              </div>

              <ul className="gifts-list">
                {(data as any).giftItems.map((g: any, index: number) => (
                  <li key={index} className="gift-item-box" title={g.title}>
                    <span className="gift-dot" />
                    <a href={g.href} className="gift-link">
                      {g.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div> */}
      {/* </div>
        )}
    </div> */}
    </div>
  );
}
