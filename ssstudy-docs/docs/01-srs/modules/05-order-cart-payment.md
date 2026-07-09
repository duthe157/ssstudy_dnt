# Order / Cart / Payment — SRS mục tiêu

Mục tiêu: Thiết kế module giao dịch (Cart/Order/Payment/Credit/Coupon) từ đầu với các APIs, domain model, quy tắc nghiệp vụ và luồng thanh toán rõ ràng. Phần tham chiếu legacy đã được loại khỏi nội dung chính; mapping legacy giữ ở `docs/legacy-notes.md`.

## Phạm vi
- Cart lifecycle (create, update, merge on login)
- Checkout → Order creation
- Payment integrations (gateway adapters + webhook handling)
- Wallet/credit and top-up flows
- Coupon validation and discount application
- Admin order management and exports

## Actors & Roles

| Actor | Role | Notes |
|---|---|---|
| Guest | Temporary cart in frontend | Cart persisted client-side until login |
| Student | Cart owner, Checkout actor | Needs auth to persist cart server-side and create orders |
| Admin | Order management & reconciliation | Manage statuses, refunds, manual adjustments |

## Feature list

| Code | Feature | API proposal | Priority |
|---|---|---|---|
| ORD-01 | Cart management (add/update/delete) | `POST /api/cart/*` | Must |
| ORD-02 | Apply/Remove coupon | `POST /api/cart/apply-coupon` | Must |
| ORD-03 | Create order & payment flow | `POST /api/orders` | Must |
| ORD-04 | Order history & detail | `GET /api/orders` / `GET /api/orders/{id}` | Must |
| ORD-05 | Wallet/Credit top-up & hook | `POST /api/credits/*`, `/api/credits/hook` | Should |
| ORD-06 | Admin order & reconciliation | `GET/PUT /api/admin/orders` | Should |

## API proposals (key endpoints)

| API | Method | Endpoint | Purpose | Auth |
|---|---:|---|---|---:|
| API-ORD-001 | GET | `/api/cart` | Get current cart | Yes/Temp |
| API-ORD-002 | POST | `/api/cart/items` | Add item to cart | Yes/Temp |
| API-ORD-003 | PUT | `/api/cart/items/{id}` | Update item | Yes |
| API-ORD-004 | POST | `/api/cart/apply-coupon` | Apply coupon | Yes |
| API-ORD-005 | POST | `/api/orders` | Create order & trigger payment | Yes |
| API-ORD-006 | GET | `/api/orders/{id}` | Order detail | Yes |
| API-ORD-007 | POST | `/api/credits/topup` | Create credit transaction | Yes |
| API-ORD-008 | POST | `/api/webhooks/payments` | Payment gateway webhook | No (verify signature) |

## Domain model (summary)

Models: Cart, CartItem, Order, OrderItem, PaymentTransaction, CreditLog, Coupon

Key rules:
- Cart merges on login (client → server)
- Pricing immutable in OrderItems once created
- Payment webhooks update Order/PaymentTransaction atomically

## Architecture notes

- Implement payment adapters for each gateway (PayOS, bank transfer) with a common interface.
- Webhooks must be idempotent and verified via signature/secrets stored in secrets manager.
- Order creation should be transactional: reserve inventory/assign seats then initiate payment; handle compensation on failure.

## UI requirements

Pages: Cart (`/gio-hang`), Checkout/Payment, Order history, Admin order dashboard, Wallet top-up.

UX notes:
- Show clear pricing breakdown (subtotal, discounts, fees, total).
- Provide retry and clear error states for failed payments.

## Use cases (examples)

UC-ORD-001 — Checkout with wallet balance
- Precondition: user has sufficient credit
- Flow: create order → debit wallet → mark PAID → grant course access

UC-ORD-002 — Pay with external gateway
- Flow: create order PENDING → redirect/pay → webhook confirms → mark PAID

## User stories (examples)

- As a student, I want to apply a coupon to my cart to get a discount. (Must)
- As a student, I want to pay with my wallet so I can immediately access purchased courses. (Should)

## Acceptance tests (high level)

- Cart add/update/delete maintains correct totals
- Order creation reflects cart snapshot and locks pricing
- Payment webhook transitions order to PAID and grants access
- Coupons validate by rules (time, product eligibility, usage limits)

## Migration & legacy notes

Map legacy endpoints and controllers to new APIs in `docs/legacy-notes.md` if migrating data; do not include legacy source links in SRS.


