# Kế hoạch đặc tả module

## 1. Danh sách module cần đặc tả

| STT | Module | Mục tiêu nghiệp vụ | Source liên quan | Màn hình Admin | Màn hình Web SSStudy | API chính | Entity/Table chính | Phụ thuộc module khác | Mức độ xác minh | Độ ưu tiên đặc tả |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Authentication / tài khoản / phân quyền | Xác thực người dùng, phân quyền truy cập, quản lý hồ sơ và mật khẩu | [api-develop/app/controllers/AuthController.js](../../../../api-develop/app/controllers/AuthController.js), [api-develop/app/controllers/UserController.js](../../../../api-develop/app/controllers/UserController.js), [api-develop/app/routes/CheckToken.js](../../../../api-develop/app/routes/CheckToken.js), [api-develop/app/routes/CheckScope.js](../../../../api-develop/app/routes/CheckScope.js), [api-develop/config/user_scopes.json](../../../../api-develop/config/user_scopes.json), [web-admin/src/redux/auth/action.js](../../../../web-admin/src/redux/auth/action.js), [web-admin/src/routing/PrivateRoute.js](../../../../web-admin/src/routing/PrivateRoute.js), [web-ssstudy/src/services/authService.ts](../../../../web-ssstudy/src/services/authService.ts), [web-ssstudy/src/app/auth/signin/page.tsx](../../../../web-ssstudy/src/app/auth/signin/page.tsx) | /login, /profile, /changepassword | /auth/signin, /auth/signup, /auth/forgot-password, /account/change-password | /auth/signin, /auth/signup, /auth/google-auth, /forgot-password, /user/profile, /user/update-profile, /user/change-password | User | Có phụ thuộc tới hầu hết module khác vì các API khác đều cần token và scope | Cao | Cao |
| 2 | Classroom / khóa học | Quản lý lớp học và khóa học, hiển thị danh sách/chi tiết cho người dùng và admin | [api-develop/app/controllers/ClassroomController.js](../../../../api-develop/app/controllers/ClassroomController.js), [web-admin/src/components/Master.js](../../../../web-admin/src/components/Master.js), [web-ssstudy/src/app/khoa-hoc](../../../../web-ssstudy/src/app/khoa-hoc) | /classroom-online, /classroom-offline, /classroom/group, /classroom/:id/report, /classroom/:id/member | /khoa-hoc, /khoa-hoc/[id] | /classroom-list, /classroom-view, /classroom-group-list, /classroom-reviews, /classroom-chapter-category | Classroom, ClassroomGroup, ClassroomReview | Phụ thuộc vào Authentication | Cao | Cao |
| 3 | Document / tài liệu | Quản lý tài liệu, danh mục tài liệu và hiển thị nội dung cho người dùng | [api-develop/app/controllers/DocumentController.js](../../../../api-develop/app/controllers/DocumentController.js), [web-admin/src/components/Master.js](../../../../web-admin/src/components/Master.js), [web-ssstudy/src/app/tai-lieu](../../../../web-ssstudy/src/app/tai-lieu) | /document, /document-category | /tai-lieu, /tai-lieu/[id] | /document/list-public, /document/detail, /document/show | Document, DocumentCategory | Phụ thuộc vào Authentication và Classroom | Cao | Trung bình |
| 4 | Exam / testing | Quản lý đề thi, câu hỏi và kết quả làm bài | [api-develop/app/controllers/ExamWordController.js](../../../../api-develop/app/controllers/ExamWordController.js), [web-ssstudy/src/app/thi-thu](../../../../web-ssstudy/src/app/thi-thu) | /exam, /exam-word, /testing, /question | /thi-thu, /thi-thu/word-exam/[id], /thi-thu/result/[id] | /exam-word/list, /exam-word/get-by-id, /exam-word/scoring, /testing/* | ExamWord, QuestionWord, Testing | Phụ thuộc vào Authentication và Classroom | Cao | Trung bình |
| 5 | Order / cart / payment | Quản lý giỏ hàng, đơn hàng, thanh toán và lịch sử giao dịch | [api-develop/app/controllers/OrderController.js](../../../../api-develop/app/controllers/OrderController.js), [api-develop/app/controllers/CartController.js](../../../../api-develop/app/controllers/CartController.js), [web-ssstudy/src/app/gio-hang/page.tsx](../../../../web-ssstudy/src/app/gio-hang/page.tsx), [web-ssstudy/src/app/account/order-history/page.tsx](../../../../web-ssstudy/src/app/account/order-history/page.tsx) | /order, /credit, /coupon | /gio-hang, /thanh-toan/[id], /account/order-history | /cart/*, /order/*, /credit/* | Order, Cart, CreditLog | Phụ thuộc vào Authentication và Classroom | Cao | Trung bình |
| 6 | Content pages / blog / configuration | Quản lý blog, trang nội dung, giới thiệu, giáo viên và cấu hình website | [api-develop/app/controllers/BlogController.js](../../../../api-develop/app/controllers/BlogController.js), [api-develop/app/controllers/AboutController.js](../../../../api-develop/app/controllers/AboutController.js), [api-develop/app/controllers/PageController.js](../../../../api-develop/app/controllers/PageController.js), [api-develop/app/controllers/CeoPageController.js](../../../../api-develop/app/controllers/CeoPageController.js), [api-develop/app/controllers/TeachersTeamController.js](../../../../api-develop/app/controllers/TeachersTeamController.js), [web-ssstudy/src/app/tin-tuc/[alias]/[slug]/page.tsx](../../../../web-ssstudy/src/app/tin-tuc/[alias]/[slug]/page.tsx), [web-ssstudy/src/app/(gioi-thieu)/ve-chung-toi/_components/MySelfIntroPageClient.tsx](../../../../web-ssstudy/src/app/(gioi-thieu)/ve-chung-toi/_components/MySelfIntroPageClient.tsx), [web-ssstudy/src/app/giao-vien/TeacherIntro.tsx](../../../../web-ssstudy/src/app/giao-vien/TeacherIntro.tsx) | /blog, /blog-category, /settings, /teachers-team, /admin-ceo | /ban-tin, /tin-tuc/[alias]/[slug], /gioi-thieu, /giao-vien | /blog/*, /blog-category/*, /about/*, /page/*, /ceo-page/*, /teachers-team/* | BlogPost, BlogCategory, Page, CeoPage, TeachersTeam | Phụ thuộc vào Authentication | Trung bình | Cao |
| 7 | Book / book-id / course bundle | Quản lý sách và mã sách liên quan tới khóa học | [api-develop/app/controllers/BookController.js](../../../../api-develop/app/controllers/BookController.js), [api-develop/app/controllers/BookIdController.js](../../../../api-develop/app/controllers/BookIdController.js), [api-develop/app/controllers/BookIdCourseController.js](../../../../api-develop/app/controllers/BookIdCourseController.js), [web-ssstudy/src/app/sach/page.tsx](../../../../web-ssstudy/src/app/sach/page.tsx), [web-ssstudy/src/app/sach-id/page.tsx](../../../../web-ssstudy/src/app/sach-id/page.tsx), [web-ssstudy/src/app/account/my-course/MyCourseForm.tsx](../../../../web-ssstudy/src/app/account/my-course/MyCourseForm.tsx) | /book, /book-id, /book-id-course | /sach, /sach-id, /account/my-course | /book/*, /book-id/*, /book-id-course/* | Book, BookId, BookIdCourse, StudentBookId | Phụ thuộc vào Authentication, Classroom | Trung bình | Cao |
| 8 | Import/export / báo cáo / tích hợp / scheduler | Các endpoint phụ trợ về report, link payment, bill, iframe, message, action log và label | [api-develop/app/routes/routes.js](../../../../api-develop/app/routes/routes.js), [api-develop/app/controllers/ReportBugController.js](../../../../api-develop/app/controllers/ReportBugController.js), [api-develop/app/controllers/LinkPaymentsController.js](../../../../api-develop/app/controllers/LinkPaymentsController.js), [api-develop/app/controllers/BillController.js](../../../../api-develop/app/controllers/BillController.js), [api-develop/app/controllers/MessageController.js](../../../../api-develop/app/controllers/MessageController.js), [api-develop/app/controllers/IframeController.js](../../../../api-develop/app/controllers/IframeController.js), [api-develop/app/controllers/ActionLogController.js](../../../../api-develop/app/controllers/ActionLogController.js), [api-develop/app/controllers/LabelController.js](../../../../api-develop/app/controllers/LabelController.js) | /report-bug, /bill, /quick-payments, /iframe, /message | [CẦN XÁC NHẬN] | /report-bug/*, /link-payment/*, /bill/*, /message/*, /iframe/*, /action-log/*, /label/* | ReportBug, LinkPayments, Billing, Message, Iframe, ActionLog, Label | Phụ thuộc vào nhiều module nghiệp vụ và chưa có đủ bằng chứng để tạo module độc lập | Thấp | Thấp |

## 2. Thứ tự đặc tả đề xuất

1. Authentication / tài khoản / phân quyền
   - Lý do ưu tiên: đây là nền tảng cho toàn bộ hệ thống. Tất cả route bảo vệ và nhiều module nghiệp vụ đều phụ thuộc vào token và scope.
   - Bằng chứng rõ ràng: [api-develop/app/routes/routes.js](../../../../api-develop/app/routes/routes.js), [api-develop/app/routes/CheckToken.js](../../../../api-develop/app/routes/CheckToken.js), [api-develop/app/routes/CheckScope.js](../../../../api-develop/app/routes/CheckScope.js), [api-develop/config/user_scopes.json](../../../../api-develop/config/user_scopes.json).

2. Classroom / khóa học
   - Lý do ưu tiên: có nhiều màn hình admin và web-user, nhiều API phụ thuộc và là module trung tâm trong hệ thống học tập.

3. Document / tài liệu
   - Lý do ưu tiên: có cả UI công khai và admin quản trị, và có nhiều route public/private tương đồng với classroom.

4. Exam / testing
   - Lý do ưu tiên: có luồng riêng, liên quan tới dữ liệu câu hỏi và kết quả bài làm, có nhiều API rõ ràng.

5. Order / cart / payment
   - Lý do ưu tiên: có flow nghiệp vụ có tính chất giao dịch và tích hợp ngoài như PayOS.

6. Blog / content pages / configuration
   - Lý do ưu tiên: có cấu hình website và nội dung tĩnh, nhưng mức độ phụ thuộc và độ phức tạp nghiệp vụ lower hơn các module giao dịch và học tập.

7. Book / book-id / course bundle
   - Lý do ưu tiên: có nhiều route nhưng phụ thuộc nhiều vào classroom và content.

8. Import/export / báo cáo / tích hợp / scheduler
   - Lý do ưu tiên: là module phụ trợ và có phần chưa được ánh xạ đầy đủ qua UI trong phạm vi hiện tại.

## 3. Trạng thái thực hiện module

- Authentication / tài khoản / phân quyền — Hoàn thành
- Classroom / khóa học — Hoàn thành
- Document / tài liệu — Hoàn thành
- Exam / testing — Hoàn thành
- Order / cart / payment — Hoàn thành
- Content pages / blog / configuration — Hoàn thành
- Book / book-id / course bundle — Hoàn thành
- Import/export / báo cáo / tích hợp / scheduler — Cần xác nhận thêm vì chỉ có bằng chứng một phần và chưa đủ để lập module độc lập đầy đủ

### Chi tiết cho Document / tài liệu
- File đã tạo: [docs/01-srs/modules/03-document-tai-lieu.md](../modules/03-document-tai-lieu.md)
- Các source đã đối chiếu: [api-develop/app/controllers/DocumentController.js](../../../../api-develop/app/controllers/DocumentController.js), [api-develop/app/controllers/DocumentCategoryController.js](../../../../api-develop/app/controllers/DocumentCategoryController.js), [api-develop/app/services/UploadService.js](../../../../api-develop/app/services/UploadService.js), [web-admin/src/components/document/Document.js](../../../../web-admin/src/components/document/Document.js), [web-admin/src/components/document/DocumentCreate.js](../../../../web-admin/src/components/document/DocumentCreate.js), [web-admin/src/components/document/DocumentEdit.js](../../../../web-admin/src/components/document/DocumentEdit.js), [web-admin/src/components/document/DocumentCategory.js](../../../../web-admin/src/components/document/DocumentCategory.js), [web-ssstudy/src/app/tai-lieu/page.tsx](../../../../web-ssstudy/src/app/tai-lieu/page.tsx), [web-ssstudy/src/app/tai-lieu/[id]/_components/DocumentDetailClient.tsx](../../../../web-ssstudy/src/app/tai-lieu/[id]/_components/DocumentDetailClient.tsx)
- Các phần đã bổ sung sau kiểm tra thực chất: phân quyền public/PRO, kiểm soát classroom membership, kịch bản kiểm thử, rủi ro và câu hỏi cần xác nhận.

## 4. Module tiếp theo
- Tên module: Exam / testing
- Lý do chọn:
  - Có bằng chứng rõ ràng từ backend, admin frontend và public frontend.
  - Có luồng riêng về câu hỏi, bài thi và kết quả làm bài.
  - Có thể đặc tả bằng các file hiện có mà không cần suy đoán nhiều.
- Source sẽ đối chiếu tiếp:
  - [api-develop/app/controllers/ExamWordController.js](../../../../api-develop/app/controllers/ExamWordController.js)
  - [api-develop/app/controllers/TestingController.js](../../../../api-develop/app/controllers/TestingController.js)
  - [web-ssstudy/src/app/thi-thu](../../../../web-ssstudy/src/app/thi-thu)
- Lý do chọn:
  - Có bằng chứng rõ ràng từ backend, admin frontend và user frontend.
  - Là module nền tảng cho nhiều route và nhiều permission guard.
  - Có thể đặc tả bằng chính các file hiện có mà không cần suy đoán nghiệp vụ bên ngoài.
- Các source sẽ đọc sâu:
  - [api-develop/app/controllers/AuthController.js](../../../../api-develop/app/controllers/AuthController.js)
  - [api-develop/app/controllers/UserController.js](../../../../api-develop/app/controllers/UserController.js)
  - [api-develop/app/routes/routes.js](../../../../api-develop/app/routes/routes.js)
  - [api-develop/app/routes/CheckToken.js](../../../../api-develop/app/routes/CheckToken.js)
  - [api-develop/app/routes/CheckScope.js](../../../../api-develop/app/routes/CheckScope.js)
  - [api-develop/config/app.js](../../../../api-develop/config/app.js)
  - [api-develop/config/user_scopes.json](../../../../api-develop/config/user_scopes.json)
  - [api-develop/app/models/User.js](../../../../api-develop/app/models/User.js)
  - [web-admin/src/redux/auth/action.js](../../../../web-admin/src/redux/auth/action.js)
  - [web-admin/src/routing/PrivateRoute.js](../../../../web-admin/src/routing/PrivateRoute.js)
  - [web-admin/src/components/Master.js](../../../../web-admin/src/components/Master.js)
  - [web-ssstudy/src/services/authService.ts](../../../../web-ssstudy/src/services/authService.ts)
  - [web-ssstudy/src/app/auth/signin/page.tsx](../../../../web-ssstudy/src/app/auth/signin/page.tsx)
- Các màn hình, API và entity dự kiến được đối chiếu:
  - Màn hình: /login, /auth/signin, /auth/signup, /auth/forgot-password, /account/change-password, /profile
  - API: /auth/signin, /auth/signup, /auth/google-auth, /forgot-password, /user/profile, /user/update-profile, /user/change-password
  - Entity: User
- Các phần có nguy cơ cần xác nhận:
  - Chi tiết scope cho role STUDENT và các role phụ trợ chưa được nêu đầy đủ.
  - Luồng logout và session invalidation chưa được thấy đầy đủ ở backend.
  - Việc lưu token ở cookie/localStorage ở frontend có thể tạo rủi ro bảo mật và cần kiểm tra lại trong môi trường vận hành.

## 4. Module sẽ đặc tả tiếp theo
- Tên module: Classroom / khóa học
- Lý do chọn:
  - Có đầy đủ bằng chứng từ backend, admin frontend và user frontend.
  - Là module trung tâm trong hệ thống học tập và có nhiều API và màn hình liên quan.
  - Có thể đặc tả bằng các file hiện có mà không cần suy đoán nhiều.
- File đã tạo:
  - [docs/01-srs/modules/02-classroom-khoa-hoc.md](../modules/02-classroom-khoa-hoc.md)
- Các source sẽ đối chiếu tiếp:
  - [api-develop/app/controllers/ClassroomController.js](../../../../api-develop/app/controllers/ClassroomController.js)
  - [web-admin/src/components/classroom/Classroom.js](../../../../web-admin/src/components/classroom/Classroom.js)
  - [web-admin/src/components/classroom/ClassroomEdit.js](../../../../web-admin/src/components/classroom/ClassroomEdit.js)
  - [web-admin/src/components/classroom/ClassroomMember.js](../../../../web-admin/src/components/classroom/ClassroomMember.js)
  - [web-ssstudy/src/app/khoa-hoc/_components/CourseContent.tsx](../../../../web-ssstudy/src/app/khoa-hoc/_components/CourseContent.tsx)
  - [web-ssstudy/src/app/khoa-hoc/_components/CourseDetailClient.tsx](../../../../web-ssstudy/src/app/khoa-hoc/_components/CourseDetailClient.tsx)

## 5. Module đã hoàn thành sau khi rà soát
- Tên module: Order / cart / payment
- File đã tạo: [docs/01-srs/modules/05-order-cart-payment.md](../modules/05-order-cart-payment.md)
- File phân tích coverage: [docs/02-analysis/coverage-gap-analysis.md](../../02-analysis/coverage-gap-analysis.md)
- File ma trận truy vết: [docs/02-analysis/traceability-matrix.md](../../02-analysis/traceability-matrix.md)
- File câu hỏi/rủi ro: [docs/02-analysis/open-questions-and-risks.md](../../02-analysis/open-questions-and-risks.md)
- Các nguồn đã đối chiếu: [api-develop/app/controllers/CartController.js](../../../../api-develop/app/controllers/CartController.js), [api-develop/app/controllers/OrderController.js](../../../../api-develop/app/controllers/OrderController.js), [api-develop/app/controllers/CreditController.js](../../../../api-develop/app/controllers/CreditController.js), [api-develop/app/routes/routes.js](../../../../api-develop/app/routes/routes.js), [web-ssstudy/src/app/gio-hang/page.tsx](../../../../web-ssstudy/src/app/gio-hang/page.tsx), [web-ssstudy/src/app/gio-hang/thanh-toan/page.tsx](../../../../web-ssstudy/src/app/gio-hang/thanh-toan/page.tsx), [web-ssstudy/src/app/account/order-history/page.tsx](../../../../web-ssstudy/src/app/account/order-history/page.tsx), [web-ssstudy/src/app/account/credit-history/CreditHistoryClient.tsx](../../../../web-ssstudy/src/app/account/credit-history/CreditHistoryClient.tsx), [web-admin/src/components/order/Order.js](../../../../web-admin/src/components/order/Order.js), [web-admin/src/components/credit/Credit.js](../../../../web-admin/src/components/credit/Credit.js), [web-admin/src/components/coupon/Coupon.js](../../../../web-admin/src/components/coupon/Coupon.js)
- Ghi chú: module này có bằng chứng thực thi mạnh ở cả backend và frontend, nhưng các rule coupon chi tiết và callback PayOS cần xác nhận thêm trong môi trường vận hành.
