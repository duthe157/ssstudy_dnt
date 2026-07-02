// Thanh điều hướng menu câu hỏi

import React from "react";

interface QuestionNavigationProps {
  currentQuestion: number;
  totalQuestions: number;
  onNextQuestion: () => void;
  onPrevQuestion: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  onNavigateToQuestion: (questionIndex: number) => void;
  userAnswers: { [key: string]: { answer: any } };
  flaggedQuestions: Set<string>;
  questions: Array<{ _id: string; number?: number }>;
}

const QuestionNavigation: React.FC<QuestionNavigationProps> = ({
  currentQuestion,
  totalQuestions,
  onNextQuestion,
  onPrevQuestion,
  canGoNext,
  canGoPrev,
  onNavigateToQuestion,
  userAnswers,
  flaggedQuestions,
  questions,
}) => {
  const getQuestionStatus = (questionId: string) => {
    if (flaggedQuestions.has(questionId)) {
      return "flagged";
    }
    if (userAnswers[questionId]?.answer) {
      return "answered";
    }
    return "unanswered";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "answered":
        return "bg-green-500 text-white";
      case "flagged":
        return "bg-red-500 text-white";
      case "unanswered":
      default:
        return "bg-white border border-gray-300 text-gray-700";
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Question info */}
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Câu {currentQuestion + 1} / {totalQuestions}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onPrevQuestion}
            disabled={!canGoPrev}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
          >
            ← Câu trước
          </button>

          <button
            onClick={onNextQuestion}
            disabled={!canGoNext}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Câu tiếp →
          </button>
        </div>
      </div>

      {/* Question grid */}
      <div className="mt-4">
        <div className="text-sm text-gray-600 mb-2">Chọn câu hỏi:</div>
        <div className="grid grid-cols-10 gap-2">
          {questions.map((question, index) => {
            const questionId = question._id;
            const status = getQuestionStatus(questionId);
            const isCurrentQuestion = index === currentQuestion;

            return (
              <button
                key={questionId}
                onClick={() => onNavigateToQuestion(index)}
                className={`
                  h-8 w-8 rounded text-xs font-medium transition-all duration-200
                  ${getStatusColor(status)}
                  ${
                    isCurrentQuestion
                      ? "ring-2 ring-blue-500 ring-offset-2"
                      : ""
                  }
                  hover:scale-110 cursor-pointer
                `}
                title={`${
                  status === "answered"
                    ? "Đã làm"
                    : status === "flagged"
                    ? "Gắn cờ"
                    : "Chưa làm"
                } - Câu ${index + 1}`}
              >
                {question.number || index + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((currentQuestion + 1) / totalQuestions) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default QuestionNavigation;
