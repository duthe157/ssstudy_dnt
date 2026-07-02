import ScoreReview from "@/components/score-review";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Điểm và Review | SSStudy",
  description:
    "Khám phá các khóa học chất lượng cao tại SSStudy, nền tảng học tập trực tuyến hàng đầu Việt Nam",
  keywords: "khóa học, học trực tuyến, ssstudy, điểm, review",
  openGraph: {
    title: "Điểm và Review | SSStudy",
    description:
      "Khám phá các khóa học chất lượng cao tại SSStudy, nền tảng học tập trực tuyến hàng đầu Việt Nam",
    url: "https://ssstudy.vn/diem-review",
    siteName: "SSStudy",
    locale: "vi_VN",
    type: "website",
  },
};

export default function ScoreReviewPage() {
  return <ScoreReview />;
}
