// Màn hình làm bài Word

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  WordExamData,
  ExamQuestion,
  UserAnswer,
  QuestionResponse,
  QuestionType,
} from "@/types/exam";
import Question from "./Question";
import ClusterQuestion from "./questions/Cluster";
import ExamSidebar from "./ExamSidebar";
import ExamHeader from "./ExamHeader";
import SubmitConfirmModal from "./SubmitConfirmModal";
import StopConfirmModal from "./StopConfirmModal";
import PartInfoScreen from "./PartInfoScreen";
import CheatWarningModal from "./CheatWarningModal";
import PartTimeEndModal from "./PartTimeEndModal";
import { examService } from "@/services/examService";
import { toast } from "react-toastify";

interface WordExamViewerProps {
  examData: WordExamData | any;
  currentSection?: number;
  examType?: string;
  onExamComplete?: (
    answers: UserAnswer[],
    timeSpent: number,
    subject?: string[]
  ) => void;
}

//  Hàm nhóm câu hỏi cluster
const groupClusterQuestions = (questions: ExamQuestion[]) => {
  const grouped: { type: "single" | "cluster"; questions: ExamQuestion[] }[] =
    [];
  const processed = new Set<string>();

  //  THAY ĐỔI: Duyệt theo thứ tự ban đầu thay vì xử lý cluster trước
  questions.forEach((question, idx) => {
    if (processed.has(question._id)) {
      return;
    }

    // Kiểm tra nếu là câu hỏi cluster (đề bài)
    if (question.type === "cluster") {
      // Tìm tất cả câu hỏi con có parentId trùng với questionId của câu hỏi cluster
      const subQuestions =
        (question as any).__clusterQuestions &&
        Array.isArray((question as any).__clusterQuestions) &&
        (question as any).__clusterQuestions.length > 0
          ? ((question as any).__clusterQuestions as ExamQuestion[])
          : questions.filter(
              (q) =>
                q.parentId === question.questionId && q._id !== question._id
            );

      //  THAY ĐỔI: Không sắp xếp câu hỏi con theo number, giữ nguyên thứ tự trong subpart
      const sortedSubQuestions = [...subQuestions];

      const clusterQuestions = [question, ...sortedSubQuestions];

      // Đánh dấu đã xử lý
      clusterQuestions.forEach((q) => {
        processed.add(q._id);
      });

      grouped.push({
        type: "cluster",
        questions: clusterQuestions,
      });
    } else if (!question.parentId && !processed.has(question._id)) {
      //  Câu hỏi đơn lẻ - chỉ xử lý nếu chưa được processed và không có parentId
      processed.add(question._id);
      grouped.push({
        type: "single",
        questions: [question],
      });
    }
  });

  return grouped;
};

