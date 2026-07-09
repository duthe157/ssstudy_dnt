# Quy tắc nghiệp vụ chuẩn — SSStudy

## 1. Mục đích tài liệu
Tài liệu này xác định quy tắc nghiệp vụ chuẩn, state machine và invariant bắt buộc mà hệ thống SSStudy phải tuân thủ khi xây dựng từ đầu. Mọi module SRS tham chiếu rule bằng mã `BR-MODULE-###`.

---

## 2. Quy tắc chung toàn hệ thống

| Mã rule | Nội dung | Mức độ |
|---|---|---|
| BR-SYS-001 | Người dùng chỉ được thao tác dữ liệu của mình, trừ admin có permission phù hợp | BẮT BUỘC |
| BR-SYS-002 | Backend phải kiểm tra quyền truy cập cho mọi API endpoint bảo mật | BẮT BUỘC |
| BR-SYS-003 | Không tin giá tiền, điểm số, trạng thái, quyền hạn do client gửi lên | BẮT BUỘC |
| BR-SYS-004 | Mọi payment/webhook phải được xác thực trước khi xử lý | BẮT BUỘC |
| BR-SYS-005 | Không hard-delete dữ liệu nghiệp vụ quan trọng (order, payment, attempt) khi cần audit | BẮT BUỘC |
| BR-SYS-006 | Audit log bắt buộc cho: thanh toán, cấp quyền, thay đổi role, hủy đơn | BẮT BUỘC |

---

## 3. Authentication / Tài khoản / Phân quyền

| Mã rule | Nội dung | Mức độ | Module áp dụng |
|---|---|---|---|
| BR-AUTH-001 | Backend phải kiểm tra access token hợp lệ trước mọi endpoint bảo mật | BẮT BUỘC | Authentication |
| BR-AUTH-002 | User chỉ truy cập hồ sơ và dữ liệu của chính mình, trừ admin | BẮT BUỘC | Authentication |
| BR-AUTH-003 | Email hoặc số điện thoại phải là duy nhất trong hệ thống | BẮT BUỘC | Authentication |
| BR-AUTH-004 | Refresh token phải được thu hồi khi đăng xuất hoặc đổi mật khẩu | BẮT BUỘC | Authentication |
| BR-AUTH-005 | Access token phải ngắn hạn (≤ 15 phút); refresh token có hạn và phải hỗ trợ rotation | BẮT BUỘC | Authentication |
| BR-AUTH-006 | Token đặt lại mật khẩu phải có thời hạn ngắn (≤ 1 giờ) và chỉ dùng một lần | BẮT BUỘC | Authentication |
| BR-AUTH-007 | Khi cập nhật profile, các trường unique (email, phone) phải kiểm tra trùng lặp | BẮT BUỘC | Authentication |
| BR-AUTH-008 | Hành động admin thay đổi tài khoản người dùng phải có audit log | BẮT BUỘC | Authentication |
| BR-AUTH-009 | Tài khoản bị khóa không được đăng nhập; cơ chế mở khóa phải có quy trình rõ | BẮT BUỘC | Authentication |

---

## 4. Classroom / Khóa học

| Mã rule | Nội dung | Mức độ | Module áp dụng |
|---|---|---|---|
| BR-CLS-001 | Khóa học chỉ hiển thị công khai khi ở trạng thái đã xuất bản (published) và đang hoạt động | BẮT BUỘC | Classroom |
| BR-CLS-002 | Học viên chỉ truy cập nội dung khóa học khi có membership hợp lệ (chưa hết hạn) | BẮT BUỘC | Classroom |
| BR-CLS-003 | Membership hết hạn phải tự động chặn quyền truy cập nội dung | BẮT BUỘC | Classroom |
| BR-CLS-004 | Enrollment chỉ được tạo khi đơn hàng thanh toán thành công hoặc admin cấp thủ công | BẮT BUỘC | Classroom |
| BR-CLS-005 | Mỗi học viên chỉ có một enrollment active trên một khóa học tại một thời điểm | BẮT BUỘC | Classroom |
| BR-CLS-006 | Đánh giá (review) phải ở trạng thái approved mới hiển thị công khai | NÊN CÓ | Classroom |

