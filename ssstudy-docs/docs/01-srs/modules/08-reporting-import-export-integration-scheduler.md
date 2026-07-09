# Reporting / Import / Export / Integration / Scheduler — SRS mục tiêu

## 1. Thông tin module
- Tên module: Reporting / Import / Export / Integration / Scheduler
- Mục tiêu nghiệp vụ: cung cấp chức năng báo cáo và import/export cho hệ thống SSStudy, đồng thời quản lý job/scheduler và tích hợp ngoài một cách rõ ràng, an toàn và có thể audit.
- Mục tiêu tài liệu: đây là tài liệu SRS mục tiêu cho module; nội dung hiển thị yêu cầu nghiệp vụ, use case, business rule và kiểm thử.
- Phạm vi đặc tả: báo cáo, import/export, job/scheduler và tích hợp bên ngoài; ưu tiên các workflow vận hành và quản trị.
- Phạm vi không bao gồm: BI realtime phức tạp, data warehouse, tích hợp kế toán toàn diện, ETL offline lớn.

## 2. Mục tiêu nghiệp vụ
- Cung cấp dashboard vận hành cho admin.
- Hỗ trợ import dữ liệu ban đầu và dữ liệu hàng loạt theo định dạng template.
- Hỗ trợ export dữ liệu phục vụ báo cáo và quản trị.
- Hỗ trợ job/scheduler xử lý nhiệm vụ định kỳ và đối soát trạng thái.
- Hỗ trợ cấu hình tích hợp ngoài và đảm bảo retry/log cho các luồng tích hợp.

## 3. Phạm vi chức năng
- Dashboard tổng quan trạng thái hệ thống.
- Báo cáo học viên.
- Báo cáo khóa học/lớp học.
- Báo cáo đề thi/kết quả thi.
- Báo cáo doanh thu/đơn hàng/thanh toán.
- Export danh sách học viên.
- Export kết quả thi.
- Export đơn hàng/doanh thu.
- Import học viên.
- Import ngân hàng câu hỏi.
- Import tài liệu hoặc metadata tài liệu.
- Scheduler hết hạn membership.
- Scheduler cập nhật trạng thái payment/order.
- Scheduler gửi nhắc học / notification dự phòng.
- Tích hợp payment/reconciliation thông qua cấu hình adapter.
- Ghi nhận lịch sử chạy job và kết quả.

## 4. Ngoài phạm vi
- BI realtime phức tạp và dashboard analytic đầy đủ.
- Data warehouse/OLAP đích.
- Tích hợp kế toán chi tiết nếu chưa xác nhận.
- Import/export dạng streaming cho dữ liệu khổng lồ.
- Machine learning và dự báo tự động.

## 5. Actor
- Super admin
- Admin vận hành
- Admin học vụ
- Admin tài chính
- Admin nội dung
- Hệ thống scheduler

## 6. Permission
- REPORT_VIEW_DASHBOARD
- REPORT_VIEW_LEARNING
- REPORT_VIEW_REVENUE
- REPORT_EXPORT
- IMPORT_STUDENT
- IMPORT_QUESTION
- IMPORT_DOCUMENT
- JOB_VIEW
- JOB_RUN_MANUAL
- JOB_RETRY
- INTEGRATION_CONFIG_MANAGE

## 7. Dữ liệu chính
- User / Student
- Classroom / Course
- Enrollment / Membership
- Exam
- Attempt / Result
- Order / Payment
- Coupon / Credit
- Import batch
- Export request
- Job execution log
- Integration config

## 8. Use case chi tiết

