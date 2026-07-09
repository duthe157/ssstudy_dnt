# Document / Tài liệu — SRS mục tiêu

> Tài liệu đặc tả yêu cầu phần mềm (SRS) cho module Document của hệ thống SSStudy.
> Viết như thể hệ thống chưa có code. Mục tiêu: đủ chi tiết để developer triển khai hoàn chỉnh chỉ từ tài liệu này.

---

## 1. Mục tiêu nghiệp vụ

Module Document quản lý kho tài liệu học tập của hệ thống SSStudy. Module này cần đáp ứng:

- Tổ chức và hiển thị tài liệu học tập theo danh mục để học viên dễ tìm kiếm.
- Kiểm soát quyền truy cập theo loại tài liệu (public/PRO) và enrollment khóa học.
- Hỗ trợ xem trước tài liệu PDF cho người dùng chưa có quyền truy cập đầy đủ.
- Quản lý việc tải tài liệu có kiểm soát — chỉ người có quyền mới tải được file đầy đủ.
- Admin và giáo viên quản lý toàn bộ kho tài liệu: tạo, sửa, upload, phân loại, ẩn/hiện.
- Cleanup file khi tài liệu bị xóa để tránh tốn dung lượng storage.
- Ghi nhận lịch sử tải tài liệu để theo dõi và kiểm soát.

---

## 2. Phạm vi chức năng

| STT | Chức năng | Mô tả ngắn |
|---|---|---|
| 1 | Danh sách tài liệu công khai | Hiển thị, tìm kiếm, lọc tài liệu theo danh mục |
| 2 | Chi tiết tài liệu | Thông tin, metadata, trạng thái quyền truy cập |
| 3 | Xem trước tài liệu (preview) | Preview PDF giới hạn trang cho tài liệu PRO |
| 4 | Tải tài liệu | Tải file đầy đủ nếu có quyền |
| 5 | Tài liệu public | Mọi người dùng đều xem và tải được |
| 6 | Tài liệu PRO | Chỉ học viên có enrollment hợp lệ mới xem/tải |
| 7 | Tài liệu gắn khóa học | Kiểm tra enrollment khóa học tương ứng |
| 8 | Danh mục tài liệu | Phân cấp danh mục, lọc theo danh mục |
| 9 | Tài liệu liên quan | Gợi ý tài liệu cùng danh mục |
| 10 | Upload tài liệu | Upload file PDF, link Google Drive |
| 11 | Admin quản lý tài liệu | CRUD tài liệu, phân loại, ẩn/hiện |
| 12 | Admin quản lý danh mục | CRUD danh mục, phân cấp |
| 13 | File cleanup | Xóa file trên storage khi tài liệu bị xóa |
| 14 | Log tải tài liệu | Ghi nhận ai đã tải, khi nào |

---

## 3. Ngoài phạm vi

- Soạn thảo tài liệu trực tiếp trong hệ thống (chỉ upload file có sẵn).
- Tích hợp OCR và tìm kiếm nội dung trong file PDF.
- Phát trực tiếp video (thuộc module Classroom/Lesson).
- Hệ thống quản lý tài sản số (DAM) đầy đủ chức năng.
- Phiên bản hóa tài liệu (document versioning).

---

## 4. Actor

| Actor | Mô tả | Quyền cơ bản |
|---|---|---|
| Guest | Người dùng chưa đăng nhập | Xem danh sách và chi tiết tài liệu public; xem preview tài liệu PRO |
| student | Học viên đã đăng nhập | Xem và tải tài liệu public; xem tài liệu PRO nếu có enrollment hợp lệ |
| teacher | Giáo viên | Tạo và quản lý tài liệu gắn với khóa học của mình |
| admin | Quản trị viên | Toàn quyền quản lý tài liệu và danh mục |
| superAdmin | Quản trị cấp cao | Toàn quyền bao gồm xóa cứng |

---

## 5. Permission

| Mã permission | Mô tả | Role mặc định |
|---|---|---|
| `document:read` | Xem chi tiết tài liệu bất kỳ kể cả chưa publish | admin, superAdmin, teacher (chỉ tài liệu của mình) |
| `document:create` | Tạo tài liệu mới | admin, superAdmin, teacher |
| `document:update` | Cập nhật metadata và file tài liệu | admin, superAdmin, teacher (chỉ tài liệu của mình) |
| `document:delete` | Xóa mềm tài liệu | admin, superAdmin |
| `document:publish` | Xuất bản hoặc ẩn tài liệu | admin, superAdmin |
| `document:upload` | Upload file tài liệu | admin, superAdmin, teacher |
| `document-category:manage` | Tạo/sửa/xóa danh mục | admin, superAdmin |
| `document:download-log:read` | Xem lịch sử tải tài liệu | admin, superAdmin |

---

## 6. Danh sách chức năng

