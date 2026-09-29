---
name: analyze-feature
description: Phân tích kỹ lưỡng kiến trúc, constitution, ranh giới bounded context và specs trước khi bắt đầu code một tính năng mới.
allowed-tools: [Read, Grep, Glob]
---

<!-- GENERATED FROM .shared/skills/01-spec-management/analyze-feature/SKILL.md — DO NOT EDIT DIRECTLY -->

# Skill — Analyze Feature (Backend Microservice)

Skill này bắt buộc AI Agent tuân thủ thứ tự phân tích trước khi viết dòng code đầu tiên.

## Thứ tự đọc bắt buộc:
1. `CONSTITUTION.md` — Stack công nghệ, các giới hạn kích thước code, chính sách bảo mật và ngưỡng kiểm thử.
2. `CLAUDE.md` — Layer kiến trúc, ADRs, Lessons learned, Golden patterns.
3. `AGENTS.md` — Domain rules, DTO pattern, Soft delete, Exception handling.
4. `.sdd/specs/feat-{{feature}}/SPEC.md` — Đặc tả chi tiết về API, DB schema, Event contracts của feature.
5. Tra cứu danh mục Technical Skills phù hợp: `/backend-api-design-flow`, `/database-transaction-management`, `/jpa-n-plus-one-optimization`, `/spring-middleware-pipeline`, `/redis-cache-patterns`.

## Kết quả phân tích cần xác nhận:
- [ ] Bounded context của feature thuộc package/module nào?
- [ ] Có thay đổi DB Schema không? Đã có kế hoạch migration chưa (xem `/db-migration`)?
- [ ] Có gọi sang microservice ngoài không? Đã có timeout, retry và fallback chưa (xem `/defensive-troubleshooting-guide`)?
- [ ] DTO Request/Response đã phân tách hoàn toàn khỏi Entity chưa?
- [ ] Idempotency key đã được thiết kế chưa (xem `/redis-cache-patterns`)?
