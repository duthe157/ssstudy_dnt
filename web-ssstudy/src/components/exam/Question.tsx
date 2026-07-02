import React, { useMemo, useCallback, useEffect, useRef } from "react";
import { ExamQuestion, QuestionType, QuestionResponse } from "@/types/exam";
import TnSingleChoice from "./questions/TnSingleChoice";
import TnMultiChoice from "./questions/TnMultiChoice";
import TrueFalse from "./questions/TrueFalse";
import TnTrueFalse from "./questions/TnTrueFalse";
import ShortAnswer from "./questions/ShortAnswer";
import FillBlank from "./questions/FillBlank";
import Essay from "./questions/Essay";
import DropDragChoice from "./questions/DragDrop";
import { setupAutoRender } from "@/utils/mathProcessor";

interface QuestionProps {
  responses: QuestionResponse;
  question: ExamQuestion;
  questionType?: QuestionType;
  isTimeEnd: boolean;
  handleAnswerChange: (
    questionId: string,
    value: any,
    type: QuestionType
  ) => void;
  flaggedQuestions?: Set<string>;
  onToggleFlag?: (questionId: string) => void;
  hideLabelLetters?: boolean;
  isExplanationMode?: boolean; // Đặc biệt cho màn hình lời giải
  answerComparison?: {
    isCorrect: boolean;
    correctAnswers: string[];
    userAnswers: string[];
  }; // Thông tin so sánh đáp án
}

