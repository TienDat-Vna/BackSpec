# [CHECKLIST] feat-process-payment — Quality & Acceptance Verification

> **Mục đích:** Danh mục kiểm định chất lượng bắt buộc trước khi phê duyệt spec hoặc merge code.

---

### 📋 1. Tính Đầy Đủ Của Đặc Tả (Specification Completeness)
- [ ] User Stories & Acceptance Criteria (Given-When-Then) đã được mô tả chi tiết.
- [ ] Đã xác định rõ phân tầng Bounded Context (`CORE` vs `SHELL`).
- [ ] Ma trận mã lỗi RFC 7807 (400, 401, 403, 404, 409, 422, 500) được định nghĩa đầy đủ.

### 🛡️ 2. An Toàn & Chuẩn DTO (Zero Entity Leak)
- [ ] Request DTO có đầy đủ validation annotations (`@NotNull`, bounds, regex).
- [ ] Response DTO tuân thủ chuẩn format `{ "status": 200, "message": "...", "data": ... }`.
- [ ] Tuyệt đối 0 Entity lọt trực tiếp ra Controller hoặc Event Broker.

### 💾 3. Dữ Liệu & Database Migration
- [ ] Tạo file migration mới (không sửa file cũ).
- [ ] Bảng có đủ audit columns (`created_at`, `updated_at`, `created_by`).
- [ ] Cơ chế Soft Delete (`is_deleted` hoặc `status`) được áp dụng 100%.

### ⚡ 4. Độ Bền Vững & Phân Tán (Resilience & Outbox)
- [ ] Transaction Boundary đặt duy nhất tại Service Layer (`@Transactional`).
- [ ] Idempotency Key được kiểm tra qua Redis với TTL 24h.
- [ ] Transactional Outbox Pattern được thiết lập cho mọi asynchronous event.
- [ ] Cuộc gọi ngoại vi có cấu hình Timeout <= 3000ms và Circuit Breaker.

### 🧪 5. Tiêu Chuẩn Kiểm Thử (DoD Testing)
- [ ] Unit Test bao phủ 100% luồng Happy Path và Exception Path.
- [ ] Integration Test kiểm thử Controller endpoint với Mock ngoại vi.
- [ ] Line Coverage đo lường thực tế đạt **>= 80%** theo CONSTITUTION §5.
- [ ] Zero TODO comment trong toàn bộ mã nguồn.
