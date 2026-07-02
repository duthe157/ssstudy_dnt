# 1. Thông tin module
- Tên module: Classroom / khóa học
- Mục tiêu nghiệp vụ: cho phép người dùng xem, tìm kiếm và truy cập các khóa học; cho phép admin/teacher quản lý lớp học, chương mục, danh mục bài học, thành viên và metadata khóa học.
- Phạm vi đặc tả: các chức năng được chứng minh trực tiếp từ source: danh sách khóa học công khai, xem chi tiết khóa học, xem đánh giá, xem chương/danh mục bài học, xem khóa học liên quan, xem thành viên lớp học, quản lý danh sách khóa học ở admin và cập nhật metadata/chương mục.
- Source liên quan:
  - [api-develop/app/controllers/ClassroomController.js](../../../../api-develop/app/controllers/ClassroomController.js)
  - [api-develop/app/routes/routes.js](../../../../api-develop/app/routes/routes.js)
  - [web-admin/src/components/classroom/Classroom.js](../../../../web-admin/src/components/classroom/Classroom.js)
  - [web-admin/src/components/classroom/ClassroomCreate.js](../../../../web-admin/src/components/classroom/ClassroomCreate.js)
  - [web-admin/src/components/classroom/ClassroomEdit.js](../../../../web-admin/src/components/classroom/ClassroomEdit.js)
  - [web-admin/src/components/classroom/ClassroomMember.js](../../../../web-admin/src/components/classroom/ClassroomMember.js)
  - [web-admin/src/redux/classroom/action.js](../../../../web-admin/src/redux/classroom/action.js)
  - [web-ssstudy/src/app/khoa-hoc/_components/CourseContent.tsx](../../../../web-ssstudy/src/app/khoa-hoc/_components/CourseContent.tsx)
  - [web-ssstudy/src/app/khoa-hoc/_components/CourseDetailClient.tsx](../../../../web-ssstudy/src/app/khoa-hoc/_components/CourseDetailClient.tsx)
  - [web-ssstudy/src/app/khoa-hoc/[id]/getCourseData.ts](../../../../web-ssstudy/src/app/khoa-hoc/[id]/getCourseData.ts)
- Màn hình liên quan:
  - web-admin: /classroom-online, /classroom-offline, /classroom/:id/report, /classroom/:id/member, /classroom/:id/edit
  - web-ssstudy: /khoa-hoc, /khoa-hoc/[id], /account/my-course
- API liên quan:
  - /classroom-list
  - /classroom-view
  - /classroom-chapter-category
  - /classroom/list-chapter
  - /classroom/list-member
  - /classroom/list-related
  - /classroom/list
  - /classroom/detail
- Entity/table/dữ liệu liên quan:
  - Classroom, ClassroomGroup, ClassroomReview, Chapter, ChapterClassroom, Category, CategoryClassroom, StudentClassroom, User
- Mức độ xác minh: Cao

# 2. Actor và phân quyền

| Actor/Role | Permission | Chức năng được phép | Điều kiện truy cập | Bằng chứng source | Ghi chú |
|---|---|---|---|---|---|
| Guest / Public user | Xem danh mục và chi tiết khóa học công khai | Xem danh sách khóa học, lọc theo tiêu chí, xem chi tiết, xem đánh giá, xem chương mục | Không cần token cho các route public | [api-develop/app/controllers/ClassroomController.js](../../../../api-develop/app/controllers/ClassroomController.js), [api-develop/app/routes/routes.js](../../../../api-develop/app/routes/routes.js), [web-ssstudy/src/app/khoa-hoc/_components/CourseContent.tsx](../../../../web-ssstudy/src/app/khoa-hoc/_components/CourseContent.tsx) | Route public được đánh dấu rõ ràng |
| STUDENT | Truy cập khóa học đã tham gia / xem nội dung thuộc lớp | Xem lớp học, kiểm tra trạng thái đã tham gia, xem thành viên lớp học trong giới hạn phù hợp | Backend kiểm tra trạng thái join qua ClassroomService | [api-develop/app/controllers/ClassroomController.js](../../../../api-develop/app/controllers/ClassroomController.js) | Có luồng kiểm tra user trong classroom |
| ADMIN / TEACHER / MANAGER | Quản trị lớp học | Xem danh sách lớp học, chỉnh sửa thông tin, cập nhật trạng thái, cập nhật ordering/featured, quản lý thành viên, xem báo cáo | Route admin và controller kiểm tra quyền truy cập như các module khác | [web-admin/src/components/classroom/Classroom.js](../../../../web-admin/src/components/classroom/Classroom.js), [web-admin/src/components/classroom/ClassroomEdit.js](../../../../web-admin/src/components/classroom/ClassroomEdit.js), [web-admin/src/components/classroom/ClassroomMember.js](../../../../web-admin/src/components/classroom/ClassroomMember.js) | Quyền chi tiết được quản lý bởi auth middleware chung |

