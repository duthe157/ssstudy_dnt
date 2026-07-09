# Exam / Testing — SRS mục tiêu

> Tài liệu đặc tả yêu cầu phần mềm (SRS) cho module Exam/Testing của hệ thống SSStudy.
> Viết như thể hệ thống chưa có code. Mục tiêu: đủ chi tiết để developer triển khai hoàn chỉnh chỉ từ tài liệu này.

---

## 1. Mục tiêu nghiệp vụ

Module Exam/Testing cung cấp nền tảng tổ chức thi và kiểm tra trực tuyến cho hệ thống luyện thi SSStudy:

- Cho phép học viên tham gia đề luyện tập và đề thi thử theo chủ đề, môn học.
- Tự động chấm điểm ngay khi nộp bài; trả kết quả tức thì.
- Hỗ trợ xem lại lịch sử làm bài, điểm số và lời giải chi tiết.
- Cung cấp công cụ admin và giáo viên tạo, quản lý đề thi và ngân hàng câu hỏi.
- Kiểm soát quyền truy cập đề thi: đề công khai, đề cần đăng nhập, đề có mật khẩu.
- Giới hạn số lượt làm bài và kiểm soát thời gian phía backend.
- Đảm bảo tính toàn vẹn: bài đã nộp không được sửa; kết quả bất biến.

---

## 2. Phạm vi chức năng

| STT | Chức năng | Mô tả ngắn |
|---|---|---|
| 1 | Ngân hàng câu hỏi | Tạo, quản lý, phân loại câu hỏi và đáp án |
| 2 | Danh sách đề thi | Hiển thị, lọc, tìm kiếm đề thi công khai |
| 3 | Chi tiết đề thi | Thông tin, cấu hình, yêu cầu trước khi bắt đầu |
| 4 | Bắt đầu làm bài | Tạo phiên làm bài (attempt) với đồng hồ đếm ngược |
| 5 | Làm bài trực tuyến | Trả lời câu hỏi, lưu câu trả lời tạm thời |
| 6 | Nộp bài | Xác nhận nộp và khóa bài thi |
| 7 | Chấm điểm tự động | Tính điểm ngay khi nộp, lưu kết quả |
| 8 | Xử lý hết thời gian | Tự động nộp bài khi hết giờ |
| 9 | Xem kết quả | Điểm số, số câu đúng, lời giải chi tiết |
| 10 | Xem lịch sử làm bài | Danh sách lần làm với điểm và thời gian |
| 11 | Cấu hình đề thi | Loại, thời gian, số lượt, mật khẩu, chính sách xem đáp án |
| 12 | Mật khẩu bảo vệ đề | Xác thực mật khẩu trước khi bắt đầu |
| 13 | Chống nộp bài trùng | Khóa attempt đang active; idempotent submit |
| 14 | Admin tạo/sửa đề thi | CRUD đề thi và cấu hình |
| 15 | Admin quản lý câu hỏi | CRUD câu hỏi, đáp án, phân loại |
| 16 | Admin gán câu hỏi vào đề | Chọn câu hỏi từ ngân hàng |
| 17 | Admin xuất bản/ẩn đề | Kiểm soát trạng thái hiển thị |
| 18 | Admin xem báo cáo kết quả | Thống kê theo đề thi và học viên |
| 19 | Xuất kết quả thi | Export CSV/XLSX danh sách kết quả |

---

## 3. Ngoài phạm vi

- Thi có giám sát trực tiếp (proctored exam), camera, chống gian lận nâng cao.
- Thanh toán để mua đề thi (thuộc module Order/Payment).
- Chứng chỉ điện tử sau khi hoàn thành.
- Import câu hỏi định dạng SCORM/QTI.
- Thi nhóm hoặc thi đồng thời theo phòng thi ảo.
- Hệ thống adaptive testing (điều chỉnh độ khó theo kết quả).

---

## 4. Actor

| Actor | Mô tả | Quyền cơ bản |
|---|---|---|
| Guest | Chưa đăng nhập | Xem danh sách và chi tiết đề thi công khai |
| student | Học viên đã đăng nhập | Làm bài, xem kết quả cá nhân, xem lịch sử |
| teacher | Giáo viên | Tạo và quản lý đề thi, câu hỏi trong phạm vi được cấp |
| admin | Quản trị viên | Toàn quyền quản lý đề thi, câu hỏi, báo cáo |
| superAdmin | Quản trị cấp cao | Toàn quyền bao gồm xóa cứng và cấu hình toàn hệ thống |

---

## 5. Permission

| Mã permission | Mô tả | Role mặc định |
|---|---|---|
| `exam:read` | Xem đề thi kể cả chưa xuất bản | admin, superAdmin, teacher |
| `exam:create` | Tạo đề thi mới | admin, superAdmin, teacher |
| `exam:update` | Cập nhật đề thi | admin, superAdmin, teacher |
| `exam:delete` | Xóa mềm đề thi | admin, superAdmin |
| `exam:publish` | Xuất bản hoặc ẩn đề thi | admin, superAdmin, teacher |
| `question:manage` | Tạo/sửa/xóa câu hỏi và đáp án | admin, superAdmin, teacher |
| `question:import` | Import câu hỏi hàng loạt | admin, superAdmin, teacher |
| `attempt:read:all` | Xem attempt của học viên bất kỳ | admin, superAdmin, teacher |
| `result:read:all` | Xem kết quả của học viên bất kỳ | admin, superAdmin, teacher |
| `report:exam` | Xem báo cáo kết quả thi | admin, superAdmin, teacher |
| `result:export` | Xuất kết quả thi ra file | admin, superAdmin |

---

## 6. Danh sách chức năng

