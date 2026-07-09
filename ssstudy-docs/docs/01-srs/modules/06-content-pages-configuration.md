# Content / Trang nội dung / Cấu hình — SRS mục tiêu

> Tài liệu đặc tả yêu cầu phần mềm (SRS) cho module Content/Configuration của hệ thống SSStudy.
> Viết như thể hệ thống chưa có code. Mục tiêu: đủ chi tiết để developer triển khai hoàn chỉnh chỉ từ tài liệu này.

---

## 1. Mục tiêu nghiệp vụ

Module Content/Configuration quản lý toàn bộ nội dung tĩnh và cấu hình hiển thị của website SSStudy:

- Hiển thị và quản lý blog/tin tức: bài viết, danh mục, tìm kiếm.
- Quản lý nội dung trang tĩnh: trang chủ, giới thiệu, trang giáo viên, CEO, landing page.
- Quản lý banner quảng cáo và ảnh nổi bật.
- Cấu hình toàn hệ thống: tiêu đề website, mô tả SEO, hotline, email, mạng xã hội, footer, menu.
- Cho phép admin soạn thảo và xuất bản nội dung với workflow draft/published/hidden/archived.
- Hỗ trợ xem trước nội dung trước khi xuất bản.

---

## 2. Phạm vi chức năng

| STT | Chức năng | Mô tả ngắn |
|---|---|---|
| 1 | Danh sách bài viết blog | Hiển thị, lọc theo danh mục, tìm kiếm |
| 2 | Chi tiết bài viết blog | Nội dung đầy đủ, SEO metadata |
| 3 | Danh sách danh mục blog | Phân loại bài viết |
| 4 | Nội dung trang tĩnh | Trang chủ, giới thiệu, giáo viên, CEO, landing |
| 5 | Banner | Hiển thị banner theo vị trí |
| 6 | Cấu hình SEO | Meta title, description, og:image per page |
| 7 | Cấu hình website | Hotline, email, mạng xã hội, footer, menu |
| 8 | Thông tin thương hiệu | Tên, logo, favicon |
| 9 | Workflow xuất bản | Draft → Published → Hidden → Archived |
| 10 | Xem trước nội dung | Preview trước khi publish |
| 11 | Admin quản lý bài viết | CRUD blog post, danh mục |
| 12 | Admin quản lý trang tĩnh | CRUD PageContent |
| 13 | Admin quản lý banner | CRUD Banner, sắp xếp, kích hoạt |
| 14 | Admin cấu hình hệ thống | CRUD SiteConfig, MenuConfig |

---

## 3. Ngoài phạm vi

- Hệ thống bình luận bài viết.
- Tích hợp mạng xã hội tự động đăng bài.
- A/B testing landing page.
- Cá nhân hóa nội dung theo học viên.
- Đa ngôn ngữ (i18n) đầy đủ trong phiên bản này.
- Hệ thống quản lý tài sản số (DAM) đầy đủ chức năng.

---

## 4. Actor

| Actor | Mô tả | Quyền cơ bản |
|---|---|---|
| Guest | Người dùng chưa đăng nhập | Xem tất cả nội dung đã xuất bản |
| student | Học viên đã đăng nhập | Xem nội dung như guest; không có quyền đặc biệt thêm |
| editor | Biên tập viên | Tạo và sửa bài viết, trang tĩnh; không xuất bản |
| admin | Quản trị viên | Toàn quyền quản lý nội dung, banner, cấu hình |
| superAdmin | Quản trị cấp cao | Toàn quyền bao gồm cấu hình hệ thống nhạy cảm |

---

## 5. Permission

| Mã permission | Mô tả | Role mặc định |
|---|---|---|
| `content:read:draft` | Xem nội dung chưa xuất bản | admin, superAdmin, editor |
| `content:create` | Tạo bài viết và trang tĩnh | admin, superAdmin, editor |
| `content:update` | Sửa bài viết và trang tĩnh | admin, superAdmin, editor |
| `content:delete` | Xóa mềm bài viết | admin, superAdmin |
| `content:publish` | Xuất bản hoặc ẩn nội dung | admin, superAdmin |
| `banner:manage` | Tạo/sửa/xóa/kích hoạt banner | admin, superAdmin |
| `site-config:manage` | Sửa cấu hình website và menu | admin, superAdmin |
| `blog-category:manage` | Tạo/sửa/xóa danh mục blog | admin, superAdmin |

---

## 6. Danh sách chức năng

