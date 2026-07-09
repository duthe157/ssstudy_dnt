# Classroom / Khóa học — SRS mục tiêu

> Tài liệu đặc tả yêu cầu phần mềm (SRS) cho module Classroom của hệ thống SSStudy.
> Viết như thể hệ thống chưa có code. Mục tiêu: đủ chi tiết để developer triển khai hoàn chỉnh chỉ từ tài liệu này.

---

## 1. Mục tiêu nghiệp vụ

Module Classroom là trung tâm của hệ thống học tập SSStudy. Module này cần đáp ứng:

- Hiển thị danh sách khóa học công khai để học viên và khách truy cập tìm kiếm, lọc và đăng ký.
- Quản lý nội dung khóa học: chương, bài học, lộ trình học và tài nguyên đính kèm.
- Kiểm soát quyền truy cập nội dung theo loại khóa học (public/pro/private) và trạng thái enrollment.
- Theo dõi tiến độ học tập của từng học viên theo từng bài học.
- Quản trị khóa học toàn diện cho admin và giáo viên: tạo, sửa, xuất bản, ẩn, quản lý học viên.
- Hỗ trợ đánh giá, nhận xét khóa học từ học viên đã đăng ký.

---

## 2. Phạm vi chức năng

| STT | Chức năng | Mô tả ngắn |
|---|---|---|
| 1 | Danh sách khóa học công khai | Hiển thị, tìm kiếm, lọc khóa học đã xuất bản |
| 2 | Chi tiết khóa học | Thông tin đầy đủ, lộ trình, giáo viên, đánh giá |
| 3 | Tìm kiếm và lọc khóa học | Theo từ khóa, môn học, cấp độ, giá, hình thức |
| 4 | Khóa học học thử | Một số bài học miễn phí trước khi mua |
| 5 | Lộ trình học (chương/bài học) | Cấu trúc chương, bài học, thứ tự và loại nội dung |
| 6 | Enrollment / Đăng ký học | Đăng ký khóa học sau thanh toán hoặc được admin cấp |
| 7 | Kiểm tra quyền truy cập | Kiểm tra membership còn hạn trước khi xem nội dung |
| 8 | Tiến độ học tập | Theo dõi bài học đã hoàn thành, phần trăm tiến độ |
| 9 | Đánh giá và nhận xét | Học viên đăng ký mới được đánh giá |
| 10 | Khóa học liên quan | Gợi ý khóa học tương tự |
| 11 | Admin tạo/sửa khóa học | CRUD khóa học, chương, bài học |
| 12 | Admin xuất bản/ẩn khóa học | Kiểm soát trạng thái hiển thị |
| 13 | Admin quản lý học viên | Xem, thêm, xóa enrollment; cấp quyền thủ công |
| 14 | Admin xuất báo cáo học viên | Export danh sách và tiến độ học viên |
| 15 | Danh sách khóa học của tôi | Học viên xem các khóa đã đăng ký |

---

## 3. Ngoài phạm vi

- Thanh toán và xử lý đơn hàng (thuộc module Order/Payment).
- Quản lý đề thi và chấm điểm (thuộc module Exam/Testing).
- Quản lý tài liệu đính kèm bài học chi tiết (thuộc module Document).
- Hội thảo trực tiếp (live webinar) và tính năng livestream.
- Chứng chỉ hoàn thành khóa học.
- Diễn đàn và bình luận trong bài học.

---

## 4. Actor

| Actor | Mô tả | Quyền cơ bản |
|---|---|---|
| Guest | Người dùng chưa đăng nhập | Xem danh sách và chi tiết khóa học public, xem bài học thử |
| student | Học viên đã đăng nhập | Xem nội dung khóa học đã đăng ký, theo dõi tiến độ, đánh giá |
| teacher | Giáo viên | Quản lý nội dung khóa học của mình, xem tiến độ học viên |
| admin | Quản trị viên | Quản lý toàn bộ khóa học, học viên, báo cáo |
| superAdmin | Quản trị cấp cao | Toàn quyền bao gồm xóa và cấu hình hệ thống |

---

## 5. Permission

| Mã permission | Mô tả | Role mặc định |
|---|---|---|
| `course:read` | Xem chi tiết khóa học bất kỳ (bao gồm nội dung chưa xuất bản) | admin, superAdmin, teacher (chỉ khóa học của mình) |
| `course:create` | Tạo khóa học mới | admin, superAdmin, teacher |
| `course:update` | Cập nhật thông tin khóa học | admin, superAdmin, teacher (chỉ khóa học của mình) |
| `course:delete` | Xóa mềm khóa học | admin, superAdmin |
| `course:publish` | Xuất bản hoặc ẩn khóa học | admin, superAdmin |
| `course:members:read` | Xem danh sách học viên của khóa học | admin, superAdmin, teacher |
| `enrollment:create` | Cấp enrollment thủ công | admin, superAdmin |
| `enrollment:delete` | Thu hồi enrollment | admin, superAdmin |
| `lesson:manage` | Tạo/sửa/xóa chương và bài học | admin, superAdmin, teacher |
| `review:approve` | Duyệt hoặc từ chối đánh giá | admin, superAdmin |

---

## 6. Danh sách chức năng

