// ClusterQuestion

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ExamQuestion, QuestionResponse, QuestionType } from "@/types/exam";
import { stripOuterLi } from "@/utils/baseHelper";
import { useAdminMathHTML, setupAutoRender } from "@/utils/mathProcessor";
import Question from "../Question";

interface ClusterQuestionProps {
  responses: QuestionResponse;
  questions: ExamQuestion[];
  isTimeEnd: boolean;
  handleAnswerChange: (
    questionId: string,
    value: any,
    type: QuestionType,
  ) => void;
  flaggedQuestions?: Set<string>;
  onToggleFlag?: (questionId: string) => void;
  hideLabelLetters?: boolean;
  isExplanationMode?: boolean;
  answerComparisonMap?: Record<string, any>;
  onOpenExplanation?: (question: any) => void;
  expandedExplanationIds?: Set<string>;
  getExplanationKey?: (question: any) => string;
  renderExplanationSection?: (question: any) => React.ReactNode;
  isStacked?: boolean;
}

const ClusterQuestion: React.FC<ClusterQuestionProps> = ({
  responses,
  questions,
  isTimeEnd,
  handleAnswerChange,
  flaggedQuestions,
  onToggleFlag,
  hideLabelLetters = false,
  isExplanationMode = false,
  answerComparisonMap,
  onOpenExplanation,
  expandedExplanationIds,
  getExplanationKey,
  renderExplanationSection,
  isStacked = false,
}) => {
  // Mobile-only sticky button + modal state
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mainRef = useRef<HTMLDivElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showStickyButton, setShowStickyButton] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [isContainerInView, setIsContainerInView] = useState(false);
  const mainVisibilityRatioRef = useRef(1);

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

    const onResize = () => {
      if (typeof window === "undefined") return;
      const width = window.innerWidth || 0;

      setIsMobile(width < 1280 || isIpadOrTablet());
    };

    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Tách câu hỏi chính (đề bài) và câu hỏi con
  const { mainQuestion, subQuestions } = useMemo(() => {
    const main = questions.find((q) => q.type === "cluster");

    if (!main) {
      return { mainQuestion: null, subQuestions: [] };
    }

    let subs = questions
      .filter((q) => q.parentId === main.questionId && q._id !== main._id)
      .sort((a, b) => {
        const aNum = a.number || 0;
        const bNum = b.number || 0;

        if (aNum === 0 && bNum === 0) return 0;
        if (aNum === 0) return 1;
        if (bNum === 0) return -1;

        return Number(aNum) - Number(bNum);
      });

    if (subs.length === 0 && questions.length > 1) {
      subs = questions
        .filter((q) => q._id !== main._id)
        .sort((a, b) => {
          const aNum = a.number || 0;
          const bNum = b.number || 0;

          if (aNum === 0 && bNum === 0) return 0;
          if (aNum === 0) return 1;
          if (bNum === 0) return -1;

          return Number(aNum) - Number(bNum);
        });
    }

    return { mainQuestion: main, subQuestions: subs };
  }, [questions]);

  const clusterRangeLabel = useMemo(() => {
    if (!Array.isArray(subQuestions) || subQuestions.length === 0) {
      return "Đề bài";
    }
    const firstNum = subQuestions[0]?.number || 1;
    const lastNum = subQuestions[subQuestions.length - 1]?.number || firstNum;
    return `Đề bài câu ${firstNum}-${lastNum}`;
  }, [subQuestions]);

  const renderMainQuestionContent = () => {
    if (!mainQuestion) {
      return null;
    }
    return <ClusterMainContent question={mainQuestion} />;
  };

  if (!mainQuestion) {
    return (
      <div className="w-full rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="text-red-600">
          Không tìm thấy câu hỏi chính trong chùm câu hỏi
        </p>
        <div className="mt-2 text-sm text-gray-600">
          <p>Debug info:</p>
          <p>Total questions: {questions.length}</p>
          <ul className="list-disc pl-4">
            {questions.map((q, idx) => (
              <li key={idx}>
                ID: {q._id}, Type: {q.type || "N/A"}, Question_Type:{" "}
                {q.question_type || "N/A"}, QuestionId: {q.questionId || "N/A"},
                ParentId: {q.parentId || "N/A"}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // Check if viewport center is inside this cluster
  const isClusterCentered = () => {
    const el = containerRef.current;
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const center = (window.innerHeight || 0) * 0.5;
    return rect.top < center && rect.bottom > center;
  };

  // Observe main prompt/container visibility to toggle sticky button on mobile
  useEffect(() => {
    if (!isMobile) {
      setShowStickyButton(false);
      return;
    }
    const el = mainRef.current;
    const containerEl = containerRef.current;
    if (!el || !containerEl) return;

    const hasChildren = Array.isArray(subQuestions) && subQuestions.length > 0;

    const update = () => {
      const vpH = window.innerHeight || 0;
      const centerY = vpH * 0.5;
      const containerRect = containerEl.getBoundingClientRect();
      const containerVisible =
        containerRect.bottom > 0 && containerRect.top < vpH;

      // Determine if the viewport center is within this cluster AND below the main prompt bottom
      const mainRect = el.getBoundingClientRect();
      const inChildZone = centerY > mainRect.bottom + 4; // 4px tolerance

      // Kiểm tra xem có đang ở trong vùng câu hỏi chùm không
      const isInClusterZone =
        containerRect.top <= centerY && containerRect.bottom >= centerY;

      const shouldShow =
        hasChildren && containerVisible && inChildZone && isInClusterZone;
      setIsContainerInView(containerVisible);
      setShowStickyButton(shouldShow);
    };

    const mainObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        mainVisibilityRatioRef.current = entry.intersectionRatio;
        update();
      },
      { root: null, threshold: [0, 0.2, 0.35, 0.6, 1] },
    );

    const containerObserver = new IntersectionObserver(() => update(), {
      root: null,
      threshold: [0, 0.1, 0.5, 1],
    });

    const onScroll = () => update();
    const onResize = () => update();

    mainObserver.observe(el);
    containerObserver.observe(containerEl);
    window.addEventListener("scroll", onScroll, { passive: true } as any);
    window.addEventListener("resize", onResize);
    update();

    return () => {
      mainObserver.disconnect();
      containerObserver.disconnect();
      window.removeEventListener("scroll", onScroll as any);
      window.removeEventListener("resize", onResize);
    };
  }, [isMobile, subQuestions, mainQuestion]);

  return (
    <div ref={containerRef} className="w-full">
      {/*  Layout responsive: Mobile stack, Tablet/Desktop 2 cột */}
      <div
        className={
          isStacked ? "space-y-6" : "grid grid-cols-1 2xl:grid-cols-2 gap-6"
        }
      >
        {/*  CỘT TRÁI - ĐỀ BÀI (Sticky sát với header, có padding bottom tránh nav) */}
        {!isStacked ? (
          <div className="2xl:sticky 2xl:top-[1px] 2xl:self-start 2xl:pr-2 exam-content-scroll">
            <div
              ref={mainRef}
              className={`rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm 
               ${isExplanationMode ? "2xl:min-h-[70vh]" : "2xl:min-h-[82vh]"} 
               ${
                 isExplanationMode
                   ? "2xl:max-h-[calc(100vh-120px-88px)]"
                   : "2xl:max-h-[calc(100vh-120px-80px)]"
               } 
              2xl:overflow-y-auto scrollbar-hide
              ${isExplanationMode ? "pb-6 2xl:mb-[88px]" : "2xl:mb-[80px]"}`}
            >
              <div className="mb-4">{renderMainQuestionContent()}</div>

              {/* Hình ảnh nếu có */}
              {mainQuestion?.images && mainQuestion.images.length > 0 && (
                <div className="mt-4 space-y-3">
                  {mainQuestion.images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`Hình ${index + 1}`}
                      className="w-full h-auto rounded-lg shadow-sm"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div
            ref={mainRef}
            className="rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm"
          >
            <div className="mb-4">{renderMainQuestionContent()}</div>

            {/* Hình ảnh nếu có */}
            {mainQuestion?.images && mainQuestion.images.length > 0 && (
              <div className="mt-4 space-y-3">
                {mainQuestion.images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Hình ${index + 1}`}
                    className="w-full h-auto rounded-lg shadow-sm"
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/*  CỘT PHẢI - CÂU HỎI CON (Scroll) */}
        <div className="space-y-6">
          {subQuestions.length > 0 ? (
            <>
              {subQuestions.map((subQuestion, index) => {
                const isLastSubQuestion = index === subQuestions.length - 1;
                return (
                  <div
                    key={subQuestion._id}
                    id={`question-${subQuestion._id}`}
                    className={`relative ${
                      isLastSubQuestion && isExplanationMode
                        ? "mb-0 lg:mb-6"
                        : ""
                    }`}
                    data-cluster-child="true"
                    data-cluster-main-id={mainQuestion?._id}
                    data-cluster-range={`${subQuestions[0]?.number || 1}-${
                      subQuestions[subQuestions.length - 1]?.number ||
                      subQuestions.length
                    }`}
                  >
                    <Question
                      responses={responses}
                      question={subQuestion}
                      isTimeEnd={isTimeEnd}
                      handleAnswerChange={handleAnswerChange}
                      flaggedQuestions={flaggedQuestions}
                      onToggleFlag={onToggleFlag}
                      hideLabelLetters={hideLabelLetters}
                      isExplanationMode={isExplanationMode}
                      answerComparison={answerComparisonMap?.[subQuestion._id]}
                    />
                    {isExplanationMode && onOpenExplanation && (
                      <>
                        <div className="mt-4 text-right">
                          <button
                            onClick={() => onOpenExplanation(subQuestion)}
                            className="text-blue-600 text-sm hover:underline flex items-center gap-2 ml-auto bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
                          >
                            {expandedExplanationIds &&
                            getExplanationKey &&
                            expandedExplanationIds.has(
                              getExplanationKey(subQuestion),
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
                        {expandedExplanationIds &&
                          getExplanationKey &&
                          renderExplanationSection &&
                          expandedExplanationIds.has(
                            getExplanationKey(subQuestion),
                          ) && (
                            <div className="mt-4">
                              {renderExplanationSection(subQuestion)}
                            </div>
                          )}
                      </>
                    )}
                  </div>
                );
              })}
            </>
          ) : (
            <>
              <div className="text-sm text-gray-500">Không có câu hỏi con.</div>
            </>
          )}
        </div>
      </div>

      {/* Mobile sticky button to open cluster prompt modal */}
      {isMobile && showStickyButton && (
        <div className="2xl:hidden fixed top-[56px] left-0 right-0 z-30 px-4">
          <div className="mx-auto max-w-md flex justify-center">
            <button
              onClick={() => setShowPromptModal(true)}
              className="h-10 rounded-full bg-blue-600 text-white shadow-lg px-4 text-xs font-semibold tracking-wide flex items-center justify-center min-w-[160px]"
            >
              {clusterRangeLabel}
            </button>
          </div>
        </div>
      )}

      {/* Modal to show cluster prompt content on mobile */}
      {isMobile && showPromptModal && (
        <div className="2xl:hidden fixed inset-0 z-[200] flex items-start justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowPromptModal(false)}
          />
          <div className="relative w-full h-full flex flex-col p-2 sm:p-3">
            <div className="relative w-full h-full bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 flex flex-col overflow-hidden mt-[60px] mb-[84px]">
              {/* Close button (top-right) */}
              <button
                aria-label="Đóng"
                onClick={() => setShowPromptModal(false)}
                className="absolute top-2 right-2 z-10 h-9 w-9 rounded-full bg-white/90 shadow flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-white text-[24px] leading-none font-bold"
              >
                ×
              </button>

              {/* Header */}
              <div className="px-4 py-3 border-b flex-shrink-0">
                <h3 className="text-sm font-semibold text-blue-700 text-center">
                  {clusterRangeLabel}
                </h3>
              </div>

              {/* Content - scrollable */}
              <div className="flex-1 overflow-y-auto p-4">
                {renderMainQuestionContent()}
                {mainQuestion?.images && mainQuestion.images.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {mainQuestion.images.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`Hình ${index + 1}`}
                        className="w-full h-auto rounded-lg shadow-sm"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t bg-white flex-shrink-0">
                <button
                  onClick={() => setShowPromptModal(false)}
                  className="w-full h-10 rounded-lg bg-blue-600 text-white font-semibold shadow hover:brightness-110"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClusterQuestion;

// Component con: render nội dung đề bài chùm, có anti-flicker + memo hóa
const ClusterMainContent = React.memo(
  ({ question }: { question: any }) => {
    const contentRef = useRef<HTMLDivElement | null>(null);
    const questionKey =
      question?.questionId || question?._id || question?.id || "main";
    const renderedKeyRef = useRef<string | null>(null);

    // Chuẩn hóa HTML hiển thị (giống logic cũ)
    const normalizedHtml = useMemo(() => {
      if (
        question?.rawHtml &&
        typeof question.rawHtml === "string" &&
        question.rawHtml.trim()
      ) {
        return useAdminMathHTML(stripOuterLi(question.rawHtml));
      }
      if (question?.question && typeof question.question === "string") {
        return useAdminMathHTML(question.question);
      }
      return null;
    }, [question]);

    useEffect(() => {
      renderedKeyRef.current = null;
    }, [questionKey]);

    useEffect(() => {
      if (!contentRef.current) return;
      if (renderedKeyRef.current === questionKey) return;
      renderedKeyRef.current = questionKey;

      // setupAutoRender vì đã pre-render trong useAdminMathHTML
      const timer = setTimeout(() => {
        if (contentRef.current) {
          setupAutoRender(contentRef.current);
        }
      }, 50);
      return () => clearTimeout(timer);
    }, [questionKey]);

    if (normalizedHtml) {
      return (
        <div
          ref={contentRef}
          className="text-base leading-relaxed text-gray-800 exam-content [&_img]:mx-auto [&_img]:block [&_img]:h-auto [&_img]:w-full [&_img]:max-w-full [&_img]:object-contain [&_img]:rounded-lg [&_img]:shadow-sm [&_img]:max-w-[250px] sm:[&_img]:max-w-[300px] md:[&_img]:max-w-[350px] [&_li]:list-none [&_ul]:list-none [&_ol]:list-none [&_ul]:pl-0 [&_ol]:pl-0"
          dangerouslySetInnerHTML={{ __html: normalizedHtml }}
        />
      );
    }

    if (question?.plainText && typeof question.plainText === "string") {
      return (
        <div
          ref={contentRef}
          className="text-base leading-relaxed text-gray-800"
          dangerouslySetInnerHTML={{
            __html: useAdminMathHTML(question.plainText),
          }}
        />
      );
    }

    return (
      <div className="text-base leading-relaxed text-gray-800">
        Nội dung câu hỏi
      </div>
    );
  },
  // Chỉ re-render nếu key hoặc nội dung gốc thay đổi
  (prevProps, nextProps) => {
    const prevQ = prevProps.question;
    const nextQ = nextProps.question;
    const prevKey = prevQ?.questionId || prevQ?._id || prevQ?.id || "main";
    const nextKey = nextQ?.questionId || nextQ?._id || nextQ?.id || "main";

    const prevRaw = (
      prevQ?.rawHtml ||
      prevQ?.question ||
      prevQ?.plainText ||
      ""
    ).trim();
    const nextRaw = (
      nextQ?.rawHtml ||
      nextQ?.question ||
      nextQ?.plainText ||
      ""
    ).trim();

    return prevKey === nextKey && prevRaw === nextRaw;
  },
);
