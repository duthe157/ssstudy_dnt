import React from "react";

interface StopConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const StopConfirmModal: React.FC<StopConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="mb-6 text-center text-[18px] font-semibold text-[#2A7BF2]">
          Bạn có muốn dừng làm bài thi?
        </h3>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onClose}
            className="min-w-[120px] rounded-lg border border-[#2A7BF2] bg-white px-4 py-2 text-sm font-medium text-[#2A7BF2] hover:bg-[#EAF2FF]"
          >
            Đóng
          </button>
          <button
            onClick={onConfirm}
            className="min-w-[120px] rounded-lg bg-[#2A7BF2] px-4 py-2 text-sm font-medium text-white hover:brightness-95"
          >
            Đồng ý
          </button>
        </div>
      </div>
    </div>
  );
};

export default StopConfirmModal;
