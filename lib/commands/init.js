const fs = require("fs");
const path = require("path");
const ui = require("../ui");
const { ensureDir, copyRecursive } = require("../utils/file-system");
const { detectProjectStack } = require("../utils/detector");
const { generateConstitution, generateClaudeMd, generateAgentsMd } = require("../templates/governance");
const { runSync } = require("./sync");
const { ensureQualityConfig } = require("../quality/scanner");

const AI_ENGINE_LABELS = {
  antigravity: "Antigravity / Gemini",
  gemini: "Antigravity / Gemini",
  claude: "Claude Code",
  copilot: "GitHub Copilot",
  cursor: "Cursor",
  windsurf: "Windsurf",
};

function selectedEngineLabels(aiEngine) {
  if (aiEngine === "all") return [...new Set(Object.values(AI_ENGINE_LABELS))];
  const label = AI_ENGINE_LABELS[aiEngine];
  if (!label) throw new Error(`AI engine không được hỗ trợ: ${aiEngine}`);
  return [label];
}

function createCopilotPrompts(root) {
  const promptsDir = path.join(root, ".github", "prompts");
  ensureDir(promptsDir);

  const copilotInstructions = `# GitHub Copilot Custom Instructions for BackSpec / Spec-Kit SDD

Always adhere to the Governance Triangle:
1. CONSTITUTION.md: Zero hardcoded secrets, method <= 40 lines, file <= 300 lines, test coverage >= 80%.
2. DTO Pattern: Never return or accept Database Entities directly in API controllers or event consumers.
3. Soft Delete: Never execute hard DELETE SQL statements. Use 'is_deleted = true' or 'status = INACTIVE'.
4. Resilience: All external HTTP/gRPC calls must have timeout <= 3000ms and circuit breakers.
`;

  fs.writeFileSync(path.join(root, ".github", "copilot-instructions.md"), copilotInstructions, "utf8");

  const prompts = [
    {
      name: "speckit.specify.prompt.md",
      content: `---
description: Define a new specification for a backend microservice feature
---
When invoked with a feature name or requirement:
1. Review CONSTITUTION.md for architecture constraints.
2. Generate SPEC.md with Bounded Context, Request/Response DTOs, and RFC 7807 Error Matrix.
3. Ensure Soft Delete and Audit columns are defined.
`,
    },
    {
      name: "speckit.plan.prompt.md",
      content: `---
description: Create architectural technical plan for a feature
---
When invoked for a spec:
1. Generate sequence diagram (Mermaid) with controller, service, repository, redis, and outbox.
2. Define @Transactional boundaries at Service Layer only.
3. Establish state transitions and Transactional Outbox pattern.
`,
    },
    {
      name: "speckit.tasks.prompt.md",
      content: `---
description: Break down plan into actionable task checklist
---
Generate TASKS.md divided into 6 phases:
- Phase 1: Database Migration & Entities
- Phase 2: DTOs & Repositories
- Phase 3: Service Layer & Business Rules
- Phase 4: Controller & Error Handlers
- Phase 5: Testing (Coverage >= 80%)
- Phase 6: Code Review Gate & DoD
`,
    },
    {
      name: "speckit.audit.prompt.md",
      content: `---
description: Audit generated spec against input documents and codebase
---
Run bidirectional cross-verification:
1. Check if all requirements in docx/images are captured (Under-spec check).
2. Check for hallucinated or extra non-requested endpoints (Over-spec check).
3. Validate against existing DB schema and Entity classes.
`,
    },
    {
      name: "speckit.implement.prompt.md",
      content: `---
description: Implement next pending task from TASKS.md
---
1. Read TASKS.md and find the next pending task.
2. Implement cleanly respecting DTO pattern and transaction boundaries.
3. Write unit & integration tests.
4. Mark task completed with [x].
`,
    },
  ];

  for (const p of prompts) {
    fs.writeFileSync(path.join(promptsDir, p.name), p.content, "utf8");
  }
}

function createCursorRules(root) {
  const cursorRulesPath = path.join(root, ".cursorrules");
  const content = `# Cursor Rules for BackSpec / Spec-Kit SDD
- Follow CONSTITUTION.md: Method <= 40 lines, File <= 300 lines, Coverage >= 80%.
- Always use DTO Pattern: Zero Entity Leak.
- Transaction boundary at Service Layer only (@Transactional).
- Never use SELECT * in SQL queries.
- Zero Hardcoded Secrets.
`;
  fs.writeFileSync(cursorRulesPath, content, "utf8");
}

