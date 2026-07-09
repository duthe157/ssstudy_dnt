# Order / Giỏ hàng / Thanh toán — SRS mục tiêu

> Tài liệu đặc tả yêu cầu phần mềm (SRS) cho module Order/Cart/Payment của hệ thống SSStudy.
> Viết như thể hệ thống chưa có code. Mục tiêu: đủ chi tiết để developer triển khai hoàn chỉnh chỉ từ tài liệu này.

---

## 1. Mục tiêu nghiệp vụ

Module Order/Cart/Payment xử lý toàn bộ luồng thương mại của hệ thống SSStudy:

- Cho phép học viên thêm sản phẩm (khóa học, bundle, sách) vào giỏ hàng và thanh toán.
- Tính giá chính xác ở backend; không tin giá gửi từ client.
- Hỗ trợ nhiều phương thức thanh toán: ví credit, chuyển khoản ngân hàng, PayOS.
- Xử lý webhook thanh toán một cách idempotent và an toàn.
- Tự động cấp quyền truy cập sản phẩm sau khi thanh toán thành công.
- Quản lý coupon giảm giá với đầy đủ rule validation.
- Quản lý ví credit của học viên.
- Admin theo dõi, quản lý và đối soát đơn hàng.

---

## 2. Phạm vi chức năng

| STT | Chức năng | Mô tả ngắn |
|---|---|---|
| 1 | Giỏ hàng | Thêm, sửa, xóa sản phẩm trong giỏ |
| 2 | Áp dụng coupon | Xác thực và áp mã giảm giá vào giỏ |
| 3 | Tính giá backend | Tính lại toàn bộ giá, giảm giá tại backend khi checkout |
| 4 | Tạo đơn hàng | Snapshot giá và sản phẩm, khởi tạo thanh toán |
| 5 | Thanh toán ví credit | Trừ ví và cấp quyền ngay lập tức |
| 6 | Thanh toán PayOS | Tạo payment link, chờ webhook xác nhận |
| 7 | Thanh toán chuyển khoản | Tạo thông tin chuyển khoản, admin xác nhận thủ công |
| 8 | Xử lý webhook payment | Nhận, xác thực chữ ký, cập nhật trạng thái idempotent |
| 9 | Cấp quyền sau thanh toán | Gọi EnrollmentService cấp quyền học/kích hoạt |
| 10 | Lịch sử đơn hàng | Học viên xem đơn hàng, trạng thái, chi tiết |
| 11 | Lịch sử credit | Học viên xem biến động số dư ví |
| 12 | Nạp ví credit | Nạp tiền vào ví qua gateway |
| 13 | Hủy đơn hàng | Học viên hoặc admin hủy đơn pending |
| 14 | Hoàn tiền | Admin xử lý hoàn tiền cho đơn đã thanh toán |
| 15 | Admin quản lý đơn hàng | Xem, lọc, cập nhật trạng thái, đối soát |
| 16 | Admin quản lý coupon | Tạo, sửa, ẩn coupon |
| 17 | Admin quản lý ví credit | Xem số dư, điều chỉnh thủ công nếu cần |
| 18 | Đối soát giao dịch | Admin đối chiếu webhook với đơn hàng |

---

## 3. Ngoài phạm vi

- Phát hành hóa đơn điện tử (VAT invoice).
- Tích hợp cổng thanh toán quốc tế (Stripe, PayPal).
- Hệ thống affiliate/referral.
- Đăng ký trả phí định kỳ (subscription).
- Trả góp và mua trước trả sau.
- Quản lý kho hàng vật lý.

---

## 4. Actor

| Actor | Mô tả | Quyền cơ bản |
|---|---|---|
| Guest | Chưa đăng nhập | Xem giỏ hàng tạm phía client; không tạo đơn |
| student | Học viên đã đăng nhập | Quản lý giỏ hàng, tạo đơn, thanh toán, xem lịch sử |
| admin | Quản trị viên | Quản lý đơn hàng, coupon, đối soát, xử lý hoàn tiền |
| financialAdmin | Quản trị tài chính | Xem đơn hàng, xác nhận thanh toán, hoàn tiền |
| superAdmin | Quản trị cấp cao | Toàn quyền bao gồm điều chỉnh ví |

---

## 5. Permission

| Mã permission | Mô tả | Role mặc định |
|---|---|---|
| `order:read:own` | Xem đơn hàng của chính mình | student |
| `order:read:all` | Xem đơn hàng của bất kỳ user | admin, superAdmin, financialAdmin |
| `order:update` | Cập nhật trạng thái đơn hàng | admin, superAdmin, financialAdmin |
| `order:cancel` | Hủy đơn hàng | admin, superAdmin |
| `order:refund` | Xử lý hoàn tiền | admin, superAdmin, financialAdmin |
| `coupon:manage` | Tạo/sửa/xóa coupon | admin, superAdmin |
| `credit:read:all` | Xem ví credit của bất kỳ user | admin, superAdmin, financialAdmin |
| `credit:adjust` | Điều chỉnh số dư ví thủ công | superAdmin |
| `payment:reconcile` | Đối soát giao dịch | admin, superAdmin, financialAdmin |

---

## 6. Danh sách chức năng

