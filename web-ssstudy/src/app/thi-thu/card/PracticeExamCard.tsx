import {
  Typography,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { Input } from "@/components/ui/input";
import { ExamItem } from "@/services/examService";
import { ArrowDownToLine, Lock, Unlock } from "lucide-react";
import { wordExamService } from "@/services/wordExamService";
import React, { useEffect, useState } from "react";
import { cn } from "@/utils/cn";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import FastGiftTag from "./FastGiftTag";

interface PracticeExamCardProps {
  exam: ExamItem | any;
  onStartExam?: (exam: ExamItem) => void;
  isMobile: boolean;
  isLogin?: boolean;
  status?: "upcoming" | "active" | "ended";
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

const formatDateRange = (exam: any): JSX.Element | string => {
  // Ưu tiên dữ liệu ISO từ API: startDate / endDate
  const startRaw =
    exam.startDate ||
    exam.start_date ||
    exam.practiceConfig?.startDate ||
    exam.practiceConfig?.start_date ||
    exam.open_date;

  const endRaw =
    exam.endDate ||
    exam.end_date ||
    exam.practiceConfig?.endDate ||
    exam.practiceConfig?.end_date;

  if (!startRaw && !endRaw) return "";

  const start = startRaw ? new Date(startRaw) : null;
  const end = endRaw ? new Date(endRaw) : null;

  const formatDate = (date: Date) => {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const formatTime = (date: Date) => {
    const hh = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");
    return `${hh}:${mi}`;
  };

  // Có cả thời gian mở/đóng
  if (start && end) {
    const isSameDay =
      start.getFullYear() === end.getFullYear() &&
      start.getMonth() === end.getMonth() &&
      start.getDate() === end.getDate();

    if (isSameDay) {
      return (
        <>
          <span className="text-red-500">{formatDate(start)}</span>
          <span className="text-foundation-400"> từ </span>
          <span className="text-red-500">
            {formatTime(start)} - {formatTime(end)}
          </span>
        </>
      );
    }

    return (
      <>
        <span className="text-red-500">
          {formatTime(start)} {formatDate(start)}
        </span>
        <span className="text-foundation-400"> - </span>
        <span className="text-red-500">
          {formatTime(end)} {formatDate(end)}
        </span>
      </>
    );
  }

  if (start && !end) {
    return `${formatDate(start)} ${formatTime(start)}`;
  }

  if (!start && end) {
    return `${formatDate(end)} ${formatTime(end)}`;
  }

  return "";
};

const PracticeExamCard: React.FC<PracticeExamCardProps> = ({
  exam,
  onStartExam,
  isMobile,
  isLogin,
  status,
}) => {
  const router = useRouter();
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [unlockError, setUnlockError] = useState("");
  const [isCheckingPassword, setIsCheckingPassword] = useState(false);

  // Determine exam status based on response fields
  const requiresPassword =
    exam.practiceConfig?.required_passwword === true ||
    exam.practiceConfig?.required_password === true;

  const initialUnlocked =
    exam.is_unlocked ||
    exam.unlocked ||
    requiresPassword === false ||
    !requiresPassword;
  const [isUnlocked, setIsUnlocked] = useState<boolean>(!!initialUnlocked);
 
  const finishedNormalized =
    exam.finished === true || exam.status === "finished";
  // Khi đề đang ở trạng thái "active", không cho phép làm lại dù API có cho phép
  // Chỉ cho phép làm lại khi đề đã chuyển sang trạng thái "ended"
  const canRedo = status === "ended" && exam.is_redo !== false;
  const isActionDisabled =
    status === "upcoming" || (status === "ended" && !finishedNormalized);

  const examId =
    exam.exam_id || exam.id || exam._id || exam.practiceConfig?.exam_id;

  // Giữ trạng thái đã mở khóa theo exam_id trong localStorage để không phải nhập lại mật khẩu sau khi reload
  useEffect(() => {
    if (!requiresPassword || !examId) return;

    try {
      const key = `practiceExamUnlocked:${examId}`;
      const stored =
        typeof window !== "undefined" ? localStorage.getItem(key) : null;

      if (stored === "true") {
        setIsUnlocked(true);
      }
    } catch {
      // ignore storage errors
    }
  }, [examId, requiresPassword]);

  const handleUnlock = () => {
    if (isActionDisabled) return;

    if (!isLogin) {
      router.push("/auth/signin");
      return;
    }

    // Open unlock modal
    setIsUnlockModalOpen(true);
    setUnlockError("");
  };

  const handleCloseModal = () => {
    setIsUnlockModalOpen(false);
    setPassword("");
    setUnlockError("");
  };

  const handleConfirmUnlock = () => {
    if (!requiresPassword) {
      setIsUnlocked(true);
      handleCloseModal();
      return;
    }

    const trimmedPassword = password.trim();
    if (!trimmedPassword) {
      setUnlockError("Vui lòng nhập mật khẩu.");
      return;
    }

    if (!examId) {
      setUnlockError("Không xác định được mã đề thi.");
      return;
    }

    setIsCheckingPassword(true);
    setUnlockError("");

    wordExamService
      .checkExamPassword({
        exam_id: String(examId),
        password: trimmedPassword,
      })
      .then((res) => {
        const message = (res?.message || "").trim();

        if (res?.code === 200 && message === "Xác thực thành công!") {
          setIsUnlocked(true);
          try {
            if (typeof window !== "undefined" && examId) {
              const key = `practiceExamUnlocked:${examId}`;
              localStorage.setItem(key, "true");
            }
          } catch {
            // ignore storage errors
          }

          // Hiển thị thông báo mở khóa thành công
          toast.success("Bạn đã mở khóa đề thi thành công", {
            position: "top-right",
            autoClose: 3000,
          });

          handleCloseModal();
          return;
        }

        // Mặc định coi là sai mật khẩu nếu code=200 nhưng message khác
        setUnlockError("Mật khẩu không đúng. Vui lòng thử lại.");
      })
      .catch(() => {
        setUnlockError("Không thể kiểm tra mật khẩu. Vui lòng thử lại sau.");
      })
      .finally(() => {
        setIsCheckingPassword(false);
      });
  };

  const handleStartExam = () => {
    if (!isLogin) {
      router.push("/auth/signin");
      return;
    }
    if (onStartExam) {
      onStartExam(exam);
    }
  };

  const handleViewResults = () => {
    const examId = exam.exam_id || exam.id || exam._id;
    if (!examId) {
      return;
    }

    try {
      if (typeof window !== "undefined") {
        const key = `examReturnTo:${examId}`;
        const returnTo = `${window.location.pathname}${window.location.search}`;
        sessionStorage.setItem(key, returnTo);
      }
    } catch (error) {
      console.error("Error saving return URL:", error);
    }

    router.push(
      `/thi-thu/result/${examId}?categoryExam=${
        exam.categoryExam?.populate_id?.name || exam.type || ""
      }&name=${exam.name}`
    );
  };

  const handleDownload = () => {
    if (exam.exam_doc_link) {
      window.open(exam.exam_doc_link, "_blank");
    }
  };

  const isStartDisabled = (finishedNormalized && !canRedo) || isActionDisabled;
  const isViewResultDisabled =
    !finishedNormalized || !isLogin || isActionDisabled;
  const isDownloadDisabled =
    !isLogin || !exam.exam_doc_link || isActionDisabled;

  return (
    <div
      className={cn(
        "bg-white rounded-lg border p-4 flex justify-between gap-4 relative",
        isMobile ? "flex-col" : "flex-row items-center"
      )}
    >
      {/* Left Section: Category, Title and Date Info */}
      <div className="flex flex-col flex-grow mt-2 md:mt-0">
        <div className="absolute top-0 left-0">
          {renderLabelTypeExam(
            exam?.type || exam?.categoryExam?.populate_id?.name || ""
          )}
        </div>
        <Typography
          variant={isMobile ? "sm16" : "nm18"}
          className="text-foundation-500 font-bold mt-0 md:mt-2 lg:mt-3"
        >
          {exam.name?.replace(/\n/g, " ") || ""}
        </Typography>
        <div className="flex flex-col gap-1 mt-1">
          <div className="flex items-center gap-2">
            <img
              src="/icon/ic_lich-luyen-thi-thuc-chien.svg"
              alt="Lịch luyện thi"
              className="w-4 h-4"
            />
            {formatDateRange(exam) && (
              <Typography variant="xs14" className="text-foundation-400">
                Mở đề: {formatDateRange(exam)}
              </Typography>
            )}
          </div>
        </div>
      </div>

      {/* Right Section: Buttons */}
      <div className="flex-shrink-0 flex items-center gap-2 md:gap-4 justify-end flex-wrap">
        {/* Locked state - show unlock button */}
        {!isUnlocked ? (
          <button
            className={cn(
              "md:px-8 md:py-2 h-8 w-[140px] md:w-auto md:h-12 rounded-full text-white text-sm font-medium",
              "flex items-center justify-center gap-2",
              !isActionDisabled && status === "active"
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-400 cursor-not-allowed"
            )}
            onClick={handleUnlock}
            disabled={isActionDisabled || status === "ended"}
          >
            <Unlock className="size-4" />
            Mở khóa đề thi
          </button>
        ) : (
          /* Unlocked state - show action buttons */
          <>
            <div className="relative">
              <button
                className={cn(
                  "md:px-8 md:py-2 h-8 w-[100px] md:w-auto md:h-12 rounded-full text-sm font-medium",
                  isStartDisabled
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                )}
                onClick={handleStartExam}
                disabled={isStartDisabled}
                title={
                  finishedNormalized && status === "active"
                    ? "Đề đang mở, chỉ được làm bài 1 lần. Vui lòng đợi đề đóng để làm lại."
                    : undefined
                }
              >
                {finishedNormalized ? "Làm lại" : "Làm bài"}
              </button>

              {status !== "ended" && !finishedNormalized && <FastGiftTag exam={exam} />}
            </div>

            <button
              className={cn(
                "md:px-8 md:py-2 h-8 w-[100px] md:w-auto md:h-12 rounded-full border text-sm font-medium",
                isViewResultDisabled
                  ? "border-gray-300 text-gray-400 cursor-not-allowed bg-gray-100"
                  : "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
              )}
              disabled={isViewResultDisabled}
              onClick={handleViewResults}
            >
              Xem kết quả
            </button>

            <button
              className={cn(
                "size-8 md:size-12 flex items-center justify-center rounded-full border text-sm",
                isDownloadDisabled
                  ? "border-gray-300 text-gray-400 cursor-not-allowed bg-gray-100"
                  : "border-blue-600 text-blue-600 hover:bg-blue-50"
              )}
              onClick={handleDownload}
              disabled={isDownloadDisabled}
            >
              <ArrowDownToLine className="size-4 md:size-5" />
            </button>
          </>
        )}
      </div>

      {/* Unlock Exam Modal */}
      <Dialog open={isUnlockModalOpen} onOpenChange={setIsUnlockModalOpen}>
        <DialogContent
          className="max-w-lg w-[90vw] p-6 md:p-8 !z-[10000]"
          overlayClassName="!z-[9999]"
          onBackClick={handleCloseModal}
          showCloseButton={true}
        >
          <DialogHeader className="mb-4">
            <DialogTitle className="text-black font-bold text-xl text-center ">
              Mở khóa đề thi
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-6">
            <Typography
              variant="sm16"
              className="text-foundation-400 text-left"
            >
              Nhập mật khẩu để mở khóa đề thi
            </Typography>

            <div className="flex flex-col gap-2">
              <Input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-gray-100 border-0 text-base"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleConfirmUnlock();
                  }
                }}
                autoFocus
              />
              {unlockError && (
                <Typography variant="xs14" className="text-red-500">
                  {unlockError}
                </Typography>
              )}
            </div>

            <button
              onClick={handleConfirmUnlock}
              disabled={isCheckingPassword}
              className="w-full h-12 rounded-full bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors mt-2"
            >
              {isCheckingPassword ? "Đang kiểm tra..." : "XÁC NHẬN"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PracticeExamCard;
