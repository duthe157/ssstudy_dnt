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

export default function WordExamExplanationPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [examData, setExamData] = useState<WordExamData | any>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(true);

  const examId = params?.id as string;
  const source = searchParams?.get("source");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Lấy selectedSubjects từ sessionStorage (nếu có) để giữ nguyên filter
        try {
          const resultKey = `wordExamResult:${examId}`;
          const resultData = sessionStorage.getItem(resultKey);
          if (resultData) {
            const parsed = JSON.parse(resultData);
            setSelectedSubjects(parsed.selectedSubjects || []);
          } else {
            setSelectedSubjects([]);
          }
        } catch {
          setSelectedSubjects([]);
        }

        // Nếu source=score, lấy dữ liệu từ sessionStorage (lần làm gần nhất)
        if (source === "score") {
          try {
            const resultKey = `wordExamResult:${examId}`;
            const resultData = sessionStorage.getItem(resultKey);

            if (!resultData) {
              setError("Không tìm thấy dữ liệu kết quả bài thi");
              setLoading(false);
              return;
            }

            const parsed = JSON.parse(resultData);
            const storedUserAnswers = Array.isArray(parsed.userAnswers)
              ? parsed.userAnswers
              : [];

            // Load exam data
            const examResponse = await wordExamService.getWordExamById(examId);
            if (examResponse.code === 200 && examResponse.data) {
              setExamData(examResponse.data);
              setUserAnswers(storedUserAnswers);
            } else {
              setError(examResponse.message || "Không thể tải dữ liệu đề thi");
            }
          } catch (err) {
            console.error(
              "[WordExamExplanationPage] Error loading from sessionStorage:",
              err
            );
            setError("Không thể tải dữ liệu từ sessionStorage");
          } finally {
            setLoading(false);
          }
          return;
        }

        // Nếu không phải source=score, lấy từ API /exam-word/check-answer
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
      } catch (err) {
        console.error("[WordExamExplanationPage]  Error loading data:", err);
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
  }, [examId, source]);

  const handleBack = () => {
    // Nếu source=score, quay về trang score
    if (source === "score") {
      router.push(`/thi-thu/word-exam/${examId}/score`);
      return;
    }
    // Nếu không, quay về trang result
    router.push(
      `/thi-thu/result/${examId}?categoryExam=${examData?.categoryExam?.populate_id.name}&name=${examData.name}`
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
          <div className="text-gray-500 text-6xl mb-4">📝</div>
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