| Mã chức năng | Tên chức năng | Actor | Màn hình đề xuất | API đề xuất | Dịch vụ nghiệp vụ cần có | Dữ liệu/model liên quan | Quy tắc áp dụng | Priority |
|---|---|---|---|---|---|---|---|---|
| ORD-01 | Xem giỏ hàng | student | `/cart` | `GET /api/cart` | Lấy giỏ hàng của user, tính lại tổng giá backend | Cart, CartItem | BR-ORD-001 | Must |
| ORD-02 | Thêm sản phẩm vào giỏ | student | `/cart` | `POST /api/cart/items` | Kiểm tra sản phẩm hợp lệ, chưa trong giỏ, chưa có enrollment | Cart, CartItem | BR-ORD-001 | Must |
| ORD-03 | Xóa sản phẩm khỏi giỏ | student | `/cart` | `DELETE /api/cart/items/{itemId}` | Xóa CartItem; cập nhật tổng giá | CartItem | — | Must |
| ORD-04 | Áp dụng coupon | student | `/cart` | `POST /api/cart/apply-coupon` | Xác thực coupon (hạn, lượt, điều kiện); tính giá mới | Cart, Coupon, CouponUsage | BR-ORD-005 | Must |
| ORD-05 | Xóa coupon khỏi giỏ | student | `/cart` | `DELETE /api/cart/coupon` | Xóa coupon đang áp trong giỏ | Cart | — | Must |
| ORD-06 | Tạo đơn hàng | student | `/checkout` | `POST /api/orders` | Snapshot giá, tạo Order + OrderItem, khởi tạo payment | Order, OrderItem, Payment | BR-ORD-001, BR-ORD-002 | Must |
| ORD-07 | Thanh toán bằng ví credit | student | `/checkout` | `POST /api/payments` | Kiểm tra số dư, trừ ví, cập nhật order paid, cấp quyền | CreditWallet, CreditTransaction, Order | BR-ORD-008 | Must |
| ORD-08 | Thanh toán qua PayOS | student | `/checkout` | `POST /api/payments` | Tạo payment link PayOS; chờ webhook | Payment, PaymentTransaction | BR-ORD-004 | Must |
| ORD-09 | Nhận webhook thanh toán | Hệ thống | — | `POST /api/payments/webhook/payos` | Xác thực chữ ký; cập nhật idempotent; cấp quyền | PaymentTransaction, Order | BR-ORD-004 | Must |
| ORD-10 | Cấp quyền sau thanh toán | Hệ thống | — | Nội bộ | Gọi EnrollmentService/ActivationService cho từng sản phẩm | Enrollment, AccessGrant | BR-ORD-006 | Must |
| ORD-11 | Xem lịch sử đơn hàng | student | `/account/orders` | `GET /api/orders` | Danh sách đơn hàng của user, phân trang, lọc | Order | BR-SYS-001 | Must |
| ORD-12 | Xem chi tiết đơn hàng | student | `/account/orders/{orderId}` | `GET /api/orders/{orderId}` | Chi tiết đơn hàng và trạng thái thanh toán | Order, OrderItem, Payment | BR-SYS-001 | Must |
| ORD-13 | Xem lịch sử credit | student | `/account/credit` | `GET /api/me/credit` | Số dư ví và lịch sử giao dịch | CreditWallet, CreditTransaction | BR-SYS-001 | Should |
| ORD-14 | Nạp ví credit | student | `/account/credit/topup` | `POST /api/me/credit/topup` | Tạo đơn nạp tiền, thanh toán qua gateway | CreditWallet, Order | — | Should |
| ORD-15 | Hủy đơn hàng | student, admin | `/account/orders/{orderId}` | `POST /api/orders/{orderId}/cancel` | Hủy đơn pending; hoàn lại ví nếu đã trừ | Order | BR-ORD-007 | Should |
| ORD-16 | Admin xem đơn hàng | admin, financialAdmin | `/admin/orders` | `GET /api/admin/orders` | Danh sách và lọc đơn hàng toàn hệ thống | Order | `order:read:all` | Must |
| ORD-17 | Admin cập nhật trạng thái đơn | admin, financialAdmin | `/admin/orders/{orderId}` | `PUT /api/admin/orders/{orderId}/status` | Xác nhận thanh toán thủ công (bank transfer) | Order, Payment | `order:update` | Must |
| ORD-18 | Admin xử lý hoàn tiền | admin, financialAdmin | `/admin/orders/{orderId}` | `POST /api/admin/orders/{orderId}/refund` | Hoàn tiền, thu hồi quyền nếu cần, ghi audit log | Order, CreditTransaction | `order:refund` | Should |
| ORD-19 | Admin quản lý coupon | admin | `/admin/coupons` | CRUD `/api/admin/coupons` | Tạo/sửa/ẩn coupon | Coupon | `coupon:manage` | Must |
| ORD-20 | Admin đối soát giao dịch | admin, financialAdmin | `/admin/payments` | `GET /api/admin/payments` | Danh sách PaymentTransaction, lọc theo trạng thái | PaymentTransaction | `payment:reconcile` | Should |

---

## 7. Thiết kế dữ liệu / Domain model đề xuất

### Model chính

| Model | Mục đích | Field quan trọng | Quan hệ |
|---|---|---|---|
| Cart | Giỏ hàng của user | id, userId, couponId, subtotal, discountAmount, totalAmount | Có nhiều CartItem |
| CartItem | Sản phẩm trong giỏ | id, cartId, productType, productId, price | FK tới Cart |
| Order | Đơn hàng đã tạo | id, userId, status, totalAmount, finalAmount, couponId | Có nhiều OrderItem, có một Payment |
| OrderItem | Sản phẩm trong đơn | id, orderId, productType, productId, productName, unitPrice | FK tới Order |
| Payment | Thông tin thanh toán | id, orderId, method, status, amount | FK tới Order |
| PaymentTransaction | Giao dịch từ gateway | id, paymentId, gatewayTxId, status, idempotencyKey, webhookPayload | FK tới Payment |
| Coupon | Mã giảm giá | id, code, type, value, minOrderAmount, maxUses, usedCount, expiresAt, status | |
| CouponUsage | Lịch sử dùng coupon | id, couponId, userId, orderId | FK tới Coupon, User, Order |
| CreditWallet | Ví credit của user | id, userId, balance | FK tới User; unique per user |
| CreditTransaction | Giao dịch ví | id, walletId, type, amount, referenceId, note | FK tới CreditWallet |
| AccessGrant | Quyền truy cập sau thanh toán | id, orderId, userId, productType, productId, grantedAt, expiresAt | FK tới Order, User |

### Field chi tiết

#### Model: Order
| Field | Kiểu dữ liệu | Bắt buộc | Ý nghĩa | Validation |
|---|---|---|---|---|
| id | UUID | Có | Khóa chính | Auto-generate |
| userId | UUID FK | Có | Người mua | |
| status | enum | Có | Trạng thái | pending, paid, cancelled, refunded |
| subtotal | numeric(12,2) | Có | Tổng trước giảm giá | Tính từ OrderItem |
| discountAmount | numeric(12,2) | Có | Số tiền giảm | 0 nếu không có coupon |
| finalAmount | numeric(12,2) | Có | Số tiền thực thanh toán | subtotal - discountAmount |
| couponId | UUID FK | Không | Coupon đã áp | |
| paymentMethod | enum | Không | Phương thức | credit_wallet, bank_transfer, payos |
| note | text | Không | Ghi chú | |
| paidAt | timestamp | Không | Thời điểm xác nhận thanh toán | |
| cancelledAt | timestamp | Không | Thời điểm hủy | |
| createdAt | timestamp | Có | | Auto |

#### Model: OrderItem
| Field | Kiểu dữ liệu | Bắt buộc | Ý nghĩa | Validation |
|---|---|---|---|---|
| id | UUID | Có | Khóa chính | |
| orderId | UUID FK | Có | Thuộc đơn hàng | |
| productType | enum | Có | Loại sản phẩm | course, bundle, book |
| productId | UUID | Có | ID sản phẩm | |
| productName | varchar(255) | Có | Tên tại thời điểm mua | Không thay đổi theo thời gian |
| unitPrice | numeric(12,2) | Có | Giá tại thời điểm mua | Không thay đổi theo thời gian |
| quantity | int | Có | Số lượng | Mặc định 1 |

