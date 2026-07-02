import React, { useMemo } from "react";
import { ExamQuestion, QuestionResponse, QuestionType } from "@/types/exam";
import {
  stripOuterLi,
  isVietnamese,
  decodeHtmlEntities,
} from "@/utils/baseHelper";
import { useAdminMathHTML } from "@/utils/mathProcessor";
import { toast } from "react-toastify";

interface TrueFalseProps {
  responses: QuestionResponse;
  question: ExamQuestion;
  isTimeEnd: boolean;
  handleAnswerChange: (
    questionId: string,
    value: any,
    type: QuestionType
  ) => void;
  isExplanationMode?: boolean;
  answerComparison?: {
    isCorrect: boolean;
    correctAnswers: string[];
    userAnswers: string[];
  };
}

const TrueFalse: React.FC<TrueFalseProps> = ({
  responses,
  question,
  isTimeEnd,
  handleAnswerChange,
  isExplanationMode = false,
  answerComparison,
}) => {
  const currentAnswer = useMemo(() => {
    return responses[question._id]?.answer || "";
  }, [responses, question._id]);

  // Xác định ngôn ngữ hiển thị nút dựa trên nội dung đề/choices, KHÔNG phụ thuộc correctAnswers
  const tfLanguage: "vi" | "en" = useMemo(() => {
    const result = isVietnamese(question) ? "vi" : "en";
    return result;
  }, [question]);

  const labelTrue = tfLanguage === "vi" ? "Đúng" : "True";
  const labelFalse = tfLanguage === "vi" ? "Sai" : "False";

  const handleAnswerSelect = (answerBool: "true" | "false") => {
    if (isTimeEnd) {
      if (!isExplanationMode) {
        toast("Đã hết thời gian làm bài!", {
          type: "error",
        });
      }
      return;
    }
    if (isExplanationMode) return; // Không cho tương tác trong màn hình lời giải
    // Lưu và gửi về API bằng giá trị chuẩn 'true' | 'false'
    handleAnswerChange(question._id, answerBool, "TRUE_FALSE");
  };

  const renderedQuestionContent = useMemo(() => {
    if (
      question.rawHtml &&
      typeof question.rawHtml === "string" &&
      question.rawHtml.trim()
    ) {
      return (
        <div
          className="mb-4 text-base leading-relaxed text-gray-800 exam-content [&_img]:mx-auto [&_img]:block [&_img]:h-auto [&_img]:w-full [&_img]:object-contain [&_img]:rounded-lg [&_img]:shadow-sm"
          dangerouslySetInnerHTML={{
            __html: useAdminMathHTML(stripOuterLi(question.rawHtml)),
          }}
        />
      );
    }

    if (question.plainText) {
      return (
        <div
          className="mb-4 text-base leading-relaxed text-gray-800"
          dangerouslySetInnerHTML={{
            __html: useAdminMathHTML(question.plainText),
          }}
        />
      );
    }

    if (question.question_text) {
      return (
        <div
          className="mb-4 text-base leading-relaxed text-gray-800 exam-content [&_img]:mx-auto [&_img]:block [&_img]:h-auto [&_img]:w-full [&_img]:object-contain [&_img]:rounded-lg [&_img]:shadow-sm"
          dangerouslySetInnerHTML={{
            __html: useAdminMathHTML(stripOuterLi(question.question_text)),
          }}
        />
      );
    }

    if (question.question) {
      return (
        <div
          className="mb-4 text-base leading-relaxed text-gray-800 exam-content [&_img]:mx-auto [&_img]:block [&_img]:h-auto [&_img]:w-full [&_img]:object-contain [&_img]:rounded-lg [&_img]:shadow-sm"
          dangerouslySetInnerHTML={{
            __html: useAdminMathHTML(stripOuterLi(question.question)),
          }}
        />
      );
    }

    return (
      <div className="mb-4 text-base leading-relaxed text-gray-800">
        Nội dung câu hỏi
      </div>
    );
  }, [question]);

  const normalizeBool = (val: any): "true" | "false" | "" => {
    if (val == null) return "";
    const v = String(val).trim().toLowerCase();
    // Hỗ trợ cả key 'a'/'b' từ API
    if (v === "đúng" || v === "true" || v === "a") return "true";
    if (v === "sai" || v === "false" || v === "b") return "false";
    return "";
  };

  const correctIsTrue = useMemo(() => {
    if (!answerComparison?.correctAnswers) return false;
    return answerComparison.correctAnswers.some(
      (a: any) => normalizeBool(a) === "true"
    );
  }, [answerComparison]);

  const correctIsFalse = useMemo(() => {
    if (!answerComparison?.correctAnswers) return false;
    return answerComparison.correctAnswers.some(
      (a: any) => normalizeBool(a) === "false"
    );
  }, [answerComparison]);

  const userPickedTrue = useMemo(() => {
    if (!answerComparison?.userAnswers) return false;
    return answerComparison.userAnswers.some(
      (a: any) => normalizeBool(a) === "true"
    );
  }, [answerComparison]);

  const userPickedFalse = useMemo(() => {
    if (!answerComparison?.userAnswers) return false;
    return answerComparison.userAnswers.some(
      (a: any) => normalizeBool(a) === "false"
    );
  }, [answerComparison]);

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white p-6 overflow-x-hidden">
      {/* Header câu hỏi */}
      <div className="mb-6">
        {(question as any)?.number && (
          <div className="mb-2 text-[18px] font-bold text-[#2A7BF2]">
            {typeof question.number === "string" && question.number.startsWith("[ID")
              ? question.number
              : `Câu ${question.number}`}
          </div>
        )}

        {/* Nội dung câu hỏi */}
        {renderedQuestionContent}

        {/* Hình ảnh nếu có */}
        {question.images && question.images.length > 0 && (
          <div className="mt-4 space-y-3">
            {question.images.map((img, index) => (
              <div key={index} className="exam-image-container">
                <img
                  src={img}
                  alt={`Hình ${index + 1}`}
                  className="exam-responsive-img w-full object-contain rounded-lg shadow-sm"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Nút Đúng/Sai - hiển thị theo ngôn ngữ, lưu giá trị true/false */}
      <div className="flex gap-3 md:gap-4">
        {["true", "false"].map((option) => {
          const isTrue = option === "true";
          const label = isTrue ? labelTrue : labelFalse;
          const isChecked = normalizeBool(currentAnswer) === option;

          let buttonClass = "";
          if (isExplanationMode && answerComparison) {
            const isCorrect = isTrue ? correctIsTrue : correctIsFalse;
            const userPicked = isTrue ? userPickedTrue : userPickedFalse;

            if (isCorrect) {
              buttonClass =
                "border-green-500 bg-green-500 text-white shadow-lg";
            } else if (userPicked) {
              buttonClass = "border-red-500 bg-red-500 text-white shadow-lg";
            } else {
              buttonClass = "border-gray-300 bg-gray-100 text-gray-500";
            }
          } else {
            buttonClass = isChecked
              ? "border-green-600 bg-green-600 text-white shadow-lg"
              : "border-gray-300 bg-white text-gray-700 hover:border-green-400 hover:bg-green-50";
          }

          return (
            <div key={option} className="flex-1 md:flex-none">
              <label className="flex items-center">
                <input
                  type="radio"
                  name={`truefalse-${question._id}`}
                  value={option}
                  checked={isChecked}
                  onChange={() => {
                    // Lưu theo key 'a' (true) hoặc 'b' (false) để đồng bộ với correctAnswers.value
                    const key = option === "true" ? "a" : "b";
                    handleAnswerChange(question._id, key, "TRUE_FALSE");
                  }}
                  className="hidden"
                />
                <div
                  className={`flex h-12 md:h-12 w-full md:w-32 items-center justify-center rounded-lg border-2 transition-all duration-200 ${
                    isTimeEnd
                      ? "cursor-not-allowed"
                      : "cursor-pointer hover:shadow-md"
                  } ${buttonClass}`}
                >
                  <span className="text-center text-base md:text-lg font-medium">
                    {label}
                  </span>
                </div>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrueFalse;
