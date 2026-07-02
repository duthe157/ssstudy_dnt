'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-toastify';
import Breadcrumb from '@/components/ui/breadcrumb';
import { orderService } from '@/services/orderService';
import type { 
  PaymentLinkDetailResponse, 
  CreateOrderPaymentLinkResponse,
  PaymentPayOSResponse 
} from '@/services/orderService';

interface PaymentDetailClientProps {
  paymentId: string;
}

export default function PaymentDetailClient({ paymentId }: PaymentDetailClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const breadcrumbs = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Thanh toán', href: '/thanh-toan' },
  ];

  useEffect(() => {
    if (!paymentId) return;

    if (typeof window !== 'undefined') {
      localStorage.setItem('quick_payment_id', paymentId);
    }

    fetchDetailPayment(paymentId);
  }, [paymentId]);

  const fetchDetailPayment = async (id: string) => {
    const payload = {
      id: id
    };

    try {
      setIsLoading(true);
      const response = await orderService.getPaymentLinkDetail(payload);
      const data = response as unknown as PaymentLinkDetailResponse;
      
      if (data?.code === 200 && data?.data) {
        createOrder(data.data);
      } else {
        toast.error(data?.message || 'Không thể lấy thông tin thanh toán');
      }
    } catch (error) {
      console.error('Error fetching payment detail:', error);
      toast.error('Có lỗi xảy ra khi lấy thông tin thanh toán');
    } finally {
      setIsLoading(false);
    }
  };

  const createOrder = async (params: NonNullable<PaymentLinkDetailResponse['data']>) => {
    try {
      setIsLoading(true);
      const payloadConvert = {
        payment_method: "BANK_PAYOS",
        app: 'Web',
        user_id: params.student.id || params.student._id || '',
        courses: params.courses,
        total: params.total_money
      };

      const response = await orderService.createOrderPaymentLink(payloadConvert);
      const data = response as unknown as CreateOrderPaymentLinkResponse;

      if (data?.code === 200 && data?.data) {
        // console.log('data', data)
        handlePayOSPayment(
          data.data, 
          params.courses, 
          params._id, 
          params.student.id || params.student._id || ''
        );
      } else {
        toast.error(data?.message || 'Không thể tạo đơn hàng');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Có lỗi xảy ra khi tạo đơn hàng');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayOSPayment = async (
    params: NonNullable<CreateOrderPaymentLinkResponse['data']>,
    courses: NonNullable<PaymentLinkDetailResponse['data']>['courses'],
    pId: string,
    uId: string
  ) => {
    const orderId = params._id || params.id || '';

    const newCourses = courses.map((item) => {
      return {
        name: item.name,
        qty: 1,
        price: item.price
      };
    });

    const payload = {
      id: orderId,
      cartItem: newCourses,
      cancelUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/gio-hang/thanh-toan`,
      returnUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/gio-hang/thanh-toan`,
    };

    try {
      setIsLoading(true);
      const response = await orderService.paymentPayOS(payload);
      const data = response as unknown as PaymentPayOSResponse;
      
      if (data?.code === 200 && data?.data) {
        const paymentData = data.data;
        const checkoutUrl = paymentData?.payOS?.checkoutUrl;
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('order_id', orderId);
          localStorage.setItem('current_order_id', orderId);
          localStorage.setItem('payos_order_id', orderId);
          localStorage.setItem('payment_code', paymentData.payment_code || '');
        }
        
        toast.success(data?.message || 'Đang chuyển hướng đến trang thanh toán...', {
          type: 'success',
        });
        
        if (checkoutUrl) {
          setTimeout(() => {
            window.location.href = checkoutUrl;
          }, 2000);
        }
      } else {
        toast.error(data?.message || 'Không thể tạo liên kết thanh toán');
      }
    } catch (error) {
      console.error('Error processing PayOS payment:', error);
      toast.error('Có lỗi xảy ra khi xử lý thanh toán');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center">
        <div className="mb-6 relative drop-shadow-5xl">
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#235CD0] border-r-[#235CD0] animate-spin w-48 h-48 md:w-56 md:h-56 shadow-lg"></div>
          <div className="relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center drop-shadow-xl">
            <Image
              src="/imgs/home/thanh-toan.svg"
              alt="Thanh toán"
              width={200}
              height={200}
              className="w-40 h-40 md:w-48 md:h-48 drop-shadow-lg"
            />
          </div>
        </div>
        <span className="text-[#235CD0] text-lg font-medium drop-shadow-md">
          Đang chuyển hướng đến trang thanh toán !!!
        </span>
      </div>

      <div className="page-payment-detail container mb-16 pt-[100px] lg:pt-[30px] px-[20px]">
        <div className="flex w-full flex-row md:flex-row">
          <Breadcrumb items={breadcrumbs} />
        </div>
        <span className="mt-4 text-[#235CD0] text-lg font-large">
            Đang chuyển hướng ...
        </span>
      </div>
    </>
  );
}