### UC-REPORT-001 — Xem dashboard tổng quan
- Mục tiêu: hiển thị số liệu tổng quan vận hành cho admin.
- Actor chính: Super admin, Admin vận hành.
- Actor phụ: Admin tài chính, Admin học vụ.
- Điều kiện trước: người dùng đã đăng nhập và có permission REPORT_VIEW_DASHBOARD.
- Trigger: admin mở trang dashboard.
- Luồng chính:
  1. Người dùng truy cập trang dashboard.
  2. Frontend gọi API GET /api/v1/reports/dashboard.
  3. Backend xác thực token và permission.
  4. Backend truy xuất số liệu học viên, đơn hàng, doanh thu, job lỗi và trạng thái import/export.
  5. Backend trả payload tổng hợp.
  6. Frontend hiển thị biểu đồ và chỉ số.
- Luồng thay thế:
  - Nếu dữ liệu chưa thể tính đầy đủ do job đang chạy, trả partial data và ghi chú trạng thái.
- Luồng lỗi:
  - Nếu thiếu permission, trả 403.
  - Nếu service report lỗi, trả 500 với mã lỗi rõ.
- Dữ liệu đầu vào: token, query filter (dateFrom, dateTo, module).
- Dữ liệu đầu ra: số lượng học viên, đơn hàng, doanh thu, import batch status count, job execution summary.
- Business rule áp dụng: BR-REPORT-001, BR-JOB-001.
- Permission áp dụng: REPORT_VIEW_DASHBOARD.
- Acceptance criteria:
  - Dashboard chỉ truy cập được khi permission đúng.
  - Nếu API trả lỗi, frontend hiển thị thông báo rõ.
- Ghi chú: báo cáo không thay đổi dữ liệu gốc.

### UC-REPORT-002 — Xem báo cáo học tập của học viên
- Mục tiêu: cung cấp báo cáo hiệu suất học tập từng học viên.
- Actor chính: Admin học vụ.
- Actor phụ: Super admin.
- Điều kiện trước: permission REPORT_VIEW_LEARNING.
- Trigger: admin mở trang báo cáo học viên.
- Luồng chính:
  1. Frontend gọi GET /api/v1/reports/students?classroomId=&period=.
  2. Backend xác thực permission.
  3. Backend lấy dữ liệu học viên, membership, exam attempts, progress.
  4. Backend trả bảng tổng hợp.
  5. Frontend hiển thị bảng và filter.
- Luồng thay thế:
  - Nếu classroomId không hợp lệ, trả 400.
- Luồng lỗi:
  - Nếu thiếu permission, trả 403.
- Dữ liệu đầu vào: classroomId, period, search.
- Dữ liệu đầu ra: học viên, tiến độ, điểm, trạng thái membership.
- Business rule áp dụng: BR-REPORT-001, BR-JOB-001.
- Permission áp dụng: REPORT_VIEW_LEARNING.
- Acceptance criteria:
  - Báo cáo cho biết tình trạng membership và kết quả thi.
  - Không hiển thị dữ liệu của học viên ngoài phạm vi chọn.
- Ghi chú: dữ liệu report có thể lấy từ read model hoặc aggregated query.

### UC-REPORT-003 — Xem báo cáo kết quả thi
- Mục tiêu: cung cấp báo cáo kết quả thi và phân tích đề thi.
- Actor chính: Admin học vụ.
- Actor phụ: Admin vận hành.
- Điều kiện trước: permission REPORT_VIEW_LEARNING.
- Trigger: admin mở trang báo cáo kết quả thi.
- Luồng chính:
  1. Frontend gọi GET /api/v1/reports/exams?examId=&period=.
  2. Backend xác thực permission.
  3. Backend lấy dữ liệu attempts, average score, pass rate.
  4. Backend trả payload.
  5. Frontend hiển thị biểu đồ và bảng.
- Luồng thay thế:
  - Nếu examId không tồn tại, trả 404.
- Luồng lỗi:
  - Nếu thiếu permission, trả 403.
- Dữ liệu đầu vào: examId, period, filter.
- Dữ liệu đầu ra: summary điểm, histogram, pass rate, attempts.
- Business rule áp dụng: BR-REPORT-001.
- Permission áp dụng: REPORT_VIEW_LEARNING.
- Acceptance criteria:
  - Báo cáo phải có số liệu chính xác so với attempt result.