# 3. Danh sách chức năng

| Mã chức năng | Tên chức năng | Actor | Màn hình/Route | API | Controller/Service | Trạng thái xác minh |
|---|---|---|---|---|---|---|
| CLS-01 | Xem danh sách khóa học công khai | Guest, STUDENT | /khoa-hoc | /classroom-list | ClassroomController.listPublic | Đã xác nhận |
| CLS-02 | Xem chi tiết khóa học | Guest, STUDENT | /khoa-hoc/[id] | /classroom-view, /classroom/detail | ClassroomController.view, ClassroomController.detail | Đã xác nhận |
| CLS-03 | Xem đánh giá khóa học | Guest, STUDENT | /khoa-hoc/[id] | /classroom-reviews | ClassroomReviewController.reviews | Đã xác nhận |
| CLS-04 | Xem chương và danh mục bài học | Student / user trong classroom | Nội dung khóa học | /classroom-chapter-category, /classroom/list-chapter, /classroom/list-chapter-category | ClassroomController.listChapterCategory, ClassroomController.listChapter | Đã xác nhận |
| CLS-05 | Xem khóa học liên quan | Guest, STUDENT | /khoa-hoc/[id] | /classroom/list-related | ClassroomController.listRelated | Đã xác nhận |
| CLS-06 | Xem danh sách thành viên lớp học | Admin/Teacher/authorized user | /classroom/:id/member | /classroom/list-member, /classroom/members | ClassroomController.listMember, ClassroomController.members | Đã xác nhận |
| CLS-07 | Quản lý lớp học ở admin | Admin/Teacher/Manager | /classroom, /classroom/:id/edit | /classroom/list, /classroom/detail, /classroom/update-meta-data | ClassroomController.list, ClassroomController.detail, ClassroomController.updateMetaData | Đã xác nhận |

# 4. Đặc tả chi tiết từng chức năng

## CLS-01 Xem danh sách khóa học công khai

### Mục đích
Cho phép người dùng duyệt danh sách khóa học công khai, tìm kiếm và lọc theo nhiều tiêu chí như mức giá, cấp học, giảng viên, nhóm môn, nhãn label và loại khóa học.

### Actor / quyền sử dụng
- Guest
- STUDENT

### Điều kiện trước
- Không bắt buộc đăng nhập.
- Danh sách chỉ trả về những bản ghi có status = true, deleted_at = null và is_online = true cho route công khai.

### Điểm khởi đầu
- Route: /khoa-hoc
- Màn hình: [web-ssstudy/src/app/khoa-hoc/_components/CourseContent.tsx](../../../../web-ssstudy/src/app/khoa-hoc/_components/CourseContent.tsx)
- Trigger: mở trang khóa học, thay đổi bộ lọc hoặc phân trang

### Dữ liệu đầu vào

| Trường dữ liệu | Kiểu dữ liệu | Bắt buộc | Validation | Nguồn dữ liệu | Ghi chú |
|---|---|---|---|---|---|
| keyword | string | Không | Regex search trên name/code | URL query hoặc request body | Dùng cho tìm kiếm tên/mã khóa học |
| level | string/array | Không | Filter theo level | Query params và payload | Có thể là chuỗi hoặc mảng |
| subject_id | string | Không | Filter theo subject.id | Query params | |
| group_id | string | Không | Filter theo group.id | Query params | |
| teacher_id | string | Không | Filter theo teacher_id | Query params | |
| price | string | Không | Range price | Query params | |
| type | string/array | Không | PROMOTION/MOST_POPULAR/HOT | Query params | |
| label_id | string | Không | Filter qua LabelItem | Query params | |
| page/limit | number | Không | Phân trang | UI và request | |
| is_online | boolean | Không | Bắt buộc true ở public route | Request | |

