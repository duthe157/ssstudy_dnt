# 1. Thông tin module
- Tên module: Document / tài liệu
- Mục tiêu nghiệp vụ: cho phép người dùng duyệt, xem và quản lý tài liệu học tập; cho phép admin quản trị danh mục tài liệu, tài liệu riêng lẻ, upload file, gắn tài liệu với lớp học và điều khiển mức độ truy cập.
- Phạm vi đặc tả: các chức năng được chứng minh trực tiếp từ source: danh sách tài liệu công khai, xem chi tiết tài liệu, xem tài liệu liên quan, xem preview PDF, quản lý danh mục tài liệu ở admin, quản lý tài liệu ở admin (tạo/sửa/xóa), upload file và gắn tài liệu với lớp học.
- Source liên quan:
  - [api-develop/app/controllers/DocumentController.js](../../../../api-develop/app/controllers/DocumentController.js)
  - [api-develop/app/controllers/DocumentCategoryController.js](../../../../api-develop/app/controllers/DocumentCategoryController.js)
  - [api-develop/app/routes/routes.js](../../../../api-develop/app/routes/routes.js)
  - [api-develop/app/models/Document.js](../../../../api-develop/app/models/Document.js)
  - [api-develop/app/models/DocumentCategory.js](../../../../api-develop/app/models/DocumentCategory.js)
  - [web-admin/src/components/document/Document.js](../../../../web-admin/src/components/document/Document.js)
  - [web-admin/src/components/document/DocumentCreate.js](../../../../web-admin/src/components/document/DocumentCreate.js)
  - [web-admin/src/components/document/DocumentEdit.js](../../../../web-admin/src/components/document/DocumentEdit.js)
  - [web-admin/src/components/document/DocumentCategory.js](../../../../web-admin/src/components/document/DocumentCategory.js)
  - [web-admin/src/components/document/DocumentCategoryCreate.js](../../../../web-admin/src/components/document/DocumentCategoryCreate.js)
  - [web-admin/src/components/document/DocumentCategoryEdit.js](../../../../web-admin/src/components/document/DocumentCategoryEdit.js)
  - [web-ssstudy/src/services/documentService.ts](../../../../web-ssstudy/src/services/documentService.ts)
  - [web-ssstudy/src/app/tai-lieu/page.tsx](../../../../web-ssstudy/src/app/tai-lieu/page.tsx)
  - [web-ssstudy/src/app/tai-lieu/[id]/_components/DocumentDetailClient.tsx](../../../../web-ssstudy/src/app/tai-lieu/[id]/_components/DocumentDetailClient.tsx)
- Màn hình liên quan:
  - web-admin: /document, /document/create, /document/:id/edit, /document-category, /document-category/create, /document-category/:id/edit
  - web-ssstudy: /tai-lieu, /tai-lieu/[id]
- API liên quan:
  - /document/list
  - /document/list-related
  - /document/list-public
  - /document/detail
  - /document/show
  - /document/create
  - /document/update
  - /document/delete
  - /document-category/list-public
  - /document-category/detail
  - /document-category/create
  - /document-category/update
  - /document-category/delete
- Entity/table/dữ liệu liên quan:
  - Document
  - DocumentCategory
  - Classroom (để gắn tài liệu và kiểm soát quyền truy cập cho tài liệu PRO)
- Mức độ xác minh: Cao

# 2. Phân quyền và kiểm soát truy cập