#### Model: PaymentTransaction
| Field | Kiểu dữ liệu | Bắt buộc | Ý nghĩa | Validation |
|---|---|---|---|---|
| id | UUID | Có | Khóa chính | |
| paymentId | UUID FK | Có | Thuộc Payment | |
| gateway | enum | Có | Cổng thanh toán | payos, bank_transfer, credit |
| gatewayTxId | varchar(255) | Không | ID giao dịch từ gateway | Unique nếu có |
| status | enum | Có | Trạng thái giao dịch | pending, success, failed |
| amount | numeric(12,2) | Có | Số tiền giao dịch | |
| idempotencyKey | varchar(255) | Có | Khóa chống trùng | Unique |
| webhookPayload | jsonb | Không | Payload webhook gốc | Lưu để kiểm tra lại |
| processedAt | timestamp | Không | Thời điểm xử lý | |
| createdAt | timestamp | Có | | Auto |

#### Model: Coupon
| Field | Kiểu dữ liệu | Bắt buộc | Ý nghĩa | Validation |
|---|---|---|---|---|
| id | UUID | Có | Khóa chính | |
| code | varchar(50) | Có | Mã coupon | Unique, uppercase |
| type | enum | Có | Loại giảm | percent, fixed_amount |
| value | numeric(12,2) | Có | Giá trị giảm | Dương; percent <= 100 |
| minOrderAmount | numeric(12,2) | Không | Đơn tối thiểu | |
| maxUses | int | Không | Tổng lượt dùng | Null = không giới hạn |
| maxUsesPerUser | int | Không | Lượt dùng mỗi user | Null = không giới hạn |
| usedCount | int | Có | Đã dùng bao nhiêu lần | Mặc định 0 |
| expiresAt | timestamp | Không | Hạn sử dụng | |
| status | enum | Có | Trạng thái | active, inactive |
| applicableProductIds | UUID[] | Không | Chỉ áp cho sản phẩm này | Null = áp tất cả |

#### Model: CreditTransaction
| Field | Kiểu dữ liệu | Bắt buộc | Ý nghĩa | Validation |
|---|---|---|---|---|
| id | UUID | Có | Khóa chính | |
| walletId | UUID FK | Có | Ví liên quan | |
| type | enum | Có | Loại giao dịch | top_up, deduct, refund, adjustment |
| amount | numeric(12,2) | Có | Số tiền | Dương |
| balanceBefore | numeric(12,2) | Có | Số dư trước | |
| balanceAfter | numeric(12,2) | Có | Số dư sau | |
| referenceId | UUID | Không | Order hoặc tham chiếu | |
| note | text | Không | Ghi chú | |
| createdAt | timestamp | Có | | Auto |

### Quan hệ dữ liệu
- User `1—1` CreditWallet.
- User `1—N` Order.
- Order `1—N` OrderItem.
- Order `1—1` Payment.
- Payment `1—N` PaymentTransaction.
- Coupon `1—N` CouponUsage.
- CreditWallet `1—N` CreditTransaction.
- Order `1—N` AccessGrant.

### Index / Constraint đề xuất

| Bảng | Index / Constraint | Mục đích |
|---|---|---|
| Order | INDEX(userId, status, createdAt) | Lịch sử đơn hàng của user |
| PaymentTransaction | UNIQUE(idempotencyKey) | Chống xử lý trùng webhook |
| PaymentTransaction | UNIQUE(gatewayTxId) WHERE gatewayTxId IS NOT NULL | Không trùng ID từ gateway |
| Coupon | UNIQUE(code) | Mã coupon duy nhất |
| CreditWallet | UNIQUE(userId) | Mỗi user chỉ có một ví |
| CouponUsage | INDEX(couponId, userId) | Kiểm tra user đã dùng coupon |

---

## 8. Thiết kế kiến trúc module

### Thành phần cần có

| Thành phần | Vai trò | Ghi chú triển khai |
|---|---|---|
| API layer (Controller) | Nhận request, validate, gọi service | Không chứa business logic |
| CartService | Quản lý giỏ hàng, tính giá, áp coupon | Tính giá backend hoàn toàn; không tin giá client |
| OrderService | Tạo đơn hàng, snapshot giá, khởi tạo payment | Chạy trong DB transaction |
| PaymentService | Tạo payment record, gọi gateway adapter | Adapter pattern cho từng cổng |
| PayOSAdapter | Tạo payment link PayOS, xác thực webhook | Tách biệt logic PayOS |
| BankTransferAdapter | Tạo thông tin chuyển khoản | Admin xác nhận thủ công |
| CreditPaymentService | Trừ ví và cấp quyền ngay lập tức | Phải trong transaction |
| WebhookProcessor | Xác thực chữ ký, cập nhật idempotent | Dùng idempotencyKey; không xử lý trùng |
| AccessGrantService | Cấp quyền truy cập sản phẩm sau thanh toán | Gọi EnrollmentService (Classroom) hoặc ActivationService (Book) |
| CouponService | Xác thực coupon, kiểm tra điều kiện, ghi CouponUsage | Gọi trong transaction tạo order |
| CreditWalletService | Quản lý số dư ví, tạo CreditTransaction | Atomic update balance |
| OrderRepository | Truy vấn và cập nhật Order | |
| AuditLogger | Ghi audit log hành động admin | Gọi async |

### Dependency
- Module Order/Payment phụ thuộc Authentication để kiểm tra token và permission.
- Module Order/Payment gọi Classroom (EnrollmentService) sau thanh toán để cấp enrollment.
- Module Order/Payment gọi Book (ActivationService) sau thanh toán để kích hoạt bundle.
- Module không được gọi trực tiếp DB của Classroom hay Book — phải qua service interface.

### Nguyên tắc triển khai
- Giá phải tính lại ở backend khi tạo Order — không lấy giá từ client.
- Giá trong OrderItem bất biến sau khi Order được tạo.
- Tạo Order và Payment phải trong một DB transaction.
- WebhookProcessor phải kiểm tra idempotencyKey trước khi xử lý — nếu đã xử lý rồi thì bỏ qua.
- Xác thực chữ ký webhook trước mọi xử lý nội dung.
- Trừ ví và cấp quyền phải trong cùng một transaction.
- Audit log bắt buộc cho hoàn tiền, điều chỉnh ví, cập nhật trạng thái đơn.

---

## 9. Yêu cầu giao diện

