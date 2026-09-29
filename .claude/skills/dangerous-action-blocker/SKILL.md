---
name: dangerous-action-blocker
description: Bộ lọc và chặn đứng mọi câu lệnh nguy hiểm, thao tác phá hoại file hệ thống, force push hoặc drop database của AI Agent.
allowed-tools: [Read, Grep, Glob, Bash]
---

<!-- GENERATED FROM registry/skills/dangerous-action-blocker/SKILL.md — DO NOT EDIT DIRECTLY -->

<!-- GENERATED FROM .shared/skills/03-hooks/dangerous-action-blocker/SKILL.md — DO NOT EDIT DIRECTLY -->

# Skill — Dangerous Action Blocker (Bộ Chặn Lệnh Nguy Hiểm & Phá Hoại Hệ Thống)

Skill này kích hoạt bộ lọc phòng thủ cấp cao nhất nhằm ngăn chặn Agent thực thi các câu lệnh gây mất mát dữ liệu hoặc phá vỡ tính toàn vẹn của mã nguồn.

## 🛑 DANH MỤC LỆNH BỊ CHẶN TUYỆT ĐỐI (BLACKLIST COMMANDS)

### 1. Phá hủy File & Thư mục:
- ❌ `rm -rf /` hoặc `rm -rf ~` hoặc `rm -rf *`
- ❌ Xóa các thư mục hệ thống: `.git/`, `scripts/`, `.sdd/`, `.shared/` mà không có human approval.

### 2. Phá hoại Git & Lịch sử Commit:
- ❌ `git push --force` hoặc `git push -f` lên các branch bảo vệ (`main`, `master`, `uat`, `production`).
- ❌ `git reset --hard origin/main` làm mất các thay đổi chưa commit.

### 3. Phá hoại Cơ sở Dữ liệu:
- ❌ Chạy trực tiếp `DROP TABLE`, `TRUNCATE TABLE`, `DROP DATABASE` ngoài môi trường migration.
- ❌ Sửa trực tiếp các file SQL migration cũ đã được release.

### 4. Sửa Đổi File Cấu Hình Trái Phép:
- ❌ Sửa các file: `.env`, `CONSTITUTION.md`, `CLAUDE.md`, `AGENTS.md` (chỉ được sửa khi có sự đồng ý của Human Lead).

## ⚡ HÀNH ĐỘNG KHI GẶP LỆNH NGUY HIỂM
1. **Chặn đứng lệnh ngay trước khi shell thực thi**.
2. **Kích hoạt mã cảnh báo**:
   ```
   [DANGEROUS-COMMAND-BLOCKED] Lệnh bị từ chối vì lý do an toàn!
   Lệnh phát hiện: {COMMAND}
   Nguy cơ        : Phá hủy dữ liệu / Vi phạm chính sách an toàn
   ```
3. **Yêu cầu chuyển sang phương án an toàn** (ví dụ: dùng Soft Delete thay vì Drop, dùng Rebase an toàn thay vì Force Push).
