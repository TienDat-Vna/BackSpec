---
name: project-governance-dashboard
description: Bảng điều khiển quản trị toàn diện dành cho Tech Lead và Quản lý dự án, theo dõi ma trận Specs, tiến độ hoàn thành, chất lượng CodeStyle và mức độ tuân thủ quy tắc.
allowed-tools: [Read, Grep, Glob]
---

<!-- GENERATED FROM .shared/skills/04-management/project-governance-dashboard/SKILL.md — DO NOT EDIT DIRECTLY -->

# Skill — Project Governance Dashboard (Bảng Điều Khiển Quản Trị Dự Án)

Skill này cung cấp cái nhìn trực quan và số liệu tổng hợp giúp Tech Lead và Quản lý nắm bắt tình trạng dự án theo thời gian thực.

## 📊 1. CÁC CHỈ SỐ QUẢN TRỊ CHÍNH (KEY GOVERNANCE METRICS)

1. **Trạng thái Spec (`.sdd/specs/_INDEX.md`)**:
   - `DRAFT`: Đang soạn thảo spec.
   - `APPROVED`: Đã được Tech Lead phê duyệt, sẵn sàng code.
   - `IN_PROGRESS`: Agent/Dev đang thực thi các task.
   - `VERIFIED`: Đã qua 4 lớp Validation Gate và kiểm thử tự động.
   - `RELEASED`: Đã triển khai và có Release Notes.

2. **Chỉ số Sức Khỏe Mã Nguồn (Code Health Index)**:
   - Tỷ lệ tuân thủ CodeStyle: 100% (Zero Lint Warning, Zero PII Leak).
   - Tỷ lệ che phủ kiểm thử (Test Coverage): >= 80% line coverage.
   - Số lượng bẫy lỗi được phòng thủ: 10/10 bẫy lỗi kinh điển được rà soát.

3. **Chỉ số Rủi ro Kiến trúc (Architectural Risk)**:
   - Tỷ lệ CORE specs được bảo vệ bằng Full Spec.
   - Tỷ lệ zero database locks trong các lệnh gọi API ngoài.