| Mã chức năng | Tên chức năng | Actor | Màn hình đề xuất | API đề xuất | Dịch vụ nghiệp vụ cần có | Dữ liệu/model liên quan | Quy tắc áp dụng | Priority |
|---|---|---|---|---|---|---|---|---|
| DOC-01 | Danh sách tài liệu công khai | Guest, student | `/documents` | `GET /api/documents` | Lọc theo danh mục, loại, từ khóa; phân trang | Document, DocumentCategory | BR-DOC-001 | Must |
| DOC-02 | Chi tiết tài liệu và kiểm tra quyền | Guest, student | `/documents/{documentId}` | `GET /api/documents/{documentId}` | Kiểm tra loại tài liệu và enrollment, trả canView/canDownload | Document, Enrollment | BR-DOC-001, BR-DOC-002, BR-DOC-003 | Must |
| DOC-03 | Xem trước tài liệu PDF | Guest, student | `/documents/{documentId}` | `GET /api/documents/{documentId}/preview` | Trả URL preview giới hạn trang | Document, FileAsset | BR-DOC-001 | Must |
| DOC-04 | Tải tài liệu | student | `/documents/{documentId}` | `GET /api/documents/{documentId}/download` | Kiểm tra quyền, tạo signed URL có thời hạn, ghi download log | Document, FileAsset, DocumentDownloadLog | BR-DOC-002, BR-DOC-003 | Must |
| DOC-05 | Tài liệu liên quan | Guest, student | `/documents/{documentId}` | `GET /api/documents/{documentId}/related` | Gợi ý tài liệu cùng danh mục | Document | — | Should |
| DOC-06 | Danh sách danh mục | Guest, student | `/documents` | `GET /api/document-categories` | Trả cây danh mục phân cấp | DocumentCategory | — | Must |
| DOC-07 | Admin tạo tài liệu | admin, teacher | `/admin/documents/new` | `POST /api/admin/documents` | Validate dữ liệu, tạo Document, liên kết FileAsset nếu upload | Document, FileAsset | `document:create` | Must |
| DOC-08 | Admin sửa tài liệu | admin, teacher | `/admin/documents/{documentId}/edit` | `PUT /api/admin/documents/{documentId}` | Cập nhật metadata, thay thế file nếu có | Document | `document:update` | Must |
| DOC-09 | Admin upload file | admin, teacher | `/admin/documents/{documentId}` | `POST /api/admin/documents/{documentId}/upload` | Upload file lên storage, cập nhật FileAsset | FileAsset | `document:upload`, BR-DOC-004 | Must |
| DOC-10 | Admin xuất bản/ẩn tài liệu | admin | `/admin/documents/{documentId}` | `PUT /api/admin/documents/{documentId}/publish` | Cập nhật trạng thái, ghi audit log | Document | `document:publish` | Must |
| DOC-11 | Admin xóa tài liệu | admin | `/admin/documents/{documentId}` | `DELETE /api/admin/documents/{documentId}` | Xóa mềm Document, đưa vào hàng đợi cleanup file | Document, FileAsset | `document:delete`, BR-DOC-005 | Should |
| DOC-12 | Admin quản lý danh mục | admin | `/admin/document-categories` | CRUD `/api/admin/document-categories` | Tạo/sửa/xóa danh mục phân cấp | DocumentCategory | `document-category:manage` | Must |
| DOC-13 | Xem log tải tài liệu | admin | `/admin/documents/{documentId}/download-logs` | `GET /api/admin/documents/{documentId}/download-logs` | Lấy lịch sử tải có phân trang | DocumentDownloadLog | `document:download-log:read` | Should |

---

## 7. Thiết kế dữ liệu / Domain model đề xuất

### Model chính

| Model | Mục đích | Field quan trọng | Quan hệ |
|---|---|---|---|
| Document | Tài liệu học tập | id, title, accessType, status, mainCategoryId, courseId | Có một FileAsset, thuộc một DocumentCategory |
| DocumentCategory | Danh mục phân cấp | id, name, parentId, ordering | Cây danh mục hai cấp |
| FileAsset | Thông tin file vật lý | id, documentId, storagePath, mimeType, fileSize | FK tới Document |
| DocumentAccessPolicy | Chính sách truy cập | id, documentId, policyType, courseId | FK tới Document |
| DocumentDownloadLog | Lịch sử tải | id, documentId, userId, downloadedAt, ipAddress | FK tới Document, User |
| CourseDocumentMapping | Gắn tài liệu với khóa học | id, documentId, courseId | FK tới Document, Course |

### Field chi tiết

#### Model: Document
| Field | Kiểu dữ liệu | Bắt buộc | Ý nghĩa | Validation |
|---|---|---|---|---|
| id | UUID | Có | Khóa chính | Auto-generate |
| title | varchar(255) | Có | Tiêu đề tài liệu | Không rỗng |
| slug | varchar(255) | Có | Đường dẫn URL | Unique, lowercase |
| description | text | Không | Mô tả nội dung | |
| accessType | enum | Có | Loại truy cập | public, pro, course_only |
| status | enum | Có | Trạng thái | draft, published, archived |
| mainCategoryId | UUID FK | Không | Danh mục chính | |
| subCategoryId | UUID FK | Không | Danh mục phụ | |
| docFormat | enum | Có | Định dạng | pdf, google_drive, link |
| externalUrl | varchar(500) | Không | URL ngoài nếu là Google Drive hoặc link | |
| previewPages | int | Không | Số trang preview (mặc định 3) | 1–10 |
| viewCount | int | Không | Số lượt xem (cache) | Mặc định 0 |
| downloadCount | int | Không | Số lượt tải (cache) | Mặc định 0 |
| createdAt | timestamp | Có | | Auto |
| updatedAt | timestamp | Có | | Auto |

#### Model: FileAsset
| Field | Kiểu dữ liệu | Bắt buộc | Ý nghĩa | Validation |
|---|---|---|---|---|
| id | UUID | Có | Khóa chính | |
| documentId | UUID FK | Có | Tài liệu sở hữu | |
| storagePath | varchar(500) | Có | Đường dẫn lưu trữ trên storage | Không expose ra ngoài |
| publicUrl | varchar(500) | Không | URL public hoặc CDN (nếu không cần signed URL) | |
| previewPath | varchar(500) | Không | Đường dẫn file preview (PDF cắt trang) | |
| mimeType | varchar(100) | Có | Loại file | Phải là MIME type hợp lệ |
| fileSize | bigint | Có | Kích thước file (bytes) | |
| checksum | varchar(64) | Không | MD5/SHA hash để kiểm tra toàn vẹn | |
| uploadedAt | timestamp | Có | Thời điểm upload | Auto |

#### Model: DocumentCategory
| Field | Kiểu dữ liệu | Bắt buộc | Ý nghĩa | Validation |
|---|---|---|---|---|
| id | UUID | Có | Khóa chính | |
| name | varchar(255) | Có | Tên danh mục | Không rỗng |
| slug | varchar(255) | Có | Đường dẫn URL | Unique |
| parentId | UUID FK | Không | Danh mục cha (null nếu là gốc) | |
| ordering | int | Không | Thứ tự hiển thị | |
| status | enum | Có | active, inactive | |

