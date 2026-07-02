import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { stripOuterLi } from "@/utils/baseHelper";
import { useAdminMathHTML, setupAutoRender } from "@/utils/mathProcessor";

interface DropDragChoiceProps {
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

// Component hiển thị nội dung câu hỏi - được memoize để tránh re-render khi drag
const QuestionDisplay = React.memo(({ html }: { html: string }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      // DISABLED: setupAutoRender vì đã pre-render trong useAdminMathHTML
      // setupAutoRender(contentRef.current);
    }
  }, [html]);

  return (
    <div
      ref={contentRef}
      className="mb-4 text-base leading-relaxed text-gray-800 exam-content [&_img]:mx-auto [&_img]:block [&_img]:h-auto [&_img]:w-full [&_img]:object-contain [&_img]:rounded-lg [&_img]:shadow-sm"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
});

const DropDragChoice: React.FC<DropDragChoiceProps> = ({
  responses,
  question,
  isTimeEnd,
  handleAnswerChange,
  isExplanationMode = false,
  answerComparison,
}) => {
  const [localAnswers, setLocalAnswers] = useState<(string | null)[]>([]);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggedChoice, setDraggedChoice] = useState<string | null>(null);
  const [draggedFromIndex, setDraggedFromIndex] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Danh sách lựa chọn (random order)
  const [localOptions, setLocalOptions] = useState<string[]>([]);
  const [allowDuplicates, setAllowDuplicates] = useState<boolean>(false);
  const shuffledOptionsRef = useRef<string[]>([]);
  const isInitializingRef = useRef(false);
  const lastAnswersRef = useRef<string>("");
  const lastOptionsRef = useRef<string>("");

  const shuffleArray = (arr: string[]) => {
    const a = [...arr];

    // Fisher-Yates shuffle algorithm
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }

    return a;
  };

  // Helper: loại bỏ thẻ HTML (ví dụ <p>, </p>) khỏi chuỗi
  const stripHtmlTags = (str: string): string =>
    str.replace(/<[^>]*>/g, "").trim();

  // Parse dragDropOptions từ dữ liệu (có thể là string "a, b" hoặc array)
  const parseDragDropOptions = useCallback((): string[] => {
    const fromNested = question?.question?.dragDropOptions;
    const fromRoot = question?.dragDropOptions;
    const raw = fromNested ?? fromRoot ?? [];

    const processItem = (s: any) => {
      if (s == null) return "";
      let str = String(s).replace(/\&nbsp;/g, " ").trim();
      // Nếu là chuỗi math (có delimiter), không nên dùng stripHtmlTags vì có thể làm hỏng LaTeX
      const hasMath = str.includes("$") || str.includes("\\(") || str.includes("\\)");
      if (!hasMath) {
        return stripHtmlTags(str);
      }
      return str;
    };

    if (Array.isArray(raw)) {
      if (raw.length === 1 && typeof raw[0] === "string" && raw[0].includes(",")) {
        return raw[0]
          .split(",")
          .map(processItem)
          .filter(Boolean);
      }
      return raw.map(processItem).filter(Boolean);
    }

    if (typeof raw === "string") {
      return raw
        .split(",")
        .map(processItem)
        .filter(Boolean);
    }

    // Fallback: thử lấy từ correctAnswers nếu có
    const candidates: string[] = [];
    const correct = (question as any)?.correctAnswers;
    if (Array.isArray(correct) && correct.length) {
      correct.forEach((it: any) => {
        const v =
          (typeof it === "string" && it) || it?.value || it?.text || it?.label;
        if (v) candidates.push(processItem(v));
      });
    }

    return Array.from(new Set(candidates));
  }, [question]);

  // Reset shuffled options khi question thay đổi
  useEffect(() => {
    shuffledOptionsRef.current = [];
  }, [question._id]);

  // 🔧 Khởi tạo dữ liệu
  useEffect(() => {
    isInitializingRef.current = true;

    // answers
    const savedAnswers = responses[question._id]?.answer || [];
    const processedAnswers =
      Array.isArray(savedAnswers) && savedAnswers.length > 0
        ? savedAnswers.map((item: any) =>
            item === undefined || item === null || item === "" ? null : item,
          )
        : [];

    // Chỉ cập nhật nếu thực sự khác với giá trị hiện tại
    const currentAnswersString = JSON.stringify(processedAnswers);
    if (currentAnswersString !== lastAnswersRef.current) {
      setLocalAnswers([...processedAnswers]);
      lastAnswersRef.current = currentAnswersString;
    }

    // options (random) - shuffle mỗi lần component mount hoặc question thay đổi
    const parsed = parseDragDropOptions();

    // Luôn shuffle lại khi question thay đổi hoặc khi chưa có options
    if (parsed.length > 0) {
      shuffledOptionsRef.current = shuffleArray(parsed);
      const newOptions = [...shuffledOptionsRef.current];
      const newOptionsString = JSON.stringify(newOptions);
      if (newOptionsString !== lastOptionsRef.current) {
        setLocalOptions(newOptions);
        lastOptionsRef.current = newOptionsString;
      }
    } else {
      const emptyOptions: string[] = [];
      const emptyOptionsString = JSON.stringify(emptyOptions);
      if (emptyOptionsString !== lastOptionsRef.current) {
        setLocalOptions(emptyOptions);
        lastOptionsRef.current = emptyOptionsString;
      }
    }

    setAllowDuplicates(new Set(parsed).size !== parsed.length);

    setIsInitialized(true);
    isInitializingRef.current = false;
  }, [
    question._id,
    responses[question._id]?.answer,
    question?.question?.dragDropOptions,
    question?.dragDropOptions,
  ]);

  // 💾 Lưu ngay khi thay đổi
  useEffect(() => {
    if (isInitialized && !isInitializingRef.current) {
      const currentAnswersString = JSON.stringify(localAnswers);
      if (currentAnswersString !== lastAnswersRef.current) {
        lastAnswersRef.current = currentAnswersString;
        handleAnswerChange(question._id, [...localAnswers], "DRAG_DROP");
      }
    }
  }, [localAnswers, isInitialized, question._id]);

  // Helper: một option đã dùng chưa
  const isOptionUsed = useCallback(
    (option: string, excludeIndex: number | null = null) => {
      return localAnswers.some((answer, index) => {
        return answer === option && index !== excludeIndex;
      });
    },
    [localAnswers],
  );

  const handleDragStart = useCallback(
    (e: React.DragEvent, option: string, fromIndex: number | null = null) => {
      if (isTimeEnd) return;

      // 🚫 Cấm kéo từ ô có đáp án (chỉ kéo từ danh sách lựa chọn)
      if (fromIndex !== null) {
        e.preventDefault();
        return false;
      }

      e.dataTransfer.setData("text/plain", option);
      e.dataTransfer.effectAllowed = "move";
      setDraggedChoice(option);
      setDraggedFromIndex(fromIndex);
    },
    [isTimeEnd],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, targetIndex: number) => {
      if (isTimeEnd) return;

      e.preventDefault();
      setDragOverIndex(null);
      const draggedOption = e.dataTransfer.getData("text/plain");

      // Chỉ cho phép kéo từ danh sách lựa chọn
      if (draggedFromIndex !== null) {
        setDraggedChoice(null);
        setDraggedFromIndex(null);
        return;
      }

      if (!draggedOption) return;

      // Không cho phép trùng
      if (!allowDuplicates && isOptionUsed(draggedOption)) {
        setDraggedChoice(null);
        setDraggedFromIndex(null);
        return;
      }

      setLocalAnswers((prev) => {
        const next = [...prev];
        while (next.length <= targetIndex) next.push(null);
        next[targetIndex] = draggedOption;
        return next;
      });

      setDraggedChoice(null);
      setDraggedFromIndex(null);
    },
    [isTimeEnd, draggedFromIndex, isOptionUsed, allowDuplicates],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      if (draggedFromIndex !== null) {
        e.dataTransfer.dropEffect = "none";
        return;
      }
      e.dataTransfer.dropEffect = "move";
      setDragOverIndex(index);
    },
    [draggedFromIndex],
  );

  const handleDragEnter = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      if (draggedFromIndex === null) setDragOverIndex(index);
    },
    [draggedFromIndex],
  );

  const handleDragLeave = useCallback((e: React.DragEvent, index: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverIndex(null);
    }
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedChoice(null);
    setDragOverIndex(null);
    setDraggedFromIndex(null);
  }, []);

  // Double click để xóa - IMPROVED: Better state management
  const handleDoubleClick = useCallback(
    (index: number) => {
      if (isTimeEnd) return;
      const currentValue = localAnswers[index];
      if (currentValue != null && currentValue !== "") {
        setLocalAnswers((prev) => {
          const next = [...prev];
          next[index] = null;
          return next;
        });
      }
    },
    [isTimeEnd, localAnswers],
  );

  // 🔀 Reshuffle options manually
  const handleReshuffle = useCallback(() => {
    if (isTimeEnd) return;
    const parsed = parseDragDropOptions();
    if (parsed.length > 0) {
      shuffledOptionsRef.current = shuffleArray(parsed);
      setLocalOptions([...shuffledOptionsRef.current]);
    }
  }, [isTimeEnd, parseDragDropOptions]);

  // Parse vị trí các ô trống
  const parseQuestionContent = useCallback(() => {
    let content =
      question?.rawHtml || question?.plainText || question?.question || "";
    if (question?.rawHtml && typeof question.rawHtml !== "string") {
      content = question?.plainText || question?.question || "";
    }

    const inputFields: any[] = [];
    const regex = /_{3,}/g;
    let match: RegExpExecArray | null;
    let matchIndex = 0;

    const textOnly = String(content);
    while ((match = regex.exec(textOnly)) !== null) {
      inputFields.push({
        start: match.index,
        end: match.index + match[0].length,
        placeholder: match[0],
        index: matchIndex,
      });
      matchIndex++;
    }

    return inputFields;
  }, [question?.rawHtml, question?.plainText, question?.question]);

  const inputFields = parseQuestionContent();

  // Unique handler name per question to avoid collisions across questions
  const dropHandlerName = `__ddHandleDrop_${question?._id}`;

  // Tạo HTML có các ô thả ngay tại vị trí ______
  const createHtmlWithSlots = useCallback(
    (raw: string, fields: any[]) => {
      if (!raw || fields.length === 0) return raw;
      let result = raw;
      let currentIndex = 0;

      const pattern = /_{3,}/g;
      result = result.replace(pattern, (m) => {
        const slotIndex = currentIndex;
        currentIndex++;
        const currentValue = (localAnswers[slotIndex] || "").replace(
          /\"/g,
          "&quot;",
        );

        // Xác định màu sắc dựa trên kết quả so sánh
        let placeholder = "";
        if (currentValue) {
          // currentValue có thể là LaTeX, cần đảm bảo được render đúng
          const displayValue = currentValue;

          if (isExplanationMode && answerComparison) {
            const correctAnswer =
              answerComparison.correctAnswers[slotIndex] || "";
            if (currentValue === correctAnswer) {
              // Đáp án đúng - màu xanh lá
              placeholder = `<span class=\"inline-block min-w-[120px] px-2 py-1 rounded-md border-2 border-green-500 bg-green-100 text-green-800 text-sm text-center cursor-pointer hover:bg-green-200 hover:border-green-600 transition-colors\" draggable=\"false\" title=\"\">${displayValue}</span>`;
            } else {
              // Đáp án sai - màu đỏ
              placeholder = `<span class=\"inline-block min-w-[120px] px-2 py-1 rounded-md border-2 border-red-500 bg-red-100 text-red-800 text-sm text-center cursor-pointer hover:bg-red-200 hover:border-red-600 transition-colors\" draggable=\"false\" title=\"\">${displayValue}</span>`;
            }
          } else {
            // Chế độ bình thường
            placeholder = `<span class=\"inline-block min-w-[120px] px-2 py-1 rounded-md border-2 border-green-400 bg-green-50 text-green-700 text-sm text-center cursor-pointer hover:bg-green-100 hover:border-green-500 transition-colors\" draggable=\"false\" title=\"Nhấp đúp để xóa đáp án\">${displayValue}</span>`;
          }
        } else {
          placeholder = `<span class=\"inline-block min-w-[120px] px-2 py-1 rounded-md border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 text-sm text-center\">Thả đáp án vào đây</span>`;
        }

        // Vùng thả bao bọc placeholder
        return `<span 
          ondragover=\"event.preventDefault();\" 
          ondrop=\"window.${dropHandlerName} && window.${dropHandlerName}(${slotIndex}, event)\" 
          ondblclick=\"window.${dropHandlerName}_dblclick && window.${dropHandlerName}_dblclick(${slotIndex})\"
          class=\"align-middle inline-block\"
          data-slot-index=\"${slotIndex}\"
        >${placeholder}</span>`;
      });

      return result;
    },
    [localAnswers, dropHandlerName],
  );

  // Gắn handler global cho vùng thả trong HTML thuần - theo từng question
  useEffect(() => {
    (window as any)[dropHandlerName] = (index: number, ev: DragEvent) => {
      ev.preventDefault();
      if (isTimeEnd) return;
      const option = ev.dataTransfer?.getData("text/plain") || "";
      if (!option) return;
      if (!allowDuplicates && isOptionUsed(option)) return;
      setLocalAnswers((prev) => {
        const next = [...prev];
        while (next.length <= index) next.push(null);
        next[index] = option;
        return next;
      });
    };

    // Handler cho double-click để reset đáp án
    (window as any)[`${dropHandlerName}_dblclick`] = (index: number) => {
      if (isTimeEnd) return;
      setLocalAnswers((prev) => {
        const currentValue = prev[index];
        if (currentValue != null && currentValue !== "") {
          const next = [...prev];
          next[index] = null;
          return next;
        }
        return prev;
      });
    };

    return () => {
      delete (window as any)[dropHandlerName];
      delete (window as any)[`${dropHandlerName}_dblclick`];
    };
  }, [isTimeEnd, isOptionUsed, allowDuplicates, dropHandlerName]);

  // Render nội dung câu hỏi (đã embed slots nếu có)
  const questionHtml = useMemo(() => {
    const baseHtml =
      (typeof question?.rawHtml === "string" && question.rawHtml) ||
      String(question?.plainText || question?.question || "");

    if (inputFields.length > 0) {
      const withSlots = createHtmlWithSlots(
        stripOuterLi(baseHtml),
        inputFields,
      );
      return useAdminMathHTML(withSlots);
    }

    // Không có chỗ trống → hiển thị bình thường
    if (typeof question?.rawHtml === "string" && question.rawHtml.trim()) {
      return useAdminMathHTML(stripOuterLi(question.rawHtml));
    }

    return null;
  }, [
    question?.rawHtml,
    question?.plainText,
    question?.question,
    inputFields,
    createHtmlWithSlots,
  ]);

  // Lựa chọn hiển thị
  const parsedFromRaw = parseDragDropOptions();
  const choices = isExplanationMode
    ? parsedFromRaw // luôn dùng danh sách gốc ở màn lời giải
    : localOptions;

  // Trong màn lời giải: xác định các option đúng để tô màu
  const correctOptionSet: Set<string> = React.useMemo(() => {
    if (!isExplanationMode || !answerComparison) return new Set();
    const list = Array.isArray(answerComparison.correctAnswers)
      ? answerComparison.correctAnswers
      : [];
    return new Set(list.map((v) => String(v).trim()));
  }, [isExplanationMode, answerComparison]);

  // Các option user đã kéo vào ô (để tính phần còn lại ở màn lời giải)
  const usedAnswersSet: Set<string> = React.useMemo(() => {
    const ans = responses[question._id]?.answer || [];
    const arr = Array.isArray(ans) ? ans : [ans];
    return new Set(arr.map((v: any) => String(v ?? "").trim()));
  }, [responses, question._id]);

  // Ở màn lời giải: chỉ render các option còn lại; tô xanh option đúng còn lại
  const displayChoices = React.useMemo(() => {
    if (!isExplanationMode) return choices;
    return choices.filter((opt) => !usedAnswersSet.has(String(opt).trim()));
  }, [isExplanationMode, choices, usedAnswersSet]);

  return (
    <div
      className="w-full rounded-lg border border-gray-200 bg-white p-6"
      ref={containerRef}
    >
      {/* Header câu hỏi */}
      <div className="mb-6">
        {(question as any)?.number && (
          <div className="mb-2 text-[18px] font-bold text-[#2A7BF2]">
            Câu {question.number}
          </div>
        )}

        {/* Hiển thị nội dung câu hỏi với các ô thả nằm ngay vị trí ______ */}
        {questionHtml ? (
          <QuestionDisplay html={questionHtml} />
        ) : (
          <div className="mb-4 text-base leading-relaxed text-gray-800">
            {question?.plainText || question?.question || "Nội dung câu hỏi"}
          </div>
        )}

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

      {/* Các lựa chọn (random order) */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {displayChoices.map((choice: string, index: number) => {
            const isUsed = isOptionUsed(choice);
            const isCorrectChoice = correctOptionSet.has(String(choice).trim());
            const baseClass = isExplanationMode
              ? isCorrectChoice
                ? "border-green-500 bg-green-100 text-green-800"
                : "border-gray-300 bg-gray-50 text-gray-600"
              : isUsed
                ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                : isTimeEnd
                  ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "border-blue-300 bg-blue-50 text-blue-700 hover:border-blue-400 hover:bg-blue-100";

            return (
              <div
                key={`${choice}-${index}`}
                draggable={!isTimeEnd && !isUsed}
                onDragStart={(e) => handleDragStart(e, choice)}
                onDragEnd={handleDragEnd}
                className={`cursor-pointer rounded-lg border-2 px-3 py-2 min-w-[120px] text-center transition-all ${baseClass}`}
                title={choice}
              >
                <div
                  className="text-sm font-medium choice-math"
                  dangerouslySetInnerHTML={{
                    __html: useAdminMathHTML(choice),
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default React.memo(DropDragChoice, (prevProps, nextProps) => {
  return (
    prevProps.question._id === nextProps.question._id &&
    prevProps.isTimeEnd === nextProps.isTimeEnd &&
    JSON.stringify(prevProps.responses[prevProps.question._id]) ===
      JSON.stringify(nextProps.responses[nextProps.question._id])
  );
});
