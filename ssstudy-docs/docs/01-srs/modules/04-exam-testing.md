# 1. Thông tin module
- Tên module: Exam / Testing
- Mục tiêu nghiệp vụ: cho phép học viên xem danh sách đề thi/đề luyện, làm bài, nộp bài và xem kết quả; cho phép admin/teacher quản lý đề thi Word, câu hỏi, kết quả testing và báo cáo điểm.
- Phạm vi đặc tả: các chức năng được chứng minh trực tiếp từ source: danh sách đề thi Word công khai, xem chi tiết đề thi và bắt đầu làm bài, nộp bài/chấm điểm, xem kết quả/lời giải, quản lý đề thi Word ở admin, quản lý câu hỏi ở admin, quản lý testing/result ở admin và báo cáo điểm.
- Source liên quan:
  - [api-develop/app/controllers/ExamWordController.js](../../../../api-develop/app/controllers/ExamWordController.js)
  - [api-develop/app/controllers/TestingController.js](../../../../api-develop/app/controllers/TestingController.js)
  - [api-develop/app/controllers/QuestionWordController.js](../../../../api-develop/app/controllers/QuestionWordController.js)
  - [api-develop/app/controllers/ExamController.js](../../../../api-develop/app/controllers/ExamController.js)
  - [api-develop/app/routes/routes.js](../../../../api-develop/app/routes/routes.js)
  - [web-admin/src/components/Master.js](../../../../web-admin/src/components/Master.js)
  - [web-admin/src/components/exam-word/ExamList.js](../../../../web-admin/src/components/exam-word/ExamList.js)
  - [web-admin/src/components/testing/Testing.js](../../../../web-admin/src/components/testing/Testing.js)
  - [web-admin/src/components/question/Question.js](../../../../web-admin/src/components/question/Question.js)
  - [web-ssstudy/src/app/thi-thu/page.tsx](../../../../web-ssstudy/src/app/thi-thu/page.tsx)
  - [web-ssstudy/src/app/thi-thu/word-exam/[id]/page.tsx](../../../../web-ssstudy/src/app/thi-thu/word-exam/[id]/page.tsx)
  - [web-ssstudy/src/app/thi-thu/result/[id]/page.tsx](../../../../web-ssstudy/src/app/thi-thu/result/[id]/page.tsx)
  - [web-ssstudy/src/services/wordExamService.ts](../../../../web-ssstudy/src/services/wordExamService.ts)
- Màn hình liên quan:
  - web-admin: /exam-word, /exam-word/create, /exam-word/edit, /testing, /question, /exam-word/:id/report
  - web-ssstudy: /thi-thu, /thi-thu/word-exam/[id], /thi-thu/result/[id]
- API liên quan:
  - /exam-word/list
  - /exam-word/list-practice
  - /exam-word/get-by-id
  - /exam-word/check-password
  - /exam-word/check-answer
  - /exam-word/scoring
  - /exam-word/explanation
  - /exam-word/report
  - /testing/list
  - /testing/result
  - /testing/detail
  - /testing/create
  - /testing/update
  - /testing/update-point
  - /testing/delete
  - /question-word/create
  - /question-word/update
  - /question-word/delete
- Entity/table/dữ liệu liên quan:
  - ExamWord
  - QuestionWord
  - ScoreWordHistory
  - Testing
  - UserTesting
  - Classroom / Category / Chapter (để ánh xạ đề thi và testing vào lớp học)
- Mức độ xác minh: Cao

# 2. Phân quyền và kiểm soát truy cập

