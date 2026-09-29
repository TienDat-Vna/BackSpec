const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const ui = require("../ui");
const { ensureDir } = require("../utils/file-system");

function hash(content) {
  return crypto.createHash("sha256").update(content, "utf8").digest("hex");
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

    if (!options.dryRun && !options.check) {
      fs.writeFileSync(agentsMdPath, agentsContent, "utf8");
      ensureDir(path.dirname(manifestPath));
      let currentManifest = {};
      if (fs.existsSync(manifestPath)) {
        try { currentManifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")); } catch (e) {}
      }
      currentManifest.rules = manifestRules;
      currentManifest.updated_at = new Date().toISOString();
      fs.writeFileSync(manifestPath, JSON.stringify(currentManifest, null, 2), "utf8");
    }
  }

  ui.success(`Đã đồng bộ ${ruleFiles.length} rules vào AGENTS.md và .sdd/.manifest.json.`);
  return { count: ruleFiles.length, changed: 0 };
}

function syncSkills(root, options = {}) {
  const toolSourceRoot = path.resolve(__dirname, "..", "..");
  
  const skillsDir = fs.existsSync(path.join(root, "registry", "skills"))
    ? path.join(root, "registry", "skills")
    : path.join(toolSourceRoot, "registry", "skills");

  const aiEngine = (options.ai || "all").toLowerCase();
  const targets = [];

  if (["all", "antigravity", "gemini"].includes(aiEngine)) {
    targets.push({ root: path.join(root, ".agents", "skills"), label: "Antigravity / Gemini" });
  }
  if (["all", "claude"].includes(aiEngine)) {
    targets.push({ root: path.join(root, ".claude", "skills"), label: "Claude Code" });
  }

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

      if (!options.dryRun && !options.check) {
        ensureDir(targetDir);
        fs.writeFileSync(outputPath, output, "utf8");
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

  if (!options.dryRun && !options.check) {
    ensureDir(path.dirname(manifestPath));
    let currentManifest = {};
    if (fs.existsSync(manifestPath)) {
      try { currentManifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")); } catch (e) {}
    }
    currentManifest.skills = manifestSkills;
    currentManifest.updated_at = new Date().toISOString();
    fs.writeFileSync(manifestPath, JSON.stringify(currentManifest, null, 2), "utf8");
  }

  ui.success(`Đã đồng bộ ${discoveredSkills.length} skills sang: ${targets.map((t) => t.label).join(", ")}`);
  return { count: discoveredSkills.length };
}

async function runSync(options = {}) {
  const root = path.resolve(options.cwd || process.cwd());
  ui.info(`Đang chạy đồng bộ BackSpec tại: ${root}`);

  if (!options.skillsOnly) {
    syncRules(root, options);
  }
  if (!options.rulesOnly) {
    syncSkills(root, options);
  }
}

module.exports = {
  runSync,
  syncRules,
  syncSkills,
};