const Question: React.FC<QuestionProps> = ({
  responses,
  question,
  questionType,
  isTimeEnd,
  handleAnswerChange,
  flaggedQuestions,
  onToggleFlag,
  hideLabelLetters = false,
  isExplanationMode = false,
  answerComparison,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Tự động quét và render lại toàn bộ công thức toán học trong câu hỏi nếu có bất kỳ phần nào bị sót
  useEffect(() => {
    if (containerRef.current) {
      // Đợi một chút để CSS và các thành phần con render xong hẳn
      const timer = setTimeout(() => {
        setupAutoRender(containerRef.current!);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [question._id, responses]);

  const questionHandleAnswerChange = useCallback(
    (questionId: string, value: any, type: string) => {
      // Đảm bảo xử lý đúng cho TN_MULTI_CHOICE
      if (type === "TN_MULTI_CHOICE") {
        // Đảm bảo value là mảng
        const valueArray = Array.isArray(value) ? value : [value];
        handleAnswerChange(questionId, valueArray, type as QuestionType);
      } else {
        handleAnswerChange(questionId, value, type as QuestionType);
      }
    },
    [handleAnswerChange]
  );

  // Chỉ trích xuất response cụ thể cho câu hỏi này để tránh re-render khi đáp án khác thay đổi
  const questionResponses = useMemo(() => {
    // Đảm bảo tạo đối tượng mới với answer được xử lý đúng cách
    const answer = responses[question._id]?.answer;

    // Helper: kiểm tra correctAnswers có dạng chuỗi chứa nhiều đáp án (ví dụ: "A, B")
    const hasCommaSeparatedCorrect = (() => {
      const ca = question?.correctAnswers;
      if (!ca) return false;
      if (Array.isArray(ca)) {
        if (ca.length > 1) return true;
        if (ca.length === 1) {
          const single = ca[0] as any;
          const raw =
            (typeof single === "string" && single) ||
            (typeof single === "object" && (single.value || single.label));
          if (typeof raw === "string") {
            const parts = raw
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
            return parts.length > 1;
          }
        }
      }
      return false;
    })();

    // Tự động phát hiện loại câu hỏi dựa trên correctAnswers (kể cả dạng "A, B")
    const actualQuestionType = hasCommaSeparatedCorrect
      ? "TN_MULTI_CHOICE"
      : questionType;

    // Đặt giá trị mặc định cho từng loại câu hỏi
    let defaultAnswer;
    if (actualQuestionType === "TN_MULTI_CHOICE") {
      defaultAnswer = Array.isArray(answer) ? answer : answer ? [answer] : [];
    } else if (
      actualQuestionType === "TN_TRUE_FALSE" ||
      actualQuestionType === "TRUE_FALSE_STATEMENTS"
    ) {
      defaultAnswer = Array.isArray(answer) ? answer : answer ? [answer] : [];
    } else if (actualQuestionType === "DRAG_DROP") {
      defaultAnswer = Array.isArray(answer) ? answer : [];
    } else if (actualQuestionType === "FILL_BLANK") {
      defaultAnswer = Array.isArray(answer) ? answer : [];
    } else if (actualQuestionType === "TRUE_FALSE") {
      defaultAnswer = answer || "";
    } else {
      defaultAnswer = answer || "";
    }

    const result = {
      [question._id]: {
        ...responses[question._id],
        answer: defaultAnswer,
      },
    };
    return result;
  }, [
    question._id,
    responses[question._id],
    questionType,
    question?.correctAnswers,
  ]);

  // Tự động phát hiện loại câu hỏi dựa trên các trường từ API hoặc prop
  const detectedQuestionType = useMemo(() => {
    // 1. Ưu tiên sử dụng question_type hoặc type từ API
    const apiType = (question?.question_type || question?.type || "").toLowerCase();
    
    if (apiType) {
      const typeMap: Record<string, QuestionType> = {
        singlechoice: "TN_SINGLE_CHOICE",
        single_choice: "TN_SINGLE_CHOICE",
        multiplechoice: "TN_MULTI_CHOICE",
        multi_choice: "TN_MULTI_CHOICE",
        truefalse: "TRUE_FALSE",
        true_false: "TRUE_FALSE",
        truefalsemulti: "TRUE_FALSE_STATEMENTS",
        true_false_statements: "TRUE_FALSE_STATEMENTS",
        short_answer: "SHORT_ANSWER",
        fillinblank: "FILL_BLANK",
        fill_blank: "FILL_BLANK",
        dragdrop: "DRAG_DROP",
        drag_drop: "DRAG_DROP",
        cluster: "CLUSTER_QUESTION",
        essay: "ESSAY",
        tuluan: "ESSAY",
      };
      
      const mapped = typeMap[apiType];
      if (mapped) return mapped;
    }

    // 2. Nếu không có type rõ ràng từ API, sử dụng questionType từ props (nếu có)
    if (questionType) return questionType;

    // 3. Fallback: tự động phát hiện bằng logic thủ công
    const ca = question?.correctAnswers;
    const choices = question?.choices || [];
    
    // Phát hiện TRUE_FALSE_STATEMENTS: có statements hoặc nhiều num_ques hoặc logic đặc thù
    const hasStatements = (question as any)?.statements?.length > 0;
    const hasNumQues = Number((question as any)?.num_ques || 0) > 1;
    if (hasStatements || hasNumQues) return "TRUE_FALSE_STATEMENTS";

    // Phát hiện TN_MULTI_CHOICE
    let isMulti = false;
    if (Array.isArray(ca)) {
      if (ca.length > 1) {
        // Chỉ coi là đa đáp án nếu không phải là Đúng/Sai nhiều ý (đã check ở trên)
        isMulti = true;
      } else if (ca.length === 1) {
        const single = ca[0] as any;
        const raw = (typeof single === "string" && single) || (typeof single === "object" && (single.value || single.label));
        if (typeof raw === "string" && raw.includes(",")) isMulti = true;
      }
    }
    if (isMulti) return "TN_MULTI_CHOICE";

    // Mặc định
    return "TN_SINGLE_CHOICE";
  }, [
    question?.question_type,
    question?.type,
    question?.correctAnswers,
    (question as any)?.num_ques,
    (question as any)?.statements,
    questionType,
    question?._id,
  ]);


  // Dùng useMemo cho cả phần render của component con
  const renderQuestionComponent = useMemo(() => {
    switch (detectedQuestionType) {
      case "TN_SINGLE_CHOICE":
        return (
          <TnSingleChoice
            responses={questionResponses}
            question={question}
            isTimeEnd={isTimeEnd}
            handleAnswerChange={questionHandleAnswerChange}
            hideLabelLetters={hideLabelLetters}
            isExplanationMode={isExplanationMode}
            answerComparison={answerComparison}
          />
        );
      case "ESSAY":
        return (
          <Essay
            responses={questionResponses}
            question={question}
            isTimeEnd={isTimeEnd}
            handleAnswerChange={questionHandleAnswerChange}
            isExplanationMode={isExplanationMode}
            answerComparison={answerComparison}
          />
        );
      case "TN_MULTI_CHOICE":
        return (
          <TnMultiChoice
            responses={questionResponses}
            question={question}
            isTimeEnd={isTimeEnd}
            handleAnswerChange={questionHandleAnswerChange}
            hideLabelLetters={hideLabelLetters}
            isExplanationMode={isExplanationMode}
            answerComparison={answerComparison}
          />
        );
      case "TRUE_FALSE":
        return (
          <TrueFalse
            responses={questionResponses}
            question={question}
            isTimeEnd={isTimeEnd}
            handleAnswerChange={questionHandleAnswerChange}
            isExplanationMode={isExplanationMode}
            answerComparison={answerComparison}
          />
        );
      case "TN_TRUE_FALSE":
        return (
          <TnTrueFalse
            responses={questionResponses}
            question={question}
            isTimeEnd={isTimeEnd}
            handleAnswerChange={questionHandleAnswerChange}
            isExplanationMode={isExplanationMode}
            answerComparison={answerComparison}
          />
        );
      case "TRUE_FALSE_STATEMENTS":
        return (
          <TnTrueFalse
            responses={questionResponses}
            question={question}
            isTimeEnd={isTimeEnd}
            handleAnswerChange={questionHandleAnswerChange}
            isExplanationMode={isExplanationMode}
            answerComparison={answerComparison}
          />
        );
      case "DRAG_DROP":
        return (
          <DropDragChoice
            responses={questionResponses}
            question={question}
            isTimeEnd={isTimeEnd}
            handleAnswerChange={questionHandleAnswerChange}
            isExplanationMode={isExplanationMode}
            answerComparison={answerComparison}
          />
        );
      case "SHORT_ANSWER":
        return (
          <ShortAnswer
            responses={questionResponses}
            question={question}
            isTimeEnd={isTimeEnd}
            handleAnswerChange={questionHandleAnswerChange}
            isExplanationMode={isExplanationMode}
            answerComparison={answerComparison}
          />
        );
      case "FILL_BLANK":
        return (
          <FillBlank
            responses={questionResponses}
            question={question}
            isTimeEnd={isTimeEnd}
            handleAnswerChange={questionHandleAnswerChange}
            isExplanationMode={isExplanationMode}
            answerComparison={answerComparison}
          />
        );
      //  ĐÃ XÓA CASE "CLUSTER_QUESTION"
      default:
        return <p>Loại câu hỏi không hợp lệ: {detectedQuestionType}</p>;
    }
  }, [
    detectedQuestionType,
    questionResponses,
    question,
    isTimeEnd,
    questionHandleAnswerChange,
    hideLabelLetters,
    isExplanationMode,
    answerComparison,
  ]);

  const isFlagged = flaggedQuestions?.has(question._id) || false;

  return (
    <div className="w-full relative" ref={containerRef}>
      <div className="[&_ul]:list-none [&_ol]:list-none [&_ul]:pl-0 [&_ol]:pl-0 [&_li]:ml-0">
        {renderQuestionComponent}
      </div>

      {onToggleFlag && (
        <button
          onClick={() => onToggleFlag(question._id)}
          className={`absolute top-4 right-4 h-8 w-8 rounded-full shadow flex items-center justify-center hover:brightness-95 transition-colors ${
            isFlagged ? "bg-yellow-500" : "bg-white"
          }`}
          title={isFlagged ? "Bỏ gắn cờ" : "Gắn cờ"}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 2v20l7-5 7 5V2H5z"
              fill={isFlagged ? "#FFFFFF" : "#FACC15"}
              stroke="none"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

// Cải thiện memo, so sánh sâu hơn cho questionResponses
export default React.memo(Question, (prevProps, nextProps) => {
  // Kiểm tra câu hỏi có thay đổi không
  if (prevProps.question._id !== nextProps.question._id) return false;

  // Kiểm tra isTimeEnd có thay đổi không
  if (prevProps.isTimeEnd !== nextProps.isTimeEnd) return false;

  // Kiểm tra flaggedQuestions có thay đổi không
  const prevFlagged =
    prevProps.flaggedQuestions?.has(prevProps.question._id) || false;
  const nextFlagged =
    nextProps.flaggedQuestions?.has(nextProps.question._id) || false;
  if (prevFlagged !== nextFlagged) return false;

  // Kiểm tra onToggleFlag có thay đổi không
  if (prevProps.onToggleFlag !== nextProps.onToggleFlag) return false;

  // Kiểm tra response cụ thể của câu hỏi này có thay đổi không
  const prevResponse = prevProps.responses[prevProps.question._id];
  const nextResponse = nextProps.responses[nextProps.question._id];

  // Tự động phát hiện loại câu hỏi dựa trên correctAnswers
  const prevDetectedType =
    prevProps.question?.correctAnswers &&
    Array.isArray(prevProps.question.correctAnswers) &&
    prevProps.question.correctAnswers.length > 1
      ? "TN_MULTI_CHOICE"
      : prevProps.questionType;
  const nextDetectedType =
    nextProps.question?.correctAnswers &&
    Array.isArray(nextProps.question.correctAnswers) &&
    nextProps.question.correctAnswers.length > 1
      ? "TN_MULTI_CHOICE"
      : nextProps.questionType;

  // Xử lý đặc biệt cho TN_MULTI_CHOICE
  if (prevDetectedType === "TN_MULTI_CHOICE") {
    const prevAnswer = Array.isArray(prevResponse?.answer)
      ? [...prevResponse.answer].sort()
      : [];
    const nextAnswer = Array.isArray(nextResponse?.answer)
      ? [...nextResponse.answer].sort()
      : [];
    return JSON.stringify(prevAnswer) === JSON.stringify(nextAnswer);
  }

  // Xử lý đặc biệt cho TN_TRUE_FALSE
  if (
    prevDetectedType === "TN_TRUE_FALSE" ||
    prevDetectedType === "TRUE_FALSE_STATEMENTS"
  ) {
    const prevAnswer = Array.isArray(prevResponse?.answer)
      ? prevResponse.answer
      : [];
    const nextAnswer = Array.isArray(nextResponse?.answer)
      ? nextResponse.answer
      : [];
    // TnTrueFalse không cần sắp xếp vì mỗi questionOption chỉ có một giá trị
    return JSON.stringify(prevAnswer) === JSON.stringify(nextAnswer);
  }

  // Xử lý đặc biệt cho TRUE_FALSE
  if (prevDetectedType === "TRUE_FALSE") {
    return prevResponse?.answer === nextResponse?.answer;
  }

  // Xử lý đặc biệt cho DRAG_DROP
  if (prevDetectedType === "DRAG_DROP") {
    const prevAnswer = Array.isArray(prevResponse?.answer)
      ? prevResponse.answer
      : [];
    const nextAnswer = Array.isArray(nextResponse?.answer)
      ? nextResponse.answer
      : [];
    return JSON.stringify(prevAnswer) === JSON.stringify(nextAnswer);
  }

  // Xử lý đặc biệt cho FILL_BLANK
  if (prevDetectedType === "FILL_BLANK") {
    const prevAnswer = Array.isArray(prevResponse?.answer)
      ? prevResponse.answer
      : [];
    const nextAnswer = Array.isArray(nextResponse?.answer)
      ? nextResponse.answer
      : [];
    return JSON.stringify(prevAnswer) === JSON.stringify(nextAnswer);
  }

  // So sánh sâu hơn cho đối tượng response
  const prevResponseStr = prevResponse ? JSON.stringify(prevResponse) : "";
  const nextResponseStr = nextResponse ? JSON.stringify(nextResponse) : "";

  return prevResponseStr === nextResponseStr;
});
