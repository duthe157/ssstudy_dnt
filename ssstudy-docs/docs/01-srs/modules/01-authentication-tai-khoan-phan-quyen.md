# Authentication / Tài khoản / Phân quyền — SRS mục tiêu

> Tài liệu đặc tả yêu cầu phần mềm (SRS) cho module Authentication của hệ thống SSStudy.
> Viết như thể hệ thống chưa có code. Mục tiêu: đủ chi tiết để developer triển khai hoàn chỉnh chỉ từ tài liệu này.

---

## 1. Mục tiêu nghiệp vụ

Module Authentication là nền tảng bảo mật của toàn bộ hệ thống SSStudy. Module này cần đáp ứng:

- Xác thực người dùng bằng email, số điện thoại hoặc mã học sinh kết hợp mật khẩu; hỗ trợ đăng nhập qua Google OAuth.
- Quản lý phiên làm việc bằng JWT access token ngắn hạn và refresh token opaque lưu tại DB, hỗ trợ rotation và revocation.
- Phân quyền dựa trên role và permission (RBAC) cho từng endpoint, kiểm tra tại backend.
- Quản lý vòng đời tài khoản: đăng ký, xác minh email, khóa tài khoản, mở khóa, xóa mềm.
- Bảo mật mật khẩu: áp dụng policy mật khẩu, đổi mật khẩu, quên/reset mật khẩu, thu hồi phiên sau đổi mật khẩu.
- Quản trị user phía admin: tạo, sửa, khóa/mở khóa tài khoản với audit log đầy đủ.

---

## 2. Phạm vi chức năng

| STT | Chức năng | Mô tả ngắn |
|---|---|---|
| 1 | Đăng nhập bằng credential | Email / số điện thoại / mã học sinh + mật khẩu |
| 2 | Đăng nhập Google OAuth | Xác thực qua Google, tạo hoặc liên kết tài khoản |
| 3 | Đăng ký tài khoản | Tạo tài khoản mới, gửi email xác minh |
| 4 | Xác minh email | Kích hoạt tài khoản qua link email |
| 5 | Đăng xuất | Thu hồi refresh token, kết thúc phiên |
| 6 | Refresh token | Cấp lại access token, xoay vòng refresh token |
| 7 | Quên mật khẩu | Gửi link/token đặt lại mật khẩu qua email |
| 8 | Đặt lại mật khẩu | Đặt mật khẩu mới bằng reset token |
| 9 | Đổi mật khẩu | Đổi mật khẩu khi đã đăng nhập |
| 10 | Xem hồ sơ cá nhân | Lấy thông tin profile của user hiện tại |
| 11 | Cập nhật hồ sơ | Chỉnh sửa thông tin cá nhân, avatar |
| 12 | Quản lý user (admin) | CRUD user, phân role, khóa/mở khóa |
| 13 | Quản lý role và permission | Định nghĩa và gán role, permission |
| 14 | Middleware xác thực và phân quyền | Kiểm tra token và permission toàn hệ thống |
| 15 | Audit log hành động admin | Ghi lại mọi hành động admin tác động đến tài khoản |

---

## 3. Ngoài phạm vi

- Xác thực hai yếu tố (2FA/TOTP) — để dành phiên bản sau.
- SSO doanh nghiệp (SAML, LDAP) — để dành phiên bản sau.
- OAuth với Facebook, Apple — chỉ hỗ trợ Google trong phiên bản này.
- Quản lý tổ chức / tenant đa cấp.
- Billing và thanh toán liên quan tài khoản (thuộc module Order/Payment).
- Phân quyền nội dung chi tiết từng resource (thuộc từng module nghiệp vụ riêng).

---

## 4. Actor

| Actor | Mô tả | Quyền cơ bản |
|---|---|---|
| Guest | Người dùng chưa xác thực | Truy cập API công khai, đăng ký, đăng nhập, quên mật khẩu |
| student | Học viên đã đăng nhập | Truy cập nội dung đã mua, làm bài kiểm tra, quản lý profile |
| teacher | Giáo viên | Quản lý nội dung khóa học của mình, xem tiến độ học viên |
| admin | Quản trị viên | Quản lý user, role, cấu hình hệ thống; mọi hành động cần audit log |
| superAdmin | Quản trị cấp cao | Toàn quyền hệ thống, bao gồm quản lý admin khác |
| financialAdmin | Quản trị tài chính | Xem và xử lý đơn hàng, thanh toán trong phạm vi được cấp |
| supporter | Nhân viên hỗ trợ | Xem thông tin user để hỗ trợ, không sửa dữ liệu nghiệp vụ |

---

## 5. Permission

| Mã permission | Mô tả | Role mặc định |
|---|---|---|
| `user:read` | Xem thông tin user bất kỳ | admin, superAdmin, supporter |
| `user:create` | Tạo user mới thủ công | admin, superAdmin |
| `user:update` | Cập nhật thông tin user bất kỳ | admin, superAdmin |
| `user:delete` | Xóa mềm user | superAdmin |
| `user:block` | Khóa/mở khóa tài khoản | admin, superAdmin |
| `role:read` | Xem danh sách role và permission | admin, superAdmin |
| `role:assign` | Gán role cho user | admin, superAdmin |
| `role:manage` | Tạo/sửa/xóa role và permission | superAdmin |
| `audit:read` | Xem audit log | admin, superAdmin |
| `profile:read` | Xem profile của chính mình | Mọi user đã đăng nhập |
| `profile:update` | Cập nhật profile của chính mình | Mọi user đã đăng nhập |

---

## 6. Danh sách chức năng