| Màn hình | Route đề xuất | Actor | Mục đích | API sử dụng |
|---|---|---|---|---|
| Giỏ hàng | `/cart` | student | Xem, thêm, xóa sản phẩm, áp coupon | Cart APIs |
| Thanh toán | `/checkout/{orderId}` | student | Chọn phương thức, thanh toán | Payment APIs |
| Lịch sử đơn hàng | `/account/orders` | student | Danh sách đơn hàng | `GET /api/orders` |
| Chi tiết đơn hàng | `/account/orders/{orderId}` | student | Trạng thái và chi tiết sản phẩm | `GET /api/orders/{orderId}` |
| Ví credit | `/account/credit` | student | Số dư, lịch sử, nạp tiền | Credit APIs |
| Quản lý đơn hàng (admin) | `/admin/orders` | admin | Danh sách, lọc, cập nhật trạng thái | Admin Order APIs |
| Chi tiết đơn (admin) | `/admin/orders/{orderId}` | admin | Xem, xác nhận, hoàn tiền | Admin Order APIs |
| Quản lý coupon (admin) | `/admin/coupons` | admin | Tạo, sửa, ẩn coupon | CRUD `/api/admin/coupons` |
| Đối soát giao dịch (admin) | `/admin/payments` | admin, financialAdmin | Danh sách PaymentTransaction | `GET /api/admin/payments` |

**Yêu cầu UI chi tiết:**
- Trang giỏ hàng: hiển thị chi tiết giá gốc, giá sau giảm, tổng; ô nhập mã coupon; nút thanh toán.
- Trang thanh toán: chọn phương thức (ví/ngân hàng/PayOS); hiển thị số dư ví nếu dùng ví; xác nhận trước khi tạo đơn.
- Sau thanh toán PayOS: redirect về trang kết quả chờ webhook xác nhận; polling hoặc websocket cập nhật trạng thái.
- Admin đơn hàng: filter theo trạng thái, phương thức, khoảng thời gian; nút "Xác nhận thanh toán" cho bank transfer.

---

## 10. API đề xuất

| Mã API | Method | Endpoint đề xuất | Mục đích | Auth required | Permission | Request chính | Response chính | Business rule | Ghi chú |
|---|---|---|---|---|---|---|---|---|---|
| API-ORD-001 | GET | `/api/cart` | Xem giỏ hàng | Có | Không | — | `{ cart, items, coupon, subtotal, discount, total }` | BR-ORD-001 | Tính giá backend |
| API-ORD-002 | POST | `/api/cart/items` | Thêm sản phẩm | Có | Không | `{ productType, productId }` | `{ cartItem }` | BR-ORD-001 | Kiểm tra chưa có enrollment |
| API-ORD-003 | PUT | `/api/cart/items/{itemId}` | Sửa số lượng | Có | Không | `{ quantity }` | `{ ok }` | — | |
| API-ORD-004 | DELETE | `/api/cart/items/{itemId}` | Xóa sản phẩm | Có | Không | — | `{ ok }` | — | |
| API-ORD-005 | POST | `/api/cart/apply-coupon` | Áp coupon | Có | Không | `{ couponCode }` | `{ discount, newTotal }` | BR-ORD-005 | Xác thực coupon backend |
| API-ORD-006 | DELETE | `/api/cart/coupon` | Xóa coupon | Có | Không | — | `{ ok }` | — | |
| API-ORD-007 | POST | `/api/orders` | Tạo đơn hàng | Có | Không | `{ paymentMethod, note? }` | `{ orderId, finalAmount, paymentInfo }` | BR-ORD-001, BR-ORD-002 | Snapshot giá; tạo payment link nếu cần |
| API-ORD-008 | GET | `/api/orders` | Lịch sử đơn hàng | Có | `order:read:own` | `?page, limit, status` | `{ items, total }` | BR-SYS-001 | Chỉ trả đơn của user hiện tại |
| API-ORD-009 | GET | `/api/orders/{orderId}` | Chi tiết đơn hàng | Có | `order:read:own` | — | `{ order, items, payment }` | BR-SYS-001 | Ownership check |
| API-ORD-010 | POST | `/api/orders/{orderId}/cancel` | Hủy đơn hàng | Có | Không | `{ reason? }` | `{ ok }` | BR-ORD-007 | Chỉ hủy được khi status=pending |
| API-ORD-011 | GET | `/api/me/credit` | Xem ví credit | Có | Không | `?page, limit` | `{ balance, transactions }` | BR-SYS-001 | |
| API-ORD-012 | POST | `/api/me/credit/topup` | Nạp ví | Có | Không | `{ amount, paymentMethod }` | `{ orderId, paymentInfo }` | — | Tạo đơn nạp tiền |
| API-ORD-013 | POST | `/api/payments/webhook/payos` | Webhook PayOS | Không | Không (verify signature) | PayOS payload | `{ ok }` | BR-ORD-004 | Xác thực chữ ký; idempotent |
| API-ORD-014 | GET | `/api/admin/orders` | Danh sách đơn (admin) | Có | `order:read:all` | `?status, method, from, to, q, page` | `{ items, total }` | — | |
| API-ORD-015 | PUT | `/api/admin/orders/{orderId}/status` | Cập nhật trạng thái | Có | `order:update` | `{ status, note? }` | `{ ok }` | — | Ghi audit log |
| API-ORD-016 | POST | `/api/admin/orders/{orderId}/refund` | Hoàn tiền | Có | `order:refund` | `{ amount, reason }` | `{ ok }` | BR-ORD-007 | Ghi audit log |
| API-ORD-017 | GET | `/api/admin/coupons` | Danh sách coupon | Có | `coupon:manage` | `?page, limit, status` | `{ items, total }` | — | |
| API-ORD-018 | POST | `/api/admin/coupons` | Tạo coupon | Có | `coupon:manage` | `{ code, type, value, ... }` | `{ couponId }` | — | |
| API-ORD-019 | PUT | `/api/admin/coupons/{couponId}` | Sửa coupon | Có | `coupon:manage` | `{ value, expiresAt, status, ... }` | `{ ok }` | — | |
| API-ORD-020 | GET | `/api/admin/payments` | Đối soát giao dịch | Có | `payment:reconcile` | `?status, gateway, from, to, page` | `{ items, total }` | — | |

---

## 11. Use case nghiệp vụ

### UC-ORD-001 — Học viên thanh toán bằng ví credit

- **Mục tiêu**: Học viên dùng số dư ví để mua khóa học và nhận quyền truy cập ngay.
- **Actor chính**: student.
- **Điều kiện trước**: Học viên đã đăng nhập; có sản phẩm trong giỏ; số dư ví đủ.
- **Trigger**: Học viên chọn "Thanh toán bằng ví" và xác nhận.
- **Luồng chính**:
  1. Học viên xem giỏ hàng — hệ thống tính lại giá backend.
  2. Học viên nhấn "Thanh toán bằng ví".
  3. Hệ thống tạo Order với snapshot giá hiện tại (không lấy giá từ client).
  4. Hệ thống kiểm tra số dư CreditWallet >= finalAmount.
  5. Trong một transaction: trừ ví, tạo CreditTransaction, cập nhật Order → paid.
  6. AccessGrantService cấp quyền cho từng sản phẩm trong đơn.
  7. Giỏ hàng được xóa sau khi tạo đơn thành công.
  8. Trả về orderId và thông tin access đã cấp.
