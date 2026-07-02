// utils.ts - Các hàm tiện ích

/**
 * Format số tiền VNĐ
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

/**
 * Format ngày tháng
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

/**
 * Format số lượng (không format, chỉ hiển thị số)
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString("vi-VN");
};

/**
 * Tính thời gian còn lại (countdown)
 */
export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export const getTimeRemaining = (endDate: string): TimeRemaining => {
  const total = Date.parse(endDate) - Date.now();

  if (total <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
    };
  }

  return {
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / 1000 / 60) % 60),
    seconds: Math.floor((total / 1000) % 60),
    isExpired: false,
  };
};

/**
 * Tạo breadcrumb items
 */
export interface BreadcrumbItem {
  label: string;
  url?: string;
}

export const generateBreadcrumbs = (bookName: string): BreadcrumbItem[] => {
  return [
    { label: "Trang chủ", url: "/" },
    { label: "Sách ID", url: "/sach-id" },
    { label: bookName },  
  ];
};

/**
 * Format date for display: "Cập nhật vào X năm Y"
 */
export const formatUpdateDate = (dateString: string): string => {
  const date = new Date(dateString);
  const month = date.toLocaleDateString("vi-VN", { month: "long" });
  const year = date.getFullYear();
  return `Cập nhật vào ${month} năm ${year}`;
};
