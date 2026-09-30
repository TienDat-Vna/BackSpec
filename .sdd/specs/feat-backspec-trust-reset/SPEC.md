# [SPEC] BackSpec Trust Reset

> **Status:** VERIFIED | **Created:** 2026-09-30 | **Scope:** BackSpec CLI Core

## 1. Mục tiêu

Khôi phục độ tin cậy của BackSpec bằng cách bảo đảm mọi project do `init` sinh ra được `doctor`, `validate` và `status` hiểu theo cùng một Project Layout v2.

## 2. Phạm vi

- Chuẩn hóa layout `.sdd/`, `registry/`, `.agents/skills`, `.claude/skills` qua một resolver dùng chung.
- Health check có evidence, phát hiện placeholder và không công bố Enterprise Ready sai.
- Dashboard lấy số skill, guard state và spec state từ dữ liệu thật.
- `validate` kiểm tra layout v2 thay vì bốn thư mục legacy.
- `sync --check` chỉ kiểm tra drift, không ghi file.
- Test suite chạy trong thư mục tạm, không sửa working tree.
- Thao tác sinh artifact không ghi đè nội dung đã chỉnh nếu thiếu `--force`.
- Version banner lấy từ `package.json`.

## 3. Ngoài phạm vi

- AST/evidence graph cho Java/NestJS.
- Runtime điều phối multi-agent.
- Skill evaluation lab.
- Thay đổi database hoặc external API.

## 4. Quy tắc nghiệp vụ

1. Project Layout v2 dùng `.sdd/specs`, `.sdd/rules` và ít nhất một nguồn skill hợp lệ.
2. Toolkit source được phép dùng `registry/*` làm nguồn canonical; project người dùng dùng `.sdd/rules` và thư mục skill của engine.
3. Warning không được hiển thị nhãn Enterprise Ready.
4. Blocker làm `doctor --strict` và `validate` thất bại.
5. Mọi kết luận health phải có rule ID và evidence path.
6. Guard chỉ ACTIVE khi có hook thực tế được nối; không suy ra từ việc thư mục `.husky` tồn tại.
7. File đã được người dùng chỉnh không bị ghi đè mặc định.

## 5. Acceptance Criteria

- **AC-01:** Fresh project chạy `init --ai claude` có 41 skill và `validate` trả 0 error.
- **AC-02:** `doctor --strict` trên fresh project không có blocker.
- **AC-03:** `status` trên fresh project hiển thị đúng số skill thực tế, không dùng mẫu số hard-code.
- **AC-04:** Root governance có placeholder phải tạo warning.
- **AC-05:** Guard không được báo ACTIVE nếu các safety hook chưa được nối.
- **AC-06:** `npm test` không thay đổi file tracked/untracked của repository nguồn.
- **AC-07:** Ghi lại PLAN/TASKS đã chỉnh phải bị chặn nếu không có `--force`.
- **AC-08:** README, UI và `--version` dùng cùng version từ `package.json` hoặc không hard-code version khác.

## 6. Rủi ro và an toàn

- Không đọc `.env` hoặc secrets.
- Không xóa/migrate dữ liệu người dùng.
- Test fixture phải nằm trong thư mục tạm riêng và được cleanup.
- Các API export hiện hữu tiếp tục hoạt động; thay đổi trả thêm result object là backward-compatible.
