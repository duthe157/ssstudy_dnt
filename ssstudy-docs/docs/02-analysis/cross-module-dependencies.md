# Cross-module dependencies

## Module: Exam / testing

### Phụ thuộc đầu vào
- Authentication: các luồng làm bài, xem kết quả và admin CRUD đều cần user context; route admin và các endpoint bảo vệ qua auth middleware và scope guard.
- Classroom: một số luồng testing và exam có liên kết với classroom/subject/chapter/category; bài kiểm tra có thể được gắn vào classroom hoặc dùng để đánh giá học sinh trong lớp.
- Document / tài liệu: không trực tiếp phụ thuộc, nhưng có thể cùng phục vụ cho nội dung học tập và trải nghiệm học viên trên cùng trang web.

### Phụ thuộc đầu ra
- Exam / testing cung cấp kết quả làm bài, câu hỏi và báo cáo điểm cho học viên và admin; các module khác có thể dùng kết quả này cho classroom, report, và dashboard sau này.
- ExamWord và QuestionWord trở thành tài nguyên chung cho trải nghiệm thi thử và nội dung ôn tập.

### Mapping dependency
- Authentication -> Exam / testing: [api-develop/app/controllers/ExamWordController.js](../../../../api-develop/app/controllers/ExamWordController.js) lấy `req.user.user_id` để lưu `ScoreWordHistory`; [api-develop/app/routes/CheckToken.js](../../../../api-develop/app/routes/CheckToken.js) và [api-develop/app/routes/CheckScope.js](../../../../api-develop/app/routes/CheckScope.js) bảo vệ các endpoint admin CRUD.
- Classroom -> Exam / testing: [api-develop/app/controllers/TestingController.js](../../../../api-develop/app/controllers/TestingController.js) và [api-develop/app/controllers/ExamController.js](../../../../api-develop/app/controllers/ExamController.js) dùng classroom, chapter, category và subject để điều hướng testing và exam.
- Exam / testing -> Public UI: [web-ssstudy/src/app/thi-thu/page.tsx](../../../../web-ssstudy/src/app/thi-thu/page.tsx), [web-ssstudy/src/app/thi-thu/word-exam/[id]/page.tsx](../../../../web-ssstudy/src/app/thi-thu/word-exam/[id]/page.tsx) và [web-ssstudy/src/app/thi-thu/result/[id]/page.tsx](../../../../web-ssstudy/src/app/thi-thu/result/[id]/page.tsx) render luồng làm bài và xem kết quả.
- Exam / testing -> Admin UI: [web-admin/src/components/exam-word/ExamList.js](../../../../web-admin/src/components/exam-word/ExamList.js), [web-admin/src/components/testing/Testing.js](../../../../web-admin/src/components/testing/Testing.js) và [web-admin/src/components/question/Question.js](../../../../web-admin/src/components/question/Question.js) dùng chung backend endpoints để quản trị nội dung và điểm số.

### Route/API/entity/permission evidence
- Public route: /exam-word/list, /exam-word/list-practice, /exam-word/get-by-id, /exam-word/check-password, /exam-word/check-answer, /exam-word/scoring, /exam-word/explanation.
- Admin route: /exam-word/create, /exam-word/update, /exam-word/delete, /exam-word/report, /question-word/create, /question-word/update, /question-word/delete, /testing/list, /testing/result, /testing/detail, /testing/create, /testing/update-point, /testing/delete.
- Entity: ExamWord, QuestionWord, ScoreWordHistory, Testing, UserTesting, Classroom.
- Permission evidence: public/admin access is wired through shared auth middleware and route registration in [api-develop/app/routes/routes.js](../../../../api-develop/app/routes/routes.js).

### Ghi chú kiểm tra
- [CẦN XÁC NHẬT] Scope chi tiết cho role admin/teacher/supporter trong exam/testing chưa được xác minh đầy đủ từ config.
- [RỦI RO / TECHNICAL DEBT] Public exam routes và scoring API phụ thuộc vào user context và practiceConfig; cần kiểm tra lại trong môi trường vận hành để đảm bảo quyền và tính nhất quán.

## Module: Order / cart / payment

