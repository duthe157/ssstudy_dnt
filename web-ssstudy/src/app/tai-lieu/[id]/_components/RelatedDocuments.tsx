"use client";

import Link from "next/link";
import Image from "next/image";
import { Document } from "@/types/document";

interface RelatedDocumentsProps {
  documents: Document[];
}

// Danh sách ảnh mẫu để random
const SAMPLE_IMAGES = [
  "/imgs/home/de-thi-ktcl-toan-12-lan-1-nam-2025-2026-truong-thpt-chuyen-khtn-ha-noi (1).png",
  "/imgs/home/de-thi-ktcl-toan-12-lan-1-nam-2025-2026-truong-thpt-chuyen-khtn-ha-noi.png",
  "/imgs/home/giai-bai-toan-hinh-hoc-khong-gian-bang-phuong-phap-phuc-hinh-va-trai-phang.png",
];

// Hàm lấy ảnh random dựa trên document id
const getRandomImage = (docId: string) => {
  let hash = 0;
  for (let i = 0; i < docId.length; i++) {
    const char = docId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  const index = Math.abs(hash) % SAMPLE_IMAGES.length;
  return SAMPLE_IMAGES[index];
};

// Format date to DD/MM/YYYY
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

export default function RelatedDocuments({ documents }: RelatedDocumentsProps) {
  if (!Array.isArray(documents) || documents.length === 0) return null;
  const displayedDocs = documents.slice(0, 4);

  return (
    <div className="related-documents-section relative w-full">
      <h2 className="section-title">Tài liệu liên quan</h2>

      <div className="related-documents-grid overflow-x-auto scrollbar-hide">
        {displayedDocs.map((doc: any) => (
          <Link
            key={doc._id}
            href={`/tai-lieu/${doc._id}`}
            className="related-document-card group"
          >
            {/* Document Image with blur overlay */}
            <div className="related-document-image relative overflow-hidden">
              <Image
                src={getRandomImage(doc._id)}
                alt={doc.name}
                width={279}
                height={210}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
              {/* Blur overlay */}
              <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />
            </div>

            {/* Document Content */}
            <div className="related-document-info text-left">
              {/* Document Title */}
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors min-h-[48px]">
                {doc.name}
              </h3>

              {/* Date */}
              <div className="text-sm text-gray-500 mb-3">
                {formatDate(doc.updated_at)}
              </div>

              {/* Stats Row: Downloads and Views */}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                {/* Lượt tải */}
                <div className="flex items-center gap-1">
                  <Image
                    src="/imgs/home/ic-luottaitailieu.svg"
                    alt="Lượt tải"
                    width={16}
                    height={16}
                  />
                  <span>{doc.download ?? 0}</span>
                </div>
                {/* Lượt xem */}
                <div className="flex items-center gap-1">
                  <Image
                    src="/imgs/home/ic-luotxemtailieu.svg"
                    alt="Lượt xem"
                    width={16}
                    height={16}
                  />
                  <span>{doc.viewed ?? 0}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
