function generateConstitution(options = {}) {
  const serviceName = options.serviceName || "backend-microservice";
  const stack = options.stack || "Java / Spring Boot 3.x";
  const database = options.database || "PostgreSQL 15+ / MySQL 8.0+";
  const minCoverage = options.minCoverage || "80%";
  const maxMethodLines = options.maxMethodLines || 40;
  const maxClassLines = options.maxClassLines || 300;

  return `# CONSTITUTION.md — Hiến Pháp Dự Án (${serviceName})

> **Hiến pháp này là NGUỒN SỰ THẬT DUY NHẤT** về công nghệ, kiến trúc, ranh giới an toàn và tiêu chuẩn chất lượng.
> Mọi AI Agent và Kỹ sư tham gia phát triển microservice này PHẢI TUÂN THỦ 100%, không ngoại lệ.

---

## 1. TECH STACK & PHẠM VI CÔNG NGHỆ

| Thành phần | Công nghệ chính | Ghi chú |
|---|---|---|
| **Core Service** | ${stack} | Bounded context độc lập |
| **Primary Database** | ${database} | Parameterized Query / Soft Delete |
| **Cache & Realtime** | Redis 7.x (Cluster/Sentinel) | TTL bắt buộc, Zero Connection Leak |
| **Event Broker** | Apache Kafka / RabbitMQ | CloudEvents spec, Transactional Outbox |
| **Security & Auth** | OAuth2 / JWT (Fail-Fast) | Role-Based Access Control + Tenant Isolation |

---

## 2. NGUYÊN TẮC BẢO MẬT ZERO-TRUST (MUST)
1. **Zero Hardcoded Secrets**: Tuyệt đối không commit credentials/API keys. Nạp từ biến môi trường.
2. **Fail-Fast Configuration**: Dừng ứng dụng ngay lập tức khi thiếu biến môi trường bắt buộc.
3. **SQL Injection Protection**: ZERO TOLERANCE với chuỗi SQL thô. Luôn dùng Parameter Binding.
4. **PII Masking**: Masking CCCD, SĐT, Email, OTP trong log và trace.
5. **CORS**: Không bao giờ mở wildcard \`* \` ở môi trường production.

---

## 3. RANH GIỚI MICROSERVICE & GIAO TIẾP
1. **Single Source of Truth**: Mỗi database chỉ thuộc quyền sở hữu của duy nhất service này. Cấm service ngoài truy cập DB trực tiếp.
2. **Transactional Outbox**: Gửi event bất đồng bộ bắt buộc qua Outbox Table để đảm bảo At-Least-Once Delivery.
3. **Resilience Standard**: Mọi cuộc gọi HTTP/gRPC ra ngoài phải có **Timeout <= 3000ms** và **Circuit Breaker**.
4. **Idempotent Handling**: Mọi API ghi nhận/thanh toán/tạo tài nguyên và event consumer bắt buộc hỗ trợ Idempotency Key (TTL 24h).

---

## 4. GIỚI HẠN KÍCH THƯỚC MÃ NGUỒN (CLEAN CODE)
- **Method / Function:** Tối đa \`${maxMethodLines} dòng\`.
- **Class / File:** Tối đa \`${maxClassLines} dòng\`.
- **TODO Comments:** ZERO TODO trong code đã merge vào main.
- **DTO Pattern:** 100% Entity không được lọt ra ngoài API hoặc Event payload (Zero Entity Leak).

---

## 5. TIÊU CHUẨN KIỂM THỬ (TESTING DOD)
- **Ngưỡng Coverage tối thiểu:** Line Coverage >= \`${minCoverage}\`, Branch Coverage >= 75%.
- **Assertion thật:** Mỗi test case phải có ít nhất 1 assertion kiểm tra giá trị thực tế.
- **Happy & Error Paths:** 100% endpoint/service method phải được test cả luồng thành công và toàn bộ luồng exception.
`;
}

