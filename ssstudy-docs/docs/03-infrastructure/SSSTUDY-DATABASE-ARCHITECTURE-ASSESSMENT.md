# Đánh giá kiến trúc cơ sở dữ liệu SSStudy — Hiện trạng và khuyến nghị

Phiên bản: 0.1
Trạng thái: Hiện trạng (AS-IS) từ source + Khuyến nghị (TARGET)

---

**Tóm tắt nhanh**
- DB hiện tại: MongoDB (Mongoose) — bằng chứng source: [api-develop/package.json](api-develop/package.json), [api-develop/db/mongo.js](api-develop/db/mongo.js), các file cấu hình.
- Khuyến nghị tổng quan: Giữ MongoDB cho các domain nội dung/mô hình tài liệu; áp dụng PostgreSQL cho các domain cần tính nhất quán dữ liệu/giao dịch (order/payment/credit/membership/exam-result) theo chiến lược chuyển dần (strangling + dual-write/dual-read — ghi/đọc hai nơi có kiểm soát).

---

**1. Bằng chứng Hiện trạng (AS-IS) — chỉ ghi nhận từ source**
- Kết nối DB: [api-develop/db/mongo.js](api-develop/db/mongo.js)
- Thư viện Mongoose: [api-develop/package.json](api-develop/package.json)
- Cấu hình chứa Mongo URIs: [api-develop/config/uat.json](api-develop/config/uat.json) và [api-develop/config/config.js.example](api-develop/config/config.js.example)
- Ví dụ model / collection (một số file đã kiểm tra):
  - Users: [api-develop/app/models/User.js](api-develop/app/models/User.js)
  - Orders: [api-develop/app/models/Order.js](api-develop/app/models/Order.js)
  - OrderItem: [api-develop/app/models/OrderItem.js](api-develop/app/models/OrderItem.js)
  - OrderPaymentCode: [api-develop/app/models/OrderPaymentCode.js](api-develop/app/models/OrderPaymentCode.js)
  - StudentClassroom (membership): [api-develop/app/models/StudentClassroom.js](api-develop/app/models/StudentClassroom.js)
  - ExamWord / question catalogs: [api-develop/app/models/ExamWord.js](api-develop/app/models/ExamWord.js)
  - Nhiều model khác nằm trong [api-develop/app/models](api-develop/app/models)

**Hiện trạng — quan sát chính về mô hình dữ liệu**
- Toàn bộ backend sử dụng Mongoose (Schema, Schema.Types.ObjectId, refs và subdocuments). (bằng chứng source: nhiều file trong `app/models`)
- Một số quan hệ được biểu diễn bằng ObjectId refs (tham chiếu giữa các collection MongoDB).
- Một số cấu trúc phức tạp dùng tài liệu nhúng (embedded document) / subdocument lồng nhau (ví dụ `ExamWord` có parts/subparts).
- Một số trường liên quan order/payment lưu `order_id` dưới dạng String (không nhất quán so với ObjectId) — (bằng chứng source: [OrderPaymentCode.js](api-develop/app/models/OrderPaymentCode.js)). [RỦI RO / TECHNICAL DEBT]
- Không thấy framework chuyển đổi dữ liệu (migration) rõ ràng, hướng dẫn backup/restore hoặc chính sách giao dịch (transaction) trong repo. [CẦN XÁC NHẬN] / [RỦI RO / TECHNICAL DEBT]

---

**2. Phân loại domain theo đặc tính dữ liệu (dựa trên bằng chứng source)**
- Domain cần tính nhất quán dữ liệu / giao dịch mạnh (ứng viên cho PostgreSQL):
  - Order / Cart / Payment / Transaction codes (luồng tài chính): [api-develop/app/models/Order.js](api-develop/app/models/Order.js), [api-develop/app/models/OrderItem.js](api-develop/app/models/OrderItem.js), [api-develop/app/models/OrderPaymentCode.js](api-develop/app/models/OrderPaymentCode.js)
  - Credit / Balance ledger (nếu có model credit/transaction-history)
  - Coupon / Luật áp dụng coupon (ưu tiên tính nhất quán khi áp coupon + payment)
  - Classroom membership & access grants (`student_classroom` binding, kiểm tra quyền truy cập): [api-develop/app/models/StudentClassroom.js](api-develop/app/models/StudentClassroom.js)
  - Exam attempt/result/score (nếu cần audit và ACID để finalise điểm)

 - Domain phù hợp mô hình dữ liệu dạng tài liệu (giữ MongoDB):
  - Content / Pages / Blog / Nội dung đa phương tiện (blog, about, ceo page)
  - Metadata tài liệu, upload, bộ đề/câu hỏi có cấu trúc lồng nhau (ExamWord, QuestionWord)
  - Các view đọc denormalized, cache và bộ sưu tập phân tích/aggregation phục vụ read-heavy

