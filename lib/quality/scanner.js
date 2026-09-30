const fs = require("fs");
const path = require("path");
const { QUALITY_RULES } = require("./rules");

const SUPPORTED_EXTENSIONS = new Set([
  ".js", ".cjs", ".mjs", ".ts", ".tsx", ".java", ".kt", ".kts",
  ".go", ".py", ".cs", ".rs", ".sql", ".sh", ".yml", ".yaml", ".properties",
]);
const EXCLUDED_DIRECTORIES = new Set([
  ".git", "node_modules", "dist", "build", "target", "vendor", "coverage",
  ".agents", ".claude", ".cursor", ".windsurf",
]);
const DEFAULT_QUALITY_CONFIG = {
  version: 1,
  maxFileLines: 300,
  failOn: ["critical", "high"],
  exclude: [],
};

function normalize(relativePath) {
  return relativePath.replace(/\\/g, "/");
}

function loadQualityConfig(root) {
  const configPath = path.join(root, ".sdd", "quality.json");
  if (!fs.existsSync(configPath)) return { ...DEFAULT_QUALITY_CONFIG };
  try {
    return { ...DEFAULT_QUALITY_CONFIG, ...JSON.parse(fs.readFileSync(configPath, "utf8")) };
  } catch (error) {
    throw new Error(`Invalid quality config ${configPath}: ${error.message}`);
  }
}

function ensureQualityConfig(root) {
  const configPath = path.join(root, ".sdd", "quality.json");
  if (fs.existsSync(configPath)) return false;
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, `${JSON.stringify(DEFAULT_QUALITY_CONFIG, null, 2)}\n`, "utf8");
  return true;
}

function isExcluded(root, target, config) {
  const relative = normalize(path.relative(root, target));
  const segments = relative.split("/");
  if (segments.some((segment) => EXCLUDED_DIRECTORIES.has(segment))) return true;
  if (path.basename(target).toLowerCase().startsWith(".env")) return true;
  return config.exclude.some((entry) => relative === entry || relative.startsWith(`${entry.replace(/\\/g, "/")}/`));
}

function discoverFiles(root, target, config, output = []) {
  if (!fs.existsSync(target) || isExcluded(root, target, config)) return output;
  const stat = fs.lstatSync(target);
  if (stat.isSymbolicLink()) return output;
  if (stat.isFile()) {
    if (SUPPORTED_EXTENSIONS.has(path.extname(target).toLowerCase())) output.push(target);
    return output;
  }
  if (!stat.isDirectory()) return output;
  for (const entry of fs.readdirSync(target)) discoverFiles(root, path.join(target, entry), config, output);
  return output;
}

function appliesTo(rule, filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (rule.extensions && !rule.extensions.includes(extension)) return false;
  if (!rule.pathPattern) return true;
  return new RegExp(rule.pathPattern, rule.pathFlags || "").test(normalize(filePath));
}

function finding(rule, relativeFile, line, column, evidence) {
  return {
    ruleId: rule.id,
    severity: rule.severity,
    message: rule.message,
    file: normalize(relativeFile),
    line,
    column,
    evidence: rule.redact ? "[REDACTED: potential secret]" : evidence.trim().slice(0, 200),
    remediation: rule.remediation,
  };
}

function scanLineRules(root, filePath, lines) {
  const results = [];
  for (const rule of QUALITY_RULES.filter((item) => item.scope !== "file" && appliesTo(item, filePath))) {
    for (let index = 0; index < lines.length; index++) {
      const match = new RegExp(rule.pattern, rule.flags || "").exec(lines[index]);
      if (match) results.push(finding(rule, path.relative(root, filePath), index + 1, match.index + 1, lines[index]));
    }
  }
  return results;
}

function positionAt(content, offset) {
  const before = content.slice(0, offset);
  const lines = before.split(/\r?\n/);
  return { line: lines.length, column: lines[lines.length - 1].length + 1 };
}

function scanFileRules(root, filePath, content) {
  const results = [];
  for (const rule of QUALITY_RULES.filter((item) => item.scope === "file" && appliesTo(item, filePath))) {
    const regex = new RegExp(rule.pattern, rule.flags?.includes("g") ? rule.flags : `${rule.flags || ""}g`);
    for (const match of content.matchAll(regex)) {
      const position = positionAt(content, match.index);
      results.push(finding(rule, path.relative(root, filePath), position.line, position.column, match[0]));
    }
  }
  return results;
}

function scanFile(root, filePath, config) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);
  const findings = [...scanLineRules(root, filePath, lines), ...scanFileRules(root, filePath, content)];
  if (lines.length > config.maxFileLines) {
    findings.push({
      ruleId: "CODE.FILE_TOO_LARGE", severity: "medium",
      message: `File có ${lines.length} dòng, vượt ngưỡng ${config.maxFileLines}`,
      file: normalize(path.relative(root, filePath)), line: config.maxFileLines + 1, column: 1,
      evidence: `${lines.length} lines`, remediation: "Tách file theo trách nhiệm rõ ràng",
    });
  }
  return findings;
}

function summarize(findings) {
  const bySeverity = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const item of findings) bySeverity[item.severity] = (bySeverity[item.severity] || 0) + 1;
  return { total: findings.length, bySeverity };
}

function scanProject(targetPath, options = {}) {
  const root = path.resolve(options.root || targetPath || process.cwd());
  const target = path.resolve(targetPath || root);
  if (target !== root && !target.startsWith(`${root}${path.sep}`)) throw new Error("Quality target must be inside project root");
  const config = { ...loadQualityConfig(root), ...(options.config || {}) };
  const files = discoverFiles(root, target, config);
  const findings = files.flatMap((file) => scanFile(root, file, config));
  findings.sort((left, right) => left.file.localeCompare(right.file) || left.line - right.line);
  return { engine: "pattern-v1", root, target, config, filesScanned: files.length, findings, summary: summarize(findings) };
}

module.exports = {
  DEFAULT_QUALITY_CONFIG,
  ensureQualityConfig,
  loadQualityConfig,
  scanProject,
};
