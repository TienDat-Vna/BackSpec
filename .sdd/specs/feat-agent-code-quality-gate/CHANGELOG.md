# [CHANGELOG] Agent Code Quality Gate

## 2026-09-30

- Khởi tạo đặc tả quality gate kiểm soát code do agent tạo ra.
- Hoàn thành scanner `pattern-v1`, policy severity, terminal/JSON/SARIF và secret redaction.
- Tích hợp `backspec quality`, cấu hình `.sdd/quality.json`, health model và pre-commit hook.
- Bổ sung fixture test, CI Windows/Linux (Node 20/22) và kiểm tra package allowlist.
- Xác minh: test pass, validate 0 lỗi/0 cảnh báo, sync drift 0, quality strict 0 finding, health 100%.
