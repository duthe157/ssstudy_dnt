import axios from "axios";
import { apiService } from "./api";
import { BookListRequest, BookListResponse } from "@/types/book";
import config from "@/config";

export const bookidService = {
  /**
   * Lấy danh sách sách với bộ lọc
   * @param payload - Request payload chứa các tham số lọc
   * @returns Response chứa danh sách sách
   */
  getBookList: (payload: BookListRequest) => {
    return apiService.post<BookListResponse>("/book-id/list-public", payload);
  },

  getBookDetail: async (id: string) => {
    // Lấy token từ localStorage nếu có, nếu không cứ gửi không có header
    let token: string | null = null;
    try {
      const storedToken = localStorage.getItem("token");
      if (storedToken) token = storedToken;
      else {
        const dataLogin = localStorage.getItem("dataLogin");
        if (dataLogin) token = JSON.parse(dataLogin)?.token ?? null;
      }
    } catch {}

    const instance = axios.create({
      baseURL: config.apiUrl,
    });
    return instance.post(
      "/book-id/detail",
      { id },
      {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: token } : {}),
        },
      }
    );
  },

  /**
   * Lấy chi tiết khóa học sách ID
   * Endpoint: POST /book-id-course/detail
   * Response: { data: { course: {...}, is_bought: boolean }, code: 200 }
   */
  getBookCourseDetail: async (id: string) => {
    let token: string | null = null;
    try {
      const storedToken = localStorage.getItem("token");
      if (storedToken) token = storedToken;
      else {
        const dataLogin = localStorage.getItem("dataLogin");
        if (dataLogin) token = JSON.parse(dataLogin)?.token ?? null;
      }
    } catch {}

    const instance = axios.create({
      baseURL: config.apiUrl,
    });
    return instance.post(
      "/book-id-course/detail",
      { id },
      {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: token } : {}),
        },
      }
    );
  },

  /**
   * Lấy danh sách sách liên quan
   * Endpoint: POST /book-id/list-related
   */
  getRelatedBooks: async (payload: {
    page: number;
    limit: number;
    level: string;
    category_id: string;
    book_id: string;
  }) => {
    // Lấy token từ localStorage nếu có
    let token: string | null = null;
    try {
      const storedToken = localStorage.getItem("token");
      if (storedToken) token = storedToken;
      else {
        const dataLogin = localStorage.getItem("dataLogin");
        if (dataLogin) token = JSON.parse(dataLogin)?.token ?? null;
      }
    } catch {}

    const instance = axios.create({
      baseURL: config.apiUrl,
    });
    return instance.post("/book-id/list-related", payload, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: token } : {}),
      },
    });
  },
  /**
   * Kích hoạt sách ID bằng mã
   * Endpoint: POST /book-id/access-by-code
   */
  accessByCode: (payload: { book_id: string; code: string }) => {
    return apiService.post("/book-id/access-by-code", payload);
  },
};
