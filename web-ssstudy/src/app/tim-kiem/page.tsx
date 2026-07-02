import type { Metadata } from "next";
import { Suspense } from "react";
import SearchPageClient from "./_components/SearchPageClient";

export const metadata: Metadata = {
  title: "Tìm kiếm | SSStudy",
  description: "Tìm kiếm khóa học và sách tại SSStudy",
  keywords: "tìm kiếm, khóa học, sách, ssstudy",
  openGraph: {
    title: "Tìm kiếm | SSStudy",
    description: "Tìm kiếm khóa học và sách tại SSStudy",
    url: "https://ssstudy.vn/tim-kiem",
    siteName: "SSStudy",
    locale: "vi_VN",
    type: "website",
  },
};

export default function SearchPage() {
  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: "#F5F6FA" }}>
      <Suspense fallback={<div className="text-center py-8">Đang tải...</div>}>
        <SearchPageClient />
      </Suspense>
    </div>
  );
}