| Mã chức năng | Tên chức năng | Actor | Màn hình đề xuất | API đề xuất | Dịch vụ nghiệp vụ cần có | Dữ liệu/model liên quan | Quy tắc áp dụng | Priority |
|---|---|---|---|---|---|---|---|---|
| CNT-01 | Danh sách bài viết blog | Guest, student | `/blog` | `GET /api/blog-posts` | Lọc theo danh mục, từ khóa; phân trang; chỉ published | BlogPost, BlogCategory | BR-CONTENT-001 | Must |
| CNT-02 | Chi tiết bài viết blog | Guest, student | `/blog/{slug}` | `GET /api/blog-posts/{slug}` | Trả nội dung đầy đủ, SEO metadata, bài liên quan | BlogPost, SeoMetadata | BR-CONTENT-001 | Must |
| CNT-03 | Danh sách danh mục blog | Guest, student | `/blog` | `GET /api/blog-categories` | Trả danh sách danh mục active | BlogCategory | — | Must |
| CNT-04 | Nội dung trang tĩnh | Guest, student | `/about`, `/teachers`, `/` | `GET /api/pages/{slug}` | Trả nội dung trang theo slug | PageContent, SeoMetadata | BR-CONTENT-001 | Must |
| CNT-05 | Danh sách banner theo vị trí | Guest, student | Mọi trang | `GET /api/banners` | Lọc theo position và status=active | Banner | BR-CONTENT-001 | Must |
| CNT-06 | Cấu hình website công khai | Guest | Mọi trang | `GET /api/site-config` | Trả hotline, email, mạng xã hội, footer, thương hiệu | SiteConfig | — | Must |
| CNT-07 | Admin tạo/sửa bài viết | admin, editor | `/admin/blog` | `POST/PUT /api/admin/blog-posts` | Soạn thảo, lưu draft, gán danh mục, SEO | BlogPost, SeoMetadata | `content:create`, `content:update` | Must |
| CNT-08 | Admin xuất bản/ẩn bài viết | admin | `/admin/blog/{id}` | `PUT /api/admin/blog-posts/{id}/publish` | Chuyển trạng thái published/hidden | BlogPost | `content:publish`, BR-CONTENT-001 | Must |
| CNT-09 | Admin xem trước bài viết | admin, editor | `/admin/blog/{id}/preview` | `GET /api/admin/blog-posts/{id}/preview` | Trả bài viết bất kể trạng thái để xem trước | BlogPost | `content:read:draft` | Should |
| CNT-10 | Admin quản lý trang tĩnh | admin | `/admin/pages` | CRUD `/api/admin/pages` | Tạo/sửa/xuất bản trang tĩnh theo slug | PageContent, SeoMetadata | `content:update` | Must |
| CNT-11 | Admin quản lý banner | admin | `/admin/banners` | CRUD `/api/admin/banners` | Tạo/sửa/xóa/sắp xếp banner | Banner | `banner:manage` | Must |
| CNT-12 | Admin quản lý danh mục blog | admin | `/admin/blog-categories` | CRUD `/api/admin/blog-categories` | Tạo/sửa/xóa danh mục | BlogCategory | `blog-category:manage` | Must |
| CNT-13 | Admin cấu hình website | admin | `/admin/settings` | `GET/PUT /api/admin/site-config` | Sửa hotline, email, social, footer, SEO mặc định | SiteConfig | `site-config:manage` | Must |
| CNT-14 | Admin quản lý menu | admin | `/admin/settings/menu` | `GET/PUT /api/admin/menu-config` | Cấu hình menu header/footer | MenuConfig | `site-config:manage` | Should |

---

## 7. Thiết kế dữ liệu / Domain model đề xuất

### Model chính

| Model | Mục đích | Field quan trọng | Quan hệ |
|---|---|---|---|
| BlogPost | Bài viết blog/tin tức | id, title, slug, content, status, authorId, categoryId | FK tới BlogCategory, SeoMetadata |
| BlogCategory | Danh mục bài viết | id, name, slug, ordering, status | Có nhiều BlogPost |
| PageContent | Nội dung trang tĩnh | id, slug, title, content, status | FK tới SeoMetadata |
| Banner | Banner quảng cáo | id, title, imageUrl, linkUrl, position, ordering, status | |
| SiteConfig | Cấu hình toàn hệ thống | id, key, value, type, group | Key-value store |
| SeoMetadata | SEO metadata per page | id, entityType, entityId, metaTitle, metaDescription, ogImage | Polymorphic |
| MenuConfig | Cấu hình menu | id, location, items (JSON) | |
| MediaAsset | Tài sản media | id, fileName, url, mimeType, fileSize, uploadedBy | |

### Field chi tiết

#### Model: BlogPost
| Field | Kiểu dữ liệu | Bắt buộc | Ý nghĩa | Validation |
|---|---|---|---|---|
| id | UUID | Có | Khóa chính | Auto-generate |
| title | varchar(255) | Có | Tiêu đề bài viết | Không rỗng |
| slug | varchar(255) | Có | URL-friendly | Unique, lowercase |
| excerpt | varchar(500) | Không | Mô tả ngắn hiển thị ở danh sách | |
| content | text | Có | Nội dung HTML hoặc Markdown | |
| status | enum | Có | Trạng thái | draft, published, hidden, archived |
| authorId | UUID FK | Có | Người viết | |
| categoryId | UUID FK | Không | Danh mục | |
| heroImageUrl | varchar(500) | Không | Ảnh đại diện | URL hợp lệ |
| publishedAt | timestamp | Không | Thời điểm xuất bản | Null nếu chưa published |
| ordering | int | Không | Thứ tự hiển thị | |
| viewCount | int | Không | Lượt xem (cache) | Mặc định 0 |
| createdAt | timestamp | Có | | Auto |
| updatedAt | timestamp | Có | | Auto |

