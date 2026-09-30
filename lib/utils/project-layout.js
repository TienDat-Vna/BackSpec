const fs = require("fs");
const path = require("path");

function isDirectory(target) {
  try {
    return fs.statSync(target).isDirectory();
  } catch {
    return false;
  }
}

function listFiles(directory, predicate = () => true) {
  if (!isDirectory(directory)) return [];
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && predicate(entry.name))
    .map((entry) => path.join(directory, entry.name));
}

function listSkillFiles(directory) {
  if (!isDirectory(directory)) return [];
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const skillFile = path.join(directory, entry.name, "SKILL.md");
    if (fs.existsSync(skillFile)) files.push(skillFile);
  }
  return files;
}

function detectGuardState(root) {
  const preCommit = path.join(root, ".husky", "pre-commit");
  if (!fs.existsSync(preCommit)) {
    return { state: "INACTIVE", evidence: ".husky/pre-commit not found" };
  }

  const content = fs.readFileSync(preCommit, "utf8");
  const safetyPatterns = ["backspec.js quality", "backspec.js sync --check"];
  const connected = safetyPatterns.filter((pattern) => content.includes(pattern));
  if (connected.length === safetyPatterns.length) {
    return { state: "ACTIVE", evidence: `.husky/pre-commit connects ${connected.join(", ")}` };
  }

  return {
    state: "PARTIAL",
    evidence: connected.length > 0 ? `Connected: ${connected.join(", ")}` : "Pre-commit exists without BackSpec safety hooks",
  };
}

function resolveProjectLayout(targetRoot) {
  const root = path.resolve(targetRoot || process.cwd());
  const registryRoot = path.join(root, "registry");
  const toolkitSource = isDirectory(path.join(registryRoot, "skills"));
  const engineSkillDirs = [
    { name: "Claude Code", path: path.join(root, ".claude", "skills") },
    { name: "Antigravity / Gemini", path: path.join(root, ".agents", "skills") },
    { name: "GitHub Copilot", path: path.join(root, ".github", "skills") },
    { name: "Cursor", path: path.join(root, ".cursor", "skills") },
    { name: "Windsurf", path: path.join(root, ".windsurf", "skills") },
  ].filter((entry) => isDirectory(entry.path));

  const canonicalSkillDir = toolkitSource
    ? path.join(registryRoot, "skills")
    : engineSkillDirs.find((entry) => listSkillFiles(entry.path).length > 0)?.path;
  const projectRules = path.join(root, ".sdd", "rules");
  const registryRules = path.join(registryRoot, "rules");
  const canonicalRulesDir = isDirectory(projectRules) ? projectRules : registryRules;
  const projectTemplate = path.join(root, ".sdd", "specs", "_template.md");
  const registryTemplate = path.join(registryRoot, "sdd-templates", "specs", "_template.md");

  return {
    root,
    mode: toolkitSource ? "toolkit-source" : "managed-project",
    toolkitSource,
    governanceFiles: ["CONSTITUTION.md", "CLAUDE.md", "AGENTS.md"].map((name) => ({
      name,
      path: path.join(root, name),
    })),
    specsDir: path.join(root, ".sdd", "specs"),
    specIndex: path.join(root, ".sdd", "specs", "_INDEX.md"),
    specTemplate: fs.existsSync(projectTemplate) ? projectTemplate : registryTemplate,
    rulesDir: canonicalRulesDir,
    ruleFiles: listFiles(canonicalRulesDir, (name) => name.endsWith(".md") && !name.startsWith("_")),
    skillsDir: canonicalSkillDir,
    skillFiles: canonicalSkillDir ? listSkillFiles(canonicalSkillDir) : [],
    engineSkillDirs,
    manifestPath: path.join(root, ".sdd", ".manifest.json"),
    guard: detectGuardState(root),
    overrideLogPath: path.join(root, ".sdd", "OVERRIDE_LOG.md"),
  };
}

function listSpecs(layout) {
  if (!isDirectory(layout.specsDir)) return [];
  return fs
    .readdirSync(layout.specsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("_"))
    .map((entry) => ({ name: entry.name, path: path.join(layout.specsDir, entry.name) }));
}

module.exports = {
  isDirectory,
  listFiles,
  listSkillFiles,
  listSpecs,
  resolveProjectLayout,
};
