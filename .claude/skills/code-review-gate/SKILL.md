---
name: code-review-gate
description: Chạy đủ 4 lớp Validation Gate (Automated Build & Lint / Spec Compliance / Constitution Check / Acceptance Criteria) trước khi mở PR.
allowed-tools: [Read, Grep, Glob, Bash]
---

<!-- GENERATED FROM registry/skills/code-review-gate/SKILL.md — DO NOT EDIT DIRECTLY -->

<!-- GENERATED FROM .shared/skills/03-hooks/code-review-gate/SKILL.md — DO NOT EDIT DIRECTLY -->

# Skill — Code Review Gate (Backend Microservice)

Chạy 4 lớp kiểm tra chất lượng nghiêm ngặt trước khi code được merge vào branch chính (kết hợp quy trình từ `/post-code-verification` và `/defensive-troubleshooting-guide`).

## 4 LỚP VALIDATION GATE:

### Gate 1: Automated Checks (Build, Lint, Unit Tests)
- [ ] Chạy build/linter của stack (Spotless / Gradle / Maven / golangci-lint / ESLint): **0 warning**.
- [ ] Toàn bộ test suite chạy pass: **100% tests green**.
- [ ] Coverage đạt ngưỡng `CONSTITUTION.md §5` (>= 80% line coverage).

### Gate 2: Spec Compliance
- [ ] API Request/Response DTO khớp đúng contract trong `SPEC.md`.
- [ ] Event message schema khớp đúng topic và trường dữ liệu.
- [ ] Mọi task trong `TASKS.md` đã được hoàn thành.

### Gate 3: Constitution & Architecture Check
- [ ] Zero Entity Leakage: DTO Pattern được áp dụng 100%.
- [ ] Soft delete: Không có câu lệnh `DELETE FROM` trực tiếp.
- [ ] Không hardcode secret hoặc credentials (Zero Secret Leak).
- [ ] Không có query `SELECT *` không kiểm soát, không bị bẫy N+1 Query (xem `/jpa-n-plus-one-optimization`).
- [ ] `@Transactional` có `rollbackFor = [Exception.class]`, không bọc lệnh gọi mạng bên ngoài trong DB transaction.
- [ ] Giới hạn method <= 40 dòng, file <= 300 dòng, PR <= 400 dòng.

### Gate 4: Acceptance Criteria & Defensive Verification
- [ ] Kiểm tra happy path & error paths hoạt động đúng mong đợi.
- [ ] Rà soát 10 bẫy lỗi theo `/defensive-troubleshooting-guide` (Zero Silent Catch, PII Masking, HTTP Timeouts).
- [ ] Idempotency key và Resiliency fallback hoạt động tốt.

> **QUY TẮC:** Bất kỳ Gate nào FAIL -> DỪNG LẠI và sửa ngay, KHÔNG tạo PR.
