---
name: multi-language-error-handling
description: Hướng dẫn quản lý từ điển đa ngôn ngữ (VI/EN) lưu trong cơ sở dữ liệu tbl_lang, nạp vào bộ nhớ qua LangService và đồng bộ sự kiện qua Redis Pub/Sub.
allowed-tools: [Read, Edit, Write, Grep, Glob]
---

<!-- GENERATED FROM 02-codestyle/multi-language-error-handling/SKILL.md — DO NOT EDIT DIRECTLY -->

<!-- GENERATED FROM .shared/skills/02-codestyle/multi-language-error-handling/SKILL.md — DO NOT EDIT DIRECTLY -->

# Quy Trình Quản Lý & Xử Lý Lỗi Đa Ngôn Ngữ (i18n LangService)

## 1. Mục Đích
Hướng dẫn cơ chế hỗ trợ đa ngôn ngữ động cho mã lỗi và thông báo hệ thống, cho phép cập nhật từ Admin / Backoffice mà không cần redeploy code.

---

## 2. Kiến Trúc Hoạt Động

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Admin System
    participant DB as Database (tbl_lang)
    participant Redis as Redis (system_channel)
    participant LangSvc as LangService (In-Memory Cache)
    participant API as Backend Service

    Admin->>DB: Cập nhật thông điệp lỗi (message_vi, message_en)
    Admin->>Redis: PUBLISH system_channel '{"event":"RELOAD_LANG"}'
    Redis->>LangSvc: Kích hoạt reload()
    LangSvc->>DB: SELECT * FROM tbl_lang
    LangSvc->>LangSvc: Cập nhật ConcurrentHashMap trong RAM
    
    API->>LangSvc: getMessage("400010", "vi")
    LangSvc-->>API: "Khách hàng đã có tài khoản chứng khoán"
```

---

## 3. Quy Ước Viết Code
1. Mọi Exception ném ra từ Service phải dùng Enum `ErrorCodeDetail` (ví dụ: `ErrorCodeDetail.CUSTOMER_ALREADY_EXISTS`).
2. `APIExceptionHandler` sẽ gọi `langService.getMessage(error.code, locale)` để dịch ra ngôn ngữ của client theo header `Accept-Language`.
3. Fallback: Nếu không tìm thấy key trong database, `LangService` sẽ sử dụng message mặc định khai báo sẵn trong enum `ErrorCodeDetail`.