function createWindsurfRules(root) {
  const windsurfRulesPath = path.join(root, ".windsurfrules");
  const content = `# Windsurf Rules for BackSpec / Spec-Kit SDD
- Refer to CONSTITUTION.md and AGENTS.md before making modifications.
- Enforce DTO Pattern for all REST endpoints and Kafka events.
- Soft Delete only (is_deleted = true).
- Timeout <= 3000ms on all outgoing network requests.
`;
  fs.writeFileSync(windsurfRulesPath, content, "utf8");
}

function updateGitIgnore(root) {
  const gitignorePath = path.join(root, ".gitignore");
  const sddIgnores = `
# BackSpec / SDD Temporary Files
.sdd/tmp/
.sdd/cache/
*.tmp
`;
  if (fs.existsSync(gitignorePath)) {
    const current = fs.readFileSync(gitignorePath, "utf8");
    if (!current.includes(".sdd/tmp/")) {
      fs.appendFileSync(gitignorePath, sddIgnores, "utf8");
    }
  } else {
    fs.writeFileSync(gitignorePath, sddIgnores.trim() + "\n", "utf8");
  }
}

async function runInit(targetDir, options = {}) {
  const root = path.resolve(targetDir || process.cwd());
  ui.printBanner();

  ui.info(`Khởi tạo bộ khung BackSpec / Spec-Kit SDD (Encapsulated) tại: ${ui.pc.cyan(root)}`);

  const detected = detectProjectStack(root);
  const serviceName = options.name || detected.name || "backend-microservice";
  const stack = options.stack || options.lang || (detected.frameworks[0] ? `${detected.languages[0]} / ${detected.frameworks[0]}` : "Java / Spring Boot 3.x");
  const database = options.database || (detected.databases[0] ? detected.databases[0] : "PostgreSQL 15+ / MySQL 8.0+");
  const aiEngine = (options.ai || "all").toLowerCase();
  const engineLabels = selectedEngineLabels(aiEngine);

  ui.step(1, 5, "Khởi tạo Kiềng 3 Chân Quản Trị (Governance Triangle)...");
  
  const constitutionContent = generateConstitution({ serviceName, stack, database });
  const claudeContent = generateClaudeMd({ serviceName, stack });
  const agentsContent = generateAgentsMd({ serviceName });

  const constitutionPath = path.join(root, "CONSTITUTION.md");
  const claudePath = path.join(root, "CLAUDE.md");
  const agentsPath = path.join(root, "AGENTS.md");

  if (!fs.existsSync(constitutionPath) || options.force) {
    fs.writeFileSync(constitutionPath, constitutionContent, "utf8");
    ui.success("Đã tạo CONSTITUTION.md");
  } else {
    ui.info("CONSTITUTION.md đã tồn tại (giữ nguyên).");
  }

  if (!fs.existsSync(claudePath) || options.force) {
    fs.writeFileSync(claudePath, claudeContent, "utf8");
    ui.success("Đã tạo CLAUDE.md");
  } else {
    ui.info("CLAUDE.md đã tồn tại (giữ nguyên).");
  }

  if (!fs.existsSync(agentsPath) || options.force) {
    fs.writeFileSync(agentsPath, agentsContent, "utf8");
    ui.success("Đã tạo AGENTS.md");
  } else {
    ui.info("AGENTS.md đã tồn tại (giữ nguyên).");
  }

  ui.step(2, 5, "Thiết lập cấu trúc Đóng gói Đơn nhất (.sdd/ Encapsulation)...");
  const sourceRoot = path.resolve(__dirname, "..", "..");

  const sddSpecsDir = path.join(root, ".sdd", "specs");
  const sddRulesDir = path.join(root, ".sdd", "rules");
  const sddInputsDocsDir = path.join(root, ".sdd", "inputs", "docs");
  const sddInputsImagesDir = path.join(root, ".sdd", "inputs", "images");
  const sddTemplatesDir = path.join(root, ".sdd", "templates");

  ensureDir(sddSpecsDir);
  ensureDir(sddRulesDir);
  ensureDir(sddInputsDocsDir);
  ensureDir(sddInputsImagesDir);
  ensureDir(sddTemplatesDir);
  ensureQualityConfig(root);

  // Copy rules to .sdd/rules/
  const sourceRules = path.join(sourceRoot, "registry", "rules");
  if (fs.existsSync(sourceRules)) {
    copyRecursive(sourceRules, sddRulesDir);
    ui.success("Đã sao chép bộ quy chuẩn rules vào .sdd/rules/");
  }

  // Create input guide
  const inputReadmePath = path.join(root, ".sdd", "inputs", "README.md");
  if (!fs.existsSync(inputReadmePath)) {
    fs.writeFileSync(
      inputReadmePath,
      `# Thư Mục Tài Liệu Đầu Vào (.sdd/inputs/)\n\nThả các tài liệu gốc của dự án vào đây để BackSpec tự động đọc và sinh spec:\n- \`docs/\`: File Word (\`.docx\`), PDF, BRD, SRS, User Stories.\n- \`images/\`: Sơ đồ ERD, Architecture diagram, Sequence diagram (\`.png\`, \`.jpg\`).\n`,
      "utf8"
    );
  }

  const sddTemplatePath = path.join(sddSpecsDir, "_template.md");
  const sddIndexPath = path.join(sddSpecsDir, "_INDEX.md");

  if (!fs.existsSync(sddTemplatePath)) {
    fs.writeFileSync(
      sddTemplatePath,
      `# [SPEC-XXX] {{FEATURE_NAME}}\n\n## 1. Bounded Context & Architecture Layer\n- **Service**: {{SERVICE_NAME}}\n\n## 2. API Contract & DTO\n\n## 3. Database Schema\n\n## 4. Resilience & Outbox\n`,
      "utf8"
    );
  }
  if (!fs.existsSync(sddIndexPath)) {
    fs.writeFileSync(
      sddIndexPath,
      `# Danh Mục Specs Quản Trị Hệ Thống (_INDEX.md)\n\n| Mã Spec | Tên Tính Năng | Bounded Context | Trạng Thái | Lead Phê Duyệt | Ngày Cập Nhật |\n|---|---|---|---|---|---|\n`,
      "utf8"
    );
  }
  ui.success("Đã thiết lập trung tâm đặc tả .sdd/ (inputs, specs, rules, templates)");

  ui.step(3, 5, "Cấu hình AI Coding Agents Integrations...");
  if (["all", "copilot"].includes(aiEngine)) {
    createCopilotPrompts(root);
    ui.success("Đã cấu hình GitHub Copilot (.github/prompts/ & copilot-instructions.md)");
  }
  if (["all", "cursor"].includes(aiEngine)) {
    createCursorRules(root);
    ui.success("Đã cấu hình Cursor (.cursorrules)");
  }
  if (["all", "windsurf"].includes(aiEngine)) {
    createWindsurfRules(root);
    ui.success("Đã cấu hình Windsurf (.windsurfrules)");
  }

  ui.step(4, 5, "Đồng bộ Rules & 41 Skills sang AI Engines...");
  await runSync({ cwd: root, ai: aiEngine });

  ui.step(5, 5, "Cấu hình Tooling, Agent Context & Git Protection...");
  const mcpPath = path.join(root, ".mcp.json");
  if (!fs.existsSync(mcpPath) && fs.existsSync(path.join(sourceRoot, ".mcp.json"))) {
    fs.copyFileSync(path.join(sourceRoot, ".mcp.json"), mcpPath);
    ui.success("Đã cấu hình .mcp.json");
  }

  const agentIgnorePath = path.join(root, ".agentignore");
  if (!fs.existsSync(agentIgnorePath) && fs.existsSync(path.join(sourceRoot, ".agentignore"))) {
    fs.copyFileSync(path.join(sourceRoot, ".agentignore"), agentIgnorePath);
    ui.success("Đã cấu hình .agentignore");
  }

  updateGitIgnore(root);
  ui.success("Đã cấu hình .gitignore chống push nhầm file tạm");

  console.log("\n");
  ui.box("🎉 KHỞI TẠO BACKSPEC / SPEC-KIT SDD HOÀN TẤT!", [
    `Dự án        : ${serviceName}`,
    `Stack        : ${stack}`,
    `Cấu trúc     : Đóng gói 100% gọn gàng trong .sdd/`,
    `Governance   : CONSTITUTION.md, CLAUDE.md, AGENTS.md`,
    `Agent Skills : 41 Enterprise Skills (Registry)`,
    `AI Engines   : ${engineLabels.join(", ")}`,
  ]);

  console.log("\n" + ui.pc.bold(ui.pc.green("👉 Lệnh Spec-Kit thường dùng:")));
  console.log(`  • specify spec <name> [--from <doc>] : Tạo spec đặc tả từ template hoặc Docx/PNG`);
  console.log(`  • specify audit <name>              : Đối soát chéo 2 chiều (Spec vs Docx vs Code)`);
  console.log(`  • specify plan <name>               : Thiết kế kiến trúc & sequence`);
  console.log(`  • specify tasks <name>              : Phân rã checklist triển khai`);
  console.log(`  • specify implement <name>          : Bắt đầu code task kế tiếp`);
  console.log(`  • specify check                     : Chẩn đoán sức khỏe hệ thống\n`);
}

module.exports = {
  runInit,
  selectedEngineLabels,
};
