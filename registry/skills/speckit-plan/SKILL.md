---
name: speckit-plan
description: Thiết kế kiến trúc kỹ thuật và luồng thực thi (PLAN.md) theo chuẩn GitHub Spec-Kit & BackSpec SDD
---

# /speckit.plan — Technical & Architectural Plan Generator

Dùng skill này để tạo hoặc cập nhật bản thiết kế kỹ thuật `PLAN.md` từ `SPEC.md`.

## Quy Trình Thực Hiện:
1. **Sequence Diagram (Mermaid):** Vẽ luồng tương tác giữa Client -> Controller -> Service -> Repository -> Redis Cache -> Outbox -> Kafka.
2. **Transaction Boundary:** Xác định ranh giới `@Transactional` duy nhất tại Service Layer.
3. **Transactional Outbox & Events:** Định nghĩa CloudEvents payload và bảng outbox lưu cùng local transaction.
4. **State Transition:** Sơ đồ chuyển đổi trạng thái thực thể (`PENDING` -> `PROCESSING` -> `SUCCESS` / `FAILED`).
5. **Rollback & Resilience:** Cơ chế bù trừ, Circuit Breaker và Idempotency TTL 24h.

## Cú pháp CLI tương đương:
```bash
specify plan <feature-name>
# hoặc
backspec plan <feature-name>
```
