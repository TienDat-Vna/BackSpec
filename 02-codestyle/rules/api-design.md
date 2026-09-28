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
