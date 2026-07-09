# Reporting / Import / Export / Integration / Scheduler — SRS mục tiêu

> Tài liệu đặc tả yêu cầu phần mềm (SRS) cho module Reporting/Import/Export/Integration/Scheduler của hệ thống SSStudy.
> Viết như thể hệ thống chưa có code. Mục tiêu: đủ chi tiết để developer triển khai hoàn chỉnh chỉ từ tài liệu này.

---

## 1. Mục tiêu nghiệp vụ

Module này là trụ cột vận hành của hệ thống SSStudy, phục vụ cho đội ngũ quản trị:

- Cung cấp dashboard và báo cáo tổng quan về học viên, tiến độ học, kết quả thi và doanh thu.
- Hỗ trợ import dữ liệu hàng loạt: học viên, ngân hàng câu hỏi, tài liệu và mã sách.
- Hỗ trợ export báo cáo dưới dạng file CSV/XLSX để phân tích ngoại tuyến.
- Tự động hóa các tác vụ vận hành định kỳ qua scheduler: hết hạn membership, đối soát thanh toán, gửi nhắc học.
- Quản lý lịch sử và retry cho mọi job tự động.
- Cấu hình và giám sát các tích hợp với dịch vụ bên ngoài (payment gateway, email, notification).

---

## 2. Phạm vi chức năng

| STT | Chức năng | Mô tả ngắn |
|---|---|---|
| 1 | Dashboard tổng quan | Số liệu học viên, đơn hàng, doanh thu, trạng thái job |
| 2 | Báo cáo học viên | Danh sách học viên, trạng thái enrollment, tiến độ |
| 3 | Báo cáo khóa học | Số học viên, tỷ lệ hoàn thành, đánh giá |
| 4 | Báo cáo tiến độ học tập | Chi tiết bài học đã hoàn thành theo học viên |
| 5 | Báo cáo kết quả thi | Điểm trung bình, phân phối điểm, tỷ lệ đạt |
| 6 | Báo cáo doanh thu | Tổng thu, theo khoảng thời gian, theo sản phẩm |
| 7 | Báo cáo đơn hàng/thanh toán | Trạng thái đơn, phương thức thanh toán, hoàn tiền |
| 8 | Export báo cáo | Tải file CSV/XLSX cho mọi loại báo cáo |
| 9 | Import học viên | Upload file tạo tài khoản hàng loạt |
| 10 | Import ngân hàng câu hỏi | Upload file tạo câu hỏi hàng loạt |
| 11 | Import tài liệu (metadata) | Upload file gắn tài liệu vào hệ thống |
| 12 | Import mã sách | Upload file danh sách mã kích hoạt |
| 13 | Lịch sử import/export | Theo dõi trạng thái các batch đã xử lý |
| 14 | Scheduler hết hạn membership | Tự động cập nhật enrollment expired |
| 15 | Scheduler đối soát payment | Kiểm tra và đồng bộ trạng thái đơn hàng |
| 16 | Scheduler gửi nhắc học | Gửi thông báo nhắc nhở học viên |
| 17 | Lịch sử job | Xem danh sách và chi tiết mọi job đã chạy |
| 18 | Retry job lỗi | Chạy lại job thất bại |
| 19 | Chạy job thủ công | Admin kích hoạt job ngoài lịch |
| 20 | Cấu hình tích hợp | Quản lý cấu hình dịch vụ ngoài |
| 21 | Đối soát thanh toán | Báo cáo đối chiếu giao dịch webhook vs đơn hàng |

---

## 3. Ngoài phạm vi

- BI realtime và data warehouse đầy đủ chức năng.
- Machine learning và dự báo tự động.
- Import/export streaming cho file khổng lồ (> 100MB).
- Tích hợp kế toán chi tiết (ERP, SAP).
- Hệ thống notification push đa nền tảng đầy đủ.
- Dashboard analytics cho từng học viên xem.

---

## 4. Actor

| Actor | Mô tả | Quyền cơ bản |
|---|---|---|
| superAdmin | Quản trị cấp cao | Toàn quyền bao gồm cấu hình tích hợp nhạy cảm |
| adminVanHanh | Admin vận hành | Dashboard, job, integration config, export |
| adminHocVu | Admin học vụ | Báo cáo học tập, import học viên/câu hỏi |
| adminTaiChinh | Admin tài chính | Báo cáo doanh thu, đối soát payment, export tài chính |
| adminNoiDung | Admin nội dung | Import câu hỏi, tài liệu, mã sách |
| hệ thống | Scheduler tự động | Chạy job định kỳ |

---

## 5. Permission

| Mã permission | Mô tả | Role mặc định |
|---|---|---|
| `REPORT_VIEW_DASHBOARD` | Xem dashboard tổng quan | superAdmin, adminVanHanh |
| `REPORT_VIEW_LEARNING` | Xem báo cáo học tập và kết quả thi | superAdmin, adminVanHanh, adminHocVu |
| `REPORT_VIEW_REVENUE` | Xem báo cáo doanh thu và đơn hàng | superAdmin, adminVanHanh, adminTaiChinh |
| `REPORT_EXPORT` | Tải file export báo cáo | superAdmin, adminVanHanh, adminTaiChinh, adminHocVu |
| `IMPORT_STUDENT` | Import danh sách học viên | superAdmin, adminHocVu |
| `IMPORT_QUESTION` | Import ngân hàng câu hỏi | superAdmin, adminNoiDung |
| `IMPORT_DOCUMENT` | Import metadata tài liệu | superAdmin, adminNoiDung |
| `IMPORT_BOOK_CODE` | Import mã sách | superAdmin, adminNoiDung |
| `JOB_VIEW` | Xem lịch sử và trạng thái job | superAdmin, adminVanHanh |
| `JOB_RUN_MANUAL` | Kích hoạt job thủ công | superAdmin, adminVanHanh |
| `JOB_RETRY` | Chạy lại job lỗi | superAdmin, adminVanHanh |
| `INTEGRATION_CONFIG_MANAGE` | Xem và sửa cấu hình tích hợp | superAdmin |

---

## 6. Danh sách chức năng

