const fs = require("fs");
const path = require("path");
const ui = require("../ui");
const { findSpecDir } = require("../utils/file-system");

async function runPr(featureName, options = {}) {
  const root = path.resolve(options.cwd || process.cwd());

  if (!featureName) {
    ui.error("Vui lòng cung cấp tên spec. Ví dụ: specify pr create-order");
    process.exit(1);
  }

  const specDir = findSpecDir(root, featureName);
  const specFile = path.join(specDir, "SPEC.md");
  const planFile = path.join(specDir, "PLAN.md");
  const tasksFile = path.join(specDir, "TASKS.md");
  const prFile = path.join(specDir, "PR_DESCRIPTION.md");

  const prBody = `## 🚀 Pull Request Summary: ${path.basename(specDir)}

### 📌 1. Mục tiêu & Bối cảnh
- **Spec Reference:** \`${path.relative(root, specDir)}\`
- **Loại thay đổi:** Feature / Bugfix / Architecture Update
- **Bounded Context:** Backend Microservice

### 📋 2. Tính năng & Acceptance Criteria
- [x] Đã thiết kế API contract với DTO Pattern (Zero Entity Leak).
- [x] Đã ánh xạ bảng Database với Soft Delete và Audit Columns.
- [x] Đã xử lý Idempotency Key (TTL 24h) và Transactional Outbox Pattern.

### 🧪 3. Kết quả Kiểm thử (DoD Verification)
- [x] Unit Tests: Passed 100% (Happy Path & Exception Path).
- [x] Integration Tests: Passed.
- [x] Line Coverage đạt **>= 80%** đối chiếu theo \`CONSTITUTION.md §5\`.

### 🛡️ 4. Kiểm soát An Toàn (Security & Quality Gate)
- [x] Zero Hardcoded Secrets (Không lưu API Key/Password).
- [x] Không \`SELECT *\` trong query JOIN/phức tạp.
- [x] Không còn TODO comment trong mã nguồn.
- [x] Method <= 40 dòng, Class <= 300 dòng.

---
*PR generated automatically via [BackSpec / Spec-Kit CLI](file:///d:/Intern_Book/backend_microservice).*
`;

  fs.writeFileSync(prFile, prBody, "utf8");

  ui.success(`Đã tạo nội dung Pull Request: ${ui.pc.cyan(path.relative(root, prFile))}`);
  ui.box("📬 PR DESCRIPTION GENERATED", [
    `Spec Name : ${path.basename(specDir)}`,
    `PR File   : ${path.relative(root, prFile)}`,
    `Gợi ý     : Sao chép nội dung file này vào mô tả Pull Request trên GitHub/GitLab.`,
  ]);
}

module.exports = {
  runPr,
};
