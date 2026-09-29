# AGENTS.md — {{SERVICE_NAME}} (Backend Microservice)

**Đọc theo thứ tự:** `CONSTITUTION.md` → `CLAUDE.md` → file này → `.sdd/specs/`

## 1. PROJECT OVERVIEW
**Service:** {{SERVICE_NAME}}
**Domain:** Backend Microservice (Distributed Systems)
**Mục tiêu chính:** _{{Mô tả ngắn gọn chức năng của microservice này trong toàn hệ thống}}_

## 2. KIẾN TRÚC & NGUYÊN TẮC THIẾT KẾ

### 2.1. API & Event Standard
- REST API prefix `/api/v1/[resource]`.
- Response chuẩn: `{ "status": 200, "message": "...", "data": ... }`.
- Lỗi xử lý tập trung qua Global Exception Handler theo chuẩn RFC 7807.
- Event Message tuân theo định dạng CloudEvents tiêu chuẩn.

### 2.2. DTO Pattern (BẮT BUỘC)
```
Entity ──mapping──► DTO (Request/Response) ──► API / Kafka
    │                       ▲
    └── Service Layer ◄─────┘
```

### 2.3. Ranh giới Microservice & Trách nhiệm
| Trách nhiệm | Microservice Backend | Edge Gateway / Client |
|---|---|---|
| Business logic, tính toán nghiệp vụ | ✅ BẮT BUỘC | ❌ CẤM |
| Xác thực Token & Context | ✅ Validate & Authorize | ✅ Verify & Route |
| Transaction & Saga State | ✅ BẮT BUỘC | ❌ CẤM |
| Event Publishing & Consumer | ✅ BẮT BUỘC | ❌ CẤM |

## 3. PHẠM VI HOẠT ĐỘNG CỦA AGENT

### ✅ Được phép
- Đọc/sửa source code trong thư mục service.
- Chạy lệnh build/test/lint đã khai báo trong CONSTITUTION.
- Tạo branch theo pattern `spec/*`, `agent/*`, `feat/*`, `fix/*`.

### ❌ Cấm tuyệt đối
- **KHÔNG** Hard Delete — luôn Soft Delete (`is_deleted = true` hoặc `status = INACTIVE`).
- **KHÔNG** bypass Auth/Security hoặc vô hiệu hóa phân quyền.
- **KHÔNG** sửa hoặc đọc file `.env`, production secrets.
- **KHÔNG** sửa file migration đã tồn tại — luôn tạo migration mới.
- **KHÔNG** commit trực tiếp vào branch bảo vệ (`main`, `master`, `production`).

## 4. FORBIDDEN PATTERNS BẮT BUỘC TRÁNH

| # | Rule | Lý do |
|---|---|---|
| 1 | **NEVER** lưu secret/API key trong source control | Bảo mật |
| 2 | **NEVER** `SELECT *` trong query phức tạp hoặc JOIN | Hiệu năng & Rò rỉ dữ liệu |
| 3 | **NEVER** trả Entity trực tiếp ra API / Event | Vi phạm DTO Pattern |
| 4 | **NEVER** kết nối trực tiếp vào Database của service khác | Phá vỡ Bounded Context |
| 5 | **NEVER** gọi service ngoài mà không có timeout + circuit breaker | Sụp đổ dây chuyền |
| 6 | **NEVER** để TODO comment trong code đã merge | Nợ kỹ thuật |

## 5. CHUẨN MÃ LỖI HTTP STATUS

| Code | Ý nghĩa & Khi nào dùng |
|---|---|
| 200 / 201 | Thành công (GET, PUT) / Tạo mới thành công (POST) |
| 400 | Dữ liệu đầu vào sai định dạng (Format validation failed) |
| 401 | Chưa xác thực hoặc Token hết hạn |
| 403 | Không đủ quyền truy cập tài nguyên |
| 404 | Không tìm thấy tài nguyên |
| 409 | Conflict dữ liệu / Idempotency đang xử lý |
| 422 | Vi phạm quy tắc nghiệp vụ (Business validation failed) |
| 500 | Lỗi hệ thống nội bộ |

## 6. DEFINITION OF DONE (DOD)
- [ ] 100% Test suite pass (Unit + Integration tests đạt coverage >= 80% theo CONSTITUTION §5).
- [ ] 0 Lint / Compiler warning.
- [ ] DTO Pattern tuân thủ nghiêm ngặt (Zero Entity Leak).
- [ ] Soft delete được áp dụng cho toàn bộ bảng.
- [ ] Có migration file mới cho mọi thay đổi DB schema.
- [ ] Không có TODO comment trong code.