| Mã chức năng | Tên chức năng | Actor | Màn hình đề xuất | API đề xuất | Dịch vụ nghiệp vụ cần có | Dữ liệu/model liên quan | Quy tắc áp dụng | Priority |
|---|---|---|---|---|---|---|---|---|
| AUTH-01 | Đăng nhập bằng credential | Guest | `/login`, `/admin/login` | `POST /api/auth/login` | Xác thực thông tin đăng nhập, kiểm tra trạng thái tài khoản, phát hành access token và refresh token | User, RefreshToken | BR-AUTH-001, BR-AUTH-002 | Must |
| AUTH-02 | Đăng nhập Google OAuth | Guest | `/login` | `POST /api/auth/google` | Xác thực Google ID token, tạo hoặc liên kết tài khoản, phát hành token | User, RefreshToken | BR-AUTH-001 | Should |
| AUTH-03 | Đăng ký tài khoản | Guest | `/signup` | `POST /api/auth/register` | Kiểm tra dữ liệu đầu vào, tạo user với trạng thái pending_verify, gửi email xác minh | User | BR-AUTH-003 | Must |
| AUTH-04 | Xác minh email | Guest | `/verify-email` | `GET /api/auth/verify-email` | Xác thực token xác minh, cập nhật trạng thái tài khoản sang active | User | BR-AUTH-003 | Must |
| AUTH-05 | Đăng xuất | Authenticated | n/a | `POST /api/auth/logout` | Thu hồi refresh token, kết thúc phiên làm việc | RefreshToken | BR-AUTH-004 | Must |
| AUTH-06 | Refresh token | Authenticated | n/a | `POST /api/auth/refresh` | Xác thực refresh token, phát hành access token mới, xoay vòng refresh token | RefreshToken | BR-AUTH-005 | Must |
| AUTH-07 | Quên mật khẩu | Guest | `/forgot-password` | `POST /api/auth/forgot-password` | Tạo reset token ngắn hạn, gửi email đặt lại mật khẩu | PasswordResetToken | BR-AUTH-006 | Must |
| AUTH-08 | Đặt lại mật khẩu | Guest | `/reset-password` | `POST /api/auth/reset-password` | Xác thực reset token, cập nhật mật khẩu, thu hồi mọi phiên hiện có | User, PasswordResetToken, RefreshToken | BR-AUTH-006 | Must |
| AUTH-09 | Đổi mật khẩu | Authenticated | `/profile/change-password` | `POST /api/auth/change-password` | Xác thực mật khẩu hiện tại, cập nhật mật khẩu mới, thu hồi phiên khác | User, RefreshToken | BR-AUTH-009 | Must |
| AUTH-10 | Xem hồ sơ cá nhân | Authenticated | `/profile` | `GET /api/users/me` | Trả về thông tin profile của user hiện tại | User | BR-AUTH-002 | Must |
| AUTH-11 | Cập nhật hồ sơ | Authenticated | `/profile/edit` | `PUT /api/users/me` | Cập nhật thông tin cá nhân, kiểm tra unique email/phone | User | BR-AUTH-007 | Must |
| AUTH-12 | Danh sách user (admin) | admin, superAdmin | `/admin/users` | `GET /api/admin/users` | Lấy danh sách user có filter và phân trang | User | `user:read` | Should |
| AUTH-13 | Tạo user (admin) | admin, superAdmin | `/admin/users/new` | `POST /api/admin/users` | Tạo user thủ công, gán role, ghi audit log | User, AuditLog | `user:create` | Should |
| AUTH-14 | Sửa user (admin) | admin, superAdmin | `/admin/users/{id}/edit` | `PUT /api/admin/users/{id}` | Cập nhật thông tin user, ghi audit log | User, AuditLog | `user:update` | Should |
| AUTH-15 | Khóa/mở khóa tài khoản | admin, superAdmin | `/admin/users/{id}` | `POST /api/admin/users/{id}/block` | Cập nhật trạng thái tài khoản, thu hồi phiên nếu khóa, ghi audit log | User, RefreshToken, AuditLog | `user:block` | Must |
| AUTH-16 | Quản lý role | superAdmin | `/admin/roles` | CRUD `/api/admin/roles` | Tạo/sửa/xóa role, gán permission vào role | Role, Permission, RolePermission | `role:manage` | Should |
| AUTH-17 | Gán role cho user | admin, superAdmin | `/admin/users/{id}` | `PUT /api/admin/users/{id}/roles` | Gán hoặc thu hồi role, ghi audit log | UserRole, AuditLog | `role:assign` | Should |
| AUTH-18 | Xem audit log | admin, superAdmin | `/admin/audit-logs` | `GET /api/admin/audit-logs` | Lấy lịch sử hành động admin có filter và phân trang | AuditLog | `audit:read` | Should |

---

## 7. Thiết kế dữ liệu / Domain model đề xuất

### Model chính

| Model | Mục đích | Field quan trọng | Quan hệ |
|---|---|---|---|
| User | Tài khoản người dùng | id, email, phone, studentCode, passwordHash, status, avatarUrl | Có nhiều RefreshToken, có nhiều UserRole |
| Role | Vai trò trong hệ thống | id, code, name, description | Có nhiều UserRole, có nhiều RolePermission |
| Permission | Quyền truy cập cụ thể | id, code, description | Có nhiều RolePermission |
| UserRole | Bảng trung gian user-role | userId, roleId | FK tới User và Role |
| RolePermission | Bảng trung gian role-permission | roleId, permissionId | FK tới Role và Permission |
| RefreshToken | Phiên làm việc | id, token, userId, expiresAt, revokedAt | FK tới User |
| PasswordResetToken | Token đặt lại mật khẩu | id, token, userId, expiresAt, usedAt | FK tới User |
| AuditLog | Lịch sử hành động admin | id, actorId, action, targetType, targetId, payload, createdAt | FK tới User (actor) |

### Field chi tiết

#### Model: User
| Field | Kiểu dữ liệu | Bắt buộc | Ý nghĩa | Validation |
|---|---|---|---|---|
| id | UUID | Có | Khóa chính | Auto-generate |
| fullname | varchar(255) | Có | Họ và tên | Không rỗng, tối đa 255 ký tự |
| email | varchar(255) | Có | Địa chỉ email | Format email hợp lệ, unique |
| phone | varchar(20) | Không | Số điện thoại | Unique nếu có giá trị |
| studentCode | varchar(50) | Không | Mã học sinh | Unique nếu có giá trị |
| passwordHash | varchar(255) | Có | Mật khẩu đã hash (bcrypt) | Không lưu plain text |
| status | enum | Có | Trạng thái tài khoản | active, inactive, blocked, pending_verify |
| avatarUrl | varchar(500) | Không | URL ảnh đại diện | URL hợp lệ |
| googleId | varchar(255) | Không | Google OAuth ID | Unique nếu có giá trị |
| lastLoginAt | timestamp | Không | Thời điểm đăng nhập gần nhất | |
| createdAt | timestamp | Có | Thời điểm tạo | Auto |
| updatedAt | timestamp | Có | Thời điểm cập nhật gần nhất | Auto |

#### Model: RefreshToken
| Field | Kiểu dữ liệu | Bắt buộc | Ý nghĩa | Validation |
|---|---|---|---|---|
| id | UUID | Có | Khóa chính | Auto-generate |
| token | varchar(500) | Có | Chuỗi opaque ngẫu nhiên | Unique, không đoán được |
| userId | UUID FK | Có | Chủ sở hữu phiên | |
| expiresAt | timestamp | Có | Thời điểm hết hạn | Phải lớn hơn thời điểm tạo |
| revokedAt | timestamp | Không | Thời điểm bị thu hồi | Null nếu còn hợp lệ |
| createdAt | timestamp | Có | Thời điểm tạo | Auto |

#### Model: PasswordResetToken
| Field | Kiểu dữ liệu | Bắt buộc | Ý nghĩa | Validation |
|---|---|---|---|---|
| id | UUID | Có | Khóa chính | Auto-generate |
| token | varchar(255) | Có | Token reset ngắn hạn | Unique, hash trước khi lưu |
| userId | UUID FK | Có | User cần reset | |
| expiresAt | timestamp | Có | Hết hạn sau 1 giờ | |
| usedAt | timestamp | Không | Thời điểm đã sử dụng | Null nếu chưa dùng |
| createdAt | timestamp | Có | Thời điểm tạo | Auto |

