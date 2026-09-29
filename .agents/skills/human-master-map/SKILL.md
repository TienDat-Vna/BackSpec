---
name: human-master-map
description: Bản đồ toàn diện hệ thống dành cho con người (Tech Lead, Architect, Dev), giúp con người nắm bắt 100% các file dự án, luồng cấu trúc, kiến trúc module và giữ quyền quyết định cao nhất.
allowed-tools: [Read, Grep, Glob]
---

<!-- GENERATED FROM registry/skills/human-master-map/SKILL.md — DO NOT EDIT DIRECTLY -->

<!-- GENERATED FROM .shared/skills/04-management/human-master-map/SKILL.md — DO NOT EDIT DIRECTLY -->

# Skill — Human Master Map (Bản Đồ Dự Án Dành Riêng Cho Con Người)

> **MỤC TIÊU**: Cung cấp cho **Kỹ sư và Tech Lead** một bức tranh toàn cảnh 100% về cấu trúc thư mục, chức năng từng file, luồng vận hành của AI Agent và điểm kiểm soát tối thượng của con người.

---

## 🗺️ 1. BẢN ĐỒ TỔNG THỂ CÁC KHỐI DỰ ÁN (PROJECT FILE ATLAS)

```
d:\Intern_Project\partner-account-api\backend_microservice
├── 🧠 BỘ NÃO & DNA HỆ THỐNG (SYSTEM BRAIN)
│   ├── CONSTITUTION.md         # Bản Hiến Pháp tối thượng: Stack, ngưỡng test, ranh giới zero-trust
│   ├── CLAUDE.md               # Bộ nhớ ngữ cảnh Claude Code: ADRs, Lessons Learned, Layering
│   ├── AGENTS.md               # Quy chuẩn vận hành Multi-Agent: 15 Điều Cấm Kỵ, Domain Rules
│   └── HUMAN_PROJECT_MAP.md    # Bản đồ tra cứu nhanh & quyền kiểm soát của con người
│
├── 📋 1. QUẢN LÝ SPEC (01-spec-management)
│   ├── .sdd/
│   │   ├── README.md           # Hướng dẫn tổng quan Spec-Driven Development
│   │   ├── core-shell-map.md   # Phân loại CORE (Giao dịch, DDL) vs SHELL (CRUD)
│   │   ├── decision-matrix.md  # Ma trận quyết định mức độ chi tiết spec
│   │   ├── patterns/           # 9 Architectural Patterns (Saga, Outbox, Idempotency, v.v.)
│   │   └── specs/              # Danh mục tính năng (_INDEX.md, _template.md, feat-*/)
│   └── .shared/skills/01-spec-management/
│       ├── spec-writer/        # Soạn thảo bộ SPEC.md, PLAN.md, TASKS.md
│       ├── analyze-feature/    # Phân tích bối cảnh trước khi code
│       ├── implement-feature/  # Thực thi từng task trong TASKS.md
│       ├── system-dna-manager/ # Quản lý DNA & Hiến pháp hệ thống
│       ├── knowledge-graph/    # Tra cứu luồng nghiệp vụ & event flow
│       └── release-notes/      # Tự động sinh Changelog & Versioning
│
├── 🎨 2. CODESTYLE & KỸ THUẬT (02-codestyle)
│   └── .shared/skills/02-codestyle/
│       ├── backend-api-design-flow/        # 5 bước thiết kế REST API chuẩn
│       ├── clean-code-naming-conventions/  # Quy chuẩn đặt tên & State Transition Flow
│       ├── database-transaction-management/# Quản lý @Transactional & Connection Pool
│       ├── jpa-n-plus-one-optimization/    # Triệt tiêu bẫy N+1 Query
│       ├── sql-repository-pattern/         # Parameterized Queries & Dynamic WHERE
│       ├── redis-cache-patterns/           # Cache tốc độ cao O(1), Pub/Sub, Idempotency
│       ├── spring-middleware-pipeline/     # Filter Chain, Request Wrapper, MDC traceId
│       ├── multi-language-error-handling/  # Từ điển đa ngữ tbl_lang qua Redis Pub/Sub
│       ├── db-migration/                   # Database Migration an toàn zero-downtime
│       ├── db-interface-procedure-flow/    # Tích hợp Stored Procedures Legacy qua Adapter
│       ├── defensive-troubleshooting-guide/# Sổ tay giải mã 10 bẫy lỗi kinh điển
│       ├── git-workflow/                   # Conventional Commits & 2-Phase Branching
│       └── safe-git-rebase/                # Git Rebase an toàn tuyệt đối
│
├── 🛡️ 3. HOOKS & BẢO VỆ GIÁM SÁT (03-hooks)
│   ├── .husky/                             # Git Hooks chặn commit sai chuẩn
│   ├── scripts/                            # Shell & Node scripts kiểm tra an toàn
│   │   ├── block-protected-files.sh        # Chặn sửa file hệ thống
│   │   ├── block-dangerous-bash.sh         # Chặn lệnh nguy hiểm (rm, drop, truncate)
│   │   ├── guard-force-push.sh             # Chặn force push lên main/master
│   │   └── pre-stop-secret-check.sh        # Quét diff chống leak API Key/Token
│   └── .shared/skills/03-hooks/
│       ├── agent-strict-guard/             # Người bảo vệ tối cao, dừng Agent khi vi phạm
│       ├── code-review-gate/               # 4 lớp Validation Gate trước khi mở PR
│       ├── post-code-verification/         # 4 bước kiểm định chất lượng sau khi code
│       ├── security-secret-scanner/        # Quét rò rỉ JWT, AWS Key, PII trong thời gian thực
│       ├── dangerous-action-blocker/       # Bộ lọc chặn lệnh phá hoại
│       └── test-feature/                   # Kiểm thử tự động, ngưỡng coverage >= 80%
│
└── 👑 4. MANAGEMENT & HUMAN GOVERNANCE (04-management)
    └── .shared/skills/04-management/
        ├── human-master-map/               # Bản đồ dự án & chỉ mục tra cứu file
        ├── human-authority-override/       # Quyền phủ quyết & phê duyệt của con người
        ├── project-governance-dashboard/   # Dashboard tiến độ, matrix & chất lượng
        ├── project-doctor/                 # Chẩn đoán & bảo trì sức khỏe dự án
        └── adopt-repo/                     # Đồng hóa dự án mới vào chuẩn SDD
```

---

## 🧭 2. MA TRẬN PHÂN VAI & QUYỀN HẠN (ROLE MATRIX)

| Vai trò | Phạm vi phụ trách | Quyền hạn |
|---|---|---|
| 👑 **Human Tech Lead / Architect** | Quyết định kiến trúc, Hiến pháp (`CONSTITUTION.md`), duyệt Spec lớn, cấp Override | **TỐI THƯỢNG (Highest Authority)** |
| 🧑‍💻 **Human Developer** | Viết nghiệp vụ, review code của Agent, chạy test và nghiệm thu | **QUYẾT ĐỊNH & KIỂM ĐỊNH** |
| 🤖 **AI Coding Agent** | Đọc Spec, thực thi task, viết test theo đúng luật lệ và chỉ dẫn của con người | **THỰC THI DƯỚI SỰ GIÁM SÁT** |
| 🛡️ **Strict Guard & Hooks** | Giám sát 24/7, phát hiện vi phạm và dừng ngay lập tức mọi hoạt động sai trái | **TỰ ĐỘNG BẢO VỆ & DỪNG KHẨN CẤP** |
