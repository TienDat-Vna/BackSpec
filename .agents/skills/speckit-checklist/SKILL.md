---
name: speckit-checklist
description: Sinh danh mục kiểm định chất lượng (CHECKLIST.md) theo chuẩn GitHub Spec-Kit & BackSpec SDD
---

<!-- GENERATED FROM registry/skills/speckit-checklist/SKILL.md — DO NOT EDIT DIRECTLY -->

# /speckit.checklist — Quality Assurance Checklist Generator

Dùng skill này để tạo danh mục kiểm tra chất lượng trước khi hoàn thiện tính năng hoặc mở PR.

## Các Hạng Mục Đánh Giá:
- [ ] Tính đầy đủ của đặc tả (Acceptance Criteria, Error matrix).
- [ ] DTO Pattern & Zero Entity Leak.
- [ ] Database Migration & Soft delete.
- [ ] Resilience, Timeout & Outbox.
- [ ] Line coverage đạt >= 80%.

## Cú pháp CLI tương đương:
```bash
specify checklist <feature-name>
# hoặc
backspec checklist <feature-name>
```
