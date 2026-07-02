# 1. Thông tin module
- Tên module: Order / Cart / Payment
- Mục tiêu nghiệp vụ: cho phép người dùng quản lý giỏ hàng, áp dụng khuyến mãi, tạo đơn hàng, chọn phương thức thanh toán, theo dõi trạng thái thanh toán và xem lịch sử giao dịch; cho phép admin quản lý đơn hàng, credit và coupon.
- Phạm vi đặc tả: các chức năng được chứng minh trực tiếp từ source: xem/ cập nhật giỏ hàng, thêm sản phẩm vào giỏ (khóa học, sách, gia hạn BookID), áp dụng/xóa mã giảm giá, tạo đơn hàng, thanh toán bằng COD / chuyển khoản / ví SSStudy / PayOS, xem lịch sử đơn hàng và credit, quản lý order/credit/coupon ở admin.
- Source liên quan:
  - [api-develop/app/controllers/CartController.js](../../../../api-develop/app/controllers/CartController.js)
  - [api-develop/app/controllers/OrderController.js](../../../../api-develop/app/controllers/OrderController.js)
  - [api-develop/app/controllers/CreditController.js](../../../../api-develop/app/controllers/CreditController.js)
  - [api-develop/app/routes/routes.js](../../../../api-develop/app/routes/routes.js)
  - [web-admin/src/components/order/Order.js](../../../../web-admin/src/components/order/Order.js)
  - [web-admin/src/components/credit/Credit.js](../../../../web-admin/src/components/credit/Credit.js)
  - [web-admin/src/components/coupon/Coupon.js](../../../../web-admin/src/components/coupon/Coupon.js)
  - [web-ssstudy/src/app/gio-hang/page.tsx](../../../../web-ssstudy/src/app/gio-hang/page.tsx)
  - [web-ssstudy/src/app/gio-hang/thanh-toan/page.tsx](../../../../web-ssstudy/src/app/gio-hang/thanh-toan/page.tsx)
  - [web-ssstudy/src/app/account/order-history/page.tsx](../../../../web-ssstudy/src/app/account/order-history/page.tsx)
  - [web-ssstudy/src/app/account/credit-history/CreditHistoryClient.tsx](../../../../web-ssstudy/src/app/account/credit-history/CreditHistoryClient.tsx)
  - [web-ssstudy/src/services/cartService.ts](../../../../web-ssstudy/src/services/cartService.ts)
  - [web-ssstudy/src/services/orderService.ts](../../../../web-ssstudy/src/services/orderService.ts)
- Màn hình liên quan:
  - web-admin: /order, /credit, /coupon
  - web-ssstudy: /gio-hang, /gio-hang/thanh-toan, /account/order-history, /account/credit-history
- API liên quan:
  - /cart/count, /cart/detail, /cart/add, /cart/update, /cart/apply-coupon, /cart/remove-coupon, /cart/delete
  - /order/list, /order/detail, /order/create, /order/payment-info, /order/payment_payos, /order/payos_detail_order, /order/payos_update_order, /order/update-status
  - /credit/list, /credit/detail, /credit/payment, /credit/payment_payos, /credit/payos_hook
  - /coupon-list, /coupon/list
- Entity/table/dữ liệu liên quan:
  - Cart, CartItem, Coupon, Order, OrderItem, CreditLog, OrderPaymentCode
- Mức độ xác minh: Cao

# 2. Phân quyền và kiểm soát truy cập