| Mã chức năng | Tên chức năng | Actor | Màn hình đề xuất | API đề xuất | Dịch vụ nghiệp vụ cần có | Dữ liệu/model liên quan | Quy tắc áp dụng | Priority |
|---|---|---|---|---|---|---|---|---|
| EXM-01 | Danh sách đề thi công khai | Guest, student | `/exams` | `GET /api/exams` | Lọc theo loại, môn học, trạng thái; phân trang | Exam | BR-EXAM-001 (chỉ published) | Must |
| EXM-02 | Chi tiết đề thi | Guest, student | `/exams/{examId}` | `GET /api/exams/{examId}` | Trả thông tin đề, cấu hình, số lượt đã làm của user | Exam, ExamConfig | BR-EXAM-001 | Must |
| EXM-03 | Xác thực mật khẩu đề thi | student | `/exams/{examId}` | `POST /api/exams/{examId}/verify-password` | Kiểm tra mật khẩu, trả access token tạm thời để bắt đầu | Exam | BR-EXAM-004 | Must |
| EXM-04 | Bắt đầu làm bài | student | `/exams/{examId}/attempt` | `POST /api/exams/{examId}/attempts` | Kiểm tra số lượt, tạo Attempt với startedAt, trả danh sách câu hỏi | Attempt, ExamQuestion | BR-EXAM-003, BR-EXAM-006 | Must |
| EXM-05 | Lưu câu trả lời tạm thời | student | `/exams/{examId}/attempt` | `PUT /api/attempts/{attemptId}/answers` | Lưu Answer theo từng câu; không chấm điểm | Attempt, Answer | BR-EXAM-002 | Must |
| EXM-06 | Nộp bài | student | `/exams/{examId}/attempt` | `POST /api/attempts/{attemptId}/submit` | Khóa attempt, chấm điểm, tạo Result | Attempt, Answer, Result | BR-EXAM-001, BR-EXAM-002, BR-EXAM-003 | Must |
| EXM-07 | Xử lý hết thời gian | Hệ thống | — | Nội bộ / webhook timer | Tự động submit attempt khi vượt thời gian | Attempt | BR-EXAM-003 | Must |
| EXM-08 | Xem kết quả và lời giải | student | `/exams/{examId}/result/{attemptId}` | `GET /api/attempts/{attemptId}/result` | Trả điểm, số câu đúng, lời giải (theo chính sách) | Result, Answer, Question | BR-EXAM-005 | Must |
| EXM-09 | Xem lịch sử làm bài | student | `/exams/{examId}/history` | `GET /api/exams/{examId}/attempts` | Danh sách attempt của user hiện tại | Attempt, Result | — | Should |
| EXM-10 | Admin tạo đề thi | admin, teacher | `/admin/exams/new` | `POST /api/admin/exams` | Tạo Exam + ExamConfig; trạng thái draft | Exam, ExamConfig | `exam:create` | Must |
| EXM-11 | Admin sửa đề thi | admin, teacher | `/admin/exams/{examId}/edit` | `PUT /api/admin/exams/{examId}` | Cập nhật metadata và cấu hình | Exam, ExamConfig | `exam:update` | Must |
| EXM-12 | Admin xuất bản/ẩn đề thi | admin, teacher | `/admin/exams/{examId}` | `PUT /api/admin/exams/{examId}/publish` | Chuyển trạng thái published/draft | Exam | `exam:publish` | Must |
| EXM-13 | Admin quản lý câu hỏi | admin, teacher | `/admin/questions` | CRUD `/api/admin/questions` | Tạo/sửa/xóa câu hỏi và đáp án | Question, QuestionOption | `question:manage` | Must |
| EXM-14 | Admin gán câu hỏi vào đề | admin, teacher | `/admin/exams/{examId}/questions` | `POST /api/admin/exams/{examId}/questions` | Liên kết câu hỏi từ ngân hàng vào đề | ExamQuestion | `exam:update` | Must |
| EXM-15 | Admin xóa đề thi | admin | `/admin/exams/{examId}` | `DELETE /api/admin/exams/{examId}` | Soft-delete đề thi | Exam | `exam:delete` | Could |
| EXM-16 | Admin xem báo cáo kết quả | admin, teacher | `/admin/exams/{examId}/report` | `GET /api/admin/exams/{examId}/report` | Thống kê điểm trung bình, phân phối điểm | Result, Attempt | `report:exam` | Should |
| EXM-17 | Admin xuất kết quả thi | admin | `/admin/exams/{examId}/report` | `GET /api/admin/exams/{examId}/results/export` | Export CSV/XLSX danh sách kết quả | Result | `result:export` | Should |

---

## 7. Thiết kế dữ liệu / Domain model đề xuất

### Model chính

| Model | Mục đích | Field quan trọng | Quan hệ |
|---|---|---|---|
| Exam | Đề thi | id, title, type, status, hasPassword | Có một ExamConfig, nhiều ExamQuestion |
| ExamConfig | Cấu hình đề thi | examId, durationMinutes, maxAttempts, showAnswerPolicy | FK tới Exam |
| Question | Câu hỏi trong ngân hàng | id, content, type, explanation, subject | Có nhiều QuestionOption |
| QuestionOption | Đáp án của câu hỏi | id, questionId, content, isCorrect, ordering | FK tới Question |
| ExamQuestion | Liên kết câu hỏi vào đề | examId, questionId, ordering, score | FK tới Exam, Question |
| Attempt | Phiên làm bài | id, examId, userId, status, startedAt, submittedAt | FK tới Exam, User |
| Answer | Câu trả lời của user | id, attemptId, questionId, selectedOptionId | FK tới Attempt, Question |
| Result | Kết quả bài thi | id, attemptId, score, totalScore, totalCorrect, totalQuestions | FK tới Attempt |
| ScoreBreakdown | Chi tiết điểm từng câu | resultId, questionId, isCorrect, earnedScore, correctOptionId | FK tới Result |

