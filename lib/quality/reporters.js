const { QUALITY_RULES } = require("./rules");

function toJsonReport(result) {
  return {
    version: 1,
    engine: result.engine,
    filesScanned: result.filesScanned,
    summary: result.summary,
    findings: result.findings,
  };
}

function sarifLevel(severity) {
  if (severity === "critical" || severity === "high") return "error";
  if (severity === "medium") return "warning";
  return "note";
}

function toSarif(result) {
  return {
    version: "2.1.0",
    $schema: "https://json.schemastore.org/sarif-2.1.0.json",
    runs: [{
      tool: {
        driver: {
          name: "BackSpec Agent Code Quality Gate",
          version: "1.0.0",
          rules: QUALITY_RULES.concat([{
            id: "CODE.FILE_TOO_LARGE",
            severity: "medium",
            message: "File vượt giới hạn dòng",
            remediation: "Tách file theo trách nhiệm rõ ràng",
          }]).map((rule) => ({
            id: rule.id,
            shortDescription: { text: rule.message },
            help: { text: rule.remediation },
          })),
        },
      },
      results: result.findings.map((item) => ({
        ruleId: item.ruleId,
        level: sarifLevel(item.severity),
        message: { text: `${item.message}. ${item.remediation}` },
        locations: [{
          physicalLocation: {
            artifactLocation: { uri: item.file },
            region: { startLine: item.line, startColumn: item.column },
          },
        }],
      })),
    }],
  };
}

module.exports = {
  toJsonReport,
  toSarif,
};
