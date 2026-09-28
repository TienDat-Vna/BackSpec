---
name: implement-feature
description: Thực thi từng task trong TASKS.md theo đúng ranh giới kiến trúc microservice, DTO pattern và transaction boundaries.
allowed-tools: [Read, Edit, Write, Grep, Glob, Bash]
---

<!-- GENERATED FROM .shared/skills/01-spec-management/implement-feature/SKILL.md — DO NOT EDIT DIRECTLY -->

# Skill — Implement Feature (Backend Microservice)

Skill này hướng dẫn Agent triển khai code theo từng task nhỏ đã được duyệt trong `TASKS.md`, kết hợp với bộ Technical Skills chuyên sâu.

## Nguyên tắc thực thi:
1. **Làm tuần tự từng task**: Không nhảy cóc qua task khác trước khi task hiện tại hoàn thành và pass test.
2. **Kích hoạt Technical Skills bổ trợ**:
   - Thiết kế Endpoint & Controller: Xem `/backend-api-design-flow` và `/clean-code-naming-conventions`.
   - Xử lý Middleware & Filter: Xem `/spring-middleware-pipeline`.
   - Xử lý Giao dịch DB: Xem `/database-transaction-management` (`rollbackFor = [Exception.class]`, chống block DB pool).
   - Truy vấn JPA / Hibernate: Xem `/jpa-n-plus-one-optimization` (`JOIN FETCH`, Projections) và `/sql-repository-pattern`.
   - Bộ nhớ đệm & Realtime: Xem `/redis-cache-patterns` và `/multi-language-error-handling`.
   - Lập trình phòng thủ & Bắt ngoại lệ: Xem `/defensive-troubleshooting-guide`.
3. **Tuân thủ Clean Architecture / Layered Boundaries**:
   - Controller: Chỉ làm việc với DTOs (`@Valid`), không chứa business logic, không log spam.
   - Service: Chuyên trách business logic, state transitions (`markSuccess`, `markFailed`) và `@Transactional`.
   - Repository: Truy vấn DB qua Parameterized queries / JPA, không chứa logic nghiệp vụ.
   - Entity: Soft delete (`is_deleted = true`), Audit columns (`created_at`, `updated_at`).
4. **Giới hạn kích thước**: Mỗi commit/PR không vượt quá 400 dòng code.
5. **Không TODO**: Tuyệt đối không để lại comment `// TODO` trong code bàn giao.
6. **Cập nhật tiến độ**: Đánh dấu `[x]` vào task trong `TASKS.md` sau khi hoàn thành.
