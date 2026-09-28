const path = require("path");
const ui = require("./ui");
const { runInit } = require("./commands/init");
const { runCreateSpec } = require("./commands/spec");
const { runPlan } = require("./commands/plan");
const { runTasks } = require("./commands/tasks");
const { runClarify } = require("./commands/clarify");
const { runChecklist } = require("./commands/checklist");
const { runAnalyze } = require("./commands/analyze");
const { runImplement } = require("./commands/implement");
const { runPr } = require("./commands/pr");
const { runExport } = require("./commands/export");
const { runDoctor } = require("./commands/doctor");
const { runSync } = require("./commands/sync");
const { runList } = require("./commands/list");
const { runStatus } = require("./commands/status");
const { runAdopt } = require("./commands/adopt");
const { runValidate } = require("./commands/validate");
const { runOverride } = require("./commands/override");

const pkg = require("../package.json");

function showHelp() {
  ui.printBanner();
  console.log(ui.pc.bold(ui.pc.cyan("⚡ CÁC CÂU LỆNH SPEC-KIT & BACKSPEC (CLI REFERENCE):\n")));

  const workflowCommands = [
    ["specify init [dir] [--ai <agent>]", "Khởi tạo bộ khung SDD (Kiềng 3 chân, Multi-Agent Prompts)"],
    ["specify spec <name> / new <name>", "Soạn thảo đặc tả kỹ thuật tính năng mới (SPEC.md)"],
    ["specify plan <name>", "Tạo bản thiết kế kỹ thuật & Sequence Blueprint (PLAN.md)"],
    ["specify tasks <name>", "Phân rã kế hoạch thành checklist 6 giai đoạn (TASKS.md)"],
    ["specify clarify <name>", "Tìm và làm rõ các điểm mơ hồ logic trong Spec (CLARIFICATIONS.md)"],
    ["specify checklist <name>", "Sinh danh mục kiểm định chất lượng & acceptance (CHECKLIST.md)"],
    ["specify analyze <name>", "Phân tích tính nhất quán chéo (Constitution vs Spec vs Plan vs Tasks)"],
    ["specify implement <name>", "Chuẩn bị context và hướng dẫn lập trình cho task kế tiếp"],
    ["specify pr <name>", "Tự động sinh nội dung mô tả Pull Request (PR_DESCRIPTION.md)"],
    ["specify export <name>", "Xuất toàn bộ gói đặc tả kỹ thuật thành 1 file duy nhất"],
  ];

  const governanceCommands = [
    ["specify check / doctor", "Chẩn đoán toàn diện sức khỏe hệ thống & đo lường SDD Health Score"],
    ["specify sync", "Đồng bộ rules và skills sang Claude Code, Antigravity, Copilot, Cursor"],
    ["specify list [type]", "Xem danh sách: skills, rules hoặc specs đang hoạt động"],
    ["specify status / dashboard", "Mở bảng điều khiển quản trị SDD Dashboard trực quan"],
    ["specify adopt [dir]", "Tiếp nhận và ghép khung SDD vào microservice hiện hữu"],
    ["specify validate", "Chạy 4 tầng kiểm định tính toàn vẹn hệ thống trước khi mở PR"],
    ["specify override <reason>", "Kích hoạt quyền tối thượng của con người (Human Authority Override)"],
  ];

  console.log(ui.pc.bold(ui.pc.yellow("🔄 QUY TRÌNH PHÁT TRIỂN TÍNH NĂNG (SDD WORKFLOW):")));
  ui.table(["Cú pháp", "Chức năng"], workflowCommands);

  console.log("\n" + ui.pc.bold(ui.pc.yellow("🏛️ QUẢN TRỊ HỆ THỐNG & KIỂM ĐỊNH (GOVERNANCE & AUDIT):")));
  ui.table(["Cú pháp", "Chức năng"], governanceCommands);

  console.log("\n" + ui.pc.bold(ui.pc.green("💡 VÍ DỤ SỬ DỤNG (EXAMPLES):")));
  console.log(`  $ ${ui.pc.yellow("specify init --ai all")}                     # Khởi tạo hỗ trợ mọi AI Agent`);
  console.log(`  $ ${ui.pc.yellow("specify spec create-payment")}              # 1. Tạo đặc tả SPEC.md`);
  console.log(`  $ ${ui.pc.yellow("specify plan create-payment")}              # 2. Tạo thiết kế PLAN.md`);
  console.log(`  $ ${ui.pc.yellow("specify tasks create-payment")}             # 3. Phân rã TASKS.md`);
  console.log(`  $ ${ui.pc.yellow("specify implement create-payment")}         # 4. Hướng dẫn code task kế tiếp`);
  console.log(`  $ ${ui.pc.yellow("specify check")}                            # 5. Chẩn đoán sức khỏe hệ thống`);
  console.log(`  $ ${ui.pc.yellow("specify pr create-payment")}                # 6. Tạo mô tả Pull Request\n`);
}

