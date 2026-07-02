"use client";

import { useState, useEffect, useRef, useContext } from "react";
import { Book } from "@/types/book";
import { bookService } from "@/services/bookService";
import Link from "next/link";
import BookDetailHeader from "./BookDetailHeader";
import BookHighlightsGrid from "./BookHighlightsGrid";
import BookTabs from "./BookTabs";
import PurchaseCard from "./PurchaseCard";
import RelatedBooks from "./RelatedBooks";
import Breadcrumb from "./Breadcrumb";
import { BookDetailData, BookPurchaseCard, RelatedBook } from "./types";
import { generateBreadcrumbs } from "./utils";
import { CDN_LINK } from "@/utils/constants";
import { RootContext } from "@/contexts/RootContext";
import { useRouter } from "next/navigation";
import MobilePurchaseButtons from "@/components/common/MobilePurchaseButtons";
import { ResponsiveImageFrame } from "@/components/ui/responsive-image-frame";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

interface BookDetailClientProps {
  alias: string;
}

export default function BookDetailClient({ alias }: BookDetailClientProps) {
  const router = useRouter();
  const rootContext = useContext(RootContext);
  const purchaseCardRef = useRef<HTMLDivElement>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<RelatedBook[]>([]);
  const [extras, setExtras] = useState<{
    classroomAttached: any[];
    bookRelates: any[];
    includes?: any[];
    highlightInformations?: any[];
    teacher?: any[];
  }>({ classroomAttached: [], bookRelates: [] });

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        // alias là id của sách từ list
        const resp = await bookService.getBookDetail(alias);
        const root = (resp as any)?.data ?? null;
        const data = root?.data?.book ?? root?.book ?? null;
        if (!data) {
          setError("Không tìm thấy sách");
          return;
        }
        const mapped: Book = {
          _id: data._id || data.id || alias,
          name: data.name || "",
          code: data.code || "",
          alias: data.alias || alias,
          subject: data.subject || { id: "", name: "" },
          category: data.category || { id: "", name: "" },
          external_link: data.external_link,
          description: data.description || "",
          content: data.content || "",
          origin_price: Number(data.origin_price || data.oldPrice || 0),
          price: Number(data.price || 0),
          ordering: Number(data.ordering || 0),
          level: data.level || "",
          teacher_id: String(data.teacher_id || ""),
          stock_status: (data.stock_status as any) || "IN_STOCK",
          is_featured: Boolean(data.is_featured),
          promotion: data.promotion || {
            type: "",
            from_date: undefined,
            to_date: undefined,
          },
          status: Boolean(data.status ?? true),
          quantity: Number(data.quantity || 0),
          image: data.image || data.thumbnail || undefined,
          created_at: data.created_at || new Date().toISOString(),
          updated_at: data.updated_at || new Date().toISOString(),
          classroom_relates: data.classroom_relates || [],
          book_relates: data.book_relates || [],
          classroom_attached: data.classroom_attached || [],
          student_owned:
            data.student_owned !== undefined && data.student_owned !== null
              ? Number(data.student_owned)
              : undefined,
        };
        setBook(mapped);

        const nextExtras = {
          classroomAttached: root?.data?.classroomAttached ?? [],
          bookRelates: root?.data?.bookRelates ?? [],
          includes: root?.data?.includes?.items ?? data?.includes?.items ?? [],
          highlightInformations:
            root?.data?.highlightInformations?.items ??
            data?.highlightInformations?.items ??
            [],
          teacher: data?.teacher ?? [],
        };
        setExtras(nextExtras);

        // Fetch related books from API
        if (mapped.level && mapped.category?.id) {
          try {
            const relatedResponse = await bookService.getRelatedBooks({
              page: 1,
              limit: 20,
              level: mapped.level,
              category_id: mapped.category.id,
              book_id:
                mapped._id ||
                (mapped as any).id ||
                mapped.alias ||
                alias,
            });
            const relatedData =
              (relatedResponse as any)?.data?.data?.records ||
              (relatedResponse as any)?.data?.records ||
              [];

            const mappedRelated: RelatedBook[] = relatedData
              .filter((rb: any) => {
                // Filter out current book
                const rbId = rb._id || rb.id || "";
                return rbId !== mapped._id && rbId !== alias;
              })
              .map((rb: any) => {
                // Handle teacher - prioritize object (most common case), then array, then fallback
                let teacherName = "";
                if (rb?.teacher) {
                  if (
                    typeof rb.teacher === "object" &&
                    !Array.isArray(rb.teacher)
                  ) {
                    // Teacher is an object (most common case from API)
                    teacherName = rb.teacher.fullname || rb.teacher.name || "";
                  } else if (
                    Array.isArray(rb.teacher) &&
                    rb.teacher.length > 0
                  ) {
                    // Teacher is an array
                    teacherName =
                      rb.teacher[0]?.fullname || rb.teacher[0]?.name || "";
                  }
                }
                // Fallback to other fields if teacher object/array doesn't have name
                if (!teacherName) {
                  teacherName =
                    (Array.isArray(rb?.teachers) && rb.teachers.length > 0
                      ? rb.teachers[0]?.fullname || rb.teachers[0]?.name
                      : undefined) ||
                    rb?.teacher_fullname ||
                    rb?.teacherFullname ||
                    rb?.teacher_name ||
                    (typeof rb?.teacher === "string" ? rb.teacher : "") ||
                    "";
                }

                const img = rb?.image || rb?.thumbnail || "/imgs/logo.png";
                return {
                  id: rb._id || rb.id || "",
                  title: rb.name || rb.title || "",
                  teacher: teacherName,
                  image: img,
                  originalPrice: Number(rb.origin_price || rb.oldPrice || 0),
                  salePrice: Number(rb.price || 0),
                  alias: rb.alias || rb._id || rb.id,
                } as RelatedBook;
              });
            setRelatedBooks(mappedRelated);
          } catch (relatedErr) {
            console.error("Error fetching related books:", relatedErr);
            // Fallback to empty array if API fails
            setRelatedBooks([]);
          }
        } else {
          setRelatedBooks([]);
        }
      } catch (err) {
        setError("Có lỗi xảy ra khi tải sách");
        console.error("Error fetching book:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [alias]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="text-red-600 text-lg mb-4">
            {error || "Không tìm thấy sách"}
          </div>
          <Link href="/sach" className="text-blue-600 hover:text-blue-800">
            ← Quay lại danh sách sách
          </Link>
        </div>
      </div>
    );
  }

  // Map API -> khung UI đã dựng
  const primaryTeacher = Array.isArray(extras.teacher)
    ? extras.teacher[0]
    : undefined;
  const teacherAvatar = primaryTeacher?.avatar
    ? primaryTeacher.avatar.startsWith("http")
      ? primaryTeacher.avatar
      : `${CDN_LINK}${primaryTeacher.avatar}`
    : "";
  const teacherFullname =
    primaryTeacher?.fullname || extras.classroomAttached?.[0]?.teacher || "";
  const teacherAlias =
    primaryTeacher?.alias || extras.classroomAttached?.[0]?.teacher_alias || "";
  // Promotion mapping from API: BY_HOUR => from_date + hour; BY_DATE_RANGE => to_date; fallback to to_date
  const apiPromotion: any = (book as any)?.promotion || {};
  const promoType = String(apiPromotion?.type || "");
  const fromMs = apiPromotion?.from_date
    ? new Date(apiPromotion.from_date).getTime()
    : undefined;
  const toMs = apiPromotion?.to_date
    ? new Date(apiPromotion.to_date).getTime()
    : undefined;
  let promoEnd: number | undefined;
  if (promoType === "BY_HOUR" && fromMs && apiPromotion?.hour) {
    promoEnd = fromMs + Number(apiPromotion.hour) * 3600 * 1000;
  } else if (promoType === "BY_DATE_RANGE" && toMs) {
    promoEnd = toMs;
  } else if (toMs) {
    promoEnd = toMs;
  }

  const detail: BookDetailData = {
    id: book._id,
    name: book.name,
    alias: book.alias,
    thumbnail: book.image || "/imgs/logo.png",
    price: Number(book.price || 0),
    oldPrice: Number(book.origin_price || book.price || 0),
    content: book.content || "",
    shortDescription: book.description || "",
    teacher: {
      id: book.teacher_id || "",
      name: teacherFullname,
      url: teacherAlias ? `/giao-vien/${teacherAlias}` : "#",
    },
    relatedCourse: undefined,
    stats: {
      lastUpdate: book.updated_at || new Date().toISOString(),
      studentCount:
        typeof book.student_owned === "number" &&
        !Number.isNaN(book.student_owned)
          ? book.student_owned
          : undefined,
      rating: undefined,
      reviewCount: undefined,
    },
    highlights: (extras.highlightInformations || []).map(
      (item: any, idx: number) => ({
        id: String(idx),
        icon: "/icon/ic_dautich.svg",
        title: item?.text || item?.title || "",
        description: item?.description || "",
      })
    ),
    includedItems: (extras.includes || []).map((it: any, idx: number) => ({
      id: String(idx),
      icon: it?.iconKey || "Book",
      text: it?.text || "",
    })),
    gifts: [],
    promotion: {
      discountPercent: book.origin_price
        ? Math.max(
            0,
            Math.round(
              100 -
                (Number(book.price || 0) * 100) / Number(book.origin_price || 1)
            )
          )
        : 0,
      countdownEnd: promoEnd ? new Date(promoEnd).toISOString() : "",
      note: apiPromotion?.note || "",
      type: promoType || undefined,
      hour: apiPromotion?.hour ? Number(apiPromotion.hour) : undefined,
      fromDate: apiPromotion?.from_date || undefined,
      toDate: apiPromotion?.to_date || undefined,
    },
    tabContent: {
      introduction: book.content || book.description || "",
      teacherInfo: teacherFullname
        ? `
          <div style="display:flex; gap:12px; align-items:center; margin-bottom:12px;">
            ${
              teacherAvatar
                ? `<img src="${teacherAvatar}" alt="${teacherFullname}" style="width:48px;height:48px;border-radius:9999px;object-fit:cover;" />`
                : ""
            }
            <div style="font-weight:600;">${teacherFullname}</div>
          </div>
        `
        : "",
      reviews: [],
    },
    previewLink: book.external_link,
  };

  // Map classroomAttached -> gift items & total amount (ưu tiên price, rồi origin_price)
  const giftItems = (extras.classroomAttached || []).map((c: any) => ({
    title: c?.name || "",
    href: c?.alias
      ? `/khoa-hoc/${c.alias}`
      : c?._id
      ? `/khoa-hoc/${c._id}`
      : "#",
    price: Number(c?.price ?? 0) || Number(c?.origin_price ?? 0) || 0,
  }));
  const giftAmount = giftItems.reduce(
    (s: number, it: any) => s + (Number(it?.price) || 0),
    0
  );

  const purchaseData: BookPurchaseCard = {
    image: detail.thumbnail,
    originalPrice: detail.oldPrice,
    salePrice: detail.price,
    discount: `${
      detail.oldPrice
        ? Math.max(
            0,
            Math.round(
              ((detail.oldPrice - detail.price) / detail.oldPrice) * 100
            )
          )
        : 0
    }%`,
    countdown: undefined,
    registrationDeadline: promoEnd
      ? new Date(promoEnd).toLocaleDateString("vi-VN")
      : undefined,
    includes: extras.includes || [],
    gifts: { title: "", items: [] },
    giftAmount,
    giftItems,
  } as any;

  // Use related books from API
  const related: RelatedBook[] = relatedBooks;

  const breadcrumbs = generateBreadcrumbs(detail.name);

  const handleAddToCart = async () => {
    if (!rootContext?.handleAddCart || isAddingToCart) return;

    setIsAddingToCart(true);
    try {
      await rootContext.handleAddCart({
        item_id: detail.id,
        name: detail.name,
        price: purchaseData.salePrice,
        qty: 1,
        type: "BOOK",
        image: detail.thumbnail,
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
      await rootContext.handleAddCart({
        item_id: detail.id,
        name: detail.name,
        price: purchaseData.salePrice,
        qty: 1,
        type: "BOOK",
        image: detail.thumbnail,
      });
      router.push("/gio-hang");
    } catch (error) {
      console.error("Error buying now:", error);
    } finally {
      setIsBuyingNow(false);
    }
  };

  return (
    <div className="book-detail-container">
      <div className="book-detail-layout">
        <div className="book-detail-content">
          {/* Breadcrumb */}
          <Breadcrumb items={breadcrumbs} />

          {/* Mobile-only product image: shown below breadcrumb, above header */}
          <div className="xl:hidden mobile-product-image-wrapper">
            <ResponsiveImageFrame
              src={detail.thumbnail}
              alt={detail.name}
              className="purchase-card-image"
              imageClassName="purchase-card-image"
            />
          </div>

          <BookDetailHeader book={detail} />
          {/* Mobile-only purchase card: shown below header and above highlights */}
          <div className="purchase-card-mobile" ref={purchaseCardRef}>
            <PurchaseCard
              data={purchaseData}
              book={detail}
              purchaseCardRef={purchaseCardRef}
            />
          </div>
          {detail.highlights.length > 0 && (
            <BookHighlightsGrid highlights={detail.highlights} />
          )}
          <BookTabs book={detail} teacher={primaryTeacher} />
        </div>
        <aside className="book-detail-sidebar">
          <PurchaseCard data={purchaseData} book={detail} />
        </aside>
      </div>
      {related.length > 0 && <RelatedBooks books={related} />}

      {/* Mobile Bottom Nav - Fixed at bottom */}
      <div className="detail-mobile-bottom-nav">
        <MobileBottomNav />
      </div>

      {/* Mobile Purchase Buttons - Above bottom nav */}
      <MobilePurchaseButtons
        itemId={detail.id}
        itemName={detail.name}
        price={purchaseData.salePrice}
        image={detail.thumbnail}
        type="BOOK"
        isAddingToCart={isAddingToCart}
        isBuyingNow={isBuyingNow}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />
    </div>
  );
}
