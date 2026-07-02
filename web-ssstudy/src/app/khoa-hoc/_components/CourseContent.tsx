"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SmartImage } from "@/components/ui/smart-image";
import { accountService } from "@/services/accountService";
import { apiService } from "@/services/api";
import { labelService, LabelItem } from "@/services/labelService";
import { COURSE_TYPES, GRADES } from "@/utils/constants";
import SearchableSelect from "@/components/ui/searchable-select";
import ReactPaginate from "react-paginate";
import "../courses.css";
import Breadcrumb from "@/components/ui/breadcrumb";

const MOBILE_HEADER_HEIGHT = 50;
const SCHOOL_YEAR_LABEL_ALIAS = "nam-hoc";

const formatSchoolYearLabel = (name: string) => {
  const label = name.toLowerCase().includes("năm học")
    ? name
    : `Năm học ${name}`;

  return label.replace(/(\d{4})-(\d{4})/g, "$1 - $2");
};

// Định nghĩa kiểu dữ liệu cho khóa học
interface Course {
  _id: string;
  name: string;
  alias: string;
  teacher: string;
  teacher_id: string;
  teacher_alias: string;
  price: number;
  origin_price: number;
  image?: string;
  subject: {
    id: string;
    name: string;
  };
  group: {
    id: string;
    name: string;
  };
  level: string;
  num_student: number;
  is_featured: boolean;
  ordering?: number;
  created_at: string;
}

// Interface cho API response
interface ClassroomListResponse {
  data: {
    records: Course[];
    limit: number;
    totalRecord: number;
    perPage: number;
  };
  message: string;
  code: number;
}

// Định nghĩa interface cho dữ liệu filter
interface TeacherItem {
  _id: string;
  fullname: string;
}

interface GradeItem {
  _id: string;
  name: string;
}

interface CourseTypeItem {
  _id: string;
  name: string;
}

interface CourseContentProps {
  isFilterDrawerOpen?: boolean;
  onCloseFilterDrawer?: () => void;
  onToggleLeftbar?: () => void;
  onToggleFilterDrawer?: () => void;
}

/**
 * Component hiển thị nội dung chính của trang khóa học
 */