#### Model: DocumentDownloadLog
| Field | Kiểu dữ liệu | Bắt buộc | Ý nghĩa | Validation |
|---|---|---|---|---|
| id | UUID | Có | Khóa chính | |
| documentId | UUID FK | Có | Tài liệu được tải | |
| userId | UUID FK | Không | Người tải (null nếu anonymous) | |
| downloadedAt | timestamp | Có | Thời điểm tải | Auto |
| ipAddress | varchar(45) | Không | Địa chỉ IP | |

### Quan hệ dữ liệu

- Document `1—1` FileAsset: mỗi tài liệu có một file vật lý (nullable nếu chỉ là link ngoài).
- Document `N—1` DocumentCategory: tài liệu thuộc một danh mục chính.
- Document `1—N` DocumentDownloadLog: một tài liệu có nhiều lịch sử tải.
- Document `N—N` Course qua CourseDocumentMapping: tài liệu có thể gắn nhiều khóa học.

### Index / Constraint đề xuất

| Bảng | Index / Constraint | Mục đích |
|---|---|---|
| Document | UNIQUE(slug) | URL-friendly slug duy nhất |
| Document | INDEX(status, accessType, mainCategoryId) | Lọc danh sách nhanh |
| Document | INDEX(mainCategoryId, status) | Lọc theo danh mục |
| FileAsset | UNIQUE(documentId) | Mỗi tài liệu chỉ có một FileAsset chính |
| DocumentDownloadLog | INDEX(documentId, downloadedAt) | Tra cứu log theo tài liệu |
| DocumentDownloadLog | INDEX(userId, downloadedAt) | Tra cứu log theo user |

---

## 8. Thiết kế kiến trúc module

### Thành phần cần có

| Thành phần | Vai trò | Ghi chú triển khai |
|---|---|---|
| API layer (Controller) | Nhận request, validate, gọi service, trả response | Không chứa business logic |
| DocumentService | Lấy danh sách, chi tiết, tài liệu liên quan | Gọi DocumentRepository, AccessPolicyChecker |
| AccessPolicyChecker | Quyết định canView và canDownload theo accessType và enrollment | Gọi EnrollmentService (từ module Classroom) |
| DownloadService | Tạo signed URL có thời hạn cho download, ghi log | Gọi StorageAdapter; không expose storagePath trực tiếp |
| PreviewService | Tạo preview PDF giới hạn trang, lưu preview file riêng | Xử lý async qua background job |
| UploadService | Validate file type/size, upload lên storage, tạo FileAsset | Gọi StorageAdapter; chạy preview generation sau upload |
| AdminDocumentService | CRUD tài liệu và danh mục, xuất bản, ẩn, xóa mềm | Gọi DocumentRepository, UploadService |
| StorageAdapter | Tương tác với S3-compatible storage | Không expose storage path ra ngoài; dùng signed URL |
| CleanupService | Xóa file trên storage khi tài liệu bị xóa | Chạy async; ghi log kết quả |
| DocumentRepository | Truy vấn và cập nhật Document trong DB | |
| AuditLogger | Ghi audit log hành động admin | Gọi async |

### Dependency

- Module Document phụ thuộc Authentication để kiểm tra token và permission.
- Module Document phụ thuộc Classroom (EnrollmentService) để kiểm tra enrollment khi truy cập tài liệu PRO gắn khóa học.
- Module Document không phụ thuộc Order/Payment trực tiếp.

### Nguyên tắc triển khai

- `storagePath` của FileAsset không bao giờ được trả về trong response API công khai.
- Quyền download phải kiểm tra ở backend — không tin URL từ client.
- Signed URL có thời hạn ngắn (5–15 phút) để giảm nguy cơ chia sẻ.
- Preview generation chạy bất đồng bộ; khi chưa có preview thì trả null previewUrl.
- Khi xóa tài liệu (soft delete), đưa FileAsset vào hàng đợi cleanup — không xóa ngay tức thì.
- Upload phải validate MIME type và kích thước tối đa trước khi lưu.

---

## 9. Yêu cầu giao diện

| Màn hình | Route đề xuất | Actor | Mục đích | API sử dụng |
|---|---|---|---|---|
| Danh sách tài liệu | `/documents` | Guest, student | Tìm kiếm và lọc tài liệu | `GET /api/documents` |
| Chi tiết tài liệu | `/documents/{documentId}` | Guest, student | Xem metadata, preview, nút tải | `GET /api/documents/{documentId}` |
| Quản lý tài liệu (admin) | `/admin/documents` | admin, teacher | Danh sách, tạo, sửa | CRUD `/api/admin/documents` |
| Tạo/sửa tài liệu (admin) | `/admin/documents/new`, `/admin/documents/{id}/edit` | admin, teacher | Form nhập thông tin, upload file | `POST/PUT /api/admin/documents` |
| Quản lý danh mục (admin) | `/admin/document-categories` | admin | Cây danh mục, CRUD | CRUD `/api/admin/document-categories` |
| Log tải tài liệu (admin) | `/admin/documents/{id}/download-logs` | admin | Lịch sử tải | `GET /api/admin/documents/{id}/download-logs` |

**Yêu cầu UI chi tiết:**
- Trang danh sách: bộ lọc theo danh mục (cây phân cấp), loại tài liệu (free/PRO), từ khóa; badge "PRO" nếu accessType=pro.
- Trang chi tiết: hiển thị preview PDF nhúng (nếu có previewUrl); nút tải sáng nếu canDownload=true; CTA "Đăng ký khóa học" hoặc "Mua khóa học" nếu canDownload=false.
- Form upload (admin): chọn file hoặc nhập link ngoài; hiển thị tiến trình upload; thông báo preview đang được tạo sau upload.

---

