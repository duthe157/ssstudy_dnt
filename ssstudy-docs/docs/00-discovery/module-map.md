# Module Map

## 1. Phân hệ nghiệp vụ chính

| Phân hệ | Backend module | Màn hình admin liên quan | Màn hình người dùng liên quan | API chính liên quan | Mức độ xác định |
|---|---|---|---|---|---|
| Authentication | AuthController, UserService | /login, /profile, /changepassword | /auth/signin, /auth/signup, /auth/forgot-password | /auth/signin, /auth/signup, /forgot-password | Đã xác nhận |
| Quản lý người dùng | UserController, UserService | /student, /admin | /account/* | /user/view, /user/profile, /user/update-profile | Đã xác nhận |
| Quản lý lớp học | ClassroomController, ClassroomService | /classroom-online, /classroom-offline, /classroom/group | /khoa-hoc, /sach-id/... | /classroom-list, /classroom-group-list, /classroom-view | Đã xác nhận |
| Quản lý bài học/chương mục | ChapterController, CategoryController | /chapter, /lesson | [CẦN XÁC NHẬN] | /chapter/list, /category/list | Đã xác nhận |
| Tài liệu | DocumentController | /document, /document-category | /tai-lieu | /document/list-public, /document/detail | Đã xác nhận |
| Đề thi và bài kiểm tra | ExamController, ExamWordController, TestingController | /exam, /exam-word, /testing | /thi-thu | /exam/*, /exam-word/*, /testing/* | Đã xác nhận |
| Câu hỏi | QuestionController, QuestionWordController | /question | [CẦN XÁC NHẬN] | /question/*, /question-word/* | Đã xác nhận |
| Sách và khóa học | BookController, BookIdController, BookIdCourseController | /book, /book-id, /book-id-course | /sach, /sach-id, /khoa-hoc | /book/*, /book-id/*, /book-id-course/* | Đã xác nhận |
| Thanh toán và đơn hàng | OrderController, CreditController, CartController | /order, /credit, /coupon | /gio-hang, /thanh-toan | /order/*, /credit/*, /cart/* | Đã xác nhận |
| Blog và nội dung tĩnh | BlogController, BlogCategoryController, AboutController, PageController | /blog, /blog-category, /settings | /ban-tin, /tin-tuc, /gioi-thieu | /blog/*, /blog-category/*, /about/*, /page/* | Đã xác nhận |
| Đánh giá và phản hồi | ReviewController, ReportBugController | /classroom/review, /report-bug | [CẦN XÁC NHẬN] | /review/*, /report-bug/* | Đã xác nhận |
| Cấu hình hệ thống | SettingController, CeoPageController, TeachersTeamController, LabelController | /settings, /teachers-team, /admin-ceo, /label | /giao-vien, /gioi-thieu | /setting/*, /ceo-page/*, /teachers-team/*, /label/* | Đã xác nhận |
