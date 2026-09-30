const pc = (() => {
  try {
    return require("picocolors");
  } catch {
    // Zero-dependency fallback for colors
    const wrap = (open, close) => (s) => `\x1b[${open}m${s}\x1b[${close}m`;
    return {
      bold: wrap(1, 22),
      dim: wrap(2, 22),
      italic: wrap(3, 23),
      underline: wrap(4, 24),
      cyan: wrap(36, 39),
      blue: wrap(34, 39),
      green: wrap(32, 39),
      yellow: wrap(33, 39),
      red: wrap(31, 39),
      magenta: wrap(35, 39),
      gray: wrap(90, 39),
      white: wrap(37, 39),
      bgBlue: wrap(44, 49),
      bgCyan: wrap(46, 49),
      bgGreen: wrap(42, 49),
      bgRed: wrap(41, 49),
    };
  }
})();

const { version } = require("../package.json");

function printBanner() {
  console.log(pc.cyan(`
  ██████╗  █████╗  ██████╗██╗  ██╗███████╗██████╗ ███████╗ ██████╗
  ██╔══██╗██╔══██╗██╔════╝██║ ██╔╝██╔════╝██╔══██╗██╔════╝██╔════╝
  ██████╔╝███████║██║     █████╔╝ ███████╗██████╔╝█████╗  ██║     
  ██╔══██╗██╔══██║██║     ██╔═██╗ ╚════██║██╔═══╝ ██╔══╝  ██║     
  ██████╔╝██║  ██║╚██████╗██║  ██╗███████║██║     ███████╗╚██████╗
  ╚═════╝ ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝     ╚══════╝ ╚═════╝
`));
  console.log(
    pc.bold(pc.green("  ⚡ Enterprise Spec-Driven Development (SDD) for Backend Microservices ⚡"))
  );
  console.log(pc.dim(`     Version ${version} | Multi-Engine Governance (Claude, Antigravity, Copilot, Cursor)\n`));
}

function success(msg) {
  console.log(` ${pc.green("✔")} ${pc.bold(pc.white(msg))}`);
}

function error(msg) {
  console.log(` ${pc.red("✖")} ${pc.bold(pc.red("ERROR:"))} ${msg}`);
}

function warn(msg) {
  console.log(` ${pc.yellow("⚠")} ${pc.bold(pc.yellow("WARN:"))} ${msg}`);
}

function info(msg) {
  console.log(` ${pc.cyan("ℹ")} ${pc.white(msg)}`);
}

function step(num, total, msg) {
  console.log(`\n${pc.cyan(`[${num}/${total}]`)} ${pc.bold(msg)}`);
}

function box(title, content) {
  const lines = Array.isArray(content) ? content : content.split("\n");
  const maxLen = Math.max(
    title.length + 4,
    ...lines.map((l) => l.replace(/\x1b\[\d+m/g, "").length)
  ) + 4;

  const top = `┌─ ${pc.bold(title)} ${"─".repeat(Math.max(0, maxLen - title.length - 4))}┐`;
  const bottom = `└${"─".repeat(maxLen)}┘`;

  console.log(pc.cyan(top));
  for (const line of lines) {
    const cleanLine = line.replace(/\x1b\[\d+m/g, "");
    const padding = " ".repeat(Math.max(0, maxLen - cleanLine.length - 2));
    console.log(`${pc.cyan("│")} ${line}${padding}${pc.cyan("│")}`);
  }
  console.log(pc.cyan(bottom));
}

function table(headers, rows) {
  const colWidths = headers.map((h, i) => {
    return Math.max(
      h.length,
      ...rows.map((r) => (r[i] ? String(r[i]).replace(/\x1b\[\d+m/g, "").length : 0))
    );
  });

  const formatRow = (cols) =>
    cols
      .map((col, i) => {
        const str = String(col || "");
        const clean = str.replace(/\x1b\[\d+m/g, "");
        const pad = " ".repeat(Math.max(0, colWidths[i] - clean.length));
        return str + pad;
      })
      .join("  │  ");

  const headerLine = formatRow(headers.map((h) => pc.bold(pc.cyan(h))));
  const divider = colWidths.map((w) => "─".repeat(w)).join("──┼──");

  console.log(`  ${headerLine}`);
  console.log(pc.dim(`  ${divider}`));
  for (const row of rows) {
    console.log(`  ${formatRow(row)}`);
  }
}

module.exports = {
  pc,
  printBanner,
  success,
  error,
  warn,
  info,
  step,
  box,
  table,
};
