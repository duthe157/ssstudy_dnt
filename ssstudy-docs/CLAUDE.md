# CLAUDE.md — Quy chuẩn kỹ thuật toàn cục cho SSStudy

## 1. Mục tiêu kỹ thuật
- Xây dựng lại hệ thống SSStudy theo dạng mục tiêu, cho AI Agent và developer có thể code từ đầu.
- Giữ nguyên nghiệp vụ từ hệ thống luyện thi đại học và bổ sung các quy tắc bắt buộc.
- Tách rõ layer, module, convention và dependency.

## 2. Ngôn ngữ, framework và stack mục tiêu
- Ngôn ngữ backend: Node.js hoặc TypeScript (khuyến nghị target).
- Framework backend: Express hoặc tương đương, theo kiến trúc module monolith.
- Frontend: React/Next.js cho web user và web admin.
- Database mục tiêu: PostgreSQL cho transactional domain; MongoDB có thể giữ cho content/document nếu dùng kiến trúc hybrid.
- Khuyến nghị: sử dụng ORM/Query Builder tiêu chuẩn (TypeORM/Prisma/Sequelize/Gedung data layer) theo `architecture.md`.

## 3. Quy ước naming
- API route: `GET /api/v1/...`, `POST /api/v1/...`.
- Biến môi trường: `UPPER_SNAKE_CASE`.
- Entity model: PascalCase (ví dụ `User`, `OrderItem`).
- API DTO: camelCase (ví dụ `userId`, `orderId`).
- File/folder: kebab-case (ví dụ `order-cart-payment`, `book-book-id`).
- Rule ID: `BR-MODULE-###`.

## 4. Quy ước folder/module
- Backend: `src/modules/{module}/controller`, `service`, `repository`, `dto`, `validation`.
- Shared: `src/shared/auth`, `src/shared/error`, `src/shared/logging`, `src/shared/config`, `src/shared/utils`.
- Frontend: `src/components`, `src/pages`, `src/services`, `src/store`, `src/shared`.

## 5. Quy ước API response
- Thành công: `200` hoặc `201` cùng payload `{ data: ..., meta?: ..., message?: ... }`.
- Lỗi client: `400`, `401`, `403`, `404`, `422` cùng payload `{ error: { code: string, message: string, details?: any } }`.
- Lỗi server: `500` cùng payload tương tự.
- Không trả raw stack trace ra client.

## 6. Quy ước error handling
- Backend chỉ throw custom error loại `ApiError`.
- ApiError chứa `statusCode`, `code`, `message`, `details`.
- Global error middleware chuyển thành response chuẩn.
- Validation error trả `422`.

## 7. Quy ước validation
- Validation backend luôn có trước validation frontend.
- Dùng schema validation cho request body/params/query.
- Không tin dữ liệu từ client.
- Giá, quyền, trạng thái kiểm tra backend.

## 8. Quy ước authentication/authorization
- Sử dụng token JWT hoặc session bảo mật.
- Mỗi API backend phải kiểm tra permission.
- Role: `student`, `admin`, `superAdmin`, `financialAdmin` nếu cần.
- Không tin permission từ client.

## 9. Quy ước database
- Giao dịch mạnh nên dùng PostgreSQL cho transactional domain.
- MongoDB chỉ dùng nếu cần mô hình document linh hoạt cho content/document.
- Repository layer chịu trách nhiệm truy cập DB.
- Không truy cập DB trực tiếp từ controller.
- Không dùng query builder/ORM không rõ nguồn.

## 10. Quy ước transaction
- Một use case transaction cần transactional boundary rõ.
- Payment/order phải chạy trong transaction nếu sử dụng RDBMS.
- Nếu dùng hybrid, cần đảm bảo dual-write/dual-read và reconciliation.

## 11. Quy ước logging/audit
- Backend log đủ request, response summary, error và transaction important.
- Audit log cho payment callback, grant access, update order state.
- Không log thông tin nhạy cảm như password, secret, payment card.

## 12. Quy ước upload/file storage
- Upload file phải validate loại file và kích thước.
- Chỉ lưu đường dẫn file, không lưu nội dung nhị phân trong DB.
- Có cơ chế xóa/cleanup khi tài liệu bị xoá/ẩn.

## 13. Quy ước payment/webhook
- Webhook phải xác thực nguồn.
- Payment callback phải idempotent.
- Không cập nhật status order nếu callback không hợp lệ.
- Không tin giá từ client.

## 14. Quy ước testing
- Backend có unit test và integration test cho module core.
- Frontend có test component/service cơ bản.
- Payment/webhook có test case trạng thái.

## 15. Quy ước security
- Không hard-code secret.
- CORS giới hạn origin hợp lý.
- Kiểm tra input/SQL injection/XSS.
- Bảo mật token.
- Không expose internal stack trace.

## 16. Quy ước migration từ legacy
- Legacy code chỉ tham khảo.
- Mapping chỉ dùng khi rõ nghiệp vụ.
- Không copy nguyên mã cũ vào code mới.
- Nếu dùng MongoDB hiện trạng, phải ghi rõ làm legacy reference.

## 17. Những điều tuyệt đối không được làm
- Không dùng source code cũ làm source of truth chính.
- Không tạo API không có trong SRS target.
- Không mở rộng nghiệp vụ vượt business-rules mà không ghi `Đề xuất nghiệp vụ mục tiêu`.
- Không lưu secret trong repo.
- Không bỏ qua permission backend.
- Không dùng database legacy nếu không có lý do rõ ràng.
- Không import ghi đè dữ liệu nếu chưa có rule rõ.
- Không export dữ liệu nhạy cảm nếu thiếu permission.
- Scheduler phải idempotent.
- Integration phải có log và retry policy.