#### Model: AuditLog
| Field | Kiểu dữ liệu | Bắt buộc | Ý nghĩa | Validation |
|---|---|---|---|---|
| id | UUID | Có | Khóa chính | Auto-generate |
| actorId | UUID FK | Có | Admin thực hiện hành động | |
| action | varchar(100) | Có | Loại hành động | ví dụ: user.block, user.role.assign |
| targetType | varchar(50) | Có | Loại đối tượng | user, role |
| targetId | UUID | Có | ID đối tượng bị tác động | |
| payload | jsonb | Không | Dữ liệu thay đổi (before/after) | |
| createdAt | timestamp | Có | Thời điểm ghi log | Auto |

### Quan hệ dữ liệu

- User `1—N` RefreshToken: một user có nhiều phiên làm việc đồng thời.
- User `1—N` PasswordResetToken: có thể có nhiều token (chỉ token mới nhất còn hợp lệ).
- User `N—N` Role qua bảng UserRole: một user có thể có nhiều role.
- Role `N—N` Permission qua bảng RolePermission: một role có nhiều permission.
- AuditLog `N—1` User: nhiều log thuộc một admin.

### Index / Constraint đề xuất

| Bảng | Index / Constraint | Mục đích |
|---|---|---|
| User | UNIQUE(email) | Không trùng email |
| User | UNIQUE(phone) WHERE phone IS NOT NULL | Không trùng phone |
| User | UNIQUE(studentCode) WHERE studentCode IS NOT NULL | Không trùng mã học sinh |
| User | UNIQUE(googleId) WHERE googleId IS NOT NULL | Không trùng Google account |
| RefreshToken | UNIQUE(token) | Token duy nhất |
| RefreshToken | INDEX(userId, expiresAt, revokedAt) | Tìm phiên hợp lệ của user |
| PasswordResetToken | UNIQUE(token) | Token duy nhất |
| PasswordResetToken | INDEX(userId, expiresAt) | Tìm token chưa hết hạn của user |
| AuditLog | INDEX(actorId, createdAt) | Lọc log theo admin |
| AuditLog | INDEX(targetType, targetId) | Lọc log theo đối tượng |

---

## 8. Thiết kế kiến trúc module

### Thành phần cần có

| Thành phần | Vai trò | Ghi chú triển khai |
|---|---|---|
| API layer (Controller) | Nhận request, validate đầu vào, gọi service, trả response | Không chứa business logic |
| AuthService | Orchestrate luồng đăng nhập, đăng ký, refresh token, đăng xuất | Gọi TokenService, PasswordService, UserRepository |
| UserService | Quản lý vòng đời tài khoản, profile, khóa/mở khóa | Gọi UserRepository, AuditLogger |
| TokenService | Phát hành JWT access token, quản lý refresh token (rotation, revocation) | Dùng JWT library; lưu refresh token vào DB |
| PasswordService | Hash mật khẩu, kiểm tra policy, tạo/xác thực reset token | Dùng bcrypt; token reset phải hash trước khi lưu |
| GoogleOAuthService | Xác thực Google ID token, liên kết hoặc tạo tài khoản | Gọi Google API; không tin dữ liệu từ client |
| PermissionService | Kiểm tra user có permission cụ thể không, load permissions từ role | Cache permissions nếu cần hiệu năng |
| AuthMiddleware | Middleware toàn hệ thống: kiểm tra JWT, gắn user vào request context | Từ chối request khi token không hợp lệ |
| UserRepository | Truy vấn và cập nhật User trong DB | Không chứa business logic |
| TokenRepository | Truy vấn, tạo, thu hồi RefreshToken và PasswordResetToken | |
| AuditLogger | Ghi AuditLog cho hành động admin | Gọi async, không block request |
| EmailService | Gửi email xác minh và email reset mật khẩu | Adapter gọi SMTP/SES; retry khi thất bại |
| Validator | Validate request body theo schema | Dùng Zod / Joi / class-validator |

### Dependency

- Module Authentication không phụ thuộc bất kỳ module nghiệp vụ nào khác.
- Mọi module khác phụ thuộc Authentication để kiểm tra token và permission.
- Module khác gọi `PermissionService` hoặc `AuthMiddleware` để xác thực; không tự tái triển khai logic auth.

### Nguyên tắc triển khai

- API layer không chứa business rule. Mọi quyết định nghiệp vụ nằm trong service.
- Permission phải kiểm tra tại backend, không chỉ ở frontend guard.
- Validation request cần có ở cả request schema (input shape) và domain validation (business rule).
- Mật khẩu phải được hash bằng bcrypt với cost factor đủ mạnh trước khi lưu DB.
- Token reset mật khẩu phải hash trước khi lưu DB; chỉ gửi token gốc qua email.
- Audit log ghi bất đồng bộ, không được làm chậm response.
- Khi khóa tài khoản, phải thu hồi (revoke) toàn bộ refresh token hiện có của user đó.

---

## 9. Yêu cầu giao diện

| Màn hình | Route đề xuất | Actor | Mục đích | API sử dụng |
|---|---|---|---|---|
| Đăng nhập người học | `/login` | Guest | Đăng nhập vào trang học | `POST /api/auth/login` |
| Đăng nhập quản trị | `/admin/login` | Guest | Đăng nhập vào trang admin | `POST /api/auth/login` |
| Đăng ký | `/signup` | Guest | Tạo tài khoản mới | `POST /api/auth/register` |
| Xác minh email | `/verify-email` | Guest | Kích hoạt tài khoản qua link | `GET /api/auth/verify-email` |
| Quên mật khẩu | `/forgot-password` | Guest | Yêu cầu gửi email reset | `POST /api/auth/forgot-password` |
| Đặt lại mật khẩu | `/reset-password` | Guest | Nhập mật khẩu mới từ link email | `POST /api/auth/reset-password` |
| Hồ sơ cá nhân | `/profile` | Authenticated | Xem thông tin tài khoản | `GET /api/users/me` |
| Chỉnh sửa hồ sơ | `/profile/edit` | Authenticated | Cập nhật thông tin cá nhân | `PUT /api/users/me` |
| Đổi mật khẩu | `/profile/change-password` | Authenticated | Đổi mật khẩu khi đã đăng nhập | `POST /api/auth/change-password` |
| Quản lý user (admin) | `/admin/users` | admin, superAdmin | Danh sách và quản lý user | `GET /api/admin/users` |
| Chi tiết user (admin) | `/admin/users/{id}` | admin, superAdmin | Xem, sửa, khóa/mở khóa user | `GET/PUT /api/admin/users/{id}` |
| Quản lý role (admin) | `/admin/roles` | superAdmin | Tạo/sửa role và gán permission | CRUD `/api/admin/roles` |
| Audit log (admin) | `/admin/audit-logs` | admin, superAdmin | Xem lịch sử hành động admin | `GET /api/admin/audit-logs` |

