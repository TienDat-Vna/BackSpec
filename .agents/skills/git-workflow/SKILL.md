---
name: git-workflow
description: Quản lý quy trình Git chuyên nghiệp cho Microservices (Conventional Commits, Branching Strategy theo SDD CORE/SHELL, Pull Request standards và Safe Git Rebase).
allowed-tools: [Read, Grep, Glob, Bash]
---

<!-- GENERATED FROM 02-codestyle/git-workflow/SKILL.md — DO NOT EDIT DIRECTLY -->

<!-- GENERATED FROM .shared/skills/02-codestyle/git-workflow/SKILL.md — DO NOT EDIT DIRECTLY -->

# Skill — Git Workflow & PR Standards (Microservices)

Hướng dẫn Agent và Developer thực hiện quy trình Git theo chuẩn SDD và đồng bộ code an toàn tuyệt đối với `/safe-git-rebase`.

## 1. Branching Strategy

- **Tính năng CORE (SDD Hybrid 2-Phase)**:
  - `spec/{feature}`: Tạo branch để viết và review spec trong `.sdd/`. Merge vào main khi approved.
  - `agent/{feature}`: Tạo branch từ spec approved để Agent thực thi code trong src/.
- **Tính năng SHELL**:
  - `feat/{feature}`: Thêm tính năng nhỏ.
  - `fix/{bug-name}`: Sửa lỗi.
  - `chore/{task}`: Cập nhật dependency, config.

## 2. Đồng Bộ Code An Toàn (Safe Git Rebase)
Trước khi push hoặc mở Pull Request, bắt buộc chạy quy trình Rebase an toàn (Xem chi tiết tại `/safe-git-rebase`):
1. Đảm bảo Working Tree sạch sẽ (`git status`).
2. Tạo nhánh backup: `git branch backup-feat-xyz`.
3. Fetch và Rebase: `git fetch origin main && git rebase origin/main`.
4. Giải quyết xung đột (nếu có) bằng `git add` và `git rebase --continue` (tuyệt đối KHÔNG gõ `git commit`).
5. Chạy test kiểm tra: `./gradlew test` hoặc `mvn test`.
6. Push an toàn: `git push origin feat-xyz --force-with-lease`.

## 3. Commit Format (Conventional Commits)
```
[type]([scope]): [mô tả ngắn gọn bằng tiếng Anh/Việt]

Types: feat | fix | docs | style | refactor | test | chore | spec | proto | event | db
Ví dụ:
  feat(order): add idempotency key check in create order endpoint
  db(migration): add outbox_events table for order saga
  spec(payment): define payment reserve contract and compensation flow
```

## 4. Pull Request Guidelines
- Tiêu đề PR theo đúng cú pháp commit.
- Body PR mô tả: Bối cảnh, Thay đổi chính, Kết quả test (coverage), Trích dẫn `SPEC-XXX`.
- Kích thước PR <= 400 dòng thay đổi.
