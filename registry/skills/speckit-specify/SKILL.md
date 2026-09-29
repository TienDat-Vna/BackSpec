---
name: speckit-specify
description: Khởi tạo hoặc cập nhật đặc tả kỹ thuật tính năng (SPEC.md) theo chuẩn GitHub Spec-Kit & BackSpec SDD
---

# /speckit.specify — Feature Specification Generator

Dùng skill này khi bắt đầu một tính năng mới hoặc cập nhật tài liệu đặc tả nghiệp vụ `SPEC.md`.

## Quy Trình Thực Hiện:
1. **Kiểm tra Hiến pháp:** Đọc `CONSTITUTION.md` để nắm rõ stack, ranh giới Bounded Context và tiêu chuẩn bảo mật.
2. **Xác định API Contract & DTO:**
   - Tạo Request DTO với đầy đủ validation constraints.
   - Tạo Response DTO chuẩn `{ status, message, data }`.
   - Tuyệt đối không để rò rỉ Database Entity ra ngoài (Zero Entity Leak).
3. **Định nghĩa RFC 7807 Error Matrix:** Bảng chi tiết mã lỗi 400, 401, 403, 404, 409, 422, 500.
4. **Database & Migration:** Khai báo bảng mới với soft delete (`is_deleted`) và audit columns.
5. **Cập nhật Index:** Đăng ký spec vào `.sdd/specs/_INDEX.md`.

## Cú pháp CLI tương đương:
```bash
specify spec <feature-name>
# hoặc
backspec spec <feature-name>
```
