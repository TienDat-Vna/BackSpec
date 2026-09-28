const fs = require("fs");
const path = require("path");
const ui = require("../ui");
const { detectProjectStack, walk } = require("../utils/detector");

async function runDoctor(options = {}) {
  const root = path.resolve(options.cwd || process.cwd());
  ui.printBanner();
  console.log(ui.pc.bold(`🔍 Chẩn đoán toàn diện hệ thống: ${ui.pc.cyan(root)}\n`));

  const stack = detectProjectStack(root);
  const blockers = [];
  const warnings = [];
  const passed = [];

  // 1. Check Governance Triangle
  const govFiles = [
    { name: "CONSTITUTION.md", path: path.join(root, "CONSTITUTION.md"), desc: "Hiến pháp & Ngưỡng kiểm thử" },
    { name: "CLAUDE.md", path: path.join(root, "CLAUDE.md"), desc: "Bộ nhớ & Layer Architecture" },
    { name: "AGENTS.md", path: path.join(root, "AGENTS.md"), desc: "Multi-Engine Rules & DTO Pattern" },
  ];

  for (const gov of govFiles) {
    if (fs.existsSync(gov.path)) {
      passed.push(`Governance Triangle: ${gov.name} (${gov.desc})`);
    } else {
      blockers.push(`Thiếu file governance bắt buộc: ${gov.name}`);
    }
  }

  // 2. Check 4-Tier Directories
  const categories = [
    { dir: "01-spec-management", name: "Spec Management (DNA & Brain)" },
    { dir: "02-codestyle", name: "CodeStyle & Backend Best Practices" },
    { dir: "03-hooks", name: "Hooks & Strict Guard Watchdog" },
    { dir: "04-management", name: "Human Management & Project Map" },
  ];

  for (const cat of categories) {
    const fullPath = path.join(root, cat.dir);
    if (fs.existsSync(fullPath)) {
      passed.push(`4-Tier Structure: [${cat.dir}] ${cat.name}`);
    } else {
      blockers.push(`Thiếu thư mục phân tầng: ${cat.dir}`);
    }
  }

  // 3. Check 30 Skills
  let totalSkills = 0;
  for (const cat of categories) {
    const skillDir = path.join(root, cat.dir, "skills");
    if (fs.existsSync(skillDir)) {
      const skills = fs
        .readdirSync(skillDir, { withFileTypes: true })
        .filter((d) => d.isDirectory() && fs.existsSync(path.join(skillDir, d.name, "SKILL.md")));
      totalSkills += skills.length;
    }
  }

  if (totalSkills >= 30) {
    passed.push(`Agent Skills: Đủ ${totalSkills} skills trên 4 phân tầng (Bao gồm bộ Spec-Kit Suite)`);
  } else if (totalSkills > 0) {
    warnings.push(`Agent Skills: Hiện có ${totalSkills}/30 skills chuẩn`);
  } else {
    blockers.push("Không tìm thấy skills nào trong 4 thư mục phân tầng");
  }

  // 4. Check AI Engine Integrations
  const aiFolders = [
    { name: "Claude Code (.claude/skills)", path: path.join(root, ".claude", "skills") },
    { name: "Antigravity / Gemini (.agents/skills)", path: path.join(root, ".agents", "skills") },
    { name: "Shared (.shared/skills)", path: path.join(root, ".shared", "skills") },
  ];

  for (const ai of aiFolders) {
    if (fs.existsSync(ai.path)) {
      passed.push(`AI Engine: ${ai.name} đã sẵn sàng`);
    } else {
      warnings.push(`Chưa đồng bộ cho AI engine: ${ai.name} (Chạy 'backspec sync')`);
    }
  }

  // 5. Check Git Hooks & Protection
  if (fs.existsSync(path.join(root, ".husky"))) {
    passed.push("Git Safety: Husky hooks đã được kích hoạt");
  } else {
    warnings.push("Chưa cài đặt Husky hooks (Khuyến nghị để bảo vệ commit)");
  }

  // 6. Check SDD Specs
  const sddDir = path.join(root, "01-spec-management", "sdd", "specs");
  if (fs.existsSync(sddDir)) {
    const specs = fs.readdirSync(sddDir, { withFileTypes: true }).filter((d) => d.isDirectory());
    passed.push(`SDD Specs: Đã khởi tạo ${specs.length} spec(s)`);
  }

  // Print Summary Table
  console.log(ui.pc.bold(ui.pc.cyan("📊 BÁO CÁO PHÂN TÍCH STACK:")));
  ui.table(
    ["Hạng mục", "Kết quả nhận diện"],
    [
      ["Ngôn ngữ", stack.languages.join(", ") || "Chưa xác định"],
      ["Framework", stack.frameworks.join(", ") || "Chưa xác định"],
      ["Build Tool", stack.buildTools.join(", ") || "Chưa xác định"],
      ["Migration", stack.migrationTools.join(", ") || "Chưa xác định"],
      ["AI Engines", stack.aiEngines.join(", ") || "Multi-Engine (Claude/Gemini/VSCode)"],
    ]
  );

  console.log("\n" + ui.pc.bold(ui.pc.cyan("🩺 KẾT QUẢ KIỂM TRA HỆ THỐNG:")));

  for (const p of passed) {
    ui.success(p);
  }
  for (const w of warnings) {
    ui.warn(w);
  }
  for (const b of blockers) {
    ui.error(b);
  }

  const score = Math.max(
    0,
    Math.round(((passed.length) / (passed.length + warnings.length * 0.5 + blockers.length * 2)) * 100)
  );

  console.log("\n");
  ui.box(
    `SDD HEALTH SCORE: ${score}%`,
    [
      `• Đạt chuẩn (Passed) : ${passed.length}`,
      `• Cảnh báo (Warnings): ${warnings.length}`,
      `• Chặn (Blockers)    : ${blockers.length}`,
      `• Đánh giá          : ${
        blockers.length === 0
          ? ui.pc.green("SẴN SÀNG SẢN XUẤT (ENTERPRISE READY)")
          : ui.pc.red("CẦN KHẮC PHỤC BLOCKERS")
      }`,
    ]
  );

  if (blockers.length > 0) {
    console.log("\n" + ui.pc.yellow("👉 Khắc phục nhanh: Chạy 'backspec sync' hoặc 'backspec init'"));
    if (options.exitOnError) process.exit(1);
  }
}

module.exports = {
  runDoctor,
};
