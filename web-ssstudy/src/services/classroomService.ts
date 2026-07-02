import { apiService } from "./api";

export interface AccessByCodePayload {
  code: string;
}

export interface AccessByCodeResponse {
  code: number;
  message?: string;
}

export interface RelatedCoursesPayload {
  page: number;
  limit: number;
  group_id: string;
  classroom_id: string;
  level: string;
}

export interface RelatedCoursesResponse {
  code: number;
  data?: {
    records?: any[];
    data?: {
      records?: any[];
    };
  };
  message?: string;
}

export const classroomService = {
  accessByCode: (
    payload: AccessByCodePayload
  ): Promise<AccessByCodeResponse> => {
    return apiService.post<AccessByCodeResponse>(
      "/classroom/access-by-code",
      payload
    );
  },

  /**
   * Lấy danh sách khóa học liên quan
   * Endpoint: POST /classroom/list-related
   */
  getRelatedCourses: (
    payload: RelatedCoursesPayload
  ): Promise<RelatedCoursesResponse> => {
    return apiService.post<RelatedCoursesResponse>(
      "/classroom/list-related",
      payload
    );
  },
};

export default classroomService;
