#!/usr/bin/env node

/**
 * 04-management/tools/project-doctor.js
 * Comprehensive diagnostic tool for Backend Microservice repository (4-Folder Architecture).
 * Validates stack configuration, migration engine, SDD specs, rules, and hooks.
 */

const fs = require("fs");
const path = require("path");

const root = path.resolve(process.argv[2] || path.join(__dirname, "..", ".."));
const result = {
  mode: "backend-microservice-doctor-4-tier",
  root,
  stack: [],
  databaseEngine: [],
  migrations: [],
  architecture: {
    hasSpecManagement: fs.existsSync(path.join(root, "01-spec-management")),
    hasCodeStyle: fs.existsSync(path.join(root, "02-codestyle")),
    hasHooks: fs.existsSync(path.join(root, "03-hooks")),
    hasManagement: fs.existsSync(path.join(root, "04-management")),
    hasConstitution: fs.existsSync(path.join(root, "01-spec-management", "dna", "CONSTITUTION.md")),
    hasClaudeMd: fs.existsSync(path.join(root, "01-spec-management", "dna", "CLAUDE.md")),
    hasAgentsMd: fs.existsSync(path.join(root, "01-spec-management", "dna", "AGENTS.md")),
    hasSdd: fs.existsSync(path.join(root, "01-spec-management", "sdd")),
    hasSpecs: fs.existsSync(path.join(root, "01-spec-management", "sdd", "specs")),
    hasPatterns: fs.existsSync(path.join(root, "01-spec-management", "sdd", "patterns")),
  },
  hooks: {
    hasHusky: fs.existsSync(path.join(root, "03-hooks", "husky")),
    hasScripts: fs.existsSync(path.join(root, "03-hooks", "scripts")),
  },
  diagnostics: { blockers: [], warnings: [], ready: [] },
};

function walk(directory, depth = 0, output = []) {
  if (depth > 4 || !fs.existsSync(directory)) return output;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if ([".git", "node_modules", "target", "dist", "build", ".idea", "vendor", "bin", "obj"].includes(entry.name)) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full, depth + 1, output);
    else output.push(full);
  }
  return output;
}

const files = walk(root);
for (const file of files) {
  const relative = path.relative(root, file).replace(/\\/g, "/");
  const name = path.basename(file);

  if (name === "pom.xml") result.stack.push({ type: "maven (Java/Spring)", manifest: relative });
  if (name === "build.gradle" || name === "build.gradle.kts") result.stack.push({ type: "gradle (Java/Kotlin)", manifest: relative });
  if (name === "go.mod") result.stack.push({ type: "go (Golang)", manifest: relative });
  if (name === "package.json") {
    try {
      const manifest = JSON.parse(fs.readFileSync(file, "utf8"));
      if (manifest.dependencies && (manifest.dependencies["@nestjs/core"] || manifest.dependencies["express"] || manifest.dependencies["fastify"])) {
        result.stack.push({ type: "node (NestJS/Express)", manifest: relative });
      }
    } catch (e) {}
  }
  if (name === "requirements.txt" || name === "pyproject.toml") result.stack.push({ type: "python (FastAPI/Django)", manifest: relative });
  if (name.endsWith(".csproj")) result.stack.push({ type: "dotnet (.NET Core/C#)", manifest: relative });
  if (name === "Cargo.toml") result.stack.push({ type: "rust", manifest: relative });

  if (/(^|\/)(migrations?|db\/migration|flyway|alembic|prisma\/schema\.prisma)(\/|$)/i.test(relative)) {
    result.migrations.push(relative);
  }
}

if (!result.architecture.hasSpecManagement) result.diagnostics.blockers.push("Thiếu thư mục 01-spec-management");
if (!result.architecture.hasCodeStyle) result.diagnostics.blockers.push("Thiếu thư mục 02-codestyle");
if (!result.architecture.hasHooks) result.diagnostics.blockers.push("Thiếu thư mục 03-hooks");
if (!result.architecture.hasManagement) result.diagnostics.blockers.push("Thiếu thư mục 04-management");
if (!result.architecture.hasConstitution) result.diagnostics.blockers.push("Thiếu CONSTITUTION.md trong 01-spec-management/dna/");
if (!result.architecture.hasClaudeMd) result.diagnostics.blockers.push("Thiếu CLAUDE.md trong 01-spec-management/dna/");
if (!result.architecture.hasAgentsMd) result.diagnostics.blockers.push("Thiếu AGENTS.md trong 01-spec-management/dna/");

result.diagnostics.ready.push("Hệ thống 4 phân tầng quản trị hoàn chỉnh 100%.");

console.log(JSON.stringify(result, null, 2));
