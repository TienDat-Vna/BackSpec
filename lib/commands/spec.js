const fs = require("fs");
const path = require("path");
const ui = require("../ui");
const { ensureDir } = require("../utils/file-system");
const { ingestInput } = require("../utils/doc-extractor");
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

  const specDir = path.join(root, ".sdd", "specs", specSlug);
  ensureDir(specDir);

  const author = options.author || process.env.USER || process.env.USERNAME || "Backend Engineer";
  const serviceName = options.service || path.basename(root);

  let docxAppendContent = "";
  let ingestionSummary = "";

  // Xử lý nạp tài liệu từ file docx / ảnh nếu có cờ --from
  if (options.from) {
    const fromPath = path.resolve(root, options.from);
    ui.info(`Đang nạp và phân tích tài liệu đầu vào từ: ${ui.pc.cyan(fromPath)}`);
    try {
      const ingested = await ingestInput(fromPath);
      ingestionSummary = ingested.summary;
      if (ingested.combinedMarkdown) {
        docxAppendContent = `\n\n---\n\n## 5. NGUỒN TÀI LIỆU ĐẦU VÀO ĐƯỢC TRÍCH XUẤT (INGESTED CONTEXT)\n> **Nguồn trích xuất:** \`${options.from}\`  \n> **Tổng quan:** ${ingested.summary}\n\n${ingested.combinedMarkdown}\n`;
      }
      ui.success(ingested.summary);
    } catch (err) {
      ui.warn(`Không thể nạp tài liệu từ '${options.from}': ${err.message}. Tiếp tục với template mặc định.`);
    }
  }

  let specMd = generateSpecMd(featureName, { author, serviceName });
  if (docxAppendContent) {
    specMd += docxAppendContent;
  }

  const planMd = generatePlanMd(featureName, { author, serviceName });
  const tasksMd = generateTasksMd(featureName, { author, serviceName });
  const changelogMd = generateChangelogMd(featureName, { author, serviceName });

  fs.writeFileSync(path.join(specDir, "SPEC.md"), specMd, "utf8");
  fs.writeFileSync(path.join(specDir, "PLAN.md"), planMd, "utf8");
  fs.writeFileSync(path.join(specDir, "TASKS.md"), tasksMd, "utf8");
  fs.writeFileSync(path.join(specDir, "CHANGELOG.md"), changelogMd, "utf8");

  const parentIndex = path.join(path.dirname(specDir), "_INDEX.md");
  updateIndex(parentIndex, specSlug, featureName);

  ui.success(`Đã khởi tạo gói đặc tả kỹ thuật SDD thành công: ${ui.pc.cyan(specSlug)}`);
  console.log("");
  ui.box("📁 SDD SPEC ARTIFACTS", [
    `• SPEC.md      : ${path.relative(root, path.join(specDir, "SPEC.md"))}`,
    `• PLAN.md      : ${path.relative(root, path.join(specDir, "PLAN.md"))}`,
    `• TASKS.md     : ${path.relative(root, path.join(specDir, "TASKS.md"))}`,
    `• CHANGELOG.md : ${path.relative(root, path.join(specDir, "CHANGELOG.md"))}`,
    ingestionSummary ? `• Ingested     : ${ingestionSummary}` : `• Mode         : Clean Template`,
  ]);

  console.log("\n" + ui.pc.bold(ui.pc.green("🚀 Bước tiếp theo cho AI Agent / Kỹ sư:")));
  console.log(`  1. Chạy đối soát chéo: ${ui.pc.yellow("specify audit " + specSlug)} (Kiểm tra thiếu/thừa với tài liệu & code)`);
  console.log(`  2. Thiết kế chi tiết : ${ui.pc.yellow("specify plan " + specSlug)}`);
  console.log(`  3. Bắt đầu code     : ${ui.pc.yellow("specify implement " + specSlug)}\n`);
}

module.exports = {
  runCreateSpec,
};
