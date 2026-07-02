"use client";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useSecurityBlock } from "@/hooks/useSecurityBlock";
import {
  getClassroomView,
  getClassroomChapterCategory,
  getBookIdCourseView,
} from "@/lib/lesson-data";

import {
  ClassroomViewResponse,
  ChapterWithCategories,
} from "@/services/lessonService";
import { cn } from "@/utils/cn";
import { useParams, useSearchParams } from "next/navigation";

import { useQueryString } from "@/hooks/useQueryString";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { CourseContent } from "./CourseContent";
import { CourseSidebar } from "./CourseSidebar";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import "./style.scss";

export type PreCurrentType = {
  chapterId: string;
  lessonId: string;
  lessonName: string;
};

const LessonDetailContext = createContext<{
  classroomData: ClassroomViewResponse | null;
  chaptersData: ChapterWithCategories[] | null;
  currentLesson: any;
  prevCurrent: PreCurrentType[];
  setCurrentLesson: (value: any) => void;
  refetchData: () => Promise<void>;
  setPrevCurrent: Dispatch<SetStateAction<PreCurrentType[]>>;
  nextCurrent: PreCurrentType | undefined;
  setNextCurrent: Dispatch<SetStateAction<PreCurrentType | undefined>>;
  activeVideo: any;
  setActiveVideo: Dispatch<SetStateAction<any>>;
  otherVideos: any[];
  setOtherVideos: Dispatch<SetStateAction<any[]>>;
  goToNext: () => void;
  goToPrev: () => void;
}>({
  classroomData: null,
  chaptersData: null,
  currentLesson: null,
  prevCurrent: [],
  setCurrentLesson: () => {},
  refetchData: async () => {},
  setPrevCurrent: () => {},
  nextCurrent: undefined,
  setNextCurrent: () => {},
  activeVideo: null,
  setActiveVideo: () => {},
  otherVideos: [],
  setOtherVideos: () => {},
  goToNext: () => {},
  goToPrev: () => {},
});

export const useLessonDetail = () => {
  return useContext(LessonDetailContext);
};