### Field chi tiết

#### Model: Exam
| Field | Kiểu dữ liệu | Bắt buộc | Ý nghĩa | Validation |
|---|---|---|---|---|
| id | UUID | Có | Khóa chính | Auto-generate |
| title | varchar(255) | Có | Tiêu đề đề thi | Không rỗng |
| slug | varchar(255) | Có | Đường dẫn URL | Unique |
| description | text | Không | Mô tả đề thi | |
| type | enum | Có | Loại đề | practice, mock_exam, official |
| accessLevel | enum | Có | Quyền truy cập | public, authenticated, enrolled |
| hasPassword | boolean | Có | Có mật khẩu không | Mặc định false |
| passwordHash | varchar(255) | Không | Mật khẩu đã hash | Null nếu không có |
| status | enum | Có | Trạng thái | draft, published, archived |
| courseId | UUID FK | Không | Gắn với khóa học | |
| subjectId | UUID FK | Không | Môn học | |
| createdAt | timestamp | Có | | Auto |
| updatedAt | timestamp | Có | | Auto |

#### Model: ExamConfig
| Field | Kiểu dữ liệu | Bắt buộc | Ý nghĩa | Validation |
|---|---|---|---|---|
| id | UUID | Có | Khóa chính | |
| examId | UUID FK | Có | Thuộc đề thi | Unique — 1-1 với Exam |
| durationMinutes | int | Không | Thời gian làm bài | Null = không giới hạn |
| maxAttempts | int | Không | Số lượt tối đa | Null = không giới hạn |
| showAnswerPolicy | enum | Có | Khi nào hiển thị lời giải | after_submit, after_deadline, never |
| shuffleQuestions | boolean | Có | Xáo trộn câu hỏi | Mặc định false |
| shuffleOptions | boolean | Có | Xáo trộn đáp án | Mặc định false |
| passingScore | numeric | Không | Điểm đạt | |

#### Model: Attempt
| Field | Kiểu dữ liệu | Bắt buộc | Ý nghĩa | Validation |
|---|---|---|---|---|
| id | UUID | Có | Khóa chính | |
| examId | UUID FK | Có | Đề thi | |
| userId | UUID FK | Có | Người làm | |
| status | enum | Có | Trạng thái | in_progress, submitted, scored, expired |
| startedAt | timestamp | Có | Thời điểm bắt đầu | |
| submittedAt | timestamp | Không | Thời điểm nộp | Null nếu chưa nộp |
| expiresAt | timestamp | Không | Thời điểm hết hạn | startedAt + durationMinutes |
| attemptNumber | int | Có | Lượt thứ mấy | Tính từ lịch sử attempt của user với đề này |

#### Model: Result
| Field | Kiểu dữ liệu | Bắt buộc | Ý nghĩa | Validation |
|---|---|---|---|---|
| id | UUID | Có | Khóa chính | |
| attemptId | UUID FK | Có | Phiên làm bài | Unique — 1-1 với Attempt |
| score | numeric | Có | Điểm đạt được | |
| totalScore | numeric | Có | Điểm tối đa của đề | |
| totalCorrect | int | Có | Số câu đúng | |
| totalQuestions | int | Có | Tổng số câu | |
| percentScore | numeric | Có | Phần trăm điểm | score / totalScore * 100 |
| isPassed | boolean | Không | Có đạt không | Dựa trên passingScore nếu cấu hình |
| createdAt | timestamp | Có | Thời điểm chấm | Auto |

### Quan hệ dữ liệu
- Exam `1—1` ExamConfig.
- Exam `N—N` Question qua ExamQuestion.
- Attempt `1—N` Answer.
- Attempt `1—1` Result.
- Result `1—N` ScoreBreakdown.

### Index / Constraint đề xuất

| Bảng | Index / Constraint | Mục đích |
|---|---|---|
| Exam | UNIQUE(slug) | URL duy nhất |
| Exam | INDEX(status, type, subjectId) | Lọc danh sách nhanh |
| ExamConfig | UNIQUE(examId) | 1-1 với Exam |
| Attempt | INDEX(examId, userId, status) | Kiểm tra attempt đang active |
| Result | UNIQUE(attemptId) | 1-1 với Attempt |
| ScoreBreakdown | INDEX(resultId) | Lấy chi tiết theo result |

---

## 8. Thiết kế kiến trúc module

### Thành phần cần có

| Thành phần | Vai trò | Ghi chú triển khai |
|---|---|---|
| API layer (Controller) | Nhận request, validate, gọi service, trả response | Không chứa business logic |
| ExamService | Lấy danh sách và chi tiết đề thi, kiểm tra trạng thái | Kiểm tra accessLevel và enrollment nếu cần |
| AttemptService | Tạo, kiểm tra và quản lý phiên làm bài | Kiểm tra số lượt, tạo expiresAt, khóa attempt đang active |
| AnswerService | Lưu câu trả lời tạm thời trong attempt | Chỉ lưu khi attempt status=in_progress |
| ScoringService | Chấm điểm khi nộp bài, tạo Result và ScoreBreakdown | Chạy đồng bộ khi submit; kết quả bất biến sau đó |
| TimerService | Theo dõi thời gian làm bài, trigger auto-submit | Kiểm tra expiresAt khi user request hoặc qua scheduler |
| PasswordVerifier | Xác thực mật khẩu bảo vệ đề thi | Hash so sánh; trả session token ngắn hạn |
| ExamAdminService | Quản lý đề thi, câu hỏi, xuất bản | Gọi ExamRepository, QuestionRepository |
| ReportService | Thống kê kết quả thi | Aggregate Result theo examId |
| ExamRepository | Truy vấn và cập nhật Exam, ExamConfig | |
| AttemptRepository | Truy vấn và cập nhật Attempt, Answer, Result | |

