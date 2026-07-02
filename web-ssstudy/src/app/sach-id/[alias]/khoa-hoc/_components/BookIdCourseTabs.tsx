"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { courseService } from "@/services/courseService";
import { Chapter } from "@/types/course";
import { toast } from "react-toastify";
import { CDN_LINK } from "@/utils/constants";
import { categoryService } from "@/services/categoryService";
import TeacherTabContent from "@/components/common/TeacherTabContent";
import { apiService } from "@/services/api";
import { useRouter } from "next/navigation";
import { cn } from "@/utils/cn";
import { authService } from "@/services/authService";
import PlayVideoIcon from "@/components/icons/PlayVideoIcon";
import { Typography } from "@/components/ui";

interface CourseData {
  id: string;
  title: string;
  description?: string;
  teacher?: string;
  teacherAvatar?: string;
  content?: string;
  updatedAt?: string;
  studentOwned?: number;
  isJoined?: boolean;
  groupChapter?: Array<{ id: number; title: string }>;
  expiredDate?: string | null;
  totalExtendedMonths?: number;
  extendTimes?: number;
}

interface Teacher {
  _id?: string;
  fullname?: string;
  avatar?: string;
  profile_pic?: string;
  alias?: string;
  description?: string;
  content?: string;
  featured_stats_box?: any;
  featured_text_box?: any;
  link_fb?: string;
  total_classroom?: number;
  total_student?: number;
  [key: string]: any;
}

interface CourseTabsProps {
  courseId: string;
  courseData: CourseData;
  teacher?: Teacher | null;
}