### Phụ thuộc đầu vào
- Authentication: các endpoint cart/order/credit đều dựa vào req.user.user_id và auth middleware chung; người dùng cần đăng nhập để xem/đổi giỏ hàng, order history và wallet history.
- Classroom: một số sản phẩm trong cart là classroom/course và việc truy cập thành công sau khi thanh toán phụ thuộc vào lớp học và quyền sở hữu khóa học; sự gắn kết này xuất hiện trong CartController.add và OrderController.payOSUpdateOrder.
- Coupon / credit: coupon là một dependency ở cấp checkout, trong khi balance credit dùng cho SSS balance payment và top-up flow.

### Phụ thuộc đầu ra
- Order / cart / payment cung cấp quyền truy cập vào khóa học sau khi order được paid/success, cập nhật lịch sử giao dịch và data cho admin operations.
- Credit log và order history có thể trở thành data source cho accounting/reporting và analytics trong tương lai.

### Mapping dependency
- Authentication -> Order / cart / payment: [api-develop/app/controllers/CartController.js](../../../../api-develop/app/controllers/CartController.js), [api-develop/app/controllers/OrderController.js](../../../../api-develop/app/controllers/OrderController.js) và [api-develop/app/controllers/CreditController.js](../../../../api-develop/app/controllers/CreditController.js) đều đọc req.user để lấy user context; [api-develop/app/routes/CheckToken.js](../../../../api-develop/app/routes/CheckToken.js) và [api-develop/app/routes/CheckScope.js](../../../../api-develop/app/routes/CheckScope.js) bảo vệ các endpoint admin.
- Classroom -> Order / cart / payment: [api-develop/app/controllers/CartController.js](../../../../api-develop/app/controllers/CartController.js) kiểm tra user đã tham gia classroom trước khi thêm vào giỏ; [api-develop/app/controllers/OrderController.js](../../../../api-develop/app/controllers/OrderController.js) cấp quyền vào classroom khi thanh toán được xác nhận.
- Order / cart / payment -> Public UI: [web-ssstudy/src/app/gio-hang/page.tsx](../../../../web-ssstudy/src/app/gio-hang/page.tsx), [web-ssstudy/src/app/gio-hang/thanh-toan/page.tsx](../../../../web-ssstudy/src/app/gio-hang/thanh-toan/page.tsx), [web-ssstudy/src/app/account/order-history/page.tsx](../../../../web-ssstudy/src/app/account/order-history/page.tsx), [web-ssstudy/src/app/account/credit-history/CreditHistoryClient.tsx](../../../../web-ssstudy/src/app/account/credit-history/CreditHistoryClient.tsx).
- Order / cart / payment -> Admin UI: [web-admin/src/components/order/Order.js](../../../../web-admin/src/components/order/Order.js), [web-admin/src/components/credit/Credit.js](../../../../web-admin/src/components/credit/Credit.js), [web-admin/src/components/coupon/Coupon.js](../../../../web-admin/src/components/coupon/Coupon.js).

### Route/API/entity/permission evidence
- Public/authenticated route: /cart/detail, /cart/add, /cart/update, /cart/delete, /cart/count, /cart/apply-coupon, /cart/remove-coupon, /order/create, /order/payment-info, /order/payment_payos, /order/list, /order/detail, /credit/list, /credit/payment, /credit/payment_payos.
- Admin route: /order/update-status, /credit/list, /coupon/list, /coupon/create, /coupon/update, /coupon/delete.
- Entity: Cart, CartItem, Coupon, Order, OrderItem, CreditLog, OrderPaymentCode, User.
- Permission evidence: auth middleware is shared in [api-develop/app/routes/routes.js](../../../../api-develop/app/routes/routes.js) and controller logic uses req.user for ownership checks.

### Ghi chú kiểm tra
- [CẦN XÁC NHẬT] Chi tiết điều kiện apply coupon và scope cho role admin/manager/supporter trong module này.
- [RỦI RO / TECHNICAL DEBT] Webhook PayOS và balance reconciliation cần kiểm tra kỹ trước khi refactor hoặc mở rộng.

## Module: Content pages / blog / configuration

### Phụ thuộc đầu vào
- Authentication: các endpoint public và admin về blog/about/teacher/CEO đều có thể dùng shared auth middleware; một số route public không cần token nhưng route quản trị cần auth/scope.
- Admin management: nội dung tĩnh và blog được tạo/sửa qua admin UI và controller backend; data được lưu ở Page/TeachersTeam/CeoPage/BlogPost/BlogCategory.

### Phụ thuộc đầu ra
- Content pages cung cấp nội dung tĩnh cho public UI và có thể được dùng bởi marketing, onboarding và landing page.
- Blog và content config có thể trở thành nguồn dữ liệu cho các module tiếp theo như homepage, notification và SEO nếu mở rộng.