| Actor/Role | Permission | Chức năng được phép | Điều kiện truy cập | Bằng chứng source | Ghi chú |
|---|---|---|---|---|---|
| Guest / Public user | Chỉ dùng giỏ hàng tạm trên browser (localStorage) trước khi đăng nhập | Thêm sản phẩm vào giỏ tạm, xem tóm tắt giỏ hàng trước khi đăng nhập | Không gọi được API cart/order protected khi chưa đăng nhập; frontend lưu ở localStorage | [web-ssstudy/src/app/gio-hang/page.tsx](../../../../web-ssstudy/src/app/gio-hang/page.tsx) | Khi đăng nhập, giỏ tạm có thể được đồng bộ với backend |
| STUDENT / authenticated user | Quản lý giỏ hàng, tạo đơn hàng, thanh toán, xem lịch sử đơn hàng/credit | Xem/ cập nhật giỏ hàng, chọn sản phẩm, áp mã giảm giá, đặt hàng, chọn thanh toán, xem lịch sử | Backend dùng req.user.user_id để lấy cart/order và kiểm tra quyền sở hữu | [api-develop/app/controllers/CartController.js](../../../../api-develop/app/controllers/CartController.js), [api-develop/app/controllers/OrderController.js](../../../../api-develop/app/controllers/OrderController.js), [web-ssstudy/src/app/gio-hang/page.tsx](../../../../web-ssstudy/src/app/gio-hang/page.tsx) | Các route checkout/order đều cần auth middleware chung |
| ADMIN / MANAGER / SUPPORTER | Quản lý đơn hàng, credit và coupon | Xem danh sách đơn hàng, cập nhật trạng thái, xem credit, quản trị coupon | Thông qua admin UI và auth middleware chuẩn của hệ thống | [web-admin/src/components/order/Order.js](../../../../web-admin/src/components/order/Order.js), [web-admin/src/components/credit/Credit.js](../../../../web-admin/src/components/credit/Credit.js), [web-admin/src/components/coupon/Coupon.js](../../../../web-admin/src/components/coupon/Coupon.js) | Scope chi tiết cần xác nhận từ config auth |

# 3. Danh sách chức năng

| Mã chức năng | Tên chức năng | Actor | Màn hình/Route | API | Controller/Service | Trạng thái xác minh |
|---|---|---|---|---|---|---|
| ORD-01 | Quản lý giỏ hàng | STUDENT | /gio-hang | /cart/detail, /cart/add, /cart/update, /cart/delete, /cart/count | CartController | Đã xác nhận |
| ORD-02 | Áp dụng và xóa mã khuyến mại | STUDENT | /gio-hang | /cart/apply-coupon, /cart/remove-coupon, /coupon-list | CartController, CouponController | Đã xác nhận |
| ORD-03 | Tạo đơn hàng và thanh toán | STUDENT | /gio-hang/thanh-toan | /order/create, /order/payment-info, /order/payment_payos | OrderController | Đã xác nhận |
| ORD-04 | Xem lịch sử đơn hàng và chi tiết | STUDENT | /account/order-history | /order/list, /order/detail | OrderController | Đã xác nhận |
| ORD-05 | Quản lý credit và nạp tiền | STUDENT / ADMIN | /account/credit-history, /credit | /credit/list, /credit/payment, /credit/payment_payos, /credit/payos_hook | CreditController | Đã xác nhận |
| ORD-06 | Quản lý order/credit/coupon ở admin | ADMIN | /order, /credit, /coupon | /order/update-status, /credit/list, /coupon/list | OrderController, CreditController, CouponController | Đã xác nhận |

# 4. Đặc tả chi tiết từng chức năng

## ORD-01 Quản lý giỏ hàng

### Mục đích
Cho phép học viên xem giỏ hàng hiện tại, thêm sản phẩm mới, thay đổi số lượng/chọn sản phẩm và xóa sản phẩm khỏi giỏ.

### Actor / quyền sử dụng
- STUDENT / authenticated user
- Guest: có thể dùng giỏ tạm trên localStorage trong frontend

### Điều kiện trước
- Người dùng phải có tài khoản và token hợp lệ để thao tác với backend cart.
- Nếu là guest, frontend chỉ lưu ở localStorage và đồng bộ khi đăng nhập.

### Điểm khởi đầu
- Route: /gio-hang
- Màn hình: [web-ssstudy/src/app/gio-hang/page.tsx](../../../../web-ssstudy/src/app/gio-hang/page.tsx)
- Trigger: mở giỏ hàng, thêm sản phẩm từ khóa học/sách, chọn/bỏ chọn item, xóa item

### Dữ liệu đầu vào

| Trường dữ liệu | Kiểu dữ liệu | Bắt buộc | Validation | Nguồn dữ liệu | Ghi chú |
|---|---|---|---|---|---|
| item_id | string | Có | Không rỗng | UI / payload | Có thể là classroom, book, bookId |
| name | string | Có | Không rỗng | UI | Tên sản phẩm hiển thị |
| price | number | Có | >= 0 | UI | Giá sản phẩm |
| qty | number | Không | Mặc định 1 | UI | Với classroom/bookId thường bị ép 1 |
| type | string | Có | CLASSROOM / BOOK / BOOKID / EXTEND_BOOKID | UI | |
| is_selected | boolean | Không | Default false | UI | |