export default function CourseTabs({
  courseId,
  courseData,
  teacher,
}: CourseTabsProps) {
  const [activeMainTab, setActiveMainTab] = useState("content");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set(),
  );
  const [activeGroupTab, setActiveGroupTab] = useState<string>("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const router = useRouter();

  // Fetch chapters function - extracted to reuse after registration
  const fetchChapters = useCallback(async () => {
    try {
      setLoading(true);
      const [chaptersResponse, subjectsResponse] = await Promise.all([
        courseService.getClassroomChapterCategory({
          classroom_id: courseId,
        }),
        courseService.getSubjectList(),
      ]);

      if (chaptersResponse.code === 200 && subjectsResponse.code === 200) {
        const chaptersData = chaptersResponse.data || [];
        setChapters(chaptersData);

        // Set first group as active
        const groupsList = courseData.groupChapter || [];
        if (groupsList.length > 0) {
          setActiveGroupTab(String(groupsList[0].id));
        } else {
          // Fallback to extraction from chapters if no group_chapter provided
          const uniqueGroupIds = new Set<string>();
          chaptersData.forEach((chapter) => {
            if (chapter.group_id) {
              uniqueGroupIds.add(String(chapter.group_id));
            }
          });
          if (uniqueGroupIds.size > 0) {
            setActiveGroupTab(Array.from(uniqueGroupIds)[0]);
          } else {
            setActiveGroupTab("undefined");
          }
        }
      }
    } catch (error) {
      console.error("Error fetching chapters:", error);
      toast.error("Không thể tải danh sách bài học");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  // Fetch chapters on mount
  useEffect(() => {
    if (courseId) {
      fetchChapters();
    }
  }, [courseId, fetchChapters]);

  // Get unique groups from chapters and classroom detail
  const subjects = useMemo(() => {
    const groupsFromData = courseData.groupChapter || [];
    const groupTitlesMap = new Map<string, string>();
    groupsFromData.forEach((g) => groupTitlesMap.set(String(g.id), g.title));

    const uniqueGroupIdsInChapters = new Set<string>();
    let hasUndefined = false;

    chapters.forEach((chapter) => {
      if (chapter.group_id) {
        uniqueGroupIdsInChapters.add(String(chapter.group_id));
      } else {
        hasUndefined = true;
      }
    });

    // Ưu tiên hiển thị các group có trong classroomDetail
    const subjectsList = groupsFromData.map((g) => ({
      id: String(g.id),
      label: g.title,
    }));

    // Thêm các group có trong chapters nhưng không có trong classroomDetail (nếu có)
    uniqueGroupIdsInChapters.forEach((id) => {
      if (!groupTitlesMap.has(id)) {
        subjectsList.push({
          id: id,
          label: `Nhóm ${id}`,
        });
      }
    });

    // Thêm tab "Chưa xác định" nếu có chapters không có group_id
    if (hasUndefined) {
      subjectsList.push({
        id: "undefined",
        label: "Chưa phân loại",
      });
    }

    return subjectsList;
  }, [chapters, courseData.groupChapter]);

  // Check scroll position for subject tabs
  const checkScrollPosition = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth,
    );
  }, []);

  // Update scroll buttons visibility
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScrollPosition();

    const handleScroll = () => checkScrollPosition();
    container.addEventListener("scroll", handleScroll);

    // Check on resize
    const resizeObserver = new ResizeObserver(() => checkScrollPosition());
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      resizeObserver.disconnect();
    };
  }, [subjects, checkScrollPosition]);

  // Scroll functions for subject tabs
  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollBy({ left: -200, behavior: "smooth" });
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollBy({ left: 200, behavior: "smooth" });
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  // Helper function to format duration
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Tính tiến độ hoàn thành của chương (completed/total + %)
  const getChapterCompletion = (chapter: Chapter) => {
    const total = chapter.category.length;
    const completed = chapter.category.filter((cat) => {
      // Kiểm tra video đã xem
      if (cat.is_done_video) return true;
      
      // Kiểm tra nếu có exam bào đã làm
      if (cat.exam && Array.isArray(cat.exam)) {
        return cat.exam.some((exam: any) => exam.is_done_exam === true);
      }
      
      return false;
    }).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  };

  // Thông tin livestream để hiển thị nhãn “Live: dd/mm/yyyy | HH:MM”
  const getLiveInfo = (category: any) => {
    try {
      const startTime = new Date(category.start_date_time_live).getTime();
      const now = Date.now();
      const endTime = startTime + 3 * 60 * 60 * 1000;
      const inLiveTime = now <= endTime;
      if (inLiveTime) {
        if (
          Array.isArray(category?.livestreams) &&
          category.livestreams.length > 0
        ) {
          const live = category.livestreams[0];
          const dateStr = category?.start_date_time_live;
          if (dateStr) {
            const d = new Date(dateStr);
            const dateFmt = d.toLocaleDateString("vi-VN");
            const timeFmt = d.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            });
            return {
              label: `Live: ${dateFmt} | ${timeFmt}`,
              status: live?.status,
            };
          }
        }
        if (category?.livestream_btn && category?.publish_at) {
          const d = new Date(category.publish_at);
          const dateFmt = d.toLocaleDateString("vi-VN");
          const timeFmt = d.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          });
          return { label: `Du: ${dateFmt} | ${timeFmt}`, status: undefined };
        }
      }
    } catch {}
    return null;
  };

  // Kiểm tra có quyền học (miễn phí hoặc có video/tài liệu/thi)
  const hasAccess = (category: any) => {
    return (
      category?.is_free === true ||
      (category?.show_video_btn && category?.video_link) ||
      (category?.show_doc_btn && category?.doc_link) ||
      (category?.show_exam_btn && category?.exam)
    );
  };

  // Handle join room
  const handleJoinRoom = (linkLive: string) => {
    if (linkLive) {
      window.open(linkLive, "_blank");
    }
  };

  // Handle register livestream
  const handleRegisterLivestream = async (
    categoryId: string,
    classroomId: string,
  ) => {
    try {
      const response = await categoryService.registerLivestream({
        category_id: categoryId,
        classroom_id: classroomId,
      });

      if (response && response.code === 200) {
        toast.success(
          response.message ||
            "Đăng ký học livestream thành công, bạn hãy truy cập buổi học vào ngày chính thức nhé!",
        );
        // Refetch chapters to update registration status
        await fetchChapters();
      } else {
        toast.error(
          response.message ||
            "Không thể đăng ký học livestream. Vui lòng thử lại!",
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Không thể đăng ký học livestream. Vui lòng thử lại!";
      console.error("Error registering livestream:", error);
      toast.error(errorMessage);
    }
  };

  // Xác định nút hành động theo trạng thái (Vào học/Đăng ký/Đã đăng ký/Hết chỗ)
  const getLessonAction = (category: any) => {
    const isRegisted = category.livestream_registed;
    const startTime = new Date(category.start_date_time_live).getTime();
    const now = Date.now();
    const endTime = startTime + 3 * 60 * 60 * 1000;
    const inLiveTime = now > startTime && now <= endTime;
    const beforeLiveTime = now <= startTime;
    const liveCurrentSize = category.livestream_current_size;
    const liveMaxsize = category.livestream_max_size;

    if (isRegisted) {
      if (inLiveTime) {
        return {
          label: "Vào học",
          className: "bg-blue-600 text-white hover:bg-blue-700",
          action: () => handleJoinRoom(category.livestream_registed_link), // Trả về function, không gọi ngay
        };
      }
      if (beforeLiveTime) {
        return {
          label: "Đã đăng ký",
          className: "bg-gray-200 text-gray-600 cursor-not-allowed",
        };
      }
    } else {
      if (inLiveTime || beforeLiveTime) {
        if (liveCurrentSize < liveMaxsize) {
          return {
            label: "Đăng ký học",
            className: "bg-blue-600 text-white hover:bg-blue-700",
            action: () => handleRegisterLivestream(category._id, courseId),
          };
        } else {
          return { label: "Hết chỗ", className: "bg-red-100 text-red-600" };
        }
      }
    }

    // if (liveInfo) {
    //   const s = liveInfo.status;
    //   if (s === "registered")
    //     return { label: "Đã đăng ký", className: "bg-gray-200 text-gray-600 cursor-not-allowed" };
    //   if (s === "fullSlot")
    //     return { label: "Hết chỗ", className: "bg-red-100 text-red-600" };
    //   return { label: "Đăng ký học", className: "bg-blue-600 text-white hover:bg-blue-700" };
    // }
    // if (hasAccess(category)) {
    //   return { label: "Vào học", className: "bg-blue-600 text-white hover:bg-blue-700" };
    // }
    return null;
  };

  // Get filtered chapters for active group
  const getFilteredChapters = () => {
    if (!activeGroupTab) return chapters;

    let filteredChapters = chapters.filter((chapter) => {
      if (activeGroupTab === "undefined") {
        return !chapter.group_id;
      }
      return String(chapter.group_id) === activeGroupTab;
    });

    // Apply search filter if search term exists
    if (searchTerm.trim()) {
      filteredChapters = filteredChapters.filter((chapter) => {
        return chapter.category.some((category) =>
          category.name.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      });
    }

    return filteredChapters;
  };

  // Toggle chapter expansion
  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(chapterId)) {
        newSet.delete(chapterId);
      } else {
        newSet.add(chapterId);
      }
      return newSet;
    });
  };

  // Handle search
  const handleSearch = () => {
    if (searchTerm.trim()) {
      // Expand all chapters to show search results
      const allChapterIds = new Set(chapters.map((chapter) => chapter._id));
      setExpandedChapters(allChapterIds);
    } else {
      // Clear search - collapse all chapters
      setExpandedChapters(new Set());
    }
  };

  // Handle search input blur
  const handleSearchBlur = () => {
    handleSearch();
  };

  // Handle search input key press
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  /**
   * RULE: Kiểm tra hạn sử dụng của sách ID
   * Đã hết hạn (hết hạn gốc hoặc hết hạn gia hạn hoàn toàn)
   */
  const isAccessDenied = useMemo(() => {
    // Nếu chưa tham gia khóa học thì chưa xét đến hạn sử dụng ở đây
    if (!courseData.isJoined) return false;

    // Hết lượt gia hạn = Hết hạn hoàn toàn
    if (courseData.extendTimes === 0) return true;

    if (!courseData.expiredDate) return false;

    const now = new Date();
    const expiry = new Date(courseData.expiredDate);

    const nowDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).getTime();
    const expiryDay = new Date(
      expiry.getFullYear(),
      expiry.getMonth(),
      expiry.getDate(),
    ).getTime();

    // 1. Đã quá ngày hết hạn gốc
    if (nowDay >= expiryDay) {
      // Kiểm tra xem có đang trong thời gian ân hạn không?
      const graceEndDate = new Date(expiry);
      const monthsToAdd =
        typeof courseData.totalExtendedMonths === "number"
          ? courseData.totalExtendedMonths
          : 3;
      graceEndDate.setMonth(expiry.getMonth() + monthsToAdd);

      const graceEndDay = new Date(
        graceEndDate.getFullYear(),
        graceEndDate.getMonth(),
        graceEndDate.getDate(),
      ).getTime();

      // Nếu đã quá cả ngày hết hạn gia hạn -> Chặn
      if (nowDay > graceEndDay) return true;

      // Nếu đang trong ngày hết hạn gia hạn hoặc giữa ngày hết hạn gốc và gia hạn -> Chặn (vì yêu cầu là phải "vẫn còn hạn")
      return true;
    }

    return false;
  }, [
    courseData.expiredDate,
    courseData.isJoined,
    courseData.extendTimes,
    courseData.totalExtendedMonths,
  ]);

  // Highlight search term in text
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;

    const regex = new RegExp(`(${searchTerm})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      ),
    );
  };

  // Data cho các tab chính
  const mainTabs = [
    { id: "content", label: "Nội dung khóa học", count: null },
    { id: "teacher", label: "Giáo viên", count: null },
  ];

  return (
    <div className="book-tabs">
      {/* Tab Headers */}
      <div className="tabs-header">
        {mainTabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeMainTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveMainTab(tab.id)}
          >
            {tab.label}
            {tab.count && (
              <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tabs-content">
        {activeMainTab === "content" && (
          <div className="tab-panel active">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm nhanh bài học tại đây"
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onBlur={handleSearchBlur}
                  onKeyPress={handleSearchKeyPress}
                />
                <div
                  className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                  onClick={handleSearch}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label="Tìm kiếm bài học"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Subject Tabs */}
            {subjects.length > 1 && (
              <div className="mb-6 relative w-full">
                {/* Left scroll button */}
                {canScrollLeft && (
                  <button
                    onClick={scrollLeft}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 transition-all hover:opacity-80"
                    aria-label="Scroll left"
                  >
                    <Image
                      src="/imgs/next.png"
                      alt="Previous"
                      width={32}
                      height={32}
                      className="rotate-180"
                    />
                  </button>
                )}

                {/* Scrollable container */}
                <div
                  ref={scrollContainerRef}
                  className="overflow-x-auto scrollbar-hide"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  <div className="flex gap-2 min-w-max pb-2">
                    {subjects.map((subject) => (
                      <button
                        key={subject.id}
                        className={cn(
                          "px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                          activeGroupTab === subject.id
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                        )}
                        onClick={() => setActiveGroupTab(subject.id)}
                      >
                        {subject.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right scroll button */}
                {canScrollRight && (
                  <button
                    onClick={scrollRight}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 transition-all hover:opacity-80"
                    aria-label="Scroll right"
                  >
                    <Image
                      src="/imgs/next.png"
                      alt="Next"
                      width={32}
                      height={32}
                    />
                  </button>
                )}
              </div>
            )}

            {/* Lessons Content */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-500">Đang tải dữ liệu...</p>
                </div>
              ) : getFilteredChapters().length > 0 ? (
                getFilteredChapters().map((chapter) => (
                  <div
                    key={chapter._id}
                    className="border border-dashed border-gray-300 rounded-lg"
                  >
                    {/* Chapter Header (Tên chương: chapter.chapter.name + Tiến độ) */}
                    <div
                      className="bg-gray-50 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => toggleChapter(chapter._id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggleChapter(chapter._id);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Toggle ${chapter.chapter.name} chapter`}
                    >
                      <div className="flex items-center space-x-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                            expandedChapters.has(chapter._id) ? "rotate-90" : ""
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                        <h4 className="text-base font-semibold text-gray-800">
                          {chapter.chapter.name}
                        </h4>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-700">
                        {/* <span className="text-blue-600 font-semibold">
                          Hoàn thành {getChapterCompletion(chapter).percent}%
                        </span> */}
                        <span className="font-medium">
                          {/* {getChapterCompletion(chapter).completed}/ */}
                          {getChapterCompletion(chapter).total} Bài giảng
                        </span>
                      </div>
                    </div>

                    {/* Lessons List */}
                    {expandedChapters.has(chapter._id) && (
                      <div className="divide-y divide-gray-100">
                        {chapter.category
                          .filter((category) => {
                            // If search term exists, filter categories by search term
                            if (searchTerm.trim()) {
                              return category.name
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase());
                            }
                            return true;
                          })
                          .sort((a, b) => a.ordering - b.ordering)
                          .map((category) => {
                            const liveInfo = getLiveInfo(category);
                            const action = getLessonAction(category);
                            const locked = !hasAccess(category);
                            const isLive = !!liveInfo;

                            return (
                              <div
                                key={category._id}
                                className="px-4 py-3 hover:bg-gray-50"
                              >
                                {/* Desktop: layout ngang, Mobile: layout dọc */}
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                                  {/* Trái: icon + tiêu đề + thời gian */}
                                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                                      <div className="flex-shrink-0 pt-1">
                                        {/* icon video/document */}
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="h-4 w-4 text-blue-600"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                          />
                                        </svg>
                                      </div>

                                      <div className="min-w-0 flex-1">
                                        <div
                                          onClick={() => {
                                            const isLoggedIn =
                                              authService.isLoggedIn();
                                            if (!isLoggedIn) {
                                              // Redirect sang login với redirect parameter
                                              const currentPath =
                                                window.location.pathname;
                                              router.push(
                                                `/auth/signin?redirect=${encodeURIComponent(
                                                  currentPath,
                                                )}`,
                                              );
                                              return;
                                            }

                                            // RULE: Nếu hết hạn thì không cho vào học
                                            if (isAccessDenied) {
                                              toast.info(
                                                "Sách ID của bạn đã hết hạn. Vui lòng gia hạn để tiếp tục vào học!",
                                                {
                                                  position: "top-right",
                                                  autoClose: 3000,
                                                  hideProgressBar: true,
                                                  closeOnClick: true,
                                                  pauseOnHover: true,
                                                  draggable: true,
                                                  progress: undefined,
                                                },
                                              );
                                              return;
                                            }

                                            if (
                                              !category.is_free &&
                                              !courseData.isJoined
                                            ) {
                                              toast.info(
                                                "Bạn cần tham gia khóa học để truy cập bài giảng",
                                                {
                                                  position: "top-right",
                                                  autoClose: 3000,
                                                  hideProgressBar: true,
                                                  closeOnClick: true,
                                                  pauseOnHover: true,
                                                  draggable: true,
                                                  progress: undefined,
                                                },
                                              );
                                              return;
                                            }
                                            if (category.publish_at) {
                                              const now = new Date();
                                              const publishAt = new Date(
                                                category.publish_at,
                                              );
                                              const isNotPublishAt =
                                                publishAt > now;
                                              if (isNotPublishAt) {
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
                                                  },
                                                );
                                                return;
                                              }
                                            }
                                            if (!category.publish_at) {
                                              toast.info(
                                                "Bài giảng này chưa được phát hành",
                                                {
                                                  position: "top-right",
                                                  autoClose: 3000,
                                                  hideProgressBar: true,
                                                  closeOnClick: true,
                                                  pauseOnHover: true,
                                                  draggable: true,
                                                  progress: undefined,
                                                },
                                              );
                                              return;
                                            }
                                            // Trong App Router, router.push() chỉ nhận string
                                            const params = new URLSearchParams({
                                              lessonId: category._id,
                                              lessonName: category.name,
                                              chapterId: chapter._id,
                                            });
                                            router.push(
                                              `/lesson/${courseId}?${params.toString()}`,
                                            );
                                          }}
                                        >
                                          <h6
                                            className={cn(
                                              "text-sm font-medium whitespace-normal break-words cursor-pointer",
                                              isAccessDenied
                                                ? "text-gray-400 hover:text-gray-400 cursor-not-allowed"
                                                : "text-blue-600 hover:text-blue-800",
                                            )}
                                          >
                                            {highlightSearchTerm(
                                              category.name,
                                              searchTerm,
                                            )}
                                          </h6>
                                        </div>

                                      {/* CHỈ 1 DÒNG THỜI GIAN: ưu tiên Live, nếu không có thì hiện ngày đăng */}
                                      {/* Mobile: tag live/ngày và các thành phần bên phải */}
                                      <div className="mt-1 flex items-center justify-between gap-2">
                                        <div>
                                          {liveInfo ? (
                                            <div className="bg-orange-500 rounded-2xl h-[22px] inline-flex items-center gap-1 px-[6px]">
                                              <PlayVideoIcon className="size-3 [&_path]:fill-white" />
                                              <Typography
                                                variant={"xs10"}
                                                className="text-white"
                                              >
                                                {liveInfo.label}
                                              </Typography>
                                            </div>
                                          ) : (
                                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                              <img
                                                src="/icon/ic_lich.svg"
                                                alt="Calendar"
                                                className="h-4 w-4"
                                              />
                                              <span>
                                                {category?.publish_at
                                                  ? formatDate(
                                                      category?.publish_at,
                                                    )
                                                  : "Chưa phát hành"}
                                              </span>
                                            </div>
                                          )}
                                        </div>

                                        {/* Phần bên phải trên mobile */}
                                        <div className="flex items-center gap-2 md:hidden">
                                          {isLive ? (
                                            <>
                                              {/* Nút action cho live */}
                                              {action && (
                                                <button
                                                  className={cn(
                                                    "px-3 py-1.5 rounded text-xs font-semibold",
                                                    isAccessDenied
                                                      ? "bg-gray-200 text-gray-500 cursor-not-allowed hover:bg-gray-200"
                                                      : action.className,
                                                  )}
                                                  onClick={() => {
                                                    if (isAccessDenied) {
                                                      toast.info(
                                                        "Sách ID của bạn đã hết hạn. Vui lòng gia hạn để tiếp tục vào học!",
                                                      );
                                                      return;
                                                    }
                                                    action.action?.();
                                                  }}
                                                >
                                                  {action.label}
                                                </button>
                                              )}
                                            </>
                                          ) : (
                                            <>
                                              {/* Free/Pro tag */}
                                              {category.is_free ? (
                                                <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
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
                                                  <span className="text-[#FFC107]">
                                                    Pro
                                                  </span>
                                                </span>
                                              )}

                                              {/* Icon khóa */}
                                              {locked &&
                                                !courseData.isJoined && (
                                                  <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    className="h-4 w-4 text-[#606C84]"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    aria-label="Khoá"
                                                    role="img"
                                                  >
                                                    <path
                                                      strokeLinecap="round"
                                                      strokeLinejoin="round"
                                                      strokeWidth={1.5}
                                                      d="M16.5 10V7.5a4.5 4.5 0 00-9 0V10M6 10h12v8a2 2 0 01-2 2H8a2 2 0 01-2-2v-8m6 5v-3"
                                                    />
                                                  </svg>
                                                )}

                                              {/* Nút action (nếu có) */}
                                              {action && (
                                                <button
                                                  className={cn(
                                                    "px-3 py-1.5 rounded text-xs font-semibold",
                                                    isAccessDenied
                                                      ? "bg-gray-200 text-gray-500 cursor-not-allowed hover:bg-gray-200"
                                                      : action.className,
                                                  )}
                                                  onClick={() => {
                                                    if (isAccessDenied) {
                                                      toast.info(
                                                        "Sách ID của bạn đã hết hạn. Vui lòng gia hạn để tiếp tục vào học!",
                                                      );
                                                      return;
                                                    }
                                                    action.action?.();
                                                  }}
                                                >
                                                  {action.label}
                                                </button>
                                              )}
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Phải: Free/Pro, Thời lượng, Khoá, Nút bấm - Chỉ hiện trên desktop */}
                                  <div className="hidden md:flex items-center space-x-3 flex-shrink-0">
                                    {isLive ? (
                                      <>
                                        {action && (
                                          <button
                                            className={cn(
                                              "px-4 py-2 rounded text-sm font-semibold",
                                              isAccessDenied
                                                ? "bg-gray-200 text-gray-500 cursor-not-allowed hover:bg-gray-200"
                                                : action.className,
                                            )}
                                            onClick={() => {
                                              if (isAccessDenied) {
                                                toast.info(
                                                  "Sách ID của bạn đã hết hạn. Vui lòng gia hạn để tiếp tục vào học!",
                                                );
                                                return;
                                              }
                                              action.action?.();
                                            }}
                                          >
                                            {action.label}
                                          </button>
                                        )}
                                      </>
                                    ) : (
                                      <>
                                        {category.is_free ? (
                                          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                            Free
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center bg-blue-600 px-3 py-1 rounded text-sm font-semibold">
                                            <Image
                                              src="/icon/crown-svgrepo-com.svg"
                                              alt="Pro"
                                              width={16}
                                              height={16}
                                              className="mr-1"
                                            />
                                            <span className="text-[#FFC107]">
                                              Pro
                                            </span>
                                          </span>
                                        )}
                                        {/*
                                        <span className="text-sm font-medium text-[#606C84]">
                                          {formatDuration(category.total_video_time)}
                                        </span> */}

                                        {locked && !courseData.isJoined && (
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            className="h-5 w-5 text-[#606C84]"
                                            fill="none"
                                            stroke="currentColor"
                                            aria-label="Khoá"
                                            role="img"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={1.5}
                                              d="M16.5 10V7.5a4.5 4.5 0 00-9 0V10M6 10h12v8a2 2 0 01-2 2H8a2 2 0 01-2-2v-8m6 5v-3"
                                            />
                                          </svg>
                                        )}

                                        {action && (
                                          <button
                                            className={cn(
                                              "px-4 py-2 rounded text-sm font-semibold",
                                              isAccessDenied
                                                ? "bg-gray-200 text-gray-500 cursor-not-allowed hover:bg-gray-200"
                                                : action.className,
                                            )}
                                            onClick={() => {
                                              if (isAccessDenied) {
                                                toast.info(
                                                  "Sách ID của bạn đã hết hạn. Vui lòng gia hạn để tiếp tục vào học!",
                                                );
                                                return;
                                              }
                                              action.action?.();
                                            }}
                                          >
                                            {action.label}
                                          </button>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Chưa có bài học nào cho môn{" "}
                  {subjects.find((s) => s.id === activeGroupTab)?.label}
                </div>
              )}
            </div>
          </div>
        )}

        {activeMainTab === "teacher" && (
          <div className="tab-panel active">
            <TeacherTabContent teacher={teacher} />
          </div>
        )}
      </div>
    </div>
  );
}
