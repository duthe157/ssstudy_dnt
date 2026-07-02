# Hướng Dẫn Build và Chạy Project Web Admin

Tài liệu này hướng dẫn cách build project React Admin cho môi trường production, bao gồm chỉnh sửa cấu hình và các bước triển khai.

## 📋 Tổng Quan

Project này là ứng dụng React Admin sử dụng Create React App. Chúng ta sẽ build production build, cấu hình API, và chạy ứng dụng.

## 🔧 Yêu Cầu Hệ Thống

- **Node.js**: 16.20.1 (bắt buộc)
- **NPM**: >= 6.14.0
- Docker (tùy chọn cho containerization)

## 🚀 Hướng Dẫn Build Production

### Bước 1: Chuẩn Bị Môi Trường

```bash
# Kiểm tra Node.js version
node -v  # Phải là v16.20.1

# Nếu cần, cài đặt Node 16.20.1
nvm install 16.20.1
nvm use 16.20.1
```

### Bước 2: Cài Đặt Dependencies

```bash
# Cài đặt dependencies
npm install --legacy-peer-deps

# Hoặc với yarn
yarn install
```

### Bước 3: Chỉnh Sửa Cấu Hình API

**Quan trọng:** Trước khi build, cần chỉnh sửa file cấu hình cho môi trường production.

Mở file `src/config/config.js`:

```javascript
// Thay đổi từ development sang production
export const webURL = 'https://dev.luyenthitiendat.vn';  // Giữ nguyên hoặc thay đổi theo domain
export const baseURL = 'https://api.luyenthitiendat.vn';  // Production API URL
export const imgURL = 'https://media.luyenthitiendat.vn/'; // Giữ nguyên
```

**Lưu ý:**
- `baseURL` phải trỏ đến API production server
- Đảm bảo API server đang chạy và accessible

### Bước 4: Build Production

```bash
# Build ứng dụng
npm run build

# Hoặc với yarn
yarn build
```

Sau khi build thành công, thư mục `build/` sẽ chứa các file production.

### Bước 5: Chạy Production Build

#### Cách 1: Sử dụng serve (Khuyến nghị)

```bash
# Cài đặt serve globally
npm install -g serve

# Chạy trên port 3001
serve -s build -l 3001
```

#### Cách 2: Sử dụng Node.js server đơn giản

Tạo file `server.js` trong root project:

```javascript
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```

Sau đó chạy:

```bash
npm install express
node server.js
```

## 🐳 Build và Chạy với Docker

### Build Docker Image

```bash
# Build image
docker build -t web-admin:latest .

# Chạy container
docker run -p 3001:3001 web-admin:latest
```

### Docker Compose (Tùy chọn)

Tạo file `docker-compose.yml`:

```yaml
version: '3.8'
services:
  web-admin:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
```

Sau đó:

```bash
docker-compose up --build
```

## 🔍 Kiểm Tra Build Thành Công

1. Ứng dụng chạy trên `http://localhost:3001` (hoặc domain production)
2. Mở Developer Tools → Network tab
3. Kiểm tra API calls gọi đến production URL
4. Console không có lỗi kết nối

## 📁 Cấu Trúc Sau Build

```
build/
├── index.html          # File HTML chính
├── static/
│   ├── css/           # CSS files
│   ├── js/            # JavaScript bundles
│   └── media/         # Static assets
├── manifest.json      # PWA manifest
└── robots.txt         # SEO robots file
```

## ⚠️ Lưu Ý Quan Trọng

### Trước Khi Deploy:

1. **Cấu hình API**: Đảm bảo `src/config/config.js` dùng production URLs
2. **Environment Variables**: Nếu dùng env vars, set chúng đúng
3. **Domain**: Cập nhật `webURL` nếu cần

### Sau Khi Build:

1. **Test thoroughly**: Test tất cả features trên production build
2. **API Connectivity**: Đảm bảo API endpoints accessible
3. **Static Assets**: Kiểm tra images, CSS, JS load đúng

### Troubleshooting:

- **Build fails**: Xóa `node_modules` và `npm install` lại
- **API errors**: Kiểm tra network tab và API server logs
- **Blank page**: Kiểm tra console errors, có thể do CORS hoặc API issues

## 🎯 Scripts Build

| Command | Description |
|---------|-------------|
| `npm run build` | Build production bundle |
| `npm start` | Development server |
| `npm test` | Run tests |
| `serve -s build` | Serve production build |

## 📞 Hỗ Trợ

Nếu gặp vấn đề, kiểm tra:
- Node.js version đúng
- Dependencies cài đặt đầy đủ
- API server running
- Network connectivity