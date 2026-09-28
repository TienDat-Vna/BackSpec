function generateSpecMd(featureName, options = {}) {
  const serviceName = options.serviceName || "{{SERVICE_NAME}}";
  const author = options.author || "{{AUTHOR}}";
  const date = new Date().toISOString().split("T")[0];

  return `# [SPEC] ${featureName}

> **Status:** DRAFT | **Author:** ${author} | **Created:** ${date} | **Service:** ${serviceName}

---

## 1. TỔNG QUAN & MỤC TIÊU NGHIỆP VỤ (OVERVIEW)
### 1.1. Bối cảnh
- **Mục tiêu:** _{Mô tả mục tiêu của tính năng và giá trị mang lại cho hệ thống}_
- **Bounded Context:** \`${serviceName}\`
- **Phân loại Module:** \`CORE\` (Nghiệp vụ cốt lõi) / \`SHELL\` (Tích hợp, Adapter)

### 1.2. User Stories & Acceptance Criteria
- **US-01:** Là một _{Actor}_, tôi muốn _{Hành động}_ để _{Kết quả mong muốn}_.
  - **AC-1.1 (Happy Path):** Given _{Điều kiện hợp lệ}_, When _{Gọi API/Sự kiện}_, Then _{Trả về 200/201 và dữ liệu DTO}_.
  - **AC-1.2 (Validation Error):** Given _{Dữ liệu sai định dạng}_, When _{Gọi API}_, Then _{Trả về 400 Bad Request kèm chi tiết trường lỗi}_.
  - **AC-1.3 (Business Error):** Given _{Vi phạm luật nghiệp vụ}_, When _{Thực thi}_, Then _{Trả về 422 Unprocessable Entity kèm error code}_.

---

## 2. API CONTRACT & DTO PATTERN (BẮT BUỘC)
> [!IMPORTANT]
> **ZERO ENTITY LEAK**: Tuyệt đối không nhận hoặc trả Entity trực tiếp ra API. Mọi dữ liệu phải thông qua DTO.

### 2.1. Endpoint Definitions
- **Method & Path:** \`POST /api/v1/${featureName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}\`
- **Header:** \`Idempotency-Key: <UUID>\` (Bắt buộc cho thao tác tạo mới/thay đổi)

### 2.2. Request DTO Schema
\`\`\`json
{
  "reference_id": "string (UUID, required)",
  "account_type": "string (ENUM: PERSONAL, ENTERPRISE, required)",
  "amount": "number (min: 0, required)",
  "metadata": {
    "source": "string"
  }
}
\`\`\`

### 2.3. Response DTO Schema (Standard Format)
\`\`\`json
{
  "status": 200,
  "message": "Resource created successfully",
  "data": {
    "id": "UUID",
    "status": "ACTIVE",
    "created_at": "2026-09-28T00:00:00Z"
  }
}
\`\`\`

### 2.4. Ma trận Mã lỗi (RFC 7807 Standard Error Matrix)
| HTTP Status | Error Code | Điều kiện kích hoạt | Phản hồi RFC 7807 |
|---|---|---|---|
| 400 | \`ERR_INVALID_FORMAT\` | Request DTO thiếu trường bắt buộc hoặc sai regex | \`{ "type": "about:blank", "title": "Bad Request", "detail": "..." }\` |
| 401 | \`ERR_UNAUTHORIZED\` | Token JWT thiếu hoặc hết hạn | \`{ "title": "Unauthorized", "detail": "Token expired" }\` |
| 403 | \`ERR_FORBIDDEN\` | Không có quyền truy cập tài nguyên | \`{ "title": "Forbidden", "detail": "Access denied" }\` |
| 409 | \`ERR_IDEMPOTENCY_CONFLICT\` | Idempotency Key đang được xử lý | \`{ "title": "Conflict", "detail": "Request is processing" }\` |
| 422 | \`ERR_BUSINESS_VIOLATION\` | Số dư không đủ / Trạng thái không hợp lệ | \`{ "title": "Unprocessable Entity", "detail": "..." }\` |
| 500 | \`ERR_INTERNAL_SERVER\` | Lỗi hệ thống ngoài ý muốn | \`{ "title": "Internal Server Error" }\` |

---

## 3. DATABASE SCHEMA & MIGRATION PLAN
- **Bảng tác động:** \`tbl_${featureName.toLowerCase().replace(/[^a-z0-9]+/g, "_")}\`
- **Migration File mới:** \`V${date.replace(/-/g, "")}__create_${featureName.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_table.sql\`
- **Audit Columns (Bắt buộc):** \`created_at\`, \`updated_at\`, \`created_by\`
- **Soft Delete (Bắt buộc):** \`is_deleted BOOLEAN DEFAULT FALSE\` (hoặc \`status VARCHAR(30)\`)

---

## 4. DISTRIBUTED RESILIENCE & SAGA INTEGRATION
- **Idempotency:** Kiểm tra Idempotency Key trong Redis với TTL 24h.
- **Transactional Outbox:** Khi lưu DB thành công, đồng thời insert bản ghi vào \`tbl_outbox\` trong cùng một Local Transaction.
- **Timeout Configuration:** Timeout gọi mạng tối đa \`3000ms\`.
- **Circuit Breaker:** Ngắt mạch khi tỷ lệ lỗi > 50% trong 10 calls liên tiếp.
`;
}

