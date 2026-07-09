# Book / Book ID — SRS mục tiêu

Mục tiêu: Thiết kế module sản phẩm sách và book-id/course bundles để hỗ trợ browse, ownership, bán hàng và quản lý nội dung liên quan. Phần tham chiếu legacy đã được loại khỏi nội dung chính; mapping legacy giữ ở `docs/legacy-notes.md`.

## Phạm vi
- Public book catalog và post detail
- Book ID lookup và ownership validation
- Course bundle access bằng book-id
- Admin CRUD for book products and bundle definitions
- Book review metadata and eligibility flags

## Actors & Roles

| Actor | Role | Notes |
|---|---|---|
| Guest | Browse book catalog | Can view public book products |
| Student | Access owned book bundle | Can validate book-id and view owned bundles |
| Admin | Manage book/product definitions | CRUD books, bundles, book-id records |

## Feature list

| Code | Feature | API proposal | Priority |
|---|---|---|---|
| BOOK-01 | Public book catalog | `GET /api/books` | Must |
| BOOK-02 | Book detail | `GET /api/books/{slug}` | Must |
| BOOK-03 | Related book recommendations | `GET /api/books/{id}/related` | Should |
| BOOK-04 | Book ID lookup / validation | `POST /api/book-ids/validate` | Must |
| BOOK-05 | Owned bundle listing | `GET /api/book-id-courses/owned` | Should |
| BOOK-06 | Admin book/product management | `CRUD /api/admin/books` | Should |

## API proposals (key endpoints)

| API | Method | Endpoint | Purpose | Auth |
|---|---:|---|---|---:|
| API-BOOK-001 | GET | `/api/books` | List books with filters | No |
| API-BOOK-002 | GET | `/api/books/{slug}` | Retrieve book detail | No |
| API-BOOK-003 | GET | `/api/books/{id}/related` | Related products | No |
| API-BOOK-004 | POST | `/api/book-ids/validate` | Validate book-id ownership | Yes |
| API-BOOK-005 | GET | `/api/book-id-courses/owned` | List owned bundles | Yes |
| API-BOOK-006 | POST | `/api/admin/books` | Create book product | Yes |

## Domain model (summary)

Models: Book, BookId, BookBundle, BookReview, StudentBookId, UserPurchase

Key fields:
- Book: id, title, slug, alias, price, author, categories, related_books, status, published_at
- BookId: id, code, product_id, active, expiry_date, owned_by
- BookBundle: id, book_id, classroom_ids, included_course_ids
- StudentBookId: student_id, book_id, purchased_at, status

## Architecture notes

- Public catalog endpoints are cacheable and support search filters.
- Ownership validation is isolated in a service that checks StudentBookId and associated classroom access.
- Book bundle definitions map books to related course sets and classroom enrollments.
- Admin functions require auth + role/scope checks.

## UI requirements

Public screens: book listing `/sach`, book detail `/sach/{slug}`, book-id lookup `/sach-id`, owned bundles `/account/my-course`.
Admin screens: book management, bundle management.

UX notes:
- Display ownership status clearly for logged-in users.
- Provide accessible validation flow for book-id entry.

## Use cases

UC-BOOK-001: Visitor browses book catalog and filters by category.
UC-BOOK-002: Student views book detail and sees owned status.
UC-BOOK-003: Student validates a book-id to access bundled courses.
UC-BOOK-004: Admin creates or updates book product data.

## User stories

- As a visitor, I want to browse available books so I can choose a product. (Must)
- As a student, I want to validate my book-id so I can access bundled learning content. (Must)
- As an admin, I want to manage book records and bundles so the catalog reflects current offerings. (Should)

## Acceptance criteria

- `GET /api/books` returns published books only.
- `GET /api/books/{slug}` returns 404 for missing book.
- `POST /api/book-ids/validate` returns ownership status and book bundle details.
- Owned bundle endpoint returns only items associated with the authenticated user.

## Migration & legacy notes

- Legacy controller and route mappings should be captured in `docs/legacy-notes.md`.
- Primary SRS must not include source file paths or controller names.
