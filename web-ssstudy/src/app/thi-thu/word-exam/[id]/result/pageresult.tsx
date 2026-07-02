"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { wordExamService } from "@/services/wordExamService";

// Định nghĩa interface cho result
interface ExamResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  examName: string;
  subject: string;
}

export default function WordExamResultPage() {
  const params = useParams();
  const router = useRouter();
  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const examId = params?.id as string;

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        setError(null);

        // Kiểm tra examId có tồn tại không
        if (!examId) {
          throw new Error("Không tìm thấy ID bài thi");
        }

        // Thay thế phần simulate này bằng API call thực tế
        // const resultData = await wordExamService.getExamResult(examId);

        // Simulate API call với error handling
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockResult: ExamResult = {
          score: 8.5,
          totalQuestions: 50,
          correctAnswers: 42,
          timeSpent: 89,
          examName: "Thi thử tốt nghiệp năm 2024",
          subject: "Toán học",
        };

        setResult(mockResult);
      } catch (err) {
        console.error("Error fetching exam result:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Có lỗi xảy ra khi tải kết quả bài thi"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [examId]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải kết quả...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Lỗi tải kết quả
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-4">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Thử lại
            </button>
            <button
              onClick={() => router.back()}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No result state
  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-gray-500 text-6xl mb-4">📊</div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Không có kết quả
          </h2>
          <p className="text-gray-600 mb-6">Không tìm thấy kết quả bài thi.</p>
          <button
            onClick={() => router.push("/")}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  // Helper functions
  const getScoreColor = (score: number): string => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 8) return "bg-green-100";
    if (score >= 6) return "bg-yellow-100";
    return "bg-red-100";
  };

  const getPerformanceText = (score: number): string => {
    if (score >= 8) return "Xuất sắc";
    if (score >= 6) return "Khá";
    return "Cần cải thiện";
  };

  // Safe calculations
  const correctPercentage =
    result.totalQuestions > 0
      ? ((result.correctAnswers / result.totalQuestions) * 100).toFixed(1)
      : "0";

  const avgTimePerQuestion =
    result.totalQuestions > 0
      ? (result.timeSpent / result.totalQuestions).toFixed(1)
      : "0";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Kết quả bài thi
            </h1>
            <p className="text-lg text-gray-600 mb-4">{result.examName}</p>
            <p className="text-gray-500">{result.subject}</p>
          </div>
        </div>

        {/* Score Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="text-center">
            <div
              className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${getScoreBgColor(
                result.score
              )} mb-6`}
            >
              <span
                className={`text-4xl font-bold ${getScoreColor(result.score)}`}
              >
                {result.score}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Điểm số</h2>
            <p className="text-gray-600">Thang điểm 10</p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {result.correctAnswers}
            </div>
            <p className="text-gray-600">Câu trả lời đúng</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">
              {result.totalQuestions - result.correctAnswers}
            </div>
            <p className="text-gray-600">Câu trả lời sai</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {result.timeSpent}
            </div>
            <p className="text-gray-600">Thời gian làm bài (phút)</p>
          </div>
        </div>

        {/* Performance Analysis */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Phân tích kết quả
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Tỷ lệ đúng:</span>
              <span className="font-semibold">{correctPercentage}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">
                Thời gian trung bình mỗi câu:
              </span>
              <span className="font-semibold">{avgTimePerQuestion} phút</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Đánh giá:</span>
              <span className={`font-semibold ${getScoreColor(result.score)}`}>
                {getPerformanceText(result.score)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => router.push("/")}
            className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            ← Quay lại
          </button>
          <button
            onClick={() => {
              if (examId) {
                router.push(`/thi-thu/word-exam/${examId}`);
              } else {
                router.push("/");
              }
            }}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Bắt đầu thi
          </button>
        </div>
      </div>
    </div>
  );
}
