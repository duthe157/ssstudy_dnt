# Data Entity Inventory

## 1. Entity/model/table chính
Danh sách model được tìm thấy trong [api-develop/app/models](../..\api-develop\app\models):
- User
- Classroom
- ClassroomGroup
- ClassroomReview
- ClassroomSchedule
- ClassroomChapterSubject
- Subject
- Chapter
- Category
- Document
- DocumentCategory
- Exam
- ExamCategory
- ExamWord
- Question
- QuestionWord
- Testing
- Book
- BookCategory
- BookId
- BookIdCourse
- BookReview
- Order
- OrderItem
- Cart
- CartItem
- CreditLog
- Billing
- BillingHistory
- Message
- BlogPost
- BlogCategory
- Page
- Setting
- Label
- LabelItem
- Review
- ReportBug
- TeachersTeam
- LinkPayments
- CompetitionPart

## 2. Ý nghĩa nghiệp vụ suy ra từ source
- User: tài khoản người dùng, học viên/admin/giáo viên
- Classroom: lớp học, khóa học, phòng học trực tuyến
- Subject/Chapter/Category: môn học, chương mục, danh mục nội dung
- Exam/Question/Testing: đề thi, câu hỏi, bài kiểm tra
- Book/BookId/BookIdCourse: sách, mã sách, khóa học liên quan
- Order/Credit/Cart: thanh toán, đơn hàng, ví tín dụng
- Blog/Post/Setting/Page: nội dung tĩnh và trang giới thiệu
- Document/DocumentCategory: tài liệu và danh mục tài liệu

## 3. Trạng thái/flag/enum quan trọng
- appConfig.STATUS.ACTIVE/INACTIVE
- appConfig.TESTING_STATUS.PENDING/DONE
- appConfig.USER_GROUP các nhóm vai trò
- appConfig.QUESTION_TYPE các loại câu hỏi
- appConfig.EXAM_TYPE, EXAM_CREATING_TYPE
- [CẦN XÁC NHẬN] các trạng thái đơn hàng, trạng thái lớp học và trạng thái đánh giá trong model cụ thể

## 4. API/module sử dụng
- ExamWordController và ExamWord model dùng cho đề thi theo từ/word exam
- Order/Credit/Cart dùng cho thanh toán và ví
- Classroom và ClassroomReview dùng cho học viên và đánh giá
- Blog và Page dùng cho nội dung tĩnh và trang giới thiệu

## 5. Nội dung chưa chắc chắn
- Các quan hệ giữa nhiều model như User-Classroom-Order-BookId chưa được mô tả đầy đủ trong source hiện tại.
- Một số enum/status có thể nằm trong schema riêng và cần kiểm tra thêm.
