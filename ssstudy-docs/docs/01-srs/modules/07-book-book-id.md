# Book / Book Code / Course Bundle — SRS mục tiêu

> Tài liệu đặc tả yêu cầu phần mềm (SRS) cho module Book/Book Code/Bundle của hệ thống SSStudy.
> Viết như thể hệ thống chưa có code. Mục tiêu: đủ chi tiết để developer triển khai hoàn chỉnh chỉ từ tài liệu này.

---

## 1. Mục tiêu nghiệp vụ

Module Book quản lý sách, mã kích hoạt và bundle khóa học trong hệ thống SSStudy:

- Hiển thị danh mục sách để học viên tìm kiếm và mua.
- Quản lý mã kích hoạt (BookCode) được in kèm sách; mỗi mã dùng một lần để mở khóa bundle.
- Sinh mã hàng loạt và import danh sách mã cho admin.
- Học viên kích hoạt mã → nhận quyền truy cập các khóa học trong bundle gắn với sách.
- Chống dùng lại mã; kiểm soát hạn sử dụng mã.
- Admin theo dõi trạng thái từng mã và lịch sử kích hoạt.
- Quản lý bundle: một bundle gồm nhiều khóa học, kích hoạt qua mã hoặc qua đơn hàng.

---

## 2. Phạm vi chức năng

| STT | Chức năng | Mô tả ngắn |
|---|---|---|
| 1 | Danh mục sách | Hiển thị danh sách sách đang bán |
| 2 | Chi tiết sách | Thông tin sách, bundle đi kèm, mã kích hoạt |
| 3 | Sách liên quan | Gợi ý sách cùng loại |
| 4 | Kích hoạt mã sách | Học viên nhập mã → nhận quyền học bundle |
| 5 | Xem lịch sử kích hoạt | Học viên xem các mã đã kích hoạt và quyền đã nhận |
| 6 | Kiểm tra quyền sở hữu | Xác nhận học viên đã kích hoạt sách nào |
| 7 | Admin tạo/sửa sách | CRUD thông tin sách |
| 8 | Admin tạo/sửa bundle | CRUD bundle và danh sách khóa học trong bundle |
| 9 | Admin sinh mã hàng loạt | Tạo batch BookCode cho một sách/bundle |
| 10 | Admin import mã | Import danh sách mã từ file CSV |
| 11 | Admin xem trạng thái mã | Theo dõi mã đã dùng, chưa dùng, hết hạn |
| 12 | Admin gán bundle vào sách | Liên kết bundle với sách |
| 13 | Admin hủy mã | Vô hiệu hóa mã chưa kích hoạt |

---

## 3. Ngoài phạm vi

- Bán sách vật lý và quản lý kho.
- Giao hàng và vận chuyển.
- In mã QR lên sách (chỉ sinh mã text).
- Thanh toán và tạo đơn hàng sách (thuộc module Order/Payment).
- Hệ thống đánh giá sách chi tiết (chỉ hiển thị metadata).

---

## 4. Actor

| Actor | Mô tả | Quyền cơ bản |
|---|---|---|
| Guest | Chưa đăng nhập | Xem danh mục sách và chi tiết sách công khai |
| student | Học viên đã đăng nhập | Kích hoạt mã sách, xem lịch sử kích hoạt, truy cập bundle đã kích hoạt |
| admin | Quản trị viên | Quản lý sách, bundle, mã kích hoạt, xem báo cáo |
| superAdmin | Quản trị cấp cao | Toàn quyền bao gồm hủy mã và cấu hình hệ thống |

---

## 5. Permission

| Mã permission | Mô tả | Role mặc định |
|---|---|---|
| `book:read:all` | Xem tất cả sách kể cả chưa xuất bản | admin, superAdmin |
| `book:create` | Tạo sách mới | admin, superAdmin |
| `book:update` | Cập nhật thông tin sách | admin, superAdmin |
| `book:delete` | Xóa mềm sách | admin, superAdmin |
| `book:publish` | Xuất bản hoặc ẩn sách | admin, superAdmin |
| `bundle:manage` | Tạo/sửa/xóa bundle | admin, superAdmin |
| `book-code:read` | Xem danh sách và trạng thái mã | admin, superAdmin |
| `book-code:generate` | Sinh mã hàng loạt | admin, superAdmin |
| `book-code:import` | Import mã từ file | admin, superAdmin |
| `book-code:cancel` | Hủy mã chưa kích hoạt | admin, superAdmin |

---

## 6. Danh sách chức năng

