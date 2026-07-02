import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { toast } from "react-toastify";
import { stripOuterLi } from "@/utils/baseHelper";
import { useAdminMathHTML, setupAutoRender } from "@/utils/mathProcessor";

interface FillBlankProps {
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

// Component hiển thị nội dung câu hỏi - được memoize để tránh re-render khi gõ
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
      className="exam-content mb-2 text-base leading-relaxed text-gray-800 [&_img]:mx-auto [&_img]:block [&_img]:h-auto"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
});

const FillBlank: React.FC<FillBlankProps> = ({
  responses,
  question,
  isTimeEnd,
  handleAnswerChange,
  isExplanationMode = false,
  answerComparison,
}) => {
  const [localAnswers, setLocalAnswers] = useState<string[]>([]);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const forceUpdateRef = useRef(0);

  // Parse question content to extract input fields
  const parseQuestionContent = useCallback(() => {
    // Ưu tiên rawHtml, sau đó plainText, cuối cùng là question
    let content = "";
    let rawContent = "";

    if (question?.rawHtml && question.rawHtml.trim()) {
      rawContent = question.rawHtml;
      // Loại bỏ HTML tags để tìm pattern
      content = question.rawHtml.replace(/<[^>]*>/g, " ");
    } else {
      content = String(question?.plainText || question?.question || "");
      rawContent = content;
    }

    const inputFields: any[] = [];

    // Hỗ trợ nhiều pattern cho chỗ trống:
    // 1. [___], [__], [____] - pattern cũ
    // 2. (___), (__), (____) - pattern với dấu ngoặc đơn
    // 3. {___}, {__}, {____} - pattern với dấu ngoặc nhọn
    // 4. ___ (chỉ gạch dưới) - pattern đơn giản
    // 5. __________ (nhiều gạch dưới liên tiếp) - pattern cho chỗ trống dài
    const patterns = [
      /\[_{2,}\]/g, // [___], [__], [____]
      /\(_{2,}\)/g, // (___), (__), (____)
      /\{_{2,}\}/g, // {___}, {__}, {____}
      /_{3,}/g, // __________ (3 gạch dưới trở lên)
      /\b_{2,}\b/g, // ___ (từ riêng biệt)
    ];

    patterns.forEach((regex, patternIndex) => {
      let match: RegExpExecArray | null;
      while ((match = regex.exec(content)) !== null) {
        // Kiểm tra xem vị trí này đã được thêm chưa (tránh trùng lặp)
        const isDuplicate = inputFields.some(
          (field) =>
            field.start === match!.index &&
            field.end === match!.index + match![0].length,
        );

        if (!isDuplicate) {
          inputFields.push({
            start: match!.index,
            end: match!.index + match![0].length,
            placeholder: match![0],
            index: inputFields.length,
            pattern: patternIndex,
            rawContent: rawContent, // Lưu rawContent để sử dụng sau
          });
        }
      }
    });

    // Sắp xếp theo vị trí trong text
    inputFields.sort((a, b) => a.start - b.start);

    return inputFields;
  }, [question?.plainText, question?.question, question?.rawHtml]);

  const inputFields = parseQuestionContent();

  // Khởi tạo localAnswers từ responses
  useEffect(() => {
    const savedAnswers = responses[question._id]?.answer || [];

    if (Array.isArray(savedAnswers)) {
      // Kiểm tra xem có dữ liệu hợp lệ không
      const hasValidData = savedAnswers.some(
        (answer: any) => answer && answer.trim(),
      );

      if (hasValidData) {
        // Đảm bảo mảng có đủ phần tử cho tất cả input fields
        const answers = [...savedAnswers];
        while (answers.length < inputFields.length) {
          answers.push("");
        }
        // Cắt bớt nếu thừa
        if (answers.length > inputFields.length) {
          answers.splice(inputFields.length);
        }
        setLocalAnswers(answers);
      } else {
        // Nếu không có dữ liệu hợp lệ, chỉ khởi tạo mảng rỗng nếu localAnswers cũng rỗng
        const hasLocalData = localAnswers.some(
          (answer) => answer && answer.trim(),
        );
        if (!hasLocalData) {
          setLocalAnswers(new Array(inputFields.length).fill(""));
        } else {
          if (localAnswers.length !== inputFields.length) {
            const adjustedAnswers = [...localAnswers];
            while (adjustedAnswers.length < inputFields.length) {
              adjustedAnswers.push("");
            }
            if (adjustedAnswers.length > inputFields.length) {
              adjustedAnswers.splice(inputFields.length);
            }
            setLocalAnswers(adjustedAnswers);
          }
        }
      }
    } else {
      setLocalAnswers(new Array(inputFields.length).fill(""));
    }
  }, [question._id, responses, inputFields.length]);

  // Đảm bảo localAnswers luôn có đúng kích thước khi inputFields thay đổi
  useEffect(() => {
    if (localAnswers.length !== inputFields.length) {
      const newAnswers = [...localAnswers];
      while (newAnswers.length < inputFields.length) {
        newAnswers.push("");
      }
      if (newAnswers.length > inputFields.length) {
        newAnswers.splice(inputFields.length);
      }
      setLocalAnswers(newAnswers);
    }
  }, [inputFields.length, localAnswers.length]);

  const handleInputChange = useCallback(
    (index: number, value: string) => {
      // Đảm bảo mảng localAnswers có đủ phần tử
      const newAnswers = [...localAnswers];
      while (newAnswers.length <= index) {
        newAnswers.push("");
      }

      newAnswers[index] = value;
      setLocalAnswers(newAnswers);
      forceUpdateRef.current += 1; // Force update để đảm bảo re-render

      // Lưu ngay lập tức khi có thay đổi để đảm bảo có thể chỉnh sửa
      if (value !== undefined && value !== null) {
        // Sử dụng setTimeout để tránh conflict với blur handler
        setTimeout(() => {
          handleAnswerChange(question._id, newAnswers, "FILL_BLANK");
        }, 100);
      }
    },
    [localAnswers, inputFields.length, question._id],
  );

  const handleBlur = useCallback(() => {
    if (isTimeEnd) return;

    // Chỉ cập nhật khi có sự thay đổi thực sự
    const hasChanged =
      JSON.stringify(localAnswers) !==
      JSON.stringify(responses[question._id]?.answer);

    if (hasChanged) {
      handleAnswerChange(question._id, localAnswers, "FILL_BLANK");
    }
  }, [localAnswers, responses[question._id]?.answer, question._id, isTimeEnd]);

  // Setup unique event handlers for embedded inputs
  useEffect(() => {
    // Tạo unique function names cho mỗi câu hỏi
    const uniqueChangeHandler = `handleFillBlankInputChange_${question._id}`;
    const uniqueBlurHandler = `handleFillBlankBlur_${question._id}`;

    // Global handlers for inputs embedded in HTML - unique cho mỗi câu hỏi
    (window as any)[uniqueChangeHandler] = (index: number, value: string) => {
      handleInputChange(index, value);
    };

    // Tạo handler riêng cho từng input để xử lý độc lập
    (window as any)[uniqueBlurHandler] = (inputIndex: number) => {
      if (isTimeEnd) return;

      // Clear timeout cũ nếu có
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Debounce việc lưu để tránh lưu quá nhiều lần
      saveTimeoutRef.current = setTimeout(() => {
        // Lưu giá trị của input cụ thể này
        const currentValue = localAnswers[inputIndex] || "";
        const savedValue = responses[question._id]?.answer?.[inputIndex] || "";

        // Luôn lưu nếu có giá trị hiện tại, bỏ qua việc so sánh để đảm bảo có thể chỉnh sửa
        if (currentValue !== undefined && currentValue !== null) {
          handleAnswerChange(question._id, localAnswers, "FILL_BLANK");
        }
      }, 300); // Debounce 300ms
    };

    return () => {
      // Cleanup unique handlers
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      delete (window as any)[uniqueChangeHandler];
      delete (window as any)[uniqueBlurHandler];
    };
  }, [
    handleInputChange,
    localAnswers,
    responses[question._id]?.answer,
    question._id,
    isTimeEnd,
  ]);

  // Helper function để tạo HTML với input fields embedded
  const createHtmlWithInputs = useCallback(
    (rawHtml: string, inputFields: any[]) => {
      if (!rawHtml || inputFields.length === 0) return rawHtml;

      let result = rawHtml;
      let currentIndex = 0;

      // Tạo unique function names cho câu hỏi này
      const uniqueChangeHandler = `handleFillBlankInputChange_${question._id}`;
      const uniqueBlurHandler = `handleFillBlankBlur_${question._id}`;

      // Tạo regex tổng hợp cho tất cả patterns
      const combinedPattern = /\[_{2,}\]|\(_{2,}\)|\{_{2,}\}|_{3,}|\b_{2,}\b/g;

      result = result.replace(combinedPattern, (match) => {
        if (currentIndex >= inputFields.length) {
          return match; // Trả về pattern gốc nếu vượt quá số lượng fields
        }

        // Sử dụng currentIndex trực tiếp làm index cho input
        const inputIndex = currentIndex;
        const inputWidth = inputFields.length > 2 ? "w-24" : "w-32";

        // Lấy giá trị từ localAnswers hoặc từ responses nếu localAnswers chưa có
        // Ưu tiên localAnswers để tránh bị reset bởi logic bên ngoài
        const localValue = localAnswers[inputIndex] || "";
        const savedValue = responses[question._id]?.answer?.[inputIndex] || "";
        // Ưu tiên localValue nếu có, nếu không thì dùng savedValue
        const currentValue =
          localValue && localValue.trim() ? localValue : savedValue || "";
        const value = String(currentValue).replace(/"/g, "&quot;");

        // Xác định màu sắc dựa trên kết quả so sánh
        let inputClass = `mx-1 inline-block ${inputWidth} rounded-md border px-2 py-1 text-center text-sm focus:ring-2 disabled:cursor-not-allowed`;

        if (isExplanationMode && answerComparison) {
          // Lấy đáp án người dùng từ responses trong màn lời giải
          const rawUser = isExplanationMode
            ? responses[question._id]?.answer?.[inputIndex]
            : localAnswers[inputIndex];
          const rawCorrect = answerComparison?.correctAnswers?.[inputIndex];

          const normalize = (v: any) => {
            const rawValue = (v && (v.value ?? v.label ?? v.text)) ?? v ?? "";
            let s = String(rawValue)
              .replace(/<[^>]*>/g, " ")
              .replace(/\&nbsp;/g, " ")
              .replace(/\u00A0/g, " ")
              .trim()
              .toLowerCase();
            // Đồng bộ dấu phẩy và dấu chấm cho số thập phân
            s = s.replace(/\s+/g, "");
            s = s.replace(/,/g, ".");
            return s;
          };

          const userAnswer = normalize(rawUser);
          const correctAnswer = normalize(rawCorrect);

          //  Logic mới: Kiểm tra nếu có dấu | trong đáp án đúng
          let isMatch = false;
          if (correctAnswer.includes("|")) {
            const acceptedAnswers = correctAnswer
              .split("|")
              .map((answer) => answer.trim())
              .filter(Boolean);
            isMatch = acceptedAnswers.includes(userAnswer);
          } else {
            isMatch = userAnswer === correctAnswer;
          }

          if (isMatch) {
            // Đáp án đúng
            inputClass +=
              " border-green-500 bg-green-50 text-green-700 focus:border-green-500 focus:ring-green-500";
          } else {
            // Đáp án sai
            inputClass +=
              " border-red-500 bg-red-50 text-red-700 focus:border-red-500 focus:ring-red-500";
          }
        } else {
          // Chế độ bình thường
          inputClass +=
            " border-gray-300 text-gray-700 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100";
        }

        const inputHtml = `<input 
          type="text" 
          value="${value}" 
          onchange="window.${uniqueChangeHandler} && window.${uniqueChangeHandler}(${inputIndex}, this.value)"
          onblur="window.${uniqueBlurHandler} && window.${uniqueBlurHandler}(${inputIndex})"
          ${isTimeEnd ? "disabled" : ""}
          class="${inputClass}"
          title="Điền vào chỗ trống thứ ${inputIndex + 1} - Câu ${
            question.number
          }"
          data-index="${inputIndex}"
          data-question-id="${question._id}"
        />`;

        currentIndex++;
        return inputHtml;
      });

      return result;
    },
    [localAnswers, isTimeEnd, responses, question._id, forceUpdateRef.current],
  );

  // Tạo HTML thứ hai: điền đáp án đúng vào các chỗ trống (dùng cho màn lời giải)
  const createHtmlWithCorrectInputs = useCallback(
    (rawHtml: string, inputFields: any[]) => {
      if (!rawHtml || inputFields.length === 0) return rawHtml;
      if (!isExplanationMode || !answerComparison) return "";

      const corrects: any[] = Array.isArray(answerComparison.correctAnswers)
        ? answerComparison.correctAnswers
        : [];
      const normalizeCorrect = (v: any) =>
        String((v && (v.value ?? v.text ?? v.label)) ?? v ?? "").trim();

      let result = rawHtml;
      let currentIndex = 0;

      // Regex giống phần render chính để đảm bảo vị trí khớp
      const combinedPattern = /\[_{2,}\]|\(_{2,}\)|\{_{2,}\}|_{3,}|\b_{2,}\b/g;

      result = result.replace(combinedPattern, () => {
        if (currentIndex >= inputFields.length) return "";
        const inputIndex = currentIndex;
        const value = normalizeCorrect(corrects[inputIndex]).replace(
          /"/g,
          "&quot;",
        );
        const inputClass =
          "mx-1 inline-block w-32 rounded-md border px-2 py-1 text-center text-sm border-green-500 bg-green-50 text-green-700";
        const inputHtml = `<input type="text" value="${value}" disabled class="${inputClass}" title="Đáp án đúng cho chỗ trống ${
          inputIndex + 1
        }" />`;
        currentIndex++;
        return inputHtml;
      });

      return result;
    },
    [isExplanationMode, answerComparison],
  );

  // Bản sao: hiển thị đáp án đúng điền vào các vị trí user làm sai
  const renderFixedAnswersLine = () => {
    if (!isExplanationMode || !answerComparison) return null;
    const rawUser = responses[question._id]?.answer || [];
    const rawCorrect = answerComparison?.correctAnswers || [];
    const toNorm = (v: any) => String(v ?? "").trim();
    const userArray = Array.isArray(rawUser) ? rawUser : [rawUser];
    const corrected = userArray.map((u, idx) => {
      const userV = toNorm(u);
      const corrV = toNorm(rawCorrect[idx]);
      return userV && userV.toLowerCase() !== corrV.toLowerCase() ? corrV : "";
    });
    if (!corrected.some((v) => v)) return null;

    return (
      <div className="mt-3 text-sm">
        <div className="text-gray-600 mb-1">
          Bản sao (điền đáp án đúng ở chỗ sai):
        </div>
        <div className="flex flex-wrap gap-2">
          {corrected.map((val, idx) => (
            <input
              key={idx}
              type="text"
              disabled
              value={val}
              className={`mx-1 inline-block w-32 rounded-md border px-2 py-1 text-center text-sm ${
                val
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-gray-200 bg-gray-100 text-gray-400"
              }`}
              title={`Chỗ trống ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    );
  };

  // Render nội dung câu hỏi với hình ảnh (memo để tránh re-render KaTeX)
  const questionHtml = useMemo(() => {
    if (inputFields.length > 0) {
      const rawContent =
        question?.rawHtml && question.rawHtml.trim()
          ? stripOuterLi(question.rawHtml)
          : String(question?.plainText || question?.question || "");

      const htmlWithInputs = createHtmlWithInputs(rawContent, inputFields);

      return useAdminMathHTML(htmlWithInputs);
    }

    if (question?.rawHtml && question.rawHtml.trim()) {
      return useAdminMathHTML(stripOuterLi(question.rawHtml));
    }

    return null;
  }, [
    inputFields,
    question?.rawHtml,
    question?.plainText,
    question?.question,
    createHtmlWithInputs,
  ]);

  // Nếu không tìm thấy input fields từ pattern, kiểm tra thuộc tính blanks
  const numberOfBlanks = question?.blanks || 1;
  const shouldShowMultipleInputs =
    inputFields.length === 0 && numberOfBlanks > 1;

  // If no input fields found, show simple input hoặc multiple inputs
  if (inputFields.length === 0) {
    if (shouldShowMultipleInputs) {
      // Hiển thị nhiều input fields dựa trên thuộc tính blanks
      return (
        <div className="w-full rounded-lg border border-gray-200 bg-white p-6">
          {/* Header câu hỏi */}
          <div className="mb-6">
            {(question as any)?.number && (
              <div className="mb-2 text-[18px] font-bold text-[#2A7BF2]">
                Câu {question.number}
              </div>
            )}

            {/* Question content with image */}
            {questionHtml ? (
              <QuestionDisplay html={questionHtml} />
            ) : (
              <div className="mb-4 text-base leading-relaxed text-gray-800">
                {String(question?.plainText || question?.question || "")}
              </div>
            )}
            {/* Ẩn bản sao đáp án đúng trong chế độ lời giải theo yêu cầu */}
            {isExplanationMode ? null : renderFixedAnswersLine()}
          </div>

          {/* Multiple input fields */}
          <div className="space-y-3">
            {Array.from({ length: numberOfBlanks }, (_, index) => (
              <div key={index} className="flex items-center space-x-3">
                <span className="w-20 text-sm font-medium text-gray-600">
                  Chỗ trống {index + 1}:
                </span>
                <input
                  type="text"
                  value={
                    (localAnswers[index] && localAnswers[index].trim()) ||
                    (responses[question._id]?.answer?.[index] &&
                      responses[question._id]?.answer?.[index].trim()) ||
                    ""
                  }
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onBlur={handleBlur}
                  placeholder={`Nhập đáp án cho chỗ trống ${index + 1}...`}
                  disabled={isTimeEnd}
                  className={`flex-1 rounded-md border px-3 py-2 focus:ring-2 disabled:cursor-not-allowed ${
                    isExplanationMode && answerComparison
                      ? (() => {
                          // Lấy đáp án người dùng từ responses trong màn lời giải
                          const rawUser = isExplanationMode
                            ? responses[question._id]?.answer?.[index]
                            : localAnswers[index];
                          const rawCorrect =
                            answerComparison?.correctAnswers?.[index];

                          // Normalize để so sánh (trim + lowercase)
                          const normalize = (v: any) =>
                            (v ?? "").toString().trim().toLowerCase();

                          const userAnswer = normalize(rawUser);
                          const correctAnswer = normalize(rawCorrect);
                          const isMatch = userAnswer === correctAnswer;

                          return isMatch
                            ? "border-green-500 bg-green-50 text-green-700 focus:border-green-500 focus:ring-green-500"
                            : "border-red-500 bg-red-50 text-red-700 focus:border-red-500 focus:ring-red-500";
                        })()
                      : "border-gray-300 text-gray-700 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      );
    } else {
      // Hiển thị input đơn giản cho 1 chỗ trống
      return (
        <div className="w-full rounded-lg border border-gray-200 bg-white p-6">
          {/* Header câu hỏi */}
          <div className="mb-6">
            {(question as any)?.number && (
              <div className="mb-2 text-[18px] font-bold text-[#2A7BF2]">
                Câu {question.number}
              </div>
            )}

            {/* Question content with image */}
            {questionHtml ? (
              <QuestionDisplay html={questionHtml} />
            ) : (
              <div className="mb-4 text-base leading-relaxed text-gray-800">
                {String(question?.plainText || question?.question || "")}
              </div>
            )}
            {/* Ẩn bản sao đáp án đúng trong chế độ lời giải theo yêu cầu */}
            {isExplanationMode ? null : renderFixedAnswersLine()}
          </div>

          <div className="flex">
            <input
              type="text"
              value={
                (localAnswers[0] && localAnswers[0].trim()) ||
                (responses[question._id]?.answer?.[0] &&
                  responses[question._id]?.answer?.[0].trim()) ||
                ""
              }
              onChange={(e) => handleInputChange(0, e.target.value)}
              onBlur={handleBlur}
              placeholder="Nhập câu trả lời..."
              disabled={isTimeEnd}
              className={`w-full max-w-md rounded-md border px-3 py-2 focus:ring-2 disabled:cursor-not-allowed ${
                isExplanationMode && answerComparison
                  ? (() => {
                      // Lấy đáp án người dùng từ responses trong màn lời giải
                      const rawUser = isExplanationMode
                        ? responses[question._id]?.answer?.[0]
                        : localAnswers[0];
                      const rawCorrect = answerComparison?.correctAnswers?.[0];

                      // Normalize: trim/lowercase + đồng bộ dấu phẩy ↔ chấm
                      const normalize = (v: any) => {
                        let s = (v ?? "").toString();
                        s = s
                          .replace(/<[^>]*>/g, " ")
                          .replace(/\&nbsp;/g, " ")
                          .replace(/\u00A0/g, " ")
                          .trim()
                          .toLowerCase();
                        s = s.replace(/\s+/g, "");
                        s = s.replace(/,/g, ".");
                        return s;
                      };

                      const userAnswer = normalize(rawUser);
                      const correctAnswer = normalize(rawCorrect);
                      const isMatch = userAnswer === correctAnswer;

                      return isMatch
                        ? "border-green-500 bg-green-50 text-green-700 focus:border-green-500 focus:ring-green-500"
                        : "border-red-500 bg-red-50 text-red-700 focus:border-red-500 focus:ring-red-500";
                    })()
                  : "border-gray-300 text-gray-700 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
              }`}
            />
          </div>
        </div>
      );
    }
  }

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white p-6">
      {/* Header câu hỏi */}
      <div className="mb-6">
        {(question as any)?.number && (
          <div className="mb-2 text-[18px] font-bold text-[#2A7BF2]">
            Câu {question.number}
          </div>
        )}

        {/* Question content with embedded inputs and image */}
        {questionHtml ? (
          <QuestionDisplay html={questionHtml} />
        ) : (
          <div
            className="mb-4 text-base leading-relaxed text-gray-800"
            dangerouslySetInnerHTML={{
              __html: useAdminMathHTML(
                String(question?.plainText || question?.question || ""),
              ),
            }}
          />
        )}
      </div>

      {/* Answer variants hint (optional) */}
      {question?.answerVariants && question.answerVariants.length > 0 && (
        <div className="mt-4 rounded-lg bg-blue-50 p-3">
          <p className="text-sm text-blue-700">
            <strong>Gợi ý:</strong> Các đáp án có thể chấp nhận:{" "}
            {question.answerVariants.join(", ")}
          </p>
        </div>
      )}
    </div>
  );
};

export default React.memo(FillBlank, (prevProps, nextProps) => {
  return (
    prevProps.question._id === nextProps.question._id &&
    prevProps.isTimeEnd === nextProps.isTimeEnd &&
    JSON.stringify(prevProps.responses[prevProps.question._id]) ===
      JSON.stringify(nextProps.responses[nextProps.question._id])
  );
});
