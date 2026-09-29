---
name: test-feature
description: Điều phối viết Unit Test, Integration Test, chạy test suite thật và đối chiếu độ phủ với ngưỡng CONSTITUTION.
allowed-tools: [Read, Edit, Write, Grep, Glob, Bash]
---

<!-- GENERATED FROM .shared/skills/03-hooks/test-feature/SKILL.md — DO NOT EDIT DIRECTLY -->

# Skill — Test Feature (Backend Microservice)

Skill này phụ trách kiểm thử tự động toàn diện cho tính năng vừa triển khai.

## Các bước thực hiện:
1. **Viết Unit Tests**:
   - Test Service Layer: Mock Repositories và external clients (Mockito / testify / jest mock).
   - Test Controller Layer: Test DTO validation và status code mapping.
2. **Viết Integration Tests**:
   - Test DB Repository & Flyway/Alembic migrations trên in-memory DB hoặc Testcontainers.
   - Test Kafka Event Producer & Consumer serialization.
3. **Chạy Test Suite Thật**:
   - Chạy lệnh test thật của dự án (`mvn clean verify`, `go test ./...`, `npm test`, `pytest`).
4. **Kiểm tra Coverage**:
   - Đối chiếu coverage đo được với ngưỡng tối thiểu trong `CONSTITUTION.md §5.1`.
   - Nếu chưa đạt, viết thêm test case cho các nhánh error path.