- Frontend công khai: [web-ssstudy/src/app/tai-lieu/page.tsx](../../../../web-ssstudy/src/app/tai-lieu/page.tsx) và [web-ssstudy/src/app/tai-lieu/[id]/_components/DocumentDetailClient.tsx](../../../../web-ssstudy/src/app/tai-lieu/[id]/_components/DocumentDetailClient.tsx) gọi endpoint tài liệu công khai; UI không có logic riêng để kiểm tra PRO access trước khi gọi API, nên việc kiểm soát quyền chủ yếu phụ thuộc vào backend.
- Frontend admin: [web-admin/src/redux/document/action.js](../../../../web-admin/src/redux/document/action.js) gọi các endpoint CRUD cho document/document-category; không thấy logic riêng về role/permission trên UI ngoài việc dùng chung auth middleware của hệ thống.
- Backend công khai: [api-develop/app/routes/routes.js](../../../../api-develop/app/routes/routes.js) đánh dấu /document/show, /document/list-related, /document/list-public và /document-category/list-public là public route; các endpoint này có thể được gọi mà không cần token.
- Backend kiểm soát quyền: [api-develop/app/controllers/DocumentController.js](../../../../api-develop/app/controllers/DocumentController.js) kiểm tra `req.user` và `classroom.students` khi `document_type = PRO`. Nếu không thuộc classroom, hệ thống đặt `doc_link = null` và trả về thông báo không có quyền.
- Điều kiện classroom membership: `classroomId` lấy từ `rs.classroom.id`; backend gọi `ClassroomModel.findOne({ id: classroomId })` và kiểm tra `Array.isArray(classroom.students) && classroom.students.includes(req.user.id)`.
- Khả năng bypass: Không thấy bằng chứng cho bypass full quyền từ backend; endpoint public vẫn bị chặn ở server cho tài liệu PRO không thuộc lớp. Tuy nhiên route public và việc kiểm soát dựa trên `req.user`/`classroom.students` khiến rủi ro bảo mật và tính nhất quán auth cần được chú ý.
- Auth guard cho admin CRUD: [api-develop/app/routes/CheckToken.js](../../../../api-develop/app/routes/CheckToken.js) và [api-develop/app/routes/CheckScope.js](../../../../api-develop/app/routes/CheckScope.js) áp dụng cho các route không nằm trong publicRoutes; scope document/document_category được định nghĩa trong [api-develop/config/user_scopes.json](../../../../api-develop/config/user_scopes.json).

# 3. Actor và phân quyền

| Actor/Role | Permission | Chức năng được phép | Điều kiện truy cập | Bằng chứng source | Ghi chú |
|---|---|---|---|---|---|
| Guest / Public user | Xem tài liệu công khai | Duyệt danh sách tài liệu, xem tài liệu FREE, xem preview cho tài liệu có lock_type SIGN_IN | Không cần token cho route public | [api-develop/app/controllers/DocumentController.js](../../../../api-develop/app/controllers/DocumentController.js), [web-ssstudy/src/app/tai-lieu/page.tsx](../../../../web-ssstudy/src/app/tai-lieu/page.tsx) | Route list-public và show được dùng bởi public UI |
| STUDENT / authenticated user | Xem tài liệu có quyền | Xem tài liệu FREE, xem tài liệu PRO nếu là thành viên lớp học liên quan, xem preview nếu chưa đăng nhập và lock_type SIGN_IN | Backend kiểm tra req.user và classroom.students | [api-develop/app/controllers/DocumentController.js](../../../../api-develop/app/controllers/DocumentController.js) | Quyền truy cập PRO phụ thuộc vào classroom |
| ADMIN / TEACHER / MANAGER | Quản trị tài liệu và danh mục | CRUD tài liệu và danh mục, upload file, bật/tắt trạng thái, liên kết classroom | Frontend admin và controller CRUD | [web-admin/src/components/document/Document.js](../../../../web-admin/src/components/document/Document.js), [web-admin/src/components/document/DocumentCreate.js](../../../../web-admin/src/components/document/DocumentCreate.js), [web-admin/src/components/document/DocumentEdit.js](../../../../web-admin/src/components/document/DocumentEdit.js) | Mức độ quyền chi tiết được quản lý bởi auth middleware chung |

# 4. Danh sách chức năng

| Mã chức năng | Tên chức năng | Actor | Màn hình/Route | API | Controller/Service | Trạng thái xác minh |
|---|---|---|---|---|---|---|
| DOC-01 | Xem danh sách tài liệu công khai | Guest, STUDENT | /tai-lieu | /document/list-public | DocumentController.listPublic | Đã xác nhận |
| DOC-02 | Xem chi tiết tài liệu | Guest, STUDENT | /tai-lieu/[id] | /document/show, /document/detail | DocumentController.show, DocumentController.detail | Đã xác nhận |
| DOC-03 | Xem tài liệu liên quan | Guest, STUDENT | /tai-lieu/[id] | /document/list-related | DocumentController.listRelated | Đã xác nhận |
| DOC-04 | Quản lý danh mục tài liệu ở admin | Admin | /document-category | /document-category/list, /document-category/create, /document-category/update, /document-category/delete | DocumentCategoryController | Đã xác nhận |
| DOC-05 | Quản lý tài liệu ở admin | Admin | /document, /document/create, /document/:id/edit | /document/list, /document/create, /document/update, /document/delete | DocumentController | Đã xác nhận |
| DOC-06 | Upload và preview tài liệu | Guest, STUDENT, Admin | /tai-lieu/[id] | /document/show | DocumentController.show, UploadService | Đã xác nhận |

