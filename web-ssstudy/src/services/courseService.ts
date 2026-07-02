import { apiService } from "./api";
import {
  ClassroomChapterCategoryRequest,
  ClassroomChapterCategoryResponse,
  SubjectListResponse,
  ClassroomViewRequest,
  ClassroomViewResponse,
  ClassroomDetailRequest,
  ClassroomDetailResponse, RequestRoomReviewList, RequestBodyRoomReviewCreate,
  ResponseReviewCourse,
} from "@/types/course";

export const courseService = {
  /**
   * Lấy danh sách chapter và category của classroom
   * @param payload - Request payload chứa classroom_id
   * @returns Response chứa danh sách chapters và categories
   */
  getClassroomChapterCategory: (payload: ClassroomChapterCategoryRequest) => {
    return apiService.post<ClassroomChapterCategoryResponse>(
      "/classroom-chapter-category",
      payload
    );
  },

  /**
   * Lấy danh sách subjects
   * @returns Response chứa danh sách subjects
   */
  getSubjectList: () => {
    return apiService.post<SubjectListResponse>("/subject-list", {});
  },

  /**
   * Gọi API classroom-view để track lượt xem khóa học
   * @param payload - Request payload chứa id và user_id
   * @returns Response từ API classroom-view
   * @deprecated Đã thay thế bằng classroomDetail, giữ lại để tương thích ngược
   */
  classroomView: (payload: ClassroomViewRequest) => {
    return apiService.post<ClassroomViewResponse>("/classroom-view", payload);
  },

  /**
   * Lấy thông tin chi tiết khóa học
   * @param payload - Request payload chứa id của khóa học
   * @returns Response từ API classroom/detail
   */
  classroomDetail: (payload: ClassroomDetailRequest) => {
    return apiService.post<ClassroomDetailResponse>(
      "/classroom/detail",
      payload
    );
  },
  
  /**
   * Lấy danh sách đánh giá khóa học ở chi tiết khóa
   * @param payload - Request payload gửi lên để truy vấn lấy đánh giá theo khóa học
   * @returns Response từ API classroom-review/list
   */
  classRoomReviewList: (payload: RequestRoomReviewList) => {
    return apiService.post<ResponseReviewCourse>(
        "classroom-review/list",
        payload
    );
  },
  
  /**
   * Lấy danh sách đánh giá khóa học ở chi tiết khóa
   * @param payload - Request payload chứa id của khóa học
   * @returns Response từ API classroom-review/create
   */
  classRoomReviewCreate: (payload: RequestBodyRoomReviewCreate) => {
    return apiService.post<ClassroomDetailResponse>(
        "classroom-review/create",
        payload
    );
  },
};