#### Model: PageContent
| Field | Kiểu dữ liệu | Bắt buộc | Ý nghĩa | Validation |
|---|---|---|---|---|
| id | UUID | Có | Khóa chính | |
| slug | varchar(100) | Có | Định danh trang | Unique; ví dụ: home, about, teachers, ceo |
| title | varchar(255) | Có | Tiêu đề trang | |
| content | text/jsonb | Có | Nội dung trang (JSON structure hoặc HTML) | |
| status | enum | Có | Trạng thái | draft, published, hidden |
| updatedAt | timestamp | Có | | Auto |

#### Model: Banner
| Field | Kiểu dữ liệu | Bắt buộc | Ý nghĩa | Validation |
|---|---|---|---|---|
| id | UUID | Có | Khóa chính | |
| title | varchar(255) | Có | Tiêu đề banner | |
| imageUrl | varchar(500) | Có | URL ảnh banner | URL hợp lệ |
| linkUrl | varchar(500) | Không | Liên kết khi nhấn | URL hợp lệ nếu có |
| position | varchar(50) | Có | Vị trí hiển thị | homepage_hero, sidebar, popup, v.v. |
| ordering | int | Không | Thứ tự trong cùng position | |
| status | enum | Có | Trạng thái | active, inactive |
| startsAt | timestamp | Không | Thời điểm bắt đầu hiển thị | |
| endsAt | timestamp | Không | Thời điểm kết thúc | |

#### Model: SiteConfig
| Field | Kiểu dữ liệu | Bắt buộc | Ý nghĩa | Validation |
|---|---|---|---|---|
| id | UUID | Có | Khóa chính | |
| key | varchar(100) | Có | Tên cấu hình | Unique; ví dụ: site_name, hotline, email |
| value | text | Có | Giá trị | |
| type | enum | Có | Kiểu giá trị | string, number, boolean, json |
| group | varchar(50) | Có | Nhóm cấu hình | brand, contact, social, seo, footer |
| isPublic | boolean | Có | Có trả ra API public không | Mặc định false |

#### Model: SeoMetadata
| Field | Kiểu dữ liệu | Bắt buộc | Ý nghĩa |
|---|---|---|---|
| id | UUID | Có | Khóa chính |
| entityType | varchar(50) | Có | Loại đối tượng: blog_post, page, course |
| entityId | UUID | Có | ID đối tượng |
| metaTitle | varchar(255) | Không | Meta title override |
| metaDescription | varchar(500) | Không | Meta description |
| ogImage | varchar(500) | Không | Open Graph image URL |

### Quan hệ dữ liệu
- BlogPost `N—1` BlogCategory.
- BlogPost `1—1` SeoMetadata (polymorphic).
- PageContent `1—1` SeoMetadata.
- Banner có thể liên kết đến Course, BlogPost qua linkUrl.

### Index / Constraint đề xuất

| Bảng | Index / Constraint | Mục đích |
|---|---|---|
| BlogPost | UNIQUE(slug) | URL duy nhất |
| BlogPost | INDEX(status, categoryId, publishedAt) | Lọc và sắp xếp nhanh |
| PageContent | UNIQUE(slug) | Trang duy nhất |
| Banner | INDEX(position, status, ordering) | Lọc banner theo vị trí |
| SiteConfig | UNIQUE(key) | Mỗi key một giá trị |
| SeoMetadata | UNIQUE(entityType, entityId) | Một SEO record per entity |

---

## 8. Thiết kế kiến trúc module

### Thành phần cần có

| Thành phần | Vai trò | Ghi chú triển khai |
|---|---|---|
| API layer (Controller) | Nhận request, validate, gọi service | Không chứa business logic |
| BlogService | Lấy danh sách và chi tiết bài viết, lọc | Chỉ trả published với API public |
| PageService | Lấy nội dung trang tĩnh theo slug | Caching phù hợp cho trang tĩnh |
| BannerService | Lấy banner theo position và thời gian | Kiểm tra startsAt/endsAt |
| SiteConfigService | Đọc và ghi cấu hình website | Cache cấu hình public; invalidate khi cập nhật |
| SeoService | Trả SeoMetadata cho từng entity | Fallback về SiteConfig nếu không có override |
| AdminContentService | CRUD bài viết, trang, banner, danh mục | Gọi repository, ghi audit log |
| ContentRepository | Truy vấn BlogPost, PageContent | |
| AuditLogger | Ghi audit log hành động admin | Gọi async |
| MediaUploadService | Upload ảnh cho bài viết và banner | Dùng StorageAdapter; trả URL |

