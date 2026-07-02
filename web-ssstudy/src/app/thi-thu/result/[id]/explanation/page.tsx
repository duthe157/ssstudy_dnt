"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import ExamExplanationScreen from "@/components/exam/ExamExplanationScreen";
import { wordExamService } from "@/services/wordExamService";
import { WordExamData, UserAnswer } from "@/types/exam";
import { ProductSkeleton } from "@/components/ui/loading-skeleton";
import { authService } from "@/services/authService";
import type { CheckAnswerQuestionLog } from "@/services/wordExamService";
import CheatWarningModal from "@/components/exam/CheatWarningModal";

const mapQuestionLogsToUserAnswers = (
  logs: CheckAnswerQuestionLog[] = []
): UserAnswer[] => {
  return logs
    .map((log) => {
      if (!log?.question_id) return null;
      const raw = log.user_answer;

      const normalizeValue = (value: any) => {
        if (value == null) return null;
        if (Array.isArray(value)) {
          const cleaned = value.filter(
            (entry) =>
              entry !== null &&
              entry !== undefined &&
              !(typeof entry === "string" && entry.trim().length === 0)
          );
          if (cleaned.length === 0) return null;
          return cleaned;
        }
        if (typeof value === "string") {
          const trimmed = value.trim();
          return trimmed.length ? trimmed : null;
        }
        return value;
      };

      const normalized = normalizeValue(raw);
      if (normalized === null) {
        return null;
      }

      return {
        question_id: log.question_id,
        value: normalized,
        isTestQuestion: log.is_test_question ?? false,
      };
    })
    .filter(Boolean) as UserAnswer[];
};

