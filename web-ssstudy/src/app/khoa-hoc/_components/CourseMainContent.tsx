"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { courseService } from "@/services/courseService";
import { Chapter } from "@/types/course";
import { toast } from "react-toastify";
import { CDN_LINK } from "@/utils/constants";
import config from "@/config";

interface CourseData {
  id: string;
  title: string;
  description: string;
  image: string;
  teacher?: string;
  teacherAvatar?: string;
  price?: number;
  originPrice?: number;
  subject?: string;
  group?: string;
  code?: string;
  alias?: string;
  timeCourse?: {
    opening_date: string;
    closing_date: string;
  };
  content?: string;
  updatedAt?: string;
  numStudent?: number;
  studentOwned?: number;
  stats?: {
    lessons: number;
    students: string;
  };
  features?: any[];
  includes?: Array<{
    id?: number | string;
    text?: string;
    title?: string;
    icon?: number;
  }>;
  highlightInformations?: Array<{
    id?: number | string;
    text?: string;
    title?: string;
  }>;
  groupChapter?: Array<{ id: number; title: string }>;
}

interface CourseMainContentProps {
  courseId: string;
  courseData?: CourseData;
}

/**
 * Component hiển thị nội dung chính của khóa học với 2 phần:
 * 1. Giới thiệu chung
 * 2. Giới thiệu các tính năng
 */
// Helper function để format ngày tháng
const formatUpdateDate = (dateString?: string): string => {
  if (!dateString) return "Cập nhật gần đây";

  try {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
    };
    return `Cập nhật vào ${date.toLocaleDateString("vi-VN", options)}`;
  } catch (error) {
    console.warn("Error formatting date:", error);
    return "Cập nhật gần đây";
  }
};