| Mã chức năng | Tên chức năng | Actor | Màn hình đề xuất | API đề xuất | Dịch vụ nghiệp vụ cần có | Dữ liệu/model liên quan | Quy tắc áp dụng | Priority |
|---|---|---|---|---|---|---|---|---|
| RPT-01 | Dashboard tổng quan | adminVanHanh, superAdmin | `/admin/dashboard` | `GET /api/admin/dashboard` | Tổng hợp số liệu từ nhiều module | DashboardMetric | BR-RPT-001, REPORT_VIEW_DASHBOARD | Must |
| RPT-02 | Báo cáo học viên | adminHocVu, superAdmin | `/admin/reports/learning` | `GET /api/admin/reports/learning` | Lấy dữ liệu enrollment, progress | ReportQuery | BR-RPT-001, REPORT_VIEW_LEARNING | Must |
| RPT-03 | Báo cáo tiến độ học tập | adminHocVu | `/admin/reports/learning` | `GET /api/admin/reports/progress` | Tổng hợp LessonProgress theo khóa học | ReportQuery | BR-RPT-001 | Should |
| RPT-04 | Báo cáo kết quả thi | adminHocVu | `/admin/reports/exam-results` | `GET /api/admin/reports/exam-results` | Tổng hợp Attempt/Result | ReportQuery | BR-RPT-001, REPORT_VIEW_LEARNING | Must |
| RPT-05 | Báo cáo doanh thu | adminTaiChinh, superAdmin | `/admin/reports/revenue` | `GET /api/admin/reports/revenue` | Tổng hợp Order/Payment | ReportQuery | BR-RPT-001, REPORT_VIEW_REVENUE | Must |
| RPT-06 | Báo cáo đơn hàng/thanh toán | adminTaiChinh | `/admin/reports/orders` | `GET /api/admin/reports/orders` | Phân tích Order/PaymentTransaction | ReportQuery | BR-RPT-001 | Should |
| EXP-01 | Tạo yêu cầu export | adminVanHanh, adminTaiChinh | `/admin/exports` | `POST /api/admin/exports` | Tạo ExportRequest, enqueue job | ExportRequest | BR-RPT-002, REPORT_EXPORT | Must |
| EXP-02 | Xem danh sách export | admin | `/admin/exports` | `GET /api/admin/exports` | Danh sách ExportRequest của user | ExportRequest | REPORT_EXPORT | Must |
| EXP-03 | Tải file export | admin | `/admin/exports/{id}` | `GET /api/admin/exports/{exportId}/download` | Trả signed URL cho file đã sẵn | ExportFile | REPORT_EXPORT | Must |
| IMP-01 | Import học viên | adminHocVu | `/admin/imports/students` | `POST /api/admin/imports/students` | Validate file, tạo ImportBatch, xử lý async | ImportBatch, ImportRowError | BR-IMP-001, IMPORT_STUDENT | Must |
| IMP-02 | Import câu hỏi | adminNoiDung | `/admin/imports/questions` | `POST /api/admin/imports/questions` | Validate cấu trúc câu hỏi, import async | ImportBatch, ImportRowError | BR-IMP-001, IMPORT_QUESTION | Must |
| IMP-03 | Import tài liệu | adminNoiDung | `/admin/imports/documents` | `POST /api/admin/imports/documents` | Validate metadata, gắn với khóa học/danh mục | ImportBatch, ImportRowError | BR-IMP-001, IMPORT_DOCUMENT | Should |
| IMP-04 | Import mã sách | adminNoiDung | `/admin/imports/book-codes` | `POST /api/admin/imports/book-codes` | Validate mã, tạo BookCode hàng loạt | ImportBatch, BookCode | BR-IMP-001, IMPORT_BOOK_CODE | Should |
| IMP-05 | Xem lịch sử import | admin | `/admin/imports` | `GET /api/admin/imports` | Danh sách ImportBatch với trạng thái | ImportBatch | — | Must |
| IMP-06 | Xem chi tiết lỗi import | admin | `/admin/imports/{batchId}` | `GET /api/admin/imports/{batchId}/errors` | Danh sách ImportRowError | ImportRowError | — | Must |
| JOB-01 | Xem danh sách job | adminVanHanh | `/admin/jobs` | `GET /api/admin/jobs` | Danh sách JobDefinition | JobDefinition | JOB_VIEW | Must |
| JOB-02 | Xem lịch sử thực thi | adminVanHanh | `/admin/jobs/{jobId}` | `GET /api/admin/jobs/{jobId}/executions` | Danh sách JobExecution với trạng thái | JobExecution | JOB_VIEW | Must |
| JOB-03 | Chạy job thủ công | adminVanHanh | `/admin/jobs/{jobId}` | `POST /api/admin/jobs/{jobId}/run` | Enqueue job ngay lập tức | JobExecution | JOB_RUN_MANUAL | Must |
| JOB-04 | Retry job lỗi | adminVanHanh | `/admin/jobs/{jobId}` | `POST /api/admin/job-executions/{executionId}/retry` | Kiểm tra trạng thái failed, enqueue lại | JobExecution | JOB_RETRY | Must |
| INT-01 | Xem cấu hình tích hợp | superAdmin | `/admin/integrations` | `GET /api/admin/integrations` | Danh sách IntegrationConfig | IntegrationConfig | INTEGRATION_CONFIG_MANAGE | Must |
| INT-02 | Cập nhật cấu hình tích hợp | superAdmin | `/admin/integrations/{id}` | `PUT /api/admin/integrations/{integrationId}` | Validate và lưu cấu hình | IntegrationConfig | INTEGRATION_CONFIG_MANAGE | Must |
| INT-03 | Xem lịch sử tích hợp | superAdmin | `/admin/integrations/{id}/events` | `GET /api/admin/integrations/{id}/events` | Danh sách IntegrationEvent | IntegrationEvent | INTEGRATION_CONFIG_MANAGE | Should |
| REC-01 | Đối soát thanh toán | adminTaiChinh | `/admin/reconciliation` | `GET /api/admin/reconciliation` | So sánh webhook vs Order | PaymentReconciliationRecord | REPORT_VIEW_REVENUE | Should |

---

## 7. Thiết kế dữ liệu / Domain model đề xuất

### Model chính

| Model | Mục đích | Field quan trọng | Quan hệ |
|---|---|---|---|
| ReportDefinition | Định nghĩa loại báo cáo | id, code, name, queryTemplate, permissions | |
| ReportQuery | Tham số truy vấn báo cáo | id, reportCode, params, requestedBy, createdAt | |
| DashboardMetric | Chỉ số dashboard đã tổng hợp | id, key, value, computedAt | Cache snapshot |
| ExportRequest | Yêu cầu xuất file | id, reportType, params, status, requestedBy | Có một ExportFile |
| ExportFile | File xuất đã tạo | id, exportRequestId, storagePath, fileName, fileSize | FK tới ExportRequest |
| ImportBatch | Lô import dữ liệu | id, type, status, totalRows, processedRows, errorRows, uploadedBy | Có nhiều ImportRowError |
| ImportRowError | Lỗi từng dòng trong import | id, batchId, rowNumber, errorMessage, rawData | FK tới ImportBatch |
| JobDefinition | Định nghĩa job | id, code, name, cronExpression, isEnabled, description | Có nhiều JobExecution |
| JobExecution | Lần chạy job | id, jobDefinitionId, status, startedAt, finishedAt, triggeredBy | Có nhiều JobExecutionLog |
| JobExecutionLog | Log chi tiết từng lần chạy | id, executionId, level, message, createdAt | FK tới JobExecution |
| IntegrationConfig | Cấu hình tích hợp ngoài | id, serviceCode, name, status, config (encrypted), retryPolicy | Có nhiều IntegrationEvent |
| IntegrationEvent | Lịch sử gọi/nhận từ dịch vụ ngoài | id, integrationId, direction, status, payload, errorMessage | FK tới IntegrationConfig |
| PaymentReconciliationRecord | Đối soát giao dịch | id, orderId, gatewayTxId, orderStatus, gatewayStatus, discrepancy | |

### Field chi tiết

#### Model: ImportBatch
| Field | Kiểu dữ liệu | Bắt buộc | Ý nghĩa | Validation |
|---|---|---|---|---|
| id | UUID | Có | Khóa chính | |
| type | enum | Có | Loại import | student, question, document, book_code |
| status | enum | Có | Trạng thái | pending, validating, processing, completed, partial_failed, failed |
| originalFileName | varchar(255) | Có | Tên file gốc | |
| storagePath | varchar(500) | Có | Đường dẫn file trên storage | Không expose ra ngoài |
| totalRows | int | Không | Tổng số dòng | Cập nhật sau validate |
| processedRows | int | Không | Số dòng đã xử lý | |
| errorRows | int | Không | Số dòng lỗi | |
| uploadedBy | UUID FK | Có | Người upload | |
| startedAt | timestamp | Không | Thời điểm bắt đầu xử lý | |
| completedAt | timestamp | Không | Thời điểm hoàn thành | |
| createdAt | timestamp | Có | Thời điểm tạo | Auto |

#### Model: ExportRequest
| Field | Kiểu dữ liệu | Bắt buộc | Ý nghĩa | Validation |
|---|---|---|---|---|
| id | UUID | Có | Khóa chính | |
| reportType | enum | Có | Loại báo cáo | learning, exam_results, revenue, orders, students |
| params | jsonb | Không | Tham số lọc (dateFrom, dateTo, filters) | |
| format | enum | Có | Định dạng | csv, xlsx |
| status | enum | Có | Trạng thái | pending, processing, ready, failed |
| requestedBy | UUID FK | Có | Người yêu cầu | |
| createdAt | timestamp | Có | | Auto |
| completedAt | timestamp | Không | Thời điểm hoàn thành | |

