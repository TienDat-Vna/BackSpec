const fs = require("fs");
const path = require("path");
const ui = require("../ui");
const { detectProjectStack } = require("../utils/detector");

async function runStatus(options = {}) {
  const root = path.resolve(options.cwd || process.cwd());
  ui.printBanner();

  const stack = detectProjectStack(root);

  // Count specs
  const specsDir = fs.existsSync(path.join(root, "01-spec-management", "sdd", "specs"))
    ? path.join(root, "01-spec-management", "sdd", "specs")
    : path.join(root, ".sdd", "specs");

  let specCounts = { draft: 0, inProgress: 0, completed: 0, total: 0 };
  if (fs.existsSync(specsDir)) {
    const entries = fs.readdirSync(specsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith("_")) {
        specCounts.total++;
        const specFile = path.join(specsDir, entry.name, "SPEC.md");
        if (fs.existsSync(specFile)) {
          const content = fs.readFileSync(specFile, "utf8");
          if (content.includes("Status: COMPLETED") || content.includes("🟢 READY")) {
            specCounts.completed++;
          } else if (content.includes("Status: IN_PROGRESS")) {
            specCounts.inProgress++;
          } else {
            specCounts.draft++;
          }
        }
      }
    }
  }

  // Count skills
  const categories = ["01-spec-management", "02-codestyle", "03-hooks", "04-management"];
  let totalSkills = 0;
  for (const cat of categories) {
    const sDir = path.join(root, cat, "skills");
    if (fs.existsSync(sDir)) {
      totalSkills += fs
        .readdirSync(sDir, { withFileTypes: true })
        .filter((d) => d.isDirectory() && fs.existsSync(path.join(sDir, d.name, "SKILL.md"))).length;
    }
  }

  ui.box("🏛️ BACKSPEC GOVERNANCE DASHBOARD", [
    `Project Name     : ${ui.pc.bold(ui.pc.cyan(stack.name))}`,
    `Service Stack    : ${ui.pc.green(stack.frameworks.join(", ") || stack.languages.join(", ") || "General Microservice")}`,
    `Database Engine  : ${stack.databases.join(", ") || "Configured via Env"}`,
    `SDD Specs Total  : ${ui.pc.bold(String(specCounts.total))} (🟢 ${specCounts.completed} Ready, 🔵 ${specCounts.inProgress} In Progress, 🟡 ${specCounts.draft} Draft)`,
    `Skills Ready     : ${ui.pc.bold(String(totalSkills))}/30 Skills across 4 Tiers`,
    `AI Agent Engines : ${stack.aiEngines.join(", ") || "Multi-Engine"}`,
    `Strict Guard     : ${ui.pc.green("ACTIVE (Zero-Tolerance Fail-Closed)")}`,
    `Human Authority  : ${ui.pc.yellow("ENABLED (/human-authority-override)")}`,
  ]);

  console.log("\n" + ui.pc.bold(ui.pc.cyan("⚡ QUICK ACTIONS:")));
  console.log(`  • Tạo spec tính năng mới   : ${ui.pc.yellow("backspec spec <feature-name>")}`);
  console.log(`  • Chẩn đoán sức khỏe hệ thống: ${ui.pc.yellow("backspec check")}`);
  console.log(`  • Xem danh sách skills      : ${ui.pc.yellow("backspec list skills")}`);
  console.log(`  • Đồng bộ toàn bộ rules    : ${ui.pc.yellow("backspec sync")}`);
  console.log(`  • Kiểm định chất lượng     : ${ui.pc.yellow("backspec validate")}\n`);
}

module.exports = {
  runStatus,
};
