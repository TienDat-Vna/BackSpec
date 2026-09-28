const fs = require("fs");
const path = require("path");
const ui = require("../ui");

function findSpecDir(root, featureName) {
  const possiblePaths = [
    path.join(root, "01-spec-management", "sdd", "specs", featureName),
    path.join(root, ".sdd", "specs", featureName),
    path.join(root, "specs", featureName),
    path.join(root, "01-spec-management", "sdd", "specs", `feat-${featureName}`),
    path.join(root, ".sdd", "specs", `feat-${featureName}`),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return path.join(root, "01-spec-management", "sdd", "specs", featureName);
}

async function runImplement(featureName, options = {}) {
  const root = path.resolve(options.cwd || process.cwd());

  if (!featureName) {
    ui.error("Vui lòng cung cấp tên spec. Ví dụ: specify implement create-order");
    process.exit(1);
  }

  const specDir = findSpecDir(root, featureName);
  const tasksFile = path.join(specDir, "TASKS.md");

  if (!fs.existsSync(tasksFile)) {
    ui.error(`Không tìm thấy TASKS.md tại ${path.relative(root, specDir)}. Hãy chạy 'specify tasks ${featureName}' trước.`);
    process.exit(1);
  }

  const tasksContent = fs.readFileSync(tasksFile, "utf8");
  const taskLines = tasksContent.split("\n");

  const pendingTasks = [];
  const completedTasks = [];

  for (const line of taskLines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("- [ ]")) {
      pendingTasks.push(trimmed.replace("- [ ]", "").trim());
    } else if (trimmed.startsWith("- [x]")) {
      completedTasks.push(trimmed.replace("- [x]", "").trim());
    }
  }

  ui.printBanner();
  console.log(ui.pc.bold(ui.pc.cyan(`🚀 BẮT ĐẦU THỰC THI SPEC: ${path.basename(specDir)}\n`)));

  const total = pendingTasks.length + completedTasks.length;
  const progress = total > 0 ? Math.round((completedTasks.length / total) * 100) : 0;

  ui.box(`TIẾN ĐỘ THỰC THI: ${progress}% (${completedTasks.length}/${total} Tasks)`, [
    `Spec Name      : ${path.basename(specDir)}`,
    `Đã hoàn thành  : 🟢 ${completedTasks.length} tasks`,
    `Còn lại        : 🟡 ${pendingTasks.length} tasks`,
    `Nhiệm vụ kế tiếp: ${pendingTasks[0] ? ui.pc.bold(ui.pc.yellow(pendingTasks[0].slice(0, 60))) : "TẤT CẢ ĐÃ XONG 🎉"}`,
  ]);

  if (pendingTasks.length > 0) {
    console.log("\n" + ui.pc.bold(ui.pc.green("👉 HƯỚNG DẪN THỰC THI DÀNH CHO AI AGENT / DEV:")));
    console.log(`  1. Thực hiện task: ${ui.pc.yellow(pendingTasks[0])}`);
    console.log(`  2. Tuân thủ DTO Pattern: Viết Request/Response DTO trước, tuyệt đối không trả Entity.`);
    console.log(`  3. Đặt @Transactional tại Service Layer; Repository dùng Parameterized Query.`);
    console.log(`  4. Viết Unit Test và Integration Test đạt độ phủ >= 80%.`);
    console.log(`  5. Sau khi code xong, đánh dấu [x] vào TASKS.md và chạy 'specify check'.\n`);
  } else {
    console.log("\n" + ui.pc.bold(ui.pc.green("🎉 Chúc mừng! Mọi task đã hoàn tất.")));
    console.log(`  • Chạy kiểm định: ${ui.pc.yellow("specify validate")}`);
    console.log(`  • Tạo PR description: ${ui.pc.yellow(`specify pr ${path.basename(specDir)}`)}\n`);
  }
}

module.exports = {
  runImplement,
};