## 10. API đề xuất

| Mã API | Method | Endpoint đề xuất | Mục đích | Auth required | Permission | Request chính | Response chính | Business rule | Ghi chú |
|---|---|---|---|---|---|---|---|---|---|
| API-DOC-001 | GET | `/api/documents` | Danh sách tài liệu công khai | Không | Không | `?q, mainCategory, subCategory, accessType, page, limit, sort` | `{ items, total, page, limit }` | BR-DOC-001 | Chỉ trả tài liệu status=published |
| API-DOC-002 | GET | `/api/documents/{documentId}` | Chi tiết và quyền truy cập | Không | Không | — | `{ document, canView, canDownload, previewUrl? }` | BR-DOC-001, BR-DOC-002, BR-DOC-003 | canView/canDownload tính phía backend |
| API-DOC-003 | GET | `/api/documents/{documentId}/preview` | Lấy URL preview PDF | Không | Không | — | `{ previewUrl, totalPreviewPages }` | BR-DOC-001 | Trả null nếu chưa có preview |
| API-DOC-004 | GET | `/api/documents/{documentId}/download` | Tải tài liệu (signed URL) | Có | Enrollment hợp lệ nếu PRO | — | `{ downloadUrl, expiresAt }` | BR-DOC-002, BR-DOC-003 | Signed URL hết hạn sau 10 phút; ghi download log |
| API-DOC-005 | GET | `/api/documents/{documentId}/related` | Tài liệu liên quan | Không | Không | — | `{ items }` | — | Cùng danh mục, giới hạn 6 tài liệu |
| API-DOC-006 | GET | `/api/document-categories` | Cây danh mục | Không | Không | — | `{ items }` | — | Trả cây phân cấp 2 cấp |
| API-DOC-007 | GET | `/api/admin/documents` | Danh sách tài liệu (admin) | Có | `document:read` | `?q, status, accessType, categoryId, page, limit` | `{ items, total }` | — | Bao gồm cả draft |
| API-DOC-008 | POST | `/api/admin/documents` | Tạo tài liệu mới | Có | `document:create` | `{ title, accessType, mainCategoryId, docFormat, externalUrl? }` | `{ documentId }` | — | Ghi audit log |
| API-DOC-009 | PUT | `/api/admin/documents/{documentId}` | Cập nhật metadata | Có | `document:update` | `{ title, description, accessType, ... }` | `{ ok }` | — | Ghi audit log |
| API-DOC-010 | POST | `/api/admin/documents/{documentId}/upload` | Upload file tài liệu | Có | `document:upload` | `multipart/form-data` | `{ fileAssetId, previewStatus }` | BR-DOC-004 | Validate type và size; trigger preview generation |
| API-DOC-011 | PUT | `/api/admin/documents/{documentId}/publish` | Xuất bản hoặc ẩn | Có | `document:publish` | `{ publish: true/false }` | `{ ok, status }` | BR-DOC-001 | Ghi audit log |
| API-DOC-012 | DELETE | `/api/admin/documents/{documentId}` | Xóa mềm tài liệu | Có | `document:delete` | — | `{ ok }` | BR-DOC-005 | Đưa file vào hàng đợi cleanup; ghi audit log |
| API-DOC-013 | GET | `/api/admin/document-categories` | Danh sách danh mục (admin) | Có | `document-category:manage` | — | `{ items }` | — | Bao gồm cả inactive |
| API-DOC-014 | POST | `/api/admin/document-categories` | Tạo danh mục | Có | `document-category:manage` | `{ name, parentId?, ordering? }` | `{ categoryId }` | — | |
| API-DOC-015 | PUT | `/api/admin/document-categories/{categoryId}` | Sửa danh mục | Có | `document-category:manage` | `{ name, ordering, status }` | `{ ok }` | — | |
| API-DOC-016 | GET | `/api/admin/documents/{documentId}/download-logs` | Lịch sử tải | Có | `document:download-log:read` | `?page, limit, from, to` | `{ items, total }` | — | |

---

## 11. Use case nghiệp vụ

### UC-DOC-001 — Học viên tải tài liệu PRO

- **Mục tiêu**: Học viên có enrollment hợp lệ tải file tài liệu đầy đủ.
- **Actor chính**: student.
- **Actor phụ**: Không.
- **Điều kiện trước**: Tài liệu tồn tại, có FileAsset, học viên đã đăng nhập.
- **Trigger**: Học viên nhấn nút "Tải tài liệu" trên trang chi tiết.
- **Luồng chính**:
  1. Học viên nhấn "Tải tài liệu".
  2. Hệ thống lấy thông tin tài liệu.
  3. Hệ thống kiểm tra accessType.
  4. Nếu accessType=pro: kiểm tra học viên có enrollment active với khóa học gắn tài liệu.
  5. Hệ thống tạo signed URL có thời hạn 10 phút trỏ đến file trên storage.
  6. Hệ thống ghi DocumentDownloadLog.
  7. Trả signed URL cho client để tải.
- **Luồng thay thế**: accessType=public → bỏ qua kiểm tra enrollment, tạo signed URL luôn.
- **Luồng lỗi**:
  - Tài liệu không tồn tại hoặc chưa published → 404.
  - Học viên không có enrollment → 403 với mã `NO_ENROLLMENT`.
  - Enrollment hết hạn → 403 với mã `ENROLLMENT_EXPIRED`.
  - File chưa upload (không có FileAsset) → 400 với mã `FILE_NOT_AVAILABLE`.
- **Dữ liệu đầu vào**: documentId.
- **Dữ liệu đầu ra**: `{ downloadUrl, expiresAt }`.
- **Business rule áp dụng**: BR-DOC-002, BR-DOC-003, BR-SYS-002.
- **Permission áp dụng**: Enrollment hợp lệ (không phải permission RBAC).
- **Acceptance criteria**:
  - Tài liệu public: bất kỳ user nào cũng tải được (kể cả chưa đăng nhập với tài liệu free).
  - Tài liệu PRO: chỉ enrollment active mới tải được.
  - Signed URL hết hạn sau 10 phút, không thể dùng lại sau khi hết hạn.
  - Download log được ghi mỗi lần tải.
