export interface Document {
  _id: string;
  name: string;
  code: string;
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
  document_relates: any[];
  classroom_attached: any[];
  student_owned?: number;
}

export interface DocumentListRequest {
  keyword?: string | null;
  level?: string | null;
  subject_id?: string | null;
  group_id?: string | null;
  category_id?: string | null;
  teacher_id?: string | null;
  price?: string | null;
  type?: string | null;
  limit: number;
  page: number;
}

export interface DocumentListResponse {
  data: {
    records: Document[];
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

export interface DocumentTypeItem {
  _id: string;
  name: string;
}

export interface SubjectItem {
  _id: string;
  name: string;
}

export interface DocumentCategory {
  _id: string;
  name: string;
  alias: string;
  sub_categories: DocumentCategory[];
  ordering?: string;
  status?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DocumentCategoryListResponse {
  data: {
    records: DocumentCategory[];
    totalRecord: number;
    perPage: number;
  };
  message: string;
  code: number;
}
