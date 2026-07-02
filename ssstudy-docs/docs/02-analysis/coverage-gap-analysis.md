# Coverage gap analysis – SRS AS-IS SSStudy

## 1. Mục đích và phạm vi rà soát
Phân tích này dùng để rà soát mức độ phủ sóng của tài liệu SRS AS-IS hiện có so với các module thực tế đã được chứng minh từ source trong [api-develop](../../api-develop), [web-admin](../../web-admin) và [web-ssstudy](../../web-ssstudy). Mục tiêu là xác định module nào đã đủ bằng chứng để đặc tả, module nào còn thiếu bằng chứng và những vùng chưa được map tới route/API/frontend/entity.

## 2. Module đã đặc tả
- Authentication / tài khoản / phân quyền
- Classroom / khóa học
- Document / tài liệu
- Exam / testing
- Order / cart / payment
- Content pages / blog / configuration
- Book / book-id / course bundle

## 3. Route web-admin chưa map
- Một số route admin như /schedule, /message, /bill-refund, /quick-payments, /report-bug, /iframe vẫn có bằng chứng trong route tree nhưng chưa được gắn vào một module SRS riêng có đủ bằng chứng đầy đủ.
- Các route /settings/home-page, /settings/intro-page, /teachers-team, /admin-ceo có bằng chứng trong content/configuration module nhưng chưa được phân tích sâu toàn bộ ở phạm vi này.

## 4. Route web-ssstudy chưa map
- Route /thong-bao/[id], /lesson, /lesson/[id], /cong-dong và một số route nội dung phụ trợ chưa được đưa vào module SRS riêng vì chưa có bằng chứng đủ để đặc tả một module độc lập.
- Các route /giao-vien, /gioi-thieu và /ban-tin đã được bao phủ trong module content/pages.

## 5. API backend chưa map
- Các endpoint như /page/detail, /link-payment/*, /ceo-page/*, /teachers-team/*, /label/*, /adult-evalution/*, /report-bug/* có bằng chứng nhưng chưa được gắn đầy đủ vào một module SRS hoàn chỉnh.
- Một số endpoint public/admin còn tồn tại trong [api-develop/app/routes/routes.js](../../../../api-develop/app/routes/routes.js) nhưng chưa thấy frontend caller rõ ràng; các trường hợp này được ghi là [CẦN XÁC NHẬN].

## 6. Entity/table chưa thuộc module rõ ràng
- ReportBug, LinkPayments, Billing, Label, LabelItem, SearchHistory, ActionLog có bằng chứng trong code và route nhưng chưa được phân loại vào module SRS riêng đầy đủ.
- Một số entity dùng chung như Classroom, User, Subject, Chapter, Category có thể xuất hiện ở nhiều module, nhưng domain chủ đạo của chúng đã được gắn vào module tương ứng.

## 7. Luồng nghiệp vụ còn thiếu
- Luồng refund / cancellation / balance reconciliation cho order/payment.
- Luồng webhook PayOS và idempotency.
- Luồng quản trị content/admin cho các page tĩnh và teacher team ở mức chi tiết CRUD đầy đủ.
- Luồng reporting / import-export / integration và scheduler chưa đủ bằng chứng để đưa vào module riêng.

## 8. Các phần cần bổ sung vào module cũ
- Module 05 cần bổ sung thêm các điểm [CẦN XÁC NHẬN] về coupon rule, lifecycle trạng thái thanh toán và ownership/authorization chi tiết.
- Module 06 cần bổ sung truy cập admin CRUD và validation file/upload cho content pages nếu có dữ liệu thực tế.
- Module 07 cần bổ sung thêm mapping ownership và lifecycle book-id/bundle nếu có dữ liệu vận hành thực tế.

## 9. Các module độc lập còn lại đề xuất đặc tả
- Reporting / import-export / integrations / schedulers: có bằng chứng ở route và controller nhưng chưa đủ để đặc tả hoàn chỉnh.
- Notification / message / schedule / activity log: có route và controller nhưng chưa đủ bằng chứng để tạo module riêng trong phạm vi này.

## 10. Kết quả coverage cuối
- Coverage nghiệp vụ chính đã được phản ánh cho 7 module có bằng chứng rõ từ backend/frontend.
- Các vùng còn lại chủ yếu là module phụ trợ hoặc chưa đủ bằng chứng để dùng làm module độc lập.
- Tài liệu SRS hiện tại có thể phục vụ cho onboarding, maintenance và QA ở mức AS-IS, với các mốc chưa xác nhận được đánh dấu [CẦN XÁC NHẬN] và [RỦI RO / TECHNICAL DEBT].

## 11. [CẦN XÁC NHẬN]
- Các scope permission chi tiết cho từng role trong module 06 và 07.
- Logic coupon, refund và lifecycle payment của module 05.
- Sự tồn tại và quy tắc vận hành của các endpoint backup/reporting/integration chưa có frontend caller rõ ràng.

## 12. [RỦI RO / TECHNICAL DEBT]
- Module 05 có các điểm rủi ro về webhook PayOS, payment state consistency và ownership/authorization.
- Module 06 có rủi ro về lưu content_configs dưới dạng JSON string và fallback tạo mới/ghi đè dữ liệu khi có nhiều bản ghi.
- Module 07 có rủi ro về logic ownership và expired_date của book-id/course bundle.

## 13. Bảng tổng hợp cuối

| Hạng mục | Tổng số phát hiện | Đã map | Chưa map | Cần xác nhận | Rủi ro cao | Ghi chú |
|---|---:|---:|---:|---:|---:|---|
| Module nghiệp vụ chính có đủ bằng chứng | 7 | 7 | 0 | 3 | 3 | Các module 01-07 đã được đặc tả |
| Module phụ trợ chưa đủ bằng chứng để tách riêng | 1 | 0 | 1 | 1 | 1 | Module 08 không được tạo trong lần này; chỉ ghi nhận các endpoint phụ trợ chưa đủ phạm vi |
| Route web-admin chưa map rõ | 12+ | 7+ | 5+ | 4+ | 2 | Các route /report-bug, /bill, /iframe, /message, /quick-payments chưa được gắn module đầy đủ |
| Route web-ssstudy chưa map rõ | 6+ | 4+ | 2+ | 2+ | 1 | Route thông báo, lesson, cộng đồng và một số route nội dung phụ trợ chưa đủ bằng chứng |
| API backend chưa map tới frontend | 18+ | 12+ | 6+ | 4+ | 2 | Một số endpoint admin/reporting/link-payment chưa có caller frontend rõ ràng |
| Entity/table chưa thuộc module rõ | 8+ | 4+ | 4+ | 4+ | 2 | ReportBug, Billing, LinkPayments, Message, Iframe, ActionLog, Label cần xác nhận |