- **Ghi chú triển khai**: storagePath không được expose trong response; signed URL tạo bởi storage adapter.

---

### UC-DOC-002 — Khách xem preview tài liệu PRO

- **Mục tiêu**: Cho khách và học viên chưa mua xem trước một phần tài liệu trước khi quyết định mua.
- **Actor chính**: Guest.
- **Điều kiện trước**: Tài liệu published, có FileAsset dạng PDF, preview đã được tạo.
- **Trigger**: Khách mở trang chi tiết tài liệu.
- **Luồng chính**:
  1. Khách mở trang chi tiết tài liệu.
  2. Hệ thống trả thông tin tài liệu kèm `canView=false`, `canDownload=false`.
  3. Hệ thống trả `previewUrl` trỏ đến preview PDF giới hạn (mặc định 3 trang đầu).
  4. Frontend nhúng PDF viewer hiển thị preview.
  5. Hiển thị CTA "Đăng ký khóa học" hoặc "Mua khóa học" để mở khóa toàn bộ.
- **Luồng thay thế**: Preview chưa được tạo → previewUrl=null; ẩn PDF viewer; vẫn hiển thị metadata.
- **Luồng lỗi**: Tài liệu không tồn tại → 404.
- **Business rule áp dụng**: BR-DOC-001.
- **Acceptance criteria**:
  - Preview hiển thị tối đa số trang cấu hình trong Document.previewPages.
  - Không có cách nào tải file đầy đủ khi chưa có enrollment.
  - previewUrl là signed URL ngắn hạn, không phải storagePath trực tiếp.

---

### UC-DOC-003 — Admin upload tài liệu mới

- **Mục tiêu**: Admin hoặc giáo viên đưa tài liệu mới vào hệ thống.
- **Actor chính**: admin, teacher.
- **Điều kiện trước**: Admin đã đăng nhập, có permission `document:create` và `document:upload`.
- **Trigger**: Admin nhấn "Thêm tài liệu" trong trang quản lý tài liệu.
- **Luồng chính**:
  1. Admin điền metadata: tiêu đề, mô tả, danh mục, loại truy cập.
  2. Admin chọn file PDF hoặc nhập link ngoài.
  3. Hệ thống validate file: kiểm tra MIME type (chỉ chấp nhận application/pdf), kích thước tối đa.
  4. Hệ thống upload file lên storage, tạo FileAsset.
  5. Hệ thống đưa vào hàng đợi tạo preview (bất đồng bộ).
  6. Hệ thống tạo Document với status=draft.
  7. Admin chủ động xuất bản khi đã sẵn sàng.
- **Luồng lỗi**:
  - File không phải PDF → 422 với mã `INVALID_FILE_TYPE`.
  - File vượt kích thước tối đa → 422 với mã `FILE_TOO_LARGE`.
  - Upload thất bại → 500 với mã `UPLOAD_FAILED`.
- **Business rule áp dụng**: BR-DOC-004, BR-SYS-006.
- **Acceptance criteria**:
  - Chỉ chấp nhận file PDF và MIME types được cấu hình.
  - File lưu trên storage, không lưu nhị phân trong DB.
  - Preview được tạo bất đồng bộ — không chặn response.
  - Tài liệu được tạo với status=draft cho đến khi admin xuất bản.

---

### UC-DOC-004 — Xóa tài liệu và cleanup file

- **Mục tiêu**: Admin xóa tài liệu và đảm bảo file trên storage được dọn dẹp.
- **Actor chính**: admin.
- **Điều kiện trước**: Admin có permission `document:delete`; tài liệu tồn tại.
- **Trigger**: Admin nhấn "Xóa" trên trang quản lý tài liệu.
- **Luồng chính**:
  1. Admin xác nhận xóa tài liệu.
  2. Hệ thống soft-delete Document (đánh dấu deletedAt).
  3. Hệ thống đưa FileAsset vào hàng đợi cleanup.
  4. Background job CleanupService xóa file và preview file trên storage.
  5. CleanupService ghi log kết quả.
  6. Trả về thành công ngay sau bước 3 mà không chờ job hoàn tất.
- **Luồng lỗi**: Không có permission → 403.
- **Business rule áp dụng**: BR-DOC-005, BR-SYS-006.
- **Acceptance criteria**:
  - Tài liệu soft-deleted không còn hiển thị trong API public.
  - File trên storage được xóa sau khi job chạy.
  - Audit log ghi nhận hành động xóa.

---

## 12. User story

### US-DOC-001 — Tìm tài liệu theo danh mục
- **Với vai trò**: Học viên
- **Tôi muốn**: Lọc tài liệu theo môn học và danh mục
- **Để**: Nhanh chóng tìm tài liệu cần ôn tập
- **Priority**: Must
- **Business value**: Tăng khả năng khám phá nội dung
- **Given**: Tôi đang ở trang danh sách tài liệu
- **When**: Tôi chọn danh mục "Toán lớp 12" trong bộ lọc
- **Then**: Danh sách chỉ hiển thị tài liệu thuộc danh mục đó; badge "PRO" hiển thị với tài liệu cần enrollment
- **UI note**: Sidebar danh mục dạng cây phân cấp; có đếm số tài liệu mỗi danh mục
- **API note**: `GET /api/documents?mainCategory={id}`
- **Test scenario**: Chọn danh mục có tài liệu → lọc đúng; chọn danh mục rỗng → trả mảng rỗng

---