### Dependency
- Module Content không phụ thuộc Classroom, Exam hay Order.
- Module Content phụ thuộc Authentication để kiểm tra token và permission cho admin API.
- Module Reporting có thể đọc viewCount và download stats từ Content.

### Nguyên tắc triển khai
- API public chỉ trả nội dung có status=published.
- Cấu hình SiteConfig chỉ trả những key có isPublic=true ra API public.
- Preview API (`/admin/blog-posts/{id}/preview`) trả nội dung bất kể trạng thái — chỉ cho user có `content:read:draft`.
- Banner lọc theo thời gian: startsAt <= now <= endsAt nếu có; nếu không có thì không lọc theo thời gian.
- Caching: nội dung trang tĩnh và SiteConfig cache được do ít thay đổi — invalidate khi admin cập nhật.

---

## 9. Yêu cầu giao diện

| Màn hình | Route đề xuất | Actor | Mục đích | API sử dụng |
|---|---|---|---|---|
| Danh sách blog | `/blog` | Guest, student | Đọc tin tức, lọc theo danh mục | `GET /api/blog-posts` |
| Chi tiết bài viết | `/blog/{slug}` | Guest, student | Đọc nội dung bài viết đầy đủ | `GET /api/blog-posts/{slug}` |
| Trang giới thiệu | `/about` | Guest, student | Giới thiệu công ty/trung tâm | `GET /api/pages/about` |
| Trang giáo viên | `/teachers` | Guest, student | Danh sách và giới thiệu giáo viên | `GET /api/pages/teachers` |
| Trang chủ | `/` | Guest, student | Landing page, banner, nội dung chính | `GET /api/pages/home`, `GET /api/banners` |
| Quản lý blog (admin) | `/admin/blog` | admin, editor | Danh sách bài viết | `GET /api/admin/blog-posts` |
| Tạo/sửa bài viết (admin) | `/admin/blog/new`, `/admin/blog/{id}/edit` | admin, editor | Soạn thảo nội dung | `POST/PUT /api/admin/blog-posts` |
| Quản lý trang tĩnh (admin) | `/admin/pages` | admin | Chỉnh sửa trang tĩnh | CRUD `/api/admin/pages` |
| Quản lý banner (admin) | `/admin/banners` | admin | Tạo, sắp xếp, kích hoạt banner | CRUD `/api/admin/banners` |
| Cấu hình website (admin) | `/admin/settings` | admin | Hotline, email, SEO mặc định | `GET/PUT /api/admin/site-config` |
| Cấu hình menu (admin) | `/admin/settings/menu` | admin | Header/footer menu | `GET/PUT /api/admin/menu-config` |

**Yêu cầu UI chi tiết:**
- Trang blog: bộ lọc theo danh mục; thẻ "Mới nhất" cho bài vừa đăng; phân trang.
- Form soạn thảo (admin): WYSIWYG hoặc Markdown; ô nhập slug tự sinh từ tiêu đề; ô SEO riêng.
- Quản lý banner: drag-and-drop sắp xếp thứ tự; toggle bật/tắt inline; preview ảnh.
- Cấu hình website: form nhóm theo group (brand, contact, social, seo); lưu từng group riêng.

---

## 10. API đề xuất

