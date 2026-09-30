const path = require("path");
const ui = require("../ui");
const { scanProject } = require("../quality/scanner");
const { toJsonReport, toSarif } = require("../quality/reporters");
const { writeGeneratedFile } = require("../utils/file-system");

const FORMATS = new Set(["terminal", "json", "sarif"]);
const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

function resolveOutput(root, output) {
  if (!output) return undefined;
  const resolved = path.resolve(root, output);
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) {
    throw new Error("Quality report output must be inside project root");
  }
  return resolved;
}

function blockingSeverities(config, strict) {
  const severities = new Set(config.failOn || ["critical", "high"]);
  if (strict) severities.add("medium");
  return severities;
}

function renderTerminal(result, blockingCount) {
  const rows = [...result.findings]
    .sort((left, right) => SEVERITY_ORDER[left.severity] - SEVERITY_ORDER[right.severity])
    .map((item) => [item.severity.toUpperCase(), item.ruleId, `${item.file}:${item.line}:${item.column}`, item.message]);

  if (rows.length) ui.table(["Severity", "Rule", "Location", "Message"], rows);
  else ui.success("Quality gate passed with no findings.");

  const counts = result.summary.bySeverity;
  console.log(`\nScanned ${result.filesScanned} files | critical=${counts.critical} high=${counts.high} medium=${counts.medium} low=${counts.low}`);
  if (blockingCount) ui.error(`${blockingCount} blocking quality finding(s).`);
}

function serialize(result, format) {
  const report = format === "sarif" ? toSarif(result) : toJsonReport(result);
  return `${JSON.stringify(report, null, 2)}\n`;
}

async function runQuality(targetPath = ".", options = {}) {
  const root = path.resolve(options.cwd || process.cwd());
  const target = path.resolve(root, targetPath || ".");
  const format = (options.format || "terminal").toLowerCase();
  if (!FORMATS.has(format)) throw new Error(`Unsupported quality report format: ${format}`);

  const result = scanProject(target, { root, config: options.config });
  const blockers = blockingSeverities(result.config, options.strict);
  const blockingCount = result.findings.filter((item) => blockers.has(item.severity)).length;
  const output = resolveOutput(root, options.output);

  if (output) {
    const outputFormat = format === "terminal" ? "json" : format;
    writeGeneratedFile(output, serialize(result, outputFormat), { overwrite: true, backup: false });
    if (!options.silent) ui.success(`Quality report written: ${path.relative(root, output)}`);
  } else if (format === "terminal") {
    if (!options.silent) renderTerminal(result, blockingCount);
  } else if (!options.silent) {
    process.stdout.write(serialize(result, format));
  }

  if (blockingCount > 0 && options.exitOnFindings !== false) process.exitCode = 1;
  return { ...result, blockingCount, output };
}

module.exports = {
  blockingSeverities,
  runQuality,
};