---

## 5. Document / Tài liệu

| Mã rule | Nội dung | Mức độ | Module áp dụng |
|---|---|---|---|
| BR-DOC-001 | Tài liệu public hiển thị với mọi người dùng, kể cả chưa đăng nhập | BẮT BUỘC | Document |
| BR-DOC-002 | Tài liệu PRO chỉ học viên có membership hợp lệ mới được xem hoặc tải | BẮT BUỘC | Document |
| BR-DOC-003 | Tài liệu gắn với khóa học phải kiểm tra membership khóa học trước khi cho truy cập | BẮT BUỘC | Document |
| BR-DOC-004 | Upload file phải kiểm tra loại file (MIME type) và kích thước tối đa | BẮT BUỘC | Document |
| BR-DOC-005 | Khi xóa tài liệu, file vật lý trên storage phải được cleanup | NÊN CÓ | Document |

---

## 6. Exam / Kiểm tra

| Mã rule | Nội dung | Mức độ | Module áp dụng |
|---|---|---|---|
| BR-EXAM-001 | Khi nộp bài, hệ thống phải tính điểm và lưu kết quả ngay — không để pending | BẮT BUỘC | Exam |
| BR-EXAM-002 | Một lượt làm bài (attempt) không thể nộp lại sau khi đã ở trạng thái submitted/scored | BẮT BUỘC | Exam |
| BR-EXAM-003 | Thời gian làm bài phải được kiểm soát phía backend — không chỉ frontend countdown | BẮT BUỘC | Exam |
| BR-EXAM-004 | Đề thi có mật khẩu phải xác thực mật khẩu trước khi cho phép bắt đầu | BẮT BUỘC | Exam |
| BR-EXAM-005 | Kết quả bài làm đã lưu không được phép chỉnh sửa qua API thông thường | BẮT BUỘC | Exam |
| BR-EXAM-006 | Giới hạn số lượt làm bài (nếu cấu hình) phải kiểm tra trước khi tạo attempt mới | NÊN CÓ | Exam |

---

## 7. Order / Giỏ hàng / Thanh toán

| Mã rule | Nội dung | Mức độ | Module áp dụng |
|---|---|---|---|
| BR-ORD-001 | Không tin giá tiền từ client — giá phải tính lại ở backend khi tạo order | BẮT BUỘC | Order/Payment |
| BR-ORD-002 | Giá trong OrderItem phải là giá tại thời điểm mua, không thay đổi theo giá hiện tại | BẮT BUỘC | Order/Payment |
| BR-ORD-003 | Đơn hàng chỉ chuyển sang trạng thái paid sau khi payment được xác nhận hợp lệ | BẮT BUỘC | Order/Payment |
| BR-ORD-004 | Webhook thanh toán phải xác thực chữ ký và xử lý idempotent | BẮT BUỘC | Order/Payment |
| BR-ORD-005 | Coupon phải được xác thực (còn hạn, còn số lần dùng) trước khi áp vào giỏ | BẮT BUỘC | Order/Payment |
| BR-ORD-006 | Sau khi thanh toán thành công, hệ thống phải tự động cấp quyền truy cập sản phẩm | BẮT BUỘC | Order/Payment |
| BR-ORD-007 | Hủy đơn hàng đã thanh toán phải theo quy trình hoàn tiền có kiểm duyệt | BẮT BUỘC | Order/Payment |
| BR-ORD-008 | Số dư ví (credit) phải được cập nhật chính xác qua ledger transaction | BẮT BUỘC | Order/Payment |

---

## 8. Content / Cấu hình

| Mã rule | Nội dung | Mức độ | Module áp dụng |
|---|---|---|---|
| BR-CONTENT-001 | Nội dung (blog, trang tĩnh) chỉ hiển thị công khai khi ở trạng thái published | BẮT BUỘC | Content/Config |
| BR-CONTENT-002 | Cấu hình hệ thống chỉ admin có permission mới được sửa | BẮT BUỘC | Content/Config |

---

## 9. Book / Mã kích hoạt