**Yêu cầu UI chi tiết:**
- Form đăng nhập: ô nhập email/phone/mã học sinh, mật khẩu, nút đăng nhập và link "Quên mật khẩu".
- Form đăng ký: họ tên, email, số điện thoại, mật khẩu, xác nhận mật khẩu; hiển thị yêu cầu mật khẩu theo policy.
- Sau đăng ký thành công: thông báo yêu cầu xác minh email, không cho phép đăng nhập khi chưa xác minh.
- Trang admin users: bảng danh sách có lọc theo trạng thái, role, từ khóa; nút khóa/mở khóa inline.
- Trang audit log: bảng theo thời gian, lọc theo admin và loại hành động.

---

## 10. API đề xuất

| Mã API | Method | Endpoint đề xuất | Mục đích | Auth required | Permission | Request chính | Response chính | Business rule | Ghi chú |
|---|---|---|---|---|---|---|---|---|---|
| API-AUTH-001 | POST | `/api/auth/login` | Đăng nhập bằng credential | Không | Không | `{ identifier, password, site? }` | `{ accessToken, expiresIn, refreshToken, user }` | BR-AUTH-001, BR-AUTH-002 | identifier: email hoặc phone hoặc mã học sinh |
| API-AUTH-002 | POST | `/api/auth/google` | Đăng nhập qua Google OAuth | Không | Không | `{ idToken }` | `{ accessToken, expiresIn, refreshToken, user }` | BR-AUTH-001 | Xác thực idToken phía backend |
| API-AUTH-003 | POST | `/api/auth/register` | Đăng ký tài khoản mới | Không | Không | `{ fullname, email, phone?, password }` | `{ userId, message }` | BR-AUTH-003 | Gửi email xác minh sau khi tạo |
| API-AUTH-004 | GET | `/api/auth/verify-email` | Xác minh email từ link | Không | Không | `?token=...` | `{ message }` | BR-AUTH-003 | Token trong query string |
| API-AUTH-005 | POST | `/api/auth/logout` | Đăng xuất, thu hồi refresh token | Có | Không | `{ refreshToken }` | `{ ok: true }` | BR-AUTH-004 | Idempotent; không lỗi nếu token đã thu hồi |
| API-AUTH-006 | POST | `/api/auth/refresh` | Lấy access token mới | Không | Không | `{ refreshToken }` | `{ accessToken, expiresIn, refreshToken }` | BR-AUTH-005 | Xoay vòng refresh token; thu hồi token cũ |
| API-AUTH-007 | POST | `/api/auth/forgot-password` | Gửi email đặt lại mật khẩu | Không | Không | `{ email }` | `{ message }` | BR-AUTH-006 | Luôn trả thành công dù email không tồn tại (chống enum) |
| API-AUTH-008 | POST | `/api/auth/reset-password` | Đặt mật khẩu mới bằng reset token | Không | Không | `{ token, newPassword }` | `{ ok: true }` | BR-AUTH-006 | Thu hồi mọi phiên sau khi đặt lại |
| API-AUTH-009 | POST | `/api/auth/change-password` | Đổi mật khẩu khi đã đăng nhập | Có | Không | `{ currentPassword, newPassword }` | `{ ok: true }` | BR-AUTH-009 | Thu hồi phiên khác; giữ phiên hiện tại |
| API-AUTH-010 | GET | `/api/users/me` | Lấy profile người dùng hiện tại | Có | `profile:read` | — | `{ user }` | BR-AUTH-002 | Không trả passwordHash |
| API-AUTH-011 | PUT | `/api/users/me` | Cập nhật profile | Có | `profile:update` | `{ fullname, phone?, avatarUrl? }` | `{ user }` | BR-AUTH-007 | Kiểm tra unique phone |
| API-AUTH-012 | GET | `/api/admin/users` | Danh sách user (admin) | Có | `user:read` | `?page, limit, q, status, role` | `{ items, total }` | BR-AUTH-008 | Phân trang, lọc theo nhiều tiêu chí |
| API-AUTH-013 | POST | `/api/admin/users` | Tạo user thủ công (admin) | Có | `user:create` | `{ fullname, email, phone?, password, roleIds }` | `{ user }` | BR-AUTH-008 | Ghi audit log |
| API-AUTH-014 | PUT | `/api/admin/users/{id}` | Cập nhật user (admin) | Có | `user:update` | `{ fullname, phone?, status? }` | `{ user }` | BR-AUTH-008 | Ghi audit log |
| API-AUTH-015 | POST | `/api/admin/users/{id}/block` | Khóa tài khoản | Có | `user:block` | `{ reason? }` | `{ ok: true }` | BR-AUTH-009 | Thu hồi phiên; ghi audit log |
| API-AUTH-016 | POST | `/api/admin/users/{id}/unblock` | Mở khóa tài khoản | Có | `user:block` | `{ reason? }` | `{ ok: true }` | BR-AUTH-009 | Ghi audit log |
| API-AUTH-017 | PUT | `/api/admin/users/{id}/roles` | Gán role cho user | Có | `role:assign` | `{ roleIds: [] }` | `{ ok: true }` | BR-AUTH-008 | Ghi audit log; ghi đè toàn bộ role |
| API-AUTH-018 | GET | `/api/admin/roles` | Danh sách role và permission | Có | `role:read` | — | `{ roles }` | — | |
| API-AUTH-019 | POST | `/api/admin/roles` | Tạo role mới | Có | `role:manage` | `{ code, name, permissionIds }` | `{ role }` | — | Chỉ superAdmin |
| API-AUTH-020 | GET | `/api/admin/audit-logs` | Xem audit log | Có | `audit:read` | `?page, limit, actorId, action, from, to` | `{ items, total }` | — | Phân trang theo thời gian |

---

## 11. Use case nghiệp vụ

### UC-AUTH-001 — Đăng nhập bằng credential

- **Mục tiêu**: Cho phép người dùng đăng nhập và nhận token để truy cập các tính năng cần xác thực.
- **Actor chính**: Guest (học viên, admin, giáo viên).
- **Actor phụ**: Không có.
- **Điều kiện trước**: Người dùng có tài khoản tồn tại trong hệ thống.
- **Trigger**: Người dùng gửi form đăng nhập.
- **Luồng chính**:
  1. Người dùng nhập identifier (email/phone/mã học sinh) và mật khẩu.
  2. Hệ thống tìm user theo identifier.
  3. Hệ thống kiểm tra mật khẩu bằng bcrypt.
  4. Hệ thống kiểm tra trạng thái tài khoản (phải là `active`).
  5. Hệ thống tạo JWT access token và refresh token mới.
  6. Hệ thống lưu refresh token vào DB.
  7. Trả về access token, refresh token và thông tin user cơ bản.
