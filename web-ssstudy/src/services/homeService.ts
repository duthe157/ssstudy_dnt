import { apiService } from './api';

// Định nghĩa kiểu dữ liệu phản hồi
export interface HomePageResponse {
  data: {
    megaMenuHome?: {
      _id: string;
      name: string;
      list_subjects?: {
        subject_name: string;
        subject_id: string;
        classroom_group_id?: string;
      }[];
    }[];
    banners: {
      id: number;
      title: string;
      imageUrl: string;
      link: string;
    }[];
    featuredProducts: {
      id: number;
      name: string;
      price: number;
      imageUrl: string;
      slug: string;
    }[];
    categories: {
      id: number;
      name: string;
      slug: string;
      imageUrl: string;
    }[];
  };
  code: number;
  message?: string;
}

export interface HomePageData {
  banners: {
    id: number;
    title: string;
    imageUrl: string;
    link: string;
  }[];
  featuredProducts: {
    id: number;
    name: string;
    price: number;
    imageUrl: string;
    slug: string;
  }[];
  categories: {
    id: number;
    name: string;
    slug: string;
    imageUrl: string;
  }[];
}

/**
 * Các hàm liên quan đến dữ liệu trang chủ
 */
export const homeService = {
  /**
   * Lấy dữ liệu cho trang chủ
   * @returns Dữ liệu cho trang chủ bao gồm megaMenuHome, banners, sản phẩm nổi bật, danh mục...
   */
  getHomePageData: () => {
    return apiService.get<HomePageResponse>('/home-page');
  },

  /**
   * Lấy danh sách banner hiển thị trên trang chủ
   * @returns Danh sách banner
   */
  getBanners: () => {
    return apiService.get<{ data: HomePageData['banners']; code: number; }>('/banners');
  },

  /**
   * Lấy danh sách sản phẩm nổi bật
   * @param limit Số lượng sản phẩm tối đa cần lấy
   * @returns Danh sách sản phẩm nổi bật
   */
  getFeaturedProducts: (limit = 8) => {
    return apiService.get<{ data: HomePageData['featuredProducts']; code: number; }>('/featured-products', {
      params: { limit }
    });
  }
}; 