function parseAiFlag(args) {
  const idx = args.indexOf("--ai");
  if (idx !== -1 && args[idx + 1]) return args[idx + 1];
  return "all";
}

function parseStackFlag(args) {
  const idx = args.indexOf("--stack");
  if (idx !== -1 && args[idx + 1]) return args[idx + 1];
  const langIdx = args.indexOf("--lang");
  if (langIdx !== -1 && args[langIdx + 1]) return args[langIdx + 1];
  return undefined;
}

async function cli(args = process.argv.slice(2)) {
  const command = args[0];

  if (!command || command === "--help" || command === "-h" || command === "help") {
    showHelp();
    return;
  }

  if (command === "--version" || command === "-v" || command === "version") {
    console.log(`BackSpec / Specify CLI v${pkg.version}`);
    return;
  }

  try {
    switch (command) {
      case "init": {
        const isHere = args.includes("--here") || args.includes("--current");
        const targetDir = isHere
          ? process.cwd()
          : (args[1] && !args[1].startsWith("-") ? args[1] : process.cwd());
        const force = args.includes("--force") || args.includes("-f");
        const ai = parseAiFlag(args);
        const stack = parseStackFlag(args);
        await runInit(targetDir, { force, ai, stack });
        break;
      }

      case "spec":
      case "new":
      case "specify": {
        const specName = args[1];
        await runCreateSpec(specName, {});
        break;
      }

      case "plan": {
        const specName = args[1];
        await runPlan(specName, {});
        break;
      }

      case "tasks": {
        const specName = args[1];
        await runTasks(specName, {});
        break;
      }

      case "clarify": {
        const specName = args[1];
        await runClarify(specName, {});
        break;
      }

      case "checklist": {
        const specName = args[1];
        await runChecklist(specName, {});
        break;
      }

      case "analyze": {
        const specName = args[1];
        await runAnalyze(specName, {});
        break;
      }

      case "implement": {
        const specName = args[1];
        await runImplement(specName, {});
        break;
      }

      case "pr": {
        const specName = args[1];
        await runPr(specName, {});
        break;
      }

      case "export":
      case "pack": {
        const specName = args[1];
        await runExport(specName, {});
        break;
      }

      case "check":
      case "doctor": {
        const exitOnError = args.includes("--strict");
        await runDoctor({ exitOnError });
        break;
      }

      case "sync":
      case "sync-all": {
        const check = args.includes("--check");
        const rulesOnly = args.includes("--rules");
        const skillsOnly = args.includes("--skills");
        await runSync({ check, rulesOnly, skillsOnly });
        break;
      }

      case "list":
      case "ls": {
        const type = args[1] || "skills";
        await runList(type, {});
        break;
      }

      case "status":
      case "dashboard": {
        await runStatus({});
        break;
      }

      case "adopt": {
        const targetDir = args[1] && !args[1].startsWith("-") ? args[1] : process.cwd();
        const force = args.includes("--force") || args.includes("-f");
        await runAdopt(targetDir, { force });
        break;
      }

      case "validate": {
        await runValidate({});
        break;
      }

      case "override": {
        const reason = args.slice(1).filter((a) => !a.startsWith("-")).join(" ");
        await runOverride(reason, {});
        break;
      }

      default: {
        ui.error(`Không tìm thấy lệnh: '${command}'`);
        console.log(`Chạy ${ui.pc.yellow("specify --help")} hoặc ${ui.pc.yellow("backspec --help")} để xem danh sách các lệnh hỗ trợ.\n`);
        process.exit(1);
      }
    }
  } catch (err) {
    ui.error(err.message);
    if (process.env.DEBUG) {
      console.error(err);
    }
    process.exit(1);
  }
}

module.exports = {
  cli,
};
