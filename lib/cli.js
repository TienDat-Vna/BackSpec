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
const { runAudit } = require("./commands/audit");
const { runQuality } = require("./commands/quality");
const { ingestInput } = require("./utils/doc-extractor");

const pkg = require("../package.json");

function showHelp() {
  ui.printBanner();
  console.log(ui.pc.bold(ui.pc.cyan("⚡ CÁC CÂU LỆNH SPEC-KIT & BACKSPEC (CLI REFERENCE):\n")));

  const workflowCommands = [
    ["specify init [dir] [--ai <agent>]", "Khởi tạo bộ khung SDD đóng gói gọn gàng trong .sdd/"],
    ["specify spec <name> [--from <file>] [--dry-run|--force]", "Soạn đặc tả an toàn; không ghi đè file đã chỉnh nếu thiếu --force"],
    ["specify audit <name> [--strict]", "Đối soát chéo 2 chiều (Spec vs Docx gốc vs Codebase hiện hữu)"],
    ["specify plan <name> [--dry-run|--force]", "Tạo PLAN.md có kiểm tra xung đột trước khi ghi"],
    ["specify tasks <name> [--dry-run|--force]", "Tạo TASKS.md có kiểm tra xung đột trước khi ghi"],
    ["specify clarify <name>", "Tìm và làm rõ các điểm mơ hồ logic trong Spec (CLARIFICATIONS.md)"],
    ["specify checklist <name>", "Sinh danh mục kiểm định chất lượng & acceptance (CHECKLIST.md)"],
    ["specify analyze <name>", "Phân tích tính nhất quán chéo (Constitution vs Spec vs Plan vs Tasks)"],
    ["specify implement <name>", "Chuẩn bị context và hướng dẫn lập trình cho task kế tiếp"],
    ["specify pr <name>", "Tự động sinh nội dung mô tả Pull Request (PR_DESCRIPTION.md)"],
    ["specify export <name>", "Xuất toàn bộ gói đặc tả kỹ thuật thành 1 file duy nhất"],
  ];

  const governanceCommands = [
    ["specify quality [path] [--strict] [--format json|sarif] [--output <file>]", "Scan code created by agents and enforce the quality policy"],
    ["specify check / doctor", "Chẩn đoán toàn diện sức khỏe hệ thống & đo lường SDD Health Score"],
    ["specify sync [--check] [--ai <engine>]", "Đồng bộ hoặc chỉ kiểm tra drift mà không ghi file"],
    ["specify list [type]", "Xem danh sách: skills, rules hoặc specs đang hoạt động"],
    ["specify status / dashboard", "Mở bảng điều khiển quản trị SDD Dashboard trực quan"],
    ["specify adopt [dir]", "Tiếp nhận và ghép khung SDD gọn gàng vào microservice hiện hữu"],
    ["specify validate", "Chạy 4 tầng kiểm định tính toàn vẹn hệ thống trước khi mở PR"],
    ["specify override <reason>", "Kích hoạt quyền tối thượng của con người (Human Authority Override)"],
  ];

  console.log(ui.pc.bold(ui.pc.yellow("🔄 QUY TRÌNH PHÁT TRIỂN TÍNH NĂNG (SDD WORKFLOW):")));
  ui.table(["Cú pháp", "Chức năng"], workflowCommands);

  console.log("\n" + ui.pc.bold(ui.pc.yellow("🏛️ QUẢN TRỊ HỆ THỐNG & KIỂM ĐỊNH (GOVERNANCE & AUDIT):")));
  ui.table(["Cú pháp", "Chức năng"], governanceCommands);

  console.log("\n" + ui.pc.bold(ui.pc.green("💡 VÍ DỤ SỬ DỤNG (EXAMPLES):")));
  console.log(`  $ ${ui.pc.yellow("specify init --ai antigravity")}             # Khởi tạo đóng gói cho Antigravity`);
  console.log(`  $ ${ui.pc.yellow("specify spec create-order --from docx.docx")} # 1. Tạo đặc tả từ Word/PNG`);
  console.log(`  $ ${ui.pc.yellow("specify audit create-order")}               # 2. Đối soát chéo thiếu/thừa`);
  console.log(`  $ ${ui.pc.yellow("specify plan create-order")}                # 3. Tạo thiết kế PLAN.md`);
  console.log(`  $ ${ui.pc.yellow("specify tasks create-order")}               # 4. Phân rã TASKS.md`);
  console.log(`  $ ${ui.pc.yellow("specify implement create-order")}           # 5. Hướng dẫn code task kế tiếp`);
  console.log(`  $ ${ui.pc.yellow("specify check")}                            # 6. Chẩn đoán sức khỏe hệ thống\n`);
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

function parseFromFlag(args) {
  const idx = args.indexOf("--from") !== -1 ? args.indexOf("--from") : args.indexOf("-f");
  if (idx !== -1 && args[idx + 1] && !args[idx + 1].startsWith("-")) {
    return args[idx + 1];
  }
  return undefined;
}

function parseValueFlag(args, name) {
  const index = args.indexOf(name);
  if (index === -1 || !args[index + 1] || args[index + 1].startsWith("-")) return undefined;
  return args[index + 1];
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
        const specName = args[1] && !args[1].startsWith("-") ? args[1] : undefined;
        const fromFile = parseFromFlag(args);
        await runCreateSpec(specName, {
          from: fromFile,
          force: args.includes("--force"),
          dryRun: args.includes("--dry-run"),
        });
        break;
      }

      case "audit":
      case "verify": {
        const specName = args.slice(1).find((a) => !a.startsWith("-"));
        const strict = args.includes("--strict");
        await runAudit(specName, { strict });
        break;
      }

      case "ingest":
      case "extract": {
        const targetPath = args[1] || ".sdd/inputs";
        ui.info(`Trích xuất tài liệu từ: ${targetPath}`);
        const result = await ingestInput(path.resolve(process.cwd(), targetPath));
        console.log(ui.pc.green(result.summary));
        break;
      }

      case "plan": {
        const specName = args[1];
        await runPlan(specName, { force: args.includes("--force"), dryRun: args.includes("--dry-run") });
        break;
      }

      case "tasks": {
        const specName = args[1];
        await runTasks(specName, { force: args.includes("--force"), dryRun: args.includes("--dry-run") });
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
        const ai = args.includes("--ai") ? parseAiFlag(args) : undefined;
        await runSync({ check, rulesOnly, skillsOnly, ai });
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

      case "quality":
      case "scan": {
        const target = args.slice(1).find((value) => !value.startsWith("-") && ![parseValueFlag(args, "--format"), parseValueFlag(args, "--output")].includes(value)) || ".";
        await runQuality(target, {
          strict: args.includes("--strict"),
          format: parseValueFlag(args, "--format") || "terminal",
          output: parseValueFlag(args, "--output"),
        });
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
