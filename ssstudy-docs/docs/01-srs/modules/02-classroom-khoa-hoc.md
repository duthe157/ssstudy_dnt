# Classroom / Khóa học — SRS mục tiêu

Mục tiêu: Mô tả yêu cầu nghiệp vụ và kỹ thuật để thiết kế và triển khai module Classroom từ đầu, bao gồm quản lý khóa học, chương, bài học, thành viên, và báo cáo. Tài liệu này là mục tiêu SRS — tất cả bằng chứng implementation legacy đã được loại bỏ khỏi phần chính; nếu cần tham khảo bằng chứng cũ, xem `docs/legacy-notes.md`.

- Tên module: Classroom / Course
- Phạm vi: public listing, course detail, curriculum (chapters/categories), enrollment & membership, admin management, member reports, related content.

## 2. Actors and Roles

| Actor/Role | Typical permissions | Notes |
|---|---|---|
| Guest | Browse public courses, view course detail | Public endpoints only |
| Student | Access enrolled course content, view progress, submit exercises | Requires valid enrollment |
| Teacher | Manage own courses, chapters, content, view students | Scoped to owned classrooms |
| Admin / Manager | Full course management, metadata, reporting | Elevated permissions; audit required |

## 3. Feature list

| Mã chức năng | Tên chức năng | Actor | Màn hình đề xuất | API đề xuất | Dịch vụ nghiệp vụ | Dữ liệu/model | Quy tắc | Priority |
|---|---|---|---|---|---|---|---|---|
| CLS-01 | Course listing (public) | Guest, Student | `/courses` | `GET /api/courses` | CourseService.listPublic | Course | Only publishable & online | Must |
| CLS-02 | Course detail | Guest, Student | `/courses/{id}` | `GET /api/courses/{id}` | CourseService.detail | Course, Chapter, Review | Show related content, membership flag | Must |
| CLS-03 | Curriculum (chapters/categories) | Student, Teacher | `/courses/{id}/curriculum` | `GET /api/courses/{id}/curriculum` | CurriculumService.getByCourse | Chapter, Category | Order by ordering fields | Must |
| CLS-04 | Enrollment & membership check | Student | n/a | `POST /api/courses/{id}/enroll` / `GET /api/courses/{id}/members` | EnrollmentService | StudentCourse | Enrollment rules, payment check | Must |
| CLS-05 | Reviews & ratings | Guest, Student | Course detail tab | `GET /api/courses/{id}/reviews` / `POST /api/courses/{id}/reviews` | ReviewService | Review | Only approved reviews shown | Should |
| CLS-06 | Admin course management | Admin, Teacher | `/admin/courses` | CRUD `/api/admin/courses` | AdminCourseService | Course, Chapter | Audit admin actions | Should |
| CLS-07 | Member reports & export | Admin | `/admin/courses/{id}/members` | `GET /api/admin/courses/{id}/members` | ReportService | StudentCourse, Testing | Export to CSV/XLSX | Should |

## API đề xuất

| Mã API | Method | Endpoint đề xuất | Mục đích | Auth required | Permission | Request chính | Response chính | Business rule | Ghi chú |
|---|---:|---|---|---:|---|---|---|---|---|
| API-CLS-001 | GET | `/api/courses` | Lấy danh sách công khai | No | No | { q, level, subject, page, limit } | { items, total } | Only is_published & is_online | Support sorting & facets |
| API-CLS-002 | GET | `/api/courses/{id}` | Chi tiết khóa học | No | No | - | { course, is_enrolled, related } | If paid course, show purchase options | Projection excludes admin-only fields |
| API-CLS-003 | GET | `/api/courses/{id}/curriculum` | Lấy chương → danh mục | Yes (if private) | course:read | - | { chapters: [{ categories: [...] }] } | Respect ordering | Include is_done flags for current user |
| API-CLS-004 | POST | `/api/courses/{id}/enroll` | Thực hiện enroll (may trigger payment) | Yes | No | { userId, paymentInfo? } | { enrollmentId, status } | BR-ENROLL-001 | Payment as separate flow if required |
| API-CLS-005 | GET | `/api/courses/{id}/members` | Danh sách thành viên (admin/teacher) | Yes | course:members:read | { page, keyword } | { items, total } | Respect privacy | Support export param |
| API-CLS-006 | GET/POST | `/api/courses/{id}/reviews` | Lấy/Thêm review | GET: No; POST: Yes | review:create | POST { rating, content } | GET { items, total } | Only approved reviews shown | Rate-limit create |
| API-CLS-007 | CRUD | `/api/admin/courses` | Admin course management | Yes | admin:courses:* | Standard CRUD payloads | { ok, id } | Audit admin changes | Use admin APIs for bulk operations |

