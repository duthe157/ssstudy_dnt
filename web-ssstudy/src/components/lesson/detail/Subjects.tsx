"use client";

import { cn } from "@/utils/cn";
import React, { useMemo, useEffect, useState, useRef } from "react";
import { useLessonDetail } from ".";
import { courseService } from "@/services/courseService";
import Image from "next/image";

interface SubjectsProps {
  activeGroupTab: string;
  setActiveGroupTab: (value: string) => void;
}

export const Subjects = ({
  activeGroupTab,
  setActiveGroupTab,
}: SubjectsProps) => {
  const { chaptersData, classroomData } = useLessonDetail();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Get unique groups from chapters (giống CourseTabs.tsx)
  const { subjects, shouldHideSubjectTabs } = useMemo(() => {
    if (!chaptersData) return { subjects: [], shouldHideSubjectTabs: false };

    const groupsFromData = classroomData?.classroom?.group_chapter || [];
    const groupTitlesMap = new Map<string, string>();
    groupsFromData.forEach((g) => groupTitlesMap.set(String(g.id), g.title));

    const uniqueGroupIdsInChapters = new Set<string>();
    let hasUndefined = false;

    chaptersData.forEach((chapter) => {
      if ((chapter as any).group_id) {
        uniqueGroupIdsInChapters.add(String((chapter as any).group_id));
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

    // Ẩn tabs nếu toàn bộ chapters đều là "Chưa xác định"
    const shouldHide = uniqueGroupIdsInChapters.size === 0 && hasUndefined;

    return { subjects: subjectsList, shouldHideSubjectTabs: shouldHide };
  }, [chaptersData, classroomData]);

  // Set active group tab mặc định
  useEffect(() => {
    if (subjects.length > 0 && !activeGroupTab) {
      setActiveGroupTab(subjects[0].id);
    }
  }, [subjects, activeGroupTab, setActiveGroupTab]);

  // Check scroll position
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

  // Scroll functions
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

  // Tự động cuộn tab đang active vào vùng nhìn thấy
  useEffect(() => {
    if (!activeGroupTab || !scrollContainerRef.current) return;

    // Đợi một chút để DOM render xong các button
    const timer = setTimeout(() => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const activeBtn = container.querySelector(
        `[data-active="true"]`
      ) as HTMLElement;

      if (activeBtn) {
        const containerWidth = container.offsetWidth;
        const btnOffsetLeft = activeBtn.offsetLeft;
        const btnWidth = activeBtn.offsetWidth;

        // Tính toán vị trí cuộn để nút nằm ở giữa hoặc ít nhất là hiển thị đầy đủ
        container.scrollTo({
          left: btnOffsetLeft - containerWidth / 2 + btnWidth / 2,
          behavior: "smooth",
        });

        // Sau khi cuộn, cập nhật lại trạng thái các nút mũi tên
        setTimeout(checkScrollPosition, 400);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [activeGroupTab, subjects]);

  if (!subjects || subjects.length === 0) return null;

  // chỉ hiển thị tabs nhóm khi có nhiều hơn 1 nhóm
  if (subjects.length <= 1) return null;

  if (shouldHideSubjectTabs) return null;

  return (
    <div className="relative w-full pb-2">
      {/* Left scroll button */}
      {canScrollLeft && (
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 z-10 transition-all hover:opacity-80"
          aria-label="Scroll left"
          style={{ transform: "translateY(calc(-50% - 4px))" }}
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
        <div className="flex gap-2 min-w-max">
          {subjects.map((subject) => (
            <button
              key={subject.id}
              data-active={activeGroupTab === subject.id}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                activeGroupTab === subject.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
          className="absolute right-0 top-1/2 z-10 transition-all hover:opacity-80"
          aria-label="Scroll right"
          style={{ transform: "translateY(calc(-50% - 4px))" }}
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
  );
};
