# Discovery Summary

## Những gì đã xác định được
- Backend là Express.js chạy trên Node.js với routing tập trung tại [api-develop/app/routes/routes.js](../..\api-develop\app\routes\routes.js).
- Auth middleware thực hiện verify token và scope kiểm soát tại [api-develop/app/routes/CheckToken.js](../..\api-develop\app\routes\CheckToken.js) và [api-develop/app/routes/CheckScope.js](../..\api-develop\app\routes\CheckScope.js).
- web-admin là React 16 + React Router v5 với route chính được định nghĩa trong [web-admin/src/components/Master.js](../..\web-admin\src\components\Master.js).
- web-ssstudy là Next.js 16 với app router và service layer gọi API qua [web-ssstudy/src/services/api.ts](../..\web-ssstudy\src\services\api.ts).
- Các module chính đã nhận diện gồm auth, người dùng, lớp học, tài liệu, đề thi, sách/khóa học, thanh toán, blog và cấu hình hệ thống.

## Danh sách module chính
- Authentication
- User management
- Classroom management
- Learning content and documents
- Exam and testing
- Book and course
- Order and payment
- Blog and content pages
- Configuration and admin content

## Các luồng có thể bắt đầu đặc tả
- Đăng nhập/đăng xuất
- Quản lý lớp học và khóa học
- Quản lý tài liệu và sách
- Thi thử và làm bài kiểm tra
- Thanh toán và đơn hàng
- Quản lý nội dung tĩnh và blog

## Các vùng source chưa đọc đủ hoặc chưa thể kết luận
- Một số controller có thể có logic nghiệp vụ riêng nhưng chưa được đọc đủ toàn bộ.
- Frontend admin có nhiều component lớn; chưa cần thiết phải đọc toàn bộ để lập inventory giai đoạn đầu.
- Một số endpoint backend chưa tìm thấy route/frontend caller rõ ràng.

## Trạng thái Giai đoạn 2
- Đã tạo tài liệu SRS AS-IS tổng quan tại [docs/01-srs/SSSTUDY-SRS-AS-IS.md](../01-srs/SSSTUDY-SRS-AS-IS.md).
- Nội dung tài liệu được xây dựng dựa trên bằng chứng từ source hiện có của [api-develop](../../api-develop), [web-admin](../../web-admin) và [web-ssstudy](../../web-ssstudy).
- Phạm vi đã bao gồm: tổng quan hệ thống, kiến trúc, vai trò và phân quyền, phân hệ nghiệp vụ, luồng nghiệp vụ, mapping UI-API-backend, đối tượng dữ liệu và các rủi ro/technical debt.
- Các nội dung còn chưa đủ bằng chứng được ghi rõ là [CẦN XÁC NHẬN] hoặc [RỦI RO / TECHNICAL DEBT].

## Trạng thái Giai đoạn 3A
- Module đã chọn đặc tả: Authentication / tài khoản / phân quyền.
- File đã tạo: [docs/01-srs/modules/00-module-specification-plan.md](../01-srs/modules/00-module-specification-plan.md) và [docs/01-srs/modules/01-authentication-tai-khoan-phan-quyen.md](../01-srs/modules/01-authentication-tai-khoan-phan-quyen.md).
- Phạm vi đã xác minh: login/signup/google auth/forgot password/profile/update profile/change password/token-scope guard.
- Các luồng đã đặc tả: đăng nhập, đăng ký, đăng nhập Google, khôi phục mật khẩu, xem/cập nhật hồ sơ, đổi mật khẩu, kiểm tra token và scope.
- Các phần cần tiếp tục ở module tiếp theo: classroom/course, document, exam/testing hoặc order/payment.
- Các câu hỏi/rủi ro mới phát hiện: scope cho STUDENT và các role phụ trợ chưa đủ bằng chứng; logout/refresh token chưa thấy rõ; token storage ở cookie/localStorage có thể tạo rủi ro bảo mật.

## Trạng thái Giai đoạn 3B
- Module đã chọn đặc tả: Classroom / khóa học.
- File đã tạo: [docs/01-srs/modules/02-classroom-khoa-hoc.md](../01-srs/modules/02-classroom-khoa-hoc.md).
- Phạm vi đã xác minh: danh sách khóa học công khai, chi tiết khóa học, đánh giá, chương mục, khóa học liên quan và quản trị admin.

