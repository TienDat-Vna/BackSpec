const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const ui = require("../ui");
const { ensureDir, writeGeneratedFile } = require("../utils/file-system");

function hash(content) {
  return crypto.createHash("sha256").update(content, "utf8").digest("hex");
}

function readManifest(filePath) {
  if (!fs.existsSync(filePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(`Invalid BackSpec manifest ${filePath}: ${error.message}`);
  }
}

function parseRuleFrontmatter(content, relativePath) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) throw new Error(`${relativePath}: Thiếu YAML frontmatter`);
  const values = {};
  for (const line of match[1].split(/\r?\n/)) {
    const index = line.indexOf(":");
    if (index > 0) values[line.slice(0, index).trim()] = line.slice(index + 1).trim();
  }
  return { values, body: content.slice(match[0].length), fullHeader: match[0] };
}

function parseSkillFrontmatter(content, relativePath) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) throw new Error(`${relativePath}: Thiếu YAML frontmatter`);
  const values = {};
  for (const line of match[1].split(/\r?\n/)) {
    const index = line.indexOf(":");
    if (index > 0) values[line.slice(0, index).trim()] = line.slice(index + 1).trim();
  }
  if (!values.name || !values.description) {
    throw new Error(`${relativePath}: Frontmatter cần có 'name' và 'description'`);
  }
  return { values, body: content.slice(match[0].length), fullHeader: match[0] };
}

function syncRules(root, options = {}) {
  const toolSourceRoot = path.resolve(__dirname, "..", "..");
  const possibleRulesDirs = [
    path.join(root, ".sdd", "rules"),
    path.join(root, "registry", "rules"),
    path.join(toolSourceRoot, "registry", "rules"),
    path.join(toolSourceRoot, ".sdd", "rules"),
  ];

  let rulesDir = possibleRulesDirs.find((d) => fs.existsSync(d));
  const agentsMdPath = path.join(root, "AGENTS.md");
  const manifestPath = path.join(root, ".sdd", ".manifest.json");

  if (!rulesDir) {
    ui.warn(`Không tìm thấy thư mục rules.`);
    return { count: 0, changed: 0 };
  }

  const ruleFiles = fs
    .readdirSync(rulesDir)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .sort();

  if (ruleFiles.length === 0) {
    ui.warn("Không tìm thấy file rule nào trong " + rulesDir);
    return { count: 0, changed: 0 };
  }

  const generatedSections = [];
  const manifestRules = {};

  for (const file of ruleFiles) {
    const filePath = path.join(rulesDir, file);
    const content = fs.readFileSync(filePath, "utf8");
    const relative = path.relative(root, filePath).replace(/\\/g, "/");

    parseRuleFrontmatter(content, relative);

    generatedSections.push([
      `<!-- GENERATED FROM ${relative} — DO NOT EDIT DIRECTLY -->`,
      "",
      content.trim(),
      "",
      "---",
      "",
    ].join("\n"));

    manifestRules[relative] = hash(content);
  }

  const generatedBlock = [
    "<!-- BEGIN GENERATED RULES — DO NOT EDIT BELOW THIS LINE -->",
    ...generatedSections,
    "<!-- END GENERATED RULES -->",
  ].join("\n");

  let changed = 0;
  if (fs.existsSync(agentsMdPath)) {
    let agentsContent = fs.readFileSync(agentsMdPath, "utf8");
    const beginMarker = "<!-- BEGIN GENERATED RULES — DO NOT EDIT BELOW THIS LINE -->";
    const endMarker = "<!-- END GENERATED RULES -->";

    const beginIdx = agentsContent.indexOf(beginMarker);
    const endIdx = agentsContent.indexOf(endMarker);

    if (beginIdx !== -1 && endIdx !== -1) {
      agentsContent = agentsContent.slice(0, beginIdx) + generatedBlock + agentsContent.slice(endIdx + endMarker.length);
    } else {
      agentsContent = agentsContent.trimEnd() + "\n\n" + generatedBlock + "\n";
    }

    const currentContent = fs.readFileSync(agentsMdPath, "utf8");
    if (currentContent !== agentsContent) changed++;
    if (!options.dryRun && !options.check && changed > 0) {
      writeGeneratedFile(agentsMdPath, agentsContent, { overwrite: true });
      ensureDir(path.dirname(manifestPath));
      const currentManifest = readManifest(manifestPath);
      currentManifest.rules = manifestRules;
      currentManifest.updated_at = new Date().toISOString();
      writeGeneratedFile(manifestPath, JSON.stringify(currentManifest, null, 2), { overwrite: true, backup: false });
    }
  }

  const action = options.check ? "Đã kiểm tra" : "Đã đồng bộ";
  ui.success(`${action} ${ruleFiles.length} rules; drift: ${changed} file(s).`);
  return { count: ruleFiles.length, changed };
}

