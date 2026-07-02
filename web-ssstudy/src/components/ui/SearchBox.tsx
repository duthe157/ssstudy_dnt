"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  searchHistoryService,
  type SearchHistoryItem,
} from "@/services/searchHistoryService";
import { toast } from "react-toastify";
import { wordExamService } from "@/services/wordExamService";
import { authService } from "@/services/authService";
import config from "@/config";

interface SearchBoxProps {
  /** Override className cho container ngoài cùng */
  className?: string;
  /** Override className cho dropdown lịch sử */
  dropdownClassName?: string;
  /** Có kiểm tra isLogin trước khi hiển thị lịch sử không (mặc định: false) */
  isLogin?: boolean;
  /** Callback mở popup câu hỏi */
  openQuestionPopup?: (questionId: string) => void;
}

/**
 * Component ô tìm kiếm dùng chung.
 * - Tự động xác định placeholder và loại input dựa theo pathname:
 *   + Trang /sach, /sach/*, /khoa-hoc, /khoa-hoc/*: cho phép nhập text, placeholder "Nội dung tìm kiếm"
 *   + Các trang khác: chỉ nhập số, placeholder "Tra ID"
 * - Lưu lịch sử tìm kiếm qua searchHistoryService
 * - Hiển thị dropdown lịch sử khi focus
 * - Navigate đến /tim-kiem?keyword=...&type=CLASSROOM
 */
