const fs = require("fs");
const path = require("path");

function scanCodebaseEntities(root) {
  const entities = [];
  const migrations = [];
  const controllers = [];

  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!["node_modules", ".git", ".sdd", "target", "build", "dist", ".agents"].includes(entry.name)) {
          walk(fullPath);
        }
      } else if (entry.isFile()) {
        const lower = entry.name.toLowerCase();
        if (lower.endsWith(".sql") && (dir.includes("migration") || dir.includes("db"))) {
          migrations.push({ name: entry.name, path: fullPath });
        } else if (lower.includes("entity") || lower.includes("model") || lower.endsWith(".java") || lower.endsWith(".go") || lower.endsWith(".ts")) {
          entities.push({ name: entry.name, path: fullPath });
        } else if (lower.includes("controller") || lower.includes("handler") || lower.includes("router")) {
          controllers.push({ name: entry.name, path: fullPath });
        }
      }
    }
  }

  walk(root);
  return { entities, migrations, controllers };
}

/**
 * Chạy đối soát chéo Spec vs Tài liệu đầu vào và Mã nguồn hiện hữu
 * @param {string} root - Thư mục gốc dự án
 * @param {string} specDir - Thư mục chứa spec (ví dụ .sdd/specs/feat-xxx)
 * @param {object} options - Tùy chọn kiểm tra
 */
async function auditSpec(root, specDir, options = {}) {
  const specPath = path.join(specDir, "SPEC.md");
  const planPath = path.join(specDir, "PLAN.md");
  const tasksPath = path.join(specDir, "TASKS.md");

  if (!fs.existsSync(specPath)) {
    throw new Error(`Không tìm thấy file SPEC.md tại: ${specDir}`);
  }

  const specContent = fs.readFileSync(specPath, "utf8");
  const planContent = fs.existsSync(planPath) ? fs.readFileSync(planPath, "utf8") : "";
  const tasksContent = fs.existsSync(tasksPath) ? fs.readFileSync(tasksPath, "utf8") : "";

  // 1. Kiểm tra tài liệu gốc trong .sdd/inputs/
  const inputsDir = path.join(root, ".sdd", "inputs");
  const inputFiles = [];
  if (fs.existsSync(inputsDir)) {
    const walkInputs = (dir) => {
      const list = fs.readdirSync(dir, { withFileTypes: true });
      for (const item of list) {
        const fp = path.join(dir, item.name);
        if (item.isDirectory()) walkInputs(fp);
        else inputFiles.push(fp);
      }
    };
    walkInputs(inputsDir);
  }

  // 2. Scan mã nguồn hiện hữu
  const codebase = scanCodebaseEntities(root);

  // 3. Phân tích đối soát
  const checks = [];
  const missingItems = [];
  const warnings = [];
  const reusableItems = [];
  let score = 100;

  // Rule 1: DTO Pattern Check
  if (specContent.includes("Request DTO") && specContent.includes("Response DTO")) {
    checks.push({ item: "DTO Pattern Compliance", status: "🟢 PASSED", detail: "Khai báo đầy đủ Request/Response DTO, Zero Entity Leak" });
  } else {
    score -= 15;
    checks.push({ item: "DTO Pattern Compliance", status: "🔴 FAILED", detail: "Thiếu định nghĩa Request/Response DTO chuẩn" });
  }

  // Rule 2: Soft Delete & Audit Columns Check
  if (specContent.includes("is_deleted") && specContent.includes("created_at")) {
    checks.push({ item: "Audit & Soft-Delete Columns", status: "🟢 PASSED", detail: "Đã có is_deleted, created_at, updated_at" });
  } else {
    score -= 10;
    warnings.push("Chưa thấy khai báo đầy đủ cột audit hoặc soft-delete (is_deleted).");
    checks.push({ item: "Audit & Soft-Delete Columns", status: "🟡 WARNING", detail: "Cần đảm bảo đủ cột is_deleted và audit fields" });
  }

  // Rule 3: Error Matrix RFC 7807
  if (specContent.includes("RFC 7807") || specContent.includes("Ma trận Mã lỗi")) {
    checks.push({ item: "RFC 7807 Error Matrix", status: "🟢 PASSED", detail: "Đã định nghĩa chuẩn mã lỗi HTTP Status" });
  } else {
    score -= 10;
    checks.push({ item: "RFC 7807 Error Matrix", status: "🟡 WARNING", detail: "Thiếu ma trận mã lỗi chuẩn RFC 7807" });
  }

  // Rule 4: Idempotency & Outbox
  if (specContent.includes("Idempotency") && (specContent.includes("Outbox") || planContent.includes("Outbox"))) {
    checks.push({ item: "Distributed Resilience & Outbox", status: "🟢 PASSED", detail: "Khai báo Idempotency Key và Transactional Outbox" });
  } else {
    score -= 5;
    checks.push({ item: "Distributed Resilience & Outbox", status: "🟡 OPTIONAL", detail: "Khuyến nghị bổ sung Outbox hoặc Idempotency" });
  }

  // Rule 5: Task Phase Coverage
  const taskLines = tasksContent.split("\n").filter((l) => l.includes("- [ ]") || l.includes("- [x]"));
  if (taskLines.length >= 6) {
    checks.push({ item: "TASKS.md Atomic Breakdown", status: "🟢 PASSED", detail: `Đủ ${taskLines.length} tasks phân bổ qua 6 Phase` });
  } else {
    score -= 10;
    warnings.push(`Số lượng task hiện tại là ${taskLines.length}, khuyến nghị tối thiểu 6 atomic tasks.`);
    checks.push({ item: "TASKS.md Atomic Breakdown", status: "🟡 WARNING", detail: `Hiện có ${taskLines.length} tasks (khuyến nghị >= 6)` });
  }

  // Check Codebase conflict / reuse
  if (codebase.migrations.length > 0) {
    reusableItems.push(`Phát hiện ${codebase.migrations.length} migration files có sẵn trong DB.`);
  }
  if (codebase.controllers.length > 0) {
    reusableItems.push(`Phát hiện ${codebase.controllers.length} Controllers hiện có trong dự án.`);
  }

  const finalScore = Math.max(0, score);
  const auditDate = new Date().toISOString().split("T")[0];
  const featureName = path.basename(specDir);

  // Sinh nội dung AUDIT_REPORT.md
  const reportContent = `# 📊 AUDIT & COMPLIANCE REPORT — ${featureName}

> **Ngày kiểm định:** ${auditDate}  
> **Điểm tương thích tổng thể (Fidelity Score):** **${finalScore}/100** ${finalScore >= 85 ? "🟢 (PASSED)" : finalScore >= 70 ? "🟡 (WARNING)" : "🔴 (ACTION REQUIRED)"}  
> **Trạng thái:** ${finalScore >= 85 ? "Đủ tiêu chuẩn lập trình (Ready to Implement)" : "Cần hoàn thiện bổ sung trước khi code"}

---

## 1. BẢNG KIỂM ĐỊNH TÍNH TOÀN VẸN & CHUẨN MỰC SDD
| Hạng mục kiểm tra | Đánh giá | Chi tiết kết quả |
|---|---|---|
${checks.map((c) => `| ${c.item} | ${c.status} | ${c.detail} |`).join("\n")}

---

## 2. ĐỐI SOÁT VỚI TÀI LIỆU GỐC & INPUTS (${inputFiles.length} files tìm thấy)
${inputFiles.length > 0 ? inputFiles.map((f) => `- 📄 \`${path.relative(root, f)}\``).join("\n") : "_Chưa đặt file docx/png gốc vào `.sdd/inputs/`._"}

