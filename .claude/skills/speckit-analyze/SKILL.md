---
name: speckit-analyze
description: Phân tích tính nhất quán chéo giữa Hiến pháp, Spec, Plan và Tasks theo chuẩn GitHub Spec-Kit & BackSpec SDD
---

<!-- GENERATED FROM registry/skills/speckit-analyze/SKILL.md — DO NOT EDIT DIRECTLY -->

# /speckit.analyze — Cross-Artifact Consistency Analyzer

Dùng skill này để rà soát sự đồng bộ giữa `CONSTITUTION.md`, `SPEC.md`, `PLAN.md`, `TASKS.md` và mã nguồn thực tế.

## Các Hạng Mục Kiểm Tra:
1. Đảm bảo toàn bộ User Stories trong Spec đều có kiến trúc tương ứng trong Plan.
2. Đảm bảo toàn bộ luồng trong Plan đều được phân rã thành tasks trong Tasks.
3. Kiểm tra tính tuân thủ với Hiến pháp (`CONSTITUTION.md`).

## Cú pháp CLI tương đương:
```bash
specify analyze <feature-name>
# hoặc
backspec analyze <feature-name>
```
