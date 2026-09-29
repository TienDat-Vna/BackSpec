---
name: speckit-clarify
description: Phân tích và làm rõ các điểm mơ hồ trong yêu cầu nghiệp vụ (CLARIFICATIONS.md) theo chuẩn GitHub Spec-Kit & BackSpec SDD
---

# /speckit.clarify — Requirement Clarification Guide

Dùng skill này để tìm kiếm các lỗ hổng logic, các trường hợp ngoại lệ chưa được xử lý trong `SPEC.md`.

## Các Hạng Mục Cần Làm Rõ:
- Format validation & Bounds của Request DTO
- RFC 7807 Error codes cho các nhánh lỗi
- Cơ chế xử lý trùng lặp & Idempotency Key TTL 24h
- Timeout và Fallback khi service ngoài ngừng hoạt động

## Cú pháp CLI tương đương:
```bash
specify clarify <feature-name>
# hoặc
backspec clarify <feature-name>
```