const SearchBox: React.FC<SearchBoxProps> = ({
  className = "relative w-56 h-10 inline-flex justify-center items-center",
  dropdownClassName = "absolute top-full -left-5 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-[100] overflow-hidden min-w-[500px]",
  isLogin,
  openQuestionPopup,
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const [valueSearch, setValueSearch] = useState("");
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSearchingById, setIsSearchingById] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchHistoryRef = useRef<HTMLDivElement>(null);

  /**
   * Xử lý điều hướng dựa theo kết quả trả về từ API /search-id
   */
  const handleRedirect = useCallback(
    async (resData: any) => {
      if (!resData) return false;
      const { type, id, book_id, course_id, data: nestedData } = resData;

      // 1. Trường hợp book_id (Sách ID)
      if (type === "book_id" && book_id && course_id) {
        router.push(`/sach-id/${book_id}/${course_id}`);
        setValueSearch("");
        return true;
      }

      // 2. Trường hợp lesson (Bài học)
      if (type === "lesson" && id) {
        router.push(`/lesson/${id}?isSearchId=true`);
        setValueSearch("");
        return true;
      }

      // 3. Trường hợp exam (Đề thi)
      if (type === "exam" && nestedData?.id) {
        const examId = nestedData.id;
        const examType = nestedData.type; // SACH_ID hoặc WORD

        if (examType === "SACH_ID") {
          // Điều hướng đến trang lời giải và đáp án
          router.push(`/thi-thu/result/${examId}/explanation?mode=view`);
          setValueSearch("");
          return true;
        } else if (examType === "WORD") {
          // Kiểm tra xem học sinh đã làm bài thi này chưa
          try {
            const user = authService.getCurrentUser();
            const userId =
              user?.user_id || user?._id || user?.id || user?.userId;

            if (userId) {
              const checkRes = await wordExamService.checkWordExamAnswer({
                user_id: userId,
                exam_id: examId,
              });

              if (checkRes?.data?.hasTaken) {
                // Nếu đã làm rồi, chuyển đến màn hình score
                router.push(`/thi-thu/word-exam/${examId}/score`);
                setValueSearch("");
                return true;
              }
            }
          } catch (error) {
            console.error("Error checking exam status in SearchBox:", error);
          }

          // Nếu chưa làm hoặc có lỗi check, điều hướng đến trang ready như cũ
          router.push(`/thi-thu/word-exam/${examId}/ready`);
          setValueSearch("");
          return true;
        } else {
          // Trường hợp MAC_DINH hoặc các loại đề thi trực tuyến khác (bao gồm MANUAL)
          const examUrl = config.examUrl || "https://baitap.ssstudy.vn/";
          const classroomId = course_id || "";

          // Đối với đề thi liên quan tới Sách ID có type là MAC_DINH, điều hướng sang trang doing-hsa
          const doingUrl = `${examUrl}thi-thu/doing-hsa?exam_id=${examId}&classroom_id=${classroomId}&creating_type=MANUAL`;
          window.open(doingUrl, "_blank");
          setValueSearch("");
          return true;
        }
      }

      // 4. Trường hợp category (Nhóm bài tập)
      if (type === "category" && course_id) {
        const lessonIdParam = id || ""; // id từ kết tra cứu nếu có
        const lessonName = nestedData?.name || "";

        let query = "";
        if (lessonIdParam) query += `?lessonId=${lessonIdParam}`;
        if (lessonName) {
          query +=
            (query ? "&" : "?") +
            `lessonName=${encodeURIComponent(lessonName)}`;
        }

        // Thêm dấu hiệu nhận biết từ Search ID
        query += (query ? "&" : "?") + "isSearchId=true";

        router.push(`/lesson/${course_id}${query}`);
        setValueSearch("");
        return true;
      }

      // 5. Trường hợp question (Câu hỏi) - Đã định nghĩa mở popup
      if (type === "question" && id) {
        if (openQuestionPopup) {
          openQuestionPopup(id);
          setValueSearch("");
          return true;
        }
      }

      return false;
    },
    [router],
  );

  // Cho phép nhập chữ ở trang sách, chi tiết sách, khóa học, chi tiết khóa học
  // Các trang còn lại chỉ cho phép nhập số
  const isTextSearchAllowed = React.useMemo(() => {
    if (!pathname) return false;
    return (
      pathname === "/sach" ||
      pathname.startsWith("/sach/") ||
      pathname === "/khoa-hoc" ||
      pathname.startsWith("/khoa-hoc/")
    );
  }, [pathname]);

  // Fetch search history from API
  const fetchSearchHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const response = await searchHistoryService.getSearchHistory();
      if (response?.code === 200 && response?.data) {
        setSearchHistory(response.data);
      }
    } catch (error) {
      console.error("Error fetching search history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // Add keyword to search history
  const addToSearchHistory = useCallback(async (keyword: string) => {
    if (!keyword.trim()) return;
    try {
      await searchHistoryService.addSearchHistory(keyword.trim());
    } catch (error) {
      console.error("Error adding to search history:", error);
    }
  }, []);

  // Delete keyword from search history
  const deleteFromSearchHistory = useCallback(async (keyword: string) => {
    try {
      await searchHistoryService.deleteSearchHistory(keyword);
      setSearchHistory((prev) =>
        prev.filter((item) => item.keyword !== keyword),
      );
    } catch (error) {
      console.error("Error deleting from search history:", error);
    }
  }, []);

  // Handle search input focus
  const handleSearchFocus = useCallback(() => {
    setShowSearchHistory(true);
    fetchSearchHistory();
  }, [fetchSearchHistory]);

  // Handle click on history item
  const handleHistoryItemClick = useCallback(
    async (keyword: string) => {
      setValueSearch(keyword);
      setShowSearchHistory(false);

      addToSearchHistory(keyword).catch(() => {});

      if (!isTextSearchAllowed) {
        setIsSearchingById(true);
        try {
          const res = await searchHistoryService.searchById(keyword);
          if (res?.code === 200 && res?.data) {
            const success = await handleRedirect(res.data);
            if (!success) {
              toast.error("Không tìm thấy kết quả cho ID này", {
                style: { backgroundColor: "#A82E26", color: "#fff" },
              });
            }
          } else if (res?.code === 500) {
            toast.error(
              res?.message === "Không tìm thấy"
                ? "ID không tồn tại"
                : res?.message || "ID không tồn tại",
              {
                style: { backgroundColor: "#A82E26", color: "#fff" },
              },
            );
          } else {
            toast.error(res?.message || "Không tìm thấy ID này", {
              style: { backgroundColor: "#A82E26", color: "#fff" },
            });
          }
        } catch (error: any) {
          if (error?.response?.data?.code === 500) {
            const errorMsg = error?.response?.data?.message;
            toast.error(
              errorMsg === "Không tìm thấy"
                ? "ID không tồn tại"
                : errorMsg || "ID không tồn tại",
              {
                style: { backgroundColor: "#A82E26", color: "#fff" },
              },
            );
          } else {
            toast.error("Có lỗi xảy ra, vui lòng thử lại", {
              style: { backgroundColor: "#A82E26", color: "#fff" },
            });
          }
        } finally {
          setIsSearchingById(false);
        }
        return;
      }

      // Chế độ tìm kiếm text thông thường
      const searchUrl = `/tim-kiem?keyword=${encodeURIComponent(keyword)}&type=CLASSROOM`;
      router.push(searchUrl);
    },
    [router, isTextSearchAllowed],
  );

  // Click outside to close search history dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchHistoryRef.current &&
        event.target instanceof Node &&
        !searchHistoryRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowSearchHistory(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = async () => {
    if (!valueSearch.trim()) return;

    // Chế độ Tra ID: gọi API /search-id
    if (!isTextSearchAllowed) {
      setIsSearchingById(true);
      try {
        const res = await searchHistoryService.searchById(valueSearch.trim());
        if (res?.code === 200 && res?.data) {
          // Lưu lịch sử tìm kiếm (không await để không block redirect)
          addToSearchHistory(valueSearch.trim()).catch(() => {});

          const success = await handleRedirect(res.data);
          if (!success) {
            toast.error("Không tìm thấy kết quả cho ID này", {
              style: { backgroundColor: "#A82E26", color: "#fff" },
            });
          }
        } else if (res?.code === 500) {
          toast.error(
            res?.message === "Không tìm thấy"
              ? "ID không tồn tại"
              : res?.message || "ID không tồn tại",
            {
              style: { backgroundColor: "#A82E26", color: "#fff" },
            },
          );
        } else {
          toast.error(res?.message || "Không tìm thấy ID này", {
            style: { backgroundColor: "#A82E26", color: "#fff" },
          });
        }
      } catch (error: any) {
        if (error?.response?.data?.code === 500) {
          const errorMsg = error?.response?.data?.message;
          toast.error(
            errorMsg === "Không tìm thấy"
              ? "ID không tồn tại"
              : errorMsg || "ID không tồn tại",
            {
              style: { backgroundColor: "#A82E26", color: "#fff" },
            },
          );
        } else {
          toast.error("Có lỗi xảy ra, vui lòng thử lại", {
            style: { backgroundColor: "#A82E26", color: "#fff" },
          });
        }
      } finally {
        setIsSearchingById(false);
      }
      return;
    }

    // Chế độ tìm kiếm text thông thường
    await addToSearchHistory(valueSearch.trim());
    setShowSearchHistory(false);
    const searchUrl = `/tim-kiem?keyword=${encodeURIComponent(
      valueSearch,
    )}&type=CLASSROOM`;
    router.push(searchUrl);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  // Kiểm tra có hiển thị lịch sử không
  const shouldShowHistory =
    isLogin !== undefined ? showSearchHistory && isLogin : showSearchHistory;

  return (
    <div className={className}>
      <div className="w-full self-stretch px-3 py-2 bg-slate-100 rounded-[50px] flex justify-between items-center">
        <input
          ref={searchInputRef}
          type="text"
          placeholder={isTextSearchAllowed ? "Nội dung tìm kiếm" : "Tra ID"}
          className="bg-transparent border-none outline-none text-gray-500 text-sm sm:text-base font-normal leading-normal flex-1 min-w-0 w-0"
          value={valueSearch}
          onChange={(e) => {
            const val = e.target.value;
            if (isTextSearchAllowed) {
              setValueSearch(val);
            } else {
              // Chỉ cho phép nhập số
              const numericVal = val.replace(/[^0-9]/g, "");
              setValueSearch(numericVal);
            }
          }}
          onKeyDown={handleKeyDown}
          onFocus={handleSearchFocus}
        />
        <div
          className={`w-5 h-5 flex items-center justify-center ml-2 ${
            isSearchingById ? "cursor-not-allowed" : "cursor-pointer"
          }`}
          onClick={(e) => {
            e.preventDefault();
            if (!isSearchingById) handleSearch();
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (!isSearchingById) handleSearch();
            }
          }}
          aria-label="Tìm kiếm"
        >
          {isSearchingById ? (
            // Loading spinner
            <svg
              className="animate-spin"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="#9A9DAC"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="#9A9DAC"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          ) : (
            // Search icon
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 16C12.866 16 16 12.866 16 9C16 5.13401 12.866 2 9 2C5.13401 2 2 5.13401 2 9C2 12.866 5.13401 16 9 16Z"
                stroke="#9A9DAC"
                strokeWidth="1.50001"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M18.0278 18.0278L14 14"
                stroke="#9A9DAC"
                strokeWidth="1.50001"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Search History Dropdown */}
      {shouldShowHistory && (
        <div ref={searchHistoryRef} className={dropdownClassName}>
          <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
            <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="#6B7280"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Lịch sử tìm kiếm
            </span>
          </div>
          <div className="max-h-[380px] overflow-y-auto">
            {isLoadingHistory ? (
              <div className="px-3 py-4 text-center text-gray-400 text-sm">
                Đang tải...
              </div>
            ) : searchHistory.length === 0 ? (
              <div className="px-3 py-4 text-center text-gray-400 text-sm">
                Chưa có lịch sử tìm kiếm
              </div>
            ) : (
              searchHistory.map((item, index) => (
                <div
                  key={item._id || index}
                  className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer group"
                >
                  <div
                    className="flex items-center gap-2 flex-1 min-w-0"
                    onClick={() => handleHistoryItemClick(item.keyword)}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="flex-shrink-0 text-gray-400"
                    >
                      <path
                        d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-sm text-gray-700 truncate">
                      {item.keyword}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFromSearchHistory(item.keyword);
                    }}
                    className="p-1 rounded-full hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Xóa lịch sử"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M18 6L6 18M6 6L18 18"
                        stroke="#9CA3AF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBox;