### Luồng chính
1. Frontend gọi /cart/detail để lấy cart và danh sách item.
2. Frontend gọi /cart/add để thêm sản phẩm mới; backend tạo cart nếu chưa có và thêm item vào cart.
3. Backend tự động tạo các item liên quan nếu sản phẩm là khóa học có sách/khoá học kèm hoặc sách kèm khóa học.
4. Frontend gọi /cart/update hoặc /cart/delete để đổi trạng thái/chọn/xóa item.
5. Backend cập nhật subtotal/discount_total và trả về số lượng cart count.

### Luồng thay thế / ngoại lệ
- Nếu người dùng đã tham gia khóa học rồi, backend trả về lỗi và ngăn thêm vào giỏ.
- Nếu user đã sở hữu BookID còn hạn, backend trả về lỗi và ngăn gia hạn/ thêm mới.
- Nếu cart không tồn tại, backend tạo cart mới trước khi thêm item.

### Validation và business rule
- Với CLASSROOM, số lượng bị ép thành 1.
- Với BOOK/BOOKID/EXTEND_BOOKID, backend cũng ép số lượng thành 1 khi thêm mới.
- Cart child items được tạo tự động khi khóa học có sách/khoá học đi kèm.
- Việc chọn/bỏ chọn item sẽ ảnh hưởng tới phần checkout.

### API liên quan

| Endpoint | Method | Request DTO/params | Response | Controller | Exception/lỗi có thể có |
|---|---|---|---|---|---|
| /cart/detail | POST | none | cart, cart_items, bank_info | CartController.detail | Lỗi hệ thống chung |
| /cart/add | POST | item_id, name, price, qty, type, image, note, cart_parent_id | total_qty / message | CartController.add | Trùng sản phẩm, đã sở hữu, không tồn tại |
| /cart/update | POST | item_id, price, qty, is_selected, note | message | CartController.update | Không tìm thấy cart |
| /cart/delete | POST | id | message | CartController.delete | Không tìm thấy cart item |
| /cart/count | POST | none | qty | CartController.count | Lỗi hệ thống chung |

## ORD-02 Áp dụng và xóa mã khuyến mại

### Mục đích
Cho phép người dùng áp dụng mã giảm giá cho giỏ hàng và xóa mã khi cần.

### Actor / quyền sử dụng
- STUDENT

### Điều kiện trước
- Giỏ hàng phải tồn tại và có ít nhất một item được chọn.

### Điểm khởi đầu
- Route: /gio-hang
- Trigger: nhập mã giảm giá và nhấn áp dụng hoặc xóa mã

### Dữ liệu đầu vào

| Trường dữ liệu | Kiểu dữ liệu | Bắt buộc | Validation | Nguồn dữ liệu | Ghi chú |
|---|---|---|---|---|---|
| discount_code | string | Có | Không rỗng | UI | Mã coupon |

### Luồng chính
1. Frontend gọi /coupon-list để lấy danh sách mã có thể dùng.
2. Frontend gọi /cart/apply-coupon với mã nhập vào.
3. Backend kiểm tra coupon tồn tại, active và phù hợp; nếu hợp lệ thì cập nhật cart.discount_code và recalculates subtotal/discount total.
4. Frontend gọi /cart/remove-coupon để xóa mã giảm giá.

### Luồng thay thế / ngoại lệ
- Nếu mã không hợp lệ, backend trả về thông báo lỗi và không thay đổi cart.
- Nếu cart không tồn tại, backend trả về lỗi giỏ hàng trống.

### Validation và business rule
- Coupon được lưu trên cart và dùng để cập nhật discount_total.
- Logic tính discount_value/discount_type nằm ở CartService và CouponModel; hiện file controller chỉ xác thực và gọi updateCartData.
- Cần xác nhận thêm điều kiện áp dụng theo order value, product type và thời gian hiệu lực.

### API liên quan

| Endpoint | Method | Request DTO/params | Response | Controller | Exception/lỗi có thể có |
|---|---|---|---|---|---|
| /coupon-list | POST | none | records | CouponController.listPublic | Lỗi hệ thống chung |
| /cart/apply-coupon | POST | discount_code | message | CartController.applyCoupon | Mã không hợp lệ / giỏ hàng trống |
| /cart/remove-coupon | POST | discount_code | message | CartController.removeCoupon | Mã không hợp lệ |

## ORD-03 Tạo đơn hàng và thanh toán

### Mục đích
Tạo đơn hàng từ các item đã chọn trong giỏ hàng và chuyển sang quy trình thanh toán phù hợp với phương thức đã chọn.

### Actor / quyền sử dụng
- STUDENT

