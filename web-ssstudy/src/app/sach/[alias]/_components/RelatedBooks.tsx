"use client";

import { useEffect, useMemo, useState } from "react";
import { RelatedBook } from "./types";
import { formatPrice } from "./utils";
import Link from "next/link";
import { bookService } from "@/services/bookService";
import { ResponsiveImageFrame } from "@/components/ui/responsive-image-frame";

interface RelatedBooksProps {
  books: RelatedBook[];
}

export default function RelatedBooks({ books }: RelatedBooksProps) {
  const displayedBooks = useMemo(() => books.slice(0, 4), [books]);

  // Lazy fetch teacher name if missing
  const [teacherById, setTeacherById] = useState<Record<string, string>>({});
  useEffect(() => {
    const toLoad = displayedBooks.filter(
      (b) => !b.teacher && !teacherById[b.id]
    );
    if (toLoad.length === 0) return;
    let cancelled = false;
    (async () => {
      for (const b of toLoad) {
        try {
          const resp = await bookService.getBookDetail(b.id);
          const root: any = resp?.data;
          const data = root?.data?.book ?? root?.book;
          const teacherArr = Array.isArray(data?.teacher)
            ? data.teacher
            : undefined;
          const name =
            teacherArr?.[0]?.fullname ||
            teacherArr?.[0]?.name ||
            data?.teacher_name ||
            data?.teacher ||
            "";
          if (!cancelled && name) {
            setTeacherById((prev) => ({ ...prev, [b.id]: name }));
          }
        } catch (e) {
          // ignore
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [displayedBooks, teacherById]);

  if (!displayedBooks.length) {
    return null;
  }

  return (
    <div className="related-books-section relative w-full">
      <h2 className="section-title mb-4 text-xl font-semibold">
        Sách liên quan
      </h2>

      <div className="related-books-grid overflow-x-auto scrollbar-hide">
        {displayedBooks.map((book) => (
          <Link
            key={book.id}
            href={`/sach/${book.id}`}
            className="related-book-card"
          >
            <ResponsiveImageFrame
              src={book.image}
              alt={book.title}
              className="related-book-image"
              imageClassName="related-book-image__media"
            />
            <div className="related-book-info text-center">
              <h3 className="font-semibold text-base mb-1">{book.title}</h3>
              {(book.teacher || teacherById[book.id]) && (
                <p className="teacher-name text-sm text-gray-500 mb-2">
                  {book.teacher || teacherById[book.id]}
                </p>
              )}
              <div className="related-book-price flex justify-center gap-2 text-sm">
                <span className="price-sale text-red-500 font-medium">
                  {formatPrice(book.salePrice)}
                </span>
                <span className="price-original line-through text-gray-400">
                  {formatPrice(book.originalPrice)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