#### Model: JobExecution
| Field | Kiểu dữ liệu | Bắt buộc | Ý nghĩa | Validation |
|---|---|---|---|---|
| id | UUID | Có | Khóa chính | |
| jobDefinitionId | UUID FK | Có | Thuộc job định nghĩa | |
| status | enum | Có | Trạng thái | scheduled, running, succeeded, failed, retrying |
| triggeredBy | enum | Có | Cách kích hoạt | scheduler, manual, retry |
| startedAt | timestamp | Không | | |
| finishedAt | timestamp | Không | | |
| processedCount | int | Không | Số bản ghi xử lý | |
| errorCount | int | Không | Số lỗi gặp | |
| errorSummary | text | Không | Tóm tắt lỗi | |
| retryCount | int | Có | Số lần đã retry | Mặc định 0 |

#### Model: IntegrationConfig
| Field | Kiểu dữ liệu | Bắt buộc | Ý nghĩa | Validation |
|---|---|---|---|---|
| id | UUID | Có | Khóa chính | |
| serviceCode | varchar(50) | Có | Mã dịch vụ | Unique; payos, smtp, onesignal |
| name | varchar(100) | Có | Tên hiển thị | |
| status | enum | Có | Trạng thái | active, suspended, retired |
| config | jsonb (encrypted) | Có | Cấu hình (API key, endpoint, v.v.) | Phải mã hoá trước khi lưu |
| retryPolicy | jsonb | Không | Số lần retry, delay, backoff | |
| updatedAt | timestamp | Có | | Auto |

### Index / Constraint đề xuất

| Bảng | Index / Constraint | Mục đích |
|---|---|---|
| ImportBatch | INDEX(type, status, createdAt) | Lọc và sắp xếp nhanh |
| ImportRowError | INDEX(batchId, rowNumber) | Tra cứu lỗi theo batch |
| ExportRequest | INDEX(requestedBy, status, createdAt) | Lịch sử export của user |
| JobExecution | INDEX(jobDefinitionId, status, startedAt) | Lọc lịch sử job |
| JobExecutionLog | INDEX(executionId, createdAt) | Tra cứu log theo execution |
| IntegrationEvent | INDEX(integrationId, createdAt) | Lịch sử gọi theo service |

---

## 8. Thiết kế kiến trúc module

### Thành phần cần có

| Thành phần | Vai trò | Ghi chú triển khai |
|---|---|---|
| API layer (Controller) | Nhận request, validate permission, gọi service | Không chứa business logic |
| ReportingService | Tổng hợp dữ liệu báo cáo từ nhiều module | Chỉ đọc, không ghi; dùng read-only queries |
| DashboardService | Tính toán và cache chỉ số dashboard | Cache ngắn hạn; invalidate theo lịch |
| ExportService | Tạo ExportRequest, enqueue job export | Export lớn phải chạy async |
| ExportJobProcessor | Xử lý job export: lấy dữ liệu, tạo file, lưu storage | Gọi StorageAdapter; cập nhật ExportRequest |
| ImportService | Validate file, tạo ImportBatch, enqueue job import | Kiểm tra template trước khi enqueue |
| ImportJobProcessor | Xử lý từng dòng, ghi ImportRowError, cập nhật batch | Không dừng khi gặp lỗi một dòng |
| SchedulerService | Quản lý cron job, kích hoạt job theo lịch | Mỗi job phải idempotent |
| JobExecutionService | Tạo JobExecution, ghi log, cập nhật trạng thái | Gọi từ SchedulerService và manual trigger |
| RetryService | Kiểm tra job failed, enqueue lại theo policy | Tăng retryCount; không retry vô hạn |
| IntegrationConfigService | Quản lý IntegrationConfig, mã hoá credential | Credential lưu mã hoá, không log plain |
| IntegrationAdapter | Interface chung cho các dịch vụ ngoài | Mỗi dịch vụ có adapter riêng |
| ReconciliationService | Đối soát PaymentTransaction vs Order | Đọc từ module Order/Payment |
| StorageAdapter | Tương tác với S3-compatible cho export/import file | Dùng signed URL cho download |

### Dependency
- Module này phụ thuộc Authentication để kiểm tra token và permission.
- Module này **chỉ đọc** dữ liệu từ: Classroom, Exam, Order/Payment, Document, Book.
- Không ghi trực tiếp vào bảng của module khác.
- Import học viên gọi UserService (Authentication) để tạo tài khoản.
- Import câu hỏi gọi QuestionService (Exam) để tạo câu hỏi.
- Scheduler hết hạn membership gọi EnrollmentService (Classroom).
- Scheduler đối soát payment gọi OrderService (Order/Payment).

### Nguyên tắc triển khai
- **Reporting không được ghi dữ liệu nguồn** — chỉ đọc.
- **Export lớn phải async**: tạo ExportRequest → job xử lý → signed URL khi ready.
- **Import không dừng khi lỗi một dòng**: ghi ImportRowError, tiếp tục dòng khác.
- **Job phải idempotent**: chạy lại không tạo kết quả sai hoặc trùng lặp.
- **Credential tích hợp phải mã hoá** trước khi lưu DB; không log plain text.
- **RetryCount có giới hạn** theo retryPolicy; không retry vô hạn.
- Export file lưu trên storage, không trả nhị phân trực tiếp trong response.
- DashboardMetric có thể cache trong Redis để tránh query nặng mỗi lần.

---

## 9. Yêu cầu giao diện

| Màn hình | Route đề xuất | Actor | Mục đích | API sử dụng |
|---|---|---|---|---|
| Dashboard | `/admin/dashboard` | adminVanHanh | Tổng quan số liệu và trạng thái | `GET /api/admin/dashboard` |
| Báo cáo học tập | `/admin/reports/learning` | adminHocVu | Học viên, tiến độ, kết quả thi | Report APIs |
| Báo cáo doanh thu | `/admin/reports/revenue` | adminTaiChinh | Doanh thu, đơn hàng, hoàn tiền | `GET /api/admin/reports/revenue` |
| Export | `/admin/exports` | admin | Tạo, theo dõi, tải file export | Export APIs |
| Import học viên | `/admin/imports/students` | adminHocVu | Upload file, xem kết quả | `POST /api/admin/imports/students` |
| Import câu hỏi | `/admin/imports/questions` | adminNoiDung | Upload file câu hỏi | `POST /api/admin/imports/questions` |
| Lịch sử import | `/admin/imports` | admin | Danh sách batch và trạng thái | `GET /api/admin/imports` |
| Chi tiết lỗi import | `/admin/imports/{batchId}` | admin | Xem lỗi từng dòng | `GET /api/admin/imports/{batchId}/errors` |
| Quản lý job | `/admin/jobs` | adminVanHanh | Danh sách job và lịch chạy | `GET /api/admin/jobs` |
| Lịch sử job | `/admin/jobs/{jobId}` | adminVanHanh | Lịch sử thực thi, log, retry | Job Execution APIs |
| Cấu hình tích hợp | `/admin/integrations` | superAdmin | Xem và sửa cấu hình | Integration APIs |
| Đối soát thanh toán | `/admin/reconciliation` | adminTaiChinh | Đối chiếu giao dịch | `GET /api/admin/reconciliation` |

**Yêu cầu UI chi tiết:**
- Dashboard: card số liệu lớn (tổng học viên, đơn hàng tháng này, doanh thu, job lỗi); biểu đồ trend 30 ngày.
- Trang import: drag-and-drop file; progress bar xử lý; bảng lỗi theo dòng với thông báo rõ.
- Trang export: dropdown loại báo cáo, date picker; nút tải file khi status=ready.
- Trang job: bảng với cột: tên job, lần chạy gần nhất, trạng thái, nút "Chạy ngay", nút "Xem log".
- Trang tích hợp: form theo nhóm service; credential ẩn dạng password field; test connection.

---

## 10. API đề xuất