### Luồng chính
1. Frontend gọi /classroom-list với các filter và page/limit.
2. Backend ClassroomController.listPublic xây dựng điều kiện truy vấn.
3. Hệ thống lọc theo trạng thái công khai và các tham số filter.
4. Trả về records, totalRecord và pagination info.
5. Frontend render grid khóa học và phân trang.

### Luồng thay thế / ngoại lệ
- Nếu không có dữ liệu, trả lại danh sách rỗng và totalRecord = 0.
- Nếu price/type/label filter không hợp lệ, hệ thống bỏ qua filter đó.
- Nếu limit = 100 thì backend tự đổi thành 200.

### Validation và business rule
- Chỉ trả về khóa học chưa bị xóa và có status = true.
- Các trường filter được ánh xạ vào điều kiện $or/$in trên dữ liệu Classroom.
- Có sắp xếp mặc định theo ordering, và có thể override theo sort_key/sort_value.

### API liên quan

| Endpoint | Method | Request DTO/params | Response | Controller | Service | Exception/lỗi có thể có |
|---|---|---|---|---|---|---|
| /classroom-list | POST/GET | keyword, level, subject_id, group_id, teacher_id, price, type, label_id, page, limit, is_online | records, totalRecord, perPage | ClassroomController.listPublic | N/A | Lỗi hệ thống chung |

### Màn hình liên quan

| Tên màn hình | Route | Component/Page | Field hiển thị | Action/Button | API gọi | Điều kiện hiển thị | Role/Permission |
|---|---|---|---|---|---|---|---|
| Trang khóa học | /khoa-hoc | [web-ssstudy/src/app/khoa-hoc/_components/CourseContent.tsx](../../../../web-ssstudy/src/app/khoa-hoc/_components/CourseContent.tsx) | danh sách khóa học, bộ lọc, phân trang | Click khóa học, đổi bộ lọc | /classroom-list | Public | Guest/STUDENT |

### Bằng chứng từ source
- [api-develop/app/controllers/ClassroomController.js](../../../../api-develop/app/controllers/ClassroomController.js)
- [api-develop/app/routes/routes.js](../../../../api-develop/app/routes/routes.js)
- [web-ssstudy/src/app/khoa-hoc/_components/CourseContent.tsx](../../../../web-ssstudy/src/app/khoa-hoc/_components/CourseContent.tsx)

## CLS-02 Xem chi tiết khóa học

### Mục đích
Hiển thị thông tin chi tiết của một khóa học bao gồm mô tả, thông tin giảng viên, giá, liên kết môn học/nhóm học, nội dung, số lượng học viên, bài học liên quan và dữ liệu đi kèm như sách liên quan, khóa học liên quan.

### Actor / quyền sử dụng
- Guest
- STUDENT

### Điều kiện trước
- ID khóa học phải tồn tại.
- Nếu người dùng đã đăng nhập, hệ thống kiểm tra xem họ đã tham gia lớp hay chưa.

### Điểm khởi đầu
- Route: /khoa-hoc/[id]
- Màn hình: [web-ssstudy/src/app/khoa-hoc/_components/CourseDetailClient.tsx](../../../../web-ssstudy/src/app/khoa-hoc/_components/CourseDetailClient.tsx)
- Trigger: click vào một khóa học từ danh sách hoặc nhập trực tiếp URL

### Dữ liệu đầu vào

| Trường dữ liệu | Kiểu dữ liệu | Bắt buộc | Validation | Nguồn dữ liệu | Ghi chú |
|---|---|---|---|---|---|
| id | string | Có | Không rỗng | URL param | Dùng để tìm Classroom theo _id |
| user_id / user_group | string | Không | Từ req.user nếu có | Auth middleware | Dùng để kiểm tra is_joined |

