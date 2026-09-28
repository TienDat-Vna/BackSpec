# 🛡️ PHẦN 3: HOOKS & NGƯỜI BẢO VỆ GIÁM SÁT (03-hooks)

> Vai trò như **Người Gác Đền Tối Thượng (Supreme Watchdog / Zero-Tolerance Compliance Enforcer)**. Giám sát 24/7 toàn bộ hoạt động của AI Agent. Ép buộc tất cả phải đi theo luật.
> **KHI AGENT VI PHẠM DÙ LÀ LỖI NHỎ NHẤT SẼ KÍCH HOẠT CHẾ ĐỘ DỪNG NGAY HOẠT ĐỘNG (FAIL-CLOSED / INSTANT ABORT).**

---

## 📂 CẤU TRÚC THƯ MỤC

```
03-hooks/
├── husky/                              # Git Hooks Kiểm Soát Tầng Local
│   ├── commit-msg                      # Kiểm tra format Conventional Commits
│   ├── pre-commit                      # Chạy linter & format trước khi commit
│   └── commitlint.config.js            # Cấu hình commitlint
│
├── scripts/                            # Kịch Bản Giám Sát & Phòng Thủ An Toàn
│   ├── block-dangerous-bash.sh         # Chặn lệnh nguy hiểm (rm -rf, DROP TABLE, git reset)
│   ├── block-protected-files.sh        # Chặn sửa file hệ thống (.env, config, migration cũ)
│   ├── guard-force-push.sh             # Chặn force push lên main/master/production
│   ├── pre-stop-secret-check.sh        # Quét diff chống lộ Token, Password, AWS Key, PII
│   ├── format-on-save.sh               # Tự động format code theo chuẩn ngôn ngữ
│   ├── session-start-context.sh        # Nhắc nhở branch bảo vệ lúc mở session
│   ├── prompt-safety-nudge.sh          # Cảnh báo an toàn trong prompt
│   └── pre-compact-reminder.sh         # Nhắc nhở lưu trạng thái trước khi compact
│
└── skills/                             # 6 Guard & Verification Skills
    ├── agent-strict-guard/             # SUPREME WATCHDOG: Dừng ngay Agent khi vi phạm luật
    ├── security-secret-scanner/        # Quét rò rỉ JWT, API Key, CCCD, SĐT, OTP thời gian thực
    ├── dangerous-action-blocker/       # Bộ lọc chặn đứng các lệnh phá hoại
    ├── code-review-gate/               # 4 lớp Validation Gate nghiêm ngặt trước khi mở PR
    ├── post-code-verification/         # 4 bước kiểm định chất lượng bắt buộc sau khi code
    └── test-feature/                   # Kiểm thử tự động, bắt buộc coverage >= 80%
```

---

## 🚨 CƠ CHẾ KÍCH HOẠT DỪNG KHẨN CẤP (FAIL-CLOSED PROTOCOL)

Khi phát hiện bất kỳ dấu hiệu nào dưới đây:
1. **Rò rỉ Secret / Token / PII** trong log hoặc code.
2. **Silent Catch** nuốt lỗi âm thầm (`catch (Exception e) {}` rỗng).
3. **Chạy lệnh nguy hiểm** (`rm -rf`, `DROP TABLE`, `git reset --hard`).
4. **Tự ý sửa file cấu hình nền tảng** (`.env`, `CONSTITUTION.md`).
5. **Bọc lệnh gọi mạng ngoài trong `@Transactional`**.
6. **Thiếu HTTP Timeout** (< 3s Connect, < 5s Read).
7. **Test rớt hoặc Coverage < 80%**.

➡️ **HỆ THỐNG DỪNG NGAY LẬP TỨC (ABORT & LOCKDOWN)**, in cảnh báo đỏ và yêu cầu Human Review!