---

**3. Nhận xét về sự phù hợp — MongoDB phù hợp ở đâu và hạn chế ở đâu**
- Phù hợp:
  - Nội dung dạng tài liệu: đề thi, câu hỏi, bài học có cấu trúc lồng nhau, payload dạng JSON — MongoDB phù hợp (schema linh hoạt, mảng, tài liệu nhúng) — bằng chứng source: [ExamWord.js](api-develop/app/models/ExamWord.js).
  - Triển khai nhanh/nhanh prototyping: hệ thống hiện đang dùng Mongoose, chi phí chuyển đổi cho nhiều module là cao nếu đổi toàn bộ.

 - Hạn chế / Không phù hợp:
  - Giao dịch trên nhiều document/collection trong các luồng tài chính: dù MongoDB hỗ trợ transactions (tùy phiên bản), RDBMS như PostgreSQL vẫn dễ quản lý ràng buộc quan hệ và truy vấn báo cáo phức tạp.
  - Không có enforcement tương tự foreign-key constraint của RDBMS.
  - Phân tích/bao cáo (analytics/reporting) có nhiều join/aggregation có thể phức tạp nếu mô hình không tối ưu.
  - Không thống nhất kiểu khóa (String vs ObjectId) gây rủi ro tính nhất quán tham chiếu. [RỦI RO / TECHNICAL DEBT]

---

**4. Có nên chuyển sang PostgreSQL?**
- Không khuyến nghị chuyển toàn bộ ngay lập tức: đề xuất kiến trúc hybrid — PostgreSQL cho các domain transactional (order/payment/ledger/membership/score) và giữ MongoDB cho các domain document/content.
- Lý do: PostgreSQL cung cấp ACID, ràng buộc tham chiếu mạnh (referential integrity), khả năng SQL phong phú cho báo cáo; chuyển toàn bộ sẽ tốn kém và rủi ro cho các domain đang tận dụng tính linh hoạt của MongoDB.

---

**5. Chiến lược chuyển đổi dữ liệu (migration) đề xuất — theo pha**
1) Chuẩn bị & kiểm tra an toàn (bắt buộc):
   - Lập inventory đầy đủ: liệt kê tất cả collection MongoDB, schema, index, cardinality và ước lượng kích thước (nguồn: `api-develop/app/models`).
   - Thêm integration tests / e2e để đảm bảo hành vi hiện tại không bị phá vỡ.
   - Triển khai backup + restore cho MongoDB (snapshot + logical export) và chạy drill kiểm tra.
   - Thêm audit logs / tracing cho luồng thanh toán và đơn hàng.
   - Chuẩn hóa kiểu khóa (ví dụ convert `order_id` sang ObjectId hoặc thống nhất dùng UUID) — [CẦN XÁC NHẬN]

2) Pilot (dual-write/dual-read) cho module nhỏ:
   - Chọn module thí điểm: Order/payment (luồng tối giản: tạo đơn, reserve seat, ghi mã thanh toán).
   - Thiết kế replication dựa trên sự kiện: khi ghi, ghi vào MongoDB hiện tại và phát event để sao chép vào PostgreSQL, hoặc dùng dual-write có idempotency và kiểm soát.
   - Chạy job đối soát (reconciliation) nền để so sánh dữ liệu Mongo vs Postgres cho tập pilot.

3) Giảm dần (progressive strangling):
   - Sau pilot, chuyển dần traffic đọc (read) cho endpoint lịch sử đơn sang read model trên PostgreSQL; giữ write path có kiểm soát.
   - Migrate các domain giao dịch khác (credit, coupon enforcement, membership) tuần tự.

