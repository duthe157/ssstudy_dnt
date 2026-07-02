"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { bookService } from "@/services/bookService";
import { accountService } from "@/services/accountService";
import { labelService, LabelItem } from "@/services/labelService";
import {
  Book,
  TeacherItem,
  GradeItem,
  BookTypeItem,
  SubjectItem,
} from "@/types/book";
import BookLeftbar from "./BookLeftbar";
import BookGrid from "./BookGrid";
import BookPagination from "./BookPagination";
import SearchableSelect from "@/components/ui/searchable-select";
import Breadcrumb from "@/components/ui/breadcrumb";

// Constants for filter options
const GRADES: GradeItem[] = [
  { _id: "1", name: "Lớp 1" },
  { _id: "2", name: "Lớp 2" },
  { _id: "3", name: "Lớp 3" },
  { _id: "4", name: "Lớp 4" },
  { _id: "5", name: "Lớp 5" },
  { _id: "6", name: "Lớp 6" },
  { _id: "7", name: "Lớp 7" },
  { _id: "8", name: "Lớp 8" },
  { _id: "9", name: "Lớp 9" },
  { _id: "10", name: "Lớp 10" },
  { _id: "11", name: "Lớp 11" },
  { _id: "12", name: "Lớp 12" },
];

const BOOK_TYPES: BookTypeItem[] = [
  // { _id: "textbook", name: "Sách giáo khoa" },
  // { _id: "reference", name: "Sách tham khảo" },
  // { _id: "workbook", name: "Sách bài tập" },
  // { _id: "casio", name: "Sách CASIO" },
  // { _id: "exam", name: "Sách luyện thi" },
  { _id: "PROMOTION", name: "Đang khuyến mại" },
  { _id: "HOT", name: "Sách hot" },
];

const SUBJECTS: SubjectItem[] = [
  { _id: "math", name: "Toán" },
  { _id: "physics", name: "Vật lý" },
  { _id: "chemistry", name: "Hóa học" },
  { _id: "biology", name: "Sinh học" },
  { _id: "literature", name: "Ngữ văn" },
  { _id: "english", name: "Tiếng Anh" },
  { _id: "history", name: "Lịch sử" },
  { _id: "geography", name: "Địa lý" },
  { _id: "civic", name: "GDCD" },
];

const SCHOOL_YEAR_LABEL_ALIAS = "nam-hoc";

const formatSchoolYearLabel = (name: string) => {
  const label = name.toLowerCase().includes("năm học")
    ? name
    : `Năm học ${name}`;

  return label.replace(/(\d{4})-(\d{4})/g, "$1 - $2");
};

