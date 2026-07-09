# AGENTS.md — Quy trình làm việc cho AI Agent trên SSStudy

## 1. Source of truth — thứ tự đọc tài liệu
Bất kỳ AI Agent hay developer nào thực hiện code lại SSStudy phải đọc theo thứ tự sau:
1. `AGENTS.md`
2. `CLAUDE.md`
3. `docs/business-rules.md`
4. `docs/architecture.md`
5. `docs/01-srs/modules/`
6. `docs/03-infrastructure/`
7. `docs/02-analysis/` nếu cần tham chiếu legacy hoặc rủi ro
8. Source code cũ chỉ dùng để tham khảo, không sao chép mù quáng

## 2. Quy tắc khi có xung đột
- `business-rules.md` quyết định nghiệp vụ.
- `architecture.md` quyết định kiến trúc và nơi đặt code.
- `CLAUDE.md` quyết định convention kỹ thuật.
- SRS module target (`docs/01-srs/modules/`) quyết định chi tiết use case và user story.
- Source code cũ chỉ là tham chiếu hiện trạng, không phải chuẩn cuối cùng.

## 3. Quy trình làm việc khi code một chức năng
1. Đọc business rule liên quan.
2. Đọc module SRS target.
3. Xác định use case/user story.
4. Xác định API, màn hình, dữ liệu và permission.
5. Lập plan trước khi code.
6. Code theo `architecture.md` và `CLAUDE.md`.
7. Tự kiểm tra acceptance criteria.
8. Cập nhật tài liệu nếu có thay đổi nghiệp vụ.

## 4. Những việc AI Agent không được làm
- Không tự đổi nghiệp vụ.
- Không tự thêm trạng thái ngoài `business-rules.md`.
- Không bỏ qua permission backend.
- Không import ghi đè dữ liệu nếu chưa có rule rõ.
- Không export dữ liệu nhạy cảm nếu thiếu permission.
- Scheduler phải idempotent.
- Integration phải có log và retry policy.
- Không hard-code secret.
- Không copy code legacy nếu không hiểu.
- Không tạo API/màn hình không có trong SRS hoặc chưa được xác nhận.
- Không sửa dữ liệu/payment/security nếu thiếu test.

## 5. Checklist trước khi tạo pull request
- Đúng module.
- Đúng business rule.
- Đúng permission.
- Có validation frontend/backend.
- Có error handling.
- Có test case.
- Không lộ secret.
- Không phá dependency/layering.
