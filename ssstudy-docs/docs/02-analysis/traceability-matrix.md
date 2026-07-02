# Traceability matrix – Modules hiện có

## 1. Mục đích
Ma trận này nối các chức năng nghiệp vụ chính của các module đã đặc tả với màn hình, API, controller/service và entity dữ liệu liên quan.

## 2. Ma trận truy vết

| Chức năng nghiệp vụ | Màn hình / Route | API | Backend/controller | Entity dữ liệu | Trạng thái bằng chứng |
|---|---|---|---|---|---|
| Xem giỏ hàng | /gio-hang | /cart/detail | CartController.detail | Cart, CartItem | Đã xác nhận |
| Thêm sản phẩm vào giỏ | /gio-hang | /cart/add | CartController.add | Cart, CartItem | Đã xác nhận |
| Chọn / bỏ chọn / xóa item | /gio-hang | /cart/update, /cart/delete | CartController.update, CartController.delete | CartItem | Đã xác nhận |
| Áp dụng / xóa coupon | /gio-hang | /cart/apply-coupon, /cart/remove-coupon, /coupon-list | CartController.applyCoupon, CartController.removeCoupon, CouponController.listPublic | Coupon, Cart | Có bằng chứng, rule chi tiết cần xác nhận |
| Tạo đơn hàng | /gio-hang/thanh-toan | /order/create | OrderController.create | Order, OrderItem | Đã xác nhận |
| Xem thông tin thanh toán | /gio-hang/thanh-toan | /order/payment-info, /order/payment_payos | OrderController.paymentInfo, OrderController.paymentPayOs | Order, OrderPaymentCode | Đã xác nhận |
| Cập nhật trạng thái thanh toán từ PayOS | webhook / callback | /order/payos_update_order | OrderController.payOSUpdateOrder | Order, OrderItem | Có bằng chứng, workflow thực tế cần xác nhận |
| Xem lịch sử đơn hàng | /account/order-history | /order/list, /order/detail | OrderController.list, OrderController.detail | Order, OrderItem | Đã xác nhận |
| Xem lịch sử credit | /account/credit-history | /credit/list, /credit/detail | CreditController.list, CreditController.detail | CreditLog | Đã xác nhận |
| Nạp tiền / top-up | /account/credit-history | /credit/payment, /credit/payment_payos | CreditController.payment, CreditController.paymentPayOS | CreditLog, OrderPaymentCode | Đã xác nhận |
| Xử lý callback nạp tiền | webhook / callback | /credit/payos_hook | CreditController.payOSHook | CreditLog, User | Có bằng chứng, cần xác nhận security và idempotency |
| Quản trị order ở admin | /order | /order/list, /order/update-status | OrderController.list, OrderController.updateStatus | Order | Đã xác nhận |
| Quản trị credit ở admin | /credit | /credit/list, /credit/create | CreditController.list, CreditController.create | CreditLog | Đã xác nhận |
| Quản trị coupon ở admin | /coupon | /coupon/list, /coupon/create, /coupon/update | CouponController | Coupon | Đã xác nhận |

## 3. Bổ sung ma trận cho module 06 và 07

| Chức năng nghiệp vụ | Màn hình / Route | API | Backend/controller | Entity dữ liệu | Trạng thái bằng chứng |
|---|---|---|---|---|---|
| Xem blog và danh mục | /ban-tin, /tin-tuc/[alias]/[slug] | /blog/list-public, /blog-category/list-public | BlogController, BlogCategoryController | BlogPost, BlogCategory | Đã xác nhận |
| Xem trang giới thiệu / giáo viên / CEO | /gioi-thieu, /giao-vien | /about/detail, /teachers-team/detail, /ceo-page/detail | AboutController, TeachersTeamController, CeoPageController | Page, TeachersTeam, CeoPage | Đã xác nhận |
| Xem sách và chi tiết sách | /sach, /sach/[alias] | /book/list, /book/detail | BookController | Book, UserBuyData | Đã xác nhận |
| Tìm kiếm book-id và kiểm tra ownership | /sach-id | /book-id/list-public, /book-id/detail | BookIdController | BookId, StudentBookId, StudentClassroom | Đã xác nhận |
| Xem course bundle đã sở hữu | /account/my-course | /book-id-course/list-owned, /book-id-course/detail | BookIdCourseController | BookIdCourse, StudentBookId | Có bằng chứng, ownership flow cần xác nhận thêm |

## 4. Ghi chú
- Mức độ xác minh cao cho luồng checkout và lịch sử giao dịch.
- Mức độ xác minh trung bình cho rule coupon, lifecycle trạng thái thanh toán và handling callback.
- Mức độ xác minh trung bình cho module 06/07 ở phần scope admin và ownership/book-id lifecycle.