- Frontend công khai: [web-ssstudy/src/app/thi-thu/page.tsx](../../../../web-ssstudy/src/app/thi-thu/page.tsx), [web-ssstudy/src/app/thi-thu/word-exam/[id]/page.tsx](../../../../web-ssstudy/src/app/thi-thu/word-exam/[id]/page.tsx) và [web-ssstudy/src/app/thi-thu/result/[id]/page.tsx](../../../../web-ssstudy/src/app/thi-thu/result/[id]/page.tsx) gọi các endpoint thi thử và kết quả; các màn hình này dùng token từ localStorage/cookie khi có sẵn.
- Frontend admin: [web-admin/src/components/exam-word/ExamList.js](../../../../web-admin/src/components/exam-word/ExamList.js), [web-admin/src/components/testing/Testing.js](../../../../web-admin/src/components/testing/Testing.js) và [web-admin/src/components/question/Question.js](../../../../web-admin/src/components/question/Question.js) gọi các endpoint CRUD và quản trị điểm; không thấy logic phân quyền riêng ngoài việc dùng chung auth middleware của hệ thống.
- Backend public: [api-develop/app/routes/routes.js](../../../../api-develop/app/routes/routes.js) đăng ký các route exam-word như list/list-practice/get-by-id/check-password/check-answer/scoring/explanation; các route này không thể hiện một guard riêng trong file route, nhưng controller đọc `req.user?.user_id` khi có token và dùng `req.user` cho các trường hợp có đăng nhập.
- Backend kiểm soát quyền: [api-develop/app/routes/CheckToken.js](../../../../api-develop/app/routes/CheckToken.js) và [api-develop/app/routes/CheckScope.js](../../../../api-develop/app/routes/CheckScope.js) được dùng cho các route cần bảo vệ; scope cho admin CRUD và management testing được kỳ vọng đi qua middleware chung của hệ thống, nhưng phạm vi chi tiết của từng scope chưa được chứng minh đầy đủ ở module này.
- Điều kiện kiểm soát nghiệp vụ: bài thi Word có luồng `practiceConfig` để kiểm soát việc hiển thị kết quả ngay lập tức hay chậm, và controller scoring có xử lý riêng cho phần `NHOM_CHU_DE` với danh sách môn học và câu hỏi test.
- Rủi ro/điểm cần chú ý: routing public và logic scoring dùng chung một API; việc kiểm soát quyền xem lời giải và kết quả phụ thuộc vào cấu hình `practiceConfig`, `fast_gift` và trạng thái bài thi, nên cần xác nhận lại với dữ liệu vận hành.

# 3. Actor và phân quyền

| Actor/Role | Permission | Chức năng được phép | Điều kiện truy cập | Bằng chứng source | Ghi chú |
|---|---|---|---|---|---|
| Guest / Public user | Xem danh sách đề thi, mở đề thi công khai, nộp bài và xem kết quả nếu được phép | Xem danh sách thi thử, xem đề thi, làm bài, xem kết quả/lời giải theo cấu hình | Không bắt buộc token cho các route công khai; nếu có token thì hệ thống dùng user context để ghi nhận kết quả | [web-ssstudy/src/app/thi-thu/page.tsx](../../../../web-ssstudy/src/app/thi-thu/page.tsx), [api-develop/app/controllers/ExamWordController.js](../../../../api-develop/app/controllers/ExamWordController.js) | Hệ thống có các trường hợp practice mode và delayed result |
| STUDENT / authenticated user | Làm bài và xem kết quả cá nhân | Submit exam, xem kết quả riêng, kiểm tra câu trả lời đã làm | Backend đọc `req.user.user_id` và lưu `ScoreWordHistory` theo user | [web-ssstudy/src/services/wordExamService.ts](../../../../web-ssstudy/src/services/wordExamService.ts), [api-develop/app/controllers/ExamWordController.js](../../../../api-develop/app/controllers/ExamWordController.js) | Có hỗ trợ check-answer và check-password |
| ADMIN / TEACHER / MANAGER | Quản trị đề thi, câu hỏi, testing và báo cáo | CRUD exam-word, CRUD question-word, quản lý testing/result, xem báo cáo điểm | Thông qua admin UI và auth middleware chung | [web-admin/src/components/exam-word/ExamList.js](../../../../web-admin/src/components/exam-word/ExamList.js), [web-admin/src/components/testing/Testing.js](../../../../web-admin/src/components/testing/Testing.js), [web-admin/src/components/question/Question.js](../../../../web-admin/src/components/question/Question.js) | Scope chi tiết cần xác nhận từ config auth |

# 4. Danh sách chức năng

