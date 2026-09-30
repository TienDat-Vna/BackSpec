#!/usr/bin/env node

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { runInit } = require("../lib/commands/init");
const { runDoctor } = require("../lib/commands/doctor");
const { runValidate } = require("../lib/commands/validate");
const { runStatus } = require("../lib/commands/status");
const { runSync } = require("../lib/commands/sync");
const { writeGeneratedFile } = require("../lib/utils/file-system");

function silenceConsole(action) {
  const originalLog = console.log;
  console.log = () => {};
  return Promise.resolve()
    .then(action)
    .finally(() => {
      console.log = originalLog;
    });
}

function verifySafeWrite(root) {
  const artifact = path.join(root, "safe-write.md");
  writeGeneratedFile(artifact, "generated\n");
  assert.strictEqual(fs.readFileSync(artifact, "utf8"), "generated\n");
  fs.writeFileSync(artifact, "human edit\n", "utf8");
  assert.throws(
    () => writeGeneratedFile(artifact, "replacement\n"),
    /Refusing to overwrite modified artifact/
  );
  assert.strictEqual(fs.readFileSync(artifact, "utf8"), "human edit\n");
  const forced = writeGeneratedFile(artifact, "replacement\n", { overwrite: true });
  assert.strictEqual(forced.status, "overwritten");
  assert.strictEqual(fs.readFileSync(artifact, "utf8"), "replacement\n");
  assert.strictEqual(fs.readFileSync(`${artifact}.backspec.bak`, "utf8"), "human edit\n");
}

async function verifyFreshInstall(root, ai) {
  await runInit(root, { ai, name: `backspec-${ai}-fixture` });
  const doctor = await runDoctor({ cwd: root, silent: true, exitOnError: false });
  const validation = await runValidate({ cwd: root, silent: true, exitOnError: false });
  const status = await runStatus({ cwd: root, silent: true });
  const syncCheck = await runSync({ cwd: root, check: true, ai, exitOnDrift: false });

  assert.strictEqual(doctor.blockers.length, 0, "fresh install must have no doctor blockers");
  assert.strictEqual(validation.blockers.length, 0, "fresh install must validate");
  assert.strictEqual(status.snapshot.skills, 41, "dashboard must discover all installed skills");
  assert(fs.existsSync(path.join(root, ".sdd", "quality.json")), "init must create quality policy");
  assert.notStrictEqual(status.snapshot.layout.guard.state, "ACTIVE", "guard cannot be active without hooks");
  assert.strictEqual(syncCheck.changed, 0, "fresh install must have zero synchronization drift");
}

async function main() {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "backspec-contract-"));
  console.log(`[TEST] Temporary fixture: ${temporaryRoot}`);
  try {
    for (const ai of ["claude", "antigravity", "copilot", "cursor", "windsurf"]) {
      const engineRoot = path.join(temporaryRoot, ai);
      fs.mkdirSync(engineRoot, { recursive: true });
      await silenceConsole(() => verifyFreshInstall(engineRoot, ai));
    }
    verifySafeWrite(temporaryRoot);
    console.log("[TEST] Five-engine install, health, sync and safe-write contracts passed.");
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error("[TEST] Failed:", error.stack || error.message);
  process.exitCode = 1;
});