### Dependency
- Module Exam phụ thuộc Authentication để kiểm tra token và permission.
- Module Exam có thể tham chiếu Classroom để kiểm tra enrollment nếu đề thi `accessLevel=enrolled`.
- Module Reporting đọc dữ liệu Result và Attempt để tạo báo cáo.

### Nguyên tắc triển khai
- Thời gian làm bài kiểm soát phía backend qua trường `expiresAt` — không chỉ dựa vào countdown frontend.
- Khi nộp bài: kiểm tra `submittedAt IS NULL` và `status=in_progress` trước; cập nhật atomically.
- Kết quả (Result, ScoreBreakdown) sau khi tạo không được sửa qua API thông thường.
- Câu trả lời lưu tạm (Answer) chỉ được cập nhật khi attempt còn in_progress.
- Chống nộp trùng: dùng DB transaction để cập nhật status → submitted atomically.

---

## 9. Yêu cầu giao diện

| Màn hình | Route đề xuất | Actor | Mục đích | API sử dụng |
|---|---|---|---|---|
| Danh sách đề thi | `/exams` | Guest, student | Tìm kiếm, lọc đề thi | `GET /api/exams` |
| Chi tiết đề thi | `/exams/{examId}` | Guest, student | Xem thông tin, bắt đầu làm | `GET /api/exams/{examId}` |
| Nhập mật khẩu | `/exams/{examId}` (modal) | student | Xác thực mật khẩu | `POST /api/exams/{examId}/verify-password` |
| Trang làm bài | `/exams/{examId}/attempt/{attemptId}` | student | Làm bài, đồng hồ đếm ngược | `PUT /api/attempts/{attemptId}/answers` |
| Kết quả bài thi | `/exams/{examId}/result/{attemptId}` | student | Điểm số, lời giải | `GET /api/attempts/{attemptId}/result` |
| Lịch sử làm bài | `/exams/{examId}/history` | student | Danh sách lần đã làm | `GET /api/exams/{examId}/attempts` |
| Quản lý đề thi (admin) | `/admin/exams` | admin, teacher | Danh sách, tạo, sửa, xuất bản | CRUD APIs |
| Quản lý câu hỏi (admin) | `/admin/questions` | admin, teacher | Ngân hàng câu hỏi | CRUD `/api/admin/questions` |
| Gán câu hỏi vào đề (admin) | `/admin/exams/{examId}/questions` | admin, teacher | Chọn câu hỏi từ ngân hàng | Exam-Question APIs |
| Báo cáo kết quả (admin) | `/admin/exams/{examId}/report` | admin, teacher | Thống kê và xuất file | Report APIs |

**Yêu cầu UI chi tiết:**
- Trang làm bài: đồng hồ đếm ngược hiển thị rõ ràng; tự động lưu câu trả lời sau mỗi lần chọn; cảnh báo khi còn 5 phút.
- Khi hết thời gian: tự động submit với thông báo "Hết giờ, bài đã được nộp tự động".
- Trang kết quả: hiển thị điểm lớn; phân tích từng câu (đúng/sai/bỏ qua); lời giải theo chính sách.
- Admin quản lý câu hỏi: filter theo môn học, loại câu hỏi; xem trước câu hỏi trước khi gán.

---

## 10. API đề xuất

| Mã API | Method | Endpoint đề xuất | Mục đích | Auth required | Permission | Request chính | Response chính | Business rule | Ghi chú |
|---|---|---|---|---|---|---|---|---|---|
| API-EXM-001 | GET | `/api/exams` | Danh sách đề thi công khai | Không | Không | `?type, subject, page, limit` | `{ items, total }` | BR-EXAM-001 | Chỉ published |
| API-EXM-002 | GET | `/api/exams/{examId}` | Chi tiết đề thi | Không | Không | — | `{ exam, config, myAttemptCount }` | BR-EXAM-001 | myAttemptCount=0 nếu chưa đăng nhập |
| API-EXM-003 | POST | `/api/exams/{examId}/verify-password` | Xác thực mật khẩu | Có | Không | `{ password }` | `{ accessToken }` | BR-EXAM-004 | Token ngắn hạn dùng để bắt đầu |
| API-EXM-004 | POST | `/api/exams/{examId}/attempts` | Bắt đầu làm bài | Có | Không | `{ accessToken? }` | `{ attemptId, questions, expiresAt }` | BR-EXAM-003, BR-EXAM-006 | Kiểm tra số lượt; trả câu hỏi đã xáo trộn nếu cấu hình |
| API-EXM-005 | GET | `/api/attempts/{attemptId}` | Lấy trạng thái attempt hiện tại | Có | Ownership | — | `{ attempt, answers, remainingSeconds }` | BR-EXAM-002 | Chỉ owner mới xem được |
| API-EXM-006 | PUT | `/api/attempts/{attemptId}/answers` | Lưu câu trả lời tạm thời | Có | Ownership | `{ questionId, selectedOptionId }` | `{ ok }` | BR-EXAM-002 | Từ chối nếu attempt không còn in_progress |
| API-EXM-007 | POST | `/api/attempts/{attemptId}/submit` | Nộp bài | Có | Ownership | — | `{ resultId, score, totalScore }` | BR-EXAM-001, BR-EXAM-002, BR-EXAM-003 | Idempotent: nộp lại trả kết quả cũ |
| API-EXM-008 | GET | `/api/attempts/{attemptId}/result` | Xem kết quả và lời giải | Có | Ownership | — | `{ result, breakdown, showAnswers }` | BR-EXAM-005 | showAnswers theo showAnswerPolicy |
| API-EXM-009 | GET | `/api/exams/{examId}/attempts` | Lịch sử làm bài của tôi | Có | Không | `?page, limit` | `{ items, total }` | — | Chỉ attempt của user hiện tại |
| API-EXM-010 | GET | `/api/admin/exams` | Danh sách đề thi (admin) | Có | `exam:read` | `?status, type, page, limit` | `{ items, total }` | — | Bao gồm draft và archived |
| API-EXM-011 | POST | `/api/admin/exams` | Tạo đề thi | Có | `exam:create` | `{ title, type, accessLevel, config }` | `{ examId }` | — | |
| API-EXM-012 | PUT | `/api/admin/exams/{examId}` | Cập nhật đề thi | Có | `exam:update` | `{ title, description, config, ... }` | `{ ok }` | — | |
| API-EXM-013 | PUT | `/api/admin/exams/{examId}/publish` | Xuất bản / ẩn | Có | `exam:publish` | `{ publish: true/false }` | `{ ok, status }` | — | |
| API-EXM-014 | GET | `/api/admin/questions` | Danh sách câu hỏi | Có | `question:manage` | `?subject, type, q, page, limit` | `{ items, total }` | — | |
| API-EXM-015 | POST | `/api/admin/questions` | Tạo câu hỏi | Có | `question:manage` | `{ content, type, options, explanation }` | `{ questionId }` | — | |
| API-EXM-016 | PUT | `/api/admin/questions/{questionId}` | Sửa câu hỏi | Có | `question:manage` | `{ content, options, ... }` | `{ ok }` | — | |
| API-EXM-017 | POST | `/api/admin/exams/{examId}/questions` | Gán câu hỏi vào đề | Có | `exam:update` | `{ questionIds: [], ordering? }` | `{ ok }` | — | |
| API-EXM-018 | GET | `/api/admin/exams/{examId}/report` | Báo cáo kết quả thi | Có | `report:exam` | `?from, to` | `{ totalAttempts, avgScore, distribution }` | — | |
| API-EXM-019 | GET | `/api/admin/exams/{examId}/results/export` | Xuất kết quả thi | Có | `result:export` | `?format=csv` | File CSV/XLSX | — | |

