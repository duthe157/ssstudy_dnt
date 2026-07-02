// Màn hình kết quả thi

import React, { useMemo, useState, useEffect } from "react";
import MobileBottomNav from "../layout/mobile-bottom-nav";
import { WordExamData, ExamQuestion, UserAnswer } from "@/types/exam";
import { wordExamService } from "@/services/wordExamService";
import ExamExplanationScreen from "./ExamExplanationScreen";
import CheatWarningModal from "./CheatWarningModal";
import LuckyMoneyModal from "./LuckyMoney";

// Interface cho subSection
interface SubSection {
  partName: string;
  correctAnswers: number;
  totalQuestions: number;
  score: number;
  maxScore: number;
  isSubSection: boolean;
}

interface ExamResultScreenProps {
  examData: WordExamData;
  userAnswers: UserAnswer[];
  timeSpent: number; // thời gian làm bài (giây)
  examId: string; // ID của exam để gọi API
  classroomId?: string; // ID của classroom (optional)
  selectedSubjects?: any[]; // Thông tin các chủ đề đã chọn
  initialResult?: any; // Kết quả scoring đã có sẵn (để tránh gọi lại API)
  examFinished?: boolean | null; // Trạng thái finished từ API: false = chưa làm, true = đã làm
  onBackToHome?: () => void;
  onViewAnswers?: () => void;
  onRetakeExam?: () => void;
}