| Mã chức năng | Tên chức năng | Actor | Màn hình đề xuất | API đề xuất | Dịch vụ nghiệp vụ cần có | Dữ liệu/model liên quan | Quy tắc áp dụng | Priority |
|---|---|---|---|---|---|---|---|---|
| BOOK-01 | Danh sách sách | Guest, student | `/books` | `GET /api/books` | Lọc theo danh mục, từ khóa; chỉ published | Book | BR-CONTENT-001 | Must |
| BOOK-02 | Chi tiết sách | Guest, student | `/books/{bookId}` | `GET /api/books/{bookId}` | Thông tin sách, bundle đi kèm, trạng thái sở hữu của user | Book, Bundle | BR-CONTENT-001 | Must |
| BOOK-03 | Sách liên quan | Guest, student | `/books/{bookId}` | `GET /api/books/{bookId}/related` | Gợi ý sách cùng loại | Book | — | Should |
| BOOK-04 | Kích hoạt mã sách | student | `/activate` | `POST /api/book-codes/activate` | Xác thực mã, cấp quyền học bundle, ghi Activation | BookCode, Activation, Bundle | BR-BOOK-001, BR-BOOK-002, BR-BOOK-003 | Must |
| BOOK-05 | Lịch sử kích hoạt | student | `/account/my-books` | `GET /api/me/book-activations` | Danh sách mã đã kích hoạt và bundle đã nhận | Activation, Bundle | BR-SYS-001 | Must |
| BOOK-06 | Kiểm tra sở hữu | student | — | `GET /api/me/books/{bookId}/ownership` | Kiểm tra học viên đã kích hoạt sách/bundle chưa | Activation | — | Should |
| BOOK-07 | Admin tạo/sửa sách | admin | `/admin/books` | CRUD `/api/admin/books` | Validate, tạo/sửa Book, gán bundle | Book | `book:create`, `book:update` | Must |
| BOOK-08 | Admin xuất bản/ẩn sách | admin | `/admin/books/{bookId}` | `PUT /api/admin/books/{bookId}/publish` | Cập nhật trạng thái | Book | `book:publish` | Must |
| BOOK-09 | Admin tạo/sửa bundle | admin | `/admin/bundles` | CRUD `/api/admin/bundles` | Tạo bundle, gán danh sách khóa học | Bundle, BundleItem | `bundle:manage` | Must |
| BOOK-10 | Admin sinh mã hàng loạt | admin | `/admin/books/{bookId}/codes` | `POST /api/admin/books/{bookId}/code-batches` | Sinh N mã unique cho sách/bundle | CodeBatch, BookCode | `book-code:generate` | Must |
| BOOK-11 | Admin import mã từ file | admin | `/admin/books/{bookId}/codes/import` | `POST /api/admin/book-codes/import` | Validate và import BookCode từ CSV | CodeBatch, BookCode | `book-code:import` | Should |
| BOOK-12 | Admin xem trạng thái mã | admin | `/admin/books/{bookId}/codes` | `GET /api/admin/books/{bookId}/codes` | Danh sách mã, trạng thái, ai đã kích hoạt | BookCode, Activation | `book-code:read` | Must |
| BOOK-13 | Admin hủy mã | admin | `/admin/books/{bookId}/codes` | `POST /api/admin/book-codes/{codeId}/cancel` | Vô hiệu hóa mã chưa kích hoạt | BookCode | `book-code:cancel` | Should |

---

## 7. Thiết kế dữ liệu / Domain model đề xuất

### Model chính

| Model | Mục đích | Field quan trọng | Quan hệ |
|---|---|---|---|
| Book | Thông tin sách | id, title, code, status, price, bundleId | Có một Bundle chính; có nhiều BookCode |
| BookCode | Mã kích hoạt | id, bookId, code, status, expiresAt | FK tới Book, CodeBatch |
| CodeBatch | Lô mã sinh hàng loạt | id, bookId, totalCodes, generatedAt, note | FK tới Book |
| Bundle | Gói học (nhiều khóa học) | id, name, description, status | Có nhiều BundleItem |
| BundleItem | Khóa học trong bundle | id, bundleId, productType, productId | FK tới Bundle |
| Activation | Lịch sử kích hoạt mã | id, bookCodeId, userId, activatedAt, bundleId | FK tới BookCode, User, Bundle |
| AccessGrant | Quyền truy cập được cấp | id, activationId, userId, productType, productId, expiresAt | FK tới Activation, User |
| ProductMapping | Ánh xạ sản phẩm trong bundle | id, bundleId, courseId, accessDurationDays | FK tới Bundle, Course |

### Field chi tiết

#### Model: Book
| Field | Kiểu dữ liệu | Bắt buộc | Ý nghĩa | Validation |
|---|---|---|---|---|
| id | UUID | Có | Khóa chính | |
| code | varchar(50) | Có | Mã sách nội bộ | Unique |
| title | varchar(255) | Có | Tên sách | Không rỗng |
| slug | varchar(255) | Có | URL-friendly | Unique |
| description | text | Không | Mô tả sách | |
| coverUrl | varchar(500) | Không | Ảnh bìa | URL hợp lệ |
| price | numeric(12,2) | Không | Giá bán (nếu bán kèm đơn hàng) | |
| bundleId | UUID FK | Không | Bundle mặc định khi kích hoạt mã | |
| status | enum | Có | Trạng thái | draft, published, archived |
| createdAt | timestamp | Có | | Auto |

#### Model: BookCode
| Field | Kiểu dữ liệu | Bắt buộc | Ý nghĩa | Validation |
|---|---|---|---|---|
| id | UUID | Có | Khóa chính | |
| bookId | UUID FK | Có | Thuộc sách | |
| batchId | UUID FK | Không | Thuộc lô sinh | |
| code | varchar(100) | Có | Mã kích hoạt | Unique, uppercase |
| status | enum | Có | Trạng thái | unused, activated, expired, cancelled |
| expiresAt | timestamp | Không | Hạn kích hoạt | Null = không hết hạn |
| activatedByUserId | UUID FK | Không | Ai đã kích hoạt | Null nếu chưa dùng |
| activatedAt | timestamp | Không | Thời điểm kích hoạt | |

