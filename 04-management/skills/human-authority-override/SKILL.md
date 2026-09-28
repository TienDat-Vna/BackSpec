---
name: human-authority-override
description: Cơ chế phân quyền và kiểm soát tối thượng của con người (Human-in-the-Loop Override), cấp quyền phê duyệt spec lớn, giải tỏa báo động của Guard và phong tỏa hệ thống (Emergency Lockdown).
allowed-tools: [Read, Edit, Write, Grep, Glob, Bash]
---

<!-- GENERATED FROM .shared/skills/04-management/human-authority-override/SKILL.md — DO NOT EDIT DIRECTLY -->

# Skill — Human Authority Override (Quyền Phủ Quyết & Quyết Định Cao Nhất Của Con Người)

> **NGUYÊN TẮC CỐT LÕI**: Trong mọi tình huống, **CON NGƯỜI LUÔN CÓ QUYỀN QUYẾT ĐỊNH CAO NHẤT**. AI Agent chỉ đóng vai trò trợ lý thực thi và phải luôn tuân lệnh trực tiếp từ Tech Lead/Developer.

---

## 👑 1. CÁC ĐẶC QUYỀN CỦA CON NGƯỜI (HUMAN SUPREME PRIVILEGES)

1. **Quyền Phủ Quyết Kiến Trúc (Architectural Veto)**:
   - Con người có quyền từ chối bất kỳ giải pháp, PR hoặc đoạn code nào do Agent tạo ra dù đã vượt qua automated tests.
2. **Quyền Phê Duyệt Thay Đổi DNA Hệ Thống**:
   - Chỉ có con người mới được phép chỉnh sửa hoặc phê duyệt thay đổi trong `CONSTITUTION.md`, `CLAUDE.md`, `AGENTS.md`.
3. **Quyền Giải Tỏa Báo Động (Guard Override & Resume)**:
   - Khi Agent bị `agent-strict-guard` dừng hoạt động do cảnh báo nhầm hoặc trong trường hợp đặc biệt, con người có quyền can thiệp cấp lệnh Override để mở khóa.
4. **Quyền Phong Tỏa Hệ Thống (Emergency Lockdown)**:
   - Khi phát hiện rủi ro bảo mật hoặc Agent hoạt động bất thường, con người có thể phát lệnh dừng toàn bộ Agent ngay lập tức.

---

## 🛑 2. GIAO THỨC PHÊ DUYỆT CỦA CON NGƯỜI (APPROVAL PROTOCOL)

Khi Agent gặp các trường hợp sau, **BẮT BUỘC DỪNG LẠI VÀ HỎI Ý KIẾN CON NGƯỜI**:
- Thay đổi cấu trúc cơ sở dữ liệu quan trọng (DDL dropped column / altered table).
- Bổ sung hoặc thay đổi dependency mới trong `pom.xml`, `build.gradle`, `package.json`.
- Tích hợp với dịch vụ tài chính / ngân hàng mới chưa có trong spec.
- Cần bypass ngưỡng test coverage do tính chất đặc thù của legacy code.

---

## 💬 3. CÂU LỆNH ĐIỀU KHIỂN CỦA CON NGƯỜI
- `/override allow`: Cho phép Agent tiếp tục sau khi đã được con người kiểm duyệt.
- `/override abort`: Hủy bỏ toàn bộ các thay đổi chưa an toàn của Agent.
- `/lockdown`: Phong tỏa mọi quyền ghi file của Agent cho đến khi có thông báo mới.
