import { apiService } from "./api";

export interface CeoDetailResponse {
  code: number;
  data: {
    _id?: string;
    name?: string;
    avatar?: string;
    ceo_description?: string;
    description?: string;
    achievements?: Array<{
      id: string;
      icon?: string;
      description: string;
    }>;
  };
  message?: string;
}

export const ceoService = {
  /**
   * Lấy thông tin chi tiết CEO
   * @returns Promise với dữ liệu chi tiết CEO
   */
  getDetail: async (): Promise<CeoDetailResponse> => {
    return apiService.post<CeoDetailResponse>("/ceo-page/detail", {});
  },
};