| Mã API | Method | Endpoint đề xuất | Mục đích | Auth required | Permission | Request chính | Response chính | Business rule | Ghi chú |
|---|---|---|---|---|---|---|---|---|---|
| API-CNT-001 | GET | `/api/blog-posts` | Danh sách bài viết | Không | Không | `?category, q, page, limit, sort` | `{ items, total }` | BR-CONTENT-001 | Chỉ published |
| API-CNT-002 | GET | `/api/blog-posts/{slug}` | Chi tiết bài viết | Không | Không | — | `{ post, seo, relatedPosts }` | BR-CONTENT-001 | 404 nếu không published |
| API-CNT-003 | GET | `/api/blog-categories` | Danh sách danh mục | Không | Không | — | `{ items }` | — | Chỉ active |
| API-CNT-004 | GET | `/api/pages/{slug}` | Nội dung trang tĩnh | Không | Không | — | `{ page, seo }` | BR-CONTENT-001 | slug: home, about, teachers, ceo |
| API-CNT-005 | GET | `/api/banners` | Danh sách banner | Không | Không | `?position` | `{ items }` | BR-CONTENT-001 | Lọc theo position và thời gian |
| API-CNT-006 | GET | `/api/site-config` | Cấu hình công khai | Không | Không | — | `{ config }` | — | Chỉ trả isPublic=true |
| API-CNT-007 | GET | `/api/admin/blog-posts` | Danh sách bài viết (admin) | Có | `content:read:draft` | `?status, category, q, page` | `{ items, total }` | — | Bao gồm draft |
| API-CNT-008 | POST | `/api/admin/blog-posts` | Tạo bài viết | Có | `content:create` | `{ title, content, categoryId, seo? }` | `{ postId }` | — | Tạo với status=draft |
| API-CNT-009 | PUT | `/api/admin/blog-posts/{id}` | Sửa bài viết | Có | `content:update` | `{ title, content, ... }` | `{ ok }` | — | |
| API-CNT-010 | PUT | `/api/admin/blog-posts/{id}/publish` | Xuất bản / ẩn | Có | `content:publish` | `{ publish: true/false }` | `{ ok, status }` | BR-CONTENT-001 | |
| API-CNT-011 | GET | `/api/admin/blog-posts/{id}/preview` | Xem trước | Có | `content:read:draft` | — | `{ post }` | — | Trả bất kể trạng thái |
| API-CNT-012 | DELETE | `/api/admin/blog-posts/{id}` | Xóa mềm | Có | `content:delete` | — | `{ ok }` | — | |
| API-CNT-013 | GET | `/api/admin/blog-categories` | Danh sách danh mục (admin) | Có | `blog-category:manage` | — | `{ items }` | — | |
| API-CNT-014 | POST | `/api/admin/blog-categories` | Tạo danh mục | Có | `blog-category:manage` | `{ name, ordering? }` | `{ categoryId }` | — | |
| API-CNT-015 | GET | `/api/admin/pages` | Danh sách trang tĩnh (admin) | Có | `content:read:draft` | — | `{ items }` | — | |
| API-CNT-016 | PUT | `/api/admin/pages/{slug}` | Cập nhật trang tĩnh | Có | `content:update` | `{ title, content, seo? }` | `{ ok }` | — | Upsert theo slug |
| API-CNT-017 | GET | `/api/admin/banners` | Danh sách banner (admin) | Có | `banner:manage` | — | `{ items }` | — | |
| API-CNT-018 | POST | `/api/admin/banners` | Tạo banner | Có | `banner:manage` | `{ title, imageUrl, position, ... }` | `{ bannerId }` | — | |
| API-CNT-019 | PUT | `/api/admin/banners/{id}` | Sửa banner | Có | `banner:manage` | `{ title, imageUrl, status, ... }` | `{ ok }` | — | |
| API-CNT-020 | GET | `/api/admin/site-config` | Cấu hình website (admin) | Có | `site-config:manage` | — | `{ config }` | — | Trả tất cả key |
| API-CNT-021 | PUT | `/api/admin/site-config` | Cập nhật cấu hình | Có | `site-config:manage` | `{ [key]: value, ... }` | `{ ok }` | — | Batch update |
| API-CNT-022 | GET | `/api/admin/menu-config` | Cấu hình menu (admin) | Có | `site-config:manage` | — | `{ menus }` | — | |
| API-CNT-023 | PUT | `/api/admin/menu-config` | Cập nhật menu | Có | `site-config:manage` | `{ location, items }` | `{ ok }` | — | |

---

## 11. Use case nghiệp vụ

### UC-CNT-001 — Khách đọc bài viết blog

- **Mục tiêu**: Người dùng tìm và đọc tin tức, bài viết hữu ích về học tập.
- **Actor chính**: Guest, student.
- **Điều kiện trước**: Có bài viết đã xuất bản.
- **Trigger**: Người dùng truy cập trang blog hoặc nhấp vào bài viết từ trang chủ.
- **Luồng chính**:
  1. Người dùng truy cập `/blog`.
  2. Hệ thống trả danh sách bài viết status=published, sắp xếp theo publishedAt giảm dần.
  3. Người dùng lọc theo danh mục hoặc tìm kiếm.
  4. Người dùng nhấp vào bài viết.
  5. Hệ thống trả nội dung đầy đủ kèm SEO metadata và bài viết liên quan.
- **Luồng lỗi**: Slug không tồn tại hoặc bài chưa published → 404.
- **Business rule áp dụng**: BR-CONTENT-001.
- **Acceptance criteria**: Chỉ bài published hiển thị; bài draft không xuất hiện dù biết slug.

---

### UC-CNT-002 — Editor soạn thảo và xuất bản bài viết

- **Mục tiêu**: Editor tạo nội dung mới và admin duyệt xuất bản.
- **Actor chính**: editor (tạo), admin (xuất bản).
- **Điều kiện trước**: Editor có permission `content:create`.
- **Luồng chính**:
  1. Editor tạo bài viết mới với tiêu đề, nội dung, danh mục, ảnh đại diện.
  2. Hệ thống tạo BlogPost với status=draft.
  3. Editor xem trước qua `/admin/blog-posts/{id}/preview`.
  4. Editor hoàn thiện nội dung.
  5. Admin nhấn "Xuất bản" — hệ thống chuyển status → published, ghi publishedAt.
  6. Bài viết xuất hiện trong danh sách công khai.
- **Luồng thay thế**: Admin tự soạn và xuất bản trong một bước.
- **Luồng lỗi**: Editor cố xuất bản khi không có permission → 403.
- **Business rule áp dụng**: BR-CONTENT-001, BR-CONTENT-002.
- **Acceptance criteria**: Bài draft không hiển thị công khai; xuất bản thành công thì hiển thị ngay.

---

