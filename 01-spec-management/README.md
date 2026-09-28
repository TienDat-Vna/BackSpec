# 🧠 PHẦN 1: QUẢN LÝ SPEC, DNA HỆ THỐNG & BỘ NÃO (01-spec-management)

> Nơi lưu trữ toàn bộ cấu hình hệ thống, bản sắc kiến trúc (DNA), Hiến pháp tối thượng, ma trận quyết định và quy trình Spec-Driven Development (SDD).

---

## 📂 CẤU TRÚC THƯ MỤC

```
01-spec-management/
├── dna/                                # Các file DNA & Hiến Pháp Cốt Lõi
│   ├── CONSTITUTION.md                 # Hiến pháp tối thượng: Stack, ngưỡng test >=80%, zero-trust
│   ├── CLAUDE.md                       # Bộ nhớ ngữ cảnh Claude Code: ADRs, Lessons learned
│   ├── AGENTS.md                       # Quy chuẩn Multi-Agent & 15 Điều Cấm Kỵ
│   └── AGENTS.md.header-template       # Header template cho multi-engine sync
│
├── sdd/                                # Spec-Driven Development Engine
│   ├── README.md                       # Quy trình phát triển hướng đặc tả
│   ├── core-shell-map.md               # Sơ đồ phân loại CORE (Giao dịch, DDL) vs SHELL (CRUD)
│   ├── decision-matrix.md              # Ma trận xác định mức độ chi tiết của Spec
│   ├── patterns/                       # 9 Architectural Patterns (Saga, Outbox, Idempotency...)
│   └── specs/                          # Danh mục đặc tả tính năng
│       ├── _INDEX.md                   # Bảng tổng hợp trạng thái Specs
│       ├── _template.md                # Template chuẩn soạn thảo SPEC.md
│       └── feat-create-customer-account/
│
└── skills/                             # 6 Spec & DNA Skills
    ├── system-dna-manager/             # Quản lý & bảo vệ cấu hình DNA, Hiến pháp
    ├── spec-writer/                    # Soạn thảo SPEC.md, PLAN.md, TASKS.md
    ├── analyze-feature/                # Phân tích bối cảnh trước khi code
    ├── implement-feature/              # Thực thi từng task theo chuẩn DTO
    ├── knowledge-graph/                # Bản đồ tri thức luồng nghiệp vụ & event
    └── release-notes/                  # Tự động sinh Changelog & Versioning
```

---

## 🎯 VAI TRÒ VÀ NGUYÊN TẮC VẬN HÀNH

1. **Nguồn Sự Thật Duy Nhất (Single Source of Truth)**: Mọi quy định về stack, ngưỡng kiểm thử và ranh giới microservice xuất phát từ `dna/CONSTITUTION.md`.
2. **Spec Trước Code Sau (Spec First)**: Mọi tính năng mới bắt buộc phải có `SPEC.md` và `PLAN.md` được duyệt trước khi viết dòng code đầu tiên.
3. **Phân Định CORE vs SHELL**: Sử dụng `sdd/core-shell-map.md` để đảm bảo các nghiệp vụ trọng yếu (CORE) luôn được bảo vệ bằng Full Spec.