#### Model: Bundle
| Field | Kiểu dữ liệu | Bắt buộc | Ý nghĩa | Validation |
|---|---|---|---|---|
| id | UUID | Có | Khóa chính | |
| name | varchar(255) | Có | Tên bundle | Không rỗng |
| description | text | Không | Mô tả | |
| accessDurationDays | int | Không | Số ngày truy cập sau kích hoạt | Null = không hết hạn |
| status | enum | Có | Trạng thái | active, inactive |

#### Model: Activation
| Field | Kiểu dữ liệu | Bắt buộc | Ý nghĩa | Validation |
|---|---|---|---|---|
| id | UUID | Có | Khóa chính | |
| bookCodeId | UUID FK | Có | Mã được kích hoạt | Unique — mỗi mã chỉ có một activation |
| userId | UUID FK | Có | Người kích hoạt | |
| bundleId | UUID FK | Có | Bundle được cấp | |
| activatedAt | timestamp | Có | Thời điểm kích hoạt | Auto |

#### Model: CodeBatch
| Field | Kiểu dữ liệu | Bắt buộc | Ý nghĩa | Validation |
|---|---|---|---|---|
| id | UUID | Có | Khóa chính | |
| bookId | UUID FK | Có | Thuộc sách | |
| totalCodes | int | Có | Số mã trong lô | Dương |
| note | varchar(255) | Không | Ghi chú lô | |
| expiresAt | timestamp | Không | Hạn áp dụng cho toàn lô | |
| generatedAt | timestamp | Có | Thời điểm sinh | Auto |

### Quan hệ dữ liệu
- Book `1—1` Bundle (bundle mặc định).
- Book `1—N` BookCode.
- BookCode `N—1` CodeBatch.
- BookCode `1—1` Activation.
- Activation `1—N` AccessGrant (một activation cấp nhiều quyền cho nhiều khóa).
- Bundle `1—N` BundleItem.

### Index / Constraint đề xuất

| Bảng | Index / Constraint | Mục đích |
|---|---|---|
| Book | UNIQUE(code) | Mã sách nội bộ duy nhất |
| Book | UNIQUE(slug) | URL duy nhất |
| Book | INDEX(status) | Lọc sách published nhanh |
| BookCode | UNIQUE(code) | Mã kích hoạt duy nhất toàn hệ thống |
| BookCode | INDEX(bookId, status) | Lọc mã theo sách và trạng thái |
| Activation | UNIQUE(bookCodeId) | Mỗi mã chỉ được kích hoạt một lần |
| Activation | INDEX(userId) | Lịch sử kích hoạt của user |
| AccessGrant | INDEX(userId, productType, productId) | Kiểm tra quyền nhanh |

---

## 8. Thiết kế kiến trúc module

### Thành phần cần có

| Thành phần | Vai trò | Ghi chú triển khai |
|---|---|---|
| API layer (Controller) | Nhận request, validate, gọi service | Không chứa business logic |
| BookService | Lấy danh sách và chi tiết sách | Chỉ trả published với API public |
| BookCodeActivationService | Xác thực mã, kiểm tra trạng thái, cấp quyền | Core business logic; chạy trong DB transaction |
| BundleService | Quản lý bundle và BundleItem | Trả danh sách khóa học trong bundle |
| AccessGrantService | Tạo AccessGrant cho từng sản phẩm trong bundle | Gọi EnrollmentService (Classroom) |
| CodeGeneratorService | Sinh mã unique ngẫu nhiên hàng loạt | Đảm bảo unique trong DB |
| CodeImportService | Validate và import mã từ CSV | Ghi ImportBatch, log lỗi từng dòng |
| AdminBookService | CRUD sách, bundle, sinh/hủy mã | Gọi repository, ghi audit log |
| BookRepository | Truy vấn và cập nhật Book, BookCode | |
| AuditLogger | Ghi audit log | Gọi async |

### Dependency
- Module Book phụ thuộc Authentication để kiểm tra token và permission.
- Module Book phụ thuộc Classroom (EnrollmentService) để cấp enrollment khi kích hoạt mã.
- Module Order/Payment gọi BookCodeActivationService khi đơn hàng bundle được thanh toán.

### Nguyên tắc triển khai
- Kích hoạt mã phải là atomic: kiểm tra trạng thái mã, tạo Activation, cập nhật BookCode, tạo AccessGrant trong một DB transaction.
- Chống race condition: dùng DB-level lock hoặc optimistic concurrency khi update BookCode.status.
- AccessGrant tính expiresAt = activatedAt + Bundle.accessDurationDays (nếu cấu hình).
- Mã hết hạn (expiresAt < now) không được kích hoạt, dù status=unused.
- Mã bị hủy (status=cancelled) không được kích hoạt.

---

## 9. Yêu cầu giao diện