### Luồng chính
1. Frontend gọi getCourseData hoặc courseService.classroomDetail với id khóa học.
2. Backend ClassroomController.detail lấy thông tin lớp học, user count và các dữ liệu liên quan.
3. Backend ClassroomController.view lấy thêm review, top10 điểm, teacher, guideStudy, is_joined.
4. Frontend render header, purchase card, tabs, sidebar và các section phụ.

### Luồng thay thế / ngoại lệ
- Nếu khóa học không tồn tại, trả lỗi "Khóa học này không tồn tại!".
- Nếu dữ liệu liên quan không có, trả mảng rỗng thay vì lỗi.

### Validation và business rule
- Tính num_student bằng số lượng StudentClassroom
a và cộng thêm extra_number_student khi hiển thị.
- Hiển thị thông tin teacher từ UserModel nếu teacher_id tồn tại.
- Tính top10 ranking nội bộ từ AvgPointLog và PointLog theo tháng/năm hiện tại.

### API liên quan

| Endpoint | Method | Request DTO/params | Response | Controller | Service | Exception/lỗi có thể có |
|---|---|---|---|---|---|---|
| /classroom/detail | POST | { id } | classroom, cartCategories, bookAttached, bookRelates, classroomRelates, classroomAttached | ClassroomController.detail | N/A | Lỗi hệ thống chung |
| /classroom-view | POST | { id, user_id?, user_group? } | classroom, reviews, totalReview, teacher, top10, guideStudy, is_joined | ClassroomController.view | ClassroomService.isUserInClassroom | Khóa học không tồn tại |

### Màn hình liên quan

| Tên màn hình | Route | Component/Page | Field hiển thị | Action/Button | API gọi | Điều kiện hiển thị | Role/Permission |
|---|---|---|---|---|---|---|---|
| Chi tiết khóa học | /khoa-hoc/[id] | [web-ssstudy/src/app/khoa-hoc/_components/CourseDetailClient.tsx](../../../../web-ssstudy/src/app/khoa-hoc/_components/CourseDetailClient.tsx) | thông tin khóa học, giảng viên, giá, nút mua/thêm giỏ, tabs | Mua ngay, thêm vào giỏ | /classroom/detail hoặc /classroom-view | Public | Guest/STUDENT |

### Bằng chứng từ source
- [api-develop/app/controllers/ClassroomController.js](../../../../api-develop/app/controllers/ClassroomController.js)
- [web-ssstudy/src/app/khoa-hoc/[id]/getCourseData.ts](../../../../web-ssstudy/src/app/khoa-hoc/[id]/getCourseData.ts)

## CLS-03 Xem đánh giá khóa học

### Mục đích
Hiển thị các đánh giá của học viên đối với khóa học, kèm số lượng review và dữ liệu review đã được duyệt.

### Actor / quyền sử dụng
- Guest
- STUDENT

### Điều kiện trước
- Khóa học cần tồn tại.
- Chỉ lấy review có status = true, deleted_at = null.

### Điểm khởi đầu
- Route: /classroom-reviews
- Màn hình: tab đánh giá trong trang chi tiết khóa học

### Luồng chính
1. Frontend gọi /classroom-reviews với classroom id.
2. Backend ClassroomReviewController.reviews truy vấn danh sách review cho classroom.
3. Response trả về review list và tổng số lượng.
4. Frontend render review list.

### API liên quan

| Endpoint | Method | Request DTO/params | Response | Controller | Service | Exception/lỗi có thể có |
|---|---|---|---|---|---|---|
| /classroom-reviews | POST | { classroom_id, page?, limit? } | records, totalRecord | ClassroomReviewController.reviews | N/A | Lỗi hệ thống chung |

### Bằng chứng từ source
- [api-develop/app/routes/routes.js](../../../../api-develop/app/routes/routes.js)
- [api-develop/app/controllers/ClassroomController.js](../../../../api-develop/app/controllers/ClassroomController.js)

## CLS-04 Xem chương và danh mục bài học

### Mục đích
Cho phép người dùng xem cấu trúc nội dung khóa học theo chương và danh mục bài học, bao gồm bài giảng, bài tập, video/hình ảnh liên kết và trạng thái làm bài kiểm tra.

