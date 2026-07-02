# API Luyện Thi Tiến Đạt

## 🚀 HƯỚNG DẪN SETUP MÔI TRƯỜNG DEV

### 📋 Yêu cầu hệ thống
- **Node.js**: v14.19.1 (bắt buộc)
- **Redis**: >= 5.0
- **Git**
- **Kết nối Internet** (để kết nối MongoDB remote)

### 🛠️ Các bước cài đặt

#### 1. Clone dự án và cài đặt dependencies
```bash
# Clone repository
git clone <repository-url>
cd api

# Kiểm tra version Node.js
node -v  # Phải là 14.19.1

# Cài đặt dependencies
npm install
```

#### 2. Cấu hình môi trường

**Tạo file cấu hình từ template:**
```bash
# Copy file cấu hình mẫu
cp config/default.json.example config/default.json
```

**Chỉnh sửa file `config/default.json`:**
```json
{
    "server": {
        "host": "0.0.0.0",
        "port": 4549
    },
    "logs": {
        "level": "debug",
        "handleExceptions": false
    },
    "unauthorization": [
        "/swagger",
        "/favicon.ico",
        "/docs"
    ],
    "redis": {
        "host": "127.0.0.1",
        "port": 6379,
        "password": ""
    },
    "db": {
        "uri": "mongodb://45.124.84.216:27017/ssstudy?retryWrites=false",
        "options": {
            "auth": {
                "user": "admin",
                "password": "@kythuat123@"
            },
            "autoIndex": false,
            "reconnectTries": 50,
            "reconnectInterval": 500,
            "poolSize": 10,
            "bufferMaxEntries": 0,
            "useNewUrlParser": true
        }
    }
}
```

#### 3. Cấu hình MongoDB

**Database Remote:**
- Dự án sử dụng MongoDB server remote tại: `45.124.84.216:27017`
- Database: `ssstudy`
- Credentials đã được cấu hình sẵn trong config

**Kiểm tra kết nối:**
```bash
# Kết nối MongoDB remote (tùy chọn)
mongosh "mongodb://admin:@kythuat123@@45.124.84.216:27017/ssstudy"

# Kiểm tra database
show dbs
use ssstudy
show collections
```

> **Lưu ý:** Không cần cài đặt MongoDB local vì dự án sử dụng database server remote.

#### 4. Cài đặt và cấu hình Redis

**Cài đặt Redis:**
- Windows: Sử dụng [Redis for Windows](https://github.com/microsoftarchive/redis/releases)
- Hoặc dùng Docker: `docker run -d -p 6379:6379 redis:alpine`

**Kiểm tra Redis:**
```bash
redis-cli ping
# Kết quả: PONG
```

#### 5. Chạy ứng dụng

**Môi trường Development:**
```bash
# Chạy với nodemon (auto-reload)
npm start

# Hoặc chạy trực tiếp
node app.js
```

**Kiểm tra ứng dụng:**
- Server sẽ chạy tại: `http://localhost:4549`
- Logs sẽ được ghi vào thư mục `logs/`

#### 6. Cấu trúc dự án chính
```
api/
├── app/
│   ├── controllers/    # API controllers
│   ├── models/        # MongoDB models
│   ├── routes/        # Route definitions
│   ├── services/      # Business logic
│   ├── helpers/       # Utility functions
│   └── languages/     # Multi-language support
├── config/           # Configuration files
├── db/              # Database connection
├── logs/            # Application logs
├── scripts/         # Utility scripts
└── app.js           # Main entry point
```

### 🔧 Scripts có sẵn
- `npm start`: Chạy server với nodemon (development)
- `npm test`: Chạy test cases

### 🚀 Production (với PM2)
```bash
# Cài đặt PM2 globally
npm install -g pm2

# Chạy với PM2
pm2 start ecosystem.config.js

# Monitoring
pm2 monit
```

### 🐛 Troubleshooting

**Lỗi kết nối MongoDB:**
- Kiểm tra kết nối internet
- Xác nhận server remote `45.124.84.216:27017` có thể truy cập
- Kiểm tra credentials trong config
- Kiểm tra firewall/port 27017

**Lỗi kết nối Redis:**
- Kiểm tra Redis service đã chạy
- Xác nhận port 6379 available
- Thử `redis-cli ping`

**Lỗi Node.js version:**
```bash
# Sử dụng nvm để switch version
nvm install 14.19.1
nvm use 14.19.1
```

### 📝 Lưu ý quan trọng
1. **Node.js phải đúng version 14.19.1**
2. File `config/default.json` không được commit (có trong .gitignore)
3. Thư mục `logs/` sẽ được tạo tự động
4. **MongoDB sử dụng server remote** - không cần cài MongoDB local
5. Đảm bảo Redis đã chạy trước khi start server
6. Port mặc định: 4549 (có thể thay đổi trong config)

### 📄 License
ISC

### 👨‍💻 Author
Luyen Thi Tien Dat