# 5. Đặc tả chi tiết từng chức năng

## DOC-01 Xem danh sách tài liệu công khai

### Mục đích
Cho phép người dùng duyệt danh sách tài liệu công khai, lọc theo danh mục, loại tài liệu và từ khóa tìm kiếm.

### Actor / quyền sử dụng
- Guest
- STUDENT

### Điều kiện trước
- Không bắt buộc đăng nhập.
- Chỉ hiển thị tài liệu có `deleted_at = null` và `status = true`.

### Điểm khởi đầu
- Route: /tai-lieu
- Màn hình: [web-ssstudy/src/app/tai-lieu/page.tsx](../../../../web-ssstudy/src/app/tai-lieu/page.tsx)
- Trigger: mở trang tài liệu, đổi bộ lọc, đổi trang

### Dữ liệu đầu vào

| Trường dữ liệu | Kiểu dữ liệu | Bắt buộc | Validation | Nguồn dữ liệu | Ghi chú |
|---|---|---|---|---|---|
| keyword | string | Không | Regex search trên alias | UI và request body | Dùng cho tìm kiếm tên tài liệu |
| main_category_id | string | Không | Filter theo main_category.id | UI và request body | |
| sub_category_id | string | Không | Filter theo sub_category.id | UI và request body | |
| document_type | string | Không | `FREE`/`PRO` | UI và request body | |
| page / limit | number | Không | Phân trang | UI và request body | |

### Luồng chính
1. Frontend gọi /document/list-public với bộ lọc và phân trang.
2. Backend DocumentController.listPublic xây dựng điều kiện `{ deleted_at: null, status: true }`.
3. Backend áp dụng filter theo danh mục và loại tài liệu, rồi trả về `records`, `totalRecord`, `perPage`.
4. Frontend render danh sách card và phân trang.

### Luồng thay thế / ngoại lệ
- Nếu không có dữ liệu, trả về danh sách rỗng và tổng bản ghi bằng 0.
- Nếu filter không hợp lệ hoặc không có giá trị, hệ thống bỏ qua filter đó.

### Validation và business rule
- Chỉ trả về tài liệu chưa bị xóa và đang bật trạng thái.
- Có sắp xếp mặc định theo `updated_at` giảm dần.
- Có hỗ trợ sort tùy chỉnh qua `sort_key` và `sort_value`.

### API liên quan

| Endpoint | Method | Request DTO/params | Response | Controller | Exception/lỗi có thể có |
|---|---|---|---|---|---|
| /document/list-public | POST | keyword, main_category_id, sub_category_id, document_type, page, limit | records, totalRecord, perPage | DocumentController.listPublic | Lỗi hệ thống chung |

### Bằng chứng từ source
- [api-develop/app/controllers/DocumentController.js](../../../../api-develop/app/controllers/DocumentController.js)
- [web-ssstudy/src/services/documentService.ts](../../../../web-ssstudy/src/services/documentService.ts)

## DOC-02 Xem chi tiết tài liệu

### Mục đích
Hiển thị chi tiết một tài liệu, bao gồm mô tả, metadata, liên kết file hoặc preview PDF, số lượt xem và thông tin liên quan.

### Actor / quyền sử dụng
- Guest
- STUDENT
- Admin (thông qua admin UI)

### Điều kiện trước
- ID tài liệu phải tồn tại.
- Nếu tài liệu là `PRO`, hệ thống phải kiểm tra người dùng có nằm trong classroom tương ứng hay không.

### Điểm khởi đầu
- Route: /tai-lieu/[id]
- Màn hình: [web-ssstudy/src/app/tai-lieu/[id]/_components/DocumentDetailClient.tsx](../../../../web-ssstudy/src/app/tai-lieu/[id]/_components/DocumentDetailClient.tsx)
- Trigger: click một tài liệu từ danh sách hoặc truy cập URL trực tiếp

### Dữ liệu đầu vào

| Trường dữ liệu | Kiểu dữ liệu | Bắt buộc | Validation | Nguồn dữ liệu | Ghi chú |
|---|---|---|---|---|---|
| id | string | Có | Không rỗng | URL param / request body | Dùng để tìm Document theo _id |
| req.user.id | string | Không | Từ auth middleware | Request context | Dùng cho kiểm tra quyền PRO |