### US-DOC-002 — Xem trước tài liệu PRO trước khi mua
- **Với vai trò**: Học viên chưa mua khóa học
- **Tôi muốn**: Xem vài trang đầu của tài liệu PRO
- **Để**: Đánh giá chất lượng trước khi quyết định đăng ký khóa học
- **Priority**: Must
- **Business value**: Tăng tỷ lệ chuyển đổi mua khóa học
- **Given**: Tài liệu PRO đã có preview được tạo
- **When**: Tôi mở trang chi tiết tài liệu dù chưa có enrollment
- **Then**: Tôi thấy PDF viewer hiển thị tối đa 3 trang đầu; nút "Tải tài liệu" bị khóa kèm CTA đăng ký khóa học
- **Rule liên quan**: BR-DOC-001
- **Test scenario**: Có preview → hiển thị; chưa có preview → ẩn viewer, vẫn hiện metadata

---

### US-DOC-003 — Tải tài liệu public không cần đăng nhập
- **Với vai trò**: Khách truy cập
- **Tôi muốn**: Tải tài liệu miễn phí ngay mà không cần đăng nhập
- **Để**: Lấy tài liệu hữu ích nhanh nhất có thể
- **Priority**: Should
- **Given**: Tài liệu có accessType=public
- **When**: Tôi nhấn "Tải tài liệu"
- **Then**: Tôi nhận được link tải hợp lệ (signed URL); file tải về thành công
- **Rule liên quan**: BR-DOC-001
- **Test scenario**: Tài liệu public → tải thành công không cần token

---

### US-DOC-004 — Học viên tải tài liệu PRO có enrollment
- **Với vai trò**: Học viên có enrollment active
- **Tôi muốn**: Tải tài liệu đầy đủ sau khi đã đăng ký khóa học
- **Để**: Học offline theo tài liệu đã được phân phối
- **Priority**: Must
- **Given**: Tôi có enrollment active với khóa học gắn tài liệu này
- **When**: Tôi nhấn "Tải tài liệu"
- **Then**: File tải về thành công; download log ghi nhận hành động
- **Rule liên quan**: BR-DOC-002, BR-DOC-003
- **Test scenario**: Enrollment active → tải được; enrollment expired → lỗi 403

---

### US-DOC-005 — Admin upload tài liệu PDF mới
- **Với vai trò**: Admin
- **Tôi muốn**: Upload file PDF và điền thông tin tài liệu
- **Để**: Bổ sung nội dung học tập mới vào hệ thống
- **Priority**: Must
- **Given**: Tôi có permission document:create và document:upload
- **When**: Tôi upload file PDF và điền metadata, nhấn lưu
- **Then**: Tài liệu được tạo ở trạng thái draft; preview đang được tạo; tôi có thể xuất bản khi sẵn sàng
- **Rule liên quan**: BR-DOC-004
- **Test scenario**: File PDF hợp lệ → tạo thành công; file docx → lỗi INVALID_FILE_TYPE; file > giới hạn → lỗi FILE_TOO_LARGE

---

### US-DOC-006 — Admin phân loại tài liệu theo danh mục
- **Với vai trò**: Admin
- **Tôi muốn**: Tạo cây danh mục hai cấp để phân loại tài liệu
- **Để**: Học viên dễ tìm kiếm và lọc tài liệu theo môn học
- **Priority**: Must
- **Given**: Tôi có permission document-category:manage
- **When**: Tôi tạo danh mục mới và gán danh mục cha
- **Then**: Danh mục xuất hiện trong cây phân cấp; có thể gán cho tài liệu
- **Test scenario**: Tạo danh mục con hợp lệ → thành công; tạo quá 2 cấp → lỗi hoặc không cho phép

---

### US-DOC-007 — Admin xóa tài liệu và dọn file
- **Với vai trò**: Admin
- **Tôi muốn**: Xóa tài liệu không còn cần thiết
- **Để**: Giữ kho tài liệu gọn gàng và không tốn storage
- **Priority**: Should
- **Given**: Tôi có permission document:delete
- **When**: Tôi xác nhận xóa tài liệu
- **Then**: Tài liệu biến khỏi danh sách ngay lập tức; file trên storage được xóa sau vài phút bởi background job
- **Rule liên quan**: BR-DOC-005
- **Test scenario**: Xóa thành công → tài liệu không còn trong API public; file storage bị xóa sau job chạy

---

### US-DOC-008 — Học viên xem tài liệu liên quan
- **Với vai trò**: Học viên
- **Tôi muốn**: Thấy gợi ý các tài liệu khác cùng danh mục
- **Để**: Khám phá thêm tài liệu bổ trợ mà không cần quay lại danh sách
- **Priority**: Should
- **Given**: Tôi đang xem chi tiết một tài liệu
- **When**: Trang chi tiết tải xong
- **Then**: Sidebar hoặc phần "Tài liệu liên quan" hiển thị tối đa 6 tài liệu cùng danh mục
- **API note**: `GET /api/documents/{id}/related`
- **Test scenario**: Có tài liệu cùng danh mục → hiển thị; không có → ẩn section

---

## 13. Luồng nghiệp vụ chi tiết

### Luồng 1: Học viên tải tài liệu PRO

```
[Học viên] → Nhấn "Tải tài liệu"
     ↓
[API] → Lấy Document theo documentId
     ↓ (không tồn tại hoặc status != published)
[API] → Trả 404
     ↓ (tồn tại và published)
[AccessPolicyChecker] → Kiểm tra accessType
     ↓ (accessType = public)
[DownloadService] → Tạo signed URL → Ghi log → Trả URL
     ↓ (accessType = pro hoặc course_only)
[AccessPolicyChecker] → Kiểm tra user đã đăng nhập
     ↓ (chưa đăng nhập)
[API] → Trả 401
     ↓ (đã đăng nhập)
[EnrollmentService] → Kiểm tra enrollment active cho khóa học gắn tài liệu
     ↓ (không có enrollment)
[API] → Trả 403 NO_ENROLLMENT
     ↓ (enrollment expired)
[API] → Trả 403 ENROLLMENT_EXPIRED
     ↓ (enrollment active)
[DownloadService] → Tạo signed URL (hết hạn sau 10 phút)
[DocumentDownloadLog] → Ghi log
[API] → Trả { downloadUrl, expiresAt }
```

