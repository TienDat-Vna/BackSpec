const fs = require("fs");
const path = require("path");
const ui = require("../ui");
const { ensureDir } = require("../utils/file-system");

async function runOverride(reason, options = {}) {
  const root = path.resolve(options.cwd || process.cwd());
  ui.printBanner();

  if (!reason) {
    ui.error("Vui lòng cung cấp lý do override. Ví dụ: backspec override \"Phê duyệt bỏ qua cache Redis do hotfix\"");
    process.exit(1);
  }

  const logDir = path.join(root, ".sdd");
  ensureDir(logDir);
  const logFile = path.join(logDir, "OVERRIDE_LOG.md");

  const timestamp = new Date().toISOString();
  const user = process.env.USER || process.env.USERNAME || "TechLead";

  const entry = `
### [OVERRIDE] ${timestamp}
- **Author:** ${user}
- **Scope:** ${options.scope || "Architecture / Guard"}
- **Lý do:** ${reason}
- **Trạng thái:** ✅ APPROVED (Human Authority Veto)
---
`;

  if (!fs.existsSync(logFile)) {
    fs.writeFileSync(
      logFile,
      `# HUMAN OVERRIDE AUDIT LOG\n\n> Nhật ký ghi nhận toàn bộ quyền override của con người vượt qua strict guard.\n\n`,
      "utf8"
    );
  }

  fs.appendFileSync(logFile, entry, "utf8");

  ui.success(`Đã ghi nhận quyền Human Override vào: ${path.relative(root, logFile)}`);
  ui.box("QUYỀN TỐI THƯỢNG CỦA CON NGƯỜI (HUMAN AUTHORITY)", [
    `Người phê duyệt: ${user}`,
    `Thời gian      : ${timestamp}`,
    `Lý do          : ${reason}`,
    `Hệ thống Guard : Bỏ qua cảnh báo cho phiên làm việc này`,
  ]);
}

module.exports = {
  runOverride,
};