### Luồng chính
1. Frontend gọi /document/show với id tài liệu.
2. Backend DocumentController.show tìm tài liệu theo `_id`.
3. Nếu tài liệu là `PRO`, backend lấy `classroom.id`, kiểm tra `classroom.students` và quyết định `in_class`.
4. Nếu chưa đủ quyền, hệ thống khóa `doc_link` và trả về thông tin tài liệu với trạng thái không cho xem nội dung đầy đủ.
5. Nếu tài liệu là `FREE` và `lock_type = SIGN_IN` nhưng chưa đăng nhập, backend tạo preview PDF thay cho link đầy đủ.
6. Backend tăng số lượt xem nếu người dùng đã đăng nhập và có quyền xem đầy đủ.
7. Frontend render nội dung, preview PDF và metadata.

### Luồng thay thế / ngoại lệ
- Nếu tài liệu không tồn tại, trả về thông báo "Tài liệu này không tồn tại!".
- Nếu tài liệu PRO chưa được phát hành hoặc không tìm thấy classroom, trả về lỗi "Tài liệu chưa phát hành!".
- Nếu không thuộc classroom, hàm trả về tài liệu nhưng `doc_link = null` và thông báo "Bạn không có quyền truy cập tài liệu này!".

### Validation và business rule
- `document_type` chỉ hỗ trợ `FREE` hoặc `PRO`.
- `doc_type` chỉ hỗ trợ `PDF` hoặc `GOOGLE_DRIVE`.
- `lock_type` chỉ hỗ trợ `FREE` hoặc `SIGN_IN`.
- Tài liệu PRO chỉ mở nội dung nếu người dùng có `req.user.id` nằm trong `classroom.students`.
- Nếu `FREE` và `lock_type = SIGN_IN` nhưng chưa đăng nhập, hệ thống tạo preview PDF từ 3 trang đầu.

### API liên quan

| Endpoint | Method | Request DTO/params | Response | Controller | Exception/lỗi có thể có |
|---|---|---|---|---|---|
| /document/show | POST | { id } | tài liệu đầy đủ/preview | DocumentController.show | Tài liệu không tồn tại, chưa phát hành, không có quyền |
| /document/detail | POST | { id } | tài liệu cơ bản | DocumentController.detail | Tài liệu không tồn tại |

### Bằng chứng từ source
- [api-develop/app/controllers/DocumentController.js](../../../../api-develop/app/controllers/DocumentController.js)
- [web-ssstudy/src/services/documentService.ts](../../../../web-ssstudy/src/services/documentService.ts)

## DOC-03 Xem tài liệu liên quan

### Mục đích
Hiển thị danh sách tài liệu liên quan dựa trên cùng danh mục hoặc cùng nhóm tài liệu.

### Actor / quyền sử dụng
- Guest
- STUDENT

### Điều kiện trước
- Tài liệu hiện tại phải tồn tại.
- Hệ thống dùng `main_category.id` hoặc `sub_category.id` từ tài liệu hiện tại để tìm tài liệu tương tự.

### Điểm khởi đầu
- Route: /tai-lieu/[id]
- Màn hình: [web-ssstudy/src/app/tai-lieu/[id]/_components/RelatedDocuments.tsx](../../../../web-ssstudy/src/app/tai-lieu/[id]/_components/RelatedDocuments.tsx)

### Luồng chính
1. Frontend gọi /document/list-related với document_id.
2. Backend lấy tài liệu hiện tại và xác định main/sub category.
3. Backend tìm các tài liệu khác trong cùng danh mục, loại trừ tài liệu hiện tại.
4. Frontend render danh sách tài liệu liên quan.

### Validation và business rule
- Nếu không có `main_category` hoặc `sub_category`, hệ thống không dùng filter này.
- Kết quả được phân trang và sắp xếp theo `updated_at` giảm dần.

### API liên quan

| Endpoint | Method | Request DTO/params | Response | Controller | Exception/lỗi có thể có |
|---|---|---|---|---|---|
| /document/list-related | POST | { document_id, main_category_id?, sub_category_id?, page?, limit? } | records, totalRecord, perPage | DocumentController.listRelated | Lỗi hệ thống chung |

## DOC-04 Quản lý danh mục tài liệu ở admin

### Mục đích
Cho phép admin tạo, chỉnh sửa, bật/tắt và xóa danh mục tài liệu, bao gồm cả danh sách sub-category.