<!-- BEGIN GENERATED RULES — DO NOT EDIT BELOW THIS LINE -->
<!-- GENERATED FROM registry/rules/api-design.md — DO NOT EDIT DIRECTLY -->

---
title: Microservice API Design Standard
scope: backend
severity: must
tags: [api, rest, grpc, controller, dto]
---


# Rule — API Design Standard

Khi thêm hoặc chỉnh sửa endpoint API:

1. **Path chuẩn RESTful**: prefix `/api/v1/`, tên tài nguyên dạng số nhiều kebab-case (vd: `/api/v1/order-items`).
2. **Response chuẩn**: Trả về đúng format `{ "status": 200, "message": "...", "data": { } }`.
3. **Controller mỏng (Thin Controller)**: Controller CHỈ nhận Request DTO, validate format, gọi đúng Service method, và map trả về Response DTO. KHÔNG viết business logic trong Controller.
4. **DTO Pattern bắt buộc**: Tuyệt đối không bao giờ nhận hoặc trả Entity trực tiếp ra API.
5. **Validation ở Backend**: Mọi Request DTO phải được validate chặt chẽ (not null, size, regex, bounds).
6. **HTTP Status Codes chuẩn**:
   - `200 OK` / `201 Created`: Thành công
   - `400 Bad Request`: Validation format thất bại
   - `401 Unauthorized`: Thiếu hoặc sai Token
   - `403 Forbidden`: Không đủ quyền truy cập
   - `404 Not Found`: Không tìm thấy tài nguyên
   - `409 Conflict`: Trùng lặp dữ liệu / Idempotency race condition
   - `422 Unprocessable Entity`: Vi phạm luật nghiệp vụ
   - `500 Internal Server Error`: Lỗi hệ thống ngoài ý muốn
7. **Idempotency Key**: Bắt buộc hỗ trợ header `Idempotency-Key` cho toàn bộ endpoint tạo/thanh toán/thay đổi trạng thái quan trọng.

---

<!-- GENERATED FROM registry/rules/async-integration.md — DO NOT EDIT DIRECTLY -->

---
title: Async Integration & Messaging Rules
scope: messaging
severity: must
tags: [messaging, kafka, rabbitmq, outbox, event]
---


# Rule — Async Integration & Event Messaging

Khi gửi/nhận thông điệp qua Event Broker (Kafka/RabbitMQ) hoặc tác vụ nền:

1. **Transactional Outbox**: Khi cần cập nhật DB và phát Event trong cùng một luồng nghiệp vụ, BẮT BUỘC sử dụng Transactional Outbox pattern để tránh mất message hoặc phát ghost message.
2. **Idempotent Consumers**: Mọi Consumer nhận message phải kiểm tra tính trùng lặp qua `event_id` hoặc bảng `processed_events`.
3. **Dead Letter Queue (DLQ)**: Consumer gặp lỗi chỉ được retry tối đa 3 lần với exponential backoff, sau đó đẩy sang DLQ topic. Không throw exception vô hạn làm nghẽn partition.
4. **CloudEvents Standard**: Cấu trúc payload của event phải tuân thủ chuẩn CloudEvents (id, source, type, time, datacontenttype, data).

---

<!-- GENERATED FROM registry/rules/backend-feature.md — DO NOT EDIT DIRECTLY -->

---
title: Backend Feature & Domain Rules
scope: backend
severity: must
tags: [backend, service, domain, transaction, soft-delete]
---


# Rule — Backend Feature Implementation

Khi phát triển hoặc chỉnh sửa code backend:

1. **Transaction Boundary**: Annotation `@Transactional` (hoặc tương đương) CHỈ được đặt ở Service Layer. Không đặt ở Controller hoặc Repository.
2. **Soft Delete toàn hệ thống**: Không viết `DELETE FROM` trực tiếp. Mọi bảng chính phải dùng `is_deleted = true` hoặc `status = INACTIVE/CANCELLED`.
3. **Không `SELECT *`**: Trong các câu truy vấn có JOIN, sub-query hoặc bảng nhiều cột, luôn chỉ định rõ các cột cần lấy hoặc dùng Projection DTO.
4. **Bounded Context**: Không inject Service của Domain khác nếu vi phạm ranh giới nghiệp vụ; sử dụng Event (Kafka/RabbitMQ) hoặc HTTP Client với DTO độc lập.
5. **Giới hạn kích thước code**:
   - Method <= 40 dòng
   - File/Class <= 300 dòng
   - Không chứa TODO comment khi merge vào main.

---

<!-- GENERATED FROM registry/rules/db-migration.md — DO NOT EDIT DIRECTLY -->

---
title: Database Migration Rules
scope: database
severity: must
tags: [database, migration, ddl, sql]
---


# Rule — Database Migration

