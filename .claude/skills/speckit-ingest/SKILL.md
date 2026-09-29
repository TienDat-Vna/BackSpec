---
name: speckit-ingest
description: Nạp và trích xuất thông tin nghiệp vụ, bảng dữ liệu và sơ đồ từ file Word (.docx), PDF hoặc sơ đồ ảnh (.png, .jpg) để tạo tài liệu đặc tả SDD.
category: 01-spec-management
version: 1.0.0
triggers:
  - docx
  - word
  - ingest
  - parse-document
  - read-image
  - diagram
---

<!-- GENERATED FROM registry/skills/speckit-ingest/SKILL.md — DO NOT EDIT DIRECTLY -->

# Skill — Ingest & Trích Xuất Tài Liệu Đầu Vào (Word & Sơ Đồ Ảnh)

Kỹ năng này hướng dẫn AI Agent tiếp nhận các định dạng tài liệu thực tế của dự án doanh nghiệp (`.docx`, `.png`, `.jpg`, `.pdf`) để sinh ra tài liệu đặc tả kỹ thuật chuẩn xác nhất.

## 1. QUY TRÌNH NẠP TÀI LIỆU
1. **Kiểm tra thư mục `.sdd/inputs/`:**
   - Đọc các file tài liệu trong `.sdd/inputs/docs/` (File Word SRS/BRD `.docx`).
   - Đọc các file sơ đồ trong `.sdd/inputs/images/` (ERD, Architecture, Sequence `.png`/`.jpg`).
2. **Trích xuất thông tin:**
   - **Với Word (`.docx`):** Phân tích bảng dữ liệu (Data Dictionary), danh sách trường, kiểu dữ liệu, các ràng buộc validation, mã lỗi và use-cases.
   - **Với Sơ đồ Ảnh (`.png`/`.jpg`):** Sử dụng Multimodal Vision để đọc quan hệ bảng (PK, FK, 1-N), luồng tương tác giữa các services và chuyển thành sơ đồ Mermaid hoặc bảng Markdown.
3. **Đưa vào Đặc tả Kỹ thuật:**
   - Nhúng trực tiếp thông tin trích xuất vào `SPEC.md` và `PLAN.md` bên trong `.sdd/specs/feat-xxx/`.

## 2. CÂU LỆNH THỰC HIỆN
```bash
# Nạp trực tiếp từ file Word
specify spec <feature-name> --from .sdd/inputs/docs/BRD_Order.docx

# Nạp trực tiếp từ sơ đồ ảnh
specify spec <feature-name> --from .sdd/inputs/images/erd_diagram.png

# Nạp toàn bộ tài liệu trong thư mục inputs
specify spec <feature-name> --from .sdd/inputs/
```
