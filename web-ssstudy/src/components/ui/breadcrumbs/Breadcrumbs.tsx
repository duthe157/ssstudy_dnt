"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { apiService } from "../../../services/api";

let LABEL_MAP: Record<string, string> = {
  "giao-vien": "Giáo viên",
  account: "Thông tin cá nhân",
  "order-history": "Đơn hàng",
  "change-password": "Thay đổi mật khẩu",
  "my-course": "Khóa học của tôi",
  "ceo-nguyen-tien-dat": "CEO Nguyễn Tiến Đạt",
};

// Danh sách các alias cần check
let DETAIL_PAGE_ALIASES = [
  "lich-livestream",
  "hoat-dong-su-kien",
  "bai-viet-bao-chi",
  "ve-ssstudy",
  "chinh-sach",
  "tin-tuc",
];

export default function Breadcrumbs() {
  const pathname = usePathname();
  const pathSegments = pathname?.split("/").filter(Boolean) || [];
  const [title, setTitle] = useState<string | null>(null);
  const [postCategories, setPostCategories] = useState<any[]>([]);

  async function fetchNewsCategories() {
    try {
      const jsonCat = (await apiService.post("blog-category/list", {})) as any;
      const categories = jsonCat.data.records;
      setPostCategories(categories);

      //  Cập nhật DETAIL_PAGE_ALIASES
      categories.forEach((cat: any) => {
        if (!DETAIL_PAGE_ALIASES.includes(cat.alias)) {
          DETAIL_PAGE_ALIASES.push(cat.alias);
        }
      });

      //  Cập nhật LABEL_MAP
      categories.forEach((cat: any) => {
        LABEL_MAP[cat.alias] = cat.name;
      });
    } catch (err) {
      console.error("Error fetching data", err);
    }
  }

  useEffect(() => {
    fetchNewsCategories();
  }, []);

  // 🔍 Nếu là bài viết tin tức, lấy <h1> làm tiêu đề
  useEffect(() => {
    if (
      pathSegments.length === 2 &&
      DETAIL_PAGE_ALIASES.includes(pathSegments[0])
    ) {
      const h1 = document.querySelector("h1");
      if (h1) setTitle(h1.textContent?.trim() || "");
    }
  }, [pathname, pathSegments]);

  if (
    pathSegments.length === 2 &&
    DETAIL_PAGE_ALIASES.includes(pathSegments[0])
  ) {
    const secondSegment = pathSegments[0];
    const mappedLabel =
      LABEL_MAP[secondSegment] ||
      decodeURIComponent(secondSegment.replace(/-/g, " "));

    return (
      <nav className="flex items-center text-sm text-gray-600 space-x-1 mb-4">
        <Link href="/" className="hover:underline text-blue-600">
          Trang chủ
        </Link>
        <ChevronRight size={14} className="mx-1" />
        <Link href={`/${secondSegment}`}>
          <span className="font-medium text-gray-800">{mappedLabel}</span>
        </Link>
      </nav>
    );
  }

  // 🧩 Trường hợp 1: Bài viết trong /tin-tuc/ (>= 3 segment)
  if (pathname?.includes("/tin-tuc/") && pathSegments.length > 2) {
    return (
      <nav className="flex items-center text-sm text-gray-600 space-x-1 mb-4">
        <Link href="/" className="hover:underline text-blue-600">
          Trang chủ
        </Link>
        {/* <ChevronRight size={14} className="mx-1" /> */}
        {/* <span className="font-medium text-gray-800">Tin tức</span> */}
        {title && (
          <>
            <ChevronRight size={14} className="mx-1" />
            <span className="font-medium text-gray-800">{title}</span>
          </>
        )}
      </nav>
    );
  }

  // 🧩 Trường hợp 2: /tin-tuc/... có đúng 2 segment
  if (pathname?.includes("/tin-tuc/") && pathSegments.length === 2) {
    const secondSegment = pathSegments[1];
    const mappedLabel =
      LABEL_MAP[secondSegment] ||
      decodeURIComponent(secondSegment.replace(/-/g, " "));

    return (
      <nav className="flex items-center text-sm text-gray-600 space-x-1 mb-4">
        <Link href="/" className="hover:underline text-blue-600">
          Trang chủ
        </Link>
        <ChevronRight size={14} className="mx-1" />
        <span className="font-medium text-gray-800">{mappedLabel}</span>
      </nav>
    );
  }

  const breadcrumbs = pathSegments
    ?.map((segment, index) => {
      const href = "/" + pathSegments.slice(0, index + 1).join("/");
      const decodedSegment = decodeURIComponent(segment.replace(/-/g, " "));
      const mappedLabel = LABEL_MAP[segment];

      if (!mappedLabel) return null; //  skip nếu không có label

      return {
        href,
        label: mappedLabel,
      };
    })
    .filter(Boolean); //  lọc ra những phần không null

  return (
    <nav className="flex items-center text-sm text-gray-600 space-x-1 mb-4">
      <Link href="/" className="hover:underline text-blue-600">
        Trang chủ
      </Link>
      {breadcrumbs?.map((crumb, index) => (
        <span key={index} className="flex items-center space-x-1">
          <ChevronRight size={14} className="mx-1" />
          {index === breadcrumbs.length - 1 ? (
            <span className="font-medium text-gray-800">{crumb?.label}</span>
          ) : (
            <Link href={crumb?.href || '#'} className="hover:underline text-blue-600">
              {crumb?.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