export default function CourseContent({
  isFilterDrawerOpen = false,
  onCloseFilterDrawer,
  onToggleLeftbar,
  onToggleFilterDrawer,
}: CourseContentProps) {
  // Courses data states
  const [courses, setCourses] = useState<Course[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [paginationLoading, setPaginationLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const isInitialLoad = useRef(true);
  const isNavigating = useRef(false);
  const lastClickedPage = useRef<number | null>(null);

  // Filter data states
  const [dataPriceList] = useState<{
    records: { _id: string; name: string; min?: number; max?: number }[];
  }>({
    records: [
      { _id: "", name: "Tất cả mức giá" },
      { _id: "0-0", name: "Miễn phí", min: 0, max: 0 },
      { _id: "0-499000", name: "Dưới 500.000đ", min: 0, max: 500000 },
      {
        _id: "500000-1000000",
        name: "500.000đ - 1.000.000đ",
        min: 500000,
        max: 1000000,
      },
      {
        _id: "1000000-2000000",
        name: "1.000.000đ - 2.000.000đ",
        min: 1000000,
        max: 2000000,
      },
      {
        _id: "2000000-100000000",
        name: "Trên 2.000.000đ",
        min: 2000000,
        max: undefined,
      },
    ],
  });
  const [dataTeacherList, setDataTeacherList] = useState<{
    records: TeacherItem[];
  }>({
    records: [],
  });
  const [dataGradeList] = useState<{ records: GradeItem[] }>({
    records: [{ _id: "", name: "Cấp học" }, ...GRADES],
  });
  const [dataCourseTypeList] = useState<{ records: CourseTypeItem[] }>({
    records: [{ _id: "", name: "Phân loại" }, ...COURSE_TYPES],
  });
  const [schoolYearLabels, setSchoolYearLabels] = useState<LabelItem[]>([]);

  const searchParams = useSearchParams();
  const router = useRouter();

  const currentSearchParams = useMemo(() => {
    return searchParams ?? new URLSearchParams();
  }, [searchParams]);

  const level = currentSearchParams.get("level") || "";
  const priceRange = currentSearchParams.get("priceRange") || "";
  const teacherId = currentSearchParams.get("teacherId") || "";
  const type = currentSearchParams.get("type") || "";
  const keywordFromUrl = currentSearchParams.get("keyword") || "";
  const subjectId = currentSearchParams.get("subject_id") || "";
  const groupId = currentSearchParams.get("group_id") || "";
  const labelId = currentSearchParams.get("label_id") || "";

  // Fetch courses data
  const fetchCourses = async (
    isPagination = false,
    page?: number
  ): Promise<void> => {
    try {
      if (isPagination) {
        setPaginationLoading(true);
      } else {
        setLoading(true);
      }

      // Sử dụng page được truyền vào hoặc currentPage từ state
      const pageToFetch = page ?? currentPage;

      // Build request payload
      const payload = {
        keyword: keywordFromUrl || null,
        level: level || null,
        subject_id: subjectId || null,
        group_id: groupId || null,
        label_id: labelId || null,
        teacher_id: teacherId || null,
        price: priceRange || null,
        type: type ? [type] : null,
        limit: 6,
        page: pageToFetch,
        is_online: true,
      };

      const response = await apiService.post<ClassroomListResponse>(
        "/classroom-list",
        payload
      );

      if (response?.code === 200 && response?.data) {
        const getOrderValue = (c: Course) => {
          const num = Number((c as any).ordering);
          return Number.isFinite(num) ? num : Number.MAX_SAFE_INTEGER;
        };

        const sortedRecords = [...response.data.records].sort((a, b) => {
          const featuredDiff = Number(b.is_featured) - Number(a.is_featured);
          if (featuredDiff !== 0) return featuredDiff;

          const orderDiff = getOrderValue(a) - getOrderValue(b);
          if (orderDiff !== 0) return orderDiff;

          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        });

        setCourses(sortedRecords);
        setTotalRecords(response.data.totalRecord);
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      setCourses([]);
      setTotalRecords(0);
    } finally {
      if (isPagination) {
        setPaginationLoading(false);
      } else {
        setLoading(false);
      }
    }
  };

  // Fetch teachers once
  useEffect(() => {
    const fetchFiltersData = async () => {
      try {
        // Gọi API lấy danh sách giảng viên
        const teacherResponse = await accountService.getTeacherList();
        if (teacherResponse.code === 200 && teacherResponse.data) {
          setDataTeacherList({
            records: [
              { _id: "", fullname: "Giảng viên" },
              ...teacherResponse.data.records,
            ],
          });
        }
      } catch (error) {
        console.error("Failed to fetch filters data:", error);
        // Fallback to empty arrays with default options
        setDataTeacherList({ records: [{ _id: "", fullname: "Giảng viên" }] });
      }

      try {
        const labelResponse = await labelService.getPublicLabels();
        if (labelResponse?.code === 200 && labelResponse?.data) {
          const labelRecords = labelResponse.data.records?.length
            ? labelResponse.data.records
            : labelResponse.data.record
            ? [labelResponse.data.record]
            : [];
          const schoolYearLabel = labelRecords.find(
            (label) => label.alias === SCHOOL_YEAR_LABEL_ALIAS
          );
          const children = schoolYearLabel?.children ?? [];

          setSchoolYearLabels(
            [...children].sort((a, b) => a.ordering - b.ordering)
          );
        }
      } catch (error) {
        console.error("Failed to fetch school year labels:", error);
        setSchoolYearLabels([]);
      }
    };

    fetchFiltersData();
  }, []);

  // Fetch courses when filters change (reset to page 1)
  useEffect(() => {
    isNavigating.current = false;
    lastClickedPage.current = null;
    setCurrentPage(1);
    fetchCourses(false);
    isInitialLoad.current = false;
  }, [level, priceRange, teacherId, type, keywordFromUrl, subjectId, groupId, labelId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch courses when page changes (pagination)
  useEffect(() => {
    // Chỉ gọi API khi không phải lần đầu load và có sự thay đổi trang thực sự
    if (
      !isInitialLoad.current &&
      lastClickedPage.current === currentPage &&
      lastClickedPage.current !== null
    ) {
      // isNavigating đã được set trong handlePageClick
      // Truyền page number cụ thể để đảm bảo đúng
      const pageToFetch = lastClickedPage.current;
      fetchCourses(true, pageToFetch).finally(() => {
        isNavigating.current = false;
        lastClickedPage.current = null;
      });
    } else if (isInitialLoad.current) {
      isInitialLoad.current = false;
    }
  }, [currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = (key: string, value: string | number) => {
    const newSearchParams = new URLSearchParams(currentSearchParams.toString());
    if (value) {
      newSearchParams.set(key, String(value));
    } else {
      newSearchParams.delete(key);
    }
    // Reset to page 1 when filter changes
    setCurrentPage(1);
    router.push(`/khoa-hoc?${newSearchParams.toString()}`);
  };

  const handlePageClick = (event: { selected: number }) => {
    // Ngăn multiple clicks khi đang loading
    if (paginationLoading || isNavigating.current) {
      return;
    }

    const newPage = event.selected + 1;

    // Chỉ update nếu trang thay đổi
    if (newPage !== currentPage) {
      // Set flags ngay lập tức để ngăn multiple clicks
      isNavigating.current = true;
      lastClickedPage.current = newPage;
      setCurrentPage(newPage);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const drawerOffsetStyles: React.CSSProperties = {
    top: MOBILE_HEADER_HEIGHT,
    height: `calc(100vh - ${MOBILE_HEADER_HEIGHT}px)`,
  };

  const renderSchoolYearButtons = (className = "") => {
    if (!schoolYearLabels.length) {
      return null;
    }

    const buttonBaseClass =
      "school-year-button whitespace-nowrap rounded-lg border px-3 py-2 text-sm font-medium transition-colors";
    const inactiveClass =
      "border-[#D5DCE8] bg-white text-[#667085] hover:border-blue-500 hover:text-blue-600";
    const activeClass = "border-blue-600 bg-blue-600 text-white";

    return (
      <div className={`school-year-filter ${className}`}>
        <button
          type="button"
          onClick={() => handleFilterChange("label_id", "")}
          className={`${buttonBaseClass} ${
            !labelId ? activeClass : inactiveClass
          }`}
          aria-pressed={!labelId}
        >
          Tất cả
        </button>
        {schoolYearLabels.map((item) => {
          const isActive = labelId === item._id;

          return (
            <button
              key={item._id}
              type="button"
              onClick={() => handleFilterChange("label_id", item._id)}
              className={`${buttonBaseClass} ${
                isActive ? activeClass : inactiveClass
              }`}
              aria-pressed={isActive}
            >
              {formatSchoolYearLabel(item.name)}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className="rounded-lg p-4 lg:p-6"
      style={{ backgroundColor: "#F5F6FA" }}
    >
      {/* Breadcrumb */}
      <div className="mb-3 xl:mb-4 xl:flex xl:items-center xl:gap-4 [&>nav]:mb-2 xl:[&>nav]:mb-0 xl:[&>nav]:shrink-0">
        <Breadcrumb
          items={[{ label: "Trang chủ", href: "/" }, { label: "Khóa học" }]}
        />
        {renderSchoolYearButtons(
          "school-year-filter--desktop hidden xl:flex"
        )}
      </div>

      {renderSchoolYearButtons("school-year-filter--mobile flex xl:hidden mb-3")}

      {/* Nút Danh mục và Bộ lọc cho mobile/tablet - dưới breadcrumb */}
      <div className="xl:hidden flex items-center justify-between mb-4 gap-3">
        {/* Nút Danh mục bên trái */}
        <button
          onClick={onToggleLeftbar}
          className="flex items-center justify-center px-4 py-2.5 bg-white border border-blue-500 rounded-lg hover:bg-blue-50 transition-colors text-blue-600 font-medium"
          aria-label="Mở danh mục"
        >
          Danh mục
        </button>

        {/* Nút Bộ lọc bên phải */}
        <button
          onClick={onToggleFilterDrawer}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          aria-label="Mở bộ lọc"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span>Bộ lọc</span>
        </button>
      </div>

      {/* Show search keyword if exists */}
      {keywordFromUrl && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800">
            <span className="font-semibold">Kết quả tìm kiếm cho:</span> &ldquo;
            {keywordFromUrl}&rdquo;
          </p>
        </div>
      )}

      {/* Filters - Desktop Only (ẩn hoàn toàn trên mobile và tablet, chỉ hiển thị từ 1280px+) */}
      <div className="hidden xl:block filters-row mb-6">
        <SearchableSelect
          options={dataTeacherList.records}
          value={teacherId}
          onChange={(value) => handleFilterChange("teacherId", value)}
          placeholder="Giảng viên"
          className="filter-select"
          nameKey="fullname"
        />
        <SearchableSelect
          options={dataGradeList.records}
          value={level}
          onChange={(value) => handleFilterChange("level", value)}
          placeholder="Cấp học"
          className="filter-select"
          nameKey="name"
        />
        <SearchableSelect
          options={dataPriceList.records}
          value={priceRange}
          onChange={(value) => handleFilterChange("priceRange", value)}
          placeholder="Mức giá"
          className="filter-select"
          nameKey="name"
        />
        <SearchableSelect
          options={dataCourseTypeList.records}
          value={type}
          onChange={(value) => handleFilterChange("type", value)}
          placeholder="Phân loại"
          className="filter-select"
          nameKey="name"
        />
      </div>

      {/* Filter Drawer - Mobile/Tablet Only */}
      {isFilterDrawerOpen && (
        <>
          {/* Overlay */}
          <div
            className="xl:hidden fixed left-0 right-0 bg-black bg-opacity-50 z-40"
            style={drawerOffsetStyles}
            onClick={onCloseFilterDrawer}
          />
          {/* Drawer */}
          <div
            className={`
              xl:hidden fixed right-0 w-[85vw] max-w-sm z-50
              bg-white shadow-xl transform transition-transform duration-300 ease-in-out
              ${isFilterDrawerOpen ? "translate-x-0" : "translate-x-full"}
            `}
            style={drawerOffsetStyles}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-800">Bộ lọc</h2>
                <button
                  onClick={onCloseFilterDrawer}
                  className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Đóng bộ lọc"
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

              {/* Filter Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giảng viên
                    </label>
                    <SearchableSelect
                      options={dataTeacherList.records}
                      value={teacherId}
                      onChange={(value) => {
                        handleFilterChange("teacherId", value);
                      }}
                      placeholder="Giảng viên"
                      className="filter-select"
                      nameKey="fullname"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cấp học
                    </label>
                    <SearchableSelect
                      options={dataGradeList.records}
                      value={level}
                      onChange={(value) => {
                        handleFilterChange("level", value);
                      }}
                      placeholder="Cấp học"
                      className="filter-select"
                      nameKey="name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tất cả mức giá
                    </label>
                    <SearchableSelect
                      options={dataPriceList.records}
                      value={priceRange}
                      onChange={(value) => {
                        handleFilterChange("priceRange", value);
                      }}
                      placeholder="Tất cả mức giá"
                      className="filter-select"
                      nameKey="name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phân loại
                    </label>
                    <SearchableSelect
                      options={dataCourseTypeList.records}
                      value={type}
                      onChange={(value) => {
                        handleFilterChange("type", value);
                      }}
                      placeholder="Phân loại"
                      className="filter-select"
                      nameKey="name"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Đang tải khóa học...</span>
        </div>
      ) : (
        <>
          {/* Courses Grid */}
          <div className="relative">
            {/* Pagination Loading Overlay */}
            {paginationLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-gray-600">Đang tải...</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {courses.map((course) => (
                <div
                  key={course._id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(`/khoa-hoc/${course._id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(`/khoa-hoc/${course._id}`);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Xem chi tiết khóa học ${course.name}`}
                >
                  <div className="relative w-full aspect-[279/210] bg-gray-100 overflow-hidden flex items-center justify-center">
                    <SmartImage
                      src={course.image || "/imgs/logo.png"}
                      alt={course.name}
                      width={279}
                      height={210}
                    />
                    {/* {course.is_featured && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      Nổi bật
                  </div>
                )} */}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                      {course.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {course.teacher}
                    </p>
                    {/* <p className="text-gray-600 text-sm mb-2">Môn: {course.subject.name}</p>
                  <p className="text-gray-600 text-sm mb-2">Cấp: {course.level}</p>
                  <p className="text-gray-600 text-sm mb-3">Học viên: {course.num_student}</p> */}
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-red-600">
                        {formatCurrency(course.price)}
                      </span>
                      {course.origin_price > course.price && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatCurrency(course.origin_price)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* No Results */}
          {courses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                Không tìm thấy khóa học nào.
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalRecords > 6 && (
            <div className="flex justify-center items-center">
              <ReactPaginate
                key={`pagination-${currentPage}-${totalRecords}`}
                previousLabel={"<"}
                nextLabel={">"}
                breakLabel={"..."}
                pageCount={Math.ceil(totalRecords / 6)}
                marginPagesDisplayed={2}
                pageRangeDisplayed={5}
                onPageChange={handlePageClick}
                forcePage={currentPage - 1}
                disableInitialCallback={true}
                containerClassName="flex justify-center items-center space-x-2"
                pageClassName={`px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors ${
                  paginationLoading
                    ? "opacity-50 cursor-wait pointer-events-none"
                    : "cursor-pointer"
                }`}
                activeClassName={"bg-blue-600 text-white border-blue-600"}
                previousClassName={`px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors ${
                  paginationLoading
                    ? "opacity-50 cursor-wait pointer-events-none"
                    : "cursor-pointer"
                }`}
                nextClassName={`px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors ${
                  paginationLoading
                    ? "opacity-50 cursor-wait pointer-events-none"
                    : "cursor-pointer"
                }`}
                disabledClassName={"opacity-50 cursor-not-allowed"}
                breakClassName="px-3 py-2"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