## Thiết kế dữ liệu / Domain model đề xuất

| Model | Key fields | Notes |
|---|---|---|
| Course | id, code, name, description, teacherId, subjectId, groupId, price, originPrice, isPublished, isOnline, ordering, metadata | Core entity |
| Chapter | id, courseId, title, ordering | Part of curriculum |
| Category | id, chapterId, type (lecture/exercise/video), contentRef, publishAt | Content unit; may reference media or exam |
| StudentCourse | id, courseId, userId, enrolledAt, progress, extraSessions | Enrollment record |
| Review | id, courseId, userId, rating, content, status, createdAt | Status: PENDING/APPROVED/REJECTED |

Indexes & constraints:
- Course(code) unique, Course(isPublished,isOnline,ordering) composite indexes.
- StudentCourse(courseId,userId) unique constraint.

## Kiến trúc module (high-level)

- API layer: request validation, pagination, response projection.
- Application services: CourseService, CurriculumService, EnrollmentService, ReviewService, ReportService.
- Repositories: CourseRepo, ChapterRepo, CategoryRepo, EnrollmentRepo.
- Integrations: Payments (optional), Storage for media, Notification/Email for enrollment/updates.
- Observability: metrics per API, audit logs for admin actions.

Nguyên tắc:
- Keep controllers thin; business logic in services.
- Design APIs to be idempotent where applicable (enroll/logout operations).
- Enforce authorization checks at service boundaries.

## Yêu cầu giao diện (UI)

| Màn hình | Route | Actor | Mục đích | API sử dụng |
|---|---|---|---|---|
| Course listing | `/courses` | Guest/Student | Browse courses, filter, paginate | GET /api/courses |
| Course detail | `/courses/{id}` | Guest/Student | Show info, purchase CTA, curriculum | GET /api/courses/{id} |
| Curriculum | `/courses/{id}/curriculum` | Student/Teacher | Show chapters & categories | GET /api/courses/{id}/curriculum |
| Admin course list/edit | `/admin/courses` | Admin/Teacher | Manage courses, meta | CRUD admin APIs |
| Members & reports | `/admin/courses/{id}/members` | Admin/Teacher | View/export members | GET /api/courses/{id}/members |

## Use cases (examples)

UC-CLS-001 — Browse public courses
- Actor: Guest
- Trigger: Open `/courses`
- Main flow: call API-CLS-001 with filters → render list
- Acceptance: filters and pagination work; only published online courses appear.

UC-CLS-002 — View course detail and curriculum
- Actor: Guest/Student
- Trigger: open `/courses/{id}`
- Main flow: API-CLS-002 + API-CLS-003 → render content and is_enrolled flag

UC-CLS-003 — Enroll in a paid course
- Actor: Student
- Trigger: click purchase → complete payment → POST /api/courses/{id}/enroll
- Business rules: BR-ENROLL-001 (payment success required), create StudentCourse on success.

## User stories (examples)

US-CLS-001 — As a guest, I want to search courses by keyword and filters so I can find relevant courses. (Priority: Must)

US-CLS-002 — As a student, I want to view the curriculum of a course I'm enrolled in so I can track progress. (Priority: Must)

US-CLS-003 — As an admin, I want to export member reports for a course so I can analyze attendance and results. (Priority: Should)

## Tests / Acceptance criteria (high level)
- Listing returns only published & online courses.
- Course detail returns correct is_enrolled flag for authenticated user.
- Curriculum ordered by chapter and category ordering.
- Enrollment creates StudentCourse and triggers post-enrollment flows.

## Migration / Legacy notes

Any legacy controller/service or file-path evidence has been removed from this SRS. If needed for audit or migration mapping, refer to `docs/legacy-notes.md` which collects legacy references and migration guidance.

