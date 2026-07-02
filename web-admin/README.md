# Admin LuyenThiTienDat

Ứng dụng quản trị viên cho hệ thống luyện thi tiến đạt.

## 📋 Recent Updates

### ✨ **Sub-sections for Manual Sections** (Oct 6, 2025)
- ✅ Thêm phần thi con cho cả manual và upload sections
- ✅ Visual badges phân biệt nguồn gốc (upload/manual)
- ✅ Validation và error handling cải thiện
- 📚 [Chi tiết →](SUBSECTION_MANUAL_GUIDE.md) | [Changelog →](CHANGELOG_SUBSECTIONS.md)

### 📊 **Upload vs Manual Differences** (Oct 6, 2025)
- 🔍 Debug logging cho section types
- 🎨 Visual indicators trong UI
- 📝 [Hướng dẫn →](UPLOAD_VS_MANUAL_DIFFERENCES.md)

## 🔧 Yêu cầu hệ thống

- **Node.js**: phiên bản 16.20.1 (bắt buộc)
- **NPM** hoặc **Yarn** để quản lý package

## 🚀 Hướng dẫn chạy ứng dụng Development

### Bước 1: Kiểm tra phiên bản Node.js

```bash
node -v
```

Kết quả phải là: `v16.20.1`

Nếu chưa đúng phiên bản:
```bash
# Sử dụng nvm để cài đặt Node 16.20.1
nvm install 16.20.1
nvm use 16.20.1
```

### Bước 2: Cài đặt dependencies

```bash
# Sử dụng yarn (khuyến nghị)
yarn install

# Hoặc sử dụng npm
npm install
```

### Bước 3: Cấu hình API cho môi trường Development

File `src/config/config.js` đã được cấu hình sẵn cho development:

```javascript
export const webURL = 'https://dev.luyenthitiendat.vn';
// export const baseURL = 'https://api.luyenthitiendat.vn';  // Production API  
export const baseURL = 'http://localhost:4549';              // Development API
export const imgURL =  'https://media.luyenthitiendat.vn/';
```

**⚠️ Lưu ý:** Đảm bảo Backend API đang chạy trên `http://localhost:4549`

### Bước 4: Chạy ứng dụng

```bash
# Sử dụng yarn
yarn start

# Hoặc sử dụng npm
npm start
```

Ứng dụng sẽ tự động mở trên: `http://localhost:3000`

## 🛠️ Scripts có sẵn

| Script | Mô tả |
|--------|-------|
| `yarn start` | Chạy ứng dụng trong chế độ development |
| `yarn build` | Build ứng dụng cho production |
| `yarn test` | Chạy test cases |

## 📁 Cấu trúc dự án

```
web-admin/
├── src/
│   ├── config/
│   │   ├── config.js      # ⚠️ File cấu hình API chính
│   │   └── api.js         # File setup axios với baseURL
│   ├── components/        # Các React components
│   └── ...
├── package.json           # Dependencies và scripts
└── README.md
```

## 🔍 Troubleshooting

### Lỗi kết nối API
- Kiểm tra Backend có đang chạy trên port 4549 không
- Xác nhận file `src/config/config.js` đã cấu hình đúng baseURL

### Lỗi Node version
- Sử dụng chính xác Node.js 16.20.1
- Xóa `node_modules` và chạy lại `yarn install`

### Lỗi port đã được sử dụng
- Ứng dụng mặc định chạy trên port 3000
- React sẽ tự động đề xuất port khác nếu port bị chiếm

## 🎯 Xác minh setup thành công

1. Ứng dụng chạy trên `http://localhost:3000`
2. Mở Developer Tools (F12) → tab Network
3. Kiểm tra API calls có đang gọi đến `http://localhost:4549` không
4. Console không có lỗi kết nối API

---

**📝 Ghi chú:** Nhớ chuyển lại cấu hình production trước khi deploy!

