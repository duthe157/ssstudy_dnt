// File: services/wordExamService.ts

import { apiService } from "./api";
import { authService } from "./authService";
import config from "@/config";

const BASE_URL = config.apiUrl;

// Tạo axios instance cho Word Exam API
const wordExamApi = apiService.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor để tự động thêm token vào header
wordExamApi.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage hoặc cookie
    let token = null;

    // Thử lấy từ localStorage trước
    try {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        token = storedToken;
      } else {
        // Thử lấy từ dataLogin
        const dataLogin = localStorage.getItem("dataLogin");
        if (dataLogin) {
          const parsed = JSON.parse(dataLogin);
          token = parsed.token;
        }
      }
    } catch (error) {
      console.warn("Error getting token from localStorage:", error);
    }

    // Nếu không có trong localStorage, thử lấy từ cookie
    if (!token) {
      const cookies = document.cookie.split(";");
      const sessionCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("SSSTUDY_SID=")
      );
      if (sessionCookie) {
        token = sessionCookie.split("=")[1];
      }
    }

    if (token) {
      config.headers.Authorization = token;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

function getCurrentUserId(): string | null {
  if (typeof window === "undefined") return null;

  try {
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

  return null;
}

export interface WordExamListParams {
  page?: number;
  limit?: number;
  keyword?: string;
  classes?: string;
  country?: string;
  subject_name?: string;
  exam_category?: string;
  type_exam?: string;
  sort_key?: string;
  sort_value?: number;
  have_done?: boolean;
  populate_id?: string;
  user_id?: string;
}

export interface PracticeExamListParams {
  keyword?: string;
  sort_key?: string;
  sort_value?: number;
  user_id?: string;
  have_done?: boolean;
  subject_name?: string;
  exam_category?: string;
  type_exam?: string;
  populate_id?: string;
  country?: string;
  status?: "active" | "upcoming" | "ended" | string;
}

export interface PracticeExamListResponse {
  code: number;
  data: any;
  message: string;
}

export interface WordExamListResponse {
  code: number;
  data: {
    data: any[];
    totalItems: number;
    totalPages: number;
    page: number;
    limit: number;
  };
  message: string;
}

export interface WordExamDetailResponse {
  code: number;
  data: any;
  message: string;
}

export interface CheckAnswerQuestionLog {
  question_id: string;
  user_answer: any;
  is_test_question?: boolean;
  question_text?: string;
  score?: number;
}

export interface CheckAnswerResponse {
  code: number;
  message?: string;
  data?: {
    hasTaken?: boolean;
    latestScore?: {
      question_logs?: CheckAnswerQuestionLog[];
    };
  };
}

export interface CheckPasswordResponse {
  code: number;
  message?: string;
  data?: {
    isValid?: boolean;
  };
}

export const wordExamService = {
  // Lấy danh sách đề thi Word với filter và pagination
  async getWordExamList(
    params: WordExamListParams = {}
  ): Promise<WordExamListResponse> {
    try {
      const resolvedUserId = params.user_id ?? getCurrentUserId();

      const response = await wordExamApi.post("/exam-word/list", {
        page: params.page || 1,
        limit: params.limit || 12,
        classes: params.classes,
        country: params.country,
        subject_name: params.subject_name,
        exam_category: params.exam_category,
        type_exam: params.type_exam,
        sort_key: params.sort_key || "updated_at",
        sort_value: params.sort_value || -1,
        have_done: params.have_done,
        populate_id: params.populate_id,
        screen: "THI_THU",
        ...(resolvedUserId ? { user_id: resolvedUserId } : {}),
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching word exam list:", error);
      throw error;
    }
  },

  // Lấy danh sách Đấu trường học tập
  async getPracticeExamList(
    params: PracticeExamListParams = {}
  ): Promise<PracticeExamListResponse> {
    try {
      const resolvedUserId = params.user_id ?? getCurrentUserId();

      const response = await wordExamApi.post("exam-word/list-practice", {
        keyword: params.keyword ?? "",
        sort_key: params.sort_key ?? "updated_at",
        sort_value: params.sort_value ?? -1,
        have_done: params.have_done,
        subject_name: params.subject_name,
        exam_category: params.exam_category,
        type_exam: params.type_exam,
        populate_id: params.populate_id,
        country: params.country,
        status: params.status ?? "ended",
        ...(resolvedUserId ? { user_id: resolvedUserId } : {}),
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching practice exam list:", error);
      throw error;
    }
  },

  // Lấy chi tiết đề thi Word theo ID (matching web-user endpoint)
  async getWordExamById(examId: string): Promise<WordExamDetailResponse> {
    try {
      const response = await wordExamApi.get(
        `/exam-word/get-by-id?id=${examId}`
      );

      return response.data;
    } catch (error) {
      console.error("[wordExamService]  Error getting Word exam by ID:", error);
      throw error;
    }
  },

  // API tính điểm
  async scoringWordExam(
    examId: string,
    timeDoing: number,
    answers: any[]
  ): Promise<any> {
    try {
      const payload: any = {
        exam_id: examId,
        time_doing: timeDoing,
        answers: answers,
      };

      const userId = getCurrentUserId();
      if (userId) {
        payload.user_id = userId;
      }

      const response = await wordExamApi.post("/exam-word/scoring", payload);

      return response.data;
    } catch (error) {
      console.error("[wordExamService]  Error scoring exam:", error);
      throw error;
    }
  },

  // API lấy lời giải chi tiết
  async getExplanation(examId: string): Promise<any> {
    try {
      const response = await wordExamApi.post("/exam-word/explanation", {
        id: examId,
      });

      return response.data;
    } catch (error) {
      console.error("[wordExamService]  Error getting explanation:", error);
      throw error;
    }
  },

  async checkWordExamAnswer(payload: {
    user_id: string;
    exam_id: string;
  }): Promise<CheckAnswerResponse> {
    try {
      const response = await wordExamApi.post(
        "/exam-word/check-answer",
        payload
      );
      return response.data;
    } catch (error) {
      console.error(
        "[wordExamService]  Error getting user answers from check-answer API:",
        error
      );
      throw error;
    }
  },

  async checkExamPassword(payload: {
    exam_id: string;
    password: string;
  }): Promise<CheckPasswordResponse> {
    try {
      const response = await wordExamApi.post(
        "/exam-word/check-password",
        payload
      );
      return response.data;
    } catch (error) {
      console.error("[wordExamService]  Error checking exam password:", error);
      throw error;
    }
  },

  //  API tính điểm với payload đầy đủ - LUÔN GỬI ANSWERS
  async scoringWordExamWithPayload(payload: {
    exam_id: string;
    classroom_id?: string;
    answers?: any[];
    time_doing?: number;
    exam_key?: string;
    subject?: string[]; // names of selected subjects in NHOM_CHU_DE
  }): Promise<any> {
    try {
      //  Tạo payload sạch - LUÔN gửi answers (dù rỗng)
      const sanitizedPayload: any = {
        exam_id: payload.exam_id,
        answers: Array.isArray(payload.answers) ? payload.answers : [], //  Luôn là array
        time_doing:
          typeof payload.time_doing === "number" ? payload.time_doing : 0,
      };

      //  Thêm optional fields
      if (payload.classroom_id) {
        sanitizedPayload.classroom_id = payload.classroom_id;
      }
      if (payload.exam_key) {
        sanitizedPayload.exam_key = payload.exam_key;
      }
      if (Array.isArray(payload.subject) && payload.subject.length > 0) {
        sanitizedPayload.subject = payload.subject;
      }

      const userId = getCurrentUserId();
      if (userId) {
        sanitizedPayload.user_id = userId;
      }

      const response = await wordExamApi.post(
        "/exam-word/scoring",
        sanitizedPayload
      );

      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // API lấy kết quả thi đã hoàn thành
  async getExamResult(payload: {
    exam_id: string;
    classroom_id?: string;
    testing_id?: string;
  }): Promise<any> {
    try {
      const response = await wordExamApi.post("/exam-word/scoring", payload);

      return response.data;
    } catch (error) {
      console.error("[wordExamService]  Error getting exam result:", error);
      throw error;
    }
  },

  //  Helper function để build answers array - XỬ LÝ OBJECT RỖNG
  buildWordAnswers(combinedResponses: Record<string, any>): any[] {
    //  Nếu không có responses hoặc object rỗng, return array rỗng
    if (!combinedResponses || Object.keys(combinedResponses).length === 0) {
      return [];
    }

    const answers = Object.entries(combinedResponses).map(
      ([questionId, response]) => {
        let answerArr: any = null;

        if (response?.answer) {
          if (Array.isArray(response.answer)) {
            // TRUE/FALSE nhiều mệnh đề theo định dạng object -> chuẩn hóa sang array string
            const first = response.answer[0];
            if (first && typeof first === "object" && first.questionOption) {
              const order = ["A", "B", "C", "D", "E", "F", "G", "H"]; // hỗ trợ mở rộng
              answerArr = [...response.answer]
                .sort(
                  (a: any, b: any) =>
                    order.indexOf(a.questionOption) -
                    order.indexOf(b.questionOption)
                )
                .map((it: any) => String(it.option));
            } else {
              // Multiple choice answers khác giữ nguyên
              answerArr = response.answer;
            }
          } else {
            // Single choice answer
            answerArr = [response.answer];
          }
        }

        // Giữ nguyên question_id là key; nếu nơi gọi có map sang inner id thì truyền từ đó
        // Bao gồm isTestQuestion nếu có
        const result: any = { question_id: questionId, answer: answerArr };
        if (response?.isTestQuestion !== undefined) {
          result.isTestQuestion = response.isTestQuestion;
        }
        return result;
      }
    );

    return answers;
  },

  // Helper function để tính thời gian làm bài (matching web-user)
  calculateTimeDoing(startTime: number): number {
    const currentTime = Date.now();
    const timeDiffMs = currentTime - startTime;
    const timeDiffMinutes = Math.floor(timeDiffMs / (1000 * 60));
    return timeDiffMinutes;
  },

  //  Function chính để nộp bài và tính điểm - XỬ LÝ ARRAY RỖNG
  async submitAndScoreExam(payload: {
    exam_id: string;
    classroom_id?: string;
    answers: any[];
    time_doing: number;
    subject?: string[]; // names of selected subjects in NHOM_CHU_DE
  }): Promise<any> {
    try {
      //  LUÔN gửi payload cho API scoring, kể cả khi answers rỗng
      //  (backend sẽ tự xử lý trường hợp không chọn câu nào)
      const scoringPayload: any = {
        exam_id: payload.exam_id,
        answers: Array.isArray(payload.answers) ? payload.answers : [],
        time_doing: payload.time_doing,
      };

      if (payload.classroom_id) {
        scoringPayload.classroom_id = payload.classroom_id;
      }
      if (Array.isArray(payload.subject) && payload.subject.length > 0) {
        scoringPayload.subject = payload.subject;
      }

      //  Gọi API scoring
      const result = await this.scoringWordExamWithPayload(scoringPayload);

      return result;
    } catch (error: any) {
      console.error(
        "[wordExamService]  Error submitting and scoring exam:",
        error
      );
      throw error;
    }
  },
};
