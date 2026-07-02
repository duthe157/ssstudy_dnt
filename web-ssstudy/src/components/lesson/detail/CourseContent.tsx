import BookIcon from "@/components/icons/BookIcon";
import CircleAlertIcon from "@/components/icons/CircleAlertIcon";
import EyeIcon from "@/components/icons/EyeIcon";
import { ScrollArea, Typography, VideoPlayer } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/contexts/DialogProvider";
import {
  ArrowDownToLine,
  AlertCircle,
  ChevronDown,
  ClipboardList,
  Timer,
  Award,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { ReportModal } from "./ReportModal";
import { useLessonDetail } from ".";
import config from "@/config";
import { cn } from "@/utils/cn";
import { categoryService, CategoryDetail } from "@/services/categoryService";
import { toast } from "react-toastify";
import { examService } from "@/services/examService";
import { wordExamService } from "@/services/wordExamService";
import { authService } from "@/services/authService";
import { useQueryString } from "@/hooks/useQueryString";
import FastGiftTag from "@/app/thi-thu/card/FastGiftTag";

const ExamDocDropdown = ({ exam }: { exam: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isDisabled = !exam?.exam_doc_link && !exam?.exam_doc_link2;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className={cn(
          "size-10 flex items-center justify-center rounded-full border border-[#2B59C3] text-[#2B59C3] transition-all",
          isDisabled ? "opacity-30 cursor-not-allowed" : "hover:bg-blue-50",
        )}
        onClick={() => !isDisabled && setIsOpen(!isOpen)}
        disabled={isDisabled}
      >
        <ArrowDownToLine className="size-5" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 right-0 z-[100] bg-white border border-gray-100 rounded-xl shadow-2xl min-w-[240px] py-2 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
          <button
            className={cn(
              "w-full flex items-center gap-3 px-5 py-3 text-left transition-colors",
              exam?.exam_doc_link
                ? "hover:bg-blue-50 text-blue-600"
                : "opacity-40 cursor-not-allowed",
            )}
            onClick={() => {
              if (exam?.exam_doc_link) {
                window.open(exam.exam_doc_link, "_blank");
              }
              setIsOpen(false);
            }}
            disabled={!exam?.exam_doc_link}
          >
            <ArrowDownToLine className="size-5" />
            <span className="text-sm font-bold">Tải đề không đáp án</span>
          </button>

          <div className="mx-4 border-t border-gray-50"></div>

          <button
            className={cn(
              "w-full flex items-center gap-3 px-5 py-3 text-left transition-colors",
              exam?.exam_doc_link2
                ? "hover:bg-blue-50 text-blue-600"
                : "opacity-40 cursor-not-allowed",
            )}
            onClick={() => {
              if (exam?.exam_doc_link2) {
                window.open(exam.exam_doc_link2, "_blank");
              }
              setIsOpen(false);
            }}
            disabled={!exam?.exam_doc_link2}
          >
            <ArrowDownToLine className="size-5" />
            <span className="text-sm font-bold">Tải đề có đáp án</span>
          </button>
        </div>
      )}
    </div>
  );
};

type Props = {
  onFullScreen: () => void;
};

// Type guard cho axios error response
interface AxiosErrorResponse {
  response: {
    data: {
      message: string;
      code?: number;
      data?: unknown;
    };
  };
}

function isAxiosErrorWithMessage(error: unknown): error is AxiosErrorResponse {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as AxiosErrorResponse).response === "object" &&
    (error as AxiosErrorResponse).response !== null &&
    "data" in (error as AxiosErrorResponse).response &&
    typeof (error as AxiosErrorResponse).response.data === "object" &&
    (error as AxiosErrorResponse).response.data !== null &&
    "message" in (error as AxiosErrorResponse).response.data &&
    typeof (error as AxiosErrorResponse).response.data.message === "string"
  );
}

