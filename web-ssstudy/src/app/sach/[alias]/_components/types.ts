// types.ts - Định nghĩa các kiểu dữ liệu cho Book Detail

export interface BreadcrumbItem {
  label: string;
  url?: string;
}

export interface Teacher {
  id: string;
  name: string;
  avatar?: string;
  url: string;
  bio?: string;
}

export interface RelatedCourse {
  id: string;
  name: string;
  thumbnail: string;
  url: string;
  price?: number;
  oldPrice?: number;
}

export interface BookStats {
  lastUpdate: string; // ISO date string
  studentCount?: number;
  rating?: number;
  reviewCount?: number;
}

export interface BookHighlight {
  id: string;
  icon: string; // icon name hoặc emoji
  title: string;
  description: string;
}

export interface IncludedItem {
  id: string;
  icon: string;
  text: string;
}

export interface Gift {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
}

export interface Promotion {
  discountPercent: number;
  countdownEnd: string; // ISO date string
  note: string;
  type?: string; // e.g., BY_HOUR, BY_DATE_RANGE
  hour?: number; // for BY_HOUR
  fromDate?: string;
  toDate?: string;
}

export interface TabContent {
  introduction: string; // HTML content
  teacherInfo: string; // HTML content
  reviews: Review[];
}

export interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
}

export interface BookDetailData {
  // Thông tin cơ bản (có sẵn từ API)
  id: string;
  name: string;
  alias: string;
  thumbnail: string;
  price: number;
  oldPrice: number;
  content: string; // HTML

  // Thông tin mở rộng
  shortDescription: string;
  teacher: Teacher;
  relatedCourse?: RelatedCourse;
  stats: BookStats;
  highlights: BookHighlight[];
  includedItems: IncludedItem[];
  gifts: Gift[];
  promotion: Promotion;
  tabContent: TabContent;
  previewLink?: string;
}

export interface BookPurchaseCard {
  image: string;
  originalPrice: number;
  salePrice: number;
  discount: string;
  countdown?: string;
  registrationDeadline?: string;
  includes: any[];
  gifts: {
    title: string;
    items: any[];
  };
  giftAmount?: number; // tổng giá trị quà tặng (đã tính khuyến mại)
  giftItems?: { title: string; href: string; price?: number }[]; // danh sách quà tặng hiển thị
}

export interface RelatedBook {
  id: string;
  title: string;
  teacher: string;
  image: string;
  originalPrice: number;
  salePrice: number;
  alias?: string;
}
