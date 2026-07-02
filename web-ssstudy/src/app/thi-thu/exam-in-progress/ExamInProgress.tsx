import React, { useState, useEffect } from "react";
import { Exam } from "../card/Card";
import { getUnifiedQuestionCount } from "@/utils/examQuestionCounter";

interface ExamInProgressProps {
  exam: Exam;
  onEndExam: () => void;
}

interface Question {
  id: number;
  type: "single_choice" | "fill_in_blank";
  options?: string[]; // For multiple choice
  answer?: string; // For fill in the blank
}

const ExamInProgress: React.FC<ExamInProgressProps> = ({ exam, onEndExam }) => {
  const [timeRemaining, setTimeRemaining] = useState(exam.duration * 60); // Convert minutes to seconds
  const [progress, setProgress] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(1); // Track current question

  // Calculate total questions using unified function
  const totalQuestions = getUnifiedQuestionCount(exam);

  // Simulate questions (replace with actual data fetching)
  const questions: Question[] = Array.from(
    { length: totalQuestions },
    (_, i) => ({
      id: i + 1,
      type: i % 2 === 0 ? "single_choice" : "fill_in_blank",
      options: i % 2 === 0 ? ["A", "B", "C", "D"] : undefined,
    })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          onEndExam(); // End exam when time runs out
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onEndExam]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:
            ${minutes.toString().padStart(2, "0")}:
            ${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const renderQuestionInput = (question: Question) => {
    if (question.type === "single_choice") {
      return (
        <div className="flex flex-wrap gap-2">
          {question.options?.map((option) => (
            <button
              key={option}
              className="px-4 py-2 border rounded-md hover:bg-gray-100"
            >
              {option}
            </button>
          ))}
        </div>
      );
    } else if (question.type === "fill_in_blank") {
      return (
        <input
          type="text"
          placeholder="Thả vào đây"
          className="border border-gray-300 rounded-md p-2 w-full"
        />
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left Section (PDF Viewer) */}
      <div className="flex-1 bg-gray-200 p-4 md:p-8 flex items-center justify-center">
        <p className="text-gray-500">
          [Nội dung PDF của bài thi sẽ được hiển thị ở đây]
        </p>
      </div>

      {/* Right Section (Questions & Timer) */}
      <aside className="w-full md:w-1/3 bg-white border-l shadow-lg p-4 md:p-6 flex flex-col">
        {/* Timer */}
        <div className="bg-blue-600 text-white p-4 rounded-lg text-center mb-4">
          <h3 className="text-sm font-semibold">Thời gian làm bài</h3>
          <p className="text-2xl font-bold">{formatTime(timeRemaining)}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold">Tiến độ:</span>
            <span className="text-sm text-gray-600">
              {progress}/{questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${(progress / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Navigation Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-6">
          {" "}
          {/* Adjusted for responsiveness */}
          {questions.map((q, index) => (
            <button
              key={q.id}
              className={`px-3 py-1 border rounded-md ${
                q.id === currentQuestion
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              onClick={() => setCurrentQuestion(q.id)}
            >
              {q.id}
            </button>
          ))}
        </div>

        {/* Current Question Section */}
        <div className="flex-1 overflow-y-auto mb-6 p-4 border rounded-lg">
          <h4 className="font-bold mb-2">Câu {currentQuestion}</h4>
          {/* Render specific question input based on currentQuestion type */}
          {renderQuestionInput(questions[currentQuestion - 1])}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {" "}
          {/* Added flex-col for stacking on mobile */}
          <button
            className="flex-1 py-2 rounded-md border border-red-600 text-red-600 hover:bg-red-50"
            onClick={onEndExam}
          >
            Ngừng làm
          </button>
          <button
            className="flex-1 py-2 rounded-md font-semibold bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => alert("Nộp bài!")}
          >
            Nộp bài
          </button>
        </div>
      </aside>
    </div>
  );
};

export default ExamInProgress;
