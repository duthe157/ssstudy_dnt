"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQueryString } from "@/hooks/useQueryString";
import { authService } from "@/services/authService";
import { documentService } from "@/services/documentService";
import Breadcrumb from "@/components/ui/breadcrumb";
import RelatedDocuments from "./RelatedDocuments";
import LoginModal from "./LoginModal";
import dynamic from "next/dynamic";
import { Document } from "@/types/document";
import "../../documents.css";

const PdfPreview = dynamic(() => import("./PdfPreview"), {
  ssr: false,
  loading: () => <div className="py-20 text-center text-gray-400">Đang tải trình xem PDF...</div>
});

// Danh sách ảnh mẫu để random (giống DocumentCard.tsx)
const SAMPLE_IMAGES = [
  "/imgs/home/de-thi-ktcl-toan-12-lan-1-nam-2025-2026-truong-thpt-chuyen-khtn-ha-noi (1).png",
  "/imgs/home/de-thi-ktcl-toan-12-lan-1-nam-2025-2026-truong-thpt-chuyen-khtn-ha-noi.png",
  "/imgs/home/giai-bai-toan-hinh-hoc-khong-gian-bang-phuong-phap-phuc-hinh-va-trai-phang.png",
];

// Hàm lấy ảnh random dựa trên document id (giống DocumentCard.tsx)
const getRandomImage = (docId: string) => {
  if (!docId) return SAMPLE_IMAGES[0];
  let hash = 0;
  for (let i = 0; i < docId.length; i++) {
    const char = docId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  const index = Math.abs(hash) % SAMPLE_IMAGES.length;
  return SAMPLE_IMAGES[index];
};

// Extended Document interface for new API response
interface ExtendedDocument extends Document {
  viewed?: number;
  download?: number;
  doc_type?: string;
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
  google_name?: string;
  google_description?: string;
  classroom?: {
    id: string;
    name: string;
  };
  doc_link?: string | null;
  preview_pdf?: string;
  number_of_pages?: number;
}

interface DocumentDetailClientProps {
  documentId: string;
}

export default function DocumentDetailClient({ documentId }: DocumentDetailClientProps) {
  const searchParams = useSearchParams();
  const { updateQueryString } = useQueryString();
  const initialPage = parseInt(searchParams.get("page") || "1", 10);

  const [document, setDocument] = useState<ExtendedDocument | null>(null);
  const [relatedDocuments, setRelatedDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(initialPage);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Set container width for responsive PDF
  useEffect(() => {
    const updateWidth = () => {
      const container = window.document.getElementById("pdf-container");
      if (container) {
        setContainerWidth(container.clientWidth);
      }
    };
    if (document) {
      updateWidth();
    }
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [document]);

  useEffect(() => {
    setIsLoggedIn(authService.isLoggedIn());
  }, []);

  // Sync pageNumber with URL silently to avoid re-render loops
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const url = new URL(window.location.href);
    const currentPageInUrl = url.searchParams.get("page");
    
    if (currentPageInUrl !== pageNumber.toString()) {
      url.searchParams.set("page", pageNumber.toString());
      // Sử dụng replaceState để cập nhật URL mà không trigger re-render từ router
      window.history.replaceState({ ...window.history.state, page: pageNumber }, "", url.pathname + url.search);
    }
  }, [pageNumber]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    // Only reset to 1 if no initial page from URL
    if (!searchParams.get("page")) {
      setPageNumber(1);
    }
  }

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => {
    if (document && pageNumber < (document.number_of_pages || numPages)) {
      const nextP = pageNumber + 1;
      setPageNumber(nextP);
      if (!isLoggedIn && nextP > numPages) {
        setShowLoginModal(true);
      }
    }
  };

  // Format date to "Thứ X, DD/MM/YYYY"
  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return "";
      const date = new Date(dateString);
      const days = [
        "Chủ nhật",
        "Thứ 2",
        "Thứ 3",
        "Thứ 4",
        "Thứ 5",
        "Thứ 6",
        "Thứ 7",
      ];
      const dayName = days[date.getDay()];
      const formattedDate = date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      return `${dayName}, ${formattedDate}`;
    } catch {
      return "";
    }
  };

  // Fetch document detail
  useEffect(() => {
    const fetchDocumentDetail = async () => {
      if (!documentId) return;

      // console.log("Fetching document detail for ID:", documentId);
      try {
        setLoading(true);
        const response = await documentService.getDocumentDetail(documentId);
        // console.log("Document Detail Response:", response);

        const root = (response as any)?.data ?? response;
        const data = root?.document || root?.data || (root?._id ? root : null);

        if (data) {
          setDocument(data as ExtendedDocument);
        } else {
          console.warn("No document data found in response");
        }
      } catch (error) {
        console.error("Failed to fetch document detail:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentDetail();
  }, [documentId]);

  // Fetch related documents
  useEffect(() => {
    const fetchRelatedDocuments = async () => {
      if (!document) return;

      try {
        setRelatedLoading(true);
        const response = await documentService.getRelatedDocuments(
          document._id || (document as any).id
        );
        
        const root = (response as any)?.data ?? response;
        const relatedData = root?.records || root?.items || (Array.isArray(root) ? root : []);
        setRelatedDocuments(relatedData);
      } catch (error) {
        console.error("Failed to fetch related documents:", error);
      } finally {
        setRelatedLoading(false);
      }
    };

    fetchRelatedDocuments();
  }, [document]);

  // Handle download
  const handleDownload = () => {
    const downloadUrl = (document as any)?.doc_link || document?.url || document?.external_link;
    if (downloadUrl) {
      window.open(downloadUrl, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-10 bg-gray-200 rounded w-2/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">
            Không tìm thấy tài liệu (ID: {documentId})
          </div>
          <Link href="/tai-lieu" className="text-blue-600 hover:underline">
            Quay lại danh sách tài liệu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F6FA] py-4 xl:py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Trang chủ", href: "/" },
            { label: "Tài liệu", href: "/tai-lieu" },
            { label: document.name },
          ]}
        />

        {/* Info Card - Top Box */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mt-4">
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-8">
            {document.name}
          </h1>

          <div className="flex flex-wrap items-center gap-8">
            <div className="flex items-center gap-2 text-[#666666]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium">{formatDate(document.updated_at)}</span>
            </div>

            <div className="flex items-center gap-2 text-[#666666]">
              <Image src="/imgs/home/ic-luotxemtailieu.svg" alt="" width={20} height={20} className="opacity-70" />
              <span className="text-sm font-medium">{document.viewed ?? 0} lượt xem</span>
            </div>

            <div className="flex items-center gap-2 text-[#666666]">
              <Image src="/imgs/home/ic-luottaitailieu.svg" alt="" width={20} height={20} className="opacity-70" />
              <span className="text-sm font-medium">{document.download ?? 0} lượt tải</span>
            </div>

            <button
              onClick={handleDownload}
              className="ml-auto bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-8 py-3 rounded-full flex items-center gap-2 transition-all font-semibold shadow-md active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Tải tài liệu
            </button>
          </div>
        </div>

        {/* Description Section - Plain text area without container */}
        <div className="mt-8">
          <div className="prose max-w-none">
            <div
              className={`text-[#4B5563] text-lg leading-relaxed ${
                (document.description || document.content || "").length > 1000 
                  ? "max-h-[600px] overflow-y-auto pr-4 custom-scrollbar" 
                  : ""
              }`}
              dangerouslySetInnerHTML={{
                __html: document.description || document.content || "",
              }}
            />
          </div>

          {(document.doc_link || document.url || document.external_link) && (
            <div className="mt-8 flex items-center gap-2 text-lg">
              <span className="text-[#666666]">File:</span>
              <button
                onClick={handleDownload}
                className="text-[#2563EB] font-bold hover:underline"
              >
                TẢI XUỐNG
              </button>
            </div>
          )}
        </div>

        {/* PDF Preview Section */}
        {(document.doc_link || document.preview_pdf) && (
          <div className="mt-10 flex flex-col items-center">
            <div 
              id="pdf-container"
              className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* PDF Content Area */}
              <div className="max-h-[800px] overflow-y-auto w-full flex justify-center custom-scrollbar bg-gray-50/30 py-6 border-b border-gray-50">
                {containerWidth > 0 ? (
                  <PdfPreview
                    file={document.doc_link || (document.preview_pdf ? `data:application/pdf;base64,${document.preview_pdf}` : "")}
                    pageNumber={pageNumber}
                    numPages={isLoggedIn ? (document.number_of_pages || numPages) : numPages}
                    containerWidth={containerWidth}
                    onLoadSuccess={onDocumentLoadSuccess}
                    getRandomImage={getRandomImage}
                    documentId={document._id}
                    documentName={document.name}
                  />
                ) : (
                  <div className="py-20 text-center text-gray-400">Đang khởi tạo...</div>
                )}
              </div>

              {/* Seamless Pagination Controls */}
              {numPages > 0 && (
                <div className="w-full bg-white p-4 flex items-center justify-center gap-6">
                  <button
                    type="button"
                    disabled={pageNumber <= 1}
                    onClick={previousPage}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-20 disabled:cursor-not-allowed text-[#1F2937]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <div className="flex items-center gap-2 text-lg font-medium text-[#4B5563]">
                    <span className="text-[#2563EB]">{pageNumber}</span>
                    <span className="text-gray-300">/</span>
                    <span>{document.number_of_pages || numPages}</span>
                  </div>

                  <button
                    type="button"
                    disabled={pageNumber >= (document.number_of_pages || numPages)}
                    onClick={nextPage}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-20 disabled:cursor-not-allowed text-[#1F2937]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Related Documents - Only show if there are related documents */}
        {relatedLoading ? (
          <div className="mt-10">
            <div className="related-documents-section">
              <h2 className="section-title">Tài liệu liên quan</h2>
              <div className="related-documents-grid">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="related-document-card animate-pulse"
                  >
                    <div className="related-document-image bg-gray-200"></div>
                    <div className="related-document-info">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : relatedDocuments.length > 0 ? (
          <div className="mt-10">
            <RelatedDocuments documents={relatedDocuments} />
          </div>
        ) : null}

        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          redirectUrl={typeof window !== "undefined" ? window.location.href : ""}
        />
      </div>
    </div>
  );
}