### UC-REPORT-004 — Xem báo cáo doanh thu
- Mục tiêu: cung cấp báo cáo doanh thu và trạng thái đơn hàng.
- Actor chính: Admin tài chính.
- Actor phụ: Super admin.
- Điều kiện trước: permission REPORT_VIEW_REVENUE.
- Trigger: admin mở trang báo cáo doanh thu.
- Luồng chính:
  1. Frontend gọi GET /api/v1/reports/revenue?dateFrom=&dateTo=.
  2. Backend xác thực permission.
  3. Backend lấy dữ liệu order/payment, refund, coupon.
  4. Backend trả payload.
  5. Frontend hiển thị tổng doanh thu, số đơn hàng, thống kê trạng thái.
- Luồng thay thế:
  - Nếu khoảng thời gian quá dài, backend trả warning và đề xuất export batch.
- Luồng lỗi:
  - Nếu thiếu permission, trả 403.
- Dữ liệu đầu vào: dateFrom, dateTo, currency.
- Dữ liệu đầu ra: revenueSummary, orderCount, refundCount, couponDiscount.
- Business rule áp dụng: BR-REPORT-001.
- Permission áp dụng: REPORT_VIEW_REVENUE.
- Acceptance criteria:
  - Báo cáo không dựa trên dữ liệu client.
  - Dữ liệu bảo mật chỉ hiển thị với permission thích hợp.

### UC-REPORT-005 — Export dữ liệu báo cáo
- Mục tiêu: cho phép admin export báo cáo thành file CSV/Excel.
- Actor chính: Admin vận hành, Admin tài chính.
- Actor phụ: Super admin.
- Điều kiện trước: permission REPORT_EXPORT.
- Trigger: admin nhấn nút export trên dashboard/báo cáo.
- Luồng chính:
  1. Frontend gọi POST /api/v1/exports/reports với filter và format.
  2. Backend xác thực permission.
  3. Backend tạo export request, lưu trạng thái và bật job async export.
  4. Backend trả export request id.
  5. Frontend gọi GET /api/v1/exports/{id}/status và GET /api/v1/exports/{id}/download khi hoàn thành.
- Luồng thay thế:
  - Nếu dữ liệu lớn, export chạy async và trả status pending.
- Luồng lỗi:
  - Nếu thiếu permission, trả 403.
  - Nếu format không hỗ trợ, trả 400.
- Dữ liệu đầu vào: reportType, dateFrom, dateTo, format.
- Dữ liệu đầu ra: exportRequestId, status.
- Business rule áp dụng: BR-REPORT-001, BR-JOB-001.
- Permission áp dụng: REPORT_EXPORT.
- Acceptance criteria:
  - Export không trả dữ liệu raw trong response synchronous.
  - Export sensitive data chỉ khi permission đúng.

### UC-IMPORT-001 — Import danh sách học viên
- Mục tiêu: cho phép admin học vụ import danh sách học viên bằng file template.
- Actor chính: Admin học vụ.
- Actor phụ: Super admin.
- Điều kiện trước: permission IMPORT_STUDENT.
- Trigger: admin upload file import học viên.
- Luồng chính:
  1. Frontend gọi POST /api/v1/imports/students với file và metadata.
  2. Backend xác thực permission.
  3. Backend lưu import batch, phân tích file, validate từng dòng.
  4. Backend trả import batch id và kết quả sơ bộ.
  5. Backend xử lý import async; lưu import line result và lỗi.
- Luồng thay thế:
  - Nếu file sai template, trả 400 và mô tả template.
  - Nếu duplicate record không rõ ràng, dừng hoặc ghi chú theo policy.
- Luồng lỗi:
  - Nếu thiếu permission, trả 403.
  - Nếu file bị lỗi nghiêm trọng, trả 422 với chi tiết dòng lỗi.