function generateClaudeMd(options = {}) {
  const serviceName = options.serviceName || "backend-microservice";
  const stack = options.stack || "Java / Spring Boot 3.x";

  return `# CLAUDE.md — Hướng Dẫn & Bộ Nhớ Claude Code (${serviceName})

> **Đọc theo thứ tự:** \`CONSTITUTION.md\` → File này → \`AGENTS.md\` → \`.sdd/specs/\`

## 1. TỔNG QUAN HỆ THỐNG
- **Dịch vụ:** ${serviceName}
- **Nền tảng:** ${stack}
- **Kiến trúc:** Layered Clean Architecture (Controller -> Service -> Repository -> Adapter)

## 2. PHÂN TẦNG THỰC THI (CORE VS SHELL)
\`\`\`
[ REST Controller / Kafka Consumer ] (SHELL)
                │ (Request DTO)
                ▼
      [ Domain Service Layer ] (CORE) ──► [@Transactional]
                │
        ┌───────┴───────┐
        ▼               ▼
[ SQL Repository ] [ Redis Cache / Outbox Adapter ] (SHELL)
\`\`\`

## 3. LỆNH VẬN HÀNH THƯỜNG DÙNG
\`\`\`bash
# Chẩn đoán sức khỏe dự án
backspec check

# Tạo spec mới cho tính năng
backspec spec <feature-name>

# Đồng bộ rules và skills sang các AI engines
backspec sync

# Chạy kiểm định toàn diện
backspec validate
\`\`\`

## 4. QUY TRÌNH VIẾT CODE AN TOÀN
1. **Đọc Spec trước:** Luôn kiểm tra file spec trong \`.sdd/specs/\` trước khi sinh code.
2. **Tuân thủ DTO:** Viết Request/Response DTO trước, sau đó mới viết Service.
3. **Chạy linter & test:** Đảm bảo test coverage >= 80% trước khi hoàn thành task.
`;
}

function generateAgentsMd(options = {}) {
  const serviceName = options.serviceName || "backend-microservice";

  return `# AGENTS.md — Hướng Dẫn & Quy Tắc Multi-Agent (${serviceName})

> File này được nạp tự động cho các Agent (Antigravity, Gemini, Open-Agent, Cursor, Copilot).
> **Đọc theo thứ tự:** \`CONSTITUTION.md\` → \`CLAUDE.md\` → File này → \`.sdd/specs/\`

## 1. PROJECT OVERVIEW
**Service:** ${serviceName}
**Domain:** Backend Microservice (Distributed Systems)

## 2. DTO PATTERN (BẮT BUỘC)
\`\`\`
Entity ──mapping──► DTO (Request/Response) ──► API / Kafka
    │                       ▲
    └── Service Layer ◄─────┘
\`\`\`

## 3. FORBIDDEN PATTERNS (10 ĐIỀU CẤM KỴ)
| # | Rule | Lý do |
|---|---|---|
| 1 | **NEVER** lưu secret/API key trong source control | Bảo mật Zero-Trust |
| 2 | **NEVER** \`SELECT *\` trong query phức tạp hoặc JOIN | Hiệu năng & Rò rỉ dữ liệu |
| 3 | **NEVER** trả Entity trực tiếp ra API / Event | Vi phạm DTO Pattern |
| 4 | **NEVER** kết nối trực tiếp vào Database của service khác | Phá vỡ Bounded Context |
| 5 | **NEVER** gọi service ngoài mà không có timeout + circuit breaker | Sụp đổ dây chuyền |
| 6 | **NEVER** để TODO comment trong code đã merge | Nợ kỹ thuật |
| 7 | **NEVER** Hard Delete dữ liệu nghiệp vụ (luôn Soft Delete) | Toàn vẹn dữ liệu & Audit |
| 8 | **NEVER** đặt \`@Transactional\` ở Controller hoặc Repository | Ranh giới Transaction sai |
| 9 | **NEVER** sửa file migration đã tồn tại (luôn tạo file mới) | Tính bất biến Database |
| 10| **NEVER** bypass Auth/Security hoặc vô hiệu hóa phân quyền | An ninh thông tin |

## 4. HTTP STATUS CODES CHUẨN
- \`200 OK\` / \`201 Created\`: Thành công
- \`400 Bad Request\`: Format validation thất bại
- \`401 Unauthorized\`: Sai hoặc thiếu Token
- \`403 Forbidden\`: Không đủ quyền truy cập
- \`404 Not Found\`: Không tìm thấy tài nguyên
- \`409 Conflict\`: Idempotency đang xử lý / Trùng dữ liệu
- \`422 Unprocessable Entity\`: Vi phạm luật nghiệp vụ
- \`500 Internal Server Error\`: Lỗi hệ thống nội bộ

<!-- BEGIN GENERATED RULES — DO NOT EDIT BELOW THIS LINE -->
<!-- BackSpec synchronizer will automatically inject rules here -->
<!-- END GENERATED RULES -->
`;
}

module.exports = {
  generateConstitution,
  generateClaudeMd,
  generateAgentsMd,
};