- **Luồng thay thế**:
  - Đăng nhập với `site=admin`: kiểm tra thêm điều kiện user có role admin.
- **Luồng lỗi**:
  - Không tìm thấy user hoặc mật khẩu sai: trả lỗi 401 với mã `INVALID_CREDENTIALS`.
  - Tài khoản bị khóa (`blocked`): trả lỗi 403 với mã `ACCOUNT_BLOCKED`.
  - Tài khoản chờ xác minh (`pending_verify`): trả lỗi 403 với mã `EMAIL_NOT_VERIFIED`.
  - Tài khoản không có quyền đăng nhập admin: trả lỗi 403 với mã `INSUFFICIENT_ROLE`.
- **Dữ liệu đầu vào**: `identifier` (string), `password` (string), `site` (string, không bắt buộc).
- **Dữ liệu đầu ra**: `accessToken`, `expiresIn`, `refreshToken`, `user` (id, fullname, email, role).
- **Business rule áp dụng**: BR-AUTH-001, BR-AUTH-002.
- **Acceptance criteria**:
  - Đăng nhập thành công với thông tin hợp lệ và tài khoản active.
  - Trả lỗi khi mật khẩu sai, tài khoản khóa hoặc chưa xác minh.
  - Không trả passwordHash trong response.

---

### UC-AUTH-002 — Đăng ký tài khoản mới

- **Mục tiêu**: Cho phép người dùng mới tạo tài khoản học viên.
- **Actor chính**: Guest.
- **Điều kiện trước**: Email và số điện thoại chưa tồn tại trong hệ thống.
- **Trigger**: Người dùng gửi form đăng ký.
- **Luồng chính**:
  1. Người dùng nhập họ tên, email, số điện thoại (không bắt buộc), mật khẩu.
  2. Hệ thống validate dữ liệu đầu vào (format, required fields).
  3. Hệ thống kiểm tra email và phone chưa được dùng.
  4. Hệ thống hash mật khẩu bằng bcrypt.
  5. Hệ thống tạo user với trạng thái `pending_verify`.
  6. Hệ thống tạo email verification token và gửi email.
  7. Trả về thông báo yêu cầu xác minh email.
- **Luồng lỗi**:
  - Email đã tồn tại: trả lỗi 422 với mã `EMAIL_ALREADY_EXISTS`.
  - Phone đã tồn tại: trả lỗi 422 với mã `PHONE_ALREADY_EXISTS`.
  - Mật khẩu không đáp ứng policy: trả lỗi 422 với mã `PASSWORD_TOO_WEAK`.
- **Business rule áp dụng**: BR-AUTH-003.
- **Acceptance criteria**:
  - Tạo tài khoản thành công với trạng thái `pending_verify`.
  - Email xác minh được gửi đến địa chỉ email đã nhập.
  - Tài khoản không thể đăng nhập trước khi xác minh email.

---

### UC-AUTH-003 — Quên và đặt lại mật khẩu

- **Mục tiêu**: Cho phép người dùng lấy lại quyền truy cập khi quên mật khẩu.
- **Actor chính**: Guest.
- **Điều kiện trước**: Người dùng có tài khoản với email đã xác minh.
- **Luồng chính**:
  1. Người dùng nhập email trên trang quên mật khẩu.
  2. Hệ thống tạo PasswordResetToken (hết hạn sau 1 giờ), hash và lưu DB.
  3. Hệ thống gửi email chứa link đặt lại mật khẩu kèm token gốc.
  4. Người dùng nhấp link, nhập mật khẩu mới.
  5. Hệ thống xác thực token (còn hạn, chưa dùng).
  6. Hệ thống hash và lưu mật khẩu mới.
  7. Hệ thống đánh dấu token đã dùng (`usedAt`).
  8. Hệ thống thu hồi toàn bộ refresh token hiện có của user.
  9. Trả về thông báo thành công.
- **Luồng lỗi**:
  - Email không tồn tại: trả thành công (chống email enumeration).
  - Token hết hạn hoặc đã dùng: trả lỗi 400 với mã `INVALID_RESET_TOKEN`.
- **Business rule áp dụng**: BR-AUTH-006.
- **Acceptance criteria**:
  - Email không tồn tại vẫn trả thành công (không lộ thông tin).
  - Token chỉ dùng được một lần.
  - Token hết hạn sau 1 giờ.
  - Mọi phiên đăng nhập bị thu hồi sau khi đặt lại mật khẩu.

---

### UC-AUTH-004 — Khóa tài khoản (admin)

- **Mục tiêu**: Admin khóa tài khoản vi phạm, ngăn đăng nhập ngay lập tức.
- **Actor chính**: admin, superAdmin.
- **Điều kiện trước**: Admin có permission `user:block`.
- **Luồng chính**:
  1. Admin chọn user cần khóa trên trang quản lý user.
  2. Admin nhập lý do khóa (không bắt buộc) và xác nhận.
  3. Hệ thống cập nhật trạng thái user sang `blocked`.
  4. Hệ thống thu hồi toàn bộ refresh token của user.
  5. Hệ thống ghi AuditLog với thông tin admin, user bị khóa, lý do.
  6. Trả về thành công.
- **Luồng lỗi**:
  - Không có permission: trả lỗi 403.
  - User không tồn tại: trả lỗi 404.
  - Admin không thể tự khóa tài khoản của mình: trả lỗi 400 với mã `CANNOT_BLOCK_SELF`.
- **Business rule áp dụng**: BR-AUTH-009, BR-SYS-006.
- **Acceptance criteria**:
  - Tài khoản bị khóa không thể đăng nhập ngay sau khi khóa.
  - Mọi phiên đang hoạt động của user bị thu hồi.
  - AuditLog được ghi đầy đủ.

---

### UC-AUTH-005 — Refresh token

- **Mục tiêu**: Cấp lại access token khi hết hạn mà không yêu cầu đăng nhập lại.
- **Actor chính**: Authenticated.
- **Điều kiện trước**: Client có refresh token hợp lệ.
- **Luồng chính**:
  1. Client gửi refresh token.
  2. Hệ thống tìm token trong DB, kiểm tra chưa hết hạn và chưa bị thu hồi.
  3. Hệ thống kiểm tra user sở hữu token vẫn active.
  4. Hệ thống phát hành access token mới.
  5. Hệ thống tạo refresh token mới và thu hồi token cũ (rotation).
  6. Trả về access token mới và refresh token mới.
- **Luồng lỗi**:
  - Token không tồn tại, hết hạn, hoặc đã thu hồi: trả lỗi 401 với mã `INVALID_REFRESH_TOKEN`.
  - User bị khóa: trả lỗi 403 với mã `ACCOUNT_BLOCKED`.
