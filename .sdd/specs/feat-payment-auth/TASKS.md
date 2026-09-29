# [TASKS] feat-payment-auth — Implementation Checklist

> **Quy tắc:** Thực hiện tuần tự từng task. Đánh dấu [x] khi hoàn thành. Không để TODO comment trong code đã merge.

---

### 📦 Giai đoạn 1: Database Migration & Schema (Data Layer)
- [ ] **Task 1.1:** Tạo file migration mới cho bảng dữ liệu (đủ audit columns: `created_at`, `updated_at`, `created_by`, `is_deleted`).
- [ ] **Task 1.2:** Viết migration kiểm thử và kiểm tra rollback script.
- [ ] **Task 1.3:** Khởi tạo Entity class ánh xạ chuẩn DB (đầy đủ soft delete annotation).

### ⚙️ Giai đoạn 2: DTO Contracts & Repository Layer
- [ ] **Task 2.1:** Tạo Request DTO với đầy đủ validation constraints (`@NotNull`, `@Size`, bounds, regex).
- [ ] **Task 2.2:** Tạo Response DTO chuẩn format `{ status, message, data }`.
- [ ] **Task 2.3:** Xây dựng Repository interface với Parameterized Query chống SQL Injection.

### 🧠 Giai đoạn 3: Domain Service Layer & Business Logic
- [ ] **Task 3.1:** Khởi tạo Service Layer với `@Transactional` boundary.
- [ ] **Task 3.2:** Cài đặt logic kiểm tra Idempotency Key (TTL 24h).
- [ ] **Task 3.3:** Xử lý State Transition và Transactional Outbox event generation.
- [ ] **Task 3.4:** Map kết quả từ Entity sang Response DTO (Zero Entity Leak).

### 🌐 Giai đoạn 4: Controller & Error Handling
- [ ] **Task 4.1:** Tạo Lean Controller nhận Request DTO và gọi Service.
- [ ] **Task 4.2:** Đăng ký mã lỗi RFC 7807 vào Global Exception Handler.
- [ ] **Task 4.3:** Thiết lập timeout và Circuit Breaker cho các lời gọi mạng liên quan.

### 🧪 Giai đoạn 5: Testing Suite (Coverage >= 80%)
- [ ] **Task 5.1:** Viết Unit Test cho Service Layer (Happy Path & All Error Cases).
- [ ] **Task 5.2:** Viết Integration Test cho Controller Endpoint (Mock external HTTP/Kafka).
- [ ] **Task 5.3:** Chạy test suite và đối chiếu coverage đạt >= 80% theo CONSTITUTION §5.

### 🛡️ Giai đoạn 6: Code Review Gate & DoD Verification
- [ ] **Task 6.1:** Chạy linter & format code (0 warning).
- [ ] **Task 6.2:** Kiểm tra không có Hardcoded Secrets, không có `SELECT *`, không có TODO comments.
- [ ] **Task 6.3:** Xác thực kích thước code: Method <= 40 dòng, File <= 300 dòng.