| Mã chức năng | Tên chức năng | Actor | Màn hình đề xuất | API đề xuất | Dịch vụ nghiệp vụ cần có | Dữ liệu/model liên quan | Quy tắc áp dụng | Priority |
|---|---|---|---|---|---|---|---|---|
| CLS-01 | Danh sách khóa học công khai | Guest, student | `/courses` | `GET /api/courses` | Lọc theo trạng thái published và active, phân trang, sắp xếp | Course, CourseCategory | BR-CLS-001 | Must |
| CLS-02 | Chi tiết khóa học | Guest, student | `/courses/{courseId}` | `GET /api/courses/{courseId}` | Trả thông tin khóa học, trạng thái enrollment của user hiện tại | Course, Chapter, Review | BR-CLS-001 | Must |
| CLS-03 | Tìm kiếm và lọc khóa học | Guest, student | `/courses` | `GET /api/courses?q=...` | Tìm kiếm full-text, lọc theo môn học, cấp độ, giá, hình thức, giáo viên | Course | — | Must |
| CLS-04 | Lộ trình học (chương/bài học) | Guest, student | `/courses/{courseId}/curriculum` | `GET /api/courses/{courseId}/curriculum` | Trả cấu trúc chương và bài học; đánh dấu bài học có thể xem thử | Course, Chapter, Lesson | BR-CLS-002 | Must |
| CLS-05 | Đăng ký học (enrollment) | student | — | `POST /api/courses/{courseId}/enrollments` | Kiểm tra điều kiện, tạo enrollment, liên kết với đơn hàng | Enrollment, Order | BR-CLS-004, BR-CLS-005 | Must |
| CLS-06 | Kiểm tra quyền xem nội dung | student | — | Middleware nội bộ | Kiểm tra enrollment còn hạn trước mỗi request nội dung | Enrollment | BR-CLS-002, BR-CLS-003 | Must |
| CLS-07 | Xem bài học | student | `/courses/{courseId}/lessons/{lessonId}` | `GET /api/courses/{courseId}/lessons/{lessonId}` | Kiểm tra quyền, trả nội dung bài học | Lesson, Enrollment | BR-CLS-002 | Must |
| CLS-08 | Cập nhật tiến độ bài học | student | — | `PUT /api/me/lessons/{lessonId}/progress` | Ghi nhận bài học đã hoàn thành, tính phần trăm tiến độ | LessonProgress, CourseProgress | — | Must |
| CLS-09 | Danh sách khóa học của tôi | student | `/my-courses` | `GET /api/me/courses` | Lấy danh sách khóa học đã đăng ký còn hạn | Enrollment, Course | BR-CLS-002 | Must |
| CLS-10 | Tiến độ học tập của tôi | student | `/my-courses/{courseId}` | `GET /api/me/courses/{courseId}/progress` | Trả phần trăm hoàn thành, danh sách bài đã học | CourseProgress, LessonProgress | — | Should |
| CLS-11 | Đánh giá khóa học | student | `/courses/{courseId}` | `POST /api/courses/{courseId}/reviews` | Kiểm tra đã enrollment, tạo review với trạng thái chờ duyệt | Review, Enrollment | BR-CLS-006 | Should |
| CLS-12 | Xem đánh giá khóa học | Guest, student | `/courses/{courseId}` | `GET /api/courses/{courseId}/reviews` | Lấy danh sách review đã duyệt, phân trang | Review | BR-CLS-006 | Should |
| CLS-13 | Admin tạo/sửa/xóa khóa học | admin, teacher | `/admin/courses` | CRUD `/api/admin/courses` | Validate dữ liệu, ghi audit log | Course | `course:create`, `course:update` | Must |
| CLS-14 | Admin xuất bản/ẩn khóa học | admin, teacher | `/admin/courses/{courseId}` | `PUT /api/admin/courses/{courseId}/publish` | Cập nhật trạng thái published, kiểm tra điều kiện xuất bản | Course | `course:publish`, BR-CLS-001 | Must |
| CLS-15 | Admin quản lý chương/bài học | admin, teacher | `/admin/courses/{courseId}/curriculum` | CRUD `/api/admin/courses/{courseId}/chapters`, `/lessons` | Tạo, sửa, xóa, sắp xếp thứ tự | Chapter, Lesson | `lesson:manage` | Must |
| CLS-16 | Admin quản lý học viên | admin | `/admin/courses/{courseId}/members` | `GET/POST/DELETE /api/admin/courses/{courseId}/enrollments` | Xem, thêm, thu hồi enrollment | Enrollment | `enrollment:create`, `enrollment:delete` | Should |
| CLS-17 | Admin duyệt đánh giá | admin | `/admin/courses/{courseId}/reviews` | `PUT /api/admin/reviews/{reviewId}/approve` | Duyệt hoặc từ chối review | Review | `review:approve` | Should |
| CLS-18 | Xuất báo cáo học viên | admin | `/admin/courses/{courseId}/members` | `GET /api/admin/courses/{courseId}/members/export` | Export CSV/XLSX danh sách học viên và tiến độ | Enrollment, CourseProgress | `course:members:read` | Should |

---

## 7. Thiết kế dữ liệu / Domain model đề xuất

### Model chính

| Model | Mục đích | Field quan trọng | Quan hệ |
|---|---|---|---|
| Course | Khóa học / lớp học | id, code, name, type, price, status, teacherId, subjectId | Có nhiều Chapter, Enrollment, Review |
| CourseCategory | Phân loại khóa học | id, name, parentId, ordering | Một course thuộc một hoặc nhiều category |
| Chapter | Chương học trong khóa học | id, courseId, title, ordering | Có nhiều Lesson |
| Lesson | Bài học trong chương | id, chapterId, title, type, contentUrl, isFree, ordering | Thuộc một Chapter |
| Enrollment | Đăng ký học của học viên | id, courseId, userId, orderId, status, expiresAt | FK tới Course, User, Order |
| CourseProgress | Tiến độ tổng của học viên trong khóa học | id, enrollmentId, completedLessons, totalLessons, progressPercent | FK tới Enrollment |
| LessonProgress | Tiến độ từng bài học | id, lessonId, userId, isCompleted, completedAt | FK tới Lesson, User |
| Review | Đánh giá của học viên | id, courseId, userId, rating, content, status | FK tới Course, User |

### Field chi tiết

#### Model: Course
| Field | Kiểu dữ liệu | Bắt buộc | Ý nghĩa | Validation |
|---|---|---|---|---|
| id | UUID | Có | Khóa chính | Auto-generate |
| code | varchar(50) | Có | Mã khóa học | Unique |
| name | varchar(255) | Có | Tên khóa học | Không rỗng |
| slug | varchar(255) | Có | Đường dẫn URL | Unique, lowercase, dấu gạch ngang |
| description | text | Không | Mô tả chi tiết | |
| shortDescription | varchar(500) | Không | Mô tả ngắn hiển thị ở danh sách | |
| teacherId | UUID FK | Không | Giáo viên phụ trách | |
| subjectId | UUID FK | Không | Môn học | |
| type | enum | Có | online, offline | |
| accessType | enum | Có | public, pro, private | Kiểm soát ai xem được |
| price | numeric(12,2) | Có | Giá bán | Không âm |
| originalPrice | numeric(12,2) | Không | Giá gốc (để hiển thị giảm giá) | |
| status | enum | Có | draft, published, archived | |
| thumbnailUrl | varchar(500) | Không | Ảnh đại diện | URL hợp lệ |
| ordering | int | Không | Thứ tự hiển thị | |
| totalLessons | int | Không | Tổng số bài học (cache) | Cập nhật khi thêm/xóa bài |
| createdAt | timestamp | Có | | Auto |
| updatedAt | timestamp | Có | | Auto |