4) Cutover cuối cùng và decommission:
   - Khi reconciliation ổn định và test pass, loại bỏ dual-write cho module hoàn tất và archive collection Mongo tương ứng.

---

**6. Module ưu tiên chuyển trước (dựa trên bằng chứng source)**
- Ưu tiên 1: Order / Payment / Transaction codes (luồng tài chính) — bằng chứng source: [Order.js](api-develop/app/models/Order.js), [OrderPaymentCode.js](api-develop/app/models/OrderPaymentCode.js).
- Ưu tiên 2: Credit / Balance ledger / Refund workflows.
- Ưu tiên 3: Membership / Classroom entitlement checks (`student_classroom`).

**7. Module giữ lại trên MongoDB**
- Content, blog, exam catalogs, bộ câu hỏi lồng nhau, các view đọc denormalized, và cache.

---

**8. Chạy song song MongoDB + PostgreSQL trong giai đoạn chuyển đổi?**
- Có — trong giai đoạn chuyển tiếp cần chạy song song cho các module đang chuyển đổi (dual-write + reconciliation). Thiết kế cần đảm bảo: ghi idempotent, sử dụng mô hình event-sourcing hoặc CDC để replica, job đối soát và audit logs.

---

**9. Ranh giới quyền sở hữu dữ liệu (data ownership) đề xuất**
- Đề xuất ranh giới rõ:
  - PostgreSQL sở hữu: orders, payments, credits, refunds, coupon redemptions, ledger rows, final exam results nếu cần ACID.
  - MongoDB sở hữu: content, document metadata, question bank, session-read caches và các aggregate denormalized.
  - Quyền sở hữu chia sẻ: hồ sơ người dùng (user profile) — cần chọn nguồn chính (canonical) cho `user` (ví dụ canonical user identity in PostgreSQL hoặc giữ trong Mongo và replicate `user_id` sang Postgres). [CẦN XÁC NHẬN]

---

**10. Điều kiện phải hoàn tất trước khi chuyển đổi dữ liệu (checklist)**
- Lập inventory collection + kích thước + ước lượng tăng trưởng dữ liệu.
- Backup + restore cho MongoDB đã được kiểm nghiệm.
- Test giao dịch & e2e cho luồng thanh toán.
- Chiến lược ghi idempotent và công cụ đối soát.
- Giám sát, alerting và metric cho các lỗi đối soát.
- Runbook chuyển đổi và kế hoạch quay lui (rollback) được định nghĩa.

---

**11. Rủi ro khi chuyển đổi, quay lui và cách giảm thiểu**
- Rủi ro:
  - Dữ liệu lệch (divergence) giữa Mongo và Postgres trong quá trình dual-write.
  - Các giả định ẩn trong code (ví dụ dựa vào behavior đặc thù của Mongo như mutation trong mảng) gây chênh lệch ngữ nghĩa.
  - Downtime nếu thực hiện các thao tác migration gây khóa lớn trên schema.
  - Mất dấu vết audit nếu backup/restore chưa sẵn sàng.

 - Biện pháp giảm thiểu:
  - Luôn chạy job đối soát và cảnh báo khi mismatch; giữ window đối soát đủ dài.
  - Dùng chiến lược copy không chặn (logical replication / CDC / ETL nền).
  - Bắt đầu bằng cutover ở chế độ chỉ đọc cho các endpoint không quan trọng.
  - Chuẩn bị rollback: giữ snapshot Mongo và khả năng chuyển routing đọc/ghi về Mongo.

---

**12. Các bước hành động có thể làm ngay**
1. Trích xuất inventory model đầy đủ và kích thước từ `api-develop/app/models` (có thể viết script tự động).
2. Triển khai chính sách backup cho MongoDB và chạy drill khôi phục.
3. Lập kế hoạch pilot cho chuyển đổi `orders` (mapping schema chi tiết và truy vấn đối soát).
4. Thêm integration tests cho payments và membership.

---

**Tags**: [CẦN XÁC NHẬN], [RỦI RO / TECHNICAL DEBT]