- **Luồng lỗi**:
  - Số dư không đủ → 400 `INSUFFICIENT_CREDIT`.
  - Sản phẩm đã có enrollment → 400 `PRODUCT_ALREADY_OWNED`.
- **Business rule áp dụng**: BR-ORD-001, BR-ORD-002, BR-ORD-006, BR-ORD-008.
- **Acceptance criteria**: Order paid ngay; CreditTransaction ghi đúng balanceBefore/After; quyền học được cấp.

---

### UC-ORD-002 — Học viên thanh toán qua PayOS

- **Mục tiêu**: Học viên thanh toán bằng thẻ/ngân hàng qua PayOS và nhận quyền sau khi webhook xác nhận.
- **Actor chính**: student. **Actor phụ**: PayOS (webhook).
- **Điều kiện trước**: Giỏ hàng có sản phẩm; học viên xác nhận thanh toán.
- **Luồng chính**:
  1. Học viên chọn "Thanh toán qua PayOS".
  2. Hệ thống tạo Order (status=pending), tạo Payment, tạo PaymentTransaction (status=pending).
  3. Hệ thống gọi PayOSAdapter tạo payment link.
  4. Học viên được redirect đến trang thanh toán PayOS.
  5. Học viên thanh toán thành công trên PayOS.
  6. PayOS gửi webhook đến `POST /api/payments/webhook/payos`.
  7. WebhookProcessor xác thực chữ ký; kiểm tra idempotencyKey chưa xử lý.
  8. Cập nhật PaymentTransaction → success; Order → paid.
  9. AccessGrantService cấp quyền cho từng sản phẩm.
  10. Học viên thấy trang xác nhận thanh toán thành công.
- **Luồng thay thế**: Học viên huỷ trên PayOS → webhook trả failed → Order giữ pending chờ retry hoặc hủy.
- **Luồng lỗi**: Chữ ký webhook không hợp lệ → 400, bỏ qua. idempotencyKey đã xử lý → 200 OK, bỏ qua.
- **Business rule áp dụng**: BR-ORD-004, BR-ORD-001, BR-ORD-006.
- **Acceptance criteria**: Webhook xử lý idempotent; chữ ký sai bị từ chối; quyền học chỉ được cấp khi webhook thành công.

---

### UC-ORD-003 — Áp dụng coupon vào giỏ hàng

- **Mục tiêu**: Học viên áp mã giảm giá hợp lệ để giảm tổng thanh toán.
- **Actor chính**: student.
- **Điều kiện trước**: Giỏ hàng có sản phẩm; học viên có mã coupon.
- **Luồng chính**:
  1. Học viên nhập mã coupon và nhấn "Áp dụng".
  2. Hệ thống tìm Coupon theo mã (couponCode).
  3. Kiểm tra: status=active, chưa hết expiresAt, usedCount < maxUses, user chưa dùng quá maxUsesPerUser.
  4. Kiểm tra minOrderAmount nếu có.
  5. Kiểm tra sản phẩm trong giỏ có nằm trong applicableProductIds không.
  6. Tính discountAmount theo type (percent hoặc fixed).
  7. Cập nhật Cart với couponId và discountAmount mới.
  8. Trả về discount và tổng mới.
- **Luồng lỗi**:
  - Coupon không tồn tại → 404 `COUPON_NOT_FOUND`.
  - Đã hết hạn → 400 `COUPON_EXPIRED`.
  - Hết lượt → 400 `COUPON_MAX_USES_REACHED`.
  - Không đủ điều kiện → 400 `COUPON_NOT_APPLICABLE`.
- **Business rule áp dụng**: BR-ORD-005.
- **Acceptance criteria**: Giảm giá tính đúng; coupon không hợp lệ bị từ chối với lý do rõ ràng.

---

### UC-ORD-004 — Admin xác nhận thanh toán chuyển khoản

- **Mục tiêu**: Admin xác nhận đơn hàng thanh toán bằng chuyển khoản sau khi kiểm tra thực tế.
- **Actor chính**: admin, financialAdmin.
- **Điều kiện trước**: Đơn hàng status=pending, paymentMethod=bank_transfer.
- **Luồng chính**:
  1. Admin xem danh sách đơn hàng pending chuyển khoản.
  2. Admin kiểm tra lịch sử chuyển khoản thực tế.
  3. Admin nhấn "Xác nhận thanh toán" với ghi chú.
  4. Hệ thống cập nhật Order → paid, ghi paidAt.
  5. AccessGrantService cấp quyền học.
  6. Ghi AuditLog với admin thực hiện, đơn hàng, ghi chú.
- **Business rule áp dụng**: BR-ORD-006, BR-SYS-006.
- **Acceptance criteria**: Quyền học được cấp ngay sau xác nhận; AuditLog ghi đầy đủ.

---

### UC-ORD-005 — Xử lý hoàn tiền

- **Mục tiêu**: Admin xử lý hoàn tiền cho học viên theo yêu cầu.
- **Actor chính**: admin, financialAdmin.
- **Điều kiện trước**: Đơn hàng status=paid; có permission order:refund.
- **Luồng chính**:
  1. Admin xem chi tiết đơn hàng, nhấn "Hoàn tiền".
  2. Admin nhập số tiền hoàn và lý do.
  3. Hệ thống kiểm tra số tiền hoàn không vượt finalAmount.
  4. Hệ thống cập nhật Order → refunded.
  5. Nếu hoàn vào ví: tạo CreditTransaction type=refund, tăng số dư.
  6. Nếu cần thu hồi quyền học: gọi EnrollmentService thu hồi enrollment.
  7. Ghi AuditLog đầy đủ.
- **Luồng lỗi**: Số tiền hoàn > finalAmount → 400; Đơn không phải paid → 400 `ORDER_NOT_REFUNDABLE`.
- **Business rule áp dụng**: BR-ORD-007, BR-SYS-006.
- **Acceptance criteria**: Số dư ví tăng đúng sau hoàn tiền ví; AuditLog ghi đầy đủ.

---

## 12. User story

