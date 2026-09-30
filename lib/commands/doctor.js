const path = require("path");
const ui = require("../ui");
const { detectProjectStack } = require("../utils/detector");
const { inspectProject } = require("../utils/project-health");

function readinessLabel(readiness) {
  if (readiness === "READY") return ui.pc.green("READY");
  if (readiness === "HEALTHY_WITH_WARNINGS") return ui.pc.yellow("HEALTHY WITH WARNINGS");
  return ui.pc.red("ACTION REQUIRED");
}

function renderChecks(snapshot) {
  for (const item of snapshot.checks) {
    const message = `[${item.id}] ${item.label} — ${item.evidence}`;
    if (item.status === "pass") ui.success(message);
    else if (item.status === "warn") ui.warn(message);
    else ui.error(`${message}. ${item.remediation}`);
  }
}

async function runDoctor(options = {}) {
  const root = path.resolve(options.cwd || process.cwd());
  const snapshot = inspectProject(root);
  const stack = detectProjectStack(root);

  if (!options.silent) {
    ui.printBanner();
    console.log(ui.pc.bold(`🔍 Chẩn đoán dự án: ${ui.pc.cyan(root)}\n`));
    ui.table(["Hạng mục", "Kết quả nhận diện"], [
      ["Chế độ", snapshot.layout.mode],
      ["Ngôn ngữ", stack.languages.join(", ") || "Chưa xác định"],
      ["Framework", stack.frameworks.join(", ") || "Chưa xác định"],
      ["Build Tool", stack.buildTools.join(", ") || "Chưa xác định"],
      ["AI Engines", stack.aiEngines.join(", ") || "Chưa cài integration"],
    ]);
    console.log("\n" + ui.pc.bold(ui.pc.cyan("🩺 EVIDENCE-BASED HEALTH CHECK:")));
    renderChecks(snapshot);
    console.log("");
    ui.box(`SDD HEALTH SCORE: ${snapshot.score}%`, [
      `• Passed   : ${snapshot.passed.length}`,
      `• Warnings : ${snapshot.warnings.length}`,
      `• Blockers : ${snapshot.blockers.length}`,
      `• Skills   : ${snapshot.skills}`,
      `• Readiness: ${readinessLabel(snapshot.readiness)}`,
    ]);
  }

  if (snapshot.blockers.length > 0 && options.exitOnError) process.exitCode = 1;
  return snapshot;
}

module.exports = {
  runDoctor,
};