### UC-CNT-003 — Admin cập nhật cấu hình website

- **Mục tiêu**: Admin cập nhật thông tin liên hệ, SEO mặc định và cấu hình hiển thị.
- **Actor chính**: admin, superAdmin.
- **Điều kiện trước**: Có permission `site-config:manage`.
- **Luồng chính**:
  1. Admin truy cập trang cài đặt.
  2. Hệ thống trả tất cả SiteConfig theo nhóm.
  3. Admin sửa giá trị (hotline, email, SEO mặc định, mạng xã hội).
  4. Admin lưu — hệ thống cập nhật SiteConfig và invalidate cache.
  5. Các trang public phản ánh thông tin mới ngay sau khi cache hết hạn.
- **Business rule áp dụng**: BR-CONTENT-002.
- **Acceptance criteria**: Cập nhật thành công; API public `/api/site-config` chỉ trả isPublic=true key.

---

### UC-CNT-004 — Admin quản lý banner theo vị trí

- **Mục tiêu**: Admin thêm và sắp xếp banner cho từng vị trí trên website.
- **Actor chính**: admin.
- **Điều kiện trước**: Có permission `banner:manage`.
- **Luồng chính**:
  1. Admin tạo banner với ảnh, link, vị trí (position), thời gian hiển thị.
  2. Hệ thống tạo Banner với status=active (hoặc inactive theo cấu hình).
  3. Admin sắp xếp thứ tự trong cùng position.
  4. API public trả banner lọc theo position và kiểm tra startsAt/endsAt.
- **Luồng lỗi**: Upload ảnh thất bại → 500; ảnh sai định dạng → 422.
- **Acceptance criteria**: Banner inactive không hiển thị; banner hết hạn (endsAt < now) không hiển thị.

---

## 12. User story

### US-CNT-001 — Đọc tin tức mới nhất
- **Với vai trò**: Khách truy cập
- **Tôi muốn**: Xem danh sách bài viết blog mới nhất
- **Để**: Cập nhật thông tin học tập và tin tức từ SSStudy
- **Priority**: Must
- **Given**: Có ít nhất một bài viết đã xuất bản
- **When**: Tôi truy cập trang `/blog`
- **Then**: Thấy danh sách bài viết sắp xếp từ mới nhất; mỗi bài có tiêu đề, ảnh và mô tả ngắn
- **Test scenario**: Có bài published → hiển thị; bài draft → không hiển thị dù biết slug

### US-CNT-002 — Lọc bài viết theo danh mục
- **Với vai trò**: Khách truy cập
- **Tôi muốn**: Lọc bài viết theo chủ đề quan tâm
- **Để**: Tìm nhanh nội dung liên quan đến môn học hoặc kỹ năng cụ thể
- **Priority**: Must
- **Given**: Có nhiều danh mục bài viết
- **When**: Tôi nhấp vào danh mục "Ôn thi Đại học"
- **Then**: Chỉ hiển thị bài viết thuộc danh mục đó; phân trang hoạt động
- **Test scenario**: Danh mục có bài → lọc đúng; danh mục rỗng → trả mảng rỗng

### US-CNT-003 — Admin tạo bài viết draft
- **Với vai trò**: Editor
- **Tôi muốn**: Soạn thảo và lưu bài viết dưới dạng draft
- **Để**: Hoàn thiện nội dung trước khi xuất bản
- **Priority**: Must
- **Given**: Tôi có permission content:create
- **When**: Tôi điền thông tin và nhấn "Lưu nháp"
- **Then**: Bài viết được lưu với status=draft; không hiển thị công khai
- **Test scenario**: Lưu draft → status=draft; xem trước → thấy nội dung dù chưa published

### US-CNT-004 — Admin xuất bản bài viết
- **Với vai trò**: Admin
- **Tôi muốn**: Xuất bản bài viết draft để người dùng thấy
- **Để**: Đưa nội dung đến người đọc đúng thời điểm
- **Priority**: Must
- **Given**: Bài viết đang ở status=draft
- **When**: Tôi nhấn "Xuất bản"
- **Then**: Status chuyển sang published; publishedAt ghi thời điểm hiện tại; bài xuất hiện công khai
- **Rule liên quan**: BR-CONTENT-001
- **Test scenario**: Xuất bản thành công → hiển thị trên `/blog`; ẩn bài → không hiển thị

### US-CNT-005 — Admin cập nhật hotline và email liên hệ
- **Với vai trò**: Admin
- **Tôi muốn**: Cập nhật số hotline và email hỗ trợ
- **Để**: Thông tin liên hệ luôn chính xác trên toàn website
- **Priority**: Must
- **Given**: Tôi có permission site-config:manage
- **When**: Tôi sửa hotline và email trong trang cài đặt và lưu
- **Then**: Thông tin mới hiển thị trên footer và trang liên hệ sau khi cache hết hạn
- **Test scenario**: Cập nhật thành công → API /api/site-config trả giá trị mới

