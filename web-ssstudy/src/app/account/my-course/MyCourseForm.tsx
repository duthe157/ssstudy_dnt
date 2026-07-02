"use client";

import { bookidService } from "@/services/bookidService";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import ReactPaginate from "react-paginate";
import "./my-course.css";
import Link from "next/link";
import Breadcrumbs from "@components/ui/breadcrumbs/Breadcrumbs";
import { SmartImage } from "@/components/ui/smart-image";
import { accountService } from "@services/accountService";
import { useSearchParams, useRouter } from "next/navigation";
import { COURSE_TYPES, GRADES } from "@utils/constants";
import SearchableSelect from "@components/ui/searchable-select";
import { RootContext } from "@/contexts/RootContext";
import { useContext } from "react";
import { CDN_LINK } from "@utils/constants";
import { orderService } from "@/services/orderService";
import { useRenewCourse } from "@/hooks/useRenewCourse";
import { Search } from "lucide-react";

interface CourseItem {
  _id: string;
  name: string;
  alias: string;
  code?: string;
  subject: { id: string; name: string };
  group: { id: string; name: string };
  teacher: string;
  teacher_id: string;
  teacher_alias: string;
  is_online: boolean;
  price: number;
  origin_price: number;
  num_student: number;
  level?: string;
  image?: string;
  banner?: string;
  description?: string;
  content?: string;
  video_intro?: string;
  status?: string;
}

