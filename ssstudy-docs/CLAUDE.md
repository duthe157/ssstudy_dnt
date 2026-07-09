# CLAUDE.md — Quy chuẩn kỹ thuật toàn cục cho SSStudy

## 1. Mục tiêu tài liệu
Tài liệu này xác định tiêu chuẩn kỹ thuật, convention và quy ước bắt buộc để xây dựng hệ thống SSStudy từ đầu. AI Agent và developer phải tuân thủ khi viết code, thiết kế API và tổ chức codebase.

---

## 2. Stack kỹ thuật mục tiêu

| Thành phần | Công nghệ đề xuất | Ghi chú |
|---|---|---|
| Backend runtime | Node.js (TypeScript khuyến nghị) | Kiến trúc modular monolith |
| Backend framework | Express hoặc tương đương | Module-based organization |
| Frontend người học | Next.js (React) | App Router, SSR/SSG |
| Frontend quản trị | React / Next.js | Admin dashboard |
| Database giao dịch | PostgreSQL | Order, payment, auth, enrollment |
| Database nội dung | MongoDB | Blog, document, exam catalog |
| Cache | Redis | Session, rate limit, cache |
| ORM / Query builder | TypeORM, Prisma hoặc Sequelize | Chọn nhất quán trong dự án |
| File storage | S3-compatible | AWS S3 hoặc tương đương |
| Payment | PayOS | Webhook phải xác thực |
| Email | SMTP / SES / SendGrid | Cấu hình qua môi trường |

---

## 3. Quy ước đặt tên

| Loại | Quy ước | Ví dụ |
|---|---|---|
| API route | `/api/v1/...` | `GET /api/v1/courses` |
| Biến môi trường | `UPPER_SNAKE_CASE` | `DATABASE_URL`, `JWT_SECRET` |
| Model / Entity | PascalCase | `User`, `OrderItem`, `RefreshToken` |
| DTO / Request body field | camelCase | `userId`, `courseId`, `totalAmount` |
| File / Folder | kebab-case | `order-cart-payment`, `auth-service.ts` |
| Mã business rule | `BR-MODULE-###` | `BR-AUTH-001`, `BR-ORDER-001` |
| Mã chức năng SRS | `MODULE-##` | `AUTH-01`, `CLS-03` |
| Mã permission | `MODULE_ACTION` | `COURSE_READ`, `REPORT_EXPORT` |

---

## 4. Tổ chức thư mục backend

```
src/
  modules/
    auth/
      controller/
      service/
      repository/
      dto/
      validation/
    classroom/
      ...
    document/
      ...
    exam/
      ...
    order/
      ...
    content/
      ...
    book/
      ...
    reporting/
      ...
  shared/
    auth/          # middleware xác thực, phân quyền
    error/         # error types, error handler
    logging/       # logger, audit log
    config/        # env config
    utils/         # helper functions
    validation/    # shared validators
```

---

## 5. Tổ chức thư mục frontend

```
src/
  components/      # shared UI components
  pages/ hoặc app/ # Next.js pages/app router
  services/        # API client functions
  store/           # state management
  shared/          # types, constants, utils
```

---

## 6. Quy ước API response

### Response thành công
```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  },
  "message": "Tạo thành công"
}
```