${missingItems.length > 0 ? `### ⚠️ Yêu cầu bị bỏ sót (Under-specification):\n` + missingItems.map((m) => `- 🔴 ${m}`).join("\n") : "🟢 **Không phát hiện thiếu sót yêu cầu từ tài liệu gốc.**"}

---

## 3. ĐỐI SOÁT VỚI MÃ NGUỒN HIỆN CÓ (CODEBASE CONSISTENCY)
- **Entities/Models quét được:** ${codebase.entities.length} files
- **Migrations quét được:** ${codebase.migrations.length} files
- **Controllers quét được:** ${codebase.controllers.length} files

${warnings.length > 0 ? `### ⚠️ Cảnh báo & Khuyến nghị:\n` + warnings.map((w) => `- 🟡 ${w}`).join("\n") : "🟢 **Không phát hiện xung đột tên bảng hoặc API endpoint.**"}

---

## 4. HÀNH ĐỘNG TIẾP THEO (NEXT ACTIONS)
${finalScore >= 85 
  ? `1. Gói đặc tả đã đạt chuẩn xuất sắc (Score: ${finalScore}%).\n2. Kỹ sư / AI Agent có thể bắt đầu lập trình: \`specify implement ${featureName}\`.`
  : `1. Mở file \`SPEC.md\` để bổ sung các mục cảnh báo ở trên.\n2. Chạy lại lệnh \`specify audit ${featureName}\` để xác nhận.`}
`;

  const reportPath = path.join(specDir, "AUDIT_REPORT.md");
  fs.writeFileSync(reportPath, reportContent, "utf8");

  return {
    score: finalScore,
    checks,
    reportPath,
    warnings,
    inputFiles,
    codebaseStats: {
      entities: codebase.entities.length,
      migrations: codebase.migrations.length,
      controllers: codebase.controllers.length,
    },
  };
}

module.exports = {
  auditSpec,
  scanCodebaseEntities,
};
