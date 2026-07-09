# SSSTUDY-SRS-TARGET.md

## 1. Thông tin tài liệu
- Tên tài liệu: SSStudy SRS Target
- Phiên bản: 1.0
- Trạng thái: Target specification
- Sử dụng cho: AI Agent, Developer, BA, QA, Technical Lead
- Dựa trên: business-rules.md, architecture.md, legacy source tham khảo trong AS-IS documents.

## 2. Mục tiêu
- Xác định rõ chức năng và giới hạn của hệ thống SSStudy mục tiêu.
- Cung cấp chuẩn cho 8 module nghiệp vụ chính.
- Làm nền tảng cho xây dựng lại hệ thống từ đầu mà không copy code legacy.
- Giữ đúng tính chất học tập, nội dung, đề thi, bán hàng và quản trị.

## 3. Phạm vi tài liệu
Bao gồm:
- Authentication / Account
- Classroom / Course Management
- Learning Content / Document
- Exam / Testing
- Order / Cart / Payment
- Blog / Content Pages / Configuration
- Book / Book ID / Course Bundles
- Shared services: auth, error handling, validation, logging, config, file storage, payment webhook.

Không bao gồm:
- Code implementation legacy.
- Mô tả chi tiết UI ngoài những đường dẫn mục tiêu.
- Timeline triển khai.

## 4. Assumptions
- Backend sử dụng Node.js/TypeScript, kiến trúc module monolith.
- Frontend sử dụng React/Next.js.
- Transactional domain ưu tiên PostgreSQL; content/document có thể dùng MongoDB nếu cần.
- API tuân thủ REST-like design.
- Backend kiểm tra auth và permission cho mọi endpoint bảo mật.
- Mỗi module có service/repository layer.

## 5. Tổng quan hệ thống mục tiêu
- Web user: đăng nhập, xem khóa học, học liệu, làm đề thi, mua gói, xem lịch sử.
- Web admin: quản lý khóa học, tài liệu, đề thi, sách, đơn hàng, người dùng, nội dung tĩnh.
- Backend API: cung cấp dữ liệu, thực thi business rules, xác thực, phân quyền, giao dịch, logging.
- Database: chứa người dùng, classroom, document, exam, order/payment, book/bundle, cấu hình.
- File storage: lưu tài liệu, ảnh, media, file upload.
- Payment provider: xử lý thanh toán và webhook.

## 6. Non-functional requirements
- An toàn: kiểm tra auth/permission, validate input, không leak stack trace.
- Tính nhất quán: response format chuẩn, mã lỗi, pagination/filter.
- Bảo trì: module rõ ràng, shared service, code dễ test.
- Hiệu năng: load list trang, tìm kiếm, pagination.
- Khả năng mở rộng: support add-on module và multiple roles.
- Giám sát: logging request/error, audit payment/event.

## 7. Relationship to architecture and business rules
- `architecture.md` mô tả boundary, module, dependency rules và deployment.
- `business-rules.md` xác định invariant bắt buộc, state machine và rule IDs.
- Tài liệu này cung cấp hướng dẫn thực thi cho từng module.

## 8. Module target documents
- `docs/01-srs/modules/01-authentication-tai-khoan-phan-quyen.md`
- `docs/01-srs/modules/02-classroom-khoa-hoc.md`
- `docs/01-srs/modules/03-document-tai-lieu.md`
- `docs/01-srs/modules/04-exam-testing.md`
- `docs/01-srs/modules/05-order-cart-payment.md`
- `docs/01-srs/modules/06-content-pages-configuration.md`
- `docs/01-srs/modules/07-book-book-id.md`
- `docs/01-srs/modules/08-reporting-import-export-integration-scheduler.md`

## 9. Chú ý khi xây dựng
- Không lấy nghiệp vụ mới nếu không có yêu cầu rõ.
- Giữ module đơn nhiệm.
- Nên có test cho mỗi business rule quan trọng.
- Đề xuất migration strategy nếu giữ lại legacy data.