### US-CNT-006 — Admin tạo banner trang chủ
- **Với vai trò**: Admin
- **Tôi muốn**: Tạo banner quảng cáo cho trang chủ
- **Để**: Thu hút học viên đăng ký khóa học mới
- **Priority**: Must
- **Given**: Tôi có permission banner:manage, có ảnh banner đã upload
- **When**: Tôi tạo banner với position=homepage_hero, thời gian hiển thị hôm nay đến cuối tháng
- **Then**: Banner hiển thị trên trang chủ; tự ẩn sau endsAt
- **Test scenario**: Banner active trong thời gian hợp lệ → hiển thị; hết hạn → không hiển thị

### US-CNT-007 — Admin cấu hình menu website
- **Với vai trò**: Admin
- **Tôi muốn**: Cấu hình các mục trong menu header
- **Để**: Điều hướng website luôn cập nhật và đúng với cấu trúc hiện tại
- **Priority**: Should
- **Given**: Tôi có permission site-config:manage
- **When**: Tôi thêm mục menu mới và lưu
- **Then**: Menu mới hiển thị trên header của toàn bộ trang
- **Test scenario**: Lưu menu mới → API /api/admin/menu-config trả đúng cấu trúc

---

## 13. Luồng nghiệp vụ chi tiết

### Luồng 1: Xuất bản bài viết

```
[Editor] → Tạo bài viết → status=draft
     ↓
[Editor] → Xem trước → /admin/blog-posts/{id}/preview
     ↓
[Editor] → Hoàn thiện nội dung
     ↓
[Admin] → Nhấn "Xuất bản" → PUT /api/admin/blog-posts/{id}/publish { publish: true }
     ↓
[AdminContentService] → Kiểm tra bài viết tồn tại và có nội dung
[AdminContentService] → Cập nhật status → published, publishedAt = now
[SiteConfigService] → Invalidate cache cho danh sách blog
[API] → Trả { ok, status: 'published' }
     ↓
[Public API] → /api/blog-posts trả bài viết mới
```

### Luồng 2: Banner hiển thị theo thời gian

```
[Guest] → Truy cập trang chủ → GET /api/banners?position=homepage_hero
     ↓
[BannerService] → Lọc Banner với:
  - status = active
  - (startsAt IS NULL OR startsAt <= now)
  - (endsAt IS NULL OR endsAt >= now)
  - position = homepage_hero
     ↓
[BannerService] → Sắp xếp theo ordering
[API] → Trả danh sách banner đang active và đúng thời gian
```

### Luồng 3: Cập nhật cấu hình website

```
[Admin] → PUT /api/admin/site-config { hotline: "...", email: "..." }
     ↓
[SiteConfigService] → Validate từng key-value pair
[SiteConfigService] → Batch update SiteConfig records
[SiteConfigService] → Invalidate cache cho /api/site-config
[AuditLogger] → Ghi audit log (async)
[API] → Trả { ok }
     ↓
[Public] → GET /api/site-config trả giá trị mới (chỉ isPublic=true)
```

---

## 14. Business rule áp dụng

| Mã rule | Nội dung áp dụng trong module này |
|---|---|
| BR-CONTENT-001 | Nội dung (blog, trang tĩnh) chỉ hiển thị công khai khi status=published |
| BR-CONTENT-002 | Cấu hình hệ thống chỉ admin có permission site-config:manage mới được sửa |
| BR-SYS-002 | Backend kiểm tra permission cho mọi admin API |
| BR-SYS-006 | Audit log cho hành động admin thay đổi cấu hình nhạy cảm |

---

## 15. Validation

### Tạo/sửa bài viết
- `title`: bắt buộc, 2–255 ký tự.
- `slug`: tự sinh từ title; unique; chỉ lowercase, dấu gạch ngang.
- `content`: bắt buộc, không rỗng.
- `categoryId`: không bắt buộc; nếu có phải tồn tại.

### Tạo/sửa banner
- `title`: bắt buộc.
- `imageUrl`: bắt buộc, URL hợp lệ.
- `position`: bắt buộc, phải thuộc danh sách vị trí hợp lệ.
- `endsAt`: nếu có phải sau startsAt và sau thời điểm hiện tại.

### Cập nhật SiteConfig
- Không được xóa key bắt buộc như `site_name`, `hotline`.
- Giá trị type=number phải là số hợp lệ.
- Giá trị type=boolean phải là true/false.

---

## 16. State machine

### Trạng thái nội dung (BlogPost, PageContent)

```
draft → published → hidden → archived
published → draft (không cho phép — dùng hidden)
hidden → published (khi muốn hiện lại)
```

| Trạng thái | Hiển thị công khai | Admin xem được |
|---|---|---|
| `draft` | Không | Có |
| `published` | Có | Có |
| `hidden` | Không | Có |
| `archived` | Không | Có (chỉ đọc) |

### Trạng thái banner

```
active ↔ inactive (admin toggle)
```

---

## 17. Xử lý lỗi