| Màn hình | Route đề xuất | Actor | Mục đích | API sử dụng |
|---|---|---|---|---|
| Danh sách sách | `/books` | Guest, student | Tìm kiếm, lọc sách | `GET /api/books` |
| Chi tiết sách | `/books/{bookId}` | Guest, student | Xem thông tin, bundle, mã kích hoạt | `GET /api/books/{bookId}` |
| Kích hoạt mã | `/activate` | student | Nhập mã và kích hoạt | `POST /api/book-codes/activate` |
| Sách đã kích hoạt | `/account/my-books` | student | Lịch sử và quyền học đã nhận | `GET /api/me/book-activations` |
| Quản lý sách (admin) | `/admin/books` | admin | Danh sách, tạo, sửa | CRUD `/api/admin/books` |
| Quản lý bundle (admin) | `/admin/bundles` | admin | Tạo bundle, gán khóa học | CRUD `/api/admin/bundles` |
| Quản lý mã (admin) | `/admin/books/{bookId}/codes` | admin | Xem trạng thái, sinh, hủy mã | Code APIs |
| Sinh mã hàng loạt (admin) | `/admin/books/{bookId}/codes/generate` | admin | Nhập số lượng, sinh mã | `POST /api/admin/books/{bookId}/code-batches` |

**Yêu cầu UI chi tiết:**
- Trang kích hoạt: ô nhập mã nổi bật; sau khi kích hoạt hiển thị danh sách khóa học vừa được mở khóa.
- Trang chi tiết sách: nếu đã kích hoạt → hiển thị "Đã kích hoạt" và link vào khóa học.
- Admin quản lý mã: bảng có filter theo trạng thái (unused/activated/expired/cancelled); hiển thị ai đã kích hoạt, khi nào.

---

## 10. API đề xuất

| Mã API | Method | Endpoint đề xuất | Mục đích | Auth required | Permission | Request chính | Response chính | Business rule | Ghi chú |
|---|---|---|---|---|---|---|---|---|---|
| API-BOOK-001 | GET | `/api/books` | Danh sách sách | Không | Không | `?q, page, limit` | `{ items, total }` | BR-CONTENT-001 | Chỉ published |
| API-BOOK-002 | GET | `/api/books/{bookId}` | Chi tiết sách | Không | Không | — | `{ book, bundle, isActivated }` | BR-CONTENT-001 | isActivated=false nếu chưa đăng nhập |
| API-BOOK-003 | GET | `/api/books/{bookId}/related` | Sách liên quan | Không | Không | — | `{ items }` | — | |
| API-BOOK-004 | POST | `/api/book-codes/activate` | Kích hoạt mã sách | Có | Không | `{ code }` | `{ activation, bundle, accessGrants }` | BR-BOOK-001, BR-BOOK-002, BR-BOOK-003 | Atomic; chống race condition |
| API-BOOK-005 | GET | `/api/me/book-activations` | Lịch sử kích hoạt | Có | Không | `?page, limit` | `{ items, total }` | BR-SYS-001 | Chỉ của user hiện tại |
| API-BOOK-006 | GET | `/api/me/books/{bookId}/ownership` | Kiểm tra sở hữu | Có | Không | — | `{ isActivated, activatedAt, expiresAt }` | — | |
| API-BOOK-007 | GET | `/api/admin/books` | Danh sách sách (admin) | Có | `book:read:all` | `?status, q, page` | `{ items, total }` | — | Bao gồm draft |
| API-BOOK-008 | POST | `/api/admin/books` | Tạo sách | Có | `book:create` | `{ title, code, price?, bundleId? }` | `{ bookId }` | — | |
| API-BOOK-009 | PUT | `/api/admin/books/{bookId}` | Sửa sách | Có | `book:update` | `{ title, description, coverUrl, ... }` | `{ ok }` | — | |
| API-BOOK-010 | PUT | `/api/admin/books/{bookId}/publish` | Xuất bản/ẩn sách | Có | `book:publish` | `{ publish: true/false }` | `{ ok, status }` | — | |
| API-BOOK-011 | GET | `/api/admin/bundles` | Danh sách bundle | Có | `bundle:manage` | `?page, limit` | `{ items, total }` | — | |
| API-BOOK-012 | POST | `/api/admin/bundles` | Tạo bundle | Có | `bundle:manage` | `{ name, accessDurationDays?, items: [{productType, productId}] }` | `{ bundleId }` | — | |
| API-BOOK-013 | PUT | `/api/admin/bundles/{bundleId}` | Sửa bundle | Có | `bundle:manage` | `{ name, items, ... }` | `{ ok }` | — | |
| API-BOOK-014 | POST | `/api/admin/books/{bookId}/code-batches` | Sinh mã hàng loạt | Có | `book-code:generate` | `{ quantity, expiresAt?, note? }` | `{ batchId, codes }` | — | |
| API-BOOK-015 | POST | `/api/admin/book-codes/import` | Import mã từ CSV | Có | `book-code:import` | `multipart/form-data` | `{ imported, failed, errors }` | — | |
| API-BOOK-016 | GET | `/api/admin/books/{bookId}/codes` | Xem danh sách mã | Có | `book-code:read` | `?status, page, limit` | `{ items, total }` | — | |
| API-BOOK-017 | POST | `/api/admin/book-codes/{codeId}/cancel` | Hủy mã | Có | `book-code:cancel` | `{ reason? }` | `{ ok }` | — | Chỉ hủy khi status=unused |

---

## 11. Use case nghiệp vụ

### UC-BOOK-001 — Học viên kích hoạt mã sách