---

## 11. Use case nghiệp vụ

### UC-EXM-001 — Học viên bắt đầu và nộp bài thi

- **Mục tiêu**: Học viên hoàn thành một lượt làm bài và nhận kết quả ngay.
- **Actor chính**: student.
- **Điều kiện trước**: Học viên đã đăng nhập; đề thi tồn tại và published; số lượt chưa vượt giới hạn.
- **Trigger**: Học viên nhấn "Bắt đầu làm bài".
- **Luồng chính**:
  1. Học viên mở trang chi tiết đề thi.
  2. Nếu đề có mật khẩu: nhập mật khẩu, nhận accessToken tạm thời.
  3. Học viên nhấn "Bắt đầu" — hệ thống kiểm tra số lượt đã làm.
  4. Hệ thống tạo Attempt với status=in_progress, ghi startedAt, tính expiresAt.
  5. Hệ thống trả danh sách câu hỏi (xáo trộn nếu cấu hình).
  6. Học viên chọn đáp án; hệ thống lưu Answer tạm thời.
  7. Học viên nhấn "Nộp bài" — hệ thống kiểm tra attempt còn in_progress.
  8. Hệ thống chấm điểm, tạo Result và ScoreBreakdown atomically.
  9. Attempt chuyển sang status=scored.
  10. Trả về điểm số và resultId.
- **Luồng thay thế**: Hết thời gian → hệ thống tự động submit; kết quả tính trên câu đã trả lời.
- **Luồng lỗi**:
  - Đã hết số lượt → 400 `MAX_ATTEMPTS_REACHED`.
  - Attempt không phải in_progress khi submit → 400 `ATTEMPT_NOT_IN_PROGRESS`.
  - Mật khẩu sai → 401 `INVALID_EXAM_PASSWORD`.
- **Business rule áp dụng**: BR-EXAM-001 đến BR-EXAM-006.
- **Acceptance criteria**: Kết quả tạo đúng sau nộp; không thể nộp lại attempt đã scored; hết giờ tự submit.

---

### UC-EXM-002 — Học viên xem lại kết quả và lời giải

- **Mục tiêu**: Học viên xem lại kết quả và hiểu những câu đã sai.
- **Actor chính**: student.
- **Điều kiện trước**: Attempt đã ở trạng thái scored.
- **Trigger**: Học viên nhấn "Xem kết quả" sau khi nộp bài.
- **Luồng chính**:
  1. Hệ thống lấy Result theo attemptId.
  2. Kiểm tra ownership (user phải là chủ attempt).
  3. Kiểm tra `showAnswerPolicy` của ExamConfig.
  4. Nếu policy = `after_submit`: trả đầy đủ đáp án đúng và lời giải.
  5. Nếu policy = `never`: trả điểm và số câu đúng, không trả đáp án.
  6. Trả ScoreBreakdown theo từng câu.
- **Luồng lỗi**: Attempt không tồn tại hoặc không phải của user → 403/404.
- **Business rule áp dụng**: BR-EXAM-005.
- **Acceptance criteria**: Lời giải hiển thị đúng theo chính sách; không user nào xem kết quả của người khác trừ admin.

---

### UC-EXM-003 — Admin tạo đề thi và gán câu hỏi

- **Mục tiêu**: Admin tạo đề thi mới với câu hỏi từ ngân hàng.
- **Actor chính**: admin, teacher.
- **Điều kiện trước**: Có câu hỏi trong ngân hàng; admin có permission.
- **Luồng chính**:
  1. Admin tạo Exam với metadata và ExamConfig (thời gian, số lượt, chính sách...).
  2. Đề được tạo với status=draft.
  3. Admin vào trang quản lý câu hỏi, chọn câu hỏi và gán vào đề.
  4. Admin cấu hình thứ tự và điểm cho từng câu.
  5. Admin xuất bản đề khi đã sẵn sàng.
