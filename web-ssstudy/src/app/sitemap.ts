import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  // URL cơ sở của trang web
  const baseUrl = 'https://ssstudy.vn';
  
  // Danh sách các trang tĩnh
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/khoa-hoc`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    // Thêm các trang khác nếu cần
  ];
  
  // Trong thực tế, bạn có thể fetch danh sách khóa học từ API và thêm vào đây
  // Ví dụ:
  // const courses = await fetchCoursesFromAPI();
  // const coursePages = courses.map(course => ({
  //   url: `${baseUrl}/khoa-hoc/${course.id}`,
  //   lastModified: new Date(course.updatedAt),
  //   changeFrequency: 'weekly',
  //   priority: 0.7,
  // }));
  
  const coursePages = [
    // Ví dụ về trang khóa học
    {
      url: `${baseUrl}/khoa-hoc/1`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/khoa-hoc/2`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];
  
  return [...staticPages, ...coursePages];
} 