### Luồng 2: Upload tài liệu (admin)

```
[Admin] → Upload file + điền metadata
     ↓
[UploadService] → Validate MIME type
     ↓ (không hợp lệ)
[API] → Trả 422 INVALID_FILE_TYPE
     ↓ (hợp lệ)
[UploadService] → Validate kích thước file
     ↓ (vượt giới hạn)
[API] → Trả 422 FILE_TOO_LARGE
     ↓ (hợp lệ)
[UploadService] → Upload file lên storage
[FileAsset] → Tạo bản ghi FileAsset với storagePath
[Document] → Tạo Document với status=draft
[PreviewService] → Đưa vào hàng đợi tạo preview (async)
[API] → Trả { documentId, previewStatus: "pending" }
     ↓ (background)
[PreviewService] → Tạo file preview PDF giới hạn trang
[FileAsset] → Cập nhật previewPath
```

### Luồng 3: Xóa tài liệu và cleanup file

```
[Admin] → Xác nhận xóa tài liệu
     ↓
[AdminDocumentService] → Soft-delete Document (deletedAt = now)
[AuditLogger] → Ghi audit log (async)
[CleanupQueue] → Đưa FileAsset vào hàng đợi cleanup
[API] → Trả { ok: true } ngay lập tức
     ↓ (background job)
[CleanupService] → Tìm FileAsset cần cleanup
[StorageAdapter] → Xóa file gốc trên storage
[StorageAdapter] → Xóa file preview trên storage
[CleanupService] → Ghi log kết quả
```

---

## 14. Business rule áp dụng

| Mã rule | Nội dung áp dụng trong module này |
|---|---|
| BR-DOC-001 | Tài liệu public hiển thị với mọi người dùng kể cả chưa đăng nhập |
| BR-DOC-002 | Tài liệu PRO chỉ học viên có enrollment active mới được xem hoặc tải |
| BR-DOC-003 | Tài liệu gắn với khóa học phải kiểm tra enrollment khóa học trước khi cho truy cập |
| BR-DOC-004 | Upload file phải kiểm tra MIME type và kích thước tối đa trước khi lưu |
| BR-DOC-005 | Khi xóa tài liệu, file vật lý trên storage phải được cleanup sau đó |
| BR-SYS-001 | Học viên chỉ thao tác dữ liệu của mình; storagePath không được expose |
| BR-SYS-002 | Backend kiểm tra quyền truy cập trước mọi request tải file |
| BR-SYS-006 | Audit log bắt buộc khi admin tạo, sửa, xóa, xuất bản tài liệu |

---

## 15. Validation

### Tạo/sửa tài liệu (admin)
- `title`: bắt buộc, 2–255 ký tự.
- `accessType`: bắt buộc, phải là `public`, `pro` hoặc `course_only`.
- `docFormat`: bắt buộc, phải là `pdf`, `google_drive` hoặc `link`.
- `externalUrl`: bắt buộc nếu `docFormat` là `google_drive` hoặc `link`; phải là URL hợp lệ.
- `previewPages`: không bắt buộc, nếu có phải là số nguyên từ 1 đến 10.

### Upload file
- MIME type: chỉ chấp nhận `application/pdf` và các loại được cấu hình.
- Kích thước file: tối đa 100MB (hoặc theo cấu hình môi trường).
- Tên file: không chứa ký tự đặc biệt nguy hiểm.

### Tạo danh mục
- `name`: bắt buộc, 2–255 ký tự.
- `parentId`: không bắt buộc; nếu có phải là danh mục cấp 1 (danh mục cha không có parentId).
- Không cho phép tạo danh mục cấp 3.

---

## 16. State machine

### Trạng thái tài liệu (Document)

```
draft → published → archived
published → draft (không cho phép)
```

| Trạng thái | Hiển thị API public | Tải được |
|---|---|---|
| `draft` | Không | Không |
| `published` | Có | Có (nếu có quyền) |
| `archived` | Không | Không |

### Trạng thái preview

```
none → pending → ready
pending → failed (lỗi xử lý)
failed → pending (retry)
```

---

## 17. Xử lý lỗi

| Mã lỗi | HTTP status | Trường hợp xảy ra | Thông điệp |
|---|---|---|---|
| `DOCUMENT_NOT_FOUND` | 404 | Tài liệu không tồn tại hoặc chưa published | Không tìm thấy tài liệu |
| `NO_ENROLLMENT` | 403 | Học viên chưa có enrollment | Bạn cần đăng ký khóa học để xem tài liệu này |
| `ENROLLMENT_EXPIRED` | 403 | Enrollment đã hết hạn | Quyền truy cập của bạn đã hết hạn |
| `FILE_NOT_AVAILABLE` | 400 | Tài liệu chưa có file upload | Tài liệu chưa có file để tải |
| `INVALID_FILE_TYPE` | 422 | MIME type không được chấp nhận | Chỉ hỗ trợ file PDF |
| `FILE_TOO_LARGE` | 422 | File vượt kích thước tối đa | File vượt quá kích thước cho phép |
| `UPLOAD_FAILED` | 500 | Lỗi khi upload lên storage | Upload thất bại, vui lòng thử lại |
| `CATEGORY_NOT_FOUND` | 404 | Danh mục không tồn tại | Không tìm thấy danh mục |
| `FORBIDDEN` | 403 | Không có permission | Bạn không có quyền thực hiện thao tác này |

---

## 18. Acceptance criteria