#### Model: Lesson
| Field | Kiểu dữ liệu | Bắt buộc | Ý nghĩa | Validation |
|---|---|---|---|---|
| id | UUID | Có | Khóa chính | |
| chapterId | UUID FK | Có | Thuộc chương | |
| title | varchar(255) | Có | Tiêu đề bài học | |
| type | enum | Có | video, text, exercise, exam | |
| contentUrl | varchar(500) | Không | URL nội dung (video, tài liệu) | |
| isFree | boolean | Có | Có thể xem thử không | Mặc định false |
| durationMinutes | int | Không | Thời lượng ước tính | |
| ordering | int | Không | Thứ tự trong chương | |

#### Model: Enrollment
| Field | Kiểu dữ liệu | Bắt buộc | Ý nghĩa | Validation |
|---|---|---|---|---|
| id | UUID | Có | Khóa chính | |
| courseId | UUID FK | Có | Khóa học | |
| userId | UUID FK | Có | Học viên | |
| orderId | UUID FK | Không | Đơn hàng liên quan | Null nếu admin cấp thủ công |
| status | enum | Có | active, expired, cancelled | |
| enrolledAt | timestamp | Có | Thời điểm đăng ký | |
| expiresAt | timestamp | Không | Thời điểm hết hạn | Null = không hết hạn |
| grantedBy | UUID FK | Không | Admin đã cấp thủ công | Null nếu từ đơn hàng |

#### Model: Review
| Field | Kiểu dữ liệu | Bắt buộc | Ý nghĩa | Validation |
|---|---|---|---|---|
| id | UUID | Có | Khóa chính | |
| courseId | UUID FK | Có | Khóa học được đánh giá | |
| userId | UUID FK | Có | Người đánh giá | |
| rating | int | Có | Điểm đánh giá 1–5 | |
| content | text | Không | Nội dung nhận xét | |
| status | enum | Có | pending, approved, rejected | |
| createdAt | timestamp | Có | | Auto |

### Quan hệ dữ liệu

- Course `1—N` Chapter: một khóa học có nhiều chương.
- Chapter `1—N` Lesson: một chương có nhiều bài học.
- Course `1—N` Enrollment: một khóa học có nhiều học viên đăng ký.
- Enrollment `1—1` CourseProgress: mỗi enrollment có một bản ghi tiến độ.
- Lesson `1—N` LessonProgress: một bài học có nhiều bản ghi tiến độ của các user.
- Course `1—N` Review: một khóa học có nhiều đánh giá.

### Index / Constraint đề xuất

| Bảng | Index / Constraint | Mục đích |
|---|---|---|
| Course | UNIQUE(code) | Mã khóa học duy nhất |
| Course | UNIQUE(slug) | URL-friendly slug duy nhất |
| Course | INDEX(status, accessType, ordering) | Lọc danh sách nhanh |
| Enrollment | UNIQUE(courseId, userId) WHERE status != 'cancelled' | Không đăng ký trùng |
| Enrollment | INDEX(userId, status, expiresAt) | Kiểm tra quyền truy cập nhanh |
| LessonProgress | UNIQUE(lessonId, userId) | Mỗi user chỉ có một bản ghi tiến độ mỗi bài |
| Review | UNIQUE(courseId, userId) | Mỗi user chỉ đánh giá một lần mỗi khóa |

---

## 8. Thiết kế kiến trúc module

### Thành phần cần có

| Thành phần | Vai trò | Ghi chú triển khai |
|---|---|---|
| API layer (Controller) | Nhận request, validate, gọi service, trả response | Không chứa business logic |
| CourseService | Quản lý khóa học, tìm kiếm, lọc, kiểm tra trạng thái | Gọi CourseRepository, AccessPolicy |
| CurriculumService | Quản lý cấu trúc chương và bài học | Gọi ChapterRepository, LessonRepository |
| EnrollmentService | Tạo, kiểm tra và thu hồi enrollment | Kiểm tra điều kiện trước khi tạo; kiểm tra hạn |
| ProgressService | Ghi nhận và tính toán tiến độ học tập | Cập nhật LessonProgress và CourseProgress |
| ReviewService | Tạo và quản lý đánh giá | Kiểm tra enrollment; chỉ approved review hiển thị |
| AccessPolicyChecker | Kiểm tra user có quyền xem nội dung không | Dựa trên accessType và enrollment; gọi trước mỗi content request |
| CourseRepository | Truy vấn và cập nhật Course trong DB | |
| EnrollmentRepository | Truy vấn và cập nhật Enrollment, LessonProgress | |
| AuditLogger | Ghi log hành động admin trên khóa học và enrollment | Gọi async |

### Dependency

- Module Classroom phụ thuộc module Authentication để kiểm tra token và permission.
- Module Classroom được tham chiếu bởi: Document (tài liệu gắn khóa học), Exam (đề thi trong khóa), Order/Payment (sản phẩm là khóa học), Book (bundle khóa học).
- Module Classroom không được gọi trực tiếp vào module Order — chỉ nhận signal "enrollment granted" qua service sau thanh toán.

### Nguyên tắc triển khai

- Controller không chứa business rule. Mọi quyết định nghiệp vụ nằm trong service.
- Kiểm tra quyền truy cập nội dung (AccessPolicyChecker) phải chạy ở backend, không tin dữ liệu từ frontend.
- Enrollment phải có transactional boundary: không tạo enrollment nếu đơn hàng chưa paid.
- Tiến độ học được tính lại tổng thể khi có LessonProgress mới — cache kết quả vào CourseProgress.
- Thứ tự Chapter và Lesson theo trường `ordering` — không dùng thứ tự insert.

---

## 9. Yêu cầu giao diện