const ExamResultScreen: React.FC<ExamResultScreenProps> = ({
  examData,
  userAnswers,
  timeSpent,
  examId,
  classroomId,
  selectedSubjects = [],
  initialResult,
  examFinished = null,
  onBackToHome,
  onViewAnswers,
  onRetakeExam,
}) => {
  const [apiResult, setApiResult] = useState<any>(initialResult || null);
  const [loading, setLoading] = useState(!initialResult);
  const [error, setError] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const [showLuckyMoney, setShowLuckyMoney] = useState(false);

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

  const resultDisplayMode =
    practiceConfig?.result_display === "LATER" ? "LATER" : "IMMEDIATELY";
  const isPracticeStatusTrue =
    practiceConfig?.status === true || practiceConfig?.status === "true";

  const shouldDelayResult =
    isPracticeStatusTrue && resultDisplayMode === "LATER" && !isExamEnded;

  // Reset showModal khi shouldDelayResult thay đổi
  useEffect(() => {
    if (shouldDelayResult) {
      setShowModal(true);
    }
  }, [shouldDelayResult]);

  // Kiểm tra và hiển thị modal chúc mừng khi gift_image có giá trị VÀ đề thi chưa từng làm (finished === false)
  useEffect(() => {
    if (!loading && apiResult?.code === 200 && apiResult?.data && examFinished === false) {
      const { gift_image } = apiResult.data;
      // Chỉ hiển thị khi gift_image không null/undefined/empty VÀ đề thi chưa làm
      if (gift_image) {
        const timer = setTimeout(() => {
          setShowLuckyMoney(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [loading, apiResult, examFinished]);

  // Nếu đã có sẵn kết quả (ví dụ: lưu từ lần submit), sử dụng luôn
  useEffect(() => {
    if (initialResult) {
      setApiResult(initialResult);
      setLoading(false);
    }
  }, [initialResult]);

  // Gọi API tính điểm khi component mount (chỉ khi không có sẵn initialResult)
  useEffect(() => {
    if (initialResult) return;

    let isMounted = true;

    const fetchExamResult = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build answers array từ userAnswers
        const answersArray = wordExamService.buildWordAnswers(
          userAnswers.reduce((acc, answer) => {
            acc[answer.question_id] = {
              answer: answer.value,
              isTestQuestion: answer.isTestQuestion,
            };
            return acc;
          }, {} as Record<string, any>)
        );

        // Tính thời gian làm bài (truyền tổng số giây để hiển thị đầy đủ hh:mm:ss)
        const timeDoingSeconds = Math.floor(timeSpent);

        // Gọi API tính điểm
        const result = await wordExamService.scoringWordExamWithPayload({
          exam_id: examId,
          classroom_id: classroomId,
          answers: answersArray,
          time_doing: timeDoingSeconds,
          subject: Array.isArray(selectedSubjects)
            ? selectedSubjects
                .map((s: any) => s?.name)
                .filter(
                  (n: any) => typeof n === "string" && n.trim().length > 0
                )
            : [],
        });

        if (isMounted) {
          setApiResult(result);
        }
      } catch (err) {
        console.error("[ExamResultScreen]  Error fetching exam result:", err);
        if (isMounted) {
          setError("Không thể tải kết quả thi. Vui lòng thử lại.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (examId) {
      fetchExamResult();
    } else {
      setLoading(false);
    }

    // Cleanup function để prevent memory leaks
    return () => {
      isMounted = false;
    };
  }, [
    initialResult,
    examId,
    classroomId,
    userAnswers,
    timeSpent,
    selectedSubjects,
  ]);

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
      return acceptedAnswers.includes(normalizedUser);
    }

    // So sánh trực tiếp nếu không có dấu |
    return normalizedUser === normalizedCorrect;
  };

  // Tính toán kết quả - ưu tiên dữ liệu từ API
  const resultData = useMemo(() => {
    // Format thời gian
    const formatTime = (seconds: number) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    // Lấy tên danh mục
    const getCategoryName = () => {
      const categoryExam = (examData as any)?.categoryExam;
      if (categoryExam?.populate_id?.name) {
        return categoryExam.populate_id.name;
      }
      if (categoryExam?.name) {
        return categoryExam.name;
      }
      return "Đánh giá năng lực";
    };

    // Helper: build sub-sections from user-selected subjects for NHOM_CHU_DE
    const buildSelectedSubjectSubSections = () => {
      const subSections: SubSection[] = [];
      try {
        if (
          !Array.isArray(selectedSubjects) ||
          !Array.isArray(examData?.parts)
        ) {
          return subSections;
        }
        //  Tìm nhóm chủ đề - có thể ở bất kỳ vị trí nào (bao gồm phần đầu tiên)
        const groupPart = (examData.parts as any[]).find(
          (p: any) => String(p?.type).toUpperCase() === "NHOM_CHU_DE"
        );
        if (!groupPart) return subSections;

        const subparts = Array.isArray(groupPart.subpart)
          ? groupPart.subpart
          : [];
        const children: any[] = [];
        subparts.forEach((sp: any) => {
          if (Array.isArray(sp.children)) children.push(...sp.children);
        });

        selectedSubjects.forEach((sel: any) => {
          const matchedChild = children.find(
            (c: any) => c?._id === sel?._id || c?.id === sel?.id
          );
          const questions = Array.isArray(matchedChild?.questions)
            ? matchedChild.questions
            : [];
          const totalQuestions = questions.length || 0;

          // Best-effort correct count calculation if answers and correctAnswers are present
          let correctAnswers = 0;
          try {
            if (totalQuestions > 0 && Array.isArray(questions)) {
              questions.forEach((q: any) => {
                const qData = q?.question || q || {};
                const qId = q?._id || qData?._id;
                const correct = qData?.correctAnswers || q?.correctAnswers;
                const user = userAnswers.find((a) => a.question_id === qId);
                if (user && correct != null) {
                  if (Array.isArray(correct)) {
                    if (correct.includes(user.value)) correctAnswers += 1;
                  } else if (user.value === correct) {
                    correctAnswers += 1;
                  }
                }
              });
            }
          } catch {}

          // Tính điểm cho subsection
          const questionsScore = (groupPart as any).questions_score || 1;
          const maxScore = totalQuestions * questionsScore;
          const achievedScore = correctAnswers * questionsScore;

          subSections.push({
            partName: sel?.name || matchedChild?.name || "Môn đã chọn",
            correctAnswers,
            totalQuestions,
            score: achievedScore,
            maxScore: maxScore,
            isSubSection: true,
          });
        });
      } catch {}
      return subSections;
    };

    // Nếu có dữ liệu từ API, sử dụng dữ liệu API
    if (apiResult?.code === 200 && apiResult?.data) {
      const apiData = apiResult.data;

      // Số câu đúng và tổng số câu
      let correctFromApi =
        apiData.correct_answers ?? apiData.correct ?? undefined;
      let totalQFromApi =
        apiData.total_question ?? apiData.totalQuestions ?? undefined;

      // Nếu API không trả số câu đúng/tổng số câu, cố gắng tính từ parts/sections
      if (correctFromApi == null || totalQFromApi == null) {
        try {
          // Ưu tiên exam_section nếu có, nếu không fallback sang parts
          const sections: any[] = Array.isArray(apiData.exam_section)
            ? apiData.exam_section
            : Array.isArray(apiData.parts)
            ? apiData.parts
            : [];
          if (sections.length > 0) {
            const agg = sections.reduce(
              (acc: any, s: any) => {
                const c = s.correct ?? 0;
                const tq = s.total_question ?? s.totalQuestions ?? 0;
                return { correct: acc.correct + c, total: acc.total + tq };
              },
              { correct: 0, total: 0 }
            );
            if (correctFromApi == null) correctFromApi = agg.correct;
            if (totalQFromApi == null) totalQFromApi = agg.total;
          }
        } catch {}
      }

      // ===== PHẦN TÍNH ĐIỂM THEO PHẦN - SỬ DỤNG DỮ LIỆU TỪ API =====
      let partScores: any[] = [];

      //  Sử dụng dữ liệu từ exam_section của API thay vì tự tính toán
      if (Array.isArray(apiData.exam_section)) {
        partScores = apiData.exam_section.map((section: any, index: number) => {
          const subSections: SubSection[] = [];

          // Nếu có subjects con từ API
          if (section?.subjects && Array.isArray(section.subjects)) {
            section.subjects.forEach((subject: any) => {
              subSections.push({
                partName: subject.name || subject.subject_name,
                correctAnswers: subject.correct || 0,
                totalQuestions: subject.total_question || 0,
                score: subject.score_achieve || 0,
                // Một số API trả về total_point cho subject
                maxScore: subject.total_point || 0,
                isSubSection: true,
              });
            });
          }

          // Hỗ trợ cấu trúc API khác: childLogs
          if (section?.childLogs && Array.isArray(section.childLogs)) {
            const isGroupTopic =
              String(section?.part_type).toUpperCase() === "NHOM_CHU_DE";
            const children = isGroupTopic
              ? section.childLogs
              : section.childLogs.filter((c: any) => c?.isMain === false);

            children.forEach((child: any) => {
              const name = isGroupTopic
                ? child.child_name || child.name || child.subject_name
                : child.subpart_name ||
                  child.child_name ||
                  child.name ||
                  child.subject_name;
              subSections.push({
                partName: name,
                correctAnswers: child.correct || 0,
                totalQuestions: child.total_question || 0,
                score: child.score_achieve || 0,
                maxScore: child.total_child_point || child.total_point || 0,
                isSubSection: true,
              });
            });
          }

          return {
            partName: section.part_name || `Phần ${index + 1}`,
            correctAnswers: section.correct || 0,
            totalQuestions: section.total_question || 0,
            score: section.score_achieve || 0,
            maxScore: section.total_point || 0,
            isSubSection: false,
            subSections,
          };
        });
      } else if (Array.isArray(examData.parts)) {
        // Fallback nếu không có exam_section
        partScores = examData.parts.map((part: any, index: number) => {
          const subSections: SubSection[] = [];

          // Tìm section tương ứng từ API result
          const apiSections = Array.isArray(apiData.parts) ? apiData.parts : [];

          const matchingSection = apiSections.find(
            (s: any) => s.part_name === part.name || s.name === part.name
          );

          // Nếu có subjects con từ API
          if (
            matchingSection?.subjects &&
            Array.isArray(matchingSection.subjects)
          ) {
            matchingSection.subjects.forEach((subject: any) => {
              subSections.push({
                partName: subject.name || subject.subject_name,
                correctAnswers: subject.correct || 0,
                totalQuestions: subject.total_question || 0,
                score: subject.score_achieve || 0,
                maxScore: subject.total_point || 0,
                isSubSection: true,
              });
            });
          }

          // Hỗ trợ cấu trúc API khác: childLogs
          if (
            matchingSection?.childLogs &&
            Array.isArray(matchingSection.childLogs)
          ) {
            const isGroupTopic =
              String(matchingSection?.part_type).toUpperCase() ===
              "NHOM_CHU_DE";
            const children = isGroupTopic
              ? matchingSection.childLogs
              : matchingSection.childLogs.filter(
                  (c: any) => c?.isMain === false
                );

            children.forEach((child: any) => {
              const name = isGroupTopic
                ? child.child_name || child.name || child.subject_name
                : child.subpart_name ||
                  child.child_name ||
                  child.name ||
                  child.subject_name;
              subSections.push({
                partName: name,
                correctAnswers: child.correct || 0,
                totalQuestions: child.total_question || 0,
                score: child.score_achieve || 0,
                maxScore: child.total_child_point || child.total_point || 0,
                isSubSection: true,
              });
            });
          }

          return {
            partName: part.name || `Phần ${index + 1}`,
            correctAnswers: matchingSection?.correct || 0,
            totalQuestions: matchingSection?.total_question || 0,
            score: matchingSection?.score_achieve || 0,
            maxScore: matchingSection?.total_point || 0,
            isSubSection: false,
            subSections,
          };
        });
      }

      // Bổ sung sub-sections cho phần NHOM_CHU_DE nếu API không trả về subjects
      try {
        const selectedSubs = buildSelectedSubjectSubSections();
        if (selectedSubs.length > 0) {
          const groupPart = (examData.parts as any[]).find(
            (p: any) => String(p?.type).toUpperCase() === "NHOM_CHU_DE"
          );
          const groupPartName = groupPart?.name;
          const targetIndex = partScores.findIndex(
            (ps: any) => ps.partName === groupPartName
          );
          if (targetIndex >= 0) {
            if (
              !Array.isArray(partScores[targetIndex].subSections) ||
              partScores[targetIndex].subSections.length === 0
            ) {
              partScores[targetIndex] = {
                ...partScores[targetIndex],
                subSections: selectedSubs,
              } as any;
            }
          }
        }
      } catch {}

      // Nếu vẫn thiếu correct/total, tính fallback từ dữ liệu câu hỏi cục bộ
      if (correctFromApi == null || totalQFromApi == null) {
        try {
          let correctCount = 0;
          let totalQuestions = 0;
          examData.parts?.forEach((part) => {
            const partId = part.id || part._id;
            const partQuestions =
              examData.questions?.filter((q: any) => q.__partId === partId) ||
              [];
            partQuestions.forEach((question: any) => {
              totalQuestions++;
              const userAnswer = userAnswers.find(
                (answer) => answer.question_id === question._id
              );
              if (userAnswer && question.correctAnswers) {
                let isCorrect = false;

                // Xử lý đặc biệt cho FILL_BLANK với logic mới
                if (question.question_type === "FILL_BLANK") {
                  isCorrect = compareFillBlankAnswer(
                    userAnswer.value,
                    question.correctAnswers
                  );
                } else {
                  // Logic cũ cho các loại câu hỏi khác
                  isCorrect = Array.isArray(question.correctAnswers)
                    ? question.correctAnswers.includes(userAnswer.value)
                    : question.correctAnswers === userAnswer.value;
                }

                if (isCorrect) correctCount++;
              }
            });
          });
          if (correctFromApi == null) correctFromApi = correctCount;
          if (totalQFromApi == null) totalQFromApi = totalQuestions;
        } catch {}
      }

      //  Lấy tổng điểm từ API - ưu tiên total_score_achieve và total_exam_point
      const totalScoreFromApi = apiData.total_score_achieve || 0;
      const maxTotalScoreFromApi = apiData.total_exam_point || 0;

      // Fallback: tính từ parts nếu API không có dữ liệu
      const totalScoreFromParts = partScores.reduce(
        (sum, part) => sum + (Number(part.score) || 0),
        0
      );
      const maxTotalScoreFromParts = partScores.reduce(
        (sum, part) => sum + (Number(part.maxScore) || 0),
        0
      );

      //  Ưu tiên dữ liệu từ API, chỉ fallback khi API không có dữ liệu
      const totalScoreFinal =
        totalScoreFromApi || Math.round(totalScoreFromParts * 100) / 100;
      const maxTotalScoreFinal = maxTotalScoreFromApi || maxTotalScoreFromParts;

      return {
        totalQuestions: totalQFromApi || 0,
        correctAnswers: correctFromApi || 0,
        totalScore: totalScoreFinal,
        maxTotalScore: maxTotalScoreFinal,
        completionTime: formatTime(timeSpent),
        partScores,
        categoryName: getCategoryName(),
        examName:
          apiData.exam?.name || examData.name || "Thi thử tốt nghiệp năm 2024",
        apiData: apiData,
      };
    }

    // ===== FALLBACK: tính toán local nếu không có API data =====
    const calculateCorrectAnswers = () => {
      let correctCount = 0;
      let totalQuestions = 0;

      examData.parts?.forEach((part) => {
        const partId = part.id || part._id;
        const partQuestions =
          examData.questions?.filter((q: any) => q.__partId === partId) || [];

        partQuestions.forEach((question: any) => {
          totalQuestions++;
          const userAnswer = userAnswers.find(
            (answer) => answer.question_id === question._id
          );

          if (userAnswer && question.correctAnswers) {
            let isCorrect = false;

            // Xử lý đặc biệt cho FILL_BLANK với logic mới
            if (question.question_type === "FILL_BLANK") {
              isCorrect = compareFillBlankAnswer(
                userAnswer.value,
                question.correctAnswers
              );
            } else {
              // Logic cũ cho các loại câu hỏi khác
              isCorrect = Array.isArray(question.correctAnswers)
                ? question.correctAnswers.includes(userAnswer.value)
                : question.correctAnswers === userAnswer.value;
            }

            if (isCorrect) {
              correctCount++;
            }
          }
        });
      });

      return { correctCount, totalQuestions };
    };

    const { correctCount, totalQuestions } = calculateCorrectAnswers();

    // Tính điểm theo phần (fallback) - bao gồm cả thông tin về chủ đề đã chọn
    const partScores =
      examData.parts?.map((part, partIndex) => {
        let subSections: SubSection[] = [];

        const partId = part.id || part._id;
        const partQuestions =
          examData.questions?.filter((q: any) => q.__partId === partId) || [];

        let correctCount = 0;
        let totalQuestions = partQuestions.length;

        // Tính số câu đúng
        partQuestions.forEach((question: any) => {
          const userAnswer = userAnswers.find(
            (answer) => answer.question_id === question._id
          );

          if (userAnswer && question.correctAnswers) {
            let isCorrect = false;

            // Xử lý đặc biệt cho FILL_BLANK với logic mới
            if (question.question_type === "FILL_BLANK") {
              isCorrect = compareFillBlankAnswer(
                userAnswer.value,
                question.correctAnswers
              );
            } else {
              // Logic cũ cho các loại câu hỏi khác
              isCorrect = Array.isArray(question.correctAnswers)
                ? question.correctAnswers.includes(userAnswer.value)
                : question.correctAnswers === userAnswer.value;
            }

            if (isCorrect) correctCount++;
          }
        });

        //  Tính điểm dựa trên questions_score (fallback khi không có API)
        const questionsScore = (part as any).questions_score || 0;
        const maxScore = (part as any).score || 0;
        const achievedScore = correctCount * questionsScore; //  Điểm đạt = correct × questions_score

        // Nếu là phần NHOM_CHU_DE và có selectedSubjects
        if (
          part.type === "NHOM_CHU_DE" &&
          Array.isArray(selectedSubjects) &&
          selectedSubjects.length > 0
        ) {
          subSections = buildSelectedSubjectSubSections();
        }

        return {
          partName: part.name || `Phần ${partIndex + 1}`,
          correctAnswers: correctCount,
          totalQuestions: totalQuestions,
          score: achievedScore, //  Điểm đạt = correct × questions_score
          maxScore: maxScore, //  Tổng điểm = part.score
          isSubSection: false,
          subSections,
        };
      }) || [];

    //  FALLBACK: TÍNH TỔNG ĐIỂM TỪ PARTS (khi không có API data)
    const totalScoreAchieved = partScores.reduce(
      (sum, part) => sum + (part.score || 0),
      0
    );
    const maxTotalScore = partScores.reduce(
      (sum, part) => sum + (part.maxScore || 0),
      0
    );

    return {
      totalQuestions,
      correctAnswers: correctCount,
      totalScore: Math.round(totalScoreAchieved * 100) / 100, //  Tổng điểm đạt được (fallback)
      maxTotalScore: maxTotalScore, //  Tổng điểm tối đa (fallback)
      completionTime: formatTime(timeSpent),
      partScores,
      categoryName: getCategoryName(),
      examName: examData.name || "Thi thử tốt nghiệp năm 2024",
    };
  }, [examData, userAnswers, timeSpent, apiResult, selectedSubjects]);

  // Nếu đang hiển thị lời giải chi tiết
  if (showExplanation) {
    return (
      <ExamExplanationScreen
        examData={examData}
        userAnswers={userAnswers}
        examId={examId}
        classroomId={classroomId}
        onBack={() => setShowExplanation(false)}
        selectedSubjects={selectedSubjects}
        onRetakeExam={onRetakeExam}
        is_redo={(examData as any)?.is_redo}
      />
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20 md:pb-0">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600">Đang tính điểm...</p>
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
            onClick={() => window.location.reload()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        {/* Header Section */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-6 h-40 w-40 sm:h-44 sm:w-44 md:h-48 md:w-48 lg:h-56 lg:w-56">
            <img
              src="/icon/icon-hoanthanh.svg"
              alt="Hoàn thành"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>

          <h1 className="mb-2 text-2xl font-bold text-blue-600 sm:text-3xl">
            Bạn đã hoàn thành!
          </h1>
          <p className="text-sm text-gray-500">
            Chúc mừng bạn đã hoàn thành bài thi, sau đây là kết quả
          </p>
        </div>

        {/* Result Card */}
        <div className="mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white shadow-sm relative overflow-hidden">
          <div>
            {/* Header - luôn hiển thị, không bị ẩn */}
            <div className="border-b border-gray-100 p-6 text-center">
              <div className="text-sm font-semibold text-blue-600">
                {resultData.categoryName}
              </div>
              <div className="mt-1 text-lg font-semibold text-gray-900">
                {resultData.examName}
              </div>
            </div>

            {/* Phần nội dung thông tin - sẽ bị ẩn khi shouldDelayResult */}
            {!shouldDelayResult && (
              <>
                {/* Stats */}
                <div className="p-6">
                  {/* Thời gian và Tổng điểm */}
                  <div className="mb-6 flex items-center justify-between">
                    {/* Thời gian hoàn thành và Tổng điểm gần nhau */}
                    <div className="flex items-center gap-8">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-700">
                          Thời gian hoàn thành:
                        </span>
                        <div className="rounded bg-blue-600 px-3 py-1 text-sm font-semibold text-white">
                          {resultData.completionTime}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-gray-700">Tổng điểm:</span>
                        <div className="rounded bg-blue-600 px-3 py-1 text-sm font-semibold text-white">
                          {resultData.totalScore}/{resultData.maxTotalScore}
                        </div>
                      </div>
                    </div>

                    {/* Để trống phần bên phải để cân bằng layout */}
                    <div></div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Đáp án đúng:</span>

                      {/* Progress bar dày hơn về chiều ngang */}
                      <div className="mx-4 flex h-5 flex-1 overflow-hidden rounded-full bg-gray-200">
                        {(() => {
                          const total = Number(resultData.totalQuestions) || 0;
                          const correct =
                            Number(resultData.correctAnswers) || 0;
                          const pct =
                            total > 0
                              ? Math.max(
                                  0,
                                  Math.min(100, (correct / total) * 100)
                                )
                              : 0;
                          return (
                            <>
                              <div
                                className="h-full bg-blue-600 transition-all duration-300"
                                style={{ width: `${pct}%` }}
                              />
                              <div
                                className="h-full bg-gray-200"
                                style={{ width: `${100 - pct}%` }}
                              />
                            </>
                          );
                        })()}
                      </div>

                      <span className="font-semibold text-gray-900">
                        {resultData.correctAnswers}/{resultData.totalQuestions}
                      </span>
                    </div>
                  </div>

                  {/* Part Scores Table - Căn giữa cho cả hai cột */}
                  <div className="overflow-hidden rounded-lg border border-gray-200">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-blue-50">
                          <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                            Phần thi
                          </th>
                          <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                            Điểm đạt / Tổng điểm
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {resultData.partScores.map(
                          (part: any, index: number) => (
                            <React.Fragment key={index}>
                              {/* Phần chính - căn trái */}
                              <tr className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-left text-sm text-gray-900">
                                  <div className="font-medium">
                                    {part.partName}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                                  {part.score}/{part.maxScore}
                                </td>
                              </tr>

                              {/* Các môn con (nếu có) - căn trái với thụt lề */}
                              {part.subSections &&
                                part.subSections.length > 0 &&
                                part.subSections.map(
                                  (
                                    subSection: SubSection,
                                    subIndex: number
                                  ) => (
                                    <tr
                                      key={`${index}-${subIndex}`}
                                      className="bg-gray-25 hover:bg-gray-50"
                                    >
                                      <td className="px-6 py-3 text-left text-sm text-gray-700">
                                        <div className="font-normal pl-4">
                                          {subSection.partName}
                                        </div>
                                      </td>
                                      <td className="px-6 py-3 text-center text-sm text-gray-700">
                                        {subSection.score}/{subSection.maxScore}
                                      </td>
                                    </tr>
                                  )
                                )}
                            </React.Fragment>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* Action Buttons - luôn hiển thị */}
            <div className="border-t border-gray-100 p-6">
              <div className="flex gap-3">
                <button
                  onClick={onBackToHome}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-blue-600 bg-white px-3 py-2 text-blue-600 transition-colors hover:bg-blue-50 text-sm md:text-base md:px-6 md:py-3"
                >
                  <svg
                    className="h-4 w-4"
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
                  Quay lại
                </button>

                <button
                  onClick={() => {
                    if (onViewAnswers) {
                      onViewAnswers();
                    } else {
                      setShowExplanation(true);
                    }
                  }}
                  className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-white transition-colors hover:bg-blue-700 text-sm md:text-base md:px-6 md:py-3"
                >
                  Xem đáp án
                </button>
              </div>
            </div>
            {/* Mobile bottom nav */}
            <div className="md:hidden">
              <MobileBottomNav />
            </div>
          </div>

          <CheatWarningModal
            open={shouldDelayResult && showModal}
            onClose={() => setShowModal(false)}
            message="Bạn đã nộp bài thành công,\nKết quả sẽ được hiển thị sau khi đóng đề."
            showActions={false}
          />

          {/* Modal chúc mừng - hiển thị khi gift_image có giá trị */}
          {apiResult?.data?.gift_image && (
            <LuckyMoneyModal
              open={showLuckyMoney}
              onClose={() => setShowLuckyMoney(false)}
              bannerImage={apiResult.data.gift_image}
              redirectUrl={apiResult.data.gift_url}
              ctaIcon={apiResult.data.gift_CTA}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamResultScreen;
