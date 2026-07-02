// Course Detail API Types

export interface Subject {
  id: string;
  name: string;
}

export interface Exam {
  id: string;
  code: number;
  name: string;
  type: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface ChapterCategory {
  livestreams: any[];
  _id: string;
  name: string;
  alias: string;
  subject: Subject;
  video_link: string | null;
  doc_link: string | null;
  exam_doc_link_1: string | null;
  exam_doc_link_2: string | null;
  total_video_time: number;
  free_finished_at: string | null;
  is_free: boolean;
  ordering: number;
  show_doc_btn: boolean;
  show_exam_btn: boolean;
  show_video_btn: boolean;
  created_at: string;
  updated_at: string;
  exam: Exam | null;
  livestream_btn: boolean;
  classroom_id: string;
  is_done_exam: boolean;
  is_done_video: boolean;
  publish_at: string;
  category: Category;
}

export interface Chapter {
  category: ChapterCategory[];
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
}

export interface ClassroomChapterCategoryResponse {
  data: Chapter[];
  message: string;
  code: number;
}

export interface ClassroomChapterCategoryRequest {
  classroom_id: string;
}

// Subject List API Types
export interface SubjectTeacher {
  id: string;
  name: string;
}

export interface SubjectSupporter {
  id: string;
  name: string;
}

export interface SubjectRecord {
  _id: string;
  name: string;
  alias: string;
  code: string;
  fw_id?: number;
  is_delete: boolean;
  created_at: string;
  updated_at: string;
  is_online: boolean;
  supporter?: SubjectSupporter;
  teacher: SubjectTeacher;
  support_fb_link?: string | null;
  ordering: number;
  status: boolean;
  icon?: string | null;
}

export interface SubjectListData {
  records: SubjectRecord[];
  totalRecord: number;
  perPage: number;
}

export interface SubjectListResponse {
  data: SubjectListData;
  message: string;
  code: number;
}

// Classroom View API Types
export interface ClassroomViewRequest {
  id: string;
  user_id: string;
  user?: any;
}

// Classroom Detail API Types
export interface ClassroomDetailRequest {
  id: string;
}

export interface ClassroomDetailResponse {
  code: number;
  message?: string;
  data?: ClassroomViewData; // Sử dụng cùng structure với ClassroomViewData
}

export interface GroupChapter {
  id: number;
  title: string;
}

export interface AttachedCourse {
  _id: string;
  name?: string;
  title?: string;
  course_name?: string;
  alias: string;
  code: string;
  subject: {
    id: string;
    name: string;
  };
  group: {
    id: string;
    name: string;
  };
  price: number;
  origin_price: number;
  teacher: string;
  teacher_id: string;
  teacher_alias: string;
  num_student: number;
  is_featured: boolean;
  status: boolean;
  created_at: string;
  updated_at: string;
  time_course?: {
    opening_date: string;
    closing_date: string;
  };
  banner?: string;
}

export interface ClassroomViewData {
  classroom: {
    _id: string;
    name: string;
    alias: string;
    code: string;
    description: string;
    content: string;
    price: number;
    origin_price: number;
    // API mới: teacher là array, không phải string
    teacher:
      | Array<{
          _id: string;
          alias: string;
          fullname: string;
          avatar?: string;
          profile_pic?: string;
          [key: string]: any;
        }>
      | string; // Giữ string để tương thích ngược
    teacher_id: string;
    teacher_alias?: string;
    subject: {
      id: string;
      name: string;
    };
    group: {
      id: string;
      name: string;
    };
    banner?: string;
    // NEW: optional fields from API for UI integration
    image?: string;
    promotion?: {
      from_date?: string | null;
      to_date?: string | null;
      type?: string;
      hour?: number;
    };
    includes?: Array<{
      id: number | string;
      text: string;
      icon: number;
    }>;
    highlightInformations?: Array<{
      id: number | string;
      text: string;
    }>;
    student_owned?: number;
    time_course?: {
      opening_date: string;
      closing_date: string;
    };
    updated_at: string;
    num_student: number;
    classroom_attached?: AttachedCourse[];
    // Các trường mới từ API /classroom/detail
    classroom_relates?: any[];
    book_relates?: any[];
    book_attached?: any[];
  };
  // API mới không có teacher riêng ở data level, nhưng giữ lại để tương thích
  teacher?: {
    _id: string;
    alias: string;
    fullname: string;
    avatar?: string;
  };
  group_chapter?: GroupChapter[];
  // Các trường mới từ API /classroom/detail
  cartCategories?: any[];
  bookAttached?: any[];
  bookRelates?: any[];
  classroomRelates?: any[];
  classroomAttached?: any[];
}

export interface ClassroomViewResponse {
  data: ClassroomViewData;
  message: string;
  code: number;
}

export interface RequestRoomReviewList {
  classroom_id: string;
  keyword?: string;
  page: number;
  limit: number;
  sort_key?: string;
  sort_value?: number;
}

export interface RequestBodyRoomReviewCreate {
  name: string;
  comment: string;
  classroom_id: string;
  rating: number;
  avatar: string;
  status: boolean;
}

export interface DataReivewCourse {
    _id: string;
    name: string;
    comment: string;
    classroom: {
      id: string;
      name: string;
    };
    rating: number;
    avatar: string;
    status: boolean;
    created_at: string;
    updated_at: string;
  }

export interface ResponseReviewWithPaginate{
  records: DataReivewCourse[];
  totalRecord: number;
  perPage: number;
  avgRating: number;
}

export interface ResponseReviewCourse {
  data: ResponseReviewWithPaginate;
  message: "Thành công";
  code: 200;
}