- **Mục tiêu**: Học viên dùng mã in trong sách để mở khóa các khóa học trong bundle.
- **Actor chính**: student.
- **Điều kiện trước**: Học viên đã đăng nhập; có mã sách chưa kích hoạt.
- **Trigger**: Học viên truy cập trang kích hoạt và nhập mã.
- **Luồng chính**:
  1. Học viên nhập mã sách vào ô kích hoạt.
  2. Hệ thống tìm BookCode theo mã.
  3. Hệ thống kiểm tra status=unused.
  4. Hệ thống kiểm tra expiresAt chưa qua (nếu có).
  5. Trong một transaction: cập nhật BookCode → activated; tạo Activation; tạo AccessGrant cho từng khóa học trong bundle.
  6. AccessGrantService gọi EnrollmentService để tạo Enrollment.
  7. Trả về danh sách khóa học vừa được mở khóa.
- **Luồng lỗi**:
  - Mã không tồn tại → 404 `BOOK_CODE_NOT_FOUND`.
  - Mã đã kích hoạt → 400 `BOOK_CODE_ALREADY_ACTIVATED`.
  - Mã hết hạn → 400 `BOOK_CODE_EXPIRED`.
  - Mã đã bị hủy → 400 `BOOK_CODE_CANCELLED`.
- **Business rule áp dụng**: BR-BOOK-001, BR-BOOK-002, BR-BOOK-003.
- **Permission áp dụng**: Phải đăng nhập.
- **Acceptance criteria**: Mã chỉ kích hoạt được một lần; mã hết hạn bị từ chối; quyền học được cấp ngay sau kích hoạt.
- **Ghi chú triển khai**: Dùng DB transaction và row-level lock để tránh race condition khi hai user kích hoạt cùng mã.

---

### UC-BOOK-002 — Admin sinh mã hàng loạt

- **Mục tiêu**: Admin tạo batch mã kích hoạt để in kèm sách.
- **Actor chính**: admin.
- **Điều kiện trước**: Sách đã tồn tại; admin có permission `book-code:generate`.
- **Luồng chính**:
  1. Admin chọn sách, nhập số lượng cần sinh, ngày hết hạn (tuỳ chọn).
  2. Hệ thống tạo CodeBatch.
  3. CodeGeneratorService sinh N mã unique (kiểm tra trùng trong DB).
  4. Mã được lưu vào BookCode với status=unused.
  5. Trả về batchId và danh sách mã (hoặc link download).
- **Luồng lỗi**: Số lượng quá lớn (> giới hạn cấu hình) → 400; sinh mã thất bại → 500.
- **Business rule áp dụng**: BR-BOOK-001.
- **Acceptance criteria**: Không có mã trùng; batchId ghi nhận tổng số mã; có thể export ra CSV.

---

### UC-BOOK-003 — Admin hủy mã chưa kích hoạt

- **Mục tiêu**: Admin vô hiệu hóa mã bị mất hoặc lỗi in.
- **Actor chính**: admin.
- **Điều kiện trước**: Mã có status=unused; admin có permission `book-code:cancel`.
- **Luồng chính**:
  1. Admin tìm mã trong danh sách.
  2. Admin nhấn "Hủy mã" và nhập lý do.
  3. Hệ thống cập nhật BookCode status → cancelled.
  4. Ghi audit log.
- **Luồng lỗi**: Mã đã kích hoạt → 400 `CANNOT_CANCEL_ACTIVATED_CODE`.
- **Business rule áp dụng**: BR-BOOK-001.
- **Acceptance criteria**: Mã cancelled không thể kích hoạt; audit log ghi đầy đủ.

---

### UC-BOOK-004 — Học viên xem sách đã kích hoạt

- **Mục tiêu**: Học viên xem lại tất cả mã sách đã kích hoạt và quyền học đã nhận.
- **Actor chính**: student.
- **Điều kiện trước**: Học viên đã kích hoạt ít nhất một mã.
- **Luồng chính**:
  1. Học viên truy cập trang "Sách của tôi".
  2. Hệ thống lấy danh sách Activation của user.
  3. Với mỗi Activation, trả thông tin sách, bundle và danh sách khóa học đã nhận.
- **Acceptance criteria**: Chỉ trả activation của user hiện tại; hiển thị trạng thái quyền học còn hạn hay không.

---

## 12. User story

### US-BOOK-001 — Xem danh sách sách
- **Với vai trò**: Học viên tiềm năng
- **Tôi muốn**: Xem danh mục sách có sẵn
- **Để**: Tìm sách phù hợp để mua
- **Priority**: Must
- **Given**: Có sách đã xuất bản trong hệ thống
- **When**: Tôi truy cập trang `/books`
- **Then**: Thấy danh sách sách với ảnh bìa, tiêu đề và mô tả ngắn
- **Test scenario**: Có sách published → hiển thị; sách draft → không hiển thị

### US-BOOK-002 — Kích hoạt mã sách lần đầu
- **Với vai trò**: Học viên
- **Tôi muốn**: Nhập mã sách để mở khóa khóa học
- **Để**: Truy cập tài nguyên học tập đi kèm sách đã mua
- **Priority**: Must
- **Given**: Tôi có mã sách hợp lệ chưa kích hoạt, đã đăng nhập
- **When**: Tôi nhập mã và nhấn "Kích hoạt"
- **Then**: Nhận thông báo thành công; thấy danh sách khóa học vừa được mở khóa; có thể vào học ngay
- **Rule liên quan**: BR-BOOK-001, BR-BOOK-002
- **Test scenario**: Mã mới → kích hoạt thành công; mã đã dùng → lỗi rõ ràng