// Helper function để lấy error message từ axios error
function getErrorMessage(error: unknown): string {
  // Kiểm tra nếu là axios error với response data
  if (isAxiosErrorWithMessage(error)) {
    return error.response.data.message;
  }

  // Kiểm tra nếu là Error instance
  if (error instanceof Error) {
    return error.message;
  }

  return "Có lỗi xảy ra khi tải bài học";
}

export const CourseContent = ({ onFullScreen }: Props) => {
  const {
    currentLesson,
    setCurrentLesson,
    chaptersData,
    activeVideo,
    setActiveVideo,
    otherVideos,
    setOtherVideos,
    nextCurrent,
    setPrevCurrent,
    goToNext,
  } = useLessonDetail();

  const dialog = useDialog();
  const { updateQueryStrings } = useQueryString();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id: classroomId } = useParams() as { id: string };

  const lessonId = searchParams?.get("lessonId") as string;
  const chapterId = searchParams?.get("chapterId") as string;
  const lessonName = searchParams?.get("lessonName") as string;

  const [videoError, setVideoError] = useState(false);
  const [categoryDetail, setCategoryDetail] = useState<CategoryDetail | null>(
    null,
  );
  const [numView, setNumView] = useState<number | undefined>(undefined);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [score, setScore] = useState<unknown>(null);
  const [isDoneExam, setIsDoneExam] = useState(false);
  const [hasWordExamTaken, setHasWordExamTaken] = useState(false);
  const [examStatusMap, setExamStatusMap] = useState<Record<string, boolean>>(
    {},
  );

  // Lắng nghe sự kiện kết thúc video để tự động chuyển bài
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        let data = event.data;
        if (
          typeof data === "string" &&
          (data.includes("ended") || data.includes("event"))
        ) {
          try {
            data = JSON.parse(data);
          } catch (e) {}
        }
        const type = data?.event || data?.type || data?.status || data;
        if (
          type === "ended" ||
          type === "player:ended" ||
          type === "video:ended" ||
          data === "ended"
        ) {
          console.log(" [CourseContent] Video ended, calling goToNext");
          goToNext();
        }
      } catch (e) {}
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [goToNext]);

  const handleShowReport = () => {
    dialog.show({
      component: (
        <ReportModal currentLesson={currentLesson} classroomId={classroomId} />
      ),
    });
  };

  const handleDownloadExam = (link?: string | null) => {
    if (link) {
      window.open(link, "_blank");
    }
  };

  const handleDoExam = (selectedExam?: any) => {
    const lesson = categoryDetail || currentLesson;
    const exam = selectedExam || lesson?.exam;
    const examId = exam?.id || exam?._id;
    if (!examId) return;

    const examUrl = config.examUrl || "https://baitap.ssstudy.vn/";

    // Đề thi làm bài nội bộ (Word, Sách ID, hoặc Mặc định không có type)
    if (
      exam.type === "WORD" ||
      exam.group === "SACH_ID" ||
      (exam.group === "MAC_DINH" && !exam.type)
    ) {
      //  Lưu URL lesson hiện tại vào sessionStorage để quay lại sau khi làm bài
      try {
        if (typeof window !== "undefined" && examId) {
          const key = `examReturnTo:${examId}`;

          // Xây dựng URL đầy đủ với lessonId để đảm bảo quay lại đúng lesson
          let returnUrl = window.location.pathname;

          // Đảm bảo lessonId luôn có trong URL nếu đang xem một lesson cụ thể
          const currentLessonId = lessonId || lesson?._id || currentLesson?._id;
          if (currentLessonId) {
            // Kiểm tra xem lessonId đã có trong query params chưa
            const urlParams = new URLSearchParams(window.location.search);
            if (!urlParams.has("lessonId")) {
              urlParams.set("lessonId", currentLessonId);
            } else {
              // Cập nhật lessonId nếu đã có nhưng khác với lesson hiện tại
              urlParams.set("lessonId", currentLessonId);
            }
            returnUrl += `?${urlParams.toString()}`;
          } else if (window.location.search) {
            // Nếu không có lessonId nhưng có query params khác, giữ nguyên
            returnUrl += window.location.search;
          }

          sessionStorage.setItem(key, returnUrl);
        }
      } catch (error) {
        console.error("Error saving return URL:", error);
      }

      // Điều hướng đến trang làm bài nội bộ ở tab hiện tại
      const wordExamUrl = `/thi-thu/word-exam/${examId}/ready`;
      router.push(wordExamUrl);
    } else if (
      exam?.creating_type === "MANUAL" ||
      exam?.type === "MAC_DINH" ||
      exam?.creating_type === "MAC_DINH"
    ) {
      const hsaExam = `${examUrl}thi-thu/doing-hsa?exam_id=${examId}&classroom_id=${classroomId}&creating_type=MANUAL`;
      window.open(hsaExam, "_blank");
    } else {
      // Mở tab mới với URL thi thử online (SACH_ID map sang thi thu thuong)
      const examOnlineUrl = `${examUrl}thi-thu/doing?exam_id=${examId}&classroom_id=${classroomId}`;
      window.open(examOnlineUrl, "_blank");
    }
  };

  const handleNextViewResultAction = (selectedExam?: any) => {
    const lesson = categoryDetail || currentLesson;
    const exam = selectedExam || lesson?.exam;
    const examId = exam?.id || exam?._id;
    if (!examId) return;

    const examUrl = config.examUrl || "https://baitap.ssstudy.vn/";

    // Đề thi WORD hoặc có group SACH_ID/MAC_DINH (không type) -> Xem kết quả nội bộ
    if (
      exam.type === "WORD" ||
      exam.group === "SACH_ID" ||
      (exam.group === "MAC_DINH" && !exam.type)
    ) {
      try {
        if (typeof window !== "undefined") {
          const key = `examReturnTo:${examId}`;
          const currentUrl = window.location.pathname + window.location.search;
          sessionStorage.setItem(key, currentUrl);
        }
      } catch (e) {
        console.warn("Error saving return URL", e);
      }
      const examCategory = lesson.chapter?.name || "TSA";
      const examName = exam.name || lesson.name || "Lời giải";
      const isSachID = exam.group === "SACH_ID" || exam.type === "SACH_ID";
      const targetPath = isSachID
        ? `/thi-thu/result/${examId}/explanation`
        : `/thi-thu/result/${examId}`;
      const queryParams = new URLSearchParams();
      if (examCategory) queryParams.set("categoryExam", examCategory);
      if (examName) queryParams.set("name", examName);
      queryParams.set("fromLesson", "true");
      router.push(`${targetPath}?${queryParams.toString()}`);
      return;
    }

    // Đề thi MANUAL (HSA) → trang kết quả trên ssstudy (loại này dùng result-hsa là chuẩn nhất)
    if (exam?.creating_type === "MANUAL") {
      const resultUrl = `${examUrl}thi-thu/result-hsa?exam_id=${examId}&classroom_id=${classroomId}&creating_type=${exam.creating_type}`;
      window.open(resultUrl, "_blank");
      return;
      
    }

    // Đề thi PDF/Online → trang xem đáp án/làm bài trên ssstudy (sử dụng doing để xem được detail)
    const resultUrl = `${examUrl}thi-thu/doing?exam_id=${examId}&classroom_id=${classroomId}`;
    window.open(resultUrl, "_blank");
  };

  const fetchedLessonId = useRef<string | null>(null);

  useEffect(() => {
    const fetchVideoDetail = async () => {
      if (!lessonId || !classroomId) return;

      // Prevent duplicate call for the same lesson
      if (fetchedLessonId.current === lessonId) {
        // If already fetched and data exists, sync currentLesson with chaptersData if available
        if (categoryDetail && chaptersData) {
          for (const chapter of chaptersData) {
            const lesson = chapter.category.find((cat) => cat._id === lessonId);
            if (lesson) {
              setCurrentLesson(lesson);
              break;
            }
          }
        }
        return;
      }

      // Reset states
      setVideoError(false);
      setIsLoadingVideo(true);
      setCategoryDetail(null);
      setNumView(undefined);
      setErrorMessage(null);
      setScore(null);
      setIsDoneExam(false);
      setHasWordExamTaken(false);

      // Mark as fetched immediately to prevent duplicate calls
      fetchedLessonId.current = lessonId;

      try {
        const response = await categoryService.viewVideo({
          category_id: lessonId,
          classroom_id: classroomId,
        });

        if (response.code === 200 && response.data) {
          setCategoryDetail(response.data.category);
          setNumView(response.data.num_view);
          setIsDoneExam(response.data.is_done_exam || false);
          setOtherVideos(response.data.otherVideos || []);
          setActiveVideo(
            response.data.video || response.data.otherVideos?.[0] || null,
          );
          setErrorMessage(null);

          // Vẫn set currentLesson để giữ tương thích với code cũ
          // Tìm lesson từ chaptersData để có đầy đủ thông tin
          if (chaptersData) {
            for (const chapter of chaptersData) {
              const lesson = chapter.category.find(
                (cat) => cat._id === lessonId,
              );
              if (lesson) {
                setCurrentLesson(lesson);
                break;
              }
            }
          }
        } else {
          // API trả về lỗi (code !== 200)
          const errMsg = response.message || "Không thể tải thông tin bài học";
          setErrorMessage(errMsg);
          toast.error(errMsg, {
            position: "top-right",
            autoClose: 5000,
          });
        }
      } catch (error: unknown) {
        console.error("Error fetching video detail:", error);

        // Lấy message từ error response
        const errMsg = getErrorMessage(error);

        setErrorMessage(errMsg);
        toast.error(errMsg, {
          position: "top-right",
          autoClose: 5000,
        });
        setVideoError(true);
      } finally {
        setIsLoadingVideo(false);
      }
    };

    fetchVideoDetail();
  }, [
    lessonId,
    classroomId,
    chaptersData,
    setCurrentLesson,
    setOtherVideos,
    setActiveVideo,
  ]);

  // Đồng bộ trạng thái hoàn thành bài tập vào currentLesson trong context
  useEffect(() => {
    if (currentLesson?._id) {
      const isActuallyDone = !!(isDoneExam || score || hasWordExamTaken);
      if (currentLesson.is_done_exam !== isActuallyDone) {
        setCurrentLesson({
          ...currentLesson,
          is_done_exam: isActuallyDone,
        });
      }
    }
  }, [isDoneExam, score, hasWordExamTaken, currentLesson, setCurrentLesson]);

  // Effect để call API lấy trạng thái hoàn thành cho TẤT CẢ các bài tập (Word và Online)
  useEffect(() => {
    const fetchAllExamStatuses = async () => {
      const lesson = categoryDetail || currentLesson;
      const combined = {
        ...lesson,
        exam: lesson?.exam || (currentLesson as any)?.exam,
      };
      const list = Array.isArray(combined?.exam)
        ? combined.exam
        : combined?.exam?.id || combined?.exam?._id
          ? [combined.exam]
          : [];

      if (list.length === 0) return;

      const currentUser = authService.getCurrentUser() as any;
      const userId =
        currentUser?.user_id || currentUser?._id || currentUser?.id;
      if (!userId) return;

      const newStatusMap: Record<string, boolean> = {};

      const statusPromises = list.map(async (exam: any, idx: number) => {
        const eid = exam.id || exam._id;
        if (!eid) return;

        try {
          // Kiểm tra đề thi Word (type === "WORD" hoặc group là SACH_ID hoặc MAC_DINH không type)
          // Các loại này sử dụng wordExamService.checkWordExamAnswer
          if (
            exam.type === "WORD" ||
            exam.group === "SACH_ID" ||
            (exam.group === "MAC_DINH" && !exam.type)
          ) {
            const response = await wordExamService.checkWordExamAnswer({
              user_id: String(userId),
              exam_id: eid,
            });
            if (response?.code === 200 && response?.data?.hasTaken) {
              newStatusMap[eid] = true;
              if (idx === 0) setHasWordExamTaken(true);
            }
          }
          // Kiểm tra đề thi PDF/Online/Trắc nghiệm
          else {
          }
        } catch (error) {
          console.error(`Error checking status for exam ${eid}:`, error);
        }
      });

      await Promise.all(statusPromises);
      setExamStatusMap((prev) => ({ ...prev, ...newStatusMap }));
    };

    fetchAllExamStatuses();
  }, [categoryDetail, currentLesson, classroomId]);

  const getExerciseCount = (lesson: any) => {
    let count = 0;
    if (Array.isArray(lesson?.exam)) {
      count = lesson.exam.length;
    } else if (lesson?.exam?.id) {
      count = 1;
    }
    return count;
  };

  const combinedLesson = {
    ...currentLesson,
    ...categoryDetail,
    exam: (categoryDetail as any)?.exam || (currentLesson as any)?.exam,
  };

  const examList = (
    Array.isArray(combinedLesson?.exam)
      ? combinedLesson.exam
      : combinedLesson?.exam?.id || combinedLesson?.exam?._id
        ? [combinedLesson.exam]
        : []
  ).filter((exam: any) => exam && (exam.id || exam._id));

  const exerciseCount = getExerciseCount(combinedLesson);

  return (
    <ScrollArea className="h-[calc(100vh-var(--header-height)-var(--footer-height))] overflow-y-auto">
      {/* Khung video cố định luôn có tỷ lệ aspect-video */}
      <div
        id="video-player-container"
        className={cn(
          "w-full aspect-video relative rounded-lg overflow-hidden",
          "max-h-[calc(84vh-var(--header-height)-var(--footer-height))]",
        )}
      >
        {/* Trường hợp 1: Đang loading */}
        {isLoadingVideo && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <Typography variant="sm16" className="text-gray-500">
                Đang tải video...
              </Typography>
            </div>
          </div>
        )}

        {/* Trường hợp 2: Có lỗi từ API */}
        {!isLoadingVideo && errorMessage && (
          <div className="absolute inset-0 bg-red-50 flex items-center justify-center border border-red-200">
            <div className="text-center px-4">
              <AlertCircle className="size-12 text-red-500 mx-auto mb-2" />
              <Typography
                variant="sm16"
                className="text-red-600 font-semibold mb-2"
              >
                Không thể xem video
              </Typography>
              <Typography variant="xs14" className="text-red-500">
                {errorMessage}
              </Typography>
            </div>
          </div>
        )}

        {/* Trường hợp 3: Chưa chọn bài học */}
        {!isLoadingVideo &&
          !errorMessage &&
          !categoryDetail &&
          !currentLesson && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <AlertCircle className="size-12 text-gray-400 mx-auto mb-2" />
                <Typography variant="sm16" className="text-gray-500">
                  Vui lòng chọn bài học để xem video
                </Typography>
              </div>
            </div>
          )}

        {/* Trường hợp 4: Không có video link */}
        {!isLoadingVideo &&
          !errorMessage &&
          categoryDetail &&
          !categoryDetail.video_link && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <AlertCircle className="size-12 text-gray-400 mx-auto mb-2" />
                <Typography variant="sm16" className="text-gray-500">
                  Không có video cho bài học này!
                </Typography>
              </div>
            </div>
          )}

        {/* Trường hợp 5: Video bị lỗi khi play */}
        {!isLoadingVideo &&
          !errorMessage &&
          categoryDetail &&
          categoryDetail.video_link &&
          videoError && (
            <div className="absolute inset-0 bg-red-50 flex items-center justify-center border border-red-200">
              <div className="text-center px-4">
                <AlertCircle className="size-12 text-red-500 mx-auto mb-2" />
                <Typography
                  variant="sm16"
                  className="text-red-600 font-semibold mb-2"
                >
                  Video đang lỗi
                </Typography>
                <Typography variant="xs12" className="text-red-500 mb-4">
                  Không thể tải video. Vui lòng thử lại sau hoặc báo lỗi.
                </Typography>
                <Button
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-50"
                  onClick={() => setVideoError(false)}
                >
                  Thử lại
                </Button>
              </div>
            </div>
          )}

        {/* Trường hợp 6: Có video link và không lỗi */}
        {!isLoadingVideo &&
          !errorMessage &&
          (activeVideo?.link || categoryDetail?.video_link) &&
          !videoError &&
          numView !== 0 && (
            <>
              <VideoPlayer
                key={
                  activeVideo?.link ||
                  categoryDetail?.video_link ||
                  "main-video"
                }
                src={activeVideo?.link || categoryDetail?.video_link}
                onFullScreen={onFullScreen}
                onError={() => setVideoError(true)}
              />
            </>
          )}

        {/* Trường hợp 7: số lượt xem bằng 0 */}
        {!isLoadingVideo &&
          !errorMessage &&
          categoryDetail &&
          categoryDetail.video_link &&
          numView == 0 && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <AlertCircle className="size-12 text-gray-400 mx-auto mb-2" />
                <Typography variant="sm16" className="text-gray-500">
                  Bạn đã hết lượt xem!
                </Typography>
              </div>
            </div>
          )}
      </div>
      <div className="bg-white p-4 lg:p-8 my-4 space-y-4 mx-4 lg:mx-0 rounded-md border border-[#D3D3FF1A]">
        <Typography variant={"lg24"} className="text-blue-500 font-bold">
          {categoryDetail?.name || currentLesson?.name || "Chọn bài học"}
        </Typography>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
          {/* Row 1: Bạn còn xx lượt xem - Aligned Left */}
          {numView !== undefined && (
            <div className="flex items-center gap-[6px]">
              <EyeIcon className="size-5 shrink-0" />
              <Typography variant={"xs14"} className="text-foundation-400 font-medium">
                Bạn còn {numView} lượt xem
              </Typography>
            </div>
          )}

          {/* Action Buttons - Distributed/Centered according to image */}
          {(() => {
            const links = [
              { url: categoryDetail?.exam_doc_link_2 || currentLesson?.exam_doc_link_2, label: "Tải đề (không đáp án)" },
              { url: categoryDetail?.doc_link || currentLesson?.doc_link, label: "Tải đề (có đáp án)" },
              { url: categoryDetail?.exam_doc_link_1 || currentLesson?.exam_doc_link_1, label: "Tải tài liệu" },
            ];
            
            const activeLinks = links.filter(l => l.url);
            
            const renderBtn = (link: { url: any, label: string }) => (
              <Button
                key={link.label}
                variant="outline"
                className="gap-1.5 rounded-full border-blue-500 text-blue-500 font-bold px-4 h-9 text-xs hover:bg-blue-50 transition-all shadow-sm whitespace-nowrap"
                onClick={() => handleDownloadExam(link.url)}
              >
                <ArrowDownToLine className="size-4 shrink-0" />
                {link.label}
              </Button>
            );

            const reportBtn = (
              <Button
                key="report"
                variant={"outline"}
                className="gap-1.5 border-blue-500 rounded-full h-9 px-4 hover:bg-blue-50 transition-all shadow-sm"
                onClick={handleShowReport}
              >
                <div className="size-[18px] rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                  i
                </div>
                <Typography
                  variant={"xs14"}
                  className="font-bold text-blue-500"
                >
                  Báo lỗi
                </Typography>
              </Button>
            );

            // Nếu chỉ có 1 nút tải (hoặc không có), dồn về bên phải cạnh nút báo lỗi
            if (activeLinks.length <= 1) {
              return (
                <div className="flex flex-wrap gap-4 items-center md:justify-end flex-1">
                  {activeLinks.map(renderBtn)}
                  {reportBtn}
                </div>
              );
            }

            // Nếu có nhiều nút tải, dàn đều khoảng cách giống trong ảnh
            return (
              <div className="flex flex-1 flex-wrap gap-2 items-center justify-between md:ml-10 lg:ml-24">
                {activeLinks.map(renderBtn)}
                {reportBtn}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Video bài giảng Section */}
      {otherVideos.length > 0 && (
        <div className="mx-4 lg:mx-8 mb-4 space-y-3">
          <Typography variant="sm16" className="font-bold text-gray-700">
            Video bài giảng
          </Typography>
          <div className="flex flex-col gap-3">
            {otherVideos.map((vid: any, idx: number) => {
              const isActive = activeVideo?._id === vid._id;
              return (
                <div
                  key={vid._id || idx}
                  onClick={() => {
                    setActiveVideo(vid);
                    setVideoError(false);
                  }}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl shadow-sm cursor-pointer transition-all border",
                    isActive
                      ? "bg-blue-50 border-[#2B59C3]"
                      : "bg-white border-gray-100 hover:border-blue-200",
                  )}
                >
                  <Typography
                    variant="xs14"
                    className={cn(
                      "font-medium flex-1 min-w-0 line-clamp-2",
                      isActive ? "text-[#2B59C3]" : "text-gray-600",
                    )}
                  >
                    {idx + 1}. {vid.name || "Video bài giảng"}
                  </Typography>
                  {isActive && numView !== undefined && (
                    <Typography
                      variant="xs12"
                      className="text-gray-500 font-medium whitespace-nowrap shrink-0 ml-2"
                    >
                      Còn {numView} lượt
                    </Typography>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {examList.length > 0 && (
        <div className="mx-4 lg:mx-8 mb-24 lg:mb-8 space-y-3">
          <Typography variant="sm16" className="font-bold text-gray-700">
            Bài tập
          </Typography>
          <div className="flex flex-col gap-3">
            {examList.map((exam: any, index: number) => {
              const isSachID = exam.group === "SACH_ID";
              const examId = exam.id || exam._id;

              // Đề thi Word (type WORD, group SACH_ID, MAC_DINH không type): dùng API check-answer 
              // Đề thi khác (PDF, online...): dùng is_done_exam từ API /category/view-video
              const isWordExam =
                exam.type === "WORD" ||
                exam.group === "SACH_ID" ||
                (exam.group === "MAC_DINH" && !exam.type);
              const hasTaken = examStatusMap[examId] || false;
              const isDone = isWordExam ? (hasTaken || isSachID) : exam.is_done_exam === true;

              return (
                <div
                  key={examId}
                  className="flex items-center justify-between gap-2 p-3 sm:p-4 bg-white rounded-xl border border-gray-100 shadow-sm transition-all hover:border-blue-100"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Typography
                      variant="xs14"
                      className="text-gray-600 font-medium overflow-hidden text-ellipsis line-clamp-2"
                    >
                      {index + 1}. {exam.name || "Bài tập"}
                    </Typography>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="relative group">
                      <Button
                        className={cn(
                          "rounded-full font-bold h-9 px-4 sm:px-6 text-xs sm:text-sm transition-all",
                          isDone
                            ? isSachID
                              ? "bg-[#FF7A00] hover:bg-[#E66E00] text-white"
                              : "bg-[#FDA45F] hover:bg-[#FC9644] text-white"
                            : "bg-[#2B59C3] hover:bg-[#1e44a3] text-white shadow-lg",
                        )}
                        onClick={() =>
                          isDone
                            ? handleNextViewResultAction(exam)
                            : handleDoExam(exam)
                        }
                      >
                        {isDone ? (isSachID ? "Xem kết quả" : "Xem đáp án") : "Làm bài"}
                      </Button>
                      {!isDone && <FastGiftTag exam={exam} dataSource="tag" />}
                    </div>

                    <ExamDocDropdown exam={exam} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </ScrollArea>
  );
};