### Actor / quyền sử dụng
- STUDENT đã tham gia hoặc user có quyền truy cập nội dung lớp học
- Admin/Teacher có thể quản lý cấu trúc này

### Điều kiện trước
- Cần có classroom_id.
- Backend lấy danh sách ChapterClassroom và CategoryClassroom liên quan đến classroom.

### Điểm khởi đầu
- Route: /classroom-chapter-category hoặc /classroom/list-chapter
- Màn hình: nội dung khóa học ở frontend và admin quản lý cấu trúc bài học

### Dữ liệu đầu vào

| Trường dữ liệu | Kiểu dữ liệu | Bắt buộc | Validation | Nguồn dữ liệu | Ghi chú |
|---|---|---|---|---|---|
| classroom_id | string | Có | Không rỗng | Request body | |
| selected_subject_id | string | Không | Từ mapping chapter | Backend | |
| group_id | string | Không | Tổ chức nhóm chương | Backend | |

### Luồng chính
1. Backend lấy ChapterClassroom theo classroom_id.
2. Tạo mapping giữa chapter và selected_subject_id/group_id.
3. Tìm các Chapter và Category tương ứng.
4. Trả về cấu trúc chương → danh mục và dữ liệu metadata như publish_at, is_done_exam, is_done_video.
5. Frontend render menu bài học và bài giảng.

### Luồng thay thế / ngoại lệ
- Nếu dữ liệu chapter/category không tồn tại, trả về mảng rỗng.
- Nếu thiếu group_id thì backend tự gán nhóm mặc định và cập nhật dữ liệu.

### Validation và business rule
- Sắp xếp chương và category theo ordering và created_at.
- Nếu category có exam liên quan, backend kiểm tra user đã làm bài hay chưa bằng userExamIds.
- Có support cho livestream related info trong category.

### API liên quan

| Endpoint | Method | Request DTO/params | Response | Controller | Service | Exception/lỗi có thể có |
|---|---|---|---|---|---|---|
| /classroom-chapter-category | POST | { classroom_id } | chapters với category list | ClassroomController.listChapterCategory | N/A | Request invalid |
| /classroom/list-chapter | POST | { classroom_id } | records: chaptersWithSubject | ClassroomController.listChapter | N/A | Lỗi hệ thống chung |

### Bằng chứng từ source
- [api-develop/app/controllers/ClassroomController.js](../../../../api-develop/app/controllers/ClassroomController.js)
- [web-admin/src/components/classroom/ClassroomEdit.js](../../../../web-admin/src/components/classroom/ClassroomEdit.js)

## CLS-05 Xem khóa học liên quan

### Mục đích
Hiển thị các khóa học tương tự dựa trên nhóm môn học, cấp học và khóa học hiện tại.

### Actor / quyền sử dụng
- Guest
- STUDENT

### Điều kiện trước
- Cần có classroom_id hoặc group_id/level.

### Luồng chính
1. Frontend gọi /classroom/list-related với classroom_id và filter group/level.
2. Backend lọc các khóa học công khai khác với lớp hiện tại.
3. Trả về danh sách kết quả và teacher tương ứng.
4. Frontend render section khóa học liên quan.

### API liên quan

| Endpoint | Method | Request DTO/params | Response | Controller | Service | Exception/lỗi có thể có |
|---|---|---|---|---|---|---|
| /classroom/list-related | POST | { classroom_id, group_id?, level? } | records, totalRecord, perPage | ClassroomController.listRelated | N/A | Lỗi hệ thống chung |

### Bằng chứng từ source
- [api-develop/app/controllers/ClassroomController.js](../../../../api-develop/app/controllers/ClassroomController.js)
- [web-ssstudy/src/app/khoa-hoc/_components/RelatedCourses.tsx](../../../../web-ssstudy/src/app/khoa-hoc/_components/RelatedCourses.tsx)

## CLS-06 Xem danh sách thành viên lớp học

### Mục đích
Cho phép admin/teacher xem danh sách học viên trong một lớp học, kèm thông tin số buổi học, buổi đã học, tổng điểm thi và dữ liệu truy cập theo tháng/năm.