// Định nghĩa interface cho dữ liệu filter
interface SubjectItem {
  _id: string;
  name: string;
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

interface StoredUser {
  id?: string;
  user_group?: string;
}

function getLoggedInTeacherId() {
  if (typeof window === "undefined") return "";

  try {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return "";

    const user = JSON.parse(storedUser) as StoredUser;
    return user.user_group === "TEACHER" && user.id ? user.id : "";
  } catch {
    return "";
  }
}

const MyCourseForm: React.FC = () => {
  const [dataClassrooms, setDataClassrooms] = useState<{
    records: CourseItem[];
    totalRecord?: number;
    limit?: number;
  }>({
    records: [],
    totalRecord: 0,
    limit: 6,
  });

  const [dataBooks, setDataBooks] = useState<{
    records: any[];
    totalRecord: number;
    limit: number;
  }>({
    records: [],
    totalRecord: 0,
    limit: 6,
  });

  const [loadingBooks, setLoadingBooks] = useState<boolean>(false);

  const [dataSubjectList, setDataSubjectList] = useState<{
    records: SubjectItem[];
  }>({
    records: [],
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

  const router = useRouter();
  const searchParams = useSearchParams(); // Lấy searchParams gốc

  const currentSearchParams = useMemo(() => {
    // Sử dụng useMemo để tránh thay đổi trên mỗi render
    return searchParams ?? new URLSearchParams();
  }, [searchParams]);

  // Debounce ref
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const name = currentSearchParams.get("name") || "";
  const level = currentSearchParams.get("level") || "";
  const subjectId = currentSearchParams.get("subjectId") || "";
  const teacherId = currentSearchParams.get("teacherId") || "";
  const type = currentSearchParams.get("type") || "";
  const page = parseInt(currentSearchParams.get("page") || "1", 10);
  const bookPage = parseInt(currentSearchParams.get("bookPage") || "1", 10);
  const activeTab = currentSearchParams.get("tab") || "foundation";
  
  const [searchInput, setSearchInput] = useState<string>(name);
  const [limit] = useState<number>(6);
  const [loading, setLoading] = useState<boolean>(false);
  const rootContext = useContext(RootContext);
  const { handleRenew: renewCourse } = useRenewCourse();

  const handleStartLearning = (item: any, isSearchId = false) => {
    const courseId = item?._id || item?.id;
    if (courseId) {
      router.push(`/lesson/${courseId}${isSearchId ? "?isSearchId=true" : ""}`);
    }
  };

  const handleRenew = async (course: any) => {
    await renewCourse({
      item_id:
        course.userBook?.bookIdCourse?.id ||
        course.bookIdCourse?.id ||
        course._id ||
        "",
      name:
        course.userBook?.bookIdCourse?.name ||
        course.bookIdCourse?.name ||
        course.name ||
        "",
      price: Number(course.price) || 0,
      image: course.image,
    });
  };

  const handleBuyNow = async (course: any) => {
    let bookAlias =
      course?.userBookDetail?.bookIdCourse?.id ||
      course?.bookIdCourse?.id ||
      course?.userBookDetail?.bookIdCourse?._id ||
      course?.bookIdCourse?._id ||
      course?._from_book_id ||
      course?.userBookDetail?.book_id ||
      course?.book_id ||
      course?.bookId ||
      course?.id;

    // Nếu không tìm thấy ID trong danh sách, gọi API chi tiết để lấy chính xác
    if (!bookAlias || bookAlias === "course") {
      try {
        const courseId = course?._id || course?.id;
        if (courseId) {
          const detailResp = await bookidService.getBookCourseDetail(courseId);
          const detailData =
            detailResp?.data?.data || detailResp?.data || detailResp;
          bookAlias =
            detailData?.userBookDetail?.bookIdCourse?.id ||
            detailData?.userBookDetail?.bookIdCourse?._id ||
            detailData?.course?._from_book_id ||
            detailData?.book_id ||
            detailData?.bookId;
        }
      } catch (err) {
        console.error(
          "[handleBuyNow] Lỗi khi lấy thông tin chi tiết sách:",
          err,
        );
      }
    }

    const finalAlias = bookAlias || "course";
    router.push(`/sach-id/${finalAlias}`);
  };
  const [loggedInTeacherId, setLoggedInTeacherId] = useState("");
  const [hasCheckedLoggedInUser, setHasCheckedLoggedInUser] = useState(false);
  const effectiveTeacherId = loggedInTeacherId || teacherId;

  useEffect(() => {
    setLoggedInTeacherId(getLoggedInTeacherId());
    setHasCheckedLoggedInUser(true);
  }, []);

  useEffect(() => {
    setSearchInput(name);
  }, [name]);

  // fetch subjects & teachers once
  useEffect(() => {
    const fetchFiltersData = async () => {
      try {
        // Gọi API lấy danh sách môn học
        const subjectResponse = await accountService.getSubjectList();
        if (subjectResponse.code === 200 && subjectResponse.data) {
          setDataSubjectList({
            records: [
              { _id: "", name: "Môn học" },
              ...subjectResponse.data.records,
            ],
          });
        }

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
        setDataSubjectList({ records: [{ _id: "", name: "Môn học" }] });
        setDataTeacherList({ records: [{ _id: "", fullname: "Giảng viên" }] });
      }
    };

    fetchFiltersData();
  }, []);

  // fetch classrooms whenever filters or page change
  useEffect(() => {
    if (!hasCheckedLoggedInUser) return;

    const fetchClassrooms = async () => {
      setLoading(true);
      try {
        const payload = {
          name: name || null,
          level: level ? [level] : null, // Thay đổi cách truyền level
          subject_id: subjectId || null,
          teacher_id: effectiveTeacherId || null,
          type: type ? [type] : null, // Thay đổi cách truyền type, mặc định là null
          limit: limit,
          page: page,
        };
        const response = await accountService.getListClassroom(payload);
        if (response.code === 200 && response.data) {
          setDataClassrooms({
            records: response.data.records,
            totalRecord: response.data.totalRecord,
            limit: response.data.perPage || limit,
          });
        } else {
          setDataClassrooms({ records: [], totalRecord: 0, limit: limit });
        }
      } catch (error) {
        console.error("Failed to fetch classrooms:", error);
        setDataClassrooms({ records: [], totalRecord: 0, limit: limit });
      } finally {
        setLoading(false);
      }
    };

    fetchClassrooms();
  }, [
    name,
    level,
    subjectId,
    effectiveTeacherId,
    type,
    page,
    limit,
    currentSearchParams,
    hasCheckedLoggedInUser,
  ]);

  const fetchBooks = useCallback(async () => {
    setLoadingBooks(true);
    try {
      const payload = {
        limit: limit,
        page: bookPage,
      };
      const response = await accountService.getListOwnedBookIdCourse(payload);
      if (response.code === 200 && response.data) {
        setDataBooks({
          records: response.data.records,
          totalRecord: response.data.totalRecord,
          limit: response.data.perPage || limit,
        });
      } else {
        setDataBooks({ records: [], totalRecord: 0, limit: limit });
      }
    } catch (error) {
      console.error("Failed to fetch books:", error);
      setDataBooks({ records: [], totalRecord: 0, limit: limit });
    } finally {
      setLoadingBooks(false);
    }
  }, [bookPage, limit]);

  // fetch books whenever bookPage changes
  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // LUỒNG TỰ ĐỘNG CẬP NHẬT TRẠNG THÁI THANH TOÁN KHI QUAY LẠI TỪ PAYOS
  useEffect(() => {
    const syncPaymentStatus = async () => {
      const payosId = currentSearchParams.get("id");
      const statusParam = currentSearchParams.get("status");

      // Nếu có ID từ PayOS và trạng thái là thành công (hoặc ít nhất là có ID quay về)
      if (payosId && statusParam === "PAID") {
        try {
          const orderId =
            typeof window !== "undefined"
              ? localStorage.getItem("payos_order_id") || ""
              : "";
          if (!orderId) return;

          // 1. Gọi API lấy chi tiết từ PayOS
          await orderService.payosDetailOrder({ id: payosId, orderId });
          // 2. Gọi API yêu cầu Backend cập nhật trạng thái đơn hàng và gia hạn khóa học
          await orderService.payosUpdateOrder({ id: payosId, orderId });

          // 3. Sau khi đồng bộ xong, gọi lại fetchBooks để lấy dữ liệu mới nhất (nút gia hạn sẽ đổi sang vào học)
          await fetchBooks();

          // 4. Xóa mã ID để không bị gọi lặp lại khi refresh trang
          const newParams = new URLSearchParams(currentSearchParams.toString());
          newParams.delete("id");
          newParams.delete("status");
          newParams.delete("orderCode");
          newParams.delete("cancel");
          router.replace(`?${newParams.toString()}`, { scroll: false });
        } catch (err) {
          console.error("Lỗi khi đồng bộ trạng thái thanh toán:", err);
        }
      }
    };

    syncPaymentStatus();
  }, [currentSearchParams, fetchBooks, router]);

  const handleFilterChange = (key: string, value: string | number) => {
    const newSearchParams = new URLSearchParams(currentSearchParams.toString()); // Sử dụng currentSearchParams
    if (value) {
      newSearchParams.set(key, String(value));
    } else {
      newSearchParams.delete(key);
    }
    newSearchParams.set("page", "1"); // Reset về trang 1 khi thay đổi filter
    router.push(`?${newSearchParams.toString()}`);
  };

  const handleChangeSearch = (value: string) => {
    setSearchInput(value); 

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const newSearchParams = new URLSearchParams(currentSearchParams.toString());
      if (value) {
        newSearchParams.set("name", value);
      } else {
        newSearchParams.delete("name");
      }
      newSearchParams.set("page", "1");
      router.push(`?${newSearchParams.toString()}`);
    }, 400);
  };

  const handlePageClick = (event: { selected: number }) => {
    const newSearchParams = new URLSearchParams(currentSearchParams.toString()); // Sử dụng currentSearchParams
    newSearchParams.set("page", String(event.selected + 1));
    router.push(`?${newSearchParams.toString()}`);
  };

  const handleBookPageClick = (event: { selected: number }) => {
    const newSearchParams = new URLSearchParams(currentSearchParams.toString());
    newSearchParams.set("bookPage", String(event.selected + 1));
    router.push(`?${newSearchParams.toString()}`, { scroll: false });
  };

  const handleTabChange = (tab: string) => {
    const newSearchParams = new URLSearchParams(currentSearchParams.toString());
    newSearchParams.set("tab", tab);
    // Reset pages when switching tabs to avoid confusion
    if (tab === "foundation") {
      newSearchParams.set("page", "1");
    } else {
      newSearchParams.set("bookPage", "1");
    }
    router.push(`?${newSearchParams.toString()}`, { scroll: false });
  };

  return (
    <div className="form-area">
      {/* Breadcrumb */}
      <div className="breadcrumb-wrapper">
        <Breadcrumbs />
      </div>

      <div className="form-block">
        {/* Tabs */}
        <div className="course-tabs">
          <button
            className={`tab-item ${activeTab === "foundation" ? "active" : ""}`}
            onClick={() => handleTabChange("foundation")}
          >
            Khóa Học Nền Tảng
          </button>
          <button
            className={`tab-item ${activeTab === "bookid" ? "active" : ""}`}
            onClick={() => handleTabChange("bookid")}
          >
            Khóa Học Sách ID
          </button>
        </div>

        {/* Classroom Grid */}
        {activeTab === "foundation" && (
          <>
            {/* Filters */}
            <div className="filters-row">
              <div className="flex items-center px-3 py-2 border border-gray-200 rounded-lg gap-2">
                  <Search size={16} className="text-gray-500" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Khóa học"
                    value={searchInput}
                    onChange={(e) => handleChangeSearch(e.target.value)}
                    className="bg-transparent border-none outline-none text-gray-500 text-sm leading-normal flex-1"
                  />
              </div>
              <SearchableSelect
                options={dataGradeList.records}
                value={level}
                onChange={(value) => handleFilterChange("level", value)}
                placeholder="Cấp học"
                className="filter-select"
                nameKey="name"
              />

              <SearchableSelect
                options={dataSubjectList.records}
                value={subjectId}
                onChange={(value) => handleFilterChange("subjectId", value)}
                placeholder="Môn học"
                className="filter-select"
                nameKey="name"
              />

              {!loggedInTeacherId && (<SearchableSelect
                options={dataTeacherList.records}
                value={teacherId}
                onChange={(value) => handleFilterChange("teacherId", value)}
                placeholder="Giảng viên"
                className="filter-select"
                nameKey="fullname"
              />)}
            </div>

            <h2 className="section-title">Khóa Học Nền Tảng</h2>
            <div className="course-grid">
          {loading ? (
            <div className="loading">Đang tải...</div>
          ) : dataClassrooms?.records?.length ? (
            dataClassrooms.records.map((item: CourseItem, idx: number) => (
              <article className="course-card" key={item._id || idx}>
                {/* Course Image */}
                <div className="relative w-full aspect-[279/210] bg-gray-100 overflow-hidden flex items-center justify-center">
                  {item?.image ? (
                    <SmartImage
                      src={item.image}
                      alt={item?.name || "course"}
                      width={279}
                      height={210}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg
                        className="w-16 h-16"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Course Content */}
                <div className="course-content">
                  {/* Category Name */}
                  <div className="course-category">
                    {item?.group?.name || item?.subject?.name || ""}
                  </div>

                  {/* Course Title */}
                  <h3 className="course-title">
                    <Link href={`/khoa-hoc/${item?._id}`}>
                      {item?.name || ""}
                    </Link>
                  </h3>

                  {/* Teacher Name */}
                  <div className="teacher-name">
                    {item?.teacher_alias && (
                      <Link href={`/giao-vien/${item?.teacher_alias}`}>
                        {item?.teacher || ""}
                      </Link>
                    )}
                    {!item?.teacher_alias && (item?.teacher || "")}
                  </div>

                  {/* Start Button */}
                  <Link href={`/khoa-hoc/${item?._id}`}>
                    <button className="btn-start-course">
                      Bắt đầu bài học
                    </button>
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <div className="no-data">Không có khóa học</div>
          )}
        </div>

        {dataClassrooms.totalRecord && dataClassrooms.totalRecord > limit ? (
          <ReactPaginate
            previousLabel={"<"}
            nextLabel={">"}
            breakLabel={"..."}
            pageCount={Math.ceil(dataClassrooms.totalRecord / limit)}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={handlePageClick}
            containerClassName={"pagination"}
            activeClassName={"active"}
            forcePage={page - 1}
          />
            ) : null}
          </>
        )}

        {/* Book ID Grid */}
        {activeTab === "bookid" && (() => {
          // Đếm số khóa học còn hiển thị (không bị ẩn do hết hạn)
          const visibleBookCount = dataBooks?.records?.filter(
            (item: any) => item?.status !== "EXPIRED"
          ).length || 0;

          return (
          <>
            <h2 className="section-title">Khóa Học Sách ID</h2>
            <div className="course-grid">
          {loadingBooks ? (
            <div className="loading">Đang tải...</div>
          ) : dataBooks?.records?.length ? (
            dataBooks.records.map((item: any, idx: number) => {
              if (item?.status === "EXPIRED") return null;

              const bookAlias =
                item?.userBookDetail?.bookIdCourse?.id ||
                item?.bookIdCourse?.id ||
                item?.userBookDetail?.bookIdCourse?._id ||
                item?.bookIdCourse?._id ||
                item?._from_book_id ||
                item?.userBookDetail?.book_id ||
                item?.book_id ||
                item?.bookId ||
                item?.id ||
                "course";
              const courseId = item?._id || item?.id;
              const courseUrl = `/sach-id/${bookAlias}/${courseId}`;

              return (
                <article className="course-card" key={item._id || idx}>
                  {/* Course Image */}
                  <Link
                    href={courseUrl}
                    className="relative w-full aspect-[279/210] bg-gray-100 overflow-hidden flex items-center justify-center hover:opacity-90 transition-opacity"
                  >
                    {item?.image ? (
                      <SmartImage
                        src={item.image}
                        alt={item?.name || "course"}
                        width={279}
                        height={210}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg
                          className="w-16 h-16"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    )}
                  </Link>

                  {/* Course Content */}
                  <div className="course-content">
                    {/* Category Name */}
                    <div className="course-category">
                      {item?.subject?.name || "Sách ID"}
                    </div>

                    {/* Course Title */}
                    <h3 className="course-title">
                      <Link href={courseUrl}>{item?.name || ""}</Link>
                    </h3>

                    {/* Teacher Name (if available) */}
                    <div className="teacher-name">{item?.teacher || ""}</div>

                    {/* Button Action */}
                    <div className="w-full">
                      {item?.status === "EXTENDED" ? (
                        <button
                          className="btn-extended-course"
                          onClick={() => handleRenew(item)}
                        >
                          Gia hạn
                        </button>
                      ) : item?.status === "EXPIRED" ? (
                        <button
                          className="btn-expired-course"
                          onClick={() => handleBuyNow(item)}
                        >
                          Bắt đầu học lại
                        </button>
                      ) : (
                        <button
                          className="btn-start-course"
                          onClick={() => handleStartLearning(item, true)}
                        >
                          Bắt đầu bài học
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="no-data">Không có khóa học sách ID</div>
          )}
        </div>

        {/* Chỉ hiển thị phân trang khi có ít nhất 1 khóa học còn hiển thị (chưa hết hạn) */}
        {visibleBookCount > 0 && dataBooks.totalRecord && dataBooks.totalRecord > limit ? (
          <ReactPaginate
            previousLabel={"<"}
            nextLabel={">"}
            breakLabel={"..."}
            pageCount={Math.ceil(dataBooks.totalRecord / limit)}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={handleBookPageClick}
            containerClassName={"pagination"}
            activeClassName={"active"}
            forcePage={bookPage - 1}
          />
        ) : null}
          </>
          );
        })()}
      </div>
    </div>
  );
};

export default MyCourseForm;
