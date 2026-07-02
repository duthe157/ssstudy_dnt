// Header của bài thi

import React from "react";

interface ExamHeaderProps {
  examName: string;
  currentPart: number;
  examParts: Array<{ name: string; id: string }>;
  displayMode: "SINGLE_QUESTION" | "PER_PART" | "FULL_EXAM";
  showSidebar?: boolean;
  onBackClick?: () => void;
  onLogoClick?: () => void;
  onToggleSidebar?: () => void;
}

const ExamHeader: React.FC<ExamHeaderProps> = ({
  examName,
  showSidebar = true,
  onBackClick,
  onLogoClick,
  onToggleSidebar,
}) => {
  return (
    <div
      className="sticky top-0 z-40 w-full border-b border-blue-100"
      style={{
        backgroundImage: "url('/imgs/home/Top.png')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <div className="flex items-center gap-3 px-4 md:px-6 py-2">
        <button
          aria-label="Quay lại"
          onClick={onBackClick}
          className="p-1 rounded hover:bg-blue-100 transition-colors"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#2563EB"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button
          aria-label="Trang chủ"
          onClick={onLogoClick}
          className="p-1 rounded hover:bg-blue-100 transition-colors"
        >
          <img src="/icon/logo.svg" alt="Logo" className="h-12 w-12" />
        </button>

        <div className="h-10 w-px bg-white/60"></div>

        <h1 className="text-[15px] font-semibold text-blue-700 truncate">
          {examName}
        </h1>
      </div>
    </div>
  );
};

export default ExamHeader;
