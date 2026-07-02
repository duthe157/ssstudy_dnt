"use client";

import { Button, Typography } from "@/components/ui";
import { useCheckAnswer } from "@/hooks/api";
import { wordExamService } from "@/services/wordExamService";
import { ChevronLeft } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo } from "react";
import CheatWarningModal from "@/components/exam/CheatWarningModal";
import LuckyMoneyModal from "@/components/exam/LuckyMoney";

const ExamResultPage = () => {
  const searchParams = useSearchParams();
  const param = useParams();
  const router = useRouter();

  const id = param?.id;
  const categoryExam = searchParams?.get("categoryExam");
  const name = searchParams?.get("name");

  const { data, isMutating, trigger } = useCheckAnswer();
  const [practiceConfig, setPracticeConfig] = React.useState<any | null>(null);
  const [showLuckyMoney, setShowLuckyMoney] = React.useState(false);
  const [luckyMoneyData, setLuckyMoneyData] = React.useState<any>(null);
  const [examFinished, setExamFinished] = React.useState<boolean | null>(null);

  // Đọc trạng thái finished từ sessionStorage (do WordExamViewer lưu trước khi chuyển trang)
  useEffect(() => {
    if (!id) return;
    try {
      const key = `wordExamFinished:${id}`;
      const stored = sessionStorage.getItem(key);
      if (stored !== null) {
        setExamFinished(JSON.parse(stored));
        sessionStorage.removeItem(key); // Xóa sau khi đọc
      }
    } catch {}
  }, [id]);

  // Hiển banner khi data API sẵn sàng + examFinished === false + gift_image có
  useEffect(() => {
    if (data && examFinished === false) {
      const apiData = data as any;
      if (apiData?.data?.gift_image) {
        setLuckyMoneyData(apiData.data);
        const timer = setTimeout(() => {
          setShowLuckyMoney(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [data, examFinished]);

  useEffect(() => {
    if (id) {
      const stored = localStorage.getItem("user");
      if (stored) {
        const u = JSON.parse(stored);
        trigger({ user_id: u.id, exam_id: String(id) });
      }
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    wordExamService
      .getWordExamById(String(id))
      .then((response) => {
        if (cancelled) return;
        if (response?.code === 200 && response.data?.practiceConfig) {
          setPracticeConfig(response.data.practiceConfig);
        } else {
          setPracticeConfig(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPracticeConfig(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Hàm xử lý nút quay lại
  const handleBackToHome = React.useCallback(() => {
    try {
      if (typeof window !== "undefined" && id) {
        const key = `examReturnTo:${id}`;
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
  }, [id, router]);

  const trapHistoryState = React.useCallback(
    (force = false) => {
      if (typeof window === "undefined" || !id) return;
      try {
        const currentState =
          (typeof window.history.state === "object" && window.history.state) ||
          {};
        if (!force && currentState?.examResultTrapId === id) {
          return;
        }
        window.history.pushState(
          { ...currentState, examResultTrapId: id },
          "",
          window.location.href
        );
      } catch (error) {
        console.warn("[ExamResultPage] Không thể ghi history", error);
      }
    },
    [id]
  );

  // Xử lý browser back button để quay về đúng trang (thi thử hoặc lesson)
  useEffect(() => {
    if (!id) return;

    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault?.();
      trapHistoryState(true);
      handleBackToHome();
    };

    trapHistoryState();
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [id, handleBackToHome, trapHistoryState]);

  const isExamEnded = React.useMemo(() => {
    if (!practiceConfig) return false;
    if (practiceConfig.status === "ended") return true;
    const endRaw = practiceConfig.endDate || practiceConfig.end_date;
    if (!endRaw) return false;
    const now = new Date();
    const endDate = new Date(endRaw);
    return now >= endDate;
  }, [practiceConfig]);

  const resultDisplayMode: "IMMEDIATELY" | "LATER" =
    practiceConfig?.result_display === "LATER" ? "LATER" : "IMMEDIATELY";
  const isPracticeStatusTrue =
    practiceConfig?.status === true || practiceConfig?.status === "true";

  const shouldDelayResult =
    isPracticeStatusTrue && resultDisplayMode === "LATER" && !isExamEnded;
  const [showModal, setShowModal] = React.useState(true);

  // Reset showModal khi shouldDelayResult thay đổi
  React.useEffect(() => {
    if (shouldDelayResult) {
      setShowModal(true);
    }
  }, [shouldDelayResult]);

  const total = useMemo(
    () => Number(data?.data?.latestScore?.total_question) || 0,
    [data]
  );
  const correct = useMemo(
    () => Number(data?.data?.latestScore?.questions_correct) || 0,
    [data]
  );
  const scoreAchieve = useMemo(
    () => Number(data?.data?.latestScore?.total_score_achieve) || 0,
    [data]
  );

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  };

  const formattedTime = useMemo(
    () => formatTime(Number(data?.data?.latestScore?.time_doing) || 0),
    [data]
  );

  return (
    <div className="mx-auto w-full max-w-[611px] p-[10px]">
      <div className="flex flex-col justify-center items-center mb-[18px]">
        <img
          src="/icon/icon-hoanthanh.svg"
          alt="Hoàn thành"
          className="h-[200px] object-cover"
          loading="lazy"
        />
        <Typography variant={"lg24"} className="text-blue-500 mt-7">
          Bạn đã hoàn thành!
        </Typography>
        <Typography variant={"sm16"} className="text-foundation-400">
          Chúc mừng bạn đã hoàn thành bài thi, sau đây là kết quả
        </Typography>
      </div>
      <div className="bg-white border p-8 rounded-md relative overflow-hidden">
        <Typography variant={"sm16"} className="text-blue-500 text-center">
          {categoryExam}
        </Typography>
        <Typography
          variant={"nm18"}
          className="text-foundation-500 text-center mt-2 h-[52px]"
        >
          {name}
        </Typography>
        {!shouldDelayResult && (
          <>
            <div className="flex items-center mt-[18px]">
              <div className="flex-1 flex items-center gap-2">
                <Typography
                  variant={"xs14"}
                  className="text-grey-90 font-medium"
                >
                  Thời gian hoàn thành:
                </Typography>
                <Typography
                  variant={"xs12"}
                  className="rounded bg-blue-600 px-3 py-1 font-semibold text-white"
                >
                  {formattedTime}
                </Typography>
              </div>
              <div className="flex-1 flex items-center gap-2">
                <Typography
                  variant={"xs14"}
                  className="text-grey-90 font-medium"
                >
                  Tổng điểm:
                </Typography>
                <Typography
                  variant={"xs12"}
                  className="rounded bg-blue-600 px-3 py-1 font-semibold text-white"
                >
                  {scoreAchieve}/{data?.data?.latestScore?.total_exam_point || 0}
                </Typography>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="my-4">
              <div className="flex items-center justify-between">
                <Typography
                  variant={"xs14"}
                  className="text-grey-90 font-medium"
                >
                  Đáp án đúng:
                </Typography>

                {/* Progress bar dày hơn về chiều ngang */}
                <div className="mx-2 flex h-5 flex-1 overflow-hidden rounded-full bg-gray-200">
                  {(() => {
                    const pct =
                      total > 0
                        ? Math.max(0, Math.min(100, (correct / total) * 100))
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

                <Typography variant={"sm16"} className="text-grey-90">
                  {correct}/{total}
                </Typography>
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
                  {data?.data?.latestScore?.exam_section?.map((part, index) => (
                    <React.Fragment key={index}>
                      {/* Phần chính - căn trái */}
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-left">
                          <Typography variant={"xs14"} className="text-grey-90">
                            {part.part_name}
                          </Typography>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Typography variant={"xs14"} className="text-grey-90">
                            {part.score_achieve}/{part.total_point}
                          </Typography>
                        </td>
                      </tr>

                      {/* Các môn con (nếu có) - căn trái với thụt lề */}
                      {part.childLogs &&
                        part.childLogs.length > 0 &&
                        part.childLogs.map((subSection, subIndex) =>
                          !subSection.isMain ? (
                            <tr
                              key={`${index}-${subIndex}`}
                              className="bg-gray-25 hover:bg-gray-50"
                            >
                              <td className="px-6 py-3 text-left text-sm text-gray-700">
                                <div className="font-normal pl-4">
                                  {subSection.subpart_name ||
                                    subSection.child_name}
                                </div>
                              </td>
                              <td className="px-6 py-3 text-center text-sm text-gray-700">
                                {subSection.score_achieve}/
                                {subSection.total_child_point}
                              </td>
                            </tr>
                          ) : null
                        )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* 2 nút - luôn hiển thị */}
        <div className="flex items-center gap-4 mt-4">
          <Button
            className="flex-1 border-blue-500 h-[54px]"
            variant={"outline"}
            onClick={handleBackToHome}
          >
            <ChevronLeft className="size-6 text-blue-500" />
            <Typography
              variant={"sm16"}
              className="ml-2 font-bold text-blue-500"
            >
              Quay lại
            </Typography>
          </Button>
          <Button
            className="flex-1 bg-blue-500 h-[54px]"
            onClick={() => {
              // Link đến trang explanation mới cho result page
              const queryParams = new URLSearchParams();
              if (categoryExam) queryParams.set("categoryExam", categoryExam);
              if (name) queryParams.set("name", name);
              
              // Gỡ bỏ cờ fromLesson khi đi từ trang kết quả để hiển thị nút thi lại theo yêu cầu
              // queryParams.set("fromLesson", "true");
              
              const queryString = queryParams.toString();
              router.push(
                `/thi-thu/result/${id}/explanation${
                  queryString ? `?${queryString}` : ""
                }`
              );
            }}
          >
            <Typography variant={"sm16"} className="font-bold text-white">
              Xem đáp án
            </Typography>
          </Button>
        </div>

        <CheatWarningModal
          open={shouldDelayResult && showModal}
          onClose={() => setShowModal(false)}
          message="Bạn đã nộp bài thành công,\nKết quả sẽ được hiển thị sau khi đóng đề."
          showActions={false}
        />

        {/* Modal chúc mừng cho lần đầu hoàn thành bài thi (finished === false) */}
        {luckyMoneyData?.gift_image && (
          <LuckyMoneyModal
            open={showLuckyMoney}
            onClose={() => setShowLuckyMoney(false)}
            bannerImage={luckyMoneyData.gift_image}
            redirectUrl={luckyMoneyData.gift_url}
            ctaIcon={luckyMoneyData.gift_CTA}
          />
        )}
      </div>
    </div>
  );
};

export default ExamResultPage;