| Mã API | Method | Endpoint đề xuất | Mục đích | Auth required | Permission | Request chính | Response chính | Business rule | Ghi chú |
|---|---|---|---|---|---|---|---|---|---|
| API-RPT-001 | GET | `/api/admin/dashboard` | Dashboard tổng quan | Có | `REPORT_VIEW_DASHBOARD` | `?dateFrom, dateTo` | `{ metrics, jobSummary, importSummary }` | BR-RPT-001 | Cache 5 phút |
| API-RPT-002 | GET | `/api/admin/reports/learning` | Báo cáo học viên | Có | `REPORT_VIEW_LEARNING` | `?courseId, from, to, page, limit` | `{ items, total, summary }` | BR-RPT-001 | |
| API-RPT-003 | GET | `/api/admin/reports/progress` | Báo cáo tiến độ | Có | `REPORT_VIEW_LEARNING` | `?courseId, userId, from, to` | `{ items, total }` | BR-RPT-001 | |
| API-RPT-004 | GET | `/api/admin/reports/exam-results` | Báo cáo kết quả thi | Có | `REPORT_VIEW_LEARNING` | `?examId, from, to, page` | `{ avgScore, passRate, distribution, items }` | BR-RPT-001 | |
| API-RPT-005 | GET | `/api/admin/reports/revenue` | Báo cáo doanh thu | Có | `REPORT_VIEW_REVENUE` | `?from, to, groupBy` | `{ total, byDay, byProduct, refundTotal }` | BR-RPT-001 | |
| API-RPT-006 | GET | `/api/admin/reports/orders` | Báo cáo đơn hàng | Có | `REPORT_VIEW_REVENUE` | `?from, to, status, method` | `{ items, total, summary }` | BR-RPT-001 | |
| API-RPT-007 | GET | `/api/admin/reconciliation` | Đối soát thanh toán | Có | `REPORT_VIEW_REVENUE` | `?from, to, status` | `{ items, discrepancyCount }` | BR-RPT-001 | |
| API-EXP-001 | POST | `/api/admin/exports` | Tạo yêu cầu export | Có | `REPORT_EXPORT` | `{ reportType, params, format }` | `{ exportId, status }` | BR-RPT-002 | Chạy async |
| API-EXP-002 | GET | `/api/admin/exports` | Danh sách export | Có | `REPORT_EXPORT` | `?page, limit` | `{ items, total }` | — | Của user hiện tại |
| API-EXP-003 | GET | `/api/admin/exports/{exportId}` | Trạng thái export | Có | `REPORT_EXPORT` | — | `{ exportRequest, status }` | — | |
| API-EXP-004 | GET | `/api/admin/exports/{exportId}/download` | Tải file export | Có | `REPORT_EXPORT` | — | `{ downloadUrl, expiresAt }` | BR-RPT-002 | Signed URL; 400 nếu chưa ready |
| API-IMP-001 | POST | `/api/admin/imports/students` | Import học viên | Có | `IMPORT_STUDENT` | `multipart/form-data` | `{ batchId, status }` | BR-IMP-001 | Validate → async |
| API-IMP-002 | POST | `/api/admin/imports/questions` | Import câu hỏi | Có | `IMPORT_QUESTION` | `multipart/form-data` | `{ batchId, status }` | BR-IMP-001 | |
| API-IMP-003 | POST | `/api/admin/imports/documents` | Import tài liệu | Có | `IMPORT_DOCUMENT` | `multipart/form-data` | `{ batchId, status }` | BR-IMP-001 | |
| API-IMP-004 | POST | `/api/admin/imports/book-codes` | Import mã sách | Có | `IMPORT_BOOK_CODE` | `multipart/form-data` | `{ batchId, status }` | BR-IMP-001 | |
| API-IMP-005 | GET | `/api/admin/imports` | Lịch sử import | Có | Mọi import permission | `?type, status, page` | `{ items, total }` | — | |
| API-IMP-006 | GET | `/api/admin/imports/{batchId}` | Chi tiết batch | Có | Mọi import permission | — | `{ batch, errorCount }` | — | |
| API-IMP-007 | GET | `/api/admin/imports/{batchId}/errors` | Lỗi từng dòng | Có | Mọi import permission | `?page, limit` | `{ items, total }` | — | |
| API-JOB-001 | GET | `/api/admin/jobs` | Danh sách job | Có | `JOB_VIEW` | — | `{ items }` | — | |
| API-JOB-002 | GET | `/api/admin/jobs/{jobId}/executions` | Lịch sử thực thi | Có | `JOB_VIEW` | `?status, page, limit` | `{ items, total }` | — | |
| API-JOB-003 | GET | `/api/admin/job-executions/{executionId}/logs` | Log chi tiết | Có | `JOB_VIEW` | `?page, limit` | `{ items, total }` | — | |
| API-JOB-004 | POST | `/api/admin/jobs/{jobId}/run` | Chạy job thủ công | Có | `JOB_RUN_MANUAL` | — | `{ executionId }` | BR-JOB-001 | Kiểm tra không có job đang running |
| API-JOB-005 | POST | `/api/admin/job-executions/{executionId}/retry` | Retry job lỗi | Có | `JOB_RETRY` | — | `{ newExecutionId }` | BR-JOB-001, BR-JOB-002 | Chỉ retry status=failed |
| API-INT-001 | GET | `/api/admin/integrations` | Danh sách tích hợp | Có | `INTEGRATION_CONFIG_MANAGE` | — | `{ items }` | — | Không trả secret |
| API-INT-002 | GET | `/api/admin/integrations/{integrationId}` | Chi tiết tích hợp | Có | `INTEGRATION_CONFIG_MANAGE` | — | `{ integration }` | — | Che khuất credential |
| API-INT-003 | PUT | `/api/admin/integrations/{integrationId}` | Cập nhật cấu hình | Có | `INTEGRATION_CONFIG_MANAGE` | `{ config, retryPolicy, status }` | `{ ok }` | BR-INT-001 | Mã hoá trước khi lưu |
| API-INT-004 | GET | `/api/admin/integrations/{integrationId}/events` | Lịch sử tích hợp | Có | `INTEGRATION_CONFIG_MANAGE` | `?page, from, to` | `{ items, total }` | — | |

---

## 11. Use case nghiệp vụ

### UC-REPORT-001 — Xem dashboard tổng quan

- **Mục tiêu**: Admin nhìn thấy ngay toàn cảnh hoạt động hệ thống trong một màn hình.
- **Actor chính**: adminVanHanh, superAdmin.
- **Điều kiện trước**: Đăng nhập và có permission `REPORT_VIEW_DASHBOARD`.
- **Trigger**: Admin mở trang `/admin/dashboard`.
- **Luồng chính**:
  1. Admin mở trang dashboard.
  2. Frontend gọi `GET /api/admin/dashboard` với filter thời gian.
  3. DashboardService tổng hợp: tổng học viên, đơn hàng hôm nay, doanh thu tháng này, số job lỗi, import đang xử lý.
  4. Trả payload; frontend render card và biểu đồ.
- **Luồng thay thế**: Có job đang xử lý → trả partial data kèm `isPartial: true`.
- **Luồng lỗi**: Không có permission → 403; service lỗi → 500 với mã lỗi rõ.
- **Business rule áp dụng**: BR-RPT-001.
- **Acceptance criteria**: Dashboard chỉ hiển thị với đúng permission; dữ liệu không bị sửa đổi.

---

### UC-REPORT-002 — Xem báo cáo học tập

- **Mục tiêu**: Admin học vụ theo dõi tiến độ và kết quả học của học viên trong khóa học.
- **Actor chính**: adminHocVu.
- **Điều kiện trước**: Permission `REPORT_VIEW_LEARNING`.
- **Luồng chính**:
  1. Admin chọn khóa học và khoảng thời gian.
  2. Hệ thống trả danh sách học viên kèm số bài đã hoàn thành, phần trăm tiến độ, điểm thi gần nhất.
  3. Admin có thể lọc theo trạng thái enrollment và sắp xếp theo tiến độ.
- **Business rule áp dụng**: BR-RPT-001.
- **Acceptance criteria**: Số liệu khớp với LessonProgress và Attempt trong DB.

---

### UC-REPORT-003 — Xem báo cáo kết quả thi

- **Mục tiêu**: Admin học vụ phân tích chất lượng đề thi và kết quả học viên.
- **Actor chính**: adminHocVu.
- **Điều kiện trước**: Permission `REPORT_VIEW_LEARNING`.
- **Luồng chính**:
  1. Admin chọn đề thi và khoảng thời gian.
  2. Hệ thống trả điểm trung bình, phân phối điểm (histogram), tỷ lệ đạt, tổng số lượt làm.
  3. Admin xem chi tiết từng học viên nếu cần.
