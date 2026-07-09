# business-rules.md — Quy tắc nghiệp vụ chuẩn của SSStudy

## 1. Mục đích tài liệu
Tài liệu này xác định quy tắc nghiệp vụ chuẩn, state machine và invariant mà hệ thống SSStudy phải tuân thủ khi xây dựng lại từ đầu.

## 2. Quy tắc chung toàn hệ thống
- Người dùng chỉ thao tác dữ liệu của mình trừ admin.
- Backend luôn kiểm tra quyền, không chỉ frontend.
- Không tin dữ liệu giá/điểm/quyền gửi từ client.
- Mọi payment/webhook phải có kiểm tra tính hợp lệ.
- Mọi dữ liệu quan trọng phải có trạng thái rõ ràng.
- Không xóa cứng dữ liệu nghiệp vụ quan trọng nếu cần audit.

## 3. Authentication / tài khoản / phân quyền
- Người dùng cần đăng ký, đăng nhập mới truy cập học viên.
- Mỗi request cần xác thực nếu là endpoint yêu cầu.
- Role tối thiểu: `student`, `admin`, `superAdmin`, `financialAdmin`.
- Admin chỉ được quản lý nội dung/đơn hàng/người dùng theo permission.
- Reset password nếu có phải xác thực email.
- Ownership rule: user chỉ truy cập dữ liệu của mình trừ admin.

## 4. Classroom / khóa học
- Khóa học/lớp có trạng thái rõ: draft, published, archived.
- Có loại khóa học public/pro/private.
- Enrollment/membership cần kiểm tra quyền và trạng thái học.
- Chỉ người dùng hợp lệ mới truy cập nội dung PRO theo membership.
- Hết hạn học phải chặn quyền học.
- Quy tắc hiển thị: khóa học public / khóa học chưa xuất bản / khóa học đã hết hạn.

## 5. Document / tài liệu
- Tài liệu public hiển thị với khách.
- Tài liệu PRO chỉ người học hợp lệ mới xem/tải.
- Tài liệu theo classroom/course phải kiểm tra membership.
- Upload file phải kiểm tra loại file và size.
- Danh mục tài liệu phải có phân loại rõ.
- Xóa tài liệu nên ẩn trước khi xóa cứng.
- File cleanup khi tài liệu bị xoá.

## 6. Exam / Testing
- Đề thi có cấu trúc: metadata, câu hỏi, thời lượng, điểm.
- Câu hỏi có đáp án đúng và điểm tương ứng.
- Lượt làm bài phải có session/attempt riêng.
- Nộp bài phải tính điểm và lưu kết quả.
- Xem kết quả chỉ khi có permission.
- Làm lại tùy luật: giới hạn lượt hoặc mở lại.
- Thời gian mở/đóng đề phải kiểm soát.
- Chống submit trùng bằng lock hoặc token.
- State machine attempt/result phải rõ.

## 7. Order / Cart / Payment
- Giỏ hàng giữ sản phẩm trước khi thanh toán.
- Đơn hàng có trạng thái: pending, paid, cancelled, refunded.
- Coupon phải xác thực trước khi áp.
- Credit/wallet nếu dùng phải cập nhật chính xác.
- Payment callback/webhook phải idempotent.
- Không tin giá từ client.
- Sau thanh toán cấp quyền tương ứng.
- Hoàn tiền/hủy đơn phải có quy trình.
- State machine order/payment phải xác định.

## 8. Content pages / configuration
- Banner, landing page, blog, cấu hình website.
- SEO/meta nếu cần.
- Publish/draft/hide để điều khiển nội dung.

## 9. Book / Book ID / Course bundle
- Quản lý sách.
- Mã kích hoạt sách/book ID.
- Gói bundle khóa học.
- Kích hoạt quyền học bằng mã sách.
- Chống reuse mã.
- Theo dõi trạng thái mã.

## 10. Reporting / Import / Export / Integration / Scheduler
- Đây là module nghiệp vụ mục tiêu cho hệ thống mới.
- Reporting phải đọc dữ liệu gốc, không sửa đổi dữ liệu nguồn.
- Export dữ liệu nhạy cảm chỉ thực hiện khi người dùng có permission và bảo mật.
- Import phải validate template, dữ liệu bắt buộc và log lỗi dòng.
- Scheduler phải idempotent và ghi job execution log.
- Integration phải cấu hình qua adapter/service riêng, verify callback/webhook và retry khi cần.

## 11. State machine tổng hợp
| Trạng thái | Ý nghĩa | Được chuyển sang | Không được chuyển sang | Actor/API | Ghi chú |
|---|---|---|---|---|---|
| Active | Bản ghi hoạt động | Inactive, Archived | Deleted | User/Admin | |
| Draft | Chưa xuất bản | Published | Archived | Admin | |
| Published | Đã xuất bản | Archived | Draft | Admin | |
| Pending | Chờ xử lý | Paid, Cancelled | None | System | |
| Paid | Đã thanh toán | Refunded | Cancelled | System | |
| Cancelled | Huỷ | None | Paid | User/Admin | |
| Refunded | Hoàn tiền | None | Paid | System | |

## 12. Invariant bắt buộc
| Mã rule | Nội dung | Module | Mức độ | Lý do | Test bắt buộc |
|---|---|---|---|---|---|
| BR-AUTH-001 | Backend phải kiểm tra token/permission cho mọi endpoint bảo mật | Authentication | BẮT BUỘC | An toàn | Test auth |
| BR-AUTH-002 | User chỉ truy cập hồ sơ của mình trừ admin | Authentication | BẮT BUỘC | Ownership | Test ownership |
| BR-CLASS-001 | Tài liệu PRO chỉ người học hợp lệ mới xem | Classroom/Document | BẮT BUỘC | Quyền truy cập | Test membership |
| BR-EXAM-001 | Nộp bài phải tính điểm và lưu kết quả | Exam | BẮT BUỘC | Integrity | Test scoring |
| BR-ORDER-001 | Không tin giá từ client | Order/Payment | BẮT BUỘC | Thanh toán | Test price validation |
| BR-BOOK-001 | Mã sách chỉ dùng một lần nếu không cho phép reuse | Book | BẮT BUỘC | Activation | Test code reuse |
| BR-CONTENT-001 | Nội dung publish chỉ hiển thị khi trạng thái công khai | Content | BẮT BUỘC | Visibility | Test publish |
| BR-PAYMENT-001 | Webhook phải idempotent và xác thực | Payment | BẮT BUỘC | Security | Test webhook |