### Actor / quyền sử dụng
- Admin

### Điều kiện trước
- Danh mục mới phải có tên.
- Không cho phép tạo danh mục trùng tên đang hoạt động.

### Điểm khởi đầu
- Route: /document-category, /document-category/create, /document-category/:id/edit
- Màn hình: [web-admin/src/components/document/DocumentCategory.js](../../../../web-admin/src/components/document/DocumentCategory.js), [web-admin/src/components/document/DocumentCategoryCreate.js](../../../../web-admin/src/components/document/DocumentCategoryCreate.js), [web-admin/src/components/document/DocumentCategoryEdit.js](../../../../web-admin/src/components/document/DocumentCategoryEdit.js)

### Dữ liệu đầu vào

| Trường dữ liệu | Kiểu dữ liệu | Bắt buộc | Validation | Nguồn dữ liệu | Ghi chú |
|---|---|---|---|---|---|
| name | string | Có | Không rỗng | Form admin | Tạo alias tự động |
| status | boolean | Không | Mặc định false | Switch trên UI | |
| ordering | string/number | Không | Số nguyên dương | Form admin | |
| sub_categories | array | Không | Mảng object | Form admin | |
| url | string | Không | Phải bắt đầu bằng https:// | Form admin | |

### Luồng chính
1. Admin nhập thông tin danh mục trên UI.
2. Frontend gửi payload tới /document-category/create hoặc /document-category/update.
3. Backend DocumentCategoryController tạo/ cập nhật bản ghi và lưu `alias`, `sub_categories`, `ordering`, `status`.
4. Hệ thống trả về dữ liệu đã lưu và admin thấy danh mục mới/đã chỉnh sửa.

### Luồng thay thế / ngoại lệ
- Nếu tên danh mục đã tồn tại, trả về lỗi "Danh mục đã tồn tại".
- Nếu đang có tài liệu đang dùng danh mục, hệ thống không cho xóa danh mục.

### Validation và business rule
- `alias` được tạo tự động từ tên bằng BaseHelper.seoURL.
- Danh mục bị xóa thực chất bằng soft delete.
- Xóa danh mục đang được sử dụng bị chặn.

### API liên quan

| Endpoint | Method | Request DTO/params | Response | Controller | Exception/lỗi có thể có |
|---|---|---|---|---|---|
| /document-category/list-public | POST | keyword, page, limit | records, totalRecord, perPage | DocumentCategoryController.listCategory | Lỗi hệ thống chung |
| /document-category/create | POST | name, status, ordering, url, sub_categories | document category | DocumentCategoryController.create | Danh mục đã tồn tại |
| /document-category/update | POST | id, name, status, ordering, url, sub_categories | document category | DocumentCategoryController.update | Request invalid |
| /document-category/delete | POST | ids | success | DocumentCategoryController.delete | Không thể xóa danh mục đang dùng |

## DOC-05 Quản lý tài liệu ở admin

### Mục đích
Cho phép admin quản lý tài liệu: tạo mới, sửa, bật/tắt trạng thái, upload file, gắn classroom và gán metadata phân loại.

### Actor / quyền sử dụng
- Admin

### Điều kiện trước
- Tên tài liệu là bắt buộc.
- Nếu chọn `doc_type = PDF`, phải upload file tài liệu hoặc cung cấp link file.
- Nếu chọn `doc_type = GOOGLE_DRIVE`, phải kiểm tra link có đúng định dạng Google Drive.

### Điểm khởi đầu
- Route: /document, /document/create, /document/:id/edit
- Màn hình: [web-admin/src/components/document/Document.js](../../../../web-admin/src/components/document/Document.js), [web-admin/src/components/document/DocumentCreate.js](../../../../web-admin/src/components/document/DocumentCreate.js), [web-admin/src/components/document/DocumentEdit.js](../../../../web-admin/src/components/document/DocumentEdit.js)

### Dữ liệu đầu vào

| Trường dữ liệu | Kiểu dữ liệu | Bắt buộc | Validation | Nguồn dữ liệu | Ghi chú |
|---|---|---|---|---|---|
| name | string | Có | Không rỗng | Form admin | |
| main_category / sub_category | object | Có | Phải chọn danh mục cha/con | Form admin | |
| document_type | string | Không | `FREE`/`PRO` | Form admin | |
| lock_type | string | Không | `FREE`/`SIGN_IN` | Form admin | |
| doc_type | string | Không | `PDF`/`GOOGLE_DRIVE` | Form admin | |
| doc_link | string/file | Có cho PDF hoặc Google Drive | File upload hoặc URL | Form admin | |
| classroom_id | string | Không | Tìm classroom theo _id | Form admin | Dùng cho tài liệu PRO |
| teacher | string | Không | Text | Form admin | |
| description / description_file | string/file | Không | HTML/text hoặc file đính kèm | Form admin | |

