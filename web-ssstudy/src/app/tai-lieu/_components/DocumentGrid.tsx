"use client";

import { Document, TeacherItem } from "@/types/document";
import DocumentCard from "./DocumentCard";

interface DocumentGridProps {
  documents: Document[];
  loading: boolean;
  paginationLoading: boolean;
  teachers: TeacherItem[];
  noShadow?: boolean;
}

export default function DocumentGrid({
  documents,
  loading,
  paginationLoading,
  teachers,
  noShadow = false,
}: DocumentGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className={`bg-white rounded-lg border overflow-hidden animate-pulse ${
              noShadow ? "" : "shadow-sm"
            }`}
          >
            <div className="w-full max-w-[279px] mx-auto aspect-[279/210] bg-gray-200"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">
          Không tìm thấy tài liệu nào
        </div>
        <div className="text-gray-400">
          Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Pagination Loading Overlay */}
      {paginationLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Đang tải...</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {documents.map((document) => (
          <DocumentCard
            key={document._id}
            document={document}
            teachers={teachers}
            noShadow={noShadow}
          />
        ))}
      </div>
    </div>
  );
}