### Mapping dependency
- Authentication -> Content pages: [api-develop/app/routes/routes.js](../../../../api-develop/app/routes/routes.js) đăng ký public route /about/detail, /blog/detail, /teachers-team/detail, /ceo-page/detail, trong khi admin CRUD cần auth/scope qua middleware chung.
- Content pages -> Public UI: [web-ssstudy/src/app/tin-tuc/[alias]/[slug]/page.tsx](../../../../web-ssstudy/src/app/tin-tuc/[alias]/[slug]/page.tsx), [web-ssstudy/src/app/(gioi-thieu)/ve-chung-toi/_components/MySelfIntroPageClient.tsx](../../../../web-ssstudy/src/app/(gioi-thieu)/ve-chung-toi/_components/MySelfIntroPageClient.tsx), [web-ssstudy/src/app/giao-vien/TeacherIntro.tsx](../../../../web-ssstudy/src/app/giao-vien/TeacherIntro.tsx), [web-ssstudy/src/app/(gioi-thieu)/ceo-nguyen-tien-dat/page.tsx](../../../../web-ssstudy/src/app/(gioi-thieu)/ceo-nguyen-tien-dat/page.tsx).
- Content pages -> Admin UI: [web-admin/src/components/Master.js](../../../../web-admin/src/components/Master.js) liệt kê route /blog, /blog-category, /settings, /teachers-team, /admin-ceo.