- **Business rule áp dụng**: BR-RPT-001.
- **Acceptance criteria**: Số liệu khớp với ExamAttempt và Result trong DB.

---

### UC-REPORT-004 — Xem báo cáo doanh thu

- **Mục tiêu**: Admin tài chính theo dõi doanh thu, đơn hàng và đối soát thanh toán.
- **Actor chính**: adminTaiChinh.
- **Điều kiện trước**: Permission `REPORT_VIEW_REVENUE`.
- **Luồng chính**:
  1. Admin chọn khoảng thời gian.
  2. Hệ thống trả tổng doanh thu, doanh thu theo ngày/sản phẩm, số đơn hàng theo trạng thái, số tiền hoàn.
  3. Admin xem biểu đồ trend và bảng chi tiết.
- **Luồng thay thế**: Khoảng thời gian quá dài (> 12 tháng) → trả cảnh báo đề xuất export.
- **Business rule áp dụng**: BR-RPT-001.
- **Acceptance criteria**: Tổng doanh thu khớp với Order.finalAmount khi status=paid.

---

### UC-REPORT-005 — Export báo cáo

- **Mục tiêu**: Admin tải báo cáo về file để phân tích ngoại tuyến hoặc chia sẻ.
- **Actor chính**: adminTaiChinh, adminHocVu.
- **Điều kiện trước**: Permission `REPORT_EXPORT`.
- **Luồng chính**:
  1. Admin chọn loại báo cáo, khoảng thời gian, định dạng (CSV hoặc XLSX).
  2. POST `/api/admin/exports` → nhận exportId.
  3. ExportService tạo ExportRequest (status=pending), enqueue job.
  4. ExportJobProcessor lấy dữ liệu, tạo file, lưu storage, cập nhật status=ready.
  5. Admin polling hoặc xem danh sách export.
  6. Khi status=ready: nhấn "Tải file" → nhận signed URL → tải về.
- **Luồng lỗi**: File chưa ready → 400 `EXPORT_NOT_READY`; hết hạn signed URL → yêu cầu lại.
- **Business rule áp dụng**: BR-RPT-001, BR-RPT-002.
- **Acceptance criteria**: File không bao giờ được trả nhị phân trong response API; signed URL hết hạn sau 10 phút.

---

### UC-IMPORT-001 — Import danh sách học viên

- **Mục tiêu**: Admin học vụ tạo tài khoản hàng loạt từ file template.
- **Actor chính**: adminHocVu.
- **Điều kiện trước**: Permission `IMPORT_STUDENT`; có file CSV đúng template.
- **Luồng chính**:
  1. Admin upload file CSV với cột: fullname, email, phone, password (optional), courseId (optional).
  2. ImportService validate template header.
  3. Tạo ImportBatch (status=validating).
  4. Validate từng dòng: email hợp lệ, email chưa tồn tại.
  5. Với dòng lỗi → ghi ImportRowError; tiếp tục dòng tiếp.
  6. Với dòng hợp lệ → gọi UserService tạo tài khoản; nếu có courseId → gọi EnrollmentService.
  7. Cập nhật batch status → completed hoặc partial_failed.
- **Luồng lỗi**: Template sai → 400 ngay, không tạo batch; lỗi từng dòng → ghi ImportRowError, tiếp tục.
- **Business rule áp dụng**: BR-IMP-001.
- **Acceptance criteria**: Email trùng ghi lỗi rõ ràng; không ghi đè tài khoản đã tồn tại.

---

### UC-IMPORT-002 — Import ngân hàng câu hỏi

- **Mục tiêu**: Admin nội dung nhập số lượng lớn câu hỏi vào ngân hàng.
- **Actor chính**: adminNoiDung.
- **Điều kiện trước**: Permission `IMPORT_QUESTION`; file CSV đúng template.
- **Luồng chính**:
  1. Admin upload file CSV với cột: content, type, option_a, option_b, option_c, option_d, correct_answer, explanation.
  2. ImportService validate template, tạo ImportBatch.
  3. Với mỗi dòng: validate bắt buộc có correct_answer; gọi QuestionService tạo Question + QuestionOption.
  4. Dòng lỗi ghi ImportRowError; batch tiếp tục.
- **Business rule áp dụng**: BR-IMP-001.
- **Acceptance criteria**: Câu hỏi không có correct_answer ghi lỗi; câu hỏi hợp lệ được tạo.

---

### UC-IMPORT-003 — Import tài liệu (metadata)

- **Mục tiêu**: Admin nội dung gắn hàng loạt tài liệu vào hệ thống.
- **Actor chính**: adminNoiDung.
- **Điều kiện trước**: Permission `IMPORT_DOCUMENT`.
- **Luồng chính**:
  1. Admin upload file CSV với cột: title, accessType, mainCategoryId, externalUrl.
  2. Validate template, tạo ImportBatch.
  3. Gọi DocumentService tạo Document cho mỗi dòng hợp lệ.
  4. Dòng lỗi ghi ImportRowError.
- **Business rule áp dụng**: BR-IMP-001.
- **Acceptance criteria**: Tài liệu import được tạo với status=draft; dòng thiếu title ghi lỗi.

---

### UC-JOB-001 — Scheduler xử lý hết hạn membership

- **Mục tiêu**: Tự động cập nhật enrollment sang trạng thái expired khi đến hạn.
- **Actor chính**: Hệ thống scheduler.
- **Trigger**: Cron job chạy hàng ngày (ví dụ 00:00 UTC).
- **Luồng chính**:
  1. SchedulerService kích hoạt job `expire-enrollments`.
  2. Tạo JobExecution (status=running).
  3. JobExecutionService tìm Enrollment có expiresAt < now và status=active.
  4. Với mỗi enrollment: cập nhật status → expired.
  5. Ghi số lượng đã xử lý vào JobExecution.
  6. Cập nhật JobExecution status → succeeded.
- **Luồng lỗi**: Lỗi hệ thống → ghi errorSummary; cập nhật status → failed; retry theo policy.
- **Business rule áp dụng**: BR-JOB-001.
- **Acceptance criteria**: Job idempotent — chạy lại không cập nhật enrollment đã expired; JobExecution ghi đầy đủ.

---

### UC-JOB-002 — Scheduler đối soát payment/order

- **Mục tiêu**: Phát hiện và xử lý đơn hàng pending quá lâu hoặc webhook chưa nhận.
- **Actor chính**: Hệ thống scheduler.
- **Trigger**: Cron job chạy mỗi giờ.
- **Luồng chính**:
  1. Job lấy danh sách Order status=pending quá 24 giờ.
  2. Với mỗi Order: kiểm tra trạng thái trên PaymentGateway (nếu cấu hình).
  3. Nếu gateway xác nhận paid → cập nhật Order → paid, cấp quyền học.
  4. Nếu gateway xác nhận failed → cập nhật Order → cancelled.
  5. Ghi PaymentReconciliationRecord cho mỗi Order đã xử lý.
  6. Ghi JobExecution.
- **Business rule áp dụng**: BR-JOB-001, BR-JOB-002.
- **Acceptance criteria**: Không cập nhật Order nếu gateway không xác nhận rõ ràng; idempotent.

---

### UC-JOB-003 — Xem lịch sử job

- **Mục tiêu**: Admin theo dõi lịch sử chạy và phát hiện job lỗi.
- **Actor chính**: adminVanHanh.
- **Điều kiện trước**: Permission `JOB_VIEW`.
- **Luồng chính**:
  1. Admin mở trang quản lý job.
  2. Hệ thống trả danh sách JobDefinition với thông tin lần chạy gần nhất.
  3. Admin nhấp vào job → xem danh sách JobExecution.
  4. Admin nhấp vào execution → xem JobExecutionLog.
- **Acceptance criteria**: Thấy trạng thái, thời gian, số bản ghi xử lý và lỗi nếu có.

---

### UC-JOB-004 — Retry job lỗi

