import { apiService } from './api';

export interface CreateOrderPayload {
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  payment_method: 'COD' | 'BANK' | 'DIRECTLY' | string;
  user_id: string;
  app: 'Web' | string;
}

export interface CreateOrderResponse {
  code: number;
  message?: string;
  data?: {
    id?: string;
    order_id?: string;
  } & Record<string, any>;
}

export interface PaymentInfoResponse {
  code: number;
  message?: string;
  data?: {
    id?: string;
    order_id?: string;
    order_code?: string;
    amount?: number;
    payment_method?: string;
    payment_method_label?: string;
    status?: string | number;
    status_text?: string;
  } & Record<string, any>;
}

export interface Course {
  name: string;
  price: number;
  id?: string;
  _id?: string;
}

export interface Student {
  id: string;
  _id?: string;
  name?: string;
  email?: string;
}

export interface PaymentLinkDetailResponse {
  code: number;
  message?: string;
  data?: {
    _id: string;
    student: Student;
    courses: Course[];
    total_money: number;
  };
}

export interface CreateOrderPaymentLinkPayload {
  payment_method: string;
  app: string;
  user_id: string;
  courses: Course[];
  total: number;
}

export interface CreateOrderPaymentLinkResponse {
  code: number;
  message?: string;
  data?: {
    _id: string;
    id?: string;
  } & Record<string, any>;
}

export interface PaymentPayOSPayload {
  id: string;
  cartItem: Array<{
    name: string;
    qty: number;
    price: number;
  }>;
  cancelUrl: string;
  returnUrl: string;
}

export interface PaymentPayOSResponse {
  code: number;
  message?: string;
  data?: {
    payment_code: string;
    payOS: {
      checkoutUrl: string;
    };
  };
}

export interface UpdatePaymentLinkStatusPayload {
  id: string;
  status: 'PAID' | 'PENDING' | 'CANCELLED';
}

export const orderService = {
  create: (payload: CreateOrderPayload) => {
    return apiService.post<CreateOrderResponse>('/order/create', payload);
  },
  paymentInfo: (payload: { id: string }) => {
    return apiService.post<PaymentInfoResponse>('/order/payment-info', payload);
  },
  paymentPayOS: (payload: PaymentPayOSPayload) => {
    return apiService.post<PaymentPayOSResponse>('/order/payment_payos', payload);
  },
  payosDetailOrder: (payload: { id: string; orderId: string }) => {
    return apiService.post<any>('/order/payos_detail_order', payload);
  },
  payosUpdateOrder: (payload: { id: string; orderId: string }) => {
    return apiService.post<any>('/order/payos_update_order', payload);
  },
  payosHook: (payload: { code: string; amount: number }) => {
    return apiService.post<any>('/credit/payos_hook', payload);
  },
  getPaymentLinkDetail: (payload: { id: string }) => {
    return apiService.post<PaymentLinkDetailResponse>('/link-payment/detail', payload);
  },
  createOrderPaymentLink: (payload: CreateOrderPaymentLinkPayload) => {
    return apiService.post<CreateOrderPaymentLinkResponse>('/order/create_order_paymentLink', payload);
  },
  updatePaymentLinkStatus: (payload: UpdatePaymentLinkStatusPayload) => {
    return apiService.post<any>('/link-payment/update-status', payload);
  },
};


