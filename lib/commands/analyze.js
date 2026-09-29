const fs = require("fs");
const path = require("path");
const ui = require("../ui");
const { findSpecDir } = require("../utils/file-system");

async function runAnalyze(featureName, options = {}) {
  const root = path.resolve(options.cwd || process.cwd());

  if (!featureName) {
    ui.error("Vui lòng cung cấp tên spec. Ví dụ: specify analyze create-order");
    process.exit(1);
  }

  const specDir = findSpecDir(root, featureName);
  ui.printBanner();
  ui.info(`Phân tích tính nhất quán chéo (Cross-Artifact Analysis) cho: ${ui.pc.cyan(path.basename(specDir))}\n`);

  const artifacts = [
    { name: "CONSTITUTION.md", path: path.join(root, "CONSTITUTION.md"), required: true },
    { name: "SPEC.md", path: path.join(specDir, "SPEC.md"), required: true },
    { name: "PLAN.md", path: path.join(specDir, "PLAN.md"), required: true },
    { name: "TASKS.md", path: path.join(specDir, "TASKS.md"), required: true },
    { name: "CHANGELOG.md", path: path.join(specDir, "CHANGELOG.md"), required: false },
  ];

  const analysis = [];
  let score = 100;

  for (const art of artifacts) {
    if (fs.existsSync(art.path)) {
      const content = fs.readFileSync(art.path, "utf8");
      const lines = content.split("\n").length;
      analysis.push({
        artifact: art.name,
        status: "🟢 TỒN TẠI",
        details: `${lines} dòng, dung lượng ${fs.statSync(art.path).size} bytes`,
      });
    } else {
      score -= art.required ? 25 : 10;
      analysis.push({
        artifact: art.name,
        status: art.required ? "🔴 THIẾU" : "🟡 CHƯA TẠO",
        details: art.required ? "Bắt buộc theo chuẩn SDD" : "Khuyến nghị bổ sung",
      });
    }
  }

  // Cross checks
  const consistencyChecks = [];

  const specContent = fs.existsSync(path.join(specDir, "SPEC.md")) ? fs.readFileSync(path.join(specDir, "SPEC.md"), "utf8") : "";
  const planContent = fs.existsSync(path.join(specDir, "PLAN.md")) ? fs.readFileSync(path.join(specDir, "PLAN.md"), "utf8") : "";
  const tasksContent = fs.existsSync(path.join(specDir, "TASKS.md")) ? fs.readFileSync(path.join(specDir, "TASKS.md"), "utf8") : "";

  // 1. Check DTO consistency
  if (specContent.includes("DTO") && planContent.includes("DTO")) {
    consistencyChecks.push(["DTO Pattern Consistency", "🟢 Khớp giữa Spec & Plan"]);
  } else {
    consistencyChecks.push(["DTO Pattern Consistency", "🟡 Cần kiểm tra lại mapping DTO"]);
  }

  // 2. Check Outbox consistency
  if (specContent.includes("Outbox") || planContent.includes("Outbox")) {
    consistencyChecks.push(["Transactional Outbox", "🟢 Đã khai báo trong kiến trúc"]);
  } else {
    consistencyChecks.push(["Transactional Outbox", "ℹ Không áp dụng / Event synchronous"]);
  }

  // 3. Check Tasks coverage
  const taskCount = tasksContent.split("\n").filter((l) => l.includes("- [ ]") || l.includes("- [x]")).length;
  if (taskCount >= 6) {
    consistencyChecks.push(["Task Breakdown Rigor", `🟢 Đủ ${taskCount} atomic tasks`]);
  } else {
    consistencyChecks.push(["Task Breakdown Rigor", `🟡 Hiện có ${taskCount} tasks (khuyến nghị >= 6)`]);
  }

  console.log(ui.pc.bold(ui.pc.cyan("📊 BẢNG HIỆN TRẠNG ARTIFACTS:")));
  ui.table(
    ["Tài liệu", "Trạng thái", "Chi tiết"],
    analysis.map((a) => [a.artifact, a.status, a.details])
  );

  console.log("\n" + ui.pc.bold(ui.pc.cyan("🔍 KIỂM TRA TƯƠNG THÍCH CHÉO:")));
  ui.table(["Hạng mục kiểm tra", "Kết quả"], consistencyChecks);

  console.log("\n");
  ui.box(`CONSISTENCY HEALTH: ${Math.max(0, score)}%`, [
    `Spec Name      : ${path.basename(specDir)}`,
    `SDD Compliance : ${score >= 80 ? ui.pc.green("SẴN SÀNG LẬP TRÌNH (READY)") : ui.pc.yellow("CẦN BỔ SUNG ARTIFACTS")}`,
    `Next Action    : ${score >= 80 ? "Chạy 'specify implement " + path.basename(specDir) + "'" : "Chạy 'specify plan " + path.basename(specDir) + "'"}`,
  ]);
}

module.exports = {
  runAnalyze,
};
