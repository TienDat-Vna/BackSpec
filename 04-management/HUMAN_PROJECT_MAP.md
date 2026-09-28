# 🗺️ BẢN ĐỒ DỰ ÁN DÀNH CHO CON NGƯỜI (HUMAN PROJECT ATLAS & GOVERNANCE MAP)

> **DỰ ÁN**: Backend Microservice (KBSV PNS / Partner Account API)  
> **ĐỐI TƯỢNG SỬ DỤNG**: Tech Lead, Solution Architect, Senior Backend Engineers & Product Owners.  
> **NGUYÊN TẮC CỐT LÕI**: **CON NGƯỜI CÓ QUYỀN QUYẾT ĐỊNH CAO NHẤT (HUMAN-IN-THE-LOOP SUPREME AUTHORITY)**. AI Agent chỉ là trợ lý thực thi dưới sự giám sát chặt chẽ của các bộ Hook & Guardrails.

---

## 🏛️ 1. CÂY THƯ MỤC & VAI TRÒ 4 KHỐI HỆ THỐNG

```
d:\Intern_Project\partner-account-api\backend_microservice
│
├── 🧠 01-spec-management/              # 1. QUẢN LÝ SPEC, DNA HỆ THỐNG & BỘ NÃO
│   ├── README.md                       # Tài liệu tổng quan bộ não hệ thống
│   ├── dna/                            # Cấu hình DNA, Hiến pháp tối thượng
│   │   ├── CONSTITUTION.md             # Hiến pháp tối thượng: Ngưỡng test >=80%, zero-trust
│   │   ├── CLAUDE.md                   # Bộ nhớ ngữ cảnh Claude Code: ADRs, Kiến trúc 4 tầng
│   │   └── AGENTS.md                   # Quy chuẩn Multi-Agent: 15 Điều Cấm Kỵ
│   ├── sdd/                            # Spec-Driven Development Engine
│   │   ├── README.md                   # Quy trình phát triển hướng đặc tả
│   │   ├── core-shell-map.md           # Phân định CORE vs SHELL
│   │   ├── decision-matrix.md          # Ma trận quyết định độ sâu của Spec
│   │   ├── patterns/                   # 9 Architectural Patterns (Saga, Outbox, Idempotency...)
│   │   └── specs/                      # Kho lưu trữ đặc tả tính năng (_INDEX.md, _template.md)
│   └── skills/                         # 6 Spec & Brain Skills
│       ├── system-dna-manager/         # Quản lý & bảo vệ cấu hình DNA, Hiến pháp
│       ├── spec-writer/                # Soạn thảo bộ SPEC.md / PLAN.md / TASKS.md
│       ├── analyze-feature/            # Phân tích bối cảnh kiến trúc trước khi viết code
│       ├── implement-feature/          # Thực thi từng task nhỏ trong TASKS.md theo chuẩn DTO
│       ├── knowledge-graph/            # Tra cứu luồng request, distributed event & module map
│       └── release-notes/              # Tự động sinh Changelog & Semantic Versioning
│
├── 🎨 02-codestyle/                    # 2. CODESTYLE & KỸ THUẬT LẬP TRÌNH BACKEND
│   ├── README.md                       # Hướng dẫn quy chuẩn CodeStyle & Clean Architecture
│   ├── rules/                          # 7 Quy chuẩn cốt lõi (Single Source of Truth)
│   │   ├── api-design.md               # Chuẩn thiết kế REST API & DTO Pattern
│   │   ├── async-integration.md        # Chuẩn tích hợp bất đồng bộ Kafka / RabbitMQ
│   │   ├── backend-feature.md          # Chuẩn phân tầng Clean 4-tier Architecture
│   │   ├── db-migration.md             # Chuẩn DDL Migration & Soft Delete
│   │   ├── microservice-resilience.md  # Chuẩn Circuit Breaker & Timeout
│   │   ├── security.md                 # Chuẩn Zero-Trust & PII Masking
│   │   └── testing.md                  # Chuẩn Coverage >= 80%
│   └── skills/                         # 13 CodeStyle Skills
│       ├── backend-api-design-flow/    # 5 bước thiết kế REST API chuẩn Enterprise
│       ├── clean-code-naming-conventions/# Quy chuẩn đặt tên & State Transition Helper Pattern
│       ├── database-transaction-management/# Quản trị @Transactional, chống block Connection Pool
│       ├── jpa-n-plus-one-optimization/# Triệt tiêu bẫy N+1 Query (JOIN FETCH, EntityGraph)
│       ├── sql-repository-pattern/     # Repository Pattern, Parameterized Query chống SQL Injection
│       ├── redis-cache-patterns/       # Cache Realtime < 5ms, Zero Connection Leak, Idempotency TTL 24h
│       ├── spring-middleware-pipeline/ # Chuỗi Servlet Filter, Request Wrapper, MDC traceId Tracking
│       ├── multi-language-error-handling/# Quản lý từ điển đa ngữ tbl_lang qua Redis Pub/Sub
│       ├── db-migration/               # Database Migration an toàn zero-downtime
│       ├── db-interface-procedure-flow/# Tích hợp Stored Procedures Legacy qua Adapter Client
│       ├── defensive-troubleshooting-guide/# Sổ tay giải mã 10 bẫy lỗi kinh điển (Zero Silent Catch)
│       ├── git-workflow/               # Conventional Commits & 2-Phase Branching
│       └── safe-git-rebase/            # Git Rebase an toàn tuyệt đối với --force-with-lease
│
├── 🛡️ 03-hooks/                        # 3. HOOKS & NGƯỜI BẢO VỆ GIÁM SÁT (FAIL-CLOSED)
│   ├── README.md                       # Hướng dẫn cơ chế Guard & Dừng khẩn cấp
│   ├── husky/                          # Git Hooks kiểm soát commit & format
│   ├── scripts/                        # Bộ kịch bản giám sát bảo mật
│   │   ├── block-dangerous-bash.sh     # Chặn lệnh nguy hiểm (rm -rf, DROP TABLE, git reset --hard)
│   │   ├── block-protected-files.sh    # Chặn sửa file hệ thống (.env, config, migration cũ)
│   │   ├── guard-force-push.sh         # Chặn force push lên main/master/production
│   │   └── pre-stop-secret-check.sh    # Quét diff chống lộ Token, Password, AWS Key, PII
│   └── skills/                         # 6 Guard & Verification Skills
│       ├── agent-strict-guard/         # Người gác đền tối thượng: DỪNG NGAY AGENT KHI VI PHẠM
│       ├── security-secret-scanner/    # Quét rò rỉ JWT, API Key, CCCD, SĐT, OTP thời gian thực
│       ├── dangerous-action-blocker/   # Bộ lọc chặn đứng các lệnh phá hoại
│       ├── code-review-gate/           # 4 lớp Validation Gate nghiêm ngặt trước khi mở PR
│       ├── post-code-verification/     # 4 bước kiểm định chất lượng bắt buộc sau khi code
│       └── test-feature/               # Kiểm thử tự động & bắt buộc đạt coverage >= 80%
│
└── 👑 04-management/                   # 4. MANAGEMENT & BẢN ĐỒ CON NGƯỜI (SUPREME AUTHORITY)
    ├── README.md                       # Hướng dẫn trung tâm điều khiển & quản trị
    ├── HUMAN_PROJECT_MAP.md            # Bản đồ toàn diện 100% file (File này)
    ├── ADOPTION_GUIDE.md               # Hướng dẫn áp dụng starter kit cho dự án mới/cũ
    ├── CHANGELOG.md                    # Nhật ký phát triển và phiên bản hệ thống
    ├── tools/                          # Bộ công cụ quản trị (Doctor, Validate, Sync, Test)
    │   ├── sync-shared-rules.js        # Đồng bộ rules sang AI Engines
    │   ├── sync-shared-skills.js       # Đồng bộ skills từ 4 folders sang AI Engines
    │   ├── validate-project.js         # Xác thực tính toàn vẹn 4 folders
    │   ├── project-doctor.js           # Bác sĩ dự án chẩn đoán hệ thống
    │   ├── adopt-repo.js               # Công cụ tiếp nhận repo mới
    │   └── test-skill-system.js        # Kiểm thử tự động hệ thống
    └── skills/                         # 5 Human Management Skills
        ├── human-master-map/           # Bản đồ dự án & chỉ mục tra cứu file
        ├── human-authority-override/   # Quyền phủ quyết & phê duyệt của con người
        ├── project-governance-dashboard/# Dashboard tiến độ, matrix & chất lượng
        ├── project-doctor/             # Chẩn đoán & bảo trì sức khỏe dự án
        └── adopt-repo/                 # Đồng hóa dự án mới vào chuẩn SDD
```

---

## 👑 2. MA TRẬN QUYỀN LỰC CỦA CON NGƯỜI

1. **Quyền Phủ Quyết Kiến Trúc**: Con người có quyền từ chối bất kỳ PR hoặc đoạn code nào của Agent.
2. **Quyền Duyệt Spec**: Chỉ có con người mới được duyệt chuyển trạng thái Spec từ `DRAFT` sang `APPROVED`.
3. **Quyền Giải Tỏa Báo Động (Override)**: Khi Agent bị Guard chặn nhầm, con người có quyền cấp lệnh `/override allow`.
4. **Quyền Phong Tỏa (Lockdown)**: Phát lệnh `/lockdown` đóng băng toàn bộ Agent khi phát hiện rủi ro.
