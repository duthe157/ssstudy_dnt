import { apiService } from "./api";

export interface TotalUnreadResponse {
  code: number;
  message?: string;
  data?: {
    total?: number;
    count?: number;
  } | number;
}

export interface NotificationItem {
  _id: string;
  name: string;
  created_at: string;
  is_read: boolean;
  message_user_id: string;
  buttons: {title: string, link: string}[];
}

export interface NotificationListResponse {
  code: number;
  message?: string;
  data?: {
    records?: NotificationItem[];
  };
}

export interface NotificationDetailResponse {
  code: number;
  message?: string;
  data?: NotificationItem;
}

export const notificationService = {
  /**
   * Lấy tổng số tin nhắn chưa đọc
   * @returns Response chứa tổng số tin nhắn chưa đọc
   */
  getTotalUnread: () => {
    return apiService.post<TotalUnreadResponse>("/message/total-unread");
  },

  /**
   * Lấy danh sách thông báo của user
   * @returns Response chứa danh sách thông báo
   */
  getMyMessages: () => {
    return apiService.post<NotificationListResponse>("/message/my");
  },

  /**
   * Lấy chi tiết thông báo theo ID
   * @param id - ID của thông báo
   * @returns Response chứa chi tiết thông báo
   */
  getMessageDetail: (id: string, messageUserId: string) => {
    return apiService.post<NotificationDetailResponse>("/message/detail", { id, message_user_id: messageUserId});
  },
};

