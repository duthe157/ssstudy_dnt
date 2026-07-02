// Xãc nhận chuyển phần

import React from "react";

interface SubmitConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  sectionName?: string | null;
  answeredCount?: number;
  totalCount?: number;
  title?: string;
  isSectionSubmit?: boolean;
  currentPart?: number;
  totalParts?: number;
  timeLabel?: string;
}

const SubmitConfirmModal: React.FC<SubmitConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  sectionName = null,
  answeredCount = 0,
  totalCount = 0,
  title = "Xác nhận nộp bài",
  isSectionSubmit = false,
  currentPart = 0,
  totalParts = 1,
  timeLabel,
}) => {
  if (!isOpen) return null;

  const percent =
    totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-7 shadow-2xl">
        {/* Close button */}
        <button
          aria-label="Đóng"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path
              fillRule="evenodd"
              d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Title */}
        <div className="mb-6 text-center">
          <h3 className="text-xl font-semibold text-gray-900">
            {isSectionSubmit ? "Xác nhận nộp bài phần" : "Xác nhận nộp bài thi"}
          </h3>
          {isSectionSubmit && sectionName && (
            <p className="mt-3 text-lg font-semibold text-blue-600">
              {sectionName}
            </p>
          )}
        </div>

        {/* Progress Circle */}
        <div className="mb-6 flex items-center justify-center">
          <div className="relative h-32 w-32">
            {/* Background circle */}
            <svg
              className="h-32 w-32 -rotate-90 transform"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#E5E7EB"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#3B82F6"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${(percent * 251.2) / 100} 251.2`}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-gray-900">
                {answeredCount}/{totalCount}
              </div>
              <div className="text-xs text-gray-600">Câu đã trả lời</div>
            </div>
          </div>
        </div>

        {/* Warning message */}
        <div className="mb-6 text-center">
          {(() => {
            const target =
              isSectionSubmit && sectionName ? sectionName : "bài thi";
            return (
              <p className="text-sm text-gray-700 leading-relaxed">
                {`Bạn đã hoàn thành phần/bài thi chưa?. Bạn có chắc chắn muốn nộp phần/bài thi này ?`}
              </p>
            );
          })()}

          {/* Warning note */}
          <div className="mt-4 flex items-start gap-3 rounded-lg bg-orange-50 p-3">
            <img
              src={encodeURI("/icon/icon-canhbao.svg")}
              alt="Cảnh báo"
              className="h-5 w-5 mt-0.5"
            />
            <p className="text-sm text-orange-800">
              <span className="font-medium">Lưu ý:</span> Sau khi nộp bài phần
              này, bạn không thể quay lại để chỉnh sửa đáp án.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Làm tiếp
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700"
          >
            {isSectionSubmit ? "Nộp bài phần này" : "Nộp bài"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmitConfirmModal;
