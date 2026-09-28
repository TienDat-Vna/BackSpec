# ⚡ BackSpec & Specify — Enterprise Spec-Driven Development (SDD) Tool

> **BackSpec** (`backspec` / `specify`) là bộ công cụ dòng lệnh (CLI Tool) toàn diện, **tích hợp 100% chức năng của GitHub Spec-Kit (`specify`)** và được nâng cấp chuyên biệt hóa cho các dự án **Backend Microservices** (Java/Spring Boot, Go, Node/NestJS, Python/FastAPI, C#/.NET Core, Rust).
> Cho phép lập trình viên và AI Coding Agents (GitHub Copilot, Claude Code, Cursor, Windsurf, Antigravity, Gemini) phát triển phần mềm theo quy trình **Spec-First** chuẩn xác, bảo vệ kiến trúc qua **Kiềng 3 Chân Quản Trị**, 4 phân tầng tri thức và 39 Enterprise Skills.

---

```
  ██████╗  █████╗  ██████╗██╗  ██╗███████╗██████╗ ███████╗ ██████╗
  ██╔══██╗██╔══██╗██╔════╝██║ ██╔╝██╔════╝██╔══██╗██╔════╝██╔════╝
  ██████╔╝███████║██║     █████╔╝ ███████╗██████╔╝█████╗  ██║     
  ██╔══██╗██╔══██║██║     ██╔═██╗ ╚════██║██╔═══╝ ██╔══╝  ██║     
  ██████╔╝██║  ██║╚██████╗██║  ██╗███████║██║     ███████╗╚██████╗
  ╚═════╝ ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝     ╚══════╝ ╚═════╝
```

---

## 🚀 1. CÀI ĐẶT & VẬN HÀNH (INSTALLATION & USAGE)

Bạn có thể sử dụng linh hoạt với cả hai tên gọi `backspec` và `specify`:

### Sử dụng trực tiếp qua `npx` (Khuyến nghị):
```bash
# 1. Khởi tạo dự án Spec-Kit (hỗ trợ Copilot, Claude, Cursor, Antigravity)
npx specify init --ai all

# 2. Tạo đặc tả tính năng mới
npx specify spec create-payment-flow

# 3. Lập kế hoạch kiến trúc & Sequence Blueprint
npx specify plan create-payment-flow

# 4. Phân rã danh sách tasks thực thi
npx specify tasks create-payment-flow

# 5. Bắt đầu hướng dẫn Agent code task kế tiếp
npx specify implement create-payment-flow

# 6. Chẩn đoán toàn diện sức khỏe hệ thống
npx specify check
```

### Cài đặt Global CLI:
```bash
npm install -g backspec

# Sau đó có thể dùng trực tiếp 'specify' hoặc 'backspec'
specify status
backspec list skills
```

---

## 🛠️ 2. BẢNG TỔNG HỢP LỆNH CLI (FULL COMMAND MATRIX)

### 🔄 A. Quy Trình Phát Triển Tính Năng (Spec-Kit SDD Workflow)

| Lệnh CLI | Lệnh rút gọn | Mô tả chi tiết |
|---|---|---|
| `specify init [dir]` | `backspec init` | Khởi tạo trọn bộ SDD (Kiềng 3 chân, Multi-Agent Prompts, 39 Skills, Git hooks). |
| `specify spec <name>` | `specify new` | Tự động sinh `SPEC.md` với API Contract, DTO Schemas và RFC 7807 Error Matrix. |
| `specify plan <name>` | `backspec plan` | Thiết kế kiến trúc `PLAN.md` (Mermaid Sequence, Transaction Boundary, Outbox). |
| `specify tasks <name>` | `backspec tasks` | Phân rã kế hoạch thành checklist 6 giai đoạn nguyên tử trong `TASKS.md`. |
| `specify clarify <name>` | `backspec clarify` | Tìm và làm rõ các điểm mơ hồ logic (sinh `CLARIFICATIONS.md`). |
| `specify checklist <name>` | `backspec checklist` | Sinh bảng kiểm định chất lượng Acceptance Criteria (`CHECKLIST.md`). |
| `specify analyze <name>` | `backspec analyze` | Phân tích tính nhất quán chéo (Constitution ↔ Spec ↔ Plan ↔ Tasks). |
| `specify implement <name>` | `backspec implement` | Chuẩn bị bounded context và hướng dẫn code task pending kế tiếp. |
| `specify pr <name>` | `backspec pr` | Tự động sinh nội dung mô tả Pull Request (`PR_DESCRIPTION.md`). |
| `specify export <name>` | `specify pack` | Xuất trọn bộ tài liệu đặc tả thành 1 bundle duy nhất (`*-full-bundle.md`). |

### 🏛️ B. Quản Trị Hệ Thống & Kiểm Định (Governance & Quality Gate)

| Lệnh CLI | Tương đương | Mô tả chi tiết |
|---|---|---|
| `specify check` | `specify doctor` | Chẩn đoán toàn diện hệ thống, kiểm tra stack, đo lường SDD Health Score. |
| `specify sync` | `backspec sync` | Đồng bộ thời gian thực rules & 39 skills sang Claude, Copilot, Cursor, Antigravity. |
| `specify list [type]` | `specify ls` | Xem danh sách: `skills`, `rules` hoặc `specs` đang hoạt động. |
| `specify status` | `specify dashboard` | Mở bảng điều khiển quản trị SDD Dashboard trực quan trên Terminal. |
| `specify adopt [dir]` | `backspec adopt` | Tiếp nhận và ghép khung SDD vào microservice hiện hữu không làm hỏng code. |
| `specify validate` | `backspec validate` | Chạy 4 tầng kiểm định tính toàn vẹn hệ thống trước khi merge code. |
| `specify override <reason>` | `backspec override` | Quyền tối thượng của con người (Human Authority Override) có ghi log audit. |

---

## 🤖 3. BỘ SLASH COMMANDS TRONG AI CODING AGENTS

Khi làm việc bên trong chat của AI Agent (Cursor, Claude Code, Antigravity, GitHub Copilot), bạn có thể gọi trực tiếp các lệnh slash:

| Slash Command | Vai trò & Chức năng |
|---|---|
| `/speckit.constitution` | Thiết lập & bảo vệ Hiến pháp kỹ thuật dự án (`CONSTITUTION.md`). |
| `/speckit.specify` | Soạn thảo hoặc cập nhật đặc tả nghiệp vụ `SPEC.md`. |
| `/speckit.plan` | Thiết kế kiến trúc kỹ thuật và luồng tuần tự `PLAN.md`. |
| `/speckit.tasks` | Phân rã kế hoạch thành checklist công việc `TASKS.md`. |
| `/speckit.implement` | Hướng dẫn Agent lập trình task tiếp theo theo chuẩn DTO & Test >= 80%. |
| `/speckit.clarify` | Rà soát và giải quyết các câu hỏi làm rõ yêu cầu nghiệp vụ. |
| `/speckit.checklist` | Tạo danh mục kiểm định Acceptance Criteria & DoD. |
| `/speckit.analyze` | Phân tích sự tương thích chéo giữa Spec, Plan, Tasks và Hiến pháp. |
| `/speckit.help` | Hướng dẫn quy trình Spec-Driven Development tổng quan. |

---

## 🎯 4. TƯƠNG THÍCH ĐA NỀN TẢNG AI (MULTI-AGENT INTEGRATION)

Khi chạy `specify init --ai all`, công cụ tự động cấu hình:
1. **GitHub Copilot**: `.github/copilot-instructions.md` và `.github/prompts/speckit.*.prompt.md`.
2. **Claude Code**: `CLAUDE.md` và `.claude/skills/` (39 skills).
3. **Cursor**: `.cursorrules` và `.vscode/settings.json`.
4. **Windsurf**: `.windsurfrules`.
5. **Antigravity / Gemini CLI**: `AGENTS.md` và `.agents/skills/`.

---

## 🏛️ 5. KIỀNG 3 CHÂN QUẢN TRỊ (GOVERNANCE TRIANGLE)

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

1. [CONSTITUTION.md](file:///d:/Intern_Book/backend_microservice/CONSTITUTION.md): Nguồn sự thật duy nhất về stack công nghệ, quy tắc bảo mật zero-trust, ranh giới microservice, transaction boundaries, giới hạn kích thước code (method <= 40 dòng, file <= 300 dòng), và ngưỡng test coverage (>= 80%).
2. [CLAUDE.md](file:///d:/Intern_Book/backend_microservice/CLAUDE.md): File context nạp đầu mọi session của Claude Code: sơ đồ kiến trúc layer, ADRs, bài học kinh nghiệm phân tán, anti-patterns.
3. [AGENTS.md](file:///d:/Intern_Book/backend_microservice/AGENTS.md): Bản hướng dẫn chi tiết cho các Agent: DTO pattern, chuẩn HTTP error RFC 7807, domain rules và 10 điều cấm kỵ.

---

## 📜 6. GIẤY PHÉP (LICENSE)
Phát triển theo giấy phép **MIT License**.
Tương thích 100% với chuẩn **GitHub Spec-Kit (`specify`)**.
