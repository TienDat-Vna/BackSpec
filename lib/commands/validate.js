const fs = require("fs");
const path = require("path");
const ui = require("../ui");

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

async function runValidate(options = {}) {
  const root = path.resolve(options.cwd || process.cwd());
  ui.printBanner();
  ui.info(`Đang chạy kiểm định toàn vẹn 4 Phân Tầng BackSpec: ${ui.pc.cyan(root)}\n`);

  const errors = [];
  const warnings = [];
  const infoLogs = [];

  // 1. Validate 4 Folders
  const requiredFolders = ["01-spec-management", "02-codestyle", "03-hooks", "04-management"];
  for (const folder of requiredFolders) {
    const fullPath = path.join(root, folder);
    if (!fs.existsSync(fullPath)) {
      errors.push(`Thiếu thư mục phân loại bắt buộc: ${folder}`);
    } else {
      infoLogs.push(`Thư mục chuẩn: ${folder}`);
    }
  }

  // 2. Validate Skills
  let totalSkills = 0;
  for (const cat of requiredFolders) {
    const skillDir = path.join(root, cat, "skills");
    const skillFiles = walk(skillDir, (file) => path.basename(file) === "SKILL.md");
    totalSkills += skillFiles.length;

    for (const file of skillFiles) {
      const content = fs.readFileSync(file, "utf8");
      const relative = path.relative(root, file);
      const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (!match) {
        errors.push(`${relative}: thiếu YAML frontmatter`);
        continue;
      }
      const folder = path.basename(path.dirname(file));
      const name = match[1].match(/^name:\s*(.+)$/m)?.[1]?.trim();
      const description = match[1].match(/^description:\s*(.+)$/m)?.[1]?.trim();
      if (name !== folder) errors.push(`${relative}: name '${name}' không khớp '${folder}'`);
      if (!description) errors.push(`${relative}: thiếu description`);
    }
  }

  // 3. Validate Required References
  const requiredFiles = [
    "CONSTITUTION.md",
    "CLAUDE.md",
    "AGENTS.md",
    "01-spec-management/dna/CONSTITUTION.md",
    "01-spec-management/dna/CLAUDE.md",
    "01-spec-management/dna/AGENTS.md",
    "02-codestyle/rules/api-design.md",
    "03-hooks/scripts/block-dangerous-bash.sh",
    "04-management/HUMAN_PROJECT_MAP.md",
  ];

  for (const file of requiredFiles) {
    if (!fs.existsSync(path.join(root, file))) {
      errors.push(`Thiếu file bắt buộc: ${file}`);
    }
  }

  // Print Results
  for (const i of infoLogs) {
    ui.success(i);
  }
  for (const w of warnings) {
    ui.warn(w);
  }
  for (const e of errors) {
    ui.error(e);
  }

  console.log("\n");
  ui.box(
    `KẾT QUẢ KIỂM ĐỊNH TÍNH TOÀN VẸN`,
    [
      `• Tổng số Skills kiểm tra : ${totalSkills}/30`,
      `• Số Lỗi (Errors)        : ${errors.length}`,
      `• Cảnh báo (Warnings)    : ${warnings.length}`,
      `• Đánh giá               : ${
        errors.length === 0 ? ui.pc.green("HỆ THỐNG ĐẠT CHUẨN 100%") : ui.pc.red("VI PHẠM KIỂM ĐỊNH")
      }`,
    ]
  );

  if (errors.length > 0 && options.exitOnError !== false) {
    process.exit(1);
  }
}

module.exports = {
  runValidate,
};
