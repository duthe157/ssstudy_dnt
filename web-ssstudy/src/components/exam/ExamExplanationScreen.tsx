// Màn hình xem lời giải chi tiết

import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
} from "react";
import DynamicHeader from "../layout/DynamicHeader";
import { RootContext } from "@/contexts/RootContext";
import { WordExamData, UserAnswer } from "@/types/exam";
import { wordExamService } from "@/services/wordExamService";
import Question from "./Question";
import ClusterQuestion from "./questions/Cluster";
import { useAdminMathHTML, setupAutoRender } from "@/utils/mathProcessor";
import { isVietnamese } from "@/utils/baseHelper";
import { decodeHtmlEntities } from "@/utils/baseHelper";

interface ExamExplanationScreenProps {
  examData: WordExamData;
  userAnswers: UserAnswer[];
  examId: string;
  classroomId?: string;
  onBack?: () => void;
  selectedSubjects?: any[];
  onRetakeExam?: () => void;
  is_redo?: boolean;
  shouldDelayAnswer?: boolean;
  hideRetakeBtn?: boolean;
}

// Component Popup lời giải
interface ExplanationContentProps {
  question: any;
  questionNumber: number;
  onToggleExplanation?: () => void;
}

//  FUNCTION XỬ LÝ VIDEO URL - ĐÃ CẬP NHẬT HỖ TRỢ BUNNY.NET
const processVideoUrl = (url: string): string => {
  if (!url) return "";

  try {
    // 1. XỬ LÝ BUNNY.NET - CHUYỂN TỪ /play/ SANG /embed/
    if (url.includes("iframe.mediadelivery.net")) {
      // Chuyển từ /play/ sang /embed/
      let embedUrl = url;
      if (url.includes("/play/")) {
        embedUrl = url.replace("/play/", "/embed/");
      }

      // Thêm autoplay parameter nếu chưa có
      if (!embedUrl.includes("autoplay=")) {
        const separator = embedUrl.includes("?") ? "&" : "?";
        embedUrl = `${embedUrl}${separator}autoplay=true&preload=true`;
      }

      return embedUrl;
    }

    // 2. XỬ LÝ YOUTUBE URLs - hỗ trợ nhiều format
    const youtubeRegexes = [
      /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})(?:&.*)?/,
      /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\?.*)?/,
      /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /(?:m\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})(?:&.*)?/,
    ];

    for (const regex of youtubeRegexes) {
      const match = url.match(regex);
      if (match && match[1]) {
        const videoId = match[1];
        return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
      }
    }

    // 3. XỬ LÝ VIMEO URLs
    const vimeoRegex = /(?:vimeo\.com\/)([0-9]+)/;
    const vimeoMatch = url.match(vimeoRegex);

    if (vimeoMatch && vimeoMatch[1]) {
      const videoId = vimeoMatch[1];
      return `https://player.vimeo.com/video/${videoId}`;
    }

    // Nếu không nhận dạng được thì return URL gốc
    return url;
  } catch (error) {
    console.error("[processVideoUrl] Error processing video URL:", error);
    return url;
  }
};

