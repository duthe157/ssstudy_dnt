import type { Metadata } from 'next';
import PaymentDetailClient from './_components/PaymentDetailClient';
import config from '@/config';

export const metadata: Metadata = {
  title: 'Thanh toán | SSStudy',
  description: 'Trang thanh toán khóa học',
  keywords: 'thanh toán, payment, ssstudy',
  openGraph: {
    title: 'Thanh toán | SSStudy',
    description: 'Trang thanh toán khóa học',
    url: `${config.siteUrl?.replace(/\/$/, '') || 'https://ssstudy.vn'}/thanh-toan`,
    siteName: 'SSStudy',
    locale: 'vi_VN',
    type: 'website',
  },
};

export default async function PaymentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F6FA" }}>
      <PaymentDetailClient paymentId={id} />
    </div>
  );
}

