#!/usr/bin/env node

/**
 * 04-management/tools/sync-shared-rules.js
 * Single Source of Truth rule synchronizer for Backend Microservices.
 * Syncs 02-codestyle/rules/*.md -> .claude/rules/*.md, .agents/rules/*.md, and AGENTS.md.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT_DIR = path.resolve(__dirname, '..', '..');
const RULES_DIR = path.join(ROOT_DIR, '02-codestyle', 'rules');
const SCHEMA_FILE = path.join(ROOT_DIR, '02-codestyle', 'rule-schema.json');
const MANIFEST_FILE = path.join(ROOT_DIR, '.shared', '.sync-manifest.json');
const CLAUDE_RULES_DIR = path.join(ROOT_DIR, '.claude', 'rules');
const AGENTS_RULES_DIR = path.join(ROOT_DIR, '.agents', 'rules');
const AGENTS_HEADER_TEMPLATE = path.join(ROOT_DIR, '01-spec-management', 'dna', 'AGENTS.md.header-template');
const AGENTS_MD = path.join(ROOT_DIR, 'AGENTS.md');
const AGENTS_MD_IN_DNA = path.join(ROOT_DIR, '01-spec-management', 'dna', 'AGENTS.md');

const args = process.argv.slice(2);
const options = {
  dryRun: args.includes('--dry-run'),
  check: args.includes('--check'),
  force: args.includes('--force'),
  verbose: args.includes('--verbose'),
};

function sha256(content) {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

function parseFrontmatter(fileContent) {
  const match = fileContent.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;

  const yamlBlock = match[1];
  const data = {};
  const lines = yamlBlock.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx !== -1) {
      const key = trimmed.slice(0, colonIdx).trim();
      let val = trimmed.slice(colonIdx + 1).trim();

      if (val.startsWith('[') && val.endsWith(']')) {
        val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
      } else {
        val = val.replace(/^['"]|['"]$/g, '');
      }
      data[key] = val;
    }
  }

  return data;
}

function validateFrontmatter(frontmatter, schema, filePath) {
  if (!frontmatter) {
    console.error(`[ERROR] Missing YAML frontmatter in rule file: ${filePath}`);
    return false;
  }

  const requiredFields = schema.required || ['title', 'scope', 'severity'];
  for (const field of requiredFields) {
    if (!frontmatter[field]) {
      console.error(`[ERROR] Missing required frontmatter field '${field}' in ${filePath}`);
      return false;
    }
  }

  return true;
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function generateClaudeRule(content, filename) {
  const comment = `<!-- GENERATED FROM 02-codestyle/rules/${filename} — DO NOT EDIT DIRECTLY -->\n`;
  return content.replace(/^---\r?\n([\s\S]*?)\r?\n---/, (match) => `${match}\n${comment}`);
}

function generateAgentRule(content, filename) {
  const comment = `<!-- GENERATED FROM 02-codestyle/rules/${filename} — DO NOT EDIT DIRECTLY -->\n`;
  return content.replace(/^---\r?\n([\s\S]*?)\r?\n---/, (match) => `${match}\n${comment}`);
}

function main() {
  console.log('[SYNC] Starting Backend Microservice Rule Synchronizer (from 02-codestyle/rules)...');

  if (!fs.existsSync(RULES_DIR)) {
    console.error(`[ERROR] Rules directory not found: ${RULES_DIR}`);
    process.exit(1);
  }

  let schema = { required: ['title', 'scope', 'severity'] };
  if (fs.existsSync(SCHEMA_FILE)) {
    schema = JSON.parse(fs.readFileSync(SCHEMA_FILE, 'utf8'));
  }

  ensureDir(CLAUDE_RULES_DIR);
  ensureDir(AGENTS_RULES_DIR);
  ensureDir(path.dirname(MANIFEST_FILE));

  const ruleFiles = fs.readdirSync(RULES_DIR).filter(f => f.endsWith('.md')).sort();
  const manifest = {};
  const inlinedRules = [];
  let hasErrors = false;

  for (const file of ruleFiles) {
    const srcPath = path.join(RULES_DIR, file);
    const content = fs.readFileSync(srcPath, 'utf8');
    const frontmatter = parseFrontmatter(content);

    if (!validateFrontmatter(frontmatter, schema, srcPath)) {
      hasErrors = true;
      continue;
    }

    const claudeContent = generateClaudeRule(content, file);
    const agentContent = generateAgentRule(content, file);
    const claudePath = path.join(CLAUDE_RULES_DIR, file);
    const agentPath = path.join(AGENTS_RULES_DIR, file);

    if (!options.dryRun && !options.check) {
      fs.writeFileSync(claudePath, claudeContent, 'utf8');
      fs.writeFileSync(agentPath, agentContent, 'utf8');
    }

    manifest[file] = {
      hash: sha256(content),
      title: frontmatter.title,
      scope: frontmatter.scope,
      severity: frontmatter.severity
    };

    inlinedRules.push(`<!-- GENERATED FROM 02-codestyle/rules/${file} — DO NOT EDIT DIRECTLY -->\n\n${content}`);
  }

  if (hasErrors) {
    process.exit(1);
  }

  // Update AGENTS.md (in root & in 01-spec-management/dna/)
  if (fs.existsSync(AGENTS_HEADER_TEMPLATE)) {
    const header = fs.readFileSync(AGENTS_HEADER_TEMPLATE, 'utf8');
    const fullAgentsMd = `${header}\n\n<!-- BEGIN GENERATED RULES — DO NOT EDIT BELOW THIS LINE -->\n` +
      inlinedRules.join('\n\n---\n\n') +
      `\n<!-- END GENERATED RULES -->\n`;

    if (!options.dryRun && !options.check) {
      fs.writeFileSync(AGENTS_MD, fullAgentsMd, 'utf8');
      fs.writeFileSync(AGENTS_MD_IN_DNA, fullAgentsMd, 'utf8');
    }
  }

  if (!options.dryRun && !options.check) {
    fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2), 'utf8');
  }

  console.log(`[SYNC] Successfully synchronized ${ruleFiles.length} rules from 02-codestyle/rules.`);
}

main();
