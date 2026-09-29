const fs = require("fs");
const path = require("path");
const ui = require("../ui");
const { auditSpec } = require("../utils/auditor");

function findSpecDir(root, featureName) {
  const possiblePaths = [
    path.join(root, ".sdd", "specs", featureName),
    path.join(root, ".sdd", "specs", `feat-${featureName}`),
    path.join(root, ".sdd", "specs", `fix-${featureName}`),
    path.join(root, "01-spec-management", "sdd", "specs", featureName),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return path.join(root, ".sdd", "specs", featureName);
}

async function runAudit(featureName, options = {}) {
  const root = path.resolve(options.cwd || process.cwd());

  if (!featureName) {
    ui.error("Vui lòng cung cấp tên tính năng cần audit. Ví dụ: backspec audit create-order");
    process.exit(1);
  }

  const specDir = findSpecDir(root, featureName);
  if (!fs.existsSync(specDir)) {
    ui.error(`Không tìm thấy thư mục spec cho: '${featureName}' tại: ${specDir}`);
    process.exit(1);
  }

  ui.printBanner();
  ui.info(`Bắt đầu chạy đối soát chéo 2 chiều (Cross-Audit) cho: ${ui.pc.cyan(path.basename(specDir))}\n`);

  try {
    const result = await auditSpec(root, specDir, options);

    console.log(ui.pc.bold(ui.pc.cyan("🔍 KẾT QUẢ ĐỐI SOÁT CHÉO TOÀN DIỆN:")));
    ui.table(
      ["Hạng mục kiểm tra", "Đánh giá", "Chi tiết"],
      result.checks.map((c) => [c.item, c.status, c.detail])
    );

    if (result.warnings.length > 0) {
      console.log("\n" + ui.pc.bold(ui.pc.yellow("⚠️ CẢNH BÁO CẦN LƯU Ý:")));
      for (const w of result.warnings) {
        ui.warn(`  • ${w}`);
      }
    }

    console.log("\n");
    const statusLabel = result.score >= 85 ? ui.pc.green("SẴN SÀNG LẬP TRÌNH (PASSED)") : ui.pc.yellow("CẦN BỔ SUNG YÊU CẦU");

    ui.box(`FIDELITY HEALTH SCORE: ${result.score}%`, [
      `Feature Name   : ${path.basename(specDir)}`,
      `Audit Status   : ${statusLabel}`,
      `Report File    : ${path.relative(root, result.reportPath)}`,
      `Next Action    : ${result.score >= 85 ? "Chạy 'specify implement " + path.basename(specDir) + "'" : "Xem chi tiết trong AUDIT_REPORT.md và bổ sung"}`,
    ]);

    if (options.strict && result.score < 85) {
      process.exit(1);
    }
  } catch (err) {
    ui.error(`Lỗi trong quá trình audit: ${err.message}`);
    process.exit(1);
  }
}

module.exports = {
  runAudit,
};