### US-BOOK-003 — Cố kích hoạt mã đã dùng
- **Với vai trò**: Học viên
- **Tôi muốn**: Nhập lại mã sách đã được dùng
- **Để**: (test case — kết quả mong đợi là lỗi)
- **Priority**: Must
- **Given**: Mã sách đã được kích hoạt bởi user khác
- **When**: Tôi nhập mã đó
- **Then**: Hệ thống trả lỗi "Mã này đã được sử dụng"
- **Rule liên quan**: BR-BOOK-001
- **Test scenario**: Mã activated → 400 BOOK_CODE_ALREADY_ACTIVATED

### US-BOOK-004 — Kích hoạt mã hết hạn
- **Với vai trò**: Học viên
- **Tôi muốn**: Kích hoạt mã đã hết hạn
- **Để**: (test case — kết quả mong đợi là lỗi)
- **Priority**: Must
- **Given**: Mã sách có expiresAt đã qua
- **When**: Tôi nhập mã đó
- **Then**: Hệ thống trả lỗi "Mã này đã hết hạn sử dụng"
- **Rule liên quan**: BR-BOOK-003
- **Test scenario**: Mã expired → 400 BOOK_CODE_EXPIRED

### US-BOOK-005 — Xem lịch sử sách đã kích hoạt
- **Với vai trò**: Học viên
- **Tôi muốn**: Xem tất cả mã sách đã kích hoạt
- **Để**: Kiểm tra quyền học đã nhận và ngày hết hạn
- **Priority**: Must
- **Given**: Tôi đã kích hoạt ít nhất một mã
- **When**: Tôi vào trang "Sách của tôi"
- **Then**: Thấy danh sách sách đã kích hoạt với thời điểm và các khóa học trong bundle
- **Test scenario**: Có activation → hiển thị; không có → thông báo chưa kích hoạt sách nào

### US-BOOK-006 — Admin sinh mã hàng loạt
- **Với vai trò**: Admin
- **Tôi muốn**: Sinh 1000 mã sách cho một sách cụ thể
- **Để**: Chuẩn bị mã in kèm sách trước khi phân phối
- **Priority**: Must
- **Given**: Tôi có permission book-code:generate
- **When**: Tôi nhập số lượng 1000 và nhấn "Sinh mã"
- **Then**: 1000 mã unique được tạo với status=unused; có thể export ra CSV
- **Test scenario**: Sinh thành công → không có mã trùng; số mã đúng với yêu cầu

### US-BOOK-007 — Admin hủy mã bị mất
- **Với vai trò**: Admin
- **Tôi muốn**: Hủy mã sách bị mất hoặc in lỗi
- **Để**: Ngăn người lạ dùng mã không hợp lệ
- **Priority**: Should
- **Given**: Mã có status=unused
- **When**: Tôi chọn mã và nhấn "Hủy"
- **Then**: Mã chuyển sang status=cancelled; không thể kích hoạt được nữa
- **Test scenario**: Hủy mã unused → thành công; cố hủy mã đã activated → lỗi

### US-BOOK-008 — Admin tạo bundle khóa học
- **Với vai trò**: Admin
- **Tôi muốn**: Tạo bundle gồm nhiều khóa học và gán vào sách
- **Để**: Khi học viên kích hoạt mã sách, họ nhận được toàn bộ khóa học trong bundle
- **Priority**: Must
- **Given**: Có các khóa học đã tạo
- **When**: Tôi tạo bundle, chọn danh sách khóa và gán vào sách
- **Then**: Bundle được tạo; khi mã sách kích hoạt, enrollment được tạo cho tất cả khóa học trong bundle
- **Test scenario**: Kích hoạt mã sách có bundle 3 khóa → 3 enrollment được tạo

---

## 13. Luồng nghiệp vụ chi tiết

### Luồng 1: Kích hoạt mã sách

```
[Học viên] → POST /api/book-codes/activate { code: "ABC123" }
     ↓
[BookCodeActivationService] → Tìm BookCode theo trường code (mã kích hoạt)
     ↓ (không tìm thấy)
[API] → Trả 404 BOOK_CODE_NOT_FOUND
     ↓ (tìm thấy)
[BookCodeActivationService] → Kiểm tra status = unused
     ↓ (đã activated)
[API] → Trả 400 BOOK_CODE_ALREADY_ACTIVATED
     ↓ (cancelled)
[API] → Trả 400 BOOK_CODE_CANCELLED
     ↓ (unused)
[BookCodeActivationService] → Kiểm tra expiresAt
     ↓ (hết hạn)
[API] → Trả 400 BOOK_CODE_EXPIRED
     ↓ (còn hạn hoặc không có hạn)
[DB Transaction bắt đầu]
  [BookCode] → Cập nhật status → activated, activatedByUserId, activatedAt
  [Activation] → Tạo bản ghi Activation
  [Bundle] → Lấy danh sách BundleItem
  [AccessGrantService] → Với mỗi BundleItem (khóa học):
    → Gọi EnrollmentService.grantAccess(userId, courseId, expiresAt)
    → Tạo AccessGrant
[DB Transaction commit]
[API] → Trả { activation, bundle, accessGrants: [ { courseId, courseName, expiresAt } ] }
```

