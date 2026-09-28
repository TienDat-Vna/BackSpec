<!-- Nạp vào MỌI session Claude Code khi làm việc với Backend Microservice -->

# CLAUDE.md — {{SERVICE_NAME}} (Backend Microservice)

> **Đọc trước:** `CONSTITUTION.md` (hiến pháp, bảo mật, ngưỡng test 80%) | `AGENTS.md` (domain rules, golden patterns)
> Ba file này tạo thành "Kiềng 3 Chân" quản trị — không thể thiếu bất kỳ file nào.

@CONSTITUTION.md

## TL;DR (60 giây)

- **Service:** {{SERVICE_NAME}} (Microservice)
- **Stack:** {{BACKEND_STACK}} · {{DB_ENGINE}} · {{MESSAGING_BROKER}} — chi tiết tại CONSTITUTION §1.
- **Quy tắc bất biến:**
  - ✅ **DTO Pattern bắt buộc** — Controller / Consumer không bao giờ nhận/trả Entity.
  - ✅ **Soft Delete toàn hệ thống** — không `DELETE FROM`, dùng `is_deleted = true`.
  - ✅ **Database-per-Service** — không kết nối DB của service khác.
  - ✅ **Transactional Outbox & Idempotency** — cho mọi luồng phát event và API ghi quan trọng.
  - ❌ **KHÔNG** hardcode secret, KHÔNG bypass Auth/Security.

---

## KIẾN TRÚC HỆ THỐNG MICROSERVICE

```
                                [ Client / API Gateway ]
                                           │
                        ┌──────────────────▼──────────────────┐
                        │     REST Controller / gRPC / Event   │  Validate Request DTO, No business logic
                        └──────────────────┬──────────────────┘
                                           │
                        ┌──────────────────▼──────────────────┐
                        │            Service Layer            │  Business Logic, @Transactional,
                        │   (Saga, Idempotency, Outbox)       │  Orchestration, Compensating Actions
                        └─────────┬─────────────────┬─────────┘
                                  │                 │
            ┌─────────────────────▼───┐         ┌───▼─────────────────────┐
            │     Repository Layer    │         │  External HTTP/gRPC     │
            │   (Isolated DB Queries) │         │  Clients with Breakers  │
            └─────────────┬───────────┘         └─────────────────────────┘
                          │
            ┌─────────────▼───────────┐
            │   Entity (Soft Delete)  │
            └─────────────────────────┘
```

---

## ARCHITECTURE DECISION RECORDS (ADR)

### ADR-001: Transactional Outbox thay vì Dual Write
- **Context:** Cần cập nhật DB và publish event sang Kafka trong cùng 1 request.
- **Decision:** Lưu event vào bảng `outbox_events` trong local transaction của service, CDC Debezium/Worker đọc và đẩy vào Kafka.
- **Status:** ✅ Active (Xem `.sdd/patterns/transactional-outbox-pattern.md`).

### ADR-002: Idempotency Key Middleware cho API Ghi
- **Context:** Phòng ngừa người dùng bị trừ tiền hoặc tạo bản ghi trùng khi mạng timeout và retry.
- **Decision:** Lưu trữ trạng thái `Idempotency-Key` trong Redis với TTL 24h.
- **Status:** ✅ Active (Xem `.sdd/patterns/idempotency-key-pattern.md`).

---

## BÀI HỌC KINH NGHIỆM (LESSONS LEARNED)

### LESSON-001: Sụp đổ dây chuyền do thiếu Timeout khi gọi Microservice ngoài
- **Sai lầm:** Gọi HTTP Client không set timeout -> Service ngoài bị nghẽn làm cạn kiệt thread pool của service gọi.
- **Giải pháp:** Pin timeout 2s - 3s + Circuit Breaker (Resilience4j / Envoy) và fallback an toàn.

### LESSON-002: Poison Pill làm nghẽn toàn bộ Event Partition
- **Sai lầm:** Consumer gặp event dữ liệu lỗi (deserialize fail) throw exception vô hạn, khiến Kafka partition bị đứng.
- **Giải pháp:** Retry tối đa 3 lần với backoff -> chuyển sang Dead Letter Queue (DLQ) topic để xử lý sau.

---

## ANTI-PATTERNS CẦN TRÁNH

| Anti-Pattern | Mô tả nguy hiểm | Cách phòng tránh |
|---|---|---|
| **Distributed Monolith** | Microservices liên kết quá chặt, gọi đồng bộ chằng chịt | Dùng Event-Driven Asynchronous (Kafka/RabbitMQ) |
| **Shared Database** | 2 service kết nối chung vào 1 Database | Database-per-Service bắt buộc |
| **Entity Leakage** | Trả Entity trực tiếp ra API Controller | DTO Pattern bắt buộc (Zero Entity Leak) |
| **Silent Async Fail** | Consumer lỗi im lặng không ai biết | Timeout + Retry 3 lần + DLQ + Alert |
| **God Service/Class** | 1 class/service ôm đồm quá nhiều trách nhiệm | Giới hạn 40 dòng/method, 300 dòng/file |

---

## CẤU TRÚC THƯ MỤC CHUẨN

```
{{SERVICE_NAME}}/
├── src/main/{{LANG}}/{{PACKAGE_ROOT}}/
│   ├── feature/               # Package-by-feature (vd: order, payment, customer)
│   │   ├── controller/        # REST Controllers (Nhận DTO, trả DTO)
│   │   ├── service/           # Business Logic, @Transactional, Saga
│   │   ├── repository/        # Data Access Interfaces
│   │   ├── entity/            # Domain Entities (Soft delete, audit)
│   │   ├── dto/               # Request & Response DTOs
│   │   └── listener/          # Kafka/RabbitMQ Event Consumers
│   └── shared/                # Common configs, security, exceptions, outbox
├── src/main/resources/
│   ├── db/migration/          # Flyway/Liquibase schema migrations (V1__init.sql)
│   └── application.yml        # Configs (không chứa secret)
├── .sdd/                      # Spec-Driven Development suite
├── .shared/                   # Single Source of Truth rules & skills
└── scripts/                   # Sync, Doctor, Validation & Hook scripts
```

---

## NAMING CONVENTIONS QUICK REFERENCE

| Loại đối tượng | Convention | Ví dụ |
|---|---|---|
| Class / Struct | PascalCase | `OrderService`, `PaymentConsumer` |
| Method / Function | camelCase | `createOrder()`, `processPayment()` |
| Database Table / Column | snake_case | `order_items`, `is_deleted` |
| REST API Path | kebab-case, số nhiều | `/api/v1/order-items` |
| Kafka Topic | kebab-case / dot notation | `service.order.created.v1` |
| DTO Class | PascalCase + Request/Response | `CreateOrderRequest`, `OrderResponse` |