const sidebarWidth = 412;
const LessonDetail = () => {
  const isMobile = useIsMobile();
  const { id } = useParams() as { id: string };
  const { updateQueryStrings } = useQueryString();
  const searchParams = useSearchParams();
  const isSearchId = searchParams?.get("isSearchId") === "true";

  const lessonIdFromUrl = searchParams?.get("lessonId") as string;
  const chapterIdFromUrl = searchParams?.get("chapterId") as string;
  const lessonNameFromUrl = searchParams?.get("lessonName") as string;

  // BẢO MẬT
  useSecurityBlock({
    enabled: true,
    silent: true, 
    allowKeyboardShortcuts: false,
    targetSelector: "#video-player-container",
    removeIframe: true
  });
  
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpenSlideBar, setIsOpenSideBar] = useState(true);
  const [classroomData, setClassroomData] = useState<ClassroomViewResponse | null>(null);
  const [chaptersData, setChaptersData] = useState<ChapterWithCategories[] | null>(null);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [prevCurrent, setPrevCurrent] = useState<PreCurrentType[]>([]);
  const [nextCurrent, setNextCurrent] = useState<PreCurrentType>();
  const [activeVideo, setActiveVideo] = useState<any>(null);
  const [otherVideos, setOtherVideos] = useState<any[]>([]);
  const hasScanned = useRef<string | null>(null);

  const onFullScreen = () => setIsFullScreen(!isFullScreen);
  const handleToggleSidebar = () => setIsOpenSideBar(!isOpenSlideBar);

  const goToNext = useCallback(() => {
    if (otherVideos.length > 0 && activeVideo) {
      const idx = otherVideos.findIndex((v: any) => v._id === activeVideo._id);
      if (idx !== -1 && idx < otherVideos.length - 1) {
        setActiveVideo(otherVideos[idx + 1]);
        return;
      }
    }
    if (nextCurrent) {
      setPrevCurrent((prev) => [
        ...prev,
        {
          chapterId: chapterIdFromUrl,
          lessonId: lessonIdFromUrl,
          lessonName: lessonNameFromUrl,
        },
      ]);
      updateQueryStrings(nextCurrent);
    }
  }, [otherVideos, activeVideo, nextCurrent, updateQueryStrings, chapterIdFromUrl, lessonIdFromUrl, lessonNameFromUrl]);

  const goToPrev = useCallback(() => {
    if (otherVideos.length > 0 && activeVideo) {
      const idx = otherVideos.findIndex((v: any) => v._id === activeVideo._id);
      if (idx > 0) {
        setActiveVideo(otherVideos[idx - 1]);
        return;
      }
    }
    if (prevCurrent.length > 0) {
      setPrevCurrent((prev) => {
        const newPrev = [...prev];
        const last = newPrev.pop();
        if (last) updateQueryStrings(last);
        return newPrev;
      });
    }
  }, [otherVideos, activeVideo, prevCurrent, updateQueryStrings]);

  const loadClassroomData = useCallback(async () => {
    if (!id) return;
    const user = localStorage.getItem("user");
    if (!user) return;
    let userId = "";
    try {
      const userData = JSON.parse(user);
      userId = userData._id || userData.id || "";
    } catch (e) { return; }

    setIsLoading(true);
    try {
      const classroomInfo = isSearchId
        ? await getBookIdCourseView({ id, user_id: userId })
        : await getClassroomView({ id, user_id: userId });

      if (classroomInfo) {
        const normalizedData: ClassroomViewResponse = {
          ...classroomInfo,
          classroom: classroomInfo.classroom || (classroomInfo as any).course,
          is_joined: classroomInfo.is_joined ?? (classroomInfo as any).is_bought ?? false,
          otherClassrooms: classroomInfo.otherClassrooms || (classroomInfo as any).otherCourses || [],
        };
        setClassroomData(normalizedData);
        const chaptersInfo = await getClassroomChapterCategory({ classroom_id: id });
        if (chaptersInfo) {
          setChaptersData(chaptersInfo);
          hasScanned.current = null;
        }
      }
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  }, [id, isSearchId]);

  useEffect(() => { loadClassroomData(); }, [loadClassroomData]);

  useEffect(() => {
    if (!chaptersData || !id || isLoading || hasScanned.current === id) return;
    const scanExamStatuses = async () => {
      hasScanned.current = id;
      let hasUpdates = false;
      const updatedChapters = JSON.parse(JSON.stringify(chaptersData));
      const user = localStorage.getItem("user");
      let userId = "";
      try { if (user) { const userData = JSON.parse(user); userId = userData._id || userData.id || ""; } } catch (e) {}
      const examPromises: Promise<any>[] = [];
      for (const chapter of updatedChapters) {
        for (const lesson of chapter.category) {
          if (lesson.exam?.id && !lesson.is_done_exam) {
            const checkStatus = async () => {
              try {
                let isDone = false;
                if (lesson.exam.type === "WORD" && userId) {
                  const { wordExamService } = await import("@/services/wordExamService");
                  const res = await wordExamService.checkWordExamAnswer({ exam_id: lesson.exam.id, user_id: userId });
                  isDone = !!res?.data?.hasTaken;
                } else {
                  const { examService } = await import("@/services/examService");
                  const res = await examService.getScoreByClassroom({ exam_id: lesson.exam.id, classroom_id: id });
                  isDone = !!res?.data;
                }
                if (isDone) { lesson.is_done_exam = true; hasUpdates = true; }
              } catch (e) {}
            };
            examPromises.push(checkStatus());
          }
        }
      }
      if (examPromises.length > 0) {
        await Promise.all(examPromises);
        if (hasUpdates) setChaptersData(updatedChapters);
      }
    };
    scanExamStatuses();
  }, [chaptersData, id, isLoading]);

  // TỰ ĐỘNG CHỌN BÀI HỌC THEO TÊN (Dành cho Search ID loại category)
  useEffect(() => {
    if (chaptersData && lessonNameFromUrl && !lessonIdFromUrl && !isLoading) {
      for (const chapter of chaptersData) {
        const foundLesson = chapter.category.find(
          (lesson) => lesson.name?.trim() === lessonNameFromUrl?.trim()
        );
        if (foundLesson) {
          // ĐỒNG BỘ LOGIC KIỂM TRA PHÁT HÀNH
          if (foundLesson.publish_at) {
            const now = new Date();
            const publishAt = new Date(foundLesson.publish_at);
            if (publishAt > now) {
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
                  }
                );
              }, 100);
              return;
            }
          } else {
            setTimeout(() => {
              toast.info("Bài giảng này chưa được phát hành", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              });
            }, 100);
            return;
          }

          // Đồng bộ logic Livestream (không cho phép click khi đang/sắp live)
          if (foundLesson.livestream_btn && foundLesson.start_date_time_live) {
            const now = new Date().getTime();
            const startTime = new Date(foundLesson.start_date_time_live).getTime();
            const threeHoursInMs = 3 * 60 * 60 * 1000;
            if (now <= startTime + threeHoursInMs) {
              return;
            }
          }

          updateQueryStrings({
            lessonId: foundLesson._id,
            chapterId: chapter._id,
            lessonName: foundLesson.name,
          });
          break;
        }
      }
    }
  }, [chaptersData, lessonNameFromUrl, lessonIdFromUrl, isLoading, updateQueryStrings]);

  return (
    <LessonDetailContext.Provider
      value={{
        classroomData,
        chaptersData,
        currentLesson,
        setCurrentLesson,
        refetchData: loadClassroomData,
        prevCurrent,
        setPrevCurrent,
        nextCurrent,
        setNextCurrent,
        activeVideo,
        setActiveVideo,
        otherVideos,
        setOtherVideos,
        goToNext,
        goToPrev,
      }}
    >
      <section
        style={{
          "--header-height": "68px",
          "--footer-height": isMobile ? "68px" : "80px",
        } as React.CSSProperties}
      >
        <Header />
        <div className={cn("grid grid-cols-1 lg:flex gap-2", isFullScreen && "lg:grid-cols-1")}>
          <div className="flex-1">
            <CourseContent onFullScreen={onFullScreen} />
          </div>
          {!isFullScreen && (
            <AnimatePresence>
              {isOpenSlideBar && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: isMobile ? "100%" : sidebarWidth, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="overflow-hidden bg-white shadow-lg h-screen"
                  style={{ width: isMobile ? "100%" : sidebarWidth }}
                >
                  <div className="hidden lg:block"><CourseSidebar /></div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
        <Footer onToggleSidebar={handleToggleSidebar} isOpenSlideBar={isOpenSlideBar} />
      </section>
    </LessonDetailContext.Provider>
  );
};

export default LessonDetail;
