"use client";

import { Document as PDFDocument, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import Image from "next/image";
import { useState } from "react";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfPreviewProps {
  file: string;
  pageNumber: number;
  numPages: number; // Logic limit (preview or total)
  containerWidth: number;
  onLoadSuccess: (data: { numPages: number }) => void;
  getRandomImage: (docId: string) => string;
  documentId: string;
  documentName: string;
}

export default function PdfPreview({
  file,
  pageNumber,
  numPages,
  containerWidth,
  onLoadSuccess,
  getRandomImage,
  documentId,
  documentName,
}: PdfPreviewProps) {
  const [internalNumPages, setInternalNumPages] = useState(0);

  const handleLoadSuccess = (data: { numPages: number }) => {
    setInternalNumPages(data.numPages);
    onLoadSuccess(data);
  };

  // Safety check: Only render Page if it's within the actual loaded PDF pages
  const canShowPage = internalNumPages > 0 && pageNumber <= internalNumPages && pageNumber <= numPages;
  // Show blurred image if we are past the logical limit
  const shouldShowBlur = pageNumber > numPages;

  return (
    <PDFDocument
      file={file}
      onLoadSuccess={handleLoadSuccess}
      loading={
        <div className="py-20 text-center text-gray-400">Đang tải tài liệu...</div>
      }
      error={
        <div className="py-20 text-center text-red-500 bg-red-50 rounded-lg p-6 border border-red-100 my-10 mx-auto max-w-md">
           <div className="font-semibold mb-1">Không thể tải tài liệu</div>
        </div>
      }
    >
      {shouldShowBlur ? (
        <div
          style={{ width: containerWidth * 0.6, height: 800 }}
          className="relative bg-white shadow-xl border border-gray-200 overflow-hidden"
        >
          <Image
            src={getRandomImage(documentId)}
            alt={documentName}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[4px]" />
        </div>
      ) : (
        canShowPage ? (
          <Page
            pageNumber={pageNumber}
            width={containerWidth * 0.6}
            renderAnnotationLayer={false}
            renderTextLayer={false}
            className="shadow-xl border border-gray-200"
          />
        ) : (
          /* While loading internalNumPages or if page is invalid, we show a clean placeholder */
          <div 
            style={{ width: containerWidth * 0.6, height: 800 }} 
            className="bg-white/50 animate-pulse border border-gray-100 rounded-lg"
          />
        )
      )}
    </PDFDocument>
  );
}
