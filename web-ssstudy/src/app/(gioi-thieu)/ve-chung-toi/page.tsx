import { Metadata } from 'next';
import { Suspense } from 'react';
import MySelfIntroPageClient from './_components/MySelfIntroPageClient';

export const metadata: Metadata = {
  title: 'Giới thiệu | SSStudy',
  description: 'Tìm hiểu thêm về SSStudy',
  keywords: 'giới thiệu, về chúng tôi, ssstudy',
  openGraph: {
    title: 'Giới thiệu | SSStudy',
    description: 'Tìm hiểu thêm về SSStudy',
    url: 'https://ssstudy.vn/gioi-thieu/ve-chung-toi',
    siteName: 'SSStudy',
    locale: 'vi_VN',
    type: 'website',
  },
};

export default function MySelfIntroPage() {
  return (
    <Suspense fallback={<div className="text-center py-8">Đang tải...</div>}>
      <MySelfIntroPageClient />
    </Suspense>
  );
}
