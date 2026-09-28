const fs = require("fs");
const path = require("path");
const ui = require("../ui");

function findSpecDir(root, featureName) {
  const possiblePaths = [
    path.join(root, "01-spec-management", "sdd", "specs", featureName),
    path.join(root, ".sdd", "specs", featureName),
    path.join(root, "specs", featureName),
    path.join(root, "01-spec-management", "sdd", "specs", `feat-${featureName}`),
    path.join(root, ".sdd", "specs", `feat-${featureName}`),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return path.join(root, "01-spec-management", "sdd", "specs", featureName);
}

async function runExport(featureName, options = {}) {
  const root = path.resolve(options.cwd || process.cwd());

  if (!featureName) {
    ui.error("Vui lòng cung cấp tên spec. Ví dụ: specify export create-order");
    process.exit(1);
  }

  const specDir = findSpecDir(root, featureName);
  const exportFile = path.join(specDir, `${path.basename(specDir)}-full-bundle.md`);

  const filesToBundle = ["SPEC.md", "PLAN.md", "TASKS.md", "CHANGELOG.md", "CHECKLIST.md", "CLARIFICATIONS.md"];
  const bundledSections = [];

  bundledSections.push(`# 📦 COMPLETE SPECIFICATION BUNDLE: ${path.basename(specDir)}\n\n> Exported on: ${new Date().toISOString()}\n\n---\n`);

  for (const f of filesToBundle) {
    const fPath = path.join(specDir, f);
    if (fs.existsSync(fPath)) {
      bundledSections.push(`## 📄 ${f}\n\n` + fs.readFileSync(fPath, "utf8").trim() + "\n\n---\n");
    }
  }

  fs.writeFileSync(exportFile, bundledSections.join("\n"), "utf8");

  ui.success(`Đã xuất toàn bộ gói đặc tả: ${ui.pc.cyan(path.relative(root, exportFile))}`);
  ui.box("📦 SPEC BUNDLE EXPORTED", [
    `Spec Name   : ${path.basename(specDir)}`,
    `Bundle File : ${path.relative(root, exportFile)}`,
    `Files Total : ${bundledSections.length - 1} artifacts included`,
  ]);
}

module.exports = {
  runExport,
};
