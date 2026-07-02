"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SmartImage } from "@/components/ui/smart-image";
import { accountService } from "@/services/accountService";
import { apiService } from "@/services/api";
import { COURSE_TYPES, GRADES } from "@/utils/constants";
import SearchableSelect from "@/components/ui/searchable-select";
import ReactPaginate from "react-paginate";
import "../../khoa-hoc/courses.css";

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
  created_at: string;
}

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

interface CourseSearchContentProps {
  isLeftbarOpen: boolean;
  toggleLeftbar: () => void;
  closeLeftbar: () => void;
}

export default function CourseSearchContent({
  isLeftbarOpen,
  toggleLeftbar,
  closeLeftbar,
}: CourseSearchContentProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [paginationLoading, setPaginationLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const isInitialLoad = useRef(true);

  const toggleFilterDrawer = () => {
    setIsFilterDrawerOpen(!isFilterDrawerOpen);
  };

  const closeFilterDrawer = () => {
    setIsFilterDrawerOpen(false);
  };

  const [dataPriceList] = useState<{
    records: { _id: string; name: string; min?: number; max?: number }[];
  }>({
    records: [
      { _id: "", name: "Tất cả mức giá" },
      { _id: "free", name: "Miễn phí", min: 0, max: 0 },
      { _id: "under-500k", name: "Dưới 500.000đ", min: 0, max: 500000 },
      {
        _id: "500k-1m",
        name: "500.000đ - 1.000.000đ",
        min: 500000,
        max: 1000000,
      },
      {
        _id: "1m-2m",
        name: "1.000.000đ - 2.000.000đ",
        min: 1000000,
        max: 2000000,
      },
      { _id: "over-2m", name: "Trên 2.000.000đ", min: 2000000, max: undefined },
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

  const fetchCourses = async (isPagination = false) => {
    try {
      if (isPagination) {
        setPaginationLoading(true);
      } else {
        setLoading(true);
      }

      const payload = {
        keyword: keywordFromUrl || null,
        level: level || null,
        subject_id: subjectId || null,
        group_id: groupId || null,
        teacher_id: teacherId || null,
        price: priceRange || null,
        type: type || null,
        limit: 6,
        page: currentPage,
        is_online: true,
      };

      const response = await apiService.post<ClassroomListResponse>(
        "/classroom-list",
        payload
      );

      if (response?.code === 200 && response?.data) {
        setCourses(response.data.records);
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

  useEffect(() => {
    const fetchFiltersData = async () => {
      try {
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
        setDataTeacherList({ records: [{ _id: "", fullname: "Giảng viên" }] });
      }
    };

    fetchFiltersData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    fetchCourses(false);
    isInitialLoad.current = false;
  }, [level, priceRange, teacherId, type, keywordFromUrl, subjectId, groupId]);

  useEffect(() => {
    if (!isInitialLoad.current) {
      fetchCourses(true);
    } else {
      isInitialLoad.current = false;
    }
  }, [currentPage]);

  const handleFilterChange = (key: string, value: string | number) => {
    const newSearchParams = new URLSearchParams(currentSearchParams.toString());
    if (value) {
      newSearchParams.set(key, String(value));
    } else {
      newSearchParams.delete(key);
    }
    setCurrentPage(1);
    router.push(`/tim-kiem?${newSearchParams.toString()}`);
  };

  const handlePageClick = (event: { selected: number }) => {
    const newPage = event.selected + 1;
    setCurrentPage(newPage);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="relative w-full">
      {/* Main content */}
      <div className="relative z-10 w-full">
        <div
          className="w-full p-4 xl:p-8"
          style={{ backgroundColor: "#F5F6FA" }}
        >
          {/* Nút Danh mục và Bộ lọc cho mobile/tablet */}
          <div className="xl:hidden flex items-center justify-between mb-4 gap-3">
            {/* Nút Danh mục bên trái */}
            <button
              onClick={toggleLeftbar}
              className="flex items-center justify-center px-4 py-2.5 bg-white border border-blue-500 rounded-lg hover:bg-blue-50 transition-colors text-blue-600 font-medium"
              aria-label="Mở danh mục"
            >
              Danh mục
            </button>

            {/* Nút Bộ lọc bên phải */}
            <button
              onClick={toggleFilterDrawer}
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
                <span className="font-semibold">Kết quả tìm kiếm cho:</span>{" "}
                &ldquo;{keywordFromUrl}&rdquo;
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
              placeholder="Lớp"
              className="filter-select"
              nameKey="name"
            />
            <SearchableSelect
              options={dataPriceList.records}
              value={priceRange}
              onChange={(value) => handleFilterChange("priceRange", value)}
              placeholder="Giá tiền"
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
                className="xl:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={closeFilterDrawer}
              />
              {/* Drawer */}
              <div
                className={`
                  xl:hidden fixed right-0 top-0 h-full w-[85vw] max-w-sm z-50
                  bg-white shadow-xl transform transition-transform duration-300 ease-in-out
                  ${isFilterDrawerOpen ? "translate-x-0" : "translate-x-full"}
                `}
              >
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-800">
                      Bộ lọc
                    </h2>
                    <button
                      onClick={closeFilterDrawer}
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
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                          {course.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">
                          {course.teacher}
                        </p>
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

              {courses.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    Không tìm thấy khóa học nào.
                  </p>
                </div>
              )}

              {totalRecords > 6 && (
                <ReactPaginate
                  previousLabel={"<"}
                  nextLabel={">"}
                  breakLabel={"..."}
                  pageCount={Math.ceil(totalRecords / 6)}
                  marginPagesDisplayed={2}
                  pageRangeDisplayed={5}
                  onPageChange={handlePageClick}
                  forcePage={currentPage - 1}
                  containerClassName={`flex justify-center items-center space-x-2 ${
                    paginationLoading ? "opacity-50 pointer-events-none" : ""
                  }`}
                  pageClassName={
                    "px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer"
                  }
                  activeClassName={"bg-blue-600 text-white border-blue-600"}
                  previousClassName={
                    "px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer"
                  }
                  nextClassName={
                    "px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer"
                  }
                  disabledClassName={"opacity-50 cursor-not-allowed"}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
