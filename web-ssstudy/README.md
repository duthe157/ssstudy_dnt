# SSStudy Web Application

Ứng dụng web học trực tuyến được xây dựng với Next.js, React, TypeScript và Tailwind CSS.

## Tính năng

- **Server-Side Rendering (SSR)**: Cải thiện SEO và tốc độ tải trang
- **Metadata động**: Tối ưu hóa SEO cho từng trang
- **Sitemap và Robots.txt**: Tự động tạo dựa trên các trang có sẵn
- **App Router**: Sử dụng kiến trúc mới của Next.js
- **State Management**: Redux Toolkit và Zustand
- **UI**: Tailwind CSS

## Cài đặt
Node : 18.18.1
```bash

# Clone dự án
git clone [url-repository]

# Di chuyển vào thư mục dự án
cd web-ssstudy

# Cài đặt dependencies
npm install

# Chạy ở môi trường development
npm run dev
```

## Môi trường

Dự án hỗ trợ 3 môi trường:

- Development: `npm run dev`
- Staging: `npm run build:staging && npm run start`
- Production: `npm run build && npm run start`

## SEO

Dự án đã được tối ưu cho SEO với:

- Metadata cho từng trang
- OpenGraph tags 
- Sitemap.xml tự động
- Robots.txt tự động
- Server-side rendering 