function generatePlanMd(featureName, options = {}) {
  return `# [PLAN] ${featureName} — Architectural & Technical Plan

---

## 1. KIẾN TRÚC TỔNG THỂ & LUỒNG THỰC THI (ARCHITECTURE)

\`\`\`mermaid
sequenceDiagram
    autonumber
    actor Client
    participant Controller as Thin Controller
    participant Service as Domain Service Layer (@Transactional)
    participant Repo as SQL Repository (Parameter Binding)
    participant Redis as Redis Cache (Idempotency TTL 24h)
    participant Outbox as Transactional Outbox Table
    participant Kafka as Event Broker (Kafka)

    Client->>Controller: POST /api/v1/... (Idempotency-Key)
    Controller->>Controller: Validate DTO Format
    Controller->>Redis: Check Idempotency Key
    alt Trùng lặp / Đang xử lý
        Redis-->>Controller: Cached Response / Processing
        Controller-->>Client: 409 Conflict / Cached 200
    end
    Controller->>Service: Execute Business Logic (Command DTO)
    Service->>Repo: Query Existing Entity (Soft-delete filter)
    Service->>Service: Validate Domain Rules
    Service->>Repo: Save Entity (created_at, is_deleted=false)
    Service->>Outbox: Save CloudEvent to Outbox
    Service-->>Controller: Return Response DTO
    Controller-->>Client: 201 Created Response
    Note over Outbox,Kafka: Background Poller publishes Outbox to Kafka Topic
\`\`\`

---

## 2. RANH GIỚI TRANSACTION & AN TOÀN DỮ LIỆU
1. **Transaction Boundary:** CHỈ đặt \`@Transactional\` tại Service Layer. Tuyệt đối không đặt ở Controller hoặc Repository.
2. **Isolation Level:** Read Committed.
3. **Rollback Rules:** Rollback toàn bộ khi gặp bất kỳ \`RuntimeException\` hoặc \`BusinessException\`.
4. **Zero N+1 Query:** Sử dụng Projection DTO hoặc \`JOIN FETCH\` khi truy vấn liên kết.

---

## 3. STATE TRANSITION MACHINE (QUẢN LÝ TRẠNG THÁI)
\`\`\`
[CREATED] ──(validate)──► [PROCESSING] ──(success)──► [COMPLETED]
                                │
                                └──(failed)──► [FAILED] (Compensation)
\`\`\`

---

## 4. KẾ HOẠCH ROLLBACK & DỰ PHÒNG RỦI RO
- **DB Migration:** Tạo script down migration tương ứng.
- **Feature Flag:** Cấu hình toggle bật/tắt tính năng qua config server.
- **Graceful Fallback:** Khi Redis sập, fallback sang kiểm tra DB lock tạm thời.
`;
}

function generateTasksMd(featureName, options = {}) {
  return `# [TASKS] ${featureName} — Implementation Checklist

> **Quy tắc:** Thực hiện tuần tự từng task. Đánh dấu [x] khi hoàn thành. Không để TODO comment trong code đã merge.

---

### 📦 Giai đoạn 1: Database Migration & Schema (Data Layer)
- [ ] **Task 1.1:** Tạo file migration mới cho bảng dữ liệu (đủ audit columns: \`created_at\`, \`updated_at\`, \`created_by\`, \`is_deleted\`).
- [ ] **Task 1.2:** Viết migration kiểm thử và kiểm tra rollback script.
- [ ] **Task 1.3:** Khởi tạo Entity class ánh xạ chuẩn DB (đầy đủ soft delete annotation).

### ⚙️ Giai đoạn 2: DTO Contracts & Repository Layer
- [ ] **Task 2.1:** Tạo Request DTO với đầy đủ validation constraints (\`@NotNull\`, \`@Size\`, bounds, regex).
- [ ] **Task 2.2:** Tạo Response DTO chuẩn format \`{ status, message, data }\`.
- [ ] **Task 2.3:** Xây dựng Repository interface với Parameterized Query chống SQL Injection.

### 🧠 Giai đoạn 3: Domain Service Layer & Business Logic
- [ ] **Task 3.1:** Khởi tạo Service Layer với \`@Transactional\` boundary.
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
- [ ] **Task 6.2:** Kiểm tra không có Hardcoded Secrets, không có \`SELECT *\`, không có TODO comments.
- [ ] **Task 6.3:** Xác thực kích thước code: Method <= 40 dòng, File <= 300 dòng.
`;
}

function generateChangelogMd(featureName, options = {}) {
  const author = options.author || "{{AUTHOR}}";
  const date = new Date().toISOString().split("T")[0];

  return `# [CHANGELOG] ${featureName}

### Version 1.0.0-draft (${date})
- **Tác giả:** ${author}
- **Nội dung:** Khởi tạo đặc tả kỹ thuật SDD ban đầu cho tính năng \`${featureName}\`.
- **Trạng thái:** DRAFT -> READY FOR REVIEW.
`;
}

module.exports = {
  generateSpecMd,
  generatePlanMd,
  generateTasksMd,
  generateChangelogMd,
};
