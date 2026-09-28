---
title: Backend Feature & Domain Rules
scope: backend
severity: must
tags: [backend, service, domain, transaction, soft-delete]
---
<!-- GENERATED FROM 02-codestyle/rules/backend-feature.md — DO NOT EDIT DIRECTLY -->



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
