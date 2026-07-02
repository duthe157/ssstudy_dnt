"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useHome } from "@/contexts/HomeContext";

interface BookLeftbarProps {
  onClose?: () => void;
  basePath?: string; // Base path for navigation (e.g., '/sach' or '/tim-kiem')
}

interface MegaMenuHomeItem {
  _id: string;
  name: string;
  list_subjects?: SubjectItem[];
}

interface SubjectItem {
  subject_name: string;
  subject_id: string;
  classroom_group_id?: string;
}

interface Course {
  name: string;
  subject_id: string;
  classroom_group_id: string;
}

interface CourseCategory {
  title: string;
  courses: Course[];
}

/**
 * Component hiển thị sidebar bên trái của trang sách
 */
export default function BookLeftbar({
  onClose,
  basePath = "/sach",
}: BookLeftbarProps) {
  // State để quản lý trạng thái đóng/mở của từng danh mục
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const { dataHomePage, getDataHomePage } = useHome();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Transform mega menu data to course categories
  const transformMegaMenuToCourseCategories = (
    menuData: MegaMenuHomeItem[] | null | undefined
  ): CourseCategory[] => {
    if (!Array.isArray(menuData)) {
      return [];
    }

    return menuData
      .map((group) => {
        if (
          !group.list_subjects ||
          !Array.isArray(group.list_subjects) ||
          group.list_subjects.length === 0
        ) {
          return null;
        }

        const courses: Course[] = group.list_subjects.map(
          (subject: SubjectItem) => ({
            name: subject.subject_name,
            subject_id: subject.subject_id,
            classroom_group_id: group._id,
          })
        );

        return {
          title: group.name,
          courses: courses,
        };
      })
      .filter((group): group is CourseCategory => group !== null);
  };

  const courseCategories: CourseCategory[] = useMemo(
    () => transformMegaMenuToCourseCategories(dataHomePage?.megaMenuHome),
    [dataHomePage?.megaMenuHome]
  );

  // Get current URL parameters
  const currentSubjectId = searchParams?.get("subject_id") || "";
  const currentGroupId = searchParams?.get("group_id") || "";

  // Find the active section based on current URL parameters
  const activeSection = useMemo(() => {
    if (!currentSubjectId || !currentGroupId) return null;

    return (
      courseCategories.find((category) =>
        category.courses.some(
          (course) =>
            course.subject_id === currentSubjectId &&
            course.classroom_group_id === currentGroupId
        )
      )?.title || null
    );
  }, [courseCategories, currentSubjectId, currentGroupId]);

  // Auto-expand the active section when URL changes
  useEffect(() => {
    if (activeSection) {
      setOpenSections({ [activeSection]: true });
    } else {
      setOpenSections({});
    }
  }, [activeSection]);

  // Fetch data on component mount
  React.useEffect(() => {
    if (!dataHomePage) {
      getDataHomePage();
    }
  }, [dataHomePage, getDataHomePage]);

  // Hàm toggle trạng thái đóng/mở - chỉ mở 1 section tại 1 thời điểm
  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => {
      const isCurrentlyOpen = prev[sectionId];
      if (isCurrentlyOpen) {
        // Nếu đang mở thì đóng (xóa khỏi state)
        const newState = { ...prev };
        delete newState[sectionId];
        return newState;
      } else {
        // Nếu đang đóng thì mở và đóng tất cả các section khác
        return { [sectionId]: true };
      }
    });
  };

  // Hàm xử lý click vào submenu item
  const handleSubmenuClick = (course: Course) => {
    // Chuyển đến trang với subject_id và group_id
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("subject_id", course.subject_id);
    params.set("group_id", course.classroom_group_id);

    // Determine the final URL based on basePath
    let finalUrl = `${basePath}?${params.toString()}`;

    // If we're on the search page and type is not set, set it to BOOK
    if (basePath === "/tim-kiem" && !params.get("type")) {
      params.set("type", "BOOK");
      finalUrl = `${basePath}?${params.toString()}`;
    }

    router.push(finalUrl);

    // Đóng sidebar nếu có onClose function
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md h-full flex flex-col">
      {/* Header với nút đóng cho mobile */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Lọc sách</h2>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Đóng menu lọc"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {courseCategories.length > 0 ? (
            courseCategories.map((category) => (
              <div key={category.title} className="border-b pb-2">
                <button
                  className={`w-full flex items-center justify-between py-2 px-3 rounded-md transition-colors ${
                    openSections[category.title]
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => toggleSection(category.title)}
                >
                  <span className="font-medium">{category.title}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 transition-transform ${
                      openSections[category.title] ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {openSections[category.title] && (
                  <div className="pl-4 mt-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
                    {category.courses.map((course) => {
                      const isActive =
                        course.subject_id === currentSubjectId &&
                        course.classroom_group_id === currentGroupId;
                      return (
                        <div
                          key={course.subject_id}
                          onClick={() => handleSubmenuClick(course)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleSubmenuClick(course);
                            }
                          }}
                          role="button"
                          tabIndex={0}
                          aria-label={`Tìm kiếm sách ${course.name}`}
                          className={`py-1.5 text-left text-sm cursor-pointer rounded px-2 transition-colors ${
                            isActive
                              ? "bg-blue-100 text-blue-700 font-medium border-l-2 border-blue-600"
                              : "text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {course.name}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="mt-2">Đang tải dữ liệu...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
