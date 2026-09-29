---
title: Database Migration Rules
scope: database
severity: must
tags: [database, migration, ddl, sql]
---


# Rule — Database Migration

Khi tạo migration trong `db/migration/**` hoặc `migrations/**`:

1. **Migration là Bất biến**: Tuyệt đối không sửa đổi file migration cũ đã tồn tại/đã chạy. Mọi thay đổi schema phải tạo file migration MỚI.
2. **Audit Columns**: Mọi bảng nghiệp vụ mới bắt buộc có các cột: `created_at`, `updated_at`, `created_by`, và cột soft delete (`is_deleted` hoặc `status`).
3. **Charset & Collation**: Khai báo rõ ràng hỗ trợ Unicode (vd `utf8mb4` trên MySQL hoặc `UTF8` trên PostgreSQL).
4. **Timezone chuẩn**: Luôn lưu trữ thời gian ở chuẩn UTC / `TIMESTAMP WITH TIME ZONE`.
5. **Non-breaking DDL**: Khi thêm cột mới vào bảng đang chạy production, cột phải là `NULLABLE` hoặc có giá trị `DEFAULT` hợp lệ.
