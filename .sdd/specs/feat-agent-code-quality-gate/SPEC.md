# [SPEC] Agent Code Quality Gate

> **Status:** IMPLEMENTED & VERIFIED | **Created:** 2026-09-30 | **Completed:** 2026-09-30 | **Scope:** BackSpec Quality Control

## 1. Mục tiêu

Cung cấp quality gate chạy offline để kiểm tra code do agent tạo ra, trả bằng chứng chính xác theo `file:line`, tích hợp CI và không làm lộ giá trị secret trong output.

## 2. Phạm vi

- Command `backspec quality [path]`.
- Output terminal, JSON và SARIF 2.1.0.
- Policy cấu hình tại `.sdd/quality.json`.
- Rule kiểm tra secret/private key, TODO comment, empty catch, `printStackTrace`, transaction đặt sai layer, file vượt giới hạn, hard delete và `SELECT *` trong SQL.
- Severity threshold và exit code cho CI.
- CI matrix Windows/Linux.
- Fixture tests cho happy path, violation path, redaction và SARIF.

## 3. Ngoài phạm vi

- AST semantic analysis hoàn chỉnh.
- SAST thay thế CodeQL/Semgrep.
- Gửi code sang LLM hoặc dịch vụ bên ngoài.
- Tự động sửa code vi phạm.

## 4. Quy tắc

1. Scanner không đọc `.env`, `.git`, dependencies, build output hoặc thư mục skill sinh tự động.
2. Evidence của secret phải được redact.
3. Mọi finding có `ruleId`, severity, message, file, line, column và remediation.
4. Mặc định fail với `critical` và `high`; `--strict` fail thêm `medium`.
5. SQL destructive rule chỉ áp dụng file `.sql` để giảm false positive.
6. Không có finding phải trả exit code 0.
7. JSON/SARIF phải ổn định để CI và dashboard tiêu thụ.

## 5. Acceptance Criteria

- AC-01: Scanner phát hiện hardcoded secret nhưng không in giá trị secret.
- AC-02: Scanner phát hiện hard delete và `SELECT *` trong SQL với đúng dòng.
- AC-03: Scanner phát hiện empty catch, `printStackTrace` và `@Transactional` trong controller/repository.
- AC-04: Scanner bỏ qua `.env`, dependency và generated skill directories.
- AC-05: SARIF hợp lệ ở version 2.1.0.
- AC-06: `quality --strict` trả non-zero khi có medium finding.
- AC-07: Clean fixture trả zero finding.
- AC-08: CI chạy test, validate, sync check và quality trên Windows/Linux.

## 6. Rủi ro

- Regex scanner có thể false positive; do đó rule được giới hạn theo extension và cung cấp exclude config.
- Không gọi đây là AST/SAST đầy đủ. Report phải nêu rõ engine `pattern-v1`.