### Luồng 2: Admin sinh mã hàng loạt

```
[Admin] → POST /api/admin/books/{bookId}/code-batches { quantity: 100, expiresAt: "..." }
     ↓
[AdminBookService] → Kiểm tra bookId tồn tại
[CodeGeneratorService] → Tạo CodeBatch
[CodeGeneratorService] → Lặp N lần:
  → Sinh mã random (uppercase, 12 ký tự)
  → Kiểm tra trùng trong DB
  → Nếu trùng: sinh lại
  → Tạo BookCode với status=unused
[API] → Trả { batchId, totalGenerated: N }
[Nền tảng] → Chuẩn bị link download CSV danh sách mã
```

### Luồng 3: Kiểm tra quyền truy cập khóa học từ bundle

```
[Học viên] → Truy cập khóa học đã nhận từ bundle
     ↓
[Classroom.AccessPolicyChecker] → Kiểm tra enrollment
[EnrollmentService] → Tìm enrollment của user với courseId
     ↓ (có enrollment active)
[API] → Cho phép truy cập
     ↓ (không có enrollment)
[API] → Kiểm tra AccessGrant
[AccessGrant] → Tìm grant với userId, productType=course, productId=courseId
     ↓ (có grant chưa hết hạn)
[EnrollmentService] → Tạo enrollment từ grant nếu chưa có
[API] → Cho phép truy cập
```

---

## 14. Business rule áp dụng

| Mã rule | Nội dung áp dụng trong module này |
|---|---|
| BR-BOOK-001 | Mã kích hoạt chỉ được sử dụng một lần — kiểm tra trạng thái trước khi activate |
| BR-BOOK-002 | Khi kích hoạt mã, hệ thống phải cấp enrollment cho các khóa học trong bundle |
| BR-BOOK-003 | Mã hết hạn (theo expiresAt) không được kích hoạt |
| BR-SYS-001 | Học viên chỉ xem lịch sử kích hoạt của chính mình |
| BR-SYS-002 | Backend kiểm tra quyền truy cập trước mọi API bảo mật |
| BR-SYS-006 | Audit log cho hành động admin sinh mã, hủy mã, sửa bundle |

---

## 15. Validation

### Kích hoạt mã
- `code`: bắt buộc, không rỗng, tối đa 100 ký tự.
- Mã phải tồn tại trong hệ thống.

### Tạo sách (admin)
- `title`: bắt buộc, 2–255 ký tự.
- `code`: bắt buộc, unique, không ký tự đặc biệt.
- `price`: không bắt buộc, nếu có phải không âm.

### Sinh mã hàng loạt
- `quantity`: bắt buộc, số nguyên dương, tối đa theo cấu hình (ví dụ 10.000 mã/batch).
- `expiresAt`: không bắt buộc, nếu có phải là ngày trong tương lai.

### Tạo bundle
- `name`: bắt buộc, 2–255 ký tự.
- `items`: không bắt buộc; nếu có mỗi item phải có productType và productId hợp lệ.
- `accessDurationDays`: không bắt buộc, nếu có phải là số nguyên dương.

---

## 16. State machine

### Trạng thái mã kích hoạt (BookCode)

```
unused → activated (khi học viên kích hoạt)
unused → expired  (khi expiresAt < now, qua scheduler)
unused → cancelled (admin hủy)
```

| Trạng thái | Có thể kích hoạt | Mô tả |
|---|---|---|
| `unused` | Có (nếu chưa hết hạn) | Mã mới, chưa dùng |
| `activated` | Không | Đã được kích hoạt |
| `expired` | Không | Hết hạn sử dụng |
| `cancelled` | Không | Bị admin hủy |

### Trạng thái sách (Book)

```
draft → published → archived
```

### Trạng thái bundle

```
active ↔ inactive (admin toggle)
```

---

## 17. Xử lý lỗi

| Mã lỗi | HTTP status | Trường hợp xảy ra | Thông điệp |
|---|---|---|---|
| `BOOK_CODE_NOT_FOUND` | 404 | Mã không tồn tại | Mã sách không hợp lệ |
| `BOOK_CODE_ALREADY_ACTIVATED` | 400 | Mã đã được kích hoạt | Mã sách này đã được sử dụng |
| `BOOK_CODE_EXPIRED` | 400 | Mã hết hạn | Mã sách đã hết hạn sử dụng |
| `BOOK_CODE_CANCELLED` | 400 | Mã đã bị hủy | Mã sách không còn hợp lệ |
| `CANNOT_CANCEL_ACTIVATED_CODE` | 400 | Cố hủy mã đã activated | Không thể hủy mã đã kích hoạt |
| `BOOK_NOT_FOUND` | 404 | Sách không tồn tại hoặc chưa published | Không tìm thấy sách |
| `BUNDLE_NOT_FOUND` | 404 | Bundle không tồn tại | Không tìm thấy bundle |
| `FORBIDDEN` | 403 | Không có permission | Bạn không có quyền thực hiện thao tác này |

---

## 18. Acceptance criteria

