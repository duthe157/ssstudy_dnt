# Feature matrix — mapping to SRS proposals

Purpose: map proposed SRS features to recommended UI routes, API proposals, required business services and domain models. This matrix is target-first and does not reference legacy controllers.

| Mã chức năng | Tên chức năng | Actor | Màn hình đề xuất | API đề xuất | Dịch vụ nghiệp vụ cần có | Dữ liệu/model liên quan | Quy tắc áp dụng | Priority |
|---|---|---|---|---|---|---|---|---|
| ORD-01 | Quản lý giỏ hàng | STUDENT | `/cart` | `GET /api/cart`, `POST /api/cart/items`, `PUT /api/cart/items/:id`, `DELETE /api/cart/items/:id` | CartService: session/cart merge, price calculation, coupon application | Cart, CartItem, Coupon | BR-ORDER-001, BR-ORDER-002 | Must |
| ORD-02 | Áp dụng mã khuyến mại | STUDENT | `/cart` | `POST /api/cart/apply-coupon` | PromotionService: validate coupon, stacking rules, expiry | Coupon, Cart | BR-PROMO-001 | Must |
| ORD-03 | Tạo đơn hàng và thanh toán | STUDENT | `/checkout` | `POST /api/orders` | OrderService: create order, reserve inventory, initiate payment | Order, OrderItem, PaymentTransaction | BR-PAY-001, BR-PAY-002 | Must |
| ORD-04 | Xem lịch sử đơn hàng | STUDENT | `/account/orders` | `GET /api/orders` | OrderQueryService: pagination, filtering by status | Order, OrderItem | BR-PRIV-001 | Should |

Notes:
- Use BR-* rule IDs from `docs/business-rules.md` to document business invariants referenced in the matrix.
- Priority values guide implementation order; modules with many Must items should be prioritized in the first sprint.
