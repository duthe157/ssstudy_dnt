# AGENTS.md — Hướng dẫn làm việc cho AI Agent trên SSStudy

## 1. Thứ tự đọc tài liệu bắt buộc

Bất kỳ AI Agent hoặc developer nào thực hiện code SSStudy phải đọc theo thứ tự sau:

1. `AGENTS.md` — file này, quy trình và giới hạn của AI Agent
2. `CLAUDE.md` — chuẩn kỹ thuật, convention, error contract
3. `docs/business-rules.md` — quy tắc nghiệp vụ cốt lõi với mã BR-*
4. `docs/architecture.md` — ranh giới module, dependency rules, kiến trúc layer
5. `docs/01-srs/modules/` — SRS chi tiết từng module (nguồn chân lý cho use case, API, domain model)
6. `docs/02-infrastructure/` — hạ tầng mục tiêu và hướng dẫn triển khai

**Lưu ý quan trọng:**
- Source code cũ (api-develop, web-admin, web-ssstudy) không phải nguồn chân lý.
- Không tham chiếu source code cũ để quyết định nghiệp vụ hoặc kiến trúc.
- Khi tài liệu này xung đột với source code cũ, tài liệu này thắng.

---

## 2. Quy tắc giải quyết xung đột

| Khi xung đột giữa... | Ưu tiên theo... |
|---|---|
| Nghiệp vụ (business rule) | `docs/business-rules.md` |
| Kiến trúc, dependency, module boundary | `docs/architecture.md` |
| Convention kỹ thuật, error format, naming | `CLAUDE.md` |
| Chi tiết use case, API, domain model | `docs/01-srs/modules/` tương ứng |
| Hạ tầng, môi trường, database | `docs/02-infrastructure/` |

---

## 3. Quy trình làm việc khi code một chức năng

1. Xác định module và chức năng từ `docs/01-srs/modules/`.
2. Đọc business rule liên quan từ `docs/business-rules.md`.
3. Đọc kiến trúc và dependency rule từ `docs/architecture.md`.
4. Xác định use case, user story, acceptance criteria.
5. Xác định API đề xuất, màn hình đề xuất và domain model.
6. Lập kế hoạch triển khai trước khi code.
7. Code theo chuẩn kỹ thuật trong `CLAUDE.md`.
8. Kiểm tra acceptance criteria sau khi code.
9. Cập nhật tài liệu nếu phát sinh thay đổi nghiệp vụ (không tự ý thay đổi, phải ghi rõ).

---

## 4. Danh sách module SRS (nguồn chân lý)

| Số thứ tự | File | Module |
|---|---|---|
| 00 | `docs/01-srs/modules/00-module-specification-plan.md` | Kế hoạch tổng thể 8 module |
| 01 | `docs/01-srs/modules/01-authentication-tai-khoan-phan-quyen.md` | Xác thực, tài khoản, phân quyền |
| 02 | `docs/01-srs/modules/02-classroom-khoa-hoc.md` | Khóa học, chương, thành viên |
| 03 | `docs/01-srs/modules/03-document-tai-lieu.md` | Tài liệu, danh mục, quyền truy cập |
| 04 | `docs/01-srs/modules/04-exam-testing.md` | Đề thi, câu hỏi, làm bài, kết quả |
| 05 | `docs/01-srs/modules/05-order-cart-payment.md` | Giỏ hàng, đơn hàng, thanh toán |
| 06 | `docs/01-srs/modules/06-content-pages-configuration.md` | Blog, nội dung tĩnh, cấu hình |
| 07 | `docs/01-srs/modules/07-book-book-id.md` | Sách, mã kích hoạt, bundle |
| 08 | `docs/01-srs/modules/08-reporting-import-export-integration-scheduler.md` | Báo cáo, import/export, job, tích hợp |

---

## 5. Những việc AI Agent không được làm

### Về nghiệp vụ
- Không tự thay đổi business rule hoặc thêm trạng thái ngoài `business-rules.md`.
- Không tạo API, màn hình hoặc chức năng không có trong SRS module.
- Không mở rộng phạm vi nghiệp vụ mà không ghi rõ "Đề xuất nghiệp vụ mới".
- Không dùng source code cũ để quyết định logic nghiệp vụ.

### Về bảo mật và dữ liệu
- Không bỏ qua kiểm tra permission ở backend.
- Không trust dữ liệu giá, điểm, quyền từ client.
- Không hard-code secret, key, password.
- Không export dữ liệu nhạy cảm khi thiếu permission.
- Không import ghi đè dữ liệu khi chưa có rule rõ ràng.

### Về kiến trúc
- Không gọi DB trực tiếp từ controller.
- Không đặt business rule ở frontend.
- Không tạo dependency vòng giữa các module.
- Không copy code từ source cũ mà không hiểu logic.

### Về thanh toán và job
- Không cập nhật trạng thái order/payment khi callback không hợp lệ.
- Scheduler phải idempotent.
- Integration phải có log và retry policy.

---

## 6. Checklist trước khi tạo pull request

- [ ] Đúng module và use case SRS.
- [ ] Áp dụng đúng business rule (tham chiếu mã BR-*).
- [ ] Permission backend đã kiểm tra.
- [ ] Validation request đã thực hiện ở backend.
- [ ] Error handling theo chuẩn `CLAUDE.md`.
- [ ] Có test case cho chức năng chính.
- [ ] Không lộ secret trong code hoặc log.
- [ ] Không phá vỡ dependency hoặc layering.
- [ ] Audit log cho hành động quan trọng (thanh toán, cấp quyền).

---

## 7. Cách xử lý khi tài liệu chưa đủ

Nếu gặp trường hợp SRS chưa mô tả đủ:
1. Ghi rõ câu hỏi cần xác nhận trong phần "Câu hỏi cần xác nhận" của module SRS tương ứng.
2. Đề xuất giải pháp dựa trên business rule gần nhất và kiến trúc hiện tại.
3. Không tự quyết định nghiệp vụ chưa được xác nhận.
4. Ưu tiên giải pháp an toàn và bảo thủ hơn là mở rộng.