### US-ORD-001 — Thêm khóa học vào giỏ hàng
- **Với vai trò**: Học viên
- **Tôi muốn**: Thêm khóa học vào giỏ hàng
- **Để**: Có thể thanh toán sau khi đã chọn xong
- **Priority**: Must
- **Given**: Tôi đã đăng nhập, chưa có enrollment với khóa học này
- **When**: Tôi nhấn "Thêm vào giỏ" trên trang chi tiết khóa học
- **Then**: Khóa học xuất hiện trong giỏ hàng với giá đúng; tổng tiền được tính lại
- **Test scenario**: Thêm mới → thành công; thêm lại sản phẩm đã có → thông báo đã có trong giỏ

### US-ORD-002 — Áp mã giảm giá
- **Với vai trò**: Học viên
- **Tôi muốn**: Nhập mã coupon để được giảm giá
- **Để**: Tiết kiệm chi phí mua khóa học
- **Priority**: Must
- **Given**: Giỏ hàng có sản phẩm, tôi có mã coupon hợp lệ
- **When**: Tôi nhập mã coupon và nhấn "Áp dụng"
- **Then**: Số tiền giảm và tổng mới hiển thị rõ ràng
- **Rule liên quan**: BR-ORD-005
- **Test scenario**: Coupon hợp lệ → giảm giá đúng; coupon hết hạn → lỗi rõ ràng

### US-ORD-003 — Thanh toán bằng ví credit
- **Với vai trò**: Học viên
- **Tôi muốn**: Dùng số dư ví để thanh toán ngay
- **Để**: Mua khóa học và truy cập ngay lập tức không cần chờ xác nhận
- **Priority**: Must
- **Given**: Số dư ví đủ, giỏ hàng có sản phẩm
- **When**: Tôi chọn "Thanh toán bằng ví" và xác nhận
- **Then**: Đơn hàng tạo với trạng thái paid; ví trừ đúng số tiền; tôi có thể học ngay
- **Rule liên quan**: BR-ORD-001, BR-ORD-008
- **Test scenario**: Số dư đủ → thành công; số dư không đủ → lỗi INSUFFICIENT_CREDIT

### US-ORD-004 — Thanh toán qua PayOS
- **Với vai trò**: Học viên
- **Tôi muốn**: Thanh toán bằng thẻ hoặc ngân hàng qua PayOS
- **Để**: Mua khóa học khi không có đủ số dư ví
- **Priority**: Must
- **Given**: Giỏ hàng có sản phẩm
- **When**: Tôi chọn PayOS và nhấn thanh toán
- **Then**: Tôi được chuyển đến trang PayOS; sau khi thanh toán thành công, nhận quyền học
- **Rule liên quan**: BR-ORD-004
- **Test scenario**: Thanh toán thành công → webhook → quyền học được cấp; webhook giả mạo → bị từ chối

### US-ORD-005 — Xem lịch sử đơn hàng
- **Với vai trò**: Học viên
- **Tôi muốn**: Xem tất cả đơn hàng đã đặt
- **Để**: Kiểm tra trạng thái thanh toán và những gì đã mua
- **Priority**: Must
- **Given**: Tôi đã đặt ít nhất một đơn hàng
- **When**: Tôi vào trang "Lịch sử đơn hàng"
- **Then**: Thấy danh sách đơn theo thứ tự mới nhất, kèm trạng thái và tổng tiền
- **Test scenario**: Có đơn → hiển thị; chỉ thấy đơn của mình; không thấy đơn người khác

### US-ORD-006 — Hủy đơn hàng chưa thanh toán
- **Với vai trò**: Học viên
- **Tôi muốn**: Hủy đơn hàng đang chờ thanh toán
- **Để**: Không bị giữ đơn không cần thiết
- **Priority**: Should
- **Given**: Tôi có đơn hàng status=pending
- **When**: Tôi nhấn "Hủy đơn" và xác nhận
- **Then**: Đơn chuyển sang cancelled; không mất tiền vì chưa thanh toán
- **Test scenario**: Đơn pending → hủy được; đơn đã paid → không hủy được

### US-ORD-007 — Admin quản lý coupon
- **Với vai trò**: Admin
- **Tôi muốn**: Tạo và quản lý các mã coupon giảm giá
- **Để**: Triển khai chương trình khuyến mãi
- **Priority**: Must
- **Given**: Tôi có permission coupon:manage
- **When**: Tôi tạo coupon với các tham số hợp lệ
- **Then**: Coupon được tạo với status=active; học viên có thể dùng ngay
- **Test scenario**: Tạo coupon percent 20% → giảm đúng; coupon hết hạn → không áp được

### US-ORD-008 — Admin xem tổng quan đơn hàng
- **Với vai trò**: Admin tài chính
- **Tôi muốn**: Xem và lọc tất cả đơn hàng trong hệ thống
- **Để**: Theo dõi doanh thu và xử lý vấn đề
- **Priority**: Must
- **Given**: Tôi có permission order:read:all
- **When**: Tôi truy cập trang quản lý đơn hàng admin
- **Then**: Thấy danh sách đơn hàng của tất cả user; có thể lọc theo trạng thái và khoảng thời gian
- **Test scenario**: Lọc status=paid → chỉ hiện đơn đã thanh toán; tìm kiếm theo user → đúng kết quả

---

## 13. Luồng nghiệp vụ chi tiết

### Luồng 1: Thanh toán bằng ví credit

```
[Học viên] → Nhấn "Thanh toán bằng ví"
     ↓
[OrderService] → Tính lại giá từ sản phẩm trong giỏ (backend)
[OrderService] → Kiểm tra coupon nếu có (xác thực lại)
[OrderService] → Tạo Order + OrderItem (trong transaction)
     ↓
[CreditWalletService] → Kiểm tra balance >= finalAmount
     ↓ (không đủ)
[API] → Trả 400 INSUFFICIENT_CREDIT; rollback transaction
     ↓ (đủ)
[CreditWalletService] → Trừ balance; tạo CreditTransaction type=deduct
[OrderService] → Cập nhật Order status=paid, paidAt=now
[CouponService] → Ghi CouponUsage (nếu có coupon)
     ↓ (commit transaction)
[AccessGrantService] → Gọi EnrollmentService cho từng product là khóa học
[AccessGrantService] → Gọi ActivationService cho từng product là bundle/sách
[CartService] → Xóa giỏ hàng
[API] → Trả { orderId, status: 'paid', accessGranted: [...] }
```

### Luồng 2: Thanh toán PayOS + xử lý webhook