| Mã chức năng | Tên chức năng | Actor | Màn hình/Route | API | Controller/Service | Trạng thái xác minh |
|---|---|---|---|---|---|---|
| EXM-01 | Xem danh sách đề thi Word và đề luyện | Guest, STUDENT | /thi-thu | /exam-word/list, /exam-word/list-practice | ExamWordController.list, ExamWordController.listPractice | Đã xác nhận |
| EXM-02 | Xem chi tiết đề thi và bắt đầu làm bài | Guest, STUDENT | /thi-thu/word-exam/[id] | /exam-word/get-by-id, /exam-word/check-password | ExamWordController.getById, ExamWordController.checkPassword | Đã xác nhận |
| EXM-03 | Nộp bài và chấm điểm | STUDENT | /thi-thu/word-exam/[id] | /exam-word/scoring, /exam-word/check-answer | ExamWordController.scoring, ExamWordController.checkAnswer | Đã xác nhận |
| EXM-04 | Xem kết quả và lời giải | STUDENT | /thi-thu/result/[id] | /exam-word/explanation, /exam-word/check-answer | ExamWordController.explanation, ExamWordController.checkAnswer | Đã xác nhận |
| EXM-05 | Quản lý đề thi Word ở admin | Admin | /exam-word | /exam-word/list, /exam-word/create, /exam-word/update, /exam-word/delete, /exam-word/clone, /exam-word/report | ExamWordController | Đã xác nhận |
| EXM-06 | Quản lý câu hỏi ở admin | Admin | /question | /question-word/create, /question-word/update, /question-word/delete | QuestionWordController | Đã xác nhận |
| EXM-07 | Quản lý testing/result ở admin | Admin | /testing | /testing/list, /testing/result, /testing/detail, /testing/create, /testing/update-point, /testing/delete | TestingController | Đã xác nhận |

# 5. Đặc tả chi tiết từng chức năng

## EXM-01 Xem danh sách đề thi Word và đề luyện

### Mục đích
Cho phép học viên duyệt các đề thi Word theo bộ lọc môn học, lớp, loại đề, danh mục và trạng thái đã làm/chưa làm.

### Actor / quyền sử dụng
- Guest
- STUDENT

### Điều kiện trước
- Không bắt buộc đăng nhập cho list public.
- Hệ thống dùng các filter `classes`, `subject_name`, `type_exam`, `exam_category`, `populate_id`, `country`, `have_done` và pagination.

### Điểm khởi đầu
- Route: /thi-thu
- Màn hình: [web-ssstudy/src/app/thi-thu/page.tsx](../../../../web-ssstudy/src/app/thi-thu/page.tsx)
- Trigger: mở trang thi thử, đổi bộ lọc, đổi trang

### Dữ liệu đầu vào

| Trường dữ liệu | Kiểu dữ liệu | Bắt buộc | Validation | Nguồn dữ liệu | Ghi chú |
|---|---|---|---|---|---|
| page / limit | number | Không | Mặc định 1/12 | UI | Dùng phân trang |
| classes / country | string | Không | Filter bằng query | UI | |
| subject_name / exam_category / type_exam | string | Không | Filter bằng query | UI | |
| have_done | boolean | Không | Dùng để lọc bài đã làm/chưa làm | UI | |
| populate_id | string | Không | Dùng cho filter nhóm đề | UI | |

### Luồng chính
1. Frontend gọi /exam-word/list cho danh sách đề thi thông thường và /exam-word/list-practice cho đề luyện.
2. Backend lọc theo điều kiện `deleted_at = null` và các field filter từ params.
3. Backend trả về `data`, `totalItems`, `totalPages`, `page`, `limit` cho UI render.
4. Frontend hiện card đề thi và phân trang.

### Luồng thay thế / ngoại lệ
- Nếu không có kết quả, frontend hiển thị danh sách rỗng và total page bằng 1.
- Nếu filter không hợp lệ hoặc không có giá trị, hệ thống bỏ qua filter đó.

### Validation và business rule
- Chỉ trả về đề thi chưa bị xóa và có trạng thái phù hợp.
- Có phân biệt đề thi thông thường và đề luyện bằng `practiceConfig`.
- Có thể lọc đề đã/ chưa làm qua `have_done`.

### API liên quan

