#!/usr/bin/env node

/**
 * 04-management/tools/sync-shared-skills.js
 * Synchronizes skills from the 4 strictly categorized folders:
 *   - 01-spec-management/skills/
 *   - 02-codestyle/skills/
 *   - 03-hooks/skills/
 *   - 04-management/skills/
 * to .claude/skills/ and .agents/skills/
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const root = path.resolve(__dirname, "..", "..");
const categories = [
  { name: "01-spec-management", dir: path.join(root, "01-spec-management", "skills") },
  { name: "02-codestyle", dir: path.join(root, "02-codestyle", "skills") },
  { name: "03-hooks", dir: path.join(root, "03-hooks", "skills") },
  { name: "04-management", dir: path.join(root, "04-management", "skills") },
];

const targets = [
  { root: path.join(root, ".claude", "skills") },
  { root: path.join(root, ".agents", "skills") },
  { root: path.join(root, ".shared", "skills") },
];
const manifestPath = path.join(root, ".shared", ".skill-sync-manifest.json");
const check = process.argv.includes("--check");
const dryRun = process.argv.includes("--dry-run");

function hash(content) {
  return crypto.createHash("sha256").update(content, "utf8").digest("hex");
}

function parseFrontmatter(content, relativePath) {
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

function adaptSkill(content, categoryName) {
  const parsed = parseFrontmatter(content, "skill adapter");
  return [
    parsed.fullHeader.trim(),
    "",
    `<!-- GENERATED FROM ${categoryName}/${parsed.values.name}/SKILL.md — DO NOT EDIT DIRECTLY -->`,
    "",
    parsed.body.trimStart(),
  ].join("\n");
}

function discoverSkills() {
  let results = [];
  for (const cat of categories) {
    if (!fs.existsSync(cat.dir)) continue;
    const entries = fs.readdirSync(cat.dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const skillFile = path.join(cat.dir, entry.name, "SKILL.md");
        if (fs.existsSync(skillFile)) {
          results.push({
            name: entry.name,
            category: cat.name,
            path: skillFile,
          });
        }
      }
    }
  }
  return results;
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function main() {
  console.log("[SKILLS-SYNC] Starting Backend Microservice 4-Folder Skills Synchronizer...");

  const skills = discoverSkills();
  if (skills.length === 0) {
    console.warn("[WARN] No skills found across 4 folders!");
    return;
  }

  const manifest = {};
  const categoryCounts = {};

  for (const skill of skills) {
    const source = fs.readFileSync(skill.path, "utf8");
    const parsed = parseFrontmatter(source, path.relative(root, skill.path));
    categoryCounts[skill.category] = (categoryCounts[skill.category] || 0) + 1;

    for (const target of targets) {
      const output = adaptSkill(source, skill.category);
      const targetDir = path.join(target.root, skill.name);
      const outputPath = path.join(targetDir, "SKILL.md");

      if (!dryRun && !check) {
        ensureDir(targetDir);
        fs.writeFileSync(outputPath, output, "utf8");
      }

      const relative = path.relative(root, outputPath).replace(/\\/g, "/");
      const relativeSource = path.relative(root, skill.path).replace(/\\/g, "/");
      manifest[relative] = { 
        source: relativeSource, 
        category: skill.category,
        checksum: hash(output) 
      };
    }
  }

  if (!dryRun && !check) {
    ensureDir(path.dirname(manifestPath));
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
  }

  console.log(`[SKILLS-SYNC] Synchronized ${skills.length} skills across 4 sections:`);
  Object.entries(categoryCounts).forEach(([cat, count]) => {
    console.log(`  - [${cat}]: ${count} skills`);
  });
}

main();
