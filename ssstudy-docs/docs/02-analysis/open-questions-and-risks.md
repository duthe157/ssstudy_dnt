# Open questions and risks – SRS AS-IS SSStudy

## 1. Câu hỏi cần xác nhận

### 1.1 Nghiệp vụ chung
- Các scope permission chi tiết cho role ADMIN/MANAGER/TEACHER/SUPPORTER/STUDENT có đúng với UI thật tế không?
- Các trạng thái order/payment, book-id ownership và blog/content page configuration có được dùng thống nhất trong vận hành không?

### 1.2 Payment / giao dịch

1. Logic áp dụng coupon hiện tại có áp dụng theo điều kiện giá trị đơn hàng, số lượng sản phẩm, loại sản phẩm và thời gian hiệu lực hay không?
2. Trạng thái đơn hàng thực tế trong vận hành có bao gồm các trạng thái nào bên cạnh PENDING / PAID / SUCCESS / CANCELLED?
3. Khi thanh toán bằng PayOS hoặc chuyển khoản, hệ thống có dùng webhook idempotent và kiểm tra trùng lặp không?
4. Quy trình hủy đơn hàng, hoàn tiền và cập nhật lại balance có được xử lý đầy đủ trong source không?
5. Các role admin/manager/supporter có scope chi tiết nào riêng cho order/credit/coupon hay chỉ dùng scope chung?

## 2. Rủi ro / technical debt

### 2.1 Cao
- PayOS webhook và state machine thanh toán chưa có bằng chứng đầy đủ về idempotency, signature và reconciliation.
- Content config lưu dưới dạng JSON string có thể làm tăng khó bảo trì và dễ ghi đè dữ liệu.

### 2.2 Trung bình
- Ownership và expired_date cho book-id/course bundle chưa được xác nhận đầy đủ ở môi trường vận hành.
- Scope permission trên các endpoint admin CRUD cho module 06/07 chưa được suy ra đầy đủ.

### 2.3 Thấp
- Một số endpoint report/link-payment/label chưa có caller frontend rõ ràng và cần xác nhận tiếp.

### 2.1 Coupon rule chưa được làm rõ
- Có by-design điều kiện apply coupon, nhưng phần logic cụ thể chưa được xác minh đầy đủ trong phạm vi này.
- Ghi chú: [CẦN XÁC NHẬT].

### 2.2 State machine thanh toán chưa đủ bằng chứng
- Flow giữa bank transfer, PayOS và SSS balance cần kiểm tra lại để tránh trạng thái không nhất quán giữa DB, UI và email thông báo.
- Ghi chú: [RỦI RO / TECHNICAL DEBT].

### 2.3 Webhook và callback security
- Source có endpoint callback PayOS, nhưng không thấy bằng chứng rõ ràng về kiểm tra signature, verify source, hoặc idempotency.
- Ghi chú: [RỦI RO / TECHNICAL DEBT].

### 2.4 Ownership và authorization
- Cart/order được gắn với req.user, nhưng scope và phân quyền cho admin workflows cần xác minh thêm ở config và UI thực tế.
- Ghi chú: [CẦN XÁC NHẬT].

### 2.5 Một số controller có dấu hiệu code cũ hoặc không nhất quán
- Trong CreditController.update có dấu hiệu tham chiếu biến không tồn tại hoặc code copy-paste cũ, cần kiểm tra lại khi làm refactor.
- Ghi chú: [RỦI RO / TECHNICAL DEBT].

## 3. Khuyến nghị ưu tiên
1. Xác nhận flow coupon và status lifecycle trước khi thay đổi nghiệp vụ.
2. Kiểm tra lại trường hợp callback PayOS và payment method bank transfer để tránh double charge hoặc duplicate access.
3. Bổ sung kiểm thử cho checkout, wallet top-up và order status update.

## 4. Module 08 và endpoint phụ trợ
- Không tạo module 08 riêng trong lần reverse-engineering này vì bằng chứng hiện có còn rải rác ở nhiều controller và route phụ trợ, chưa đủ để đặc tả phạm vi độc lập và đầy đủ.
- Các endpoint còn đang ở mức [CẦN XÁC NHẬN] bao gồm report-bug, link-payment, bill, message, iframe, action-log và label.
- Nếu cần mở rộng SRS về sau, nên tách thành một module phụ trợ riêng chỉ sau khi có frontend caller, workflow nghiệp vụ và entity/domain rõ ràng.
