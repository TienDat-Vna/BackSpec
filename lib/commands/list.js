const fs = require("fs");
const path = require("path");
const ui = require("../ui");

function listSkills(root) {
  const skillsDir = fs.existsSync(path.join(root, "registry", "skills"))
    ? path.join(root, "registry", "skills")
    : path.join(root, ".agents", "skills");

  if (!fs.existsSync(skillsDir)) {
    ui.warn("Không tìm thấy thư mục skills.");
    return;
  }

  console.log(ui.pc.bold(ui.pc.cyan("\n🤖 DANH SÁCH 41 BACKEND MICROSERVICE SKILLS (REGISTRY):\n")));

  const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
  const rows = [];
  let total = 0;

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const skillFile = path.join(skillsDir, entry.name, "SKILL.md");
      if (fs.existsSync(skillFile)) {
        total++;
        const content = fs.readFileSync(skillFile, "utf8");
        const descMatch = content.match(/^description:\s*(.+)$/m);
        let desc = descMatch ? descMatch[1].trim() : "Không có mô tả";
        if (desc.length > 70) desc = desc.slice(0, 67) + "...";
        rows.push([`/${entry.name}`, desc]);
      }
    }
  }

  ui.table(["Lệnh Skill", "Mô tả chức năng"], rows);
  console.log("");
  ui.info(`Tổng cộng: ${total} skills sẵn sàng cho AI Agents.`);
}

function listRules(root) {
  const rulesDir = fs.existsSync(path.join(root, ".sdd", "rules"))
    ? path.join(root, ".sdd", "rules")
    : path.join(root, "registry", "rules");

  if (!fs.existsSync(rulesDir)) {
    ui.warn("Không tìm thấy thư mục rules.");
    return;
  }

  console.log(ui.pc.bold(ui.pc.cyan("\n📜 DANH SÁCH GOVERNANCE RULES:\n")));
  const ruleFiles = fs.readdirSync(rulesDir).filter((f) => f.endsWith(".md"));
  const rows = [];

  for (const file of ruleFiles) {
    const content = fs.readFileSync(path.join(rulesDir, file), "utf8");
    const titleMatch = content.match(/^title:\s*(.+)$/m);
    const scopeMatch = content.match(/^scope:\s*(.+)$/m);
    const severityMatch = content.match(/^severity:\s*(.+)$/m);

    rows.push([
      file,
      titleMatch ? titleMatch[1].trim() : file,
      scopeMatch ? scopeMatch[1].trim() : "all",
      severityMatch ? severityMatch[1].trim().toUpperCase() : "MUST",
    ]);
  }

  ui.table(["File", "Tiêu đề", "Phạm vi", "Mức độ"], rows);
}

function listSpecs(root) {
  const specsDir = path.join(root, ".sdd", "specs");

  if (!fs.existsSync(specsDir)) {
    ui.warn("Không tìm thấy thư mục SDD specs.");
    return;
  }

  console.log(ui.pc.bold(ui.pc.cyan("\n📋 DANH SÁCH SDD SPECS HIỆN CÓ:\n")));
  const entries = fs.readdirSync(specsDir, { withFileTypes: true });
  const rows = [];

  for (const entry of entries) {
    if (entry.isDirectory() && !entry.name.startsWith("_")) {
      const specFile = path.join(specsDir, entry.name, "SPEC.md");
      let status = "🟡 DRAFT";
      let title = entry.name;

      if (fs.existsSync(specFile)) {
        const content = fs.readFileSync(specFile, "utf8");
        const titleMatch = content.match(/^#\s*\[SPEC\]\s*(.+)$/m) || content.match(/^#\s*(.+)$/m);
        if (titleMatch) title = titleMatch[1].trim();
        if (content.includes("Status: COMPLETED") || content.includes("🟢 READY")) status = "🟢 READY";
        else if (content.includes("Status: IN_PROGRESS")) status = "🔵 IN PROGRESS";
      }

      rows.push([entry.name, title, status, `.sdd/specs/${entry.name}/`]);
    }
  }

  if (rows.length === 0) {
    ui.info("Chưa có spec nào được tạo. Dùng 'backspec spec <name>' để tạo spec đầu tiên.");
  } else {
    ui.table(["Mã Spec", "Tên tính năng", "Trạng thái", "Đường dẫn"], rows);
  }
}

async function runList(type, options = {}) {
  const root = path.resolve(options.cwd || process.cwd());
  const targetType = (type || "skills").toLowerCase();

  if (targetType === "rules") {
    listRules(root);
  } else if (targetType === "specs") {
    listSpecs(root);
  } else {
    listSkills(root);
  }
}

module.exports = {
  runList,
};