### Điều kiện trước
- Có ít nhất một item trong giỏ hàng được đánh dấu is_selected=true.
- Có đầy đủ customer_name, customer_phone và user_id hợp lệ.

### Điểm khởi đầu
- Route: /gio-hang/thanh-toan
- Trigger: bấm đặt hàng sau khi chọn phương thức thanh toán

### Dữ liệu đầu vào

| Trường dữ liệu | Kiểu dữ liệu | Bắt buộc | Validation | Nguồn dữ liệu | Ghi chú |
|---|---|---|---|---|---|
| customer_name | string | Có | Không rỗng | UI | |
| customer_phone | string | Có | Không rỗng | UI | |
| customer_address | string | Không | Có thể rỗng | UI | |
| payment_method | string | Có | COD / BANK_TRANSFER / SSS_BALANCE / BANK_PAYOS | UI | |
| user_id | string | Có | ID người dùng hiện tại | UI / auth | |
| note | string | Không | Có thể rỗng | UI | |

### Luồng chính
1. Frontend gọi /order/create với thông tin checkout và payment_method.
2. Backend lấy cart và danh sách item đã chọn, tạo record Order + OrderItem.
3. Nếu payment_method là SSS_BALANCE, backend kiểm tra số dư ví; nếu đủ thì cập nhật status = PAID và cấp quyền khóa học ngay.
4. Nếu payment_method là BANK_TRANSFER hoặc BANK_PAYOS, order được tạo với status PENDING và frontend chuyển sang màn hình payment-info/payment-payos.
5. Với BANK_PAYOS, backend tạo payment link và trả về URL checkout.

### Luồng thay thế / ngoại lệ
- Nếu không có item được chọn, backend trả về lỗi "Vui lòng chọn 1 khóa học".
- Nếu ví không đủ tiền, backend trả về lỗi cụ thể.
- Nếu tạo order thất bại, hệ thống trả về lỗi chung.

### Validation và business rule
- Trong quá trình create order, backend dùng giá trị từ cart.total/discount_total/subtotal để tạo order.
- Nếu thanh toán bằng SSS_BALANCE, hệ thống trừ tiền từ balance và cấp truy cập khóa học ngay lập tức.
- Nếu thanh toán bằng PayOS/Bank Transfer, order có trạng thái PENDING và được cập nhật sau khi webhook/redirect returns.
- Có logic tự động thêm user vào classroom khi order status chuyển PAID/SUCCESS.

### API liên quan

| Endpoint | Method | Request DTO/params | Response | Controller | Exception/lỗi có thể có |
|---|---|---|---|---|---|
| /order/create | POST | customer_name, customer_phone, customer_address, note, payment_method, user_id | order | OrderController.create | Thiếu thông tin, giỏ hàng trống, ví không đủ tiền |
| /order/payment-info | POST | id | order, bank_text, bank_info | OrderController.paymentInfo | Order không tồn tại |
| /order/payment_payos | POST | id, cartItem, cancelUrl, returnUrl | payment_code, payOS link | OrderController.paymentPayOs | Không tạo được link thanh toán |

## ORD-04 Xem lịch sử đơn hàng và chi tiết

### Mục đích
Cho phép học viên xem danh sách đơn hàng và xem chi tiết từng đơn hàng trong lịch sử.

### Actor / quyền sử dụng
- STUDENT

### Điều kiện trước
- Người dùng phải đăng nhập.

### Điểm khởi đầu
- Route: /account/order-history
- Trigger: mở lịch sử đơn hàng hoặc mở modal chi tiết đơn hàng

### Dữ liệu đầu vào

| Trường dữ liệu | Kiểu dữ liệu | Bắt buộc | Validation | Nguồn dữ liệu | Ghi chú |
|---|---|---|---|---|---|
| page | number | Không | Mặc định 1 | UI | |
| limit | number | Không | Mặc định 10 | UI | |
| id | string | Có khi xem chi tiết | Không rỗng | UI | |

### Luồng chính
1. Frontend gọi /order/list để lấy danh sách order của user hiện tại.
2. Backend lọc order theo customer_id hoặc user context và trả về records + pagination.
3. Frontend hiển thị danh sách gồm mã đơn, trạng thái, tổng tiền, phương thức thanh toán.
4. Khi mở chi tiết, frontend gọi /order/detail để lấy item và metadata.

