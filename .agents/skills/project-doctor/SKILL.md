---
name: project-doctor
description: Công cụ chẩn đoán toàn diện sức khỏe dự án Backend Microservice, phát hiện cấu hình sai lệch, rò rỉ bảo mật, thiếu spec hoặc xung đột quy tắc.
allowed-tools: [Read, Grep, Glob, Bash]
---

<!-- GENERATED FROM 04-management/project-doctor/SKILL.md — DO NOT EDIT DIRECTLY -->

<!-- GENERATED FROM .shared/skills/04-management/project-doctor/SKILL.md — DO NOT EDIT DIRECTLY -->

# Skill — Project Doctor (Bác Sĩ Chẩn Đoán Sức Khỏe Dự Án)

Skill này thực hiện chẩn đoán tự động toàn bộ dự án để đảm bảo tính toàn vẹn của Kiềng 3 Chân Quản Trị, cấu trúc SDD, bộ quy tắc và hệ thống hooks.

## 🩺 CÁC HẠNG MỤC CHẨN ĐOÁN
1. **Kiểm tra DNA & Hiến Pháp**: Đảm bảo `CONSTITUTION.md`, `CLAUDE.md`, `AGENTS.md` tồn tại và đồng bộ.
2. **Kiểm tra Spec-Driven Development**: Đảm bảo thư mục `.sdd/specs/` có `_INDEX.md`, `_template.md` và các spec tính năng hợp lệ.
3. **Kiểm tra Bộ Kỹ Năng (Skills Health)**: Đảm bảo toàn bộ skills trong 4 thư mục (`01-spec-management`, `02-codestyle`, `03-hooks`, `04-management`) có YAML frontmatter hợp lệ và được đồng bộ.
4. **Kiểm tra Hooks & An Toàn**: Xác thực cấu hình Git hooks và kịch bản bảo vệ.

## 💻 CÂU LỆNH THỰC THI:
```bash
# Chẩn đoán sức khỏe dự án
npm run doctor

# Xác thực tính toàn vẹn hệ thống
npm run validate
```
