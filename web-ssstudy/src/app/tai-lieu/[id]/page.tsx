import DocumentDetailClient from "@/app/tai-lieu/[id]/_components/DocumentDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Trang chi tiết tài liệu (Server Component)
 * Tuân thủ pattern chuẩn giống trang Chi tiết sách và Chi tiết khóa học
 */
export default async function DocumentDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F6FA" }}>
      <DocumentDetailClient documentId={id} />
    </div>
  );
}