| Màn hình | Route đề xuất | Actor | Mục đích | API sử dụng |
|---|---|---|---|---|
| Danh sách khóa học | `/courses` | Guest, student | Tìm kiếm và lọc khóa học | `GET /api/courses` |
| Chi tiết khóa học | `/courses/{courseId}` | Guest, student | Xem thông tin, đánh giá, lộ trình | `GET /api/courses/{courseId}` |
| Xem bài học | `/courses/{courseId}/lessons/{lessonId}` | student | Học nội dung bài | `GET /api/courses/{courseId}/lessons/{lessonId}` |
| Khóa học của tôi | `/my-courses` | student | Danh sách đã đăng ký | `GET /api/me/courses` |
| Tiến độ khóa học | `/my-courses/{courseId}` | student | Theo dõi tiến độ | `GET /api/me/courses/{courseId}/progress` |
| Quản lý khóa học (admin) | `/admin/courses` | admin, teacher | Danh sách, tạo, sửa | CRUD `/api/admin/courses` |
| Chi tiết khóa học (admin) | `/admin/courses/{courseId}` | admin, teacher | Sửa, xuất bản, ẩn | `PUT /api/admin/courses/{courseId}` |
| Lộ trình (admin) | `/admin/courses/{courseId}/curriculum` | admin, teacher | Quản lý chương và bài học | CRUD APIs chương/bài |
| Học viên (admin) | `/admin/courses/{courseId}/members` | admin | Xem, thêm, thu hồi enrollment | Enrollment APIs |
| Đánh giá (admin) | `/admin/courses/{courseId}/reviews` | admin | Duyệt đánh giá | `PUT /api/admin/reviews/{id}/approve` |

**Yêu cầu UI chi tiết:**
- Trang danh sách: lọc đa điều kiện (từ khóa, môn học, hình thức, giá, cấp độ), sắp xếp, phân trang.
- Trang chi tiết: hiển thị CTA mua hoặc học tùy trạng thái enrollment; hiển thị lộ trình với bài học thử miễn phí.
- Trang bài học: sidebar lộ trình, đánh dấu bài đã học, nút chuyển bài trước/sau.
- Trang admin: bảng danh sách có filter, inline status toggle, nút export học viên.

---

## 10. API đề xuất

| Mã API | Method | Endpoint đề xuất | Mục đích | Auth required | Permission | Request chính | Response chính | Business rule | Ghi chú |
|---|---|---|---|---|---|---|---|---|---|
| API-CLS-001 | GET | `/api/courses` | Danh sách khóa học công khai | Không | Không | `?q, subject, level, type, minPrice, maxPrice, page, limit, sort` | `{ items, total, page, limit }` | BR-CLS-001 | Chỉ trả khóa học published và active |
| API-CLS-002 | GET | `/api/courses/{courseId}` | Chi tiết khóa học | Không | Không | — | `{ course, isEnrolled, teacher, relatedCourses }` | BR-CLS-001 | isEnrolled = false nếu chưa đăng nhập |
| API-CLS-003 | GET | `/api/courses/{courseId}/curriculum` | Lộ trình chương/bài học | Không | Không | — | `{ chapters: [{ lessons: [...] }] }` | BR-CLS-002 | Bài học isFree=true hiển thị nội dung; còn lại ẩn |
| API-CLS-004 | GET | `/api/courses/{courseId}/lessons/{lessonId}` | Nội dung bài học | Có | Enrollment hợp lệ | — | `{ lesson, prevLesson, nextLesson }` | BR-CLS-002, BR-CLS-003 | 403 nếu enrollment hết hạn |
| API-CLS-005 | POST | `/api/courses/{courseId}/enrollments` | Đăng ký học (từ đơn hàng) | Có | Không | `{ orderId }` | `{ enrollmentId, status, expiresAt }` | BR-CLS-004, BR-CLS-005 | Gọi từ Order service sau thanh toán |
| API-CLS-006 | GET | `/api/courses/{courseId}/reviews` | Danh sách đánh giá | Không | Không | `?page, limit` | `{ items, total, avgRating }` | BR-CLS-006 | Chỉ trả review status=approved |
| API-CLS-007 | POST | `/api/courses/{courseId}/reviews` | Gửi đánh giá | Có | Enrollment hợp lệ | `{ rating, content? }` | `{ reviewId, status }` | BR-CLS-006 | Chỉ enrollment active mới được đánh giá |
| API-CLS-008 | GET | `/api/me/courses` | Danh sách khóa học của tôi | Có | Không | `?page, limit, status` | `{ items, total }` | BR-CLS-002 | Lọc theo enrollment status |
| API-CLS-009 | GET | `/api/me/courses/{courseId}/progress` | Tiến độ học của tôi | Có | Enrollment hợp lệ | — | `{ progressPercent, completedLessons, totalLessons, lessons }` | — | |
| API-CLS-010 | PUT | `/api/me/lessons/{lessonId}/progress` | Đánh dấu hoàn thành bài học | Có | Enrollment hợp lệ | `{ isCompleted }` | `{ ok, courseProgress }` | — | Cập nhật LessonProgress và CourseProgress |
| API-CLS-011 | GET | `/api/admin/courses` | Danh sách khóa học (admin) | Có | `course:read` | `?q, status, teacherId, page, limit` | `{ items, total }` | — | Bao gồm cả draft và archived |
| API-CLS-012 | POST | `/api/admin/courses` | Tạo khóa học | Có | `course:create` | `{ name, code, type, price, ... }` | `{ courseId }` | — | Ghi audit log |
| API-CLS-013 | PUT | `/api/admin/courses/{courseId}` | Cập nhật khóa học | Có | `course:update` | `{ name, price, description, ... }` | `{ ok }` | — | Ghi audit log |
| API-CLS-014 | PUT | `/api/admin/courses/{courseId}/publish` | Xuất bản hoặc ẩn khóa học | Có | `course:publish` | `{ publish: true/false }` | `{ ok, status }` | BR-CLS-001 | Kiểm tra điều kiện xuất bản |
| API-CLS-015 | POST | `/api/admin/courses/{courseId}/chapters` | Tạo chương | Có | `lesson:manage` | `{ title, ordering }` | `{ chapterId }` | — | |
| API-CLS-016 | POST | `/api/admin/chapters/{chapterId}/lessons` | Tạo bài học | Có | `lesson:manage` | `{ title, type, contentUrl, isFree, ordering }` | `{ lessonId }` | — | |
| API-CLS-017 | GET | `/api/admin/courses/{courseId}/enrollments` | Danh sách học viên | Có | `course:members:read` | `?q, status, page, limit` | `{ items, total }` | — | |
| API-CLS-018 | POST | `/api/admin/courses/{courseId}/enrollments` | Cấp enrollment thủ công | Có | `enrollment:create` | `{ userId, expiresAt? }` | `{ enrollmentId }` | BR-CLS-004, BR-CLS-005 | Ghi audit log |
| API-CLS-019 | DELETE | `/api/admin/enrollments/{enrollmentId}` | Thu hồi enrollment | Có | `enrollment:delete` | — | `{ ok }` | — | Ghi audit log |
| API-CLS-020 | GET | `/api/admin/courses/{courseId}/enrollments/export` | Xuất danh sách học viên | Có | `course:members:read` | `?format=csv` | File CSV/XLSX | — | |

