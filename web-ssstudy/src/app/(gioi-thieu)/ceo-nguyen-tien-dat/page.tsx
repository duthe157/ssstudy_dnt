import { Metadata } from 'next';
import { Suspense } from 'react';
import CEOIntroPageClient from './_components/CeoIntroPageClient';

export const metadata: Metadata = {
  title: 'CEO Nguyễn Tiến Đạt | SSStudy',
  description: 'Giới thiệu về CEO Nguyễn Tiến Đạt',
  keywords: 'giới thiệu, ceo, nguyễn tiến đạt, ssstudy',
  openGraph: {
    title: 'CEO Nguyễn Tiến Đạt | SSStudy',
    description: 'Giới thiệu về CEO Nguyễn Tiến Đạt',
    url: 'https://ssstudy.vn/gioi-thieu/ceo-nguyen-tien-dat',
    siteName: 'SSStudy',
    locale: 'vi_VN',
    type: 'website',
  },
};

export default function MySelfIntroPage() {
  return (
    <Suspense fallback={<div className="text-center py-8">Đang tải...</div>}>
      <CEOIntroPageClient />
    </Suspense>
  );
}
