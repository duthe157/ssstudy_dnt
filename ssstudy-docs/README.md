# SSStudy — Bộ tài liệu xây dựng hệ thống

## Giới thiệu

Đây là bộ tài liệu để **xây dựng lại hệ thống SSStudy từ đầu**. Toàn bộ tài liệu mô tả hệ thống cần làm gì, nghiệp vụ hoạt động ra sao và kiến trúc mục tiêu — không mô tả source code cũ.

SSStudy là hệ thống luyện thi đại học gồm: nền tảng học trực tuyến, quản lý khóa học, đề thi, tài liệu, đơn hàng, thanh toán và quản trị nội dung.

---

## Nguồn chân lý (Source of Truth)

| File / Thư mục | Vai trò |
|---|---|
| `AGENTS.md` | Quy trình làm việc và giới hạn của AI Agent |
| `CLAUDE.md` | Quy chuẩn kỹ thuật, convention, error contract |
| `docs/business-rules.md` | Quy tắc nghiệp vụ cốt lõi với mã BR-* |
| `docs/architecture.md` | Ranh giới module, dependency rules, kiến trúc layer |
| `docs/01-srs/modules/` | SRS chi tiết cho 8 module (nguồn chân lý cho use case, API, model) |
| `docs/02-infrastructure/` | Hạ tầng mục tiêu, database, môi trường triển khai |

---

## Thứ tự đọc khuyến nghị

1. `AGENTS.md` — hiểu quy trình và giới hạn trước khi làm bất cứ thứ gì
2. `CLAUDE.md` — nắm chuẩn kỹ thuật, naming, error format
3. `docs/business-rules.md` — hiểu các quy tắc nghiệp vụ bất biến
4. `docs/architecture.md` — hiểu kiến trúc module và dependency
5. `docs/01-srs/modules/00-module-specification-plan.md` — tổng quan 8 module
6. Module SRS tương ứng trong `docs/01-srs/modules/` — chi tiết chức năng cần code
7. `docs/02-infrastructure/` — cấu hình hạ tầng và database

---

## Cấu trúc tài liệu

```
ssstudy-docs/
├── AGENTS.md                          # Hướng dẫn AI Agent
├── CLAUDE.md                          # Chuẩn kỹ thuật
├── README.md                          # File này
└── docs/
    ├── architecture.md                # Kiến trúc mục tiêu
    ├── business-rules.md              # Quy tắc nghiệp vụ (BR-*)
    ├── documentation-index.md         # Mục lục tài liệu
    ├── 01-srs/
    │   └── modules/
    │       ├── 00-module-specification-plan.md
    │       ├── 01-authentication-tai-khoan-phan-quyen.md
    │       ├── 02-classroom-khoa-hoc.md
    │       ├── 03-document-tai-lieu.md
    │       ├── 04-exam-testing.md
    │       ├── 05-order-cart-payment.md
    │       ├── 06-content-pages-configuration.md
    │       ├── 07-book-book-id.md
    │       └── 08-reporting-import-export-integration-scheduler.md
    └── 02-infrastructure/
        ├── infrastructure.md          # Hạ tầng mục tiêu
        └── database-architecture.md   # Kiến trúc database
```

---

## 8 Module SRS

| Số | Module | Mô tả ngắn |
|---|---|---|
| 01 | Authentication | Đăng ký, đăng nhập, token, phân quyền, quản lý tài khoản |
| 02 | Classroom | Khóa học, chương, bài học, membership, tiến độ học |
| 03 | Document | Tài liệu, danh mục, quyền xem, upload |
| 04 | Exam | Đề thi, câu hỏi, lượt làm bài, chấm điểm, kết quả |
| 05 | Order/Payment | Giỏ hàng, đơn hàng, coupon, thanh toán, ví credit |
| 06 | Content/Config | Blog, trang tĩnh, banner, cấu hình hệ thống |
| 07 | Book | Sách, mã kích hoạt, bundle khóa học |
| 08 | Reporting | Báo cáo, import/export, job scheduler, tích hợp ngoài |

---

## Lưu ý quan trọng

- Source code cũ (api-develop, web-admin, web-ssstudy) **không phải nguồn chân lý**.
- Khi thay đổi nghiệp vụ, cập nhật `docs/business-rules.md` và module SRS tương ứng.
- Khi thay đổi kiến trúc, cập nhật `docs/architecture.md`.
- Không cần đọc source code cũ để bắt đầu phát triển.
