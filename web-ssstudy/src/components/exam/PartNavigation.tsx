// Các nút câu trước, câu sau, ẩn hiện menu bài thi
interface PartNavigationProps {
  currentPart: number;
  totalParts: number;
  partNames: string[];
  onNextPart: () => void;
  onPrevPart: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  onSubmitPart: () => void;
  isLastPart: boolean;
  isFirstPart: boolean;
  // Props cho điều hướng câu hỏi
  onNextQuestion: () => void;
  onPrevQuestion: () => void;
  canGoNextQuestion: boolean;
  canGoPrevQuestion: boolean;
  // Props cho menu nộp bài
  onToggleFullScreen?: () => void;
}

const PartNavigation: React.FC<PartNavigationProps> = ({
  currentPart,
  totalParts,
  partNames,
  onNextPart,
  onPrevPart,
  canGoNext,
  canGoPrev,
  onSubmitPart,
  isLastPart,
  isFirstPart,
  onNextQuestion,
  onPrevQuestion,
  canGoNextQuestion,
  canGoPrevQuestion,
  onToggleFullScreen,
}) => {
  return (
    <div className="bg-white border-t border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Question navigation */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onPrevQuestion}
            disabled={!canGoPrevQuestion}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
          >
            ← Câu trước
          </button>
          <button
            onClick={onNextQuestion}
            disabled={!canGoNextQuestion}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Câu tiếp →
          </button>
        </div>

        {/* Right side - Menu nộp bài */}
        {onToggleFullScreen && (
          <div className="group">
            <div
              onClick={onToggleFullScreen}
              className="flex items-center gap-2 cursor-pointer"
            >
              <span className="text-gray-700 font-medium">Menu nộp bài</span>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-all duration-200">
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentPart + 1) / totalParts) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default PartNavigation;