### Luồng chính
1. Admin nhập metadata và lựa chọn file/đường dẫn tài liệu.
2. Frontend gửi payload tới /document/create hoặc /document/update.
3. Backend DocumentController tạo hoặc cập nhật bản ghi, upload file nếu có, lưu metadata và classroom mapping.
4. Hệ thống trả về tài liệu đã lưu và admin thấy kết quả trên list screen.

### Luồng thay thế / ngoại lệ
- Link Google Drive không hợp lệ: báo lỗi "Link tài liệu không đúng định dạng Google Drive".
- Upload file thất bại: trả về lỗi "Không thể tải được FILE".
- ID tài liệu không tồn tại: trả về lỗi "Không tồn tại tài liệu này".

### Validation và business rule
- `doc_link` và `description_file` có thể được upload qua `UploadService`.
- Tài liệu PDF được lưu bằng URL public của file domain.
- Tài liệu tạo/sửa có `alias` tự động từ tên bằng `BaseHelper.seoURL`.
- Xóa tài liệu được thực hiện bằng soft delete.

### API liên quan

| Endpoint | Method | Request DTO/params | Response | Controller | Exception/lỗi có thể có |
|---|---|---|---|---|---|
| /document/list | POST | keyword, main_category_id, sub_category_id, document_type, page, limit | records, totalRecord, perPage | DocumentController.list | Lỗi hệ thống chung |
| /document/create | POST | payload/form-data | document | DocumentController.create | Tên tài liệu trống, file upload lỗi |
| /document/update | POST | payload/form-data | document | DocumentController.update | Request invalid, file upload lỗi |
| /document/delete | POST | ids | success | DocumentController.delete | Request invalid |

## DOC-06 Upload và preview tài liệu

### Mục đích
Cho phép hệ thống lưu tài liệu đính kèm và hiển thị preview PDF cho người dùng chưa đủ điều kiện xem toàn bộ tài liệu.

### Actor / quyền sử dụng
- Guest
- STUDENT
- Admin

### Điều kiện trước
- File PDF hoặc Google Drive link phải có sẵn.
- Nếu file PDF được upload, backend dùng `UploadService` để lưu và tạo đường dẫn công khai.

### Điểm khởi đầu
- Route: /tai-lieu/[id]
- Màn hình: [web-ssstudy/src/app/tai-lieu/[id]/_components/DocumentDetailClient.tsx](../../../../web-ssstudy/src/app/tai-lieu/[id]/_components/DocumentDetailClient.tsx)

### Luồng chính
1. Admin upload file PDF cho tài liệu.
2. Backend lưu file qua `UploadService` vào thư mục `documents`.
3. Khi người dùng mở chi tiết tài liệu, backend tạo preview PDF gồm tối đa 3 trang đầu nếu cần thiết.
4. Frontend render preview PDF trong trình xem nội bộ.

### Luồng thay thế / ngoại lệ
- Nếu file PDF không thể xử lý, hệ thống trả lỗi upload chung.
- Nếu không có file hoặc link hợp lệ, tài liệu có thể không hiển thị được nội dung.

### Validation và business rule
- Preview được tạo chỉ khi tài liệu là PDF và người dùng không đủ quyền xem toàn bộ nội dung.
- Preview dùng `pdf-lib` để sao chép 3 trang đầu.
- `doc_link` sẽ bị đặt thành `null` trong response khi chỉ dùng preview.

### API liên quan

| Endpoint | Method | Request DTO/params | Response | Controller | Exception/lỗi có thể có |
|---|---|---|---|---|---|
| /document/show | POST | { id } | preview_pdf, number_of_pages, doc_link | DocumentController.show | File không hợp lệ, upload lỗi |

