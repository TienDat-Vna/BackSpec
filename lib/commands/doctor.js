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

  // 2. Check Registry Structure
  const registryDirs = [
    { dir: "registry/skills", name: "Agent Skills Registry (41 Enterprise Skills)" },
    { dir: "registry/rules", name: "Backend Governance Rules" },
    { dir: "registry/dna", name: "Governance DNA Templates" },
    { dir: "registry/hooks", name: "Strict Guard & Safety Hooks" },
  ];

  for (const reg of registryDirs) {
    const fullPath = path.join(root, reg.dir);
    if (fs.existsSync(fullPath)) {
      passed.push(`Registry Architecture: [${reg.dir}] ${reg.name}`);
    } else {
      blockers.push(`Thiếu thư mục registry: ${reg.dir}`);
    }
  }

  // 3. Check 41 Skills
  const skillsDir = path.join(root, "registry", "skills");
  let totalSkills = 0;
  if (fs.existsSync(skillsDir)) {
    const skills = fs
      .readdirSync(skillsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && fs.existsSync(path.join(skillsDir, d.name, "SKILL.md")));
    totalSkills = skills.length;
  }

  if (totalSkills >= 30) {
    passed.push(`Agent Skills Registry: Đủ ${totalSkills} skills chuẩn (Bao gồm Spec-Kit & Ingestion Suite)`);
  } else if (totalSkills > 0) {
    warnings.push(`Agent Skills Registry: Hiện có ${totalSkills}/30 skills chuẩn`);
  } else {
    blockers.push("Không tìm thấy skills nào trong registry/skills");
  }

  // 4. Check AI Engine Integrations
  const aiFolders = [
    { name: "Claude Code (.claude/skills)", path: path.join(root, ".claude", "skills") },
    { name: "Antigravity / Gemini (.agents/skills)", path: path.join(root, ".agents", "skills") },
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
  const sddDir = path.join(root, ".sdd", "specs");
  if (fs.existsSync(sddDir)) {
    const specs = fs.readdirSync(sddDir, { withFileTypes: true }).filter((d) => d.isDirectory() && !d.name.startsWith("_"));
    passed.push(`SDD Specs: Đã khởi tạo ${specs.length} spec(s) tại .sdd/specs/`);
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
