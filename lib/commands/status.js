const fs = require("fs");
const path = require("path");
const ui = require("../ui");
const { detectProjectStack } = require("../utils/detector");
const { inspectProject } = require("../utils/project-health");

function readSpecStatus(specPath) {
  const specFile = path.join(specPath, "SPEC.md");
  if (!fs.existsSync(specFile)) return "DRAFT";
  const content = fs.readFileSync(specFile, "utf8");
  const status = content.match(/\*\*Status:\*\*\s*([^|\r\n]+)/i)?.[1]?.trim().toUpperCase() || "DRAFT";
  if (/RELEASED|VERIFIED|COMPLETED|READY/.test(status)) return "READY";
  if (/IN_PROGRESS|IN PROGRESS|APPROVED/.test(status)) return "IN_PROGRESS";
  return "DRAFT";
}

function summarizeSpecs(specs) {
  const summary = { total: specs.length, ready: 0, inProgress: 0, draft: 0 };
  for (const spec of specs) {
    const status = readSpecStatus(spec.path);
    if (status === "READY") summary.ready++;
    else if (status === "IN_PROGRESS") summary.inProgress++;
    else summary.draft++;
  }
  return summary;
}

async function runStatus(options = {}) {
  const root = path.resolve(options.cwd || process.cwd());
  const stack = detectProjectStack(root);
  const snapshot = inspectProject(root);
  const specs = summarizeSpecs(snapshot.specs);
  const humanAuthority = fs.existsSync(snapshot.layout.overrideLogPath) ? "USED (audit log present)" : "AVAILABLE";

  if (!options.silent) {
    ui.printBanner();
    ui.box("🏛️ BACKSPEC GOVERNANCE DASHBOARD", [
      `Project Name     : ${ui.pc.bold(ui.pc.cyan(stack.name))}`,
      `Project Mode     : ${snapshot.layout.mode}`,
      `Service Stack    : ${ui.pc.green(stack.frameworks.join(", ") || stack.languages.join(", ") || "General")}`,
      `SDD Health       : ${snapshot.score}% (${snapshot.readiness})`,
      `SDD Specs        : ${specs.total} (🟢 ${specs.ready} Ready, 🔵 ${specs.inProgress} In Progress, 🟡 ${specs.draft} Draft)`,
      `Skills Ready     : ${snapshot.skills} discovered`,
      `Governance Rules : ${snapshot.rules} discovered`,
      `Strict Guard     : ${snapshot.layout.guard.state} (${snapshot.layout.guard.evidence})`,
      `Human Authority  : ${humanAuthority}`,
    ]);
  }

  return { snapshot, stack, specCounts: specs, humanAuthority };
}

module.exports = {
  runStatus,
  summarizeSpecs,
};