- **Mục tiêu**: Admin chạy lại job thất bại mà không cần chờ lịch tiếp theo.
- **Actor chính**: adminVanHanh.
- **Điều kiện trước**: JobExecution tồn tại và có status=failed; permission `JOB_RETRY`.
- **Luồng chính**:
  1. Admin nhấn "Retry" trên lịch sử execution.
  2. Hệ thống kiểm tra retryCount < maxRetries trong retryPolicy.
  3. Tạo JobExecution mới (triggeredBy=retry), tăng retryCount.
  4. Enqueue job.
- **Luồng lỗi**: retryCount đã đạt max → 400 `MAX_RETRIES_EXCEEDED`.
- **Business rule áp dụng**: BR-JOB-001, BR-JOB-002.
- **Acceptance criteria**: Job vẫn phải idempotent sau retry; audit log ghi admin đã trigger retry.

---

### UC-INTEGRATION-001 — Cấu hình tích hợp ngoài

- **Mục tiêu**: superAdmin cập nhật cấu hình kết nối dịch vụ ngoài an toàn.
- **Actor chính**: superAdmin.
- **Điều kiện trước**: Permission `INTEGRATION_CONFIG_MANAGE`.
- **Luồng chính**:
  1. superAdmin mở trang cấu hình tích hợp.
  2. Hệ thống trả danh sách IntegrationConfig (credential đã che khuất).
  3. Admin sửa giá trị, retry policy và trạng thái.
  4. Hệ thống validate, mã hoá credential và lưu.
  5. Tạo IntegrationEvent với loại `config_updated`.
- **Luồng lỗi**: Credential không hợp lệ → 422; không có permission → 403.
- **Business rule áp dụng**: BR-INT-001.
- **Acceptance criteria**: Credential không bao giờ được trả plain text trong response; audit log ghi thay đổi.

---

## 12. User story

### US-REPORT-001 — Xem dashboard vận hành
- **Với vai trò**: Admin vận hành
- **Tôi muốn**: Xem dashboard tổng quan số liệu hệ thống
- **Để**: Phát hiện sự cố và theo dõi hoạt động trong ngày
- **Priority**: Must
- **Given**: Tôi có permission REPORT_VIEW_DASHBOARD
- **When**: Tôi mở trang `/admin/dashboard`
- **Then**: Thấy card: tổng học viên, đơn hàng hôm nay, doanh thu tháng này, job lỗi gần đây
- **Test scenario**: Có mock data → hiển thị đúng; không có permission → 403

### US-REPORT-002 — Xem báo cáo học viên theo khóa học
- **Với vai trò**: Admin học vụ
- **Tôi muốn**: Xem danh sách học viên và tiến độ trong một khóa học cụ thể
- **Để**: Đánh giá chất lượng đào tạo và hỗ trợ học viên chậm tiến độ
- **Priority**: Must
- **Given**: Tôi có permission REPORT_VIEW_LEARNING
- **When**: Tôi chọn khóa học và khoảng thời gian, nhấn "Xem báo cáo"
- **Then**: Thấy bảng học viên với cột: tên, email, tiến độ (%), điểm thi gần nhất, trạng thái enrollment
- **Test scenario**: Chọn khóa có 5 học viên → bảng 5 dòng; không có học viên → thông báo rõ

### US-REPORT-003 — Xem báo cáo kết quả thi
- **Với vai trò**: Admin học vụ
- **Tôi muốn**: Xem thống kê kết quả thi của một đề thi
- **Để**: Đánh giá độ khó của đề và hiệu quả học tập
- **Priority**: Must
- **Given**: Tôi có permission REPORT_VIEW_LEARNING, đề thi đã có học viên làm
- **When**: Tôi chọn đề thi và xem báo cáo
- **Then**: Thấy điểm trung bình, tỷ lệ đạt, histogram phân phối điểm
- **Test scenario**: 10 attempt → số liệu chính xác so với tổng hợp từ Result

### US-REPORT-004 — Export báo cáo doanh thu
- **Với vai trò**: Admin tài chính
- **Tôi muốn**: Tải file báo cáo doanh thu tháng về máy
- **Để**: Phân tích chi tiết hoặc trình bày với ban lãnh đạo
- **Priority**: Must
- **Given**: Tôi có permission REPORT_EXPORT
- **When**: Tôi chọn "Doanh thu", tháng hiện tại, format XLSX và nhấn "Export"
- **Then**: Nhận exportId; sau vài giây file ready; nhấn "Tải file" → file XLSX tải về
- **Test scenario**: Export thành công → file có đủ cột; file chưa ready → 400 EXPORT_NOT_READY

### US-IMPORT-001 — Import học viên từ file CSV
- **Với vai trò**: Admin học vụ
- **Tôi muốn**: Upload file CSV danh sách học viên để tạo tài khoản hàng loạt
- **Để**: Giảm thời gian nhập tay và hạn chế sai sót
- **Priority**: Must
- **Given**: Tôi có permission IMPORT_STUDENT, file CSV đúng template
- **When**: Tôi upload file
- **Then**: ImportBatch được tạo; xử lý async; khi xong thấy số dòng thành công và lỗi
- **Test scenario**: File 100 dòng, 5 email trùng → 95 tài khoản tạo; 5 dòng lỗi với thông báo rõ

### US-IMPORT-002 — Xem lỗi từng dòng sau import
- **Với vai trò**: Admin học vụ
- **Tôi muốn**: Xem chi tiết lỗi của từng dòng bị lỗi trong batch import
- **Để**: Sửa file và import lại đúng
- **Priority**: Must
- **Given**: Có batch import với dòng lỗi
- **When**: Tôi mở chi tiết batch và xem tab lỗi
- **Then**: Thấy bảng: số dòng, nội dung lỗi (email trùng, thiếu tên, v.v.)
- **Test scenario**: 5 dòng lỗi → hiển thị 5 dòng với rowNumber và errorMessage

### US-JOB-001 — Xem lịch sử job scheduler
- **Với vai trò**: Admin vận hành
- **Tôi muốn**: Xem danh sách job và lần chạy gần nhất
- **Để**: Biết job nào đang hoạt động tốt, job nào đang lỗi
- **Priority**: Must
- **Given**: Tôi có permission JOB_VIEW
- **When**: Tôi mở trang quản lý job
- **Then**: Thấy bảng job với tên, lịch chạy (cron), trạng thái lần chạy gần nhất, số bản ghi xử lý
- **Test scenario**: Job expire-enrollments chạy 3 lần → lịch sử 3 execution

### US-JOB-002 — Retry job thất bại
- **Với vai trò**: Admin vận hành
- **Tôi muốn**: Chạy lại job đã lỗi mà không chờ lịch kế tiếp
- **Để**: Khắc phục nhanh sự cố mà không ảnh hưởng dữ liệu
- **Priority**: Must
- **Given**: Có job execution với status=failed, tôi có permission JOB_RETRY
- **When**: Tôi nhấn "Retry"
- **Then**: Job execution mới được tạo với triggeredBy=retry; job chạy lại
- **Test scenario**: Retry thành công → execution mới status=succeeded; retry khi chưa failed → lỗi

### US-JOB-003 — Chạy job thủ công
- **Với vai trò**: Admin vận hành
- **Tôi muốn**: Kích hoạt job scheduler ngay lập tức mà không chờ cron
- **Để**: Kiểm tra job sau khi sửa cấu hình hoặc xử lý sự cố khẩn cấp
- **Priority**: Should
- **Given**: Tôi có permission JOB_RUN_MANUAL, không có job đang chạy
- **When**: Tôi nhấn "Chạy ngay" trên job expire-enrollments
- **Then**: Job execution mới được tạo và chạy ngay; thấy trạng thái running rồi succeeded
- **Test scenario**: Chạy khi không có job running → thành công; chạy khi job đang running → lỗi JOB_ALREADY_RUNNING

