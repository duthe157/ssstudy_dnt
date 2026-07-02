"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { verifyExam } from "@/lib/exam-data";
import { authService } from "@/services/authService";
import { wordExamService } from "@/services/wordExamService";
import { getUnifiedQuestionCount } from "@/utils/examQuestionCounter";

export default function WordExamReadyPage() {
  const params = useParams<{ id: string }>();
  const examId = params?.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const practiceStatus = searchParams?.get("practiceStatus");
  const fromEndedTab = practiceStatus === "ended";
  const [exam, setExam] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [savedProgress, setSavedProgress] = useState<{
    timeRemaining?: number;
    updatedAt?: number;
  } | null>(null);
  const [isAttempted, setIsAttempted] = useState<boolean>(false);
  const [listFinished, setListFinished] = useState<boolean | null>(null);
  const [checkAnswerFinished, setCheckAnswerFinished] = useState<
    boolean | null
  >(null);
  const storageKey = useMemo(
    () => (examId ? `wordExamProgress:${examId}` : ""),
    [examId]
  );

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        if (!examId) {
          if (mounted) setExam(null);
          return;
        }
        let resolvedCreatingType = "word";
        if (!resolvedCreatingType) {
          try {
            const verify = await verifyExam(examId);
            resolvedCreatingType = (verify as any)?.data?.creating_type || "";
          } catch {}
        }
        if (!resolvedCreatingType) {
          console.warn(
            "[WordExamReadyPage] ⚠️ No creating type resolved, proceeding anyway"
          );
        }

        const response = await wordExamService.getWordExamById(examId);

        const data = response.code === 200 ? response.data : null;
        if (mounted) setExam(data);
      } catch (e) {
        if (mounted) setExam(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [examId]);

  useEffect(() => {
    if (!examId) return;
    try {
      const key = `wordExamProgress:${examId}`;
      const raw = localStorage.getItem(key);
      if (!raw) {
        setSavedProgress(null);
        return;
      }
      const saved = JSON.parse(raw || "null");
      if (saved && saved.examId === examId) {
        setSavedProgress({
          timeRemaining: saved.timeRemaining,
          updatedAt: saved.updatedAt,
        });
      } else {
        setSavedProgress(null);
      }
    } catch {
      setSavedProgress(null);
    }
  }, [examId]);

  useEffect(() => {
    if (!examId) return;
    try {
      const k = `wordExamAttempted:${examId}`;
      const v = localStorage.getItem(k);
      setIsAttempted(Boolean(v));
    } catch {
      setIsAttempted(false);
    }
  }, [examId]);

  //  Xử lý browser back button để quay về đúng trang (thi thử hoặc lesson)
  useEffect(() => {
    if (!examId) return;

    const handlePopState = () => {
      try {
        if (typeof window !== "undefined") {
          const key = `examReturnTo:${examId}`;
          const saved = sessionStorage.getItem(key);
          if (saved && typeof saved === "string") {
            router.replace(saved);
            return;
          }
        }
      } catch (error) {
        console.error("Error handling popstate:", error);
      }
      // Fallback về trang thi thử
      router.replace("/thi-thu");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [examId, router]);

  useEffect(() => {
    if (!examId) {
      setListFinished(null);
      return;
    }
    if (!exam) return;

    let cancelled = false;

    const resolveFinishedStatus = async () => {
      const keywords = Array.from(
        new Set(
          [examId, exam?.name, (exam as any)?.title]
            .map((value) => (typeof value === "string" ? value.trim() : ""))
            .filter(Boolean)
        )
      );

      if (keywords.length === 0) {
        if (!cancelled) setListFinished(null);
        return;
      }

      for (const keyword of keywords) {
        try {
          const response = await wordExamService.getWordExamList({
            page: 1,
            limit: 10,
            keyword,
          });
          const items = Array.isArray(response?.data?.data)
            ? response.data.data
            : [];
          const target = items.find(
            (item: any) => item?._id === examId || item?.id === examId
          );
          if (target) {
            if (!cancelled) setListFinished(Boolean(target.finished));
            return;
          }
        } catch (error) {
          console.warn(
            `[WordExamReadyPage] Không thể lấy trạng thái finished với từ khóa "${keyword}"`,
            error
          );
        }
      }

      if (!cancelled) setListFinished(null);
    };

    resolveFinishedStatus();

    return () => {
      cancelled = true;
    };
  }, [examId, exam]);

  useEffect(() => {
    if (!examId) return;
    const fetchCheckAnswer = async () => {
      try {
        const user = authService.getCurrentUser();
        const userId = user?.user_id || user?._id || user?.id || user?.userId;
        if (!userId) {
          setCheckAnswerFinished(null);
          return;
        }

        const res = await wordExamService.checkWordExamAnswer({
          user_id: userId,
          exam_id: examId,
        });
        if (res && res.data) {
          setCheckAnswerFinished(Boolean(res.data.hasTaken));
        }
      } catch (error) {
        console.warn("Error checking exam answer status:", error);
        setCheckAnswerFinished(null);
      }
    };
    fetchCheckAnswer();
  }, [examId]);

  const display = useMemo(() => {
    if (!exam)
      return {
        name: "",
        categoryName: "",
        totalQuestions: 0,
        duration: 0,
        isFinished: false,
        score: null,
      };

    // Calculate total questions using unified function
    const totalQuestions = getUnifiedQuestionCount(exam);

    // Calculate exam time (prioritize API top-level time for Ready screen)
    const duration = (() => {
      try {
        const config =
          (exam?.categoryExam?.populate_id?.config?.[0] as any) || {};
        const viewExamPerPart = Boolean(config.viewExamPerPart);
        const viewOneQuestion = Boolean(config.viewOneQuestion);
        const timePerPart = Boolean(config.timePerPart);
        const usePartTimer = viewExamPerPart || viewOneQuestion || timePerPart;

        // Helper: get part time for a given part, mimicking viewer logic
        const getPartTime = (partIndex: number): number => {
          const part = Array.isArray(exam.parts) ? exam.parts[partIndex] : null;
          if (!part) return 0;

          // NHOM_CHU_DE: fallback to first child time if available
          if (part.type === "NHOM_CHU_DE") {
            const subparts = Array.isArray(part.subpart) ? part.subpart : [];
            for (const sp of subparts) {
              const children = Array.isArray(sp?.children) ? sp.children : [];
              if (children.length > 0) {
                const t = Number(children[0]?.time) || 0;
                if (t > 0) return t;
              }
            }
            return Number(part.time) || 0;
          }

          // Normal part: use part.time
          return Number(part.time) || 0;
        };

        // Ready screen should show the total time provided by API when available
        const topTime = Number((exam as any).time) || 0;
        if (topTime > 0) return topTime;

        if (usePartTimer) {
          // Show time for the first part (the one user is about to start)
          const firstPartTime = getPartTime(0);
          return firstPartTime > 0 ? firstPartTime : 30;
        }

        // FULL_EXAM: fallback sum of part times, else 90
        const totalPartsTime = (
          Array.isArray(exam.parts) ? exam.parts : []
        ).reduce((sum: number, p: any) => sum + (Number(p?.time) || 0), 0);
        return totalPartsTime > 0 ? totalPartsTime : 90;
      } catch {
        return Number((exam as any)?.time) || 0;
      }
    })();

    const categoryName =
      (exam?.categoryExam?.populate_id?.name as string) || "";

    return {
      name: exam.name || exam.title || "",
      categoryName,
      totalQuestions,
      duration,
      isFinished:
        checkAnswerFinished ??
        listFinished ??
        (exam.status === "finished" || isAttempted === true),
      score: exam.score ?? exam.exam_total_score ?? null,
    };
  }, [exam, isAttempted, listFinished, checkAnswerFinished]);

  const handleGoBack = () => {
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
  };

  const allowRetake = Boolean((exam as any)?.is_redo);
  const isFinishedStrict = checkAnswerFinished ?? listFinished ?? false;
  const disableStart = !allowRetake && isFinishedStrict;
  const isRedoSession = allowRetake && (isFinishedStrict || isAttempted);

  const handleStart = () => {
    if (disableStart) return;
    // Ensure a fallback origin exists if user deep-linked here
    try {
      if (typeof window !== "undefined" && examId) {
        const key = `examReturnTo:${examId}`;
        if (!sessionStorage.getItem(key)) {
          let fallback = "/thi-thu";
          try {
            const ref = document.referrer;
            const origin = window.location.origin;
            if (ref && ref.startsWith(origin)) {
              const url = new URL(ref);
              fallback = `${url.pathname}${url.search}` || fallback;
            }
          } catch {}
          sessionStorage.setItem(key, fallback);
        }
      }
    } catch {}
    // Nếu được phép thi lại (is_redo === true) thì giữ màn ready trong lịch sử (push)
    // Ngược lại, dùng replace để back không quay về ready
    // Đánh dấu đã vào làm lần đầu nếu không cho phép làm lại
    try {
      if (!allowRetake && examId) {
        localStorage.setItem(`wordExamAttempted:${examId}`, "1");
        setIsAttempted(true);
      }
    } catch {}

    // Nếu được phép thi lại: xóa tiến độ cũ để bắt đầu như mới
    const targetUrl =
      fromEndedTab || isRedoSession
        ? `/thi-thu/word-exam/${examId}?mode=retake`
        : `/thi-thu/word-exam/${examId}`;

    // Lưu trạng thái finished vào sessionStorage để WordExamViewer biết đề đã làm hay chưa
    try {
      if (examId) {
        const finishedStatus = checkAnswerFinished ?? listFinished ?? false;
        sessionStorage.setItem(
          `examFinishedStatus:${examId}`,
          JSON.stringify(finishedStatus)
        );
      }
    } catch {}

    if (allowRetake || fromEndedTab) {
      try {
        if (storageKey) localStorage.removeItem(storageKey);
      } catch {}
      try {
        if (examId) sessionStorage.removeItem(`examReload:${examId}`);
      } catch {}
      router.push(targetUrl);
    } else router.replace(targetUrl);
  };
  const handleResume = () => {
    try {
      if (typeof window !== "undefined" && examId) {
        const key = `examReturnTo:${examId}`;
        if (!sessionStorage.getItem(key)) {
          let fallback = "/thi-thu";
          try {
            const ref = document.referrer;
            const origin = window.location.origin;
            if (ref && ref.startsWith(origin)) {
              const url = new URL(ref);
              fallback = `${url.pathname}${url.search}` || fallback;
            }
          } catch {}
          sessionStorage.setItem(key, fallback);
        }
      }
    } catch {}
    const targetUrl =
      fromEndedTab || isRedoSession
        ? `/thi-thu/word-exam/${examId}?mode=retake`
        : `/thi-thu/word-exam/${examId}`;
    if (allowRetake || fromEndedTab || isRedoSession) router.push(targetUrl);
    else router.replace(targetUrl);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-gray-500">Đang tải thông tin bài thi...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex flex-col items-center justify-center px-4 py-8 md:p-8 flex-1 pb-20 md:pb-8">
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
          {display.categoryName ? (
            <div className="text-sm font-semibold text-blue-600 mb-1">
              {display.categoryName}
            </div>
          ) : null}
          <h3 className="text-lg font-bold text-black mb-2">
            {(display.name || "").replace(/\n/g, " ")}
          </h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-gray-600 text-sm mb-4 w-full">
            <div className="flex items-center">
              <img
                src="/icon/question.svg"
                alt="Number of questions"
                className="w-4 h-4 mr-2"
              />
              <span>Số câu: {display.totalQuestions}</span>
            </div>
            <div className="flex items-center">
              <img
                src="/icon/write.svg"
                alt="Status"
                className="w-4 h-4 mr-2"
              />
              <span>
                Tình trạng:{" "}
                <span
                  className={`${
                    display.isFinished ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {display.isFinished ? "Đã làm" : "Chưa làm"}
                </span>
              </span>
            </div>
            <div className="flex items-center">
              <img
                src="/icon/time.svg"
                alt="Duration"
                className="w-4 h-4 mr-2"
              />
              <span>Thời gian: {display.duration} phút</span>
            </div>
            <div className="flex items-center">
              <img src="/icon/point.svg" alt="Score" className="w-4 h-4 mr-2" />
              <span>
                Điểm:{" "}
                {display.isFinished && display.score != null
                  ? display.score
                  : "Chưa có"}
              </span>
            </div>
          </div>
          <div className="flex flex-row gap-3 mt-6 w-full">
            <button
              className="flex-1 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-50 flex items-center justify-center gap-2 px-4 py-2 text-sm md:text-base md:py-3"
              onClick={handleGoBack}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Quay lại
            </button>
            <button
              className={`flex-1 rounded-md font-semibold px-4 py-2 text-sm md:text-base md:py-3 ${
                disableStart
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
              onClick={handleStart}
              disabled={disableStart}
            >
              Bắt đầu thi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