### Route/API/entity/permission evidence
- Public/authenticated route: /blog/list-public, /blog/detail, /blog-category/list-public, /about/detail, /teachers-team/detail, /ceo-page/detail.
- Admin route: /blog/*, /blog-category/*, /about/*, /page/*, /ceo-page/*, /teachers-team/*.
- Entity: BlogPost, BlogCategory, Page, TeachersTeam, CeoPage.
- Permission evidence: auth/scope middleware chung từ [api-develop/app/routes/CheckToken.js](../../../../api-develop/app/routes/CheckToken.js) và [api-develop/app/routes/CheckScope.js](../../../../api-develop/app/routes/CheckScope.js).

### Ghi chú kiểm tra
- [CẦN XÁC NHẬT] Scope admin/manager cho CRUD blog/content page chưa được xác minh đầy đủ.
- [RỦI RO / TECHNICAL DEBT] content_configs lưu dưới dạng JSON string và TeachersTeam update có fallback tạo mới/ghi đè record đầu tiên.

## Module: Book / book-id / course bundle

### Phụ thuộc đầu vào
- Authentication: quyền xem/ownership cho book-id, bundle và book detail cần user context; route public khác với route kiểm tra sở hữu.
- Classroom: book và bundle có thể liên kết với classroom_attached và bundle ownership; điều này tạo phụ thuộc logic giữa book/book-id và classroom.

### Phụ thuộc đầu ra
- Book / book-id / course bundle cung cấp quyền truy cập học liệu và khóa học sau khi sở hữu thành công.
- Ownership data có thể phục vụ cho order/payment, classroom enrollment và reporting sau này.

### Mapping dependency
- Authentication -> Book / book-id / course bundle: [api-develop/app/controllers/BookController.js](../../../../api-develop/app/controllers/BookController.js), [api-develop/app/controllers/BookIdController.js](../../../../api-develop/app/controllers/BookIdController.js) và [api-develop/app/controllers/BookIdCourseController.js](../../../../api-develop/app/controllers/BookIdCourseController.js) đều dùng req.user hoặc StudentBookIdModel để kiểm tra ownership.
- Book / book-id / course bundle -> Public UI: [web-ssstudy/src/app/sach/page.tsx](../../../../web-ssstudy/src/app/sach/page.tsx), [web-ssstudy/src/app/sach-id/page.tsx](../../../../web-ssstudy/src/app/sach-id/page.tsx), [web-ssstudy/src/app/account/my-course/MyCourseForm.tsx](../../../../web-ssstudy/src/app/account/my-course/MyCourseForm.tsx).
- Book / book-id / course bundle -> Admin UI: [web-admin/src/components/Master.js](../../../../web-admin/src/components/Master.js) liệt kê /book, /book-id, /book-id-course.

### Route/API/entity/permission evidence
- Public/authenticated route: /book/list, /book/detail, /book/list-related, /book-id/list-public, /book-id/detail, /book-id-course/list-owned, /book-id-course/list-public.
- Admin route: /book/*, /book-id/*, /book-id-course/*.
- Entity: Book, BookId, BookIdCourse, StudentBookId, UserBuyData.
- Permission evidence: auth middleware và logic ownership trong controller.

### Ghi chú kiểm tra
- [CẦN XÁC NHẬT] Luồng expired_date và mapping giữa book-id và classroom được gắn như thế nào ở vận hành thực tế.
- [RỦI RO / TECHNICAL DEBT] Ownership logic và filter label/teacher/subject hiện đang dùng nhiều điều kiện và chưa có service layer thống nhất.

## Module: Document / tài liệu

### Phụ thuộc đầu vào
- Authentication: cần user context để phân biệt guest/đã đăng nhập và cho phép backend kiểm tra quyền truy cập tài liệu PRO; route CRUD admin dùng auth middleware + scope guard.
- Classroom: tài liệu thuộc kiểu PRO có thể gắn với classroom; quyền truy cập cho tài liệu này phụ thuộc vào `classroom.students` và `classroom.id`.
- Admin management: CRUD document/document-category và upload file được thực hiện ở admin UI và đi qua chung các controller backend.

### Phụ thuộc đầu ra
- Document module cung cấp nội dung cho public site và có thể trở thành tài nguyên học tập liên kết từ classroom.
- Document category và document record có thể được dùng bởi các module khác như classroom, exam hoặc blog nếu cần hiển thị nội dung liên quan.

### Mapping dependency
- Authentication -> Document: [api-develop/app/controllers/DocumentController.js](../../../../api-develop/app/controllers/DocumentController.js) dùng `req.user` để quyết định preview/permission; [api-develop/app/routes/CheckToken.js](../../../../api-develop/app/routes/CheckToken.js) và [api-develop/app/routes/CheckScope.js](../../../../api-develop/app/routes/CheckScope.js) bảo vệ các endpoint admin CRUD.
- Classroom -> Document: [api-develop/app/controllers/DocumentController.js](../../../../api-develop/app/controllers/DocumentController.js) lấy `classroom.id` từ document và kiểm tra `classroom.students.includes(req.user.id)`; [api-develop/app/models/Document.js](../../../../api-develop/app/models/Document.js) lưu `classroom` metadata trên document.
- Document -> Public UI: [web-ssstudy/src/app/tai-lieu/page.tsx](../../../../web-ssstudy/src/app/tai-lieu/page.tsx) và [web-ssstudy/src/app/tai-lieu/[id]/_components/DocumentDetailClient.tsx](../../../../web-ssstudy/src/app/tai-lieu/[id]/_components/DocumentDetailClient.tsx) render danh sách/chi tiết tài liệu từ API public.
- Document -> Admin UI: [web-admin/src/components/document/Document.js](../../../../web-admin/src/components/document/Document.js), [web-admin/src/components/document/DocumentCreate.js](../../../../web-admin/src/components/document/DocumentCreate.js), [web-admin/src/components/document/DocumentEdit.js](../../../../web-admin/src/components/document/DocumentEdit.js), [web-admin/src/components/document/DocumentCategory.js](../../../../web-admin/src/components/document/DocumentCategory.js), [web-admin/src/components/document/DocumentCategoryCreate.js](../../../../web-admin/src/components/document/DocumentCategoryCreate.js), [web-admin/src/components/document/DocumentCategoryEdit.js](../../../../web-admin/src/components/document/DocumentCategoryEdit.js) dùng shared backend endpoints.

### Route/API/entity/permission evidence
- Public route: /document/list-public, /document/list-related, /document/show, /document-category/list-public, /document/detail.
- Admin route: /document/list, /document/create, /document/update, /document/delete, /document-category/list, /document-category/create, /document-category/update, /document-category/delete.
- Entity: Document, DocumentCategory, Classroom.
- Permission evidence: public endpoints are listed in [api-develop/app/routes/routes.js](../../../../api-develop/app/routes/routes.js); CRUD admin endpoints are protected by auth/scope middleware and scoped in [api-develop/config/user_scopes.json](../../../../api-develop/config/user_scopes.json).

### Ghi chú kiểm tra
- [CẦN XÁC NHẬN] Không thấy logic xóa file cũ hoặc file orphan sau update/delete.
- [RỦI RO / TECHNICAL DEBT] Access control cho tài liệu PRO dựa vào server-side classroom check, nhưng route public cho phép endpoint được gọi mà không cần token.