- Dữ liệu đầu vào: file CSV/Excel, templateVersion.
- Dữ liệu đầu ra: importBatchId, status, errorSummary.
- Business rule áp dụng: BR-IMPORT-001.
- Permission áp dụng: IMPORT_STUDENT.
- Acceptance criteria:
  - File import phải có warning/error line rõ ràng.
  - Không import ghi đè dữ liệu nếu không có rule.

### UC-IMPORT-002 — Import ngân hàng câu hỏi
- Mục tiêu: import câu hỏi số lượng lớn theo định dạng chuẩn.
- Actor chính: Admin nội dung.
- Actor phụ: Super admin.
- Điều kiện trước: permission IMPORT_QUESTION.
- Trigger: admin upload file câu hỏi.
- Luồng chính:
  1. Frontend gọi POST /api/v1/imports/questions.
  2. Backend xác thực permission.
  3. Backend lưu batch và validate cấu trúc câu hỏi.
  4. Backend tạo/ cập nhật question records theo policy.
  5. Backend trả status import.
- Luồng thay thế:
  - Nếu template không đúng, trả 400.
  - Nếu một dòng có lỗi, batch ghi lại lỗi dòng và tiếp tục import các dòng khác nếu policy cho phép.
- Luồng lỗi:
  - Thiếu permission: 403.
  - File invalid: 422.
- Dữ liệu đầu vào: file, questionBankId, templateVersion.
- Dữ liệu đầu ra: importBatchId, processedCount, errorCount.
- Business rule áp dụng: BR-IMPORT-001.
- Permission áp dụng: IMPORT_QUESTION.
- Acceptance criteria:
  - Dòng lỗi phải có thông báo cụ thể.
  - Cập nhật không được làm sai lệch bộ dữ liệu câu hỏi.

### UC-IMPORT-003 — Import tài liệu hoặc metadata tài liệu
- Mục tiêu: import metadata tài liệu, liên kết tài liệu với classroom hoặc course.
- Actor chính: Admin nội dung.
- Actor phụ: Admin vận hành.
- Điều kiện trước: permission IMPORT_DOCUMENT.
- Trigger: upload file metadata tài liệu.
- Luồng chính:
  1. Frontend gọi POST /api/v1/imports/documents.
  2. Backend xác thực permission.
  3. Backend validate template, nếu hợp lệ lưu batch.
  4. Backend xử lý import async và ghi log dòng.
- Luồng thay thế:
  - Nếu file thiếu dữ liệu bắt buộc, trả 422.
  - Nếu đã tồn tại tài liệu giống, theo policy duplicate xử lý.
- Luồng lỗi:
  - Thiếu permission: 403.
  - Template sai: 400.
- Dữ liệu đầu vào: file, classroomId, documentCategory.
- Dữ liệu đầu ra: importBatchId, status, errorSummary.
- Business rule áp dụng: BR-IMPORT-001.
- Permission áp dụng: IMPORT_DOCUMENT.
- Acceptance criteria:
  - File import đúng template.
  - Không ghi đè nếu chưa có rule rõ.

### UC-JOB-001 — Scheduler xử lý hết hạn membership
- Mục tiêu: tự động cập nhật trạng thái membership khi đến hạn.
- Actor chính: Hệ thống scheduler.
- Điều kiện trước: có membership có expiryDate.
- Trigger: job chạy theo lịch định kỳ.
- Luồng chính:
  1. Scheduler khởi chạy theo cron.
  2. Backend lấy membership hết hạn hoặc sắp hết hạn.
  3. Backend cập nhật trạng thái membership thành expired hoặc grace.
  4. Backend ghi log job execution.
- Luồng thay thế:
  - Nếu không tìm thấy record, job ghi log và kết thúc.
- Luồng lỗi:
  - Nếu exception, job ghi lỗi, rollback nếu cần và retry theo policy.
