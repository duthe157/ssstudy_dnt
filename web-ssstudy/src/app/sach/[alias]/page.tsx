import "../books.css";
import BookDetailClient from "./_components/BookDetailClient";

interface PageProps {
  params: Promise<{ alias: string }>;
}

export default async function BookDetailPage({ params }: PageProps) {
  const { alias } = await params;
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F6FA" }}>
      <BookDetailClient alias={alias} />
    </div>
  );
}