### Response lỗi
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dữ liệu không hợp lệ",
    "details": [
      { "field": "email", "message": "Email không hợp lệ" }
    ]
  }
}
```

### HTTP status codes
| Status | Ý nghĩa |
|---|---|
| 200 | Thành công (GET, PUT, DELETE) |
| 201 | Tạo mới thành công (POST) |
| 400 | Request không hợp lệ |
| 401 | Chưa xác thực |
| 403 | Không có quyền |
| 404 | Không tìm thấy |
| 422 | Validation lỗi |
| 500 | Lỗi server |

---

## 7. Quy ước error handling

- Backend chỉ throw custom error loại `ApiError`.
- `ApiError` chứa: `statusCode`, `code` (string), `message`, `details` (optional).
- Global error middleware chuyển mọi lỗi thành response chuẩn.
- Validation lỗi trả `422` với danh sách field errors.
- Không trả raw stack trace ra client trong production.
- Log đầy đủ lỗi ở server side với context (request ID, user ID).

---

## 8. Quy ước validation

- Backend validation là bắt buộc và phải thực thi trước validation frontend.
- Dùng schema validation (Zod, Joi hoặc class-validator) cho request body/params/query.
- Không tin dữ liệu từ client: giá tiền, điểm số, trạng thái, quyền hạn.
- Các trường nhạy cảm như price, status, permission phải được tính toán ở backend.
- Validation lỗi trả về danh sách lỗi theo field để frontend hiển thị đúng.

---

## 9. Quy ước xác thực và phân quyền

- Sử dụng JWT access token (ngắn hạn, ví dụ 15 phút) và refresh token (dài hạn, opaque, lưu DB).
- Mọi API endpoint bảo mật phải kiểm tra token hợp lệ trước khi xử lý.
- Permission phải kiểm tra ở backend — không chỉ dựa vào frontend guard.
- Ownership rule: user chỉ truy cập dữ liệu của mình trừ admin có permission tương ứng.
- Role tối thiểu: `student`, `teacher`, `admin`, `superAdmin`, `financialAdmin`, `supporter`.
- Refresh token phải hỗ trợ rotation và revocation.

---

## 10. Quy ước database

- Repository layer chịu trách nhiệm toàn bộ tương tác với DB.
- Controller không được gọi DB trực tiếp — phải qua service rồi repository.
- Dùng transaction cho các luồng tài chính (order, payment, credit).
- Không dùng query builder/ORM không rõ nguồn gốc.
- Index các trường thường dùng trong WHERE, ORDER BY, JOIN.
- Không soft-delete tùy tiện — chỉ soft-delete khi có nghiệp vụ rõ ràng.

---

## 11. Quy ước upload và file storage

- Upload file phải validate loại file (MIME type) và kích thước tối đa.
- Chỉ lưu đường dẫn/URL file trong DB, không lưu nội dung nhị phân.
- File upload lên S3-compatible storage, không lưu trên server.
- Dùng presigned URL cho nội dung cần bảo vệ (tài liệu PRO).
- Khi xóa tài liệu, phải cleanup file tương ứng trên storage.

---

## 12. Quy ước payment và webhook

- Webhook payment phải xác thực chữ ký (signature) trước khi xử lý.
- Dùng `idempotencyKey` để chống xử lý trùng webhook.
- Không cập nhật trạng thái order nếu webhook không hợp lệ.
- Không tin giá tiền từ client — tính lại giá ở backend khi tạo order.
- Payment callback phải audit log đầy đủ.
- Hỗ trợ retry cho webhook thất bại.

---

## 13. Quy ước logging và audit

- Log mọi request: method, path, status code, response time, user ID.
- Audit log bắt buộc cho: tạo/hủy order, xử lý payment, cấp/thu hồi quyền, thay đổi role.
- Không log: password, secret, token, dữ liệu thẻ thanh toán.
- Log error phải có: message, stack trace, request context, user ID.
- Sử dụng request ID để trace log xuyên suốt một request.

---

## 14. Quy ước testing

- Mỗi module core phải có unit test cho service layer.
- Luồng thanh toán và webhook phải có integration test.
- Test case phải bao gồm: happy path, validation error, permission error, edge case.
- Không deploy lên production khi test thất bại.

---

## 15. Quy ước bảo mật

- Không hard-code secret, API key, password trong code hoặc config file.
- Secrets lưu trong secrets manager (AWS Secrets Manager, Vault, hoặc env file không commit).
- CORS giới hạn origin theo danh sách trắng — không `*` trên production.
- Rate limiting cho endpoint xác thực và thanh toán.
- Kiểm tra SQL injection, XSS, CSRF.
- Không expose stack trace ra client trên production.
- HTTPS bắt buộc trên mọi môi trường ngoài local.

---

## 16. Những việc tuyệt đối không được làm

- Không dùng source code cũ làm nguồn chân lý về nghiệp vụ.
- Không tạo API không có trong SRS module.
- Không mở rộng nghiệp vụ vượt `business-rules.md` mà không ghi rõ "Đề xuất nghiệp vụ mới".
- Không lưu secret trong repository.
- Không bỏ qua permission check ở backend.
- Không gọi DB trực tiếp từ controller.
- Không tin giá tiền, điểm số, quyền hạn từ client.
- Không xử lý payment webhook mà không xác thực chữ ký.
- Không để scheduler không idempotent.
- Không để integration không có log và retry policy.
