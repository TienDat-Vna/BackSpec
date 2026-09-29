---
name: db-migration
description: Tạo file migration cơ sở dữ liệu mới (Flyway / Liquibase / Alembic / Prisma / golang-migrate) đảm bảo tính bất biến, audit columns, soft delete và không downtime.
allowed-tools: [Read, Edit, Write, Grep, Glob]
---

<!-- GENERATED FROM .shared/skills/02-codestyle/db-migration/SKILL.md — DO NOT EDIT DIRECTLY -->

# Skill — Database Migration (Backend Microservice)

Hướng dẫn Agent tạo file migration cơ sở dữ liệu an toàn.

## Checklist trước khi tạo migration:
1. **Kiểm tra migration cũ**: Không bao giờ sửa đổi file migration cũ đã tồn tại.
2. **Xác định phiên bản tiếp theo**: Đọc thư mục migration để lấy version tăng dần (vd `V2__add_status_column.sql`).
3. **Quy chuẩn bắt buộc trong script**:
   - Bảng mới phải có cột audit: `created_at`, `updated_at`, `created_by`.
   - Bảng mới phải có cột soft delete: `is_deleted` hoặc `status`.
   - Cột thêm vào bảng cũ phải là `NULLABLE` hoặc có `DEFAULT`.
   - Tạo Index có điều kiện cho các trường truy vấn thường xuyên.
4. **Cập nhật Entity & DTO**: Sau khi viết file migration, cập nhật Entity class và DTO mapping tương ứng.
