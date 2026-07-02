import axios from "axios";
import config from "@/config";
import { getCookie } from "@/utils/cookie";
import { authService } from "./authService";

// Interface cho một mục lịch sử tìm kiếm
export interface SearchHistoryItem {
  _id?: string;
  keyword: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

// Interface cho response từ API list
// API trả về data là mảng trực tiếp, không phải data.records
export interface SearchHistoryListResponse {
  code: number;
  message?: string;
  data?: SearchHistoryItem[];
}

// Interface cho response từ API add/delete
export interface SearchHistoryActionResponse {
  code: number;
  message?: string;
  data?: any;
}

// Interface cho response từ API search-id
export interface SearchIdResponse {
  code: number;
  message?: string;
  data?: {
    type: "book_id" | "lesson" | "exam" | "category" | "question" | string;
    id?: string; // generic id (cho lesson, question)
    book_id?: string; // cho book_id, exam, category
    course_id?: string; // cho book_id
    data?: any; // Dữ liệu bổ sung cho exam, category
  };
}

// Helper function để lấy user_id - giống cách wordExamService làm
function getCurrentUserId(): string | null {
  if (typeof window === "undefined") return null;

  try {
    // Cách 1: Lấy từ authService.getCurrentUser()
    const currentUser = authService.getCurrentUser() as any;
    const fromCurrent =
      currentUser?.user_id ||
      currentUser?._id ||
      currentUser?.id ||
      currentUser?.userId;
    if (fromCurrent) {
      return String(fromCurrent);
    }
  } catch {
    /* noop */
  }

  try {
    // Cách 2: Lấy từ localStorage dataLogin
    const dataLogin = localStorage.getItem("dataLogin");
    if (dataLogin) {
      const parsed = JSON.parse(dataLogin);
      const fromDataLogin =
        parsed?.user_id || parsed?._id || parsed?.id || parsed?.userId;
      if (fromDataLogin) {
        return String(fromDataLogin);
      }
    }
  } catch {
    /* noop */
  }

  // Cách 3: Lấy từ cookie SSSTUDY_UID
  try {
    const uid = getCookie("SSSTUDY_UID");
    if (uid) return uid;
  } catch {
    /* noop */
  }

  return null;
}

// Tạo axios instance riêng cho search-history API (chạy trên port 3013)
const searchHistoryApi = axios.create({
  baseURL: config.legacyApiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor để thêm token
searchHistoryApi.interceptors.request.use(
  (axiosConfig) => {
    let token = null;

    if (typeof window !== "undefined") {
      token = authService.getSessionId();
    }

    if (token) {
      axiosConfig.headers.Authorization = token;
    }

    return axiosConfig;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
searchHistoryApi.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const searchHistoryService = {
  /**
   * Lấy danh sách lịch sử tìm kiếm của người dùng
   * @returns Response chứa danh sách lịch sử tìm kiếm
   */
  getSearchHistory: () => {
    const userId = getCurrentUserId();
    return searchHistoryApi.post<any, SearchHistoryListResponse>(
      "/search-history/list",
      {
        user_id: userId,
      }
    );
  },

  /**
   * Thêm hoặc cập nhật lịch sử tìm kiếm
   * @param keyword - Từ khóa tìm kiếm cần lưu
   * @returns Response từ API
   */
  addSearchHistory: (keyword: string) => {
    const userId = getCurrentUserId();
    return searchHistoryApi.post<any, SearchHistoryActionResponse>(
      "/search-history/add-and-update",
      {
        user_id: userId,
        keyword: keyword,
      }
    );
  },

  /**
   * Xóa một mục khỏi lịch sử tìm kiếm
   * @param keyword - Từ khóa cần xóa khỏi lịch sử
   * @returns Response từ API
   */
  deleteSearchHistory: (keyword: string) => {
    const userId = getCurrentUserId();
    return searchHistoryApi.post<any, SearchHistoryActionResponse>(
      "/search-history/delete",
      {
        user_id: userId,
        keyword: keyword,
      }
    );
  },

  /**
   * Tra cứu ID (bài học, sách ID, bài tập, câu hỏi, ...)
   * @param keyword - ID cần tra cứu (số)
   * @returns Response chứa type và id tương ứng
   */
  searchById: (keyword: string) => {
    return searchHistoryApi.post<any, SearchIdResponse>("/page/search-id", {
      keyword,
    });
  },
};
