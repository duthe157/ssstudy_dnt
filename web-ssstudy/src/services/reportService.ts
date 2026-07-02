import { apiService } from "./api";

export interface CreateReportBugPayload {
  content: string;
  object_id: string;
  object_type: string;
  phone: string;
  classroom_id: string;
}

export interface CreateReportBugResponse {
  code: number;
  message: string;
  data?: any;
}

export const reportService = {
  /**
   * Tạo báo cáo lỗi
   * @param payload - Thông tin báo lỗi
   * @returns Dữ liệu phản hồi từ API
   */
  createBugReport: (payload: CreateReportBugPayload) => {
    return apiService.post<CreateReportBugResponse>(
      "/report-bug/create",
      payload
    );
  },
};

