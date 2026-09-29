---
name: spec-writer
description: Soạn thảo bộ đặc tả kỹ thuật Microservice (SPEC.md, PLAN.md, TASKS.md, CHANGELOG.md) trong thư mục .sdd/specs/ theo chuẩn SDD.
allowed-tools: [Read, Edit, Write, Grep, Glob]
---

<!-- GENERATED FROM registry/skills/spec-writer/SKILL.md — DO NOT EDIT DIRECTLY -->

<!-- GENERATED FROM .shared/skills/01-spec-management/spec-writer/SKILL.md — DO NOT EDIT DIRECTLY -->

# Skill — Spec Writer (Backend Microservice)

Skill này hướng dẫn AI Agent tạo một bộ đặc tả kỹ thuật hoàn chỉnh cho một tính năng mới trong Microservice.

## Các bước thực hiện:
1. **Đọc bối cảnh**:
   - Đọc `CONSTITUTION.md`, `CLAUDE.md`, `AGENTS.md`.
   - Đọc `.sdd/decision-matrix.md` và `.sdd/core-shell-map.md` để xác định mức độ spec (CORE vs SHELL).
2. **Khởi tạo thư mục spec**:
   - Tạo thư mục `.sdd/specs/feat-{{feature_name}}/`.
3. **Soạn thảo SPEC.md**:
   - Dựa theo template `.sdd/specs/_template.md`.
   - Đặc tả rõ: Bounded context, API contract (REST/gRPC DTOs), Event payload (CloudEvents format), Database schema & migration (audit + soft delete), Idempotency strategy, Resiliency & Compensating actions.
4. **Soạn thảo PLAN.md & TASKS.md**:
   - Chia nhỏ công việc thành các task độc lập, mỗi task tương ứng một PR nhỏ (<= 400 dòng code).
5. **Cập nhật `.sdd/specs/_INDEX.md`**:
   - Thêm dòng mới vào bảng quản lý spec trung tâm.