export default function ResultExplanationPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [examData, setExamData] = useState<WordExamData | any>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(true);
  const [isFromLesson, setIsFromLesson] = useState(false);

  const examId = params?.id as string;
  const categoryExam = searchParams?.get("categoryExam");
  const name = searchParams?.get("name");
  const isViewMode = searchParams?.get("mode") === "view";

  useEffect(() => {
    // Kiểm tra xem có phải quay lại từ trang bài học sách ID không
    if (typeof window !== "undefined" && examId) {
      try {
        // Ưu tiên kiểm tra query param fromLesson từ URL
        const fromLessonParam = searchParams?.get("fromLesson") === "true";
        if (fromLessonParam) {
          setIsFromLesson(true);
          return;
        }

        // Sau đó kiểm tra sessionStorage dự phòng
        const returnUrl = sessionStorage.getItem(`examReturnTo:${examId}`);
        if (returnUrl) {
          setIsFromLesson(true);
        }
      } catch (e) {
        console.warn("Error checking for return URL", e);
      }
    }
  }, [examId, searchParams]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const currentUser = authService.getCurrentUser() as any;
        const userId =
          currentUser?.user_id ||
          currentUser?._id ||
          currentUser?.id ||
          currentUser?.userId;

        if (!userId) {
          setError("Bạn cần đăng nhập để xem lại lời giải.");
          setLoading(false);
          return;
        }

        // Lấy dữ liệu từ API /exam-word/check-answer
        const [examResponse, answerResponse] = await Promise.all([
          wordExamService.getWordExamById(examId),
          wordExamService.checkWordExamAnswer({
            user_id: String(userId),
            exam_id: examId,
          }),
        ]);

        if (examResponse.code === 200 && examResponse.data) {
          setExamData(examResponse.data);
        } else {
          setError(examResponse.message || "Không thể tải dữ liệu đề thi");
          return;
        }

        const questionLogs =
          answerResponse?.data?.latestScore?.question_logs || [];
        const mappedAnswers = mapQuestionLogsToUserAnswers(questionLogs);

        setUserAnswers(mappedAnswers);

        // Lấy selectedSubjects từ exam_section của API response
        // Tìm các phần có part_type === "NHOM_CHU_DE" và lấy childLogs
        const latestScore = answerResponse?.data?.latestScore as any;
        const examSections = latestScore?.exam_section || [];
        const subjectsFromAPI: any[] = [];

        examSections.forEach((section: any) => {
          if (
            section?.part_type === "NHOM_CHU_DE" &&
            Array.isArray(section?.childLogs)
          ) {
            section.childLogs.forEach((child: any) => {
              // Lấy tên môn từ child_name hoặc subpart_name
              const subjectName = child?.child_name || child?.subpart_name;
              if (
                subjectName &&
                !subjectsFromAPI.some((s) => s.name === subjectName)
              ) {
                subjectsFromAPI.push({
                  name: subjectName,
                  // Có thể thêm _id nếu cần, nhưng hiện tại chỉ cần name
                });
              }
            });
          }
        });

        setSelectedSubjects(subjectsFromAPI);
      } catch (err) {
        console.error("[ResultExplanationPage] Error loading data:", err);
        setError("Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    if (examId) {
      loadData();
    } else {
      setError("Không tìm thấy ID đề thi");
      setLoading(false);
    }
  }, [examId]);

  const handleBack = () => {
    // 1. Kiểm tra chế độ xem từ search ID (Tra ID), quay lại trang trước đó
    if (isViewMode) {
      router.back();
      return;
    }

    // 2. Chế độ quay lại cho Sách ID
    const isSachID = examData?.group === "SACH_ID" || examData?.type === "SACH_ID";
    if (isSachID) {
      try {
        const key = `examReturnTo:${examId}`;
        const saved = sessionStorage.getItem(key);
        if (saved) {
          router.push(saved);
          return;
        }
      } catch (e) {
        console.warn("Error reading return URL", e);
      }
      // Fallback về trang thi thử nếu không có URL lưu trữ
      router.push("/thi-thu");
      return;
    }

    // 3. Mặc định cho đề bình thường (như MAC_DINH): Quay về trang kết quả điểm (score)
    const queryParams = new URLSearchParams();
    if (categoryExam) queryParams.set("categoryExam", categoryExam);
    if (name) queryParams.set("name", name);
    const queryString = queryParams.toString();
    router.push(
      `/thi-thu/result/${examId}${queryString ? `?${queryString}` : ""}`
    );
  };

  const handleRetakeExam = () => {
    // Xóa dữ liệu kết quả
    try {
      const resultKey = `wordExamResult:${examId}`;
      sessionStorage.removeItem(resultKey);
    } catch {}

    // Xóa tiến độ làm bài cũ để lần làm lại luôn bắt đầu từ đầu
    try {
      if (examId) {
        const progressKey = `wordExamProgress:${examId}`;
        localStorage.removeItem(progressKey);
      }
    } catch {}

    // Chuyển về trang ready để người dùng xác nhận trước khi thi lại
    router.push(`/thi-thu/word-exam/${examId}/ready`);
  };

  // Tính toán shouldDelayAnswer trước các early return
  const practiceConfig = examData ? (examData as any)?.practiceConfig : null;
  const isExamEnded = (() => {
    if (!practiceConfig) return false;
    if (practiceConfig.status === "ended") return true;
    const endRaw = practiceConfig.endDate || practiceConfig.end_date;
    if (!endRaw) return false;
    const now = new Date();
    const endDate = new Date(endRaw);
    return now >= endDate;
  })();
  const answerDisplayMode: "IMMEDIATELY" | "LATER" =
    practiceConfig?.answer_display === "LATER" ? "LATER" : "IMMEDIATELY";
  const isPracticeStatusTrue =
    practiceConfig?.status === true || practiceConfig?.status === "true";
  const shouldDelayAnswer =
    isPracticeStatusTrue && answerDisplayMode === "LATER" && !isExamEnded;

  // Reset showModal khi shouldDelayAnswer thay đổi - PHẢI ĐẶT TRƯỚC CÁC EARLY RETURN
  useEffect(() => {
    if (shouldDelayAnswer) {
      setShowModal(true);
    }
  }, [shouldDelayAnswer]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ProductSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Lỗi</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/thi-thu")}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (!examData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Không tìm thấy dữ liệu
          </h2>
          <p className="text-gray-600 mb-6">
            Không tìm thấy dữ liệu bài thi hoặc kết quả.
          </p>
          <button
            onClick={() => router.push("/thi-thu")}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative min-h-screen bg-gray-50">
        <ExamExplanationScreen
          examData={examData}
          userAnswers={userAnswers}
          examId={examId}
          classroomId={undefined}
          onBack={handleBack}
          selectedSubjects={selectedSubjects}
          onRetakeExam={handleRetakeExam}
          is_redo={(examData as any)?.is_redo}
          shouldDelayAnswer={shouldDelayAnswer}
          hideRetakeBtn={isViewMode || isFromLesson || (examData as any)?.group === "SACH_ID"}
        />

        <CheatWarningModal
          open={shouldDelayAnswer && showModal}
          onClose={() => setShowModal(false)}
          message="Đáp án sẽ được hiển thị sau khi đóng đề.\nVui lòng quay lại sau."
          showActions={false}
        />
      </div>
    </>
  );
}
