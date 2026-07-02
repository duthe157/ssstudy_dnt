import React, { useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { stripOuterLi, decodeHtmlEntities } from "@/utils/baseHelper";
import { useAdminMathHTML, processChoicesForMath } from "@/utils/mathProcessor";
import AnswerDisplay from "./AnswerDisplay";

interface TnMultiChoiceProps {
  responses: any;
  question: any;
  isTimeEnd: boolean;
  handleAnswerChange: (questionId: string, value: any, type: string) => void;
  hideLabelLetters?: boolean;
  isExplanationMode?: boolean; // Đặc biệt cho màn hình lời giải
  answerComparison?: {
    isCorrect: boolean;
    correctAnswers: string[];
    userAnswers: string[];
  }; // Thông tin so sánh đáp án
}

const TnMultiChoice: React.FC<TnMultiChoiceProps> = ({
  responses,
  question,
  isTimeEnd,
  handleAnswerChange,
  hideLabelLetters = false,
  isExplanationMode = false,
  answerComparison,
}) => {
  const handleOptionChange = useCallback(
    (questionId: string, option: string) => {
      if (isTimeEnd) {
        if (!isExplanationMode) {
          toast("Đã hết thời gian làm bài!", {
            type: "error",
          });
        }
        return;
      }
      if (isExplanationMode) return; // Không cho tương tác trong màn hình lời giải

      // Lưu theo key chữ cái thường để khớp API (ví dụ: "a", "b", ...)
      const normalized = String(option).trim().toLowerCase();
      const currentAnswers = responses[questionId]?.answer || [];
      const isSelected = currentAnswers.includes(normalized);

      let newAnswers: string[];
      if (isSelected) {
        // Bỏ chọn option này
        newAnswers = currentAnswers.filter((ans: string) => ans !== normalized);
      } else {
        // Chọn thêm option này
        newAnswers = [...currentAnswers, normalized];
      }

      handleAnswerChange(questionId, newAnswers, question?.type);
    },
    [responses, question?.type, isTimeEnd]
  );

  // Chuyển đổi answer thành mảng nếu không phải
  const getAnswers = () => {
    const answer = responses[question._id]?.answer;
    if (!answer) return [];
    // Chuyển câu trả lời lưu trữ (chữ thường) sang label in hoa để UI hiển thị
    const arr = Array.isArray(answer) ? answer : [answer];
    return arr.map((a: any) => String(a).toUpperCase());
  };

  // Lấy array các đáp án đã chọn
  const selectedAnswers = getAnswers();

  // Render nội dung câu hỏi với hình ảnh
  const renderedQuestionContent = useMemo(() => {
    if (question?.rawHtml && question.rawHtml.trim()) {
      return (
        <div
          className="exam-content text-lg font-medium text-gray-800 [&_img]:mx-auto [&_img]:block [&_img]:h-auto"
          dangerouslySetInnerHTML={{
            __html: useAdminMathHTML(stripOuterLi(question.rawHtml)),
          }}
        />
      );
    }

    const questionContent = decodeHtmlEntities(
      question?.plainText || question?.question || ""
    );

    return (
      <div className="text-lg font-medium text-gray-800">{questionContent}</div>
    );
  }, [question]);

  // Lấy các lựa chọn từ API
  const choices = question?.choices || [];

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white p-6">
      {/* Header câu hỏi */}
      <div className="mb-0">
        {(question as any)?.number && (
          <div className="mb-2 text-[18px] font-bold text-[#2A7BF2]">
            {typeof question.number === "string" && question.number.startsWith("[ID")
              ? question.number
              : `Câu ${question.number}`}
          </div>
        )}

        {/* Hiển thị nội dung câu hỏi với hình ảnh */}
        {renderedQuestionContent}
      </div>

      {/* Hiển thị các lựa chọn - sử dụng AnswerDisplay mới */}
      <AnswerDisplay
        choices={processChoicesForMath(choices).map(
          (choice: any, index: number) => ({
            label: String.fromCharCode(65 + index), // A, B, C, D...
            text: choice.text || `Đáp án ${index + 1}`,
            value: choice.text,
          })
        )}
        selectedAnswers={selectedAnswers}
        onAnswerSelect={(answer) => handleOptionChange(question._id, answer)}
        isTimeEnd={isTimeEnd}
        isMultiChoice={true}
        hideLabelLetters={hideLabelLetters}
        isExplanationMode={isExplanationMode}
        // Đồng bộ dữ liệu so sánh: chuyển về label in hoa để AnswerDisplay đánh dấu đúng/sai
        answerComparison={
          answerComparison
            ? {
                ...answerComparison,
                correctAnswers: (answerComparison.correctAnswers || []).map(
                  (a) => String(a).toUpperCase()
                ),
                userAnswers: (answerComparison.userAnswers || []).map((a) =>
                  String(a).toUpperCase()
                ),
              }
            : undefined
        }
      />
    </div>
  );
};

export default TnMultiChoice;