Khi tạo migration trong `db/migration/**` hoặc `migrations/**`:

1. **Migration là Bất biến**: Tuyệt đối không sửa đổi file migration cũ đã tồn tại/đã chạy. Mọi thay đổi schema phải tạo file migration MỚI.
2. **Audit Columns**: Mọi bảng nghiệp vụ mới bắt buộc có các cột: `created_at`, `updated_at`, `created_by`, và cột soft delete (`is_deleted` hoặc `status`).
3. **Charset & Collation**: Khai báo rõ ràng hỗ trợ Unicode (vd `utf8mb4` trên MySQL hoặc `UTF8` trên PostgreSQL).
4. **Timezone chuẩn**: Luôn lưu trữ thời gian ở chuẩn UTC / `TIMESTAMP WITH TIME ZONE`.
5. **Non-breaking DDL**: Khi thêm cột mới vào bảng đang chạy production, cột phải là `NULLABLE` hoặc có giá trị `DEFAULT` hợp lệ.

---

<!-- GENERATED FROM registry/rules/microservice-resilience.md — DO NOT EDIT DIRECTLY -->

---
title: Microservice Resilience & Fault Tolerance
scope: universal
severity: must
tags: [resilience, circuit-breaker, timeout, retry, fallback]
---


# Rule — Microservice Resilience

Khi thực hiện lời gọi mạng (HTTP/gRPC) sang microservice khác hoặc 3rd-party API:

1. **Timeout bắt buộc**: Mọi network call phải có cấu hình timeout rõ ràng (thường 2s - 5s). Không bao giờ để timeout vô hạn (`timeout: 0`).
2. **Circuit Breaker**: Cấu hình Circuit Breaker cho các service phụ thuộc quan trọng để ngắt mạch khi tỷ lệ lỗi vượt ngưỡng, tránh sụp đổ dây chuyền.
3. **Graceful Degradation (Fallback)**: Khi service ngoài bị sập, luôn có fallback trả về dữ liệu cache hoặc phản hồi nhẹ nhàng, không để crash ứng dụng.
4. **Correlation / Trace ID**: Luôn truyền `X-Correlation-ID` hoặc `traceparent` (W3C Trace Context) qua mọi lời gọi mạng để trace log xuyên suốt hệ thống.

---

<!-- GENERATED FROM registry/rules/security.md — DO NOT EDIT DIRECTLY -->

---
title: Security & Authentication Rules
scope: security
severity: must
tags: [security, auth, jwt, injection, secrets]
---


# Rule — Security & Authentication

Khi viết code liên quan đến xác thực, phân quyền hoặc bảo mật dữ liệu:

1. **Zero Hardcoded Secrets**: Tuyệt đối không commit password, API key, JWT secret, private key vào source code. Tất cả phải nạp từ biến môi trường.
2. **Fail-Fast Configuration**: Khi thiếu biến môi trường bắt buộc (như `JWT_SECRET`), ứng dụng phải báo lỗi và dừng khởi động ngay lập tức, không dùng secret mặc định.
3. **SQL Injection Protection**: ZERO TOLERANCE với việc cộng chuỗi SQL trực tiếp. Luôn sử dụng Parameterized Query hoặc ORM Parameter Binding.
4. **Phân quyền Đa cấp**: Xác thực cả Token Role, Tenant ID, và quyền sở hữu tài nguyên (Resource Ownership).
5. **CORS chặt chẽ**: Không bao giờ cấu hình `allowed_origins = ["*"]` trong môi trường production.

---

<!-- GENERATED FROM registry/rules/testing.md — DO NOT EDIT DIRECTLY -->

---
title: Backend Testing Rules
scope: testing
severity: must
tags: [testing, unit-test, integration-test, coverage]
---


# Rule — Testing Standard

Khi viết unit test hoặc integration test cho backend microservice:

1. **Ngưỡng Coverage tối thiểu**: Phải đạt đúng ngưỡng khai báo trong `CONSTITUTION.md §5` (mặc định >= 80% line coverage).
2. **Assertion thật**: Mỗi test case bắt buộc có ít nhất 1 assertion kiểm tra giá trị cụ thể. Không viết test chỉ gọi hàm để lấy độ phủ giả tạo.
3. **Test độc lập**: Mỗi test case phải tự cô lập dữ liệu (không phụ thuộc vào thứ tự chạy hoặc dữ liệu của test khác).
4. **Happy Path & Error Path**: Mọi endpoint/service method mới bắt buộc phải test cả luồng thành công và toàn bộ các trường hợp throw exception / validation error.
5. **Mock External Calls**: Unit test phải mock toàn bộ HTTP Client / Kafka Producer gọi ra bên ngoài.

---

<!-- END GENERATED RULES -->