---

## 11. Use case nghiệp vụ

### UC-CLS-001 — Tìm kiếm và xem danh sách khóa học

- **Mục tiêu**: Cho phép khách và học viên tìm khóa học phù hợp.
- **Actor chính**: Guest, student.
- **Điều kiện trước**: Không cần đăng nhập.
- **Trigger**: Người dùng truy cập trang danh sách khóa học hoặc nhập từ khóa tìm kiếm.
- **Luồng chính**:
  1. Người dùng truy cập `/courses` hoặc nhập từ khóa tìm kiếm.
  2. Hệ thống lấy danh sách khóa học với trạng thái published và active.
  3. Áp dụng bộ lọc từ query params (môn học, cấp độ, giá, hình thức, từ khóa).
  4. Sắp xếp theo thứ tự yêu cầu (mới nhất, phổ biến, giá tăng/giảm).
  5. Trả về danh sách với phân trang.
- **Luồng thay thế**: Không có bộ lọc — trả tất cả khóa học published, sắp xếp mặc định theo ordering.
- **Luồng lỗi**: Không có lỗi — nếu không có kết quả trả mảng rỗng.
- **Business rule áp dụng**: BR-CLS-001.
- **Acceptance criteria**: Chỉ trả khóa học status=published và accessType != private; phân trang hoạt động; bộ lọc kết hợp được.

---

### UC-CLS-002 — Xem chi tiết khóa học và lộ trình

- **Mục tiêu**: Học viên và khách xem đầy đủ thông tin và lộ trình trước khi đăng ký.
- **Actor chính**: Guest, student.
- **Điều kiện trước**: Khóa học tồn tại và đã xuất bản.
- **Trigger**: Người dùng nhấp vào khóa học từ danh sách.
- **Luồng chính**:
  1. Hệ thống lấy thông tin chi tiết khóa học (tên, mô tả, giáo viên, giá, đánh giá).
  2. Hệ thống kiểm tra trạng thái enrollment của user hiện tại (nếu đã đăng nhập).
  3. Hệ thống trả lộ trình chương/bài học; bài học isFree=true hiển thị đầy đủ; bài học khác chỉ hiển thị tiêu đề.
  4. Hiển thị CTA phù hợp: "Học ngay" nếu đã enrolled, "Mua khóa học" nếu chưa.
- **Luồng lỗi**: Khóa học không tồn tại hoặc chưa xuất bản → 404.
- **Business rule áp dụng**: BR-CLS-001, BR-CLS-002.
- **Acceptance criteria**: Bài học thử hiển thị đúng; trạng thái enrollment phản ánh chính xác; khóa học draft/archived trả 404 với người dùng thường.

---

### UC-CLS-003 — Học viên truy cập nội dung bài học

- **Mục tiêu**: Học viên có enrollment hợp lệ xem nội dung bài học.
- **Actor chính**: student.
- **Điều kiện trước**: Học viên đã đăng nhập và có enrollment active, chưa hết hạn.
- **Trigger**: Học viên nhấp vào bài học trong lộ trình.
- **Luồng chính**:
  1. Học viên chọn bài học từ lộ trình.
  2. Hệ thống kiểm tra enrollment của user với khóa học này.
  3. Hệ thống kiểm tra enrollment còn hạn (expiresAt > now hoặc không có hạn).
  4. Hệ thống trả nội dung bài học (URL video, nội dung text, v.v.).
  5. Hệ thống cập nhật LessonProgress khi học viên đánh dấu hoàn thành.
- **Luồng thay thế**: Bài học có isFree=true — bất kỳ ai cũng xem được, không cần enrollment.
- **Luồng lỗi**:
  - Không có enrollment → 403 với mã `NO_ENROLLMENT`.
  - Enrollment đã hết hạn → 403 với mã `ENROLLMENT_EXPIRED`.
  - Bài học không thuộc khóa học → 404.
- **Business rule áp dụng**: BR-CLS-002, BR-CLS-003.
- **Acceptance criteria**: Enrollment hết hạn bị chặn ngay; bài học thử truy cập tự do.

---

### UC-CLS-004 — Admin cấp enrollment thủ công

- **Mục tiêu**: Admin cấp quyền học cho học viên mà không cần thanh toán.
- **Actor chính**: admin.
- **Điều kiện trước**: Admin có permission `enrollment:create`; user và khóa học tồn tại.
- **Trigger**: Admin nhấn "Thêm học viên" trên trang quản lý học viên của khóa học.
- **Luồng chính**:
  1. Admin chọn khóa học và nhập email/ID học viên cần thêm.
  2. Admin chọn ngày hết hạn (tuỳ chọn).
  3. Hệ thống kiểm tra user chưa có enrollment active với khóa học này.
  4. Hệ thống tạo Enrollment với grantedBy = admin, status = active.
  5. Hệ thống ghi AuditLog.
  6. Trả về thành công.
- **Luồng lỗi**:
  - User đã có enrollment active → 400 với mã `ENROLLMENT_ALREADY_EXISTS`.
  - User không tồn tại → 404.
- **Business rule áp dụng**: BR-CLS-004, BR-CLS-005, BR-SYS-006.
- **Acceptance criteria**: Học viên được cấp có thể truy cập ngay; AuditLog có bản ghi đầy đủ.

---

### UC-CLS-005 — Học viên đánh giá khóa học

- **Mục tiêu**: Học viên chia sẻ nhận xét và đánh giá để giúp học viên khác và cải thiện chất lượng.
- **Actor chính**: student.
- **Điều kiện trước**: Học viên có enrollment active với khóa học.
- **Trigger**: Học viên nhấn "Viết đánh giá" trên trang chi tiết khóa học.
- **Luồng chính**:
  1. Học viên nhập điểm đánh giá (1–5 sao) và nội dung nhận xét (tuỳ chọn).
  2. Hệ thống kiểm tra học viên có enrollment active.
  3. Hệ thống kiểm tra học viên chưa đánh giá khóa học này.
  4. Hệ thống tạo Review với status=pending.
  5. Admin duyệt review → status=approved → hiển thị công khai.
- **Luồng lỗi**:
  - Không có enrollment → 403.
  - Đã đánh giá rồi → 400 với mã `REVIEW_ALREADY_EXISTS`.
- **Business rule áp dụng**: BR-CLS-006.
- **Acceptance criteria**: Review chờ duyệt không hiển thị công khai; mỗi học viên chỉ đánh giá một lần mỗi khóa.