### US-INTEGRATION-001 — Cập nhật cấu hình tích hợp email
- **Với vai trò**: superAdmin
- **Tôi muốn**: Cập nhật cấu hình SMTP để gửi email từ địa chỉ mới
- **Để**: Hệ thống gửi email xác thực và thông báo từ địa chỉ chính thức
- **Priority**: Must
- **Given**: Tôi có permission INTEGRATION_CONFIG_MANAGE
- **When**: Tôi sửa SMTP host, user và password và lưu
- **Then**: Cấu hình được lưu mã hoá; credential không hiển thị plain text trên giao diện
- **Test scenario**: Lưu thành công → IntegrationEvent ghi config_updated; credential không trả trong GET response

---

## 13. Luồng nghiệp vụ chi tiết

### Luồng 1: Export báo cáo bất đồng bộ

```
[Admin] → POST /api/admin/exports { reportType: "revenue", params, format: "xlsx" }
     ↓
[ExportService] → Kiểm tra permission REPORT_EXPORT
     ↓
[ExportService] → Tạo ExportRequest (status=pending)
[JobQueue] → Enqueue ExportJob với exportRequestId
[API] → Trả { exportId, status: "pending" }
     ↓ (background)
[ExportJobProcessor] → Lấy dữ liệu từ OrderService (chỉ đọc)
[ExportJobProcessor] → Tạo file XLSX
[StorageAdapter] → Lưu file lên storage
[ExportRequest] → Cập nhật status=ready, lưu storagePath vào ExportFile
     ↓
[Admin] → GET /api/admin/exports/{exportId} → status: "ready"
[Admin] → GET /api/admin/exports/{exportId}/download → { downloadUrl, expiresAt }
[Admin] → Tải file về máy qua signed URL
```

### Luồng 2: Import học viên với lỗi từng dòng

```
[Admin] → POST /api/admin/imports/students (multipart/form-data)
     ↓
[ImportService] → Validate template header
     ↓ (header sai)
[API] → Trả 400 IMPORT_TEMPLATE_INVALID
     ↓ (header đúng)
[ImportService] → Lưu file lên storage
[ImportBatch] → Tạo batch (status=validating)
[API] → Trả { batchId, status: "validating" }
     ↓ (background)
[ImportJobProcessor] → Đọc từng dòng
  → Validate email format, required fields
  → Nếu email trùng: ghi ImportRowError { rowNumber, "Email đã tồn tại" }; tiếp tục
  → Nếu hợp lệ: gọi UserService.createUser(); ghi processedRows++
[ImportBatch] → Cập nhật status=completed (hoặc partial_failed nếu errorRows > 0)
[Admin] → GET /api/admin/imports/{batchId} → xem tổng kết
[Admin] → GET /api/admin/imports/{batchId}/errors → xem chi tiết từng lỗi
```

### Luồng 3: Scheduler hết hạn membership

```
[SchedulerService] → Cron trigger lúc 00:00 UTC hàng ngày
     ↓
[JobExecutionService] → Kiểm tra không có execution đang running cho job này
     ↓ (đang có execution running)
[SchedulerService] → Skip lần này, ghi warning log
     ↓ (không có execution running)
[JobExecutionService] → Tạo JobExecution (status=running, triggeredBy=scheduler)
     ↓
[EnrollmentService] → Lấy Enrollment với expiresAt < now AND status=active
[EnrollmentService] → Batch update status → expired
[JobExecution] → Cập nhật processedCount, status=succeeded
[JobExecutionLog] → Ghi "Expired N enrollments"
```

### Luồng 4: Retry job lỗi

```
[Admin] → POST /api/admin/job-executions/{executionId}/retry
     ↓
[RetryService] → Kiểm tra execution.status = failed
     ↓ (không phải failed)
[API] → Trả 400 JOB_NOT_FAILED
     ↓ (là failed)
[RetryService] → Kiểm tra retryCount < maxRetries (từ retryPolicy)
     ↓ (đã hết lượt retry)
[API] → Trả 400 MAX_RETRIES_EXCEEDED
     ↓ (còn lượt)
[JobExecution mới] → Tạo execution mới (triggeredBy=retry, retryCount = cũ + 1)
[JobQueue] → Enqueue job
[API] → Trả { newExecutionId }
```

---

## 14. Business rule áp dụng

| Mã rule | Nội dung |
|---|---|
| BR-RPT-001 | Reporting phải đọc dữ liệu gốc chính xác và không được sửa đổi dữ liệu nguồn |
| BR-RPT-002 | Export dữ liệu nhạy cảm chỉ thực hiện khi người dùng có permission REPORT_EXPORT; file không trả nhị phân trực tiếp trong response |
| BR-IMP-001 | Import phải validate template và dữ liệu bắt buộc; ghi log lỗi từng dòng; không dừng batch khi gặp lỗi một dòng; không ghi đè khi không có rule rõ |
| BR-JOB-001 | Scheduler phải idempotent; mọi job execution phải ghi JobExecutionLog với thời gian bắt đầu, kết thúc, trạng thái và số bản ghi xử lý |
| BR-JOB-002 | Retry phải giới hạn theo maxRetries trong retryPolicy; không retry vô hạn; retryCount phải tăng mỗi lần |
| BR-INT-001 | Credential tích hợp phải mã hoá trước khi lưu DB; không log plain credential; response API không trả plain credential; mọi thay đổi cấu hình phải ghi IntegrationEvent |
| BR-RPT-003 | Dashboard không thao tác dữ liệu nghiệp vụ — chỉ đọc |
| BR-SYS-002 | Backend kiểm tra permission cho mọi API endpoint của module này |
| BR-SYS-006 | Audit log bắt buộc cho: thay đổi IntegrationConfig, trigger job thủ công, retry job |

---

## 15. Validation

### Template file import học viên
- Header bắt buộc: `fullname`, `email`.
- Các cột tuỳ chọn: `phone`, `courseId`.
- `email`: phải là email hợp lệ; chưa tồn tại trong hệ thống.
- `phone`: nếu có phải đúng định dạng.
- `courseId`: nếu có phải là UUID tồn tại trong hệ thống.

### Template file import câu hỏi
- Header bắt buộc: `content`, `type`, `correct_answer`.
- `type`: phải là `single_choice` hoặc `multiple_choice`.
- Phải có ít nhất 2 cột option (option_a, option_b).
- `correct_answer`: phải là một trong các giá trị option.

### Template file import tài liệu
- Header bắt buộc: `title`, `accessType`.
- `accessType`: phải là `public`, `pro` hoặc `course_only`.

### Tạo yêu cầu export
- `reportType`: bắt buộc, phải thuộc danh sách hỗ trợ.
- `format`: bắt buộc, phải là `csv` hoặc `xlsx`.
- `dateFrom`, `dateTo`: nếu có phải là ngày hợp lệ; `dateFrom` phải trước `dateTo`.

---

## 16. State machine

### Trạng thái ImportBatch

```
pending → validating → processing → completed
                     → failed      (template sai nghiêm trọng)
             processing → partial_failed  (có lỗi dòng nhưng tiếp tục)
```

| Trạng thái | Mô tả |
|---|---|
| `pending` | Vừa tạo, chưa bắt đầu validate |
| `validating` | Đang kiểm tra template và cấu trúc file |
| `processing` | Đang xử lý từng dòng |
| `completed` | Tất cả dòng xử lý thành công |
| `partial_failed` | Xử lý xong nhưng có dòng lỗi |
| `failed` | Thất bại toàn bộ (template sai, lỗi hệ thống) |

### Trạng thái ExportRequest

```
pending → processing → ready
       → failed
          processing → failed
```

| Trạng thái | Mô tả |
|---|---|
| `pending` | Vừa tạo, chưa xử lý |
| `processing` | Đang tạo file |
| `ready` | File đã sẵn sàng tải |
| `failed` | Tạo file thất bại |

### Trạng thái JobExecution

```
scheduled → running → succeeded
                    → failed → retrying → running (nếu retry)
                             → failed (nếu hết lượt retry)
```

| Trạng thái | Mô tả |
|---|---|
| `scheduled` | Chờ được xử lý |
| `running` | Đang chạy |
| `succeeded` | Hoàn thành không lỗi |
| `failed` | Thất bại |
| `retrying` | Đã enqueue lại để retry |

