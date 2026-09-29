# BackSpec & Specify — Enterprise Spec-Driven Development (SDD) Tool

> **BackSpec** (`backspec` / `specify`) là bộ công cụ dòng lệnh (CLI Tool) toàn diện, tích hợp đầy đủ chức năng của **GitHub Spec-Kit (`specify`)** và được nâng cấp chuyên biệt hóa cho các hệ thống **Backend Microservices** (Java/Spring Boot, Go, Node/NestJS, Python/FastAPI, C#/.NET Core, Rust).
> 
> Hỗ trợ lập trình viên và AI Coding Agents (Google Antigravity, Claude Code, GitHub Copilot, Cursor, Windsurf) phát triển phần mềm theo quy trình **Spec-First** chuẩn mực: **Nạp tài liệu Word (.docx) & Sơ đồ (.png) -> Sinh Đặc tả SDD Đóng Gói (.sdd/) -> Đối Soát Chéo 2 Chiều (Cross-Audit) -> Lập Trình Chuẩn DTO Pattern & DoD**.

---

```
  ██████╗  █████╗  ██████╗██╗  ██╗███████╗██████╗ ███████╗ ██████╗
  ██╔══██╗██╔══██╗██╔════╝██║ ██╔╝██╔════╝██╔══██╗██╔════╝██╔════╝
  ██████╔╝███████║██║     █████╔╝ ███████╗██████╔╝█████╗  ██║     
  ██╔══██╗██╔══██║██║     ██╔═██╗ ╚════██║██╔═══╝ ██╔══╝  ██║     
  ██████╔╝██║  ██║╚██████╗██║  ██╗███████║██║     ███████╗╚██████╗
  ╚═════╝ ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝     ╚══════╝ ╚═════╝

  Enterprise Spec-Driven Development (SDD) for Backend Microservices
     Version 2.0.0 | Multi-Engine Governance (Antigravity, Claude, Copilot, Cursor)
```

---

## TÍNH NĂNG NỔI BẬT (KEY CAPABILITIES)

1. **Docx & Image Ingestion Engine:** Trích xuất tự động bảng dữ liệu (Data Dictionary), Validation rules, API list từ file Word (`.docx`) và phân tích sơ đồ ERD, Architecture, Sequence từ file ảnh (`.png`, `.jpg`).
2. **Cấu Trúc Đóng Gói Đơn Nhất (.sdd/ Encapsulation):** Toàn bộ specs, rules, inputs được đóng gói gọn trong `.sdd/`, loại bỏ hoàn toàn việc sinh file/folder rác ra root dự án và bảo vệ Git an toàn (`.gitignore`).
3. **Động Cơ Đối Soát Chéo 2 Chiều (Bidirectional Cross-Audit):** Tự động so sánh Spec vs Tài liệu gốc (Under-spec / Over-spec check) và Spec vs Mã nguồn có sẵn (Schema conflict, Entity naming), xuất file `AUDIT_REPORT.md` kèm điểm số **Fidelity Score %**.
4. **41 Enterprise Skills & Multi-AI Registry:** Cung cấp 41 kỹ năng phân tầng trong `registry/` tương thích đồng thời với Google Antigravity, Claude Code, GitHub Copilot, Cursor và Windsurf.

---

## 1. CÀI ĐẶT & VẬN HÀNH (INSTALLATION & USAGE)

Bạn có thể sử dụng linh hoạt với cả hai tên gọi `backspec` và `specify`:

### Sử dụng trực tiếp qua npx (Khuyến nghị):
```bash
# 1. Khởi tạo khung quản trị SDD đóng gói trong .sdd/
npx specify init --ai antigravity   # hoặc --ai all

# 2. Tạo đặc tả từ template hoặc nạp từ file Word (.docx) / Sơ đồ (.png)
npx specify spec create-order --from .sdd/inputs/docs/BRD_Order.docx

# 3. Chạy đối soát chéo 2 chiều (Spec vs Docx vs Codebase)
npx specify audit create-order

# 4. Lập kế hoạch kiến trúc & Sequence Blueprint (Mermaid)
npx specify plan create-order

# 5. Phân rã danh sách tasks 6 giai đoạn
npx specify tasks create-order

# 6. Bắt đầu hướng dẫn Agent code task kế tiếp
npx specify implement create-order

# 7. Chẩn đoán toàn diện sức khỏe hệ thống
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

## 2. BẢNG TỔNG HỢP LỆNH CLI (FULL COMMAND MATRIX)

### A. Quy Trình Phát Triển Tính Năng (Spec-Kit SDD Workflow)

| Lệnh CLI | Lệnh rút gọn | Mô tả chi tiết |
|---|---|---|
| `specify init [dir]` | `backspec init` | Khởi tạo trọn bộ SDD đóng gói gọn gàng trong `.sdd/` (Kiềng 3 chân, Multi-Agent Prompts, 41 Skills). |
| `specify spec <name> [--from <file>]` | `specify new` | Sinh `SPEC.md` từ template hoặc nạp tự động từ file Word (`.docx`) / Sơ đồ (`.png`). |
| `specify audit <name> [--strict]` | `specify verify` | Chạy đối soát chéo 2 chiều (Spec vs Docx vs Mã nguồn), sinh `AUDIT_REPORT.md` đo Fidelity Score. |
| `specify ingest [path]` | `specify extract` | Trích xuất và xem trước nội dung tài liệu Word/Ảnh trong `.sdd/inputs/`. |
| `specify plan <name>` | `backspec plan` | Thiết kế kiến trúc `PLAN.md` (Mermaid Sequence, Transaction Boundary, Outbox). |
| `specify tasks <name>` | `backspec tasks` | Phân rã kế hoạch thành checklist 6 giai đoạn nguyên tử trong `TASKS.md`. |
| `specify clarify <name>` | `backspec clarify` | Tìm và làm rõ các điểm mơ hồ logic (sinh `CLARIFICATIONS.md`). |
| `specify checklist <name>` | `backspec checklist` | Sinh bảng kiểm định chất lượng Acceptance Criteria (`CHECKLIST.md`). |
| `specify analyze <name>` | `backspec analyze` | Phân tích tính nhất quán chéo (Constitution - Spec - Plan - Tasks). |
| `specify implement <name>` | `backspec implement` | Chuẩn bị bounded context và hướng dẫn code task pending kế tiếp. |
| `specify pr <name>` | `backspec pr` | Tự động sinh nội dung mô tả Pull Request (`PR_DESCRIPTION.md`). |
| `specify export <name>` | `specify pack` | Xuất trọn bộ tài liệu đặc tả thành 1 bundle duy nhất (`*-full-bundle.md`). |

### B. Quản Trị Hệ Thống & Kiểm Định (Governance & Quality Gate)

| Lệnh CLI | Tương đương | Mô tả chi tiết |
|---|---|---|
| `specify check` | `specify doctor` | Chẩn đoán toàn diện hệ thống, kiểm tra stack, đo lường SDD Health Score. |
| `specify sync` | `backspec sync` | Đồng bộ thời gian thực rules & 41 skills từ `registry/` sang Claude Code, Antigravity, Copilot. |
| `specify list [type]` | `specify ls` | Xem danh sách: `skills`, `rules` hoặc `specs` đang hoạt động. |
| `specify status` | `specify dashboard` | Mở bảng điều khiển quản trị SDD Dashboard trực quan trên Terminal. |
| `specify adopt [dir]` | `backspec adopt` | Tiếp nhận và ghép khung SDD vào microservice hiện hữu không làm hỏng code. |
| `specify validate` | `backspec validate` | Chạy 4 tầng kiểm định tính toàn vẹn hệ thống trước khi merge code. |
| `specify override <reason>` | `backspec override` | Quyền tối thượng của con người (Human Authority Override) có ghi log audit. |

---

## 3. BỘ SLASH COMMANDS TRONG AI CODING AGENTS

Khi làm việc bên trong chat của AI Agent (Google Antigravity, Claude Code, Cursor, GitHub Copilot), bạn có thể gọi trực tiếp các lệnh slash:

| Slash Command | Vai trò & Chức năng |
|---|---|
| `/speckit.specify` | Soạn thảo hoặc cập nhật đặc tả nghiệp vụ `SPEC.md` (hỗ trợ đọc Docx/Ảnh). |
| `/speckit.audit` | Chạy đối soát chéo kiểm tra thiếu sót hoặc bịa thêm tính năng so với yêu cầu gốc. |
| `/speckit.ingest` | Trích xuất dữ liệu từ file Word (.docx) và sơ đồ ảnh (.png/.jpg) đầu vào. |
| `/speckit.plan` | Thiết kế kiến trúc kỹ thuật và luồng tuần tự `PLAN.md` (Mermaid). |
| `/speckit.tasks` | Phân rã kế hoạch thành checklist công việc `TASKS.md` (6 phases). |
| `/speckit.implement` | Hướng dẫn Agent lập trình task tiếp theo theo chuẩn DTO & Test >= 80%. |
| `/speckit.clarify` | Rà soát và giải quyết các câu hỏi làm rõ yêu cầu nghiệp vụ. |
| `/speckit.checklist` | Tạo danh mục kiểm định Acceptance Criteria & DoD. |
| `/speckit.analyze` | Phân tích sự tương thích chéo giữa Spec, Plan, Tasks và Hiến pháp. |
| `/speckit.constitution` | Thiết lập & bảo vệ Hiến pháp kỹ thuật dự án (`CONSTITUTION.md`). |
| `/speckit.help` | Hướng dẫn quy trình Spec-Driven Development tổng quan. |

---

## 4. CẤU TRÚC DỰ ÁN ĐÓNG GÓI (.sdd/ ENCAPSULATION)

Khi áp dụng BackSpec vào một dự án microservice (Java Spring Boot, Go, Node, v.v.), cấu trúc được gom gọn gàng:

```
Dự án của bạn/
├── .sdd/                         <-- TRUNG TÂM QUẢN TRỊ ĐÓNG GÓI DUY NHẤT
│   ├── inputs/                   <-- Thư mục thả file Word (.docx) & Sơ đồ ảnh (.png)
│   │   ├── docs/                 <-- BRD_v1.docx, SRS.docx
│   │   └── images/               <-- erd.png, sequence.png
│   ├── specs/                    <-- Chứa toàn bộ specs dự án
│   │   ├── _INDEX.md             <-- Danh mục quản trị trạng thái specs
│   │   ├── _template.md          <-- Template spec chuẩn
│   │   └── feat-create-order/    <-- Gói đặc tả độc lập cho mỗi tính năng
│   │       ├── SPEC.md           <-- Đặc tả DTO & Business Rules
│   │       ├── PLAN.md           <-- Thiết kế kiến trúc & sequence Mermaid
│   │       ├── TASKS.md          <-- Checklist nhiệm vụ 6 giai đoạn
│   │       ├── AUDIT_REPORT.md   <-- Báo cáo đối soát 2 chiều
│   │       └── CHANGELOG.md      <-- Lịch sử cập nhật
│   ├── rules/                    <-- Bộ quy chuẩn CodeStyle, API, Security
│   └── .manifest.json            <-- File checksum đồng bộ nội bộ
├── .agents/skills/               <-- (Chỉ sinh nếu bạn dùng Antigravity)
├── CONSTITUTION.md               <-- Hiến pháp (Root - bắt buộc cho AI Agent)
├── CLAUDE.md                     <-- Chỉ dẫn cho Claude Code / CLI
├── AGENTS.md                     <-- Chỉ dẫn cho Antigravity / Cursor / Windsurf
└── src/                          <-- Mã nguồn dự án (hoàn toàn sạch sẽ)
```

---

## 5. KIỀNG 3 CHÂN QUẢN TRỊ (GOVERNANCE TRIANGLE)

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

## 6. GIẤY PHÉP (LICENSE)
Phát triển theo giấy phép **MIT License**.
Tương thích 100% với chuẩn **GitHub Spec-Kit (`specify`)**.
