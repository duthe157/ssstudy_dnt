import { apiService } from './api';

export const accountService = {
  /**
   * Lấy thông tin profile của người dùng.
   * @returns Dữ liệu profile người dùng.
   */
  getProfile: () => {
    return apiService.post<any>('/user/profile');
  },

  /**
   * Cập nhật thông tin profile của người dùng.
   * @param payload - Dữ liệu cập nhật profile.
   * @returns Dữ liệu phản hồi từ API.
   */
  updateProfile: (payload: any) => {
    return apiService.post<any>('/user/update-profile', payload);
  },

  /**
   * Lấy danh sách lớp học theo các tiêu chí lọc.
   * @param payload - Dữ liệu bộ lọc cho danh sách lớp học.
   * @returns Danh sách lớp học.
   */
  getListClassroom: (payload: any) => {
    return apiService.post<any>('/classroom/list', payload);
  },

  /**
   * Lấy danh sách đơn hàng.
   * @returns Danh sách đơn hàng.
   */
  getOrderList: () => {
    return apiService.post<any>('/order/list');
  },

  /**
   * Lấy danh sách môn học.
   * @returns Danh sách môn học.
   */
  getSubjectList: () => {
    return apiService.post<any>('/subject-list');
  },

  /**
   * Lấy danh sách giảng viên.
   * @returns Danh sách giảng viên.
   */
  getTeacherList: () => {
    return apiService.post<any>('/teacher-list');
  },

  /**
   * Đổi mật khẩu người dùng.
   * @param payload - Dữ liệu đổi mật khẩu (old_password, new_password).
   * @returns Dữ liệu phản hồi từ API.
   */
  changePassword: (payload: { old_password: string; new_password: string }) => {
    return apiService.post<any>('/user/change-password', payload);
  },

  getListOwnedBookIdCourse: (payload: { page: number; limit: number }) => {
    return apiService.post<any>("/book-id-course/list-owned", payload);
  },

  /**
   * Lấy danh sách thông báo gia hạn (hết hạn hoặc sắp hết hạn).
   * @returns Danh sách thông báo gia hạn.
   */
  getRenewalNotifications: () => {
    return apiService.post<any>("/book-id/get-noti");
  },
};
