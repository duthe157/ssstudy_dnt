"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import ExamResultScreen from "@/components/exam/ExamResultScreen";
import { wordExamService } from "@/services/wordExamService";
import { WordExamData, UserAnswer } from "@/types/exam";
import { ProductSkeleton } from "@/components/ui/loading-skeleton";

export default function WordExamScorePage() {
  const params = useParams();
  const router = useRouter();
  const [examData, setExamData] = useState<WordExamData | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [selectedSubjects, setSelectedSubjects] = useState<any[]>([]);
  const [initialScoreResult, setInitialScoreResult] = useState<any>(null);
  const [examFinished, setExamFinished] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const examId = params?.id as string;

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Lấy dữ liệu từ sessionStorage
        const resultKey = `wordExamResult:${examId}`;
        const resultData = sessionStorage.getItem(resultKey);

        const parsed = resultData ? JSON.parse(resultData) : null;
        
        let initialScoreData = null;
        if (parsed) {
          setUserAnswers(parsed.userAnswers || []);
          setTimeSpent(parsed.timeSpent || 0);
          setSelectedSubjects(parsed.selectedSubjects || []);
          initialScoreData = parsed.scoringResult || null;
          setExamFinished(parsed.examFinished ?? null);
        } else {
          // If no result in sessionStorage, try to fetch from API
          try {
            const result = await wordExamService.scoringWordExamWithPayload({
              exam_id: examId,
              answers: [] // Sending empty answers to get the latest score
            });
            if (result && result.code === 200) {
              initialScoreData = result;
              setExamFinished(true); // Since we got a result, it must be finished
              // Build dummy userAnswers from question_logs if available
              if (result.data?.question_logs) {
                const dummyAnswers = result.data.question_logs.map((log: any) => ({
                  question_id: log.question_id,
                  value: log.user_answer,
                  isTestQuestion: log.is_test_question
                }));
                setUserAnswers(dummyAnswers);
              }
            } else {
              setError("Không tìm thấy kết quả bài thi");
              setLoading(false);
              return;
            }
          } catch (err) {
            console.error("Error fetching score from API:", err);
            setError("Không tìm thấy kết quả bài thi");
            setLoading(false);
            return;
          }
        }

        setInitialScoreResult(initialScoreData);

        // Load exam data
        const response = await wordExamService.getWordExamById(examId);
        if (response.code === 200 && response.data) {
          setExamData(response.data);
        } else {
          setError(response.message || "Không thể tải dữ liệu đề thi");
        }
      } catch (err) {
        console.error("[WordExamScorePage] Error loading data:", err);
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

  const handleBackToHome = React.useCallback(() => {
    try {
      if (typeof window !== "undefined" && examId) {
        const key = `examReturnTo:${examId}`;
        const saved = sessionStorage.getItem(key);
        if (saved && typeof saved === "string") {
          router.push(saved);
          return;
        }
      }
    } catch (error) {
      console.error("Error reading return URL:", error);
    }
    // Fallback về trang thi thử nếu không có URL đã lưu
    router.push("/thi-thu");
  }, [examId, router]);

  const trapHistoryState = React.useCallback(
    (force = false) => {
      if (typeof window === "undefined" || !examId) return;
      try {
        const currentState =
          (typeof window.history.state === "object" && window.history.state) ||
          {};
        if (!force && currentState?.wordExamScoreTrapId === examId) {
          return;
        }
        window.history.pushState(
          { ...currentState, wordExamScoreTrapId: examId },
          "",
          window.location.href
        );
      } catch (error) {
        console.warn("[WordExamScorePage] Không thể ghi history", error);
      }
    },
    [examId]
  );

  // Xử lý browser back button để quay về đúng trang (thi thử hoặc lesson)
  useEffect(() => {
    if (!examId) return;

    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault?.();
      trapHistoryState(true);
      handleBackToHome();
    };

    trapHistoryState();
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [examId, handleBackToHome, trapHistoryState]);

  const handleViewAnswers = () => {
    // Truyền source qua URL params để tránh bị đè lên nhau
    // source=score: lấy dữ liệu từ sessionStorage (lần làm gần nhất)
    router.push(`/thi-thu/word-exam/${examId}/explanation?source=score`);
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

    // Chuyển về trang làm bài ở chế độ thi lại
    router.push(`/thi-thu/word-exam/${examId}?mode=retake`);
  };

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

  // Cho phép hiển thị và chấm điểm kể cả khi không có câu trả lời nào được chọn
  // (API scoring sẽ nhận mảng answers rỗng và tự xử lý)

  return (
    <ExamResultScreen
      examData={examData}
      userAnswers={userAnswers}
      timeSpent={timeSpent}
      examId={examId}
      classroomId={undefined}
      selectedSubjects={selectedSubjects}
      initialResult={initialScoreResult}
      examFinished={examFinished}
      onBackToHome={handleBackToHome}
      onViewAnswers={handleViewAnswers}
      onRetakeExam={handleRetakeExam}
    />
  );
}