- Dữ liệu đầu vào: schedule config, current timestamp.
- Dữ liệu đầu ra: jobExecutionLog, processedCount.
- Business rule áp dụng: BR-JOB-001.
- Permission áp dụng: JOB_RUN_MANUAL.
- Acceptance criteria:
  - Job idempotent và an toàn khi chạy nhiều lần.

### UC-JOB-002 — Scheduler đối soát payment/order
- Mục tiêu: kiểm tra trạng thái payment/order và đồng bộ nếu cần.
- Actor chính: Hệ thống scheduler.
- Điều kiện trước: có order/payment chưa xác nhận.
- Trigger: cron job hoặc manual trigger.
- Luồng chính:
  1. Scheduler lấy order Payment pending / webhook chưa xử lý.
  2. Scheduler gọi service đối soát trạng thái.
  3. Scheduler cập nhật trạng thái order/payment nếu xác định.
  4. Scheduler ghi log và notify nếu cần.
- Luồng thay thế:
  - Nếu không có record, job kết thúc bình thường.
- Luồng lỗi:
  - Nếu service external lỗi, ghi log và retry theo policy.
- Dữ liệu đầu vào: job config, order filter.
- Dữ liệu đầu ra: reconciliation report, jobExecutionLog.
- Business rule áp dụng: BR-JOB-002.
- Permission áp dụng: JOB_RUN_MANUAL.
- Acceptance criteria:
  - Trạng thái order và payment được đối soát đúng.
  - Job idempotent khi chạy lại.

### UC-JOB-003 — Xem lịch sử job
- Mục tiêu: admin xem lịch sử chạy job và trạng thái.
- Actor chính: Admin vận hành.
- Điều kiện trước: permission JOB_VIEW.
- Trigger: truy cập trang lịch sử job.
- Luồng chính:
  1. Frontend gọi GET /api/v1/jobs/executions?status=&type=.
  2. Backend xác thực permission.
  3. Backend trả danh sách job execution logs.
  4. Frontend hiển thị chi tiết.
- Luồng lỗi:
  - Thiếu permission: 403.
- Dữ liệu đầu vào: filter.
- Dữ liệu đầu ra: list jobExecutionLog.
- Business rule áp dụng: BR-JOB-001.
- Permission áp dụng: JOB_VIEW.

### UC-JOB-004 — Chạy lại job lỗi
- Mục tiêu: admin retry job thất bại.
- Actor chính: Admin vận hành.
- Actor phụ: Super admin.
- Điều kiện trước: permission JOB_RETRY.
- Trigger: click retry trên lịch sử job.
- Luồng chính:
  1. Frontend gọi POST /api/v1/jobs/{id}/retry.
  2. Backend xác thực permission.
  3. Backend xác định job đã lỗi và enqueue lại.
  4. Backend trả status retry.
- Luồng lỗi:
  - Nếu job không tồn tại hoặc không lỗi, trả 400.
  - Thiếu permission: 403.
- Dữ liệu đầu vào: job id.
- Dữ liệu đầu ra: retryRequestId, status.
- Business rule áp dụng: BR-JOB-001.
- Permission áp dụng: JOB_RETRY.
- Acceptance criteria:
  - Chỉ retry job lỗi.
  - Job vẫn phải idempotent.

### UC-INTEGRATION-001 — Cấu hình tích hợp ngoài
- Mục tiêu: quản lý cấu hình tích hợp service bên ngoài.
- Actor chính: Admin vận hành.
- Điều kiện trước: permission INTEGRATION_CONFIG_MANAGE.
- Trigger: mở trang cấu hình tích hợp.
- Luồng chính:
  1. Frontend gọi GET /api/v1/integrations/config.
  2. Backend xác thực permission.
  3. Backend trả cấu hình hiện tại.
  4. Admin cập nhật qua PUT /api/v1/integrations/config.
  5. Backend validate và lưu cấu hình.