- **Luồng lỗi**: Đề không có câu hỏi → không cho xuất bản.
- **Business rule áp dụng**: BR-EXAM-001.
- **Acceptance criteria**: Đề draft không hiển thị public; xuất bản thành công → hiển thị trong danh sách.

---

### UC-EXM-004 — Xử lý hết thời gian làm bài

- **Mục tiêu**: Đảm bảo bài thi kết thúc đúng hạn dù học viên không chủ động nộp.
- **Actor chính**: Hệ thống.
- **Điều kiện trước**: Attempt có expiresAt đã thiết lập.
- **Trigger**: Học viên gửi bất kỳ request nào liên quan đến attempt sau khi expiresAt đã qua.
- **Luồng chính**:
  1. AttemptService kiểm tra `expiresAt < now` trên mọi request liên quan attempt.
  2. Nếu hết giờ và status vẫn in_progress: tự động submit với câu trả lời đã lưu.
  3. Chấm điểm, tạo Result, chuyển status → submitted → scored.
  4. Trả thông báo "Hết giờ, bài đã được nộp tự động".
- **Business rule áp dụng**: BR-EXAM-003.
- **Acceptance criteria**: Attempt hết hạn không thể thêm câu trả lời mới; kết quả được tính trên câu đã lưu trước đó.

---

## 12. User story

### US-EXM-001 — Làm bài thi thử
- **Với vai trò**: Học viên
- **Tôi muốn**: Làm một đề thi thử để đánh giá năng lực
- **Để**: Biết mình đang ở mức nào và cần ôn thêm gì
- **Priority**: Must
- **Given**: Đề thi published, tôi đã đăng nhập, còn lượt làm
- **When**: Tôi nhấn "Bắt đầu làm bài"
- **Then**: Phiên làm bài được tạo với đồng hồ đếm ngược; tôi có thể trả lời và nộp bài
- **Test scenario**: Bắt đầu thành công → attempt in_progress; nộp bài → kết quả tức thì

### US-EXM-002 — Xem lời giải sau nộp bài
- **Với vai trò**: Học viên
- **Tôi muốn**: Xem đáp án đúng và lời giải ngay sau khi nộp
- **Để**: Hiểu và học từ những câu làm sai
- **Priority**: Must
- **Given**: Attempt đã scored, policy = after_submit
- **When**: Tôi xem kết quả
- **Then**: Hiển thị câu đúng/sai, đáp án đúng và lời giải cho từng câu
- **Test scenario**: Policy after_submit → thấy lời giải; policy never → chỉ thấy điểm

### US-EXM-003 — Hệ thống tự nộp khi hết giờ
- **Với vai trò**: Học viên
- **Tôi muốn**: Bài thi tự động nộp khi hết giờ dù tôi chưa kịp nhấn nộp
- **Để**: Không mất bài làm vì quên nộp
- **Priority**: Must
- **Given**: Attempt đang in_progress, đã hết expiresAt
- **When**: Tôi gửi bất kỳ request nào liên quan attempt
- **Then**: Hệ thống tự submit với câu đã trả lời; trả thông báo "Hết giờ"
- **Test scenario**: Request sau hết hạn → auto-submit; không thể thêm câu trả lời mới

### US-EXM-004 — Làm bài đề có mật khẩu
- **Với vai trò**: Học viên
- **Tôi muốn**: Nhập mật khẩu để vào đề thi bảo vệ
- **Để**: Chỉ những ai có mật khẩu mới làm được đề này
- **Priority**: Must
- **Given**: Đề có hasPassword=true
- **When**: Tôi nhập mật khẩu đúng
- **Then**: Nhận access token tạm, có thể bắt đầu làm bài
- **Test scenario**: Mật khẩu đúng → bắt đầu được; mật khẩu sai → lỗi 401

### US-EXM-005 — Xem lịch sử làm bài
- **Với vai trò**: Học viên
- **Tôi muốn**: Xem lại tất cả lần đã làm một đề thi
- **Để**: Theo dõi sự tiến bộ qua các lần làm
- **Priority**: Should
- **Given**: Tôi đã làm đề nhiều lần
- **When**: Tôi mở trang lịch sử làm bài
- **Then**: Thấy danh sách theo thứ tự thời gian, mỗi lần có điểm và thời điểm làm
- **Test scenario**: Có 3 attempt → hiển thị 3 dòng theo thứ tự mới nhất

### US-EXM-006 — Admin tạo câu hỏi và gán vào đề
- **Với vai trò**: Admin
- **Tôi muốn**: Tạo câu hỏi mới và gán vào đề thi
- **Để**: Cung cấp nội dung kiểm tra cho học viên
- **Priority**: Must
- **Given**: Tôi có permission question:manage
- **When**: Tôi tạo câu hỏi, chọn đáp án đúng và gán vào đề
- **Then**: Câu hỏi được thêm vào ngân hàng; gắn vào đề thi thành công
- **Test scenario**: Tạo câu không có đáp án đúng → lỗi; gán thành công → hiển thị trong đề

### US-EXM-007 — Admin xuất kết quả thi
- **Với vai trò**: Admin
- **Tôi muốn**: Xuất danh sách kết quả của đề thi ra file
- **Để**: Phân tích và báo cáo kết quả thi cho đơn vị quản lý
- **Priority**: Should
- **Given**: Có kết quả thi cho đề này
- **When**: Tôi nhấn "Xuất kết quả" trên trang báo cáo
- **Then**: File CSV/XLSX tải về với danh sách học viên, điểm, thời gian
- **Test scenario**: Có kết quả → file tải được; không có kết quả → file rỗng hoặc thông báo

---

## 13. Luồng nghiệp vụ chi tiết

