# System Inventory

## 1. Công nghệ sử dụng

### api-develop
- Ngôn ngữ: JavaScript/Node.js
- Framework: Express.js
- ORM/DB: Mongoose kết nối MongoDB
- Authentication: JWT-like token và kiểm tra scope bằng middleware riêng
- Tính năng bổ sung: multer cho upload, node-schedule cho scheduler, nodemailer, redis, payOS, OneSignal, AWS SDK, ExcelJS, pdf-parse, docx, mammoth
- Bằng chứng:
  - [api-develop/package.json](../..\api-develop\package.json)
  - [api-develop/app.js](../..\api-develop\app.js)
  - [api-develop/app/routes/CheckToken.js](../..\api-develop\app\routes\CheckToken.js)
  - [api-develop/app/routes/CheckScope.js](../..\api-develop\app\routes\CheckScope.js)
  - [api-develop/db/mongo.js](../..\api-develop\db\mongo.js)

### web-admin
- Ngôn ngữ: JavaScript
- Framework: React 16 + React Router v5
- UI library: Ant Design, Bootstrap, Redux, React-Bootstrap
- HTTP client: axios
- Bằng chứng:
  - [web-admin/package.json](../..\web-admin\package.json)
  - [web-admin/src/App.js](../..\web-admin\src\App.js)
  - [web-admin/src/components/Master.js](../..\web-admin\src\components\Master.js)

### web-ssstudy
- Ngôn ngữ: TypeScript/JavaScript
- Framework: Next.js 16
- UI library: React 19, Tailwind, shadcn/ui-style primitives, Ant Design
- HTTP client: axios via service layer
- Bằng chứng:
  - [web-ssstudy/package.json](../..\web-ssstudy\package.json)
  - [web-ssstudy/src/services/api.ts](../..\web-ssstudy\src\services\api.ts)
  - [web-ssstudy/src/app/auth/signin/page.tsx](../..\web-ssstudy\src\app\auth\signin\page.tsx)

## 2. Cấu trúc source chính

### api-develop
- app/controllers: controller xử lý HTTP
- app/services: service nghiệp vụ
- app/models: schema/model Mongoose
- app/routes: router và middleware auth
- config: cấu hình app, scopes, môi trường
- db: kết nối MongoDB

### web-admin
- src/components: các màn hình và component theo module
- src/redux: actions/reducers cho từng module
- src/routing: PrivateRoute
- src/config: cấu hình base URL

### web-ssstudy
- src/app: routing theo app router Next.js
- src/services: service gọi API cho từng module
- src/config: cấu hình môi trường

## 3. File cấu hình quan trọng
- api-develop/package.json
- api-develop/app.js
- api-develop/config/app.js
- api-develop/config/user_scopes.json
- api-develop/config/config.js.example
- web-admin/src/config/api.js
- web-admin/src/config/config.js.example
- web-admin/src/App.js
- web-ssstudy/src/config/environments/development.ts
- web-ssstudy/src/services/api.ts

## 4. Cách các source kết nối với nhau
- web-admin gọi API backend qua axios, base URL từ [web-admin/src/config/api.js](../..\web-admin\src\config\api.js)
- web-ssstudy gọi API backend qua [web-ssstudy/src/services/api.ts](../..\web-ssstudy\src\services\api.ts)
- api-develop tiếp nhận request thông qua [api-develop/app/routes/routes.js](../..\api-develop\app\routes\routes.js)
- auth được kiểm tra bởi middleware [api-develop/app/routes/CheckToken.js](../..\api-develop\app\routes\CheckToken.js) và [api-develop/app/routes/CheckScope.js](../..\api-develop\app\routes\CheckScope.js)

## 5. Dependency/tích hợp bên ngoài nhận diện được
- MongoDB
- Redis
- PayOS
- OneSignal
- AWS SDK
- Gmail/SMTP qua nodemailer
- Google OAuth
- CDN cho file và ảnh
- OpenAPI provinces (trong web-admin exam-word)

## 6. Thông tin còn thiếu cần xác nhận
- Danh sách role nghiệp vụ đầy đủ và mapping với UI chưa được thể hiện rõ trong source.
- Một số route trong backend có thể không có frontend gọi trực tiếp.
- Một số controller/service có thể có DTO/request-response riêng nhưng không được lưu trong docs hiện tại.
- [CẦN XÁC NHẬN] về logic nghiệp vụ chi tiết của từng module như học tập, thanh toán, phê duyệt và báo cáo.
