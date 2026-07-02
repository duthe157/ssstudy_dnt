# SSStudy Documentation Set

## Giới thiệu
Tài liệu này được tạo dựa trên việc reverse-engineer các source hiện có của hệ thống SSStudy trong workspace: backend API, frontend quản trị và frontend người dùng/học viên. Mục tiêu là xây dựng bộ tài liệu AS-IS phục vụ bảo trì, onboarding, QA, phân tích tác động và chuẩn bị refactor sau này.

## Phạm vi tài liệu
- Phân tích source hiện có trong các thư mục:
  - api-develop
  - web-admin
  - web-ssstudy
- Chỉ ghi nhận những gì có bằng chứng từ source hiện tại.
- Những nội dung chưa đủ bằng chứng sẽ được đánh dấu bằng nhãn [CẦN XÁC NHẬN].
- Những phần có dấu hiệu không nhất quán, thiếu xử lý hoặc tiềm ẩn lỗi sẽ được đánh dấu bằng nhãn [RỦI RO / TECHNICAL DEBT].

## Danh sách source được phân tích
- Backend/API: api-develop
- Frontend quản trị: web-admin
- Frontend người dùng/học viên: web-ssstudy
- Tài liệu dùng chung: ssstudy-docs

## Quy ước nhãn
- [CẦN XÁC NHẬN]: nội dung chưa đủ bằng chứng từ source hoặc cần xác nhận với người dùng/nghiệp vụ.
- [RỦI RO / TECHNICAL DEBT]: phần code có dấu hiệu trùng lặp, thiếu kiểm tra, không đồng nhất hoặc có khả năng gây lỗi.

## Hướng dẫn cập nhật
- Cập nhật tài liệu sau mỗi lần thay đổi source chính hoặc khi phát hiện module mới.
- Khi bổ sung thông tin, ghi rõ đường dẫn file và thành phần liên quan.
- Nếu có thay đổi endpoint, route, role hoặc workflow, cập nhật cả inventory và SRS liên quan.
- Bộ SRS AS-IS hiện có 7 module đã được đặc tả: auth, classroom, document, exam, order/cart/payment, content/blog/configuration và book/book-id/course bundle.
