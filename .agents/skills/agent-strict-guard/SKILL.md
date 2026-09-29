---
name: agent-strict-guard
description: Vai trò người bảo vệ tối cao (Supreme Watchdog / Zero-Tolerance Compliance Enforcer) giám sát mọi hoạt động của AI Agent. Khi phát hiện vi phạm dù chỉ là nhỏ nhất sẽ kích hoạt chế độ DỪNG NGAY LẬP TỨC (Fail-Closed / Abort).
allowed-tools: [Read, Grep, Glob, Bash]
---

<!-- GENERATED FROM registry/skills/agent-strict-guard/SKILL.md — DO NOT EDIT DIRECTLY -->

<!-- GENERATED FROM .shared/skills/03-hooks/agent-strict-guard/SKILL.md — DO NOT EDIT DIRECTLY -->

# Skill — Agent Strict Guard (Người Bảo Vệ Giám Sát Tối Cao & Dừng Ngay Khi Vi Phạm)

> **MỤC TIÊU**: Đóng vai trò là **Người Gác Đền (Supreme Guardian / Watchdog)** giám sát toàn bộ hành vi, mã nguồn và câu lệnh của AI Agent trong thời gian thực. Ép buộc 100% Agent phải tuân thủ Hiến Pháp (`CONSTITUTION.md`), 15 Điều Cấm Kỵ (`AGENTS.md`) và Chỉ thị Tối Thượng (Supreme Directive).

---

## 🚨 CƠ CHẾ KÍCH HOẠT DỪNG NGAY LẬP TỨC (FAIL-CLOSED / ABORT TRIGGER)

> [!CAUTION]
> **QUY TẮC ZERO-TOLERANCE**: Khi Agent vi phạm **bất kỳ điều nào dưới đây dù là nhỏ nhất**, hệ thống sẽ **KÍCH HOẠT CHẾ ĐỘ DỪNG NGAY LẬP TỨC**, hủy bỏ hành động hiện tại, trả về thông báo lỗi vi phạm và yêu cầu Human Review!

```
 ┌───────────────────────────────────────────────────────────┐
 │                   AGENT ACTION / PROMPT                   │
 └─────────────────────────────┬─────────────────────────────┘
                               │
                               ▼
        ┌──────────────────────────────────────────────┐
        │        AGENT STRICT GUARD (WATCHDOG)         │
        │  - Kiểm tra 15 Điều Cấm Kỵ                   │
        │  - Quét Secret / PII / Log Spam              │
        │  - Kiểm tra Ranh giới Files & Commands       │
        │  - Đối chiếu Ngưỡng Constitution             │
        └──────────────────────┬───────────────────────┘
                               │
               ┌───────────────┴───────────────┐
      [VI PHẠM DÙ NHỎ NHẤT]             [TUÂN THỦ 100%]
               │                               │
               ▼                               ▼
 ╔═══════════════════════════╗   ╔═══════════════════════════╗
 ║  🚨 DỪNG NGAY HOẠT ĐỘNG   ║   ║   ✅ CHO PHÉP THỰC THI    ║
 ║  (HALT & ABORT ON SIGHT)  ║   ║   (PROCEED TO NEXT STEP)  ║
 ╚═══════════════════════════╝   ╚═══════════════════════════╝
```

---

## ⛔ 10 BẪY LỖI KÍCH HOẠT DỪNG KHẨN CẤP (INSTANT HALT TRIGGERS)

1. **Rò rỉ Secret / PII trong Log hoặc Code**:
   - In ra log: `password`, `clientSecret`, `access_token`, `refresh_token`, CCCD, SĐT, OTP, Raw Base64 token.
   - *Hành động Guard*: **ABORT NGAY LẬP TỨC**.

2. **Silent Catch & Nuốt Lỗi Âm Thầm**:
   - Viết `catch (Exception e) {}` rỗng hoặc chỉ `println/printStackTrace()` mà không log qua `LogDTO` và ném `APIException`.
   - *Hành động Guard*: **ABORT NGAY LẬP TỨC**.

3. **Chạy Lệnh Nguy Hiểm & Phá Hoại Hệ Thống**:
   - Chạy `rm -rf`, `DROP TABLE`, `TRUNCATE`, `git reset --hard`, force push lên `main`/`master`/`production`.
   - *Hành động Guard*: **ABORT & BLOCK COMMAND**.

4. **Sửa Đổi File Cấu Hình Nền Tảng Trái Phép**:
   - Tự ý sửa `.env`, `CONSTITUTION.md`, production config, hoặc sửa file DB migration cũ đã commit mà không có Human Authority Override.
   - *Hành động Guard*: **ABORT & REVERT CHANGES**.

5. **Kết Nối Trực Tiếp DB Core / Bỏ Qua Adapter**:
   - Tạo DataSource trực tiếp tới DB Core thay vì đi qua Client Interface / Stored Procedure chuẩn.
   - *Hành động Guard*: **ABORT NGAY LẬP TỨC**.

6. **Bọc Lệnh Gọi Mạng 3rd Party trong Database Transaction**:
   - Mở `@Transactional` bao trùm HTTP RestTemplate/WebClient gọi đối tác (gây chiếm giữ và cạn kiệt HikariCP Connection Pool).
   - *Hành động Guard*: **ABORT & YÊU CẦU TÁCH TRANSACTION**.

7. **Thiếu HTTP Timeout Trên RestTemplate / WebClient**:
   - Gọi mạng ngoài không cấu hình Connect Timeout (< 3s) và Read Timeout (< 5s).
   - *Hành động Guard*: **ABORT VÀ BẮT BUỘC BỔ SUNG TIMEOUT**.

8. **Vi Phạm Giới Hạn Kích Thước Code (Constitution §3)**:
   - Method > 40 dòng, File > 300 dòng, hoặc PR > 400 dòng.
   - *Hành động Guard*: **ABORT VÀ YÊU CẦU REFACTOR TÁCH NHỎ**.

9. **Bỏ Quên Idempotency & Validation**:
   - Endpoint tạo tài khoản, giao dịch tài chính hoặc call e-Contract không có `@Valid` hoặc thiếu Idempotency key.
   - *Hành động Guard*: **ABORT NGAY LẬP TỨC**.

10. **Test Rớt Hoặc Coverage Dưới Ngưỡng (< 80%)**:
    - Chạy test suite có ca thất bại hoặc line coverage < 80%.
    - *Hành động Guard*: **ABORT & KHÔNG CHO PHÉP MỞ PR**.

---

## 📋 QUY TRÌNH GUARD CAN THIỆP KHI PHÁT HIỆN LỖI

Khi phát hiện vi phạm:
1. **Dừng phiên làm việc hiện tại của Agent**.
2. **In ra mã báo động đỏ**:
   ```
   [STRICT-GUARD-ALARM] VI PHẠM NGUYÊN TẮC BẢO VỆ TỐI THƯỢNG
   Loại vi phạm : {RULE_NAME}
   Vị trí file  : {FILE_PATH}:{LINE}
   Mô tả lỗi    : {VIOLATION_DESCRIPTION}
   Trạng thái   : EXECUTION HALTED (Dừng hoạt động khẩn cấp)
   Yêu cầu      : Sửa lỗi ngay lập tức hoặc yêu cầu phê duyệt từ Human Lead.
   ```
3. **Chỉ tiếp tục sau khi lỗi đã được khắc phục hoàn toàn** hoặc có sự phê duyệt từ skill `human-authority-override`.
