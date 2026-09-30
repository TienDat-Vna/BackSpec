const fs = require("fs");
const path = require("path");
const { listSpecs, resolveProjectLayout } = require("./project-layout");
const { scanProject } = require("../quality/scanner");

function check(id, label, status, evidence, remediation, weight = 1) {
  return { id, label, status, evidence, remediation, weight };
}

function validateSkill(skillFile) {
  const content = fs.readFileSync(skillFile, "utf8");
  const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatter) return "missing YAML frontmatter";
  const name = frontmatter[1].match(/^name:\s*(.+)$/m)?.[1]?.trim();
  const description = frontmatter[1].match(/^description:\s*(.+)$/m)?.[1]?.trim();
  const folder = path.basename(path.dirname(skillFile));
  if (!name || !description) return "frontmatter requires name and description";
  if (name !== folder) return `name '${name}' does not match folder '${folder}'`;
  return null;
}

function inspectManifest(layout) {
  if (!fs.existsSync(layout.manifestPath)) return { status: "missing", evidence: ".sdd/.manifest.json not found" };
  try {
    JSON.parse(fs.readFileSync(layout.manifestPath, "utf8"));
    return { status: "valid", evidence: path.relative(layout.root, layout.manifestPath) };
  } catch (error) {
    return { status: "invalid", evidence: `invalid JSON: ${error.message}` };
  }
}

function inspectGovernance(layout) {
  const checks = [];
  for (const file of layout.governanceFiles) {
    const exists = fs.existsSync(file.path);
    checks.push(check(`GOV.${file.name}`, `Governance file ${file.name}`, exists ? "pass" : "fail", path.relative(layout.root, file.path), `Run 'backspec init' to create ${file.name}`, 2));
    if (!exists) continue;
    const content = fs.readFileSync(file.path, "utf8");
    const placeholders = [...content.matchAll(/\{\{[A-Z_]+\}\}/g)].map((match) => match[0]);
    const placeholdersExpected = layout.toolkitSource && placeholders.length > 0;
    checks.push(check(
      `GOV.PLACEHOLDER.${file.name}`,
      `Resolved governance template ${file.name}`,
      placeholders.length === 0 || placeholdersExpected ? "pass" : "warn",
      placeholders.length === 0
        ? "No unresolved placeholders"
        : placeholdersExpected
          ? `Canonical toolkit template: ${[...new Set(placeholders)].join(", ")}`
          : [...new Set(placeholders)].join(", "),
      `Replace unresolved placeholders in ${file.name}`
    ));
  }
  return checks;
}

function inspectStructure(layout) {
  return [
    check("SDD.SPECS", "SDD specs directory", fs.existsSync(layout.specsDir) ? "pass" : "fail", path.relative(layout.root, layout.specsDir), "Run 'backspec init'", 2),
    check("SDD.INDEX", "SDD master index", fs.existsSync(layout.specIndex) ? "pass" : "fail", path.relative(layout.root, layout.specIndex), "Create .sdd/specs/_INDEX.md"),
    check("SDD.TEMPLATE", "SDD spec template", fs.existsSync(layout.specTemplate) ? "pass" : "fail", path.relative(layout.root, layout.specTemplate), "Restore the canonical spec template"),
    check("RULES.AVAILABLE", "Governance rules", layout.ruleFiles.length > 0 ? "pass" : "fail", `${layout.ruleFiles.length} rule(s) in ${path.relative(layout.root, layout.rulesDir)}`, "Run 'backspec init' or restore registry/rules", 2),
  ];
}

function inspectSkills(layout) {
  const errors = layout.skillFiles
    .map((file) => ({ file, error: validateSkill(file) }))
    .filter((item) => item.error);
  const skillDirectory = layout.skillsDir ? path.relative(layout.root, layout.skillsDir) : "none";
  return [
    check("SKILLS.AVAILABLE", "Agent skills", layout.skillFiles.length > 0 ? "pass" : "fail", `${layout.skillFiles.length} skill(s) in ${skillDirectory}`, "Run 'backspec sync --skills'", 2),
    check(
      "SKILLS.SCHEMA",
      "Skill frontmatter integrity",
      errors.length === 0 ? "pass" : "fail",
      errors.length === 0 ? `${layout.skillFiles.length} skill(s) valid` : errors.map((item) => `${path.relative(layout.root, item.file)}: ${item.error}`).join("; "),
      "Fix skill name/description/frontmatter",
      2
    ),
  ];
}

function inspectCapabilities(layout) {
  const manifest = inspectManifest(layout);
  const integrationReady = layout.toolkitSource || layout.engineSkillDirs.length > 0;
  const integrationEvidence = layout.toolkitSource
    ? "Toolkit registry source"
    : layout.engineSkillDirs.map((entry) => entry.name).join(", ");
  return [
    check("SYNC.MANIFEST", "Synchronization manifest", manifest.status === "valid" ? "pass" : manifest.status === "missing" ? "warn" : "fail", manifest.evidence, "Run 'backspec sync'"),
    check("AGENT.INTEGRATION", "AI engine integration", integrationReady ? "pass" : "fail", integrationEvidence, "Run 'backspec sync --skills --ai <engine>'", 2),
    check("GUARD.HOOKS", "BackSpec safety hooks", layout.guard.state === "ACTIVE" ? "pass" : "warn", `${layout.guard.state}: ${layout.guard.evidence}`, "Connect BackSpec safety scripts to the pre-commit hook"),
  ];
}

function inspectQuality(layout) {
  const result = scanProject(layout.root, { root: layout.root });
  const blocking = result.findings.filter((item) => ["critical", "high"].includes(item.severity));
  const status = blocking.length > 0 ? "fail" : result.findings.length > 0 ? "warn" : "pass";
  return check(
    "QUALITY.SCAN",
    "Agent code quality gate",
    status,
    `${result.filesScanned} file(s), ${result.summary.total} finding(s), ${blocking.length} blocker(s)`,
    "Run 'backspec quality . --strict' and fix reported findings",
    2
  );
}

function summarize(layout, checks) {
  const passed = checks.filter((item) => item.status === "pass");
  const warnings = checks.filter((item) => item.status === "warn");
  const blockers = checks.filter((item) => item.status === "fail");
  const totalWeight = checks.reduce((sum, item) => sum + item.weight, 0);
  const earnedWeight = checks.reduce((sum, item) => {
    if (item.status === "pass") return sum + item.weight;
    if (item.status === "warn") return sum + item.weight * 0.5;
    return sum;
  }, 0);
  return {
    layout, checks, passed, warnings, blockers,
    score: totalWeight === 0 ? 0 : Math.round((earnedWeight / totalWeight) * 100),
    skills: layout.skillFiles.length,
    rules: layout.ruleFiles.length,
    specs: listSpecs(layout),
    readiness: blockers.length > 0 ? "ACTION_REQUIRED" : warnings.length > 0 ? "HEALTHY_WITH_WARNINGS" : "READY",
  };
}

function inspectProject(targetRoot) {
  const layout = resolveProjectLayout(targetRoot);
  const checks = [
    ...inspectGovernance(layout),
    ...inspectStructure(layout),
    ...inspectSkills(layout),
    ...inspectCapabilities(layout),
    inspectQuality(layout),
  ];
  return summarize(layout, checks);
}

module.exports = {
  inspectProject,
  validateSkill,
};