- Luồng lỗi:
  - Thiếu permission: 403.
  - Validate cấu hình sai: 422.
- Dữ liệu đầu vào: serviceType, credentials, enabled, retryPolicy.
- Dữ liệu đầu ra: integrationConfig.
- Business rule áp dụng: BR-INTEGRATION-001.
- Permission áp dụng: INTEGRATION_CONFIG_MANAGE.
- Acceptance criteria:
  - Cấu hình lưu lại rõ service adapter và retry policy.

## 9. User story chi tiết

- Với vai trò Super admin hoặc Admin vận hành
- Tôi muốn xem dashboard vận hành tổng quan
- Để giám sát tình trạng hệ thống, đơn hàng và job
- Priority: Must
- Business value: Giúp nhanh chóng phát hiện sự cố và trạng thái vận hành
- Acceptance criteria:
  - Khi tôi truy cập trang dashboard và có permission REPORT_VIEW_DASHBOARD, tôi thấy số liệu tổng quan.
  - Nếu dữ liệu chưa đầy đủ, tôi nhận thông báo trạng thái.
- UI note: hiển thị chỉ số summary, biểu đồ và trạng thái job.
- API note: GET /api/v1/reports/dashboard.
- Data note: tổng số học viên, đơn hàng, revenue, job error count.
- Rule liên quan: BR-REPORT-001, BR-JOB-001.
- Test scenario: tạo mock data đơn hàng, chạy API và verify payload.

- Với vai trò Admin học vụ
- Tôi muốn xem báo cáo học tập của học viên
- Để đánh giá tiến độ và điểm số
- Priority: Should
- Business value: Giúp cải thiện chất lượng đào tạo
- Acceptance criteria:
  - Khi tôi truy cập báo cáo và có permission REPORT_VIEW_LEARNING, tôi nhận bảng học viên với tiến độ và điểm.
- UI note: bảng filter theo lớp học và khoảng thời gian.
- API note: GET /api/v1/reports/students.
- Data note: membership status, exam result.
- Rule liên quan: BR-REPORT-001.
- Test scenario: verify API trả học viên trong classroom hợp lệ.

- Với vai trò Admin tài chính
- Tôi muốn xem báo cáo doanh thu
- Để kiểm tra doanh thu và trạng thái đơn hàng
- Priority: Must
- Business value: Giúp quản lý doanh thu và hạch toán.
- Acceptance criteria:
  - Khi tôi có permission REPORT_VIEW_REVENUE, tôi nhận dữ liệu doanh thu chính xác.
- UI note: biểu đồ doanh thu và trạng thái order.
- API note: GET /api/v1/reports/revenue.
- Data note: payment amounts, refunds.
- Rule liên quan: BR-REPORT-001.

- Với vai trò Admin học vụ
- Tôi muốn import danh sách học viên
- Để tiết kiệm thời gian tạo tài khoản hàng loạt
- Priority: Must
- Business value: Giảm thao tác thủ công và lỗi nhập liệu.
- Acceptance criteria:
  - Nếu file hợp lệ, hệ thống tạo import batch và ghi rõ lỗi dòng.
- UI note: form upload file và hiển thị kết quả import.
- API note: POST /api/v1/imports/students.
- Data note: student email, phone, classroomId.
- Rule liên quan: BR-IMPORT-001.

- Với vai trò Admin nội dung
- Tôi muốn import ngân hàng câu hỏi
- Để nhanh chóng cập nhật câu hỏi cho đề thi.
- Priority: Should
- Business value: Tiết kiệm thời gian quản trị nội dung.
- Acceptance criteria:
  - Hệ thống validate template và lưu lỗi dòng.
- UI note: upload file câu hỏi.
- API note: POST /api/v1/imports/questions.
- Data note: question text, answer options, correct answer.
- Rule liên quan: BR-IMPORT-001.

