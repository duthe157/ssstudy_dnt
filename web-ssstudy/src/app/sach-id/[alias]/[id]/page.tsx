import type { Metadata } from "next";
import "../khoa-hoc/courses.css";
import BookIdCourseDetailClient from "../khoa-hoc/_components/BookIdCourseDetailClient";
import { getCourseData } from "../khoa-hoc/_components/getCourseData";
import config from "@/config";

// Tạo metadata động dựa trên dữ liệu khóa học
export async function generateMetadata({
  params,
}: {
  params: Promise<{ alias: string; id: string }>;
}): Promise<Metadata> {
  const { alias, id } = await params;
  const course = await getCourseData(id);

  return {
    title: `Khóa học ${course.title} | SSStudy`,
    description: course.description,
    openGraph: {
      title: `Khóa học ${course.title} | SSStudy`,
      description: course.description,
      url: `${
        config.siteUrl?.replace(/\/$/, "") || "https://ssstudy.vn"
      }/sach-id/${alias}/${course.alias || id}`,
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

export default async function BookIdCourseDetailPage({
  params,
}: {
  params: Promise<{ alias: string; id: string }>;
}) {
  const { alias, id } = await params;
  const course = await getCourseData(id);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F6FA" }}>
      <BookIdCourseDetailClient courseId={course.id} bookAlias={alias} />
    </div>
  );
}
