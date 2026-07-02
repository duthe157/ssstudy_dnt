import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
} from "react";
import { useAdminMathHTML, setupAutoRender } from "@/utils/mathProcessor";
import { decodeHtmlEntities } from "@/utils/baseHelper";

interface AnswerDisplayProps {
  choices: Array<{
    label: string;
    text: string;
    value?: string;
  }>;
  selectedAnswers: string[];
  onAnswerSelect: (answer: string) => void;
  isTimeEnd: boolean;
  isMultiChoice?: boolean;
  hideLabelLetters?: boolean;
  isExplanationMode?: boolean;
  isClusterChild?: boolean;
  answerComparison?: {
    isCorrect: boolean;
    correctAnswers: string[];
    userAnswers: string[];
  };
}

const AnswerDisplay: React.FC<AnswerDisplayProps> = ({
  choices,
  selectedAnswers,
  onAnswerSelect,
  isTimeEnd,
  isMultiChoice = false,
  hideLabelLetters = false,
  isExplanationMode = false,
  isClusterChild = false,
  answerComparison,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const textRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [forceVertical, setForceVertical] = useState(false);

  const handleAnswerClick = (answer: string) => {
    if (isTimeEnd || isExplanationMode) return;
    onAnswerSelect(answer);
  };

  const isVerticalLayoutByLength = useMemo(() => {
    return true;
  }, [choices, isClusterChild]);

  const isVerticalLayout =
    isVerticalLayoutByLength || forceVertical || isClusterChild;

  useEffect(() => {
    if (containerRef.current) {
      // DISABLED: setupAutoRender vì đã pre-render trong useAdminMathHTML
      // setupAutoRender(containerRef.current);

      const autoScaleMath = () => {
        const mathElements = containerRef.current?.querySelectorAll(
          ".katex, .katex-display",
        );
        mathElements?.forEach((element: any) => {
          const container = element.closest(
            ".choice-math, .exam-content, .question-content",
          );
          if (container) {
            const containerWidth = container.clientWidth;
            const elementWidth = element.scrollWidth;
            const elementHeight = element.scrollHeight;

            if (elementWidth > containerWidth) {
              const scale = Math.min(1, (containerWidth / elementWidth) * 0.9);
              element.style.transform = `scale(${scale})`;
              element.style.transformOrigin = "left center";

              const scaledHeight = elementHeight * scale;
              const currentHeight = container.offsetHeight;
              const neededHeight = Math.max(currentHeight, scaledHeight + 30);

              container.style.minHeight = `${neededHeight}px`;
              container.style.height = "auto";

              const button = container.closest("button");
              if (button) {
                const buttonHeight = button.offsetHeight;
                const requiredButtonHeight = neededHeight + 40;
                if (buttonHeight < requiredButtonHeight) {
                  button.style.minHeight = `${requiredButtonHeight}px`;
                }
              }
            } else {
              element.style.transform = "scale(1)";
              container.style.minHeight = "auto";
              container.style.height = "auto";

              const button = container.closest("button");
              if (button) {
                button.style.minHeight = "auto";
              }
            }
          }
        });
      };

      setTimeout(autoScaleMath, 100);

      const handleResize = () => {
        setTimeout(autoScaleMath, 50);
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [choices]);

  useLayoutEffect(() => {
    const checkOverflow = () => {
      try {
        const overflow = textRefs.current.some((el) => {
          if (!el) return false;
          const hasOverflow = el.scrollWidth > el.clientWidth + 1;
          const hasLongMath =
            el.innerHTML.includes("katex") &&
            el.scrollWidth > el.clientWidth * 1.5;
          return hasOverflow || hasLongMath;
        });
        setForceVertical(Boolean(overflow));
      } catch {}
    };

    checkOverflow();
    const onResize = () => checkOverflow();
    window.addEventListener("resize", onResize);
    const id = setTimeout(checkOverflow, 100);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(id as any);
    };
  }, [choices]);

  useEffect(() => {
    if (!containerRef.current) return;
    const RZ: any = (window as any).ResizeObserver;
    const ro = RZ
      ? new RZ(() => {
          try {
            const overflow = textRefs.current.some((el) => {
              if (!el) return false;
              return el.scrollWidth > el.clientWidth + 1;
            });
            setForceVertical(Boolean(overflow));
          } catch {}
        })
      : null;
    if (ro) ro.observe(containerRef.current);
    return () => {
      try {
        if (ro && containerRef.current) ro.unobserve(containerRef.current);
        if (ro) ro.disconnect();
      } catch {}
    };
  }, [containerRef]);

  const processedChoices = useMemo(
    () =>
      choices.map((choice, index) => {
        const content = choice.text || choice.value || `Đáp án ${index + 1}`;
        const isHtml = content.includes("<") && content.includes(">");
        const hasMath =
          content.includes("\\[") ||
          content.includes("\\]") ||
          content.includes("\\(") ||
          content.includes("\\)") ||
          content.includes("$");
        if (isHtml || hasMath) {
          const processedContent = content
            .replace(/\\\\?\[/g, "\\(")
            .replace(/\\\\?\]/g, "\\)");
          return {
            ...choice,
            isMath: true,
            html: useAdminMathHTML(processedContent),
          };
        }
        return { ...choice, isMath: false, html: decodeHtmlEntities(content) };
      }),
    [choices],
  );

  return (
    <div
      ref={containerRef}
      className={
        isVerticalLayout
          ? "flex flex-col gap-1 overflow-x-hidden max-w-full"
          : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1 overflow-x-hidden max-w-full"
      }
    >
      {processedChoices.map((choice, index) => {
        const isSelected = selectedAnswers.includes(choice.label);
        const isCorrectAnswer = answerComparison?.correctAnswers.includes(
          choice.label,
        );
        const isUserAnswer = answerComparison?.userAnswers.includes(
          choice.label,
        );

        let badgeColor = "";
        let textColor = "";

        if (isExplanationMode && answerComparison) {
          if (isCorrectAnswer) {
            badgeColor = "bg-green-500 text-white";
            textColor = "text-green-700";
          } else if (isUserAnswer) {
            badgeColor = "bg-red-500 text-white";
            textColor = "text-red-700";
          } else {
            badgeColor = "bg-gray-300 text-gray-600";
            textColor = "text-gray-600";
          }
        } else {
          if (isSelected) {
            badgeColor = "bg-blue-600 text-white";
            textColor = "text-blue-700";
          } else {
            badgeColor = "bg-white text-blue-600 border-2 border-blue-600";
            textColor = "text-gray-800";
          }
        }

        return (
          <button
            key={index}
            onClick={() => handleAnswerClick(choice.label)}
            disabled={isTimeEnd}
            className={`
              transition-all duration-200 w-full max-w-full
              ${isTimeEnd ? "cursor-not-allowed" : "cursor-pointer"}
              ${isTimeEnd && !isExplanationMode ? "opacity-50" : ""}
              bg-white rounded-xl px-4 py-[5px] text-left overflow-visible
              focus:outline-none focus:ring-0 outline-none min-h-fit
              ${isExplanationMode ? "" : "hover:bg-blue-50 hover:shadow-lg"}
            `}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center font-semibold text-sm
                  ${isMultiChoice ? "rounded-lg" : "rounded-full"}
                  ${badgeColor}
                `}
              >
                <span
                  className={hideLabelLetters ? "opacity-0" : "opacity-100"}
                >
                  {choice.label}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div
                  ref={(el) => {
                    textRefs.current[index] = el;
                  }}
                  className={`text-[16px] leading-relaxed break-words max-w-full overflow-visible ${textColor}`}
                >
                  {(() => {
                    if (choice.isMath) {
                      return (
                        <div
                          className="exam-content choice-math max-w-full overflow-visible"
                          style={{
                            lineHeight: "1.2",
                            display: "inline-block",
                            verticalAlign: "middle",
                            maxWidth: "100%",
                            transform: "scale(1)",
                            transformOrigin: "left center",
                            minHeight: "auto",
                          }}
                          dangerouslySetInnerHTML={{
                            __html: choice.html as string,
                          }}
                        />
                      );
                    }
                    return choice.html;
                  })()}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default AnswerDisplay;
