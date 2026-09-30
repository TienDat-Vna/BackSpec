#!/usr/bin/env node

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { scanProject } = require("../lib/quality/scanner");
const { toJsonReport, toSarif } = require("../lib/quality/reporters");
const { runQuality } = require("../lib/commands/quality");

function write(root, relativePath, content) {
  const destination = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, content, "utf8");
}

function createFixture(root) {
  const todo = "// " + "TODO replace temporary branch";
  const stackTrace = "e.print" + "StackTrace();";
  const emptyCatch = "catch (Exception ignored) " + "{}";
  const credential = "api_" + "key = \"fixture-secret-value\";";
  const hardDelete = "DELETE " + "FROM users WHERE id = 1;";
  const selectAll = "SELECT " + "* FROM users;";

  write(root, "src/CleanService.java", "class CleanService { int value() { return 1; } }\n");
  write(root, "src/UserController.java", [
    "class UserController {",
    "  @Transactional",
    `  void run() { try { call(); } ${emptyCatch} }`,
    `  void log(Exception e) { ${stackTrace} }`,
    `  String key() { return ${credential} }`,
    `  ${todo}`,
    "}",
  ].join("\n"));
  write(root, "db/migration/V1__unsafe.sql", `${hardDelete}\n${selectAll}\n`);
  write(root, ".env", `api_${"key"}=ignored-secret-value\n`);
}

async function main() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "backspec-quality-"));
  console.log(`[TEST] Quality fixture: ${root}`);
  try {
    createFixture(root);
    const result = scanProject(root, { root });
    const ruleIds = new Set(result.findings.map((item) => item.ruleId));

    for (const expected of [
      "SECRET.HARDCODED",
      "CODE.TODO_COMMENT",
      "ERROR.PRINT_STACKTRACE",
      "ERROR.EMPTY_CATCH",
      "TRANSACTION.WRONG_LAYER",
      "SQL.HARD_DELETE",
      "SQL.SELECT_ALL",
    ]) assert(ruleIds.has(expected), `missing expected rule ${expected}`);

    const secret = result.findings.find((item) => item.ruleId === "SECRET.HARDCODED");
    assert.strictEqual(secret.evidence, "[REDACTED: potential secret]");
    assert(!JSON.stringify(toJsonReport(result)).includes("fixture-secret-value"), "report leaked a secret");
    assert(!result.findings.some((item) => item.file === ".env"), ".env must not be scanned");

    const sarif = toSarif(result);
    assert.strictEqual(sarif.version, "2.1.0");
    assert.strictEqual(sarif.runs[0].results.length, result.findings.length);

    const clean = scanProject(path.join(root, "src", "CleanService.java"), { root });
    assert.strictEqual(clean.summary.total, 0, "clean fixture must pass");

    const reportPath = "reports/quality.sarif";
    const commandResult = await runQuality(".", {
      cwd: root,
      strict: true,
      format: "sarif",
      output: reportPath,
      silent: true,
      exitOnFindings: false,
    });
    assert(commandResult.blockingCount > 0, "strict mode must block findings");
    assert.strictEqual(JSON.parse(fs.readFileSync(path.join(root, reportPath), "utf8")).version, "2.1.0");

    const previousExitCode = process.exitCode;
    await runQuality(".", {
      cwd: root,
      strict: true,
      silent: true,
    });
    assert.strictEqual(process.exitCode, 1, "strict quality run must set exit code 1 for blocking findings");
    process.exitCode = previousExitCode;
    console.log("[TEST] Detection, redaction, clean scan, severity policy and SARIF contracts passed.");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error("[TEST] Failed:", error.stack || error.message);
  process.exitCode = 1;
});
