import baseHelper from "@/components/helpers/baseHelper";
import CheckCircleIcon from "@/components/icons/CheckCircleIcon";
import DateIcon from "@/components/icons/DateIcon";
import PlayVideoIcon from "@/components/icons/PlayVideoIcon";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Typography,
} from "@/components/ui";
import { useQueryString } from "@/hooks/useQueryString";
import { categoryService } from "@/services/categoryService";
import { Result } from "@/services/lessonService";
import { cn } from "@/utils/cn";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import config from "@/config";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useLessonDetail } from ".";
import FastGiftTag from "@/app/thi-thu/card/FastGiftTag";

interface LiveStreamButtonProps extends Result {
  onRegister: () => void;
}

// Helper function để kiểm tra xem livestream có quá 3h chưa
const isLivestreamExpired = (startDateTime?: string): boolean => {
  if (!startDateTime) return false;

  const now = new Date().getTime();
  const startTime = new Date(startDateTime).getTime();
  const threeHoursInMs = 3 * 60 * 60 * 1000; // 3 giờ
  const endTime = startTime + threeHoursInMs;

  return now > endTime;
};

const LiveStreamButton = (props: LiveStreamButtonProps) => {
  const {
    start_date_time_live,
    livestream_registed,
    livestream_registed_link,
    livestream_current_size,
    livestream_max_size,
    onRegister,
  } = props;

  // Kiểm tra nếu quá 3h từ thời điểm bắt đầu livestream
  if (isLivestreamExpired(start_date_time_live)) {
    // Nếu đã đăng ký thì vẫn hiển thị nút "Đã đăng ký"
    if (livestream_registed) {
      return (
        <button
          className={cn(
            "bg-green-50 border border-green-200 rounded-full h-6 w-24"
          )}
        >
          <Typography variant={"xs12"} className="font-bold text-green-700">
            Đã đăng ký
          </Typography>
        </button>
      );
    }
    // Nếu chưa đăng ký thì không hiển thị gì
    return null;
  }

  const isStart = start_date_time_live
    ? new Date(start_date_time_live).getTime() < new Date().getTime()
    : false;

  const commonClass = "rounded-full h-6 w-24";

  const handleClick = () => {
    if (livestream_registed && livestream_registed_link && isStart) {
      window.open(livestream_registed_link, "_blank");
    }
  };

  if (livestream_registed && isStart) {
    return (
      <Button className={cn("bg-blue-500", commonClass)} onClick={handleClick}>
        <Typography variant={"xs12"} className="font-bold text-white">
          Vào học
        </Typography>
      </Button>
    );
  }
  if (livestream_registed) {
    return (
      <button
        className={cn("bg-green-50 border border-green-200", commonClass)}
      >
        <Typography variant={"xs12"} className="font-bold text-green-700">
          Đã đăng ký
        </Typography>
      </button>
    );
  }

  // Kiểm tra hết chỗ
  const isFull =
    livestream_max_size &&
    livestream_current_size !== undefined &&
    livestream_current_size >= livestream_max_size;

  if (!livestream_registed && isFull) {
    return (
      <button
        className={cn("bg-red-50 border border-red-200", commonClass)}
        disabled
      >
        <Typography variant={"xs12"} className="font-bold text-red-700">
          Hết chỗ
        </Typography>
      </button>
    );
  }

  if (!livestream_registed) {
    return (
      <Button
        className={cn("bg-foundation-50", commonClass)}
        onClick={(e) => {
          e.stopPropagation();
          onRegister();
        }}
      >
        <Typography variant={"xs12"} className="font-bold text-blue-500">
          Đăng ký học
        </Typography>
      </Button>
    );
  }

  return null;
};

interface CourseListProps {
  activeGroupTab: string;
  searchKeyword?: string;
}