| Mã rule | Nội dung | Mức độ | Module áp dụng |
|---|---|---|---|
| BR-BOOK-001 | Mã kích hoạt (BookCode) chỉ được sử dụng một lần — kiểm tra trạng thái trước khi activate | BẮT BUỘC | Book |
| BR-BOOK-002 | Khi kích hoạt mã, hệ thống phải cấp enrollment cho các khóa học tương ứng trong bundle | BẮT BUỘC | Book |
| BR-BOOK-003 | Mã hết hạn (theo expiredAt) không được kích hoạt | BẮT BUỘC | Book |

---

## 10. Reporting / Import / Export / Scheduler

| Mã rule | Nội dung | Mức độ | Module áp dụng |
|---|---|---|---|
| BR-RPT-001 | Reporting chỉ đọc dữ liệu, không được sửa dữ liệu nguồn | BẮT BUỘC | Reporting |
| BR-RPT-002 | Export dữ liệu nhạy cảm chỉ thực hiện khi người dùng có permission và đúng phạm vi | BẮT BUỘC | Reporting |
| BR-RPT-003 | Import phải validate template, dữ liệu bắt buộc và ghi log lỗi theo từng dòng | BẮT BUỘC | Reporting |
| BR-RPT-004 | Scheduler phải idempotent — chạy lại không gây ra kết quả sai | BẮT BUỘC | Reporting |
| BR-RPT-005 | Mọi job execution phải ghi log: thời gian bắt đầu, kết thúc, trạng thái, lỗi nếu có | BẮT BUỘC | Reporting |
| BR-RPT-006 | Integration callback/webhook phải có log và cơ chế retry khi thất bại | BẮT BUỘC | Reporting |

---

## 11. State machine tổng hợp

### Trạng thái nội dung (khóa học, tài liệu, blog, sách)

```
draft → published → archived
```

| Chuyển trạng thái | Điều kiện | Actor |
|---|---|---|
| draft → published | Nội dung hoàn chỉnh, admin phê duyệt | Admin |
| published → archived | Ngừng cung cấp | Admin |
| archived → published | Kích hoạt lại | Admin |
| published → draft | Không cho phép — dùng archived | — |

### Trạng thái đơn hàng

```
pending → paid → refunded
pending → cancelled
```

| Chuyển trạng thái | Điều kiện | Actor |
|---|---|---|
| pending → paid | Payment webhook xác nhận thành công | Hệ thống |
| pending → cancelled | Hết thời gian chờ hoặc user hủy | User/Hệ thống |
| paid → refunded | Yêu cầu hoàn tiền được duyệt | Admin |
| paid → cancelled | Không cho phép trực tiếp | — |

### Trạng thái lượt thi (ExamAttempt)

```
in_progress → submitted → scored
```

| Chuyển trạng thái | Điều kiện | Actor |
|---|---|---|
| in_progress → submitted | Nộp bài hoặc hết giờ | User/Hệ thống |
| submitted → scored | Chấm điểm tự động | Hệ thống |
| scored → * | Không cho phép thay đổi | — |

### Trạng thái mã kích hoạt (BookCode)

```
available → activated
available → expired (theo thời gian)
```

---

## 12. Invariant bắt buộc (tóm tắt kiểm tra nhanh)

| Mã rule | Nội dung ngắn gọn | Cần test |
|---|---|---|
| BR-AUTH-001 | Backend phải kiểm tra token/permission | Có |
| BR-AUTH-002 | User chỉ truy cập dữ liệu của mình | Có |
| BR-CLS-002 | Nội dung PRO phải kiểm tra membership | Có |
| BR-EXAM-001 | Nộp bài phải tính điểm và lưu kết quả | Có |
| BR-ORD-001 | Giá phải tính lại ở backend | Có |
| BR-ORD-004 | Webhook payment phải xác thực và idempotent | Có |
| BR-BOOK-001 | Mã kích hoạt chỉ dùng một lần | Có |
| BR-CONTENT-001 | Nội dung chỉ hiển thị khi published | Có |
| BR-RPT-004 | Scheduler phải idempotent | Có |