| Endpoint | Method | Request DTO/params | Response | Controller | Exception/lỗi có thể có |
|---|---|---|---|---|---|
| /exam-word/list | POST | page, limit, classes, country, subject_name, exam_category, type_exam, have_done, populate_id | data, totalItems, totalPages | ExamWordController.list | Lỗi hệ thống chung |
| /exam-word/list-practice | POST | keyword, sort_key, sort_value, status, ... | records/data | ExamWordController.listPractice | Lỗi hệ thống chung |

### Bằng chứng từ source
- [api-develop/app/controllers/ExamWordController.js](../../../../api-develop/app/controllers/ExamWordController.js)
- [web-ssstudy/src/services/wordExamService.ts](../../../../web-ssstudy/src/services/wordExamService.ts)

## EXM-02 Xem chi tiết đề thi và bắt đầu làm bài

### Mục đích
Cho phép học viên mở một đề thi Word, kiểm tra mật khẩu (nếu có) và bắt đầu làm bài.

### Actor / quyền sử dụng
- Guest
- STUDENT

### Điều kiện trước
- ID đề thi phải tồn tại.
- Nếu đề thi có mật khẩu, backend phải xác thực trước khi cho phép làm bài.

### Điểm khởi đầu
- Route: /thi-thu/word-exam/[id]
- Màn hình: [web-ssstudy/src/app/thi-thu/word-exam/[id]/page.tsx](../../../../web-ssstudy/src/app/thi-thu/word-exam/[id]/page.tsx)
- Trigger: click một đề thi từ danh sách

### Dữ liệu đầu vào

| Trường dữ liệu | Kiểu dữ liệu | Bắt buộc | Validation | Nguồn dữ liệu | Ghi chú |
|---|---|---|---|---|---|
| id | string | Có | Không rỗng | URL param | Dùng để lấy đề thi |
| password | string | Không | Nếu endpoint check-password được gọi | UI | |

### Luồng chính
1. Frontend gọi /exam-word/get-by-id với id đề thi.
2. Backend tìm theo `_id`, populate các câu hỏi và trả về cấu trúc đề thi.
3. Nếu đề thi yêu cầu mật khẩu thì UI gọi /exam-word/check-password trước khi cho vào làm bài.
4. Frontend render cấu trúc đề thi và cho phép người dùng bắt đầu.

### Luồng thay thế / ngoại lệ
- Nếu đề thi không tồn tại, trả về thông báo đề thi không tồn tại.
- Nếu mật khẩu không đúng, trả về `isValid: false`.

### Validation và business rule
- Đề thi chỉ trả về nếu chưa bị xóa (`deleted_at = null`).
- Cấu trúc đề thi có thể bao gồm `parts`, `subpart`, `children`, `questions` và các metadata như `practiceConfig`, `fast_gift`.

### API liên quan

| Endpoint | Method | Request DTO/params | Response | Controller | Exception/lỗi có thể có |
|---|---|---|---|---|---|
| /exam-word/get-by-id | GET | id | đề thi đầy đủ | ExamWordController.getById | Đề thi không tồn tại |
| /exam-word/check-password | POST | exam_id, password | isValid | ExamWordController.checkPassword | Sai mật khẩu |

## EXM-03 Nộp bài và chấm điểm

### Mục đích
Tính điểm bài làm của học viên, lưu kết quả và quyết định có hiện thưởng/ gift hay không.

### Actor / quyền sử dụng
- STUDENT

### Điều kiện trước
- Học viên đã mở đề thi và có câu trả lời.
- Nếu là đề nhóm môn, backend cần nhận thêm `subject` để xác định câu test và điểm phần nhóm.

### Điểm khởi đầu
- Route: /thi-thu/word-exam/[id]
- Trigger: hoàn thành bài thi và submit

### Dữ liệu đầu vào

| Trường dữ liệu | Kiểu dữ liệu | Bắt buộc | Validation | Nguồn dữ liệu | Ghi chú |
|---|---|---|---|---|---|
| exam_id | string | Có | ID đề thi hợp lệ | UI | |
| answers | array | Có | Mảng câu trả lời | UI | Dạng `{ question_id, answer }` |
| time_doing | number | Không | Số giây làm bài | UI | |
| subject | array | Không | Danh sách môn học cho đề nhóm môn | UI | |

