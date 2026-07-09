# Document — SRS mục tiêu

Mục tiêu: Thiết kế module quản lý tài liệu (Document) độc lập, hướng tới xây dựng lại từ đầu. Tài liệu này mô tả requirements, API đề xuất, domain model, kiến trúc module, UI, use cases, user stories và tiêu chí kiểm thử. Tất cả bằng chứng triển khai legacy đã được loại ra khỏi phần chính; nếu cần tham chiếu legacy, xem `docs/legacy-notes.md`.

## 2. Phạm vi
- Public listing & detail view
- Document types: FREE / PRO
- Preview generation for restricted documents
- Admin CRUD + category management
- File upload & storage management

## 3. Actors & Roles

| Actor/Role | Typical permissions | Notes |
|---|---|---|
| Guest | Browse public documents, view FREE docs/preview | Public endpoints only |
| Student | View FREE docs and PRO docs if enrolled in the related classroom | Requires enrollment check |
| Teacher | Create/manage documents linked to own classroom | Scoped permissions |
| Admin | Full CRUD for documents and categories, export | Audit admin actions |

## 4. Feature list

| Mã chức năng | Tên chức năng | Actor | Màn hình đề xuất | API đề xuất | Dịch vụ nghiệp vụ | Dữ liệu/model | Priority |
|---|---|---|---|---|---|---|---|
| DOC-01 | Public document listing | Guest, Student | `/documents` | `GET /api/documents` | DocumentService.listPublic | Document, Category | Must |
| DOC-02 | Document detail & access control | Guest, Student | `/documents/{id}` | `GET /api/documents/{id}` | DocumentService.getDetail | Document, Classroom, StudentCourse | Must |
| DOC-03 | Related documents | Guest, Student | Detail sidebar | `GET /api/documents/{id}/related` | DocumentService.related | Document | Should |
| DOC-04 | Category management (admin) | Admin | `/admin/documents/categories` | CRUD `/api/admin/document-categories` | CategoryService | DocumentCategory | Should |
| DOC-05 | Admin document CRUD | Admin | `/admin/documents` | CRUD `/api/admin/documents` | AdminDocumentService, UploadService | Document | Must |
| DOC-06 | Upload & preview generation | Guest/Student/Admin | Document detail | `POST /api/admin/documents/{id}/upload` | UploadService, PreviewService | Document, File | Must |

## 5. API đề xuất

| Mã API | Method | Endpoint | Purpose | Auth required | Request | Response | Notes |
|---|---:|---|---|---:|---|---|---|
| API-DOC-001 | GET | `/api/documents` | List public documents with filters | No | { q, mainCategory, subCategory, type, page, limit } | { items, total } | Support sorting, facets |
| API-DOC-002 | GET | `/api/documents/{id}` | Document detail & access decision | No (access decision in response) | - | { document, canView, previewUrl? } | If PRO & not enrolled -> canView=false |
| API-DOC-003 | GET | `/api/documents/{id}/related` | Related documents | No | - | { items } | Use category similarity |
| API-DOC-004 | POST | `/api/admin/documents` | Create document (admin) | Yes (admin) | multipart/form-data | { id } | Handle file upload or external link |
| API-DOC-005 | PUT | `/api/admin/documents/{id}` | Update document (admin) | Yes (admin) | multipart/form-data | { ok } | Replace or keep file |
| API-DOC-006 | POST | `/api/admin/documents/{id}/preview` | Generate preview PDF (3 pages) | Yes (admin) | - | { previewUrl } | Store preview separately |
| API-DOC-007 | GET | `/api/admin/document-categories` | List categories (admin) | Yes (admin) | - | { items } | CRUD endpoints complement this |

Notes:
- Response contract must exclude sensitive fields (file storage paths) when canView=false.
- Preview generation should be asynchronous for large files; return a taskId or previewUrl when ready.

## 6. Domain model / Data design

| Model | Key fields | Notes |
|---|---|---|
| Document | id, title, alias, description, docType(PDF/GOOGLE_DRIVE), docLink, documentType(FREE/PRO), lockType(FREE/SIGN_IN), status, mainCategoryId, subCategoryId, classroomId, viewed, createdAt, updatedAt | docLink is null if preview-only or not accessible |
| DocumentCategory | id, name, alias, parentId, ordering, status | hierarchical categories |
| FileMeta | id, documentId, storagePath, mimeType, size, uploadedAt | For uploaded files; store checksum |
| PreviewTask | id, documentId, status, previewUrl, createdAt | track preview generation |

Indexes & constraints:
- Document(mainCategoryId), Document(classroomId) indexes.
- Unique constraint on Document.alias per site.

## 7. Module architecture & components

Components:
- API layer (controllers): validate requests, map DTOs
- Application services: DocumentService, CategoryService, AdminDocumentService
- Repositories: DocumentRepo, CategoryRepo, FileRepo
- UploadService & PreviewService: handle file storage and preview generation
- Authorization middleware: determine canView per-request
- Background worker: generate preview asynchronously

Integration points:
- Storage (S3 or equivalent), CDN for preview serving
- Authentication module for enrollment checks
- Observability: logs/metrics and audit trail for admin operations

Design principles:
- Keep file processing out of request sync path; use background tasks
- Treat PRO document access as an authorization decision combining user enrollment and document flags

## 8. UI requirements

| Screen | Route | Actor | Purpose | API |
|---|---|---|---|---|
| Documents listing | `/documents` | Guest/Student | Browse & filter documents | GET /api/documents |
| Document detail | `/documents/{id}` | Guest/Student | Show metadata, access/preview | GET /api/documents/{id} |
| Admin document list/edit | `/admin/documents` | Admin | Manage docs and upload | Admin APIs |
| Admin categories | `/admin/documents/categories` | Admin | Manage categories | Admin APIs |

UI notes:
- Preview viewer embedded when previewUrl present; fall back to external viewer when docLink present and allowed.
- For PRO docs, show CTA to enroll or buy if canView=false.

## 9. Use cases (examples)

UC-DOC-001 — Browse public documents
- Actor: Guest
- Trigger: open `/documents`
- Main flow: call API-DOC-001, render items; filters applied
- Acceptance: only active documents returned

UC-DOC-002 — View document detail and access
- Actor: Student/Guest
- Trigger: open `/documents/{id}`
- Main flow: API-DOC-002 returns document and canView flag; if canView false and docType=PDF and lockType=SIGN_IN -> previewUrl provided

UC-DOC-003 — Admin creates document with upload
- Actor: Admin
- Trigger: upload file in admin UI
- Main flow: Admin uploads file -> UploadService stores file -> AdminDocumentService creates Document record -> Preview generation enqueued

## 10. User stories (examples)

US-DOC-001 — As a guest, I want to search documents by category and keyword so I can find study materials. (Priority: Must)

US-DOC-002 — As a student enrolled in the classroom, I want to access PRO documents for that classroom. (Priority: Must)

US-DOC-003 — As an admin, I want to upload PDF and trigger preview generation so users can see a preview when access is restricted. (Priority: Should)

## 11. Tests & acceptance criteria

- Listing API returns only `status=true` and `deleted_at=null` documents for public calls.
- Detail API returns `canView=true` only when enrollment/permission checks pass.
- Preview generation produces a preview URL and preview serves up to 3 pages.
- Admin CRUD operations recorded in audit logs.

## 12. Migration & legacy notes

Legacy implementation details, controller names, and file-system evidence were removed from this SRS. For migration mapping and legacy references, consult `docs/legacy-notes.md` where legacy paths and mapping instructions are collected.