| Mã AC | Chức năng | Tiêu chí chấp nhận |
|---|---|---|
| AC-DOC-001 | Danh sách | Chỉ trả tài liệu status=published; không trả draft hoặc archived |
| AC-DOC-002 | Quyền truy cập | canView và canDownload tính đúng theo accessType và enrollment |
| AC-DOC-003 | Tài liệu public | Tải được mà không cần đăng nhập |
| AC-DOC-004 | Tài liệu PRO | Chỉ enrollment active mới tải được; 403 nếu không có |
| AC-DOC-005 | Signed URL | URL hết hạn sau 10 phút; không thể dùng lại |
| AC-DOC-006 | storagePath | Không bao giờ xuất hiện trong response API |
| AC-DOC-007 | Upload | Từ chối file không phải PDF; từ chối file vượt kích thước |
| AC-DOC-008 | Preview | Preview hiển thị đúng số trang cấu hình; không expose file đầy đủ |
| AC-DOC-009 | Xóa | Soft-delete tài liệu ẩn khỏi API public ngay lập tức |
| AC-DOC-010 | Cleanup | File trên storage bị xóa sau khi background job chạy |
| AC-DOC-011 | Audit log | Hành động admin tạo/sửa/xóa/xuất bản phải có audit log |
| AC-DOC-012 | Download log | Mỗi lượt tải thành công được ghi vào DocumentDownloadLog |

---

## 19. Test/UAT scenario

| Mã kịch bản | Mô tả | Điều kiện ban đầu | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|---|
| T-DOC-001 | Lấy danh sách không cần đăng nhập | Có 3 tài liệu: 2 published, 1 draft | GET /api/documents | Trả 2 tài liệu published |
| T-DOC-002 | Lọc theo danh mục | Có tài liệu thuộc danh mục Toán | GET /api/documents?mainCategory={id} | Chỉ trả tài liệu đúng danh mục |
| T-DOC-003 | Xem chi tiết tài liệu public chưa đăng nhập | Tài liệu accessType=public | GET /api/documents/{id} | canView=true, canDownload=true |
| T-DOC-004 | Xem chi tiết tài liệu PRO chưa đăng nhập | Tài liệu accessType=pro | GET /api/documents/{id} | canView=false, canDownload=false, previewUrl có giá trị |
| T-DOC-005 | Tải tài liệu public | Tài liệu accessType=public, có FileAsset | GET /api/documents/{id}/download (không token) | Trả 200 với downloadUrl |
| T-DOC-006 | Tải tài liệu PRO có enrollment | Enrollment active, tài liệu accessType=pro | GET /api/documents/{id}/download với token | Trả 200 với downloadUrl; download log được ghi |
| T-DOC-007 | Tải tài liệu PRO không có enrollment | Tài liệu accessType=pro | GET /api/documents/{id}/download với token | Trả 403 NO_ENROLLMENT |
| T-DOC-008 | Tải tài liệu PRO enrollment hết hạn | Enrollment expired | GET /api/documents/{id}/download với token | Trả 403 ENROLLMENT_EXPIRED |
| T-DOC-009 | Upload file PDF hợp lệ | Admin đã đăng nhập, file PDF < giới hạn | POST /api/admin/documents/{id}/upload | Trả 200; FileAsset được tạo; preview status=pending |
| T-DOC-010 | Upload file không phải PDF | Admin đã đăng nhập, file docx | POST /api/admin/documents/{id}/upload | Trả 422 INVALID_FILE_TYPE |
| T-DOC-011 | Upload file quá kích thước | Admin đã đăng nhập, file > giới hạn | POST /api/admin/documents/{id}/upload | Trả 422 FILE_TOO_LARGE |
| T-DOC-012 | Admin xóa tài liệu | Admin có permission document:delete | DELETE /api/admin/documents/{id} | Trả 200; tài liệu không còn trong GET /api/documents |
| T-DOC-013 | Xem preview tài liệu PRO | Tài liệu PRO đã có previewPath | GET /api/documents/{id}/preview | Trả previewUrl hợp lệ |
| T-DOC-014 | Xem preview khi chưa có preview | Tài liệu mới upload chưa xử lý preview | GET /api/documents/{id}/preview | Trả previewUrl=null |
| T-DOC-015 | storagePath không lộ ra ngoài | Tài liệu có FileAsset với storagePath | GET /api/documents/{id} hoặc download | Response không chứa trường storagePath |

---

## 20. Phụ thuộc module khác

### Module này phụ thuộc
- **Authentication**: kiểm tra token và permission cho mọi API bảo mật.
- **Classroom**: kiểm tra enrollment khi truy cập tài liệu PRO gắn khóa học (gọi EnrollmentService).

### Module khác phụ thuộc module này
- **Reporting**: đọc dữ liệu DocumentDownloadLog để tạo báo cáo thống kê tải tài liệu.

### Nguyên tắc tích hợp
- Module Document không được gọi trực tiếp vào Order/Payment.
- Khi kiểm tra enrollment, gọi qua interface của EnrollmentService (module Classroom), không query DB trực tiếp.

---

## 21. Câu hỏi cần xác nhận

| Câu hỏi | Ảnh hưởng | Đề xuất tạm thời |
|---|---|---|
| Giới hạn kích thước file upload tối đa là bao nhiêu? | Validation upload | Đề xuất: 100MB |
| Ngoài PDF, còn hỗ trợ loại file nào khác? | Validation upload | Đề xuất: chỉ PDF trong phiên bản đầu |
| Số trang preview mặc định là bao nhiêu? | Cấu hình PreviewService | Đề xuất: 3 trang; có thể cấu hình theo tài liệu |
| Tài liệu public có cần đăng nhập mới tải không? | AccessPolicyChecker | Đề xuất: không cần đăng nhập với tài liệu accessType=public |
| Signed URL cho download nên hết hạn sau bao lâu? | DownloadService | Đề xuất: 10 phút |
| Có giới hạn số lượt tải tài liệu mỗi ngày không? | Rate limiting | Đề xuất: không giới hạn trong phiên bản đầu |
| Tài liệu gắn nhiều khóa học: học viên có enrollment của khóa nào cũng tải được không? | CourseDocumentMapping logic | Đề xuất: có enrollment với bất kỳ khóa nào gắn tài liệu đó là đủ |
