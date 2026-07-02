import React, { useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import {
  stripOuterLi,
  isVietnamese,
  decodeHtmlEntities,
} from "@/utils/baseHelper";
import { useAdminMathHTML, processChoicesForMath } from "@/utils/mathProcessor";

interface TnTrueFalseProps {
  responses: any;
  question: any;
  isTimeEnd: boolean;
  handleAnswerChange: (questionId: string, value: any, type: string) => void;
  isExplanationMode?: boolean;
  answerComparison?: {
    isCorrect: boolean;
    correctAnswers: string[];
    userAnswers: string[];
    correctStatements?: any;
  };
}

const TnTrueFalse: React.FC<TnTrueFalseProps> = ({
  responses,
  question,
  isTimeEnd,
  handleAnswerChange,
  isExplanationMode = false,
  answerComparison,
}) => {
  const dynamicAnswer = useCallback((numQuestion: number = 0) => {
    if (numQuestion >= 1 && numQuestion <= 4) {
      const options = ["A", "B", "C", "D"].slice(0, numQuestion);
      return options;
    } else {
      return [];
    }
  }, []);

  const getAnswers = useCallback(() => {
    const answer = responses[question._id]?.answer;
    if (!answer) return [];

    const answers = Array.isArray(answer) ? answer : [answer];

    if (answers.length > 0) {
      if (typeof answers[0] === "object" && answers[0].questionOption) {
        return answers;
      }

      if (typeof answers[0] === "string" && !answers[0].includes(":")) {
        const convertedAnswers = answers
          .map((val, index) => {
            if (val && val !== "") {
              return {
                questionOption: String.fromCharCode(65 + index),
                option: val,
              };
            }
            return null;
          })
          .filter(Boolean);
        return convertedAnswers;
      }
    }

    return answers;
  }, [responses, question._id]);

  const currentAnswers = useMemo(() => getAnswers(), [getAnswers]);

  const statements = useMemo(() => {
    if (Array.isArray(question?.choices) && question.choices.length > 0) {
      return processChoicesForMath(question.choices).map(
        (choice: any, idx: number) => ({
          label: choice.label || String.fromCharCode(65 + idx),
          text: choice.text || "",
          rawHtml: choice.rawHtml || "",
        })
      );
    }
    const labels = dynamicAnswer(question?.num_ques || 0);
    return labels.map((label) => ({ label, text: "", rawHtml: "" }));
  }, [question?.choices, question?.num_ques, dynamicAnswer]);

  const handleCheckboxChange = useCallback(
    (questionId: string, option: string, questionOption: string) => {
      if (isTimeEnd) {
        if (!isExplanationMode) {
          toast("Đã hết thời gian làm bài!", {
            type: "error",
          });
        }
        return;
      }
      if (isExplanationMode) return;

      let updatedAnswers = [...currentAnswers];

      const existingIndex = updatedAnswers.findIndex(
        (ans: any) => ans.questionOption === questionOption
      );

      const newAnswer = { questionOption, option };

      if (existingIndex >= 0) {
        updatedAnswers[existingIndex] = newAnswer;
      } else {
        updatedAnswers.push(newAnswer);
      }

      handleAnswerChange(questionId, updatedAnswers, "TN_TRUE_FALSE");
    },
    [
      currentAnswers,
      isTimeEnd,
      handleAnswerChange,
      isExplanationMode,
      question._id,
    ]
  );

  const renderedQuestionContent = useMemo(() => {
    if (question?.rawHtml && question.rawHtml.trim()) {
      return (
        <div
          className="mb-4 text-base leading-relaxed text-gray-800 exam-content [&_img]:mx-auto [&_img]:block [&_img]:h-auto [&_img]:w-full [&_img]:object-contain [&_img]:rounded-lg [&_img]:shadow-sm"
          dangerouslySetInnerHTML={{
            __html: useAdminMathHTML(stripOuterLi(question.rawHtml)),
          }}
        />
      );
    }

    return (
      <div
        className="mb-4 text-base leading-relaxed text-gray-800"
        dangerouslySetInnerHTML={{
          __html: useAdminMathHTML(
            question?.plainText ||
              question?.question ||
              question?.content ||
              "Nội dung câu hỏi",
          ),
        }}
      />
    );
  }, [question]);

  // Xác định ngôn ngữ hiển thị nút chỉ dựa trên nội dung đề/choices
  const tfLanguage: "vi" | "en" = useMemo(() => {
    return isVietnamese(question) ? "vi" : "en";
  }, [question]);

  const normalizeBool = (val: any): "true" | "false" | "" => {
    if (val == null) return "";
    const v = String(val).trim().toLowerCase();
    if (v === "đúng" || v === "true") return "true";
    if (v === "sai" || v === "false") return "false";
    return "";
  };

  const getCorrectByLabelOrIndex = useCallback(
    (label: string, index: number) => {
      const fromMap = answerComparison?.correctStatements?.[label];
      if (fromMap !== undefined) return fromMap;

      const arr = (question as any)?.correctAnswers;
      if (Array.isArray(arr)) {
        const item = arr[index];
        if (item && typeof item === "object") {
          return (item as any).value ?? (item as any).label ?? item;
        }
        return item;
      }

      return undefined;
    },
    [answerComparison?.correctStatements, question]
  );

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

        {renderedQuestionContent}

        {question.images && question.images.length > 0 && (
          <div className="mt-4 space-y-3">
            {question.images.map((img: any, index: number) => (
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

      {/* Các mệnh đề và nút đáp án */}
      <div className="space-y-4">
        {statements.map((st: any, index: number) => (
          <div
            key={index}
            className="rounded-lg border border-gray-200 bg-white p-4"
          >
            {/* Container flex: nội dung bên trái, nút bên phải trên desktop, stack trên mobile */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              {/* Nội dung mệnh đề */}
              <div className="flex-1 px-4 py-3 text-sm text-gray-700 md:text-base">
                {st.rawHtml && st.rawHtml.trim() ? (
                  <div
                    className="exam-content [&_img]:mx-auto [&_img]:block [&_img]:h-auto [&_img]:w-full [&_img]:object-contain [&_img]:rounded-lg [&_img]:shadow-sm"
                    dangerouslySetInnerHTML={{
                      __html: useAdminMathHTML(stripOuterLi(st.rawHtml)),
                    }}
                  />
                ) : (
                  (() => {
                    const content = st.text || `Mệnh đề ${st.label}`;
                    const isHtml =
                      content.includes("<") && content.includes(">");
                    if (isHtml) {
                      return (
                        <div
                          className="exam-content [&_img]:mx-auto [&_img]:block [&_img]:h-auto [&_img]:w-full [&_img]:object-contain [&_img]:rounded-lg [&_img]:shadow-sm"
                          dangerouslySetInnerHTML={{
                            __html: useAdminMathHTML(content),
                          }}
                        />
                      );
                    }
                    return decodeHtmlEntities(content);
                  })()
                )}
              </div>

              {/* Nút Đúng/Sai - responsive: full width trên mobile, compact trên desktop */}
              <div className="flex gap-3 md:flex-shrink-0">
                {["true", "false"].map((option, optIndex) => {
                  const isChecked = currentAnswers.some(
                    (ans: any) =>
                      ans.questionOption === st.label && ans.option === option
                  );

                  let buttonClass = "";
                  if (isExplanationMode) {
                    const correctAnswerRaw = getCorrectByLabelOrIndex(
                      st.label,
                      index
                    );
                    const correctAnswer = normalizeBool(correctAnswerRaw);
                    const userAnswerRaw = currentAnswers.find(
                      (ans: any) => ans.questionOption === st.label
                    )?.option;
                    const userAnswer = normalizeBool(userAnswerRaw);
                    const thisOption = normalizeBool(option);

                    if (correctAnswer === thisOption) {
                      buttonClass =
                        "border-green-500 bg-green-500 text-white shadow-lg";
                    } else if (userAnswer === thisOption) {
                      buttonClass =
                        "border-red-500 bg-red-500 text-white shadow-lg";
                    } else {
                      buttonClass = "border-gray-300 bg-gray-100 text-gray-500";
                    }
                  } else {
                    buttonClass = isChecked
                      ? "border-green-600 bg-green-600 text-white shadow-lg"
                      : "border-gray-300 bg-white text-gray-700 hover:border-green-400 hover:bg-green-50";
                  }

                  return (
                    <div key={optIndex} className="flex-1 md:flex-none">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`tn-truefalse-${question._id}-${st.label}`}
                          value={option}
                          checked={isChecked}
                          onChange={() => {
                            if (isTimeEnd) {
                              if (!isExplanationMode) {
                                toast("Đã hết thời gian làm bài!", {
                                  type: "error",
                                });
                              }
                            } else {
                              handleCheckboxChange(
                                question._id,
                                option,
                                st.label
                              );
                            }
                          }}
                          className="hidden"
                        />
                        <div
                          className={`flex h-12 md:h-10 w-full md:w-24 items-center justify-center rounded-lg border-2 transition-all duration-200 ${
                            isTimeEnd
                              ? "cursor-not-allowed"
                              : "cursor-pointer hover:shadow-md"
                          } ${buttonClass}`}
                        >
                          <span className="text-center text-base md:text-sm font-medium">
                            {tfLanguage === "vi"
                              ? option === "true"
                                ? "Đúng"
                                : "Sai"
                              : option === "true"
                              ? "True"
                              : "False"}
                          </span>
                        </div>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(TnTrueFalse, (prevProps, nextProps) => {
  return (
    prevProps.question._id === nextProps.question._id &&
    prevProps.isTimeEnd === nextProps.isTimeEnd &&
    JSON.stringify(prevProps.responses[prevProps.question._id]) ===
      JSON.stringify(nextProps.responses[nextProps.question._id])
  );
});
