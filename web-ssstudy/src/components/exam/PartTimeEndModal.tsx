import React from "react";

interface PartTimeEndModalProps {
  isOpen: boolean;
  sectionName?: string | null;
  remainingSeconds: number | null;
  onSkipNow: () => void;
}

const PartTimeEndModal: React.FC<PartTimeEndModalProps> = ({
  isOpen,
  sectionName,
  remainingSeconds,
  onSkipNow,
}) => {
  if (!isOpen) return null;

  const remaining =
    typeof remainingSeconds === "number" && remainingSeconds >= 0
      ? remainingSeconds
      : 0;

  const minutes = String(Math.floor(remaining / 60)).padStart(2, "0");
  const seconds = String(remaining % 60).padStart(2, "0");

  const handleSkipNow = () => {
    onSkipNow();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 sm:px-6">
      <div className="w-full max-w-lg rounded-3xl bg-white px-8 py-10 text-center shadow-2xl sm:px-12 sm:py-14">
        <div className="mb-8 sm:mb-10">
          <p className="text-base font-semibold uppercase tracking-wide text-sky-900 sm:text-lg">
            {sectionName || "Phần thi"}
          </p>
          <p className="mt-2 text-xl font-semibold text-gray-900 sm:text-2xl">
            Hết thời gian
          </p>
        </div>

        <p className="mb-10 text-sm leading-relaxed text-gray-700 sm:text-base">
          Phần thi này đã kết thúc.
          <br />
          Hệ thống sẽ tự chuyển sang phần thi tiếp theo.
        </p>

        <div className="mb-10 text-4xl font-semibold tracking-widest text-sky-900 sm:text-5xl">
          {minutes}:{seconds}
        </div>

        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={handleSkipNow}
            className="flex h-24 w-24 items-center justify-center rounded-full bg-sky-800 text-xs font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:bg-sky-900 sm:h-28 sm:w-28 sm:text-sm"
          >
            Chuyển
            <br />
            ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartTimeEndModal;