### Luồng chính
1. Frontend gửi payload `answers`, `time_doing` và `exam_id` tới /exam-word/scoring.
2. Backend lấy đề thi, tính điểm cho từng câu theo loại câu hỏi và cấu hình phần điểm.
3. Backend lưu `ScoreWordHistory` với tổng điểm, tổng câu hỏi, phần chia theo section và logs câu hỏi.
4. Backend có thể gắn gift image/URL theo `fast_gift` và `practiceConfig`.

### Luồng thay thế / ngoại lệ
- Nếu không có câu trả lời, hệ thống vẫn xử lý và trả về tổng điểm bằng 0.
- Nếu cấu hình practice mode là `result_display=LATER`, kết quả có thể bị chặn cho tới khi hết hạn.

### Validation và business rule
- Hệ thống hỗ trợ chấm đúng/sai cho multiple choice, true/false, fill in blank và drag-drop.
- Đối với câu hỏi true/false multi, hệ thống có thể tính điểm theo tỷ lệ dựa trên `point_true_false`.
- Đối với đề nhóm môn, câu hỏi test có thể bị bỏ qua/không tính điểm theo logic `subjectSkipTestQuestion`.

### API liên quan

| Endpoint | Method | Request DTO/params | Response | Controller | Exception/lỗi có thể có |
|---|---|---|---|---|---|
| /exam-word/scoring | POST | exam_id, answers, time_doing, subject | total_score_achieve, total_exam_point, exam_section | ExamWordController.scoring | Thiếu thông tin bài thi, đề thi không tồn tại |
| /exam-word/check-answer | POST | user_id, exam_id | hasTaken, latestScore | ExamWordController.checkAnswer | Chưa làm bài |

## EXM-04 Xem kết quả và lời giải

### Mục đích
Cho phép học viên xem lại kết quả bài thi mình vừa làm và xem lời giải chi tiết của đề thi.

### Actor / quyền sử dụng
- STUDENT

### Điều kiện trước
- Bài làm đã được lưu bởi /exam-word/scoring.
- Nếu `practiceConfig.result_display=LATER`, kết quả có thể chưa hiển thị cho tới khi trạng thái kết thúc.

### Điểm khởi đầu
- Route: /thi-thu/result/[id]
- Màn hình: [web-ssstudy/src/app/thi-thu/result/[id]/page.tsx](../../../../web-ssstudy/src/app/thi-thu/result/[id]/page.tsx)
- Trigger: nộp bài thành công hoặc mở lại kết quả từ history

### Luồng chính
1. Frontend gọi /exam-word/check-answer để lấy kết quả mới nhất cho user và exam.
2. Backend đọc `ScoreWordHistory` và trả về `questions_correct`, `total_score_achieve`, `time_doing`, `question_logs` và `gift` nếu có.
3. Frontend hiển thị điểm, thời gian và kết quả chi tiết.
4. Nếu học viên mở lời giải, frontend gọi /exam-word/explanation để lấy đáp án đúng và giải thích.

### Validation và business rule
- Nếu chưa làm bài thì API trả về `hasTaken: false`.
- Nếu có gift cấu hình thì gift image/URL/CTA có thể được đính kèm trong response.

## EXM-05 Quản lý đề thi Word ở admin

### Mục đích
Cho phép admin tạo, chỉnh sửa, sao chép, xem báo cáo và xóa đề thi Word.

### Actor / quyền sử dụng
- Admin

### Điều kiện trước
- Người dùng có quyền admin/teacher/manager được bảo vệ bởi middleware auth/scope chung.
- Đề thi cần có tên và thời gian làm bài tối thiểu; backend kiểm tra `name` và `time` khi tạo bản ghi.

### Điểm khởi đầu
- Route: /exam-word, /exam-word/create, /exam-word/edit, /exam-word/:id/report
- Màn hình: [web-admin/src/components/exam-word/ExamList.js](../../../../web-admin/src/components/exam-word/ExamList.js)