### Luồng 1: Làm bài và nộp

```
[Học viên] → Nhấn "Bắt đầu làm bài"
     ↓
[AttemptService] → Kiểm tra exam published, accessLevel
     ↓ (có mật khẩu)
[PasswordVerifier] → Xác thực mật khẩu → accessToken tạm
     ↓ (không mật khẩu)
[AttemptService] → Đếm số attempt đã làm của user với exam này
     ↓ (đã vượt maxAttempts)
[API] → Trả 400 MAX_ATTEMPTS_REACHED
     ↓ (còn lượt)
[AttemptService] → Tạo Attempt (status=in_progress, startedAt=now, expiresAt=now+duration)
[API] → Trả { attemptId, questions, expiresAt }
     ↓
[Học viên] → Chọn đáp án → PUT /api/attempts/{id}/answers (nhiều lần)
[AnswerService] → Upsert Answer; kiểm tra attempt còn in_progress và chưa hết hạn
     ↓
[Học viên] → Nhấn "Nộp bài" → POST /api/attempts/{id}/submit
     ↓
[AttemptService] → Kiểm tra status=in_progress (idempotent: nếu đã scored → trả result cũ)
[ScoringService] → Tính điểm từng câu, tổng điểm
[ScoringService] → Tạo Result + ScoreBreakdown (atomic transaction)
[AttemptService] → Cập nhật status → scored, submittedAt=now
[API] → Trả { resultId, score, totalScore, totalCorrect }
```

### Luồng 2: Hết thời gian tự động nộp

```
[Học viên] → Gửi request bất kỳ liên quan attempt
     ↓
[AttemptService] → Kiểm tra expiresAt < now
     ↓ (chưa hết hạn)
[API] → Xử lý bình thường
     ↓ (đã hết hạn, status còn in_progress)
[AttemptService] → Trigger auto-submit với câu đã lưu
[ScoringService] → Chấm điểm, tạo Result
[API] → Trả 200 với thông báo "Hết giờ, bài đã nộp tự động" và resultId
```

---

## 14. Business rule áp dụng

| Mã rule | Nội dung áp dụng trong module này |
|---|---|
| BR-EXAM-001 | Đề thi chỉ hiển thị công khai khi status=published |
| BR-EXAM-002 | Attempt không phải in_progress không được thêm/sửa câu trả lời |
| BR-EXAM-003 | Thời gian làm bài kiểm soát qua expiresAt ở backend; hết giờ tự động submit |
| BR-EXAM-004 | Đề có mật khẩu phải xác thực trước khi tạo attempt |
| BR-EXAM-005 | Kết quả (Result, ScoreBreakdown) sau khi tạo không được sửa qua API thông thường |
| BR-EXAM-006 | Số lượt làm bài được kiểm tra theo maxAttempts trong ExamConfig |
| BR-SYS-001 | Học viên chỉ xem attempt và result của chính mình |
| BR-SYS-002 | Backend kiểm tra quyền truy cập trước mọi request exam có bảo vệ |

---

## 15. Validation

### Tạo/sửa đề thi (admin)
- `title`: bắt buộc, 2–255 ký tự.
- `type`: bắt buộc, phải là `practice`, `mock_exam` hoặc `official`.
- `accessLevel`: bắt buộc, phải là `public`, `authenticated` hoặc `enrolled`.
- `config.durationMinutes`: không bắt buộc; nếu có phải là số nguyên dương.
- `config.maxAttempts`: không bắt buộc; nếu có phải là số nguyên dương.

### Tạo câu hỏi (admin)
- `content`: bắt buộc, không rỗng.
- `type`: bắt buộc, phải là `single_choice` hoặc `multiple_choice`.
- `options`: bắt buộc, ít nhất 2 đáp án.
- Phải có ít nhất một đáp án `isCorrect=true`.

### Nộp bài (học viên)
- Attempt phải tồn tại và thuộc user hiện tại.
- Attempt phải có status=in_progress.
- Attempt chưa vượt expiresAt (nếu có).

---

## 16. State machine

### Trạng thái đề thi (Exam)
```
draft → published → archived
```

| Trạng thái | Hiển thị công khai | Học viên bắt đầu được |
|---|---|---|
| `draft` | Không | Không |
| `published` | Có | Có |
| `archived` | Không | Không |

### Trạng thái phiên làm bài (Attempt)
```
in_progress → submitted → scored
in_progress → expired (qua expiresAt, trigger auto-submit)
```

| Trạng thái | Thêm câu trả lời | Nộp bài | Xem kết quả |
|---|---|---|---|
| `in_progress` | Có | Có | Không |
| `submitted` | Không | Không | Không (chờ chấm) |
| `scored` | Không | Không (idempotent) | Có |
| `expired` | Không | Không | Có (đã auto-submit) |

---

## 17. Xử lý lỗi

| Mã lỗi | HTTP status | Trường hợp xảy ra | Thông điệp |
|---|---|---|---|
| `EXAM_NOT_FOUND` | 404 | Đề thi không tồn tại hoặc chưa published | Không tìm thấy đề thi |
| `INVALID_EXAM_PASSWORD` | 401 | Mật khẩu sai | Mật khẩu không đúng |
| `MAX_ATTEMPTS_REACHED` | 400 | Đã hết số lượt làm bài | Bạn đã dùng hết số lượt làm bài |
| `ATTEMPT_NOT_IN_PROGRESS` | 400 | Attempt không phải in_progress khi thao tác | Phiên làm bài đã kết thúc |
| `ATTEMPT_EXPIRED` | 400 | Attempt đã hết thời gian | Phiên làm bài đã hết giờ |
| `ATTEMPT_NOT_FOUND` | 404 | Attempt không tồn tại | Không tìm thấy phiên làm bài |
| `RESULT_NOT_FOUND` | 404 | Chưa có kết quả (chưa chấm xong) | Chưa có kết quả |
| `FORBIDDEN` | 403 | Không có quyền | Bạn không có quyền thực hiện thao tác này |
| `QUESTION_MISSING_CORRECT_ANSWER` | 422 | Câu hỏi không có đáp án đúng | Câu hỏi phải có ít nhất một đáp án đúng |