function syncSkills(root, options = {}) {
  const toolSourceRoot = path.resolve(__dirname, "..", "..");
  
  const skillsDir = fs.existsSync(path.join(root, "registry", "skills"))
    ? path.join(root, "registry", "skills")
    : path.join(toolSourceRoot, "registry", "skills");

  const engineTargets = [
    { ids: ["antigravity", "gemini"], root: path.join(root, ".agents", "skills"), label: "Antigravity / Gemini" },
    { ids: ["claude"], root: path.join(root, ".claude", "skills"), label: "Claude Code" },
    { ids: ["copilot"], root: path.join(root, ".github", "skills"), label: "GitHub Copilot" },
    { ids: ["cursor"], root: path.join(root, ".cursor", "skills"), label: "Cursor" },
    { ids: ["windsurf"], root: path.join(root, ".windsurf", "skills"), label: "Windsurf" },
  ];
  const existingEngines = engineTargets
    .filter((target) => fs.existsSync(target.root))
    .map((target) => target.ids[0]);
  const defaultEngine = options.check && existingEngines.length > 0 ? existingEngines : ["all"];
  const requestedEngines = options.ai
    ? (Array.isArray(options.ai) ? options.ai : [options.ai.toLowerCase()])
    : defaultEngine;
  const targets = [];
  for (const target of engineTargets) {
    if (requestedEngines.includes("all") || target.ids.some((id) => requestedEngines.includes(id))) targets.push(target);
  }

  if (targets.length === 0) throw new Error(`AI engine không được hỗ trợ: ${requestedEngines.join(", ")}`);

  const manifestPath = path.join(root, ".sdd", ".manifest.json");
  const discoveredSkills = [];

  if (fs.existsSync(skillsDir)) {
    const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const skillFile = path.join(skillsDir, entry.name, "SKILL.md");
        if (fs.existsSync(skillFile)) {
          discoveredSkills.push({
            name: entry.name,
            category: "registry",
            path: skillFile,
          });
        }
      }
    }
  }

  if (discoveredSkills.length === 0) {
    ui.warn("Không tìm thấy skill nào trong registry/skills.");
    return { count: 0 };
  }

  const manifestSkills = {};
  let changed = 0;

  for (const skill of discoveredSkills) {
    const source = fs.readFileSync(skill.path, "utf8");
    const parsed = parseSkillFrontmatter(source, path.relative(root, skill.path));

    for (const target of targets) {
      const output = [
        parsed.fullHeader.trim(),
        "",
        `<!-- GENERATED FROM registry/skills/${parsed.values.name}/SKILL.md — DO NOT EDIT DIRECTLY -->`,
        "",
        parsed.body.trimStart(),
      ].join("\n");

      const targetDir = path.join(target.root, skill.name);
      const outputPath = path.join(targetDir, "SKILL.md");

      const current = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, "utf8") : null;
      if (current !== output) changed++;

      if (!options.dryRun && !options.check && current !== output) {
        ensureDir(targetDir);
        writeGeneratedFile(outputPath, output, { overwrite: true, backup: false });
      }

      const relative = path.relative(root, outputPath).replace(/\\/g, "/");
      const relativeSource = path.relative(root, skill.path).replace(/\\/g, "/");
      manifestSkills[relative] = {
        source: relativeSource,
        category: "registry",
        checksum: hash(output),
      };
    }
  }

  if (!options.dryRun && !options.check && changed > 0) {
    ensureDir(path.dirname(manifestPath));
    const currentManifest = readManifest(manifestPath);
    currentManifest.skills = manifestSkills;
    currentManifest.updated_at = new Date().toISOString();
    writeGeneratedFile(manifestPath, JSON.stringify(currentManifest, null, 2), { overwrite: true, backup: false });
  }

  const action = options.check ? "Đã kiểm tra" : "Đã đồng bộ";
  ui.success(`${action} ${discoveredSkills.length} skills tại ${targets.map((t) => t.label).join(", ")}; drift: ${changed} file(s).`);
  return { count: discoveredSkills.length, changed };
}

async function runSync(options = {}) {
  const root = path.resolve(options.cwd || process.cwd());
  ui.info(`Đang chạy đồng bộ BackSpec tại: ${root}`);

  const result = { rules: null, skills: null, changed: 0 };
  if (!options.skillsOnly) result.rules = syncRules(root, options);
  if (!options.rulesOnly) result.skills = syncSkills(root, options);
  result.changed = (result.rules?.changed || 0) + (result.skills?.changed || 0);
  if (options.check && result.changed > 0) {
    ui.error(`Phát hiện ${result.changed} artifact(s) chưa đồng bộ.`);
    if (options.exitOnDrift !== false) process.exitCode = 1;
  }
  return result;
}

module.exports = {
  runSync,
  syncRules,
  syncSkills,
};
