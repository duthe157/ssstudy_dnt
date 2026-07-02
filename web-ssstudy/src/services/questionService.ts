import axios from "axios";
import config from "@/config";
import { authService } from "./authService";

const questionApi = axios.create({
  baseURL: config.apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token
questionApi.interceptors.request.use(
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

export const questionService = {
  /**
   * Lấy chi tiết câu hỏi theo ID
   * @param id - ID của câu hỏi
   * @returns Chi tiết câu hỏi
   */
  getQuestionDetail: async (id: string) => {
    try {
      const response = await questionApi.post(`/question-word/detail`, { id });
      return response.data;
    } catch (error) {
      console.error("Error fetching question detail:", error);
      throw error;
    }
  },
};