### Actor / quyền sử dụng
- Admin / Teacher / Manager / authorized user

### Điều kiện trước
- Cần có classroom_id.
- Nếu user là student thì phải được phép truy cập nội dung lớp học và không bị hết buổi học.

### Điểm khởi đầu
- Route: /classroom/:id/member
- Màn hình: [web-admin/src/components/classroom/ClassroomMember.js](../../../../web-admin/src/components/classroom/ClassroomMember.js)

### Dữ liệu đầu vào

| Trường dữ liệu | Kiểu dữ liệu | Bắt buộc | Validation | Nguồn dữ liệu | Ghi chú |
|---|---|---|---|---|---|
| id | string | Có | Không rỗng | URL param | |
| keyword | string | Không | Search theo tên/mã | Request | |
| month/year | number | Không | Dùng cho thống kê điểm | Request | |
| is_export | boolean | Không | Xuất excel | Request | |

### Luồng chính
1. Admin mở trang thành viên của lớp học.
2. Frontend gọi /classroom/list-member.
3. Backend lấy StudentClassroom, lọc theo classroom id và keyword.
4. Kết hợp dữ liệu User và Testing để tạo danh sách member với số buổi học và tổng điểm thi.
5. Nếu is_export = true, xuất file Excel.

### Luồng thay thế / ngoại lệ
- Nếu học viên không có dữ liệu testing thì hiển thị 0 cho các cột tổng điểm và số lần làm bài.
- Nếu không tìm thấy thành viên, trả về danh sách rỗng.

### API liên quan

| Endpoint | Method | Request DTO/params | Response | Controller | Service | Exception/lỗi có thể có |
|---|---|---|---|---|---|---|
| /classroom/list-member | POST | { id, keyword?, month?, year?, is_export? } | totalRecord, perPage, records | ClassroomController.listMember | ClassroomService.exportMemberClassroom | Lỗi hệ thống chung |
| /classroom/members | POST | { id, keyword? } | records | ClassroomController.members | ClassroomService.checkUserOnClassroom | Hết số buổi học |

### Bằng chứng từ source
- [api-develop/app/controllers/ClassroomController.js](../../../../api-develop/app/controllers/ClassroomController.js)
- [web-admin/src/components/classroom/ClassroomMember.js](../../../../web-admin/src/components/classroom/ClassroomMember.js)

## CLS-07 Quản lý lớp học ở admin

### Mục đích
Cho phép admin/teacher quản lý lớp học chính trong hệ thống: xem danh sách, tạo mới, chỉnh sửa, cập nhật trạng thái, giảm/đẩy ordering, đánh dấu featured, liên kết sách hoặc lớp học khác, quản lý nhóm chương và metadata.

### Actor / quyền sử dụng
- Admin / Teacher / Manager

### Điều kiện trước
- Người dùng đã đăng nhập và có quyền vào admin.
- Các danh mục subject/group/chapter có thể được load trước khi tạo/chỉnh sửa.

### Điểm khởi đầu
- Route: /classroom, /classroom/:id/edit
- Màn hình: [web-admin/src/components/classroom/Classroom.js](../../../../web-admin/src/components/classroom/Classroom.js), [web-admin/src/components/classroom/ClassroomEdit.js](../../../../web-admin/src/components/classroom/ClassroomEdit.js)

### Dữ liệu đầu vào

| Trường dữ liệu | Kiểu dữ liệu | Bắt buộc | Validation | Nguồn dữ liệu | Ghi chú |
|---|---|---|---|---|---|
| code/name/teacher/subject_id/group_id | string | Có/không | UI và backend validation | Form admin | |
| price/origin_price/hp_* | number | Không | Parse số | Form admin | |
| is_online/is_featured/status | boolean | Không | Toggle switch | Form admin | |
| ordering | number | Không | Phạm vi 1-800 | Form admin | |
| time_course/promotion | object | Không | Date range/promotion config | Form admin | |
| book_attached/book_relates/classroom_relates/classroom_attached | array | Không | Chọn liên kết | Modal UI | |

