"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTeacherContext } from "../giao-vien/TeacherContext";
import { apiService } from "../../services/api";

interface Teacher {
  _id: string;
  fullname: string;
  avatar: string;
  user_group: string;
  alias: string;
  subject: string;
  is_featured: string | boolean;
  is_show_profile: string | boolean;
  created_at: string;
  updated_at: string;
}

interface Subject {
  _id: string;
  name: string;
}

export default function TeacherList() {
  const { filters } = useTeacherContext();
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const pageSize = 6;

  useEffect(() => {
    const container = document.querySelector(
      ".min-h-screen.bg-white"
    ) as HTMLElement;
    if (container) {
      container.style.backgroundColor = "hsla(228, 33%, 97%, 1)";
    }
  }, []);
  // Lọc danh sách trước khi paginate
  const filteredTeachers = useMemo(() => {
    if (filters.subjects.length === 0) return allTeachers;

    return allTeachers.filter((teacher) => {
      return filters.teacher_ids.includes(teacher._id);
    });
  }, [allTeachers, filters]);

  // Memoize totalPages để tránh tính toán lại không cần thiết
  const totalPages = useMemo(() => {
    return filteredTeachers.length > 0
      ? Math.ceil(filteredTeachers.length / pageSize)
      : Math.ceil(allTeachers.length / pageSize);
  }, [allTeachers.length, pageSize, filteredTeachers.length]);

  // Memoize hàm fetchTeachers để tránh tạo lại function
  const fetchTeachers = useCallback(async () => {
    try {
      const res = (await apiService.post("teacher-list", {})) as any;
      const records: Teacher[] = res?.data?.records || [];

      // Lọc chỉ lấy giáo viên có is_show_profile === true
      const visibleTeachers = records.filter((teacher) => {
        return teacher.is_show_profile === "true" || teacher.is_show_profile === true;
      });

      // Sort by featured status (true first) and then by creation date (newest first)
      const sortedRecords = visibleTeachers.sort((a, b) => {
        // First, sort by featured status
        // Convert string "true"/"false" to boolean for comparison
        const aFeatured = a.is_featured === "true" || a.is_featured === true;
        const bFeatured = b.is_featured === "true" || b.is_featured === true;

        if (aFeatured !== bFeatured) {
          return bFeatured ? 1 : -1; // Featured teachers come first
        }

        // If featured status is the same, sort by updated date (newest first)
        const aDate = new Date(a.updated_at).getTime();
        const bDate = new Date(b.updated_at).getTime();
        return bDate - aDate;
      });

      setAllTeachers(sortedRecords);
    } catch (err) {
      console.error("Lỗi khi tải danh sách giáo viên:", err);
    }
  }, []);

  const fetchSubjects = useCallback(async () => {
    try {
      const res = (await apiService.post("subject/list", {})) as any;
      const records: Subject[] = res?.data?.records || [];
      setSubjects(records);
    } catch (err) {
      console.error("Lỗi khi tải danh sách môn học:", err);
    }
  }, []);

  useEffect(() => {
    fetchTeachers();
    fetchSubjects();
  }, [fetchTeachers, fetchSubjects]);

  // Memoize paginatedTeachers
  const paginatedTeachers = useMemo(() => {
    return filteredTeachers.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  }, [filteredTeachers, currentPage, pageSize]);

  // Memoize hàm generatePagination để tránh tạo lại
  const generatePagination = useCallback(
    (totalPages: number, currentPage: number): (number | string)[] => {
      const pages: (number | string)[] = [];

      if (totalPages <= 7) {
        // Nếu ít hơn 7 trang thì hiển thị tất cả
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let k = 1; k <= 3; k++) {
            pages.push(k);
          }
          pages.push("...");
          pages.push(totalPages - 1);
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          // Gần cuối: 1 2 ... 6 7 8
          pages.push(1);
          pages.push(2);
          pages.push("...");
          for (let i = totalPages - 2; i <= totalPages; i++) {
            pages.push(i);
          }
        } else {
          // Ở giữa: 1 ... 4 5 6 ... 8
          pages.push(1);
          pages.push("...");
          // Fix logic ở đây - chỉ hiển thị currentPage-1, currentPage, currentPage+1
          for (let j = currentPage - 1; j <= currentPage + 1; j++) {
            pages.push(j);
          }
          pages.push("...");
          pages.push(totalPages);
        }
      }

      return pages;
    },
    []
  );

  // Memoize pagination array
  const paginationItems = useMemo(() => {
    const items = generatePagination(totalPages, currentPage);

    return items;
  }, [totalPages, currentPage, generatePagination]);

  // Memoize navigation handlers
  const handlePrevious = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const handlePageClick = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const getSubjectName = useCallback(
    (subjectId: string) => {
      const subject = subjects.find((s) => s._id === subjectId);
      return subject ? subject.name : "Chưa có môn học";
    },
    [subjects]
  );

  return (
    <div style={{ flex: 1 }}>
      <h2
        className="hidden md:block"
        style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}
      >
        Đội ngũ giáo viên
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: 24,
        }}
      >
        {paginatedTeachers.map((teacher) => (
          <div
            key={teacher._id}
            style={{
              borderRadius: 8,
              backgroundColor: "white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              overflow: "hidden",
              textAlign: "center",
              paddingBottom: 16,
              width: "279px",
              height: "445px",
            }}
          >
            <Link href={`/giao-vien/${teacher?.alias}`}>
              <div
                style={{
                  width: "100%",
                  height: 320,
                  position: "relative",
                  backgroundColor: "#f5f5f5",
                }}
              >
                <Image
                  src={`https://cdn.luyenthitiendat.vn/${teacher.avatar}`}
                  alt={teacher.fullname}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{
                    width: "100%",
                    height: "100%",
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    objectPosition: "center center",
                  }}
                />
              </div>
            </Link>

            <div style={{ padding: "12px 10px 0", textAlign: "left" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <h3
                  style={{
                    margin: "12px 0 4px",
                    fontWeight: 600,
                    fontSize: 16,
                  }}
                >
                  {teacher.fullname}
                </h3>
                <Image
                  src="/icon/teacher-badge.svg"
                  alt="teacher-badge"
                  width={18}
                  height={18}
                  style={{ height: 18, marginTop: 7 }}
                />
              </div>
              <p style={{ margin: 0, color: "#6C7086" }}>
                {teacher.subject
                  ? `Giáo viên ${getSubjectName(teacher.subject[0])}`
                  : ""}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {paginatedTeachers.length > 0 ? (
        <div
          style={{
            marginTop: 32,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
          }}
        >
          {/* Previous */}
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            style={{
              background: "none",
              border: "none",
              cursor: currentPage === 1 ? "default" : "pointer",
              color: "#6C7086",
              fontSize: 18,
            }}
          >
            <Image
              src="/icon/chevron-left.svg"
              alt="arrow-left"
              width={18}
              height={18}
            />
          </button>

          {paginationItems.map((item, index) => {
            return item === "..." ? (
              <span
                key={`ellipsis-${index}`}
                style={{ padding: "0 8px", color: "#6C7086" }}
              >
                ...
              </span>
            ) : (
              <button
                key={`page-${item}`}
                onClick={() => handlePageClick(Number(item))}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 6,
                  border: "none",
                  backgroundColor:
                    currentPage === item ? "#235CD0" : "transparent",
                  color: currentPage === item ? "white" : "#6C7086",
                  cursor: "pointer",
                }}
              >
                {item}
              </button>
            );
          })}

          {/* Next */}
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            style={{
              background: "none",
              border: "none",
              cursor: currentPage === totalPages ? "default" : "pointer",
              color: "#6C7086",
              fontSize: 18,
            }}
          >
            <Image
              src="/icon/chevron-right.svg"
              alt="arrow-right"
              width={18}
              height={18}
            />
          </button>
        </div>
      ) : (
        <p style={{ marginTop: 32, textAlign: "center", color: "#6C7086" }}>
          Không tìm thấy giáo viên
        </p>
      )}
    </div>
  );
}
