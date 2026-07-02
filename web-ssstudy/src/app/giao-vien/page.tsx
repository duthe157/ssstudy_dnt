import type { Metadata } from 'next';
import Breadcrumbs from '../../components/ui/breadcrumbs/Breadcrumbs';
import TeacherIntro from '../giao-vien/TeacherIntro';
import TeacherHighlights from '../giao-vien/TeacherHighlights';
import TeacherSidebar from '../giao-vien/TeacherSidebar';
import TeacherList from '../giao-vien/TeacherList';
import EducationalPhilosophy from '../giao-vien/EducationalPhilosophy';
import { TeacherProvider } from '../giao-vien//TeacherContext';


export const metadata: Metadata = {
  title: 'Danh sách khóa học | SSStudy',
  description: 'Khám phá các khóa học chất lượng cao tại SSStudy, nền tảng học tập trực tuyến hàng đầu Việt Nam',
  keywords: 'khóa học, học trực tuyến, ssstudy, danh sách khóa học',
  openGraph: {
    title: 'Danh sách khóa học | SSStudy',
    description: 'Khám phá các khóa học chất lượng cao tại SSStudy, nền tảng học tập trực tuyến hàng đầu Việt Nam',
    url: 'https://ssstudy.vn/khoa-hoc',
    siteName: 'SSStudy',
    locale: 'vi_VN',
    type: 'website',
  },
};

export default function TeacherPage() {

  return (
    <div className="container mx-auto py-8">
      <Breadcrumbs />
      
      <TeacherIntro />

      <TeacherHighlights />
      
      {/* Phần danh sách giáo viên với sidebar và triết lý giáo dục */}
      <TeacherProvider>  
        <div className="max-w-7xl mx-auto px-4 pt-0 pb-0 md:py-10">
          <div className="grid md:grid-cols-5 gap-6">
            <TeacherSidebar />
            <div className="ml-0 md:ml-8 md:col-span-4">
              <TeacherList />
            </div>
          </div>
        </div>
        
        {/* Phần Triết lý giáo dục - full width nhưng vẫn trong TeacherProvider */}
        <EducationalPhilosophy />
      </TeacherProvider>
    </div>
  );
} 