### [CẦN XÁC NHẬN]
- Không thấy logic ghi nhận lượt download riêng tách khỏi lượt xem; hiện tại code chỉ tăng `viewed` khi mở nội dung tài liệu.
- Không thấy logic xóa/cleanup file cũ hoặc file orphan sau update/delete; [api-develop/app/services/UploadService.js](../../../../api-develop/app/services/UploadService.js) chỉ upload file mới và không có thao tác xóa file cũ.
- Không thấy whitelist MIME type/extension rõ ràng ở backend; kiểm soát chủ yếu dựa trên multer và tên file được gửi lên.

### [RỦI RO / TECHNICAL DEBT]
- Route /document/show nằm trong publicRoutes, nên public UI và API caller có thể gọi endpoint mà không cần token; quyền PRO vẫn được kiểm soát ở server nhưng phụ thuộc vào `req.user` và `classroom.students`.
- Public UI dùng localStorage để truyền token cho service; cần kiểm tra tính nhất quán giữa môi trường API và auth header khi gọi endpoint công khai/private.
- Không thấy bằng chứng về giới hạn dung lượng/loại file ở business layer; chỉ có cấu hình multer giới hạn 50MB cho field/file size.

# 6. Kịch bản kiểm thử

| Mã kịch bản | Bối cảnh | Kết quả kỳ vọng | Bằng chứng source |
|---|---|---|---|
| TC-DOC-01 | Guest mở /tai-lieu | Chỉ thấy tài liệu `status=true`, `deleted_at=null`, và không cần token | [api-develop/app/controllers/DocumentController.js](../../../../api-develop/app/controllers/DocumentController.js), [web-ssstudy/src/app/tai-lieu/page.tsx](../../../../web-ssstudy/src/app/tai-lieu/page.tsx) |
| TC-DOC-02 | Guest mở tài liệu PRO chưa thuộc classroom | API trả về tài liệu nhưng `doc_link=null` và thông báo không có quyền | [api-develop/app/controllers/DocumentController.js](../../../../api-develop/app/controllers/DocumentController.js) |
| TC-DOC-03 | Student đã thuộc classroom mở tài liệu PRO | API trả về đầy đủ `doc_link`/preview và tăng `viewed` | [api-develop/app/controllers/DocumentController.js](../../../../api-develop/app/controllers/DocumentController.js) |
| TC-DOC-04 | Admin tạo tài liệu PDF | File được upload qua UploadService và lưu vào storage/file domain | [api-develop/app/controllers/DocumentController.js](../../../../api-develop/app/controllers/DocumentController.js), [api-develop/app/services/UploadService.js](../../../../api-develop/app/services/UploadService.js) |
| TC-DOC-05 | Admin tạo/sửa tài liệu Google Drive | Backend validate link có chứa `google.com` | [api-develop/app/controllers/DocumentController.js](../../../../api-develop/app/controllers/DocumentController.js) |
| TC-DOC-06 | Admin xóa danh mục đang được dùng | Backend chặn thao tác xóa và trả lỗi | [api-develop/app/controllers/DocumentCategoryController.js](../../../../api-develop/app/controllers/DocumentCategoryController.js) |
| TC-DOC-07 | Admin CRUD danh mục/tài liệu | API tạo/sửa/xóa/list/detail hoạt động và soft-delete được áp dụng | [api-develop/app/controllers/DocumentController.js](../../../../api-develop/app/controllers/DocumentController.js), [api-develop/app/controllers/DocumentCategoryController.js](../../../../api-develop/app/controllers/DocumentCategoryController.js) |

# 7. Mối liên hệ với module khác

| Module liên quan | Loại quan hệ | Bằng chứng source | Ghi chú |
|---|---|---|---|
| Authentication | Tài liệu public/private cần token và user context | [api-develop/app/controllers/DocumentController.js](../../../../api-develop/app/controllers/DocumentController.js), [web-ssstudy/src/services/documentService.ts](../../../../web-ssstudy/src/services/documentService.ts) | Để kiểm tra login và quyền truy cập |
| Classroom | Tài liệu PRO liên kết với classroom và kiểm tra thành viên | [api-develop/app/controllers/DocumentController.js](../../../../api-develop/app/controllers/DocumentController.js), [api-develop/app/models/Document.js](../../../../api-develop/app/models/Document.js) | Quyền xem PRO dựa vào classroom.students |
| Admin management | CRUD và upload file được thực hiện qua admin UI | [web-admin/src/components/document/DocumentCreate.js](../../../../web-admin/src/components/document/DocumentCreate.js), [web-admin/src/components/document/DocumentEdit.js](../../../../web-admin/src/components/document/DocumentEdit.js) | Module này có giao diện quản trị riêng |
