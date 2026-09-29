#!/usr/bin/env node

/**
 * tests/validate-project.js
 * Validates integrity of Registry directories, 41 skills, rules, and required references.
 */

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
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

function validateRegistryFolders() {
  const requiredFolders = [
    "registry/skills",
    "registry/rules",
    "registry/dna",
    "registry/hooks",
    "docs",
    "tests",
    "bin",
    "lib",
  ];

  for (const folder of requiredFolders) {
    const fullPath = path.join(root, folder);
    if (!fs.existsSync(fullPath)) {
      errors.push(`Thiếu thư mục bắt buộc: ${folder}`);
    } else {
      info.push(`Đã xác thực thư mục: ${folder}`);
    }
  }
}

function validateSkills() {
  const skillDir = path.join(root, "registry", "skills");
  const skillFiles = walk(skillDir, (file) => path.basename(file) === "SKILL.md");

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

  info.push(`Đã kiểm tra ${skillFiles.length} skills trong registry/skills/.`);
}

function validateRequiredReferences() {
  const required = [
    "registry/dna/CONSTITUTION.md",
    "registry/dna/CLAUDE.md",
    "registry/dna/AGENTS.md",
    "registry/rules/api-design.md",
    "registry/hooks/block-dangerous-bash.sh",
    "docs/HUMAN_PROJECT_MAP.md",
    "bin/backspec.js",
    "lib/cli.js",
  ];
  for (const file of required) {
    if (!fs.existsSync(path.join(root, file))) errors.push(`Thiếu file bắt buộc: ${file}`);
  }
}

validateRegistryFolders();
validateSkills();
validateRequiredReferences();

warnings.forEach((message) => console.warn(`[WARN] ${message}`));
errors.forEach((message) => console.error(`[ERROR] ${message}`));
info.forEach((message) => console.log(`[INFO] ${message}`));
console.log(`[VALIDATE] ${errors.length} lỗi, ${warnings.length} cảnh báo, ${info.length} thông tin.`);
process.exit(errors.length ? 1 : 0);
