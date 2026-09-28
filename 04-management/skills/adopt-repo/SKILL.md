---
name: adopt-repo
description: Tự động phân tích repository Backend Microservice (mới hoặc đã có), nhận diện stack (Java, Go, Node, Python, .NET), và khởi tạo bộ khung kiềng 3 chân CONSTITUTION/CLAUDE/AGENTS, .sdd/ và multi-engine hooks.
allowed-tools: [Read, Edit, Write, Grep, Glob, Bash]
---

<!-- GENERATED FROM .shared/skills/04-management/adopt-repo/SKILL.md — DO NOT EDIT DIRECTLY -->

# Skill — Adopt Repo (Backend Microservices)

Tự động áp dụng bộ khung AI-Assisted SDD Starter Kit vào bất kỳ repository Backend Microservice nào.

## Các bước thực hiện:
1. **Chạy Auto-Adoption Engine**:
   ```bash
   node scripts/adopt-repo.js --path .
   ```
2. **Kiểm tra và hiệu chỉnh Kiềng 3 chân**:
   - `CONSTITUTION.md`: Cập nhật đúng tên service, database engine, framework và coverage threshold.
   - `CLAUDE.md`: Cập nhật ADRs, domain rules và layer mapping.
   - `AGENTS.md`: Đồng bộ rules qua `npm run sync-rules`.
3. **Chạy Project Doctor**:
   ```bash
   npm run doctor
   ```
   Đảm bảo tất cả diagnostics đều đạt trạng thái `ready`.
