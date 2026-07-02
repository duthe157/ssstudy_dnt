import type { Metadata } from "next";
import "../courses.css";
import CourseDetailClient from "../_components/CourseDetailClient";
import { getCourseData } from "./getCourseData";
import config from "@/config";

// Tạo metadata động dựa trên dữ liệu khóa học
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const course = await getCourseData(id);

  return {
    title: `${course.title} | SSStudy`,
    description: course.description,
    openGraph: {
      title: `${course.title} | SSStudy`,
      description: course.description,
      url: `${
        config.siteUrl?.replace(/\/$/, "") || "https://ssstudy.vn"
      }/khoa-hoc/${course.id}`,
      siteName: "SSStudy",
      locale: "vi_VN",
      type: "article",
      images: [
        {
          url: course.image,
          width: 1200,
          height: 630,
          alt: course.title,
        },
      ],
    },
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await getCourseData(id);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F6FA" }}>
      <CourseDetailClient courseId={course.id} />
    </div>
  );
}