### Luồng chính
1. Admin mở trang danh sách lớp học.
2. Hệ thống load danh sách từ /classroom/list và render bảng.
3. Admin có thể chỉnh sửa metadata trực tiếp trên bảng (status, featured, ordering).
4. Admin mở trang chỉnh sửa để sửa thông tin chi tiết và cấu trúc chương.
5. Hệ thống lưu dữ liệu và gọi các endpoint cập nhật tương ứng.

### Luồng thay thế / ngoại lệ
- Nếu không có dữ liệu subject/group/chapter, form vẫn có thể mở nhưng dữ liệu liên kết sẽ thiếu.
- Nếu cập nhật ordering = 0 hoặc > 800, hệ thống tự chuyển về 1.

### Validation và business rule
- Trạng thái và featured được cập nhật qua /classroom/update-meta-data.
- Ordering được validate trong controller và giao diện.
- Tạo/chỉnh sửa lớp học có liên quan tới ChapterClassroom, CategoryClassroom và các đối tượng liên kết khác.

### API liên quan

| Endpoint | Method | Request DTO/params | Response | Controller | Service | Exception/lỗi có thể có |
|---|---|---|---|---|---|---|
| /classroom/list | POST | { keyword?, page?, limit?, teacher_id?, subject_id?, group_id?, is_online?, name?, level? } | records, totalRecord, perPage | ClassroomController.list | N/A | Lỗi hệ thống chung |
| /classroom/detail | POST | { id } | classroom data | ClassroomController.detail | N/A | Lỗi hệ thống chung |
| /classroom/update-meta-data | POST | { id, status?, ordering?, is_featured? } | success | ClassroomController.updateMetaData | N/A | Lỗi hệ thống chung |

### Bằng chứng từ source
- [web-admin/src/components/classroom/Classroom.js](../../../../web-admin/src/components/classroom/Classroom.js)
- [web-admin/src/components/classroom/ClassroomEdit.js](../../../../web-admin/src/components/classroom/ClassroomEdit.js)
- [web-admin/src/redux/classroom/action.js](../../../../web-admin/src/redux/classroom/action.js)

# 5. Dữ liệu và trạng thái chính

| Entity | Vai trò trong module | Trường quan trọng | Ghi chú |
|---|---|---|---|
| Classroom | Khóa học chính | _id, name, code, teacher_id, subject, group, price, origin_price, status, is_online, is_featured, ordering, description, content, book_attached, classroom_attached, time_course, promotion | Là trung tâm của module |
| ClassroomGroup | Nhóm danh mục khóa học | _id, name, subject_id | Dùng cho phân nhóm và filter |
| ClassroomReview | Đánh giá khóa học | classroom.id, status, created_at | Được render ở trang chi tiết |
| Chapter / ChapterClassroom | Chương học của khóa học | chapter.id, selected_subject_id, group_id, ordering | Dùng cho cấu trúc bài học |
| Category / CategoryClassroom | Bài học/danh mục nội dung | exam, publish_at, livestream_btn | Dùng cho bài giảng và bài tập |
| StudentClassroom | Học viên tham gia lớp | classroom.id, user.id, sobuoihoc, buoidahoc, lesson_view_dates | Dùng cho thành viên và thống kê |

# 6. Các điểm cần xác nhận thêm
- Chi tiết quyền role giữa ADMIN/TEACHER/MANAGER/SUPPORTER trong admin management chưa được ánh xạ đầy đủ ở từng endpoint.
- Luồng join/approve lớp học và checkout/payment trước khi xem nội dung đầy đủ chưa được minh chứng đầy đủ trong controller hiện tại.
- Một số trường metadata như promotion, includes, highlightInformations có mặt ở UI quản trị nhưng không được mô tả đầy đủ trong controller public hiện tại.

# 7. Kết luận
Module Classroom / khóa học là module trung tâm của hệ thống học tập. Từ source hiện tại, hệ thống đã có đầy đủ bằng chứng cho việc:
- hiển thị danh sách và chi tiết khóa học cho public user;
- tổ chức nội dung khóa học theo chương/danh mục;
- xem đánh giá và khóa học liên quan;
- quản lý thành viên và metadata khóa học ở admin.
