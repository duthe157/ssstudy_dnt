import React from "react";

interface CheatWarningModalProps {
  open: boolean;
  onClose: () => void;
  onExit?: () => void;
  message?: string;
  showActions?: boolean;
  singleButton?: boolean;
  buttonText?: string;
}

const CheatWarningModal: React.FC<CheatWarningModalProps> = ({
  open,
  onClose,
  onExit,
  message = "Thao tác này không hợp lệ trong khi làm bài thi!\nBạn có muốn tiếp tục làm bài thi không?",
  showActions = true,
  singleButton = false,
  buttonText = "Đóng",
}) => {
  if (!open) return null;

  const formatMessage = (text: string) => {
    return text.split(/\\n|\n/).map((line, index) => (
      <p key={index} className="mb-1">
        {line.trim()}
      </p>
    ));
  };

  const handleExit = () => {
    if (onExit) {
      onExit();
    } else {
      onClose();
    }
  };

  const handleContinue = () => {
    onClose();
  };

  // Xử lý click vào backdrop
  const handleBackdropClick = () => {
    onClose();
  };

  // Ngăn chặn sự kiện click lan truyền từ modal content
  const handleModalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4">
      {/* Backdrop - click vào đây sẽ đóng modal */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={handleBackdropClick}
      />

      {/* Modal content - click vào đây sẽ KHÔNG đóng modal */}
      <div
        className="relative z-[1001] w-full max-w-[700px] rounded-2xl bg-white shadow-2xl"
        onClick={handleModalClick}
      >
        {/* Header */}
        <div className="relative border-b border-gray-200 px-6 py-5">
          <div className="flex items-center justify-center gap-3">
            <img
              src="/icon/ic-thongbao.svg"
              alt="Warning"
              className="h-8 w-8"
            />
            <h3 className="text-2xl font-bold text-[#1e293b]">Thông báo</h3>
          </div>

          {/* Nút đóng */}
          <button
            type="button"
            aria-label="Đóng"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-3xl text-gray-400 hover:text-gray-600 transition-colors leading-none"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-8">
          <div className="text-center text-[15px] leading-relaxed text-gray-700">
            {formatMessage(message)}
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="px-8 pb-8">
            <div
              className={
                singleButton ? "flex justify-center" : "grid grid-cols-2 gap-4"
              }
            >
              {singleButton ? (
                <button
                  type="button"
                  className="h-12 rounded-lg bg-blue-500 px-8 text-base font-semibold text-white hover:bg-blue-600 transition-colors"
                  onClick={onClose}
                >
                  {buttonText}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="h-12 rounded-lg bg-[#fce8e8] text-base font-semibold text-[#dc2626] hover:bg-[#fbd5d5] transition-colors"
                    onClick={handleExit}
                  >
                    Thoát
                  </button>

                  <button
                    type="button"
                    className="h-12 rounded-lg bg-[#4ade80] text-base font-semibold text-white hover:bg-[#22c55e] transition-colors"
                    onClick={handleContinue}
                  >
                    Tiếp tục
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheatWarningModal;
