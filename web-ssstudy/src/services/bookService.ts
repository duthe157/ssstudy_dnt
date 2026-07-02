import axios from "axios";
import { apiService } from "./api";
import { BookListRequest, BookListResponse } from "@/types/book";
import config from "@/config";

export const bookService = {
  /**
   * Lấy danh sách sách với bộ lọc
   * @param payload - Request payload chứa các tham số lọc
   * @returns Response chứa danh sách sách
   */
  getBookList: (payload: BookListRequest) => {
    return apiService.post<BookListResponse>("/book/list-book", payload);
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
      "/book/detail",
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
   * Endpoint: POST /book/list-related
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
    return instance.post("/book/list-related", payload, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: token } : {}),
      },
    });
  },
};
