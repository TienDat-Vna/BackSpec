---
name: speckit-tasks
description: Phân rã kế hoạch thành danh sách công việc nguyên tử (TASKS.md) theo chuẩn GitHub Spec-Kit & BackSpec SDD
---

# /speckit.tasks — Implementation Task Breakdown

Dùng skill này để bẻ nhỏ `SPEC.md` và `PLAN.md` thành danh mục công việc `TASKS.md`.

## 6 Giai Đoạn Chuẩn:
- **Giai đoạn 1: Database Migration & Entities (Data Layer):** Migration mới, audit columns, soft delete.
- **Giai đoạn 2: DTO Contracts & Repository:** Request/Response DTO, Parameterized Queries.
- **Giai đoạn 3: Domain Service & Business Logic:** `@Transactional`, Idempotency Key, Outbox.
- **Giai đoạn 4: Controller & Error Handling:** Lean Controller, RFC 7807 Exception Handler.
- **Giai đoạn 5: Testing (Coverage >= 80%):** Unit Tests, Integration Tests.
- **Giai đoạn 6: Code Review Gate & DoD:** Linter, no hardcoded secrets, no TODO comments.

## Cú pháp CLI tương đương:
```bash
specify tasks <feature-name>
# hoặc
backspec tasks <feature-name>
```
