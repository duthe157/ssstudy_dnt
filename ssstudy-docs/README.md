# SSStudy Documentation Set

Giới thiệu
-----------
Bộ tài liệu này là phiên bản SRS mục tiêu để xây dựng lại hệ thống SSStudy từ đầu. `docs/01-srs/modules/` chứa các module SRS chi tiết và là source-of-truth cho việc phát triển mới. Các tài liệu khác hỗ trợ kiến trúc, quy tắc nghiệp vụ và hạ tầng.

Source of truth
---------------
- `AGENTS.md`
- `CLAUDE.md`
- `docs/business-rules.md`
- `docs/architecture.md`
- `docs/01-srs/modules/`
- `docs/03-infrastructure/`

Cấu trúc tài liệu
-----------------
- `AGENTS.md`: quy tắc AI Agent và luồng đọc tài liệu.
- `CLAUDE.md`: chuẩn kỹ thuật, error/response contract, validation and security rules.
- `docs/business-rules.md`: business rule IDs và invariants.
- `docs/architecture.md`: module boundaries, dependency rules and layer constraints.
- `docs/01-srs/modules/`: SRS modules (00–08) with use cases, user stories, API proposals and domain models.
- `docs/03-infrastructure/`: infra recommendations and deployment guidance.

Lưu ý
------
- Không dùng code cũ làm nguồn tạo đặc tả — tài liệu hiện tại là để xây dựng từ đầu.
- Legacy discovery files remain for migration reference only and must not be used as the primary design input.
- Khi thay đổi nghiệp vụ, cập nhật `docs/business-rules.md`, `docs/architecture.md` và module tương ứng.
