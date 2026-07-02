import React from "react";
import { ExamQuestion, QuestionResponse } from "@/types/exam";

interface ExamSidebarProps {
  timeRemaining: number;
  answeredCount: number;
  totalQuestions: number;
  questions: ExamQuestion[];
  currentQuestionId?: string;
  userAnswers: QuestionResponse;
  flaggedQuestions: Set<string>;
  currentQuestion: number;
  currentPart: number;
  examParts: Array<{ name: string; id: string }>;
  onNavigateToQuestion: (index: number) => void;
  onToggleFlag: (questionId: string) => void;
  onStopExam: () => void;
  onSubmitExam: () => void;
  onSubmitPart: () => void;
  isTimeEnd: boolean;
  displayMode?: "SINGLE_QUESTION" | "PER_PART" | "FULL_EXAM";
  completedParts?: Set<number>;
}

const ExamSidebar: React.FC<ExamSidebarProps> = ({
  timeRemaining,
  answeredCount,
  totalQuestions,
  questions,
  currentQuestionId,
  userAnswers,
  flaggedQuestions,
  currentQuestion,
  currentPart,
  examParts,
  onNavigateToQuestion,
  onToggleFlag,
  onStopExam,
  onSubmitExam,
  onSubmitPart,
  isTimeEnd,
  displayMode = "FULL_EXAM",
  completedParts = new Set(),
}) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getQuestionStatus = (
    question: ExamQuestion,
    currentQuestionId?: string
  ) => {
    const questionId = question._id;
    const response = userAnswers[questionId]?.answer;

    let isAnswered = false;

    // Nếu là câu hỏi trắc nghiệm đúng sai nhiều đáp án
    if (
      question?.question_type === "TN_TRUE_FALSE" ||
      question?.question_type === "TRUE_FALSE_STATEMENTS"
    ) {
      if (Array.isArray(response)) {
        const expectedAnswerCount =
          question?.choices?.length || (question as any)?.num_ques || 0;
        isAnswered = response.length >= expectedAnswerCount;
      }
    }
    //  Xử lý đặc biệt cho câu hỏi kéo thả (DRAG_DROP)
    else if (
      question?.question_type === "DRAG_DROP" ||
      question?.type === "dragdrop"
    ) {
      if (Array.isArray(response)) {
        // Đếm số ô trống trong câu hỏi
        const questionContent =
          question?.rawHtml || question?.plainText || question?.question || "";
        const blankCount = (questionContent.match(/_{3,}/g) || []).length;

        // Chỉ tính hoàn thành khi tất cả các ô trống đã được điền
        // và không có ô nào bị null hoặc empty
        const filledCount = response.filter(
          (item) => item !== null && item !== undefined && item !== ""
        ).length;
        isAnswered = filledCount === blankCount && blankCount > 0;
      }
    } else {
      isAnswered = Array.isArray(response)
        ? response.length > 0
        : response !== undefined && response !== "" && response != null;
    }

    const isFlagged = flaggedQuestions.has(questionId);
    const isCurrent = currentQuestionId
      ? questionId === currentQuestionId
      : false;

    if (isCurrent) return "current";
    if (isFlagged) return "flagged";
    if (isAnswered) return "answered";
    return "unanswered";
  };

  const getButtonStyles = (
    question: ExamQuestion,
    currentQuestionId?: string
  ) => {
    const questionId = question._id;
    const response = userAnswers[questionId]?.answer;

    let isAnswered = false;

    if (
      question?.question_type === "TN_TRUE_FALSE" ||
      question?.question_type === "TRUE_FALSE_STATEMENTS"
    ) {
      if (Array.isArray(response)) {
        const expectedAnswerCount =
          question?.choices?.length || (question as any)?.num_ques || 0;
        isAnswered = response.length >= expectedAnswerCount;
      }
    }
    //  Xử lý đặc biệt cho câu hỏi kéo thả (DRAG_DROP)
    else if (
      question?.question_type === "DRAG_DROP" ||
      question?.type === "dragdrop"
    ) {
      if (Array.isArray(response)) {
        // Đếm số ô trống trong câu hỏi
        const questionContent =
          question?.rawHtml || question?.plainText || question?.question || "";
        const blankCount = (questionContent.match(/_{3,}/g) || []).length;

        // Chỉ tính hoàn thành khi tất cả các ô trống đã được điền
        // và không có ô nào bị null hoặc empty
        const filledCount = response.filter(
          (item) => item !== null && item !== undefined && item !== ""
        ).length;
        isAnswered = filledCount === blankCount && blankCount > 0;
      }
    } else {
      isAnswered = Array.isArray(response)
        ? response.length > 0
        : response !== undefined && response !== "" && response != null;
    }

    const isFlagged = flaggedQuestions.has(questionId);
    const isCurrent = currentQuestionId
      ? questionId === currentQuestionId
      : false;

    let bgColor = "";
    let borderColor = "";
    let textColor = "";

    if (isCurrent) {
      bgColor = "bg-white";
      textColor = "text-green-600";
      borderColor = "border-2 border-green-500";
    } else if (isAnswered) {
      bgColor = "bg-[#2A7BF2]";
      textColor = "text-white";
      borderColor = "border border-[#2A7BF2]";
    } else {
      bgColor = "bg-white";
      textColor = "text-gray-700";
      borderColor = "border border-gray-300";
    }

    if (isFlagged && !isCurrent) {
      borderColor = "border-2 border-[#FFC23C]";
    }

    return `${bgColor} ${textColor} ${borderColor}`;
  };

  //  HÀM THỐNG NHẤT: Render question grid cho tất cả display modes
  const renderQuestionGrid = (
    partQuestions: ExamQuestion[],
    partIndex: number,
    partName: string
  ) => {
    const effectiveCurrentId =
      currentQuestionId || questions[currentQuestion]?._id;

    // Tìm tên môn (children.name) của câu đầu tiên trong part này
    const firstInPart = partQuestions[0] as any;
    const subjectHeaderName = firstInPart?.__childName;

    // Chỉ hiển thị tên children cho đề thi dạng "nhóm chủ đề" (NHOM_CHU_DE)
    const currentPartData = examParts[partIndex] as any;
    const isSubjectGroupType = currentPartData?.type === "NHOM_CHU_DE";

    //  Đối với nhóm chủ đề, nhóm câu hỏi theo môn học
    if (isSubjectGroupType) {
      // Nhóm câu hỏi theo __childName
      const questionsBySubject = partQuestions.reduce((acc, question) => {
        const subjectName = (question as any).__childName || "Không xác định";
        if (!acc[subjectName]) {
          acc[subjectName] = [];
        }
        acc[subjectName].push(question);
        return acc;
      }, {} as Record<string, ExamQuestion[]>);

      return (
        <div key={partIndex} className="mb-3">
          <h4 className="text-sm font-semibold text-gray-700 mb-1">
            {partName}
          </h4>
          <div className="space-y-2">
            {Object.entries(questionsBySubject).map(
              ([subjectName, subjectQuestions]) => (
                <div key={subjectName} className="space-y-2">
                  {/*  Tiêu đề subpart với style đẹp */}
                  <div className="text-xs font-medium text-blue-600 mb-2 px-2 py-1">
                    {subjectName}
                  </div>
                  <div className="grid grid-cols-5 gap-0.5">
                    {subjectQuestions.map((question, index) => {
                      const questionNumber =
                        (question as any)?.number || index + 1;
                      const globalIndex = questions.findIndex(
                        (q) => q._id === question._id
                      );

                      if (globalIndex === -1) {
                        console.warn(
                          `[ExamSidebar] Question ${question._id} not found in questions array`
                        );
                        return null;
                      }

                      const buttonStyles = getButtonStyles(
                        question,
                        effectiveCurrentId
                      );

                      return (
                        <button
                          key={`${partIndex}-${question._id}-${questionNumber}`}
                          onClick={() => {
                            onNavigateToQuestion(globalIndex);
                          }}
                          className={`
                          h-8 w-8 rounded text-xs font-medium transition-all duration-200
                          ${buttonStyles}
                          cursor-pointer hover:scale-110
                        `}
                          title={`Câu ${questionNumber}`}
                        >
                          {questionNumber}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      );
    }

    //  Nhóm câu hỏi theo __subpartName, và chỉ hiển thị tiêu đề subpart khi any(__isMain === false)
    const questionsBySubpart = partQuestions.reduce((acc, question) => {
      const subpartName = (question as any).__subpartName || "";
      if (!acc[subpartName]) {
        acc[subpartName] = [] as ExamQuestion[];
      }
      acc[subpartName].push(question);
      return acc;
    }, {} as Record<string, ExamQuestion[]>);

    return (
      <div key={partIndex} className="mb-3">
        <h4 className="text-sm font-semibold text-gray-700 mb-1">{partName}</h4>
        <div className="space-y-2">
          {Object.entries(questionsBySubpart).map(
            ([subpartName, subpartQuestions]) => (
              <div key={subpartName || "no-subpart"} className="space-y-2">
                {(() => {
                  const showHeader = subpartQuestions.some(
                    (q: any) => q?.__isMain === false
                  );
                  return showHeader && subpartName ? (
                    <div className="text-xs font-medium text-blue-600 mb-2 px-2 py-1">
                      {subpartName}
                    </div>
                  ) : null;
                })()}
                <div className="grid grid-cols-5 gap-1">
                  {subpartQuestions.map((question, index) => {
                    const questionNumber =
                      (question as any)?.number || index + 1;

                    //  Tìm globalIndex chính xác từ danh sách questions gốc
                    const globalIndex = questions.findIndex(
                      (q) => q._id === question._id
                    );

                    //  Bỏ qua nếu không tìm thấy
                    if (globalIndex === -1) {
                      console.warn(
                        `[ExamSidebar] Question ${question._id} not found in questions array`
                      );
                      return null;
                    }

                    const buttonStyles = getButtonStyles(
                      question,
                      effectiveCurrentId
                    );

                    return (
                      <button
                        key={`${partIndex}-${question._id}-${questionNumber}`}
                        onClick={() => {
                          onNavigateToQuestion(globalIndex);
                        }}
                        className={`
                          h-8 w-8 rounded text-xs font-medium transition-all duration-200
                          ${buttonStyles}
                          cursor-pointer hover:scale-110
                        `}
                        title={`Câu ${questionNumber}`}
                      >
                        {questionNumber}
                      </button>
                    );
                  })}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    );
  };

  //  HÀM HELPER: Lấy câu hỏi theo part
  const getQuestionsForPart = (partIndex: number) => {
    const part = examParts[partIndex] as any;
    if (!part) return [];

    const partId = part.id || part._id || `part_${partIndex}`;
    const inPart = questions.filter((q) => (q as any).__partId === partId);

    //  Nếu là NHOM_CHU_DE và danh sách câu hỏi có gắn __childId, ưu tiên chỉ hiển thị theo môn đã chọn
    if (part?.type === "NHOM_CHU_DE") {
      // Sidebar không biết trực tiếp selectedSubjects, nhưng danh sách questions đã được filter
      // từ WordExamViewer (getCurrentQuestions/flatQuestions) theo môn đã chọn, nên chỉ cần trả về inPart
      return inPart;
    }

    return inPart;
  };

  return (
    <div className="exam-sidebar-responsive w-80 bg-white border-r border-gray-200 p-4">
      {/* Timer */}
      <div className="mb-4 rounded-xl bg-[#F3F7FF] p-5 flex-shrink-0">
        <div className="flex items-center justify-center space-x-3">
          <img
            src={encodeURI("/icon/đếm ngược.svg")}
            alt="Đồng hồ"
            className="h-12 w-12"
          />
          <div className="text-center">
            <div className="text-[14px] font-medium text-gray-700">
              Thời gian làm bài
            </div>
            <div className="text-[32px] leading-8 font-extrabold text-gray-900">
              {formatTime(timeRemaining)}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-4 flex items-center space-x-3 flex-shrink-0">
        <button
          onClick={onStopExam}
          disabled={isTimeEnd}
          className="flex-1 py-2 px-3 rounded-lg border border-[#2A7BF2] text-[#2A7BF2] bg-white hover:bg-[#EAF2FF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Ngừng làm
        </button>
        <button
          onClick={displayMode === "FULL_EXAM" ? onSubmitExam : onSubmitPart}
          disabled={isTimeEnd}
          className="flex-1 py-2 px-3 rounded-lg bg-[#25C16F] text-white hover:brightness-95 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {displayMode === "FULL_EXAM" ? "Nộp bài" : "Nộp phần"}
        </button>
      </div>

      {/* Progress */}
      <div className="mb-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">
            Tiến độ làm bài:
          </span>
          <span className="text-xs text-gray-600">
            {answeredCount}/{totalQuestions}
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-[#E8EEF9]">
          <div
            className="h-2 rounded-full bg-[#2A7BF2] transition-all"
            style={{
              width: `${
                totalQuestions > 0
                  ? Math.max(
                      0,
                      Math.min(100, (answeredCount / totalQuestions) * 100)
                    )
                  : 0
              }%`,
            }}
          />
        </div>
      </div>

      {/*  Question Navigation - THỐNG NHẤT CHO TẤT CẢ DISPLAY MODES */}
      <div className="exam-sidebar-scrollable p-4 pt-2 pb-8">
        {displayMode === "SINGLE_QUESTION" && (
          <div className="space-y-2">
            {(() => {
              const partQuestions = getQuestionsForPart(currentPart);
              const part = examParts[currentPart];

              if (!part || partQuestions.length === 0) {
                return (
                  <div className="text-center py-4 text-gray-500">
                    <p>Không có câu hỏi nào trong phần này</p>
                    <p className="text-xs mt-1">
                      Part: {currentPart}, Questions: {partQuestions.length}
                    </p>
                  </div>
                );
              }

              return renderQuestionGrid(
                partQuestions,
                currentPart,
                part.name || `Phần ${currentPart + 1}`
              );
            })()}
          </div>
        )}

        {displayMode === "PER_PART" && (
          <div className="space-y-2">
            {(() => {
              const partQuestions = getQuestionsForPart(currentPart);
              const part = examParts[currentPart];

              if (!part || partQuestions.length === 0) {
                return (
                  <div className="text-center py-4 text-gray-500">
                    <p>Không có câu hỏi nào trong phần này</p>
                    <p className="text-xs mt-1">
                      Part: {currentPart}, Questions: {partQuestions.length}
                    </p>
                  </div>
                );
              }

              return renderQuestionGrid(
                partQuestions,
                currentPart,
                part.name || `Phần ${currentPart + 1}`
              );
            })()}
          </div>
        )}

        {displayMode === "FULL_EXAM" && (
          <div className="space-y-2">
            {(() => {
              const currentIsSubjectGroup =
                (examParts[currentPart] as any)?.type === "NHOM_CHU_DE";
              const isFirstPartSubjectGroup =
                currentPart === 0 &&
                (examParts[0] as any)?.type === "NHOM_CHU_DE";

              return examParts.map((part, partIndex) => {
                //  Xử lý nhóm chủ đề ở phần đầu tiên
                if (isFirstPartSubjectGroup && partIndex === 0) {
                  // Hiển thị phần đầu tiên nếu là nhóm chủ đề
                  const partQuestions = getQuestionsForPart(partIndex);
                  if (partQuestions.length === 0) return null;

                  return renderQuestionGrid(
                    partQuestions,
                    partIndex,
                    (part.name || `Phần ${partIndex + 1}`).toUpperCase()
                  );
                }

                // Logic cũ cho các trường hợp khác
                if (currentIsSubjectGroup && partIndex !== currentPart) {
                  return null;
                }

                const partQuestions = getQuestionsForPart(partIndex);

                if (partQuestions.length === 0) return null;

                return renderQuestionGrid(
                  partQuestions,
                  partIndex,
                  (part.name || `Phần ${partIndex + 1}`).toUpperCase()
                );
              });
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamSidebar;