const WordExamViewer: React.FC<WordExamViewerProps> = ({
  examData,
  currentSection: initialSection = 0,
  examType = "HSA",
  onExamComplete,
}) => {
  const router = useRouter();

  const examId = (examData as any)?._id || (examData as any)?.id || "";

  const storageKey = React.useMemo(
    () => (examId ? `wordExamProgress:${examId}` : ""),
    [examId]
  );

  const initializedFromStorageRef = useRef(false);
  const partTimeEndModalShownRef = useRef<number | null>(null); // Track phần nào đã hiển thị modal

  const saveQuestionType = useCallback(
    (questionId: string, questionType: string) => {
      if (!examId || !questionId || !questionType) return;

      try {
        const storageKey = `exam_types_${examId}`;
        const existing = localStorage.getItem(storageKey);
        const typeMap = existing ? JSON.parse(existing) : {};

        // Chỉ lưu nếu chưa có hoặc khác với giá trị hiện tại
        if (typeMap[questionId] !== questionType) {
          typeMap[questionId] = questionType;
          localStorage.setItem(storageKey, JSON.stringify(typeMap));
        }
      } catch (error) {
        console.error("[WordExamViewer]  Error saving question type:", error);
      }
    },
    [examId]
  );

  const navigateToExamOrigin = useCallback(() => {
    if (!examId) {
      router.push("/thi-thu");
      return;
    }
    try {
      const key = `examReturnTo:${examId}`;
      const saved = sessionStorage.getItem(key);
      if (saved && typeof saved === "string") {
        router.push(saved);
        return;
      }
    } catch (error) {
      console.error("[WordExamViewer] Error reading return URL:", error);
    }
    router.push("/thi-thu");
  }, [examId, router]);

  // Trạng thái cốt lõi
  const [userAnswers, setUserAnswers] = useState<QuestionResponse>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(
    new Set()
  );
  const [currentPart, setCurrentPart] = useState(initialSection);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isExamStarted, setIsExamStarted] = useState(true);
  const [isTimeEnd, setIsTimeEnd] = useState(false);
  const [timeEndReason, setTimeEndReason] = useState<
    "duration" | "endDate" | null
  >(null);
  const [timeStart, setTimeStart] = useState<Date | null>(new Date());
  const [completedParts, setCompletedParts] = useState<Set<number>>(new Set());
  const [isSubmittingPart, setIsSubmittingPart] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitType, setSubmitType] = useState<"exam" | "part">("exam");
  const [showSubmitMenu, setShowSubmitMenu] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [partTimeRemaining, setPartTimeRemaining] = useState(0);
  const [showStopModal, setShowStopModal] = useState(false);
  const [showPartInfo, setShowPartInfo] = useState(false);
  const [showPartTimeEndModal, setShowPartTimeEndModal] = useState(false);
  const [partTransitionCountdown, setPartTransitionCountdown] = useState<
    number | null
  >(null);
  const [pendingPart, setPendingPart] = useState<number | null>(null);
  const [examResult, setExamResult] = useState<{
    userAnswers: UserAnswer[];
    timeSpent: number;
  } | null>(null);
  const [apiScoreResult, setApiScoreResult] = useState<any>(null);
  const [liveScore, setLiveScore] = useState<number | null>(null);
  // Cảnh báo gian lận và chặn phím tắt
  const [showCheatWarning, setShowCheatWarning] = useState(false);
  // Modal xác nhận thoát khi click logo
  const [showLogoExitWarning, setShowLogoExitWarning] = useState(false);
  // Timer refs for throttling
  const resizeTimeoutRef = useRef<number | null>(null);

  const [filteredQuestions, setFilteredQuestions] = useState<ExamQuestion[]>(
    []
  );

  // Trạng thái cho cảnh báo thời gian
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [timeWarning10MinShown, setTimeWarning10MinShown] = useState(false);
  const [timeWarning5MinShown, setTimeWarning5MinShown] = useState(false);
  const [timeWarningMessage, setTimeWarningMessage] = useState("");
  const [timeWarningType, setTimeWarningType] = useState<string | null>(null);

  //  Thêm state isFullScreen cho đồng hồ nổi
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(
    null
  );

  //  Theo dõi kích thước màn hình để tính header/timer trên mobile
  const [isMobile, setIsMobile] = useState(false);

  //  State cho việc chọn môn học trong phần thi nhóm chủ đề
  const [selectedSubjectsForGroup, setSelectedSubjectsForGroup] = useState<
    any[]
  >([]);

  // Xác định đây có phải là lần làm lại (retake) hay không dựa trên query param (?mode=retake)
  const searchParams = useSearchParams();
  const isRetakeExam = useMemo(
    () => searchParams.get("mode") === "retake",
    [searchParams]
  );

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
      if (typeof window === "undefined") return;
      const width = window.innerWidth || 0;
      setIsMobile(width < 1536 || isIpadOrTablet());
    };

    updateIsMobile();
    window.addEventListener("resize", updateIsMobile);
    return () => window.removeEventListener("resize", updateIsMobile);
  }, []);

  // Helper: Lấy thời gian đóng đề từ examData (support practice exam)
  const getExamEndDate = useCallback((): Date | null => {
    try {
      const rawPracticeStatus = (examData as any)?.practiceConfig?.status;
      const examTopStatus = (examData as any)?.status;
      const normalized =
        typeof rawPracticeStatus === "string"
          ? rawPracticeStatus.toLowerCase()
          : rawPracticeStatus;
      if (
        examTopStatus === "ended" ||
        normalized === "ended" ||
        normalized === false ||
        normalized === 0 ||
        String(normalized).toLowerCase() === "false"
      ) {
        return null;
      }
      const endRaw =
        (examData as any)?.endDate ||
        (examData as any)?.end_date ||
        (examData as any)?.practiceConfig?.endDate ||
        (examData as any)?.practiceConfig?.end_date;

      if (!endRaw) {
        return null;
      }

      const endDate = new Date(endRaw);
      if (isNaN(endDate.getTime())) return null;

      const now = Date.now();

      // Quy ước:
      // - LẦN ĐẦU hoặc LẦN LÀM LẠI KHI ĐỀ CÒN ĐANG MỞ (now < endDate): vẫn dùng endDate => auto nộp khi hết thời gian mở đề.
      // - LẦN LÀM LẠI SAU KHI ĐỀ ĐÃ ĐÓNG (now >= endDate): bỏ qua endDate, chỉ tính theo thời lượng đề.
      if (isRetakeExam && now >= endDate.getTime()) {
        return null;
      }

      return endDate;
    } catch {
      return null;
    }
  }, [examData, isRetakeExam]);

  // Helper: Tính thời gian còn lại tối thiểu giữa thời gian làm bài và thời gian đóng đề
  const calculateRemainingTime = useCallback(
    (examDurationSeconds: number, examStartTime: Date | null): number => {
      if (!examStartTime) return examDurationSeconds;

      const now = Date.now();
      const startTime = examStartTime.getTime();
      const elapsedSeconds = Math.max(0, Math.floor((now - startTime) / 1000));
      const remainingFromDuration = Math.max(
        0,
        examDurationSeconds - elapsedSeconds
      );

      const endDate = getExamEndDate();

      // Nếu có thời gian đóng đề (chỉ áp dụng cho lần làm đầu), tính thêm giới hạn endDate
      if (endDate) {
        const endTime = endDate.getTime();
        const remainingUntilClose = Math.max(
          0,
          Math.floor((endTime - now) / 1000)
        );
        const minRemaining = Math.min(
          remainingFromDuration,
          remainingUntilClose
        );
        return minRemaining;
      }

      return remainingFromDuration;
    },
    [getExamEndDate, isRetakeExam]
  );

  // Helper: Lấy thời gian làm bài mặc định (phút) từ examData
  const getExamDurationMinutes = useCallback((): number => {
    try {
      const config =
        (examData?.categoryExam as any)?.populate_id?.config?.[0] || {};
      const viewExamPerPart = Boolean(config.viewExamPerPart);
      const viewOneQuestion = Boolean(config.viewOneQuestion);
      const timePerPart = Boolean(config.timePerPart);
      const usePartTimer = viewExamPerPart || viewOneQuestion || timePerPart;

      if (usePartTimer && timePerPart) {
        // Nếu dùng timer theo phần, tính tổng thời gian từ các phần
        const totalPartsTime = Array.isArray(examData.parts)
          ? examData.parts.reduce(
              (sum: number, part: any) => sum + (Number(part?.time) || 0),
              0
            )
          : 0;
        if (totalPartsTime > 0) return totalPartsTime;
      }

      const topTime = Number((examData as any)?.time) || 0;
      if (topTime > 0) return topTime;

      const totalPartsTime = Array.isArray(examData.parts)
        ? examData.parts.reduce(
            (sum: number, part: any) => sum + (Number(part?.time) || 0),
            0
          )
        : 0;
      return totalPartsTime > 0 ? totalPartsTime : 90;
    } catch {
      return Number((examData as any)?.time) || 90;
    }
  }, [examData]);

  // Khôi phục tiến độ từ localStorage nếu có
  useEffect(() => {
    if (!storageKey || initializedFromStorageRef.current) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const saved = JSON.parse(raw || "null");
      if (!saved || saved.examId !== examId) return;

      setUserAnswers(saved.userAnswers || {});
      setFlaggedQuestions(new Set(saved.flaggedQuestions || []));
      setCurrentPart(
        Number.isFinite(saved.currentPart) ? saved.currentPart : initialSection
      );
      setCurrentQuestion(
        Number.isFinite(saved.currentQuestion) ? saved.currentQuestion : 0
      );
      // Luôn vào thẳng bài thi khi vào từ ready
      setIsExamStarted(true);
      setIsTimeEnd(false);
      setCompletedParts(new Set(saved.completedParts || []));
      setShowSidebar(Boolean(saved.showSidebar !== false));

      // Khôi phục thời gian bắt đầu làm bài (nếu có)
      if (saved.timeStart && Number.isFinite(saved.timeStart)) {
        setTimeStart(new Date(saved.timeStart));
      } else {
        // Nếu không có thời gian bắt đầu đã lưu, dùng thời gian hiện tại
        setTimeStart(new Date());
      }

      // Tính lại thời gian còn lại dựa trên thời gian bắt đầu và thời gian đóng đề (nếu có)
      const examDurationMinutes = getExamDurationMinutes();
      const examDurationSeconds = examDurationMinutes * 60;
      const restoredTimeStart =
        saved.timeStart && Number.isFinite(saved.timeStart)
          ? new Date(saved.timeStart)
          : new Date();

      // Tính lại thời gian còn lại với logic mới (xét cả thời gian đóng đề)
      const calculatedRemaining = calculateRemainingTime(
        examDurationSeconds,
        restoredTimeStart
      );

      // Nếu thời gian đã hết (do hết thời gian làm bài hoặc đã đến thời điểm đóng đề), đánh dấu kết thúc
      if (calculatedRemaining <= 1) {
        // Kiểm tra xem có phải do hết thời gian đóng đề không
        const endDate = getExamEndDate();
        if (endDate && Date.now() >= endDate.getTime()) {
          // Hết thời gian đóng đề - luôn nộp bài dù có dùng usePartTimer hay không
          setTimeEndReason("endDate");
          setIsTimeEnd(true);
          setTimeRemaining(0);
        } else {
          // Chỉ tự động nộp bài khi KHÔNG dùng timer theo phần
          // Khi dùng usePartTimer, việc nộp bài sẽ được xử lý bởi timer của phần cuối cùng
          const config =
            (examData?.categoryExam as any)?.populate_id?.config?.[0] || {};
          const viewExamPerPart = Boolean(config.viewExamPerPart);
          const viewOneQuestion = Boolean(config.viewOneQuestion);
          const timePerPart = Boolean(config.timePerPart);
          const usePartTimer =
            viewExamPerPart || viewOneQuestion || timePerPart;

          if (!usePartTimer) {
            setTimeEndReason("duration");
            setIsTimeEnd(true);
          }
          setTimeRemaining(0);
        }
      } else {
        setTimeRemaining(Math.max(0, Math.floor(calculatedRemaining)));
      }

      // Đối với partTimeRemaining, trừ đi thời gian đã trôi qua
      const now = Date.now();
      const updatedAt = Number(saved.updatedAt) || now;
      const elapsed = Math.max(0, Math.floor((now - updatedAt) / 1000));
      if (Number.isFinite(saved.partTimeRemaining)) {
        let restoredPartTime = Math.max(
          0,
          Math.floor(saved.partTimeRemaining) - elapsed
        );

        const endDate = getExamEndDate();
        if (endDate) {
          const secondsUntilClose = Math.max(
            0,
            Math.floor((endDate.getTime() - now) / 1000)
          );
          restoredPartTime = Math.min(restoredPartTime, secondsUntilClose);
        }

        setPartTimeRemaining(restoredPartTime);
      }

      initializedFromStorageRef.current = true;
    } catch {}
  }, [
    storageKey,
    examId,
    initialSection,
    getExamDurationMinutes,
    calculateRemainingTime,
    getExamEndDate,
  ]);

  // Cấu hình
  const examConfig = useMemo(
    () => (examData?.categoryExam as any)?.populate_id?.config?.[0] || {},
    [examData]
  );

  const {
    viewExamPerPart = false,
    timePerPart = false,
    viewOneQuestion = false,
  } = examConfig;
  //  Dùng đồng hồ theo phần nếu bật xem theo phần hoặc theo từng câu
  const usePartTimer = viewExamPerPart || viewOneQuestion || timePerPart;
  // Ẩn chữ cái A/B/C/D trước đáp án nếu e_hidden_answer bật (true/"true"/1)
  const __rawHidden = (examConfig as any)?.e_hidden_answer;
  const hideLabelLetters =
    __rawHidden === true ||
    __rawHidden === 1 ||
    __rawHidden === "1" ||
    String(__rawHidden).toLowerCase() === "true";
  const isSequentialExam = examType === "TSA" || examType === "HSA";

  const getPartTime = useCallback(
    (partIndex: number) => {
      const partData = examData.parts?.[partIndex];
      if (!partData) return 0;

      if (partData.type === "NHOM_CHU_DE") {
        const t = Number(partData.time) || 0;
        return t;
      }

      const partTime = Number(partData.time) || 0;
      return partTime;
    },
    [examData.parts]
  );

  const calculateInitialDurations = useCallback(() => {
    const config =
      (examData?.categoryExam as any)?.populate_id?.config?.[0] || {};
    const partTimerEnabled =
      Boolean(config.viewExamPerPart) ||
      Boolean(config.viewOneQuestion) ||
      Boolean(config.timePerPart);
    const fallbackPartIndex = Number.isFinite(initialSection)
      ? initialSection
      : 0;

    const initialExamMinutes = (() => {
      if (partTimerEnabled) {
        const partMinutes = getPartTime(fallbackPartIndex);
        return partMinutes > 0 ? partMinutes : 30;
      }
      const topLevelTime = Number((examData as any)?.time) || 0;
      if (topLevelTime > 0) return topLevelTime;
      const totalPartsTime = Array.isArray(examData.parts)
        ? examData.parts.reduce(
            (sum: number, part: any) => sum + (Number(part?.time) || 0),
            0
          )
        : 0;
      return totalPartsTime > 0 ? totalPartsTime : 90;
    })();

    const initialPartMinutes = (() => {
      const partMinutes = getPartTime(fallbackPartIndex);
      if (partMinutes > 0) return partMinutes;
      if (
        config.timePerPart &&
        examData.time &&
        Array.isArray(examData.parts) &&
        examData.parts.length > 0
      ) {
        return (
          Math.floor((Number(examData.time) * 60) / examData.parts.length) / 60
        );
      }
      return 30;
    })();

    const endDate = getExamEndDate();
    let secondsUntilClose = Infinity;
    if (endDate) {
      const now = Date.now();
      secondsUntilClose = Math.max(
        0,
        Math.floor((endDate.getTime() - now) / 1000)
      );
    }

    return {
      totalSeconds: Math.min(
        Math.max(1, Math.round(initialExamMinutes * 60)),
        secondsUntilClose
      ),
      partSeconds: Math.min(
        Math.max(1, Math.round(initialPartMinutes * 60)),
        secondsUntilClose
      ),
    };
  }, [examData, getPartTime, initialSection, getExamEndDate]);

  const resetExamState = useCallback(() => {
    setUserAnswers({});
    setFlaggedQuestions(new Set());
    setIsExamStarted(false);
    setIsTimeEnd(false);
    setTimeEndReason(null);
    setCompletedParts(new Set());
    setCurrentQuestion(0);
    setCurrentPart(
      Number.isFinite(initialSection) ? Number(initialSection) : 0
    );
    setShowCheatWarning(false);
    setShowLogoExitWarning(false);
    setSelectedSubjectsForGroup([]);
    setFilteredQuestions([]);
    setExamResult(null);
    setApiScoreResult(null);
    setLiveScore(null);
    setPendingPart(null);
    setShowPartInfo(false);
    setShowStopModal(false);
    setSubmitType("exam");
    setShowSubmitModal(false);
    setShowSubmitMenu(false);
    setCurrentQuestionId(null);
    setIsSubmittingPart(false);
    setTimeStart(new Date());
    setTimeWarning10MinShown(false);
    setTimeWarning5MinShown(false);
    setShowTimeWarning(false);
    setTimeWarningMessage("");
    setTimeWarningType(null);
    const { totalSeconds, partSeconds } = calculateInitialDurations();
    setTimeRemaining(totalSeconds);
    setPartTimeRemaining(partSeconds);
  }, [calculateInitialDurations, initialSection]);

  const handleCheatExit = useCallback(() => {
    resetExamState();

    try {
      if (storageKey) localStorage.removeItem(storageKey);
    } catch {}
    navigateToExamOrigin();
  }, [navigateToExamOrigin, resetExamState, storageKey]);

  const handleLogoClick = useCallback(() => {
    setShowLogoExitWarning(true);
  }, []);

  const handleLogoExit = useCallback(() => {
    resetExamState();

    try {
      if (storageKey) localStorage.removeItem(storageKey);
    } catch {}
    navigateToExamOrigin();
  }, [navigateToExamOrigin, resetExamState, storageKey]);

  const handleStopAndExit = useCallback(() => {
    try {
      if (examId) localStorage.setItem(`wordExamAttempted:${examId}`, "1");
    } catch {}

    try {
      if (storageKey) localStorage.removeItem(storageKey);
    } catch {}

    resetExamState();

    navigateToExamOrigin();
  }, [examId, navigateToExamOrigin, resetExamState, storageKey]);

  // Chế độ hiển thị
  const displayMode = useMemo(() => {
    //  Đặc biệt cho nhóm chủ đề: luôn hiển thị tất cả câu hỏi
    const currentPartData = examData.parts?.[currentPart];
    const isSubjectGroupType = currentPartData?.type === "NHOM_CHU_DE";

    if (isSubjectGroupType) return "FULL_EXAM";

    if (viewOneQuestion) return "SINGLE_QUESTION";
    if (viewExamPerPart) return "PER_PART";
    return "FULL_EXAM";
  }, [viewOneQuestion, viewExamPerPart, examData.parts, currentPart]);
  const isFullExamRendering = !viewOneQuestion && !viewExamPerPart;

  //  Hàm toggle menu nộp bài tích hợp đồng hồ nổi
  const toggleSubmitMenu = useCallback(() => {
    if (showSidebar) {
      // Nếu sidebar đang hiển thị, ẩn nó và hiện đồng hồ nổi
      setShowSidebar(false);
      setIsFullScreen(true);
    } else {
      // Nếu sidebar đang ẩn, hiện sidebar và ẩn đồng hồ nổi
      setShowSidebar(true);
      setIsFullScreen(false);
    }
  }, [showSidebar]);
  // Chặn phím tắt khi e_cheating === true
  useEffect(() => {
    const blockingEnabled = examData?.e_cheating === true;

    const onKeyDown = (e: KeyboardEvent) => {
      if (!blockingEnabled) return;

      const key = (e.key || "").toLowerCase();
      const isFunctionKey = /^f\d{1,2}$/i.test(e.key || "");

      const isBlockedCombo =
        // 🚫 CHẶN HOÀN TOÀN PHÍM CTRL VÀ CMD
        e.ctrlKey ||
        e.metaKey ||
        // 🚫 CHẶN TRỰC TIẾP PHÍM CTRL/CMD KHI ĐƯỢC BấM
        key === "control" ||
        key === "ctrl" ||
        key === "meta" ||
        key === "cmd" ||
        // 🚫 Alt + Tab (Switch Window/App)
        (e.altKey && key === "tab") ||
        // 🚫 Tất cả phím Function (F1, F2, F3, ...)
        isFunctionKey ||
        // 🚫 F5 (Refresh)
        key === "f5";

      if (isBlockedCombo) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        setShowCheatWarning(true);
        return false;
      }
    };

    // 🚫 CHẶN CHUỘT PHẢI
    const onContextMenu = (e: MouseEvent) => {
      if (!blockingEnabled) return;
      e.preventDefault();
      e.stopPropagation();
      setShowCheatWarning(true);
      return false;
    };

    // 🚫 CHẶN PHÍM CTRL/CMD KHI ĐƯỢC NHẤC LÊN (keyup)
    const onKeyUp = (e: KeyboardEvent) => {
      if (!blockingEnabled) return;

      const key = (e.key || "").toLowerCase();

      if (
        key === "control" ||
        key === "ctrl" ||
        key === "meta" ||
        key === "cmd"
      ) {
        e.preventDefault();
        e.stopPropagation();
        setShowCheatWarning(true);
        return false;
      }
    };

    // 📱 THÊM EVENT LISTENERS
    const options = { capture: true, passive: false };

    window.addEventListener("keydown", onKeyDown, options);
    window.addEventListener("keyup", onKeyUp, options);
    document.addEventListener("contextmenu", onContextMenu, options as any);

    // 🧹 CLEANUP
    return () => {
      window.removeEventListener("keydown", onKeyDown, options as any);
      window.removeEventListener("keyup", onKeyUp, options as any);
      document.removeEventListener(
        "contextmenu",
        onContextMenu,
        options as any
      );
    };
  }, [examData?.e_cheating]);

  // Đặt cờ reload để trang làm bài biết khi nào cần quay về ready
  useEffect(() => {
    if (!examId) return;
    const onBeforeUnload = () => {
      try {
        sessionStorage.setItem(`examReload:${examId}`, "1");
      } catch {}
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [examId]);

  // Hiển thị cảnh báo khi người dùng bấm nút back của trình duyệt
  useEffect(() => {
    if (typeof window === "undefined" || !isExamStarted) return;

    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      window.history.pushState(null, "", window.location.href);
      setShowCheatWarning(true);
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isExamStarted]);

  // Ánh xạ loại câu hỏi
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

  // Xử lý tất cả câu hỏi
  const allQuestions = useMemo(() => {
    const questions: ExamQuestion[] = [];

    // Dự phòng câu hỏi trực tiếp
    if (examData.questions && Array.isArray(examData.questions)) {
      return examData.questions.map((q: any, index: number) => ({
        ...q,
        __partId: "direct",
        __partName: "Câu hỏi",
        __showPartHeader: index === 0,
      }));
    }

    if (
      !examData.parts ||
      !Array.isArray(examData.parts) ||
      examData.parts.length === 0
    ) {
      console.warn(
        "[WordExamViewer] ⚠️ No parts data available, returning empty questions array"
      );
      return questions;
    }

    examData.parts.forEach((part: any, partIdx: number) => {
      const subparts = Array.isArray(part.subpart) ? part.subpart : [];
      let isFirstInPart = true;

      // Kiểm tra xem phần này có phải loại NHOM_CHU_DE không
      const isSubjectGroupType = part.type === "NHOM_CHU_DE";

      subparts.forEach((subpart: any) => {
        const children = Array.isArray(subpart.children)
          ? subpart.children
          : [];

        // Xử lý tất cả children
        const childrenToProcess = isSubjectGroupType
          ? children.filter((child: any) =>
              selectedSubjectsForGroup.some(
                (selected: any) => selected._id === child._id
              )
            )
          : children;

        childrenToProcess.forEach((child: any) => {
          const qs = Array.isArray(child.questions) ? child.questions : [];

          //  THAY ĐỔI: Không sắp xếp theo number, giữ nguyên thứ tự trong subpart
          // để hiển thị câu hỏi theo subpart thay vì trộn lẫn theo number
          const sortedQuestions = [...qs];

          // Tạo map để theo dõi cluster đã được tạo
          const processedClusters = new Set<string>();

          sortedQuestions.forEach((q, qIndex) => {
            const questionData = (q as any).question || q;
            const questionType = questionData.type || q.question_type || "";

            // Bỏ qua tất cả câu hỏi có parentId (câu hỏi con)
            if (
              questionData.parentId !== null &&
              questionData.parentId !== undefined
            ) {
              return; // Skip child questions completely
            }

            if (questionType === "cluster") {
              // Đây là câu hỏi cluster chính
              const clusterId = questionData.questionId;

              if (!processedClusters.has(clusterId)) {
                // Tìm tất cả câu hỏi con thuộc cluster này
                const clusterQuestions = sortedQuestions.filter((subQ) => {
                  const subQData = (subQ as any).question || subQ;
                  return subQData.parentId === clusterId;
                });

                //  THAY ĐỔI: Không sắp xếp câu hỏi trong cluster theo number
                // để giữ nguyên thứ tự trong subpart

                // Tạo câu hỏi cluster
                const processedClusterQuestion = {
                  ...q,
                  ...questionData,
                  _id:
                    questionData._id ||
                    q._id ||
                    `cluster_${questions.length + 1}`,
                  question_type: "CLUSTER_QUESTION",
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
                    questionData.rawHtml || questionData.question || q.question,
                  choices: questionData.choices || q.choices || [],
                  correctAnswers:
                    questionData.correctAnswers || q.correctAnswers || [],
                  __partId: part.id || part._id || `part_${partIdx}`,
                  __partName: part.name,
                  __subpartId: subpart.id || subpart._id,
                  __subpartName: subpart.name,
                  __isMain: subpart.isMain || false, // Thêm thuộc tính isMain từ subpart
                  __childId: child.id || child._id,
                  __childName: child.name,
                  __showPartHeader: isFirstInPart,
                  __isCluster: true,
                  __clusterQuestions: clusterQuestions.map((cq) => {
                    const cqData = (cq as any).question || cq;
                    return {
                      ...cq,
                      ...cqData,
                      __innerId: cqData._id || undefined,
                      _id:
                        cqData._id || cq._id || `sub_${questions.length + 1}`,
                      question_type: mapQuestionType(
                        cqData.type || cq.question_type || ""
                      ),
                      question:
                        cqData.rawHtml ||
                        cqData.plainText ||
                        cqData.question ||
                        cq.question,
                      plainText:
                        cqData.plainText || cqData.question || cq.question,
                      rawHtml: cqData.rawHtml || cqData.question || cq.question,
                      choices: cqData.choices || cq.choices || [],
                      correctAnswers:
                        cqData.correctAnswers || cq.correctAnswers || [],
                      isTestQuestion:
                        cqData.isTestQuestion || cq.isTestQuestion || false, // Câu hỏi thử nghiệm
                    };
                  }),
                };

                questions.push(processedClusterQuestion);
                processedClusters.add(clusterId);
                isFirstInPart = false;
              }
            } else {
              // Xử lý câu hỏi độc lập
              const processedQuestion = {
                ...q,
                ...questionData,
                _id:
                  questionData._id ||
                  q._id ||
                  `question_${questions.length + 1}`,
                __innerId: questionData._id || undefined,
                __originalIndex: qIndex,
                question_type: mapQuestionType(
                  questionData.type || q.question_type || ""
                ),
                question:
                  questionData.rawHtml ||
                  questionData.plainText ||
                  questionData.question ||
                  q.question,
                plainText:
                  questionData.plainText || questionData.question || q.question,
                rawHtml:
                  questionData.rawHtml || questionData.question || q.question,
                choices: questionData.choices || q.choices || [],
                correctAnswers:
                  questionData.correctAnswers || q.correctAnswers || [],
                __partId: part.id || part._id || `part_${partIdx}`,
                __partName: part.name,
                __subpartId: subpart.id || subpart._id,
                __subpartName: subpart.name,
                __isMain: subpart.isMain || false, // Thêm thuộc tính isMain từ subpart
                __childId: child.id || child._id,
                __childName: child.name,
                __showPartHeader: isFirstInPart,
                isTestQuestion:
                  questionData.isTestQuestion || q.isTestQuestion || false, // Câu hỏi thử nghiệm
              };

              questions.push(processedQuestion);
              isFirstInPart = false;
            }
          });
        });
      });
    });

    // Nếu không tìm thấy câu hỏi nào từ parts, thử fallback với examData.questions
    if (
      questions.length === 0 &&
      examData.questions &&
      Array.isArray(examData.questions) &&
      (examData.questions as any[]).length > 0
    ) {
      return (examData.questions as any[]).map((q: any, index: number) => ({
        ...q,
        __partId: "fallback",
        __partName: "Câu hỏi",
        __showPartHeader: index === 0,
      }));
    }

    // Nếu vẫn không có câu hỏi, thử fallback khác - xử lý tất cả câu hỏi bỏ qua parentId check
    if (
      questions.length === 0 &&
      examData.parts &&
      Array.isArray(examData.parts)
    ) {
      examData.parts.forEach((part: any, partIdx: number) => {
        const subparts = Array.isArray(part.subpart) ? part.subpart : [];
        subparts.forEach((subpart: any) => {
          const children = Array.isArray(subpart.children)
            ? subpart.children
            : [];

          children.forEach((child: any) => {
            const qs = Array.isArray(child.questions) ? child.questions : [];

            qs.forEach((q: any) => {
              const questionData = (q as any).question || q;
              const processedQuestion = {
                ...q,
                ...questionData,
                _id:
                  questionData._id ||
                  q._id ||
                  `fallback_question_${questions.length + 1}`,
                __innerId: questionData._id || undefined,
                question_type: mapQuestionType(
                  questionData.type || q.question_type || ""
                ),
                question:
                  questionData.rawHtml ||
                  questionData.plainText ||
                  questionData.question ||
                  q.question,
                plainText:
                  questionData.plainText || questionData.question || q.question,
                rawHtml:
                  questionData.rawHtml || questionData.question || q.question,
                choices: questionData.choices || q.choices || [],
                correctAnswers:
                  questionData.correctAnswers || q.correctAnswers || [],
                __partId: part.id || part._id || `part_${partIdx}`,
                __partName: part.name,
                __subpartId: subpart.id || subpart._id,
                __subpartName: subpart.name,
                __childId: child.id || child._id,
                __childName: child.name,
                __showPartHeader: questions.length === 0,
              };

              questions.push(processedQuestion);
            });
          });
        });
      });
    }

    //  THAY ĐỔI: Không sắp xếp toàn cục theo number, giữ nguyên thứ tự theo subpart
    // để hiển thị câu hỏi theo subpart thay vì trộn lẫn theo number
    const globallySorted = [...questions];
    try {
      const typeMap: Record<string, string> = {};
      globallySorted.forEach((q: any) => {
        // Sử dụng question object ID thay vì question wrapper ID
        const questionId = q.question?._id || q.question?.id || q._id || q.id;
        // Sử dụng question type từ question object thực tế
        const questionType =
          q.question?.type ||
          q.question?.question_type ||
          q.question_type ||
          q.type;
        if (questionId && questionType) {
          typeMap[questionId] = questionType;
        }
      });

      if (Object.keys(typeMap).length > 0) {
        localStorage.setItem(
          `exam_types_${examData._id || examData.id}`,
          JSON.stringify(typeMap)
        );
      }
    } catch (error) {
      console.error("[WordExamViewer]  Error saving question types:", error);
    }
    return globallySorted;
  }, [examData, selectedSubjectsForGroup]);

  //  Nhóm câu hỏi cluster sau khi đã xử lý - FIXED: Stable memoization
  const questionGroups = useMemo(() => {
    const groups = groupClusterQuestions(allQuestions);
    return groups;
  }, [allQuestions, examData._id, examData.id]); // Thêm exam ID để stable hơn

  // Danh sách câu hỏi phẳng (bao gồm câu hỏi đơn và các câu hỏi con của cluster)
  const flatQuestions = useMemo(() => {
    const flattened: ExamQuestion[] = [];
    questionGroups.forEach((group) => {
      if (group.type === "cluster") {
        const main: any = group.questions[0];
        group.questions.slice(1).forEach((sub: any) => {
          flattened.push({
            ...sub,
            __partId: sub.__partId ?? main.__partId,
            __partName: sub.__partName ?? main.__partName,
            __subpartId: sub.__subpartId ?? main.__subpartId,
            __subpartName: sub.__subpartName ?? main.__subpartName,
            __isMain: sub.__isMain ?? main.__isMain, // Thêm thuộc tính isMain cho cluster sub-questions
            __childId: sub.__childId ?? main.__childId,
            __childName: sub.__childName ?? main.__childName,
          } as any);
        });
      } else {
        flattened.push(group.questions[0]);
      }
    });
    return flattened;
  }, [questionGroups]);

  // Quản lý thời gian

  //  Khởi tạo thời gian - sử dụng logic giống hệt màn ready
  useEffect(() => {
    if (initializedFromStorageRef.current) return;

    //  Logic tính thời gian giống hệt màn ready
    const calculateDuration = () => {
      try {
        const config =
          (examData?.categoryExam as any)?.populate_id?.config?.[0] || {};
        const viewExamPerPart = Boolean(config.viewExamPerPart);
        const viewOneQuestion = Boolean(config.viewOneQuestion);
        const timePerPart = Boolean(config.timePerPart);
        const usePartTimer = viewExamPerPart || viewOneQuestion || timePerPart;

        // Helper: get part time for a given part, mimicking ready page logic
        const getPartTimeForReady = (partIndex: number): number => {
          const part = Array.isArray(examData.parts)
            ? examData.parts[partIndex]
            : null;
          if (!part) return 0;

          //  For all parts (including NHOM_CHU_DE), use part.time
          return Number(part.time) || 0;
        };

        if (usePartTimer) {
          // Show time for the first part (the one user is about to start)
          const firstPartTime = getPartTimeForReady(0);
          return firstPartTime > 0 ? firstPartTime : 30;
        }

        // FULL_EXAM: use exam.time, fallback sum of part times, else 90
        const topTime = Number((examData as any).time) || 0;
        if (topTime > 0) return topTime;
        const totalPartsTime = (
          Array.isArray(examData.parts) ? examData.parts : []
        ).reduce((sum: number, p: any) => sum + (Number(p?.time) || 0), 0);
        return totalPartsTime > 0 ? totalPartsTime : 90;
      } catch {
        return Number((examData as any)?.time) || 0;
      }
    };

    const duration = calculateDuration();
    const durationSeconds = duration * 60;

    // Tính thời gian còn lại với logic mới (xét cả thời gian đóng đề nếu có)
    const remaining = calculateRemainingTime(durationSeconds, timeStart);

    // Nếu thời gian đã hết ngay từ đầu (do đã đến thời điểm đóng đề), đánh dấu kết thúc
    if (remaining <= 1) {
      // Kiểm tra xem có phải do hết thời gian đóng đề không
      const endDate = getExamEndDate();
      if (endDate && Date.now() >= endDate.getTime()) {
        // Hết thời gian đóng đề - luôn nộp bài dù có dùng usePartTimer hay không
        setTimeEndReason("endDate");
        setIsTimeEnd(true);
        setTimeRemaining(0);
      } else {
        // Chỉ tự động nộp bài khi KHÔNG dùng timer theo phần
        // Khi dùng usePartTimer, việc nộp bài sẽ được xử lý bởi timer của phần cuối cùng
        if (!usePartTimer) {
          setTimeEndReason("duration");
          setIsTimeEnd(true);
        }
        setTimeRemaining(0);
      }
    } else {
      setTimeRemaining(remaining);
    }

    //  Thời gian từng phần: lấy theo quy tắc getPartTime
    const partTime = getPartTime(currentPart);
    if (partTime > 0) {
      setPartTimeRemaining(partTime * 60);
    } else {
      setPartTimeRemaining(30 * 60);
    }
  }, [
    examData,
    currentPart,
    getPartTime,
    displayMode,
    selectedSubjectsForGroup,
    timeStart,
    calculateRemainingTime,
  ]);

  //  Cập nhật thời gian khi chuyển phần hoặc chọn subjects
  useEffect(() => {
    if (usePartTimer) {
      const partTime = getPartTime(currentPart);

      if (partTime > 0) {
        setPartTimeRemaining(partTime * 60);
      } else if (examData.time && examData.parts && examData.parts.length > 0) {
        // Fallback: chia đều thời gian tổng cho các phần
        const avgTime = Math.floor(
          (examData.time * 60) / examData.parts.length
        );
        setPartTimeRemaining(avgTime);
      }
    }
  }, [
    currentPart,
    usePartTimer,
    examData.parts,
    examData.time,
    getPartTime,
    selectedSubjectsForGroup,
  ]);

  //  Khởi tạo currentQuestionId khi questionGroups được tạo hoặc khi chuyển phần
  useEffect(() => {
    // Chỉ xử lý trong chế độ hiển thị từng câu (SINGLE_QUESTION)
    if (displayMode !== "SINGLE_QUESTION") return;

    if (questionGroups.length > 0) {
      // Tìm câu hỏi đầu tiên của phần hiện tại để hiển thị
      const currentPartGroups = questionGroups.filter((group) => {
        const firstQuestion = group.questions[0];
        const partId =
          examData.parts?.[currentPart]?.id ||
          examData.parts?.[currentPart]?._id ||
          `part_${currentPart}`;
        return (firstQuestion as any).__partId === partId;
      });

      if (currentPartGroups.length > 0) {
        const firstGroup = currentPartGroups[0];
        let firstQuestionId: string;

        if (firstGroup.type === "cluster") {
          // Nếu là cluster, lấy câu hỏi con đầu tiên (bỏ qua đề bài)
          firstQuestionId =
            firstGroup.questions[1]?._id || firstGroup.questions[0]._id;
        } else {
          // Nếu là câu hỏi đơn, lấy câu hỏi đó
          firstQuestionId = firstGroup.questions[0]._id;
        }

        if (firstQuestionId) {
          //  Luôn cập nhật currentQuestionId khi chuyển phần, không chỉ khi nó null
          setCurrentQuestionId(firstQuestionId);
          setCurrentQuestion(0); // Đảm bảo currentQuestion cũng được reset về 0
        }
      }
    }
  }, [questionGroups, currentPart, examData.parts, displayMode]);

  // Đặt lại thời gian phần khi chuyển phần
  useEffect(() => {
    if (usePartTimer) {
      const partTime = getPartTime(currentPart);
      let initialSeconds = 0;

      if (partTime > 0) {
        initialSeconds = partTime * 60;
      } else if (examData.time && examData.parts && examData.parts.length > 0) {
        initialSeconds = Math.floor(
          (examData.time * 60) / examData.parts.length
        );
      }

      if (initialSeconds > 0) {
        const endDate = getExamEndDate();
        if (endDate) {
          const now = Date.now();
          const secondsUntilClose = Math.max(
            0,
            Math.floor((endDate.getTime() - now) / 1000)
          );
          initialSeconds = Math.min(initialSeconds, secondsUntilClose);
        }
        setPartTimeRemaining(initialSeconds);
      }
    }
  }, [
    currentPart,
    usePartTimer,
    examData.parts,
    examData.time,
    getPartTime,
    getExamEndDate,
  ]);

  // Hàm kiểm tra thời gian còn lại và hiển thị cảnh báo
  const checkTimeWarning = useCallback(
    (timeLeft: number) => {
      // Tính thời gian còn lại theo giây
      const totalSeconds = Math.floor(timeLeft);

      // Cảnh báo chính xác ở mốc 10 phút (600 giây)
      if (totalSeconds === 600 && !timeWarning10MinShown) {
        setShowTimeWarning(true);
        setTimeWarning10MinShown(true);
        setTimeWarningType("10");
        setTimeWarningMessage(
          "Thời gian làm bài còn 10 phút. Hãy nhanh chóng hoàn thành bài thi!"
        );

        // Tự động ẩn sau 5 giây
        setTimeout(() => {
          setShowTimeWarning(false);
          setTimeWarningType(null);
        }, 5000);
      }
      // Cảnh báo chính xác ở mốc 5 phút (300 giây)
      else if (totalSeconds === 300 && !timeWarning5MinShown) {
        setShowTimeWarning(true);
        setTimeWarning5MinShown(true);
        setTimeWarningType("5");
        setTimeWarningMessage(
          "Thời gian làm bài chỉ còn 5 phút. Hãy nhanh chóng hoàn thành và soát lại đáp án!"
        );

        // Tự động ẩn sau 10 giây
        setTimeout(() => {
          setShowTimeWarning(false);
          setTimeWarningType(null);
        }, 10000);
      }
    },
    [timeWarning10MinShown, timeWarning5MinShown]
  );

  // Bộ đếm thời gian chính - FIXED: Stable dependencies
  useEffect(() => {
    if (!isExamStarted || isTimeEnd) return;

    const examDurationSeconds = getExamDurationMinutes() * 60;

    const timer = setInterval(() => {
      if (usePartTimer) {
        // CHẾ ĐỘ TIMER THEO PHẦN - CHỈ ĐẾM TIMER PHẦN
        setPartTimeRemaining((prev) => {
          const now = Date.now();
          const endDate = getExamEndDate();

          if (endDate && now >= endDate.getTime()) {
            // Hết thời gian đóng đề - luôn nộp bài
            setTimeEndReason("endDate");
            setIsTimeEnd(true);
            return 0;
          }

          let secondsUntilClose = Infinity;
          if (endDate) {
            secondsUntilClose = Math.max(
              0,
              Math.floor((endDate.getTime() - now) / 1000)
            );
          }

          let newTime = prev - 1;
          if (endDate) {
            newTime = Math.min(newTime, secondsUntilClose);
          }

          if (newTime <= 0) {
            // Kiểm tra xem có phải do hết thời gian đóng đề không
            if (endDate && secondsUntilClose <= 1) {
              setTimeEndReason("endDate");
              setIsTimeEnd(true);
              return 0;
            }

            // Hết thời gian của một phần
            if (currentPart < examData.parts.length - 1) {
              if (partTimeEndModalShownRef.current !== currentPart) {
                partTimeEndModalShownRef.current = currentPart;
                setPendingPart(currentPart + 1);
                setShowPartTimeEndModal(true);
              }
              return 0; // Giữ thời gian ở 0
            } else {
              //  Phần cuối cùng - hết thời gian phần cuối → Nộp bài
              setTimeEndReason("duration");
              setIsTimeEnd(true);
            }
            return 0;
          }

          // Kiểm tra cảnh báo thời gian cho phần thi hiện tại
          checkTimeWarning(newTime);

          return newTime;
        });

        // KHÔNG CẬP NHẬT timeRemaining khi dùng timePerPart
        // Chỉ để timeRemaining làm reference, không dùng để tự động nộp bài
      } else {
        // CHẾ ĐỘ TIMER TỔNG - Chỉ dùng khi KHÔNG có timePerPart
        // So sánh trực tiếp với realtime để phát hiện ngay khi đến thời điểm đóng đề
        const now = Date.now();
        const endDate = getExamEndDate();

        // Kiểm tra nếu đã đến hoặc vượt quá thời điểm đóng đề (so sánh realtime)
        if (endDate && now >= endDate.getTime()) {
          setTimeEndReason("endDate");
          setIsTimeEnd(true);
          setTimeRemaining(0);
          return;
        }

        // Tính lại thời gian còn lại dựa trên cả thời gian làm bài và thời gian đóng đề
        const calculatedRemaining = calculateRemainingTime(
          examDurationSeconds,
          timeStart
        );

        setTimeRemaining((prev) => {
          // Nếu thời gian đã hết (<= 1), kết thúc bài thi
          if (calculatedRemaining <= 1) {
            // Kiểm tra xem có phải do hết thời gian đóng đề không
            const endDate = getExamEndDate();
            if (endDate && now >= endDate.getTime()) {
              setTimeEndReason("endDate");
            } else {
              setTimeEndReason("duration");
            }
            setIsTimeEnd(true);
            return 0;
          }

          // Cập nhật thời gian còn lại
          const newRemaining = Math.max(0, Math.floor(calculatedRemaining));

          // Kiểm tra cảnh báo thời gian
          checkTimeWarning(newRemaining);

          return newRemaining;
        });
      }
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [
    isExamStarted,
    isTimeEnd,
    // isTimerPaused, // removed – variable does not exist
    usePartTimer,
    currentPart,
    examData.parts?.length,
    examData.time,
    getPartTime,
    checkTimeWarning,
    timeStart,
    getExamDurationMinutes,
    calculateRemainingTime,
    getExamEndDate,
  ]);

  // Kiểm tra liên tục thời gian đóng đề (realtime check) - độc lập với timer
  useEffect(() => {
    if (!isExamStarted || isTimeEnd) return;

    const checkEndDate = () => {
      const endDate = getExamEndDate();
      if (endDate) {
        const now = Date.now();
        // So sánh trực tiếp với realtime để phát hiện ngay khi đã đến thời điểm đóng đề
        if (now >= endDate.getTime()) {
          setTimeEndReason("endDate");
          setIsTimeEnd(true);
          setTimeRemaining(0);
        }
      }
    };

    // Kiểm tra ngay lập tức
    checkEndDate();

    // Kiểm tra mỗi giây để đảm bảo phát hiện chính xác khi chuyển từ 8:59:59 sang 9:00:00
    const interval = setInterval(checkEndDate, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [isExamStarted, isTimeEnd, getExamEndDate]);

  // Đồng bộ thời gian và điểm từ server mỗi 5s
  useEffect(() => {
    const id = (examData as any)?._id || (examData as any)?.id;
    const examKey = (examData as any)?.exam_key;
    if (!id || !examKey) return;
    if (!isExamStarted || isTimeEnd) return;

    let interval: number | null = null;

    const fetchStatus = async () => {
      try {
        const res = await examService.getScore({
          exam_id: id,
          exam_key: String(examKey),
        });
        const payload = (res as any)?.data || {};
        const serverSeconds = Number(
          payload.remaining_seconds ??
            payload.time_remaining ??
            payload.remaining_time ??
            payload.seconds_left
        );
        if (Number.isFinite(serverSeconds)) {
          const serverTime = Math.max(0, Math.floor(serverSeconds));

          // Kiểm tra trực tiếp với endDate (realtime check) trước
          const endDate = getExamEndDate();
          if (endDate && Date.now() >= endDate.getTime()) {
            setTimeEndReason("endDate");
            setIsTimeEnd(true);
            setTimeRemaining(0);
            return;
          }

          // Đối với practice exam, kiểm tra lại với thời gian đóng đề để đảm bảo tính chính xác
          const examDurationSeconds = getExamDurationMinutes() * 60;
          const calculatedTime = calculateRemainingTime(
            examDurationSeconds,
            timeStart
          );
          // Sử dụng giá trị nhỏ nhất giữa server time và calculated time (để đảm bảo client-side check)
          const finalTime = Math.min(serverTime, calculatedTime);

          setTimeRemaining((prev) => {
            // Khi dùng timer theo phần (usePartTimer), không tự động nộp bài dựa trên timeRemaining
            // Chỉ nộp bài khi hết thời gian đóng đề (endDate) - đã được xử lý ở trên
            // Hoặc khi KHÔNG dùng usePartTimer và thời gian đã hết
            if (finalTime <= 1) {
              // Kiểm tra xem có phải do hết thời gian đóng đề không
              const endDate = getExamEndDate();
              if (endDate && Date.now() >= endDate.getTime()) {
                // Hết thời gian đóng đề - luôn nộp bài dù có dùng usePartTimer hay không
                setTimeEndReason("endDate");
                setIsTimeEnd(true);
                return 0;
              } else if (!usePartTimer) {
                // Chỉ tự động nộp bài khi KHÔNG dùng timer theo phần
                setTimeEndReason("duration");
                setIsTimeEnd(true);
                return 0;
              }
              // Nếu dùng usePartTimer và không phải do hết thời gian đóng đề,
              // chỉ cập nhật timeRemaining về 0 nhưng không set isTimeEnd
              return 0;
            }
            return prev !== finalTime ? finalTime : prev;
          });
        }
        const s = payload.score ?? payload.current_score ?? payload.total_score;
        if (typeof s === "number") setLiveScore(s);
      } catch (e) {
        // ignore
      }
    };

    fetchStatus();
    interval = window.setInterval(fetchStatus, 5000);
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [
    examData,
    isExamStarted,
    isTimeEnd,
    getExamEndDate,
    getExamDurationMinutes,
    calculateRemainingTime,
    timeStart,
    usePartTimer,
  ]);

  // Lưu thời gian còn lại + mốc thời gian để khôi phục chính xác
  useEffect(() => {
    if (!storageKey) return;
    try {
      const existing = localStorage.getItem(storageKey);
      const base = existing ? JSON.parse(existing) : {};
      const payload = {
        ...base,
        timeRemaining,
        partTimeRemaining,
        timeStart: timeStart?.getTime() || Date.now(), // Lưu thời gian bắt đầu làm bài
        updatedAt: Date.now(),
      };
      localStorage.setItem(storageKey, JSON.stringify(payload));
    } catch {}
  }, [storageKey, timeRemaining, partTimeRemaining]);

  // Đặt cờ để trang exam biết quay về ready khi reload tab
  useEffect(() => {
    if (!examId) return;
    const onBeforeUnload = () => {
      try {
        sessionStorage.setItem(`examReload:${examId}`, "1");
      } catch {}
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [examId]);

  // Lưu tiến độ mỗi khi state quan trọng thay đổi
  useEffect(() => {
    if (!storageKey) return;
    try {
      const payload = {
        examId,
        isExamStarted,
        currentPart,
        currentQuestion,
        userAnswers,
        flaggedQuestions: Array.from(flaggedQuestions || []),
        completedParts: Array.from(completedParts || []),
        showSidebar,
        timeRemaining,
        partTimeRemaining,
        timeStart: timeStart?.getTime() || Date.now(), // Lưu thời gian bắt đầu làm bài
        updatedAt: Date.now(),
      };
      localStorage.setItem(storageKey, JSON.stringify(payload));
    } catch {}
  }, [
    storageKey,
    examId,
    isExamStarted,
    currentPart,
    currentQuestion,
    userAnswers,
    flaggedQuestions,
    completedParts,
    showSidebar,
    timeRemaining,
    partTimeRemaining,
  ]);

  // Xử lý sự kiện
  const handleAnswerChange = useCallback(
    (questionId: string, value: any, type: QuestionType) => {
      setUserAnswers((prev) => ({ ...prev, [questionId]: { answer: value } }));

      if (type) {
        saveQuestionType(questionId, type);
      }
    },
    [saveQuestionType]
  );

  const toggleFlagQuestion = useCallback((questionId: string) => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      const wasFlagged = newSet.has(questionId);
      if (wasFlagged) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  }, []);

  const navigateToQuestion = useCallback(
    (questionIndex: number) => {
      //  THAY ĐỔI: Sử dụng flatQuestions thay vì questionGroups
      const target = flatQuestions[questionIndex];
      if (!target) {
        return;
      }

      //  Tìm group chứa câu hỏi này
      const groupIndex = questionGroups.findIndex((g) =>
        g.questions.some((q) => q._id === target._id)
      );

      if (groupIndex === -1) {
        return;
      }

      const group = questionGroups[groupIndex];

      if (displayMode === "SINGLE_QUESTION") {
        //  Set currentQuestion theo groupIndex, không phải questionIndex
        setCurrentQuestion(groupIndex);
        setCurrentQuestionId(target._id);

        // Nếu là cluster và click vào câu hỏi con, cần scroll đến câu hỏi con
        if (group.type === "cluster") {
          const mainQuestion = group.questions[0];
          if (target._id !== mainQuestion._id) {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                const element = document.getElementById(
                  `question-${target._id}`
                );
                if (element) {
                  element.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }
              });
            });
          }
        }
        return;
      }

      // Với PER_PART và FULL_EXAM, scroll đến element
      let scrollTargetId: string;

      if (group.type === "cluster") {
        const mainQuestion = group.questions[0];
        if (target._id === mainQuestion._id) {
          scrollTargetId = `question-${mainQuestion._id}`;
        } else {
          scrollTargetId = `question-${target._id}`;
        }
      } else {
        scrollTargetId = `question-${target._id}`;
      }

      const element = document.getElementById(scrollTargetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      setCurrentQuestion(groupIndex);
      setCurrentQuestionId(target._id);
    },
    [displayMode, questionGroups, flatQuestions]
  );

  const handleSubmitExam = useCallback(async () => {
    if (timeStart) {
      const timeSpent = Math.floor((Date.now() - timeStart.getTime()) / 1000);

      //  Chỉ giữ các câu có inner id; loại wrapper duplicates
      const answerMap = new Map<
        string,
        { value: any; isTestQuestion: boolean }
      >();
      for (const [questionId, response] of Object.entries(userAnswers)) {
        const found = flatQuestions.find((q: any) => q._id === questionId);
        const innerId =
          (found as any)?.__innerId || (found as any)?.question?._id;
        if (!innerId) continue; // bỏ wrapper không có inner id

        // Chuẩn hóa đáp án theo loại câu hỏi
        let normalizedValue: any = (response as any)?.answer;

        // Kiểm tra loại câu hỏi để xử lý đúng
        const questionType =
          (found as any)?.question_type || (found as any)?.type;

        if (questionType === "TRUE_FALSE") {
          // Câu hỏi đúng sai đơn: chỉ truyền "true" hoặc "false"
          normalizedValue = String(normalizedValue).toLowerCase();
          if (normalizedValue === "đúng" || normalizedValue === "a") {
            normalizedValue = "true";
          } else if (normalizedValue === "sai" || normalizedValue === "b") {
            normalizedValue = "false";
          }
        } else if (
          questionType === "TN_TRUE_FALSE" ||
          questionType === "TRUE_FALSE_STATEMENTS"
        ) {
          // Câu hỏi đúng sai nhiều ý: truyền mảng ["true", "false", ...]
          if (Array.isArray((response as any)?.answer)) {
            const first = (response as any).answer[0];
            if (first && typeof first === "object" && first.questionOption) {
              const order = ["A", "B", "C", "D", "E", "F", "G", "H"];
              normalizedValue = [...(response as any).answer]
                .sort(
                  (a: any, b: any) =>
                    order.indexOf(a.questionOption) -
                    order.indexOf(b.questionOption)
                )
                .map((it: any) => String(it.option));
            }
          }
        }

        // Lấy thông tin isTestQuestion từ câu hỏi
        const isTestQuestion = (found as any)?.isTestQuestion || false;
        answerMap.set(innerId, { value: normalizedValue, isTestQuestion });
      }

      const answers: UserAnswer[] = Array.from(answerMap.entries()).map(
        ([qid, { value, isTestQuestion }]) => ({
          question_id: qid,
          value,
          isTestQuestion,
        })
      );

      // Lưu kết quả vào state để hiển thị trong modal nội bộ (không lưu storage)
      setExamResult({
        userAnswers: answers,
        timeSpent,
      });

      // Gọi callback để tính điểm và lưu kết quả API
      let scoreResult: any = null;
      try {
        scoreResult = await onExamComplete?.(
          answers,
          timeSpent,
          Array.isArray(selectedSubjectsForGroup)
            ? selectedSubjectsForGroup
                .map((s: any) => s?.name)
                .filter(
                  (n: any) => typeof n === "string" && n.trim().length > 0
                )
            : undefined
        );
        if (scoreResult) {
          setApiScoreResult(scoreResult);
        }
      } catch (error) {
        console.error("Error getting score result:", error);
      }

      // Xóa tiến độ đã lưu khi đã nộp bài
      try {
        if (storageKey) localStorage.removeItem(storageKey);
      } catch (error) {
        console.error("Error removing storage:", error);
      }

      // Luôn lưu kết quả vào sessionStorage và chuyển đến màn /score để đảm bảo hiện banner quà tặng
      try {
        const resultKey = `wordExamResult:${examId}`;
        const resultData = {
          userAnswers: answers,
          timeSpent,
          selectedSubjects: Array.isArray(selectedSubjectsForGroup)
            ? selectedSubjectsForGroup
            : [],
          scoringResult: scoreResult,
          examFinished: (() => {
            // Đọc trạng thái finished từ sessionStorage (do ready page lưu)
            try {
              const stored = sessionStorage.getItem(
                `examFinishedStatus:${examId}`
              );
              return stored !== null ? JSON.parse(stored) : null;
            } catch {
              return null;
            }
          })(),
        };
        sessionStorage.setItem(resultKey, JSON.stringify(resultData));

        // Đánh dấu đã làm bài
        if (examId) {
          localStorage.setItem(`wordExamAttempted:${examId}`, "1");
        }

        // Chuyển đến màn /score chuyên biệt cho bài thi Word
        router.push(`/thi-thu/word-exam/${examId}/score`);
      } catch (error) {
        console.error("Error saving result and redirecting:", error);
        // Fallback về trang thi thử nếu có lỗi nghiêm trọng
        router.push("/thi-thu");
      }
    }
  }, [
    timeStart,
    userAnswers,
    onExamComplete,
    storageKey,
    flatQuestions,
    selectedSubjectsForGroup,
    examId,
    router,
    examData,
    isRetakeExam,
  ]);

  // Tự động nộp bài khi hết thời gian
  useEffect(() => {
    if (isTimeEnd) {
      // Hiển thị thông báo nếu do hết thời gian đóng đề
      if (timeEndReason === "endDate") {
        toast.info(
          "Đã hết thời gian mở đề thi, hệ thống sẽ tự động nộp bài thi và chuyển đề sang trạng thái đã đóng",
          {
            position: "top-right",
            autoClose: 3000,
          }
        );
      } else if (timeEndReason === "duration" && usePartTimer) {
        // Hiển thị thông báo khi hết thời gian phần cuối và tự động nộp bài
        toast.info(
          "Thời gian làm bài của bạn đã hết! Hệ thống tự động nộp bài thi.",
          {
            position: "top-right",
            autoClose: 5000,
          }
        );
      }
      handleSubmitExam();
    }
  }, [isTimeEnd, timeEndReason, handleSubmitExam, isRetakeExam, usePartTimer]);

  //  Kiểm tra xem phần hiện tại có cần chọn nhóm chủ đề không
  useEffect(() => {
    const currentPartData = examData.parts?.[currentPart];

    //  Xử lý nhóm chủ đề ở phần đầu tiên (currentPart = 0)
    // Chỉ hiển thị PartInfoScreen nếu chưa chọn môn
    if (
      currentPart === 0 &&
      currentPartData?.type === "NHOM_CHU_DE" &&
      selectedSubjectsForGroup.length === 0
    ) {
      setShowPartInfo(true);
      setPendingPart(0);
    }
  }, [
    currentPart,
    examData.parts,
    showPartInfo,
    displayMode,
    selectedSubjectsForGroup,
  ]);

  const handleSubmitPart = useCallback(() => {
    if (isSubmittingPart) return;
    setIsSubmittingPart(true);

    // Đánh dấu phần hiện tại đã hoàn thành
    setCompletedParts((prev) => new Set(Array.from(prev).concat(currentPart)));

    // Kiểm tra xem có phải phần cuối cùng không
    const isLastPart = currentPart >= (examData.parts?.length || 1) - 1;

    if (isLastPart) {
      // Nếu là phần cuối cùng, nộp toàn bộ bài thi
      handleSubmitExam();
    } else {
      const nextPart = currentPart + 1;
      const nextPartData = examData.parts?.[nextPart];
      const isNextPartSubjectGroup = nextPartData?.type === "NHOM_CHU_DE";

      // Chỉ hiển thị màn hình thông tin phần cho PER_PART và SINGLE_QUESTION
      if (displayMode !== "FULL_EXAM") {
        setPendingPart(nextPart);
        setShowPartInfo(true);
      } else {
        // Với FULL_EXAM, chuyển trực tiếp sang phần tiếp theo
        setCurrentPart(nextPart);
        setCurrentQuestion(0);
        //  Reset currentQuestionId khi chuyển phần để tránh xung đột
        setCurrentQuestionId(null);
        // Reset ref để cho phép hiển thị modal cho phần mới nếu cần
        partTimeEndModalShownRef.current = null;

        // Đặt lại thời gian cho phần mới nếu có timePerPart
        if (usePartTimer && examData.parts && examData.parts[nextPart]) {
          const nextPartTime = getPartTime(nextPart);
          if (nextPartTime > 0) {
            setPartTimeRemaining(nextPartTime * 60);
          } else if (examData.time && examData.parts.length > 0) {
            setPartTimeRemaining(
              Math.floor((examData.time * 60) / examData.parts.length)
            );
          }
        }
      }
    }

    setIsSubmittingPart(false);
  }, [
    currentPart,
    examData.parts,
    examData.time,
    isSubmittingPart,
    handleSubmitExam,
    displayMode,
    usePartTimer,
    getPartTime,
  ]);

  const handleShowSubmitModal = useCallback((type: "exam" | "part") => {
    setSubmitType(type);
    setShowSubmitModal(true);
  }, []);

  const handleStartNextPart = useCallback(() => {
    if (pendingPart !== null) {
      // Kiểm tra nếu phần tiếp theo là nhóm chủ đề
      const nextPartData = examData.parts?.[pendingPart];
      const isNextPartSubjectGroup = nextPartData?.type === "NHOM_CHU_DE";

      if (isNextPartSubjectGroup) {
        // Nếu là nhóm chủ đề, bắt buộc hiện màn hình thông tin để chọn môn
        setShowPartInfo(true);
        setSelectedSubjectsForGroup([]); // Reset lựa chọn môn
        // Reset ref để cho phép hiển thị modal cho phần mới nếu cần sau này
        partTimeEndModalShownRef.current = null;
        return;
      }

      setCurrentPart(pendingPart);
      setCurrentQuestion(0);
      //  Reset currentQuestionId khi chuyển phần để tránh xung đột
      setCurrentQuestionId(null);
      setShowPartInfo(false);
      setPendingPart(null);
      // Reset ref để cho phép hiển thị modal cho phần mới nếu cần
      partTimeEndModalShownRef.current = null;

      // Đặt lại thời gian cho phần mới nếu có timePerPart
      if (usePartTimer && examData.parts && examData.parts[pendingPart]) {
        const nextPartTime = getPartTime(pendingPart);
        let initialSeconds = 0;

        if (nextPartTime > 0) {
          initialSeconds = nextPartTime * 60;
        } else if (examData.time && examData.parts.length > 0) {
          initialSeconds = Math.floor(
            (examData.time * 60) / examData.parts.length
          );
        }

        if (initialSeconds > 0) {
          const endDate = getExamEndDate();
          if (endDate) {
            const now = Date.now();
            const secondsUntilClose = Math.max(
              0,
              Math.floor((endDate.getTime() - now) / 1000)
            );
            initialSeconds = Math.min(initialSeconds, secondsUntilClose);
          }
          setPartTimeRemaining(initialSeconds);
        }
      }
    }
  }, [
    pendingPart,
    usePartTimer,
    examData.parts,
    examData.time,
    getPartTime,
    getExamEndDate,
  ]);

  const handleConfirmSubmit = useCallback(() => {
    setShowSubmitModal(false);
    if (submitType === "exam") {
      handleSubmitExam();
    } else {
      handleSubmitPart();
    }
  }, [submitType, handleSubmitExam, handleSubmitPart]);

  const handleAutoMoveToNextPart = useCallback(() => {
    setShowPartTimeEndModal(false);
    setPartTransitionCountdown(null);
    handleStartNextPart();
  }, [handleStartNextPart]);

  // Quản lý countdown 5s cho popup hết thời gian phần
  useEffect(() => {
    if (!showPartTimeEndModal) return;

    // Mỗi lần mở popup, reset countdown về 5
    setPartTransitionCountdown(5);
  }, [showPartTimeEndModal]);

  useEffect(() => {
    if (!showPartTimeEndModal) return;
    if (partTransitionCountdown === null) return;

    if (partTransitionCountdown <= 0) {
      handleAutoMoveToNextPart();
      return;
    }

    const timer = window.setTimeout(() => {
      setPartTransitionCountdown((prev) =>
        typeof prev === "number" ? Math.max(0, prev - 1) : prev
      );
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [showPartTimeEndModal, partTransitionCountdown, handleAutoMoveToNextPart]);

  // Các handler này không còn cần thiết vì đã chuyển sang route riêng

  // handleRetakeExam không còn cần thiết vì đã chuyển sang route riêng

  //  Xử lý chọn môn học trong phần thi nhóm chủ đề
  const handleSubjectSelection = useCallback((selectedSubjects: any[]) => {
    setSelectedSubjectsForGroup(selectedSubjects);
  }, []);

  //  Xử lý bắt đầu phần thi sau khi chọn môn
  const handleStartAfterSelection = useCallback(() => {
    if (pendingPart !== null) {
      setCurrentPart(pendingPart);
      setCurrentQuestion(0);
      setShowPartInfo(false);
      setPendingPart(null);

      // Cập nhật thời gian cho phần thi
      const partTime = getPartTime(pendingPart);
      setPartTimeRemaining(partTime * 60);

      //  Đặc biệt xử lý cho phần đầu tiên là nhóm chủ đề
      if (pendingPart === 0) {
        // Đảm bảo currentQuestionId được reset
        setCurrentQuestionId(null);
      }
    }
  }, [pendingPart, getPartTime, selectedSubjectsForGroup]);
  // Điều hướng bằng phím mũi tên (Trái/Phải/Lên/Xuống)
  useEffect(() => {
    const isEditableTarget = (el: EventTarget | null): boolean => {
      const node = el as HTMLElement | null;
      if (!node) return false;
      const tag = (node.tagName || "").toLowerCase();
      const editableTags = ["input", "textarea", "select"];
      if (editableTags.includes(tag)) return true;
      if ((node as any).isContentEditable) return true;
      return false;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target)) return;

      const key = e.key;
      if (
        key === "ArrowLeft" ||
        key === "ArrowUp" ||
        key === "ArrowRight" ||
        key === "ArrowDown"
      ) {
        e.preventDefault();

        try {
          (document.activeElement as HTMLElement | null)?.blur?.();
        } catch {}

        const delta = key === "ArrowLeft" || key === "ArrowUp" ? -1 : 1;

        let allowedIndices: number[] = [];

        if (displayMode === "FULL_EXAM") {
          // Toàn bộ bài - tất cả câu hỏi
          allowedIndices = flatQuestions.map((_, idx) => idx);
        } else {
          // Theo phần - chỉ câu hỏi trong phần hiện tại
          const partId =
            examData.parts?.[currentPart]?.id ||
            examData.parts?.[currentPart]?._id ||
            `part_${currentPart}`;

          allowedIndices = flatQuestions
            .map((question, idx) => {
              return (question as any).__partId === partId ? idx : -1;
            })
            .filter((i: number) => i !== -1);
        }

        //  Tìm vị trí hiện tại trong flatQuestions dựa trên currentQuestionId
        const currentFlatIndex = flatQuestions.findIndex(
          (q) => q._id === currentQuestionId
        );

        if (currentFlatIndex === -1) {
          // Fallback: sử dụng câu hỏi đầu tiên của group hiện tại
          const currentGroup = questionGroups[currentQuestion];
          if (currentGroup) {
            const firstQuestionInGroup =
              currentGroup.type === "cluster"
                ? currentGroup.questions[1] // Câu hỏi con đầu tiên
                : currentGroup.questions[0]; // Câu hỏi đơn

            const fallbackIndex = flatQuestions.findIndex(
              (q) => q._id === firstQuestionInGroup?._id
            );

            if (fallbackIndex !== -1) {
              const pos = allowedIndices.indexOf(fallbackIndex);
              if (pos !== -1) {
                const nextPos = pos + delta;
                if (nextPos >= 0 && nextPos < allowedIndices.length) {
                  navigateToQuestion(allowedIndices[nextPos]);
                }
              }
            }
          }
          return;
        }

        const pos = allowedIndices.indexOf(currentFlatIndex);
        if (pos === -1) return;

        const nextPos = pos + delta;
        if (nextPos < 0 || nextPos >= allowedIndices.length) return;

        navigateToQuestion(allowedIndices[nextPos]);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    currentQuestion,
    currentQuestionId, //  Thêm dependency
    navigateToQuestion,
    displayMode,
    questionGroups,
    flatQuestions, //  Thêm dependency
    examData.parts,
    currentPart,
  ]);

  // Hàm tiện ích
  const getCurrentQuestions = useCallback(() => {
    if (!examData.parts || !examData.parts[currentPart]) return [];

    const currentPartData = examData.parts[currentPart];

    //  Xử lý nhóm chủ đề cho tất cả displayMode (bao gồm FULL_EXAM)
    if (
      currentPartData.type === "NHOM_CHU_DE" &&
      selectedSubjectsForGroup.length > 0
    ) {
      // Lọc câu hỏi theo môn đã chọn
      return questionGroups.filter((group) => {
        const firstQuestion = group.questions[0];
        const partId =
          examData.parts[currentPart].id ||
          examData.parts[currentPart]._id ||
          `part_${currentPart}`;

        // Kiểm tra xem group có thuộc phần hiện tại không
        if ((firstQuestion as any).__partId !== partId) return false;

        // Kiểm tra xem group có thuộc môn đã chọn không
        const childId = (firstQuestion as any).__childId;
        return selectedSubjectsForGroup.some(
          (subject: any) => subject._id === childId
        );
      });
    }

    //  Xử lý cho FULL_EXAM khi không phải nhóm chủ đề
    if (displayMode === "FULL_EXAM") return questionGroups;

    //  Xử lý cho PER_PART và SINGLE_QUESTION
    const partId =
      examData.parts[currentPart].id ||
      examData.parts[currentPart]._id ||
      `part_${currentPart}`;

    return questionGroups.filter((group) => {
      const firstQuestion = group.questions[0];
      return (firstQuestion as any).__partId === partId;
    });
  }, [
    displayMode,
    questionGroups,
    examData.parts,
    currentPart,
    selectedSubjectsForGroup,
  ]);

  const getAnsweredCount = useCallback(() => {
    return Object.entries(userAnswers).filter(([questionId, response]) => {
      const answer = response.answer;

      // Tìm câu hỏi tương ứng để kiểm tra loại
      const question = flatQuestions.find((q) => q._id === questionId);

      // Nếu là câu hỏi trắc nghiệm đúng sai nhiều đáp án
      if (
        question?.question_type === "TN_TRUE_FALSE" ||
        question?.question_type === "TRUE_FALSE_STATEMENTS"
      ) {
        if (!Array.isArray(answer)) return false;

        // Lấy số lượng đáp án cần thiết
        const expectedAnswerCount =
          question?.choices?.length || (question as any)?.num_ques || 0;

        // Chỉ tính hoàn thành khi đã chọn đủ số lượng đáp án
        return answer.length >= expectedAnswerCount;
      }

      //  Xử lý đặc biệt cho câu hỏi kéo thả (DRAG_DROP)
      if (
        question?.question_type === "DRAG_DROP" ||
        question?.type === "dragdrop"
      ) {
        if (!Array.isArray(answer)) return false;

        // Đếm số ô trống trong câu hỏi
        const questionContent =
          question?.rawHtml || question?.plainText || question?.question || "";
        const blankCount = (questionContent.match(/_{3,}/g) || []).length;

        // Chỉ tính hoàn thành khi tất cả các ô trống đã được điền
        // và không có ô nào bị null hoặc empty
        const filledCount = answer.filter(
          (item) => item !== null && item !== undefined && item !== ""
        ).length;
        return filledCount === blankCount && blankCount > 0;
      }

      //  Xử lý đặc biệt cho câu hỏi kéo thả (DRAG_DROP)
      if (
        question?.question_type === "DRAG_DROP" ||
        question?.type === "dragdrop"
      ) {
        if (!Array.isArray(answer)) return false;

        // Đếm số ô trống trong câu hỏi
        const questionContent =
          question?.rawHtml || question?.plainText || question?.question || "";
        const blankCount = (questionContent.match(/_{3,}/g) || []).length;

        // Chỉ tính hoàn thành khi tất cả các ô trống đã được điền
        // và không có ô nào bị null hoặc empty
        const filledCount = answer.filter(
          (item) => item !== null && item !== undefined && item !== ""
        ).length;
        return filledCount === blankCount && blankCount > 0;
      }

      // Với các loại câu hỏi khác, logic cũ
      if (Array.isArray(answer)) return answer.length > 0;
      return answer !== "" && answer != null;
    }).length;
  }, [userAnswers, flatQuestions]);

  const getCurrentPartProgress = useCallback(() => {
    // Luôn tính dựa trên danh sách câu hỏi đang được hiển thị (đã lọc theo nhóm chủ đề nếu có)
    const visibleGroups = getCurrentQuestions();

    if (displayMode === "FULL_EXAM") {
      //  Đếm tổng số câu hỏi từ tất cả groups (bao gồm mọi phần)
      const totalQuestions = visibleGroups.reduce((sum, group) => {
        if (group.type === "cluster") {
          // Cluster: đếm các câu hỏi con
          return sum + (group.questions.length - 1); // -1 vì câu đầu tiên là đề bài
        } else {
          // Single: đếm 1 câu
          return sum + 1;
        }
      }, 0);

      //  Đếm số câu đã trả lời (bao gồm mọi phần)
      const answeredCount = visibleGroups.reduce((sum, group) => {
        if (group.type === "cluster") {
          // Đếm các câu hỏi con đã HOÀN THÀNH theo luật nghiêm ngặt
          const subQuestions = group.questions.slice(1);
          return (
            sum +
            subQuestions.filter((question: any) => {
              const response = userAnswers[question._id]?.answer;
              // DRAG_DROP/FILL_BLANK: tất cả ô trống phải được điền
              if (
                question?.question_type === "DRAG_DROP" ||
                (question as any)?.type === "dragdrop" ||
                question?.question_type === "FILL_BLANK"
              ) {
                if (!Array.isArray(response)) return false;
                const questionContent =
                  question?.rawHtml ||
                  question?.plainText ||
                  question?.question ||
                  "";
                const blankCount = (questionContent.match(/_{3,}/g) || [])
                  .length;
                const filledCount = (response || []).filter(
                  (item: any) =>
                    item !== null && item !== undefined && item !== ""
                ).length;
                return blankCount > 0 && filledCount === blankCount;
              }
              // TRUE_FALSE nhiều ý: phải chọn đủ số ý
              if (
                question?.question_type === "TN_TRUE_FALSE" ||
                question?.question_type === "TRUE_FALSE_STATEMENTS"
              ) {
                if (!Array.isArray(response)) return false;
                const expectedAnswerCount =
                  question?.choices?.length || (question as any)?.num_ques || 0;
                return (
                  expectedAnswerCount > 0 &&
                  response.length >= expectedAnswerCount
                );
              }
              // TN_MULTI_CHOICE: nếu xác định được số đáp án mong đợi, yêu cầu đủ
              if (question?.question_type === "TN_MULTI_CHOICE") {
                if (!Array.isArray(response)) return false;
                const ca: any = (question as any)?.correctAnswers;
                let expected = 0;
                if (Array.isArray(ca)) {
                  expected = ca.length;
                  if (expected === 1) {
                    const single = ca[0] as any;
                    const raw =
                      (typeof single === "string" && single) ||
                      (typeof single === "object" &&
                        (single.value || single.label));
                    if (typeof raw === "string") {
                      const parts = raw
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean);
                      if (parts.length > 1) expected = parts.length;
                    }
                  }
                }
                return expected > 0
                  ? response.length >= expected
                  : response.length > 0;
              }
              // Mặc định: có dữ liệu được coi là hoàn thành
              if (Array.isArray(response)) return response.length > 0;
              return response !== "" && response != null;
            }).length
          );
        } else {
          // Đếm câu hỏi đơn đã HOÀN THÀNH theo luật nghiêm ngặt
          const question = group.questions[0] as any;
          const response = userAnswers[question._id]?.answer;
          if (
            question?.question_type === "DRAG_DROP" ||
            question?.type === "dragdrop" ||
            question?.question_type === "FILL_BLANK"
          ) {
            if (!Array.isArray(response)) return sum;
            const questionContent =
              question?.rawHtml ||
              question?.plainText ||
              question?.question ||
              "";
            const blankCount = (questionContent.match(/_{3,}/g) || []).length;
            const filledCount = (response || []).filter(
              (item: any) => item !== null && item !== undefined && item !== ""
            ).length;
            return sum + (blankCount > 0 && filledCount === blankCount ? 1 : 0);
          }
          if (
            question?.question_type === "TN_TRUE_FALSE" ||
            question?.question_type === "TRUE_FALSE_STATEMENTS"
          ) {
            if (!Array.isArray(response)) return sum;
            const expectedAnswerCount =
              question?.choices?.length || (question as any)?.num_ques || 0;
            return (
              sum +
              (expectedAnswerCount > 0 && response.length >= expectedAnswerCount
                ? 1
                : 0)
            );
          }
          if (question?.question_type === "TN_MULTI_CHOICE") {
            if (!Array.isArray(response)) return sum;
            const ca: any = (question as any)?.correctAnswers;
            let expected = 0;
            if (Array.isArray(ca)) {
              expected = ca.length;
              if (expected === 1) {
                const single = ca[0] as any;
                const raw =
                  (typeof single === "string" && single) ||
                  (typeof single === "object" &&
                    (single.value || single.label));
                if (typeof raw === "string") {
                  const parts = raw
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);
                  if (parts.length > 1) expected = parts.length;
                }
              }
            }
            return (
              sum +
              (expected > 0
                ? response.length >= expected
                  ? 1
                  : 0
                : response.length > 0
                ? 1
                : 0)
            );
          }
          if (Array.isArray(response))
            return sum + (response.length > 0 ? 1 : 0);
          return sum + (response !== "" && response != null ? 1 : 0);
        }
      }, 0);

      return {
        answeredCount,
        totalQuestions,
      };
    }

    const currentPartGroups = visibleGroups.filter((group) => {
      const firstQuestion = group.questions[0];
      const partId =
        examData.parts[currentPart]?.id ||
        examData.parts[currentPart]?._id ||
        `part_${currentPart}`;
      return (firstQuestion as any).__partId === partId;
    });

    // Đếm số câu hỏi thực tế trong phần hiện tại
    const totalQuestionsInPart = currentPartGroups.reduce((sum, group) => {
      if (group.type === "cluster") {
        return sum + (group.questions.length - 1); // -1 vì câu đầu tiên là đề bài
      } else {
        return sum + 1;
      }
    }, 0);

    // Đếm số câu đã trả lời trong phần hiện tại
    const allQuestionsInPart: any[] = [];
    currentPartGroups.forEach((group) => {
      if (group.type === "cluster") {
        // Thêm các câu hỏi con (bỏ qua câu đề bài)
        allQuestionsInPart.push(...group.questions.slice(1));
      } else {
        // Thêm câu hỏi đơn
        allQuestionsInPart.push(group.questions[0]);
      }
    });

    const answeredInCurrentPart = allQuestionsInPart.filter((question: any) => {
      const response = userAnswers[question._id];
      if (!response) return false;
      const answer = response.answer;

      // Nếu là câu hỏi trắc nghiệm đúng sai nhiều đáp án
      if (
        question?.question_type === "TN_TRUE_FALSE" ||
        question?.question_type === "TRUE_FALSE_STATEMENTS"
      ) {
        if (!Array.isArray(answer)) return false;
        const expectedAnswerCount =
          question?.choices?.length || (question as any)?.num_ques || 0;
        return expectedAnswerCount > 0 && answer.length >= expectedAnswerCount;
      }

      //  Xử lý đặc biệt cho câu hỏi kéo thả (DRAG_DROP)
      if (
        question?.question_type === "DRAG_DROP" ||
        question?.type === "dragdrop"
      ) {
        if (!Array.isArray(answer)) return false;
        const questionContent =
          question?.rawHtml || question?.plainText || question?.question || "";
        const blankCount = (questionContent.match(/_{3,}/g) || []).length;
        const filledCount = answer.filter(
          (item) => item !== null && item !== undefined && item !== ""
        ).length;
        return blankCount > 0 && filledCount === blankCount;
      }

      // FILL_BLANK yêu cầu điền đầy đủ
      if (question?.question_type === "FILL_BLANK") {
        if (!Array.isArray(answer)) return false;
        const questionContent =
          question?.rawHtml || question?.plainText || question?.question || "";
        const blankCount = (questionContent.match(/_{3,}/g) || []).length;
        const filledCount = answer.filter(
          (item) => item !== null && item !== undefined && item !== ""
        ).length;
        return blankCount > 0 && filledCount === blankCount;
      }

      // TN_MULTI_CHOICE: yêu cầu chọn đủ số đáp án kỳ vọng nếu xác định được
      if (question?.question_type === "TN_MULTI_CHOICE") {
        if (!Array.isArray(answer)) return false;
        const ca: any = (question as any)?.correctAnswers;
        let expected = 0;
        if (Array.isArray(ca)) {
          expected = ca.length;
          if (expected === 1) {
            const single = ca[0] as any;
            const raw =
              (typeof single === "string" && single) ||
              (typeof single === "object" && (single.value || single.label));
            if (typeof raw === "string") {
              const parts = raw
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
              if (parts.length > 1) expected = parts.length;
            }
          }
        }
        return expected > 0 ? answer.length >= expected : answer.length > 0;
      }

      // Với các loại câu hỏi khác, logic cũ
      if (Array.isArray(answer)) return answer.length > 0;
      return answer !== "" && answer != null;
    }).length;

    return {
      answeredCount: answeredInCurrentPart,
      totalQuestions: totalQuestionsInPart,
    };
  }, [
    displayMode,
    questionGroups,
    examData.parts,
    currentPart,
    userAnswers,
    getAnsweredCount,
  ]);

  // Hàm trợ giúp để lấy thống kê của phần hiện tại
  const getCurrentPartStats = useCallback(() => {
    // Đồng bộ với tiến độ: dựa trên nhóm câu hỏi thực tế đang hiển thị
    const visibleGroups = getCurrentQuestions();
    if (displayMode === "FULL_EXAM") {
      //  Đếm tổng số câu hỏi từ tất cả groups (bao gồm mọi phần)
      const totalQuestions = visibleGroups.reduce((sum, group) => {
        if (group.type === "cluster") {
          return sum + (group.questions.length - 1);
        } else {
          return sum + 1;
        }
      }, 0);

      //  Đếm số câu đã trả lời (bao gồm mọi phần)
      const answeredCount = visibleGroups.reduce((sum, group) => {
        if (group.type === "cluster") {
          // Đếm các câu hỏi con đã trả lời
          const subQuestions = group.questions.slice(1);
          return (
            sum +
            subQuestions.filter((question: any) => {
              const response = userAnswers[question._id]?.answer;
              if (
                question?.question_type === "DRAG_DROP" ||
                (question as any)?.type === "dragdrop"
              ) {
                if (!Array.isArray(response)) return false;
                const filledCount = response.filter(
                  (item: any) =>
                    item !== null && item !== undefined && item !== ""
                ).length;
                return filledCount > 0;
              }
              if (
                question?.question_type === "TN_TRUE_FALSE" ||
                question?.question_type === "TRUE_FALSE_STATEMENTS"
              ) {
                return Array.isArray(response) && response.length > 0;
              }
              if (Array.isArray(response)) return response.length > 0;
              return response !== "" && response != null;
            }).length
          );
        } else {
          // Đếm câu hỏi đơn đã trả lời
          const question = group.questions[0] as any;
          const response = userAnswers[question._id]?.answer;
          if (
            question?.question_type === "DRAG_DROP" ||
            question?.type === "dragdrop"
          ) {
            if (!Array.isArray(response)) return sum;
            const filledCount = response.filter(
              (item: any) => item !== null && item !== undefined && item !== ""
            ).length;
            return sum + (filledCount > 0 ? 1 : 0);
          }
          if (
            question?.question_type === "TN_TRUE_FALSE" ||
            question?.question_type === "TRUE_FALSE_STATEMENTS"
          ) {
            return (
              sum + (Array.isArray(response) && response.length > 0 ? 1 : 0)
            );
          }
          if (Array.isArray(response))
            return sum + (response.length > 0 ? 1 : 0);
          return sum + (response !== "" && response != null ? 1 : 0);
        }
      }, 0);

      return {
        answeredCount,
        totalQuestions,
      };
    }

    const currentPartGroups = visibleGroups.filter((group) => {
      const firstQuestion = group.questions[0];
      const partId =
        examData.parts?.[currentPart]?.id ||
        examData.parts?.[currentPart]?._id ||
        `part_${currentPart}`;
      return (firstQuestion as any).__partId === partId;
    });

    const totalQuestionsInPart = currentPartGroups.reduce((sum, group) => {
      if (group.type === "cluster") {
        return sum + (group.questions.length - 1);
      } else {
        return sum + 1;
      }
    }, 0);

    const allQuestionsInPart: any[] = [];
    currentPartGroups.forEach((group) => {
      if (group.type === "cluster") {
        allQuestionsInPart.push(...group.questions.slice(1));
      } else {
        allQuestionsInPart.push(group.questions[0]);
      }
    });

    const answeredInCurrentPart = allQuestionsInPart.filter((question: any) => {
      const response = userAnswers[question._id];
      if (!response) return false;
      const answer = response.answer;

      // Nếu là câu hỏi trắc nghiệm đúng sai nhiều đáp án
      if (
        question?.question_type === "TN_TRUE_FALSE" ||
        question?.question_type === "TRUE_FALSE_STATEMENTS"
      ) {
        if (!Array.isArray(answer)) return false;

        // Lấy số lượng đáp án cần thiết
        const expectedAnswerCount =
          question?.choices?.length || (question as any)?.num_ques || 0;

        // Chỉ tính hoàn thành khi đã chọn đủ số lượng đáp án
        return answer.length >= expectedAnswerCount;
      }

      //  Xử lý đặc biệt cho câu hỏi kéo thả (DRAG_DROP)
      if (
        question?.question_type === "DRAG_DROP" ||
        question?.type === "dragdrop"
      ) {
        if (!Array.isArray(answer)) return false;

        // Đếm số ô trống trong câu hỏi
        const questionContent =
          question?.rawHtml || question?.plainText || question?.question || "";
        const blankCount = (questionContent.match(/_{3,}/g) || []).length;

        // Chỉ tính hoàn thành khi tất cả các ô trống đã được điền
        // và không có ô nào bị null hoặc empty
        const filledCount = answer.filter(
          (item) => item !== null && item !== undefined && item !== ""
        ).length;
        return filledCount === blankCount && blankCount > 0;
      }

      // Với các loại câu hỏi khác, logic cũ
      if (Array.isArray(answer)) return answer.length > 0;
      return answer !== "" && answer != null;
    }).length;

    return {
      answeredCount: answeredInCurrentPart,
      totalQuestions: totalQuestionsInPart,
    };
  }, [
    displayMode,
    questionGroups,
    examData.parts,
    currentPart,
    userAnswers,
    getAnsweredCount,
  ]);

  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }, []);

  // Hiển thị nút gắn cờ
  const renderFlagButton = useCallback(
    (questionId: string) => (
      <button
        onClick={() => toggleFlagQuestion(questionId)}
        className={`absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-full transition-colors shadow hover:brightness-95 ${
          flaggedQuestions.has(questionId) ? "bg-yellow-500" : "bg-white"
        }`}
        title={
          flaggedQuestions.has(questionId) ? "Bỏ gắn cờ" : "Gắn cờ câu hỏi"
        }
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          className="transition-transform hover:scale-110"
        >
          <path
            d="M5 2v20l7-5 7 5V2H5z"
            fill={flaggedQuestions.has(questionId) ? "#FFFFFF" : "#FACC15"}
            stroke="none"
          />
        </svg>
      </button>
    ),
    [flaggedQuestions, toggleFlagQuestion]
  );

  //  Render một question group (cluster hoặc single) - FIXED: Stable keys + Error handling
  const renderQuestionGroup = useCallback(
    (
      group: { type: "single" | "cluster"; questions: ExamQuestion[] },
      groupIndex: number
    ) => {
      // Null checks để tránh lỗi DOM
      if (!group || !group.questions || group.questions.length === 0) {
        console.warn("Invalid group data:", group);
        return null;
      }

      // Tạo stable key dựa trên _id của câu hỏi đầu tiên
      const stableKey = group.questions[0]?._id || `group-${groupIndex}`;

      try {
        if (group.type === "cluster") {
          // Đảm bảo luôn truyền cả câu hỏi chính và các câu hỏi con
          return (
            <div
              key={stableKey}
              id={`question-${stableKey}`}
              className="relative"
            >
              <ClusterQuestion
                responses={userAnswers}
                questions={group.questions}
                isTimeEnd={isTimeEnd}
                handleAnswerChange={handleAnswerChange}
                flaggedQuestions={flaggedQuestions}
                onToggleFlag={toggleFlagQuestion}
                hideLabelLetters={hideLabelLetters}
              />
            </div>
          );
        } else {
          const question = group.questions[0];
          return (
            <div
              key={stableKey}
              id={`question-${stableKey}`}
              className="relative"
            >
              <Question
                responses={userAnswers}
                question={question}
                isTimeEnd={isTimeEnd}
                handleAnswerChange={handleAnswerChange}
                flaggedQuestions={flaggedQuestions}
                onToggleFlag={toggleFlagQuestion}
                hideLabelLetters={hideLabelLetters}
              />
            </div>
          );
        }
      } catch (error) {
        console.error("Error rendering question group:", error, group);
        return (
          <div
            key={stableKey}
            className="relative p-4 bg-red-50 border border-red-200 rounded"
          >
            <p className="text-red-600">
              Lỗi hiển thị câu hỏi. Vui lòng tải lại trang.
            </p>
          </div>
        );
      }
    },
    [
      userAnswers,
      isTimeEnd,
      handleAnswerChange,
      flaggedQuestions,
      toggleFlagQuestion,
      hideLabelLetters,
    ]
  );

  // Màn hình bắt đầu
  if (!isExamStarted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {examData.name}
            </h2>
            <p className="text-gray-600 mb-6">
              {examData.subject?.name || "Không có môn"} - {examData.time} phút
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Tổng số câu hỏi:{" "}
              {questionGroups.reduce((sum, group) => {
                if (group.type === "cluster") {
                  return sum + (group.questions.length - 1);
                } else {
                  return sum + 1;
                }
              }, 0)}
            </p>
            <button
              onClick={() => {
                setIsExamStarted(true);
                // Đặt lại state cảnh báo thời gian khi bắt đầu bài thi
                setTimeWarning10MinShown(false);
                setTimeWarning5MinShown(false);
                setShowTimeWarning(false);
                setTimeWarningMessage("");
                setTimeWarningType(null);
              }}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Bắt đầu làm bài
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestions = getCurrentQuestions();
  const progress = getCurrentPartProgress();

  // Không còn hiển thị result và explanation screen ở đây nữa
  // Chúng đã được tách ra thành các route riêng

  // Hiển thị màn hình thông tin phần nếu cần
  if (showPartInfo && pendingPart !== null) {
    //  Xử lý nhóm chủ đề ở phần đầu tiên cho tất cả displayMode
    const isFirstPartSubjectGroup =
      pendingPart === 0 && examData.parts?.[0]?.type === "NHOM_CHU_DE";

    if (displayMode !== "FULL_EXAM" || isFirstPartSubjectGroup) {
      return (
        <PartInfoScreen
          examData={examData}
          currentPart={pendingPart}
          allQuestions={allQuestions}
          onStartPart={handleStartAfterSelection}
          selectedSubjects={selectedSubjectsForGroup}
          onSubjectSelection={handleSubjectSelection}
        />
      );
    }
  }

  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      {/* Component cảnh báo thời gian */}
      {showTimeWarning && (
        <div className="pointer-events-none fixed right-4 top-4 z-[9999]">
          <div
            role="alert"
            aria-live="assertive"
            className={
              `max-w-md rounded-2xl border-l-4 px-5 py-4 shadow-2xl ring-1 ring-black/5 transition-transform ` +
              (timeWarningType === "10"
                ? "border-yellow-600 bg-yellow-100 "
                : "border-red-700 bg-gradient-to-r from-red-600 to-red-700 text-white ") +
              (timeWarningType === "5" ? "animate-pulse " : "")
            }
          >
            <div className="flex items-center space-x-3">
              <div
                className={
                  `rounded-full p-1 text-2xl ` +
                  (timeWarningType === "10"
                    ? "bg-black/5 text-yellow-800"
                    : "bg-white/20 text-white")
                }
              >
                ⏰
              </div>
              <div>
                <h3
                  className={
                    `text-base font-semibold tracking-wide ` +
                    (timeWarningType === "10"
                      ? "text-yellow-900"
                      : "text-white")
                  }
                >
                  Thông báo thời gian
                </h3>
                <p
                  className={
                    `mt-0.5 text-sm leading-relaxed ` +
                    (timeWarningType === "10"
                      ? "text-yellow-800"
                      : "text-white")
                  }
                >
                  {timeWarningMessage}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/*  Header: ẩn trên tất cả thiết bị isMobile (bao gồm iPad), chỉ hiện desktop */}
      {!isMobile && (
        <ExamHeader
          examName={examData.name}
          currentPart={currentPart}
          examParts={examData.parts || []}
          displayMode={displayMode}
          showSidebar={showSidebar}
          onBackClick={() => setShowCheatWarning(true)}
          onLogoClick={handleLogoClick}
        />
      )}

      {/* Mobile/iPad hiển thị thanh đồng hồ giống ảnh, luôn hiện khi isMobile */}
      {isMobile && (
        <div className="px-4 mt-3">
          <div className="mx-auto max-w-md">
            <div className="h-10 w-full rounded-xl bg-[#EAF2FF] flex items-center justify-center gap-2">
              <img
                src={encodeURI("/icon/đếm ngược.svg")}
                alt="Đồng hồ"
                className="h-4 w-4"
              />
              <span className="text-sm font-semibold text-[#1E3A8A]">
                {formatTime(usePartTimer ? partTimeRemaining : timeRemaining)}
              </span>
            </div>
          </div>
        </div>
      )}

      <div
        className="w-full px-0 flex flex-col"
        style={{
          height: isMobile
            ? !showSidebar
              ? "calc(100vh - 44px - 12px)"
              : "100vh"
            : "calc(100vh - 64px)",
        }}
      >
        <div
          className={`relative flex w-full flex-col justify-between flex-1 2xl:flex-row`}
        >
          {/* Nội dung chính */}
          <div
            className={`order-2 w-full transition-all duration-300 ${
              showSidebar
                ? "2xl:order-1 2xl:w-[calc(100%-402px)]"
                : "2xl:order-1 2xl:w-full"
            }`}
            style={{
              height: isMobile
                ? !showSidebar
                  ? "calc(100vh - 44px - 80px)"
                  : "calc(100vh - 80px)"
                : "calc(100vh - 64px - 80px)",
              minHeight: "400px",
            }}
          >
            <div className="bg-white rounded-none border-0 h-full">
              <div
                className="h-full overflow-y-auto overflow-x-hidden p-3 pb-28 lg:pb-6 exam-content-scroll"
                style={{
                  scrollBehavior: "smooth",
                  maxHeight: "100%", // Đảm bảo không vượt quá container
                  overscrollBehavior: "contain", // Thay vì overscroll-contain class
                }}
              >
                {/*  Chế độ câu hỏi đơn  để sử dụng currentQuestionId - FIXED: Stable rendering */}
                {displayMode === "SINGLE_QUESTION" && (
                  <div className="space-y-6">
                    {(() => {
                      // Tìm group chứa câu hỏi hiện tại dựa trên currentQuestionId
                      if (currentQuestionId) {
                        const groupIndex = questionGroups.findIndex((g) =>
                          g.questions.some((q) => q._id === currentQuestionId)
                        );
                        if (groupIndex !== -1) {
                          const group = questionGroups[groupIndex];
                          //  Kiểm tra xem câu hỏi có thuộc phần hiện tại không
                          const firstQuestion = group.questions[0];
                          const currentPartId =
                            examData.parts?.[currentPart]?.id ||
                            examData.parts?.[currentPart]?._id ||
                            `part_${currentPart}`;
                          const questionBelongsToCurrentPart =
                            (firstQuestion as any).__partId === currentPartId;

                          if (questionBelongsToCurrentPart) {
                            return renderQuestionGroup(group, groupIndex);
                          }
                          // Nếu không thuộc phần hiện tại, fallback về câu đầu của phần mới
                        }
                      }

                      // Fallback: sử dụng câu đầu tiên của phần hiện tại
                      const group = currentQuestions[0] || questionGroups[0];
                      return group ? renderQuestionGroup(group, 0) : null;
                    })()}
                  </div>
                )}

                {/*  Chế độ theo phần  để sử dụng questionGroups - FIXED: Stable keys */}
                {displayMode === "PER_PART" && (
                  <div className="space-y-6">
                    {currentQuestions.length > 0 ? (
                      currentQuestions.map((group, index) => {
                        // Tìm groupIndex thực tế trong questionGroups để tránh key conflicts
                        const actualGroupIndex = questionGroups.findIndex(
                          (g) => g.questions[0]._id === group.questions[0]._id
                        );
                        const safeGroupIndex =
                          actualGroupIndex !== -1 ? actualGroupIndex : index;
                        // Sử dụng stable key dựa trên _id thay vì index
                        const stableKey =
                          group.questions[0]?._id || `part-group-${index}`;
                        return (
                          <div key={stableKey}>
                            {renderQuestionGroup(group, safeGroupIndex)}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-red-500 text-6xl mb-4">⚠️</div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          Không có câu hỏi nào trong phần này
                        </h3>
                        <p className="text-gray-500 mb-4">
                          Có thể do cấu trúc dữ liệu đề thi không đúng hoặc chưa
                          được tải đầy đủ.
                        </p>
                        <div className="text-sm text-gray-400">
                          <p>Debug info:</p>
                          <p>• Tổng nhóm câu hỏi: {questionGroups.length}</p>
                          <p>
                            • Nhóm câu hỏi phần hiện tại:{" "}
                            {currentQuestions.length}
                          </p>
                          <p>• Phần hiện tại: {currentPart}</p>
                          <p>• Exam ID: {examData._id || examData.id}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/*  Chế độ toàn bộ bài thi */}
                {displayMode === "FULL_EXAM" && (
                  <div className="space-y-8">
                    {questionGroups.length > 0 ? (
                      examData.parts && examData.parts.length > 0 ? (
                        (() => {
                          //  Nếu phần hiện tại là NHOM_CHU_DE thì chỉ hiển thị duy nhất phần đó
                          const currentIsSubjectGroup =
                            examData.parts?.[currentPart]?.type ===
                            "NHOM_CHU_DE";

                          return examData.parts.map(
                            (part: any, partIndex: number) => {
                              if (
                                currentIsSubjectGroup &&
                                partIndex !== currentPart
                              ) {
                                return null;
                              }
                              // Lọc các groups thuộc phần này
                              const partGroups = questionGroups.filter(
                                (group) => {
                                  const firstQuestion = group.questions[0];
                                  const partId =
                                    part.id || part._id || `part_${partIndex}`;
                                  const matches =
                                    (firstQuestion as any).__partId === partId;
                                  return matches;
                                }
                              );

                              //  Với NHOM_CHU_DE: tạo thống kê theo môn (childName)
                              const subjectStatsMap: Record<
                                string,
                                {
                                  normalQuestions: number;
                                  testQuestions: number;
                                }
                              > = {};
                              const currentPartData =
                                examData.parts?.[partIndex];
                              const isSubjectGroupType =
                                currentPartData?.type === "NHOM_CHU_DE";
                              if (isSubjectGroupType) {
                                partGroups.forEach((grp) => {
                                  const fq: any = grp.questions[0];
                                  const subjectName =
                                    fq?.__childName || fq?.__subpartName || "";
                                  //  Đếm test questions và normal questions: với cluster, bỏ qua câu hỏi đầu tiên (header)
                                  const questionsToCheck =
                                    grp.type === "cluster"
                                      ? grp.questions.slice(1) // Bỏ qua header
                                      : grp.questions;
                                  const testCount = questionsToCheck.filter(
                                    (q: any) => q.isTestQuestion === true
                                  ).length;
                                  const normalCount =
                                    questionsToCheck.length - testCount;
                                  if (!subjectStatsMap[subjectName]) {
                                    subjectStatsMap[subjectName] = {
                                      normalQuestions: 0,
                                      testQuestions: 0,
                                    };
                                  }
                                  subjectStatsMap[
                                    subjectName
                                  ].normalQuestions += normalCount;
                                  subjectStatsMap[subjectName].testQuestions +=
                                    testCount;
                                });
                              }

                              return (
                                <div key={partIndex} className="space-y-6">
                                  {/* 🎯 TIÊU ĐỀ PHẦN CHÍNH */}
                                  <div className="w-full py-4 px-3">
                                    <h2 className="text-center text-lg font-bold text-blue-600 uppercase tracking-wide mb-3">
                                      {part.name}
                                    </h2>
                                    {/*  Đường gạch xanh dương đậm cho part chính */}
                                    <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
                                  </div>

                                  {/* Render các groups trong phần này */}
                                  {partGroups.map((group, localIndex) => {
                                    const actualGroupIndex =
                                      questionGroups.findIndex(
                                        (g) =>
                                          g.questions[0]._id ===
                                          group.questions[0]._id
                                      );
                                    const safeGroupIndex =
                                      actualGroupIndex !== -1
                                        ? actualGroupIndex
                                        : localIndex;
                                    const stableKey = `${partIndex}-${
                                      group.questions[0]?._id || localIndex
                                    }`;

                                    // Lấy subpart name từ câu hỏi đầu tiên trong group
                                    const firstQuestion = group
                                      .questions[0] as any;
                                    const subpartName =
                                      firstQuestion?.__subpartName;

                                    //  Đối với nhóm chủ đề, sử dụng tên môn học thay vì subpartName
                                    const displayName = isSubjectGroupType
                                      ? firstQuestion?.__childName ||
                                        subpartName
                                      : subpartName;

                                    // Kiểm tra xem có cần hiển thị subpart header không
                                    const prevGroup =
                                      localIndex > 0
                                        ? partGroups[localIndex - 1]
                                        : null;
                                    const prevDisplayName = prevGroup
                                      ?.questions[0]
                                      ? (() => {
                                          const prevFirstQuestion = prevGroup
                                            .questions[0] as any;
                                          return isSubjectGroupType
                                            ? prevFirstQuestion?.__childName ||
                                                prevFirstQuestion?.__subpartName
                                            : prevFirstQuestion?.__subpartName;
                                        })()
                                      : null;
                                    //  Đối với NHOM_CHU_DE: luôn hiển thị header khi đổi tên môn (không cần điều kiện __isMain)
                                    //  Đối với các phần khác: giữ nguyên logic cũ
                                    const showSubpartHeader = isSubjectGroupType
                                      ? displayName &&
                                        displayName !== prevDisplayName
                                      : displayName &&
                                        displayName !== prevDisplayName &&
                                        !firstQuestion?.__isMain;

                                    return (
                                      <div key={stableKey}>
                                        {showSubpartHeader && (
                                          <div className="w-full mb-6">
                                            {/*  Tên subpart màu xanh dương */}
                                            <h3 className="text-center text-base font-semibold text-blue-600 mb-3">
                                              {displayName}
                                              {isSubjectGroupType &&
                                                displayName &&
                                                (() => {
                                                  const stats = subjectStatsMap[
                                                    displayName
                                                  ] || {
                                                    normalQuestions: 0,
                                                    testQuestions: 0,
                                                  };
                                                  // return (
                                                  //   <span className="text-sm font-normal text-blue-600 ml-2">
                                                  //     (có {stats.normalQuestions}{" "}
                                                  //     câu hỏi chính thức và{" "}
                                                  //     {stats.testQuestions} câu
                                                  //     hỏi thử nghiệm)
                                                  //   </span>
                                                  // );
                                                })()}
                                            </h3>
                                          </div>
                                        )}
                                        {renderQuestionGroup(
                                          group,
                                          safeGroupIndex
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            }
                          );
                        })()
                      ) : (
                        // Fallback
                        questionGroups.map((group, index) => {
                          const stableKey =
                            group.questions[0]?._id || `fallback-${index}`;
                          return (
                            <div key={stableKey}>
                              {renderQuestionGroup(group, index)}
                            </div>
                          );
                        })
                      )
                    ) : (
                      // Fallback - hiển thị tất cả câu hỏi nếu không có questionGroups
                      <div className="space-y-6">
                        <div className="text-center py-4">
                          <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            Hiển thị tất cả câu hỏi
                          </h3>
                          <p className="text-sm text-gray-500">
                            Không thể phân nhóm theo phần, hiển thị tất cả câu
                            hỏi
                          </p>
                        </div>
                        {questionGroups.map((group, index) => {
                          const stableKey =
                            group.questions[0]?._id || `all-${index}`;
                          return (
                            <div key={stableKey}>
                              {renderQuestionGroup(group, index)}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/*  Cập nhật sidebar với animation và mobile overlay */}
          {showSidebar && (
            <>
              {/* Desktop Sidebar với animation */}
              <div className="hidden 2xl:block order-2 w-full 2xl:w-[402px] animate-in slide-in-from-right duration-300">
                <div className="exam-sidebar-container sticky top-[100px] col-span-1 flex w-full flex-col">
                  <ExamSidebar
                    timeRemaining={
                      usePartTimer ? partTimeRemaining : timeRemaining
                    }
                    answeredCount={progress.answeredCount}
                    totalQuestions={progress.totalQuestions}
                    questions={flatQuestions}
                    currentQuestionId={currentQuestionId || undefined}
                    userAnswers={userAnswers}
                    flaggedQuestions={flaggedQuestions}
                    currentQuestion={currentQuestion}
                    currentPart={currentPart}
                    examParts={examData.parts || []}
                    onNavigateToQuestion={navigateToQuestion}
                    onToggleFlag={toggleFlagQuestion}
                    onStopExam={() => setShowStopModal(true)}
                    onSubmitExam={() => handleShowSubmitModal("exam")}
                    onSubmitPart={() => handleShowSubmitModal("part")}
                    isTimeEnd={isTimeEnd}
                    displayMode={displayMode}
                    completedParts={completedParts}
                  />
                </div>
              </div>

              {/* Mobile Sidebar Overlay với animation */}
              <div className="2xl:hidden fixed inset-0 z-50 bg-black bg-opacity-50 animate-in fade-in duration-300">
                <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl animate-in slide-in-from-right duration-300">
                  <div className="flex flex-col h-full">
                    {/* Header với nút đóng */}
                    <div className="mobile-sidebar-header">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-blue-800">
                          Menu nộp bài
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

                    {/* Content với scroll được cải thiện */}
                    <div className="mobile-sidebar-body">
                      <ExamSidebar
                        timeRemaining={
                          usePartTimer ? partTimeRemaining : timeRemaining
                        }
                        answeredCount={progress.answeredCount}
                        totalQuestions={progress.totalQuestions}
                        questions={flatQuestions}
                        currentQuestionId={currentQuestionId || undefined}
                        userAnswers={userAnswers}
                        flaggedQuestions={flaggedQuestions}
                        currentQuestion={currentQuestion}
                        currentPart={currentPart}
                        examParts={examData.parts || []}
                        onNavigateToQuestion={navigateToQuestion}
                        onToggleFlag={toggleFlagQuestion}
                        onStopExam={() => setShowStopModal(true)}
                        onSubmitExam={() => handleShowSubmitModal("exam")}
                        onSubmitPart={() => handleShowSubmitModal("part")}
                        isTimeEnd={isTimeEnd}
                        displayMode={displayMode}
                        completedParts={completedParts}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/*  Thanh điều hướng dưới với 3 nút trên cùng một hàng */}
        <div className="exam-bottom-navigation w-full py-1 lg:py-0">
          <div className="flex items-center justify-between w-full">
            {/* Nhóm nút điều hướng câu hỏi - chỉ hiển thị khi không phải full exam */}
            {!isFullExamRendering ? (
              <div className="flex items-center gap-2 lg:gap-3">
                <button
                  onClick={() => {
                    //  FIXED: Sử dụng logic navigation giống như phím mũi tên
                    let allowedIndices: number[] = [];

                    if (displayMode === "FULL_EXAM") {
                      // Toàn bộ bài - tất cả câu hỏi
                      allowedIndices = flatQuestions.map((_, idx) => idx);
                    } else {
                      // Theo phần - chỉ câu hỏi trong phần hiện tại
                      const partId =
                        examData.parts?.[currentPart]?.id ||
                        examData.parts?.[currentPart]?._id ||
                        `part_${currentPart}`;

                      allowedIndices = flatQuestions
                        .map((question, idx) => {
                          return (question as any).__partId === partId
                            ? idx
                            : -1;
                        })
                        .filter((i: number) => i !== -1);
                    }

                    // Tìm vị trí hiện tại trong flatQuestions dựa trên currentQuestionId
                    const currentFlatIndex = flatQuestions.findIndex(
                      (q) => q._id === currentQuestionId
                    );

                    if (currentFlatIndex === -1) {
                      // Fallback: sử dụng câu hỏi đầu tiên của group hiện tại
                      const currentGroup = questionGroups[currentQuestion];
                      if (currentGroup) {
                        const firstQuestionInGroup =
                          currentGroup.type === "cluster"
                            ? currentGroup.questions[1] // Câu hỏi con đầu tiên
                            : currentGroup.questions[0]; // Câu hỏi đơn

                        const fallbackIndex = flatQuestions.findIndex(
                          (q) => q._id === firstQuestionInGroup?._id
                        );

                        if (fallbackIndex !== -1) {
                          const pos = allowedIndices.indexOf(fallbackIndex);
                          if (pos !== -1) {
                            navigateToQuestion(allowedIndices[pos - 1]);
                          }
                        }
                      }
                      return;
                    }

                    const pos = allowedIndices.indexOf(currentFlatIndex);
                    if (pos > 0) {
                      navigateToQuestion(allowedIndices[pos - 1]);
                    }
                  }}
                  disabled={(() => {
                    //  FIXED: Logic disable giống như phím mũi tên
                    let allowedIndices: number[] = [];

                    if (displayMode === "FULL_EXAM") {
                      allowedIndices = flatQuestions.map((_, idx) => idx);
                    } else {
                      const partId =
                        examData.parts?.[currentPart]?.id ||
                        examData.parts?.[currentPart]?._id ||
                        `part_${currentPart}`;

                      allowedIndices = flatQuestions
                        .map((question, idx) => {
                          return (question as any).__partId === partId
                            ? idx
                            : -1;
                        })
                        .filter((i: number) => i !== -1);
                    }

                    const currentFlatIndex = flatQuestions.findIndex(
                      (q) => q._id === currentQuestionId
                    );

                    if (currentFlatIndex === -1) {
                      return true; // Disable nếu không tìm thấy
                    }

                    const pos = allowedIndices.indexOf(currentFlatIndex);
                    return pos <= 0;
                  })()}
                  className="px-3 py-2 lg:px-5 lg:py-2.5 border border-blue-300 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed text-blue-600 font-medium text-sm lg:text-base"
                >
                  <span className="inline-flex items-center gap-1.5 lg:gap-3">
                    {/* Icon: chevron-left với thanh dọc nhỏ */}
                    <svg
                      className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M15 18l-6-6 6-6" />
                      <path d="M8 5v14" />
                    </svg>
                    <span>CÂU TRƯỚC</span>
                  </span>
                </button>
                <button
                  onClick={() => {
                    //  FIXED: Sử dụng logic navigation giống như phím mũi tên
                    let allowedIndices: number[] = [];

                    if (displayMode === "FULL_EXAM") {
                      // Toàn bộ bài - tất cả câu hỏi
                      allowedIndices = flatQuestions.map((_, idx) => idx);
                    } else {
                      // Theo phần - chỉ câu hỏi trong phần hiện tại
                      const partId =
                        examData.parts?.[currentPart]?.id ||
                        examData.parts?.[currentPart]?._id ||
                        `part_${currentPart}`;

                      allowedIndices = flatQuestions
                        .map((question, idx) => {
                          return (question as any).__partId === partId
                            ? idx
                            : -1;
                        })
                        .filter((i: number) => i !== -1);
                    }

                    // Tìm vị trí hiện tại trong flatQuestions dựa trên currentQuestionId
                    const currentFlatIndex = flatQuestions.findIndex(
                      (q) => q._id === currentQuestionId
                    );

                    if (currentFlatIndex === -1) {
                      // Fallback: sử dụng câu hỏi đầu tiên của group hiện tại
                      const currentGroup = questionGroups[currentQuestion];
                      if (currentGroup) {
                        const firstQuestionInGroup =
                          currentGroup.type === "cluster"
                            ? currentGroup.questions[1] // Câu hỏi con đầu tiên
                            : currentGroup.questions[0]; // Câu hỏi đơn

                        const fallbackIndex = flatQuestions.findIndex(
                          (q) => q._id === firstQuestionInGroup?._id
                        );

                        if (fallbackIndex !== -1) {
                          const pos = allowedIndices.indexOf(fallbackIndex);
                          if (pos < allowedIndices.length - 1) {
                            navigateToQuestion(allowedIndices[pos + 1]);
                          }
                        }
                      }
                      return;
                    }

                    const pos = allowedIndices.indexOf(currentFlatIndex);
                    if (pos < allowedIndices.length - 1) {
                      navigateToQuestion(allowedIndices[pos + 1]);
                    }
                  }}
                  disabled={(() => {
                    //  FIXED: Logic disable giống như phím mũi tên
                    let allowedIndices: number[] = [];

                    if (displayMode === "FULL_EXAM") {
                      allowedIndices = flatQuestions.map((_, idx) => idx);
                    } else {
                      const partId =
                        examData.parts?.[currentPart]?.id ||
                        examData.parts?.[currentPart]?._id ||
                        `part_${currentPart}`;

                      allowedIndices = flatQuestions
                        .map((question, idx) => {
                          return (question as any).__partId === partId
                            ? idx
                            : -1;
                        })
                        .filter((i: number) => i !== -1);
                    }

                    const currentFlatIndex = flatQuestions.findIndex(
                      (q) => q._id === currentQuestionId
                    );

                    if (currentFlatIndex === -1) {
                      return true; // Disable nếu không tìm thấy
                    }

                    const pos = allowedIndices.indexOf(currentFlatIndex);
                    return pos >= allowedIndices.length - 1;
                  })()}
                  className="px-3 py-2 lg:px-5 lg:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm lg:text-base"
                >
                  <span className="inline-flex items-center gap-1.5 lg:gap-3">
                    <span>CÂU TIẾP</span>
                    {/* Icon: chevron-right với thanh dọc nhỏ */}
                    <svg
                      className="h-4 w-4 lg:h-5 lg:w-5 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M9 6l6 6-6 6" />
                      <path d="M16 5v14" />
                    </svg>
                  </span>
                </button>
              </div>
            ) : (
              <div></div>
            )}

            {/* Nút Menu nộp bài - luôn nằm sát bên phải */}
            <div className="flex items-center ml-auto">
              {/*  Nút Menu nộp bài tích hợp toggle sidebar và đồng hồ nổi */}
              <button
                onClick={toggleSubmitMenu}
                className="submit-menu-button p-3 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
                title={
                  showSidebar
                    ? "Ẩn menu nộp bài, hiện đồng hồ nổi"
                    : "Hiện menu nộp bài, ẩn đồng hồ nổi"
                }
              >
                {/* Logo mũi tên sang trái (khi menu ẩn) */}
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

                {/* Logo mũi tên sang phải (khi menu hiện) */}
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

      {!showSidebar && (
        <div
          className="fixed top-0 left-0 right-0 z-[100] lg:hidden px-4"
          style={{
            position: "fixed" as const,
            top: "12px",
            left: "0",
            right: "0",
            zIndex: 100,
            transform: "translateZ(0)",
          }}
        >
          <div className="mx-auto w-full max-w-md">
            <div className="h-10 w-full rounded-xl bg-[#EAF2FF] flex items-center justify-center gap-2 shadow border border-blue-200">
              <img
                src={encodeURI("/icon/đếm ngược.svg")}
                alt="Đồng hồ"
                className="h-4 w-4"
              />
              <span className="text-sm font-semibold text-[#1E3A8A] tracking-wide">
                {formatTime(usePartTimer ? partTimeRemaining : timeRemaining)}
              </span>
            </div>
          </div>
        </div>
      )}

      {(() => {
        //  Sử dụng hàm thống nhất getCurrentPartStats()
        const stats = getCurrentPartStats();

        return (
          <SubmitConfirmModal
            isOpen={showSubmitModal}
            onClose={() => setShowSubmitModal(false)}
            onConfirm={handleConfirmSubmit}
            sectionName={
              submitType === "part"
                ? examData.parts?.[currentPart]?.name ||
                  `Phần ${currentPart + 1}`
                : null
            }
            timeLabel={formatTime(
              usePartTimer ? partTimeRemaining : timeRemaining
            )}
            answeredCount={stats.answeredCount}
            totalCount={stats.totalQuestions}
          />
        );
      })()}

      {/* Modal xác nhận dừng bài thi */}
      <StopConfirmModal
        isOpen={showStopModal}
        onClose={() => setShowStopModal(false)}
        onConfirm={() => {
          setShowStopModal(false);
          handleStopAndExit();
        }}
      />

      {/* Modal cảnh báo gian lận */}
      <CheatWarningModal
        open={showCheatWarning}
        onClose={() => setShowCheatWarning(false)}
        onExit={handleCheatExit}
      />

      {/* Modal xác nhận thoát khi click logo */}
      <CheatWarningModal
        open={showLogoExitWarning}
        onClose={() => setShowLogoExitWarning(false)}
        onExit={handleLogoExit}
        message={
          "Bạn có chắc chắn muốn thoát về trang chủ?\nTiến độ làm bài sẽ bị mất."
        }
      />

      <PartTimeEndModal
        isOpen={showPartTimeEndModal}
        sectionName={
          examData.parts?.[currentPart]?.name || `Phần ${currentPart + 1}`
        }
        remainingSeconds={partTransitionCountdown ?? 0}
        onSkipNow={handleAutoMoveToNextPart}
      />
    </div>
  );
};

export default WordExamViewer;
