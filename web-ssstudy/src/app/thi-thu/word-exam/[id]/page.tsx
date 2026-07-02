"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import WordExamViewer from "@/components/exam/WordExamViewer";
import { wordExamService } from "@/services/wordExamService";
import { WordExamData, UserAnswer } from "@/types/exam";
import { ProductSkeleton } from "@/components/ui/loading-skeleton";

export default function WordExamPage() {
  const params = useParams();
  const router = useRouter();
  const [examData, setExamData] = useState<WordExamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const examId = params?.id as string;

  useEffect(() => {
    // Nếu trang này được tải lại (tab reload), chuyển về trang ready
    try {
      if (
        examId &&
        typeof window !== "undefined" &&
        sessionStorage.getItem(`examReload:${examId}`) === "1"
      ) {
        sessionStorage.removeItem(`examReload:${examId}`);
        router.replace(`/thi-thu/word-exam/${examId}/ready`);
        return;
      }
    } catch {}

    const fetchExamData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await wordExamService.getWordExamById(examId);

        if (response.code === 200 && response.data) {
          setExamData(response.data);
        } else {
          console.error(
            "[WordExamPage] Exam data load failed:",
            response.message
          );
          setError(response.message || "Không thể tải dữ liệu đề thi");
        }
      } catch (err) {
        console.error("[WordExamPage] Error fetching exam data:", err);
        setError("Không thể tải dữ liệu đề thi");
      } finally {
        setLoading(false);
      }
    };

    if (examId) {
      fetchExamData();
    } else {
      console.warn("[WordExamPage] No exam ID provided");
    }
  }, [examId]);

  const handleExamComplete = async (
    answers: UserAnswer[],
    timeSpent: number,
    subject?: string[]
  ) => {
    try {
      // Build answers array từ user responses
      const answersArray = wordExamService.buildWordAnswers(
        answers.reduce((acc, answer) => {
          acc[answer.question_id] = {
            answer: answer.value,
            isTestQuestion: answer.isTestQuestion,
          };
          return acc;
        }, {} as Record<string, any>)
      );

      // Tính thời gian làm bài (truyền tổng số giây để hiển thị đầy đủ hh:mm:ss)
      const timeDoingSeconds = Math.floor(timeSpent);

      // Gọi API tính điểm trực tiếp (không cần submit riêng)
      const response = await wordExamService.submitAndScoreExam({
        exam_id: examId,
        answers: answersArray,
        time_doing: timeDoingSeconds,
        subject: Array.isArray(subject) ? subject : undefined,
      });

      if (response.code === 200) {
        // Trả về kết quả API thay vì redirect
        return response;
      } else {
        console.error("API returned error:", response.message);
        throw new Error(response.message || "Có lỗi xảy ra khi tính điểm");
      }
    } catch (error) {
      console.error("Error submitting exam:", error);
      throw error;
    }
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
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Lỗi tải đề thi
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
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
            Không tìm thấy đề thi
          </h2>
          <p className="text-gray-600 mb-6">
            Đề thi không tồn tại hoặc đã bị xóa.
          </p>
          <button
            onClick={() => router.back()}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <WordExamViewer examData={examData} onExamComplete={handleExamComplete} />
  );
}