| Mã lỗi | HTTP status | Trường hợp xảy ra | Thông điệp |
|---|---|---|---|
| `POST_NOT_FOUND` | 404 | Bài viết không tồn tại hoặc chưa published | Không tìm thấy bài viết |
| `PAGE_NOT_FOUND` | 404 | Trang tĩnh không tồn tại hoặc chưa published | Không tìm thấy trang |
| `SLUG_ALREADY_EXISTS` | 422 | Slug đã được dùng | Slug này đã tồn tại |
| `INVALID_BANNER_POSITION` | 422 | Position không hợp lệ | Vị trí banner không hợp lệ |
| `INVALID_CONFIG_KEY` | 422 | Key cấu hình không tồn tại | Key cấu hình không hợp lệ |
| `FORBIDDEN` | 403 | Không có permission | Bạn không có quyền thực hiện thao tác này |

---

## 18. Acceptance criteria

| Mã AC | Chức năng | Tiêu chí chấp nhận |
|---|---|---|
| AC-CNT-001 | Danh sách blog | Chỉ trả bài published; phân trang hoạt động |
| AC-CNT-002 | Chi tiết bài viết | Slug không published → 404 |
| AC-CNT-003 | Trang tĩnh | Slug không published → 404 |
| AC-CNT-004 | Banner | Chỉ trả banner active và trong thời gian hiển thị |
| AC-CNT-005 | SiteConfig public | Chỉ trả key có isPublic=true |
| AC-CNT-006 | Xuất bản | Draft → published: hiển thị ngay; published → hidden: ẩn ngay |
| AC-CNT-007 | Preview | Admin xem được bài draft qua preview API |
| AC-CNT-008 | Permission | Editor không thể xuất bản (403); admin xuất bản được |
| AC-CNT-009 | Cấu hình | Cập nhật SiteConfig phản ánh trong API public sau invalidate cache |

---

## 19. Test/UAT scenario

| Mã kịch bản | Mô tả | Điều kiện | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|---|
| T-CNT-001 | Lấy danh sách blog không cần đăng nhập | 2 published, 1 draft | GET /api/blog-posts | Trả 2 bài published |
| T-CNT-002 | Xem bài viết published | Bài status=published | GET /api/blog-posts/{slug} | Trả 200 với nội dung đầy đủ |
| T-CNT-003 | Xem bài viết draft qua public API | Bài status=draft | GET /api/blog-posts/{slug} | Trả 404 |
| T-CNT-004 | Admin xem trước bài draft | Admin đăng nhập, bài draft | GET /api/admin/blog-posts/{id}/preview | Trả 200 với nội dung |
| T-CNT-005 | Editor cố xuất bản | Editor không có content:publish | PUT /api/admin/blog-posts/{id}/publish | Trả 403 |
| T-CNT-006 | Admin xuất bản bài viết | Admin có content:publish, bài draft | PUT /api/admin/blog-posts/{id}/publish | Status → published; hiển thị trên GET /api/blog-posts |
| T-CNT-007 | Lấy banner trang chủ | 2 banner active, 1 inactive | GET /api/banners?position=homepage_hero | Trả 2 banner active |
| T-CNT-008 | Banner hết hạn không hiển thị | Banner với endsAt đã qua | GET /api/banners | Banner hết hạn không trong kết quả |
| T-CNT-009 | Lấy cấu hình website | Có các key public và private | GET /api/site-config | Chỉ trả key isPublic=true |
| T-CNT-010 | Admin cập nhật hotline | Admin có site-config:manage | PUT /api/admin/site-config { hotline: "..." } | Trả 200; GET /api/site-config trả hotline mới |

---

## 20. Phụ thuộc module khác

### Module này phụ thuộc
- **Authentication**: kiểm tra token và permission cho admin API.

### Module khác phụ thuộc module này
- Không có module nghiệp vụ nào phụ thuộc Content — đây là module độc lập hỗ trợ.
- **Reporting**: có thể đọc viewCount từ BlogPost để thống kê.

---

## 21. Câu hỏi cần xác nhận

| Câu hỏi | Ảnh hưởng | Đề xuất tạm thời |
|---|---|---|
| Định dạng nội dung bài viết là HTML hay Markdown? | Lưu trữ và hiển thị | Đề xuất: HTML (WYSIWYG) |
| Slug bài viết có được phép chỉnh sửa sau khi xuất bản không? | SEO và URL permalink | Đề xuất: cảnh báo nhưng cho phép |
| Banner có hỗ trợ mobile/desktop riêng không? | Model Banner | Đề xuất: một ảnh dùng chung; CSS responsive |
| Danh mục blog có thể phân cấp nhiều cấp không? | Model BlogCategory | Đề xuất: tối đa 2 cấp |
| Có cần lưu lịch sử thay đổi nội dung (revision history) không? | Model BlogPost | Đề xuất: không trong phiên bản đầu |
| Menu config lưu dạng JSON trong DB hay bảng riêng? | Model MenuConfig | Đề xuất: JSON trong bảng MenuConfig |
