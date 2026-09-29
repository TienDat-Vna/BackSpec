---
name: speckit-implement
description: Thực thi lập trình từng task trong TASKS.md theo chuẩn GitHub Spec-Kit & BackSpec SDD
---

<!-- GENERATED FROM registry/skills/speckit-implement/SKILL.md — DO NOT EDIT DIRECTLY -->

# /speckit.implement — Task Execution Guide

Dùng skill này khi bắt đầu viết code cho task kế tiếp trong `TASKS.md`.

## Quy Trình Viết Code Bắt Buộc:
1. **Kiểm tra task:** Đọc `TASKS.md`, lấy task pending đầu tiên có dấu `- [ ]`.
2. **Tuân thủ DTO:** Viết Request/Response DTO trước.
3. **Transaction Boundary:** Chỉ đặt `@Transactional` tại Service Layer.
4. **Viết Test:** Viết Unit/Integration Test đạt độ phủ line coverage >= 80%.
5. **Cập nhật Checklist:** Đổi `- [ ]` thành `- [x]` trong `TASKS.md`.

## Cú pháp CLI tương đương:
```bash
specify implement <feature-name>
# hoặc
backspec implement <feature-name>
```
