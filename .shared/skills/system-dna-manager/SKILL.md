---
name: system-dna-manager
description: Quản lý cấu hình DNA và bộ não hệ thống (CONSTITUTION.md, CLAUDE.md, AGENTS.md, Core-Shell Map, Decision Matrix, Role Matrix) theo chuẩn kiến trúc Microservice.
allowed-tools: [Read, Edit, Write, Grep, Glob]
---

<!-- GENERATED FROM 01-spec-management/system-dna-manager/SKILL.md — DO NOT EDIT DIRECTLY -->

<!-- GENERATED FROM .shared/skills/01-spec-management/system-dna-manager/SKILL.md — DO NOT EDIT DIRECTLY -->

# Skill — System DNA & Brain Manager (Backend Microservice)

Skill này chịu trách nhiệm quản lý, đồng bộ và bảo vệ **DNA và Bộ Não Cốt Lõi** của hệ thống Backend Microservice.

## 🧠 1. BỘ NÃO CỐT LÕI (SYSTEM BRAIN ARCHITECTURE)

Hệ thống được vận hành bởi Kiềng 3 Chân Quản Trị:

```
                       ┌─────────────────────────┐
                       │     CONSTITUTION.md     │
                       │ (Hiến pháp, Ngưỡng Test)│
                       └────────────┬────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
         ┌─────────────────────┐         ┌─────────────────────┐
         │      CLAUDE.md      │         │      AGENTS.md      │
         │ (Bộ nhớ Claude Code)│         │ (Multi-Engine Rules)│
         └─────────────────────┘         └─────────────────────┘
```

1. **`CONSTITUTION.md`**: Bản Hiến Pháp tối thượng, quy định stack công nghệ, ranh giới zero-trust, ranh giới database per service, ngưỡng test coverage (>= 80%), giới hạn kích thước file/method/PR.
2. **`CLAUDE.md`**: Bộ nhớ ngữ cảnh dành cho Claude Code: ADRs, layer kiến trúc, anti-patterns.
3. **`AGENTS.md`**: Hướng dẫn cho tất cả AI Coding Agents (Antigravity, Gemini, Open-Agent), chứa các quy tắc domain và 15 điều cấm kỵ.

## 🧬 2. QUẢN LÝ SPEC & PHÂN LOẠI MODULE

1. **Tra cứu Bounded Context**:
   - Tham khảo `.sdd/core-shell-map.md` để phân loại:
     - **CORE**: Logic nghiệp vụ cốt lõi, Saga, Outbox, Auth, DDL migration -> Yêu cầu Full Spec.
     - **SHELL**: CRUD đơn giản, Adapter ngoài, Read-only Query -> Light Spec.
2. **Ma trận Quyết định (Decision Matrix)**:
   - Tham khảo `.sdd/decision-matrix.md` trước khi khởi tạo bất kỳ spec hoặc module mới.
3. **Quản lý Spec Directory (`.sdd/specs/`)**:
   - Mọi tính năng phải có thư mục `.sdd/specs/feat-{{feature}}/` chứa `SPEC.md`, `PLAN.md`, `TASKS.md`, `CHANGELOG.md`.
   - Cập nhật chỉ mục trung tâm tại `.sdd/specs/_INDEX.md`.

## 🛡️ 3. QUY TẮC BẢO VỆ DNA

- Mọi thay đổi trong `CONSTITUTION.md`, `CLAUDE.md`, `AGENTS.md` phải được sự chấp thuận của Tech Lead / Human Architect (xem skill `human-authority-override`).
- Tuyệt đối không để xảy ra phân mảnh cấu hình giữa các môi trường hoặc giữa các AI Engine.