| Mã AC | Chức năng | Tiêu chí chấp nhận |
|---|---|---|
| AC-BOOK-001 | Danh sách sách | Chỉ trả sách published; phân trang hoạt động |
| AC-BOOK-002 | Kích hoạt mã | Mã mới → kích hoạt thành công; enrollment được tạo cho tất cả khóa trong bundle |
| AC-BOOK-003 | Chống kích hoạt trùng | Mã đã activated → 400 ngay cả khi hai request đồng thời |
| AC-BOOK-004 | Mã hết hạn | Mã quá expiresAt → 400 dù status còn unused |
| AC-BOOK-005 | Mã bị hủy | Mã cancelled → 400 |
| AC-BOOK-006 | Sinh mã | Không có mã trùng sau khi sinh; số mã bằng quantity yêu cầu |
| AC-BOOK-007 | Hủy mã | Chỉ hủy được mã unused; mã activated → lỗi |
| AC-BOOK-008 | Lịch sử kích hoạt | Chỉ trả activation của user hiện tại |
| AC-BOOK-009 | Bundle cấp đủ quyền | Kích hoạt mã → enrollment cho TẤT CẢ khóa học trong bundle |

---

## 19. Test/UAT scenario

| Mã kịch bản | Mô tả | Điều kiện | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|---|
| T-BOOK-001 | Danh sách sách không đăng nhập | 2 published, 1 draft | GET /api/books | Trả 2 sách published |
| T-BOOK-002 | Kích hoạt mã sách hợp lệ | Mã unused, sách có bundle 2 khóa | POST /api/book-codes/activate | Kích hoạt thành công; 2 enrollment được tạo |
| T-BOOK-003 | Kích hoạt mã đã dùng | Mã activated | POST /api/book-codes/activate | Trả 400 BOOK_CODE_ALREADY_ACTIVATED |
| T-BOOK-004 | Kích hoạt mã hết hạn | Mã unused, expiresAt đã qua | POST /api/book-codes/activate | Trả 400 BOOK_CODE_EXPIRED |
| T-BOOK-005 | Kích hoạt mã bị hủy | Mã cancelled | POST /api/book-codes/activate | Trả 400 BOOK_CODE_CANCELLED |
| T-BOOK-006 | Hai user kích hoạt cùng mã (race condition) | Cùng mã, 2 request đồng thời | 2 POST /api/book-codes/activate cùng lúc | Chỉ 1 thành công; request còn lại trả 400 |
| T-BOOK-007 | Xem lịch sử kích hoạt | Đã kích hoạt 2 mã | GET /api/me/book-activations | Trả 2 activation của user; không thấy của user khác |
| T-BOOK-008 | Admin sinh 100 mã | Sách tồn tại | POST /api/admin/books/{id}/code-batches { quantity: 100 } | 100 mã được tạo; không có mã trùng |
| T-BOOK-009 | Admin hủy mã unused | Mã status=unused | POST /api/admin/book-codes/{id}/cancel | Trả 200; mã → cancelled |
| T-BOOK-010 | Admin hủy mã đã activated | Mã status=activated | POST /api/admin/book-codes/{id}/cancel | Trả 400 CANNOT_CANCEL_ACTIVATED_CODE |
| T-BOOK-011 | Sau kích hoạt mã, học viên truy cập khóa học | Enrollment đã được tạo | GET /api/courses/{courseId}/lessons/{lessonId} | Truy cập được nội dung bài học |
| T-BOOK-012 | Chi tiết sách khi đã kích hoạt | User đã kích hoạt sách | GET /api/books/{bookId} | isActivated=true; link vào khóa học |

---

## 20. Phụ thuộc module khác

### Module này phụ thuộc
- **Authentication**: kiểm tra token và permission.
- **Classroom** (EnrollmentService): cấp enrollment cho từng khóa học trong bundle khi kích hoạt mã.

### Module khác phụ thuộc module này
- **Order/Payment**: khi đơn hàng bundle được thanh toán thành công, gọi BookCodeActivationService để cấp quyền.
- **Reporting**: đọc Activation và CodeBatch để thống kê mã đã dùng, doanh thu.

### Nguyên tắc tích hợp
- BookCodeActivationService gọi EnrollmentService qua interface — không truy cập trực tiếp DB Classroom.
- Module Classroom không cần biết về BookCode hay Bundle.

---

## 21. Câu hỏi cần xác nhận

| Câu hỏi | Ảnh hưởng | Đề xuất tạm thời |
|---|---|---|
| Mã sách có phân biệt hoa thường khi kích hoạt không? | Validation | Đề xuất: không phân biệt — tự động uppercase trước khi so sánh |
| Độ dài và format mã sách là bao nhiêu? | CodeGeneratorService | Đề xuất: 12 ký tự uppercase, chữ và số |
| Số mã tối đa có thể sinh trong một batch? | CodeGeneratorService | Đề xuất: 10.000 mã/batch |
| Bundle có thể gán cho nhiều sách không? | Book-Bundle relationship | Đề xuất: một sách có một bundle mặc định; mở rộng sau |
| Khi kích hoạt mã, thời hạn enrollment tính từ thời điểm kích hoạt hay từ ngày sách? | AccessGrant.expiresAt | Đề xuất: từ thời điểm kích hoạt + Bundle.accessDurationDays |
| Học viên có thể kích hoạt nhiều mã của cùng một sách không? | Activation logic | Đề xuất: cho phép nếu mã khác nhau; enrollment gia hạn |
| Mã hết hạn (expiresAt) có được scheduler tự chuyển status=expired không? | Scheduler | Đề xuất: scheduler hàng ngày cập nhật status |