### Luồng chính
1. Admin mở danh sách đề thi Word và sử dụng các thao tác CRUD.
2. Backend tạo/chỉnh sửa đề thi bằng cách lưu cấu trúc `parts/subpart/children/questions` vào document ExamWord.
3. Hệ thống có thể tạo mới câu hỏi word liên kết và tính lại tổng điểm dựa trên `score`/`questions_score`.
4. Admin có thể xem báo cáo điểm bằng /exam-word/report.

### Validation và business rule
- Tạo/sửa đề thi có thể xử lý cấu trúc phần câu hỏi lồng nhau và tạo các `QuestionWord` mới nếu câu hỏi chưa tồn tại.
- Hệ thống hỗ trợ `clone` đề thi và `report` để thống kê điểm và câu hỏi.

## EXM-06 Quản lý câu hỏi ở admin

### Mục đích
Cho phép admin tạo, sửa và xóa câu hỏi Word dùng cho đề thi.

### Actor / quyền sử dụng
- Admin

### Điều kiện trước
- Câu hỏi cần có nội dung, loại câu hỏi và đáp án đúng.

### Luồng chính
1. Admin nhập nội dung câu hỏi và đáp án đúng trên UI.
2. Frontend gửi tới /question-word/create hoặc /question-word/update.
3. Backend tạo bản ghi `QuestionWord` và trả về ID câu hỏi.
4. Câu hỏi này có thể được dùng lại trong nhiều đề thi Word thông qua reference.

## EXM-07 Quản lý testing/result ở admin

### Mục đích
Cho phép admin xem danh sách testing, cập nhật điểm, xóa bản ghi và xem chi tiết kết quả từng testing.

### Actor / quyền sử dụng
- Admin

### Điều kiện trước
- Có testing record hoặc submission từ học viên.

### Luồng chính
1. Admin mở danh sách testing và lọc theo classroom/subject/status.
2. Hệ thống đọc các bản ghi `Testing` và triển khai update-point cho từng bản ghi.
3. Admin có thể xem chi tiết result hoặc xóa testing nếu cần.

# 6. Mối quan hệ dữ liệu nổi bật

- `ExamWord` lưu cấu trúc đề thi và tham chiếu tới `QuestionWord` trong phần `parts.subpart.children.questions.question`.
- `ScoreWordHistory` lưu kết quả làm bài của từng học viên cho một bài thi Word.
- `Testing` và `UserTesting` lưu các testing record/classroom assessment khác nhau; trong controller này được dùng nhiều cho luồng quản trị và kết quả bài làm.
- `Classroom`, `Chapter` và `Category` đóng vai trò mapping đề thi/testing vào lớp học và chương mục.

# 7. Kịch bản kiểm thử trọng tâm

1. Kiểm tra danh sách đề thi công khai hiển thị đúng bộ lọc môn/lớp/loại đề.
2. Kiểm tra mở đề thi bằng ID và trường hợp đề có mật khẩu.
3. Kiểm tra nộp bài có tạo `ScoreWordHistory` và tính đúng tổng điểm.
4. Kiểm tra kết quả bài làm hiển thị đúng `questions_correct`, `total_score_achieve` và `gift_image` khi cấu hình cho phép.
5. Kiểm tra admin tạo/sửa/xóa đề thi Word và câu hỏi Word.
6. Kiểm tra admin cập nhật điểm testing và xem báo cáo điểm.

# 8. Câu hỏi cần xác nhận / rủi ro

- [CẦN XÁC NHẬN] Scope/permission chi tiết của role `TEACHER`, `SUPPORTER`, `MANAGER` trong admin chưa được xác minh đầy đủ từ config auth.
- [CẦN XÁC NHẬN] Logic `testing` trong [api-develop/app/controllers/TestingController.js](../../../../api-develop/app/controllers/TestingController.js) có nhiều trạng thái và điều kiện classroom/subject; cần đối chiếu thêm với UI thật tế để tránh hiểu sai.
- [CẦN XÁC NHẬN] Luồng bảo mật cho exam có mật khẩu và đề luyện có kết quả bị chặn chưa được thấy đầy đủ ở frontend.
- [RỦI RO / TECHNICAL DEBT] Public exam routes và scoring API dùng chung auth context nhưng không có guard rõ ràng trong route registry; việc phân quyền nên được kiểm tra lại khi triển khai.