- **Business rule áp dụng**: BR-AUTH-005.
- **Acceptance criteria**:
  - Refresh token cũ bị thu hồi sau khi xoay vòng.
  - Không thể dùng refresh token cũ sau khi đã xoay vòng.

---

## 12. User story

### US-AUTH-001 — Đăng nhập bằng email và mật khẩu
- **Với vai trò**: Học viên
- **Tôi muốn**: Đăng nhập bằng email và mật khẩu
- **Để**: Truy cập các khóa học và tài liệu đã mua
- **Priority**: Must
- **Given**: Tôi có tài khoản với email và mật khẩu hợp lệ, tài khoản đang active
- **When**: Tôi nhập email và mật khẩu đúng và nhấn đăng nhập
- **Then**: Tôi được chuyển vào trang chính với phiên làm việc hợp lệ
- **Test scenario**: Nhập đúng → thành công; nhập sai mật khẩu → lỗi; tài khoản bị khóa → lỗi rõ ràng

---

### US-AUTH-002 — Đăng ký tài khoản mới
- **Với vai trò**: Học viên mới
- **Tôi muốn**: Tạo tài khoản bằng email và mật khẩu
- **Để**: Bắt đầu học trên hệ thống
- **Priority**: Must
- **Given**: Tôi chưa có tài khoản, email chưa được đăng ký
- **When**: Tôi điền đầy đủ thông tin và gửi form đăng ký
- **Then**: Tài khoản được tạo, tôi nhận email xác minh, và được thông báo cần xác minh email trước khi đăng nhập
- **Test scenario**: Email mới → thành công; email trùng → lỗi; mật khẩu yếu → lỗi với mô tả rõ

---

### US-AUTH-003 — Quên mật khẩu
- **Với vai trò**: Học viên đã có tài khoản
- **Tôi muốn**: Đặt lại mật khẩu khi quên
- **Để**: Lấy lại quyền truy cập tài khoản
- **Priority**: Must
- **Given**: Tôi có tài khoản với email đã xác minh
- **When**: Tôi nhập email trên trang quên mật khẩu
- **Then**: Tôi nhận email có link đặt lại mật khẩu; link hết hạn sau 1 giờ; sau khi đặt lại, mọi phiên cũ bị đăng xuất
- **Test scenario**: Email tồn tại → nhận email; email không tồn tại → cũng trả thành công (không lộ thông tin); link đã dùng → lỗi

---

### US-AUTH-004 — Đổi mật khẩu khi đã đăng nhập
- **Với vai trò**: Học viên, admin
- **Tôi muốn**: Đổi mật khẩu khi đã đăng nhập
- **Để**: Cập nhật mật khẩu theo ý muốn
- **Priority**: Must
- **Given**: Tôi đã đăng nhập
- **When**: Tôi nhập mật khẩu hiện tại đúng và nhập mật khẩu mới hợp lệ
- **Then**: Mật khẩu được cập nhật, các phiên khác bị đăng xuất, phiên hiện tại vẫn giữ
- **Test scenario**: Mật khẩu hiện tại sai → lỗi; mật khẩu mới không đủ mạnh → lỗi; thành công → xác nhận

---

### US-AUTH-005 — Cập nhật hồ sơ cá nhân
- **Với vai trò**: Học viên, admin
- **Tôi muốn**: Cập nhật tên, số điện thoại và ảnh đại diện
- **Để**: Thông tin tài khoản luôn chính xác
- **Priority**: Must
- **Given**: Tôi đã đăng nhập
- **When**: Tôi thay đổi thông tin và lưu
- **Then**: Thông tin được cập nhật; nếu số điện thoại đã có người dùng thì báo lỗi
- **Test scenario**: Cập nhật thành công; thay đổi phone trùng → lỗi; họ tên rỗng → lỗi

---

### US-AUTH-006 — Đăng xuất
- **Với vai trò**: Học viên, admin
- **Tôi muốn**: Đăng xuất khỏi hệ thống
- **Để**: Đảm bảo tài khoản an toàn khi dùng thiết bị chung
- **Priority**: Must
- **Given**: Tôi đã đăng nhập
- **When**: Tôi nhấn đăng xuất
- **Then**: Phiên làm việc bị kết thúc, refresh token bị thu hồi, không thể dùng token cũ
- **Test scenario**: Đăng xuất → thành công; dùng lại refresh token cũ → lỗi 401

---

### US-AUTH-007 — Admin khóa tài khoản
- **Với vai trò**: Admin
- **Tôi muốn**: Khóa tài khoản học viên vi phạm
- **Để**: Ngăn tài khoản đó đăng nhập ngay lập tức
- **Priority**: Must
- **Given**: Tôi là admin có permission user:block
- **When**: Tôi chọn tài khoản cần khóa và xác nhận
- **Then**: Tài khoản bị khóa, mọi phiên đăng nhập bị thu hồi, lịch sử hành động được ghi
- **Test scenario**: Khóa thành công; thử đăng nhập với tài khoản bị khóa → lỗi rõ ràng; audit log có bản ghi

---

### US-AUTH-008 — Admin gán role cho user
- **Với vai trò**: Admin, superAdmin
- **Tôi muốn**: Gán hoặc thay đổi role của một user
- **Để**: Cấp đúng quyền truy cập theo nhiệm vụ
- **Priority**: Should
- **Given**: Tôi có permission role:assign
- **When**: Tôi chọn user, chọn role mới và lưu
- **Then**: User được cập nhật role, quyền của user thay đổi ngay lập tức, audit log được ghi
- **Test scenario**: Gán role thành công; gán role không có permission → lỗi 403; audit log có bản ghi

---

## 13. Luồng nghiệp vụ chi tiết

### Luồng 1: Đăng nhập

```
[Người dùng] → Nhập identifier + password
     ↓
[API] → Validate request shape
     ↓
[AuthService] → Tìm user theo email / phone / studentCode
     ↓
[AuthService] → So sánh passwordHash bằng bcrypt
     ↓ (sai)
[AuthService] → Trả lỗi INVALID_CREDENTIALS (401)
     ↓ (đúng)
[AuthService] → Kiểm tra status = active
     ↓ (không active)
[AuthService] → Trả lỗi theo trạng thái (403)
     ↓ (active)
[TokenService] → Tạo JWT access token (15 phút)
[TokenService] → Tạo refresh token opaque, lưu DB
     ↓
[API] → Trả accessToken, refreshToken, user
```

### Luồng 2: Refresh token (rotation)

```
[Client] → Gửi refreshToken
     ↓
[TokenService] → Tìm token trong DB
     ↓ (không tìm thấy / hết hạn / đã thu hồi)
[TokenService] → Trả lỗi INVALID_REFRESH_TOKEN (401)
     ↓ (hợp lệ)
[TokenService] → Kiểm tra user.status = active
     ↓
[TokenService] → Tạo access token mới
[TokenService] → Tạo refresh token mới, lưu DB
[TokenService] → Thu hồi refresh token cũ (revokedAt = now)
     ↓
[API] → Trả accessToken mới, refreshToken mới
```

