"use client";

import { Document, TeacherItem } from "@/types/document";
import Link from "next/link";
import Image from "next/image";

interface DocumentCardProps {
  document: Document;
  teachers: TeacherItem[];
  noShadow?: boolean;
}

// Extended Document interface for new API response
interface ExtendedDocument extends Document {
  viewed?: number;
  download?: number;
  doc_type?: string;
  document_type?: "FREE" | "PRO" | string;
  teacher?: string;
  main_category?: {
    id: string;
    name: string;
  };
  sub_category?: {
    id: string;
    name: string;
  };
  url?: string;
}

// Danh sách ảnh mẫu để random
const SAMPLE_IMAGES = [
  "/imgs/home/de-thi-ktcl-toan-12-lan-1-nam-2025-2026-truong-thpt-chuyen-khtn-ha-noi (1).png",
  "/imgs/home/de-thi-ktcl-toan-12-lan-1-nam-2025-2026-truong-thpt-chuyen-khtn-ha-noi.png",
  "/imgs/home/giai-bai-toan-hinh-hoc-khong-gian-bang-phuong-phap-phuc-hinh-va-trai-phang.png",
];

// Hàm lấy ảnh random dựa trên document id (để giữ consistent)
const getRandomImage = (docId: string) => {
  // Sử dụng hash của docId để chọn ảnh (consistent cho mỗi document)
  let hash = 0;
  for (let i = 0; i < docId.length; i++) {
    const char = docId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const index = Math.abs(hash) % SAMPLE_IMAGES.length;
  return SAMPLE_IMAGES[index];
};

export default function DocumentCard({
  document,
  teachers,
  noShadow = false,
}: DocumentCardProps) {
  const doc = document as ExtendedDocument;

  // Format date to DD/MM/YYYY - dùng updated_at
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

  // Lấy ảnh random dựa vào document id
  const imageUrl = getRandomImage(doc._id);

  return (
    <Link href={`/tai-lieu/${document._id}`} className="group">
      <div
        className={`bg-white rounded-lg border overflow-hidden transition-all duration-200 ${
          noShadow ? "" : "shadow-sm hover:shadow-lg hover:-translate-y-1"
        }`}
      >
        {/* Document Image with blur overlay */}
        <div className="relative w-full aspect-[279/210] bg-gray-100 overflow-hidden">
          <Image
            src={imageUrl}
            alt={doc.name}
            width={279}
            height={210}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
          {/* Blur overlay - làm mờ ảnh */}
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />

          {/* Free/Pro Tag */}
          <div className="absolute top-0 right-0 z-10">
            {doc.document_type === "FREE" ? (
              <span className="inline-flex items-center bg-[#22C55E] text-white px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm">
                Free
              </span>
            ) : doc.document_type === "PRO" ? (
              <span className="inline-flex items-center bg-[#4379EE] text-white px-3 py-1 rounded text-xs font-semibold whitespace-nowrap shadow-sm">
                <Image
                  src="/icon/crown-svgrepo-com.svg"
                  alt="Pro"
                  width={14}
                  height={14}
                  className="mr-1"
                />
                <span className="text-[#FFC107] font-bold">Pro</span>
              </span>
            ) : null}
          </div>
      
        </div>

        {/* Document Content */}
        <div className="p-4">
          {/* Document Title */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors min-h-[48px]">
            {doc.name}
          </h3>

          {/* Date - dùng updated_at */}
          <div className="text-sm text-gray-500 mb-3">
            {formatDate(doc.updated_at)}
          </div>

          {/* Stats Row: Downloads and Views - sát mép trái */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {/* Lượt tải trước */}
            <div className="flex items-center gap-1">
              <Image
                src="/imgs/home/ic-luottaitailieu.svg"
                alt="Lượt tải"
                width={16}
                height={16}
              />
              <span>{doc.download ?? 0}</span>
            </div>
            {/* Lượt xem sau */}
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
      </div>
    </Link>
  );
}