---

## 12. User story

### US-CLS-001 — Tìm kiếm khóa học theo từ khóa
- **Với vai trò**: Học viên tiềm năng (guest)
- **Tôi muốn**: Tìm kiếm khóa học theo tên môn học hoặc từ khóa
- **Để**: Nhanh chóng tìm thấy khóa học phù hợp với nhu cầu ôn thi
- **Priority**: Must
- **Business value**: Tăng tỷ lệ chuyển đổi từ khách thành học viên
- **Given**: Tôi đang truy cập trang danh sách khóa học
- **When**: Tôi nhập từ khóa "toán 12" vào ô tìm kiếm
- **Then**: Hệ thống trả danh sách khóa học liên quan đến Toán lớp 12, sắp xếp theo độ phù hợp
- **UI note**: Ô tìm kiếm nổi bật, kết quả cập nhật realtime hoặc khi nhấn Enter
- **API note**: `GET /api/courses?q=toán+12`
- **Test scenario**: Từ khóa có kết quả → hiển thị danh sách; từ khóa không có kết quả → hiển thị thông báo "không tìm thấy"

---

### US-CLS-002 — Xem bài học thử trước khi mua
- **Với vai trò**: Học viên tiềm năng (guest)
- **Tôi muốn**: Xem một số bài học miễn phí trong khóa học trước khi quyết định mua
- **Để**: Đánh giá chất lượng nội dung trước khi chi tiền
- **Priority**: Must
- **Given**: Khóa học có ít nhất một bài học được đánh dấu là học thử miễn phí
- **When**: Tôi nhấp vào bài học đó dù chưa đăng nhập
- **Then**: Nội dung bài học hiển thị đầy đủ; các bài học khác hiển thị tiêu đề và thông báo "Cần đăng ký"
- **Test scenario**: Bài isFree=true → xem được; bài isFree=false chưa enrolled → hiển thị khóa, không trả nội dung

---

### US-CLS-003 — Truy cập nội dung khóa học đã mua
- **Với vai trò**: Học viên đã mua khóa học
- **Tôi muốn**: Học bất kỳ bài học nào trong khóa học đã đăng ký
- **Để**: Theo dõi lộ trình học tập và hoàn thành khóa học
- **Priority**: Must
- **Given**: Tôi có enrollment active với khóa học và enrollment chưa hết hạn
- **When**: Tôi nhấp vào bài học bất kỳ trong khóa
- **Then**: Nội dung bài học được hiển thị đầy đủ; sidebar lộ trình hiển thị bài đang học
- **Rule liên quan**: BR-CLS-002, BR-CLS-003
- **Test scenario**: Enrollment active → xem được; enrollment hết hạn → lỗi 403 có thông báo rõ ràng

---

### US-CLS-004 — Theo dõi tiến độ học tập
- **Với vai trò**: Học viên
- **Tôi muốn**: Đánh dấu bài học đã hoàn thành và xem phần trăm tiến độ tổng thể
- **Để**: Biết mình đã học đến đâu và còn bao nhiêu nội dung
- **Priority**: Must
- **Given**: Tôi đang xem nội dung bài học
- **When**: Tôi nhấn "Hoàn thành bài học"
- **Then**: Bài học được đánh dấu hoàn thành trong sidebar; phần trăm tiến độ khóa học được cập nhật
- **API note**: `PUT /api/me/lessons/{lessonId}/progress`
- **Test scenario**: Đánh dấu lần đầu → progress tăng; đánh dấu lại bài đã hoàn thành → không tăng thêm

---

### US-CLS-005 — Xem lại danh sách khóa học đã đăng ký
- **Với vai trò**: Học viên
- **Tôi muốn**: Xem tất cả khóa học đang học và tiến độ của từng khóa
- **Để**: Quản lý lịch học và ưu tiên khóa học cần hoàn thành sớm
- **Priority**: Must
- **Given**: Tôi đã đăng nhập và có ít nhất một enrollment
- **When**: Tôi truy cập trang "Khóa học của tôi"
- **Then**: Hiển thị danh sách khóa học đã đăng ký kèm phần trăm tiến độ và ngày hết hạn
- **Test scenario**: Có enrollment active → hiển thị; enrollment hết hạn → hiển thị nhưng đánh dấu "Hết hạn"

---

### US-CLS-006 — Admin tạo khóa học mới
- **Với vai trò**: Admin
- **Tôi muốn**: Tạo khóa học mới với đầy đủ thông tin
- **Để**: Cung cấp nội dung học mới cho học viên
- **Priority**: Must
- **Given**: Tôi có permission `course:create`
- **When**: Tôi điền thông tin khóa học và nhấn lưu
- **Then**: Khóa học được tạo với trạng thái draft; tôi có thể tiếp tục thêm chương và bài học trước khi xuất bản
- **Test scenario**: Thiếu trường bắt buộc → lỗi validation; tạo thành công → redirect sang trang chỉnh sửa

---

### US-CLS-007 — Admin xuất bản khóa học
- **Với vai trò**: Admin
- **Tôi muốn**: Xuất bản khóa học để học viên thấy và đăng ký
- **Để**: Đưa nội dung mới đến học viên
- **Priority**: Must
- **Given**: Khóa học ở trạng thái draft và có ít nhất một chương và một bài học
- **When**: Tôi nhấn "Xuất bản"
- **Then**: Trạng thái chuyển sang published; khóa học xuất hiện trong danh sách công khai
- **Rule liên quan**: BR-CLS-001
- **Test scenario**: Khóa học không có bài học → xuất bản thất bại; có nội dung → xuất bản thành công

---

### US-CLS-008 — Admin cấp quyền học thủ công
- **Với vai trò**: Admin
- **Tôi muốn**: Cấp quyền học cho một học viên cụ thể không qua thanh toán
- **Để**: Hỗ trợ học viên học bổng, học thử hoặc trường hợp đặc biệt
- **Priority**: Should
- **Given**: Tôi có permission `enrollment:create`
- **When**: Tôi chọn học viên, chọn khóa học, nhập ngày hết hạn và xác nhận
- **Then**: Enrollment được tạo; học viên có thể truy cập ngay; audit log được ghi
- **Test scenario**: Học viên đã có enrollment active → lỗi; học viên hợp lệ → thành công và audit log có bản ghi

---

## 13. Luồng nghiệp vụ chi tiết

### Luồng 1: Học viên truy cập bài học

