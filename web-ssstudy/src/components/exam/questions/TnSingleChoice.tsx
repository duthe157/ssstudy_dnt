import React, { useMemo } from "react";
import { ExamQuestion, QuestionResponse, QuestionType } from "@/types/exam";
import { stripOuterLi, decodeHtmlEntities } from "@/utils/baseHelper";
import { useAdminMathHTML, processChoicesForMath } from "@/utils/mathProcessor";
import AnswerDisplay from "./AnswerDisplay";

interface TnSingleChoiceProps {
  responses: QuestionResponse;
  question: ExamQuestion;
  isTimeEnd: boolean;
  handleAnswerChange: (
    questionId: string,
    value: any,
    type: QuestionType
  ) => void;
  hideLabelLetters?: boolean;
  isExplanationMode?: boolean; // Đặc biệt cho màn hình lời giải
  answerComparison?: {
    isCorrect: boolean;
    correctAnswers: string[];
    userAnswers: string[];
  }; // Thông tin so sánh đáp án
}

const TnSingleChoice: React.FC<TnSingleChoiceProps> = ({
  responses,
  question,
  isTimeEnd,
  handleAnswerChange,
  hideLabelLetters = false,
  isExplanationMode = false,
  answerComparison,
}) => {
  const currentAnswer = useMemo(() => {
    return responses[question._id]?.answer || "";
  }, [responses, question._id]);

  const handleOptionSelect = (option: string) => {
    if (isTimeEnd) return;
    if (isExplanationMode) return; // Không cho tương tác trong màn hình lời giải
    // Cho single choice, luôn thay thế đáp án cũ
    // Lưu theo key chữ cái thường để khớp API (ví dụ: "a", "b", ...)
    const normalized = String(option).trim().toLowerCase();
    handleAnswerChange(question._id, normalized, "TN_SINGLE_CHOICE");
  };

  const renderedQuestionContent = useMemo(() => {
    if (
      question.rawHtml &&
      typeof question.rawHtml === "string" &&
      question.rawHtml.trim()
    ) {
      return (
        <div
          className="exam-content text-base leading-relaxed text-gray-800 [&_img]:mx-auto [&_img]:block [&_img]:h-auto [&_li]:list-none [&_ul]:list-none [&_ol]:list-none [&_ul]:pl-0 [&_ol]:pl-0"
          dangerouslySetInnerHTML={{
            __html: useAdminMathHTML(stripOuterLi(question.rawHtml)),
          }}
        />
      );
    }

    if (
      question.plainText &&
      typeof question.plainText === "string" &&
      question.plainText.trim()
    ) {
      return (
        <div
          className="text-base leading-relaxed text-gray-800"
          dangerouslySetInnerHTML={{
            __html: useAdminMathHTML(question.plainText),
          }}
        />
      );
    }

    if (
      question.question_text &&
      typeof question.question_text === "string" &&
      question.question_text.trim()
    ) {
      return (
        <div
          className="exam-content text-base leading-relaxed text-gray-800 [&_img]:mx-auto [&_img]:block [&_img]:h-auto [&_li]:list-none [&_ul]:list-none [&_ol]:list-none [&_ul]:pl-0 [&_ol]:pl-0"
          dangerouslySetInnerHTML={{
            __html: useAdminMathHTML(stripOuterLi(question.question_text)),
          }}
        />
      );
    }

    if (
      question.question &&
      typeof question.question === "string" &&
      question.question.trim()
    ) {
      const isHtml =
        question.question.includes("<") && question.question.includes(">");
      if (isHtml) {
        return (
          <div
            className="exam-content text-base leading-relaxed text-gray-800 [&_img]:mx-auto [&_img]:block [&_img]:h-auto [&_li]:list-none [&_ul]:list-none [&_ol]:list-none [&_ul]:pl-0 [&_ol]:pl-0"
            dangerouslySetInnerHTML={{
              __html: useAdminMathHTML(stripOuterLi(question.question)),
            }}
          />
        );
      }
      return (
        <div
          className="text-base leading-relaxed text-gray-800"
          dangerouslySetInnerHTML={{
            __html: useAdminMathHTML(question.question),
          }}
        />
      );
    }

    return (
      <div className="text-base leading-relaxed text-gray-800">
        <div className="text-red-500 mb-2">
          ⚠️ Không tìm thấy nội dung câu hỏi
        </div>
        <div className="text-sm text-gray-500">
          Debug:{" "}
          {JSON.stringify({
            hasRawHtml: !!question.rawHtml,
            hasPlainText: !!question.plainText,
            hasQuestionText: !!question.question_text,
            hasQuestion: !!question.question,
          })}
        </div>
        <div className="text-xs text-gray-400 mt-2">
          Question ID: {question._id}
        </div>
      </div>
    );
  }, [question]);

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

        {/* Nội dung câu hỏi */}
        {renderedQuestionContent}
      </div>

      {/* Phần đáp án - sử dụng AnswerDisplay mới */}
      {question.choices && question.choices.length > 0 ? (
        <AnswerDisplay
          choices={processChoicesForMath(question.choices).map(
            (choice, index) => ({
              label: choice.label,
              text: choice.text || `Đáp án ${choice.label}`,
              value: choice.text,
            })
          )}
          // Hiển thị theo label in hoa để đồng bộ với UI (A/B/C/D)
          selectedAnswers={
            currentAnswer ? [String(currentAnswer).toUpperCase()] : []
          }
          onAnswerSelect={(answer) => handleOptionSelect(answer)}
          isTimeEnd={isTimeEnd}
          isMultiChoice={false}
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
      ) : (
        <div className="text-red-500 text-sm"></div>
      )}
    </div>
  );
};

export default TnSingleChoice;
