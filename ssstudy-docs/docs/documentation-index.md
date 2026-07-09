# Mục lục tài liệu SSStudy

Đây là mục lục gọn để tra cứu nhanh toàn bộ tài liệu trong `ssstudy-docs`.

---

## Tài liệu nền tảng

| File | Mục đích | Ai nên đọc | Nguồn chân lý | Ghi chú |
|---|---|---|---|---|
| `AGENTS.md` | Quy trình làm việc, giới hạn và checklist cho AI Agent | AI Agent, Developer | Có | Đọc đầu tiên |
| `CLAUDE.md` | Chuẩn kỹ thuật, convention, error contract, naming | AI Agent, Developer | Có | Đọc thứ hai |
| `README.md` | Tổng quan bộ tài liệu, thứ tự đọc, cấu trúc | Mọi thành viên | Tham khảo | |
| `docs/documentation-index.md` | Mục lục này | Mọi thành viên | Không | |

---

## Tài liệu thiết kế hệ thống

| File | Mục đích | Ai nên đọc | Nguồn chân lý | Ghi chú |
|---|---|---|---|---|
| `docs/business-rules.md` | Quy tắc nghiệp vụ cốt lõi với mã BR-* | AI Agent, Developer, BA, QA | Có | Tham chiếu từ mọi module SRS |
| `docs/architecture.md` | Ranh giới module, dependency rules, kiến trúc layer | AI Agent, Developer, Tech Lead | Có | |

---

## SRS Module (nguồn chân lý cho từng module)

| File | Module | Ai nên đọc | Nguồn chân lý |
|---|---|---|---|
| `docs/01-srs/modules/00-module-specification-plan.md` | Kế hoạch tổng thể 8 module | Mọi thành viên | Có |
| `docs/01-srs/modules/01-authentication-tai-khoan-phan-quyen.md` | Xác thực, tài khoản, phân quyền | Developer Auth module | Có |
| `docs/01-srs/modules/02-classroom-khoa-hoc.md` | Khóa học, chương, membership | Developer Classroom module | Có |
| `docs/01-srs/modules/03-document-tai-lieu.md` | Tài liệu, danh mục, quyền xem | Developer Document module | Có |
| `docs/01-srs/modules/04-exam-testing.md` | Đề thi, câu hỏi, lượt làm, kết quả | Developer Exam module | Có |
| `docs/01-srs/modules/05-order-cart-payment.md` | Giỏ hàng, đơn hàng, thanh toán | Developer Order module | Có |
| `docs/01-srs/modules/06-content-pages-configuration.md` | Blog, trang tĩnh, cấu hình | Developer Content module | Có |
| `docs/01-srs/modules/07-book-book-id.md` | Sách, mã kích hoạt, bundle | Developer Book module | Có |
| `docs/01-srs/modules/08-reporting-import-export-integration-scheduler.md` | Báo cáo, import/export, job, tích hợp | Developer Reporting module | Có |

---

## Hạ tầng

| File | Mục đích | Ai nên đọc | Nguồn chân lý |
|---|---|---|---|
| `docs/02-infrastructure/infrastructure.md` | Hạ tầng mục tiêu, môi trường, bảo mật, CI/CD, monitoring | DevOps, Developer | Có |
| `docs/02-infrastructure/database-architecture.md` | Kiến trúc database, domain model, index, migration | Developer, DBA | Có |

---

## Ghi chú

- Tài liệu trong `docs/01-srs/modules/` là nguồn chân lý duy nhất cho việc phát triển từng module.
- Không có thư mục discovery hoặc analysis — hệ thống được xây dựng mới từ đầu theo tài liệu này.
- Khi cập nhật nghiệp vụ: sửa `docs/business-rules.md` và module SRS tương ứng.
- Khi cập nhật kiến trúc: sửa `docs/architecture.md`.