```
[Học viên] → Nhấp vào bài học trong lộ trình
     ↓
[API] → Lấy thông tin bài học theo lessonId
     ↓
[AccessPolicyChecker] → Kiểm tra bài học có isFree=true không
     ↓ (isFree=true)
[API] → Trả nội dung bài học ngay, không cần enrollment
     ↓ (isFree=false)
[AccessPolicyChecker] → Kiểm tra user đã đăng nhập chưa
     ↓ (chưa đăng nhập)
[API] → Trả 401
     ↓ (đã đăng nhập)
[EnrollmentService] → Tìm enrollment của user với khóa học này
     ↓ (không có enrollment)
[API] → Trả 403 NO_ENROLLMENT
     ↓ (có enrollment)
[EnrollmentService] → Kiểm tra expiresAt > now
     ↓ (đã hết hạn)
[API] → Trả 403 ENROLLMENT_EXPIRED
     ↓ (còn hạn)
[API] → Trả nội dung bài học đầy đủ
```

### Luồng 2: Enrollment được tạo sau thanh toán

```
[OrderService] → Thanh toán đơn hàng thành công
     ↓
[OrderService] → Gọi EnrollmentService.grantAccess(orderId, userId, productList)
     ↓
[EnrollmentService] → Với mỗi sản phẩm là khóa học trong đơn
[EnrollmentService] → Kiểm tra chưa có enrollment active
     ↓ (đã có)
[EnrollmentService] → Gia hạn nếu cấu hình cho phép; bỏ qua nếu không
     ↓ (chưa có)
[EnrollmentService] → Tạo Enrollment với status=active, gắn orderId
[ProgressService] → Khởi tạo CourseProgress cho enrollment mới
     ↓
[API] → Enrollment hoàn tất
```

### Luồng 3: Hết hạn membership

```
[Scheduler] → Chạy job kiểm tra enrollment hết hạn (hàng ngày)
     ↓
[EnrollmentService] → Tìm enrollment có expiresAt < now và status=active
     ↓
[EnrollmentService] → Cập nhật status → expired
     ↓
[Notification] → Gửi thông báo cho học viên (nếu cấu hình)
     ↓
[JobExecution] → Ghi kết quả job (số enrollment đã expired)
```

---

## 14. Business rule áp dụng

| Mã rule | Nội dung áp dụng trong module này |
|---|---|
| BR-CLS-001 | Khóa học chỉ hiển thị công khai khi ở trạng thái published và đang hoạt động |
| BR-CLS-002 | Học viên chỉ truy cập nội dung khóa học khi có enrollment hợp lệ và chưa hết hạn |
| BR-CLS-003 | Enrollment hết hạn phải tự động chặn quyền truy cập nội dung |
| BR-CLS-004 | Enrollment chỉ được tạo khi đơn hàng thanh toán thành công hoặc admin cấp thủ công có ghi nhận |
| BR-CLS-005 | Mỗi học viên chỉ có một enrollment active trên một khóa học tại một thời điểm |
| BR-CLS-006 | Đánh giá phải ở trạng thái approved mới hiển thị công khai; chỉ enrollment active mới đánh giá được |
| BR-SYS-001 | Học viên chỉ xem tiến độ và dữ liệu của chính mình |
| BR-SYS-002 | Backend kiểm tra quyền truy cập trước mọi request nội dung |
| BR-SYS-006 | Audit log bắt buộc khi admin cấp hoặc thu hồi enrollment |

---

## 15. Validation

### Tạo/sửa khóa học (admin)
- `name`: bắt buộc, 2–255 ký tự.
- `code`: bắt buộc, unique, không chứa ký tự đặc biệt.
- `price`: bắt buộc, không âm.
- `type`: bắt buộc, phải là `online` hoặc `offline`.
- `accessType`: bắt buộc, phải là `public`, `pro` hoặc `private`.

### Tạo chương
- `title`: bắt buộc, 2–255 ký tự.
- `courseId`: phải tồn tại và admin có quyền quản lý khóa học đó.

### Tạo bài học
- `title`: bắt buộc.
- `type`: bắt buộc, phải là `video`, `text`, `exercise` hoặc `exam`.
- `chapterId`: phải tồn tại.

### Cấp enrollment thủ công
- `userId`: bắt buộc, user phải tồn tại.
- `expiresAt`: không bắt buộc; nếu có phải là ngày trong tương lai.

### Gửi đánh giá
- `rating`: bắt buộc, số nguyên từ 1 đến 5.
- `content`: không bắt buộc, nếu có tối đa 2000 ký tự.

---

## 16. State machine

### Trạng thái khóa học (Course)

```
draft → published → archived
published → draft (không cho phép — dùng archived thay thế)
```

| Trạng thái | Hiển thị công khai | Học viên mới đăng ký được |
|---|---|---|
| `draft` | Không | Không |
| `published` | Có | Có (nếu accessType không phải private) |
| `archived` | Không | Không |

### Trạng thái enrollment

```
active → expired (qua thời gian hoặc scheduler)
active → cancelled (admin thu hồi)
```

| Trạng thái | Học viên truy cập được |
|---|---|
| `active` | Có (nếu expiresAt chưa qua) |
| `expired` | Không |
| `cancelled` | Không |

### Trạng thái đánh giá (Review)

```
pending → approved (admin duyệt)
pending → rejected (admin từ chối)
```

---

## 17. Xử lý lỗi

| Mã lỗi | HTTP status | Trường hợp xảy ra | Thông điệp |
|---|---|---|---|
| `COURSE_NOT_FOUND` | 404 | Khóa học không tồn tại hoặc chưa xuất bản | Không tìm thấy khóa học |
| `LESSON_NOT_FOUND` | 404 | Bài học không tồn tại | Không tìm thấy bài học |
| `NO_ENROLLMENT` | 403 | Học viên chưa đăng ký khóa học | Bạn chưa đăng ký khóa học này |
| `ENROLLMENT_EXPIRED` | 403 | Enrollment đã hết hạn | Quyền học của bạn đã hết hạn |
| `ENROLLMENT_ALREADY_EXISTS` | 400 | Học viên đã có enrollment active | Học viên đã được đăng ký khóa học này |
| `REVIEW_ALREADY_EXISTS` | 400 | Đã đánh giá khóa học rồi | Bạn đã đánh giá khóa học này |
| `INVALID_RATING` | 422 | Điểm đánh giá không hợp lệ | Điểm đánh giá phải từ 1 đến 5 |
| `COURSE_NOT_READY_TO_PUBLISH` | 400 | Khóa học không đủ điều kiện xuất bản | Khóa học cần có ít nhất một bài học để xuất bản |
| `FORBIDDEN` | 403 | Không có permission | Bạn không có quyền thực hiện thao tác này |

