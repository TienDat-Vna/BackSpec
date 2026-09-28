# 🚀 Backend Microservice AI-Assisted SDD Starter Kit

> Bộ khung tiêu chuẩn hóa Spec-Driven Development (SDD) và Agent-Driven Development (ADD) dành riêng cho các dự án **Backend Microservices** (Java/Spring Boot, Go, Node/NestJS, Python/FastAPI, C#/.NET, Rust).
> Độc lập, gọn nhẹ, có cấu trúc 4 phân tầng quản trị: **Spec Management (DNA & Brain)**, **CodeStyle**, **Hooks & Strict Guard (Zero-Tolerance)**, và **Human Management (Bản đồ con người & Quyền tối thượng)**.

---

## 🏛️ 1. KIỀNG 3 CHÂN QUẢN TRỊ (GOVERNANCE TRIANGLE)

```
                       ┌─────────────────────────┐
                       │     CONSTITUTION.md     │
                       │ (Hiến pháp, Ngưỡng Test)│
                       └────────────┬────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
         ┌─────────────────────┐         ┌─────────────────────┐
         │      CLAUDE.md      │         │      AGENTS.md      │
         │ (Bộ nhớ Claude Code)│         │ (Multi-Engine Rules)│
         └─────────────────────┘         └─────────────────────┘
```

1. [CONSTITUTION.md](file:///d:/Intern_Project/partner-account-api/backend_microservice/CONSTITUTION.md): Nguồn sự thật duy nhất về stack công nghệ, quy tắc bảo mật zero-trust, ranh giới microservice, transaction boundaries, giới hạn kích thước code (method <= 40 dòng, file <= 300 dòng), và ngưỡng test coverage (>= 80%).
2. [CLAUDE.md](file:///d:/Intern_Project/partner-account-api/backend_microservice/CLAUDE.md): File context nạp đầu mọi session của Claude Code: sơ đồ kiến trúc layer, ADRs, bài học kinh nghiệm phân tán, anti-patterns.
3. [AGENTS.md](file:///d:/Intern_Project/partner-account-api/backend_microservice/AGENTS.md): Bản hướng dẫn chi tiết cho các Agent (Antigravity, Gemini, Open-Agent): DTO pattern, chuẩn HTTP error RFC 7807, domain rules và 15 điều cấm kỵ.
4. [HUMAN_PROJECT_MAP.md](file:///d:/Intern_Project/partner-account-api/backend_microservice/HUMAN_PROJECT_MAP.md): Bản đồ tổng thể dành riêng cho con người nắm bắt 100% file và giữ quyền quyết định cao nhất.

---

## ⚡ 2. CẤU TRÚC BỘ SKILL 4 PHÂN TẦNG (4-TIER SKILL ARCHITECTURE)

Tất cả 30 skills được tổ chức chuẩn hóa trong 4 thư mục chuyên biệt tại `.shared/skills/` và đồng bộ tự động sang `.claude/skills/` và `.agents/skills/`:

```
.shared/skills/
├── 01-spec-management/      # Quản lý Spec, DNA hệ thống & Bộ não
├── 02-codestyle/            # CodeStyle & Kỹ thuật lập trình Backend
├── 03-hooks/                # Hooks, Người bảo vệ giám sát (Dừng ngay khi vi phạm)
└── 04-management/           # Bản đồ dành cho con người & Quyền quyết định cao nhất
```

### 📁 1. Quản Lý Spec & Cấu Hình DNA Hệ Thống (`01-spec-management`) — 6 Skills

| Skill | Chức năng chính |
|---|---|
| `/system-dna-manager` | Quản lý & bảo vệ cấu hình DNA, Hiến pháp (`CONSTITUTION.md`, `CLAUDE.md`, `AGENTS.md`, Core-Shell map). |
| `/spec-writer` | Soạn thảo bộ `SPEC.md` / `PLAN.md` / `TASKS.md` cho tính năng microservice mới theo chuẩn SDD. |
| `/analyze-feature` | Đọc Constitution → Architecture → Specs trước khi viết dòng code đầu tiên. |
| `/implement-feature` | Thực thi từng task trong `TASKS.md` theo chuẩn Clean Architecture & DTO. |
| `/knowledge-graph` | Tra cứu luồng request, distributed event, Saga & Outbox flow giữa các module. |
| `/release-notes` | Tự động tổng hợp Release Notes, Changelog và Semantic Versioning từ deliverables. |

### 📁 2. CodeStyle & Kỹ Thuật Lập Trình Backend (`02-codestyle`) — 13 Skills

| Skill | Chức năng chính |
|---|---|
| `/backend-api-design-flow` | Quy trình 5 bước thiết kế REST API: Sequence Blueprint, Validation, Lean Controller, MDC Logging & RFC 7807. |
| `/clean-code-naming-conventions` | Quy chuẩn đặt tên biến, hàm, DTO, Database, REST API, Redis Key & State Transition Pattern (`markSuccess`/`markFailed`). |
| `/database-transaction-management` | Quản trị `@Transactional` chuẩn: `rollbackFor = [Exception.class]`, `readOnly = true`, chống cạn kiệt Connection Pool. |
| `/jpa-n-plus-one-optimization` | Kỹ thuật triệt tiêu bẫy N+1 Query: `JOIN FETCH`, `@EntityGraph`, DTO Projections, Batch Fetching. |
| `/sql-repository-pattern` | Xây dựng Repository Pattern, Parameterized Queries chống SQL Injection, Dynamic WHERE Clause. |
| `/redis-cache-patterns` | Kiến trúc Cache Realtime < 5ms, Zero Connection Leak Singleton, tra cứu O(1), Pub/Sub, Idempotency TTL 24h. |
| `/spring-middleware-pipeline` | Thiết kế chuỗi Servlet Filter, HandlerInterceptor, Request Body Wrapper, MDC `traceId` Tracking. |
| `/multi-language-error-handling` | Quản lý từ điển đa ngữ VI/EN lưu trong Database `tbl_lang`, nạp RAM qua `LangService` và đồng bộ qua Redis Pub/Sub. |
| `/db-migration` | Tạo và kiểm soát file migration DB mới (Flyway/Liquibase/Alembic/Prisma) an toàn zero-downtime. |
| `/db-interface-procedure-flow` | Tích hợp & điều phối chuỗi Stored Procedures / Legacy Core qua Adapter Client Pattern. |
| `/defensive-troubleshooting-guide` | Cẩm nang giải mã 10 bẫy lỗi kinh điển (Zero Silent Catch, PII Masking, HTTP Timeouts, Memory Leak). |
| `/git-workflow` | Chuẩn hóa Conventional Commits & 2-Phase SDD Branching (`spec/*`, `agent/*`). |
| `/safe-git-rebase` | Quy trình Git Rebase an toàn tuyệt đối (Fail-Safe Git Rebase Flow), xử lý conflict và push `--force-with-lease`. |

### 📁 3. Hooks & Người Bảo Vệ Giám Sát (`03-hooks`) — 6 Skills

> [!CAUTION]
> **CƠ CHẾ DỪNG NGAY KHI VI PHẠM (FAIL-CLOSED)**: Khi Agent vi phạm dù là lỗi nhỏ nhất (vượt ranh giới, rò rỉ PII/Secret, silent catch, thiếu timeout, test fail), hệ thống kích hoạt chế độ **DỪNG NGAY LẬP TỨC**.

| Skill | Chức năng chính |
|---|---|
| `/agent-strict-guard` | **Người Gác Đền Tối Thượng (Supreme Watchdog)**: Giám sát thời gian thực, DỪNG NGAY Agent khi vi phạm luật. |
| `/security-secret-scanner` | Quét thời gian thực phát hiện rò rỉ API Keys, Token, Private Key, DB Credentials, PII (CCCD, SĐT, OTP). |
| `/dangerous-action-blocker` | Chặn đứng mọi câu lệnh nguy hiểm (`rm -rf`, `DROP TABLE`, `git reset --hard`, force push protected branch). |
| `/code-review-gate` | Chạy 4 lớp Validation Gate nghiêm ngặt trước khi mở Pull Request hoặc hoàn tất task. |
| `/post-code-verification` | Quy trình 4 bước kiểm định chất lượng mã nguồn bắt buộc sau khi viết code. |
| `/test-feature` | Điều phối Unit & Integration tests, bắt buộc đạt ngưỡng coverage >= 80% đối chiếu Constitution; test fail -> dừng lại. |

### 📁 4. Management & Bản Đồ Dành Cho Con Người (`04-management`) — 5 Skills

> [!IMPORTANT]
> **QUYỀN QUYẾT ĐỊNH CAO NHẤT THUỘC VỀ CON NGƯỜI**: Con người có quyền phủ quyết kiến trúc, giải tỏa báo động của Guard và cấp lệnh override.

| Skill | Chức năng chính |
|---|---|
| `/human-master-map` | Bản đồ toàn diện hệ thống: Cây thư mục dự án, ý nghĩa từng file và mối liên kết kiến trúc dành cho con người. |
| `/human-authority-override` | Cơ chế phân quyền con người: Quyền phủ quyết (Veto), cấp lệnh `/override allow`, và phong tỏa hệ thống `/lockdown`. |
| `/project-governance-dashboard` | Bảng điều khiển quản trị: Theo dõi tiến độ Specs, ma trận phân vai (Role Matrix) và chỉ số chất lượng CodeStyle. |
| `/project-doctor` | Bác sĩ chẩn đoán sức khỏe dự án: Quét kiểm tra lệch cấu hình, file mồ côi, rule bị hổng. |
| `/adopt-repo` | Bộ công cụ tiếp nhận và đồng hóa các dự án microservice mới vào hệ thống SDD. |

---

## 📦 3. CÁCH SỬ DỤNG & CÂU LỆNH VẬN HÀNH

Xem hướng dẫn chi tiết tại [ADOPTION_GUIDE.md](file:///d:/Intern_Project/partner-account-api/backend_microservice/ADOPTION_GUIDE.md) và [HUMAN_PROJECT_MAP.md](file:///d:/Intern_Project/partner-account-api/backend_microservice/HUMAN_PROJECT_MAP.md).

```bash
# Cài đặt tooling hooks
npm install

# Đồng bộ rules và skills sang tất cả các AI engines
npm run sync-rules
npm run sync-skills

# Kiểm tra sức khỏe toàn diện của dự án
npm run doctor

# Kiểm tra tính toàn vẹn hệ thống
npm run validate

# Chạy test suite kiểm định hệ thống
npm run test:skills
```
