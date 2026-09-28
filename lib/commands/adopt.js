const fs = require("fs");
const path = require("path");
const ui = require("../ui");
const { detectProjectStack } = require("../utils/detector");
const { runInit } = require("./init");
const { runDoctor } = require("./doctor");

async function runAdopt(targetDir, options = {}) {
  const root = path.resolve(targetDir || process.cwd());
  ui.printBanner();

  ui.info(`Bắt đầu quy trình Tiếp Nhận & Đồng Hóa (Adoption) tại: ${ui.pc.cyan(root)}\n`);

  const detected = detectProjectStack(root);

  console.log(ui.pc.bold(ui.pc.cyan("🔍 KẾT QUẢ KHẢO SÁT HỆ THỐNG HIỆN HỮU:")));
  ui.table(
    ["Thành phần", "Phát hiện hiện tại"],
    [
      ["Tên Service", detected.name],
      ["Ngôn ngữ", detected.languages.join(", ") || "Chưa rõ"],
      ["Framework", detected.frameworks.join(", ") || "Chưa rõ"],
      ["Build Tool", detected.buildTools.join(", ") || "Chưa rõ"],
      ["Database/ORM", detected.databases.join(", ") || "Chưa rõ"],
      ["Migration Engine", detected.migrationTools.join(", ") || "Chưa rõ"],
      ["Git Repository", detected.hasGit ? "Có (.git)" : "Chưa khởi tạo"],
    ]
  );

  console.log("\n" + ui.pc.bold(ui.pc.yellow("⚡ TIẾN HÀNH GHÉP KHUNG QUẢN TRỊ BACKSPEC SDD (NON-DESTRUCTIVE)...")));

  await runInit(root, {
    name: detected.name,
    stack: detected.frameworks[0] ? `${detected.languages[0]} / ${detected.frameworks[0]}` : undefined,
    database: detected.databases[0] || undefined,
    force: options.force,
  });

  console.log("\n" + ui.pc.bold(ui.pc.cyan("🩺 CHẠY KIỂM ĐỊNH SAU TIẾP NHẬN:")));
  await runDoctor({ cwd: root });
}

module.exports = {
  runAdopt,
};
