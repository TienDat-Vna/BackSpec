# 👑 PHẦN 4: MANAGEMENT & BẢN ĐỒ DÀNH CHO CON NGƯỜI (04-management)

> Bản đồ tổng thể dành riêng cho **Tech Lead, Architect & Developer**, giúp con người nắm bắt 100% cấu trúc dự án, vận hành công cụ chẩn đoán và nắm giữ **QUYỀN QUYẾT ĐỊNH CAO NHẤT (HUMAN-IN-THE-LOOP SUPREME AUTHORITY)**.

---

## 📂 CẤU TRÚC THƯ MỤC

```
04-management/
├── HUMAN_PROJECT_MAP.md                # Bản đồ toàn diện 100% file & quyền lực con người
├── ADOPTION_GUIDE.md                   # Hướng dẫn áp dụng starter kit cho dự án mới/cũ
├── CHANGELOG.md                        # Nhật ký phát triển và phiên bản hệ thống
│
├── tools/                              # Bộ Công Cụ Quản Trị & Chẩn Đoán (Scripts)
│   ├── project-doctor.js               # Bác sĩ dự án: Quét phát hiện cấu hình lỗi
│   ├── validate-project.js             # Xác thực tính toàn vẹn 4 folders
│   ├── adopt-repo.js                   # Công cụ tiếp nhận & đồng hóa repository
│   ├── test-skill-system.js            # Kiểm thử hệ thống skills & rules
│   ├── sync-shared-rules.js            # Đồng bộ rules từ 02-codestyle sang AI Engines
│   ├── sync-shared-skills.js           # Đồng bộ skills từ 4 folders sang AI Engines
│   └── lib/                            # Thư viện dùng chung (banner, doctor, migration)
│
└── skills/                             # 5 Human Management Skills
    ├── human-master-map/               # Bản đồ dự án tra cứu nhanh cho con người
    ├── human-authority-override/       # Cơ chế phân quyền, duyệt spec & override
    ├── project-governance-dashboard/   # Dashboard theo dõi tiến độ specs & matrix
    ├── project-doctor/                 # Bác sĩ chẩn đoán tự động
    └── adopt-repo/                     # Đồng hóa dự án mới
```

---

## 👑 NGUYÊN TẮC QUYỀN LỰC TỐI THƯỢNG CỦA CON NGƯỜI

1. **Quyền Phủ Quyết Kiến Trúc**: Con người có quyền từ chối mọi PR hoặc đoạn code của Agent nếu không phù hợp định hướng dài hạn.
2. **Quyền Duyệt Spec**: Chỉ có con người mới được duyệt chuyển trạng thái Spec từ `DRAFT` sang `APPROVED`.
3. **Quyền Giải Tỏa Báo Động (Override)**: Khi Agent bị Guard chặn nhầm, con người có quyền cấp lệnh `/override allow` để mở khóa.
4. **Quyền Phong Tỏa (Lockdown)**: Phát lệnh `/lockdown` đóng băng toàn bộ hoạt động của Agent khi phát hiện rủi ro.
