"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/Dialog";
import { questionService } from "@/services/questionService";
import { useAdminMathHTML, setupAutoRender } from "@/utils/mathProcessor";
import { toast } from "react-toastify";
import Question from "@/components/exam/Question";
import ClusterQuestion from "@/components/exam/questions/Cluster";
import { decodeHtmlEntities } from "@/utils/baseHelper";
import { X } from "lucide-react";

//  FUNCTION XỬ LÝ VIDEO URL - ĐỒNG BỘ VỚI ExamExplanationScreen
const processVideoUrl = (url: string): string => {
  if (!url) return "";

  try {
    // 1. XỬ LÝ BUNNY.NET - CHUYỂN TỪ /play/ SANG /embed/
    if (url.includes("iframe.mediadelivery.net")) {
      let embedUrl = url;
      if (url.includes("/play/")) {
        embedUrl = url.replace("/play/", "/embed/");
      }

      if (!embedUrl.includes("autoplay=")) {
        const separator = embedUrl.includes("?") ? "&" : "?";
        embedUrl = `${embedUrl}${separator}autoplay=true&preload=true`;
      }
      return embedUrl;
    }

    // 2. XỬ LÝ YOUTUBE
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

    // 3. XỬ LÝ VIMEO
    const vimeoRegex = /(?:vimeo\.com\/)([0-9]+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch && vimeoMatch[1]) {
      const videoId = vimeoMatch[1];
      return `https://player.vimeo.com/video/${videoId}`;
    }

    return url;
  } catch (error) {
    return url;
  }
};

// Helper để kiểm tra ngôn ngữ (đơn giản, có thể mở rộng)
const isVietnamese = (q: any) => {
  const text = (q?.question || "") + (q?.explanation || "");
  return /[áàảãạăằẳẵặâầẩẫậéèẻẽẹêềểễệíìỉĩịóòỏõọôồổỗộơờởỡợúùủũụưừửữựýỳỷỹỵđ]/.test(
    text.toLowerCase(),
  );
};

