const fs = require("fs");
const path = require("path");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyRecursive(src, dest, transformFn = null) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);

  if (stat.isDirectory()) {
    ensureDir(dest);
    for (const item of fs.readdirSync(src)) {
      copyRecursive(path.join(src, item), path.join(dest, item), transformFn);
    }
  } else {
    ensureDir(path.dirname(dest));
    if (transformFn && (src.endsWith(".md") || src.endsWith(".json") || src.endsWith(".js") || src.endsWith(".sh"))) {
      const content = fs.readFileSync(src, "utf8");
      const transformed = transformFn(content, src);
      fs.writeFileSync(dest, transformed, "utf8");
    } else {
      fs.copyFileSync(src, dest);
    }
  }
}

function renderTemplate(content, vars = {}) {
  let result = content;
  for (const [key, value] of Object.entries(vars)) {
    const pattern = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    result = result.replace(pattern, value || "");
  }
  return result;
}

function safeWriteFile(filePath, content, options = { overwrite: true }) {
  ensureDir(path.dirname(filePath));
  if (fs.existsSync(filePath) && !options.overwrite) {
    return false;
  }
  fs.writeFileSync(filePath, content, "utf8");
  return true;
}

function findSpecDir(root, featureName) {
  const possiblePaths = [
    path.join(root, ".sdd", "specs", featureName),
    path.join(root, ".sdd", "specs", `feat-${featureName}`),
    path.join(root, ".sdd", "specs", `fix-${featureName}`),
    path.join(root, "01-spec-management", "sdd", "specs", featureName),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return path.join(root, ".sdd", "specs", featureName);
}

module.exports = {
  ensureDir,
  copyRecursive,
  renderTemplate,
  safeWriteFile,
  findSpecDir,
};