## Trạng thái Giai đoạn 3C
- Module đã chọn đặc tả: Document / tài liệu.
- File đã tạo và đã kiểm tra thực chất: [docs/01-srs/modules/03-document-tai-lieu.md](../01-srs/modules/03-document-tai-lieu.md) và [docs/02-analysis/cross-module-dependencies.md](../02-analysis/cross-module-dependencies.md).
- Phạm vi đã xác minh: danh sách tài liệu công khai, chi tiết tài liệu, tài liệu liên quan, CRUD danh mục tài liệu và CRUD tài liệu ở admin, upload/preview PDF, quyền truy cập PRO thông qua classroom membership và scope guard cho admin endpoints.
- Các bổ sung sau kiểm tra thực chất: thêm phần phân quyền public/PRO, mapping frontend/backend, kịch bản kiểm thử, và các điểm [CẦN XÁC NHẬN]/[RỦI RO / TECHNICAL DEBT] liên quan đến cleanup file, whitelist file và public route.

## Trạng thái Giai đoạn 3D
- Module đã chọn đặc tả: Exam / testing.
- File đã tạo: [docs/01-srs/modules/04-exam-testing.md](../01-srs/modules/04-exam-testing.md), [docs/02-analysis/cross-module-dependencies.md](../02-analysis/cross-module-dependencies.md) và [docs/01-srs/modules/00-module-specification-plan.md](../01-srs/modules/00-module-specification-plan.md).
- Phạm vi đã xác minh: danh sách đề thi Word và đề luyện, xem chi tiết đề thi, kiểm tra mật khẩu, nộp bài/chấm điểm, xem kết quả/lời giải, quản trị đề thi Word ở admin, quản trị câu hỏi Word ở admin, quản trị testing/result ở admin và báo cáo điểm.
- Các bổ sung sau kiểm tra thực chất: thêm phần phân quyền public/admin, mapping frontend/backend, kịch bản kiểm thử, và các điểm [CẦN XÁC NHẬN]/[RỦI RO / TECHNICAL DEBT] liên quan đến scope role, practiceConfig và public route security.

## Trạng thái Giai đoạn 3E
- Module đã chọn đặc tả: Order / cart / payment.
- File đã tạo: [docs/01-srs/modules/05-order-cart-payment.md](../01-srs/modules/05-order-cart-payment.md), [docs/02-analysis/coverage-gap-analysis.md](../02-analysis/coverage-gap-analysis.md), [docs/02-analysis/traceability-matrix.md](../02-analysis/traceability-matrix.md) và [docs/02-analysis/open-questions-and-risks.md](../02-analysis/open-questions-and-risks.md).
- Phạm vi đã xác minh: quản lý giỏ hàng, áp dụng coupon, tạo đơn hàng, thanh toán COD / bank transfer / SSS balance / PayOS, lịch sử order và credit, và workflows admin cho order/credit/coupon.
- Các bổ sung sau kiểm tra thực chất: mapping frontend/backend, ma trận truy vết, review coverage gap và các điểm [CẦN XÁC NHẬT]/[RỦI RO / TECHNICAL DEBT] liên quan đến coupon rule, lifecycle thanh toán và callback security.

## Trạng thái Giai đoạn 3F
- Module đã chọn đặc tả: Content pages / blog / configuration.
- File đã tạo: [docs/01-srs/modules/06-content-pages-configuration.md](../01-srs/modules/06-content-pages-configuration.md).
- Phạm vi đã xác minh: blog/list-public, blog/detail, blog-category/list, about/detail, teachers-team/detail, ceo-page/detail và quản trị nội dung tĩnh/giáo viên trên admin.

## Trạng thái Giai đoạn 3G
- Module đã chọn đặc tả: Book / book-id / course bundle.
- File đã tạo: [docs/01-srs/modules/07-book-book-id.md](../01-srs/modules/07-book-book-id.md).
- Phạm vi đã xác minh: book/list, book/detail, book/list-related, book-id/detail, book-id-course/list-owned và quản trị admin cho book/book-id/book-id-course.

## Danh sách câu hỏi nghiệp vụ/kỹ thuật cần xác nhận
- Vai trò student/manager/admin được dùng như thế nào trong UI thật tế?
- Các trạng thái đơn hàng, lớp học và bài kiểm tra có meaning cụ thể nào không?
- Những API nào là public và những API nào cần quyền riêng?
- Có module nào đang dùng endpoint lặp/không dùng không?
- Cần xác nhận dữ liệu đầu vào/validation chi tiết của từng module.