// Tạo dòng "Đã làm:" dưới mỗi câu hỏi
const renderDoneLine = (question: any, userAnswer: any) => {
  if (!userAnswer || userAnswer.value == null) return null;

  const qType: string = question?.question_type || question?.type || "";
  const toArray = (val: any): any[] =>
    Array.isArray(val) ? val : val != null ? [val] : [];

  let selections: string[] = [];
  const vi = isVietnamese(question);
  const trueLabel = vi ? "Đúng" : "True";
  const falseLabel = vi ? "Sai" : "False";

  const tfToLabel = (x: any) => {
    const v = String(x ?? "")
      .trim()
      .toLowerCase();
    if (v === "a" || v === "true" || v === "đúng" || v === "đ")
      return trueLabel;
    if (v === "b" || v === "false" || v === "sai" || v === "s")
      return falseLabel;
    return String(x ?? "");
  };

  const uppercaseAnswerLetter = (val: any): string => {
    const str = String(val).trim();
    if (str.length === 1 && /^[a-z]$/i.test(str)) return str.toUpperCase();
    return str;
  };

  if (qType === "TN_MULTI_CHOICE" || qType === "TN_SINGLE_CHOICE") {
    selections = toArray(userAnswer.value).map((v) => uppercaseAnswerLetter(v));
  } else if (qType === "TRUE_FALSE") {
    selections = toArray(userAnswer.value).map(tfToLabel).filter(Boolean);
  } else if (qType === "TRUE_FALSE_STATEMENTS") {
    const val = userAnswer.value;
    if (Array.isArray(val)) {
      selections = val
        .map((item: any) => tfToLabel(item?.option ?? item))
        .filter(Boolean);
    } else if (val && typeof val === "object") {
      selections = Object.keys(val)
        .sort()
        .map((k) => tfToLabel(val[k]))
        .filter(Boolean);
    }
  } else if (qType === "DRAG_DROP" || qType === "FILL_BLANK") {
    selections = toArray(userAnswer.value)
      .map((v, idx) =>
        v != null && String(v) !== "" ? `(${idx + 1}) ${v}` : null,
      )
      .filter(Boolean) as string[];
  } else {
    selections = toArray(userAnswer.value).map((v) => String(v));
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

// Tạo dòng "Đáp án đúng:" dưới mỗi câu hỏi
const renderCorrectLine = (question: any, answerComp: any) => {
  let corrects = answerComp?.correctAnswers || [];

  if (corrects.length === 0 && question?.correctAnswers) {
    const raw = Array.isArray(question.correctAnswers)
      ? question.correctAnswers
      : [question.correctAnswers];

    corrects = raw.map((ca: any) => {
      const v =
        typeof ca === "string" ? ca : ca?.label || ca?.value || String(ca);
      return String(v).toUpperCase();
    });
  }

  const qType: string = question?.question_type || question?.type || "";

  if (qType.includes("TRUE_FALSE")) {
    const vi = isVietnamese(question);
    const trueLabel = vi ? "Đúng" : "True";
    const falseLabel = vi ? "Sai" : "False";

    corrects = corrects.map((c: string) => {
      const v = String(c).toLowerCase();
      if (v === "a" || v === "true" || v === "đúng" || v === "đ")
        return trueLabel;
      if (v === "b" || v === "false" || v === "sai" || v === "s")
        return falseLabel;
      return c;
    });
  }

  if (!corrects.length) return null;

  return (
    <div className="mt-2 px-2">
      <div className="text-base text-blue-800">
        <span className="font-bold">Đáp án đúng:</span>
        <span className="ml-2 whitespace-normal break-words font-normal">
          {corrects.join(", ")}
        </span>
      </div>
    </div>
  );
};

// Component con hiển thị lời giải - ĐỒNG BỘ 100% VỚI ExamExplanationScreen
const ExplanationContent: React.FC<{
  question: any;
  questionNumber?: number | string;
  onToggleExplanation?: () => void;
}> = ({ question, questionNumber, onToggleExplanation }) => {
  const explanation = question?.explanation || "Chưa có lời giải chi tiết.";
  const rawVideoUrl = question?.video || question?.video_url;
  const videoUrl = rawVideoUrl ? processVideoUrl(rawVideoUrl) : null;
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (contentRef.current) {
      // DISABLED: setupAutoRender vì đã pre-render trong useAdminMathHTML
      // setupAutoRender(contentRef.current);
    }
  }, [question?.id, question?._id]);

  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 sm:p-5">
      <div className="flex items-center gap-2 text-blue-800 font-semibold mb-3">
        <span>
          {typeof questionNumber === "string" &&
          String(questionNumber).startsWith("[ID")
            ? `Lời giải cho ${questionNumber}`
            : `Lời giải ${questionNumber ? `cho câu ${questionNumber}` : ""}`}
        </span>
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
          <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-lg">
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

      <div className="bg-white rounded-lg border border-blue-100 p-4 sm:p-5 shadow-sm">
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
              className="absolute inset-0 w-full h-full border-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              title="Video giải thích"
              referrerPolicy="strict-origin-when-cross-origin"
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

// HÀM mapQuestionType - ĐỒNG BỘ 100% VỚI ExamExplanationScreen
const mapQuestionType = (type: string) => {
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
};

// HÀM PHÁT HIỆN LOẠI CÂU HỎI CẢI TIẾN - ĐỒNG BỘ 100% VỚI ExamExplanationScreen
const getDetectedQuestionType = (q: any) => {
  if (!q) return "TN_SINGLE_CHOICE";

  const apiTypeRaw = q.type || q.question_type || "";

  if (apiTypeRaw) {
    const mapped = mapQuestionType(apiTypeRaw);

    const correctAnswers = q?.correctAnswers;
    const correctIsArray = Array.isArray(correctAnswers);
    const choicesArr = Array.isArray(q?.choices) ? q.choices : [];

    const multiByCorrectLen = correctIsArray && correctAnswers.length > 1;
    const multiByChoiceFlag =
      choicesArr.filter((c: any) => c?.isCorrect === true).length > 1;
    const multiByCommaSeparated = (() => {
      if (!correctIsArray || correctAnswers.length !== 1) return false;
      const single = correctAnswers[0] as any;
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
      (mapped === "TN_SINGLE_CHOICE" || !mapped) &&
      (multiByCorrectLen || multiByChoiceFlag || multiByCommaSeparated)
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
    Array.isArray(q.dragDropOptions) && q.dragDropOptions.length > 0;
  const hasDragItems = Array.isArray(q.dragItems) && q.dragItems.length > 0;
  if (hasDragDropOptions || hasDragItems) return "DRAG_DROP";

  const hasBlanks = Array.isArray(q.blanks) && q.blanks.length > 0;
  const hasAnswerVariants =
    Array.isArray(q.answerVariants) && q.answerVariants.length > 0;
  const content = q.rawHtml || q.plainText || q.question || "";
  const hasUnderscores = /_{3,}/.test(String(content));
  if (hasBlanks || hasAnswerVariants || hasUnderscores) return "FILL_BLANK";

  const correctAnswersArr = q.correctAnswers;
  const correctIsObject =
    !!correctAnswersArr &&
    !Array.isArray(correctAnswersArr) &&
    typeof correctAnswersArr === "object";
  const hasStatements = Array.isArray(q.statements) && q.statements.length > 0;
  const hasNumQues = Number(q.num_ques || 0) > 1;
  const hasMultipleChoicesWithTF =
    Array.isArray(q.choices) &&
    q.choices.length > 2 &&
    q.choices.some((c: any) =>
      tfSet.has(normalize(c?.text ?? c?.label ?? c?.value ?? c)),
    );

  if (
    correctIsObject ||
    hasStatements ||
    hasNumQues ||
    hasMultipleChoicesWithTF
  ) {
    return "TRUE_FALSE_STATEMENTS";
  }

  const choicesArr = Array.isArray(q.choices) ? q.choices : [];
  const isTwoChoice = choicesArr.length === 2;
  const getText = (c: any) => normalize(c?.text ?? c?.label ?? c?.value ?? c);
  const looksLikeTrueFalse =
    isTwoChoice && choicesArr.every((c: any) => tfSet.has(getText(c)));

  const correctIsArray = Array.isArray(q.correctAnswers);
  const correctLooksTF =
    correctIsArray &&
    q.correctAnswers.length === 1 &&
    tfSet.has(
      normalize(
        q.correctAnswers[0]?.value ??
          q.correctAnswers[0]?.label ??
          q.correctAnswers[0],
      ),
    );

  if (looksLikeTrueFalse || correctLooksTF) return "TRUE_FALSE";

  const multiByCorrectLen = correctIsArray && q.correctAnswers.length > 1;
  const multiByChoiceFlag =
    choicesArr.filter((c: any) => c?.isCorrect === true).length > 1;
  if (multiByCorrectLen || multiByChoiceFlag) return "TN_MULTI_CHOICE";

  const hasShortAnswerSignals =
    !choicesArr.length &&
    !hasBlanks &&
    !hasDragDropOptions &&
    correctIsArray &&
    q.correctAnswers.length > 0;
  if (hasShortAnswerSignals) return "SHORT_ANSWER";

  return "TN_SINGLE_CHOICE";
};

interface QuestionPopupProps {
  questionId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QuestionPopup: React.FC<QuestionPopupProps> = ({
  questionId,
  isOpen,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState<any>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && questionId) {
      loadQuestionDetail();
    } else {
      setQuestion(null);
    }
  }, [isOpen, questionId]);

  // Ẩn các widget nổi (livechat, nút liên hệ, v.v.) khi popup mở
  useEffect(() => {
    if (!isOpen) {
      document.body.classList.remove("question-popup-open");
      return;
    }

    document.body.classList.add("question-popup-open");

    // Tìm và ẩn tất cả các phần tử fixed/absolute có z-index cao (widget bên thứ 3)
    const hiddenElements: HTMLElement[] = [];
    const allElements = document.querySelectorAll("body > *");
    allElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      if (
        htmlEl.tagName === "SCRIPT" ||
        htmlEl.tagName === "STYLE" ||
        htmlEl.tagName === "LINK" ||
        htmlEl.id === "__next" ||
        htmlEl.hasAttribute("data-radix-portal") ||
        htmlEl.classList.contains("Toastify")
      )
        return;

      const style = window.getComputedStyle(htmlEl);
      const position = style.position;
      const zIndex = parseInt(style.zIndex) || 0;

      if ((position === "fixed" || position === "absolute") && zIndex > 100) {
        htmlEl.style.setProperty("display", "none", "important");
        hiddenElements.push(htmlEl);
      }
    });

    return () => {
      document.body.classList.remove("question-popup-open");
      // Khôi phục các phần tử đã ẩn
      hiddenElements.forEach((el) => {
        el.style.removeProperty("display");
      });
    };
  }, [isOpen]);

  const loadQuestionDetail = async () => {
    if (!questionId) return;
    setLoading(true);
    try {
      const res = await questionService.getQuestionDetail(questionId);
      if (res?.code === 200 && res?.data) {
        setQuestion(res.data);
      } else {
        toast.error(res?.message || "Không thể tải chi tiết câu hỏi");
        onClose();
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tải dữ liệu");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const examQuestion = useMemo(() => {
    if (!question) return null;
    const detectedType = getDetectedQuestionType(question);
    return {
      ...question,
      _id: question?._id || question?.id || question?.questionId,
      question_type: detectedType, // Gán trực tiếp để Question.tsx nhận diện đúng
    };
  }, [question]);

  const responses = useMemo(() => {
    if (!examQuestion) return {};
    const res: any = {
      [examQuestion._id]: { answer: [] },
    };
    // Nếu là cluster, chuẩn bị responses cho các câu con
    const children =
      examQuestion.children || examQuestion.__clusterQuestions || [];
    children.forEach((q: any) => {
      res[q._id || q.questionId] = { answer: [] };
    });
    return res;
  }, [examQuestion]);

  const [expandedExplanations, setExpandedExplanations] = useState<Set<string>>(
    new Set(),
  );

  const toggleExplanation = (id: string) => {
    setExpandedExplanations((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clusterData = useMemo(() => {
    if (
      !examQuestion ||
      (examQuestion.type !== "cluster" &&
        examQuestion.question_type !== "CLUSTER_QUESTION")
    )
      return null;

    const rawChildren =
      examQuestion.children ||
      examQuestion.__clusterQuestions ||
      examQuestion.childQuestions ||
      [];

    // Đổ mảng children vào và chuẩn hóa ID cho từng câu con giống như câu mẹ
    const normalizedChildren = rawChildren.map((q: any) => ({
      ...q,
      _id: q?._id || q?.id || q?.questionId,
      number: q?.searchId ? `[ID ${q.searchId}]` : q?.number,
      question_type: q?.question_type || getDetectedQuestionType(q),
    }));

    return [examQuestion, ...normalizedChildren];
  }, [examQuestion]);

  const answerComparisonMap = useMemo(() => {
    if (!examQuestion) return {};

    const compareAnswers = (q: any) => {
      const qType = getDetectedQuestionType(q);
      const isStatementType =
        qType === "TRUE_FALSE_STATEMENTS" || qType === "TN_TRUE_FALSE";

      const ca = q.correctAnswers;
      let correctAnswers: string[] = [];
      let correctStatements: any = null;

      if (Array.isArray(ca)) {
        correctAnswers = ca.map((it: any) => {
          const v = it?.value || it?.label || it?.text || it;
          return String(v).toUpperCase();
        });

        if (isStatementType) {
          // Normalize ca to use labels/keys and boolean-like strings
          correctStatements = {};
          ca.forEach((item: any, idx: number) => {
            const key =
              item?.label ||
              item?.questionOption ||
              String.fromCharCode(65 + idx);
            const valRaw = String(
              item?.value || item?.option || item,
            ).toLowerCase();
            let normVal = valRaw;
            if (valRaw === "đúng" || valRaw === "đ" || valRaw === "true")
              normVal = "true";
            if (valRaw === "sai" || valRaw === "s" || valRaw === "false")
              normVal = "false";
            correctStatements[key] = normVal;
          });
        }
      } else if (ca && typeof ca === "object") {
        // Handle object-based correctAnswers (common for statements)
        correctStatements = {};
        correctAnswers = [];
        Object.keys(ca)
          .sort()
          .forEach((key) => {
            const valRaw = String(ca[key]).toLowerCase();
            let normVal = valRaw;
            if (valRaw === "đúng" || valRaw === "đ" || valRaw === "true")
              normVal = "true";
            if (valRaw === "sai" || valRaw === "s" || valRaw === "false")
              normVal = "false";
            correctStatements[key] = normVal;
            correctAnswers.push(
              normVal === "true"
                ? "Đ"
                : normVal === "false"
                  ? "S"
                  : normVal.toUpperCase(),
            );
          });
      } else if (q.answer && Array.isArray(q.answer)) {
        correctAnswers = q.answer
          .map((c: any, idx: number) =>
            c.status === 1 || c.status === true
              ? String.fromCharCode(65 + idx)
              : null,
          )
          .filter(Boolean);
      }

      return {
        isCorrect: true, // For popup we assume we want to show it as "correct" context (greenish if matched)
        correctAnswers,
        userAnswers: [],
        correctStatements,
      };
    };

    if (clusterData) {
      const map: Record<string, any> = {};
      clusterData.forEach((q) => {
        const qId = q._id || q.questionId;
        map[qId] = compareAnswers(q);
      });
      return map;
    }

    return {
      [examQuestion._id]: compareAnswers(examQuestion),
    };
  }, [examQuestion, clusterData]);

  // Trigger KaTeX render sau khi load xong DOM (giống ExamExplanationScreen)
  useEffect(() => {
    if (question && !loading) {
      // DISABLED: setupAutoRender vì đã pre-render trong useAdminMathHTML
      // const timer = setTimeout(() => {
      //   if (contentRef.current) {
      //     setupAutoRender(contentRef.current);
      //   }
      // }, 300);
      // return () => clearTimeout(timer);
    }
  }, [question, loading, isOpen]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        showCloseButton={false}
        className="w-[calc(100%-24px)] sm:max-w-4xl p-0 overflow-hidden bg-white rounded-2xl border-none shadow-2xl h-[92vh] flex flex-col sm:max-h-[850px] outline-none"
      >
        <DialogTitle className="sr-only">Chi tiết câu hỏi</DialogTitle>
        {/* Header with Close */}
        <div className="relative flex items-center justify-between p-4 border-b">
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap">
              [ID{" "}
              {question?.searchId ||
                question?.code ||
                question?.questionId ||
                questionId?.slice(-6)}
              ]
            </span>
          </div>

          <div className="flex-1 flex justify-end">
            <button
              onClick={onClose}
              className="question-popup-close-btn group relative w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 ease-out hover:bg-blue-50 hover:scale-110 hover:rotate-90 hover:shadow-md active:scale-95"
              aria-label="Đóng"
            >
              <X
                size={20}
                className="text-gray-400 transition-all duration-300 ease-out group-hover:text-blue-600 group-hover:stroke-[2.5]"
              />
              {/* Animated ring effect on hover */}
              <span className="absolute inset-0 rounded-full border-2 border-transparent transition-all duration-300 group-hover:border-blue-200 group-hover:animate-ping opacity-0 group-hover:opacity-30 pointer-events-none" />
            </button>
          </div>
        </div>

        <div
          className="flex-1 overflow-y-auto skip-math bg-gray-50/30"
          ref={contentRef}
        >
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 font-medium text-sm">
                Đang tải câu hỏi...
              </p>
            </div>
          ) : (
            <div className="p-4 sm:p-6 space-y-6">
              {examQuestion && (
                <>
                  {clusterData ? (
                    <ClusterQuestion
                      responses={responses}
                      questions={clusterData}
                      isStacked={true}
                      isTimeEnd={true}
                      handleAnswerChange={() => {}}
                      isExplanationMode={true}
                      answerComparisonMap={answerComparisonMap}
                      onOpenExplanation={(q: any) =>
                        toggleExplanation(q._id || q.questionId)
                      }
                      expandedExplanationIds={expandedExplanations}
                      getExplanationKey={(q: any) => q._id || q.questionId}
                      renderExplanationSection={(q: any) => {
                        const qId = q._id || q.questionId;
                        return (
                          <div className="space-y-4">
                            {renderDoneLine(q, responses[qId])}
                            {renderCorrectLine(q, answerComparisonMap[qId])}
                            <ExplanationContent
                              question={q}
                              questionNumber={q.number}
                            />
                          </div>
                        );
                      }}
                    />
                  ) : (
                    <div className="space-y-6">
                      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 p-2">
                        <Question
                          responses={responses}
                          question={examQuestion}
                          questionType={
                            getDetectedQuestionType(examQuestion) as any
                          }
                          isTimeEnd={true}
                          handleAnswerChange={() => {}}
                          isExplanationMode={true}
                          answerComparison={
                            answerComparisonMap[examQuestion._id]
                          }
                        />
                        {renderDoneLine(
                          examQuestion,
                          responses[examQuestion._id],
                        )}
                        {renderCorrectLine(
                          examQuestion,
                          answerComparisonMap[examQuestion._id],
                        )}
                      </div>

                      <ExplanationContent
                        question={examQuestion}
                        questionNumber={examQuestion.number || 0}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="p-6 bg-white">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-md border border-blue-600 text-blue-600 font-bold hover:bg-blue-600 hover:text-white transition-all text-sm"
          >
            Đóng
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