export const CourseList = ({ activeGroupTab, searchKeyword = "" }: CourseListProps) => {
  const searchParams = useSearchParams();
  const {
    chaptersData,
    classroomData,
    refetchData,
    setPrevCurrent,
    currentLesson,
    setNextCurrent,
  } = useLessonDetail();
  const router = useRouter();
  const { updateQueryStrings } = useQueryString();
  const [currentChapter, setCurrentChapter] = useState<string>("");

  const lessonId = searchParams?.get("lessonId") as string;
  const chapterId = searchParams?.get("chapterId") as string;
  const lessonName = searchParams?.get("lessonName") as string;

  const handleClickLesson = (lesson: Result, _chapterId: string) => {
    // Nếu là livestream và chưa quá 3h, không cho phép click vào tiêu đề
    if (
      lesson.livestream_btn &&
      !isLivestreamExpired(lesson.start_date_time_live)
    ) {
      return;
    }

    if (lesson.publish_at) {
      const now = new Date();
      const publishAt = new Date(lesson.publish_at);
      const isNotPublishAt = publishAt > now;
      if (isNotPublishAt) {
        // Sử dụng setTimeout để đảm bảo ToastContainer đã được mount
        setTimeout(() => {
          toast.info(
            "Bài giảng này sẽ được mở vào ngày phát hành chính thức. Bạn hãy quay lại sau nhé!",
            {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: true,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            }
          );
        }, 100);
        return;
      }
    }
    if (!lesson.publish_at) {
      // Sử dụng setTimeout để đảm bảo ToastContainer đã được mount
      setTimeout(() => {
        toast.info("Bài giảng này chưa được phát hành", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }, 100);
      return;
    }

    ((_chapterId: string, _lessonId: string, _lessonName: string) => {
      setPrevCurrent((preCurrent) => {
        return [
          ...preCurrent,
          {
            chapterId: _chapterId,
            lessonId: _lessonId,
            lessonName: _lessonName,
          },
        ];
      });
    })(chapterId, lessonId, lessonName);

    updateQueryStrings({
      lessonId: lesson._id,
      lessonName: lesson.name,
      chapterId: _chapterId,
    });
  };

  const handleDoExam = (lesson: Result) => {
    const exam = Array.isArray(lesson.exam) ? lesson.exam[0] : lesson.exam;
    if (!exam?.id) return;

    const examUrl = config.examUrl || "https://baitap.ssstudy.vn/";
    const classroomId = classroomData?.classroom?._id;

    if (exam.type === "WORD") {
      try {
        if (typeof window !== "undefined" && exam.id) {
          const key = `examReturnTo:${exam.id}`;
          let returnUrl = window.location.pathname;
          const urlParams = new URLSearchParams(window.location.search);
          urlParams.set("lessonId", lesson._id);
          returnUrl += `?${urlParams.toString()}`;
          sessionStorage.setItem(key, returnUrl);
        }
      } catch (error) {
        console.error("Error saving return URL:", error);
      }
      const wordExamUrl = `/thi-thu/word-exam/${exam.id}/ready`;
      router.push(wordExamUrl);
    } else if (exam?.creating_type && exam?.creating_type === "MANUAL") {
      const hsaExam = `${examUrl}thi-thu/doing-hsa?exam_id=${exam.id}&classroom_id=${classroomId}&creating_type=${exam?.creating_type}`;
      window.open(hsaExam, "_blank");
    } else {
      const examOnlineUrl = `${examUrl}thi-thu/doing?exam_id=${exam.id}&classroom_id=${classroomId}`;
      window.open(examOnlineUrl, "_blank");
    }
  };

  const handleViewResult = (lesson: Result) => {
    const exam = Array.isArray(lesson.exam) ? lesson.exam[0] : lesson.exam;
    if (!exam?.id) return;

    const classroomId = classroomData?.classroom?._id;

    if (exam.type === "WORD") {
      try {
        if (typeof window !== "undefined" && exam.id) {
          const key = `examReturnTo:${exam.id}`;
          let returnUrl = window.location.pathname;
          const urlParams = new URLSearchParams(window.location.search);
          urlParams.set("lessonId", lesson._id);
          returnUrl += `?${urlParams.toString()}`;
          sessionStorage.setItem(key, returnUrl);
        }
      } catch (error) {
        console.error("Error saving return URL:", error);
      }
      const examCategory = chapterId || "TSA";
      const examName = encodeURIComponent(exam.name || `Word - ${lesson.name}`);
      const resultUrl = `/thi-thu/result/${exam.id}?categoryExam=${examCategory}&name=${examName}`;
      router.push(resultUrl);
      return;
    }

    const examUrl = config.examUrl || "https://baitap.ssstudy.vn/";
    if (exam?.creating_type === "MANUAL") {
      const fullUrl = window.location.href;
      const baseUrl = window.location.origin;
      const urlWithoutBase = fullUrl.replace(baseUrl, "");
      if (typeof window !== "undefined") {
        localStorage.setItem("back-url", encodeURIComponent(urlWithoutBase));
      }
      const resultUrl = `${examUrl}thi-thu/result-hsa?exam_id=${exam.id}&classroom_id=${classroomId}&creating_type=${exam.creating_type}`;
      window.open(resultUrl, "_blank");
    } else {
      const resultUrl = `${examUrl}thi-thu/doing?exam_id=${exam.id}&classroom_id=${classroomId}`;
      window.open(resultUrl, "_blank");
    }
  };

  const countCompletedLessons = (lessons: Result[]) => {
    return lessons.filter(
      (lesson) => lesson.is_done_video || lesson.is_done_exam
    ).length;
  };

  // Handle register livestream (giống CourseTabs.tsx)
  const handleRegisterLivestream = async (categoryId: string) => {
    try {
      const classroomId = classroomData?.classroom?._id;
      if (!classroomId) {
        toast.error("Không tìm thấy thông tin khóa học");
        return;
      }

      const response = await categoryService.registerLivestream({
        category_id: categoryId,
        classroom_id: classroomId,
      });

      if (response && response.code === 200) {
        toast.success(
          response.message ||
            "Đăng ký học livestream thành công, bạn hãy truy cập buổi học vào ngày chính thức nhé!"
        );
        // Refetch chapters to update registration status
        await refetchData();
      } else {
        // Hiển thị message từ API, không quan tâm code là gì
        toast.error(
          response?.message ||
            "Không thể đăng ký học livestream. Vui lòng thử lại!"
        );
      }
    } catch (error) {
      // Xử lý trường hợp error có cấu trúc response với message
      let errorMessage = "Không thể đăng ký học livestream. Vui lòng thử lại!";

      if (error && typeof error === "object") {
        const err = error as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        errorMessage =
          err?.response?.data?.message || err?.message || errorMessage;
      }

      console.error("Error registering livestream:", error);
      toast.error(errorMessage);
    }
  };

  // Filter chapters theo activeGroupTab (giống CourseTabs.tsx)
  const filteredChapters = React.useMemo(() => {
    if (!chaptersData) return [];
    if (!activeGroupTab) return chaptersData;

    // Check if only one group and it's undefined - show all chapters
    const uniqueGroupIds = new Set<string>();
    let hasUndefined = false;

    chaptersData.forEach((chapter) => {
      if ((chapter as any).group_id) {
        uniqueGroupIds.add(String((chapter as any).group_id));
      } else {
        hasUndefined = true;
      }
    });

    const shouldShowAll =
      uniqueGroupIds.size === 0 &&
      hasUndefined &&
      activeGroupTab === "undefined";

    if (shouldShowAll) {
      return chaptersData;
    }

    return chaptersData.filter((chapter) => {
      // Nếu activeGroupTab là "undefined", lấy các chapters không có group_id
      if (activeGroupTab === "undefined") {
        return !(chapter as any).group_id;
      }
      // Ngược lại, filter theo group_id
      return String((chapter as any).group_id) === activeGroupTab;
    });
  }, [chaptersData, activeGroupTab]);

  // Filter chapters theo searchKeyword
  const searchFilteredChapters = React.useMemo(() => {
    if (!searchKeyword.trim()) return filteredChapters;

    const keyword = searchKeyword.toLowerCase().trim();

    return filteredChapters
      .map((chapter) => {
        // Nếu tên chương khớp, giữ nguyên tất cả bài học
        if (chapter.chapter.name.toLowerCase().includes(keyword)) {
          return chapter;
        }

        // Lọc bài học theo tên
        const matchedLessons = chapter.category.filter((lesson) =>
          lesson.name.toLowerCase().includes(keyword)
        );

        if (matchedLessons.length === 0) return null;

        return {
          ...chapter,
          category: matchedLessons,
        };
      })
      .filter(Boolean) as typeof filteredChapters;
  }, [filteredChapters, searchKeyword]);

  // Highlight search term in text
  const highlightSearchTerm = (text: string, term: string) => {
    if (!term.trim()) return text;

    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  useEffect(() => {
    if (chapterId) {
      setCurrentChapter(chapterId);
    }
  }, [chapterId]);

  // Tự động cuộn bài học đang chọn vào vùng nhìn thấy
  useEffect(() => {
    if (lessonId) {
      // Đợi một chút để Accordion mở ra và DOM render xong
      const timer = setTimeout(() => {
        const activeLessonElem = document.getElementById(`lesson-${lessonId}`);
        if (activeLessonElem) {
          activeLessonElem.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [lessonId, currentChapter]);

  useEffect(() => {
    const handleNextLesson = () => {
      const index = filteredChapters.findIndex(
        (chapter) => chapter._id === chapterId
      );
      const lessonIndex = filteredChapters[index]?.category.findIndex(
        (lesson) => lesson._id === lessonId
      );
      const nextLesson = filteredChapters[index]?.category[lessonIndex + 1];
      const nextChapter = filteredChapters[index + 1];
      if (nextLesson) {
        setNextCurrent({
          lessonId: nextLesson._id,
          lessonName: nextLesson.name,
          chapterId: filteredChapters[index]._id,
        });
        return;
      }
      if (nextChapter) {
        // Kiểm tra xem nextChapter có bài giảng nào không
        if (nextChapter.category && nextChapter.category.length > 0) {
          setNextCurrent({
            lessonId: nextChapter.category[0]._id,
            lessonName: nextChapter.category[0].name,
            chapterId: nextChapter._id,
          });
          return;
        }
        // Nếu nextChapter không có bài giảng, tìm chapter tiếp theo có bài giảng
        const nextChapterWithLessons = filteredChapters
          .slice(index + 2)
          .find((chapter) => chapter.category && chapter.category.length > 0);
        if (nextChapterWithLessons) {
          setNextCurrent({
            lessonId: nextChapterWithLessons.category[0]._id,
            lessonName: nextChapterWithLessons.category[0].name,
            chapterId: nextChapterWithLessons._id,
          });
          return;
        }
      }
      setNextCurrent(undefined);
    };
    if (chapterId && lessonId && lessonName && filteredChapters.length > 0) {
      handleNextLesson();
    }
  }, [filteredChapters, chapterId, lessonId, lessonName, setNextCurrent]);

  const getExerciseCount = (lesson: Result) => {
    let count = 0;
    if (Array.isArray(lesson?.exam)) {
      count = lesson.exam.length;
    } else if (lesson?.exam?.id) {
      count = 1;
    }
    return count;
  };

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full space-y-4"
      value={currentChapter}
      onValueChange={(chapterId) => {
        setCurrentChapter(chapterId);
      }}
    >
      {searchFilteredChapters?.map((chapter) => (
        <AccordionItem
          key={chapter._id}
          value={chapter._id}
          className="bg-white px-4 py-[26px] rounded-md border border-border"
        >
          <AccordionTrigger className="py-0 gap-0">
            <Typography
              variant={"xs12"}
              className="text-blue-500 bg-foundation-50 font-bold px-2 py-[6px] rounded"
            >
              {countCompletedLessons(chapter.category)}/
              {chapter.category?.length}
            </Typography>
            <Typography
              variant={"sm16"}
              className="font-bold text-blue-500 flex-1 ml-4 mr-2"
            >
              {chapter.chapter.name}
            </Typography>
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4">
            {chapter.category?.map((lesson, lessonIndex) => {
              const lessonIsDoneExam =
                (lesson._id === currentLesson?._id &&
                  currentLesson.is_done_exam) ||
                lesson.is_done_exam;
              const exerciseCount = getExerciseCount(lesson);

              return (
              <div key={lesson._id} className="flex flex-col mb-4">
                <div
                  id={`lesson-${lesson._id}`}
                  className={cn(
                    "relative bg-white border-grey-60 border-[0.5px] py-3 px-2 flex items-start gap-2",
                    lessonId === lesson._id && "bg-foundation-50",
                    lesson.livestream_btn &&
                      !isLivestreamExpired(lesson.start_date_time_live)
                      ? "cursor-default"
                      : "cursor-pointer",
                    lesson.exam && exerciseCount >= 2
                      ? "rounded-t border-b-0"
                      : "rounded"
                  )}
                  role="button"
                  tabIndex={0}
                  onKeyDown={undefined}
                  onClick={() => handleClickLesson(lesson, chapter._id)}
                >
                {/* Cột 1: Tiêu đề và các nhãn */}
                <div className="flex-1">
                  {/* Dòng 1: Tiêu đề */}
                  <div className="flex items-center gap-2 pl-1 pr-3 relative">
                    <Typography
                      variant={"xs12"}
                      className="text-blue-500 font-normal"
                    >
                      {lessonIndex + 1}. {highlightSearchTerm(lesson.name, searchKeyword)}
                    </Typography>
                  </div>

                  {/* Dòng 2: Nhãn Free/Pro + Tag Live */}
                  <div className="flex items-center gap-2 pl-1 mt-1">
                    {lesson.is_free ? (
                      <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap">
                        Free
                      </span>
                    ) : (
                      <span className="inline-flex items-center bg-blue-600 px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap">
                        <Image
                          src="/icon/crown-svgrepo-com.svg"
                          alt="Pro"
                          width={10}
                          height={10}
                          className="mr-1"
                        />
                        <span className="text-[#FFC107]">Pro</span>
                      </span>
                    )}
                    {lesson.livestream_btn &&
                      !isLivestreamExpired(lesson.start_date_time_live) && (
                        <div className="bg-orange-500 rounded-2xl h-[22px] inline-flex items-center gap-1 px-[6px]">
                          <PlayVideoIcon className="size-3 [&_path]:fill-white" />
                          <Typography variant={"xs10"} className="text-white">
                            Live:{" "}
                            {lesson.start_date_time_live
                              ? baseHelper.formatDateTimeLiveStream(
                                  lesson.start_date_time_live
                                  )
                              : ""}
                          </Typography>
                        </div>
                      )}
                  </div>
                </div>

                {/* Cột 2: Nút và Ngày phát hành */}
                <div className="flex flex-col items-end gap-1">
                  {/* Dòng 1: Nút */}
                  {lesson.livestream_btn && (
                    <LiveStreamButton
                      {...lesson}
                      onRegister={() => handleRegisterLivestream(lesson._id)}
                    />
                  )}

                  {/* Dòng 2: Ngày phát hành */}
                  {lesson.publish_at ? (
                    <div className="flex items-center gap-1">
                      <DateIcon className="size-3 [&_path]:fill-foundation-400" />
                      <Typography variant={"xs10"}>
                        {new Date(lesson.publish_at).toLocaleDateString(
                          "vi-VN"
                        )}
                      </Typography>
                    </div>
                  ) : (
                    <Typography variant={"xs10"}>Chưa phát hành</Typography>
                  )}
                </div>
              </div>

                  {/* Bài tập (Dòng riêng biệt) */}
                  {lesson.exam && exerciseCount >= 2 && (
                    <div
                      className={cn(
                        "flex items-center justify-between pl-4 pr-1 py-3 bg-white border-x border-b border-[0.5px] border-grey-60 rounded-b",
                        lessonId === lesson._id && "bg-foundation-50"
                      )}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Image
                          src="/icon/ic_trangbaihoc.svg"
                          alt="Exercise"
                          width={18}
                          height={18}
                          className="shrink-0"
                        />
                        <Typography
                          variant={"xs12"}
                          className="text-gray-600 font-medium truncate"
                        >
                          {(Array.isArray(lesson.exam) ? lesson.exam[0]?.name : lesson.exam?.name) || "Bài tập 1"}
                        </Typography>
                      </div>
                      {(() => {
                        const isNotPublished =
                          !lesson.publish_at ||
                          new Date(lesson.publish_at) > new Date();

                        return (
                          <div className="relative">
                            <Button
                              size="sm"
                              disabled={isNotPublished}
                              className={cn(
                                "rounded-full h-8 px-5 text-white text-[12px] font-bold shrink-0 ml-4 transition-colors",
                                isNotPublished
                                  ? "bg-gray-300 cursor-not-allowed"
                                  : lessonIsDoneExam
                                  ? "bg-[#FF7008] hover:bg-[#E66407]"
                                  : "bg-[#2B59C3] hover:bg-[#2349A1]"
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isNotPublished) return;
                                if (lessonIsDoneExam) {
                                  handleViewResult(lesson);
                                } else {
                                  handleDoExam(lesson);
                                }
                              }}
                            >
                              {lessonIsDoneExam ? "Đã làm" : "Làm bài"}
                            </Button>
                            {!lessonIsDoneExam && <FastGiftTag exam={Array.isArray(lesson.exam) ? lesson.exam[0] : lesson.exam} />}
                          </div>
                        );
                      })()}
                    </div>
                  )}
            </div>
          );
        })}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