```
[Học viên] → Nhấn "Thanh toán qua PayOS"
     ↓
[OrderService] → Tạo Order (status=pending) + Payment + PaymentTransaction (status=pending)
[PayOSAdapter] → Gọi PayOS API tạo payment link
[API] → Trả { orderId, paymentUrl }
[Học viên] → Redirect đến PayOS, thanh toán
     ↓
[PayOS] → Gửi POST /api/payments/webhook/payos
     ↓
[WebhookProcessor] → Xác thực chữ ký HMAC
     ↓ (sai chữ ký)
[API] → Trả 400, bỏ qua
     ↓ (đúng chữ ký)
[WebhookProcessor] → Lấy idempotencyKey từ payload
[WebhookProcessor] → Kiểm tra idempotencyKey đã xử lý chưa
     ↓ (đã xử lý rồi)
[API] → Trả 200 OK, bỏ qua
     ↓ (chưa xử lý)
[WebhookProcessor] → Ghi idempotencyKey vào PaymentTransaction
[OrderService] → Cập nhật Order → paid; Payment → success
[AccessGrantService] → Cấp quyền truy cập sản phẩm
[API] → Trả 200 OK
```

### Luồng 3: Tạo đơn hàng và tính giá backend

```
[Học viên] → POST /api/orders { paymentMethod }
     ↓
[OrderService] → Lấy CartItem của user
[OrderService] → Với mỗi CartItem: lấy giá sản phẩm hiện tại từ DB (KHÔNG từ request)
[OrderService] → Tính subtotal = Σ (unitPrice * quantity)
[CouponService] → Xác thực coupon lại (nếu có)
[OrderService] → discountAmount = tính theo coupon rule
[OrderService] → finalAmount = subtotal - discountAmount
[OrderService] → Tạo Order (snapshot: productName, unitPrice bất biến trong OrderItem)
     ↓ (paymentMethod=credit)
[CreditWalletService] → Xử lý thanh toán ví (luồng 1)
     ↓ (paymentMethod=payos)
[PayOSAdapter] → Tạo payment link (luồng 2)
     ↓ (paymentMethod=bank_transfer)
[OrderService] → Order status=pending; trả thông tin chuyển khoản
```

---

## 14. Business rule áp dụng

| Mã rule | Nội dung áp dụng trong module này |
|---|---|
| BR-ORD-001 | Không tin giá tiền từ client — tính lại hoàn toàn ở backend |
| BR-ORD-002 | Giá trong OrderItem bất biến sau khi Order được tạo |
| BR-ORD-003 | Đơn hàng chỉ chuyển sang paid sau khi payment được xác nhận hợp lệ |
| BR-ORD-004 | Webhook thanh toán phải xác thực chữ ký; xử lý idempotent theo idempotencyKey |
| BR-ORD-005 | Coupon phải được xác thực (hạn, lượt, điều kiện sản phẩm) trước khi áp |
| BR-ORD-006 | Sau thanh toán thành công phải cấp quyền truy cập sản phẩm ngay |
| BR-ORD-007 | Hủy đơn chỉ khi status=pending; hoàn tiền phải có quy trình kiểm duyệt |
| BR-ORD-008 | Số dư ví phải được cập nhật chính xác qua CreditTransaction ledger |
| BR-SYS-001 | Học viên chỉ xem đơn hàng và lịch sử credit của mình |
| BR-SYS-006 | Audit log bắt buộc cho: xác nhận thanh toán, hoàn tiền, điều chỉnh ví |

---

## 15. Validation

### Thêm sản phẩm vào giỏ
- `productType`: bắt buộc, phải là `course`, `bundle` hoặc `book`.
- `productId`: bắt buộc, sản phẩm phải tồn tại và đang active.
- Kiểm tra học viên chưa có enrollment với sản phẩm này.
- Kiểm tra sản phẩm chưa có trong giỏ.

### Áp coupon
- `couponCode`: bắt buộc, không rỗng.
- Coupon phải tồn tại, status=active, chưa hết expiresAt, còn lượt dùng.
- Đơn hàng phải đủ minOrderAmount nếu cấu hình.

### Tạo đơn hàng
- `paymentMethod`: bắt buộc, phải là `credit_wallet`, `bank_transfer` hoặc `payos`.
- Giỏ hàng không được rỗng.
- Tất cả sản phẩm phải còn hợp lệ tại thời điểm tạo đơn.

### Tạo coupon (admin)
- `code`: bắt buộc, 3–50 ký tự, chỉ chữ cái và số, unique.
- `type`: bắt buộc, `percent` hoặc `fixed_amount`.
- `value`: bắt buộc, dương; nếu type=percent thì value <= 100.
- `expiresAt`: nếu có phải là ngày trong tương lai.

---

## 16. State machine

### Trạng thái đơn hàng (Order)
```
pending → paid → refunded
pending → cancelled
```

| Trạng thái | Có thể hủy | Có thể hoàn tiền | Quyền học đã cấp |
|---|---|---|---|
| `pending` | Có (user/admin) | Không | Không |
| `paid` | Không (chỉ refund) | Có (admin) | Có |
| `cancelled` | Không | Không | Không |
| `refunded` | Không | Không | Có thể thu hồi |

### Trạng thái thanh toán (PaymentTransaction)
```
pending → success
pending → failed
```

### Trạng thái coupon
```
active ↔ inactive (admin chuyển)
```

### Trạng thái giao dịch credit (CreditTransaction)
- Bất biến sau khi tạo — không cho sửa hoặc xóa.
- Loại giao dịch: `top_up`, `deduct`, `refund`, `adjustment`.

---

## 17. Xử lý lỗi

| Mã lỗi | HTTP status | Trường hợp xảy ra | Thông điệp |
|---|---|---|---|
| `CART_EMPTY` | 400 | Tạo đơn khi giỏ rỗng | Giỏ hàng trống |
| `PRODUCT_NOT_FOUND` | 404 | Sản phẩm không tồn tại | Không tìm thấy sản phẩm |
| `PRODUCT_ALREADY_IN_CART` | 400 | Sản phẩm đã có trong giỏ | Sản phẩm đã có trong giỏ hàng |
| `PRODUCT_ALREADY_OWNED` | 400 | Đã có enrollment với sản phẩm | Bạn đã sở hữu sản phẩm này |
| `COUPON_NOT_FOUND` | 404 | Mã coupon không tồn tại | Mã giảm giá không hợp lệ |
| `COUPON_EXPIRED` | 400 | Coupon hết hạn | Mã giảm giá đã hết hạn |
| `COUPON_MAX_USES_REACHED` | 400 | Coupon hết lượt | Mã giảm giá đã được sử dụng hết |
| `COUPON_NOT_APPLICABLE` | 400 | Sản phẩm không áp được coupon | Mã giảm giá không áp dụng cho sản phẩm này |
| `INSUFFICIENT_CREDIT` | 400 | Số dư ví không đủ | Số dư ví không đủ để thanh toán |
| `ORDER_NOT_FOUND` | 404 | Đơn hàng không tồn tại | Không tìm thấy đơn hàng |
| `ORDER_NOT_CANCELLABLE` | 400 | Đơn không ở trạng thái pending | Đơn hàng không thể hủy ở trạng thái hiện tại |
| `ORDER_NOT_REFUNDABLE` | 400 | Đơn không phải paid | Đơn hàng không thể hoàn tiền |
| `INVALID_WEBHOOK_SIGNATURE` | 400 | Chữ ký webhook sai | — |
| `FORBIDDEN` | 403 | Không có permission | Bạn không có quyền thực hiện thao tác này |