- Với vai trò Admin vận hành
- Tôi muốn xem lịch sử job và chạy lại job lỗi
- Để theo dõi và khắc phục vấn đề tự động.
- Priority: Should
- Business value: Giảm gián đoạn do job bị lỗi.
- Acceptance criteria:
  - Tôi có thể xem job history và retry job lỗi.
- UI note: danh sách job status và nút retry.
- API note: GET /api/v1/jobs/executions, POST /api/v1/jobs/{id}/retry.
- Rule liên quan: BR-JOB-001.

- Với vai trò Admin vận hành
- Tôi muốn cấu hình tích hợp ngoài
- Để cập nhật service adapter, secret và retry policy.
- Priority: Should
- Business value: Đảm bảo các tích hợp hoạt động an toàn.
- Acceptance criteria:
  - Cấu hình lưu được và có retry policy rõ.
- UI note: trang cấu hình tích hợp.
- API note: GET/PUT /api/v1/integrations/config.
- Rule liên quan: BR-INTEGRATION-001.

## 10. Business rule
- BR-REPORT-001: Reporting phải đọc dữ liệu gốc đúng, không sửa đổi nguồn dữ liệu và chỉ hiển thị với permission tương ứng.
- BR-REPORT-002: Export dữ liệu nếu có sensitive fields phải kiểm tra permission REPORT_EXPORT và mask/hide các trường nhạy cảm khi cần.
- BR-IMPORT-001: Import phải validate template, kiểm tra dữ liệu bắt buộc và không ghi đè dữ liệu nếu chưa có rule ghi đè rõ.
- BR-JOB-001: Scheduler phải idempotent và ghi log job execution cho mọi lần chạy.
- BR-JOB-002: Scheduler retry lỗi phải tuân thủ retry policy và không gây duplicate side effects.
- BR-INTEGRATION-001: Tích hợp ngoài phải được cấu hình qua adapter/service riêng, có log, retry policy và không cập nhật dữ liệu nếu callback không xác thực.

## 11. Validation
- File import phải đúng template và có header định danh.
- Dữ liệu bắt buộc phải có: email/phone cho học viên import, question text/correct answer cho question import, document metadata required fields.
- Nếu dòng import lỗi, phải lưu thông báo lỗi rõ ràng với row number và reason.
- Không import duplicate record nếu không có rule ghi đè rõ.
- Export phải kiểm tra permission REPORT_EXPORT.
- Báo cáo doanh thu không được dựa trên dữ liệu client.
- Job phải idempotent nếu có thể, nghĩa là chạy lại không tạo kết quả trùng hoặc sai.
- Job lỗi phải có log, status và policy retry.

## 12. State machine

### Import batch
- NEW -> VALIDATING -> PROCESSING -> COMPLETED
- VALIDATING -> FAILED nếu template/dòng lỗi nghiêm trọng.
- PROCESSING -> PARTIAL_SUCCESS nếu có lỗi dòng nhưng batch vẫn chạy.
- PROCESSING -> COMPLETED khi tất cả dòng xử lý xong.
- PROCESSING -> FAILED nếu lỗi hệ thống.

### Export request
- REQUESTED -> PROCESSING -> READY -> FAILED
- REQUESTED -> FAILED nếu payload invalid.
- PROCESSING -> READY khi file đã xuất thành công.
- PROCESSING -> FAILED nếu lỗi tạo file.

### Job execution
- SCHEDULED -> RUNNING -> SUCCEEDED -> FAILED
- RUNNING -> RETRY_SCHEDULED nếu có lỗi và retry policy.
- FAILED -> RETRY_SCHEDULED khi retry được phép.
- SUCCEEDED -> COMPLETED.

### Integration status
- DRAFT -> ACTIVE -> SUSPENDED -> RETIRED
- ACTIVE -> SUSPENDED nếu cấu hình lỗi hoặc authentication fail.
- SUSPENDED -> ACTIVE khi cải thiện cấu hình.
- ACTIVE -> RETIRED khi không còn dùng.

