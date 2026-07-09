# SSStudy Documentation Index

Mục đích: hướng dẫn thứ tự đọc và các tài liệu chính để xây dựng hệ thống SSStudy từ đầu. Tất cả nội dung dưới `docs/01-srs/modules/` là source-of-truth cho SRS mục tiêu.

Thứ tự đọc khuyến nghị:
1. `CLAUDE.md` — chuẩn kỹ thuật, error/response contract và naming conventions.
2. `docs/architecture.md` — module boundaries, dependency and layer rules.
3. `docs/business-rules.md` — business rule IDs và invariant (tham chiếu bằng mã BR-... trong modules).
4. `docs/01-srs/SSSTUDY-SRS-TARGET.md` và `docs/01-srs/modules/` — các module SRS mục tiêu (modules 00–08).
5. `docs/03-infrastructure/` — hạ tầng mục tiêu và hướng triển khai.

Tài liệu phụ:
- `README.md` — tổng quan bộ tài liệu và chỉ dẫn sử dụng.
- `AGENTS.md` — quy tắc AI Agent khi chuyển SRS thành code.
- `docs/02-analysis/` and `docs/00-discovery/` — legacy discovery notes only; do not use as source of truth for new design. If migration-specific legacy details are required, check `docs/legacy-notes.md`.

Lưu ý:
- Modules under `docs/01-srs/modules/` must not contain legacy source evidence or controller/service references. If legacy evidence exists, it should be moved to `docs/legacy-notes.md` and marked optional.
- Follow `business-rules.md` and `architecture.md` for rule/architecture decisions.
