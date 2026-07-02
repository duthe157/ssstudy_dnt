import type { Metadata } from "next";
import { Suspense } from "react";
import CoursesPageClient from "./_components/CoursesPageClient";
import config from "@/config";

export const metadata: Metadata = {
  title: "Danh sách khóa học | SSStudy",
  description:
    "Khám phá các khóa học chất lượng cao tại SSStudy, nền tảng học tập trực tuyến hàng đầu Việt Nam",
  keywords: "khóa học, học trực tuyến, ssstudy, danh sách khóa học",
  openGraph: {
    title: "Danh sách khóa học | SSStudy",
    description:
      "Khám phá các khóa học chất lượng cao tại SSStudy, nền tảng học tập trực tuyến hàng đầu Việt Nam",
    url: `${
      config.siteUrl?.replace(/\/$/, "") || "https://ssstudy.vn"
    }/khoa-hoc`,
    siteName: "SSStudy",
    locale: "vi_VN",
    type: "website",
  },
};

export default function CoursesPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F6FA" }}>
      <Suspense fallback={<div>Đang tải khóa học...</div>}>
        <CoursesPageClient />
      </Suspense>
    </div>
  );
}