### Luồng 3: Đặt lại mật khẩu

```
[Người dùng] → Nhập email trên trang quên mật khẩu
     ↓
[PasswordService] → Tìm user theo email
     ↓ (dù tìm thấy hay không)
[PasswordService] → Nếu tìm thấy: tạo reset token, hash, lưu DB, gửi email
[API] → Luôn trả thành công (chống email enumeration)
     ↓
[Người dùng] → Nhấp link email, nhập mật khẩu mới
     ↓
[PasswordService] → Xác thực reset token (còn hạn, chưa dùng)
     ↓ (không hợp lệ)
[PasswordService] → Trả lỗi INVALID_RESET_TOKEN (400)
     ↓ (hợp lệ)
[PasswordService] → Hash mật khẩu mới, cập nhật User
[PasswordService] → Đánh dấu reset token đã dùng
[TokenService] → Thu hồi toàn bộ RefreshToken của user
[API] → Trả thành công
```

---

## 14. Business rule áp dụng

| Mã rule | Nội dung áp dụng trong module này |
|---|---|
| BR-AUTH-001 | Backend phải kiểm tra access token cho mọi endpoint bảo mật |
| BR-AUTH-002 | User chỉ truy cập hồ sơ và dữ liệu của chính mình, trừ admin có permission |
| BR-AUTH-003 | Email phải là duy nhất; tài khoản cần xác minh email trước khi đăng nhập |
| BR-AUTH-004 | Refresh token phải bị thu hồi khi đăng xuất hoặc đổi mật khẩu |
| BR-AUTH-005 | Access token ngắn hạn (≤ 15 phút); refresh token xoay vòng khi sử dụng |
| BR-AUTH-006 | Reset token hết hạn sau 1 giờ, chỉ dùng được một lần |
| BR-AUTH-007 | Khi cập nhật profile, các trường unique phải được kiểm tra trùng lặp |
| BR-AUTH-008 | Hành động admin tác động đến tài khoản phải có audit log |
| BR-AUTH-009 | Tài khoản bị khóa không thể đăng nhập; khi khóa phải thu hồi mọi phiên |
| BR-SYS-001 | Người dùng chỉ thao tác dữ liệu của mình trừ admin |
| BR-SYS-002 | Backend phải kiểm tra quyền truy cập cho mọi endpoint bảo mật |
| BR-SYS-006 | Audit log bắt buộc cho hành động cấp quyền, thay đổi role, khóa tài khoản |

---

## 15. Validation

### Đăng nhập
- `identifier`: bắt buộc, không rỗng.
- `password`: bắt buộc, không rỗng.

### Đăng ký
- `fullname`: bắt buộc, 2–255 ký tự.
- `email`: bắt buộc, format email hợp lệ.
- `phone`: không bắt buộc, nếu có phải đúng định dạng số điện thoại Việt Nam.
- `password`: bắt buộc, tối thiểu 8 ký tự, chứa ít nhất một chữ hoa và một chữ số.

### Đổi mật khẩu
- `currentPassword`: bắt buộc.
- `newPassword`: bắt buộc, tối thiểu 8 ký tự, chứa chữ hoa và chữ số, khác `currentPassword`.

### Cập nhật hồ sơ
- `fullname`: không rỗng nếu có, tối đa 255 ký tự.
- `phone`: không bắt buộc, nếu có phải đúng định dạng.
- `avatarUrl`: không bắt buộc, nếu có phải là URL hợp lệ.

### Tạo user (admin)
- `fullname`, `email`, `password`: bắt buộc, theo rule tương ứng.
- `roleIds`: mảng UUID hợp lệ, ít nhất một role.

---

## 16. State machine

### Trạng thái tài khoản User

```
[Tạo mới] → pending_verify
     ↓ (xác minh email thành công)
   active
     ↓ (admin khóa)         ↓ (admin vô hiệu hóa)
  blocked              inactive
     ↓ (admin mở khóa)      ↓ (admin kích hoạt)
   active                active
```

| Trạng thái | Ý nghĩa | Có thể đăng nhập |
|---|---|---|
| `pending_verify` | Tài khoản mới tạo, chờ xác minh email | Không |
| `active` | Tài khoản hoạt động bình thường | Có |
| `inactive` | Bị vô hiệu hóa tạm thời (không phải do vi phạm) | Không |
| `blocked` | Bị khóa do vi phạm, cần admin xem xét | Không |

### Trạng thái RefreshToken

```
active → revoked (khi: đăng xuất / đổi mật khẩu / reset mật khẩu / khóa tài khoản / rotation)
active → expired (khi: hết hạn theo expiresAt)
```

---

## 17. Xử lý lỗi

| Mã lỗi | HTTP status | Trường hợp xảy ra | Thông điệp cho người dùng |
|---|---|---|---|
| `INVALID_CREDENTIALS` | 401 | Identifier hoặc mật khẩu sai | Thông tin đăng nhập không đúng |
| `ACCOUNT_BLOCKED` | 403 | Tài khoản bị khóa | Tài khoản của bạn đã bị khóa |
| `ACCOUNT_INACTIVE` | 403 | Tài khoản bị vô hiệu hóa | Tài khoản của bạn không hoạt động |
| `EMAIL_NOT_VERIFIED` | 403 | Tài khoản chờ xác minh | Vui lòng xác minh email trước khi đăng nhập |
| `INSUFFICIENT_ROLE` | 403 | Không đủ role để đăng nhập admin | Bạn không có quyền truy cập trang quản trị |
| `EMAIL_ALREADY_EXISTS` | 422 | Email đã được sử dụng | Email này đã được đăng ký |
| `PHONE_ALREADY_EXISTS` | 422 | Số điện thoại đã được sử dụng | Số điện thoại này đã được đăng ký |
| `PASSWORD_TOO_WEAK` | 422 | Mật khẩu không đủ mạnh | Mật khẩu phải ít nhất 8 ký tự, chứa chữ hoa và chữ số |
| `INVALID_REFRESH_TOKEN` | 401 | Refresh token không hợp lệ, hết hạn hoặc đã thu hồi | Phiên đăng nhập hết hạn |
| `INVALID_RESET_TOKEN` | 400 | Reset token không hợp lệ hoặc đã dùng | Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn |
| `CANNOT_BLOCK_SELF` | 400 | Admin cố khóa tài khoản mình | Không thể khóa tài khoản của chính mình |
| `USER_NOT_FOUND` | 404 | Không tìm thấy user (admin API) | Không tìm thấy người dùng |
| `FORBIDDEN` | 403 | Không có permission cho action | Bạn không có quyền thực hiện thao tác này |

---

## 18. Acceptance criteria

