import { apiService } from './api';

export interface CartItem {
  _id: string;
  item_id: string;
  user_id: string;
  cart_id: string;
  name: string;
  cart_parent_id: string;
  qty: number;
  type: string;
  price: number;
  origin_price: number;
  note: string;
  is_selected: boolean;
  image: string;
  teacher: string;
}

export interface CartDetailResponse {
  code: number;
  message?: string;
  data: {
    cart_items: CartItem[];
    cart?: {
      discount_total?: number; // server-provided discount total (spelling per API)
      [key: string]: any;
    };
  };
}

export interface CouponItem {
  id: string;
  code: string;
  description?: string;
  discountValue?: number;
  discountType?: 'amount' | 'percent';
  expiresAt?: string;
}

export interface CouponListResponse {
  code: number;
  message?: string;
  data: {
    records: CouponItem[];
    total_records?: number;
  } | CouponItem[];
}

export interface CartCountResponse {
  code: number;
  message?: string;
  data?: { qty?: number } | number;
}

export interface AddCartPayload {
  item_id: string;
  name: string;
  price: number;
  qty: number;
  type: string;
  image: string;
}

export const cartService = {
  getCartDetail: () => {
    return apiService.post<CartDetailResponse>('/cart/detail');
  },

  getCouponList: () => {
    return apiService.post<CouponListResponse>('/coupon-list');
  },

  addToCart: (payload: AddCartPayload) => {
    return apiService.post<any>('/cart/add', payload);
  },

  getCartCount: () => {
    return apiService.post<CartCountResponse>('/cart/count');
  },

  deleteCartItem: (id: string) => {
    return apiService.post<any>('/cart/delete', { id });
  },

  updateCartItem: (payload: {
    id: string;
    item_id: string;
    price: number;
    qty: number;
    type: string;
    is_selected: boolean;
    image: string;
  }) => {
    return apiService.post<any>('/cart/update', payload);
  },

  applyCoupon: (payload: { discount_code: string }) => {
    return apiService.post<any>('/cart/apply-coupon', payload);
  },
};



