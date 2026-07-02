export interface Book {
  _id: string;
  name: string;
  code: string;
  book_id?: string;
  alias: string;
  subject: {
    id: string;
    name: string;
  };
  category: {
    id: string;
    name: string;
  };
  external_link?: string;
  demo_link?: string;
  description: string;
  content: string;
  origin_price: number;
  price: number;
  ordering: number;
  level?: string;
  teacher_id: string;
  stock_status: "IN_STOCK" | "OUT_OF_STOCK";
  is_featured: boolean;
  promotion: {
    from_date?: string;
    to_date?: string;
    type: string;
    hour?: number;
  };
  status: boolean;
  quantity: number;
  image?: string;
  created_at: string;
  updated_at: string;
  classroom_relates: any[];
  book_relates: any[];
  classroom_attached: any[];
  bookId_attached?: any[];
  combo_mode?: boolean;
  student_owned?: number;
}

export interface BookListRequest {
  keyword?: string | null;
  level?: string | null;
  subject_id?: string | null;
  group_id?: string | null;
  label_id?: string | null;
  teacher_id?: string | null;
  price?: string | null;
  type?: string | null;
  limit: number;
  page: number;
}

export interface BookListResponse {
  data: {
    records: Book[];
    totalRecord: number;
    perPage: number;
  };
  message: string;
  code: number;
}

export interface TeacherItem {
  _id: string;
  fullname: string;
}

export interface GradeItem {
  _id: string;
  name: string;
}

export interface BookTypeItem {
  _id: string;
  name: string;
}

export interface SubjectItem {
  _id: string;
  name: string;
}
