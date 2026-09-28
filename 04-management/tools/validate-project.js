#!/usr/bin/env node

/**
 * 04-management/tools/validate-project.js
 * Validates integrity of 4 categorized directories, skills, rules, and required references.
 */

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");
const errors = [];
const warnings = [];
const info = [];

function walk(directory, predicate, output = []) {
  if (!fs.existsSync(directory)) return output;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if ([".git", "node_modules", "dist", "build", "target", "vendor"].includes(entry.name)) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(fullPath, predicate, output);
    else if (predicate(fullPath)) output.push(fullPath);
  }
  return output;
}

function validate4Folders() {
  const requiredFolders = [
    "01-spec-management",
    "02-codestyle",
    "03-hooks",
    "04-management",
  ];

  for (const folder of requiredFolders) {
    const fullPath = path.join(root, folder);
    if (!fs.existsSync(fullPath)) {
      errors.push(`Thiếu thư mục phân loại bắt buộc: ${folder}`);
    } else {
      info.push(`Đã xác thực thư mục phân loại: ${folder}`);
    }
  }
}

function validateSkills() {
  const categories = [
    "01-spec-management",
    "02-codestyle",
    "03-hooks",
    "04-management",
  ];

  let totalSkills = 0;
  for (const cat of categories) {
    const skillDir = path.join(root, cat, "skills");
    const skillFiles = walk(skillDir, (file) => path.basename(file) === "SKILL.md");
    totalSkills += skillFiles.length;

    for (const file of skillFiles) {
      const content = fs.readFileSync(file, "utf8");
      const relative = path.relative(root, file);
      const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (!match) {
        errors.push(`${relative}: thiếu frontmatter`);
        continue;
      }
      const folder = path.basename(path.dirname(file));
      const name = match[1].match(/^name:\s*(.+)$/m)?.[1]?.trim();
      const description = match[1].match(/^description:\s*(.+)$/m)?.[1]?.trim();
      if (name !== folder) errors.push(`${relative}: name '${name}' không trùng '${folder}'`);
      if (!description) errors.push(`${relative}: thiếu description`);
    }
  }
  info.push(`Đã kiểm tra ${totalSkills} skills trên cả 4 phân tầng.`);
}

function validateRequiredReferences() {
  const required = [
    "01-spec-management/dna/CONSTITUTION.md",
    "01-spec-management/dna/CLAUDE.md",
    "01-spec-management/dna/AGENTS.md",
    "01-spec-management/sdd/README.md",
    "01-spec-management/sdd/specs/_INDEX.md",
    "01-spec-management/sdd/specs/_template.md",
    "02-codestyle/rules/api-design.md",
    "03-hooks/scripts/block-dangerous-bash.sh",
    "04-management/HUMAN_PROJECT_MAP.md",
  ];
  for (const file of required) {
    if (!fs.existsSync(path.join(root, file))) errors.push(`Thiếu file bắt buộc: ${file}`);
  }
}

validate4Folders();
validateSkills();
validateRequiredReferences();

warnings.forEach((message) => console.warn(`[WARN] ${message}`));
errors.forEach((message) => console.error(`[ERROR] ${message}`));
info.forEach((message) => console.log(`[INFO] ${message}`));
console.log(`[VALIDATE] ${errors.length} lỗi, ${warnings.length} cảnh báo, ${info.length} thông tin.`);
process.exit(errors.length ? 1 : 0);
