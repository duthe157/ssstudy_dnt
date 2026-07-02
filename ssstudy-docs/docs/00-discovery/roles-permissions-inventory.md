# Roles and Permissions Inventory

## 1. Vai trò được xác định trong backend
Backend định nghĩa các nhóm người dùng trong [api-develop/config/app.js](../..\api-develop\config\app.js):
- ADMIN
- MANAGER
- ACCOUNTANT
- TEACHER
- SUPPORTER
- EDITOR
- STUDENT
- SALE_MANAGER
- SALE_STAFF
- MEDIA
- TRAINING_STAFF

## 2. Quyền chức năng được định nghĩa
Quyền được lưu trong [api-develop/config/user_scopes.json](../..\api-develop\config\user_scopes.json):
- MANAGER: có quyền truy cập rộng cho category, classroom, document, question, registration, setting, testing, message, upload, review, order, classroom_review, classroom_group, coupon, blog, blog_category, page, link_payment, credit, bill, label, user, report_bug
- TEACHER: có scope cho category, chapter, classroom, document, exam, question, review, subject, testing, message, upload, user, bill, report_bug
- SUPPORTER: có scope cho category, chapter, classroom_group, classroom, document, exam, question, review, subject, testing, message, upload, report_bug
- STUDENT: [CẦN XÁC NHẬN] vì file scope không hiển thị đầy đủ ở đầu đọc được

## 3. Nguồn xác định role/permission
- [api-develop/config/app.js](../..\api-develop\config\app.js)
- [api-develop/config/user_scopes.json](../..\api-develop\config\user_scopes.json)
- [api-develop/app/routes/CheckScope.js](../..\api-develop\app\routes\CheckScope.js)

## 4. Màn hình/chức năng áp dụng
- web-admin dùng PrivateRoute và auth state từ [web-admin/src/routing/PrivateRoute.js](../..\web-admin\src\routing\PrivateRoute.js) và [web-admin/src/components/Master.js](../..\web-admin\src\components\Master.js)
- web-ssstudy có auth flow và điều kiện đăng nhập trên [web-ssstudy/src/app/auth/signin/page.tsx](../..\web-ssstudy\src\app\auth\signin\page.tsx) và [web-ssstudy/src/services/authService.ts](../..\web-ssstudy\src\services\authService.ts)

## 5. Các điểm chưa đủ bằng chứng
- Không có file cấu hình role ở frontend admin rõ ràng cho từng route.
- Không thấy UI web-ssstudy phân nhánh theo role phức tạp; phần này chủ yếu là auth state và điều kiện đăng nhập.
- [CẦN XÁC NHẬN] về cách role student/manager/admin được dùng trong từng màn hình và endpoint cụ thể.
