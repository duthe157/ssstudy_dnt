import type { Metadata } from "next";
import { Suspense } from "react";
import DocumentPageClient from "./_components/DocumentPageClient";
import "./documents.css";
import config from "@/config";

export const metadata: Metadata = {
  title: "Danh sách tài liệu | SSStudy",
  description:
    "Khám phá các tài liệu chất lượng cao tại SSStudy, nền tảng học tập trực tuyến hàng đầu Việt Nam",
  keywords: "tài liệu, học trực tuyến, ssstudy, danh sách tài liệu",
  openGraph: {
    title: "Danh sách tài liệu | SSStudy",
    description:
      "Khám phá các tài liệu chất lượng cao tại SSStudy, nền tảng học tập trực tuyến hàng đầu Việt Nam",
    url: `${
      config.siteUrl?.replace(/\/$/, "") || "https://ssstudy.vn"
    }/tai-lieu`,
    siteName: "SSStudy",
    locale: "vi_VN",
    type: "website",
  },
};

export default function DocumentPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F6FA" }}>
      <Suspense fallback={<div className="text-center py-8">Đang tải...</div>}>
        <DocumentPageClient />
      </Suspense>
    </div>
  );
}
