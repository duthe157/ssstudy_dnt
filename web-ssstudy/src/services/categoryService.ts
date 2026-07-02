import { apiService } from "./api";

export interface RegisterLivestreamPayload {
  category_id: string;
  classroom_id: string;
}

export interface RegisterLivestreamResponse {
  code: number;
  message: string;
  data?: unknown;
}

export interface ViewVideoPayload {
  category_id: string;
  classroom_id: string;
}

export interface LivestreamRoom {
  name: string;
  room_link: string;
  ordering: number;
}

export interface CategoryDetail {
  classroom_ids: string[];
  livestreams: LivestreamRoom[];
  _id: string;
  name: string;
  alias: string;
  content?: string;
  subject: {
    id: string;
    name: string;
  };
  chapter: {
    id: string;
    name: string;
  };
  video_link?: string | null;
  doc_link?: string | null;
  total_video_time?: number;
  is_free?: boolean;
  show_doc_btn?: boolean;
  show_exam_btn?: boolean;
  show_video_btn?: boolean;
  created_at: string;
  updated_at: string;
  exam?: {
    id: string;
    name: string;
    code: string;
    creating_type: string;
    type?: string;
  };
  exam_doc_link_1?: string;
  exam_doc_link_2?: string;
  free_finished_at?: string | null;
  livestream_btn?: boolean;
  start_date_time_live?: string;
  ordering?: number;
}

export interface VideoDetail {
  _id: string;
  name: string;
  alias: string;
  type: string;
  link: string;
  duration: number;
  category_id: string;
  ordering: number;
  created_at: string;
  updated_at: string;
}

export interface ViewVideoResponse {
  code: number;
  message: string;
  data: {
    category: CategoryDetail;
    video: VideoDetail;
    v_id: string | null;
    num_view: number;
    otherVideos: VideoDetail[];
    is_done_exam: boolean;
  };
}

export const categoryService = {
  /**
   * Đăng ký học livestream
   * @param payload - Thông tin đăng ký bao gồm category_id và classroom_id
   * @returns Dữ liệu phản hồi từ API
   */
  registerLivestream: (payload: RegisterLivestreamPayload) => {
    return apiService.post<RegisterLivestreamResponse>(
      "/category/register-livestream",
      payload
    );
  },

  /**
   * Xem video của bài học
   * @param payload - Thông tin bao gồm category_id và classroom_id
   * @returns Dữ liệu chi tiết của bài học và video
   */
  viewVideo: (payload: ViewVideoPayload) => {
    return apiService.post<ViewVideoResponse>("/category/view-video", payload);
  },
};

