import React, { useEffect } from "react";
import { Exam } from "../card/Card"; // Import Exam interface
import { getUnifiedQuestionCount } from "@/utils/examQuestionCounter";

interface ExamReadyScreenProps {
  exam: Exam;
  onGoBack: () => void;
  onStart: () => void; // Add new prop
}

const ExamReadyScreen: React.FC<ExamReadyScreenProps> = ({
  exam,
  onGoBack,
  onStart,
}) => {
  useEffect(() => {
    // handle call api
    /**
     * /exam/v2/verify-exam
     * /exam/v2/detail
     * /exam/v2/let-question
     * /exam/v2/let-file
     */
  }, []);
  return (
    <div className="flex flex-col items-center justify-center px-4 py-8 md:p-8">
      {" "}
      {/* Changed p-8 to px-4 py-8 md:p-8 for responsive padding */}
      <img
        src="/icon/exam-ready.svg"
        alt="Ready for Exam"
        className="w-64 h-auto mb-8"
      />
      <h2 className="text-2xl font-bold text-blue-600 mb-4">Hãy sẵn sàng</h2>
      <p className="text-gray-700 text-center mb-8">
        Bài thi sẽ bắt đầu tính giờ ngay sau khi bạn bắt đầu.
      </p>
      <div className="bg-white rounded-lg border p-6 w-full md:max-w-2xl lg:max-w-3xl flex flex-col items-center">
        <h3 className="text-lg font-bold text-blue-600 mb-2">
          {exam.name.replace(/\n/g, " ")}
        </h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-gray-600 text-sm mb-4 w-full">
          <div className="flex items-center">
            <img
              src="/icon/question.svg"
              alt="Number of questions"
              className="w-4 h-4 mr-2"
            />
            <span>Số câu: {getUnifiedQuestionCount(exam)}</span>
          </div>
          <div className="flex items-center">
            <img src="/icon/write.svg" alt="Status" className="w-4 h-4 mr-2" />
            <span>
              Tình trạng:{" "}
              <span
                className={`${
                  exam.status === "finished" ? "text-green-500" : "text-red-500"
                }`}
              >
                {exam.status === "finished" ? "Đã làm" : "Chưa làm"}
              </span>
            </span>
          </div>
          <div className="flex items-center">
            <img src="/icon/time.svg" alt="Duration" className="w-4 h-4 mr-2" />
            <span>Thời gian: {exam.duration} phút</span>
          </div>
          <div className="flex items-center">
            <img src="/icon/point.svg" alt="Score" className="w-4 h-4 mr-2" />
            <span>
              Điểm: {exam.status === "finished" ? exam.score : "Chưa có"}
            </span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mt-6 w-full">
          {" "}
          {/* Add flex-col sm:flex-row for buttons to stack on very small screens */}
          <button
            className="flex-1 py-2 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-50 flex items-center justify-center"
            onClick={onGoBack}
          >
            <img
              src="/imgs/home/arrow-left.svg"
              alt="Quay lại"
              className="w-4 h-4 mr-2"
            />
            Quay lại trang chủ
          </button>
          <button
            className="flex-1 py-2 rounded-md font-semibold bg-blue-600 text-white hover:bg-blue-700"
            onClick={onStart} // Call onStart
          >
            Bắt đầu thi
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamReadyScreen;