## 13. API requirement
- GET /api/v1/reports/dashboard
- GET /api/v1/reports/students
- GET /api/v1/reports/exams
- GET /api/v1/reports/revenue
- POST /api/v1/exports/reports
- GET /api/v1/exports/{id}/status
- GET /api/v1/exports/{id}/download
- POST /api/v1/imports/students
- POST /api/v1/imports/questions
- POST /api/v1/imports/documents
- GET /api/v1/jobs/executions
- POST /api/v1/jobs/{id}/retry
- GET /api/v1/integrations/config
- PUT /api/v1/integrations/config

## 14. UI requirement
- Dashboard tổng quan với số liệu vận hành và trạng thái job.
- Trang báo cáo học tập học viên.
- Trang báo cáo đề thi/kết quả.
- Trang báo cáo doanh thu.
- Trang export history và download export file.
- Trang import với form upload file và kết quả kiểm tra.
- Trang export history với trạng thái từng export request.
- Trang job history với trạng thái, log tóm tắt và nút retry.
- Trang integration config với form cấu hình adapter và retry policy.

## 15. Error/exception
- 400: invalid request, template error, invalid filter.
- 401: unauthorized.
- 403: forbidden, thiếu permission.
- 404: resource not found (report/exam/job/config).
- 422: validation failed, file line errors.
- 500: internal error trong report/import/export/job.
- EXPORT_NOT_READY: export file chưa sẵn.
- IMPORT_TEMPLATE_INVALID: file template không đúng.
- JOB_ALREADY_RUNNING: job đang chạy.
- INTEGRATION_CONFIG_INVALID: cấu hình tích hợp không hợp lệ.

## 16. Acceptance criteria
- Các trang báo cáo chỉ truy cập được khi permission chính xác.
- Export chạy async và trả export request id.
- Import lưu batch, line error và không ghi đè khi không rõ.
- Scheduler ghi log, idempotent và retry theo chính sách.
- Integration config lưu và áp retry policy.
- Báo cáo không thay đổi dữ liệu nguồn.

## 17. Test/UAT scenario
- Tạo user admin có permission REPORT_VIEW_DASHBOARD, truy cập dashboard và xác nhận các chỉ số.
- Chạy GET /api/v1/reports/revenue với quyền REPORT_VIEW_REVENUE và xác nhận payload.
- Upload import students file valid và invalid, kiểm tra batch status và line errors.
- Upload import questions file valid và invalid.
- Tạo export request, kiểm tra export request status và download file.
- Chạy scheduler job manual và tự động, kiểm tra log và idempotency.
- Cập nhật integration config và thử gọi service adapter với cấu hình mới.

## 18. Phụ thuộc module khác
- Authentication: xác thực user, permission.
- Classroom: dữ liệu khóa học, membership.
- Exam: dữ liệu attempt/result cho báo cáo.
- Order/Payment: dữ liệu doanh thu, trạng thái đơn hàng, coupon.
- Document: metadata tài liệu khi import tài liệu.
- Content pages: nếu báo cáo cần metadata nội dung.

## 19. Câu hỏi cần xác nhận
- Những trường dữ liệu bắt buộc trong template import học viên là gì?
- Chính sách xử lý duplicate khi import question/document ra sao?
- Chế độ export cần hỗ trợ định dạng CSV, Excel hay JSON?
- Các trường sensitive nào cần mask khi export report?
- Scheduler nên chạy theo cron nào và có cần alert khi lỗi không?
- Cần hỗ trợ export theo user/role hay chỉ theo admin?

## 20. Legacy reference
- Tài liệu này là source of truth. Trong trường hợp cần đối chiếu hiện trạng legacy, tham khảo các source code và tài liệu discovery/analysis cũ như `docs/00-discovery/` và `docs/02-analysis/`.
