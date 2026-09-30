const fs = require("fs");
const path = require("path");
const ui = require("../ui");
const { writeGeneratedFile } = require("../utils/file-system");
const { generateTasksMd } = require("../templates/spec-bundle");

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

async function runTasks(featureName, options = {}) {
  const root = path.resolve(options.cwd || process.cwd());

  if (!featureName) {
    ui.error("Vui lòng cung cấp tên spec. Ví dụ: specify tasks create-order");
    process.exit(1);
  }

  const specDir = findSpecDir(root, featureName);
  const tasksFile = path.join(specDir, "TASKS.md");

  const author = options.author || process.env.USER || process.env.USERNAME || "Backend Engineer";
  const serviceName = options.service || path.basename(root);

  const tasksContent = generateTasksMd(featureName, { author, serviceName });
  const write = writeGeneratedFile(tasksFile, tasksContent, {
    overwrite: options.force,
    dryRun: options.dryRun,
  });

  // Count tasks
  const taskLines = tasksContent.split("\n").filter((l) => l.trim().startsWith("- [ ]") || l.trim().startsWith("- [x]"));
  const pendingCount = taskLines.filter((l) => l.includes("- [ ]")).length;
  const completedCount = taskLines.filter((l) => l.includes("- [x]")).length;

  ui.success(`${options.dryRun ? "Đã lập kế hoạch" : "Đã xử lý"} TASKS (${write.status}): ${ui.pc.cyan(path.relative(root, tasksFile))}`);
  ui.box("📋 SPEC-KIT TASK BREAKDOWN ARTIFACTS", [
    `Spec Name      : ${path.basename(specDir)}`,
    `Tasks File     : ${path.relative(root, tasksFile)}`,
    `Tổng số tasks  : ${taskLines.length} tasks (6 Giai đoạn)`,
    `Chưa thực hiện : 🟡 ${pendingCount} pending`,
    `Đã hoàn thành  : 🟢 ${completedCount} completed`,
  ]);

  console.log("\n" + ui.pc.bold(ui.pc.green("👉 Bắt đầu thực thi tính năng:")));
  console.log(`  • Bắt đầu code task đầu tiên : ${ui.pc.yellow(`specify implement ${path.basename(specDir)}`)}`);
  console.log(`  • Hoặc chạy lệnh trong AI Agent: ${ui.pc.yellow(`/speckit.implement`)}\n`);
  return write;
}

module.exports = {
  runTasks,
};
