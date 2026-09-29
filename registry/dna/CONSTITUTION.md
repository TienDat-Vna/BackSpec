<!-- NGUỒN SỰ THẬT TỐI THƯỢNG CHO BACKEND MICROSERVICES -->

# 📜 CONSTITUTION.md — {{SERVICE_NAME}} (Backend Microservice)

**Ngày ban hành:** 2026-09-28 | **Nhóm:** Backend Core Team | **Phiên bản:** 1.0

> **QUY TẮC TỐI THƯỢNG:** Mọi thay đổi đối với tài liệu này yêu cầu sự nhất trí của toàn nhóm. CLAUDE.md, AGENTS.md, và các rules/hooks đều phải trích dẫn lại đúng các điều khoản ở đây.

---

## ĐIỀU 1 — STACK CÔNG NGHỆ & RANH GIỚI SERVICE

| Thành phần | Công nghệ tiêu chuẩn | Ghi chú |
|---|---|---|
| **Backend Core** | {{BACKEND_STACK}} (vd: Java 21 / Spring Boot 3.3, Go 1.22, NestJS, FastAPI) | Package-by-Feature / Clean Architecture |
| **Database** | {{DB_ENGINE}} (vd: PostgreSQL 16, MySQL 8.4) | **Database-per-Service**: Không chia sẻ DB trực tiếp giữa các service |
| **Migration** | {{MIGRATION_TOOL}} (Flyway, Liquibase, Alembic, Prisma) | Migration bất biến, có audit columns và soft delete |
| **Messaging / Event Broker** | {{MESSAGING_BROKER}} (Apache Kafka, RabbitMQ) | Chuẩn CloudEvents, Transactional Outbox, DLQ |
| **Service-to-Service Auth** | JWT Bearer / mTLS / Internal Service Token | Zero-Trust Internal Network, Context Propagation |
| **Testing** | Unit + Integration + Testcontainers | Mock toàn bộ downstream services trong unit test |

---

## ĐIỀU 2 — TIÊU CHUẨN CODE & KIẾN TRÚC TẦNG

### 2.1. Phân tách trách nhiệm các tầng
```
┌─────────────────────────────────────────┐
│          Controller / Listener          │  Nhận DTO/Event, validate format, KHÔNG business logic
├─────────────────────────────────────────┤
│              Service Layer              │  Business logic, @Transactional, Saga Orchestration, Idempotency
├─────────────────────────────────────────┤
│            Repository Layer             │  Truy vấn DB, KHÔNG business logic, KHÔNG SELECT *
├─────────────────────────────────────────┤
│              Entity Layer               │  Soft delete, Audit columns (created_at, updated_at)
└─────────────────────────────────────────┘
```

### 2.2. DTO Pattern (BẮT BUỘC — Zero Entity Leakage)
- **Controller & Event Consumer** KHÔNG BAO GIỜ nhận hoặc trả Entity trực tiếp.
- Mọi dữ liệu vào/ra phải qua Request/Response DTO có validate chặt chẽ.

### 2.3. Giới hạn kích thước code
- **Method / Function:** Tối đa **40 dòng**
- **File / Class:** Tối đa **300 dòng**
- **Pull Request:** Tối đa **400 dòng**
- **0 Warning:** 0 compiler/linter warning khi build.
- **Zero TODO:** Tuyệt đối không để lại `// TODO` trong code đã merge.

---

## ĐIỀU 3 — CHÍNH SÁCH BẢO MẬT & ZERO TRUST

1. **Zero Hardcoded Secrets**: Toàn bộ passwords, API keys, private keys, JWT secrets phải nạp từ biến môi trường (`.env`).
2. **Fail-Fast Configuration**: Thiếu config bắt buộc -> Ứng dụng phải dừng khởi động ngay lập tức, không dùng secret fallback.
3. **SQL Injection Protection**: ZERO TOLERANCE — luôn sử dụng Parameterized Queries hoặc ORM Parameter Binding.
4. **Phân quyền Đa cấp**: Backend luôn kiểm tra Role, Organization/Tenant ID, và Resource Ownership độc lập với client.
5. **CORS Production**: Tuyệt đối không cho phép `origins = ["*"]` trên môi trường Production.

---

## ĐIỀU 4 — HỆ THỐNG PHÂN TÁN & ĐỘ BỀN VỮNG (RESILIENCY)

1. **Transactional Outbox**: Bắt buộc áp dụng khi vừa ghi DB vừa phát Event để đảm bảo At-least-once delivery, tránh dual-write hazard.
2. **Idempotency Key**: Bắt buộc hỗ trợ header `Idempotency-Key` cho toàn bộ API ghi / thanh toán và Event Consumers.
3. **Compensating Transactions (Saga)**: Mọi bước trong chuỗi Saga phải có hành động bù trừ (compensating action) tương ứng khi gặp lỗi.
4. **Resilience (Timeout + Circuit Breaker + Fallback)**:
   - Timeout mạng mặc định: 2s - 5s.
   - Circuit Breaker tự động ngắt khi tỷ lệ lỗi downstream > 50%.
   - Fallback an toàn, không để crash hệ thống khi downstream service tạm thời ngắt kết nối.
5. **Dead Letter Queue (DLQ)**: Consumer chỉ retry tối đa 3 lần với exponential backoff trước khi đẩy message lỗi sang DLQ.

---

## ĐIỀU 5 — QUY TRÌNH GIT & SDD BRANCHING

### 5.1. Branch Naming
- **Tính năng CORE (SDD Hybrid 2-Phase)**:
  - `spec/{feature}`: Soạn thảo, review và approve `SPEC.md` trong `.sdd/`.
  - `agent/{feature}`: Agent thực thi code trong `src/` sau khi spec được lock.
- **Tính năng SHELL & Fix**:
  - `feat/{feature}`: Tính năng phụ, CRUD đơn giản.
  - `fix/{name}`: Sửa lỗi.
  - `chore/{name}`: Nâng cấp dependencies, configs.

### 5.2. Conventional Commits
```
[type]([scope]): [mô tả ngắn gọn]
Types: feat | fix | docs | style | refactor | test | chore | spec | proto | event | db
```

---

## ĐIỀU 6 — TIÊU CHUẨN KIỂM THỬ (TESTING GATES)

| Loại Test | Ngưỡng tối thiểu | Phạm vi áp dụng |
|---|---|---|
| **Unit Tests + Integration Tests** | **>= 80%** (Line Coverage) | Toàn bộ Business Service Layer |
| **Happy Path + Error Paths** | **100%** | Toàn bộ API Endpoints & Event Consumers |

> ❌ **CHẶN MERGE NẾU**: Coverage dưới 80%, có test fail, hoặc phá vỡ test hiện có.

---

## ĐIỀU 7 — QUY TẮC SỬ DỤNG AI AGENT & HUMAN OVERSIGHT

1. **Checklist Trước Khi Code**: Agent bắt buộc đọc theo thứ tự:
   `CONSTITUTION.md` → `CLAUDE.md` → `AGENTS.md` → `.sdd/specs/feat-{{feature}}/SPEC.md`.
2. **Human Approval**: Con người luôn review và approve kế hoạch/spec trước khi Agent sửa đổi source code production.
3. **4-Layer Validation Gate**: Chạy skill `/code-review-gate` trước khi tạo PR.
