const path = require("path");
const ui = require("../ui");
const { inspectProject } = require("../utils/project-health");

function renderValidation(snapshot) {
  for (const item of snapshot.passed) ui.success(`[${item.id}] ${item.evidence}`);
  for (const item of snapshot.warnings) ui.warn(`[${item.id}] ${item.evidence}`);
  for (const item of snapshot.blockers) ui.error(`[${item.id}] ${item.evidence}. ${item.remediation}`);
}

async function runValidate(options = {}) {
  const root = path.resolve(options.cwd || process.cwd());
  const snapshot = inspectProject(root);

  if (!options.silent) {
    ui.printBanner();
    ui.info(`Kiểm định Project Layout v2 tại: ${ui.pc.cyan(root)}\n`);
    renderValidation(snapshot);
    console.log("");
    ui.box("KẾT QUẢ KIỂM ĐỊNH TÍNH TOÀN VẸN", [
      `• Project mode : ${snapshot.layout.mode}`,
      `• Skills       : ${snapshot.skills}`,
      `• Rules        : ${snapshot.rules}`,
      `• Errors       : ${snapshot.blockers.length}`,
      `• Warnings     : ${snapshot.warnings.length}`,
      `• Verdict      : ${snapshot.blockers.length === 0 ? ui.pc.green("VALID") : ui.pc.red("INVALID")}`,
    ]);
  }

  if (snapshot.blockers.length > 0 && options.exitOnError !== false) process.exitCode = 1;
  return snapshot;
}

module.exports = {
  runValidate,
};
