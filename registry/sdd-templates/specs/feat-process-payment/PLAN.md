# [PLAN] feat-process-payment — Architectural & Technical Plan

---

## 1. KIẾN TRÚC TỔNG THỂ & LUỒNG THỰC THI (ARCHITECTURE)

```mermaid
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
```

---

## 2. RANH GIỚI TRANSACTION & AN TOÀN DỮ LIỆU
1. **Transaction Boundary:** CHỈ đặt `@Transactional` tại Service Layer. Tuyệt đối không đặt ở Controller hoặc Repository.
2. **Isolation Level:** Read Committed.
3. **Rollback Rules:** Rollback toàn bộ khi gặp bất kỳ `RuntimeException` hoặc `BusinessException`.
4. **Zero N+1 Query:** Sử dụng Projection DTO hoặc `JOIN FETCH` khi truy vấn liên kết.

---

## 3. STATE TRANSITION MACHINE (QUẢN LÝ TRẠNG THÁI)
```
[CREATED] ──(validate)──► [PROCESSING] ──(success)──► [COMPLETED]
                                │
                                └──(failed)──► [FAILED] (Compensation)
```

---

## 4. KẾ HOẠCH ROLLBACK & DỰ PHÒNG RỦI RO
- **DB Migration:** Tạo script down migration tương ứng.
- **Feature Flag:** Cấu hình toggle bật/tắt tính năng qua config server.
- **Graceful Fallback:** Khi Redis sập, fallback sang kiểm tra DB lock tạm thời.
