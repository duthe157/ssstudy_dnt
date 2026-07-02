import { apiService } from "./api";

export interface CategoryListResponse {
  total: number;
  limit: number;
  totalRecord: number;
  perPage: number;
  items: CategoryItem[];
  subjects: Subject[];
}

export interface CategoryItem {
  chapter_id: string;
  name: string;
  result: Result[];
}

export interface Result {
  classroom_ids?: string[];
  _id: string;
  name: string;
  alias: string;
  content?: string;
  subject: Subject;
  chapter?: Chapter;
  video_link?: string | null;
  doc_link?: string | null;
  exam_doc_link_1?: string | null;
  exam_doc_link_2?: string | null;
  total_video_time: number;
  free_finished_at: string | null;
  is_free: boolean;
  ordering: number;
  show_doc_btn: boolean;
  show_exam_btn: boolean;
  show_video_btn: boolean;
  created_at: string;
  updated_at: string;
  releaseDate?: string;
  liveStream?: boolean;
  isDone?: boolean;
  status?: "registered" | "unregistered" | "fullSlot";
  num_view?: number;
  exam?: {
    id: string;
    code: number;
    name: string;
    type: string;
    creating_type?: string;
    fast_gift?: any;
  } | Array<{
    id: string;
    code?: number;
    name: string;
    type: string;
    creating_type?: string;
    fast_gift?: any;
  }>;
  livestream_btn?: boolean;
  start_date_time_live?: string;
  classroom_id?: string;
  is_done_exam?: boolean;
  is_done_video?: boolean;
  publish_at?: string | null;
  category?: {
    id: string;
    name: string;
  };
  livestreams?: Array<{
    name: string;
    room_link: string;
    ordering: number;
  }>;
  livestream_max_size?: number;
  livestream_current_size?: number;
  livestream_registed?: boolean;
  livestream_registed_link?: string;
}

export interface Subject {
  id: string;
  name: string;
}

export interface Chapter {
  id: string;
  name: string;
}

export interface CategoryListPayload {
  chapter_id: string;
  is_sort_ordering?: boolean;
  limit?: number;
  page?: number;
}

export interface LessonDetailPayload {
  user: {
    user_group: string;
    user_id: string;
  };
  id: string;
  classroom_id: string;
}

export interface LessonDetailResponse {
  classroom_ids: string[];
  _id: string;
  name: string;
  alias: string;
  content: string;
  subject: Subject;
  chapter: Chapter;
  video_link: string;
  doc_link: string;
  exam_doc_link_1: string;
  exam_doc_link_2: string;
  total_video_time: number;
  free_finished_at: string;
  is_free: boolean;
  ordering: number;
  show_doc_btn: boolean;
  show_exam_btn: boolean;
  show_video_btn: boolean;
  created_at: string;
  updated_at: string;
  publish_at: string;
  exam_started_at: string;
  exam_finished_at: string;
  is_fixed_time: boolean;
  videos: string[];
  num_view: number;
}

// API mới: Thông tin chi tiết khóa học
export interface ClassroomViewPayload {
  id: string;
  user_id: string;
}

export interface BookIdCourseViewPayload {
  id: string;
  user_id: string;
}


export interface ClassroomViewResponse {
  classroom: {
    classroom_relates: string[];
    classroom_attached: string[];
    book_relates: string[];
    book_attached: string[];
    _id: string;
    name: string;
    alias: string;
    code: string;
    subject: Subject;
    group: {
      id: string;
      name: string;
    };
    room: string;
    teacher: string;
    teacher_id: string;
    teacher_alias: string;
    hp_day: number;
    hp_1month_day: number;
    hp_3month_day: number;
    hp_6month_day: number;
    hp_12month_day: number;
    is_cadup: boolean;
    is_auto_diff_day: boolean;
    is_online: boolean;
    is_featured: boolean;
    note: string;
    description: string;
    content: string;
    price: number;
    origin_price: number;
    extra_number_student: number;
    num_student: number;
    ordering: number;
    video_intro: string | null;
    link_fb_page: string | null;
    link_fb_group: string | null;
    status: boolean;
    promotion: {
      from_date: string | null;
      to_date: string | null;
      type: string;
      hour: number;
    };
    cart_category_id: string | null;
    level: string;
    created_at: string;
    updated_at: string;
    banner: string | null;
    image?: string;
    time_course: {
      opening_date: string | null;
      closing_date: string | null;
    };
    highlightInformations: any[];
    includes: Array<{
      id: number;
      text: string;
      icon: number;
    }>;
    student_owned: number;
    group_chapter?: Array<{ id: number; title: string }>;
  };
  bookAttached: any[];
  bookRelates: any[];
  classroomRelates: any[];
  classroomAttached: any[];
  reviews: any[];
  totalReview: number;
  teacher: {
    _id: string;
    fullname: string;
    avatar: string;
    alias: string;
    description: string;
  };
  top10: any[];
  guideStudy: {
    _id: string;
    name: string;
    description: string;
    setting_name: string;
    setting_value: string;
    group: string;
    created_at: string;
    updated_at: string;
  };
  is_joined: boolean;
  otherClassrooms: any[];
}

// API mới: Danh sách chương và bài học
export interface ClassroomChapterCategoryPayload {
  classroom_id: string;
}

export interface ChapterWithCategories {
  _id: string;
  classroom_id: string;
  chapter: {
    id: string;
    name: string;
  };
  ordering: number;
  created_at: string;
  updated_at: string;
  selected_subject_id: string;
  group_id?: number;
  category: Result[];
}

export const lessonService = {
  getCategories: (
    payload: CategoryListPayload
  ): Promise<{
    data: CategoryListResponse;
    code: number;
  }> => {
    return apiService.post("/category/list", payload);
  },
  getLessonDetail: (
    payload: LessonDetailPayload
  ): Promise<{
    data: LessonDetailResponse;
    code: number;
  }> => {
    return apiService.post("/category/detail", payload);
  },
  // API mới
  getClassroomView: (
    payload: ClassroomViewPayload
  ): Promise<{
    data: ClassroomViewResponse;
    code: number;
    message: string;
  }> => {
    return apiService.post("/classroom-view", payload);
  },
  getClassroomChapterCategory: (
    payload: ClassroomChapterCategoryPayload
  ): Promise<{
    data: ChapterWithCategories[];
    code: number;
    message: string;
  }> => {
    return apiService.post("/classroom-chapter-category", payload);
  },
  getBookIdCourseView: (
    payload: BookIdCourseViewPayload
  ): Promise<{
    data: ClassroomViewResponse;
    code: number;
    message: string;
  }> => {
    return apiService.post("/book-id-course/view", payload);
  },
};