export default function BookPageClient() {
  // Sidebar state
  const [isLeftbarOpen, setIsLeftbarOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const toggleLeftbar = () => {
    setIsLeftbarOpen(!isLeftbarOpen);
  };

  const closeLeftbar = () => {
    setIsLeftbarOpen(false);
  };

  const toggleFilterDrawer = () => {
    setIsFilterDrawerOpen(!isFilterDrawerOpen);
  };

  const closeFilterDrawer = () => {
    setIsFilterDrawerOpen(false);
  };

  // Books data states
  const [books, setBooks] = useState<Book[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [paginationLoading, setPaginationLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const isInitialLoad = useRef(true);

  // Filter data states
  const [dataPriceList] = useState<{
    records: { _id: string; name: string; min?: number; max?: number }[];
  }>({
    records: [
      { _id: "", name: "Tất cả mức giá" },
      { _id: "0-0", name: "Miễn phí", min: 0, max: 0 },
      { _id: "0-100000", name: "Dưới 100.000đ", min: 0, max: 100000 },
      {
        _id: "100000-300000",
        name: "100.000đ - 300.000đ",
        min: 100000,
        max: 300000,
      },
      {
        _id: "300000-500000",
        name: "300.000đ - 500.000đ",
        min: 300000,
        max: 500000,
      },
      { _id: "500000-100000000", name: "Trên 500.000đ", min: 500000, max: undefined },
    ],
  });

  const [dataTeacherList, setDataTeacherList] = useState<{
    records: TeacherItem[];
  }>({
    records: [],
  });
  const [schoolYearLabels, setSchoolYearLabels] = useState<LabelItem[]>([]);

  const [dataGradeList] = useState<{ records: GradeItem[] }>({
    records: [{ _id: "", name: "Cấp học" }, ...GRADES],
  });

  const [dataBookTypeList] = useState<{ records: BookTypeItem[] }>({
    records: [{ _id: "", name: "Phân loại" }, ...BOOK_TYPES],
  });

  const [dataSubjectList] = useState<{ records: SubjectItem[] }>({
    records: [{ _id: "", name: "Môn học" }, ...SUBJECTS],
  });

  const searchParams = useSearchParams();
  const router = useRouter();

  const currentSearchParams = useMemo(() => {
    return searchParams ?? new URLSearchParams();
  }, [searchParams]);

  const keyword = currentSearchParams.get("keyword") || "";
  const level = currentSearchParams.get("level") || "";
  const priceRange = currentSearchParams.get("priceRange") || "";
  const teacherId = currentSearchParams.get("teacherId") || "";
  const type = currentSearchParams.get("type") || "";
  const subjectId = currentSearchParams.get("subject_id") || "";
  const groupId = currentSearchParams.get("group_id") || "";
  const labelId = currentSearchParams.get("label_id") || "";

  // Fetch books data
  const fetchBooks = async (isPagination = false) => {
    try {
      if (isPagination) {
        setPaginationLoading(true);
      } else {
        setLoading(true);
      }

      // Build request payload
      const payload = {
        keyword: keyword || null,
        level: level || null,
        subject_id: subjectId || null,
        group_id: groupId || null,
        label_id: labelId || null,
        teacher_id: teacherId || null,
        price: priceRange || null,
        type: type || null,
        limit: 6,
        page: currentPage,
      };

      const response = await bookService.getBookList(payload);

      if (response?.code === 200 && response?.data) {
        setBooks(response.data.records);
        setTotalRecords(response.data.totalRecord);
      }
    } catch (error) {
      console.error("Failed to fetch books:", error);
      setBooks([]);
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

  // Fetch books when filters change (reset to page 1)
  useEffect(() => {
    setCurrentPage(1);
    fetchBooks(false);
    isInitialLoad.current = false;
  }, [level, priceRange, teacherId, type, keyword, subjectId, groupId, labelId]);

  // Fetch books when page changes (pagination)
  useEffect(() => {
    // Chỉ gọi API khi không phải lần đầu load
    if (!isInitialLoad.current) {
      fetchBooks(true);
    } else {
      isInitialLoad.current = false;
    }
  }, [currentPage]);

  const handleFilterChange = (key: string, value: string | number) => {
    const newSearchParams = new URLSearchParams(currentSearchParams);

    if (value === "" || value === null) {
      newSearchParams.delete(key);
    } else {
      newSearchParams.set(key, value.toString());
    }

    // Reset to page 1 when filters change
    newSearchParams.delete("page");

    router.push(`/sach?${newSearchParams.toString()}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Không cập nhật URL, chỉ thay đổi state
  };

  const totalPages = Math.ceil(totalRecords / 12);

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
    <div className="container mx-auto px-4 py-4 xl:py-8 pt-0">
      <div className="relative grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Leftbar */}
        <div
          className={`
          xl:col-span-1 xl:block
          ${isLeftbarOpen ? "block" : "hidden"}
          xl:relative absolute inset-0 z-50 xl:z-auto
        `}
        >
          {/* Overlay cho mobile/tablet */}
          {isLeftbarOpen && (
            <div
              className="xl:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={closeLeftbar}
            />
          )}

          {/* Leftbar content */}
          <div
            className={`
            xl:relative xl:transform-none xl:transition-none
            fixed left-0 top-0 h-full w-80 max-w-[80vw] z-50
            transform transition-transform duration-300 ease-in-out
            ${
              isLeftbarOpen
                ? "translate-x-0"
                : "-translate-x-full xl:translate-x-0"
            }
          `}
          >
            <BookLeftbar onClose={closeLeftbar} />
          </div>
        </div>

        {/* Main content */}
        <div className="xl:col-span-3">
          <div
            className="rounded-lg p-4 xl:p-6"
            style={{ backgroundColor: "#F5F6FA" }}
          >
            {/* Breadcrumb */}
            <div className="mb-3 xl:mb-4 xl:flex xl:items-center xl:gap-4 [&>nav]:mb-2 xl:[&>nav]:mb-0 xl:[&>nav]:shrink-0">
              <Breadcrumb
                items={[{ label: "Trang chủ", href: "/" }, { label: "Sách" }]}
              />
              {renderSchoolYearButtons(
                "school-year-filter--desktop hidden xl:flex"
              )}
            </div>

            {renderSchoolYearButtons(
              "school-year-filter--mobile flex xl:hidden mb-3"
            )}

            {/* Nút Danh mục và Bộ lọc cho mobile/tablet - dưới breadcrumb */}
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
            {keyword && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800">
                  <span className="font-semibold">Kết quả tìm kiếm cho:</span>{" "}
                  &ldquo;{keyword}&rdquo;
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
                placeholder="Giá tiền"
                className="filter-select"
                nameKey="name"
              />
              <SearchableSelect
                options={dataBookTypeList.records}
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
                            options={dataBookTypeList.records}
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
                <span className="ml-3 text-gray-600">Đang tải sách...</span>
              </div>
            ) : (
              <>
                {/* Books Grid */}
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

                  <BookGrid
                    books={books}
                    loading={loading}
                    paginationLoading={paginationLoading}
                    teachers={dataTeacherList.records}
                  />
                </div>

                {/* No Results */}
                {/* {books.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">Không tìm thấy sách nào.</p>
                  </div>
                )} */}

                {/* Pagination */}
                {totalPages > 1 && (
                  <BookPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    disabled={paginationLoading}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
