---
name: release-notes
description: Tự động tổng hợp changelog và release notes từ git commit history theo chuẩn Keep a Changelog và Semantic Versioning.
allowed-tools: [Read, Edit, Write, Grep, Glob, Bash]
---

<!-- GENERATED FROM 01-spec-management/release-notes/SKILL.md — DO NOT EDIT DIRECTLY -->

<!-- GENERATED FROM .shared/skills/01-spec-management/release-notes/SKILL.md — DO NOT EDIT DIRECTLY -->

# Skill — Release Notes Generator

Tạo và cập nhật `CHANGELOG.md` của Backend Microservice khi chuẩn bị release phiên bản mới.

## Quy trình:
1. **Quét Commit Log**: Lấy toàn bộ commit từ tag release trước đó đến `HEAD`:
   ```bash
   git log $(git describe --tags --abbrev=0)..HEAD --oneline
   ```
2. **Phân nhóm theo Conventional Commits**:
   - `Added`: Các commit `feat` mới
   - `Fixed`: Các commit `fix`
   - `Changed`: Các thay đổi cấu trúc, refactor, db migration
   - `Security`: Các bản vá bảo mật
3. **Cập nhật CHANGELOG.md**:
   - Chuyển các mục trong `[Unreleased]` thành phiên bản mới (vd `## [1.2.0] - 2026-09-28`).
   - Mở mục `[Unreleased]` mới ở đầu file.