export default function CourseMainContent({
  courseId,
  courseData,
}: CourseMainContentProps) {
  const [activeMainTab, setActiveMainTab] = useState("content");
  const [activeSubjectTab, setActiveSubjectTab] = useState("van");
  const [searchTerm, setSearchTerm] = useState("");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<
    { id: string; label: string; active: boolean }[]
  >([]);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set()
  );

  // Scroll state for subject tabs
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Scroll state for main tabs
  const mainTabsScrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeftMainTabs, setCanScrollLeftMainTabs] = useState(false);
  const [canScrollRightMainTabs, setCanScrollRightMainTabs] = useState(false);

  // Thông tin giáo viên lấy từ classroom-view
  const [teacherInfo, setTeacherInfo] = useState<{
    fullname: string;
    avatar?: string;
    alias?: string;
    profilePic?: string;
  } | null>(null);

  // Helper dựng URL ảnh tuyệt đối nếu API trả về đường dẫn tương đối
  const getImageUrl = (path?: string) => {
    if (!path) return "/imgs/logo.png";
    if (path.startsWith("http")) return path;
    const base = config.apiUrl;
    const normalized = path.startsWith("/") ? path.slice(1) : path;
    return `${base}/${normalized}`;
  };

  // Fetch course chapters and categories
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);

        // Fetch APIs song song: chapters, subjects, classroom/detail
        const [chaptersResponse, subjectsResponse, classroomDetailResponse] =
          await Promise.all([
            courseService.getClassroomChapterCategory({
              classroom_id: courseId,
            }),
            courseService.getSubjectList(),
            courseService.classroomDetail({ id: courseId }),
          ]);

        if (chaptersResponse.code === 200 && subjectsResponse.code === 200) {
          setChapters(chaptersResponse.data);

          // Create a map of subject ID to subject name from subject-list API
          const subjectMap = new Map<string, string>();
          subjectsResponse.data.records.forEach((subject) => {
            subjectMap.set(subject._id, subject.name);
          });

          // Extract groups from chapters and classroom detail
          const groupsFromDetail: any[] = (classroomDetailResponse?.data?.classroom as any)?.group_chapter || [];
          const groupTitlesMap = new Map<string, string>();
          groupsFromDetail.forEach((g: any) => groupTitlesMap.set(String(g.id), g.title));

          const uniqueGroupIdsInChapters = new Set<string>();
          let hasUndefined = false;

          chaptersResponse.data.forEach((chapter) => {
            if ((chapter as any).group_id) {
              uniqueGroupIdsInChapters.add(String((chapter as any).group_id));
            } else {
              hasUndefined = true;
            }
          });

          // Ưu tiên hiển thị các group có trong classroomDetail
          const subjectsArray = groupsFromDetail.map((g: any) => ({
            id: String(g.id),
            label: g.title,
            active: false,
          }));

          // Thêm các group có trong chapters nhưng không có trong classroomDetail
          uniqueGroupIdsInChapters.forEach(id => {
            if (!groupTitlesMap.has(id)) {
              subjectsArray.push({
                id: id,
                label: `Nhóm ${id}`,
                active: false,
              });
            }
          });

          // Thêm tab "Chưa phân loại" nếu có chapters không có group_id
          if (hasUndefined) {
            subjectsArray.push({
              id: "undefined",
              label: "Chưa phân loại",
              active: subjectsArray.length === 0,
            });
          }

          if (subjectsArray.length > 0 && subjectsArray.every((s: any) => !s.active)) {
            subjectsArray[0].active = true;
          }

          setSubjects(subjectsArray);

          // Set first subject as active tab
          if (subjectsArray.length > 0) {
            setActiveSubjectTab(subjectsArray[0].id);
          }
        }

        // Ghép dữ liệu giáo viên từ classroom/detail
        if (
          classroomDetailResponse?.code === 200 &&
          classroomDetailResponse?.data
        ) {
          // API mới: teacher là array trong classroom.teacher
          const teacherArr = classroomDetailResponse.data.classroom?.teacher;
          const first =
            Array.isArray(teacherArr) && teacherArr.length > 0
              ? teacherArr[0]
              : null;
          if (first?.fullname) {
            setTeacherInfo({
              fullname: first.fullname,
              avatar: first.avatar,
              alias: first.alias,
              profilePic: first.profile_pic,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching course data:", error);
        toast.error("Không thể tải dữ liệu khóa học");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  // Check scroll position for subject tabs
  const checkScrollPosition = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth
    );
  };

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
  }, [subjects]);

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

  // Sử dụng dữ liệu thực từ API hoặc fallback
  const displayData = courseData || {
    id: courseId,
    title: "Khóa học",
    teacher: "Giáo viên",
    description: "Mô tả khóa học",
    content: "Nội dung khóa học",
    image: "/imgs/logo.png",
    stats: {
      lessons: 0,
      students: "0",
    },
    features: [],
    includes: [],
    highlightInformations: [],
  };

  // Tạo teacherInfo HTML content giống như sách liên quan
  const teacherInfoHTML = useMemo(() => {
    const primaryTeacher = teacherInfo || {
      fullname: displayData.teacher,
      avatar: displayData.teacherAvatar,
    };

    if (!primaryTeacher?.fullname) {
      return "<p>Thông tin giáo viên sẽ được cập nhật...</p>";
    }

    const teacherAvatar =
      primaryTeacher.avatar ||
      (primaryTeacher as any)?.profilePic ||
      displayData.teacherAvatar;
    const avatarUrl = teacherAvatar
      ? teacherAvatar.startsWith("http")
        ? teacherAvatar
        : `${CDN_LINK}${teacherAvatar}`
      : "";

    return `
      <div style="display:flex; gap:12px; align-items:center; margin-bottom:12px;">
        ${
          avatarUrl
            ? `<img src="${avatarUrl}" alt="${primaryTeacher.fullname}" style="width:48px;height:48px;border-radius:9999px;object-fit:cover;" />`
            : ""
        }
        <div style="font-weight:600;">${primaryTeacher.fullname}</div>
      </div>
    `;
  }, [teacherInfo, displayData.teacher, displayData.teacherAvatar]);

  const highlightsList = Array.isArray(displayData.highlightInformations)
    ? displayData.highlightInformations
        .map((item, index) => {
          const text = (item?.text || item?.title || "").trim();
          if (!text) return null;
          const id = item?.id ?? `${index}`;
          return { id: String(id), text };
        })
        .filter((item): item is { id: string; text: string } => Boolean(item))
    : [];

  // Data cho các tab chính
  const mainTabs = useMemo(
    () => [
      { id: "content", label: "Nội dung khóa học", count: null },
      { id: "teacher", label: "Giáo viên", count: null },
    ],
    []
  );

  // Check scroll position for main tabs
  const checkMainTabsScrollPosition = () => {
    const container = mainTabsScrollContainerRef.current;
    if (!container) return;

    setCanScrollLeftMainTabs(container.scrollLeft > 0);
    setCanScrollRightMainTabs(
      container.scrollLeft < container.scrollWidth - container.clientWidth
    );
  };

  // Update scroll buttons visibility for main tabs
  useEffect(() => {
    const container = mainTabsScrollContainerRef.current;
    if (!container) return;

    checkMainTabsScrollPosition();

    const handleScroll = () => checkMainTabsScrollPosition();
    container.addEventListener("scroll", handleScroll);

    // Check on resize
    const resizeObserver = new ResizeObserver(() =>
      checkMainTabsScrollPosition()
    );
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      resizeObserver.disconnect();
    };
  }, [mainTabs]);

  // Scroll functions for main tabs
  const scrollLeftMainTabs = () => {
    const container = mainTabsScrollContainerRef.current;
    if (!container) return;
    container.scrollBy({ left: -200, behavior: "smooth" });
  };

  const scrollRightMainTabs = () => {
    const container = mainTabsScrollContainerRef.current;
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

  // Check if all chapters are undefined (toàn bộ là "Chưa xác định")
  const shouldHideSubjectTabs = useMemo(() => {
    if (!chapters || chapters.length === 0) return false;

    const uniqueGroupIds = new Set<string>();
    let hasUndefined = false;

    chapters.forEach((chapter) => {
      if ((chapter as any).group_id) {
        uniqueGroupIds.add(String((chapter as any).group_id));
      } else {
        hasUndefined = true;
      }
    });

    // Ẩn tabs nếu toàn bộ chapters đều là "Chưa phân loại"
    return uniqueGroupIds.size === 0 && hasUndefined;
  }, [chapters]);

  // Get filtered chapters for active subject
  const getFilteredChapters = () => {
    // If all chapters are undefined, show all chapters
    let filteredChapters = shouldHideSubjectTabs
      ? chapters
      : chapters.filter((chapter) => {
          if (activeSubjectTab === "undefined") {
            return !(chapter as any).group_id;
          }
          return String((chapter as any).group_id) === activeSubjectTab;
        });

    // Apply search filter if search term exists
    if (searchTerm.trim()) {
      filteredChapters = filteredChapters.filter((chapter) => {
        return chapter.category.some((category) =>
          category.name.toLowerCase().includes(searchTerm.toLowerCase())
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
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Phần 1: Giới thiệu chung */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-3">
          {displayData.title}
        </h1>
        {displayData.teacher && (
          <p className="text-gray-600 mb-4 leading-relaxed">
            {displayData.teacher}
          </p>
        )}
        {displayData.description && (
          <div
            className="text-gray-600 mb-4 leading-relaxed prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: displayData.description }}
          />
        )}

        {/* Thống kê */}
        {(displayData.updatedAt ||
          (displayData.studentOwned != null &&
            displayData.studentOwned > 0)) && (
          <div className="flex items-center space-x-6 bg-blue-50 p-4 rounded-lg">
            {displayData.updatedAt && (
              <div className="flex items-center text-blue-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
                  />
                </svg>
                <span className="font-medium">
                  {formatUpdateDate(displayData.updatedAt)}
                </span>
              </div>
            )}
            {displayData.studentOwned != null &&
              displayData.studentOwned > 0 && (
                <div className="flex items-center text-blue-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                  <span className="font-medium">
                    {displayData.studentOwned} học viên đã học
                  </span>
                </div>
              )}
          </div>
        )}
      </div>

      {/* Phần 2: Giới thiệu các tính năng/ưu điểm */}
      {highlightsList.length > 0 && (
        <div className="highlights-section">
          <div className="highlights-grid-2col">
            {highlightsList.map((item) => (
              <div key={item.id} className="highlight-item">
                <div className="highlight-item-icon">
                  <img src="/icon/ic_dautich.svg" alt="highlight" />
                </div>
                <div className="highlight-item-content">
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Phần 3: Danh sách bài học với tabs */}
      <div className="bg-white rounded-lg shadow-md">
        {/* Main Tabs - Ẩn khi toàn bộ là "Chưa xác định" */}
        {!shouldHideSubjectTabs && (
          <div className="border-b border-gray-200">
            <div className="relative w-full">
              {/* Left scroll button */}
              {canScrollLeftMainTabs && (
                <button
                  onClick={scrollLeftMainTabs}
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
                ref={mainTabsScrollContainerRef}
                className="overflow-x-auto scrollbar-hide"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                <div className="flex min-w-max">
                  {mainTabs.map((tab) => (
                    <button
                      key={tab.id}
                      className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        activeMainTab === tab.id
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
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
              </div>

              {/* Right scroll button */}
              {canScrollRightMainTabs && (
                <button
                  onClick={scrollRightMainTabs}
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
          </div>
        )}

        {/* Tab Content */}
        {(shouldHideSubjectTabs || activeMainTab === "content") && (
          <div className="p-6">
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
            {!shouldHideSubjectTabs && (
              <div className="mb-6">
                <div className="relative w-full">
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
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                            activeSubjectTab === subject.id
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                          onClick={() => setActiveSubjectTab(subject.id)}
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
                      className="absolute right-0 top-[3px] -translate-y-1/2 z-10 transition-all hover:opacity-80"
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
                    className="border border-gray-200 rounded-lg"
                  >
                    {/* Chapter Header */}
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
                        <h3 className="text-lg font-semibold text-gray-800">
                          {chapter.chapter.name}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-4 text-base text-gray-600">
                        <span className="font-medium">
                          {chapter.category.length} Bài giảng
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
                          .map((category) => (
                            <div
                              key={category._id}
                              className="px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
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
                                <div>
                                  <Link
                                    href={`/lesson/${courseId}?lessonId=${category._id}&chapterId=${chapter._id}`}
                                  >
                                    <h4 className="text-base font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                                      {highlightSearchTerm(
                                        category.name,
                                        searchTerm
                                      )}
                                    </h4>
                                  </Link>
                                  <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-3 w-3"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"
                                      />
                                    </svg>
                                    <span>
                                      {formatDate(category.publish_at)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {category.is_free ? (
                                  <>
                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm font-semibold">
                                      Free
                                    </span>
                                    {category.total_video_time > 0 && (
                                      <span className="text-base text-gray-600 font-medium">
                                        {formatDuration(
                                          category.total_video_time
                                        )}
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded text-sm font-semibold">
                                      Pro
                                    </span>
                                    {category.total_video_time > 0 && (
                                      <span className="text-base text-gray-600 font-medium">
                                        {formatDuration(
                                          category.total_video_time
                                        )}
                                      </span>
                                    )}
                                  </>
                                )}

                                {/* Action buttons */}
                                <div className="flex space-x-1">
                                  {category.show_video_btn &&
                                    category.video_link && (
                                      <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-blue-700 transition-colors">
                                        Xem video
                                      </button>
                                    )}
                                  {category.show_doc_btn &&
                                    category.doc_link && (
                                      <button className="bg-gray-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-gray-700 transition-colors">
                                        Tài liệu
                                      </button>
                                    )}
                                  {category.show_exam_btn && category.exam && (
                                    <button className="bg-green-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-green-700 transition-colors">
                                      Làm bài
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Chưa có bài học nào cho môn{" "}
                  {subjects.find((s) => s.id === activeSubjectTab)?.label}
                </div>
              )}
            </div>
          </div>
        )}

        {activeMainTab === "teacher" && (
          <div className="p-6">
            <div
              className="teacher-tab-content"
              dangerouslySetInnerHTML={{ __html: teacherInfoHTML }}
            />
          </div>
        )}

        {/* {activeMainTab === "reviews" && (
          <div className="p-6">
            <div className="text-center py-8 text-gray-500">
              Đánh giá từ học viên sẽ được hiển thị tại đây
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
}
