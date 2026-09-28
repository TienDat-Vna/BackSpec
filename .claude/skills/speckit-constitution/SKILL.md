---
name: speckit-constitution
description: Thiết lập và bảo vệ Hiến pháp dự án (CONSTITUTION.md) theo chuẩn GitHub Spec-Kit & BackSpec SDD
---

<!-- GENERATED FROM 01-spec-management/speckit-constitution/SKILL.md — DO NOT EDIT DIRECTLY -->

# /speckit.constitution — Constitution Governance

Dùng skill này để xem, khởi tạo hoặc bảo vệ Hiến pháp kỹ thuật tối thượng của dự án `CONSTITUTION.md`.

## Các Nguyên Tắc Bất Biến (Non-Negotiable Laws):
1. **Zero Hardcoded Secrets:** Tuyệt đối không commit key/password vào code.
2. **DTO Pattern Bắt buộc:** 0 Entity lọt ra ngoài API hoặc Event payload.
3. **Soft Delete toàn hệ thống:** Không chạy hard delete SQL.
4. **Resilience Standard:** Timeout <= 3000ms và Circuit Breaker.
5. **Testing DoD:** Test coverage >= 80%, có assertion thật.
6. **Code Limits:** Method <= 40 dòng, Class <= 300 dòng, Zero TODO.

## Cú pháp CLI tương đương:
```bash
specify check
# hoặc
backspec check
```