| Mã AC | Chức năng | Tiêu chí chấp nhận |
|---|---|---|
| AC-AUTH-001 | Đăng nhập | Đăng nhập thành công với thông tin hợp lệ, tài khoản active, trả về accessToken và refreshToken |
| AC-AUTH-002 | Đăng nhập | Trả lỗi 401 khi mật khẩu sai |
| AC-AUTH-003 | Đăng nhập | Trả lỗi 403 khi tài khoản blocked, inactive hoặc pending_verify với thông điệp phù hợp |
| AC-AUTH-004 | Đăng ký | Tạo tài khoản với trạng thái pending_verify và gửi email xác minh |
| AC-AUTH-005 | Đăng ký | Trả lỗi 422 khi email đã tồn tại |
| AC-AUTH-006 | Đăng ký | Không thể đăng nhập khi chưa xác minh email |
| AC-AUTH-007 | Quên mật khẩu | Luôn trả thành công dù email có tồn tại hay không |
| AC-AUTH-008 | Đặt lại mật khẩu | Token chỉ dùng được một lần; dùng lần hai trả lỗi 400 |
| AC-AUTH-009 | Đặt lại mật khẩu | Mọi phiên đăng nhập bị thu hồi sau khi đặt lại mật khẩu |
| AC-AUTH-010 | Refresh token | Refresh token cũ bị thu hồi sau khi xoay vòng; không thể dùng lại |
| AC-AUTH-011 | Khóa tài khoản | Tài khoản bị khóa không thể đăng nhập; mọi phiên bị thu hồi |
| AC-AUTH-012 | Audit log | Mọi hành động admin tác động đến tài khoản phải có bản ghi trong audit log |
| AC-AUTH-013 | API bảo mật | Mọi endpoint cần auth phải trả 401 khi thiếu hoặc sai token |
| AC-AUTH-014 | Permission | Endpoint cần permission phải trả 403 khi user không có permission đó |
| AC-AUTH-015 | Profile | Không trả passwordHash trong response profile |

---

## 19. Test/UAT scenario

| Mã kịch bản | Mô tả | Điều kiện ban đầu | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|---|
| T-AUTH-001 | Đăng nhập thành công | User active với email và mật khẩu hợp lệ | Gửi `POST /api/auth/login` với identifier và password đúng | Trả 200 với accessToken, refreshToken, user info |
| T-AUTH-002 | Đăng nhập sai mật khẩu | User active | Gửi password sai | Trả 401 với mã INVALID_CREDENTIALS |
| T-AUTH-003 | Đăng nhập tài khoản bị khóa | User blocked | Gửi thông tin đúng | Trả 403 với mã ACCOUNT_BLOCKED |
| T-AUTH-004 | Đăng nhập chưa xác minh email | User pending_verify | Gửi thông tin đúng | Trả 403 với mã EMAIL_NOT_VERIFIED |
| T-AUTH-005 | Đăng ký email mới | Email chưa tồn tại | Gửi `POST /api/auth/register` với dữ liệu đầy đủ hợp lệ | Trả 201, gửi email xác minh |
| T-AUTH-006 | Đăng ký email trùng | Email đã tồn tại | Gửi cùng email | Trả 422 với mã EMAIL_ALREADY_EXISTS |
| T-AUTH-007 | Xác minh email hợp lệ | User pending_verify, có token chưa hết hạn | Gửi `GET /api/auth/verify-email?token=...` | Trả 200, trạng thái user chuyển sang active |
| T-AUTH-008 | Xác minh email token hết hạn | Token đã hết hạn | Gửi token cũ | Trả 400 với mã lỗi phù hợp |
| T-AUTH-009 | Refresh token hợp lệ | User có refresh token còn hạn | Gửi `POST /api/auth/refresh` | Trả 200 với access token mới và refresh token mới |
| T-AUTH-010 | Refresh token sau khi đã dùng | Đã dùng refresh token một lần | Gửi lại refresh token cũ | Trả 401 với mã INVALID_REFRESH_TOKEN |
| T-AUTH-011 | Đặt lại mật khẩu thành công | User có reset token chưa hết hạn | Gửi token và mật khẩu mới hợp lệ | Trả 200; các phiên cũ bị thu hồi |
| T-AUTH-012 | Dùng lại reset token | Token đã được sử dụng | Gửi lại token cũ | Trả 400 với mã INVALID_RESET_TOKEN |
| T-AUTH-013 | Admin khóa tài khoản | Admin có permission user:block | Gửi `POST /api/admin/users/{id}/block` | Trả 200; user không thể đăng nhập; audit log được ghi |
| T-AUTH-014 | Truy cập API bảo mật không có token | Không có Authorization header | Gửi request đến endpoint cần auth | Trả 401 |
| T-AUTH-015 | Truy cập API admin không có permission | User là student | Gửi request đến `/api/admin/users` | Trả 403 |

---

## 20. Phụ thuộc module khác

### Module này phụ thuộc
- Không phụ thuộc module nghiệp vụ nào. Module Authentication là nền tảng độc lập.
- Phụ thuộc dịch vụ hạ tầng: EmailService (gửi email xác minh và reset mật khẩu), Google OAuth API.

### Module khác phụ thuộc module này
- **Tất cả module** phụ thuộc Authentication để:
  - Kiểm tra token hợp lệ qua `AuthMiddleware`.
  - Kiểm tra permission qua `PermissionService`.
  - Xác định ownership (user chỉ truy cập dữ liệu của mình).
- Module khác **không được** tự tái triển khai logic xác thực — phải dùng middleware và service của module này.

---

## 21. Câu hỏi cần xác nhận

| Câu hỏi | Ảnh hưởng | Đề xuất tạm thời |
|---|---|---|
| Policy mật khẩu cụ thể: bao nhiêu ký tự, ký tự đặc biệt có bắt buộc không? | Validation đăng ký và đổi mật khẩu | Tối thiểu 8 ký tự, ít nhất 1 chữ hoa và 1 chữ số |
| Thời hạn refresh token là bao lâu? | Token rotation policy | Đề xuất 30 ngày |
| Xác minh email có bắt buộc hay có thể bỏ qua theo cấu hình? | UX đăng ký | Bắt buộc trong phiên bản đầu |
| Số lần đăng nhập sai tối đa trước khi khóa tài khoản tạm thời? | Security policy | Chưa xác định, đề xuất 5 lần sai trong 15 phút |
| Đăng nhập Google OAuth có tự động tạo tài khoản nếu email chưa tồn tại không? | UX Google login | Đề xuất: tự động tạo tài khoản với role student |
| Một user có thể có nhiều role cùng lúc không? | Role model | Đề xuất: có, vì bảng UserRole là N-N |
| Permission có được cache trong session không? | Hiệu năng kiểm tra quyền | Đề xuất: cache ngắn hạn (5–10 phút) trong Redis |
