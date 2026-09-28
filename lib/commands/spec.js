const fs = require("fs");
const path = require("path");
const ui = require("../ui");
const { ensureDir } = require("../utils/file-system");
const {
  generateSpecMd,
  generatePlanMd,
  generateTasksMd,
  generateChangelogMd,
} = require("../templates/spec-bundle");

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

function updateIndex(indexPath, specSlug, title) {
  let content = "";
  if (fs.existsSync(indexPath)) {
    content = fs.readFileSync(indexPath, "utf8");
  } else {
    content = `# Danh Mục Specs Quản Trị Hệ Thống (_INDEX.md)\n\n| Mã Spec | Tên Tính Năng | Bounded Context | Trạng Thái | Lead Phê Duyệt | Ngày Cập Nhật |\n|---|---|---|---|---|---|\n`;
  }

  const date = new Date().toISOString().split("T")[0];
  const line = `| [\`${specSlug}\`](./${specSlug}/SPEC.md) | ${title} | Microservice | 🟡 \`DRAFT\` | Tech Lead | ${date} |`;

  if (!content.includes(specSlug)) {
    content = content.trimEnd() + "\n" + line + "\n";
    fs.writeFileSync(indexPath, content, "utf8");
  }
}

async function runCreateSpec(featureName, options = {}) {
  const root = path.resolve(options.cwd || process.cwd());

  if (!featureName) {
    ui.error("Vui lòng cung cấp tên tính năng. Ví dụ: backspec spec create-order");
    process.exit(1);
  }

  const specSlug = featureName.startsWith("feat-") || featureName.startsWith("fix-")
    ? slugify(featureName)
    : `feat-${slugify(featureName)}`;

  const sddSpecDirs = [
    path.join(root, "01-spec-management", "sdd", "specs", specSlug),
    path.join(root, ".sdd", "specs", specSlug),
  ];

  const primaryDir = sddSpecDirs[0];
  ensureDir(primaryDir);
  ensureDir(sddSpecDirs[1]);

  const author = options.author || process.env.USER || process.env.USERNAME || "Backend Engineer";
  const serviceName = options.service || path.basename(root);

  const specMd = generateSpecMd(featureName, { author, serviceName });
  const planMd = generatePlanMd(featureName, { author, serviceName });
  const tasksMd = generateTasksMd(featureName, { author, serviceName });
  const changelogMd = generateChangelogMd(featureName, { author, serviceName });

  for (const dir of sddSpecDirs) {
    ensureDir(dir);
    fs.writeFileSync(path.join(dir, "SPEC.md"), specMd, "utf8");
    fs.writeFileSync(path.join(dir, "PLAN.md"), planMd, "utf8");
    fs.writeFileSync(path.join(dir, "TASKS.md"), tasksMd, "utf8");
    fs.writeFileSync(path.join(dir, "CHANGELOG.md"), changelogMd, "utf8");

    const parentIndex = path.join(path.dirname(dir), "_INDEX.md");
    updateIndex(parentIndex, specSlug, featureName);
  }

  ui.success(`Đã khởi tạo gói đặc tả kỹ thuật SDD thành công: ${ui.pc.cyan(specSlug)}`);
  console.log("");
  ui.box("📁 SDD SPEC ARTIFACTS", [
    `• SPEC.md      : ${path.relative(root, path.join(primaryDir, "SPEC.md"))}`,
    `• PLAN.md      : ${path.relative(root, path.join(primaryDir, "PLAN.md"))}`,
    `• TASKS.md     : ${path.relative(root, path.join(primaryDir, "TASKS.md"))}`,
    `• CHANGELOG.md : ${path.relative(root, path.join(primaryDir, "CHANGELOG.md"))}`,
  ]);

  console.log("\n" + ui.pc.bold(ui.pc.green("🚀 Bước tiếp theo cho AI Agent / Kỹ sư:")));
  console.log(`  1. Mở ${ui.pc.cyan("SPEC.md")} để điều chỉnh DTO và Business Rules.`);
  console.log(`  2. Chạy lệnh Agent: ${ui.pc.yellow("/analyze-feature")} để nạp context.`);
  console.log(`  3. Chạy lệnh Agent: ${ui.pc.yellow("/implement-feature")} để thực thi từng task trong TASKS.md.`);
}

module.exports = {
  runCreateSpec,
};
