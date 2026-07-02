import React, { useState, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import { stripOuterLi } from "@/utils/baseHelper";
import { useAdminMathHTML } from "@/utils/mathProcessor";

interface ShortAnswerProps {
  responses: any;
  question: any;
  isTimeEnd: boolean;
  handleAnswerChange: (questionId: string, value: any, type: string) => void;
  isExplanationMode?: boolean; // Đặc biệt cho màn hình lời giải
  answerComparison?: {
    isCorrect: boolean;
    correctAnswers: string[];
    userAnswers: string[];
  }; // Thông tin so sánh đáp án
}

const ShortAnswer: React.FC<ShortAnswerProps> = ({
  responses,
  question,
  isTimeEnd,
  handleAnswerChange,
  isExplanationMode = false,
  answerComparison,
}) => {
  const [localAnswer, setLocalAnswer] = useState("");
  const maxLength = 200; // Giới hạn độ dài tối đa cho câu trả lời ngắn

  const handleBlur = useCallback(() => {
    // Chỉ cập nhật khi có sự thay đổi thực sự
    if (localAnswer !== responses[question._id]?.answer) {
      handleAnswerChange(question._id, localAnswer, question?.type);
    }
  }, [
    localAnswer,
    responses[question._id]?.answer,
    question._id,
    isTimeEnd,
    question?.type,
  ]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isTimeEnd) {
        if (!isExplanationMode) {
          toast("Đã hết thời gian làm bài!", { type: "error" });
        }
        return;
      }
      if (isExplanationMode) return; // Không cho tương tác trong màn hình lời giải
      const { value } = e.target;

      // Giới hạn độ dài tối đa
      if (value.length <= maxLength) {
        setLocalAnswer(value);
      }
    },
    [isTimeEnd, maxLength]
  );

  useEffect(() => {
    if (responses[question._id]?.answer !== localAnswer) {
      setLocalAnswer(responses[question._id]?.answer || "");
    }
  }, [responses, question._id, localAnswer]);

  // Render nội dung câu hỏi với hình ảnh
  const renderQuestionContent = () => {
    // Ưu tiên sử dụng rawHtml nếu có và có nội dung thực sự
    if (question?.rawHtml && question.rawHtml.trim()) {
      return (
        <div
          className="exam-content mb-4 text-base leading-relaxed text-gray-800 [&_img]:mx-auto [&_img]:block [&_img]:h-auto"
          dangerouslySetInnerHTML={{
            __html: useAdminMathHTML(question.rawHtml),
          }}
        />
      );
    }

    // Fallback về plainText nếu không có rawHtml hoặc rawHtml rỗng
    return (
      <div
        className="mb-4 text-base leading-relaxed text-gray-800"
        dangerouslySetInnerHTML={{
          __html: useAdminMathHTML(
            question?.plainText || question?.question || "Nội dung câu hỏi",
          ),
        }}
      />
    );
  };

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white p-6">
      {/* Header câu hỏi */}
      <div className="mb-6">
        {(question as any)?.number && (
          <div className="mb-2 text-[18px] font-bold text-[#2A7BF2]">
            {typeof question.number === "string" && question.number.startsWith("[ID")
              ? question.number
              : `Câu ${question.number}`}
          </div>
        )}

        {/* Question content with image */}
        {renderQuestionContent()}

        {/* Hình ảnh nếu có */}
        {question.images && question.images.length > 0 && (
          <div className="mt-4">
            {question.images.map((img: any, index: number) => (
              <img
                key={index}
                src={img}
                alt={`Hình ${index + 1}`}
                className="exam-responsive-img rounded-lg"
              />
            ))}
          </div>
        )}
      </div>

      {/* Answer input */}
      <div className="flex justify-center">
        <input
          type="text"
          value={localAnswer}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder="Nhập câu trả lời ngắn gọn..."
          disabled={isTimeEnd}
          maxLength={maxLength}
          className={`w-full max-w-md rounded-lg border px-3 py-2 focus:ring-2 disabled:cursor-not-allowed ${
            isExplanationMode && answerComparison
              ? answerComparison.isCorrect
                ? "border-green-500 bg-green-50 text-green-700 focus:border-green-500 focus:ring-green-500"
                : "border-red-500 bg-red-50 text-red-700 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 text-gray-700 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
          }`}
        />
      </div>

      {/* Hiển thị đáp án đúng nếu có */}
      {isExplanationMode && answerComparison && !answerComparison.isCorrect && (
        <div className="mt-3 rounded-lg bg-blue-50 p-3">
          <p className="text-sm text-blue-700">
            <strong>Đáp án đúng:</strong>{" "}
            {answerComparison.correctAnswers.join(", ")}
          </p>
        </div>
      )}

      {/* Character count */}
      <div className="text-right text-sm text-gray-500">
        {localAnswer.length}/{maxLength} ký tự
      </div>
    </div>
  );
};

export default React.memo(ShortAnswer, (prevProps, nextProps) => {
  return (
    prevProps.question._id === nextProps.question._id &&
    prevProps.isTimeEnd === nextProps.isTimeEnd &&
    prevProps.responses[prevProps.question._id]?.answer ===
      nextProps.responses[nextProps.question._id]?.answer
  );
});
