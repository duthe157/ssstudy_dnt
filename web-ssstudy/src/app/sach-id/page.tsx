import type { Metadata } from "next";
import { Suspense } from "react";
import BookPageClient from "./_components/BookPageClient";
import "./books.css";
import config from "@/config";

export const metadata: Metadata = {
  title: "Danh sách sách ID | SSStudy",
  description:
    "Khám phá các sách chất lượng cao tại SSStudy, nền tảng học tập trực tuyến hàng đầu Việt Nam",
  keywords: "sách, học trực tuyến, ssstudy, danh sách sách",
  openGraph: {
    title: "Danh sách sách | SSStudy",
    description:
      "Khám phá các sách chất lượng cao tại SSStudy, nền tảng học tập trực tuyến hàng đầu Việt Nam",
    url: `${config.siteUrl?.replace(/\/$/, "") || "https://ssstudy.vn"}/sach-id`,
    siteName: "SSStudy",
    locale: "vi_VN",
    type: "website",
  },
};

export default function BookPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F6FA" }}>
      <Suspense fallback={<div className="text-center py-8">Đang tải...</div>}>
        <BookPageClient />
      </Suspense>
    </div>
  );
}