---

## 18. Acceptance criteria

| Mã AC | Chức năng | Tiêu chí chấp nhận |
|---|---|---|
| AC-CLS-001 | Danh sách | Chỉ trả khóa học published; không trả draft hoặc archived |
| AC-CLS-002 | Tìm kiếm | Bộ lọc kết hợp hoạt động đúng; trả mảng rỗng khi không có kết quả |
| AC-CLS-003 | Chi tiết | isEnrolled trả đúng theo trạng thái enrollment của user |
| AC-CLS-004 | Bài học thử | Bài isFree=true xem được mà không cần enrollment |
| AC-CLS-005 | Truy cập nội dung | Enrollment hết hạn bị chặn; trả 403 ENROLLMENT_EXPIRED |
| AC-CLS-006 | Tiến độ | Đánh dấu hoàn thành bài học cập nhật CourseProgress đúng |
| AC-CLS-007 | Đánh giá | Review pending không hiển thị công khai; chỉ approved mới hiển thị |
| AC-CLS-008 | Xuất bản | Khóa học không có bài học không thể xuất bản |
| AC-CLS-009 | Enrollment thủ công | Học viên được cấp có thể truy cập ngay; audit log có bản ghi |
| AC-CLS-010 | API bảo mật | Endpoint cần permission trả 403 khi thiếu quyền |

---

## 19. Test/UAT scenario

| Mã kịch bản | Mô tả | Điều kiện ban đầu | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|---|
| T-CLS-001 | Lấy danh sách khóa học không cần đăng nhập | Có 3 khóa: 2 published, 1 draft | GET /api/courses | Trả 2 khóa published, không có khóa draft |
| T-CLS-002 | Tìm kiếm theo từ khóa | Có khóa "Toán THPT" | GET /api/courses?q=toán | Trả khóa liên quan |
| T-CLS-003 | Xem chi tiết khóa học chưa đăng nhập | Khóa học published | GET /api/courses/{id} | isEnrolled=false; bài học thử hiển thị |
| T-CLS-004 | Học viên xem bài học đã enrolled | Enrollment active chưa hết hạn | GET /api/courses/{id}/lessons/{id} | Trả nội dung bài học |
| T-CLS-005 | Học viên xem bài học enrollment hết hạn | Enrollment expired | GET /api/courses/{id}/lessons/{id} | Trả 403 ENROLLMENT_EXPIRED |
| T-CLS-006 | Khách xem bài học thử | Bài isFree=true | GET /api/courses/{id}/lessons/{id} (không token) | Trả nội dung bài học |
| T-CLS-007 | Khách xem bài học không thử | Bài isFree=false | GET /api/courses/{id}/lessons/{id} (không token) | Trả 401 |
| T-CLS-008 | Đánh dấu hoàn thành bài học | Enrollment active | PUT /api/me/lessons/{id}/progress với isCompleted=true | Trả 200; courseProgress tăng |
| T-CLS-009 | Admin xuất bản khóa học có nội dung | Khóa học draft có bài học | PUT /api/admin/courses/{id}/publish | Status chuyển published |
| T-CLS-010 | Admin xuất bản khóa học không có bài học | Khóa học draft không có bài | PUT /api/admin/courses/{id}/publish | Trả 400 COURSE_NOT_READY_TO_PUBLISH |
| T-CLS-011 | Admin cấp enrollment thủ công | User chưa enrolled | POST /api/admin/courses/{id}/enrollments | Enrollment được tạo; audit log có bản ghi |
| T-CLS-012 | Admin cấp enrollment cho user đã enrolled | User đã có enrollment active | POST /api/admin/courses/{id}/enrollments | Trả 400 ENROLLMENT_ALREADY_EXISTS |
| T-CLS-013 | Học viên gửi đánh giá | Có enrollment active | POST /api/courses/{id}/reviews | Review tạo với status=pending |
| T-CLS-014 | Học viên gửi đánh giá lần 2 | Đã đánh giá rồi | POST /api/courses/{id}/reviews | Trả 400 REVIEW_ALREADY_EXISTS |
| T-CLS-015 | Admin duyệt review | Review status=pending | PUT /api/admin/reviews/{id}/approve | Review status=approved; hiển thị công khai |

---

## 20. Phụ thuộc module khác

### Module này phụ thuộc
- **Authentication**: kiểm tra token và permission cho mọi API bảo mật.

### Module khác phụ thuộc module này
- **Document**: tài liệu có thể gắn với khóa học; kiểm tra enrollment khi xem tài liệu PRO gắn khóa.
- **Exam**: đề thi có thể thuộc khóa học; kiểm tra enrollment khi làm bài trong khóa.
- **Order/Payment**: sau thanh toán thành công, gọi EnrollmentService để cấp quyền học.
- **Book**: bundle sách chứa nhiều khóa học; kích hoạt mã sách → gọi EnrollmentService.
- **Reporting**: đọc dữ liệu enrollment và progress để tạo báo cáo.

---

## 21. Câu hỏi cần xác nhận

| Câu hỏi | Ảnh hưởng | Đề xuất tạm thời |
|---|---|---|
| Thời hạn enrollment mặc định là bao lâu? | Trường expiresAt khi tạo enrollment | Đề xuất: theo cấu hình từng khóa học |
| Có cho gia hạn enrollment không? Nếu có thì theo cơ chế nào? | Nghiệp vụ gia hạn | Đề xuất: tạo enrollment mới khi mua lại |
| Điều kiện để xuất bản khóa học là gì? Chỉ cần có bài học hay cần thêm điều kiện? | Validation xuất bản | Đề xuất: ít nhất 1 chương và 1 bài học |
| Có hỗ trợ nhiều giáo viên cùng dạy một khóa không? | Model Course.teacherId | Đề xuất: một giáo viên chính, có thể mở rộng sau |
| Tiến độ tính dựa trên bài đã đánh dấu hoàn thành hay có logic xem video đủ thời gian? | ProgressService | Đề xuất: dựa trên đánh dấu thủ công |
| Enrollment có tự gia hạn khi học viên mua thêm gói không? | EnrollmentService | Đề xuất: tạo enrollment mới thay vì gia hạn |
| Hình thức học offline có khác gì online trong hệ thống? | Model Course.type | Đề xuất: offline không có bài học online, chỉ quản lý thành viên |
