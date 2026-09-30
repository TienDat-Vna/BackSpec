const fs = require("fs");
const path = require("path");

function readOptionalText(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
}

function readOptionalJson(filePath) {
  const content = readOptionalText(filePath);
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function walk(directory, depth = 0, output = []) {
  if (depth > 4 || !fs.existsSync(directory)) return output;
  try {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (
        [".git", "node_modules", "target", "dist", "build", ".idea", "vendor", "bin", "obj", ".next"].includes(
          entry.name
        )
      )
        continue;
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(full, depth + 1, output);
      else output.push(full);
    }
  } catch {
    return output;
  }
  return output;
}

function detectProjectStack(targetDir) {
  const root = path.resolve(targetDir || process.cwd());
  const files = walk(root);
  const detected = {
    root,
    name: path.basename(root),
    languages: [],
    frameworks: [],
    buildTools: [],
    databases: [],
    migrationTools: [],
    aiEngines: [],
    hasGit: fs.existsSync(path.join(root, ".git")),
    hasHusky: fs.existsSync(path.join(root, ".husky")),
    hasConstitution: fs.existsSync(path.join(root, "CONSTITUTION.md")),
    hasClaudeMd: fs.existsSync(path.join(root, "CLAUDE.md")),
    hasAgentsMd: fs.existsSync(path.join(root, "AGENTS.md")),
    hasSdd: fs.existsSync(path.join(root, ".sdd")) || fs.existsSync(path.join(root, "01-spec-management", "sdd")),
  };

  for (const file of files) {
    const relative = path.relative(root, file).replace(/\\/g, "/");
    const name = path.basename(file);

    // Java / Kotlin / Spring Boot
    if (name === "pom.xml") {
      detected.languages.push("Java");
      detected.buildTools.push("Maven");
      const content = readOptionalText(file);
      if (content) {
        if (content.includes("spring-boot")) detected.frameworks.push("Spring Boot");
        if (content.includes("mysql")) detected.databases.push("MySQL");
        if (content.includes("postgresql")) detected.databases.push("PostgreSQL");
        if (content.includes("flyway")) detected.migrationTools.push("Flyway");
        if (content.includes("liquibase")) detected.migrationTools.push("Liquibase");
      }
    }
    if (name === "build.gradle" || name === "build.gradle.kts") {
      detected.languages.push("Java/Kotlin");
      detected.buildTools.push("Gradle");
      const content = readOptionalText(file);
      if (content) {
        if (content.includes("spring-boot") || content.includes("org.springframework")) detected.frameworks.push("Spring Boot");
        if (content.includes("flyway")) detected.migrationTools.push("Flyway");
      }
    }

    // Go
    if (name === "go.mod") {
      detected.languages.push("Go");
      detected.buildTools.push("Go Modules");
      const content = readOptionalText(file);
      if (content) {
        if (content.includes("gin-gonic/gin")) detected.frameworks.push("Gin");
        if (content.includes("gofiber/fiber")) detected.frameworks.push("Fiber");
        if (content.includes("labstack/echo")) detected.frameworks.push("Echo");
        if (content.includes("golang-migrate")) detected.migrationTools.push("golang-migrate");
      }
    }

    // Node.js / NestJS / TypeScript
    if (name === "package.json") {
      const manifest = readOptionalJson(file);
      if (manifest) {
        const deps = { ...(manifest.dependencies || {}), ...(manifest.devDependencies || {}) };
        if (deps["@nestjs/core"]) {
          detected.languages.push("TypeScript/Node.js");
          detected.frameworks.push("NestJS");
        } else if (deps["express"] || deps["fastify"]) {
          detected.languages.push("JavaScript/Node.js");
          detected.frameworks.push("Express/Fastify");
        }
        if (deps["prisma"] || deps["@prisma/client"]) detected.migrationTools.push("Prisma");
        if (deps["typeorm"]) detected.migrationTools.push("TypeORM");
        if (deps["knex"]) detected.migrationTools.push("Knex");
      }
    }

    // Python / FastAPI / Django
    if (name === "requirements.txt" || name === "pyproject.toml" || name === "Pipfile") {
      detected.languages.push("Python");
      const content = readOptionalText(file);
      if (content) {
        if (content.includes("fastapi")) detected.frameworks.push("FastAPI");
        if (content.includes("django")) detected.frameworks.push("Django");
        if (content.includes("alembic")) detected.migrationTools.push("Alembic");
      }
    }

    // .NET Core / C#
    if (name.endsWith(".csproj")) {
      detected.languages.push("C#");
      detected.frameworks.push(".NET Core Web API");
      detected.buildTools.push("dotnet");
    }

    // Rust
    if (name === "Cargo.toml") {
      detected.languages.push("Rust");
      detected.buildTools.push("Cargo");
      const content = readOptionalText(file);
      if (content) {
        if (content.includes("actix-web")) detected.frameworks.push("Actix-web");
        if (content.includes("axum")) detected.frameworks.push("Axum");
      }
    }

    // Database / Migration detection
    if (/(^|\/)(db\/migration|migrations?|flyway|alembic|prisma\/migrations)(\/|$)/i.test(relative)) {
      if (!detected.migrationTools.includes("Directory-based migrations")) {
        detected.migrationTools.push("SQL Migrations (" + relative.split("/")[0] + ")");
      }
    }
  }

  // AI Engines detection
  if (fs.existsSync(path.join(root, ".claude"))) detected.aiEngines.push("Claude Code");
  if (fs.existsSync(path.join(root, ".agents"))) detected.aiEngines.push("Antigravity / Gemini");
  if (fs.existsSync(path.join(root, ".cursor"))) detected.aiEngines.push("Cursor");
  if (fs.existsSync(path.join(root, ".windsurf"))) detected.aiEngines.push("Windsurf");
  if (fs.existsSync(path.join(root, ".vscode"))) detected.aiEngines.push("Cursor / VS Code");
  if (fs.existsSync(path.join(root, ".github", "copilot-instructions.md")) || fs.existsSync(path.join(root, ".github", "prompts"))) {
    detected.aiEngines.push("GitHub Copilot");
  }

  // Unique lists
  detected.languages = [...new Set(detected.languages)];
  detected.frameworks = [...new Set(detected.frameworks)];
  detected.buildTools = [...new Set(detected.buildTools)];
  detected.databases = [...new Set(detected.databases)];
  detected.migrationTools = [...new Set(detected.migrationTools)];
  detected.aiEngines = [...new Set(detected.aiEngines)];

  return detected;
}

module.exports = {
  detectProjectStack,
  walk,
};
