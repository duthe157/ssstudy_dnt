# Content pages / Blog / CMS — SRS mục tiêu

Mục tiêu: Thiết kế module quản lý nội dung (Blog, Pages, About, CEO, Teachers) dưới dạng CMS nhẹ, tập trung API, domain model, UX và quy tắc xuất bản. Phần tham chiếu legacy đã được loại khỏi nội dung chính; nếu cần, legacy mapping được lưu trong `docs/legacy-notes.md`.

## Phạm vi
- Public content listing & detail (blog posts, pages)
- Admin CRUD for posts, categories, pages, teachers, CEO
- Content publishing workflow (draft/publish/unpublish)
- Media references and optional editor metadata (seo, excerpt, hero image)

## Actors & Roles

| Actor | Role | Notes |
|---|---|---|
| Guest | Browse public content | Can view published content |
| Student | Browse content, signed-in view | Same as Guest plus user-specific features (bookmarks) |
| Editor / Teacher | Create/edit content | Scoped to assigned categories/pages |
| Admin | Full content management | Manage publishing, categories, site settings |

## Feature list

| Code | Feature | API proposal | Priority |
|---|---|---|---|
| CNT-01 | Public blog listing & category filter | `GET /api/content/posts` | Must |
| CNT-02 | Public post detail | `GET /api/content/posts/{slug}` | Must |
| CNT-03 | Page detail (About/CEO/Teachers) | `GET /api/content/pages/{key}` | Must |
| CNT-04 | Admin CRUD posts & categories | `CRUD /api/admin/posts` | Should |
| CNT-05 | Content publish workflow | `POST /api/admin/posts/{id}/publish` | Should |
| CNT-06 | Media management (references) | `POST /api/admin/media` | Could |

## API proposals (summary)

| API | Method | Endpoint | Purpose | Auth |
|---|---:|---|---|---:|
| API-CNT-001 | GET | `/api/content/posts` | List posts with filters (category, keyword, page) | No |
| API-CNT-002 | GET | `/api/content/posts/{slug}` | Retrieve post detail | No |
| API-CNT-003 | GET | `/api/content/pages/{key}` | Retrieve page content (about/ceo/teachers) | No |
| API-CNT-004 | POST | `/api/admin/posts` | Create post | Yes (editor/admin) |
| API-CNT-005 | PUT | `/api/admin/posts/{id}` | Update post | Yes |
| API-CNT-006 | POST | `/api/admin/posts/{id}/publish` | Publish post | Yes |

## Domain model (high level)

Models: Post, Category, Page, Media, Author

Post fields (suggested): id, title, slug, excerpt, content (MD/HTML), status (draft/published), author_id, category_ids, hero_image_id, seo_meta, published_at, created_at, updated_at

## Architecture notes

- Public read paths served via cache-friendly endpoints, with CDN for media.
- Admin write operations behind auth + scope checks.
- Media storage via object store; media references stored by ID in Post model.
- Publishing implemented as state transition; background job to re-generate search/index if applicable.

## UI requirements

Public pages: news listing, category listing, post detail, about, teachers, CEO page.
Admin pages: posts list, editor form (WYSIWYG/MD), categories, media manager.

## Use cases

UC-CNT-001: Visitor searches posts by keyword → sees filtered list → opens post detail.

UC-CNT-002: Editor creates post in draft → previews → publishes → post becomes visible to public.

## User stories (examples)

- As a visitor, I want to read latest blog posts ordered by published date. (Must)
- As an editor, I want to save drafts and preview before publishing. (Should)
- As an admin, I want to manage categories and media for posts. (Should)

## Acceptance criteria / Tests

- Public list returns only published posts and supports pagination.
- Post detail returns canonical slug and 200/404 behavior.
- Publish endpoint transitions draft→published and sets published_at.
- Media upload returns stable IDs and URLs.

## Migration & legacy notes

- Map existing controllers/routes to the new API contract in `docs/legacy-notes.md` for migration scripts. Do not include source file paths in the SRS documents.

*** End of SRS for Content pages / CMS