---

## 18. Acceptance criteria

| Mã AC | Chức năng | Tiêu chí chấp nhận |
|---|---|---|
| AC-ORD-001 | Giá backend | Giá trong OrderItem bằng giá sản phẩm trong DB tại thời điểm tạo đơn |
| AC-ORD-002 | Coupon | Chỉ coupon hợp lệ (đúng hạn, còn lượt) mới được áp |
| AC-ORD-003 | Thanh toán ví | Số dư ví giảm đúng; CreditTransaction ghi balanceBefore/After chính xác |
| AC-ORD-004 | Webhook idempotent | Gửi cùng webhook 2 lần → chỉ xử lý 1 lần |
| AC-ORD-005 | Chữ ký webhook | Webhook sai chữ ký bị từ chối hoàn toàn |
| AC-ORD-006 | Cấp quyền | Enrollment được cấp ngay sau thanh toán thành công |
| AC-ORD-007 | Ownership | Học viên chỉ xem đơn của mình; không thấy đơn người khác |
| AC-ORD-008 | Hủy đơn | Chỉ hủy được khi status=pending |
| AC-ORD-009 | Giá bất biến | Giá sản phẩm thay đổi sau khi tạo đơn không ảnh hưởng OrderItem |
| AC-ORD-010 | Audit log | Hoàn tiền và cập nhật trạng thái admin đều có audit log |

---

## 19. Test/UAT scenario

| Mã kịch bản | Mô tả | Điều kiện | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|---|
| T-ORD-001 | Thêm sản phẩm vào giỏ | Chưa có trong giỏ | POST /api/cart/items | CartItem tạo; tổng giá tính đúng |
| T-ORD-002 | Thêm sản phẩm đã có trong giỏ | Sản phẩm đã trong giỏ | POST /api/cart/items lại | Trả 400 PRODUCT_ALREADY_IN_CART |
| T-ORD-003 | Thêm sản phẩm đã có enrollment | Đã enrolled | POST /api/cart/items | Trả 400 PRODUCT_ALREADY_OWNED |
| T-ORD-004 | Áp coupon hợp lệ | Coupon active, còn lượt | POST /api/cart/apply-coupon | Giảm giá đúng; tổng mới hiển thị |
| T-ORD-005 | Áp coupon hết hạn | coupon expiresAt đã qua | POST /api/cart/apply-coupon | Trả 400 COUPON_EXPIRED |
| T-ORD-006 | Tạo đơn hàng — giá backend | Sản phẩm A giá 100k; client gửi giá 1k | POST /api/orders | OrderItem.unitPrice = 100k (giá thực), không phải 1k |
| T-ORD-007 | Thanh toán ví đủ tiền | Ví có 500k, đơn 200k | POST /api/orders + chọn credit | Đơn paid; ví còn 300k; enrollment được cấp |
| T-ORD-008 | Thanh toán ví không đủ | Ví có 100k, đơn 200k | POST /api/orders + chọn credit | Trả 400 INSUFFICIENT_CREDIT |
| T-ORD-009 | Webhook PayOS hợp lệ | Order pending, chữ ký đúng | POST /api/payments/webhook/payos | Order → paid; enrollment cấp |
| T-ORD-010 | Webhook PayOS chữ ký sai | — | POST /api/payments/webhook/payos | Trả 400 INVALID_WEBHOOK_SIGNATURE |
| T-ORD-011 | Webhook trùng lần 2 | Đã xử lý lần 1 | POST webhook cùng payload lần 2 | Trả 200 OK; không cấp quyền lần 2 |
| T-ORD-012 | Hủy đơn pending | Order status=pending | POST /api/orders/{id}/cancel | Order → cancelled |
| T-ORD-013 | Hủy đơn đã paid | Order status=paid | POST /api/orders/{id}/cancel | Trả 400 ORDER_NOT_CANCELLABLE |
| T-ORD-014 | Admin xác nhận thanh toán chuyển khoản | Order pending, method=bank_transfer | PUT /api/admin/orders/{id}/status | Order → paid; enrollment cấp; audit log ghi |
| T-ORD-015 | Admin hoàn tiền vào ví | Order paid | POST /api/admin/orders/{id}/refund | Ví học viên tăng; CreditTransaction ghi; audit log |

---

## 20. Phụ thuộc module khác

### Module này phụ thuộc
- **Authentication**: kiểm tra token và permission.
- **Classroom** (EnrollmentService): cấp enrollment sau thanh toán thành công.
- **Book** (ActivationService): kích hoạt mã sách/bundle sau thanh toán.

### Module khác phụ thuộc module này
- **Reporting**: đọc Order, PaymentTransaction, CreditTransaction để tạo báo cáo doanh thu.
- **Classroom**: kiểm tra orderId khi tạo enrollment từ thanh toán.

### Nguyên tắc tích hợp
- AccessGrantService gọi EnrollmentService qua interface — không trực tiếp vào DB Classroom.
- Thanh toán phải được xác nhận trước khi gọi AccessGrantService — không cấp quyền trước.

---

## 21. Câu hỏi cần xác nhận

| Câu hỏi | Ảnh hưởng | Đề xuất tạm thời |
|---|---|---|
| Thời gian chờ đơn hàng pending trước khi tự động hủy là bao lâu? | Scheduler hủy đơn | Đề xuất: 24 giờ |
| Có giới hạn số lần dùng coupon per user không? | CouponService | Đề xuất: cấu hình maxUsesPerUser per coupon |
| Hoàn tiền có hoàn về ví hay hoàn về cổng thanh toán gốc? | RefundService | Đề xuất: hoàn về ví trong phiên bản đầu |
| Coupon có thể áp cho một số sản phẩm cụ thể không? | Coupon.applicableProductIds | Đề xuất: có, null = áp tất cả |
| Khi hoàn tiền, có thu hồi enrollment không? | AccessGrantService | Đề xuất: tuỳ chọn, admin quyết định khi xử lý |
| Giỏ hàng có được persist qua nhiều phiên không? | Cart model | Đề xuất: lưu trong DB gắn userId, tồn tại đến khi thanh toán |
| Có hỗ trợ đặt hàng nhiều sản phẩm cùng lúc không? | CartItem | Đề xuất: có, mỗi sản phẩm là một CartItem |
