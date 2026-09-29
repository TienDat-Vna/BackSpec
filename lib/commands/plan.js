const fs = require("fs");
const path = require("path");
const ui = require("../ui");
const { ensureDir } = require("../utils/file-system");
const { generatePlanMd } = require("../templates/spec-bundle");

function findSpecDir(root, featureName) {
  const possiblePaths = [
    path.join(root, ".sdd", "specs", featureName),
    path.join(root, ".sdd", "specs", `feat-${featureName}`),
    path.join(root, ".sdd", "specs", `fix-${featureName}`),
    path.join(root, "01-spec-management", "sdd", "specs", featureName),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return path.join(root, ".sdd", "specs", featureName);
}

async function runPlan(featureName, options = {}) {
  const root = path.resolve(options.cwd || process.cwd());

  if (!featureName) {
    ui.error("Vui lòng cung cấp tên spec. Ví dụ: specify plan create-order");
    process.exit(1);
  }

  const specDir = findSpecDir(root, featureName);
  const specFile = path.join(specDir, "SPEC.md");
  const planFile = path.join(specDir, "PLAN.md");

  if (!fs.existsSync(specFile)) {
    ui.warn(`Không tìm thấy SPEC.md tại ${path.relative(root, specDir)}. Tự động khởi tạo spec trước...`);
    const { runCreateSpec } = require("./spec");
    await runCreateSpec(featureName, options);
  }

  ensureDir(specDir);
  const author = options.author || process.env.USER || process.env.USERNAME || "Backend Engineer";
  const serviceName = options.service || path.basename(root);

  const planContent = generatePlanMd(featureName, { author, serviceName });
  fs.writeFileSync(planFile, planContent, "utf8");

  ui.success(`Đã tạo/cập nhật Technical Plan: ${ui.pc.cyan(path.relative(root, planFile))}`);
  ui.box("📐 SPEC-KIT ARCHITECTURAL PLAN ARTIFACTS", [
    `Spec Name        : ${path.basename(specDir)}`,
    `Plan File        : ${path.relative(root, planFile)}`,
    `Sequence Diagram : Mermaid Sequence Blueprint included`,
    `Transaction Flow : Service Layer Boundary & Outbox Pattern`,
    `Resilience       : Redis Idempotency TTL 24h & Circuit Breaker`,
  ]);

  console.log("\n" + ui.pc.bold(ui.pc.green("👉 Bước tiếp theo:")));
  console.log(`  • Phân rã công việc thành checklist: ${ui.pc.yellow(`specify tasks ${path.basename(specDir)}`)}`);
  console.log(`  • Hoặc chạy lệnh trong AI Agent   : ${ui.pc.yellow(`/speckit.tasks`)}\n`);
}

module.exports = {
  runPlan,
};