### Trạng thái IntegrationConfig

```
active ↔ suspended
active → retired
```

---

## 17. Xử lý lỗi

| Mã lỗi | HTTP status | Trường hợp xảy ra | Thông điệp |
|---|---|---|---|
| `EXPORT_NOT_READY` | 400 | Tải file khi chưa ready | File xuất chưa sẵn sàng, vui lòng chờ |
| `IMPORT_TEMPLATE_INVALID` | 400 | File không đúng template | File không đúng template, vui lòng kiểm tra hướng dẫn |
| `IMPORT_FILE_TOO_LARGE` | 422 | File vượt giới hạn kích thước | File quá lớn |
| `JOB_ALREADY_RUNNING` | 400 | Chạy job khi đang có execution running | Job đang chạy, vui lòng chờ kết thúc |
| `JOB_NOT_FAILED` | 400 | Retry job khi không phải status=failed | Job chưa thất bại, không thể retry |
| `MAX_RETRIES_EXCEEDED` | 400 | Đã retry đủ số lần tối đa | Đã vượt quá số lần retry cho phép |
| `REPORT_DATA_UNAVAILABLE` | 503 | Dữ liệu báo cáo chưa sẵn sàng | Dữ liệu đang được tổng hợp, vui lòng thử lại |
| `INTEGRATION_CONFIG_INVALID` | 422 | Cấu hình tích hợp không hợp lệ | Cấu hình không hợp lệ |
| `BATCH_NOT_FOUND` | 404 | ImportBatch không tồn tại | Không tìm thấy batch import |
| `FORBIDDEN` | 403 | Không có permission | Bạn không có quyền thực hiện thao tác này |

---

## 18. Acceptance criteria

| Mã AC | Chức năng | Tiêu chí chấp nhận |
|---|---|---|
| AC-RPT-001 | Dashboard | Chỉ truy cập với permission REPORT_VIEW_DASHBOARD; không ghi dữ liệu |
| AC-RPT-002 | Báo cáo doanh thu | Tổng doanh thu khớp với sum(Order.finalAmount) khi status=paid trong khoảng thời gian |
| AC-RPT-003 | Báo cáo kết quả thi | Số liệu khớp với ExamAttempt trong DB |
| AC-EXP-001 | Export async | POST trả exportId ngay; file tạo bất đồng bộ; download qua signed URL |
| AC-EXP-002 | Signed URL | URL hết hạn sau 10 phút; storagePath không bao giờ trả trong response |
| AC-IMP-001 | Import không dừng khi lỗi dòng | Dòng lỗi ghi ImportRowError; dòng khác vẫn xử lý |
| AC-IMP-002 | Template sai | 400 ngay trước khi tạo ImportBatch |
| AC-JOB-001 | Job idempotent | Chạy lại job expire-enrollments không cập nhật enrollment đã expired |
| AC-JOB-002 | Retry giới hạn | Không thể retry khi retryCount >= maxRetries |
| AC-JOB-003 | JobExecutionLog | Mọi execution phải có ít nhất một log entry với thời gian và trạng thái |
| AC-INT-001 | Credential không lộ | GET integration response không trả plain credential |
| AC-INT-002 | Audit log | Thay đổi IntegrationConfig tạo IntegrationEvent |

---

## 19. Test/UAT scenario

| Mã kịch bản | Mô tả | Điều kiện | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|---|
| T-RPT-001 | Dashboard không có permission | User không có REPORT_VIEW_DASHBOARD | GET /api/admin/dashboard | Trả 403 |
| T-RPT-002 | Dashboard có permission | User có REPORT_VIEW_DASHBOARD | GET /api/admin/dashboard | Trả 200 với metrics hợp lệ |
| T-RPT-003 | Báo cáo doanh thu chính xác | Có 5 order paid tháng này, tổng 500k | GET /api/admin/reports/revenue | revenue.total = 500000 |
| T-RPT-004 | Export báo cáo doanh thu | User có REPORT_EXPORT | POST /api/admin/exports → GET download | ExportRequest → ready → file XLSX tải được |
| T-RPT-005 | Tải file khi chưa ready | ExportRequest status=processing | GET /api/admin/exports/{id}/download | Trả 400 EXPORT_NOT_READY |
| T-IMP-001 | Import file đúng template | File 100 dòng, tất cả hợp lệ | POST /api/admin/imports/students | Batch completed; 100 tài khoản tạo |
| T-IMP-002 | Import file có lỗi dòng | File 100 dòng, 5 email trùng | POST /api/admin/imports/students | Batch partial_failed; 95 thành công; 5 ImportRowError |
| T-IMP-003 | Import template sai | File không có cột email | POST /api/admin/imports/students | Trả 400 IMPORT_TEMPLATE_INVALID; không tạo batch |
| T-IMP-004 | Xem lỗi chi tiết import | Batch có 5 lỗi | GET /api/admin/imports/{id}/errors | Trả 5 ImportRowError với rowNumber và message |
| T-JOB-001 | Chạy job thủ công | Không có job đang running | POST /api/admin/jobs/{id}/run | Execution mới created; chạy thành công |
| T-JOB-002 | Chạy job khi đang running | Có execution đang running | POST /api/admin/jobs/{id}/run | Trả 400 JOB_ALREADY_RUNNING |
| T-JOB-003 | Retry job failed | Execution status=failed | POST /api/admin/job-executions/{id}/retry | Execution mới tạo với triggeredBy=retry |
| T-JOB-004 | Retry hết lượt | retryCount = maxRetries | POST retry | Trả 400 MAX_RETRIES_EXCEEDED |
| T-JOB-005 | Job expire-enrollments idempotent | Chạy lại với enrollment đã expired | POST /api/admin/jobs/{id}/run | processedCount = 0; không cập nhật lại |
| T-INT-001 | Cập nhật config tích hợp | superAdmin có INTEGRATION_CONFIG_MANAGE | PUT /api/admin/integrations/{id} | 200 OK; GET response không trả plain credential; IntegrationEvent được tạo |

---

## 20. Phụ thuộc module khác

### Module này phụ thuộc (chỉ đọc)
- **Authentication**: kiểm tra token và permission; UserService để tạo tài khoản khi import.
- **Classroom**: EnrollmentService để tạo enrollment khi import học viên; đọc dữ liệu báo cáo.
- **Exam**: QuestionService để tạo câu hỏi khi import; đọc Attempt/Result cho báo cáo.
- **Order/Payment**: OrderService để đối soát; đọc Order/Payment cho báo cáo doanh thu.
- **Document**: DocumentService để tạo document khi import metadata.
- **Book**: BookCode để tạo mã khi import.

### Nguyên tắc tích hợp
- Module này **không ghi trực tiếp** vào bảng của module khác — phải gọi qua service interface.
- Gọi service interface theo chiều: ImportJobProcessor → Service của module tương ứng.
- Không tạo dependency vòng với bất kỳ module nào.

---

## 21. Câu hỏi cần xác nhận

| Câu hỏi | Ảnh hưởng | Đề xuất tạm thời |
|---|---|---|
| Template import học viên cần những cột nào bắt buộc? | ImportService validation | Đề xuất: fullname, email bắt buộc |
| Khi import học viên đã có email trong hệ thống: ghi đè, skip hay lỗi? | ImportJobProcessor policy | Đề xuất: ghi ImportRowError và skip |
| Export file được lưu bao lâu trên storage trước khi xóa? | ExportFile lifecycle | Đề xuất: 7 ngày |
| Dashboard cache bao lâu? | DashboardService | Đề xuất: 5 phút |
| Scheduler hết hạn membership chạy lúc mấy giờ? | SchedulerService cron | Đề xuất: 00:00 UTC hàng ngày |
| maxRetries mặc định cho mỗi job là bao nhiêu? | retryPolicy | Đề xuất: 3 lần |
| Có cần gửi email thông báo khi job lỗi không? | Notification | Đề xuất: gửi cho superAdmin |
| File import tối đa bao nhiêu MB và bao nhiêu dòng? | ImportService validation | Đề xuất: 50MB, 50.000 dòng |