---

## 18. Acceptance criteria

| Mã AC | Chức năng | Tiêu chí chấp nhận |
|---|---|---|
| AC-EXM-001 | Danh sách | Chỉ trả đề thi published; không trả draft |
| AC-EXM-002 | Bắt đầu | Tạo attempt thành công nếu còn lượt; 400 nếu hết lượt |
| AC-EXM-003 | Thời gian | expiresAt tính đúng = startedAt + durationMinutes |
| AC-EXM-004 | Nộp bài | Chấm điểm và tạo Result ngay sau submit |
| AC-EXM-005 | Idempotent | Submit lần 2 trả result cũ không tạo mới |
| AC-EXM-006 | Hết giờ | Attempt quá expiresAt tự động được submit |
| AC-EXM-007 | Kết quả bất biến | Result không được sửa sau khi tạo |
| AC-EXM-008 | Lời giải | Hiển thị đúng theo showAnswerPolicy |
| AC-EXM-009 | Mật khẩu | Đề có hasPassword: phải xác thực trước khi bắt đầu |
| AC-EXM-010 | Ownership | Học viên không xem được result của người khác |

---

## 19. Test/UAT scenario

| Mã kịch bản | Mô tả | Điều kiện | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|---|
| T-EXM-001 | Danh sách đề thi không cần đăng nhập | 2 published, 1 draft | GET /api/exams | Trả 2 đề published |
| T-EXM-002 | Bắt đầu làm bài thành công | Exam published, còn lượt | POST /api/exams/{id}/attempts | Attempt được tạo, nhận câu hỏi và expiresAt |
| T-EXM-003 | Bắt đầu khi hết lượt | maxAttempts=2, đã làm 2 lần | POST /api/exams/{id}/attempts | Trả 400 MAX_ATTEMPTS_REACHED |
| T-EXM-004 | Lưu câu trả lời trong attempt | Attempt in_progress | PUT /api/attempts/{id}/answers | Trả 200; câu trả lời được lưu |
| T-EXM-005 | Nộp bài và xem điểm | Đã trả lời đủ câu | POST /api/attempts/{id}/submit | Trả resultId, score, totalScore ngay |
| T-EXM-006 | Nộp bài lần 2 (idempotent) | Attempt đã scored | POST /api/attempts/{id}/submit lần 2 | Trả result cũ, không tạo mới |
| T-EXM-007 | Thêm câu sau khi đã nộp | Attempt scored | PUT /api/attempts/{id}/answers | Trả 400 ATTEMPT_NOT_IN_PROGRESS |
| T-EXM-008 | Hết thời gian tự động nộp | expiresAt đã qua, in_progress | Bất kỳ request nào | Auto-submit, trả kết quả và thông báo |
| T-EXM-009 | Đề có mật khẩu | hasPassword=true | POST attempts không có accessToken | Trả 401 |
| T-EXM-010 | Đề có mật khẩu — nhập đúng | hasPassword=true | verify-password → bắt đầu | Thành công |
| T-EXM-011 | Xem kết quả policy after_submit | Attempt scored | GET /api/attempts/{id}/result | Trả điểm, đáp án đúng, lời giải |
| T-EXM-012 | Xem kết quả người khác | Học viên B xem result của A | GET /api/attempts/{id}/result | Trả 403 |
| T-EXM-013 | Admin tạo câu hỏi không có đáp án đúng | — | POST /api/admin/questions (không có isCorrect=true) | Trả 422 QUESTION_MISSING_CORRECT_ANSWER |
| T-EXM-014 | Admin xuất bản đề thi không có câu hỏi | Đề draft, 0 câu | PUT /api/admin/exams/{id}/publish | Trả 400 |
| T-EXM-015 | Admin xuất kết quả thi | Có 10 kết quả | GET /api/admin/exams/{id}/results/export | File CSV với 10 dòng dữ liệu |

---

## 20. Phụ thuộc module khác

### Module này phụ thuộc
- **Authentication**: kiểm tra token và permission.
- **Classroom** (tuỳ chọn): kiểm tra enrollment nếu `accessLevel=enrolled`.

### Module khác phụ thuộc module này
- **Reporting**: đọc Result và Attempt để tạo báo cáo thống kê.
- **Classroom**: lesson có thể có type=exam, liên kết đến Exam.

---

## 21. Câu hỏi cần xác nhận

| Câu hỏi | Ảnh hưởng | Đề xuất tạm thời |
|---|---|---|
| Loại câu hỏi nào cần hỗ trợ? Chỉ single_choice hay cả multiple_choice, fill_in? | Model QuestionOption, ScoringService | Đề xuất: single_choice trước, mở rộng sau |
| Câu hỏi có thể dùng hình ảnh trong nội dung không? | Model Question.content | Đề xuất: cho phép HTML/markdown có ảnh |
| Có cần xáo trộn câu hỏi và đáp án theo người dùng không? | ExamConfig.shuffleQuestions | Đề xuất: có, cấu hình per-exam |
| Khi hết giờ và học viên không online, ai trigger auto-submit? | TimerService / Scheduler | Đề xuất: kiểm tra khi có request tiếp theo |
| Đề thi có cần gắn với khóa học cụ thể không? | Exam.courseId | Đề xuất: tuỳ chọn |
| Policy xem lời giải có thể cấu hình per-exam không? | ExamConfig.showAnswerPolicy | Đề xuất: có |
