import { Typography } from "@/components/ui";
import { ExamItem } from "@/services/examService";
import { ArrowDownToLine } from "lucide-react";
import React, { useEffect, useState } from "react";
import { cn } from "@/utils/cn";
import { useRouter } from "next/navigation";
import FastGiftTag from "./FastGiftTag";

export interface Exam {
  _id: string;
  name: string;
  number_of_questions: number;
  duration: number;
  status: string;
  score?: number;
  year: number;
}

interface CardProps {
  exam: ExamItem | any;
  onStartExam: (exam: ExamItem) => void;
  categoryLabel: string;
  isMobile: boolean;
  isLogin?: boolean;
}

const renderLabelTypeExam = (type: string) => {
  const baseClass = "text-xs font-semibold px-2 py-1 rounded-md w-fit";

  switch (type?.toUpperCase()) {
    case "TỐT NGHIỆP":
      return (
        <div className={`${baseClass} text-purple-700 bg-purple-50`}>
          Tốt Nghiệp
        </div>
      );

    case "APT":
      return (
        <div className={`${baseClass} text-green-600 bg-green-50`}>APT</div>
      );

    case "TSA":
      return (
        <div className={`${baseClass} text-orange-700 bg-orange-50`}>TSA</div>
      );

    case "V-ACT":
      return (
        <div className={`${baseClass} text-green-700 bg-green-50`}>V-ACT</div>
      );

    case "HSA":
    default:
      return <div className={`${baseClass} text-blue-500 bg-blue-50`}>HSA</div>;
  }
};

const Card: React.FC<CardProps> = ({
  exam,
  onStartExam,
  isMobile,
  isLogin,
}) => {
  const router = useRouter();
  const [isAttempted, setIsAttempted] = useState<boolean>(false);

  useEffect(() => {
    try {
      const key = `wordExamAttempted:${exam._id || exam.id}`;
      const val =
        typeof window !== "undefined" ? localStorage.getItem(key) : null;
      setIsAttempted(Boolean(val));
    } catch {
      setIsAttempted(false);
    }
  }, [exam._id, exam.id]);

  return (
    <div
      key={exam._id || exam.id}
      className={cn(
        "bg-white rounded-lg border p-4 flex justify-between gap-4 relative",
        isMobile ? "flex-col" : "flex-row items-center"
      )}
    >
      <div className="flex flex-col flex-grow mt-2 md:mt-0">
        <div className="absolute top-0 left-0">
          {renderLabelTypeExam(exam?.categoryExam?.populate_id?.name || exam.type)}
        </div>
        <Typography
          variant={isMobile ? "sm16" : "nm18"}
          className="text-foundation-500 font-bold mt-0 md:mt-2 lg:mt-3"
        >
          {exam.name?.replace(/\n/g, " ") || ""}
        </Typography>
      </div>

      <div className="flex-shrink-0 flex items-center gap-4 justify-end">
        <div className="relative">
          <button
            className={cn(
              "md:px-8 md:py-2 h-8 w-[100px] md:w-auto md:h-12 rounded-full bg-blue-600 text-white text-sm font-medium",
              "hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
            )}
            onClick={() => onStartExam(exam)}
            disabled={exam.finished ? !exam.is_redo : false}
          >
            {exam.finished ? "Làm lại" : "Làm bài"}
          </button>

          {!exam.finished && <FastGiftTag exam={exam} />}

        </div>
        <button
          className={cn(
            "md:px-8 md:py-2 h-8 w-[100px] md:w-auto md:h-12 rounded-full border border-blue-600 text-blue-600 text-sm font-medium",
            exam.finished
              ? "text-blue-500 hover:bg-blue-600 hover:text-white"
              : "text-[#BDBDBD] border-[#BDBDBD] cursor-not-allowed"
          )}
          disabled={!exam.finished || !isLogin}
          onClick={() => {
            try {
              if (typeof window !== "undefined" && (exam.id || exam._id)) {
                const key = `examReturnTo:${exam.id || exam._id}`;
                const returnTo = `${window.location.pathname}${window.location.search}`;
                sessionStorage.setItem(key, returnTo);
              }
            } catch (error) {
              console.error("Error saving return URL:", error);
            }
            router.push(
              `/thi-thu/result/${exam.id || exam._id}?categoryExam=${exam.categoryExam?.populate_id?.name || exam.type || ""}&name=${exam.name}`
            );
          }}
        >
          Xem kết quả
        </button>
        <button
          className="size-8 md:size-12 flex items-center justify-center rounded-full border border-blue-600 text-blue-600 hover:bg-blue-50 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed"
          onClick={() => window.open(exam.exam_doc_link, "_blank")}
          disabled={!isLogin}
        >
          <ArrowDownToLine className="size-4 md:size-5" />
        </button>
      </div>
    </div>
  );
};

export default Card;
