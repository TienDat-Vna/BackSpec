# [SPEC] feat-process-payment

> **Status:** DRAFT | **Author:** intern | **Created:** 2026-09-28 | **Service:** backend_microservice

---

## 1. TỔNG QUAN & MỤC TIÊU NGHIỆP VỤ (OVERVIEW)
### 1.1. Bối cảnh
- **Mục tiêu:** _{Mô tả mục tiêu của tính năng và giá trị mang lại cho hệ thống}_
- **Bounded Context:** `backend_microservice`
- **Phân loại Module:** `CORE` (Nghiệp vụ cốt lõi) / `SHELL` (Tích hợp, Adapter)

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
- **Method & Path:** `POST /api/v1/feat-process-payment`
- **Header:** `Idempotency-Key: <UUID>` (Bắt buộc cho thao tác tạo mới/thay đổi)

### 2.2. Request DTO Schema
```json
{
  "reference_id": "string (UUID, required)",
  "account_type": "string (ENUM: PERSONAL, ENTERPRISE, required)",
  "amount": "number (min: 0, required)",
  "metadata": {
    "source": "string"
  }
}
```

### 2.3. Response DTO Schema (Standard Format)
```json
{
  "status": 200,
  "message": "Resource created successfully",
  "data": {
    "id": "UUID",
    "status": "ACTIVE",
    "created_at": "2026-09-28T00:00:00Z"
  }
}
```

### 2.4. Ma trận Mã lỗi (RFC 7807 Standard Error Matrix)
| HTTP Status | Error Code | Điều kiện kích hoạt | Phản hồi RFC 7807 |
|---|---|---|---|
| 400 | `ERR_INVALID_FORMAT` | Request DTO thiếu trường bắt buộc hoặc sai regex | `{ "type": "about:blank", "title": "Bad Request", "detail": "..." }` |
| 401 | `ERR_UNAUTHORIZED` | Token JWT thiếu hoặc hết hạn | `{ "title": "Unauthorized", "detail": "Token expired" }` |
| 403 | `ERR_FORBIDDEN` | Không có quyền truy cập tài nguyên | `{ "title": "Forbidden", "detail": "Access denied" }` |
| 409 | `ERR_IDEMPOTENCY_CONFLICT` | Idempotency Key đang được xử lý | `{ "title": "Conflict", "detail": "Request is processing" }` |
| 422 | `ERR_BUSINESS_VIOLATION` | Số dư không đủ / Trạng thái không hợp lệ | `{ "title": "Unprocessable Entity", "detail": "..." }` |
| 500 | `ERR_INTERNAL_SERVER` | Lỗi hệ thống ngoài ý muốn | `{ "title": "Internal Server Error" }` |

---

## 3. DATABASE SCHEMA & MIGRATION PLAN
- **Bảng tác động:** `tbl_feat_process_payment`
- **Migration File mới:** `V20260928__create_feat_process_payment_table.sql`
- **Audit Columns (Bắt buộc):** `created_at`, `updated_at`, `created_by`
- **Soft Delete (Bắt buộc):** `is_deleted BOOLEAN DEFAULT FALSE` (hoặc `status VARCHAR(30)`)

---

## 4. DISTRIBUTED RESILIENCE & SAGA INTEGRATION
- **Idempotency:** Kiểm tra Idempotency Key trong Redis với TTL 24h.
- **Transactional Outbox:** Khi lưu DB thành công, đồng thời insert bản ghi vào `tbl_outbox` trong cùng một Local Transaction.
- **Timeout Configuration:** Timeout gọi mạng tối đa `3000ms`.
- **Circuit Breaker:** Ngắt mạch khi tỷ lệ lỗi > 50% trong 10 calls liên tiếp.