const ExplanationContent: React.FC<ExplanationContentProps> = ({
  question,
  questionNumber,
  onToggleExplanation,
}) => {
  const explanation = question?.explanation || "Chưa có lời giải chi tiết.";
  const rawVideoUrl = question?.video;
  const videoUrl = rawVideoUrl ? processVideoUrl(rawVideoUrl) : null;
  const contentRef = useRef<HTMLDivElement | null>(null);
  const questionKey =
    question?.questionId || question?._id || question?.id || questionNumber;
  const renderedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    renderedKeyRef.current = null;
  }, [questionKey]);

  useEffect(() => {
    if (!contentRef.current) return;
    if (renderedKeyRef.current === questionKey) return;
    renderedKeyRef.current = questionKey;
    // DISABLED: setupAutoRender vì đã pre-render trong useAdminMathHTML
    // const timer = setTimeout(() => {
    //   if (contentRef.current) {
    //     setupAutoRender(contentRef.current);
    //   }
    // }, 50);
    // return () => clearTimeout(timer);
  }, [questionKey]);

  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 sm:p-5">
      <div className="flex items-center gap-2 text-blue-800 font-semibold">
        <span>Lời giải cho câu {questionNumber}</span>
      </div>

      {/* Dành cho câu hỏi Điền số/Trả lời ngắn/Kéo thả: Hiển thị nhanh danh sách đáp án */}
      {(() => {
        const type = String(
          question?.question_type || question?.type || "",
        ).toUpperCase();
        const isTargetType =
          type === "FILL_BLANK" ||
          type === "SHORT_ANSWER" ||
          type === "DRAG_DROP" ||
          type === "FILLINBLANK" ||
          type === "SHORTANSWER" ||
          type === "DRAGDROP";

        if (!isTargetType) return null;

        const correctAnswers = question.correctAnswers || [];
        if (!Array.isArray(correctAnswers) || correctAnswers.length === 0)
          return null;

        return (
          <div className="mt-3 p-3 bg-green-50 border border-green-100 rounded-lg">
            <div className="text-green-800 font-bold mb-1 flex items-center gap-2 text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              Đáp án:
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {correctAnswers.map((ca: any, idx: number) => {
                const val =
                  typeof ca === "string"
                    ? ca
                    : ca.value || ca.text || ca.label || "";
                if (!val) return null;
                const displayVal = String(val).split("|").join(" hoặc ");
                return (
                  <div key={idx} className="text-gray-700 text-sm">
                    {correctAnswers.length > 1 && (
                      <span className="font-semibold text-gray-500 mr-1">
                        ({idx + 1}):
                      </span>
                    )}
                    <span className="text-blue-700 font-bold">
                      {displayVal}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      <div className="mt-3 sm:mt-4 bg-white rounded-lg border border-blue-100 p-4 sm:p-5 shadow-sm">
        <div className="w-full overflow-x-auto">
          <div
            ref={contentRef}
            className="min-w-0 max-w-full break-words whitespace-pre-wrap text-gray-800 leading-relaxed text-sm sm:text-base exam-content
              [&_p]:mb-2 [&_p]:sm:mb-3
              [&_ul]:ml-3 [&_ul]:sm:ml-4
              [&_ol]:ml-3 [&_ol]:sm:ml-4
              [&_li]:mb-1 [&_li]:sm:mb-2
              [&_h1]:text-lg [&_h1]:sm:text-xl [&_h1]:font-bold [&_h1]:mb-2 [&_h1]:sm:mb-3
              [&_h2]:text-base [&_h2]:sm:text-lg [&_h2]:font-semibold [&_h2]:mb-2
              [&_h3]:text-sm [&_h3]:sm:text-base [&_h3]:font-medium [&_h3]:mb-2
              [&_strong]:font-semibold
              [&_em]:italic
              [&_img]:mx-auto [&_img]:my-3 [&_img]:sm:my-4
              [&_table]:border-collapse [&_table]:my-4 [&_table]:w-full [&_table]:max-w-full [&_table]:table-auto
              [&_td]:border [&_td]:border-gray-300 [&_td]:p-2 [&_td]:text-sm [&_td]:align-top [&_td]:break-words
              [&_th]:border [&_th]:border-gray-300 [&_th]:p-2 [&_th]:bg-gray-100 [&_th]:font-semibold [&_th]:text-sm [&_th]:align-top [&_th]:break-words"
            dangerouslySetInnerHTML={{
              __html: useAdminMathHTML(decodeHtmlEntities(explanation)),
            }}
          />
        </div>
      </div>

      {videoUrl && (
        <div className="mt-4 sm:mt-5 rounded-xl overflow-hidden border border-blue-100 bg-white">
          <div className="relative w-full max-w-4xl mx-auto aspect-video">
            <iframe
              src={videoUrl}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              title={`Video giải thích câu ${questionNumber}`}
              referrerPolicy="strict-origin-when-cross-origin"
              style={{
                border: "none",
                display: "block",
              }}
            />
          </div>
        </div>
      )}
      {onToggleExplanation && (
        <div className="mt-4 sm:mt-5 text-right">
          <button
            onClick={onToggleExplanation}
            className="inline-flex items-center gap-2 text-blue-600 text-sm hover:underline bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
          >
            Thu gọn
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

const ExamExplanationScreen: React.FC<ExamExplanationScreenProps> = ({
  examData,
  userAnswers,
  examId,
  classroomId,
  onBack,
  selectedSubjects = [],
  onRetakeExam,
  is_redo,
  shouldDelayAnswer = false,
  hideRetakeBtn = false,
}) => {
  // Helper function để so sánh đáp án FILL_BLANK với logic mới
  const compareFillBlankAnswer = (userAnswer: any, correctAnswer: any) => {
    if (!userAnswer || !correctAnswer) return false;

    // Lấy giá trị từ correctAnswer (có thể là string hoặc object)
    const correctValue =
      typeof correctAnswer === "string"
        ? correctAnswer
        : correctAnswer.value ||
          correctAnswer.label ||
          correctAnswer.text ||
          "";

    // Lấy giá trị từ userAnswer (có thể là string hoặc array)
    const userValue = Array.isArray(userAnswer)
      ? userAnswer[0]
      : userAnswer.value || userAnswer.label || userAnswer.text || userAnswer;

    // Normalize cả hai giá trị
    const normalize = (value: any) => {
      if (value == null) return "";
      return String(value)
        .replace(/<[^>]*>/g, " ")
        .replace(/\&nbsp;/g, " ")
        .replace(/\u00A0/g, " ")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/,/g, ".");
    };

    const normalizedUser = normalize(userValue);
    const normalizedCorrect = normalize(correctValue);

    // Kiểm tra nếu có dấu | trong đáp án đúng (nhiều đáp án được chấp nhận)
    if (normalizedCorrect.includes("|")) {
      const acceptedAnswers = normalizedCorrect
        .split("|")
        .map((answer) => answer.trim())
        .filter(Boolean);
      const result = acceptedAnswers.includes(normalizedUser);
      return result;
    }

    // So sánh trực tiếp nếu không có dấu |
    const result = normalizedUser === normalizedCorrect;
    return result;
  };
  const rootContext = useContext(RootContext);
  const [explanationData, setExplanationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedExplanations, setExpandedExplanations] = useState<Set<string>>(
    new Set(),
  );
  const questionScrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Kiểm tra xem đề thi đã đóng chưa (để xác định có cho phép thi lại không)
  const practiceConfig = (examData as any)?.practiceConfig;
  const isExamEnded = (() => {
    if (!practiceConfig) return false;
    if (practiceConfig.status === "ended") return true;
    const endRaw = practiceConfig.endDate || practiceConfig.end_date;
    if (!endRaw) return false;
    const now = new Date();
    const endDate = new Date(endRaw);
    return now >= endDate;
  })();

  // Phân biệt đề thi đấu trường (có practiceConfig.status active + ngày đóng) vs đề thi thường
  const isPracticeMode = (() => {
    if (!practiceConfig) return false;
    const statusVal = practiceConfig.status;
    const hasActiveStatus =
      statusVal === true || statusVal === "true" || statusVal === "ended";
    const hasEndDate = !!(practiceConfig.endDate || practiceConfig.end_date);
    return hasActiveStatus && hasEndDate;
  })();

  // Đề thi thường: chỉ cần is_redo là true
  // Đề thi đấu trường: cần đề đã đóng VÀ is_redo là true
  const canRetakeExam = isPracticeMode
    ? isExamEnded && is_redo === true
    : is_redo === true;

  // Responsive: detect mobile and close sidebar by default on small screens
  useEffect(() => {
    function isIpadOrTablet() {
      if (typeof window === "undefined") return false;
      const ua =
        (typeof navigator !== "undefined" && navigator.userAgent) || "";

      const isIOS13Ipad =
        typeof navigator !== "undefined" &&
        navigator.platform === "MacIntel" &&
        navigator.maxTouchPoints > 1;

      return /iPad/i.test(ua) || isIOS13Ipad;
    }

    const updateIsMobile = () => {
      try {
        const width = typeof window !== "undefined" ? window.innerWidth : 0;
        const small = width < 1280 || isIpadOrTablet();
        setIsMobile(!!small);
        if (small) setShowSidebar(false);
      } catch {}
    };
    updateIsMobile();
    window.addEventListener("resize", updateIsMobile);
    return () => window.removeEventListener("resize", updateIsMobile);
  }, []);

  // Setup LaTeX rendering khi questions được load và render
  useEffect(() => {
    if (allQuestions.length > 0 && !loading) {
      // DISABLED: setupAutoRender vì đã pre-render trong useAdminMathHTML
      // const timer = setTimeout(() => {
      //   const container = questionScrollContainerRef.current;
      //   if (container) {
      //     setupAutoRender(container);
      //   }
      // }, 100);
      // return () => clearTimeout(timer);
    }
  }, [allQuestions, loading]);

  const getQuestionKey = useCallback((question: any): string => {
    return (
      question?.questionId ||
      question?._id ||
      question?.id ||
      String(question?.number || "")
    );
  }, []);

  // HÀM mapQuestionType - ƯU TIÊN TUYỆT ĐỐI TYPE TỪ API
  const mapQuestionType = useCallback((type: string) => {
    if (!type) return "TN_SINGLE_CHOICE";
    const key = String(type).toLowerCase();
    const typeMap: Record<string, string> = {
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
      tuluan: "ESSAY",
    };
    return typeMap[key] || "TN_SINGLE_CHOICE";
  }, []);

  // Gọi API lấy lời giải chi tiết
  useEffect(() => {
    const fetchExplanation = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await wordExamService.getExplanation(examId);

        if (result?.code === 200 && result?.data?.exam) {
          setExplanationData(result.data.exam);

          // ĐỌC TYPE MAP TỪ LOCALSTORAGE
          let savedTypeMap: Record<string, string> = {};
          try {
            const storageKey = `exam_types_${examId}`;
            const savedTypes = localStorage.getItem(storageKey);
            if (savedTypes) {
              savedTypeMap = JSON.parse(savedTypes);
            }
          } catch (err) {
            console.error(
              "[ExamExplanationScreen] Error loading saved types:",
              err,
            );
          }

          // Flatten tất cả câu hỏi từ các parts
          const questions: any[] = [];
          const apiQuestionIds: string[] = [];
          const processedClusters = new Set<string>();

          result.data.exam.parts?.forEach((part: any, partIdx: number) => {
            let isFirstInPart = true;

            part.subpart?.forEach((subpart: any) => {
              subpart.children?.forEach((child: any) => {
                //  THAY ĐỔI: Không sắp xếp theo number, giữ nguyên thứ tự trong subpart
                // để hiển thị câu hỏi theo subpart thay vì trộn lẫn theo number
                const sortedQuestions = [...(child.questions || [])];

                sortedQuestions.forEach((q: any, qIndex: number) => {
                  const questionData = q.question || q;
                  const questionType = (
                    questionData.type ||
                    q.type ||
                    ""
                  ).toLowerCase();
                  // Xử lý cluster main -> gom subquestions vào một nhóm
                  if (questionType === "cluster") {
                    const clusterId = questionData._id || q._id;
                    if (processedClusters.has(clusterId)) return;

                    const clusterQuestions = sortedQuestions.filter(
                      (subQ: any) => {
                        const subQData = (subQ as any).question || subQ;
                        const mainQuestionId =
                          (questionData as any).questionId ||
                          (q as any).questionId ||
                          questionData._id ||
                          q._id;
                        return subQData.parentId === mainQuestionId;
                      },
                    );

                    const processedClusterQuestion = {
                      ...q,
                      ...questionData,
                      _id:
                        questionData._id ||
                        q._id ||
                        `cluster_${questions.length + 1}`,
                      question_type: "CLUSTER_QUESTION",
                      type: "cluster",
                      parentId: undefined,
                      question:
                        questionData.rawHtml ||
                        questionData.plainText ||
                        questionData.question ||
                        q.question,
                      plainText:
                        questionData.plainText ||
                        questionData.question ||
                        q.question,
                      rawHtml:
                        questionData.rawHtml ||
                        questionData.question ||
                        q.question,
                      choices: questionData.choices || q.choices || [],
                      correctAnswers:
                        questionData.correctAnswers || q.correctAnswers || [],
                      __partId: part.id || part._id || `part_${partIdx}`,
                      __partName: part.name,
                      __subpartId: subpart.id || subpart._id,
                      __subpartName: subpart.name,
                      __isMain: subpart.isMain || false,
                      __childId: child.id || child._id,
                      __childName: child.name,
                      __showPartHeader: isFirstInPart,
                      __isCluster: true,
                      __clusterQuestions: clusterQuestions.map(
                        (cq: any, cqIndex: number) => {
                          const cqData = (cq as any).question || cq;
                          return {
                            ...cq,
                            ...cqData,
                            __innerId: cqData._id || undefined,
                            _id:
                              cqData._id ||
                              cq._id ||
                              `sub_${questions.length + 1}`,
                            question_type: mapQuestionType(
                              cqData.type || cq.question_type || "",
                            ),
                            // ensure linkage even if API misses it
                            parentId:
                              (cqData as any)?.parentId ??
                              (cq as any)?.parentId ??
                              ((questionData as any).questionId ||
                                (q as any).questionId ||
                                questionData._id ||
                                q._id),
                            question:
                              cqData.rawHtml ||
                              cqData.plainText ||
                              cqData.question ||
                              cq.question,
                            plainText:
                              cqData.plainText ||
                              cqData.question ||
                              cq.question,
                            rawHtml:
                              cqData.rawHtml || cqData.question || cq.question,
                            choices: cqData.choices || cq.choices || [],
                            correctAnswers:
                              cqData.correctAnswers || cq.correctAnswers || [],
                            isTestQuestion:
                              cqData.isTestQuestion ||
                              cq.isTestQuestion ||
                              false,
                            questionNumber: cq.number || cqData.number,
                            number: cq.number || cqData.number,
                            questionId: cqData._id || cq._id,
                            // Inherit grouping metadata so sidebar can group/filter by subject correctly
                            __partId: part.id || part._id || `part_${partIdx}`,
                            __partName: part.name,
                            __subpartId: subpart.id || subpart._id,
                            __subpartName: subpart.name,
                            __isMain: subpart.isMain || false,
                            __childId: child.id || child._id,
                            __childName: child.name,
                            partIndex: partIdx,
                            partName: part.name || `Phần ${partIdx + 1}`,
                          };
                        },
                      ),
                      partIndex: partIdx,
                      globalIndex: questions.length,
                      // main questionId must match children's parentId
                      questionId:
                        (questionData as any).questionId ||
                        (q as any).questionId ||
                        questionData._id ||
                        q._id,
                      partName: part.name || `Phần ${partIdx + 1}`,
                      questionNumber: q.number || 0,
                      number: q.number || 0,
                    };

                    questions.push(processedClusterQuestion);
                    processedClusters.add(clusterId);
                    isFirstInPart = false;
                    return;
                  }

                  // Bỏ qua câu hỏi con của cluster (đã được gom vào nhóm)
                  if (questionData.parentId) {
                    return;
                  }

                  //  XỬ LÝ CÂU HỎI THƯỜNG
                  const questionId =
                    questionData._id || questionData.id || q._id || q.id;

                  if (!questionId) {
                    return;
                  }

                  apiQuestionIds.push(questionId);

                  const savedType = savedTypeMap[questionId];
                  const apiTypeRaw =
                    savedType ||
                    questionData.type ||
                    q.question_type ||
                    q.type ||
                    questionData.question_type;

                  // HÀM PHÁT HIỆN LOẠI CÂU HỎI CẢI TIẾN
                  const detectQuestionType = (
                    q: any,
                    apiType: string,
                  ): string => {
                    if (apiType) {
                      const mapped = mapQuestionType(apiType);

                      const correctAnswers = q?.correctAnswers;
                      const correctIsArray = Array.isArray(correctAnswers);
                      const choicesArr = Array.isArray(q?.choices)
                        ? q.choices
                        : [];
                      const multiByCorrectLen =
                        correctIsArray && correctAnswers.length > 1;
                      const multiByChoiceFlag =
                        choicesArr.filter((c: any) => c?.isCorrect === true)
                          .length > 1;
                      const multiByCommaSeparated = (() => {
                        if (!correctIsArray || correctAnswers.length !== 1)
                          return false;
                        const single = correctAnswers[0] as any;
                        const raw =
                          (typeof single === "string" && single) ||
                          (typeof single === "object" &&
                            (single.value || single.label));
                        if (typeof raw !== "string") return false;
                        const parts = raw
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean);
                        return parts.length > 1;
                      })();

                      if (
                        (mapped === "TN_SINGLE_CHOICE" || !mapped) &&
                        (multiByCorrectLen ||
                          multiByChoiceFlag ||
                          multiByCommaSeparated)
                      ) {
                        return "TN_MULTI_CHOICE";
                      }

                      return mapped;
                    }

                    const normalize = (s: any) =>
                      String(s ?? "")
                        .trim()
                        .toLowerCase();
                    const tfSet = new Set(["đúng", "sai", "true", "false"]);

                    const hasDragDropOptions =
                      Array.isArray(q.dragDropOptions) &&
                      q.dragDropOptions.length > 0;
                    const hasDragItems =
                      Array.isArray(q.dragItems) && q.dragItems.length > 0;
                    if (hasDragDropOptions || hasDragItems) {
                      return "DRAG_DROP";
                    }

                    const hasBlanks =
                      Array.isArray(q.blanks) && q.blanks.length > 0;
                    const hasAnswerVariants =
                      Array.isArray(q.answerVariants) &&
                      q.answerVariants.length > 0;
                    const content =
                      q.rawHtml || q.plainText || q.question || "";
                    const hasUnderscores = /_{3,}/.test(String(content));
                    if (hasBlanks || hasAnswerVariants || hasUnderscores) {
                      return "FILL_BLANK";
                    }

                    const correctAnswers = q.correctAnswers;
                    const correctIsObject =
                      !!correctAnswers &&
                      !Array.isArray(correctAnswers) &&
                      typeof correctAnswers === "object";
                    const hasStatements =
                      Array.isArray(q.statements) && q.statements.length > 0;
                    const hasNumQues = Number(q.num_ques || 0) > 1;
                    const hasMultipleChoicesWithTF =
                      Array.isArray(q.choices) &&
                      q.choices.length > 2 &&
                      q.choices.some((c: any) =>
                        tfSet.has(
                          normalize(c?.text ?? c?.label ?? c?.value ?? c),
                        ),
                      );

                    if (
                      correctIsObject ||
                      hasStatements ||
                      hasNumQues ||
                      hasMultipleChoicesWithTF
                    ) {
                      return "TRUE_FALSE_STATEMENTS";
                    }

                    const choicesArr = Array.isArray(q.choices)
                      ? q.choices
                      : [];
                    const isTwoChoice = choicesArr.length === 2;
                    const getText = (c: any) =>
                      normalize(c?.text ?? c?.label ?? c?.value ?? c);
                    const looksLikeTrueFalse =
                      isTwoChoice &&
                      choicesArr.every((c: any) => tfSet.has(getText(c)));

                    const correctIsArray = Array.isArray(correctAnswers);
                    const correctLooksTF =
                      correctIsArray &&
                      correctAnswers.length === 1 &&
                      tfSet.has(
                        normalize(
                          correctAnswers[0]?.value ??
                            correctAnswers[0]?.label ??
                            correctAnswers[0],
                        ),
                      );

                    if (looksLikeTrueFalse || correctLooksTF) {
                      return "TRUE_FALSE";
                    }

                    const multiByCorrectLen =
                      correctIsArray && correctAnswers.length > 1;
                    const multiByChoiceFlag =
                      choicesArr.filter((c: any) => c?.isCorrect === true)
                        .length > 1;
                    const multiByCommaSeparated = (() => {
                      if (!correctIsArray || correctAnswers.length !== 1)
                        return false;
                      const single = correctAnswers[0] as any;
                      const raw =
                        (typeof single === "string" && single) ||
                        (typeof single === "object" &&
                          (single.value || single.label));
                      if (typeof raw !== "string") return false;
                      const parts = raw
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean);
                      return parts.length > 1;
                    })();

                    if (
                      multiByCorrectLen ||
                      multiByChoiceFlag ||
                      multiByCommaSeparated
                    ) {
                      return "TN_MULTI_CHOICE";
                    }

                    const hasShortAnswerSignals =
                      !choicesArr.length &&
                      !hasBlanks &&
                      !hasDragDropOptions &&
                      correctIsArray &&
                      correctAnswers.length > 0;

                    if (hasShortAnswerSignals) {
                      return "SHORT_ANSWER";
                    }

                    return "TN_SINGLE_CHOICE";
                  };

                  const detectedQuestionType = detectQuestionType(
                    questionData,
                    apiTypeRaw,
                  );

                  // Helper: loại bỏ thẻ HTML (ví dụ <p>, </p>) khỏi chuỗi
                  const stripHtml = (s: string): string =>
                    s.replace(/<[^>]*>/g, "").trim();

                  // Helper: chuẩn hóa dragDropOptions về mảng string ["1","2",...]
                  const normalizeDragOptions = (raw: any): string[] => {
                    if (!raw) return [];
                    if (Array.isArray(raw)) {
                      if (raw.length === 1 && typeof raw[0] === "string") {
                        return raw[0]
                          .split(",")
                          .map((s) =>
                            stripHtml(
                              String(s)
                                .replace(/\&nbsp;/g, " ")
                                .trim(),
                            ),
                          )
                          .filter(Boolean);
                      }
                      return raw
                        .map((s: any) => stripHtml(String(s).trim()))
                        .filter(Boolean);
                    }
                    if (typeof raw === "string") {
                      return raw
                        .split(",")
                        .map((s) =>
                          stripHtml(
                            String(s)
                              .replace(/\&nbsp;/g, " ")
                              .trim(),
                          ),
                        )
                        .filter(Boolean);
                    }
                    return [];
                  };

                  // Helper: lấy dragDropOptions từ API đề thi gốc (examData) nếu API lời giải thiếu
                  const findDragOptionsFromExam = (
                    targetId: string,
                  ): string[] => {
                    try {
                      const parse = (val: any): string[] => {
                        if (!val) return [];
                        if (Array.isArray(val)) {
                          if (val.length === 1 && typeof val[0] === "string")
                            return val[0]
                              .split(",")
                              .map((s) =>
                                stripHtml(
                                  String(s)
                                    .replace(/\&nbsp;/g, " ")
                                    .trim(),
                                ),
                              )
                              .filter(Boolean);
                          return val
                            .map((s: any) => stripHtml(String(s).trim()))
                            .filter(Boolean);
                        }
                        if (typeof val === "string")
                          return val
                            .split(",")
                            .map((s) =>
                              stripHtml(
                                String(s)
                                  .replace(/\&nbsp;/g, " ")
                                  .trim(),
                              ),
                            )
                            .filter(Boolean);
                        return [];
                      };

                      for (const p of examData?.parts || []) {
                        for (const sp of p?.subpart || []) {
                          for (const ch of sp?.children || []) {
                            for (const q of ch?.questions || []) {
                              const qObj: any =
                                (q as any)?.question || (q as any);
                              const qid =
                                (qObj as any)?._id ||
                                (qObj as any)?.id ||
                                (q as any)?._id ||
                                (q as any)?.id;
                              if (qid === targetId) {
                                return parse(
                                  (qObj as any)?.dragDropOptions ??
                                    (q as any)?.dragDropOptions,
                                );
                              }
                            }
                          }
                        }
                      }
                    } catch {}
                    return [];
                  };

                  // Xử lý dữ liệu câu hỏi
                  const processedQuestion = {
                    ...q,
                    ...questionData,
                    _id: questionData._id || q._id || questionId,
                    __innerId: questionData._id || undefined,
                    __originalIndex: questions.length,
                    __apiTypeRaw: apiTypeRaw,
                    __savedType: savedType,
                    question_type: detectedQuestionType,
                    type: questionData.type || q.type,
                    parentId:
                      questionData.parentId !== undefined
                        ? questionData.parentId
                        : q.parentId,
                    question:
                      questionData.rawHtml ||
                      questionData.plainText ||
                      questionData.question ||
                      q.question,
                    plainText:
                      questionData.plainText ||
                      questionData.question ||
                      q.question,
                    rawHtml:
                      questionData.rawHtml ||
                      questionData.question ||
                      q.question,
                    choices: questionData.choices || q.choices || [],
                    correctAnswers:
                      questionData.correctAnswers || q.correctAnswers || [],
                    number: q.number || questions.length + 1,
                    images: questionData.images || q.images || [],
                    dragDropOptions: (() => {
                      const fromExplain = normalizeDragOptions(
                        questionData.dragDropOptions ?? q.dragDropOptions,
                      );
                      if (fromExplain.length) return fromExplain;
                      return findDragOptionsFromExam(
                        questionData._id || q._id || questionId,
                      );
                    })(),
                    dragItems: questionData.dragItems || q.dragItems || [],
                    blanks: questionData.blanks || q.blanks || [],
                    answerVariants:
                      questionData.answerVariants || q.answerVariants || [],
                    subQuestions:
                      questionData.subQuestions || q.subQuestions || [],
                    statements: questionData.statements || q.statements || [],
                    num_ques: questionData.num_ques || q.num_ques || 0,
                    isTestQuestion:
                      questionData.isTestQuestion || q.isTestQuestion || false,
                    partIndex: partIdx,
                    globalIndex: questions.length,
                    questionId,
                    partName: part.name || `Phần ${partIdx + 1}`,
                    questionNumber: q.number || questions.length + 1,
                    __partId: part.id || part._id || `part_${partIdx}`,
                    __partName: part.name,
                    __subpartId: subpart.id || subpart._id,
                    __subpartName: subpart.name,
                    __isMain: subpart.isMain || false,
                    __childId: child.id || child._id,
                    __childName: child.name,
                    __showPartHeader: isFirstInPart,
                  };

                  questions.push(processedQuestion);
                  isFirstInPart = false;
                });
              });
            });
          });

          setAllQuestions(questions);
        } else {
          setError("Không thể tải lời giải chi tiết.");
        }
      } catch (err) {
        console.error(
          "[ExamExplanationScreen] Error fetching explanation:",
          err,
        );
        setError("Không thể tải lời giải chi tiết. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    if (examId) {
      fetchExplanation();
    } else {
      setLoading(false);
    }
  }, [examId, mapQuestionType, examData]);

  const toggleExplanation = useCallback(
    (question: any) => {
      const key = getQuestionKey(question);
      if (!key) return;
      setExpandedExplanations((prev) => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      });
    },
    [getQuestionKey],
  );

  const renderExplanationSection = useCallback(
    (question: any) => {
      const questionNumber = question?.questionNumber || question?.number || "";
      return (
        <div id={`explanation-${getQuestionKey(question)}`} className="mt-3">
          <ExplanationContent
            question={question}
            questionNumber={questionNumber}
            onToggleExplanation={() => toggleExplanation(question)}
          />
        </div>
      );
    },
    [getQuestionKey, toggleExplanation],
  );

  const scrollQuestionIntoView = useCallback(
    (targetId: string) => {
      const container = questionScrollContainerRef.current;
      if (!targetId) return;

      if (container) {
        const target = container.querySelector<HTMLElement>(`#${targetId}`);
        if (target) {
          const containerRect = container.getBoundingClientRect();
          const targetRect = target.getBoundingClientRect();
          const currentScrollTop = container.scrollTop;
          const headerOffset = 0;
          const offset =
            currentScrollTop +
            (targetRect.top - containerRect.top) -
            headerOffset;
          container.scrollTo({
            top: Math.max(offset, 0),
            behavior: "smooth",
          });
          return;
        }
      }

      // Fallback: default browser behavior
      const fallbackTarget = document.getElementById(targetId);
      fallbackTarget?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [isMobile],
  );

  // Lấy câu trả lời của user cho câu hỏi
  const getUserAnswer = (questionId: string) => {
    let found = userAnswers.find((answer) => answer.question_id === questionId);

    if (!found) {
      const question = allQuestions.find((q) => q.questionId === questionId);
      if (question) {
        found = userAnswers.find(
          (answer) => answer.question_id === question._id,
        );

        if (!found && question.id) {
          found = userAnswers.find(
            (answer) => answer.question_id === question.id,
          );
        }
      }
    }

    return found;
  };

  // Hàm so sánh đáp án user với đáp án đúng
  const compareAnswers = (question: any, userAnswer: any) => {
    if (!question) {
      return { isCorrect: false, correctAnswers: [], userAnswers: [] };
    }

    const userAnswers = userAnswer
      ? Array.isArray(userAnswer.value)
        ? userAnswer.value
        : [userAnswer.value]
      : [];
    const correctAnswers = question.correctAnswers || [];

    if (!correctAnswers || correctAnswers.length === 0) {
      return {
        isCorrect: false,
        correctAnswers: [],
        userAnswers: userAnswers,
        hasCorrectAnswer: false,
      };
    }

    const normalizeLabel = (s: any) => String(s ?? "").trim();
    let correctAnswerLabels: string[] = [];
    if (Array.isArray(correctAnswers)) {
      if (correctAnswers.length === 1) {
        const single = correctAnswers[0] as any;
        const raw =
          (typeof single === "string" && single) ||
          (typeof single === "object" && (single.label || single.value)) ||
          single;
        if (typeof raw === "string" && raw.includes(",")) {
          correctAnswerLabels = raw
            .split(",")
            .map((s) => normalizeLabel(s))
            .filter(Boolean);
        } else {
          correctAnswerLabels = [
            normalizeLabel(
              typeof single === "string"
                ? single
                : single?.label || single?.value || single,
            ),
          ].filter(Boolean);
        }
      } else {
        correctAnswerLabels = correctAnswers
          .map((answer: any) =>
            normalizeLabel(
              typeof answer === "string"
                ? answer
                : answer?.label || answer?.value || answer,
            ),
          )
          .filter(Boolean);
      }
    }

    let isCorrect = false;

    if (!userAnswer) {
      return {
        isCorrect: false,
        correctAnswers: correctAnswerLabels,
        userAnswers: [],
        correctStatements:
          question.question_type === "TRUE_FALSE_STATEMENTS"
            ? question.correctAnswers
            : null,
      };
    }

    if (question.question_type === "TN_SINGLE_CHOICE") {
      const normalizeDecimal = (input: any) => {
        if (input == null) return "";
        let v = String(input).trim();
        v = v.replace(/\s+/g, "");
        v = v.replace(/,/g, ".");
        //  Chuẩn hóa về chữ thường để so sánh (vì userAnswers lưu chữ thường)
        v = v.toLowerCase();
        return v;
      };
      const userVal = normalizeDecimal(userAnswers[0]);
      const correctSet = new Set(
        correctAnswerLabels.map((v) => normalizeDecimal(v)),
      );
      isCorrect = userAnswers.length === 1 && correctSet.has(userVal);
    } else if (question.question_type === "TN_MULTI_CHOICE") {
      const normalizeDecimal = (input: any) => {
        if (input == null) return "";
        let v = String(input).trim();
        v = v.replace(/\s+/g, "");
        v = v.replace(/,/g, ".");
        //  Chuẩn hóa về chữ thường để so sánh (vì userAnswers lưu chữ thường)
        v = v.toLowerCase();
        return v;
      };
      const userSet: Set<string> = new Set(
        userAnswers.map((v: any) => normalizeDecimal(v)),
      );
      const correctSet: Set<string> = new Set(
        correctAnswerLabels.map((v) => normalizeDecimal(v)),
      );
      isCorrect =
        userSet.size === correctSet.size &&
        Array.from(userSet).every((answer: string) => correctSet.has(answer));
    } else if (question.question_type === "TRUE_FALSE") {
      //  Chuẩn hóa về chữ thường để so sánh
      const normalizeTF = (val: any) => {
        const v = String(val ?? "")
          .trim()
          .toLowerCase();
        if (v === "đúng" || v === "true" || v === "a") return "true";
        if (v === "sai" || v === "false" || v === "b") return "false";
        return v;
      };
      const userVal = normalizeTF(userAnswers[0]);
      const correctVals = correctAnswerLabels.map(normalizeTF);
      isCorrect = userAnswers.length === 1 && correctVals.includes(userVal);
    } else if (question.question_type === "TRUE_FALSE_STATEMENTS") {
      const userStatements = userAnswer.value || {};
      const correctStatements = question.correctAnswers || {};

      const statementKeys = Object.keys(correctStatements);
      isCorrect = statementKeys.every(
        (key) => userStatements[key] === correctStatements[key],
      );
    } else if (question.question_type === "FILL_BLANK") {
      const userAnswers = Array.isArray(userAnswer.value)
        ? userAnswer.value
        : [userAnswer.value];
      const correctAnswers = question.correctAnswers || [];

      const correctAnswerValues = correctAnswers.map((answer: any) => {
        if (typeof answer === "string") return answer;
        return answer.value || answer;
      });

      const normalizeDecimal = (input: any) => {
        if (input == null) return "";
        let v = String(input)
          .replace(/<[^>]*>/g, " ")
          .replace(/\&nbsp;/g, " ")
          .replace(/\u00A0/g, " ")
          .trim()
          .toLowerCase();
        v = v.replace(/\s+/g, "");
        v = v.replace(/,/g, ".");
        return v;
      };

      // Build acceptable sets per blank if API provides a flat list of variants
      const numBlanks = userAnswers.length;
      const groupedAcceptables: Array<Set<string>> = [];
      if (
        Array.isArray(correctAnswerValues) &&
        numBlanks > 0 &&
        correctAnswerValues.length >= numBlanks
      ) {
        if (correctAnswerValues.length % numBlanks === 0) {
          const groupSize = correctAnswerValues.length / numBlanks;
          for (let i = 0; i < numBlanks; i++) {
            const start = i * groupSize;
            const end = start + groupSize;
            groupedAcceptables.push(
              new Set(
                correctAnswerValues
                  .slice(start, end)
                  .map((v: any) => normalizeDecimal(v)),
              ),
            );
          }
        } else {
          // Fallback: allow any value for any blank (len mismatch from API)
          const all = new Set(
            correctAnswerValues.map((v: any) => normalizeDecimal(v)),
          );
          for (let i = 0; i < numBlanks; i++) groupedAcceptables.push(all);
        }
      }

      //  Sử dụng logic mới cho FILL_BLANK
      if (correctAnswers.length === 1 && userAnswers.length === 1) {
        // Trường hợp 1 ô điền
        isCorrect = compareFillBlankAnswer(userAnswers[0], correctAnswers[0]);
      } else if (correctAnswers.length === userAnswers.length) {
        // Trường hợp nhiều ô điền, mỗi ô có đáp án riêng
        isCorrect = userAnswers.every((userVal: any, index: number) => {
          if (index < correctAnswers.length) {
            return compareFillBlankAnswer(userVal, correctAnswers[index]);
          }
          return false;
        });
      } else {
        // Fallback: logic cũ cho trường hợp không khớp số lượng
        isCorrect = (() => {
          if (groupedAcceptables.length === numBlanks) {
            // Compare using acceptable sets per blank
            return (
              userAnswers.length === numBlanks &&
              userAnswers.every((userAns: any, idx: number) => {
                const actual = normalizeDecimal(userAns);
                const acceptable = groupedAcceptables[idx];
                return actual !== "" && acceptable.has(actual);
              })
            );
          }
          // Legacy exact index-by-index fallback
          return (
            userAnswers.length === correctAnswerValues.length &&
            userAnswers.every((userAns: any, index: number) => {
              const correctAns = correctAnswerValues[index];
              const userAnsTrimmed = normalizeDecimal(userAns);
              const correctAnsTrimmed = normalizeDecimal(correctAns);
              return (
                userAns && correctAns && userAnsTrimmed === correctAnsTrimmed
              );
            })
          );
        })();
      }
    } else if (question.question_type === "DRAG_DROP") {
      const userAnswers = Array.isArray(userAnswer.value)
        ? userAnswer.value
        : [userAnswer.value];
      const correctAnswers = question.correctAnswers || [];

      const correctAnswerValues = correctAnswers.map((answer: any) => {
        if (typeof answer === "string") return answer;
        return answer.value || answer;
      });

      //  Chuẩn hóa để so sánh (normalize whitespace và case)
      const normalize = (val: any) => {
        if (val == null) return "";
        return String(val)
          .replace(/\&nbsp;/g, " ")
          .trim()
          .toLowerCase()
          .replace(/\s+/g, " ");
      };

      isCorrect =
        userAnswers.length === correctAnswerValues.length &&
        userAnswers.every((userAns: any, index: number) => {
          const correctAns = correctAnswerValues[index];
          if (!userAns || !correctAns) return false;
          return normalize(userAns) === normalize(correctAns);
        });
    }

    return {
      isCorrect,
      correctAnswers: correctAnswerLabels,
      userAnswers: userAnswers,
      correctStatements:
        question.question_type === "TRUE_FALSE_STATEMENTS"
          ? question.correctAnswers
          : null,
    };
  };

  //  HÀM FIX QUESTION TYPE TRƯỚC KHI RENDER
  const fixQuestionTypeAtRender = (q: any, ua: any) => {
    if (q?.question_type) {
      const apiType = q.question_type;

      // 1) Nếu có tín hiệu drag&drop mạnh nhưng API không phải DRAG_DROP -> sửa lại
      const hasDragSignals =
        (Array.isArray(q?.dragDropOptions) && q.dragDropOptions.length > 0) ||
        (Array.isArray(q?.dragItems) && q.dragItems.length > 0);
      if (apiType !== "DRAG_DROP" && hasDragSignals) {
        return { ...q, question_type: "DRAG_DROP" };
      }

      // 2) Nếu có tín hiệu TRUE_FALSE_STATEMENTS mạnh nhưng API không phải TF_STATEMENTS -> sửa lại
      const normalize = (s: any) =>
        String(s ?? "")
          .trim()
          .toLowerCase();
      const tfSet = new Set(["đúng", "sai", "true", "false"]);
      const correctAnswers = q?.correctAnswers;
      const correctIsObject =
        !!correctAnswers &&
        !Array.isArray(correctAnswers) &&
        typeof correctAnswers === "object";
      const hasStatements =
        Array.isArray(q?.statements) && q.statements.length > 0;
      const hasNumQues = Number(q?.num_ques) > 1;
      const uaVal = ua?.value;
      const uaIsArray = Array.isArray(uaVal);
      const uaLooksStatements =
        uaIsArray &&
        uaVal.some(
          (it: any) =>
            (it &&
              typeof it === "object" &&
              ("option" in it || "questionOption" in it)) ||
            tfSet.has(normalize(it)),
        );
      if (
        apiType !== "TRUE_FALSE_STATEMENTS" &&
        apiType !== "TRUE_FALSE" &&
        (correctIsObject || hasStatements || hasNumQues || uaLooksStatements)
      ) {
        return { ...q, question_type: "TRUE_FALSE_STATEMENTS" };
      }

      // 3) Nếu API nói single nhưng dữ liệu cho thấy multi (kể cả "A, B")
      const correctAnswers2 = q?.correctAnswers;
      const correctIsArray = Array.isArray(correctAnswers2);
      const choicesArr = Array.isArray(q?.choices) ? q.choices : [];
      const multiByCorrectLen = correctIsArray && correctAnswers2.length > 1;
      const multiByChoiceFlag =
        choicesArr.filter((c: any) => c?.isCorrect === true).length > 1;
      const multiByCommaSeparated = (() => {
        if (!correctIsArray || correctAnswers2.length !== 1) return false;
        const single = correctAnswers2[0] as any;
        const raw =
          (typeof single === "string" && single) ||
          (typeof single === "object" && (single.value || single.label));
        if (typeof raw !== "string") return false;
        const parts = raw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        return parts.length > 1;
      })();

      if (
        apiType === "TN_SINGLE_CHOICE" &&
        (multiByCorrectLen || multiByChoiceFlag || multiByCommaSeparated)
      ) {
        return { ...q, question_type: "TN_MULTI_CHOICE" };
      }

      return q;
    }

    return q;
  };

  //  RENDER CÂU HỎI VỚI COMPONENT GỐC (HỖ TRỢ CHÙM)
  const renderQuestionWithOriginalComponent = (question: any) => {
    const userAnswer = getUserAnswer(question.questionId);
    const fixedQuestion = fixQuestionTypeAtRender(question, userAnswer);
    const answerComparison = compareAnswers(fixedQuestion, userAnswer);

    // Hỗ trợ cluster: render bằng ClusterQuestion và map kết quả
    if (question.__isCluster && question.__clusterQuestions) {
      const answerComparisonMap: Record<string, any> = {};
      question.__clusterQuestions.forEach((subQ: any) => {
        const subUserAnswer = getUserAnswer(subQ._id || subQ.questionId);
        const fixedSubQ = fixQuestionTypeAtRender(subQ, subUserAnswer);
        answerComparisonMap[subQ._id] = compareAnswers(
          fixedSubQ,
          subUserAnswer,
        );
      });

      const clusterResponses: any = {};
      [question, ...question.__clusterQuestions].forEach((q: any) => {
        const ua = getUserAnswer(q._id || q.questionId);
        if (ua) clusterResponses[q._id] = { answer: ua.value };
      });

      return (
        <div className="relative">
          <ClusterQuestion
            responses={clusterResponses}
            questions={[question, ...question.__clusterQuestions]}
            isTimeEnd={true}
            handleAnswerChange={() => {}}
            flaggedQuestions={new Set<string>()}
            onToggleFlag={undefined}
            hideLabelLetters={false}
            isExplanationMode={true}
            answerComparisonMap={answerComparisonMap}
            onOpenExplanation={(q) => toggleExplanation(q)}
            expandedExplanationIds={expandedExplanations}
            getExplanationKey={getQuestionKey}
            renderExplanationSection={renderExplanationSection}
          />
        </div>
      );
    }

    //  CÂU HỎI THƯỜNG
    const formatResponseValue = () => {
      if (!userAnswer) return undefined;
      const rawValue = userAnswer.value;
      if (!Array.isArray(rawValue)) {
        return rawValue;
      }

      const qType = fixedQuestion?.question_type || fixedQuestion?.type;
      if (
        rawValue.length === 1 &&
        (qType === "TN_SINGLE_CHOICE" || qType === "TRUE_FALSE")
      ) {
        return rawValue[0];
      }
      return rawValue;
    };

    const responses = userAnswer
      ? {
          [question._id]: {
            answer: formatResponseValue(),
          },
        }
      : {};

    const hasQuestionContent = !!(
      question.rawHtml ||
      question.plainText ||
      question.question
    );
    const hasChoices = !!(question.choices && question.choices.length > 0);

    if (!hasQuestionContent && !hasChoices) {
      return (
        <div className="w-full rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-6">
            <div className="mb-2 text-[18px] font-bold text-[#2A7BF2]">
              Câu {question.questionNumber}
            </div>
            <div className="text-red-500 text-sm mb-2">
              Không tìm thấy nội dung câu hỏi
            </div>
            <div className="text-xs text-gray-500">
              Question ID: {question._id}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="relative">
        <Question
          responses={responses}
          question={fixedQuestion}
          isTimeEnd={true}
          handleAnswerChange={() => {}}
          hideLabelLetters={false}
          isExplanationMode={true}
          answerComparison={answerComparison}
        />
        {renderDoneLine(question, userAnswer)}
      </div>
    );
  };

  // Chuẩn hóa bool -> Đúng/Sai
  const toVietnameseBool = (val: any) => {
    const v = String(val ?? "")
      .trim()
      .toLowerCase();
    if (v === "true" || v === "đúng") return "Đúng";
    if (v === "false" || v === "sai") return "Sai";
    return String(val ?? "");
  };

  // Phát hiện nhãn hiển thị cho True/False theo ngôn ngữ của câu hỏi
  const getTrueFalseLabels = (
    question: any,
  ): { trueLabel: string; falseLabel: string } => {
    const choiceTexts: string[] = Array.isArray(question?.choices)
      ? question.choices
          .map((c: any) =>
            String(
              c?.text || c?.label || c?.rawHtml || c?.value || "",
            ).toLowerCase(),
          )
          .filter((t: string): t is string => Boolean(t))
      : [];

    const hasViChoice =
      choiceTexts.some((t) => t.includes("đúng")) &&
      choiceTexts.some((t) => t.includes("sai"));
    const hasEnChoice =
      choiceTexts.some((t) => t.includes("true")) &&
      choiceTexts.some((t) => t.includes("false"));

    if (hasViChoice) return { trueLabel: "Đúng", falseLabel: "Sai" };
    if (hasEnChoice) return { trueLabel: "True", falseLabel: "False" };

    // Đồng bộ với logic ở các component câu hỏi (dựa trên isVietnamese)
    const vi = isVietnamese(question);
    return vi
      ? { trueLabel: "Đúng", falseLabel: "Sai" }
      : { trueLabel: "True", falseLabel: "False" };
  };

  // Tạo dòng "Đã làm:" dưới mỗi câu hỏi
  const renderDoneLine = (question: any, userAnswer: any) => {
    if (!userAnswer || userAnswer.value == null) return null;

    const qType: string = question?.question_type || question?.type || "";
    const normalizedType = String(qType || "").toUpperCase();
    const isTrueFalseType = normalizedType.includes("TRUE_FALSE");

    const toArray = (val: any): any[] =>
      Array.isArray(val) ? val : val != null ? [val] : [];

    let selections: string[] = [];
    let hasMappedTrueFalse = false;

    const { trueLabel, falseLabel } = getTrueFalseLabels(question);
    const tfToLabel = (x: any) => {
      const v = String(x ?? "")
        .trim()
        .toLowerCase();
      if (v === "a" || v === "true" || v === "đúng") return trueLabel;
      if (v === "b" || v === "false" || v === "sai") return falseLabel;
      return String(x ?? "");
    };

    const looksLikeTrueFalseChoices =
      Array.isArray(question?.choices) &&
      question.choices.length === 2 &&
      question.choices.every((c: any) => {
        const text = String(
          c?.text || c?.label || c?.rawHtml || c?.value || "",
        ).toLowerCase();
        return (
          text.includes("true") ||
          text.includes("false") ||
          text.includes("đúng") ||
          text.includes("sai")
        );
      });

    // Helper để uppercase chữ cái đáp án (a-z -> A-Z)
    const uppercaseAnswerLetter = (val: any): string => {
      const str = String(val).trim();
      // Nếu là một chữ cái đơn lẻ (a-z), uppercase nó
      if (str.length === 1 && /^[a-z]$/i.test(str)) {
        return str.toUpperCase();
      }
      return str;
    };

    if (qType === "TN_MULTI_CHOICE") {
      selections = toArray(userAnswer.value).map((v) =>
        uppercaseAnswerLetter(v),
      );
    } else if (qType === "TN_SINGLE_CHOICE") {
      selections = toArray(userAnswer.value).map((v) =>
        uppercaseAnswerLetter(v),
      );
    } else if (qType === "TRUE_FALSE") {
      selections = toArray(userAnswer.value).map(tfToLabel).filter(Boolean);
      hasMappedTrueFalse = true;
    } else if (qType === "TRUE_FALSE_STATEMENTS" || qType === "TN_TRUE_FALSE") {
      const val = userAnswer.value;
      if (Array.isArray(val)) {
        selections = (val as any[])
          .map((item: any) => {
            if (item && typeof item === "object" && "option" in item) {
              return tfToLabel(item?.option);
            }
            return tfToLabel(item);
          })
          .filter(Boolean);
        hasMappedTrueFalse = true;
      } else if (val && typeof val === "object") {
        selections = Object.keys(val)
          .sort()
          .map((k) => tfToLabel((val as any)[k]))
          .filter(Boolean);
        hasMappedTrueFalse = true;
      }
    } else if (qType === "DRAG_DROP" || qType === "FILL_BLANK") {
      const arr = toArray(userAnswer.value);
      selections = arr
        .map((v, idx) =>
          v !== null && v !== undefined && String(v) !== ""
            ? `(${idx + 1}) ${String(v)}`
            : null,
        )
        .filter(Boolean) as string[];
    } else if (qType === "SHORT_ANSWER") {
      selections = toArray(userAnswer.value)
        .filter((v) => v !== null && v !== undefined && String(v) !== "")
        .map((v) => String(v));
    } else {
      selections = toArray(userAnswer.value).map((v) => String(v));
    }

    // Fallback: nếu đây là câu Đúng/Sai nhưng chưa map, chuẩn hóa theo ngôn ngữ
    const shouldMapTrueFalse =
      isTrueFalseType ||
      looksLikeTrueFalseChoices ||
      selections.some((v) => {
        const val = String(v).toLowerCase();
        return (
          val === "true" || val === "false" || val === "đúng" || val === "sai"
        );
      });

    if (shouldMapTrueFalse && !hasMappedTrueFalse) {
      selections = selections.map(tfToLabel).filter(Boolean);
    }

    if (!selections.length) return null;

    return (
      <div className="mt-4 px-2">
        <div className="text-base text-blue-800">
          <span className="font-bold">Đã làm:</span>
          <span className="ml-2 whitespace-normal break-words font-normal">
            {selections.join(", ")}
          </span>
        </div>
      </div>
    );
  };

  // Helper: align ordering with exam screen (prioritize original insertion order)
  const sortKey = (q: any): number => {
    const orig = Number(q?.__originalIndex);
    if (Number.isFinite(orig)) return orig;
    const n = Number(q?.number);
    return Number.isFinite(n) ? n : 1e9;
  };
  const sortQuestionsAsc = (arr: any[]): any[] =>
    (arr || []).slice().sort((a: any, b: any) => sortKey(a) - sortKey(b));

  const hasUserSelection = (userAnswer: any): boolean => {
    if (!userAnswer) return false;
    const value = userAnswer.value;

    const normalizeEntry = (entry: any): boolean => {
      if (entry == null) return false;
      if (typeof entry === "object") {
        return Object.values(entry).some((v) => {
          if (v == null) return false;
          return String(v).trim() !== "";
        });
      }
      return String(entry).trim() !== "";
    };

    if (Array.isArray(value)) {
      return value.some((entry) => normalizeEntry(entry));
    }

    if (value && typeof value === "object") {
      return Object.values(value).some((entry) => normalizeEntry(entry));
    }

    return value !== null && value !== undefined && String(value).trim() !== "";
  };

  const evaluateAnswerCorrectness = (
    question: any,
    userAnswer: any,
    answerComparison: any,
  ): boolean => {
    if (!userAnswer) return false;

    const normalizeBool = (val: any): string => {
      const v = String(val ?? "")
        .trim()
        .toLowerCase();
      if (v === "đúng" || v === "true") return "true";
      if (v === "sai" || v === "false") return "false";
      return "";
    };

    let isCorrectOverall = !!answerComparison?.isCorrect;
    const qTypeLocal = question?.question_type;

    if (qTypeLocal === "TRUE_FALSE") {
      const ca = question?.correctAnswers;
      let correctLabel = "";
      if (Array.isArray(ca) && ca.length > 0) {
        const first = ca[0] as any;
        correctLabel = normalizeBool(first?.label ?? first?.value ?? first);
      } else if (typeof ca === "string") {
        correctLabel = normalizeBool(ca);
      }
      const uv = userAnswer?.value;
      const userLabel = normalizeBool(
        Array.isArray(uv)
          ? uv[0]
          : ((uv as any)?.label ?? (uv as any)?.value ?? uv),
      );
      return correctLabel !== "" && userLabel === correctLabel;
    }

    if (qTypeLocal === "TRUE_FALSE_STATEMENTS") {
      const choices = Array.isArray(question?.choices) ? question.choices : [];
      const ca = question?.correctAnswers;
      let correctMap: Record<string, string> | null = null;
      if (ca && !Array.isArray(ca) && typeof ca === "object") {
        correctMap = Object.keys(ca).reduce(
          (acc, key) => {
            acc[key] = normalizeBool((ca as any)[key]);
            return acc;
          },
          {} as Record<string, string>,
        );
      } else if (Array.isArray(ca) && choices.length === ca.length) {
        correctMap = {};
        choices.forEach((c: any, idx: number) => {
          const label = c?.label ?? String.fromCharCode(65 + idx);
          const v = (ca as any)[idx];
          correctMap![label] = normalizeBool(v?.value ?? v?.label ?? v);
        });
      }
      const uv = Array.isArray(userAnswer?.value)
        ? userAnswer.value
        : userAnswer?.value != null
          ? [userAnswer.value]
          : [];
      const userArr = uv.map((it: any) =>
        normalizeBool(it?.option ?? it?.questionOption ?? it),
      );

      //  Kiểm tra nghiêm ngặt: số lượng phải bằng nhau và tất cả phải đúng
      if (correctMap) {
        const expectedCount = Object.keys(correctMap).length;
        if (userArr.length !== expectedCount) {
          return false;
        }
        return choices.every((c: any, idx: number) => {
          const label = c?.label ?? String.fromCharCode(65 + idx);
          const corr = correctMap![label];
          const usr = userArr[idx];
          return corr !== "" && usr !== "" && corr === usr;
        });
      }
      if (Array.isArray(ca)) {
        if (userArr.length !== ca.length) {
          return false;
        }
        return (ca as any[]).every((v: any, idx: number) => {
          const corr = normalizeBool(v?.value ?? v?.label ?? v);
          const usr = userArr[idx];
          return corr !== "" && usr !== "" && corr === usr;
        });
      }
      return false;
    }

    if (qTypeLocal === "TN_SINGLE_CHOICE") {
      const normalize = (input: any) => {
        if (input == null) return "";
        let v = String(input).trim();
        v = v.replace(/\s+/g, "");
        v = v.replace(/,/g, ".");
        //  Chuẩn hóa về chữ thường để so sánh (vì userAnswers lưu chữ thường)
        v = v.toLowerCase();
        return v;
      };

      const ca = Array.isArray(question?.correctAnswers)
        ? question.correctAnswers
        : [];
      const correctLabels = ca.map((v: any) =>
        normalize(typeof v === "string" ? v : v?.label || v?.value || v),
      );
      const correctSet = new Set(correctLabels);

      const uv = userAnswer?.value;
      const userVal = normalize(
        Array.isArray(uv) ? uv[0] : (uv?.label ?? uv?.value ?? uv),
      );

      return correctSet.has(userVal) && userVal !== "";
    }

    if (qTypeLocal === "TN_MULTI_CHOICE") {
      const normalize = (input: any) =>
        String(input?.value ?? input?.label ?? input ?? "")
          .trim()
          .replace(/\s+/g, " ")
          .toLowerCase();

      const ca = Array.isArray(question?.correctAnswers)
        ? question.correctAnswers
        : [];
      const correctSet = new Set(ca.map((v: any) => normalize(v)));

      const uv = Array.isArray(userAnswer?.value)
        ? userAnswer.value
        : userAnswer?.value != null
          ? [userAnswer.value]
          : [];
      const userArr = uv.map((v: any) => normalize(v));

      //  Kiểm tra nghiêm ngặt:
      // 1. Số lượng lựa chọn phải bằng nhau
      // 2. Tất cả lựa chọn của user phải có trong đáp án đúng
      // 3. Tất cả đáp án đúng phải có trong lựa chọn của user
      // Nếu có bất kỳ lựa chọn nào sai hoặc thiếu → false
      if (userArr.length !== correctSet.size) {
        return false;
      }

      // Kiểm tra tất cả lựa chọn của user đều đúng
      const anyWrong = userArr.some((v: string) => !correctSet.has(v));
      if (anyWrong) {
        return false;
      }

      // Kiểm tra tất cả đáp án đúng đều được chọn
      const correctArray = Array.from(correctSet) as string[];
      const allCorrectSelected = correctArray.every((v: string) =>
        userArr.includes(v),
      );

      return userArr.length > 0 && allCorrectSelected;
    }

    if (qTypeLocal === "FILL_BLANK") {
      const userValues = Array.isArray(userAnswer?.value)
        ? userAnswer.value
        : userAnswer?.value != null
          ? [userAnswer.value]
          : [];
      const correctValues = question?.correctAnswers || [];

      if (correctValues.length === 1 && userValues.length === 1) {
        return compareFillBlankAnswer(userValues[0], correctValues[0]);
      }

      if (correctValues.length === userValues.length) {
        return userValues.every((userVal: any, index: number) => {
          if (index < correctValues.length) {
            return compareFillBlankAnswer(userVal, correctValues[index]);
          }
          return false;
        });
      }

      const normalizeDecimal = (input: any) => {
        if (input == null) return "";
        let v = String(input)
          .replace(/<[^>]*>/g, " ")
          .replace(/\&nbsp;/g, " ")
          .replace(/\u00A0/g, " ")
          .trim()
          .toLowerCase();
        v = v.replace(/\s+/g, "");
        v = v.replace(/,/g, ".");
        return v;
      };

      const correctAnswerValues = (correctValues as any[]).map(
        (answer: any) => {
          if (typeof answer === "string") return answer;
          return answer.value || answer;
        },
      );

      const numBlanks = userValues.length;
      const groupedAcceptables: Array<Set<string>> = [];
      if (
        Array.isArray(correctAnswerValues) &&
        numBlanks > 0 &&
        correctAnswerValues.length >= numBlanks
      ) {
        if (correctAnswerValues.length % numBlanks === 0) {
          const groupSize = correctAnswerValues.length / numBlanks;
          for (let i = 0; i < numBlanks; i++) {
            const start = i * groupSize;
            const end = start + groupSize;
            groupedAcceptables.push(
              new Set(
                correctAnswerValues
                  .slice(start, end)
                  .map((v: any) => normalizeDecimal(v)),
              ),
            );
          }
        } else {
          const all = new Set(
            correctAnswerValues.map((v: any) => normalizeDecimal(v)),
          );
          for (let i = 0; i < numBlanks; i++) groupedAcceptables.push(all);
        }
      }

      if (groupedAcceptables.length === numBlanks) {
        return (
          userValues.length === numBlanks &&
          userValues.every((userAns: any, idx: number) => {
            const actual = normalizeDecimal(userAns);
            const acceptable = groupedAcceptables[idx];
            return actual !== "" && acceptable.has(actual);
          })
        );
      }

      return (
        userValues.length === correctAnswerValues.length &&
        userValues.every((userAns: any, index: number) => {
          const correctAns = correctAnswerValues[index];
          const userAnsTrimmed = normalizeDecimal(userAns);
          const correctAnsTrimmed = normalizeDecimal(correctAns);
          return userAns && correctAns && userAnsTrimmed === correctAnsTrimmed;
        })
      );
    }

    if (qTypeLocal === "DRAG_DROP") {
      //  Chuẩn hóa để so sánh (normalize whitespace và case)
      const normalize = (v: any): string =>
        String((v && (v.value ?? v.label ?? v.text)) ?? v ?? "")
          .replace(/\&nbsp;/g, " ")
          .trim()
          .toLowerCase()
          .replace(/\s+/g, " ");

      const corrRaw = question?.correctAnswers || [];
      const corrArr: string[] = Array.isArray(corrRaw)
        ? corrRaw.map((c: any) => normalize(c))
        : [];

      const uaVal = userAnswer?.value;
      const userArr: string[] = Array.isArray(uaVal)
        ? uaVal.map((u: any) => normalize(u))
        : uaVal != null
          ? [normalize(uaVal)]
          : [];

      let anyMismatch = false;
      for (let i = 0; i < corrArr.length; i++) {
        const expected = corrArr[i] || "";
        const actual = userArr[i] || "";
        if (!expected || actual !== expected) {
          anyMismatch = true;
          break;
        }
      }
      return corrArr.length > 0 && !anyMismatch;
    }

    return isCorrectOverall;
  };

  const getSidebarQuestionStatus = (question: any) => {
    const lookupId = question?.questionId || question?._id || question?.id;
    const questionId =
      lookupId ??
      String(
        question?.questionNumber ??
          question?.number ??
          question?.__originalIndex ??
          "",
      );

    const userAnswer = lookupId ? getUserAnswer(lookupId) : undefined;
    const fixedQuestion = fixQuestionTypeAtRender(question, userAnswer);
    const answerComparison = compareAnswers(fixedQuestion, userAnswer);
    const isAnswered = hasUserSelection(userAnswer);
    const isCorrect =
      isAnswered && userAnswer
        ? evaluateAnswerCorrectness(fixedQuestion, userAnswer, answerComparison)
        : null;

    const statusClass = !isAnswered
      ? "bg-white text-gray-700 border border-gray-300"
      : isCorrect
        ? "bg-[#2ECC71] text-white border border-[#1B9C54] shadow-sm shadow-green-200"
        : "bg-[#FF6B6B] text-white border border-[#DC2626] shadow-sm shadow-red-200";

    return {
      questionId,
      statusClass,
      isAnswered,
      isCorrect,
    };
  };

  //  RENDER SIDEBAR NAVIGATION - NHÓM THEO MÔN ĐỐI VỚI NHÓM CHỦ ĐỀ, NGƯỢC LẠI THEO SUBPART
  const renderSidebar = () => {
    const questionsPerPart: {
      [partName: string]: any[];
    } = {};

    // Map part name -> type để biết phần nào là NHOM_CHU_DE
    const partTypeByName: Record<string, string> = Array.isArray(
      (examData as any)?.parts,
    )
      ? ((examData as any).parts as any[]).reduce(
          (acc, p: any) => {
            const name = p?.name || "";
            const type = String(p?.type || "");
            if (name) acc[name] = type;
            return acc;
          },
          {} as Record<string, string>,
        )
      : {};

    // Gom câu hỏi theo phần
    allQuestions.forEach((q) => {
      const partName = q.partName || `Phần ${q.partIndex + 1}`;
      if (!questionsPerPart[partName]) questionsPerPart[partName] = [];
      if (q.__isCluster && Array.isArray(q.__clusterQuestions)) {
        questionsPerPart[partName].push(...q.__clusterQuestions);
      } else {
        questionsPerPart[partName].push(q);
      }
    });

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
        {Object.entries(questionsPerPart).map(([partName, questionsInPart]) => (
          <div key={partName} className="mb-6">
            <h3 className="text-xs font-semibold text-blue-600 mb-3 uppercase">
              {partName}
            </h3>
            <div className="space-y-3">
              {(() => {
                const isSubjectGroup =
                  String(partTypeByName[partName] || "").toUpperCase() ===
                  "NHOM_CHU_DE";

                if (isSubjectGroup) {
                  //  Nhóm theo môn học (children)
                  const bySubject = (questionsInPart || []).reduce(
                    (acc: Record<string, any[]>, q: any) => {
                      const key = q.__childName || "Không xác định";
                      if (!acc[key]) acc[key] = [];
                      acc[key].push(q);
                      return acc;
                    },
                    {},
                  );
                  const subjectEntries = Object.entries(bySubject);

                  //  Lọc chỉ hiển thị các môn học đã chọn nếu có selectedSubjects
                  const filteredSubjectEntries =
                    selectedSubjects.length > 0
                      ? subjectEntries.filter(([subjectName]) => {
                          // Kiểm tra xem subjectName có trong danh sách các môn học đã chọn không
                          return selectedSubjects.some(
                            (subject) => subject.name === subjectName,
                          );
                        })
                      : subjectEntries;

                  return filteredSubjectEntries.map(([subjectName, items]) => (
                    <div key={subjectName} className="space-y-2">
                      <div className="text-xs font-medium text-blue-600 mb-2 px-2 py-1">
                        {subjectName}
                      </div>
                      <div className="grid grid-cols-5 gap-1">
                        {items.map((q, index) => {
                          const { questionId, statusClass } =
                            getSidebarQuestionStatus(q);
                          const buttonKey =
                            questionId ||
                            q._id ||
                            q.id ||
                            `${subjectName}-${index}`;
                          const targetId = `question-${
                            questionId ||
                            q._id ||
                            q.id ||
                            q.questionNumber ||
                            q.number ||
                            index
                          }`;
                          return (
                            <button
                              key={buttonKey}
                              className={`h-8 w-8 rounded text-xs font-medium transition-all duration-200 ${statusClass} cursor-pointer hover:scale-110`}
                              title={`Câu ${
                                q.number || q.__originalIndex || index + 1
                              }`}
                              onClick={() => scrollQuestionIntoView(targetId)}
                            >
                              {q.number || q.__originalIndex || ""}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ));
                }

                //  Mặc định: nhóm theo subpart
                const bySubpart = (questionsInPart || []).reduce(
                  (acc: Record<string, any[]>, q: any) => {
                    const key = q.__subpartName || "Không xác định";
                    if (!acc[key]) acc[key] = [];
                    acc[key].push(q);
                    return acc;
                  },
                  {},
                );
                const subpartEntries = Object.entries(bySubpart);
                return subpartEntries.map(([subpartName, questions]) => (
                  <div key={subpartName} className="space-y-2">
                    {(() => {
                      const anyShowHeader = questions.some(
                        (q: any) => q?.__isMain === false,
                      );
                      return anyShowHeader ? (
                        <div className="text-xs font-medium text-blue-600 mb-2 px-2 py-1">
                          {subpartName}
                        </div>
                      ) : null;
                    })()}
                    <div className="grid grid-cols-5 gap-1">
                      {questions.map((q, index) => {
                        const { questionId, statusClass } =
                          getSidebarQuestionStatus(q);
                        const buttonKey =
                          questionId ||
                          q._id ||
                          q.id ||
                          `${subpartName}-${index}`;
                        const targetId = `question-${
                          questionId ||
                          q._id ||
                          q.id ||
                          q.questionNumber ||
                          q.number ||
                          index
                        }`;

                        return (
                          <button
                            key={buttonKey}
                            onClick={() => scrollQuestionIntoView(targetId)}
                            className={`h-8 w-8 rounded text-xs font-medium transition-all duration-200 cursor-pointer hover:scale-110 ${statusClass}`}
                            title={`Câu ${
                              q.questionNumber || q.number || index + 1
                            }`}
                          >
                            {q.questionNumber || q.number || index + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600">Đang tải lời giải chi tiết...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 text-red-500">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={onBack}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      <div className="lg:hidden">
        <DynamicHeader
          rootContext={
            rootContext || {
              cartCount: 0,
              notifications: [],
              user: {},
              isLogin: false,
              totalMessageUnread: 0,
              handleLogout: () => {},
              handleAddCart: () => {},
            }
          }
        />
      </div>
      {/* removed mobile top toolbar per request: keep footer controls only */}

      <div
        className="w-full px-0 flex flex-col lg:!h-screen"
        style={{
          height: isMobile ? "100vh" : "calc(100vh - 64px)",
        }}
      >
        <div
          className={`relative flex w-full flex-col justify-between flex-1 2xl:flex-row`}
        >
          {/* Main content và Sidebar - ẩn khi shouldDelayAnswer là true */}
          {!shouldDelayAnswer && (
            <>
              {/* Main content */}
              <div
                className={`order-2 w-full transition-all duration-300 ${
                  showSidebar
                    ? "2xl:order-1 2xl:w-[calc(100%-256px)]"
                    : "2xl:order-1 2xl:w-full"
                } lg:!h-[calc(100vh-80px)]`}
                style={{
                  height: isMobile
                    ? "calc(100vh - 80px)"
                    : "calc(100vh - 64px - 80px)",
                  minHeight: "400px",
                }}
              >
                <div className="bg-white rounded-none border-0 h-full">
                  <div
                    ref={questionScrollContainerRef}
                    className="h-full overflow-y-auto overflow-x-hidden p-3 pb-9 2xl:pb-5 exam-content-scroll"
                    style={{
                      scrollBehavior: "smooth",
                      maxHeight: "100%",
                      overscrollBehavior: "contain",
                    }}
                  >
                    {/*  QUESTIONS LIST */}
                    <div className="space-y-6">
                      {(() => {
                        // Gom câu hỏi theo phần và subpart
                        const partsGroups: any[] = [];
                        examData.parts?.forEach(
                          (part: any, partIndex: number) => {
                            let inPart = allQuestions.filter(
                              (q) => q.partIndex === partIndex,
                            );

                            //  Lọc theo môn học đã chọn nếu là NHOM_CHU_DE
                            if (
                              part.type === "NHOM_CHU_DE" &&
                              selectedSubjects.length > 0
                            ) {
                              const selectedSubjectNames = selectedSubjects.map(
                                (s) => s.name,
                              );
                              inPart = inPart.filter((q) => {
                                const subjectName = q.__childName;
                                return selectedSubjectNames.includes(
                                  subjectName,
                                );
                              });
                            }

                            if (inPart.length > 0) {
                              partsGroups.push({
                                part,
                                partIndex,
                                questions: inPart,
                              });
                            }
                          },
                        );

                        return partsGroups.map((partData, partIndex) => {
                          const { part, questions } = partData;
                          const partName = part.name || `Phần ${partIndex + 1}`;

                          // Nhóm theo subpart
                          const bySubpart: Record<string, any[]> = {};
                          questions.forEach((q: any) => {
                            const key = q.__subpartName || "Không xác định";
                            if (!bySubpart[key]) bySubpart[key] = [];
                            bySubpart[key].push(q);
                          });

                          const subpartEntries = Object.entries(bySubpart);

                          return (
                            <div key={`part-${partIndex}`} className="mb-8">
                              <div className="w-full py-4 px-3">
                                <h2 className="text-center text-lg font-bold text-blue-600 uppercase tracking-wide mb-3">
                                  {partName}
                                </h2>
                                <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
                              </div>

                              {subpartEntries.map(([subName, items], idx) => (
                                <div key={`${partIndex}-${subName}-${idx}`}>
                                  {(() => {
                                    const showHeader =
                                      subName &&
                                      subName !== "Không xác định" &&
                                      items.some(
                                        (q: any) => q?.__isMain === false,
                                      );
                                    return showHeader ? (
                                      <div className="w-full mb-6">
                                        <div className="w-full py-3 px-3">
                                          <h3 className="text-center text-base font-semibold text-blue-600 mb-2">
                                            {subName}
                                          </h3>
                                          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
                                        </div>
                                      </div>
                                    ) : null;
                                  })()}

                                  {(() => {
                                    const rendered = new Set<string>();
                                    const rows: JSX.Element[] = [];
                                    const idOf = (x: any) => x?._id || x?.id;

                                    // Build quick index for children by parentId inside the same part
                                    //  KHÔNG sắp xếp theo number, giữ nguyên thứ tự từ database
                                    const itemsSorted = [...items];
                                    const byParent: Record<string, any[]> = {};
                                    itemsSorted.forEach((node: any) => {
                                      const pid = node?.parentId;
                                      if (pid != null) {
                                        if (!byParent[pid]) byParent[pid] = [];
                                        byParent[pid].push(node);
                                      }
                                    });

                                    // Helper function to check if there are more questions to render after current question
                                    const hasMoreQuestionsToRender = (
                                      currentIndex: number,
                                    ): boolean => {
                                      for (
                                        let i = currentIndex + 1;
                                        i < itemsSorted.length;
                                        i++
                                      ) {
                                        const nextQ = itemsSorted[i];
                                        const nextQid = idOf(nextQ);
                                        if (!nextQid) continue;

                                        const isNextClusterMain =
                                          String(
                                            nextQ?.type || "",
                                          ).toLowerCase() === "cluster" &&
                                          (nextQ?.parentId == null ||
                                            nextQ?.parentId === undefined ||
                                            Number(nextQ?.number || 0) === 0);

                                        if (isNextClusterMain) return true;
                                        if (nextQ?.parentId == null)
                                          return true;
                                      }
                                      return false;
                                    };

                                    itemsSorted.forEach(
                                      (q: any, index: number) => {
                                        const qid = idOf(q);
                                        if (!qid || rendered.has(qid)) return;

                                        const isClusterMain =
                                          String(
                                            q?.type || "",
                                          ).toLowerCase() === "cluster" &&
                                          (q?.parentId == null ||
                                            q?.parentId === undefined ||
                                            Number(q?.number || 0) === 0);

                                        if (isClusterMain) {
                                          const mainId =
                                            q.questionId || q._id || q.id;
                                          //  KHÔNG sắp xếp theo number, giữ nguyên thứ tự từ database
                                          let subs = [
                                            ...(byParent[mainId] || []),
                                          ];
                                          // Fallback: nếu danh sách items không chứa câu con, dùng __clusterQuestions đã chuẩn hóa
                                          if (
                                            subs.length === 0 &&
                                            Array.isArray(
                                              (q as any).__clusterQuestions,
                                            )
                                          ) {
                                            subs = [
                                              ...((q as any)
                                                .__clusterQuestions || []),
                                            ];
                                          }

                                          const main = {
                                            ...q,
                                            number: 0,
                                            questionNumber: undefined,
                                          };

                                          const answerComparisonMap: Record<
                                            string,
                                            any
                                          > = {};
                                          subs.forEach((subQ: any) => {
                                            const ua = getUserAnswer(
                                              subQ._id || subQ.questionId,
                                            );
                                            const fixedSub =
                                              fixQuestionTypeAtRender(subQ, ua);
                                            answerComparisonMap[subQ._id] =
                                              compareAnswers(fixedSub, ua);
                                          });

                                          const clusterResponses: any = {};
                                          [main, ...subs].forEach(
                                            (node: any) => {
                                              const ua = getUserAnswer(
                                                node._id || node.questionId,
                                              );
                                              if (ua)
                                                clusterResponses[node._id] = {
                                                  answer: ua.value,
                                                };
                                            },
                                          );

                                          // Check if this is the last question in the group
                                          const isLastQuestion =
                                            !hasMoreQuestionsToRender(index);

                                          rows.push(
                                            <div
                                              key={qid}
                                              id={`question-${qid}`}
                                              className={`relative ${
                                                isLastQuestion
                                                  ? "mb-0 2xl:mb-6"
                                                  : ""
                                              }`}
                                            >
                                              <ClusterQuestion
                                                responses={clusterResponses}
                                                questions={[main, ...subs]}
                                                isTimeEnd={true}
                                                handleAnswerChange={() => {}}
                                                flaggedQuestions={
                                                  new Set<string>()
                                                }
                                                onToggleFlag={undefined}
                                                hideLabelLetters={false}
                                                isExplanationMode={true}
                                                answerComparisonMap={
                                                  answerComparisonMap
                                                }
                                                onOpenExplanation={(q) =>
                                                  toggleExplanation(q)
                                                }
                                                expandedExplanationIds={
                                                  expandedExplanations
                                                }
                                                getExplanationKey={
                                                  getQuestionKey
                                                }
                                                renderExplanationSection={
                                                  renderExplanationSection
                                                }
                                              />
                                            </div>,
                                          );

                                          rendered.add(qid);
                                          subs.forEach((s: any) =>
                                            rendered.add(idOf(s)),
                                          );
                                          return;
                                        }

                                        // Skip cluster sub-questions (rendered with their main)
                                        if (q?.parentId != null) {
                                          rendered.add(qid);
                                          return;
                                        }

                                        // Single question
                                        rendered.add(qid);

                                        // Check if this is the last question in the group
                                        const isLastQuestion =
                                          !hasMoreQuestionsToRender(index);

                                        rows.push(
                                          <div
                                            key={qid}
                                            className={`bg-white rounded-lg border border-gray-200 p-6 shadow-sm mb-6 ${
                                              isLastQuestion
                                                ? "!mb-0 2xl:!mb-6"
                                                : ""
                                            }`}
                                            id={`question-${qid}`}
                                          >
                                            {renderQuestionWithOriginalComponent(
                                              q,
                                            )}
                                            <div className="mt-4 text-right">
                                              <button
                                                onClick={() =>
                                                  toggleExplanation(q)
                                                }
                                                className="text-blue-600 text-sm hover:underline flex items-center gap-2 ml-auto bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
                                              >
                                                {expandedExplanations.has(
                                                  getQuestionKey(q),
                                                )
                                                  ? "Thu gọn"
                                                  : "Xem lời giải"}
                                                <img
                                                  src="/icon/icon-teacher.svg"
                                                  alt="Teacher"
                                                  className="h-4 w-4 object-contain"
                                                />
                                              </button>
                                            </div>
                                            {expandedExplanations.has(
                                              getQuestionKey(q),
                                            ) && (
                                              <div className="mt-4">
                                                {renderExplanationSection(q)}
                                              </div>
                                            )}
                                          </div>,
                                        );
                                      },
                                    );

                                    return rows;
                                  })()}
                                </div>
                              ))}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              {showSidebar && (
                <>
                  {/* Desktop Sidebar */}
                  <div className="hidden 2xl:block order-1 w-full 2xl:order-2 2xl:w-64 animate-in slide-in-from-right duration-300">
                    <div className="sticky top-[100px] col-span-1 flex w-full flex-col h-[calc(100vh-100px-64px)]">
                      <div className="h-full overflow-y-auto">
                        {renderSidebar()}
                      </div>
                    </div>
                  </div>

                  {/* Mobile Sidebar Overlay */}
                  <div className="2xl:hidden fixed inset-0 z-50 bg-black bg-opacity-50 animate-in fade-in duration-300">
                    <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl animate-in slide-in-from-right duration-300">
                      <div className="flex flex-col h-full">
                        {/* Header with close button */}
                        <div className="mobile-sidebar-header p-4 border-b flex justify-between items-center bg-gradient-to-r from-blue-50 to-blue-100 flex-shrink-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-blue-800">
                              Danh sách câu hỏi
                            </h3>
                          </div>
                          <button
                            onClick={() => setShowSidebar(false)}
                            className="p-2 hover:bg-blue-200 rounded-full transition-colors"
                            title="Đóng menu"
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              className="text-blue-600"
                            >
                              <path
                                d="M18 6L6 18M6 6l12 12"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                            </svg>
                          </button>
                        </div>
                        {/* Content with scroll - THỐNG NHẤT LAYOUT */}
                        <div className="mobile-sidebar-body flex-1 overflow-y-auto">
                          {renderSidebar()}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Bottom bar - raised elevation and z-index so it never gets hidden */}
        <div className="exam-bottom-navigation w-full bg-white border-t border-gray-200 shadow-lg fixed bottom-0 left-0 right-0 z-50 py-1 2xl:py-4 px-4 2xl:px-6">
          <div className="flex items-center justify-between w-full gap-2">
            {/* Back button */}
            <button
              onClick={
                onBack ||
                (() =>
                  typeof window !== "undefined"
                    ? window.history.back()
                    : undefined)
              }
              className="inline-flex items-center gap-2 px-3 py-2 2xl:px-4 text-sm 2xl:text-base rounded-md border border-blue-600 text-blue-600 bg-white hover:bg-blue-50 transition-colors"
            >
              <svg
                className="h-4 w-4 2xl:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="hidden 2xl:inline">Quay lại</span>
            </button>

            {/* Retake Exam button - chỉ hiển thị khi đề đã đóng VÀ is_redo là true VÀ không bị ẩn bởi hideRetakeBtn */}
            {onRetakeExam && canRetakeExam && !hideRetakeBtn && (
              <button
                onClick={onRetakeExam}
                className="inline-flex items-center gap-2 px-3 py-2 2xl:px-4 text-sm 2xl:text-base rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                <svg
                  className="h-4 w-4 2xl:h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span className="hidden 2xl:inline">Thi lại</span>
                <span className="2xl:hidden">Thi lại</span>
              </button>
            )}

            {/* Menu toggle button */}
            <div className="flex items-center ml-auto">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="submit-menu-button p-3 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
                title={
                  showSidebar
                    ? "Ẩn danh sách câu hỏi"
                    : "Hiện danh sách câu hỏi"
                }
              >
                {/* Arrow left icon (when sidebar is hidden) */}
                <svg
                  className={`w-6 h-6 text-blue-600 ${
                    showSidebar
                      ? "opacity-0 scale-0 rotate-180"
                      : "opacity-100 scale-100 rotate-0"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                  />
                </svg>

                {/* Arrow right icon (when sidebar is shown) */}
                <svg
                  className={`w-6 h-6 text-blue-600 ${
                    showSidebar
                      ? "opacity-100 scale-100 rotate-0"
                      : "opacity-0 scale-0 rotate-180"
                  }`}
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
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamExplanationScreen;