### Validation và business rule
- API list dành cho student chỉ trả về order của user đó.
- Admin có thể xem/tra cứu toàn bộ order bằng các filter khác.
- Trạng thái đơn hàng có thể là PENDING / PAID / SUCCESS / CANCELLED / PROCESSING.

### API liên quan

| Endpoint | Method | Request DTO/params | Response | Controller | Exception/lỗi có thể có |
|---|---|---|---|---|---|
| /order/list | POST | page, limit, status, payment_method | records, totalRecord, perPage | OrderController.list | Lỗi hệ thống chung |
| /order/detail | POST | id | order + items | OrderController.detail | Order không tồn tại |

## ORD-05 Quản lý credit và nạp tiền

### Mục đích
Hỗ trợ nạp tiền vào ví SSStudy, lưu lịch sử credit và xử lý PayOS callback cho nạp tiền.

### Actor / quyền sử dụng
- STUDENT
- ADMIN

### Điều kiện trước
- Người dùng phải đăng nhập.
- Với thanh toán PayOS, frontend cần redirect URL và callback URL.

### Điểm khởi đầu
- Route: /account/credit-history
- Trigger: mở lịch sử credit hoặc thực hiện nạp tiền

### Dữ liệu đầu vào

| Trường dữ liệu | Kiểu dữ liệu | Bắt buộc | Validation | Nguồn dữ liệu | Ghi chú |
|---|---|---|---|---|---|
| total | number | Có | >= 0 | UI | Số tiền nạp |
| type | string | Có | ADD / SUB / LEAD | UI | |
| payment_method | string | Có | BANK_TRANSFER / BANK_PAYOS | UI | |
| user_id | string | Có | ID người dùng hiện tại | UI / auth | |

### Luồng chính
1. Frontend tạo credit transaction bằng /credit/payment hoặc /credit/payment_payos.
2. Backend tạo bản ghi CreditLog và payment code nếu cần.
3. Với PayOS, backend tạo link thanh toán và trả về URL checkout.
4. Khi callback đến /credit/payos_hook, backend cập nhật trạng thái giao dịch.

### Luồng thay thế / ngoại lệ
- Nếu dữ liệu không hợp lệ hoặc user không tồn tại, backend trả về lỗi.
- Nếu PayOS không trả về thông tin hợp lệ, hệ thống ghi log và trả về lỗi chung.

### Validation và business rule
- CreditLog lưu các giao dịch nạp/trừ tiền của user.
- Nguồn dữ liệu dùng user.id/name/code để hiển thị trong admin.
- Quá trình hook/redirect chưa được thể hiện đầy đủ bằng UI trong repository hiện tại, nên cần xác nhận đường dẫn callback và trạng thái cuối cùng trong môi trường vận hành.

### API liên quan

| Endpoint | Method | Request DTO/params | Response | Controller | Exception/lỗi có thể có |
|---|---|---|---|---|---|
| /credit/list | POST | page, limit, from_date, to_date | records, totalRecord, perPage | CreditController.list | Lỗi hệ thống chung |
| /credit/payment | POST | total, type, payment_method, user_id | credit log + bank_text | CreditController.payment | Dữ liệu không hợp lệ |
| /credit/payment_payos | POST | total, type, payment_method, user_id, returnUrl, cancelUrl | payOS link và metadata | CreditController.paymentPayOS | User không tồn tại |
| /credit/payos_hook | POST | payload từ PayOS | response | CreditController.payOSHook | Hook không hợp lệ |

# 5. Rủi ro / điểm cần chú ý

- Logic thanh toán PayOS và bank transfer chia ra giữa order và credit; cần đồng bộ trạng thái giữa webhook, redirect và UI hiển thị.
- Cart và order hiện đang dùng dữ liệu cart.total / cart.subtotal / cart.discount_total do service cập nhật; nếu logic coupon hoặc cart update bị lỗi thì số tiền đơn hàng có thể không nhất quán.
- Quá trình cấp quyền khóa học khi order status chuyển PAID/SUCCESS được thực hiện ở backend, nhưng luồng thực tế phía frontend và trạng thái hiển thị cần được xác nhận lại trong môi trường vận hành.
- Coupon management và discount rules được cho là có thể áp dụng theo order value/product; hiện file controller chỉ kiểm tra sự tồn tại và trạng thái của coupon, điều kiện chi tiết chưa được minh họa đầy đủ bằng source.
- Một số endpoint như update/delete order ở controller hiện có logic placeholder hoặc chưa đủ bằng chứng; cần xác nhận lại khi triển khai bảo trì hoặc mở rộng.
