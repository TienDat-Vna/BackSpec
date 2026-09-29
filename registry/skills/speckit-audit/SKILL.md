---
name: speckit-audit
description: Chạy đối soát chéo 2 chiều (Bidirectional Cross-Audit) giữa Spec vừa sinh ra với Tài liệu gốc (Docx/PNG) và Mã nguồn có sẵn của dự án, sinh file AUDIT_REPORT.md.
category: 04-management
version: 1.0.0
triggers:
  - audit
  - verify-spec
  - check-spec
  - cross-audit
  - fidelity
---

# Skill — Đối Soát Chéo 2 Chiều (Cross-Audit & Verification)

Kỹ năng này bảo đảm chất lượng đặc tả kỹ thuật đạt mức tin cậy tối đa (Fidelity Score >= 85%) trước khi bắt tay vào lập trình.

## 1. NGUYÊN TẮC ĐỐI SOÁT CHÉO 2 CHIỀU

```
                 ┌────────────────────────────────┐
                 │  Tài liệu gốc (.docx / .png)   │
                 └──────────────┬─────────────────┘
                                │ (Under/Over-spec check)
                                ▼
 ┌────────────────┐     ┌───────────────┐     ┌────────────────┐
 │ Codebase/DB    │◄───►│    SPEC.md    │◄───►│ CONSTITUTION.md│
 └────────────────┘     └───────────────┘     └────────────────┘
 (Schema/API conflict)                        (Architecture rules)
```

### 1.1. Đối soát với Tài liệu gốc (Docs & Diagrams)
- **Under-specification (Thiếu sót):** Tìm các trường dữ liệu, validation rules, hoặc use-case có trong file Word/Ảnh nhưng chưa được đưa vào `SPEC.md`.
- **Over-specification (Thừa thãi / Hallucination):** Phát hiện các endpoint, thực thể hoặc logic mà AI tự suy diễn không có trong yêu cầu gốc.

### 1.2. Đối soát với Mã nguồn hiện có (Source Code & DB)
- **Database & Schema:** Đối chiếu tên bảng, cột và khóa ngoại với các file Migration và Entity hiện có.
- **API & Controller:** Kiểm tra trùng lặp URL path hoặc phiên bản API (`/api/v1/...`).
- **Tái sử dụng (Reusability):** Phát hiện các Common DTO, BaseEntity, Enum dùng chung trong codebase để tái sử dụng.

## 2. CÂU LỆNH THỰC HIỆN
```bash
# Chạy kiểm định đối soát
specify audit <feature-name>
backspec audit <feature-name>

# Chế độ nghiêm ngặt (Strict mode - dừng nếu score < 85%)
specify audit <feature-name> --strict
```

## 3. KẾT QUẢ ĐẦU RA
Hệ thống tự động sinh file `AUDIT_REPORT.md` nằm trong thư mục `.sdd/specs/<feature-name>/` thể hiện:
- **Fidelity Score (%)**
- **Requirements Coverage**
- **Codebase Conflict Alerts**
- **Action Items** cần điều chỉnh.
